import { Link, useParams } from 'react-router-dom';
import manual from '../data/manual.json';
import { alPortapapeles } from '../lib/portapapeles';
import { useToast } from '../components/Toast';

// Port de pagina_capitulo() — herramientas/sitio.py:2152-2176.
export default function GuiaCapitulo() {
  const { ident } = useParams();
  const cap = manual.capitulos[ident];
  const toast = useToast();

  if (!cap) {
    return (
      <div className="wrap">
        <p>No existe ese capítulo.</p>
        <Link className="btn btn-2" to="/guia">Volver al método</Link>
      </div>
    );
  }

  function onClickCuerpo(e) {
    const btn = e.target.closest('.copiar');
    if (!btn) return;
    const pre = btn.closest('.copiable')?.querySelector('pre');
    if (!pre) return;
    alPortapapeles(pre.textContent).then(() => toast('Copiado al portapapeles'))
      .catch(() => toast('Selecciónalo a mano y cópialo con Ctrl+C'));
  }

  return (
    <div className="wrap">
      <p className="rotulo">
        <Link to="/guia">El método</Link>
        {cap.num ? ` · ${cap.num}` : ''} · {cap.titulo}
      </p>
      <h1>{cap.resuelve}</h1>
      <div onClick={onClickCuerpo} dangerouslySetInnerHTML={{ __html: cap.html }} />
      <div className="acciones">
        {cap.anterior && <Link className="btn btn-2" to={`/guia/${cap.anterior}`}>Anterior</Link>}
        {cap.siguiente && <Link className="btn btn-2" to={`/guia/${cap.siguiente}`}>Siguiente</Link>}
        <Link className="btn btn-2" to="/guia">Todo el método</Link>
      </div>
    </div>
  );
}
