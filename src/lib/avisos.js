// Los avisos: un correo cada semana, el día del checkpoint. Las cuatro
// primeras semanas llevan lo que toca en el plan; desde la quinta, las
// cuatro preguntas. Sin fecha de fin. El navegador calcula las fechas y la
// base de datos envía y encadena. A la base solo llegan fechas, salvo el
// nombre y el día de la próxima conversación cuando salta la regla del
// contacto, que se borra al enviar el correo.

import { cliente } from './nube';
import { plan, partesCheckpoint } from './plan30';

function isoEnLocal(isoDia, hora, masMeses = 0) {
  const [a, m, d] = isoDia.split('-').map(Number);
  const [h, min] = (hora || '09:00').split(':').map(Number);
  return new Date(a, m - 1 + masMeses, d, h || 0, min || 0).toISOString();
}

// Las filas que se programan: el cierre de cada semana, a la hora de esa
// semana, y el primer checkpoint, una semana después del lanzamiento, a la
// hora del checkpoint — se busca hacia delante hasta que sea futuro. Solo las
// que todavía no han pasado.
export function filasAvisos(d) {
  const p = plan(d);
  const { hora } = partesCheckpoint(d);
  const filas = p.semanas.map((s) => ({ tipo: 'semana', n: s.n, envio_en: isoEnLocal(s.cierre, s.hora) }));
  let fecha = mas7(p.lanzamiento, 7);
  let n = 5;
  const ahora = Date.now();
  while (Date.parse(isoEnLocal(fecha, hora)) <= ahora && n < 600) {
    fecha = mas7(fecha, 7);
    n += 1;
  }
  filas.push({ tipo: 'checkpoint', n, envio_en: isoEnLocal(fecha, hora) });
  return filas.filter((f) => Date.parse(f.envio_en) > ahora);
}

function mas7(isoDia, dias) {
  const [a, m, d] = isoDia.split('-').map(Number);
  const f = new Date(a, m - 1, d);
  f.setDate(f.getDate() + dias);
  const p = (x) => String(x).padStart(2, '0');
  return `${f.getFullYear()}-${p(f.getMonth() + 1)}-${p(f.getDate())}`;
}

async function rpc(nombre, args) {
  const c = await cliente();
  if (!c) throw new Error('sin nube');
  const { data, error } = await c.rpc(nombre, args);
  if (error) throw error;
  return data;
}

export function programar(d) {
  return rpc('programar_avisos', { p_filas: filasAvisos(d) });
}

export function parar() {
  return rpc('parar_avisos');
}

export async function leerAviso() {
  const c = await cliente();
  if (!c) throw new Error('sin nube');
  const { data, error } = await c.from('aviso').select('activo, pausa_hasta').maybeSingle();
  if (error) throw error;
  return { activo: !!data?.activo, pausaHasta: data?.pausa_hasta || null };
}

// Si la llamada falla —sin conexión, por ejemplo— lanza: «no he podido
// comprobarlo» no es lo mismo que «ese enlace no sirve».
export function darseDeBaja(t) {
  return rpc('baja_avisos', { t });
}

export function pausar() {
  return rpc('pausar_avisos');
}

export function pausarConEnlace(t) {
  return rpc('pausar_avisos_enlace', { t });
}

export function reanudar() {
  return rpc('reanudar_avisos');
}

export function nota(texto) {
  return rpc('nota_aviso', { p_nota: texto });
}
