// Genera src/data/manual.json a partir de metodo/plantilla/docs/MANUAL.md +
// metodo/web/grupos.txt + metodo/web/mapa.txt. Esos ficheros son la ÚNICA
// fuente del método: la plantilla pública (qtorb/metodo-ai-first-plantilla)
// se genera desde metodo/plantilla/ en cada merge a main y no se edita a mano.
// Es un port fiel de herramientas/sitio.py: cargar_grupos(), cargar_mapa()
// (metodo.py:111-126), trocear_manual(), ficha(), md() y
// neutralizar_cabeceras_en_cercas(). Mismo comportamiento, incluidas sus
// limitaciones conocidas (md() no soporta tablas — la tabla del capítulo 0
// se degrada igual que en el sitio Python actual; el capítulo 0 no forma
// parte de la navegación de fichas, solo existía en la vista "todo en una
// página" que aquí no se reimplementa).

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { cargarMapa } from './capitulos.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEB = path.resolve(__dirname, '..', 'metodo', 'web');
const MANUAL = path.resolve(__dirname, '..', 'metodo', 'plantilla', 'docs', 'MANUAL.md');
const OUT_DIR = path.resolve(__dirname, '..', 'src', 'data');

const MARCA_CERCA = '​';

function neutralizarCabecerasEnCercas(texto) {
  const lineas = texto.split('\n');
  let enCerca = false;
  for (let i = 0; i < lineas.length; i++) {
    const l = lineas[i];
    if (l.trim().startsWith('```')) { enCerca = !enCerca; continue; }
    if (enCerca && (l.startsWith('## ') || l.startsWith('### '))) {
      lineas[i] = MARCA_CERCA + l;
    }
  }
  return lineas.join('\n');
}

function limpiarComentarios(texto) {
  texto = texto.replace(/<!--cap:[a-z0-9-]+-->/g, '');
  texto = texto.replace(/<!-- \/?BLOQUE: [a-z0-9-]+ -->\n?/g, '');
  texto = texto.replace(/<!--[\s\S]*?-->/g, '');
  return texto;
}

// --- md(): port literal de sitio.py:606-643 --------------------------------
function md(texto) {
  function inline(s) {
    s = s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/(?<![\w*])\*([^*]+?)\*(?![\w*])/g, '<em>$1</em>');
    s = s.replace(/`(.+?)`/g, '<code>$1</code>');
    s = s.replace(/\[\[cap:([a-z0-9-]+)\]\]/g, '$1');
    return s;
  }

  const salida = [];
  let buf = [];
  let lista = null;
  let cita = [];

  function cerrar() {
    if (cita.length) {
      salida.push('<blockquote>' + cita.map(c => `<p>${inline(c)}</p>`).join('') + '</blockquote>');
      cita = [];
    }
    if (lista) {
      salida.push('<ul>' + lista.map(x => `<li>${inline(x)}</li>`).join('') + '</ul>');
      lista = null;
    }
    if (buf.length) {
      salida.push(`<p>${inline(buf.join(' '))}</p>`);
      buf = [];
    }
  }

  for (const linea of texto.split('\n')) {
    const l = linea.replace(/\s+$/, '');
    if (!l.trim()) { cerrar(); continue; }
    if (l.startsWith('> ')) {
      if (buf.length || lista) cerrar();
      cita.push(l.slice(2));
      continue;
    }
    if (cita.length) cerrar();
    if (l.startsWith('- ')) {
      if (buf.length) cerrar();
      lista = (lista || []).concat([l.slice(2)]);
      continue;
    }
    if (lista) cerrar();
    buf.push(l.trim());
  }
  cerrar();
  return salida.join('\n');
}

// --- cargar_grupos(): port de sitio.py:1868-1879 ----------------------------
function cargarGrupos() {
  const texto = readFileSync(path.join(WEB, 'grupos.txt'), 'utf-8');
  const grupos = [];
  let actual = null;
  for (let l of texto.split('\n')) {
    l = l.trim();
    if (l.startsWith('grupo |')) {
      actual = [l.split('|').slice(1).join('|').trim(), []];
      grupos.push(actual);
    } else if (l.startsWith('>') && actual) {
      const [ident, resuelve] = l.slice(1).split('|').map(x => x.trim());
      actual[1].push([ident, resuelve]);
    }
  }
  return grupos;
}

