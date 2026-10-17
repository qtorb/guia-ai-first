import { useState } from 'react';
import { enviarSugerencia, hayNube, CORREO_OK } from '../lib/envios';

// «¿Algo se puede mejorar?». Está en el pie de todas las páginas. Se abre en
// el sitio, sin ventanas: una caja de texto, un correo opcional y enviar.
export default function Sugerencia() {
  const [abierto, setAbierto] = useState(false);
  const [texto, setTexto] = useState('');
  const [correo, setCorreo] = useState('');
  const [estado, setEstado] = useState('abierto'); // abierto · enviando · enviado · error
  const [fallo, setFallo] = useState('');
  if (!hayNube) return null;

  const correoMal = correo.trim() && !CORREO_OK.test(correo.trim());

  async function enviar(e) {
    e.preventDefault();
    if (!texto.trim() || correoMal) return;
    setEstado('enviando');
    try {
      await enviarSugerencia({ pagina: window.location.hash || '/', texto, correo });
      setEstado('enviado');
      setTexto('');
    } catch (err) {
      setFallo(/demasiadas/.test(String(err?.message)) ? 'Hay muchas sugerencias ahora mismo. Inténtalo de nuevo en unos minutos.' : 'No se pudo enviar. Inténtalo de nuevo en unos minutos.');
      setEstado('error');
    }
  }

  if (!abierto) {
    return (
      <button type="button" className="sug-abrir" onClick={() => { setAbierto(true); setEstado('abierto'); }}>
        ¿Algo se puede mejorar?
      </button>
    );
  }

  if (estado === 'enviado') {
    return (
      <div className="sug" role="status">
        <p><b>Gracias.</b> Lo leo yo.</p>
        <button type="button" className="sug-abrir" onClick={() => setAbierto(false)}>Cerrar</button>
      </div>
    );
  }

  return (
    <form className="sug" onSubmit={enviar}>
      <label htmlFor="sug-texto"><b>¿Qué mejorarías de esta web?</b></label>
      <p className="sug-n">Algo que no se entiende, que no funciona o que echas de menos. Se envía junto con la página en la que estás.</p>
      <textarea id="sug-texto" rows={3} maxLength={2000} value={texto} onChange={(e) => setTexto(e.target.value)} required />
      <label htmlFor="sug-correo">Tu correo, si quieres que te conteste <span className="sug-n">(opcional)</span></label>
      <input id="sug-correo" type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} aria-invalid={correoMal ? 'true' : undefined} aria-describedby={correoMal ? 'sug-correo-mal' : undefined} />
      {correoMal && <p className="sug-n" id="sug-correo-mal" role="alert">Revisa el correo: parece incompleto.</p>}
      {estado === 'error' && <p className="sug-n" role="alert">{fallo}</p>}
      <div className="sug-a">
        <button type="submit" className="btn btn-p" disabled={estado === 'enviando' || !texto.trim() || correoMal}>
          {estado === 'enviando' ? 'Enviando…' : 'Enviar sugerencia'}
        </button>
        <button type="button" className="btn btn-g" onClick={() => setAbierto(false)}>Cancelar</button>
      </div>
    </form>
  );
}
