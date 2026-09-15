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
export default function Bloque({ b, datos, onChange }) {
  const toast = useToast();

  function copiarPregunta() {
    alPortapapeles(b.ask.trim())
      .then(() => toast('Pregunta copiada'))
      .catch(() => toast('No se ha podido copiar — selecciónala a mano'));
  }

  return (
    <div className="blk" id={`b${b.n}`}>
      <div className="num">
        <span>Bloque {+b.n} de 7</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <em>{b.min}</em>
        </span>
      </div>
      <h2>{b.titulo}</h2>
      {(b.que || []).map((p, i) => <TextoInline key={i} texto={p} className="que" />)}
      {b.cicatriz && (
        <div className="cic">
          <div className="lab">De dónde sale</div>
          <TextoInline texto={b.cicatriz} />
        </div>
      )}
      {b.thead && (
        <div className="thead">
          {b.thead.map((t, i) => <div key={i}>{esc(t)}</div>)}
        </div>
      )}
      {(b.grupos || []).map((g, i) => <Grupo key={i} g={g} datos={datos} onChange={onChange} />)}
      {b.aviso && <TextoInline texto={b.aviso} className="aviso" />}
      {b.ask && (
        <div className="ask">
          <div className="lab">
            <span>Pregúntale a tu asistente</span>
            <button className="mini" onClick={copiarPregunta}>Copiar</button>
          </div>
          <p>{b.ask}</p>
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
    </div>
  );
}
