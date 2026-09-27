// Lee metodo/plantilla/ entera (ficheros ocultos incluidos, sin .git),
// resuelve los números de capítulo con capitulos.mjs, y escribe dos JSON
// que consume la web:
//
//   src/data/fuente-ligera.json — textos/* y los cinco ficheros con huecos
//   {{...}} (metodo/00_VALOR.md, 01_ROLES.md, 02_LINEAS_ROJAS.md,
//   03_HIPOTESIS.md, 07_CIERRE.md), con los huecos SIN rellenar: la web los
//   rellena ella misma, según quién los lea (ficheros(d, marcado) en
//   src/lib/protocoloAiFirst.js).
//
//   src/data/fuente.json — todo lo demás de metodo/plantilla/, salvo
//   README.md, LEEME_PRIMERO.md y .gitignore, que no aportan nada fuera de
//   la plantilla publicada.
//
// Con --comprobar no escribe nada: falla (exit 1) si (a) algún
// N<!--cap:id--> del manual no coincide con metodo/web/mapa.txt, (b) algún
// número de mapa.txt no tiene su cabecera `## N ·` / `### N ·` en el
// manual, o (c) queda algún «{{» sin rellenar en lo que publicaría
// scripts/publicar-plantilla.mjs.

import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { leerMapa, resolverCapitulos } from './capitulos.mjs';
import { construirDistPlantilla } from './publicar-plantilla.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(__dirname, '..');
const PLANTILLA = path.join(RAIZ, 'metodo', 'plantilla');
const MANUAL = path.join(PLANTILLA, 'docs', 'MANUAL.md');
const OUT_DIR = path.join(RAIZ, 'src', 'data');

// Los cinco ficheros con huecos, más textos/* (por prefijo), van a la
// versión ligera; el resto, salvo los tres excluidos, va a la completa.
const LIGEROS = new Set([
  'metodo/00_VALOR.md',
  'metodo/01_ROLES.md',
  'metodo/02_LINEAS_ROJAS.md',
  'metodo/03_HIPOTESIS.md',
  'metodo/07_CIERRE.md',
]);
const EXCLUIDOS_DE_FUENTE = new Set(['README.md', 'LEEME_PRIMERO.md', '.gitignore']);

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

function construir() {
  const mapa = leerMapa();
  const ligera = {};
  const completa = {};
  for (const rel of listar(PLANTILLA)) {
    const abs = path.join(PLANTILLA, rel);
    let contenido = readFileSync(abs, 'utf-8');
    if (rel.endsWith('.md')) contenido = resolverCapitulos(contenido, mapa, rel);
    if (rel.startsWith('textos/') || LIGEROS.has(rel)) {
      ligera[rel] = contenido;
    } else if (!EXCLUIDOS_DE_FUENTE.has(rel)) {
      completa[rel] = contenido;
    }
  }
  return { ligera, completa, mapa };
}

// (a) y (b): cada N<!--cap:id--> del manual contra mapa.txt, en las dos
// direcciones.
function comprobarManual(mapa) {
  const texto = readFileSync(MANUAL, 'utf-8');
  const problemas = [];
  const REF = /(\d+(?:\.\d+)?)<!--cap:([a-z0-9-]+)-->/g;
  let m;
  while ((m = REF.exec(texto))) {
    const [, n, id] = m;
    if (mapa[id] === undefined) {
      problemas.push(`docs/MANUAL.md: id desconocido «${id}» junto al número ${n}, no está en mapa.txt`);
    } else if (mapa[id] !== n) {
      problemas.push(`docs/MANUAL.md: «${n}<!--cap:${id}-->» no coincide con mapa.txt (${id} = ${mapa[id]})`);
    }
  }
  for (const [id, n] of Object.entries(mapa)) {
    const escapado = n.replace(/\./g, '\\.');
    const cabecera = new RegExp(`^#{2,3}\\s+${escapado}\\s+·`, 'm');
    if (!cabecera.test(texto)) {
      problemas.push(`metodo/web/mapa.txt: ${id} = ${n}, pero no hay cabecera «## ${n} ·» ni «### ${n} ·» en docs/MANUAL.md`);
    }
  }
  return problemas;
}

const comprobar = process.argv.includes('--comprobar');
const { ligera, completa, mapa } = construir();

if (comprobar) {
  const problemas = comprobarManual(mapa);
  const dist = construirDistPlantilla();
  const conHuecos = Object.entries(dist).filter(([, c]) => c.includes('{{')).map(([rel]) => rel);
  if (conHuecos.length) problemas.push(`quedan huecos «{{...}}» sin rellenar en: ${conHuecos.join(', ')}`);
  if (problemas.length) {
    console.error(`comprobar-fuente: ${problemas.length} discrepancia(s):`);
    problemas.forEach((p) => console.error('  - ' + p));
    process.exit(1);
  }
  console.log('comprobar-fuente: sin discrepancias.');
  process.exit(0);
}

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(path.join(OUT_DIR, 'fuente-ligera.json'), JSON.stringify(ligera, null, 1), 'utf-8');
writeFileSync(path.join(OUT_DIR, 'fuente.json'), JSON.stringify(completa, null, 1), 'utf-8');
console.log(`fuente-ligera.json: ${Object.keys(ligera).length} ficheros. fuente.json: ${Object.keys(completa).length} ficheros.`);
