// Guarda del vocabulario del método (spec del recorrido v2, §4.3).
//
// Falla (exit 1) si:
//   1. en el material del método aparece una palabra que no es suya: TFM,
//      máster, alumno/a(s), IA-Lab o «cierre de semana» (el ritual se llama
//      checkpoint). Se miran metodo/plantilla/**, src/data/fuente*.json,
//      src/data/manual.json y el texto de las páginas del método, sin los
//      comentarios de código;
//   2. textos/LEEME.md o textos/1_escribir_el_encargo.md no llevan las
//      definiciones de B y C del glosario («probando si sirve» y «hay gente
//      usándolo»);
//   3. la prueba que debe fallar no falla: el mismo control, pasado por
//      scripts/fixtures/glosario-mal.md, tiene que encontrar problemas. Si no
//      los encuentra, el control no controla nada.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(__dirname, '..');

const PROHIBIDAS = [
  [/\bTFM\b/, 'TFM'],
  [/\bmáster\b/i, 'máster'],
  [/\balumn[oa]s?\b/i, 'alumno/a'],
  [/IA-Lab/, 'IA-Lab'],
  [/cierre de semana/i, 'cierre de semana (se llama checkpoint)'],
];

const PAGINAS = ['ProtocoloIA', 'MetodoPortada', 'Mapa', 'Plan30', 'Checkpoint']
  .map((p) => path.join('src', 'pages', `${p}.jsx`));

function listar(dir) {
  let out = [];
  for (const nombre of readdirSync(dir)) {
    if (nombre === '.git') continue;
    const abs = path.join(dir, nombre);
    if (statSync(abs).isDirectory()) out = out.concat(listar(abs));
    else out.push(abs);
  }
  return out;
}

// Quita los comentarios: HTML/markdown (<!-- -->) en todo, y además los de
// código (/* */, {/* */} y //) en .js/.jsx/.mjs. El // solo cuenta si no va
// detrás de «:», para no comerse las URL.
function sinComentarios(texto, fichero) {
  let t = texto.replace(/<!--[\s\S]*?-->/g, '');
  if (/\.(m?js|jsx)$/.test(fichero)) {
    t = t.replace(/\/\*[\s\S]*?\*\//g, '');
    t = t.split('\n').map((l) => l.replace(/(^|[^:\\])\/\/.*$/, '$1')).join('\n');
  }
  return t;
}

export function revisar(ficheros) {
  const problemas = [];
  for (const abs of ficheros) {
    const rel = path.relative(RAIZ, abs);
    const lineas = sinComentarios(readFileSync(abs, 'utf-8'), abs).split('\n');
    lineas.forEach((linea, i) => {
      for (const [re, nombre] of PROHIBIDAS) {
        if (re.test(linea)) problemas.push(`${rel}:${i + 1}: «${nombre}» no es vocabulario del método`);
      }
    });
  }
  return problemas;
}

function revisarDefiniciones() {
  const problemas = [];
  for (const rel of ['textos/LEEME.md', 'textos/1_escribir_el_encargo.md']) {
    const t = readFileSync(path.join(RAIZ, 'metodo', 'plantilla', rel), 'utf-8');
    if (!t.includes('probando si sirve')) problemas.push(`metodo/plantilla/${rel}: falta la definición de B del glosario («probando si sirve»)`);
    if (!t.includes('hay gente usándolo')) problemas.push(`metodo/plantilla/${rel}: falta la definición de C del glosario («hay gente usándolo»)`);
  }
  return problemas;
}

const esMain = path.resolve(process.argv[1] || '') === fileURLToPath(import.meta.url);
if (esMain) {
  const objetivo = [
    ...listar(path.join(RAIZ, 'metodo', 'plantilla')),
    path.join(RAIZ, 'src', 'data', 'fuente.json'),
    path.join(RAIZ, 'src', 'data', 'fuente-ligera.json'),
    path.join(RAIZ, 'src', 'data', 'manual.json'),
    ...PAGINAS.map((p) => path.join(RAIZ, p)),
  ];
  const problemas = [...revisar(objetivo), ...revisarDefiniciones()];

  const fixture = path.join(RAIZ, 'scripts', 'fixtures', 'glosario-mal.md');
  if (revisar([fixture]).length === 0) {
    problemas.push('scripts/fixtures/glosario-mal.md: la prueba que debe fallar no falla; el control no detecta nada');
  }

  if (problemas.length) {
    console.error(`comprobar-glosario: ${problemas.length} problema(s):`);
    problemas.forEach((p) => console.error('  - ' + p));
    process.exit(1);
  }
  console.log('comprobar-glosario: sin problemas (y la prueba que debe fallar, falla).');
}
