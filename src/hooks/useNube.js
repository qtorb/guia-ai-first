import { useCallback, useEffect, useRef, useState } from 'react';
import {
  hayNube, cliente, convieneCargar, leerRemoto, enviarRemoto, traerRemoto,
  borrarRemoto, hayAlgoLocal, selloEnviado, escribirLocal, vuelveDonde,
} from '../lib/nube';

// La regla de qué gana cuando entras y hay dos versiones:
//
//  · No hay nada en la nube  → sube lo de este navegador.
//  · No hay nada aquí        → baja lo de la nube.
//  · Hay las dos, y el sello de la nube es el del último envío de ESTE
//    navegador → este navegador es la continuación: sube.
//  · Hay las dos y no coinciden → NO se decide sola. Se pregunta una vez.
//
// El último caso es el único que importa: es el alumno que escribió en el
// portátil y luego en el móvil sin entrar. Elegir por él borraría trabajo.
export function useNube(dossierCtl) {
  const [sesion, setSesion] = useState(null);
  const [estado, setEstado] = useState(hayNube ? 'cargando' : 'apagada');
  const [conflicto, setConflicto] = useState(null);   // { remoto, local }
  const [error, setError] = useState(null);
  const debounce = useRef(null);
  const conflictoRef = useRef(false);
  conflictoRef.current = !!conflicto;

  // Solo se carga la librería si este navegador ya tiene sesión o si venimos
  // de la vuelta de un proveedor. Quien no ha entrado nunca no paga los 50 KB.
  useEffect(() => {
    if (!hayNube) return undefined;
    if (!convieneCargar()) { setEstado('fuera'); return undefined; }
    let vivo = true;
    let corta = null;
    (async () => {
      const c = await cliente();
      if (!vivo) return;
      const { data } = await c.auth.getSession();
      if (!vivo) return;
      setSesion(data.session || null);
      setEstado(data.session ? 'dentro' : 'fuera');
      if (data.session) vuelveDonde();
      const { data: sub } = c.auth.onAuthStateChange((evt, s) => {
        if (!vivo) return;
        setSesion(s || null);
        setEstado(s ? 'dentro' : 'fuera');
        if (evt === 'SIGNED_IN') vuelveDonde();
      });
      corta = () => sub.subscription.unsubscribe();
    })();
    return () => { vivo = false; if (corta) corta(); };
  }, []);

  // Al entrar: decidir qué gana.
  const uid = sesion?.user?.id;
  useEffect(() => {
    if (!uid) return;
    let vivo = true;
    (async () => {
      try {
        const fila = await leerRemoto(uid);
        if (!vivo) return;
        const local = hayAlgoLocal();
        if (!fila) { if (local) await enviarRemoto(uid); return; }
        if (!local) { await traerRemoto(uid); dossierCtl?.recargar?.(); return; }
        if (fila.actualizado === selloEnviado()) { await enviarRemoto(uid); return; }
        setConflicto({ remoto: fila.actualizado, local: true });
      } catch (e) {
        if (vivo) setError(e.message || String(e));
      }
    })();
    return () => { vivo = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  // Con sesión abierta y sin conflicto pendiente, cada cambio sube solo.
  const dossier = dossierCtl?.dossier;
  useEffect(() => {
    if (!uid || conflictoRef.current) return undefined;
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => {
      enviarRemoto(uid).catch((e) => setError(e.message || String(e)));
    }, 2000);
    return () => clearTimeout(debounce.current);
  }, [dossier, uid]);

  // El método y el plan de 30 días no pasan por el dossier de IA-Lab: avisan
  // con un evento cuando guardan, y se sube igual, con el mismo retraso.
  useEffect(() => {
    if (!uid) return undefined;
    const alCambiar = () => {
      if (conflictoRef.current) return;
      clearTimeout(debounce.current);
      debounce.current = setTimeout(() => {
        enviarRemoto(uid).catch((e) => setError(e.message || String(e)));
      }, 2000);
    };
    window.addEventListener('guia-local', alCambiar);
    return () => window.removeEventListener('guia-local', alCambiar);
  }, [uid]);

  const resolver = useCallback(async (cual) => {
    if (!uid) return;
    try {
      if (cual === 'nube') { await traerRemoto(uid); dossierCtl?.recargar?.(); }
      else await enviarRemoto(uid);
      setConflicto(null);
    } catch (e) { setError(e.message || String(e)); }
  }, [uid, dossierCtl]);

  const salir = useCallback(async () => {
    // Salir no borra nada de este navegador: sigues teniendo tu trabajo.
    const c = await cliente();
    await c.auth.signOut();
  }, []);

  const borrarCuenta = useCallback(async () => {
    if (!uid) return;
    await borrarRemoto(uid);
    const c = await cliente();
    await c.auth.signOut();
  }, [uid]);

  // Borrar la copia local y la de la nube. Es lo que pide el RGPD cuando
  // alguien quiere irse del todo.
  const borrarTodo = useCallback(async () => {
    if (!uid) return;
    await borrarRemoto(uid);
    escribirLocal({});
    const c = await cliente();
    await c.auth.signOut();
    window.location.reload();
  }, [uid]);

  return {
    hay: hayNube, sesion, usuario: sesion?.user || null, estado,
    conflicto, resolver, salir, borrarCuenta, borrarTodo, error,
  };
}
