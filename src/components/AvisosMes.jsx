import { useEffect, useState } from 'react';
import { useToast } from './Toast';
import { programar, parar, leerAviso } from '../lib/avisos';

// «Que te escriba»: la casilla que pide los avisos de tu mes. Sin plan no
// hay fechas que avisar, y sin cuenta no hay a quién escribir.
function leerMetodo() {
  try { return JSON.parse(localStorage.getItem('metodo-ai-first')) || {}; } catch { return {}; }
}

export default function AvisosMes({ n }) {
  const toast = useToast();
  const [d] = useState(leerMetodo);
  const [activo, setActivo] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const hayPlan = !!(d.persona || '').trim() && !!(d.cuando || '').trim();
  const dentro = n?.estado === 'dentro';

  // Al entrar, la casilla dice lo que hay en la base. Y si está activa se
  // vuelven a mandar las fechas: el plan se recalcula hasta que pasa la
  // conversación.
  useEffect(() => {
    if (!hayPlan || !dentro) return undefined;
    let vivo = true;
    leerAviso()
      .then(({ activo: a }) => {
        if (!vivo) return;
        setActivo(a);
        if (a) programar(d).catch(() => {});
      })
      .catch(() => {});
    return () => { vivo = false; };
  }, [hayPlan, dentro, d]);

  if (!n?.hay || !hayPlan) return null;

  async function cambiar(marcar) {
    const antes = activo;
    setActivo(marcar);
    setOcupado(true);
    try {
      if (marcar) {
        await programar(d);
        toast('Hecho: te escribo el día que cierra cada semana');
      } else {
        await parar();
        toast('No te escribo más');
      }
    } catch {
      setActivo(antes);
      toast('No he podido guardarlo. Inténtalo otra vez en un momento.');
    } finally {
      setOcupado(false);
    }
  }

  return (
    <div className="aviso">
      <p className="rotulo">Que te escriba</p>
      {!dentro ? (
        <p>Si entras con tu cuenta —arriba a la derecha—, te escribo el día que cierra cada semana de tu plan, a la hora de tu checkpoint, con lo que toca esa semana. Y después, una vez al mes.</p>
      ) : (
        <>
          <label className="chk">
            <input
              type="checkbox"
              className="c"
              checked={activo}
              disabled={ocupado}
              onChange={(e) => cambiar(e.target.checked)}
            />
            <span>Escríbeme el día que cierra cada semana, a la hora de mi checkpoint, y después una vez al mes.</span>
          </label>
          <p className="ayuda">Te llegan a {n.usuario?.email || ''}. No llevan nada de lo que has escrito: el texto de cada semana y un enlace a tu plan. Te das de baja desmarcando esto o desde cualquiera de los correos.</p>
        </>
      )}
    </div>
  );
}
