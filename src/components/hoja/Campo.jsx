// Port de campo() — guia-ai-first-src/index.html:2671-2678.
//
// Aquí vivieron dos capas de reacción automática: una que avisaba de días,
// horas y nombres, y un enlace que opinaba sobre si la línea era genérica.
// Se han retirado. La hoja acompaña una sesión; no evalúa a quien escribe.
// La pregunta por la genericidad la hace Albert en clase, por parejas, y la
// pantalla no tiene que adelantarse ni sustituirle.
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
