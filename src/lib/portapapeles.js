// Port de bajar()/alPortapapeles() de guia-ai-first-src/index.html:3081-3111.
// Se omite la rama SAVER (integración nativa fuera de alcance aquí: no forma
// parte de lo que se sirve en GitHub Pages).

export function bajar(txt, nombre, tipo) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([txt], { type: tipo }));
  a.download = nombre;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

export function alPortapapeles(txt) {
  if (!txt || !txt.trim()) return Promise.reject();
  const viejo = () => new Promise((ok, no) => {
    const t = document.createElement('textarea');
    t.value = txt;
    t.setAttribute('readonly', '');
    t.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0';
    document.body.appendChild(t);
    t.select();
    t.setSelectionRange(0, txt.length);
    let hecho = false;
    try { hecho = document.execCommand('copy'); } catch (e) { hecho = false; }
    document.body.removeChild(t);
    hecho ? ok() : no();
  });
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(txt).catch(viejo);
  }
  return viejo();
}
