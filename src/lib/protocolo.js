// Port de guia-ai-first-src/index.html: val/tiene/esCheck/claves (L2911-2917)
// y generar() (L2919-2947). En vanilla JS estas funciones leían el DOM
// (document.querySelector('[data-k=...]')); aquí leen el objeto `datos` de
// estado de React, con `checkKeys` diciendo qué claves son checkboxes
// (porque un checkbox sin marcar y un campo de texto vacío se tratan
// distinto: tiene() de un checkbox marcado es true aunque val() daría 'x'
// en vez de un valor de usuario).

export function recolectarCheckKeys(hoja) {
  const set = new Set();
  const visitarGrupos = (grupos) => {
    (grupos || []).forEach((g) => {
      if (g.tipo === 'checks') {
        (g.campos || []).forEach((c) => set.add(c.k));
      }
    });
  };
  (hoja.bloques || []).forEach((b) => visitarGrupos(b.grupos));
  (hoja.apertura ? [hoja.apertura] : []).forEach((b) => visitarGrupos(b.grupos));
  if (hoja.contraste) visitarGrupos(hoja.contraste.grupos);
  return set;
}

function val(datos, checkKeys, k) {
  if (!(k in datos)) return '';
  if (checkKeys.has(k)) return datos[k] ? 'x' : ' ';
  return String(datos[k] ?? '').trim();
}

function tiene(datos, checkKeys, k) {
  if (!(k in datos)) return false;
  if (checkKeys.has(k)) return !!datos[k];
  return String(datos[k] ?? '').trim().length > 0;
}

// Un bloque cuenta como escrito cuando alguna de las claves de su
// plantilla tiene algo. Es el mismo criterio que usa generarProtocolo()
// para decidir si imprime la sección, así que la puerta y el fichero no
// pueden discrepar: lo que la puerta dice que falta es exactamente lo que
// el fichero no diría.
// El contraste entra en la cuenta: es un paso más de la hoja, imprime su
// propia sección del fichero y hasta hoy la puerta lo ignoraba — se podía
// entregar sin haberlo mirado y la puerta decía que estaba todo.
// `parte` acota a 1A o 1B cuando la hoja tiene dos piezas: cada una genera su
// documento y cada puerta mira sólo lo suyo.
function deLaParte(b, parte) {
  return !parte || !b.parte || b.parte === parte;
}

export function seccionesConPlantilla(hoja, parte) {
  return [...(hoja.bloques || []), hoja.contraste]
    .filter(Boolean)
    .filter((b) => b.plantilla && deLaParte(b, parte));
}

export function bloquesSinEscribir(hoja, datos, checkKeys, parte) {
  return seccionesConPlantilla(hoja, parte).filter((b) => {
    const ks = b.plantilla.flatMap(claves);
    return !ks.some((k) => tiene(datos, checkKeys, k));
  });
}

export function dudasApuntadas(hoja, datos, parte) {
  return (hoja.bloques || [])
    .filter((b) => deLaParte(b, parte) && typeof datos['duda' + b.n] === 'string')
    .map((b) => ({ n: b.n, titulo: b.titulo, txt: String(datos['duda' + b.n]).trim() }));
}

function claves(linea) {
  return (linea.match(/\{(\w+)\}/g) || []).map((x) => x.slice(1, -1));
}

