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

function claves(linea) {
  return (linea.match(/\{(\w+)\}/g) || []).map((x) => x.slice(1, -1));
}

// Genera el texto final del protocolo — mismo algoritmo que generar()
// L2919-2947, sin efectos secundarios de DOM (el llamador decide qué hacer
// con el texto resultante: pintarlo, guardarlo, descargarlo).
export function generarProtocolo(hoja, datos, checkKeys, nombre, kicker) {
  const L = '─'.repeat(58);
  let t = 'MI PROTOCOLO DE IA\n' + (nombre.trim() ? nombre.trim() + ' · ' : '') +
    (kicker || '') + '\n' + L + '\n\n';

  const secs = [...(hoja.bloques || []), hoja.contraste].filter(Boolean);
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

  t += (hoja.salida?.cierre || []).join('\n') + '\n';
  t = t.replace(/\n{4,}/g, '\n\n\n');
  return t;
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
