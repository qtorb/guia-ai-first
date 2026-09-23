// El panel de actividad y el botón de atasco.
//
// Todo lo que el panel sabe lo devuelven dos funciones de la base de datos
// (supabase/migrations/0002_panel_y_atasco.sql) que comprueban en el servidor
// que quien pregunta es el administrador y que nunca devuelven lo escrito.
// Aquí solo se piden y se cuentan.

import { cliente, hayNube } from './nube';
import sesionesData from '../data/sesiones.json';
import hojasData from '../data/hojas.json';

export async function leerPanel() {
  const c = await cliente();
  const [p, a] = await Promise.all([c.rpc('panel_personas'), c.rpc('panel_atascos')]);
  if (p.error) throw p.error;
  if (a.error) throw a.error;
  return { personas: p.data || [], atascos: a.data || [] };
}

// Sin nombre ni cuenta: solo hoja, paso y la frase, si la hay.
export async function enviarAtasco(hoja, paso, frase) {
  if (!hayNube) throw new Error('sin nube');
  const c = await cliente();
  const f = (frase || '').trim().slice(0, 280);
  const { error } = await c.from('atasco').insert({ hoja: String(hoja), paso, frase: f || null });
  if (error) throw error;
}

// Las hojas de IA-Lab en el orden de la web: sesiones y después herramientas.
export function hojasIaLab() {
  return [...sesionesData.sesiones, ...(sesionesData.herramientas || [])]
    .filter((s) => s.fichero && hojasData[s.fichero])
    .map((s) => ({ n: String(s.n), titulo: s.titulo, hoja: hojasData[s.fichero] }));
}

// El nombre de un paso, con la misma cuenta que IaLabHoja.jsx: paso 1 es la
// apertura, luego un paso por bloque, el contraste si lo hay y la salida.
export function nombrePaso(hoja, p) {
  if (!hoja || !p) return '';
  const nb = hoja.bloques.length;
  if (p === 1) return hoja.apertura ? 'Antes de empezar' : 'Preparar';
  if (p <= nb + 1) {
    const b = hoja.bloques[p - 2];
    return (b.parte ? b.parte + ' · ' : '') + b.titulo;
  }
  if (hoja.contraste && p === nb + 2) return 'Contraste';
  return 'La pieza final';
}

export const PASOS_METODO = [
  'Frase de valor', 'Fase', 'Líneas rojas', 'Quién decide', 'Cuándo usas IA', 'Qué pones a prueba', 'Primer encargo',
];

const DIA = 86400000;
export const diasDesde = (f) => (f ? Math.floor((Date.now() - new Date(f).getTime()) / DIA) : null);

export function usaIaLab(p) { return Object.keys(p.hojas || {}).length > 0; }
export function usaMetodo(p) { return p.metodo_paso != null || p.plan30; }

export function aCsv(personas, hojas) {
  const cab = ['nombre', 'correo', 'via', 'alta', 'ultima_actividad', ...hojas.map((h) => 'hoja_' + h.n), 'metodo_paso', 'plan30'];
  const celda = (v) => {
    const s = v == null ? '' : String(v);
    return /[",\n;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  const filas = personas.map((p) => [
    p.nombre, p.correo, p.via,
    p.alta ? p.alta.slice(0, 10) : '',
    p.ultima_actividad ? p.ultima_actividad.slice(0, 10) : '',
    ...hojas.map((h) => estadoHoja(p.hojas?.[h.n]).txt),
    p.metodo_paso ?? '',
    p.plan30 ? 'sí' : '',
  ].map(celda).join(','));
  return [cab.join(','), ...filas].join('\n');
}

export function estadoHoja(e) {
  if (!e) return { tipo: 'no', txt: '—' };
  if (e.fin) return { tipo: 'ok', txt: '✓' };
  return { tipo: 'mid', txt: `${e.paso || 1}/${e.total || '?'}` };
}
