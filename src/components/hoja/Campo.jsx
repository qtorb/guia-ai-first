import { useState } from 'react';
import { reaccion, suenaACualquiera } from '../../lib/reacciones';

// Port de campo() — guia-ai-first-src/index.html:2671-2678, más las dos
// capas de reacción: la que habla sola (c.chk) y la que espera a que le
// pregunten (c.gen).
export default function Campo({ c, valor, datos, onChange }) {
  const [pista, setPista] = useState(null);
  const monoStyle = c.mono ? { fontFamily: 'var(--mono)', fontSize: '13px' } : undefined;
  const aviso = reaccion(c.chk, valor, datos);
  const verPista = pista && pista.sobre === (valor ?? '');

  return (
    <div className="field">
      {c.label && (
        <label>
          {c.label}
          {c.hint && <span className="hint"> {c.hint}</span>}
        </label>
      )}
      {c.rows ? (
        <textarea
          className="c"
          rows={c.rows}
          placeholder={c.ph || ''}
          value={valor ?? ''}
          onChange={(e) => onChange(c.k, e.target.value)}
        />
      ) : (
        <input
          type="text"
          className="c"
          style={monoStyle}
          placeholder={c.ph || ''}
          value={valor ?? ''}
          onChange={(e) => onChange(c.k, e.target.value)}
        />
      )}
      {aviso && <p className="reac">{aviso}</p>}
      {c.gen && (
        <p className="gen">
          <button
            type="button"
            className="lnk"
            onClick={() => setPista({ ...suenaACualquiera(valor), sobre: valor ?? '' })}
          >
            ¿suena a cualquiera?
          </button>
          {verPista && (
            <span className={pista.generico ? 'g-avisa' : 'g-vale'}>{pista.txt}</span>
          )}
        </p>
      )}
    </div>
  );
}
