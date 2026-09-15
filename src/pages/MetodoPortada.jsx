import { useNavigate } from 'react-router-dom';

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
export default function MetodoPortada() {
  const navigate = useNavigate();
  const paso = pasoGuardado();
  return (
    <div className="pagina">
      <h1>Método AI-First</h1>
      <div className="entradilla">
        <p>Un sistema de trabajo para construir con agentes de IA: quién decide qué,
          cómo se pide, qué se comprueba antes de darlo por bueno y cuándo hay que parar.</p>
      </div>

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

      <h2>De dónde sale</h2>
      <p>Conviene que lo sepas antes de fiarte de nada de esto: sale de <b>un solo proyecto</b>,
        construido por una persona entre mayo y agosto de 2026. No hay estudio, ni muestra,
        ni comparación con nadie que trabaje de otra manera. Es la mejor evidencia que hay y
        a la vez la peor.</p>
      <p>Lo que sí puedo decir es que cada regla de aquí dentro costó dinero o tiempo antes de
        estar escrita.</p>
    </div>
  );
}
