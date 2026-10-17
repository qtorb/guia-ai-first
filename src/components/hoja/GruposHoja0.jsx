import { useEffect } from 'react';
import TextoInline from '../TextoInline';
import Campo from './Campo';

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

// El orden es el de escribir: lo que se vende, a quién, qué usa hoy, cómo
// llegas tú, y el nombre corto al final —la ayuda dice «se escribe al
// final», así que no puede ser el primer campo—. La clave interna del
// nombre sigue siendo `asa` para no perder lo que ya hay guardado.
const CAMPOS_FICHA = [
  { s: 'vende', lab: 'Qué se vende', ph: 'en una línea' },
  { s: 'quien', lab: 'Quién compra y quién decide la compra', ph: 'una persona o una empresa concreta' },
  { s: 'hoy', lab: 'Cómo lo resuelve hoy y cuánto le cuesta', ph: 'tiempo, dinero o esfuerzo', seguridad: true },
  { s: 'llego', lab: 'Cómo llegas tú a esa persona o empresa', ph: 'un nombre real', clase: 'mano', mano: true },
  { s: 'asa', lab: 'Nombre corto de la idea (3 o 4 palabras)', ph: 'por ejemplo: Taller Bici', clase: 'asa' },
];

// Lo que se escribe en «cómo lo resuelve hoy» casi nunca está comprobado
// todavía. Sin una forma de decirlo, la tarjeta empuja a inventar.
const SEGURIDAD = [
  { v: 'comp', et: 'comprobado' },
  { v: 'est', et: 'estimación' },
  { v: 'ns', et: 'aún no lo sé' },
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
              <span className="ficha-n">{g.rotulo || 'Tarjeta de idea'}{g.n === 1 ? '' : ` · idea ${i + 1}`}</span>
            </div>
            {CAMPOS_FICHA.map((c) => {
              const k = `${pre}_${c.s}`;
              const id = `campo-${k}`;
              return (
                <div className={'ficha-fila' + (c.clase ? ' ' + c.clase : '')} key={c.s}>
                  <label className="ficha-et" htmlFor={id}>
                    <span>{c.lab}</span>
                    {c.mano && <span className="ficha-mano">Esto lo escribes tú, no la IA.</span>}
                  </label>
                  <div className="ficha-col">
                    <input
                      id={id}
                      type="text"
                      className="ficha-val"
                      placeholder={c.ph}
                      value={datos[k] ?? ''}
                      onChange={(e) => onChange(k, e.target.value)}
                    />
                    {c.seguridad && (
                      <fieldset className="ficha-seg">
                        <legend className="sr-only">¿Cómo de seguro estás de esto?</legend>
                        {SEGURIDAD.map((o) => (
                          <label key={o.v} className={'seg' + (datos[`${k}_seg`] === o.v ? ' on' : '')}>
                            <input
                              type="radio"
                              name={`seg-${k}`}
                              value={o.v}
                              checked={datos[`${k}_seg`] === o.v}
                              onChange={() => onChange(`${k}_seg`, o.v)}
                            />
                            <span>{o.et}</span>
                          </label>
                        ))}
                      </fieldset>
                    )}
                  </div>
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
  { v: 'si', et: 'sí cumple', clase: 'si' },
  { v: 'no', et: 'no cumple', clase: 'no' },
  { v: 'ns', et: 'aún no lo sé', clase: 'ns' },
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
  // Quien llega con su idea no ha pasado por las tandas. Se le ofrece la
  // ficha aquí mismo. Se mira `generadas` y no `vivas`: si no, la ficha
  // desaparecería al empezar a escribir en ella.
  const generadas = vivas.filter((f) => !f.pre.startsWith('fp'));

  return (
    <div className="puertas">
      {generadas.length === 0 && (
        <>
          <TextoInline className="ayuda" texto="**¿Ya tienes una idea?** Escríbela aquí y compárala con los cuatro criterios. Si vienes del paso 4, tus ideas aparecen aquí solas." />
          <Fichas g={{ pre: 'fp', n: 1, rotulo: 'Tu idea' }} datos={datos} onChange={onChange} />
        </>
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
                  <label className="regla-por-et" htmlFor={`${nombre}-por`}>Motivo</label>
                  <input
                    id={`${nombre}-por`}
                    type="text"
                    className="regla-por"
                    placeholder={(g.porques || [])[i] || 'una línea'}
                    value={datos[`${k}_por`] ?? ''}
                    onChange={(e) => onChange(`${k}_por`, e.target.value)}
                  />
                </fieldset>
              );
            })}
          </div>
          <div className="puerta-motivo">
            <label htmlFor={`m-${f.pre}`}>Si la descartas, explica por qué (escríbelo ahora)</label>
            <input
              id={`m-${f.pre}`}
              type="text"
              placeholder="una línea"
              value={datos[`${f.pre}_motivo`] ?? ''}
              onChange={(e) => onChange(`${f.pre}_motivo`, e.target.value)}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// Los finalistas salen de las fichas que pasaron las cuatro reglas con su
// porqué escrito, no se vuelven a escribir: así no se cuela una que no pasó,
// ni un «cumple» marcado sin pensar.
export function Finalistas({ g, datos, onChange }) {
  const elegibles = [];
  (g.de || []).forEach((d) => {
    for (let i = 1; i <= (d.n || 4); i++) {
      const pre = `${d.pre}${i}`;
      const asa = (datos[`${pre}_asa`] || '').trim();
      const vende = (datos[`${pre}_vende`] || '').trim();
      if (!(asa || vende)) continue;
      if (![1, 2, 3, 4].every((r) => datos[`${pre}_r${r}`] === 'si' && String(datos[`${pre}_r${r}_por`] || '').trim())) continue;
      elegibles.push({ pre, txt: asa || vende });
    }
  });

  if (elegibles.length === 0) {
    return (
      <p className="ayuda">Todavía ninguna idea cumple los cuatro criterios con su motivo escrito. Vuelve al paso 5 y complétalo. Las que marcaste como «aún no lo sé» necesitan más información, y un «sí cumple» sin motivo no cuenta.</p>
    );
  }

  return (
    <>
      {Array.from({ length: g.n || 3 }, (_, j) => {
        const i = j + 1;
        const k = `d${i}`;
        const escrita = datos[k] && !datos[`${k}_pre`];
        const valor = escrita ? '_mano' : (datos[`${k}_pre`] || '');
        const elegir = (v) => {
          const e = elegibles.find((x) => x.pre === v);
          onChange(k, e ? e.txt : '');
          onChange(`${k}_pre`, e ? e.pre : '');
        };
        return (
          <div className="asiento" key={k}>
            <div className="row g3">
              <div className="field">
                <label htmlFor={`fin-${i}`}>Idea {i}</label>
                <select id={`fin-${i}`} className="c" value={valor} onChange={(e) => elegir(e.target.value)}>
                  <option value="">— elige una —</option>
                  {elegibles.map((x) => <option key={x.pre} value={x.pre}>{x.txt}</option>)}
                  {escrita && <option value="_mano">{`${datos[k]} (escrita por ti)`}</option>}
                </select>
              </div>
              <Campo c={{ k: `${k}d`, label: 'En qué es diferente', ph: i === 1 ? 'única / más rápida / más barata / mejor' : '…' }} valor={datos[`${k}d`]} onChange={onChange} />
              <Campo c={{ k: `${k}q`, label: 'Frente a qué alternativas', ph: i === 1 ? 'tres competidores o soluciones reales, con su nombre' : '…' }} valor={datos[`${k}q`]} onChange={onChange} />
            </div>
          </div>
        );
      })}
    </>
  );
}

// La que gana sale de las finalistas del paso 9, no se vuelve a escribir.
export function Ganadora({ datos, onChange }) {
  const opciones = ['d1', 'd2', 'd3'].map((k) => String(datos[k] ?? '').trim()).filter(Boolean);
  if (opciones.length === 0) {
    return <p className="ayuda">Primero elige tus ideas en el paso 9.</p>;
  }
  return (
    <div className="field">
      <label htmlFor="ganadora">La idea que eliges</label>
      <select id="ganadora" className="c" value={datos.w0_de ?? ''} onChange={(e) => onChange('w0_de', e.target.value)}>
        <option value="">— elige una —</option>
        {opciones.map((t, i) => <option key={i} value={t}>{t}</option>)}
      </select>
    </div>
  );
}

// «Nadie contestó» no convive con una respuesta escrita: si hay alguna, la
// casilla se apaga y, si estaba marcada, se desmarca.
export function Nadie({ g, datos, onChange }) {
  const d = g.de || {};
  const hay = Array.from({ length: d.n || 3 }, (_, i) => String(datos[`${d.pre}${i + 1}_dijo`] ?? '').trim())
    .some(Boolean);
  const marcada = !!datos[g.k];
  useEffect(() => {
    if (hay && marcada) { onChange(g.k, false); if (g.opciones) onChange(g.opciones.k, ''); }
  }, [hay, marcada, g.k, g.opciones, onChange]);
  return (
    <>
      <label className="chk">
        <input
          type="checkbox"
          className="c"
          checked={marcada}
          disabled={hay}
          onChange={(e) => {
            onChange(g.k, e.target.checked);
            if (!e.target.checked && g.opciones) onChange(g.opciones.k, '');
          }}
        />
        <TextoInline as="span" texto={g.txt} />
      </label>
      {hay && <p className="ayuda">Ya tienes una respuesta escrita: esta casilla es para cuando no ha contestado nadie.</p>}
      {/* Que nadie conteste en dos días no dice tanto como para decidir
          por el alumno. Se le ofrecen las dos salidas y se apunta cuál. */}
      {marcada && !hay && g.opciones && (
        <fieldset className="nadie-op">
          <legend><TextoInline as="span" texto={g.opciones.txt} /></legend>
          {g.opciones.lista.map(([v, t]) => (
            <label className="chk" key={v}>
              <input
                type="radio"
                className="c"
                name="nadie-op"
                checked={datos[g.opciones.k] === t}
                onChange={() => onChange(g.opciones.k, t)}
              />
              <span>{t}</span>
            </label>
          ))}
        </fieldset>
      )}
    </>
  );
}

export function Mensaje({ g, datos, onChange }) {
  const enviado = !!datos[`${g.pre}_enviado`];
  const marcar = (on) => {
    onChange(`${g.pre}_enviado`, on);
    if (on && !datos._enviado_t) onChange('_enviado_t', new Date().toISOString());
    if (!on) onChange('_enviado_t', undefined);
  };
  return (
    <div className="mensaje">
      <div className="msg-campo">
        <label htmlFor="msg-quien">A quién le escribes</label>
        <p className="ayuda">Sale de lo que escribiste en «Cómo llegas tú a esa persona». Pon su nombre y por dónde le escribes (WhatsApp, correo, LinkedIn).</p>
        <input
          id="msg-quien"
          type="text"
          placeholder="nombre · WhatsApp, correo, LinkedIn"
          value={datos[`${g.pre}_quien`] ?? ''}
          onChange={(e) => onChange(`${g.pre}_quien`, e.target.value)}
        />
      </div>
      <div className="msg-borrador">
        <p className="rotulo">El mensaje</p>
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
          checked={enviado}
          onChange={(e) => marcar(e.target.checked)}
        />
        <span>Ya envié el mensaje</span>
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
              <label htmlFor={`rd-${pre}`}>Lo que dijo, con sus palabras</label>
              <textarea
                id={`rd-${pre}`}
                rows={3}
                placeholder="cópialo tal como te lo dijo"
                value={datos[`${pre}_dijo`] ?? ''}
                onChange={(e) => onChange(`${pre}_dijo`, e.target.value)}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
