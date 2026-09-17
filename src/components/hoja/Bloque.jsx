import Grupo from './Grupo';
import TextoInline from '../TextoInline';
import { esc } from '../../lib/inline';
import { alPortapapeles } from '../../lib/portapapeles';
import { useToast } from '../Toast';

// Port de bloque() — guia-ai-first-src/index.html:2689-2708.
// El enlace "Leer en la guía →" (b.link) se omite a propósito: apuntaba a
// ids del guia.md antiguo (p.ej. "s-4-2") que no existen en el manual
// nuevo (manual.json usa idents como "plan-vs-proyecto"). Decisión de
// Albert 2026-09-15: quitarlo en vez de mapearlo a mano.
export default function Bloque({ b, datos, onChange, total, rotulo, preparar, duda, onDuda }) {
  const toast = useToast();

  // b.ask puede venir como cadena (hoja 1) o como {lab, txt} (hoja 0).
  const ask = typeof b.ask === 'string' ? { lab: 'Pregúntale a tu asistente', txt: b.ask } : b.ask;
  const marcada = duda !== undefined && duda !== null;

  function copiarPregunta() {
    alPortapapeles((ask?.txt || '').trim())
      .then(() => toast('Pregunta copiada'))
      .catch(() => toast('No se ha podido copiar — selecciónala a mano'));
  }

  function copiarEncargo() {
    alPortapapeles((b.encargo || '').trim())
      .then(() => toast('Encargo copiado — pégaselo a tu asistente'))
      .catch(() => toast('No se ha podido copiar — selecciónalo a mano'));
  }

  return (
    <div className="blk" id={`b${b.n}`}>
      <div className="num">
        <span>{rotulo || `Bloque ${+b.n}${total ? ` de ${total}` : ''}`}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {b.min && <em>{b.min}</em>}
        </span>
      </div>
      <h2>{b.titulo}</h2>
      {preparar && <Preparar {...preparar} />}
      {(b.que || []).map((p, i) => <TextoInline key={i} texto={p} className="que" />)}
      {/* La cicatriz se pliega. Albert la cuenta en clase, en el bloque 3 del
          deck; desplegada aquí repetía por escrito lo que acababa de decir en
          voz alta y empujaba los campos media pantalla hacia abajo. */}
      {b.cicatriz && (
        <details className="cicf">
          <summary>De dónde sale esta regla</summary>
          <div className="cicb"><TextoInline texto={b.cicatriz} /></div>
        </details>
      )}
      {b.thead && (
        <div className="thead">
          {b.thead.map((t, i) => <div key={i}>{esc(t)}</div>)}
        </div>
      )}
      {/* Las tres pruebas del contraste, que antes vivían en su propio paso.
          Ahora el contraste es un bloque más de 1A: mismo sitio, mismo molde. */}
      {b.pruebas && (
        <div className="contraste">
          <h3>Tres pruebas</h3>
          <ol>{b.pruebas.map((x, i) => <TextoInline key={i} as="li" texto={x} />)}</ol>
        </div>
      )}
      {(b.grupos || []).map((g, i) => <Grupo key={i} g={g} datos={datos} onChange={onChange} />)}
      {b.aviso && <TextoInline texto={b.aviso} className="aviso" />}
      {/* El encargo, con las cinco partes de la diapositiva 18 a la vista.
          Sustituye a la pregunta suelta de una línea: el alumno no lo
          redacta, lo ejecuta. */}
      {b.encargo && (
        <div className="encargo">
          <div className="lab">
            <span>El encargo · listo para ejecutar</span>
            <button className="mini" onClick={copiarEncargo}>Copiar</button>
          </div>
          <pre>{b.encargo}</pre>
          <p className="n">Las cinco partes son las de la sesión. Tú lo ejecutas y decides qué aceptas.</p>
        </div>
      )}
      {ask && (
        <div className="ask">
          <div className="lab">
            <span>{ask.lab || 'Pregúntale a tu asistente'}</span>
            <button className="mini" onClick={copiarPregunta}>Copiar</button>
          </div>
          <p>{ask.txt}</p>
        </div>
      )}
      {b.check && (
        <div className="qc">
          <div className="lab">Compruébalo tú</div>
          <ul>{b.check.map((c, i) => <TextoInline key={i} as="li" texto={c} />)}</ul>
        </div>
      )}
      {b.ejemplo && (
        <details>
          <summary>Ver un ejemplo terminado <span>— ábrelo después de escribir el tuyo</span></summary>
          <div className="ej">
            {b.ejemplo.map(([k, v], i) => (
              <div className="r" key={i}>
                <span className="k">{esc(k)}</span>
                <TextoInline as="span" texto={v} />
              </div>
            ))}
          </div>
        </details>
      )}
      {onDuda && (
        <div className={'duda' + (marcada ? ' on' : '')}>
          {!marcada ? (
            <button className="lnk" onClick={() => onDuda(b.n, '')}>
              ¿Algo de este bloque no te cuadra? Apúntalo para la sesión
            </button>
          ) : (
            <>
              <div className="lab">
                <span>Lo pregunto en la sesión</span>
                <button className="mini" onClick={() => onDuda(b.n, null)}>Quitar</button>
              </div>
              <input
                type="text"
                className="c"
                placeholder="Qué es lo que no te cuadra (opcional)"
                value={duda}
                onChange={(e) => onDuda(b.n, e.target.value)}
              />
              <p className="n">Sale al final de tu protocolo, con el nombre del bloque.</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// El paso 0 vivía en la entrada de la hoja y era lo primero que veía
// cualquiera que entrase a mirar: una tarjeta negra pidiendo cuarenta
// páginas que la sesión no pide en ningún momento. Ahora llega plegado y
// dentro del primer bloque, que es donde aparece la primera pregunta para
// el asistente y por tanto donde sirve.
function Preparar({ paso0, onCopiarPrompt, onCopiarGuia }) {
  return (
    <details className="p0f">
      <summary>{paso0.titulo} <span>— dos minutos, y las preguntas verdes funcionan mejor</span></summary>
      <div className="p0b">
        <TextoInline texto={paso0.texto} />
        <ol className="p0l">
          <li>
            <b>Abre tu asistente.</b> ChatGPT, Claude, Gemini, el que uses.
          </li>
          <li>
            <b>Pégale la guía entera.</b> Son unas cuarenta páginas. Se pega de una vez y la lee sola.
            <div className="p0a"><button className="btn btn-g" onClick={onCopiarGuia}>Copiar la guía entera</button></div>
          </li>
          <li>
            <b>Y después, estas instrucciones.</b> Es lo que hace que deje de contestar por ti y empiece a preguntarte.
            <div className="snip">{paso0.prompt}</div>
            <div className="p0a"><button className="btn btn-g" onClick={onCopiarPrompt}>Copiar las instrucciones</button></div>
          </li>
        </ol>
        <p className="p0nota">¿Sin asistente a mano? Puedes hacer la hoja igual — solo perderás las preguntas verdes.</p>
      </div>
    </details>
  );
}
