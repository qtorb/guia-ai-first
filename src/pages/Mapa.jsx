import { useNavigate } from 'react-router-dom';

// Port 1:1 de dist/sitio/mapa.html (Método AI-First). Mismos textos, mismas
// clases (.mapa-caja, .mapa-grid, .mapa-stack, .mapa-pasos). Los enlaces del
// sitio estático se traducen a rutas de la app: metodo.html → /guia,
// paso-N.html → el asistente en /ia-lab/1.
export default function Mapa() {
  const navigate = useNavigate();
  // ¿hay recorrido hecho en este navegador? Mismo criterio que la portada.
  const yaEmpezado = (() => {
    try {
      const d = JSON.parse(localStorage.getItem('metodo-ai-first')) || {};
      return !!((d.persona || '').trim() && (d.cuando || '').trim());
    } catch (e) { return false; }
  })();
  const ir = (ruta) => (e) => { e.preventDefault(); navigate(ruta); };

  return (
    <div className="pagina ancha">
      <p className="rotulo">El mapa</p>
      <h1>Cómo encaja todo esto</h1>
      <p>Cuatro preguntas, en el orden en que las vas a necesitar: qué piezas hay,
        quién decide qué, qué vas a hacer ahora, y qué te llevas al final.</p>

      <div className="mapa-caja centro">
        <p className="rotulo">Un ejemplo real, simplificado</p>
        <h3>Así se vería para un proyecto sencillo — UXMachine en sus primeros días</h3>
        <p><strong>La frase de valor:</strong> un audit de UX evidence-first, para
          dueños de producto que quieren saber qué falla en su web sin adivinar.</p>
        <p><strong>La columna:</strong> A al principio — una idea sin nadie fuera
          todavía.</p>
        <p><strong>Los roles:</strong> Fundador — el fundador, decide todo. Asesor
          — quien escribe los briefs y propone, no decide. Ejecutor — el builder, un
          agente de código que ejecuta encargos cerrados.</p>
        <p><strong>El stack, cuando creció de columna:</strong> GitHub para el
          historial, Railway donde corre — y siempre en ese orden: el ejecutor nunca
          publica directo a Railway, primero pasa por GitHub.</p>
        <p className="ayuda">Simplificado a propósito. Un proyecto real en marcha tiene
          muchas más piezas que esto — esto es solo el esqueleto del método,
          aplicado.</p>
      </div>

      <h2>El ecosistema</h2>
      <p>Tres piezas para empezar. Cada una tiene un trabajo, y solo uno.</p>
      <div className="mapa-grid">
        <div className="mapa-caja">
          <p className="rotulo">Lo lees cuando hace falta</p>
          <h3>El manual</h3>
          <p>El porqué y las reglas. No lo lees entero: buscas tu situación cuando
            la tienes delante y vuelves a cerrarlo.</p>
          <p><a href="#/guia" onClick={ir('/guia')}>Abrir el método →</a></p>
        </div>
        <div className="mapa-caja centro">
          <p className="rotulo">Donde vive tu método</p>
          <h3>Tu carpeta</h3>
          <p>Los ficheros con tus respuestas dentro: para quién es esto, tus líneas
            rojas, tus roles, tus hipótesis, tus encargos. Texto plano y versionado,
            nunca solo dentro de un chat.</p>
        </div>
        <div className="mapa-caja">
          <p className="rotulo">Te acompaña una vez</p>
          <h3>Esta web</h3>
          <p>Rellena esa carpeta contigo, paso a paso. Cuando terminas el
            recorrido no vuelves aquí — usas los ficheros directamente.</p>
          <p><a href="#/metodo/recorrido" onClick={ir('/metodo/recorrido')}>Empezar el recorrido →</a></p>
        </div>
      </div>

      <h3>Cuando creces de columna</h3>
      <p>Cada pieza entra cuando la necesitas, no antes. Estos son ejemplos
        concretos de la categoría que describe el manual — puedes usar otros:</p>
      <ul className="mapa-stack">
        <li><span className="quien">Repositorio</span><span><strong>GitHub</strong> —
          el historial. Entra antes de que un ejecutor con código pueda escribir en
          tus ficheros: a partir de ahí, volver atrás sin perder por qué pensabas lo
          otro deja de ser cómodo y pasa a ser necesario.</span></li>
        <li><span className="quien">Dónde corre</span><span><strong>Railway</strong>, o
          el hosting que uses — entra cuando tu criterio de aceptación es «lo que ve
          el destinatario» y eso es una URL real, no una maqueta.</span></li>
        <li><span className="quien">Datos</span><span><strong>Supabase</strong>, o la
          base de datos gestionada que uses — entra cuando el producto guarda algo de
          alguien, aunque sea un email.</span></li>
        <li><span className="quien">Comunicación</span><span><strong>Postmark</strong>,
          o el envío de correo que uses — entra cuando el producto tiene que avisar a
          alguien sin que tú lo escribas a mano cada vez.</span></li>
        <li><span className="quien">Ejecutor con código</span><span>Un{' '}
          <strong>agente de código</strong> (Claude Code, Cursor…) con el repositorio
          delante, y el fichero de instrucciones del ejecutor en su raíz antes de que
          toque nada.</span></li>
      </ul>
      <p className="ayuda">El nombre de la herramienta no es la regla — la regla es
        cuándo entra cada categoría. El manual lo detalla en el capítulo 15.</p>

      <hr />

      <h2>Quién decide qué</h2>
      <p>Cuatro roles. Ninguno decide lo que le toca a otro.</p>
      <div className="mapa-grid">
        <div className="mapa-caja">
          <h3>Fundador — tú</h3>
          <p><strong>Decide:</strong> intención, prioridad, qué está prohibido, y
            todo lo que no esté delegado por escrito.</p>
          <p><strong>No decide:</strong> nada queda fuera de tu decisión — esa es
            la diferencia entre delegar y desaparecer.</p>
        </div>
        <div className="mapa-caja">
          <h3>Asesor</h3>
          <p><strong>Decide:</strong> nada. Propone y objeta, con fuerza: qué se
            construye, para quién, qué se afirma en público.</p>
          <p><strong>No decide:</strong> nada de eso sale sin tu firma en{' '}
            <code>08_DECISIONES.md</code>.</p>
        </div>
        <div className="mapa-caja">
          <h3>Checkpoint</h3>
          <p><strong>Decide:</strong> cuándo se mira si hay que parar.</p>
          <p><strong>No decide:</strong> qué se construye, ni parar. El STOP lo
            firmas tú.</p>
        </div>
        <div className="mapa-caja">
          <h3>Ejecutor</h3>
          <p><strong>Decide:</strong> nada. Ejecuta encargos cerrados.</p>
          <p><strong>No decide:</strong> qué hacer si algo no está escrito — para y
            pregunta, no elige por su cuenta.</p>
        </div>
      </div>

      <hr />

      <h2>Los siete pasos</h2>
      <p>Quince minutos. Cada paso escribe en un fichero real, y puedes volver a
        cualquiera que ya hayas hecho.</p>
      <ol className="mapa-pasos">
        {[
          'Tu frase de valor — para quién es esto',
          'Tu columna — A, B o C',
          'Tus líneas rojas',
          'Tus roles — asesor y checkpoint',
          'Cuándo usas IA y cuándo no',
          'Lo que pones a prueba esta semana',
          'Tu primer encargo',
        ].map((t, i) => (
          <li key={t}>
            <a href={`#/metodo/recorrido?paso=${i + 1}`}
              onClick={(e) => { e.preventDefault(); navigate(`/metodo/recorrido?paso=${i + 1}`); }}>
              <span className="num">{i + 1}</span><span>{t}</span>
            </a>
          </li>
        ))}
      </ol>

      <hr />

      <h2>Lo que te llevas al final</h2>
      <p>Cuatro cosas. Ninguna es una promesa: son ficheros y una cita puesta.</p>
      <ul>
        <li>Los ficheros de tu método escritos, con tus respuestas dentro — no una
          plantilla en blanco.</li>
        <li>Un ejecutor identificado: una conversación nueva, o un agente de código
          con el repositorio, según tu columna.</li>
        <li>Una cita puesta con una persona real, con la pieza de tu encargo en la
          mano.</li>
        <li>El ciclo siguiente: cuando vuelvas de esa cita, anotas tres frases
          suyas literales y cierras la tanda. Y se repite.</li>
      </ul>

      <div className="acciones">
        {/* El mapa ofrecía montar el método aunque ya lo tuvieras montado. Lee
            el mismo sitio que la portada y dice lo que toca. */}
        <button className="btn" onClick={() => navigate(yaEmpezado ? '/metodo/plan' : '/metodo/recorrido')}>
          {yaEmpezado ? 'Ver mi plan' : 'Montar el mío · 15 minutos'}
        </button>
        <button className="btn btn-2" onClick={() => navigate('/guia')}>Ver el método completo</button>
      </div>
    </div>
  );
}