// --- trocear_manual(): port de sitio.py:1882-1913 ---------------------------
function trocearManual() {
  let texto = readFileSync(MANUAL, 'utf-8');
  texto = limpiarComentarios(texto);
  texto = neutralizarCabecerasEnCercas(texto);

  const caps = {};
  const trozosNivel2 = texto.split(/^## /m).slice(1);
  for (const trozo of trozosNivel2) {
    const lineas = trozo.split('\n');
    const cabecera = lineas[0].trim();
    const cuerpo = lineas.slice(1).join('\n');
    const m = cabecera.match(/^(\d+)\s*·\s*(.+)$/);
    if (m) {
      caps[m[1]] = [m[2].trim(), cuerpo];
      const trozosNivel3 = cuerpo.split(/^### /m).slice(1);
      for (const sub of trozosNivel3) {
        const sl = sub.split('\n');
        const sm = sl[0].trim().match(/^(\d+\.\d+)\s*·\s*(.+)$/);
        if (sm) {
          const tit = sm[2].replace(/\s*·\s*\d+\s*min.*$/, '').trim();
          caps[sm[1]] = [tit, sl.slice(1).join('\n')];
        }
      }
    } else if (cabecera.startsWith('Anexo')) {
      if (!caps.anexos) caps.anexos = ['Plantillas', ''];
      caps.anexos = [caps.anexos[0], caps.anexos[1] + `\n\n### ${cabecera}\n${cuerpo}`];
    }
  }
  for (const k of Object.keys(caps)) {
    caps[k] = [caps[k][0].split(MARCA_CERCA).join(''), caps[k][1].split(MARCA_CERCA).join('')];
  }
  return caps;
}

// --- ficha(): port de sitio.py:1916-1972 ------------------------------------
function ficha(cuerpo) {
  const codigos = [];
  cuerpo = cuerpo.replace(/```[a-z]*\n([\s\S]*?)```/g, (_, c) => {
    codigos.push(c);
    return `@@COD${codigos.length - 1}@@`;
  });

  const partes = [];
  let actual = [];
  for (const linea of cuerpo.split('\n')) {
    if (linea.startsWith('### ')) {
      if (actual.length) partes.push(actual);
      actual = [linea];
    } else {
      actual.push(linea);
    }
  }
  if (actual.length) partes.push(actual);

  const out = [];
  for (const p of partes) {
    let cab = null, resto;
    if (p[0].startsWith('### ')) { cab = p[0]; resto = p.slice(1); } else { resto = p; }
    if (cab) {
      let titulo = cab.slice(4).trim();
      let tiempo = '';
      const mt = titulo.match(/·\s*(\d+\s*min)\s*(?:·\s*\[(\w+)\])?$/);
      if (mt) {
        titulo = titulo.slice(0, mt.index).trim();
        tiempo = `<span class="tiempo">${mt[1]}</span>`;
      }
      out.push(`<h3>${titulo}${tiempo}</h3>`);
    }
    let texto = resto.join('\n');

    function tira(patron, clase, rotulo) {
      const m = texto.match(patron);
      if (!m) return '';
      texto = texto.replace(m[0], '');
      const rendered = md(m[1].trim());
      // sitio.py hace md(...)[3:-4] para pelar el <p> que envuelve una sola
      // línea (md() de una única línea siempre produce exactamente "<p>...</p>")
      const inner = rendered.startsWith('<p>') && rendered.endsWith('</p>')
        ? rendered.slice(3, -4)
        : rendered;
      return `<div class="tira ${clase}"><p class="rotulo">${rotulo}</p><p>${inner}</p></div>`;
    }

    const antes = tira(/^\*\*Antes:?\*\*:?\s*(.+)$/m, 'antes', 'Necesitas antes');
    const hecho = tira(/^\*\*Hecho cuando:?\*\*:?\s*(.+)$/m, 'hecho', 'Hecho cuando');
    const queda = tira(/^\*\*Queda:?\*\*:?\s*(.+)$/m, 'queda', 'Queda escrito');

    let cuerpoHtml = md(texto);
    codigos.forEach((c, i) => {
      if (cuerpoHtml.includes(`@@COD${i}@@`)) {
        cuerpoHtml = cuerpoHtml.replace(
          `<p>@@COD${i}@@</p>`,
          `<div class="copiable"><pre>${c.trim()}</pre><button class="btn btn-2 copiar">Copiar</button></div>`
        );
        cuerpoHtml = cuerpoHtml.split(`@@COD${i}@@`).join('');
      }
    });
    out.push(antes + cuerpoHtml + queda + hecho);
  }
  return out.join('');
}

// --- ensamblado --------------------------------------------------------------
function construir() {
  const grupos = cargarGrupos();
  const mapa = cargarMapa();
  const caps = trocearManual();

  const grupoDeSalida = grupos.map(([nombre, entradas]) => ({
    nombre,
    entradas: entradas.map(([ident, resuelve]) => ({ ident, resuelve })),
  }));

  const plano = grupos.flatMap(([, entradas]) => entradas.map(([ident]) => ident));

  const capitulos = {};
  for (const [, entradas] of grupos) {
    for (const [ident, resuelve] of entradas) {
      let num = mapa[ident] || '';
      let titulo, cuerpo;
      if (ident === 'plantillas') {
        [titulo, cuerpo] = caps.anexos || ['Plantillas', ''];
        num = '';
      } else {
        [titulo, cuerpo] = caps[num] || [resuelve, ''];
      }
      const pos = plano.indexOf(ident);
      const anterior = pos > 0 ? plano[pos - 1] : null;
      const siguiente = pos < plano.length - 1 ? plano[pos + 1] : null;
      capitulos[ident] = {
        ident, num, titulo, resuelve,
        html: ficha(cuerpo),
        anterior, siguiente,
      };
    }
  }

  return { grupos: grupoDeSalida, capitulos };
}

mkdirSync(OUT_DIR, { recursive: true });
const datos = construir();
writeFileSync(path.join(OUT_DIR, 'manual.json'), JSON.stringify(datos, null, 1), 'utf-8');
console.log(`manual.json escrito: ${Object.keys(datos.capitulos).length} capítulos, ${datos.grupos.length} grupos.`);
