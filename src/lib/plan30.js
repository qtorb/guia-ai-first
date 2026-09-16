// --------------------------------------------------------------------------
// El plan de 30 días. Toma lo que ya escribió el alumno en el recorrido
// (la conversación del paso 6 y el checkpoint del paso 4) y produce cuatro
// semanas con fechas reales, más el .ics con el texto de cada semana dentro.
//
// Regla del bloque: la barra mide evidencia, no días. Por eso el avance no
// se calcula con el calendario: lo marca el alumno cuando la prueba existe.
// --------------------------------------------------------------------------

import { fechaLarga } from './protocoloAiFirst';

export const LLAVE_PLAN = 'metodo-plan30';

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

function iso(d) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function deIso(s) {
  const m = (s || '').trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

function mas(d, n) {
  const x = new Date(d.getTime());
  x.setDate(x.getDate() + n);
  return x;
}

// Primer <dia de la semana> a partir de desde (incluido).
function proximo(desde, nombreDia) {
  const i = DIAS.indexOf((nombreDia || 'viernes').toLowerCase());
  if (i < 0) return mas(desde, 5);
  const x = new Date(desde.getTime());
  for (let k = 0; k < 8; k++) {
    if (x.getDay() === i) return x;
    x.setDate(x.getDate() + 1);
  }
  return mas(desde, 5);
}

export function partesCheckpoint(d) {
  const g = (d.checkpoint || '').match(/^(\S+) a las (\S+)$/);
  return { dia: g ? g[1] : 'viernes', hora: g ? g[2] : '09:00' };
}

// El arco entero, con fechas. Arranca hoy salvo que la conversación del
// paso 6 sea anterior: entonces manda la conversación, que es la que ya
// está en el calendario de alguien que no es él.
export function plan(d) {
  const hoyD = new Date();
  const conv = deIso(d.cuando);
  const inicio = conv && conv < hoyD ? conv : hoyD;
  const { dia, hora } = partesCheckpoint(d);
  const persona = (d.persona || '').trim();
  const pieza = (d.pieza || '').trim();

  const semanas = [0, 1, 2, 3].map((i) => {
    const desde = mas(inicio, i * 7);
    const hasta = mas(inicio, i === 3 ? 29 : i * 7 + 6);
    return {
      n: i + 1,
      desde: iso(desde),
      hasta: iso(hasta),
      cierre: iso(proximo(mas(desde, 1), dia)),
      hora,
    };
  });

  const s = semanas;
  s[0].gano = persona
    ? `Tres frases de ${persona}, tal cual las dijo.`
    : 'Tres frases literales de alguien de fuera.';
  s[0].como = persona && conv
    ? `La conversación que ya tienes puesta: ${fechaLarga(d.cuando)}${pieza ? `, con ${pieza}` : ''}. Escribe mientras te habla. Al volver, el texto 4.`
    : 'La conversación que pusiste en el calendario. Escribe mientras te hablen. Al volver, el texto 4.';
  s[0].texto = 'Cerrar la tanda';

  s[1].gano = 'Una dirección que puedes mandar por WhatsApp.';
  s[1].como = 'Antes de encargarla, escribe en tres líneas qué tiene que cumplir. Tarda un minuto y te ahorra la semana de hacer la página equivocada.';
  s[1].texto = 'Escribir el encargo';

  s[2].gano = 'Saber qué no se entiende sin ti delante.';
  s[2].como = 'Dos minutos de máquina y cinco personas de verdad. Lo que más te va a servir es dónde no coinciden.';
  s[2].texto = 'Cerrar la tanda';
  s[2].uxm = true;

  s[3].gano = 'Está publicado, y sabes qué mirar cada semana.';
  s[3].como = 'Publicas, escribes qué cambiaste por lo que te dijeron, y te dejas una comprobación que puedas hacer tú solo el mes que viene.';
  s[3].texto = 'Abrir la siguiente tanda';

  return {
    inicio: iso(inicio),
    fin: s[3].hasta,
    lanzamiento: s[3].hasta,
    checkpoint: { dia, hora },
    semanas: s,
  };
}

// Dónde está hoy dentro del arco. Devuelve null si el plan no ha empezado.
export function dondeEstoy(p) {
  const hoyD = new Date();
  const ini = deIso(p.inicio);
  if (!ini) return null;
  const dias = Math.floor((hoyD - ini) / 86400000) + 1;
  if (dias < 1) return null;
  const semana = Math.min(4, Math.max(1, Math.ceil(dias / 7)));
  return { dia: Math.min(30, dias), semana, pasado: dias > 30 };
}

// --------------------------------------------------------------------------
// El .ics. Seis eventos: los cuatro cierres de semana, la conversación y el
// día del lanzamiento. Cada uno lleva EN EL CUERPO el texto que toca esa
// semana: un evento titulado «Checkpoint» y vacío es teatro.
// --------------------------------------------------------------------------

function sinSaltos(s) {
  return (s || '').replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\;');
}

function sello(isoDia, hora) {
  const [h, m] = (hora || '09:00').split(':');
  return isoDia.replace(/-/g, '') + 'T' + (h || '09').padStart(2, '0') + (m || '00').padStart(2, '0') + '00';
}

export function ics(d, p) {
  const uid = (n) => `metodo-${p.inicio.replace(/-/g, '')}-${n}@ai-first`;
  const ev = [];

  p.semanas.forEach((s) => {
    ev.push({
      uid: uid('s' + s.n),
      dia: s.cierre,
      hora: s.hora,
      titulo: `Método · semana ${s.n}: ${s.gano}`,
      cuerpo:
        `${s.como}\n\n` +
        `Qué pegar esta semana: «${s.texto}».\n` +
        `Está en la carpeta, en textos/.\n\n` +
        (s.uxm
          ? 'Antes de enseñar la página a nadie, pásala por uxmachine.app: mide lo que declara, no lo que promete.\n\n'
          : '') +
        'Si esta semana se te ha ido, muévelo y ya está. Lo que no se mueve es el orden.',
    });
  });

  if (d.cuando && d.persona) {
    ev.push({
      uid: uid('conv'),
      dia: d.cuando,
      hora: '10:00',
      titulo: `Hablar con ${d.persona}`,
      cuerpo:
        `Llevas: ${(d.pieza || 'lo que pide tu encargo').trim()}.\n\n` +
        'Escribe mientras te habla, o grábalo con su permiso. Las frases literales solo existen si las apuntas en el momento.\n\n' +
        'Al volver, ese mismo día: el texto «Cerrar la tanda».',
    });
  }

  ev.push({
    uid: uid('fin'),
    dia: p.lanzamiento,
    hora: '10:00',
    titulo: 'Método · fuera',
    cuerpo:
      'Hoy toca que esté publicado.\n\n' +
      'Hay una página en internet que explica qué ofreces y a quién.\n' +
      'Cinco personas de ese «a quién» la han mirado.\n' +
      'Y has cambiado algo por lo que te dijeron.',
  });

  const lineas = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Metodo AI-First//ES',
    'CALSCALE:GREGORIAN',
  ];
  ev.forEach((e) => {
    lineas.push(
      'BEGIN:VEVENT',
      `UID:${e.uid}`,
      `DTSTAMP:${sello(p.inicio, '09:00')}`,
      `DTSTART:${sello(e.dia, e.hora)}`,
      `DTEND:${sello(e.dia, e.hora)}`,
      `SUMMARY:${sinSaltos(e.titulo)}`,
      `DESCRIPTION:${sinSaltos(e.cuerpo)}`,
      'END:VEVENT'
    );
  });
  lineas.push('END:VCALENDAR');
  // RFC 5545: líneas terminadas en CRLF.
  return lineas.join('\r\n') + '\r\n';
}

