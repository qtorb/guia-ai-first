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

// Durante unas horas el recorrido del Método AI-First guardó sus respuestas
// dentro de la hoja 1 de IA-Lab, que es otra cosa. Esto las saca de ahí: se
// llevan a la clave del método (si no hay nada ya) y se borran de la hoja,
// para que la sesión 1 no aparezca como empezada con datos que no son suyos.
const CLAVES_METODO = [
  'quien', 'que', 'columna', 'firma', 'roja1', 'roja2', 'roja3',
  'usare', 'no-usare', 'validar', 'suposicion', 'siNo', 'persona', 'cuando',
  'pieza', 'acepto', 'checkpoint', 'asesor-chips', 'no-asesor', 'fecha',
];

function sacarMetodoDeHoja1(d) {
  const h = d.hojas && d.hojas[1];
  if (!h) return d;
  const mias = CLAVES_METODO.filter((k) => k in h);
  if (!mias.length) return d;

  const delMetodo = {};
  mias.forEach((k) => { delMetodo[k] = h[k]; });
  try {
    if (!localStorage.getItem('metodo-ai-first')) {
      localStorage.setItem('metodo-ai-first', JSON.stringify(delMetodo));
    }
  } catch (e) { /* noop */ }

  const limpia = { ...h };
  mias.forEach((k) => { delete limpia[k]; });
  const quedaAlgo = Object.keys(limpia).some((k) => k[0] !== '_');
  const hojas = { ...d.hojas };
  if (quedaAlgo) hojas[1] = limpia; else delete hojas[1];
  const next = { ...d, hojas };
  try { localStorage.setItem(LS, JSON.stringify({ t: Date.now(), d: next })); } catch (e) { /* noop */ }
  return next;
}

function leerInicial() {
  try {
    const j = JSON.parse(localStorage.getItem(LS) || 'null');
    if (j && j.d) return sacarMetodoDeHoja1(j.d);
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
