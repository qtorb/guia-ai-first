// --------------------------------------------------------------------------
// Ficheros de calendario (.ics). Los usan el plan de 30 días y la pausa de la
// hoja 0. Cada evento lleva en el cuerpo lo que toca hacer ese día: un evento
// con título y sin texto no sirve para volver.
// --------------------------------------------------------------------------

// RFC 5545: en TEXT se escapan la barra, el salto, la coma y el punto y coma.
// El `;` se escapaba como '\;' dentro de una cadena JS, que es ';': no hacía
// nada. Aquí va con la barra de verdad.
export function escaparIcs(s) {
  return (s || '').replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}

export function selloIcs(isoDia, hora) {
  const [h, m] = (hora || '09:00').split(':');
  return isoDia.replace(/-/g, '') + 'T' + (h || '09').padStart(2, '0') + (m || '00').padStart(2, '0') + '00';
}

const dos = (x) => String(x).padStart(2, '0');

// DTSTAMP es el momento en que se genera el fichero, en UTC (RFC 5545 §3.8.7.2).
function selloUtc(d) {
  return `${d.getUTCFullYear()}${dos(d.getUTCMonth() + 1)}${dos(d.getUTCDate())}T`
    + `${dos(d.getUTCHours())}${dos(d.getUTCMinutes())}${dos(d.getUTCSeconds())}Z`;
}

// El fin, media hora después del inicio. Las dos son horas locales «flotantes»
// —sin zona—, así que se suma sobre la fecha local.
function selloMas(isoDia, hora, minutos) {
  const [a, m, d] = isoDia.split('-').map(Number);
  const [h, mi] = (hora || '09:00').split(':').map(Number);
  const f = new Date(a, m - 1, d, h || 0, (mi || 0) + minutos);
  return `${f.getFullYear()}${dos(f.getMonth() + 1)}${dos(f.getDate())}T${dos(f.getHours())}${dos(f.getMinutes())}00`;
}

// RFC 5545 §3.1: ninguna línea pasa de 75 octetos. Las largas se parten con
// CRLF y un espacio, y nunca por la mitad de un carácter UTF-8.
const utf8 = new TextEncoder();
function plegar(linea) {
  const trozos = [];
  let actual = '';
  let octetos = 0;
  let limite = 75;
  for (const ch of linea) {
    const n = utf8.encode(ch).length;
    if (octetos + n > limite) {
      trozos.push(actual);
      actual = '';
      octetos = 0;
      limite = 74;   // la continuación empieza con un espacio, que también cuenta
    }
    actual += ch;
    octetos += n;
  }
  trozos.push(actual);
  return trozos.join('\r\n ');
}

// eventos: [{ uid, dia: 'AAAA-MM-DD', hora: 'HH:MM', titulo, cuerpo, rrule? }]
// rrule, si viene, es la regla de repetición tal cual (p.ej. 'FREQ=WEEKLY'),
// sin el prefijo 'RRULE:' — para un evento que no se repite, se omite.
export function calendario(eventos) {
  const lineas = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Metodo AI-First//ES',
    'CALSCALE:GREGORIAN',
  ];
  const stamp = selloUtc(new Date());
  eventos.forEach((e) => {
    lineas.push(
      'BEGIN:VEVENT',
      `UID:${e.uid}`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${selloIcs(e.dia, e.hora)}`,
      `DTEND:${selloMas(e.dia, e.hora, 30)}`,
    );
    if (e.rrule) lineas.push(`RRULE:${e.rrule}`);
    lineas.push(
      `SUMMARY:${escaparIcs(e.titulo)}`,
      `DESCRIPTION:${escaparIcs(e.cuerpo)}`,
      'END:VEVENT'
    );
  });
  lineas.push('END:VCALENDAR');
  // RFC 5545: líneas terminadas en CRLF.
  return lineas.map(plegar).join('\r\n') + '\r\n';
}