// El plan como fichero de la carpeta.
export function planMd(d, p) {
  const l = (s) => fechaLarga(s);
  return `# Tu mes

Del ${l(p.inicio)} al ${l(p.lanzamiento)}.

**En dos semanas tienes algo fuera. En cuatro sabes qué cambiar.**

El ${l(p.lanzamiento)}:

- Hay una página en internet que explica qué ofreces y a quién.
- Cinco personas de ese «a quién» la han mirado.
- Y has cambiado algo por lo que te dijeron.

No es tener la empresa montada. No es facturar. Es que lo que hoy está en tu
cabeza y en un documento, dentro de un mes esté fuera, lo haya visto gente de
verdad, y tú sepas algo que hoy no sabes.

---

${p.semanas.map((s) => `## Semana ${s.n} · ${l(s.desde)} – ${l(s.hasta)}

**Sales con:** ${s.gano}

${s.como}

Texto que pegas esta semana: **${s.texto}** (en \`textos/\`).
Cierras el ${l(s.cierre)} a las ${s.hora}.
`).join('\n')}
---

Las fechas son tuyas y se mueven. La conversación de la semana 1, no: esa se
reserva con antelación o no ocurre, y es la única pieza de todo esto que no se
puede sustituir por nada.
`;
}

// --------------------------------------------------------------------------
// El LEEME de la raíz. Es lo primero que se ve al abrir el zip, y hasta ahora
// lo primero que se veía eran ficheros sueltos sin orden. Va escrito con sus
// datos: la conversación que tiene puesta, la pieza que lleva, sus fechas.
// --------------------------------------------------------------------------
export function leemeMd(d, p) {
  const l = (s) => fechaLarga(s);
  const persona = (d.persona || '').trim();
  const pieza = (d.pieza || '').trim();
  const cita = persona && d.cuando
    ? `**${l(d.cuando)} hablas con ${persona}.** Llevas ${pieza || 'lo que pide tu encargo'}.`
    : '**Tu primera conversación con alguien de fuera.** Ponle día y hora si todavía no lo has hecho.';

  return `# Empieza por aquí

