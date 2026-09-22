import { useEffect, useRef, useState } from 'react';
import { entrarCon, entrarPorCorreo } from '../lib/nube';

// El botón de la barra y su panel. Tres puertas, y las tres a la vez en las
// dos mitades del sitio: la Guía AI-First se recorre por web, por skills y
// por repositorio, así que GitHub no es de una mitad ni de un público — es
// de la propia guía. Google para quien no vive en GitHub, y enlace por
// correo para quien no quiere ninguna de las dos.
export default function Cuenta({ n }) {
  const [abierto, setAbierto] = useState(false);
  const [correo, setCorreo] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [fallo, setFallo] = useState(null);
  const caja = useRef(null);

  useEffect(() => {
    if (!abierto) return undefined;
    const fuera = (e) => { if (caja.current && !caja.current.contains(e.target)) setAbierto(false); };
    const esc = (e) => { if (e.key === 'Escape') setAbierto(false); };
    document.addEventListener('mousedown', fuera);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', fuera); document.removeEventListener('keydown', esc); };
  }, [abierto]);

  const dentro = !!n.usuario;
  const quien = n.usuario?.email || n.usuario?.user_metadata?.name || '';
  const inicial = (quien.trim()[0] || '?').toUpperCase();

  async function prueba(fn) {
    setFallo(null);
    try { await fn(); } catch (e) { setFallo(e.message || String(e)); }
  }

  return (
    <div className="cta" ref={caja}>
      <button
        className={'ctab' + (dentro ? ' dentro' : '')}
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        aria-label={dentro ? `Tu cuenta (${quien})` : 'Entrar para sincronizar'}
        title={dentro ? quien : 'Entrar para sincronizar'}
      >
        {dentro ? <span className="ctai" aria-hidden="true">{inicial}</span> : 'Entrar'}
      </button>

      {abierto && (
        <div className="ctap" role="dialog" aria-label="Tu cuenta">
          {!dentro ? (
            <>
              <h3>De borrador a guardado</h3>
              <p className="ctaq">
                Ahora mismo trabajas en <b>borrador</b>: lo que escribes vive en este navegador y no
                sale de aquí. Entrando queda <b>guardado</b>, y aparece también en tu móvil o en el
                ordenador de casa. <b>No hace falta para nada más:</b> las hojas funcionan igual sin
                entrar.
              </p>
              {/* El correo va primero, y no por orden alfabético. Es la única de
                  las tres puertas que se puede dejar entera con el dominio y el
                  diseño del sitio: el correo sale de guia.qtorb.com. Google y
                  GitHub enseñan por el camino la dirección larga del servidor de
                  autenticación, y eso no se puede cambiar sin pagar un dominio
                  propio de Supabase — Google solo pinta el nombre y el logo de
                  una app cuando ha pasado verificación de marca, y esa exige
                  verificar todos los dominios autorizados, incluido uno que no
                  es nuestro. */}
              {enviado ? (
                <p className="ctaok">Te he mandado un enlace a <b>{correo}</b>. Ábrelo desde este mismo dispositivo.</p>
              ) : (
                <form
                  className="ctaf"
                  onSubmit={(e) => {
                    e.preventDefault();
                    prueba(async () => { await entrarPorCorreo(correo.trim()); setEnviado(true); });
                  }}
                >
                  <label className="sr-only" htmlFor="ctacorreo">Tu correo</label>
                  <input
                    id="ctacorreo" type="email" required placeholder="tu@correo.com"
                    value={correo} onChange={(e) => setCorreo(e.target.value)}
                  />
                  <button className="btn btn-p" type="submit">Enviar enlace</button>
                </form>
              )}
              <div className="ctasep"><span>o con un botón</span></div>
              <div className="ctab3">
                <button className="ayb" onClick={() => prueba(() => entrarCon('google'))}>Entrar con Google</button>
                <button className="ayb" onClick={() => prueba(() => entrarCon('github'))}>Entrar con GitHub</button>
              </div>
              {/* Avisar de la dirección rara no la arregla, pero quita el
                  desconcierto — que es la mitad del problema. */}
              <p className="ctaav">Estos dos te llevan un momento a una dirección larga acabada en
                <b> supabase.co</b>. Es el servidor que guarda tu avance; es normal.</p>
              <p className="ctan">
                Se guarda lo que escribes en las hojas y tu correo, nada más. Puedes borrarlo todo
                desde aquí cuando quieras.
              </p>
            </>
          ) : (
            <>
              <h3>{quien}</h3>
              {n.conflicto ? (
                <>
                  <p className="ctaq">
                    <b>Hay dos versiones y no sé cuál es la buena.</b> En tu cuenta hay trabajo
                    guardado, y en este navegador también, y no son el mismo. Elige tú —lo que no
                    elijas se pierde.
                  </p>
                  <div className="ctab3">
                    <button className="ayb" onClick={() => n.resolver('local')}>Quedarme con lo de este navegador</button>
                    <button className="ayb" onClick={() => n.resolver('nube')}>Traer lo de mi cuenta</button>
                  </div>
                </>
              ) : (
                <p className="ctaq">
                  Lo que escribes se guarda en tu cuenta según lo escribes. Entra con la misma cuenta
                  en otro dispositivo y lo tendrás allí.
                </p>
              )}
              {n.error && <p className="ctaerr">{n.error}</p>}
              <div className="ctab3">
                <button className="ayb" onClick={n.salir}>Salir</button>
                <button
                  className="ayb"
                  onClick={() => {
                    if (window.confirm('Se borra lo guardado en tu cuenta Y lo de este navegador. No se puede deshacer.')) n.borrarTodo();
                  }}
                >
                  Borrar mis datos
                </button>
              </div>
              <p className="ctan">
                Salir no borra nada de este navegador. «Borrar mis datos» sí: se lleva las dos copias.
              </p>
            </>
          )}
          {fallo && <p className="ctaerr">{fallo}</p>}
        </div>
      )}
    </div>
  );
}