// Genera el texto final del protocolo — mismo algoritmo que generar()
// L2919-2947, sin efectos secundarios de DOM (el llamador decide qué hacer
// con el texto resultante: pintarlo, guardarlo, descargarlo).
export function generarProtocolo(hoja, datos, checkKeys, nombre, kicker, salida) {
  const L = '─'.repeat(58);
  const parte = salida?.parte;
  // El título del documento era literal —'MI PROTOCOLO DE IA'— en todas las
  // hojas. La hoja 0 salía titulada como el protocolo, y la del TFM también.
  const cabecera = (salida?.doc || hoja.doc || hoja.titulo || 'Mi hoja').toUpperCase();
  // La fecha, porque el sentido de la pieza 1B es poder compararla en junio
  // con lo que se pensaba el día que se escribió.
  const hoy = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  let t = cabecera + '\n' + (nombre.trim() ? nombre.trim() + ' · ' : '') +
    (kicker || '') + '\nEscrito el ' + hoy + '\n' + L + '\n\n';

  // La apertura entra en el documento pero NO en la puerta: son dos preguntas
  // de arranque, no un bloque que se pueda «dejar sin hacer». Y sólo en 1A,
  // que es la pieza que abre la sesión.
  // Una salida puede traer su propia plantilla. La hoja del encargo la usa:
  // sus cinco bloques se escriben en orden de aprendizaje, pero el documento
  // sale en el orden de la plantilla, que es otro.
  const secs = salida?.plantilla
    ? [{ plantilla: salida.plantilla }]
    : [
      (!parte || parte === '1A') ? hoja.apertura : null,
      ...(hoja.bloques || []).filter((b) => deLaParte(b, parte)),
      (!parte || !hoja.contraste) ? hoja.contraste : null,
    ].filter(Boolean);
  secs.forEach((b) => {
    if (!b.plantilla) return;
    const todas = b.plantilla.flatMap(claves);
    if (!todas.some((k) => tiene(datos, checkKeys, k))) return;

    const grupos = [];
    let g = [];
    b.plantilla.forEach((l) => {
      if (l.trim() === '') { grupos.push(g); g = []; } else g.push(l);
    });
    grupos.push(g);

    const lineas = [];
    grupos.forEach((grupo) => {
      const ks = grupo.flatMap(claves);
      if (ks.length && !ks.some((k) => tiene(datos, checkKeys, k)) && !ks.every((k) => checkKeys.has(k))) return;
      if (lineas.length) lineas.push('');
      grupo.forEach((l) => lineas.push(
        l.replace(/\{(\w+)\}/g, (_, k) => (checkKeys.has(k) ? val(datos, checkKeys, k) : (tiene(datos, checkKeys, k) ? val(datos, checkKeys, k) : '[pendiente]')))
      ));
    });
    while (lineas.length && !lineas[lineas.length - 1].trim()) lineas.pop();
    t += lineas.join('\n') + '\n\n' + L + '\n\n';
  });

  const dudas = dudasApuntadas(hoja, datos, parte);
  if (dudas.length) {
    t += 'LO QUE TODAVÍA NO ENTIENDO\n\n';
    dudas.forEach((d) => {
      t += '  Bloque ' + (+d.n) + ' · ' + d.titulo + '\n';
      if (d.txt) t += '     ' + d.txt + '\n';
    });
    t += '\n' + L + '\n\n';
  }

  t += ((salida || hoja.salida)?.cierre || []).join('\n') + '\n';
  t = t.replace(/\n{4,}/g, '\n\n\n');
  return t;
}

// El mismo texto que el documento, sin cabecera ni cierre: es lo que se pinta
// en el panel lateral mientras el alumno lo va escribiendo.
export function cuerpoDeSalida(hoja, datos, checkKeys, salida) {
  if (!salida?.plantilla) return '';
  const grupos = [];
  let g = [];
  salida.plantilla.forEach((l) => {
    if (l.trim() === '') { grupos.push(g); g = []; } else g.push(l);
  });
  grupos.push(g);
  const lineas = [];
  grupos.forEach((grupo) => {
    if (lineas.length) lineas.push('');
    grupo.forEach((l) => lineas.push(
      l.replace(/\{(\w+)\}/g, (_, k) => (tiene(datos, checkKeys, k) ? val(datos, checkKeys, k) : '…'))
    ));
  });
  return lineas.join('\n');
}

export function algoRellenado(datos, checkKeys, nombre, paso) {
  const hayCampo = Object.keys(datos).some((k) => {
    if (checkKeys.has(k)) return !!datos[k];
    return String(datos[k] ?? '').trim().length > 0;
  });
  return hayCampo || (nombre || '').trim().length > 0 || paso > 1;
}

export function slug(s) {
  return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50);
}
