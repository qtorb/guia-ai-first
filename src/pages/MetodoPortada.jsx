import { useNavigate } from 'react-router-dom';
import { plan, dondeEstoy, partesCheckpoint, LLAVE_PLAN } from '../lib/plan30';
import { fechaLarga } from '../lib/protocoloAiFirst';
import { contador } from '../lib/checkpoint';

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
// por dónde vas del mes y qué toca esta semana. Después del mes, dice que
// toca el checkpoint. Lo sabe este navegador, no un servidor.
function situacion() {
  try {
    const d = JSON.parse(localStorage.getItem('metodo-ai-first')) || {};
    if (!d.persona && !d.cuando) return null;
    const p = plan(d);
    const aqui = dondeEstoy(p);
    if (!aqui) return null;
    let m = {};
    try { m = JSON.parse(localStorage.getItem(LLAVE_PLAN)) || {}; } catch (e) { m = {}; }
    const s = p.semanas[aqui.semana - 1];
    const hechas = [1, 2, 3, 4].filter((n) => m['s' + n]);
    return {
      aqui, s, hechas, cambios: Number(m.cambios || 0),
      pasado: aqui.pasado, checkpoint: partesCheckpoint(d),
    };
  } catch (e) { return null; }
}

export default function MetodoPortada() {
  const navigate = useNavigate();
  const paso = pasoGuardado();
  const sit = situacion();
  // «Terminado» no es haber llegado al paso 7: es haber contestado el 6, que
  // es lo que produce la carpeta y el plan. Se puede estar en el 7 sin nada.
  const terminado = paso >= 7 && !!sit;
  const cont = contador();
  return (
    <div className="pagina">
      <p className="rotulo">Método AI-First</p>
      <h1>En dos semanas tienes algo fuera. En cuatro sabes qué cambiar.</h1>

      <div className="entradilla">
        <p>Para quien trabaja con IA, produce mucho y ya no sabe qué de todo eso es verdad.</p>
        <p>Un sistema de trabajo: quién decide qué, cómo se pide, qué se comprueba antes de
          darlo por bueno y cuándo hay que parar. Y una cita cada semana para saber si sigues
          en lo correcto.</p>
      </div>

      {sit && (
        <div className="situacion">
          {!sit.pasado ? (
            <>
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
              <p className="ayuda">Cierras el {fechaLarga(sit.s.cierre)} a las {sit.s.hora}.</p>
              {cont && <p className="ayuda">{cont}</p>}
              <div className="acciones">
                <button className="btn" onClick={() => navigate('/metodo/plan')}>Ver mi plan</button>
                <button className="btn btn-2" onClick={() => navigate('/metodo/checkpoint')}>Cerrar esta semana</button>
              </div>
            </>
          ) : (
            <>
              <p className="rotulo">Vas por aquí</p>
              <h2>Tu mes ha terminado. Ahora, cada semana, tu checkpoint.</h2>
              <p>Cada {sit.checkpoint.dia} a las {sit.checkpoint.hora}: cuatro preguntas y un
                veredicto. Media hora.</p>
              {cont && <p className="ayuda">{cont}</p>}
              <div className="acciones">
                <button className="btn" onClick={() => navigate('/metodo/checkpoint')}>Cerrar esta semana</button>
                <button className="btn btn-2" onClick={() => navigate('/metodo/plan')}>Ver mi plan</button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Con el recorrido terminado esta pantalla decía «Empieza por montar el
          tuyo» encima de un plan ya en marcha, y no decía en ningún sitio que
          estuviera hecho. Ahora el bloque cambia de oficio con el estado. */}
      {terminado ? (
        <>
          <h2>Tu método ya está montado</h2>
          <p>Lo escribiste en siete pasos. Desde ahora el método es una cita: cada semana,
            cuatro preguntas y un veredicto.</p>

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
          <p>Quince minutos, siete pasos. No hace falta instalar nada ni saber programar.</p>

          <div className="acciones">
            <button className="btn" onClick={() => navigate('/metodo/recorrido')}>
              {paso > 1 ? `Seguir donde lo dejé · paso ${paso} de 7` : 'Montar el mío · 15 minutos'}
            </button>
            <button className="btn btn-2" onClick={() => navigate('/guia')}>Leer el manual primero</button>
          </div>
          <p className="ayuda">Funciona sin cuenta: lo que escribes se queda en este navegador.
            Si entras —arriba a la derecha—, lo tienes también en el móvil y, si lo pides, te
            escribo cada semana el día de tu checkpoint.</p>
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

      <h2>Cómo funciona</h2>
      <ol>
        <li><b>Montas tu método en quince minutos.</b> Siete pasos: para quién es, en qué fase
          estás, qué no se toca, quién decide qué y la primera suposición que vas a poner a
          prueba con alguien de fuera.</li>
        <li><b>Te llevas tu carpeta y un plan con fechas.</b> Ficheros de texto con tus
          respuestas, los textos para pegar en tu IA y tu primer mes en el calendario.</li>
        <li><b>Cada semana, un checkpoint de media hora.</b> Cuatro preguntas fijas y un
          veredicto que firmas tú: seguimos, cambiamos o paramos.</li>
        <li><b>La web te escribe ese día y lleva la cuenta.</b> Si entras con tu cuenta.
          Semanas cerradas, conversaciones con gente de fuera, cosas cambiadas por lo que te
          dijeron.</li>
      </ol>

      <p style={{ marginTop: 'var(--e5)' }}>
        <a href="#/guia" onClick={(e) => { e.preventDefault(); navigate('/guia'); }} style={{ display: 'inline-flex', alignItems: 'center', minHeight: 44 }}>
          Leer el manual: el porqué y las reglas, por situaciones →
        </a>
      </p>
      <p>
        <a href="#/metodo/mapa" onClick={(e) => { e.preventDefault(); navigate('/metodo/mapa'); }} style={{ display: 'inline-flex', alignItems: 'center', minHeight: 44 }}>
          Ver el mapa completo: piezas, roles, pasos y qué te llevas →
        </a>
      </p>

      <hr />

      <h2>Beta permanente</h2>
      <p>Esto no está terminado y no lo va a estar: es la versión de hoy, sale antes de estar
        redonda y lo que no funciona se cambia. Vale igual para lo tuyo. La página que vas a
        hacer no tiene que estar bien: tiene que existir, para que alguien que no eres tú te
        diga qué no se entiende. Versiones, no lanzamientos.</p>
    </div>
  );
}
