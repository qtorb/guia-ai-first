import hojasData from '../data/hojas.json';

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
  if (!h10 || h10.msg_enviado !== true || !h10._enviado_t || h10._vuelta_t) return null;
  const t = Date.parse(h10._enviado_t);
  if (Number.isNaN(t)) return null;
  const horas = Math.floor((ahora - t) / 3600000);
  if (horas < 48) return null;
  return { dias: Math.floor(horas / 24), destino: DESTINO_VUELTA };
}
