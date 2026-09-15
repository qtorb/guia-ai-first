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

export const AB = '<<<m', CE = 'm>>>', AP = '<<<p', CP = 'p>>>';

export const FIJAS_ASESOR = ['Qué está prohibido.', 'Qué cautelas asume el proyecto.'];

// `hasta` marca dónde acaba lo que se monta hoy. Los seis primeros son
// exactamente los ficheros que este recorrido escribe con tus respuestas: la
// lista y lo que te llevas tienen que coincidir.
export const REPARTO = {
  A: { hasta: 6, nota: 'Sin gates de resultado: todavía no hay nada comprobado que congelar.' },
  B: { hasta: 8, nota: 'Por primera vez hay un gate: un control de sí/no sobre lo que entregas. Lo compruebas con un caso que tiene que rechazar, para saber que funciona de verdad.' },
  C: { hasta: 10, nota: 'Cada error lo paga alguien de fuera: entra el método entero.' },
};

export const PIEZAS = [
  '00_VALOR.md — para quién es esto y en qué fase estás',
  '01_ROLES.md — quién decide qué',
  '02_LINEAS_ROJAS.md — tus tres líneas y cuándo usas IA',
  '03_HIPOTESIS.md — lo que supones y quién puede desmentirlo',
  'encargos/primera-tanda.md — lo que le pides a una IA esta semana',
  '07_CIERRE.md — cinco líneas al acabar el día',
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
export function ficheros(d, marcado) {
  const M = (v, alt) => {
    const t = (v || '').trim();
    if (!marcado) return t || alt;
    return t ? AB + t + CE : AP + alt + CP;
  };
  const q = M(d.quien, '[quién]'), w = M(d.que, '[qué]');
  const fe = d.fecha || hoy();
  const col = marcado ? (d.columna ? AB + d.columna + CE : AP + 'A' + CP) : (d.columna || 'A');
  const firma = M(d.firma, '[tu nombre]');
  const roja = (n) => M(d['roja' + n], '[por escribir]');
  const asesor = listaAsesor(d);
  const asesorTxt = asesor.length
    ? (marcado ? AB + asesor.join('\n') + CE : asesor.join('\n'))
    : (marcado ? AP + '[por escribir]' + CP : '[por escribir]');

  return {
    'metodo/00_VALOR.md':
`# Valor y fase

## La frase

Este trabajo produce valor cuando ${q} puede tomar mejor la decisión de ${w}.

**Fecha:** ${fe}

## La columna

**Columna:** ${col} desde ${fe}

## Historial de cambios de esta frase

| Fecha | Qué cambió | Qué lo hizo cambiar |
|---|---|---|
| | | |
`,
    'metodo/01_ROLES.md':
`# Roles

Quién decide qué. Y sobre todo: qué no decide cada uno.
La columna de la derecha vale más que la de la izquierda.

## Fundador — tú

Decide: intención, criterio, prioridad, restricciones, trade-offs,
qué está prohibido, y todo lo que no esté delegado por escrito.
NO decide: nada queda fuera de tu decisión — esa es la diferencia entre
delegar y desaparecer.

## Asesor

NO decide:

${asesorTxt}

## Ejecutor

Decide: nada. Ejecuta encargos cerrados.
Lo no previsto va a 05_VISTO_NO_TOCADO.md, en una línea.

## Checkpoint

Decide: cuándo se mira si hay que parar.
NO decide: qué se construye, ni parar. El STOP lo firmas tú.

**Cita en el calendario:** ${M(d.checkpoint, '[por poner]')}
`,
    'metodo/02_LINEAS_ROJAS.md':
`# Líneas rojas y protocolo de uso

Cada línea lleva fecha y firma. La firma es lo único que distingue una línea
roja de una cautela que apareció sola.

## 1 · Qué no afirmaré nunca sin evidencia

${roja(1)}

**Fecha:** ${fe} · **Firma:** ${firma}

## 2 · Qué datos no compartiré nunca con un modelo

${roja(2)}

**Fecha:** ${fe} · **Firma:** ${firma}

## 3 · Qué no publicaré nunca sin que lo mire alguien

${roja(3)}

**Fecha:** ${fe} · **Firma:** ${firma}

## Cuándo uso IA y cuándo no

**Usaré IA cuando:**

${M(d.usare, '[por escribir]')}

**No la usaré cuando:**

${M(d['no-usare'], '[por escribir]')}

**Antes de aceptar una respuesta comprobaré:**

${M(d.validar, '[por escribir]')}

**Fecha:** ${fe} · **Firma:** ${firma}

## Añadidas después

| Fecha | Línea | Firma | Qué la hizo necesaria |
|---|---|---|---|
| | | | |
`,
    'metodo/03_HIPOTESIS.md':
`# Hipótesis

Lo que se afirma, y qué evidencia haría falta para poder afirmarlo.

## La que sostiene el plan

${M(d.suposicion, '[por escribir]')}

**Estado:** supuesto. No comprobado.
**Quién puede decir si es verdad:** ${M(d.persona, '[un nombre]')}
**Cuándo se lo pregunto:** ${M(fechaLarga(d.cuando), '[una fecha de esta semana]')}

## Lo que salga de esa conversación

Tres frases suyas literales, no tu resumen. Y una cosa que te haya sorprendido:
si no hay ninguna, o preguntaste mal o te dijeron lo que querías oír.

| Fecha | Con quién | Tres frases suyas | Qué me sorprendió | Qué decisión cambia |
|---|---|---|---|---|
| | | | | |

*Si lo único que puedes escribir es «le gustó», la conversación cuenta como cero.*

## Otras hipótesis

| Fecha | Qué se afirma | Qué evidencia haría falta | Estado |
|---|---|---|---|
| | | | |
`,
    'metodo/encargos/primera-tanda.md':
`# Primera tanda — ${fe}

**Columna:** ${col}

## Apertura

**Decisión que tiene que poder tomarse al final:**
Si ${M(enlazable(d.suposicion), '[la suposición que sostiene el plan]')} es cierto o no.

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
    'metodo/07_CIERRE.md':
`# Cierre del día

Cinco líneas al terminar la jornada. No al empezar la siguiente.

De todo el método es lo que más rinde por minuto invertido: sin esto, cada
mañana se va en reconstruir dónde te quedaste.

Si hoy decides algo que cuesta deshacer, y lo decides tarde o después de una
jornada larga, márcalo **REVISAR MAÑANA**. Y si lo que decides es NO hacer
algo, márcalo igual: las renuncias no dejan rastro y no se echan de menos.

---

Entradas nuevas arriba. Copia el bloque de abajo.

## ${fe}

**Decidí:**
**Por qué:**
**Descarté:**
**Abierto:**
**Mañana empiezo por:**
**Coste del día:**
`
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
