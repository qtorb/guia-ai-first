import { useNavigate } from 'react-router-dom';
import { plan, dondeEstoy, LLAVE_PLAN } from '../lib/plan30';
import { fechaLarga } from '../lib/protocoloAiFirst';

// Si hay avance guardado, el botón principal continúa en vez de empezar de
// cero: volver con el botón del navegador conservaba el recorrido, pero la
// portada seguía diciendo «montar el mío» como si no hubiera nada.
function pasoGuardado() {
  try {
    const d = JSON.parse(localStorage.getItem('metodo-ai-first')) || {};
    const hay = Object.keys(d).some((k) => k[0] !== '_' && String(d[k] ?? '').trim());
    return hay ? Math.min(Number(d._paso) || 1, 7) : 0;
  } catch (e) { return 0; }
}

// Port de dist/sitio/index.html (Método AI-First). Es la entrada del método:
// desde aquí se monta el tuyo (el recorrido de siete pasos), se lee el manual
// o se ve el mapa completo.
// Si el recorrido está terminado, la portada deja de recibir desde cero: dice
// por dónde vas del mes y qué toca esta semana. Lo sabe este navegador, no un
// servidor.
function situacion() {
  try {
    const d = JSON.parse(localStorage.getItem('metodo-ai-first')) || {};
    if (!d.persona && !d.cuando) return null;
    const p = plan(d);
    const aqui = dondeEstoy(p);
    if (!aqui || aqui.pasado) return null;
    let m = {};
    try { m = JSON.parse(localStorage.getItem(LLAVE_PLAN)) || {}; } catch (e) { m = {}; }
    const s = p.semanas[aqui.semana - 1];
    const hechas = [1, 2, 3, 4].filter((n) => m['s' + n]);
    return { aqui, s, hechas, cambios: Number(m.cambios || 0) };
  } catch (e) { return null; }
}

export default function MetodoPortada() {
  const navigate = useNavigate();
  const paso = pasoGuardado();
  const sit = situacion();
  // «Terminado» no es haber llegado al paso 7: es haber contestado el 6, que
  // es lo que produce la carpeta y el plan. Se puede estar en el 7 sin nada.
  const terminado = paso >= 7 && !!sit;
  return (
    <div className="pagina">
      <h1>Método AI-First</h1>

      {sit && (
        <div className="situacion">
          <p className="rotulo">Vas por aquí</p>
          {sit.hechas.length > 0 && (
            <ul className="yatienes">
              {sit.hechas.map((n) => (
                <li key={n}>Semana {n}, hecha.</li>
              ))}
            </ul>
          )}
          <h2>Día {sit.aqui.dia} de {sit.aqui.total} · esta semana sales con: {sit.s.gano}</h2>
          <p>{sit.s.como}</p>
          <p className="ayuda">Cierras el {fechaLarga(sit.s.cierre)} a las {sit.s.hora}.
            {sit.cambios > 0 && ` Llevas ${sit.cambios} ${sit.cambios === 1 ? 'cosa cambiada' : 'cosas cambiadas'} por lo que te han dicho.`}</p>
          <div className="acciones">
            <button className="btn" onClick={() => navigate('/metodo/plan')}>Ver mi plan</button>
          </div>
        </div>
      )}
      <div className="entradilla">
        <p>Un sistema de trabajo para construir con agentes de IA: quién decide qué,
          cómo se pide, qué se comprueba antes de darlo por bueno y cuándo hay que parar.</p>
      </div>

      {/* Con el recorrido terminado esta pantalla decía «Empieza por montar el
          tuyo» encima de un plan ya en marcha, y no decía en ningún sitio que
          estuviera hecho. Ahora el bloque cambia de oficio con el estado. */}
      {terminado ? (
        <>
          <h2>Tu método ya está montado</h2>
          {/* La lista de lo que puedes hacer la dicen los botones. Decirla además en
              prosa prometía volver a un paso sin que hubiera botón para hacerlo. */}
          <p>Lo escribiste en siete pasos y está en este navegador, no en un servidor
            nuestro.</p>

          {/* «Ver mi plan» ya está arriba, en el recuadro de situación: aquí
              sería el mismo botón dos veces en la misma pantalla. */}
          <div className="acciones">
            <button className="btn" onClick={() => navigate('/metodo/recorrido?paso=7')}>
              Descargar la carpeta otra vez
            </button>
            <button className="btn btn-2" onClick={() => navigate('/metodo/recorrido?paso=1')}>
              Repasar el recorrido
            </button>
            <button className="btn btn-2" onClick={() => navigate('/guia')}>Ir al manual</button>
          </div>
        </>
      ) : (
        <>
          <h2>Empieza por montar el tuyo</h2>
          <p>Quince minutos, siete pasos. Al terminar te llevas, en una carpeta, los
            ficheros de tu método escritos con tus respuestas. Si tu proyecto ya ha
            salido a la calle, además tienes los cuatro pasos para dejar esa carpeta
            en un repositorio —una carpeta tuya en internet que guarda el historial
            de todo lo que cambies.</p>
          <p>No hace falta instalar nada ni saber programar. Nada de lo que escribas
            sale de tu navegador: no hay cuentas ni contraseñas.</p>

          <div className="acciones">
            <button className="btn" onClick={() => navigate('/metodo/recorrido')}>
              {paso > 1 ? `Seguir donde lo dejé · paso ${paso} de 7` : 'Montar el mío · 15 minutos'}
            </button>
            <button className="btn btn-2" onClick={() => navigate('/guia')}>Ver el método primero</button>
          </div>
        </>
      )}
      {paso > 1 && (
        <p className="ayuda" style={{ marginTop: 'var(--e3)' }}>
          Tienes el recorrido empezado en este navegador.{' '}
          <button className="lnk" onClick={() => {
            if (!window.confirm('¿Seguro? Se borra lo que llevas escrito.')) return;
            try { localStorage.removeItem('metodo-ai-first'); } catch (e) { /* noop */ }
            navigate(0);
          }}>Empezar de cero</button>
        </p>
      )}
      <p style={{ marginTop: 'var(--e5)' }}>
        <a href="#/metodo/mapa" onClick={(e) => { e.preventDefault(); navigate('/metodo/mapa'); }}>
          Ver el mapa completo: piezas, roles, pasos y qué te llevas →
        </a>
      </p>

      <hr />

      <h2>Beta permanente</h2>
      <p>Esto no está terminado, y no lo va a estar. Lo que tienes delante es la versión de
        hoy: sale antes de estar redonda, se usa, y lo que no funciona se cambia. Un método
        que espera a estar perfecto para salir no es un método mejor: es uno que nadie ha
        probado.</p>
      <p>Vale igual para lo tuyo, y es la parte incómoda. La página que vas a hacer no tiene
        que estar bien: tiene que existir, para que alguien que no eres tú te diga qué no se
        entiende. Publicar pronto no es descuido. Es la única forma de que algo se corrija
        mientras corregirlo todavía es barato.</p>
      <p>Así que trabaja en beta permanente: versiones, no lanzamientos. Nada de esperar al
        momento bueno, que no llega. Lo que sacas hoy es peor que lo que sacarás en tres
        meses, y a la vez es lo único que hace posible lo de dentro de tres meses.</p>
    </div>
  );
}
