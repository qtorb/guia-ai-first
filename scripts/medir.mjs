// Las tres cifras que lleva cada asiento del registro, medidas igual siempre.
//
//   node scripts/medir.mjs                      → producción
//   node scripts/medir.mjs http://localhost:4173/guia-ai-first/   → un build local
//
// Necesita Playwright, que NO es dependencia del proyecto a propósito: pesa
// más que la web entera y sólo hace falta el día que se mide.
//   npm i -D playwright && npx playwright install chromium
//
// LO QUE ESTE FICHERO EXISTE PARA RECORDAR
// ----------------------------------------
// Navegar entre rutas por hash dentro de un mismo contexto de navegador NO
// remonta la aplicación. Los barridos hechos así se saltan pasos en silencio
// y dan números optimistas. Por eso cada combinación de ruta × ancho ×
// esquema abre un contexto NUEVO. Si alguien «optimiza» esto reutilizando el
// contexto, las cifras dejan de significar nada y nadie se entera.

import { chromium } from 'playwright';

const BASE = (process.argv[2] || 'https://qtorb.github.io/guia-ai-first/').replace(/\/$/, '') + '/';
const ANCHOS = [390, 768, 1440];
const ESQUEMAS = ['light', 'dark'];

// Ruta, y en qué paso de la hoja hay que pararse (los pasos se abren
// pulsando su punto en la tira, no navegando).
const PANTALLAS = [
  { nom: 'portada',      ruta: '' },
  { nom: 'lista IA-Lab', ruta: '#/ia-lab' },
  { nom: 'hoja1 · p1',   ruta: '#/ia-lab/1' },
  { nom: 'hoja1 · bloq', ruta: '#/ia-lab/1',  paso: 2 },
  { nom: 'hoja1 · fin',  ruta: '#/ia-lab/1',  paso: 13 },
  { nom: 'hoja0 · p4',   ruta: '#/ia-lab/10', paso: 5 },
  { nom: 'encargo · b2', ruta: '#/ia-lab/12', paso: 3 },
];

// AAA: 7:1 para texto normal, 4,5:1 para texto grande (≥24px, o ≥18,66px en
// negrita). Y 44×44 de objetivo táctil (WCAG 2.5.5).
function auditar() {
  const parse = (c) => {
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(',').map(Number);
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  };
  const lum = ({ r, g, b }) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const ratio = (a, b) => {
    const [x, y] = [lum(a), lum(b)];
    return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
  };
  // El fondo real es el del primer antepasado opaco, no el del elemento.
  const fondoDe = (el) => {
    let n = el;
    while (n && n !== document.documentElement) {
      const c = parse(getComputedStyle(n).backgroundColor);
      if (c && c.a > 0.9) return c;
      n = n.parentElement;
    }
    return { r: 255, g: 255, b: 255, a: 1 };
  };

  const contraste = [];
  document.querySelectorAll('body *').forEach((el) => {
    const txt = [...el.childNodes].filter((n) => n.nodeType === 3)
      .map((n) => n.textContent.trim()).join(' ').trim();
    if (!txt) return;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || parseFloat(cs.opacity) < 0.1) return;
    const fg = parse(cs.color);
    if (!fg) return;
    const px = parseFloat(cs.fontSize);
    const grande = px >= 24 || (parseInt(cs.fontWeight, 10) >= 700 && px >= 18.66);
    const exige = grande ? 4.5 : 7;
    const bg = fondoDe(el);
    const r = ratio(fg, bg);
    if (r < exige) {
      contraste.push({
        texto: txt.slice(0, 60), clase: String(el.className).slice(0, 40),
        tag: el.tagName.toLowerCase(), px, color: cs.color,
        fondo: `rgb(${bg.r},${bg.g},${bg.b})`, ratio: Math.round(r * 100) / 100, exige,
      });
    }
  });

  const tactiles = [];
  document.querySelectorAll('a,button,input,select,textarea,summary,[role="button"]').forEach((el) => {
    // Lo que se pulsa es la etiqueta, no la casilla: una casilla de 20px
    // dentro de un <label> de 46 es un objetivo de 46. Y un enlace dentro de
    // una frase está exento (WCAG 2.5.5, «inline»).
    const lab = el.closest('label');
    const caja = lab && (el.type === 'checkbox' || el.type === 'radio') ? lab : el;
    if (el.tagName === 'A' && getComputedStyle(el).display === 'inline') return;
    const b = caja.getBoundingClientRect();
    if (!b.width && !b.height) return;
    if (b.height < 44 || b.width < 24) {
      tactiles.push({
        tag: el.tagName.toLowerCase(), clase: String(el.className).slice(0, 34),
        texto: (el.textContent || '').trim().slice(0, 34),
        w: Math.round(b.width), h: Math.round(b.height),
      });
    }
  });

  // Alto y palabras del paso visible: la pantalla que el alumno tiene delante,
  // no el documento entero.
  const raiz = document.querySelector('#pasos .wstep.on') || document.querySelector('.wrap') || document.body;
  const texto = (raiz.innerText || '').trim();
  const cajas = [...raiz.querySelectorAll('*')].filter((el) => {
    const c = getComputedStyle(el);
    const fondo = c.backgroundColor !== 'rgba(0, 0, 0, 0)' && c.backgroundColor !== 'transparent';
    const borde = parseFloat(c.borderTopWidth) + parseFloat(c.borderLeftWidth) > 0;
    return (fondo || borde) && el.getBoundingClientRect().height > 12;
  }).length;

  return {
    contraste, tactiles,
    alto: Math.round(raiz.getBoundingClientRect().height),
    palabras: texto ? texto.split(/\s+/).length : 0,
    cajas,
    botones: raiz.querySelectorAll('button,a').length,
    scrollX: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  };
}

