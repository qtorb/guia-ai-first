import Campo from './Campo';
import TextoInline from '../TextoInline';
import { esc } from '../../lib/inline';
import { Fichas, Puertas, Finalistas, Ganadora, Nadie, Mensaje, Respuestas } from './GruposHoja0';

// Port de grupo() — guia-ai-first-src/index.html:2679-2688.
export default function Grupo({ g, datos, onChange }) {
  // Tipos nuevos de la hoja 0 rediseñada. Van primero y salen por su lado:
  // el motor de abajo es el port literal del viejo y no se toca.
  if (g.tipo === 'fichas') return <Fichas g={g} datos={datos} onChange={onChange} />;
  if (g.tipo === 'puertas') return <Puertas g={g} datos={datos} onChange={onChange} />;
  if (g.tipo === 'finalistas') return <Finalistas g={g} datos={datos} onChange={onChange} />;
  if (g.tipo === 'ganadora') return <Ganadora g={g} datos={datos} onChange={onChange} />;
  if (g.tipo === 'nadie') return <Nadie g={g} datos={datos} onChange={onChange} />;
  if (g.tipo === 'mensaje') return <Mensaje g={g} datos={datos} onChange={onChange} />;
  if (g.tipo === 'respuestas') return <Respuestas g={g} datos={datos} onChange={onChange} />;

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
