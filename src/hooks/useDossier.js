// Port de la lógica de guardado de guia-ai-first-src/index.html:
// LS/LS_VIEJO (L2634-2635), restaurar() (L2999-3010), guarda() (L2978-2983),
// datos()/aplicar() (L2970-2992), guardar()/cargar()/borrar() (L3020-3049).
//
// Mismo formato de localStorage, mismas claves — para que un dossier guardado
// por la versión antigua (vanilla JS) se siga leyendo aquí sin pérdida.

import { useCallback, useRef, useState } from 'react';

const LS = 'ialab-dossier-v2';
const LS_VIEJO = 'protocolo-ialab1-v1';

function dossierVacio() {
  return { v: 2, proyecto: {}, hojas: {} };
}

function leerInicial() {
  try {
    const j = JSON.parse(localStorage.getItem(LS) || 'null');
    if (j && j.d) return j.d;
  } catch (e) { /* noop */ }
  try {
    const viejo = JSON.parse(localStorage.getItem(LS_VIEJO) || 'null');
    if (viejo && viejo.datos) {
      return {
        v: 2,
        proyecto: { _nombre: viejo.datos._nombre || '' },
        hojas: { 1: viejo.datos },
      };
    }
  } catch (e) { /* noop */ }
  return dossierVacio();
}

export function useDossier() {
  const [dossier, setDossier] = useState(leerInicial);
  const dossierRef = useRef(dossier);
  dossierRef.current = dossier;

  const persistir = useCallback((d) => {
    try {
      localStorage.setItem(LS, JSON.stringify({ t: Date.now(), d }));
    } catch (e) { /* noop: almacenamiento no disponible */ }
  }, []);

  // Fusiona cambios en DOSSIER.hojas[n] y persiste — equivalente a guarda().
  const guardaHoja = useCallback((n, datosHoja) => {
    setDossier((prev) => {
      const next = { ...prev, hojas: { ...prev.hojas, [n]: datosHoja } };
      persistir(next);
      return next;
    });
  }, [persistir]);

  const guardaNombre = useCallback((nombre) => {
    setDossier((prev) => {
      const next = { ...prev, proyecto: { ...prev.proyecto, _nombre: nombre } };
      persistir(next);
      return next;
    });
  }, [persistir]);

  const borraHoja = useCallback((n) => {
    setDossier((prev) => {
      const hojas = { ...prev.hojas };
      delete hojas[n];
      const next = { ...prev, hojas };
      persistir(next);
      return next;
    });
  }, [persistir]);

  // Reemplaza el dossier entero — equivalente a cargar() con fichero .d completo.
  const reemplazar = useCallback((nuevo) => {
    const next = { v: 2, proyecto: {}, hojas: {}, ...nuevo };
    setDossier(next);
    persistir(next);
  }, [persistir]);

  return { dossier, guardaHoja, guardaNombre, borraHoja, reemplazar, dossierRef };
}

export { LS, LS_VIEJO };
