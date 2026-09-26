import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { darseDeBaja } from '../lib/avisos';

// El enlace de baja de los correos del mes. Funciona sin sesión: el token del
// enlace es la llave, y no dice de quién es.
export default function Baja() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const t = params.get('t') || '';
  const [estado, setEstado] = useState('esperando');   // esperando · hecho · no
  const llamado = useRef(false);

  useEffect(() => {
    if (llamado.current) return;
    llamado.current = true;
    darseDeBaja(t)
      .then((ok) => setEstado(ok === true ? 'hecho' : 'no'))
      .catch(() => setEstado('no'));
  }, [t]);

  return (
    <div className="pagina">
      <p className="rotulo">Los avisos de tu mes</p>
      {estado === 'esperando' && <p>Un momento…</p>}
      {estado === 'hecho' && (
        <>
          <h1>Hecho.</h1>
          <p>No te vuelvo a escribir. Si algún día quieres los avisos otra vez, están en la página de tu plan.</p>
          <button className="btn" onClick={() => navigate('/metodo/plan')}>Ir a mi plan</button>
        </>
      )}
      {estado === 'no' && (
        <>
          <h1>Ese enlace no me sirve.</h1>
          <p>Puede que ya te hubieras dado de baja. Si te sigue llegando algo, escríbeme a albert@qtorb.com y lo paro yo.</p>
        </>
      )}
    </div>
  );
}
