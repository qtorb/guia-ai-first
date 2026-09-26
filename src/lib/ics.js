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

function hoyIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// eventos: [{ uid, dia: 'AAAA-MM-DD', hora: 'HH:MM', titulo, cuerpo }]
export function calendario(eventos) {
  const lineas = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Metodo AI-First//ES',
    'CALSCALE:GREGORIAN',
  ];
  const stamp = selloIcs(hoyIso(), '09:00');
  eventos.forEach((e) => {
    lineas.push(
      'BEGIN:VEVENT',
      `UID:${e.uid}`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${selloIcs(e.dia, e.hora)}`,
      `DTEND:${selloIcs(e.dia, e.hora)}`,
      `SUMMARY:${escaparIcs(e.titulo)}`,
      `DESCRIPTION:${escaparIcs(e.cuerpo)}`,
      'END:VEVENT'
    );
  });
  lineas.push('END:VCALENDAR');
  // RFC 5545: líneas terminadas en CRLF.
  return lineas.join('\r\n') + '\r\n';
}
