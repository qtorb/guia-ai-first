// Port de campo() — guia-ai-first-src/index.html:2671-2678.
export default function Campo({ c, valor, onChange }) {
  const monoStyle = c.mono ? { fontFamily: 'var(--mono)', fontSize: '13px' } : undefined;
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
    </div>
  );
}
