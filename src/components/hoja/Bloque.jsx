import { useState } from 'react';
import Grupo from './Grupo';
import Comparacion from './Comparacion';
import TextoInline from '../TextoInline';
import { esc } from '../../lib/inline';
import { alPortapapeles } from '../../lib/portapapeles';
import { useToast } from '../Toast';
import Cebolla from './Cebolla';

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
export default function Bloque(props) {
  if (props.claro) return <BloqueClaro {...props} />;
  return <BloqueClasico {...props} />;
}

// La hoja 1: el mismo orden en todos los pasos —1 · Hazlo, 2 · Anota,
// 3 · Compruébalo— y un solo botón para acabar, después de comprobar.
// La casilla «Hecho» pasa a ser ese botón: antes se marcaba antes de saber
// si funcionaba.
function BloqueClaro({ b, datos, onChange, numero, totalVisible, duda, onDuda, reglas, hecho, onHecho }) {
  const toast = useToast();
  const [falla, setFalla] = useState(false);
  const grupos = (b.grupos || []).filter((g) => !(g.tipo === 'checks' && g.campos.every((c) => /^h\d/.test(c.k))));
  const secs = [];
  if (b.pruebas) secs.push('hazlo');
  if (grupos.length) secs.push('anota');
  if (b.check) secs.push('comprueba');
  const nsec = (s) => secs.indexOf(s) + 1;
  const etiqueta = { hazlo: b.hazlo || 'Hazlo', anota: b.escribe || (b.pruebas ? 'Anota' : 'Escribe'), comprueba: 'Compruébalo' };
  const resto = b.porque || (b.que || []).slice(1);

  function copiar(txt) {
    alPortapapeles(txt)
      .then(() => toast('Copiado'))
      .catch(() => toast('No se pudo copiar: selecciónalo y cópialo a mano'));
  }
  const Sec = ({ s }) => (
    <h3 className="sec-h"><span className="sec-n">{nsec(s)}</span>{etiqueta[s]}</h3>
  );

  return (
    <div className="blk claro" id={`b${b.n}`}>
      <div className="donde-p">
        <span>Paso {numero} de {totalVisible}</span>
        {b.clase && <span className="clase">{b.clase}</span>}
      </div>
      <div className="cab">
        <div className="cab-t">
          <h2>{b.titulo}</h2>
          <TextoInline texto={b.tarea || ''} className="tarea" />
        </div>
        {b.capa && <Cebolla capa={b.capa} />}
      </div>

      {secs.includes('hazlo') && (
        <section className="sec">
          <Sec s="hazlo" />
          <ol className="hazlo">
            {b.pruebas.map((p, i) => (
              <li key={i}>
                <TextoInline as="span" texto={p} />
                {b.copiar && b.copiar.tras === i && (
                  <div className="pegar">
                    <p>{b.copiar.txt}</p>
                    <button type="button" className="btn btn-g" onClick={() => copiar(b.copiar.txt)}>Copiar</button>
                  </div>
                )}
              </li>
            ))}
          </ol>
          {b.copiarReglas && reglas && <CopiarReglas cfg={b.copiarReglas} reglas={reglas} />}
        </section>
      )}

      {secs.includes('anota') && (
        <section className="sec">
          <Sec s="anota" />
          <div className="campos">
            {grupos.map((g, i) => <Grupo key={i} g={g} datos={datos} onChange={onChange} />)}
            {b.aviso && <TextoInline texto={b.aviso} className="aviso" />}
          </div>
        </section>
      )}

      {secs.includes('comprueba') && (
        <section className="sec">
          <Sec s="comprueba" />
          <div className="qc">
            <ul>{b.check.map((c, i) => <TextoInline key={i} as="li" texto={c} />)}</ul>
          </div>
        </section>
      )}

      <div className="cta">
        {hecho && <p className="hecho-ok">✓ Ya lo marcaste como hecho.</p>}
        <button type="button" className="btn btn-p cta-p" onClick={onHecho}>{b.siguiente || 'Hecho · siguiente paso →'}</button>
        {b.siFalla && (
          <button type="button" className="btn btn-g cta-g" aria-expanded={falla} aria-controls={`falla-${b.n}`} onClick={() => setFalla((f) => !f)}>
            No funciona: qué hago
          </button>
        )}
        {falla && (
          <div className="falla" id={`falla-${b.n}`}>
            <ul>{b.siFalla.map((t, i) => <TextoInline key={i} as="li" texto={t} />)}</ul>
            <p>Si sigue sin funcionar, pulsa «Necesito ayuda con este paso», al pie, y sigue con el paso siguiente.</p>
          </div>
        )}
      </div>

      <Ayudas b={b} ask={typeof b.ask === 'string' ? { lab: 'Pregúntale a tu asistente de IA', txt: b.ask } : b.ask} resto={resto} duda={duda} onDuda={onDuda} enlaces />
    </div>
  );
}

