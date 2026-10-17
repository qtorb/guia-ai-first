import hojasData from '../data/hojas.json';
import { calendario } from './ics';
import { fechaLarga } from './protocoloAiFirst';

// La hoja 0 se hace en dos sentadas. Entre una y otra el alumno no está en
// la web, así que es la web la que tiene que recordarle, cuando vuelva a la
// portada o a la lista, que la segunda le espera. Una sola definición para
// los dos sitios.

// El paso al que se vuelve: el del bloque con `vuelta` en la hoja 0.
export const PASO_VUELTA = hojasData['hojas/mmdd31/0.json'].bloques.findIndex((b) => b.vuelta) + 2;
export const DESTINO_VUELTA = `/ia-lab/10?paso=${PASO_VUELTA}`;

// Te espera la segunda sentada: el mensaje se marcó como enviado, han pasado
// 48 horas o más y todavía no se ha entrado en el paso de la vuelta.
export function segundaSentada(h10, ahora = Date.now()) {
  // Con la hoja terminada ya no hay segunda sentada que esperar.
  if (!h10 || h10._fin || h10.msg_enviado !== true || !h10._enviado_t || h10._vuelta_t) return null;
  const t = Date.parse(h10._enviado_t);
  if (Number.isNaN(t)) return null;
  const horas = Math.floor((ahora - t) / 3600000);
  if (horas < 48) return null;
  return { dias: Math.floor(horas / 24), destino: DESTINO_VUELTA };
}

// El recordatorio para la segunda parte: un evento a dos días vista, con lo
// que toca hacer y el enlace para volver justo al paso de las respuestas.
function isoLocal(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function eventoVuelta(datos, pre) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  let base = hoy;
  const m = String(datos[`${pre}_dia`] || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) {
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    if (!Number.isNaN(d.getTime()) && d > hoy) base = d;
  }
  const dia = new Date(base);
  dia.setDate(dia.getDate() + 2);
  const quien = String(datos[`${pre}_quien`] || '').trim();
  const cuando = String(datos[`${pre}_dia`] || '').trim();
  const url = `${window.location.origin}${window.location.pathname}#/ia-lab/10?paso=${PASO_VUELTA}`;
  const cuerpo =
    (quien ? `Le escribiste a ${quien}` + (cuando ? ` el ${fechaLarga(cuando)}` : '') + '.\n\n' : '') +
    'Hoy toca la segunda parte. Empieza copiando lo que te hayan contestado, con sus mismas palabras y el nombre de quién lo dijo. Si nadie ha contestado, puedes escribir a otra persona o seguir y dejarlo pendiente.\n\n' +
    `Vuelve aquí: ${url}`;
  return calendario([{
    uid: `ialab-vuelta-${Date.now()}@ai-first`,
    dia: isoLocal(dia),
    hora: '10:00',
    titulo: 'IA-Lab · segunda parte: lo que te contestaron',
    cuerpo,
  }]);
}
