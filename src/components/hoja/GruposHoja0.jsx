import TextoInline from '../TextoInline';
import Campo from './Campo';
import { bajar } from '../../lib/portapapeles';
import { calendario } from '../../lib/ics';
import { fechaLarga } from '../../lib/protocoloAiFirst';
import { PASO_VUELTA } from '../../lib/segundaSentada';

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
              <span className="ficha-n">{g.rotulo || 'Ficha'}{g.n === 1 ? '' : ` ${i + 1}`}</span>
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
  // Quien llega con su idea no ha pasado por las tandas. Se le ofrece la
  // ficha aquí mismo. Se mira `generadas` y no `vivas`: si no, la ficha
  // desaparecería al empezar a escribir en ella.
  const generadas = vivas.filter((f) => !f.pre.startsWith('fp'));

  return (
    <div className="puertas">
      {generadas.length === 0 && (
        <>
          <TextoInline className="ayuda" texto="¿Ya traes tu idea? Escríbela aquí y pásala por las reglas. Si vienes de generar, tus fichas aparecen solas." />
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

// Los finalistas salen de las fichas que pasaron las cuatro reglas, no se
// vuelven a escribir: así no se cuela una que no pasó.
export function Finalistas({ g, datos, onChange }) {
  const elegibles = [];
  (g.de || []).forEach((d) => {
    for (let i = 1; i <= (d.n || 4); i++) {
      const pre = `${d.pre}${i}`;
      const asa = (datos[`${pre}_asa`] || '').trim();
      const vende = (datos[`${pre}_vende`] || '').trim();
      if (!(asa || vende)) continue;
      if (![1, 2, 3, 4].every((r) => datos[`${pre}_r${r}`] === 'si')) continue;
      elegibles.push({ pre, txt: asa || vende });
    }
  });

  if (elegibles.length === 0) {
    return (
      <p className="ayuda">Todavía no ha pasado ninguna ficha las cuatro reglas. Vuelve al paso 5 y termina de pasarlas: lo que se quede en «no sé decirlo» es lo siguiente que tienes que averiguar.</p>
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
                <label>Finalista {i}</label>
                <select className="c" value={valor} onChange={(e) => elegir(e.target.value)}>
                  <option value="">— elige una —</option>
                  {elegibles.map((x) => <option key={x.pre} value={x.pre}>{x.txt}</option>)}
                  {escrita && <option value="_mano">{`${datos[k]} (escrita a mano)`}</option>}
                </select>
              </div>
              <Campo c={{ k: `${k}d`, label: 'Diferente en', ph: i === 1 ? 'único / más rápido / menor coste / mejores prestaciones' : '…' }} valor={datos[`${k}d`]} onChange={onChange} />
              <Campo c={{ k: `${k}q`, label: 'Frente a quién — tres nombres', ph: i === 1 ? 'tres alternativas concretas, con nombre' : '…' }} valor={datos[`${k}q`]} onChange={onChange} />
            </div>
          </div>
        );
      })}
    </>
  );
}

function isoLocal(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function eventoVuelta(datos, pre) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  let base = hoy;
  const m = String(datos[`${pre}_dia`] || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) {
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    if (!Number.isNaN(d.getTime()) && d > hoy) base = d;
  }
  const dia = new Date(base);
  dia.setDate(dia.getDate() + 2);
  const quien = String(datos[`${pre}_quien`] || '').trim();
  const cuando = String(datos[`${pre}_dia`] || '').trim();
  const url = `${window.location.origin}${window.location.pathname}#/ia-lab/10?paso=${PASO_VUELTA}`;
  const cuerpo =
    (quien ? `Le escribiste a ${quien}` + (cuando ? ` el ${fechaLarga(cuando)}` : '') + '.\n\n' : '') +
    'Hoy toca la segunda sentada. Empieza por copiar lo que te haya contestado, literal y con nombre. Si no ha contestado nadie, márcalo y eliges igual: eso también es un dato.\n\n' +
    `Vuelve aquí: ${url}`;
  return calendario([{
    uid: `ialab-vuelta-${Date.now()}@ai-first`,
    dia: isoLocal(dia),
    hora: '10:00',
    titulo: 'IA-Lab · segunda sentada: lo que te contestaron',
    cuerpo,
  }]);
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
          checked={enviado}
          onChange={(e) => marcar(e.target.checked)}
        />
        <span>Ya lo he enviado</span>
      </label>
      {enviado && (
        <div className="msg-campo">
          <p className="rotulo">La vuelta, en tu calendario</p>
          <p className="ayuda">Un evento para dentro de dos días, con lo que toca hacer y el enlace para volver justo aquí.</p>
          <button
            type="button"
            className="btn btn-g"
            onClick={() => bajar(eventoVuelta(datos, g.pre), 'ia-lab-segunda-sentada.ics', 'text/calendar;charset=utf-8')}
          >
            Descargar el evento (.ics)
          </button>
        </div>
      )}
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
    </div>
  );
}