function BloqueClasico({ b, datos, onChange, total, rotulo, preparar, duda, onDuda, ruta, reglas }) {
  // b.ask puede venir como cadena (hoja 1) o como {lab, txt} (hoja 0).
  const ask = typeof b.ask === 'string' ? { lab: 'Pregúntale a tu asistente de IA', txt: b.ask } : b.ask;
  // Un grupo marcado para una ruta solo sale en esa ruta: quien trae idea no
  // ha generado nada y no se le pregunta cuándo dejó de generar.
  const grupos = (b.grupos || []).filter((g) => !g.soloRuta || !ruta || g.soloRuta === ruta);
  const que = b.que || [];
  // Sin `tarea` en los datos, el primer párrafo hace de instrucción: la hoja
  // sigue funcionando, sólo se lee peor.
  const tarea = b.tarea || que[0] || '';
  // Con `porque`, la pantalla se queda en la tarea y una frase: todo lo que
  // explica pasa entero a «Por qué se pide esto». Es la hoja 1, que se
  // rellena en clase mientras la explicación la da el profesor de viva voz.
  const contexto = b.porque ? null : (b.tarea ? que[0] : null);
  const resto = b.porque || que.slice(1);

  return (
    <div className="blk" id={`b${b.n}`}>
      <div className="bk">{rotulo || `Bloque ${+b.n}${total ? ` de ${total}` : ''}`}{b.clase && <em>{b.clase}</em>}{b.min && <em>{b.min}</em>}</div>
      <h2>{b.titulo}</h2>
      <TextoInline texto={tarea} className="tarea" />
      {contexto && <TextoInline texto={contexto} className="ctx" />}

      {/* Preparar el asistente estaba escondido dentro de un desplegable de
          ayuda: quien no lo abría, nunca lo veía. Ahora va arriba, a la vista. */}
      {preparar && <Preparar {...preparar} />}

      {/* La comparación grabada se queda a la vista: es el mecanismo, no una
          ayuda. Dos ejecuciones reales del mismo caso, una al lado de otra. */}
      {b.comparacion && <Comparacion c={b.comparacion} />}
      {/* Las tres pruebas del contraste son la tarea de ese bloque. */}
      {b.pruebas && (
        <div className="contraste">
          <h3>{b.pruebasTitulo || 'Tres pruebas'}</h3>
          <ol>{b.pruebas.map((x, i) => <TextoInline key={i} as="li" texto={x} />)}</ol>
        </div>
      )}
      {b.thead && (
        <div className="thead">
          {b.thead.map((t, i) => <div key={i}>{esc(t)}</div>)}
        </div>
      )}
      {b.copiarReglas && reglas && <CopiarReglas cfg={b.copiarReglas} reglas={reglas} />}
      <div className="campos">
        {grupos.map((g, i) => <Grupo key={i} g={g} datos={datos} onChange={onChange} />)}
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
        duda={duda}
        onDuda={onDuda}
      />
    </div>
  );
}

