// Port fiel de dist/sitio/app.js (Método AI-First, generado por sitio.py) —
// la lógica pura de datos: REPARTO/PIEZAS/GENERICO, las reglas de las tres
// líneas (DISPARA/VAGO), y ficheros() que genera el contenido real de los
// cinco ficheros del método a partir de las respuestas.
//
// A diferencia de guia-ai-first-src/index.html (protocolo.js), aquí NO se
// toca el DOM: son funciones puras que la UI de React consume. Los nombres
// de campo (quien, que, columna, roja1…, 'asesor-chips', 'no-asesor',
// checkpoint…) son EXACTAMENTE los de sitio.py, para que paso a paso y el
// fichero de vista previa usen las mismas claves sin traducción.
//
// Cinco de los siete ficheros (00, 01, 02, 03, 07) salen ahora de
// fuente-ligera.json — la misma plantilla que se publica en
// metodo-ai-first-plantilla, con sus huecos {{...}} sin rellenar— y aquí solo
// se rellenan esos huecos. Los otros dos (encargos/primera-tanda.md y
// activos/_LEEME.md) no tienen plantilla pública: se generan como siempre.

import fuenteLigera from '../data/fuente-ligera.json';

export const AB = '<<<m', CE = 'm>>>', AP = '<<<p', CP = 'p>>>';

export const FIJAS_ASESOR = ['Qué está prohibido.', 'Qué cautelas asume el proyecto.'];

// `hasta` marca dónde acaba lo que se monta hoy. Los seis primeros son
// exactamente los ficheros que este recorrido escribe con tus respuestas: la
// lista y lo que te llevas tienen que coincidir.
export const REPARTO = {
  A: { hasta: 7, nota: 'Sin gates de resultado: todavía no hay nada comprobado que congelar.' },
  B: { hasta: 9, nota: 'Por primera vez hay un gate: un control de sí/no sobre lo que entregas. Lo compruebas con un caso que tiene que rechazar, para saber que funciona de verdad.' },
  C: { hasta: 11, nota: 'Cada error lo paga alguien de fuera: entra el método entero.' },
};

export const PIEZAS = [
  '00_VALOR.md — para quién es esto y en qué fase estás',
  '01_ROLES.md — quién decide qué',
  '02_LINEAS_ROJAS.md — tus tres líneas y cuándo usas IA',
  '03_HIPOTESIS.md — lo que supones y quién puede desmentirlo',
  'encargos/primera-tanda.md — lo que le pides a una IA esta semana',
  '07_CIERRE.md — cinco líneas al acabar el día',
  'activos/ — lo que te van entregando, con fecha',
  '05_VISTO_NO_TOCADO.md — lo que aparece y no se toca',
  '06_CATALOGO.md — los fallos que ya te han pasado, con nombre',
  '08_DECISIONES.md — qué decidiste y qué lo hizo cambiar',
  'modelo, versión y fecha anotados en cada entrega',
];

export const GENERICO = {
  quien: [
    ['los usuarios', 'Los usuarios no es nadie en concreto: mañana no sabrás a quién preguntar.'],
    ['las personas', 'Las personas no es nadie en concreto: mañana no sabrás a quién preguntar.'],
    ['la gente', 'La gente no es nadie en concreto: mañana no sabrás a quién preguntar.'],
    ['las empresas', 'Una empresa no decide nada. Decide alguien dentro de ella: ¿quién?'],
    ['las marcas', 'Una marca no decide nada. Decide alguien dentro de ella: ¿quién?'],
    ['los clientes', 'Los clientes es el conjunto. Escribe uno, el que tengas más cerca.'],
    ['todo el mundo', 'Si es para todo el mundo, no vas a poder comprobarlo con nadie.'],
    ['el mercado', 'El mercado no toma decisiones. Alguien concreto sí.'],
    ['la sociedad', 'Demasiado ancho para comprobarlo esta semana.'],
  ],
  que: [
    ['mejorar', 'Mejorar no es algo que alguien decida un martes por la mañana.'],
    ['optimizar', 'Optimizar no es una decisión: es una dirección. ¿Qué elige, y entre qué opciones?'],
    ['crecer', 'Crecer es un resultado, no una decisión que alguien toma.'],
    ['potenciar', 'Potenciar no nombra ninguna decisión concreta.'],
    ['impulsar', 'Impulsar no nombra ninguna decisión concreta.'],
    ['transformar', 'Transformar no nombra ninguna decisión concreta.'],
    ['ayudar', 'Ayudar dice lo que haces tú, no lo que decide quien está enfrente.'],
    ['entender mejor', 'Entender no es decidir. ¿Qué hace distinto después de entenderlo?'],
  ],
};

