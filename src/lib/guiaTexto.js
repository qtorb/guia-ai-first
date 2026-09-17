import manual from '../data/manual.json';

// El manual entero en texto plano, para pegárselo de una vez al asistente.
// El paso 0 de la hoja lleva desde el principio la instrucción «pégale la
// guía entera» y no había forma de copiarla: esto es esa forma.
function aTexto(html) {
  return String(html || '')
    .replace(/<\/(p|li|h[1-6]|blockquote|pre|tr)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<li[^>]*>/gi, '· ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function guiaEntera() {
  const caps = manual.capitulos || {};
  const orden = [];
  (manual.grupos || []).forEach((g) => (g.entradas || []).forEach((e) => {
    if (caps[e.ident] && !orden.includes(e.ident)) orden.push(e.ident);
  }));
  Object.keys(caps).forEach((k) => { if (!orden.includes(k)) orden.push(k); });

  const partes = orden.map((k) => {
    const c = caps[k];
    const cab = [c.num, c.titulo].filter(Boolean).join(' · ');
    return cab + '\n' + '─'.repeat(Math.min(58, cab.length + 6)) + '\n' + aTexto(c.html);
  });
  return 'GUÍA AI-FIRST\n' + '='.repeat(58) + '\n\n' + partes.join('\n\n\n') + '\n';
}