// La fila de ayudas. Una abierta cada vez: dos paneles abiertos a la vez
// devuelven la pantalla al estado del que veníamos.
function Ayudas({ b, ask, resto, duda, onDuda, enlaces }) {
  const toast = useToast();
  const [abierta, setAbierta] = useState(null);
  const marcada = duda !== undefined && duda !== null;

  function copiar(txt, ok) {
    alPortapapeles((txt || '').trim())
      .then(() => toast(ok))
      .catch(() => toast('No se pudo copiar: selecciónalo y cópialo a mano'));
  }

  const items = [];
  if (enlaces) {
    // La hoja 1 los pone en el orden de la slide «Tres botones»: primero el
    // ejemplo y la duda; lo demás, detrás.
    if (b.ejemplo) items.push({ id: 'ej', rot: 'Ver un ejemplo inventado' });
    if (onDuda) items.push({ id: 'du', rot: 'Tengo una duda sobre este paso', marca: marcada });
    if (b.cicatriz || resto.length) items.push({ id: 'de', rot: 'Por qué se pide esto' });
    if (b.encargo || ask) items.push({ id: 'ia', rot: 'Pedir ayuda a la IA' });
  } else {
    if (b.encargo || ask) items.push({ id: 'ia', rot: 'Pedir ayuda a la IA' });
    if (b.ejemplo) items.push({ id: 'ej', rot: 'Ver un ejemplo inventado' });
    if (b.cicatriz || resto.length) items.push({ id: 'de', rot: 'Por qué se pide esto' });
    if (onDuda) items.push({ id: 'du', rot: 'Tengo una duda sobre este paso', marca: marcada });
  }
  if (!items.length) return null;

  function toggle(id) {
    setAbierta((a) => (a === id ? null : id));
    // Abrir «Tengo una duda» ya marca el bloque: quien lo abre es porque tiene
    // algo que preguntar, y escribir qué es sigue siendo opcional.
    if (id === 'du' && !marcada) onDuda(b.n, '');
  }

  return (
    <div className={'ayu' + (enlaces ? ' enl' : '')}>
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
          {b.encargo && (
            <div className="encargo">
              <div className="lab">
                <span>Las instrucciones, listas para copiar</span>
                <button className="mini" onClick={() => copiar(b.encargo, 'Copiado: pégalo en tu asistente de IA')}>Copiar</button>
              </div>
              <pre>{b.encargo}</pre>
              <p className="n">Son los cinco apartados de la sesión. Tú lo pegas en tu asistente de IA y decides qué aceptas de lo que te devuelve.</p>
            </div>
          )}
          {ask && (
            <div className="ask">
              <div className="lab">
                <span>{ask.lab || 'Pregúntale a tu asistente de IA'}</span>
                <button className="mini" onClick={() => copiar(ask.txt, 'Pregunta copiada')}>Copiar</button>
              </div>
              <p>{ask.txt}</p>
            </div>
          )}
        </div>
      )}

      {abierta === 'ej' && (
        <div className="ayp" id={`ayp-${b.n}-ej`}>
          <p className="ayn">Ábrelo después de escribir lo tuyo, no antes.</p>
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
              <div className="lab">Por qué se pide esto</div>
              <TextoInline texto={b.cicatriz} />
            </div>
          )}
        </div>
      )}

      {abierta === 'du' && (
        <div className="ayp" id={`ayp-${b.n}-du`}>
          <div className="duda on">
            <div className="lab">
              <span>Me la llevo a clase</span>
              <button className="mini" onClick={() => { onDuda(b.n, null); setAbierta(null); }}>Quitar</button>
            </div>
            <input
              type="text"
              className="c"
              placeholder="Escribe tu duda (opcional)"
              aria-label="Tu duda sobre este paso"
              value={duda ?? ''}
              onChange={(e) => onDuda(b.n, e.target.value)}
            />
            <p className="n">Aparecerá al final de tu documento, con el nombre del paso, para que la lleves a clase.</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Preparar el asistente de IA. Primero vivió suelto en el primer bloque y
// luego dentro de «Pedírselo a la IA», donde casi nadie lo veía. Ahora va a
// la vista, en tres pasos numerados.
function Preparar({ paso0, onCopiarPrompt, onCopiarGuia }) {
  const pasos = paso0.pasos || [];
  return (
    <section className="p0b p0-visible" aria-labelledby="p0-h">
      <h3 id="p0-h">{paso0.titulo}{paso0.min && <span> · {paso0.min}</span>}</h3>
      <ol className="p0l">
        <li><TextoInline as="span" texto={pasos[0] || ''} /></li>
        <li>
          <TextoInline as="span" texto={pasos[1] || ''} />
          <div className="p0a"><button className="btn btn-p" onClick={onCopiarPrompt}>Copiar instrucciones</button></div>
          <details className="p0ver">
            <summary>Ver las instrucciones</summary>
            <div className="snip">{paso0.prompt}</div>
          </details>
        </li>
        <li>
          <TextoInline as="span" texto={pasos[2] || ''} />
          <div className="p0a"><button className="btn btn-g" onClick={onCopiarGuia}>Copiar la guía</button></div>
        </li>
      </ol>
      {paso0.nota && <p className="p0nota">{paso0.nota}</p>}
    </section>
  );
}

// «Copiar mis instrucciones»: las siete reglas que ha escrito el alumno, en
// un texto listo para pegar en las instrucciones de su asesor. Si falta
// alguna, lo dice y deja copiar igualmente.
function CopiarReglas({ cfg, reglas }) {
  const toast = useToast();
  const [aviso, setAviso] = useState(false);
  function copiar(forzar) {
    if (reglas.faltan && !forzar) { setAviso(true); return; }
    alPortapapeles(reglas.texto)
      .then(() => { setAviso(false); toast('Copiado: pégalo en las instrucciones de tu asesor'); })
      .catch(() => toast('No se pudo copiar: selecciónalo y cópialo a mano'));
  }
  return (
    <div className="copiar-reglas">
      <button type="button" className="btn btn-p" onClick={() => copiar(false)}>{cfg.boton}</button>
      {aviso && (
        <div className="aviso" role="alert">
          <TextoInline as="span" texto={cfg.faltan} />
          <div className="va"><button type="button" className="btn btn-g" onClick={() => copiar(true)}>{cfg.igual}</button></div>
        </div>
      )}
      <details className="p0ver">
        <summary>Ver las instrucciones</summary>
        <div className="snip">{reglas.texto}</div>
      </details>
    </div>
  );
}
