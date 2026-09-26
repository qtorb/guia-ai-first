// Construye lo que se publica en qtorb/metodo-ai-first-plantilla a partir de
// metodo/plantilla/: resuelve los números de capítulo (capitulos.mjs) y
// rellena los huecos {{nombre}} con la forma que lleva la plantilla pública
// —rayas y espacios en blanco, no lo que escribió nadie—. Nada se edita a
// mano en el otro repo: esto es lo único que lo genera.
//
// `construirDistPlantilla()` devuelve { rutaRelativa: contenido } sin tocar
// el disco — lo usa también scripts/build-fuente.mjs --comprobar, para
// comprobar que no queda ningún hueco sin rellenar. Ejecutado directamente,
// este fichero además escribe dist-plantilla/.

import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { leerMapa, resolverCapitulos } from './capitulos.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const RAIZ = path.resolve(__dirname, '..');
const PLANTILLA_SRC = path.join(RAIZ, 'metodo', 'plantilla');
const DIST = path.join(RAIZ, 'dist-plantilla');

// La columna «en la plantilla publicada» de la tabla de huecos (A5).
const HUECOS = {
  quien: '______________________',
  que: '______________________',
  fecha: '____________',
  columna: '____',
  checkpoint: '____________ (día y hora)',
  roja1: '_______________________________________________',
  roja2: '_______________________________________________',
  roja3: '_______________________________________________',
  firma: '________',
  usare: '_______________________________________________',
  no_usare: '_______________________________________________',
  validar: '_______________________________________________',
  suposicion: '',
  persona: '',
  cuando: '',
  sino: '',
  fecha_entrada: '[fecha]',
  asesor_no: '- Arquitectura, datos, orden técnico\n'
    + '- Si un cambio es seguro de publicar\n'
    + '- **Qué está prohibido**\n'
    + '- **Qué cautelas asume el proyecto**',
};

function rellenarHuecos(texto, fichero) {
  return texto.replace(/\{\{(\w+)\}\}/g, (m0, nombre) => {
    if (!(nombre in HUECOS)) throw new Error(`${fichero}: hueco desconocido «{{${nombre}}}»`);
    return HUECOS[nombre];
  });
}

function listar(dir, base = '') {
  let out = [];
  for (const nombre of readdirSync(dir)) {
    if (nombre === '.git') continue;
    const abs = path.join(dir, nombre);
    const rel = base ? `${base}/${nombre}` : nombre;
    const st = statSync(abs);
    if (st.isDirectory()) out = out.concat(listar(abs, rel));
    else out.push(rel);
  }
  return out;
}

export function construirDistPlantilla() {
  const mapa = leerMapa();
  const salida = {};
  for (const rel of listar(PLANTILLA_SRC)) {
    const abs = path.join(PLANTILLA_SRC, rel);
    let contenido = readFileSync(abs, 'utf-8');
    if (rel.endsWith('.md')) {
      contenido = resolverCapitulos(contenido, mapa, rel);
      contenido = rellenarHuecos(contenido, rel);
    }
    salida[rel] = contenido;
  }
  return salida;
}

function escribirDisco(salida) {
  rmSync(DIST, { recursive: true, force: true });
  mkdirSync(DIST, { recursive: true });
  for (const [rel, contenido] of Object.entries(salida)) {
    const destino = path.join(DIST, rel);
    mkdirSync(path.dirname(destino), { recursive: true });
    writeFileSync(destino, contenido, 'utf-8');
  }
}

const esMain = path.resolve(process.argv[1] || '') === __filename;
if (esMain) {
  const salida = construirDistPlantilla();
  escribirDisco(salida);
  console.log(`dist-plantilla/: ${Object.keys(salida).length} ficheros.`);
}
