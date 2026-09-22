import { useState } from 'react';
import Grupo from './Grupo';
import Comparacion from './Comparacion';
import TextoInline from '../TextoInline';
import { esc } from '../../lib/inline';
import { alPortapapeles } from '../../lib/portapapeles';
import { useToast } from '../Toast';

// Una pantalla, una tarea, un campo visible.
//
// El bloque tenía siete registros visuales antes del primer campo —kicker,
// título, dos párrafos, panel oscuro del encargo, cicatriz plegada, pruebas—
// y medía 2.465 px con 552 palabras. Quien entraba por el móvil scrolleaba
// media hoja antes de encontrar dónde escribir.
//
// Ahora el orden es fijo en las tres hojas: rótulo, título, la tarea en una
// frase, una línea de contexto, los campos, la comprobación. Todo lo demás
// —el encargo para la IA, el ejemplo terminado, de dónde sale la regla, la
// duda para la sesión— se pliega en una fila de botones al pie. No
// desaparece: deja de estar abierto todo a la vez, y está siempre en el
// mismo sitio.
export default function Bloque({ b, datos, onChange, total, rotulo, preparar, duda, onDuda }) {
  // b.ask puede venir como cadena (hoja 1) o como {lab, txt} (hoja 0).
  const ask = typeof b.ask === 'string' ? { lab: 'Pregúntale a tu asistente', txt: b.ask } : b.ask;
  const que = b.que || [];
  // Sin `tarea` en los datos, el primer párrafo hace de instrucción: la hoja
  // sigue funcionando, sólo se lee peor.
  const tarea = b.tarea || que[0] || '';
  const contexto = b.tarea ? que[0] : null;
  const resto = que.slice(b.tarea ? 1 : 1);

  return (
    <div className="blk" id={`b${b.n}`}>
      <div className="bk">{rotulo || `Bloque ${+b.n}${total ? ` de ${total}` : ''}`}{b.min && <em>{b.min}</em>}</div>
      <h2>{b.titulo}</h2>
      <TextoInline texto={tarea} className="tarea" />
      {contexto && <TextoInline texto={contexto} className="ctx" />}

      {/* La comparación grabada se queda a la vista: es el mecanismo, no una
          ayuda. Dos ejecuciones reales del mismo caso, una al lado de otra. */}
      {b.comparacion && <Comparacion c={b.comparacion} />}
      {/* Las tres pruebas del contraste son la tarea de ese bloque. */}
      {b.pruebas && (
        <div className="contraste">
          <h3>Tres pruebas</h3>
          <ol>{b.pruebas.map((x, i) => <TextoInline key={i} as="li" texto={x} />)}</ol>
        </div>
      )}
      {b.thead && (
        <div className="thead">
          {b.thead.map((t, i) => <div key={i}>{esc(t)}</div>)}
        </div>
      )}
      <div className="campos">
        {(b.grupos || []).map((g, i) => <Grupo key={i} g={g} datos={datos} onChange={onChange} />)}
        {b.aviso && <TextoInline texto={b.aviso} className="aviso" />}
      </div>
      {b.check && (
        <div className="qc">
          <div className="lab">Compruébalo tú</div>
          <ul>{b.check.map((c, i) => <TextoInline key={i} as="li" texto={c} />)}</ul>
        </div>
      )}

      <Ayudas
        b={b}
        ask={ask}
        resto={resto}
        preparar={preparar}
        duda={duda}
        onDuda={onDuda}
      />
    </div>
  );
}

