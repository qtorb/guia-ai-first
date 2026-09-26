import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { darseDeBaja } from '../lib/avisos';

// El enlace de baja de los correos del mes. Funciona sin sesión: el token del
// enlace es la llave, y no dice de quién es.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function Baja() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const t = params.get('t') || '';
  // Un enlace sin forma de token no se consulta: se sabe ya que no sirve.
  const valido = UUID.test(t);
  const [estado, setEstado] = useState(valido ? 'esperando' : 'no');   // esperando · hecho · no · error
  const llamado = useRef(false);

  useEffect(() => {
    if (!valido || llamado.current) return;
    llamado.current = true;
    darseDeBaja(t)
      .then((ok) => setEstado(ok === true ? 'hecho' : 'no'))
      .catch(() => setEstado('error'));
  }, [t, valido]);

  return (
    <div className="pagina">
      <p className="rotulo">Los avisos de tu método</p>
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
          <p>Puede que ya te hubieras dado de baja. Si te sigue llegando algo, escríbeme a <a href="mailto:albert@qtorb.com">albert@qtorb.com</a> y lo paro yo.</p>
        </>
      )}
      {estado === 'error' && (
        <>
          <h1>No he podido comprobarlo.</h1>
          <p>Parece un problema de conexión, no de tu enlace. Vuelve a abrirlo dentro de un momento.</p>
        </>
      )}
    </div>
  );
}
