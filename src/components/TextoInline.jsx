import { useNavigate } from 'react-router-dom';
import { inline, esc } from '../lib/inline';

// Renderiza texto con el mini-markdown de inline() (negrita/cursiva/code/
// enlaces). Los enlaces internos [t](#id) se interceptan para navegar con
// React Router en vez de recargar la página.
export default function TextoInline({ texto, as: Tag = 'p', className, escapeOnly = false }) {
  const navigate = useNavigate();
  const html = escapeOnly ? esc(texto) : inline(texto || '');

  function onClick(e) {
    const a = e.target.closest('[data-ir]');
    if (!a) return;
    e.preventDefault();
    navigate('/guia/' + a.getAttribute('data-ir'));
  }

  return (
    <Tag className={className} onClick={onClick} dangerouslySetInnerHTML={{ __html: html }} />
  );
}