// La fila de ayudas. Una abierta cada vez: dos paneles abiertos a la vez
// devuelven la pantalla al estado del que veníamos.
function Ayudas({ b, ask, resto, preparar, duda, onDuda }) {
  const toast = useToast();
  const [abierta, setAbierta] = useState(null);
  const marcada = duda !== undefined && duda !== null;

  function copiar(txt, ok) {
    alPortapapeles((txt || '').trim())
      .then(() => toast(ok))
      .catch(() => toast('No se ha podido copiar — selecciónalo a mano'));
  }

  const items = [];
  if (b.encargo || ask || preparar) items.push({ id: 'ia', rot: 'Pedírselo a la IA' });
  if (b.ejemplo) items.push({ id: 'ej', rot: 'Ver un ejemplo' });
  if (b.cicatriz || resto.length) items.push({ id: 'de', rot: 'De dónde sale' });
  if (onDuda) items.push({ id: 'du', rot: 'No me cuadra', marca: marcada });
  if (!items.length) return null;

  function toggle(id) {
    setAbierta((a) => (a === id ? null : id));
    // Abrir «No me cuadra» ya marca el bloque: quien lo abre es porque tiene
    // algo que preguntar, y escribir qué es sigue siendo opcional.
    if (id === 'du' && !marcada) onDuda(b.n, '');
  }

  return (
    <div className="ayu">
      <div className="ayu-r">
        {items.map((it) => (
          <button
            key={it.id}
            type="button"
            className={'ayb' + (abierta === it.id ? ' on' : '') + (it.marca ? ' marcada' : '')}
            aria-expanded={abierta === it.id}
            aria-controls={`ayp-${b.n}-${it.id}`}
            onClick={() => toggle(it.id)}
          >
            {it.rot}{it.marca && <span className="pt" aria-label="apuntado" />}
          </button>
        ))}
      </div>

      {abierta === 'ia' && (
        <div className="ayp" id={`ayp-${b.n}-ia`}>
          {preparar && <Preparar {...preparar} />}
          {b.encargo && (
            <div className="encargo">
              <div className="lab">
                <span>El encargo · listo para ejecutar</span>
                <button className="mini" onClick={() => copiar(b.encargo, 'Encargo copiado — pégaselo a tu asistente')}>Copiar</button>
              </div>
              <pre>{b.encargo}</pre>
              <p className="n">Las cinco partes son las de la sesión. Tú lo ejecutas y decides qué aceptas.</p>
            </div>
          )}
          {ask && (
            <div className="ask">
              <div className="lab">
                <span>{ask.lab || 'Pregúntale a tu asistente'}</span>
                <button className="mini" onClick={() => copiar(ask.txt, 'Pregunta copiada')}>Copiar</button>
              </div>
              <p>{ask.txt}</p>
            </div>
          )}
        </div>
      )}

      {abierta === 'ej' && (
        <div className="ayp" id={`ayp-${b.n}-ej`}>
          <p className="ayn">Ábrelo después de escribir el tuyo, no antes.</p>
          <div className="ej">
            {b.ejemplo.map(([k, v], i) => (
              <div className="r" key={i}>
                <span className="k">{esc(k)}</span>
                <TextoInline as="span" texto={v} />
              </div>
            ))}
          </div>
        </div>
      )}

      {abierta === 'de' && (
        <div className="ayp" id={`ayp-${b.n}-de`}>
          {resto.map((p, i) => <TextoInline key={i} texto={p} className="que" />)}
          {b.cicatriz && (
            <div className="cic">
              <div className="lab">De dónde sale esta regla</div>
              <TextoInline texto={b.cicatriz} />
            </div>
          )}
        </div>
      )}

      {abierta === 'du' && (
        <div className="ayp" id={`ayp-${b.n}-du`}>
          <div className="duda on">
            <div className="lab">
              <span>Lo pregunto en la sesión</span>
              <button className="mini" onClick={() => { onDuda(b.n, null); setAbierta(null); }}>Quitar</button>
            </div>
            <input
              type="text"
              className="c"
              placeholder="Qué es lo que no te cuadra (opcional)"
              value={duda ?? ''}
              onChange={(e) => onDuda(b.n, e.target.value)}
            />
            <p className="n">Sale al final de tu documento, con el nombre del bloque.</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Preparar el asistente. Vivía suelto en el primer bloque; ahora entra por
// «Pedírselo a la IA», que es exactamente cuando hace falta.
function Preparar({ paso0, onCopiarPrompt, onCopiarGuia }) {
  return (
    <details className="p0f">
      <summary>{paso0.titulo} <span>— dos minutos, y las preguntas funcionan mejor</span></summary>
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
        <p className="p0nota">¿Sin asistente a mano? Puedes hacer la hoja igual — solo perderás las preguntas.</p>
      </div>
    </details>
  );
}
