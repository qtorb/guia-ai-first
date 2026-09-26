// Los números de capítulo del método. En los ficheros se escribe el número
// con su id permanente detrás —`9<!--cap:checkpoint-->`— y aquí se pone el
// número que dice metodo/web/mapa.txt. Si mañana se renumera el manual, se
// cambia una línea de mapa.txt y todas las referencias siguen bien: web,
// plantilla, skills.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MAPA = path.resolve(__dirname, '..', 'metodo', 'web', 'mapa.txt');

// --- cargar_mapa(): port de metodo.py:111-126 -------------------------------
export function cargarMapa() {
  const texto = readFileSync(MAPA, 'utf-8');
  const mapa = {};
  for (const linea0 of texto.split('\n')) {
    const linea = linea0.trim();
    if (!linea || linea.startsWith('#')) continue;
    if (!linea.includes('=')) throw new Error(`mapa.txt: se esperaba 'id = capitulo' en: ${linea}`);
    const [k, v] = linea.split('=');
    mapa[k.trim()] = v.trim();
  }
  return mapa;
}

// id → número.
export function leerMapa() {
  return cargarMapa();
}

export const REF = /(\d+(?:\.\d+)?)<!--cap:([a-z0-9-]+)-->/g;

export function resolverCapitulos(texto, mapa, fichero) {
  return texto.replace(REF, (_, _n, id) => {
    if (!(id in mapa)) throw new Error(`${fichero}: capítulo desconocido «${id}»`);
    return mapa[id] + '<!--cap:' + id + '-->';
  });
}
