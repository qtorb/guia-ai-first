import { useEffect, useState } from 'react';
import { enviarAtasco } from '../../lib/panel';
import { hayNube } from '../../lib/nube';

// «Me he atascado aquí». Voluntario, con una línea opcional, y sin identidad:
// se guarda la hoja, el paso y la frase. Lo dice el propio panel y lo dice la
// página de privacidad; por eso no se envía ni el usuario ni nada de la hoja.

export function AtascoEnlace({ onAbrir }) {
  if (!hayNube) return <span />;
  return <button type="button" className="atasco-link" onClick={onAbrir}>Necesito ayuda con este paso</button>;
}

export function AtascoHoja({ hoja, paso, onCerrar }) {
  const [frase, setFrase] = useState('');
  const [estado, setEstado] = useState('abierto'); // abierto · enviando · enviado · error

  useEffect(() => {
    if (estado !== 'enviado') return undefined;
    const t = setTimeout(onCerrar, 3000);
    return () => clearTimeout(t);
  }, [estado, onCerrar]);

  async function enviar(e) {
    e.preventDefault();
    setEstado('enviando');
    try {
      await enviarAtasco(hoja, paso, frase);
      setEstado('enviado');
    } catch (err) {
      setEstado('error');
    }
  }

  if (estado === 'enviado') {
    return (
      <div className="atasco" role="status">
        <p className="atasco-ok">Gracias. Lo leo yo.</p>
        <p className="atasco-nota">Tu hoja sigue donde la dejaste.</p>
      </div>
    );
  }

  return (
    <form className="atasco" onSubmit={enviar}>
      <label htmlFor="atasco-frase"><b>¿Qué te ha detenido?</b> <span className="atasco-nota">(opcional)</span></label>
      <input
        id="atasco-frase"
        value={frase}
        maxLength={280}
        placeholder="Con una línea es suficiente"
        onChange={(e) => setFrase(e.target.value)}
      />
      <p className="atasco-nota">Guardamos el nombre de la hoja, el paso y esta frase. No guardamos tu nombre ni tu cuenta.</p>
      {estado === 'error' && <p className="atasco-nota" role="alert">No se pudo enviar. Inténtalo de nuevo en unos minutos.</p>}
      <div className="atasco-acts">
        <button type="submit" className="btn btn-p" disabled={estado === 'enviando'}>{estado === 'enviando' ? 'Enviando…' : 'Enviar'}</button>
        <button type="button" className="btn btn-g" onClick={onCerrar}>Cerrar</button>
      </div>
    </form>
  );
}
