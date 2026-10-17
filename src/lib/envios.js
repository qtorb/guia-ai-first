// Lo que el alumno decide enviar: el documento de una hoja a la dirección
// del máster y las sugerencias de mejora. Las dos funciones de la base de
// datos (supabase/migrations/0006_envios_y_sugerencias.sql) guardan lo
// enviado y lo mandan por correo; aquí solo se llaman.

import { cliente, hayNube } from './nube';

export { hayNube };

export const CORREO_OK = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function enviarDocumento({ hoja, titulo, nombre, correo, texto }) {
  if (!hayNube) throw new Error('sin nube');
  const c = await cliente();
  const { error } = await c.rpc('enviar_documento', {
    p_hoja: String(hoja), p_titulo: titulo || '', p_nombre: nombre.trim(),
    p_correo: correo.trim(), p_texto: texto.slice(0, 60000),
  });
  if (error) throw error;
}

export async function enviarSugerencia({ pagina, texto, correo }) {
  if (!hayNube) throw new Error('sin nube');
  const c = await cliente();
  const { error } = await c.rpc('enviar_sugerencia', {
    p_pagina: (pagina || '').slice(0, 200), p_texto: texto.trim().slice(0, 2000),
    p_correo: (correo || '').trim() || null,
  });
  if (error) throw error;
}