Esto es tu método. No hay nada que instalar y no hace falta leérselo entero.

---

## Lo primero que va a pasar

${cita}

Escribe mientras te habla, o grábalo con su permiso. Las frases literales solo
existen si las apuntas en el momento: luego te acuerdas de lo que te gustó, no
de lo que dijeron.

Lo que le enseñas ya lo tienes escrito: está en \`metodo/encargos/primera-tanda.md\`.
Ese fichero se pega entero en una conversación nueva con la IA que uses.

---

## Al volver de esa conversación

Abres un chat nuevo, adjuntas \`metodo/00_VALOR.md\`, \`metodo/03_HIPOTESIS.md\`,
el encargo y tus notas, y pegas \`textos/4_cerrar_la_tanda.md\`.

Sales de ahí con tres frases suyas, una decisión —sigue, cambia o se cae— y la
siguiente tanda ya empezada. Es el rato más valioso del mes.

---

## Tu mes

Está en \`PLAN.md\`, con las fechas. En corto:

| | |
|---|---|
| Semana 1 | Tres frases de alguien de fuera, tal cual las dijo |
| Semana 2 | Una dirección que puedas mandar por WhatsApp |
| Semana 3 | Saber qué no se entiende sin ti delante |
| Semana 4 | Publicado, y escrito qué cambiaste |

El ${l(p.lanzamiento)} deberías tener: una página en internet que explica qué
ofreces y a quién, cinco personas de ese «a quién» que la han mirado, y algo que
has cambiado por lo que te dijeron.

Las fechas están también en \`metodo-30-dias.ics\`: lo abres y tu calendario las
añade. Cada evento lleva dentro el texto que toca esa semana.

---

## Qué hay en cada sitio

\`metodo/\` — tus ficheros. Para quién es esto, quién decide qué, lo que no se
toca, lo que supones y todavía no sabes, y dónde te quedaste.

\`metodo/encargos/\` — lo que le vas pidiendo a una IA. El primero ya está escrito.

\`metodo/activos/\` — **lo que te entreguen, con la fecha en el nombre.** Se olvida
siempre y luego no puedes saber por qué algo quedó como quedó.

\`textos/\` — los cuatro textos que se pegan en cualquier chat. Empieza por su
\`LEEME.md\`: dice cuál usar en cada momento.

\`PLAN.md\` y \`metodo-30-dias.ics\` — tu mes.

---

## Tres cosas que conviene saber

**Deja la carpeta en un sitio que se sincronice** —Drive, Dropbox, iCloud— y que
no sea un chat. Nada de esto vive en ninguna web: es tuyo y está en tu disco.

**Para revisar, abre conversación nueva.** Quien construye no puede ser quien
revisa, y eso vale también para una IA: en el mismo chat va a defender lo que
acaba de hacer.

**Si tu IA te da la razón en todo a la primera, no te está ayudando.** Los cuatro
textos le piden explícitamente que te diga qué es lo más flojo. Eso es lo que no
vas a conseguir pidiéndole las cosas de la forma normal.
`;
}
