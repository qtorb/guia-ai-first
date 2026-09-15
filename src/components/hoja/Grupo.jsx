import Campo from './Campo';
import TextoInline from '../TextoInline';
import { esc } from '../../lib/inline';

// Port de grupo() — guia-ai-first-src/index.html:2679-2688.
export default function Grupo({ g, datos, onChange }) {
  if (g.tipo === 'checks') {
    return (
      <>
        {g.campos.map((c) => (
          <label className="chk" key={c.k}>
            <input
              type="checkbox"
              className="c"
              checked={!!datos[c.k]}
              onChange={(e) => onChange(c.k, e.target.checked)}
            />
            <TextoInline as="span" texto={c.txt} />
          </label>
        ))}
      </>
    );
  }

  if (g.tipo === 'frase') {
    const [a, b] = g.campos;
    return (
      <div className="frase">
        {esc(g.pre)}{' '}
        <input
          type="text"
          className="c"
          size={16}
          placeholder={a.ph}
          value={datos[a.k] ?? ''}
          onChange={(e) => onChange(a.k, e.target.value)}
        />{' '}
        {esc(g.mid)}{' '}
        <input
          type="text"
          className="c"
          size={20}
          placeholder={b.ph}
          value={datos[b.k] ?? ''}
          onChange={(e) => onChange(b.k, e.target.value)}
        />
        {g.post ? esc(g.post) : ''}
      </div>
    );
  }

  const cls = g.tipo === 'fila3' ? 'row g3' : g.tipo === 'fila2' ? 'row g2' : '';
  const inner = (
    <div className={cls}>
      {g.campos.map((c) => (
        <Campo key={c.k} c={c} valor={datos[c.k]} onChange={onChange} />
      ))}
    </div>
  );
  return g.sep ? <div className="asiento">{inner}</div> : inner;
}
