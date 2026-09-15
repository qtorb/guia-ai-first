// Port literal de esc()/inline() de guia-ai-first-src/index.html:2644-2652.
// Devuelve HTML (no JSX) para usar con dangerouslySetInnerHTML en los
// textos cortos de las hojas (que, cicatriz, aviso, check, ejemplo...).
// Los enlaces internos [t](#id) se resuelven en runtime a un data-attr que
// un listener delegado convierte en navegación — ver <TextoInline/>.

export function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function inline(t) {
  return esc(t)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[\s(«—])\*([^*]+)\*/g, '$1<em>$2</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(#([^)]+)\)/g, '<a class="ai" href="#$2" data-ir="$2">$1</a>')
    .replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
}