const navegador = await chromium.launch();
let fallos = 0, peor = { alto: 0 };

// Cifra 3: peso de la primera carga, en un viewport de móvil y en frío.
{
  const ctx = await navegador.newContext({ viewport: { width: 390, height: 844 } });
  const pag = await ctx.newPage();
  let bytes = 0, peticiones = 0;
  pag.on('response', (r) => {
    const n = r.headers()['content-length'];
    if (n) { bytes += Number(n); peticiones += 1; }
  });
  const t0 = Date.now();
  await pag.goto(BASE, { waitUntil: 'networkidle' });
  console.log(`\nPRIMERA CARGA (390px)  ${peticiones} peticiones · ${(bytes / 1024).toFixed(0)} KB · ${Date.now() - t0} ms\n`);
  await ctx.close();
}

for (const p of PANTALLAS) {
  for (const w of ANCHOS) {
    for (const esquema of ESQUEMAS) {
      // Contexto NUEVO. Ver la nota de arriba antes de tocar esto.
      const ctx = await navegador.newContext({ viewport: { width: w, height: 900 }, colorScheme: esquema });
      const pag = await ctx.newPage();
      await pag.goto(BASE + p.ruta, { waitUntil: 'networkidle' });
      await pag.waitForTimeout(350);
      if (p.paso) {
        const ok = await pag.evaluate((n) => {
          const d = document.querySelectorAll('.pdot')[n - 1];
          if (!d) return false;
          d.click();
          return true;
        }, p.paso);
        if (!ok) console.log(`  ¡sin punto ${p.paso} en ${p.nom}! la tira ha cambiado de tamaño`);
        await pag.waitForTimeout(400);
      }
      const r = await pag.evaluate(auditar);
      fallos += r.contraste.length + r.tactiles.length;
      if (r.alto > peor.alto) peor = { ...r, nom: p.nom, w, esquema };
      console.log(
        `${p.nom.padEnd(14)} ${String(w).padStart(4)} ${esquema.padEnd(5)}` +
        `  AAA:${String(r.contraste.length).padStart(3)} tác:${String(r.tactiles.length).padStart(2)}` +
        `  alto:${String(r.alto).padStart(5)}  pal:${String(r.palabras).padStart(4)}` +
        `  cajas:${String(r.cajas).padStart(3)}  btn:${String(r.botones).padStart(3)}` +
        (r.scrollX ? '  ⚠ SCROLL HORIZONTAL' : '')
      );
      for (const x of r.contraste) console.log(`      · ${x.ratio}:1 (pide ${x.exige}) ${x.tag}.${x.clase} «${x.texto}» ${x.color} sobre ${x.fondo}`);
      for (const x of r.tactiles) console.log(`      · táctil ${x.w}×${x.h} ${x.tag}.${x.clase} «${x.texto}»`);
      await ctx.close();
    }
  }
}
await navegador.close();

console.log(`\nLA PANTALLA QUE MÁS PESA   ${peor.nom} · ${peor.w}px · ${peor.esquema}`);
console.log(`                           ${peor.alto} px · ${peor.palabras} palabras · ${peor.cajas} cajas · ${peor.botones} botones`);
console.log(`FALLOS (contraste+táctil)  ${fallos}\n`);
process.exit(fallos ? 1 : 0);
