// Los avisos de tu mes: el correo del día que cierra cada semana del plan de
// 30 días y, después, uno al mes. El navegador calcula las fechas —el plan
// vive aquí— y se las pasa a la base de datos, que es la que envía. A la base
// solo llegan fechas: nada de lo que se ha escrito.
//
// Todo va por funciones de la base (supabase/migrations/0003_avisos.sql):
// ninguna tabla de avisos se escribe directamente desde aquí.

import { cliente } from './nube';
import { plan, partesCheckpoint } from './plan30';

function isoEnLocal(isoDia, hora, masMeses = 0) {
  const [a, m, d] = isoDia.split('-').map(Number);
  const [h, min] = (hora || '09:00').split(':').map(Number);
  return new Date(a, m - 1 + masMeses, d, h || 0, min || 0).toISOString();
}

// Las filas que se programan: el cierre de cada semana, a la hora de esa
// semana, y el primer aviso mensual un mes después del lanzamiento. Solo las
// que todavía no han pasado.
export function filasAvisos(d) {
  const p = plan(d);
  const { hora } = partesCheckpoint(d);
  const filas = p.semanas.map((s) => ({ tipo: 'semana', n: s.n, envio_en: isoEnLocal(s.cierre, s.hora) }));
  filas.push({ tipo: 'mes', n: 1, envio_en: isoEnLocal(p.lanzamiento, hora, 1) });
  const ahora = Date.now();
  return filas.filter((f) => Date.parse(f.envio_en) > ahora);
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
  const { data, error } = await c.from('aviso').select('activo').maybeSingle();
  if (error) throw error;
  return { activo: !!data?.activo };
}

export function darseDeBaja(t) {
  return rpc('baja_avisos', { t });
}
