import { useNavigate } from 'react-router-dom';

// Port de dist/sitio/index.html (Método AI-First). Es la entrada del método:
// desde aquí se monta el tuyo (el recorrido de siete pasos), se lee el manual
// o se ve el mapa completo.
export default function MetodoPortada() {
  const navigate = useNavigate();
  return (
    <div className="pagina">
      <h1>Método AI-First</h1>
      <div className="entradilla">
        <p>Un sistema de trabajo para construir con agentes de IA: quién decide qué,
          cómo se pide, qué se comprueba antes de darlo por bueno y cuándo hay que parar.</p>
      </div>

      <h2>Empieza por montar el tuyo</h2>
      <p>Quince minutos, siete pasos. Al terminar te llevas los ficheros de tu
        método escritos con tus respuestas, y los cuatro pasos para dejarlos en tu
        propio repositorio.</p>
      <p>No hace falta instalar nada ni saber programar. Nada de lo que escribas
        sale de tu navegador: no hay cuentas ni contraseñas.</p>

      <div className="acciones">
        <button className="btn" onClick={() => navigate('/metodo/recorrido')}>Montar el mío · 15 minutos</button>
        <button className="btn btn-2" onClick={() => navigate('/guia')}>Ver el método primero</button>
      </div>
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
