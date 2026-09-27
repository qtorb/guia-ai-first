import { useEffect, useState } from 'react';
import { useToast } from './Toast';
import { fechaLarga } from '../lib/protocoloAiFirst';
import { programar, parar, leerAviso, pausar, reanudar } from '../lib/avisos';

// «Que te escriba»: la casilla que pide los avisos de tu mes. Sin plan no
// hay fechas que avisar, y sin cuenta no hay a quién escribir.
function leerMetodo() {
  try { return JSON.parse(localStorage.getItem('metodo-ai-first')) || {}; } catch { return {}; }
}

export default function AvisosMes({ n }) {
  const toast = useToast();
  const [d] = useState(leerMetodo);
  const [activo, setActivo] = useState(false);
  const [pausaHasta, setPausaHasta] = useState(null);
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
      .then(({ activo: a, pausaHasta: p }) => {
        if (!vivo) return;
        setActivo(a);
        setPausaHasta(p);
        if (a) programar(d).catch(() => {});
      })
      .catch(() => {});
    return () => { vivo = false; };
  }, [hayPlan, dentro, d]);

  if (!n?.hay || !hayPlan) return null;

  // Mientras se guarda no se desactiva la casilla —el foco se perdería—:
  // simplemente no hace nada, y la etiqueta avisa de que está ocupada.
  async function cambiar(marcar) {
    if (ocupado) return;
    const antes = activo;
    setActivo(marcar);
    setOcupado(true);
    try {
      if (marcar) {
        await programar(d);
        toast('Hecho: te escribo cada semana, el día de tu checkpoint');
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

  async function pausarAvisos() {
    if (ocupado) return;
    setOcupado(true);
    try {
      const fecha = await pausar();
      setPausaHasta(fecha);
      toast(`Hecho: no te escribo hasta el ${fechaLarga(String(fecha || '').slice(0, 10))}`);
    } catch {
      toast('No he podido guardarlo. Inténtalo otra vez en un momento.');
    } finally {
      setOcupado(false);
    }
  }

  async function reanudarAvisos() {
    if (ocupado) return;
    setOcupado(true);
    try {
      await reanudar();
      setPausaHasta(null);
      toast('Hecho: vuelvo a escribirte');
    } catch {
      toast('No he podido guardarlo. Inténtalo otra vez en un momento.');
    } finally {
      setOcupado(false);
    }
  }

  const enPausa = pausaHasta && new Date(pausaHasta) > new Date();

  return (
    <div className="aviso">
      <p className="rotulo">Que te escriba</p>
      {!dentro ? (
        <p>Si entras con tu cuenta —arriba a la derecha—, te escribo cada semana el día de tu checkpoint, a su hora: el primer mes con lo que toca esa semana y, después, con las cuatro preguntas. Sin fecha de fin, hasta que me digas que pare.</p>
      ) : (
        <>
          <label className="chk" aria-busy={ocupado ? 'true' : undefined}>
            <input
              type="checkbox"
              className="c"
              checked={activo}
              onChange={(e) => cambiar(e.target.checked)}
            />
            <span>Escríbeme cada semana, el día y a la hora de mi checkpoint.</span>
          </label>
          <p className="ayuda">Te llegan a {n.usuario?.email || ''}. Llevan el texto de cada semana y un enlace. Puedes pausarlos dos semanas o darte de baja desde cualquiera de los correos, o desmarcando esto.</p>
          {activo && (
            enPausa ? (
              <p className="ayuda">En pausa hasta el {fechaLarga(String(pausaHasta).slice(0, 10))}. {' '}
                <button className="lnk" onClick={reanudarAvisos}>Reanudar</button></p>
            ) : (
              <p className="ayuda">Te escribo cada semana, el día de tu checkpoint. {' '}
                <button className="lnk" onClick={pausarAvisos}>Pausar dos semanas</button></p>
            )
          )}
        </>
      )}
    </div>
  );
}
