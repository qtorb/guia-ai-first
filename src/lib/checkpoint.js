// El checkpoint semanal: el bloque que se pega en 07_CIERRE.md y el contador
// que enseña la portada y el plan. Sin fecha de fin — a diferencia del plan
// de 30 días, esto no tiene un «llegaste al final».

import { fechaLarga } from './protocoloAiFirst';

const LLAVE = 'metodo-checkpoints';
export { LLAVE as LLAVE_CHECKPOINT };

function limpia(s) {
  const t = (s || '').replace(/\n+/g, ' ').trim();
  return t || '—';
}

// El bloque exacto que va arriba de 07_CIERRE.md, debajo de la cabecera.
// `letra` es la columna de metodo-ai-first (vacía si no hay).
export function bloqueCheckpoint(e, letra) {
  const contactos = Number(e.contactos || 0);
  const cambios = Number(e.cambios || 0);
  const comprobadas = Number(e.comprobadas || 0);
  const col = e.col === 'si'
    ? (letra ? `sigue en ${letra}` : 'sigue igual')
    : `cambia — ${limpia(e.colTxt)}`;

  let bloque = `## Checkpoint · ${fechaLarga(e.fecha)}
1. Decisión que ha mejorado: ${limpia(e.r1)}
2. Lo que hacemos por inercia: ${limpia(e.r2)}
3. Contacto con el mundo real: ${limpia(e.r3)} (${contactos} ${contactos === 1 ? 'conversación' : 'conversaciones'})
4. Columna: ${col}
Cambiado por lo que me dijeron: ${cambios} · Suposiciones comprobadas: ${comprobadas}
Veredicto: ${e.veredicto} — ${limpia(e.porque)}`;

  if (e.quien && e.dia) {
    bloque += `\nEsta semana empieza por: ${e.quien}, el ${fechaLarga(e.dia)}`;
  }
  return bloque;
}

function plural(n, singular, plural_) {
  return `${n} ${n === 1 ? singular : plural_}`;
}

// El contador que enseña la portada y el plan de 30 días: semanas cerradas
// más los tres números del plan, que son los mismos que se suman al cerrar
// una semana (E3.15). Cadena vacía si todo está a cero.
export function contador() {
  let semanas = 0;
  try {
    const cp = JSON.parse(localStorage.getItem(LLAVE)) || {};
    semanas = Array.isArray(cp.semanas) ? cp.semanas.length : 0;
  } catch (e) { /* noop */ }

  let contactos = 0, cambios = 0, comp = 0;
  try {
    const m = JSON.parse(localStorage.getItem('metodo-plan30')) || {};
    contactos = Number(m.contactos || 0);
    cambios = Number(m.cambios || 0);
    comp = Number(m.comp || 0);
  } catch (e) { /* noop */ }

  if (!semanas && !contactos && !cambios && !comp) return '';

  return `Llevas ${plural(semanas, 'semana cerrada', 'semanas cerradas')} · `
    + `${plural(contactos, 'conversación con gente de fuera', 'conversaciones con gente de fuera')} · `
    + `${plural(cambios, 'cosa cambiada por lo que te dijeron', 'cosas cambiadas por lo que te dijeron')} · `
    + `${plural(comp, 'suposición comprobada', 'suposiciones comprobadas')}.`;
}

export function leerCheckpoints() {
  try {
    const cp = JSON.parse(localStorage.getItem(LLAVE));
    return Array.isArray(cp?.semanas) ? cp.semanas : [];
  } catch (e) { return []; }
}

export function guardarCheckpoints(semanas) {
  try {
    localStorage.setItem(LLAVE, JSON.stringify({ semanas }));
    window.dispatchEvent(new Event('guia-local'));
  } catch (e) { /* modo privado */ }
}