export const DISPARA = /(^|[\s,;(])(cuando|si|antes de|siempre que|cada vez que|cada vez|al|tras|después de|mientras|en cuanto)\s/i;
export const VAGO = /(con criterio|con sentido común|con cabeza|correctamente|adecuadamente|de forma responsable|con responsabilidad|de manera adecuada|razonablemente|lo mejor posible)/i;

export function pega(txt, lista) {
  const t = (txt || '').toLowerCase();
  if (!t) return null;
  for (let i = 0; i < lista.length; i++) {
    if (t.indexOf(lista[i][0]) >= 0) return lista[i][1];
  }
  return null;
}

export function hoy() {
  return new Date().toISOString().slice(0, 10);
}

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
  'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const DIAS_SEMANA = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

// Las fechas que lee una persona van en castellano; el ISO se queda dentro de
// los ficheros, como metadato.
export function fechaLarga(iso) {
  const t = (iso || '').trim();
  const m = t.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return t;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  if (Number.isNaN(d.getTime())) return t;
  return `${DIAS_SEMANA[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]}`;
}

// Deja la frase apta para ir dentro de otra: sin mayúscula inicial heredada y
// sin el punto final que la cerraba.
export function enlazable(txt) {
  const t = (txt || '').trim().replace(/[.;]+$/, '');
  if (!t) return t;
  const inicial = t.slice(0, 1);
  const resto = t.slice(1);
  if (inicial === inicial.toLowerCase()) return t;
  return resto === resto.toLowerCase() ? inicial.toLowerCase() + resto : t;
}

// El bloque del encargo, sin las comillas de apertura y cierre del markdown:
// es lo que se ve en pantalla y lo que se copia.
export function soloEncargo(texto) {
  const m = (texto || '').match(/```\n([\s\S]*?)\n```/);
  return m ? m[1] : (texto || '');
}

export function listaAsesor(d) {
  // Las fijas van siempre, las escriba o no la persona (3.1 del manual): no
  // dependen de lo guardado, se fuerzan aquí.
  const sueltas = (d['asesor-chips'] || []).filter((c) => FIJAS_ASESOR.indexOf(c) < 0);
  const propias = (d['no-asesor'] || '').split('\n').map((s) => s.trim()).filter(Boolean);
  return FIJAS_ASESOR.concat(sueltas, propias);
}

export function lleno(k, d) {
  if (k === 'asesor') return listaAsesor(d).length > 0;
  if (k === 'columna') return !!d.columna;
  return !!(d[k] || '').trim?.();
}

// --------------------------------------------------------------------------
// Los ficheros. Con marcas si se piden (marcado=true), para poder pintar en
// la vista previa qué has escrito tú (<<<m…m>>>) y qué sigue pendiente
// (<<<p…p>>>).
// --------------------------------------------------------------------------
// Rellena los {{...}} de una plantilla de fuente-ligera.json con las
// respuestas d, según la tabla de A5. Con marcado=true quita antes los
// comentarios HTML (la vista previa no los enseña) y envuelve lo pendiente
// en AP…CP y lo escrito en AB…CE; con marcado=false deja los comentarios y
// pone el texto llano.
function rellenarHuecos(plantilla, d, marcado) {
  const M = (v, alt) => {
    const t = (v || '').trim();
    if (!marcado) return t || alt;
    return t ? AB + t + CE : AP + alt + CP;
  };
  const fe = d.fecha || hoy();
  const col = marcado ? (d.columna ? AB + d.columna + CE : AP + 'A' + CP) : (d.columna || 'A');
  const asesor = listaAsesor(d);
  const asesorTxt = asesor.length
    ? (marcado ? AB + asesor.map((a) => '- ' + a).join('\n') + CE : asesor.map((a) => '- ' + a).join('\n'))
    : (marcado ? AP + '[por escribir]' + CP : '[por escribir]');

  const huecos = {
    quien: M(d.quien, '[quién]'),
    que: M(d.que, '[qué]'),
    fecha: fe,
    columna: col,
    asesor_no: asesorTxt,
    checkpoint: M(d.checkpoint, '[por poner]'),
    roja1: M(d.roja1, '[por escribir]'),
    roja2: M(d.roja2, '[por escribir]'),
    roja3: M(d.roja3, '[por escribir]'),
    firma: M(d.firma, '[tu nombre]'),
    usare: M(d.usare, '[por escribir]'),
    no_usare: M(d['no-usare'], '[por escribir]'),
    validar: M(d.validar, '[por escribir]'),
    suposicion: M(d.suposicion, '[por escribir]'),
    persona: M(d.persona, '[un nombre]'),
    cuando: M(fechaLarga(d.cuando), '[una fecha de esta semana]'),
    sino: M(d.siNo, '[por escribir, y antes de la conversación]'),
    fecha_entrada: fe,
  };

  const texto = marcado ? plantilla.replace(/<!--[\s\S]*?-->\n?/g, '') : plantilla;
  return texto.replace(/\{\{(\w+)\}\}/g, (m, k) => (k in huecos ? huecos[k] : m));
}

export function ficheros(d, marcado) {
  const M = (v, alt) => {
    const t = (v || '').trim();
    if (!marcado) return t || alt;
    return t ? AB + t + CE : AP + alt + CP;
  };
  const fe = d.fecha || hoy();
  const col = marcado ? (d.columna ? AB + d.columna + CE : AP + 'A' + CP) : (d.columna || 'A');

  return {
    'metodo/00_VALOR.md': rellenarHuecos(fuenteLigera['metodo/00_VALOR.md'], d, marcado),
    'metodo/01_ROLES.md': rellenarHuecos(fuenteLigera['metodo/01_ROLES.md'], d, marcado),
    'metodo/02_LINEAS_ROJAS.md': rellenarHuecos(fuenteLigera['metodo/02_LINEAS_ROJAS.md'], d, marcado),
    'metodo/03_HIPOTESIS.md': rellenarHuecos(fuenteLigera['metodo/03_HIPOTESIS.md'], d, marcado),
    'metodo/encargos/primera-tanda.md':
`# Primera tanda — ${fe}

**Columna:** ${col}

## Apertura

**Decisión que tiene que poder tomarse al final:**
Si esto es cierto o no:

> ${M(d.suposicion, '[la suposición que sostiene el plan]')}

**Sabemos:** poco. Este trabajo no lo ha usado nadie todavía.
**Suponemos:** justo eso de arriba.
**Contacto externo que produce esta tanda:** ${M(d.persona, '[un nombre]')}, el ${M(fechaLarga(d.cuando), '[fecha]')}.

---

\`\`\`
OBJETO
  ${M(d.pieza, '[qué necesitas tener listo]')}, para poder tener esa
  conversación con algo en la mano.
  Qué NO es: no es el producto, no es una propuesta comercial y no es
  nada que haya que construir.

PREFLIGHT
  Toda cifra citada aquí es una afirmación a recomputar.
  Si tus números no coinciden con los míos, sigue con los tuyos y dilo.
  Si algo de este encargo contradice lo que ves en el material real,
  gana el material. Dilo antes de ejecutar.

ALCANCE
  1. ${M(d.pieza, '[la pieza]')}, y nada más.

PROHIBIDO
  1. Construir nada que haya que mantener.
  2. Prometer nada que yo no pueda sostener el día de la conversación.
  Si cerrar el alcance exigiera salirse de aquí: STOP FUERA_DE_ALCANCE.

GATES
${(d.columna || 'A') === 'A' ? '  sin gates de resultado: columna A' : `  G-1 · [nombre del control] · condición: [qué tiene que cumplirse para
  que la pieza sirva]
  Estados: cumple · incumple · no clasificado
  Prueba que debe fallar: [el caso concreto que el gate tiene que rechazar
  — provócalo hoy; si no salta, el gate no existe todavía]`}

CRITERIO DE ACEPTACIÓN — sobre el artefacto real
  No se acepta: el borrador dentro del chat.
  Se acepta: ${M(d.acepto, '[qué vas a mirar, sobre lo que verá la otra persona]')}

VEREDICTOS — elige uno al entregar; no prosa
  LISTO_PARA_USAR     se puede llevar a la conversación tal cual
  NECESITA_ITERACION  falta algo concreto y se dice cuál
  PREMISA_FALSA       el encargo se apoya en algo que no se sostiene

STOP
  Total si: cumplir esto exige construir algo que haya que mantener.
  Parcial si: una parte no se puede hacer (se entrega el resto y se
  declara cuál cayó).
  Para también si una prueba refuta el supuesto principal, o si cumplir
  esto exige cambiar algo que está fuera del alcance.

NO ABRIR FRENTES NUEVOS
  Lo que aparezca y no esté previsto se anota en una línea${(d.columna || 'A') === 'A' ? ' aparte' : ' en metodo/05_VISTO_NO_TOCADO.md'}.
  No se arregla de paso.

ENTREGA
  ${M(d.pieza, '[la pieza]')}, donde yo pueda verlo tal como lo verá
  ${M(d.persona, '[esa persona]')}.

  Termina obligatoriamente, sin opción a "ninguno", con:
  MODO_DE_FALLO_NO_PREVISTO — cómo puede esto estar mal de una forma
  que este encargo no anticipa. Aunque todo lo de arriba cumpla, ¿qué
  podría hacer que no le sirviera a ${M(d.persona, '[esa persona]')}?
  Si no encuentras ninguna, di qué buscaste para descartarlo.
\`\`\`

---

*Los tres huecos de abajo los rellenas tú cuando recibas la entrega. No
forman parte de lo que se le pide a la IA.*

**Veredicto:** ________
**Decisión:** aceptar · iterar · revertir · aparcar${(d.columna || 'A') === 'A' ? '' : ' → \`08_DECISIONES.md\`'}
**Coste:** ________
`,
    'metodo/activos/_LEEME.md':
`# Activos

Aquí va **lo que te entreguen**, con la fecha en el nombre:
\`2026-09-24_pagina.md\`, \`2026-10-02_correo.md\`.

Parece burocracia hasta el día en que quieres saber por qué algo quedó como
quedó y ya no existe en ninguna parte. Una decisión escrita sobre un artefacto
que has perdido no vale nada: no puedes releerlo, no puedes ver de dónde salió
la frase que no funcionó, y la siguiente vez lo reescribes desde cero.

Regla: cada vez que aceptes una entrega, cópiala aquí antes de anotar nada.
`,
    'metodo/07_CIERRE.md': rellenarHuecos(fuenteLigera['metodo/07_CIERRE.md'], d, marcado),
  };
}

// Trocea un texto marcado con AB/CE (mark) y AP/CP (pendiente) en segmentos
// {t:'plain'|'mark'|'pend', s} para pintarlo en React sin dangerouslySetInnerHTML.
export function partesVista(texto) {
  const partes = [];
  const re = new RegExp(
    `${esc(AB)}([\\s\\S]*?)${esc(CE)}|${esc(AP)}([\\s\\S]*?)${esc(CP)}`,
    'g'
  );
  let last = 0, m;
  while ((m = re.exec(texto))) {
    if (m.index > last) partes.push({ t: 'plain', s: texto.slice(last, m.index) });
    if (m[1] !== undefined) partes.push({ t: 'mark', s: m[1] });
    else partes.push({ t: 'pend', s: m[2] });
    last = re.lastIndex;
  }
  if (last < texto.length) partes.push({ t: 'plain', s: texto.slice(last) });
  return partes;
}

function esc(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
