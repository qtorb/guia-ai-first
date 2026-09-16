import TextoInline from '../TextoInline';

// --------------------------------------------------------------------------
// Los tipos de grupo que estrena la hoja 0 rediseñada. Viven aparte de
// Grupo.jsx a propósito: aquel es el port literal del motor viejo y no se
// toca, y estos son estructuras nuevas (fichas, reglas, mensaje, respuestas)
// que solo usa esta hoja.
//
// Todo lo que el alumno escribe sigue viviendo en el mismo objeto plano de
// datos, con claves derivadas del prefijo del grupo, para que guardar y
// recuperar el avance siga funcionando sin tocar nada.
// --------------------------------------------------------------------------

const CAMPOS_FICHA = [
  { s: 'asa', lab: 'Asa · 3-4 palabras', ph: 'se escribe al final', clase: 'asa' },
  { s: 'vende', lab: 'Se vende', ph: 'qué, en una línea' },
  { s: 'quien', lab: 'A quién · y quién firma', ph: 'una persona o una empresa, nombrada' },
  { s: 'hoy', lab: 'Hoy lo resuelve con __ y le cuesta __', ph: 'lo que hace ahora, y lo que le cuesta' },
  { s: 'llego', lab: 'Yo llego así', ph: 'con un nombre propio dentro', clase: 'mano', mano: true },
];

export function Fichas({ g, datos, onChange }) {
  const n = g.n || 4;
  return (
    <div className="fichas-grupo">
      {Array.from({ length: n }, (_, i) => {
        const pre = `${g.pre}${i + 1}`;
        return (
          <div className="ficha" key={pre}>
            <div className="ficha-cab">
              <span className="ficha-n">{g.rotulo || 'Ficha'} {i + 1}</span>
            </div>
            {CAMPOS_FICHA.map((c) => {
              const k = `${pre}_${c.s}`;
              const id = `campo-${k}`;
              return (
                <div className={'ficha-fila' + (c.clase ? ' ' + c.clase : '')} key={c.s}>
                  <label className="ficha-et" htmlFor={id}>
                    {c.lab}{c.mano && <span className="a-mano" aria-hidden="true"> ✎</span>}
                    {c.mano && <span className="sr-only"> — este campo lo escribes tú</span>}
                  </label>
                  <input
                    id={id}
                    type="text"
                    className="ficha-val"
                    placeholder={c.ph}
                    value={datos[k] ?? ''}
                    onChange={(e) => onChange(k, e.target.value)}
                  />
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

const ESTADOS = [
  { v: 'si', et: 'cumple', clase: 'si' },
  { v: 'no', et: 'no cumple', clase: 'no' },
  { v: 'ns', et: 'no sé decirlo', clase: 'ns' },
];

export function Puertas({ g, datos, onChange }) {
  // Las fichas de todos los prefijos declarados, con su asa como nombre.
  const filas = [];
  (g.de || []).forEach((d) => {
    for (let i = 1; i <= (d.n || 4); i++) {
      const pre = `${d.pre}${i}`;
      filas.push({ pre, asa: (datos[`${pre}_asa`] || '').trim(), vende: (datos[`${pre}_vende`] || '').trim() });
    }
  });
  const vivas = filas.filter((f) => f.asa || f.vende);

  return (
    <div className="puertas">
      {vivas.length === 0 && (
        <p className="ayuda">Aquí aparecerán tus fichas cuando las escribas arriba.</p>
      )}
      {vivas.map((f) => (
        <div className="puerta-fila" key={f.pre}>
          <p className="puerta-asa">{f.asa || f.vende}</p>
          <div className="puerta-reglas">
            {(g.reglas || []).map((r, i) => {
              const k = `${f.pre}_r${i + 1}`;
              const nombre = `g-${f.pre}-${i + 1}`;
              return (
                <fieldset className="regla" key={i}>
                  <legend>{r}</legend>
                  <div className="estados">
                    {ESTADOS.map((e) => (
                      <label className={'estado ' + e.clase + (datos[k] === e.v ? ' on' : '')} key={e.v}>
                        <input
                          type="radio"
                          name={nombre}
                          value={e.v}
                          checked={datos[k] === e.v}
                          onChange={() => onChange(k, e.v)}
                        />
                        <span>{e.et}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              );
            })}
          </div>
          <div className="puerta-motivo">
            <label htmlFor={`m-${f.pre}`}>Si se cae, por qué — escríbelo ahora</label>
            <input
              id={`m-${f.pre}`}
              type="text"
              placeholder="una línea, en el momento de descartarla"
              value={datos[`${f.pre}_motivo`] ?? ''}
              onChange={(e) => onChange(`${f.pre}_motivo`, e.target.value)}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Mensaje({ g, datos, onChange }) {
  return (
    <div className="mensaje">
      <div className="msg-campo">
        <label htmlFor="msg-quien">A quién le escribes</label>
        <p className="ayuda">Sale de lo que escribiste a mano en «yo llego así». Nombre y por dónde le escribes.</p>
        <input
          id="msg-quien"
          type="text"
          placeholder="nombre · WhatsApp, correo, LinkedIn"
          value={datos[`${g.pre}_quien`] ?? ''}
          onChange={(e) => onChange(`${g.pre}_quien`, e.target.value)}
        />
      </div>
      <div className="msg-borrador">
        <p className="rotulo">El borrador</p>
        <TextoInline texto={g.borrador} />
      </div>
      <div className="msg-campo">
        <label htmlFor="msg-dia">Qué día se lo mandas</label>
        <input
          id="msg-dia"
          type="date"
          value={datos[`${g.pre}_dia`] ?? ''}
          onChange={(e) => onChange(`${g.pre}_dia`, e.target.value)}
        />
      </div>
      <label className="chk">
        <input
          type="checkbox"
          className="c"
          checked={!!datos[`${g.pre}_enviado`]}
          onChange={(e) => onChange(`${g.pre}_enviado`, e.target.checked)}
        />
        <span>Ya lo he enviado</span>
      </label>
    </div>
  );
}

export function Respuestas({ g, datos, onChange }) {
  const n = g.n || 2;
  return (
    <div className="respuestas">
      {Array.from({ length: n }, (_, i) => {
        const pre = `${g.pre}${i + 1}`;
        return (
          <div className="resp" key={pre}>
            <div className="resp-quien">
              <label htmlFor={`rq-${pre}`}>Quién</label>
              <input
                id={`rq-${pre}`}
                type="text"
                placeholder="nombre"
                value={datos[`${pre}_quien`] ?? ''}
                onChange={(e) => onChange(`${pre}_quien`, e.target.value)}
              />
            </div>
            <div className="resp-dijo">
              <label htmlFor={`rd-${pre}`}>Lo que dijo, tal cual</label>
              <textarea
                id={`rd-${pre}`}
                rows={3}
                placeholder="literal. Si lo parafraseas, ya es tuyo y no suyo."
                value={datos[`${pre}_dijo`] ?? ''}
                onChange={(e) => onChange(`${pre}_dijo`, e.target.value)}
              />
            </div>
          </div>
        );
      })}
      <p className="ayuda">Si no ha contestado nadie, déjalo vacío y sigue. El silencio no es un dato sobre tu
        idea: es un dato sobre tu acceso, y de los buenos — porque lo sabes ahora y no en marzo.</p>
    </div>
  );
}
