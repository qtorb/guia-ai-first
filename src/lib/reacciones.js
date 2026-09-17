// Las tres comprobaciones que la hoja ya lleva escritas en prosa dentro de
// sus «compruébalo tú», aplicadas por la pantalla; y la pista de
// genericidad, que sólo habla cuando se le pregunta.
//
// La diferencia entre las dos cosas es deliberada. Las comprobaciones no se
// equivocan: un campo sin hora no tiene hora. La pista sí puede
// equivocarse, porque mirar si algo suena genérico es un juicio y aquí sólo
// hay una heurística. Por eso las primeras hablan solas y la segunda
// espera a que el alumno pulse: una pista que falla sola desacredita a las
// comprobaciones que no fallan nunca.

const DIA = /\b(lunes|martes|mi[ée]rcoles|jueves|viernes|s[áa]bados?|domingos?|hoy|ma[ñn]ana)\b/i;
const FECHA = /\b\d{1,2}\s*(?:\/|-|\sde\s)\s*(?:\d{1,2}|ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic)/i;
const HORA = /\b\d{1,2}(?:[:.]\d{2})?\s*(?:h\b|horas?\b|am\b|pm\b)|\b(?:a las|sobre las)\s*\d|\bde la (?:ma[ñn]ana|tarde|noche)\b/i;
const VAGO = /\b(?:cuando pueda|cuando toque|cuando me vaya bien|alg[úu]n d[íi]a|pr[óo]ximamente|regularmente|a menudo|de vez en cuando|siempre que pueda)\b/i;
const NADIE = /\b(?:usuarios?|clientes?|gente|personas?|empresas?|p[úu]blico|alguien|todo el mundo|target|early adopters?)\b/i;

const MAYUS = /(?:^|[\s«"(¿¡])([A-ZÁÉÍÓÚÑ][a-záéíóúñ]{2,})/;

function hayNombrePropio(t) {
  // La primera palabra de una frase va en mayúscula por convención, así que
  // no cuenta: se mira a partir del primer carácter.
  return MAYUS.test(' ' + t.slice(1));
}

// Devuelve '' cuando no hay nada que decir. Nunca bloquea nada.
export function reaccion(chk, valor, datos) {
  if (!chk) return '';
  const t = String(valor ?? '').trim();
  const regla = chk.regla;

  if (regla === 'frontera') {
    const cabecera = String(datos?.[chk.dep] ?? '').trim();
    if (!cabecera || t) return '';
    return 'Has nombrado el rol y no has dicho qué NO decide. Así se lo come otro.';
  }

  if (!t) return '';

  if (regla === 'hora') {
    if (VAGO.test(t)) return 'Eso no es una hora. Y lo que no tiene hora no ocurre.';
    if (!DIA.test(t) && !FECHA.test(t)) return 'Falta el día.';
    if (!HORA.test(t)) return 'Falta la hora.';
    return '';
  }

  if (regla === 'dia') {
    if (VAGO.test(t)) return 'Eso no es un día.';
    if (!DIA.test(t) && !FECHA.test(t)) return 'Falta el día. «Esta semana» no es un día.';
    return '';
  }

  if (regla === 'nombre') {
    if (NADIE.test(t) && !hayNombrePropio(t)) return 'Eso no es nadie. No te va a contestar.';
    if (!hayNombrePropio(t)) return 'Falta un nombre propio.';
    return '';
  }

  return '';
}

// La prueba del compañero, hecha en solitario. Sólo se ejecuta al pulsar.
export function suenaACualquiera(valor) {
  const t = String(valor ?? '').trim();
  if (!t) return { vacio: true, txt: 'Escribe algo primero y vuelve a preguntar.' };
  const tuyo = /\d/.test(t) || DIA.test(t) || FECHA.test(t) || hayNombrePropio(t);
  return tuyo
    ? { generico: false, txt: 'Tiene algo que solo es verdad en el tuyo. Sirve.' }
    : { generico: true, txt: 'Esto podría estar en el protocolo de cualquiera. ¿Qué le pondrías que solo sea verdad en el tuyo?' };
}
