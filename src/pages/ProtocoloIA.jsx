import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { alPortapapeles, bajar } from '../lib/portapapeles';
import { plan, ics, planMd, leemeMd } from '../lib/plan30';
import { TEXTOS } from '../lib/textos';
import {
  DISPARA, GENERICO, PIEZAS, REPARTO, VAGO,
  fechaLarga, ficheros, hoy, lleno, partesVista, pega, soloEncargo,
} from '../lib/protocoloAiFirst';

// Asistente del método (sesión 1), portado 1:1 de dist/sitio/*.html + app.js
// (Método AI-First, lo que genera sitio.py). Misma estructura de página
// (.taller con el paso a la izquierda y el fichero escribiéndose a la
// derecha), mismos componentes (.op, .chip, .frase-viva, .semilla, .pista)
// y mismos textos.
//
// Única desviación deliberada respecto al sitio estático: allí cada paso es
// una página con su propia <header class="barra"> y los puntos de progreso
// dentro. Aquí la barra superior ya la pone App.jsx para toda la app, así
// que los puntos van en una fila propia debajo, con las mismas clases
// (.progreso/.punto) — para no apilar dos cabeceras.

// El repositorio plantilla que el alumno copia con «Use this template».
// Mientras esté vacío, la pantalla de GitHub no enseña el botón ni habla de
// él: antes un enlace inventado llevaba a un 404, que es peor que no tenerlo.
// Poner aquí la URL real es lo único que hace falta para activarlo.
const URL_PLANTILLA = '';

const N_PASOS = 7;
const PASO_LISTO = 8;
const PASO_GITHUB = 9;

const CABECERA = {
  1: { titulo: 'Tu frase de valor', intro: 'Rellena los dos huecos. La frase se escribe sola debajo.' },
  2: { titulo: 'En qué fase está tu proyecto', intro: 'Elige la que describe hoy, no la que te gustaría. La lista de abajo cambia con lo que elijas: es el método que te toca montar.' },
  3: { titulo: 'Tus tres líneas rojas', intro: 'Tres frases en primera persona. Debajo de cada una tienes un ejemplo que puedes meter en el campo de un clic y reescribir.' },
  4: { titulo: 'Quién decide qué', intro: 'Dos conversaciones distintas con una IA: una pide criterio, la otra ejecuta. Quien construye algo no puede ser quien juzga si está bien.' },
  5: { titulo: 'Cuándo usas IA y cuándo no', intro: 'Tres reglas. Cada una necesita una condición que la active y algo que se pueda observar. Según escribes, debajo del campo te digo qué le falta a la tuya para poder incumplirse.' },
  6: { titulo: 'Lo que vas a poner a prueba esta semana', intro: 'Tu método ya está montado. Ahora lo que falta es que pase algo fuera de tu mesa. Tres campos y sales de aquí con una cita.' },
  7: { titulo: 'Tu primer encargo', intro: 'Esto es lo que le vas a pedir a una IA para llegar a esa conversación con algo en la mano. Está escrito con tus respuestas; rellena los dos huecos y ya se puede enviar.' },
};

const FICHERO_DE = {
  1: { f: 'metodo/00_VALOR.md', campos: ['quien', 'que'] },
  2: { f: 'metodo/00_VALOR.md', campos: ['quien', 'que', 'columna'] },
  3: { f: 'metodo/02_LINEAS_ROJAS.md', campos: ['roja1', 'roja2', 'roja3', 'firma'] },
  4: { f: 'metodo/01_ROLES.md', campos: ['asesor', 'checkpoint'] },
  5: { f: 'metodo/02_LINEAS_ROJAS.md', campos: ['usare', 'no-usare', 'validar'] },
  6: { f: 'metodo/03_HIPOTESIS.md', campos: ['suposicion', 'persona', 'cuando'] },
  7: { f: 'metodo/encargos/primera-tanda.md', campos: ['pieza', 'acepto'] },
};

// El recorrido guarda donde guardaba el sitio estático: una sola clave de
// localStorage con las respuestas en plano. No toca el dossier de IA-Lab —
// son dos cosas distintas y no deben mezclarse.
const LLAVE = 'metodo-ai-first';

function useEsAncho() {
  const [ancho, setAncho] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1040px)').matches
  );
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1040px)');
    const cambia = (e) => setAncho(e.matches);
    mq.addEventListener('change', cambia);
    return () => mq.removeEventListener('change', cambia);
  }, []);
  return ancho;
}

function leerGuardado() {
  try { return JSON.parse(localStorage.getItem(LLAVE)) || {}; } catch (e) { return {}; }
}

export default function ProtocoloIA() {
  const navigate = useNavigate();
  const toast = useToast();
  const [query] = useSearchParams();
  const guardadas = useMemo(leerGuardado, []);

  const [d, setD] = useState(() => ({ fecha: hoy(), ...guardadas }));
  // El mapa enlaza a un paso concreto (?paso=N), como paso-N.html en el sitio.
  const [paso, setPaso] = useState(() => {
    const p = Number(query.get('paso'));
    if (p >= 1 && p <= N_PASOS) return p;
    return guardadas._paso || 1;
  });
  const [verGate, setVerGate] = useState(false);
  const debounce = useRef(null);
  const tituloRef = useRef(null);
  const esAncho = useEsAncho();

  // al cambiar de paso el foco va al título, no al <body>: con teclado, si no,
  // hay que tabular otra vez desde la cabecera
  useEffect(() => {
    if (paso <= N_PASOS) tituloRef.current?.focus();
  }, [paso]);

  // el mapa enlaza a ?paso=N estando ya dentro del recorrido
  useEffect(() => {
    const p = Number(query.get('paso'));
    if (p >= 1 && p <= N_PASOS) setPaso(p);
  }, [query]);

  // autosave con el mismo debounce que el resto de la app (700 ms)
  useEffect(() => {
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => guarda(d, paso), 700);
    return () => clearTimeout(debounce.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d]);

  function guarda(datos, p, extra = {}) {
    try {
      localStorage.setItem(LLAVE, JSON.stringify({ ...datos, ...extra, _paso: Math.min(p, N_PASOS) }));
    } catch (e) { /* almacenamiento no disponible */ }
  }

  function set(k, v) {
    setD((prev) => ({ ...prev, [k]: v }));
  }

  function irPaso(n) {
    setVerGate(false);
    setPaso(n);
    guarda(d, n);
    window.scrollTo(0, 0);
  }

  function siguiente() {
    if (paso === 2 && !d.columna) {
      setVerGate(true);
      setTimeout(() => document.getElementById('gate')?.scrollIntoView({ block: 'center' }), 0);
      return;
    }
    if (paso === 1) {
      const vacio = !(d.quien || '').trim() || !(d.que || '').trim();
      if (vacio) {
        setVerGate(true);
        setTimeout(() => {
          document.getElementById('gate')?.scrollIntoView({ block: 'center' });
          document.getElementById(!(d.quien || '').trim() ? 'quien' : 'que')?.focus();
        }, 0);
        return;                      // no avanza. Es el gate, no una validación.
      }
    }
    irPaso(paso + 1);
  }

  function copiar(texto, etiqueta = 'Copiado') {
    alPortapapeles(texto).then(() => toast(etiqueta))
      .catch(() => toast('No he podido copiarlo: selecciónalo y cópialo a mano'));
  }

  const fs = useMemo(() => ficheros(d, false), [d]);

  const enPaso = paso <= N_PASOS;
  const vista = FICHERO_DE[paso];

  return (
    <div className={'pagina' + (enPaso ? ' ancha' : '')}>
      <div className="volver-fila">
        <button className="lnk volver" onClick={() => navigate('/metodo')}>← Método AI-First</button>
        <button className="lnk volver" onClick={() => navigate('/metodo/mapa')}>Ver el mapa completo →</button>
      </div>

      {enPaso && <Progreso paso={paso} onIr={irPaso} />}

      {enPaso ? (
        <div className="taller">
          <div className="paso">
            <p className="rotulo">Paso {paso} de {N_PASOS}</p>
            <h1 tabIndex={-1} ref={tituloRef}>{CABECERA[paso].titulo}</h1>
            <p>{CABECERA[paso].intro}</p>

            {!esAncho && <Vista d={d} fichero={vista.f} campos={vista.campos} ancho={false} />}

            {paso === 1 && <Paso1 d={d} set={set} verGate={verGate} />}
            {paso === 2 && <Paso2 d={d} set={set} verGate={verGate} />}
            {paso === 3 && <Paso3 d={d} set={set} />}
            {paso === 4 && <Paso4 d={d} set={set} />}
            {paso === 5 && <Paso5 d={d} set={set} />}
            {paso === 6 && <Paso6 d={d} set={set} />}
            {paso === 7 && (
              <Paso7
                d={d} set={set} esAncho={esAncho}
                texto={soloEncargo(fs['metodo/encargos/primera-tanda.md'])}
                onCopiar={copiar}
              />
            )}

            <div className="acciones">
              <button className="btn" onClick={siguiente}>
                {paso === 7 ? 'Ver lo que me llevo' : 'Siguiente'}
              </button>
              <button className="btn btn-2" onClick={() => (paso === 1 ? navigate('/metodo') : irPaso(paso - 1))}>
                Atrás
              </button>
            </div>
          </div>

          {esAncho && <Vista d={d} fichero={vista.f} campos={vista.campos} ancho />}
        </div>
      ) : paso === PASO_LISTO ? (
        <Listo d={d} fs={fs} onCopiar={copiar} onIr={irPaso} navigate={navigate} toast={toast} />
      ) : (
        <AGithub onIr={irPaso} />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Progreso({ paso, onIr }) {
  return (
    <div className="progreso-fila">
      <nav className="progreso" aria-label="Progreso del recorrido">
        {Array.from({ length: N_PASOS }, (_, i) => {
          const n = i + 1;
          const cls = n < paso ? 'punto hecho' : n === paso ? 'punto aqui' : 'punto';
          if (n < paso) {
            return (
              <button key={n} className={cls} onClick={() => onIr(n)} aria-label={`Volver al paso ${n}`}>
                <span />
              </button>
            );
          }
          return (
            <span
              key={n}
              className={cls}
              aria-current={n === paso ? 'step' : undefined}
              aria-label={n === paso ? `Paso ${n}, aquí` : `Paso ${n}, todavía no`}
            >
              <span />
            </span>
          );
        })}
      </nav>
      <p className="progreso-txt">paso {paso} de {N_PASOS}</p>
    </div>
  );
}

function Vista({ d, fichero, campos, ancho }) {
  const texto = ficheros(d, true)[fichero] || '';
  const partes = partesVista(texto);
  const hechos = campos.filter((k) => lleno(k, d)).length;
  const [abierta, setAbierta] = useState(ancho);
  return (
    <details className={'vista' + (ancho ? '' : ' vista-movil')} open={abierta}
      onToggle={(e) => setAbierta(e.target.open)}>
      <summary>
        <span className="mono">{fichero}</span>
        <span className="rotulo" role="status">{hechos} de {campos.length}</span>
      </summary>
      <pre aria-hidden="true">
        {partes.map((p, i) =>
          p.t === 'mark' ? <mark key={i}>{p.s}</mark>
            : p.t === 'pend' ? <span className="pendiente" key={i}>{p.s}</span>
              : <span key={i}>{p.s}</span>
        )}
      </pre>
    </details>
  );
}

/* --------------------------- paso 1 --------------------------- */

function Paso1({ d, set, verGate }) {
  const q = (d.quien || '').trim(), w = (d.que || '').trim();
  const reaccion = pega(q, GENERICO.quien) || pega(w, GENERICO.que);
  return (
    <>

      <div className="campo">
        <label htmlFor="quien">Quién</label>
        <p className="ayuda" id="ayuda-quien">Una persona concreta, no «los usuarios».</p>
        <input type="text" id="quien" aria-describedby="ayuda-quien" autoComplete="off"
          placeholder="una persona, con su oficio"
          aria-invalid={verGate && !q ? true : undefined}
          value={d.quien || ''} onChange={(e) => set('quien', e.target.value)} />
        <p className="ejemplo">Por ejemplo: una responsable de marketing sin equipo técnico.</p>
      </div>

      <div className="campo">
        <label htmlFor="que">Qué decide</label>
        <p className="ayuda" id="ayuda-que">Algo que alguien decide un martes por la mañana.</p>
        <input type="text" id="que" aria-describedby="ayuda-que" autoComplete="off"
          placeholder="una decisión concreta"
          aria-invalid={verGate && !w ? true : undefined}
          value={d.que || ''} onChange={(e) => set('que', e.target.value)} />
        <p className="ejemplo">Por ejemplo: qué cambiar en su web antes de pagar un rediseño.</p>
      </div>

      <div className="frase-viva">
        <p className="rotulo">Tu frase</p>
        <p>
          Este trabajo produce valor cuando{' '}
          <span className={q ? 'lleno' : 'hueco'}>{q || '[quién]'}</span>{' '}
          puede tomar mejor la decisión de{' '}
          <span className={w ? 'lleno' : 'hueco'}>{w || '[qué]'}</span>.
        </p>
      </div>

      {reaccion && <div className="reaccion" role="status">{reaccion}</div>}

      <details className="pliegue">
        <summary>Ver una que funciona y dos que no</summary>
        <div className="pliegue-en">
          <blockquote><p>Este trabajo produce valor cuando <strong>[quién]</strong> puede tomar mejor la decisión de <strong>[qué]</strong>.</p></blockquote>
          <p>Una persona concreta y una decisión concreta. Sin adjetivos.</p>
          <p><strong>Una que funciona:</strong></p>
          <blockquote><p><em>…cuando una responsable de marketing sin equipo técnico puede tomar mejor la decisión de qué cambiar en su web antes de pagar un rediseño.</em></p></blockquote>
          <p><strong>Dos que no, y por qué:</strong></p>
          <blockquote>
            <p><em>…cuando ayudo a las empresas a mejorar su presencia digital.</em></p>
            <p>No hay decisión. «Mejorar» no es algo que alguien decida un martes por la mañana.</p>
          </blockquote>
          <blockquote>
            <p><em>…cuando los usuarios tienen una experiencia mejor.</em></p>
            <p>«Los usuarios» no es nadie en concreto, así que mañana no sabrás a quién preguntar.</p>
          </blockquote>
          <p>No hace falta acertar a la primera; hace falta que esté escrita y fechada, para notar el día que deje de ser cierta.</p>
          <p><strong>Si no te sale, para aquí.</strong> Deja el resto para otro día y ve a hablar con alguien que pudiera ser ese «quién». Es lo único que lo desatasca.</p>
        </div>
      </details>

      <div className="campo">
        <label htmlFor="fecha">Fecha de hoy</label>
        <input type="date" id="fecha" value={d.fecha || hoy()} onChange={(e) => set('fecha', e.target.value)} />
      </div>

      {verGate && (
        <div className="aviso" id="gate" role="status" aria-live="polite">
          <p className="rotulo">Para aquí</p>
          <p>Sin esa frase, lo que viene después no tiene contra qué compararse.
            No es que lo estés haciendo mal: es que todavía no sabes para quién es, y eso
            no lo resuelve ningún método — lo resuelve hablar con alguien que pudiera ser
            ese «quién». Vuelve cuando puedas escribirla, aunque sea dentro de una semana.</p>
        </div>
      )}
    </>
  );
}

/* --------------------------- paso 2 --------------------------- */

const COLUMNAS = [
  ['A', 'Todavía no sé qué estoy construyendo', 'Tienes una idea y ganas. Puede que hasta tengas claro para quién es. Lo que no tienes es ninguna prueba de que a alguien le importe.'],
  ['B', 'Ya sé qué es, y estoy probando si sirve', 'Existe algo que puedes enseñar: una web, un documento, una primera versión. Estás averiguando si de verdad le resuelve algo a alguien.'],
  ['C', 'Funciona, y hay gente usándolo', 'Personas que no eres tú lo usan sin que tú estés delante. A partir de aquí, cada error lo paga alguien más.'],
];

function Paso2({ d, set, verGate }) {
  const r = d.columna ? REPARTO[d.columna] : null;
  const hoy = r ? PIEZAS.slice(0, r.hasta) : [];
  const luego = r ? PIEZAS.slice(r.hasta) : [];
  return (
    <>

      <div className="ops" role="group" aria-label="Elige tu columna">
        {COLUMNAS.map(([letra, tit, txt]) => (
          <button key={letra} className="op" aria-pressed={d.columna === letra}
            onClick={() => set('columna', letra)}>
            <span className="letra" aria-hidden="true">{letra}</span>
            <span><strong>{tit}</strong><br /><span className="cuerpo-2">{txt}</span></span>
          </button>
        ))}
      </div>

      {!r && verGate && (
        <div className="aviso" id="gate" role="status" aria-live="polite">
          <p className="rotulo">Elige una</p>
          <p>Lo que montas y lo que le pides a una IA cambia con la fase en la
            que estás. Si dudas entre dos, quédate con la de menos: se sube de
            columna cuando aparece la prueba, no antes.</p>
        </div>
      )}

      {r && (
        <>
          <div className="reparto">
            <p className="rotulo">Lo que montas hoy, aquí mismo</p>
            <ul className="marcas">
              {hoy.map((p) => (
                <li className="si" key={p}>
                  <span className="marca" aria-hidden="true">✓</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
            <p className="cuerpo-2">No tienes que crearlos tú: los va escribiendo
              este recorrido con lo que contestes, y te los llevas al final.</p>
          </div>

          <div className="reparto reparto-luego">
            <p className="rotulo">Lo que llega más adelante</p>
            <ul className="marcas">
              {luego.map((p) => (
                <li className="no" key={p}>
                  <span className="marca" aria-hidden="true">·</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
            <p className="cuerpo-2">{r.nota}</p>
          </div>

          <details className="pliegue">
            <summary>Tres palabras que vas a ver y no son de tu oficio</summary>
            <div className="pliegue-en">
              <p><strong>.md</strong> — un fichero de texto normal, sin formato.
                Se abre con cualquier editor y lo lee cualquier IA. Nada que
                instalar.</p>
              <p><strong>encargos/</strong> — la barra final significa carpeta:
                dentro va un encargo por cada tanda de trabajo.</p>
              <p><strong>gate</strong> — un control de sí o no sobre lo que te
                entregan, escrito antes de pedirlo. Se prueba con un caso que
                tiene que rechazar: si no salta, el gate no existe todavía.</p>
            </div>
          </details>
        </>
      )}
    </>
  );
}

/* --------------------------- paso 3 --------------------------- */

const ROJAS = [
  ['roja1', '1 · Qué no afirmaré nunca sin evidencia', 'Lo que no vas a decir en público sin haberlo comprobado.',
    'No diré que el producto «detecta» nada que no haya comprobado sobre al menos veinte casos reales.'],
  ['roja2', '2 · Qué datos no compartiré nunca con un modelo', 'Lo que no vas a pegar en un chat: datos de clientes, nombres, facturación.',
    'No pegaré en ningún modelo datos de clientes con nombres, correos o facturación.'],
  ['roja3', '3 · Qué no publicaré nunca sin que lo mire alguien', 'Lo que no sale sin una segunda persona delante.',
    'No publicaré ninguna cifra de resultados sin que alguien de fuera haya visto de dónde sale.'],
];

function Paso3({ d, set }) {
  const [puestas, setPuestas] = useState({});
  function sembrar(k, texto) {
    set(k, texto);
    setPuestas((p) => ({ ...p, [k]: true }));
    setTimeout(() => {
      const c = document.getElementById(k);
      if (c) { c.focus(); c.setSelectionRange(c.value.length, c.value.length); }
    }, 0);
  }
  return (
    <>

      {ROJAS.map(([k, label, ayuda, semilla]) => (
        <div className="campo" key={k}>
          <label htmlFor={k}>{label}</label>
          <p className="ayuda" id={`ayuda-${k}`}>{ayuda}</p>
          <textarea id={k} aria-describedby={`ayuda-${k}`}
            value={d[k] || ''} onChange={(e) => set(k, e.target.value)} />
          <div className="semilla">
            <p className="cuerpo-2"><em>{semilla}</em></p>
            <button className="btn btn-2 chico" onClick={() => sembrar(k, semilla)}>
              {puestas[k] ? 'Puesta arriba · ahora edítala' : 'Empezar con esta y editarla'}
            </button>
          </div>
        </div>
      ))}

      <div className="campo">
        <label htmlFor="firma">Tu nombre, para firmarlas</label>
        <input type="text" id="firma" placeholder="Nombre y apellido" autoComplete="name"
          value={d.firma || ''} onChange={(e) => set('firma', e.target.value)} />
      </div>
    </>
  );
}

/* --------------------------- paso 4 --------------------------- */

const CHIPS_FIJAS = ['Qué está prohibido.', 'Qué cautelas asume el proyecto.'];
const CHIPS = [
  'Arquitectura, datos y orden técnico.',
  'Si un cambio es seguro de publicar.',
  'Qué se enseña a un cliente y cuándo.',
  'Qué precio tiene lo que haces.',
];
const DIAS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'];
const HORAS = ['09:00', '10:00', '11:00', '12:00', '13:00', '16:00', '17:00', '18:00', '19:00'];

function Paso4({ d, set }) {
  const marcadas = d['asesor-chips'] || [];
  const g = (d.checkpoint || '').match(/^(\S+) a las (\S+)$/);
  const dia = g ? g[1] : 'viernes';
  const hora = g ? g[2] : '17:00';

  // el checkpoint se compone solo al llegar aquí, como componer() en app.js
  useEffect(() => {
    if (!d.checkpoint) set('checkpoint', `${dia} a las ${hora}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function alterna(linea) {
    const i = marcadas.indexOf(linea);
    const lista = marcadas.slice();
    if (i >= 0) lista.splice(i, 1); else lista.push(linea);
    set('asesor-chips', lista);
  }

  return (
    <>

      <div className="campo">
        <label id="rot-asesor">Tu asesor NO decide…</label>
        <p className="ayuda" id="ayuda-asesor">Pulsa las que quieras dentro. Las dos primeras
          van siempre: si no las escribes, se las queda él sin que se lo pidas. Debajo
          puedes añadir las tuyas.</p>
        <div className="chips" role="group" aria-labelledby="rot-asesor">
          {CHIPS_FIJAS.map((c) => (
            <button className="chip fija" key={c} aria-pressed="true" type="button">{c}</button>
          ))}
          {CHIPS.map((c) => (
            <button className="chip" key={c} aria-pressed={marcadas.indexOf(c) >= 0}
              onClick={() => alterna(c)} type="button">{c}</button>
          ))}
        </div>
        <label htmlFor="no-asesor" className="cuerpo-2">Añade las tuyas, una por línea</label>
        <textarea id="no-asesor" aria-describedby="ayuda-asesor" rows={3}
          value={d['no-asesor'] || ''} onChange={(e) => set('no-asesor', e.target.value)} />
      </div>

      <div className="campo">
        <label htmlFor="chk-dia">Tu momento de parar a pensar</label>
        <p className="ayuda" id="ayuda-chk">Un día y una hora fijos para una sola pregunta:
          ¿seguimos resolviendo el problema correcto? Lo que no tiene hora no ocurre.</p>
        <div className="fila">
          <select id="chk-dia" aria-describedby="ayuda-chk" value={dia}
            onChange={(e) => set('checkpoint', `${e.target.value} a las ${hora}`)}>
            {DIAS.map((x) => <option key={x} value={x}>{x}</option>)}
          </select>
          <select id="chk-hora" aria-label="Hora del checkpoint" value={hora}
            onChange={(e) => set('checkpoint', `${dia} a las ${e.target.value}`)}>
            {HORAS.map((x) => <option key={x} value={x}>{x}</option>)}
          </select>
        </div>
      </div>
    </>
  );
}

/* --------------------------- paso 5 --------------------------- */

const REGLAS = [
  ['usare', 'Usaré IA cuando…', 'Donde te ahorra tiempo sin quitarte el criterio: explorar alternativas, ordenar material, un primer borrador que vas a reescribir.'],
  ['no-usare', 'No la usaré cuando…', 'Lo que pierde valor si no lo haces tú: hablar con una persona, decidir qué merece existir, cualquier cosa que vayas a firmar sin poder defenderla.'],
  ['validar', 'Antes de aceptar una respuesta comprobaré…', 'Qué miras antes de dar algo por bueno. Si la respuesta es «que suene bien», ahí tienes el problema.'],
];

function pistaDe(v) {
  const t = (v || '').trim();
  if (!t) return { txt: '', cls: 'pista' };
  if (VAGO.test(t)) return { txt: 'Eso no se puede incumplir: nadie sabría decir si la has roto. Escribe qué harías o qué no.', cls: 'pista avisa' };
  if (!DISPARA.test(t)) return { txt: 'Falta el cuándo. Tal como está, no dice qué la activa.', cls: 'pista avisa' };
  return { txt: 'Se puede incumplir. Vale.', cls: 'pista bien' };
}

function Paso5({ d, set }) {
  return (
    <>

      {REGLAS.map(([k, label, ayuda]) => {
        const p = pistaDe(d[k]);
        return (
          <div className="campo" key={k}>
            <label htmlFor={k}>{label}</label>
            <p className="ayuda" id={`ayuda-${k}`}>{ayuda}</p>
            <textarea id={k} aria-describedby={`ayuda-${k}`}
              value={d[k] || ''} onChange={(e) => set(k, e.target.value)} />
            <p className={p.cls} role="status">{p.txt}</p>
          </div>
        );
      })}
    </>
  );
}

/* --------------------------- paso 6 --------------------------- */

const GENERICOS_PERSONA = ['gente', 'usuarios', 'clientes', 'empresas', 'alguien',
  'personas', 'el sector', 'mi target', 'mi público', 'la gente'];

function Paso6({ d, set }) {
  const per = (d.persona || '').trim().toLowerCase();
  let reaccion = '';
  if (per && GENERICOS_PERSONA.some((g) => per === g || per.indexOf(g + ' ') === 0)) {
    reaccion = 'Eso no es nadie a quien puedas escribir mañana. Pon un nombre.';
  } else if ((d.suposicion || '').trim() && !per) {
    reaccion = 'Falta el nombre de quien puede decirte si eso es verdad.';
  } else if (per && !(d.cuando || '').trim()) {
    reaccion = 'Falta el día. Lo que no tiene fecha no ocurre.';
  }

  return (
    <>

      <div className="campo">
        <label htmlFor="suposicion">Si esto resultara falso, se cae tu plan entero</label>
        <p className="ayuda" id="ayuda-sup">La suposición más grande de las que tienes.
          No la que te preocupa: la que lo sostiene todo. Suele empezar por «la gente
          ya…» o «a nadie le importa que…».</p>
        <textarea id="suposicion" aria-describedby="ayuda-sup"
          placeholder="que quien paga un rediseño ya ha intentado arreglarlo por su cuenta antes"
          value={d.suposicion || ''} onChange={(e) => set('suposicion', e.target.value)} />
      </div>

      <div className="campo">
        <label htmlFor="persona">Quién puede decirte si es verdad</label>
        <p className="ayuda" id="ayuda-persona">Un nombre. «Gente del sector» no es nadie:
          no se puede llamar a nadie que no tenga nombre. Si no se te ocurre ninguno,
          ese es el hallazgo de hoy.</p>
        <input type="text" id="persona" aria-describedby="ayuda-persona" autoComplete="off"
          placeholder="Marta, la de la agencia de Gràcia"
          value={d.persona || ''} onChange={(e) => set('persona', e.target.value)} />
      </div>

      <div className="campo">
        <label htmlFor="cuando">Qué día de esta semana</label>
        <p className="ayuda" id="ayuda-cuando">Una fecha, no «pronto». Lo que no tiene
          día no ocurre.</p>
        <input type="date" id="cuando" aria-describedby="ayuda-cuando"
          value={d.cuando || ''} onChange={(e) => set('cuando', e.target.value)} />
      </div>

      {reaccion && <div className="reaccion" role="status">{reaccion}</div>}

      <details className="pliegue">
        <summary>Cómo va esa conversación, en cinco líneas</summary>
        <div className="pliegue-en">
          <ul>
            <li>Llevas algo concreto: la frase, una página, lo que sea. O nada, y preguntas.</li>
            <li>Preguntas por lo que hace <strong>hoy</strong>, no por lo que haría:
              ¿cómo resuelves esto ahora? ¿qué usas? ¿qué te cuesta?</li>
            <li>«¿Lo usarías?» no vale como única pregunta. Casi nadie le dice que no
              a un desconocido.</li>
            <li>Hablas menos de la mitad del tiempo.</li>
            <li>Después anotas tres frases suyas literales, no tu resumen. Y una cosa
              que te haya sorprendido: si no hay ninguna, o preguntaste mal o te dijeron
              lo que querías oír. Si lo único que puedes escribir es «le gustó», la
              conversación cuenta como cero.</li>
          </ul>
        </div>
      </details>
    </>
  );
}

/* --------------------------- paso 7 --------------------------- */

function Paso7({ d, set, texto, onCopiar, esAncho }) {
  const [copiado, setCopiado] = useState(false);
  function copiar() {
    onCopiar(texto, 'Encargo copiado');
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  }
  return (
    <>

      <div className="campo">
        <label htmlFor="pieza">Qué necesitas tener listo para ese día</label>
        <p className="ayuda" id="ayuda-pieza">Lo más barato que sirva: una página, un
          guion de diez minutos, un correo, un documento de una hoja.</p>
        <input type="text" id="pieza" aria-describedby="ayuda-pieza" autoComplete="off"
          placeholder="un guion de diez minutos para esa conversación"
          value={d.pieza || ''} onChange={(e) => set('pieza', e.target.value)} />
      </div>

      <div className="campo">
        <label htmlFor="acepto">Lo aceptarás cuando…</label>
        <p className="ayuda" id="ayuda-acepto">Qué vas a mirar para darlo por bueno, y
          tiene que ser lo que verá la otra persona — no el borrador del chat.</p>
        <textarea id="acepto" aria-describedby="ayuda-acepto"
          placeholder="lo leo en voz alta en cinco minutos y no tengo que explicar nada de lo que digo"
          value={d.acepto || ''} onChange={(e) => set('acepto', e.target.value)} />
      </div>

      <p className="ayuda">Esto se pega entero en una conversación nueva, en
        blanco, con la IA que uses. Sin historial previo y sin nada más.</p>

      <div className="copiable">
        <div className="copiable-acciones">
          <button className="btn btn-2 copiar" onClick={copiar}>
            {copiado ? 'Copiado' : 'Copiar el encargo'}
          </button>
        </div>
        {esAncho ? (
          <pre>{texto}</pre>
        ) : (
          <details className="pliegue pliegue-encargo">
            <summary>Ver el texto que se va a pegar</summary>
            <pre>{texto}</pre>
          </details>
        )}
      </div>
    </>
  );
}

/* --------------------------- listo --------------------------- */

function Listo({ d, fs, onCopiar, onIr, navigate, toast }) {
  const quien = (d.persona || '').trim(), dia = (d.cuando || '').trim();
  const columna = d.columna || 'A';
  const p30 = useMemo(() => plan(d), [d]);

  const [bajando, setBajando] = useState(false);

  function bajarIcs() {
    const blob = new Blob([ics(d, p30)], { type: 'text/calendar;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'metodo-30-dias.ics';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    toast('Fechas descargadas: ábrelo y tu calendario las añade');
  }

  // Una carpeta de verdad: los ficheros .md con su estructura, no un txt con
  // todo pegado. JSZip se carga sólo cuando se pulsa.
  async function descargar() {
    setBajando(true);
    try {
      const { default: JSZip } = await import('jszip');
      const zip = new JSZip();
      Object.entries(fs).forEach(([nombre, contenido]) => zip.file(nombre, contenido));
      // Lo que acompaña a los ficheros: los cuatro textos pegables, el plan
      // del mes con sus fechas y el .ics. Sin esto la carpeta es el día cero
      // y nada más.
      Object.entries(TEXTOS).forEach(([nombre, contenido]) => zip.file(nombre, contenido));
      zip.file('LEEME.md', leemeMd(d, p30));
      zip.file('PLAN.md', planMd(d, p30));
      zip.file('metodo-30-dias.ics', ics(d, p30));
      const blob = await zip.generateAsync({ type: 'blob' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'metodo.zip';
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      toast('Carpeta descargada');
    } catch (e) {
      const texto = Object.entries(fs)
        .map(([n, c]) => `${'='.repeat(70)}\n${n}\n${'='.repeat(70)}\n\n${c}`)
        .join('\n\n');
      bajar(texto, 'metodo-ai-first.txt', 'text/plain;charset=utf-8');
      toast('Descargado en un solo fichero de texto');
    }
    setBajando(false);
  }

  return (
    <>
      <p className="rotulo">Hecho</p>
      <h1>Lo que te llevas</h1>

      {quien && dia && (
        <div className="tira queda">
          <p className="rotulo">Lo primero que va a pasar</p>
          <p>El {fechaLarga(dia)} hablas con {quien}. Llevas {(d.pieza || 'lo que pide tu encargo').trim()}.</p>
        </div>
      )}

      <p>Abajo está el contenido real de los ficheros de tu método, con tus
        respuestas dentro, y tu primer encargo listo para enviar. Ábrelos, cópialos o
        descárgalo todo.</p>

      <div>
        {Object.entries(fs).map(([nombre, contenido], i) => (
          <details className="fichero" key={nombre} open={i === 0}>
            <summary><span>{nombre}</span><span className="rotulo">abrir</span></summary>
            <pre>{contenido}</pre>
            <div className="pie">
              <button className="btn btn-2" onClick={() => onCopiar(contenido, 'Fichero copiado')}>Copiar</button>
            </div>
          </details>
        ))}
      </div>

      <div className="bloque30">
        <p className="rotulo">Tu mes</p>
        <h2>En dos semanas tienes algo fuera. En cuatro sabes qué cambiar.</h2>
        <ul className="destino">
          <li><b>Día 14:</b> una página en internet que explica qué ofreces y a quién.</li>
          <li><b>Día 21:</b> cinco personas de ese «a quién» la han mirado.</li>
          <li><b>Día 30:</b> publicado, y escrito qué cambiaste por lo que te dijeron.</li>
        </ul>
        <p className="glosa">No es tener la empresa montada. No es facturar. Es que lo que hoy
          está en tu cabeza y en un documento, dentro de un mes esté fuera, lo haya visto
          gente de verdad, y tú sepas algo que hoy no sabes.</p>
        <div className="acciones">
          <button className="btn" onClick={() => navigate('/metodo/plan')}>Ver mi plan de 30 días</button>
          <button className="btn btn-2" onClick={bajarIcs}>Añadir las fechas a mi calendario</button>
        </div>
        <p className="ayuda">Las fechas salen de lo que ya has escrito en los pasos 4 y 6.
          Son tuyas: se mueven. Y en la carpeta van los cuatro textos que te acompañan
          después, en <code>textos/</code>.</p>
      </div>

      <div className="acciones">
        <button className="btn" onClick={descargar} disabled={bajando}>
          {bajando ? 'Preparando…' : 'Descargar la carpeta'}
        </button>
        {columna !== 'A' && (
          <button className="btn btn-2" onClick={() => onIr(PASO_GITHUB)}>Llevarlos a GitHub</button>
        )}
        <button className="btn btn-2" onClick={() => onIr(N_PASOS)}>← Volver al paso 7</button>
      </div>

      {columna === 'A' && (
        <div className="aviso bien">
          <p className="rotulo">GitHub, todavía no</p>
          <p>En tu fase basta con esa carpeta en un sitio que se sincronice y que no
            sea un chat: Drive, Dropbox, iCloud o el que ya uses. Descomprime el zip
            y déjala ahí. El repositorio entra más adelante, antes de que un agente de
            código pueda escribir en tus ficheros: entonces el historial deja de ser
            cómodo y pasa a ser necesario.</p>
        </div>
      )}

      <hr />

      <h2>A quién se lo pasas</h2>
      <p><code>encargos/primera-tanda.md</code> es lo que recibe el ejecutor: quien
        construye la pieza. Quién es ese ejecutor depende de tu columna — no es la
        misma persona ni el mismo canal en las dos.</p>

      {columna === 'A' ? (
        <div className="aviso bien">
          <p className="rotulo">En columna A, tu ejecutor</p>
          <p>Una conversación nueva, con la IA que uses, sin historial previo. Abres un
            chat en blanco, pegas el contenido de <code>primera-tanda.md</code> tal cual
            sale de aquí y nada más. Esa conversación es el ejecutor. No hace falta
            repositorio ni agente de código todavía — eso entra cuando algo de lo que
            construyas necesite tocar más de un fichero a la vez (15.2 del manual).</p>
        </div>
      ) : (
        <div className="aviso bien">
          <p className="rotulo">En tu columna, tu ejecutor</p>
          <p>Un agente de código con tu repositorio delante (Claude Code, Cursor o
            similar). Antes de pegarle el encargo, el repositorio tiene que tener en su
            raíz el fichero <code>CLAUDE.md</code> o <code>AGENTS.md</code> — el mismo
            formato que trae esta plantilla: ahí están las reglas del rol ejecutor
            (Anexo E del manual). Sin ese fichero, el agente no las conoce y decide por
            su cuenta lo que no le has cerrado.</p>
        </div>
      )}

      <hr />

      <h2>Y ahora qué</h2>
      <p>Lo siguiente es la conversación que acabas de poner en el calendario, con la
        pieza que pide tu encargo en la mano. Cuando vuelvas, anotas tres frases suyas
        literales en <code>03_HIPOTESIS.md</code> y cierras la tanda.</p>
      <p>Todo lo demás del método —leer antes de tocar, comprobar una entrega, cerrar
        el día— está en el manual.</p>
      <p>
        <a href="#/guia" onClick={(e) => { e.preventDefault(); navigate('/guia'); }}>Abrir el método</a>
      </p>
    </>
  );
}

/* --------------------------- a GitHub --------------------------- */

function AGithub({ onIr }) {
  return (
    <>
      <h1>Llevar tus ficheros a GitHub</h1>
      <p>Cuatro pasos. No hace falta instalar nada ni saber programar: todo se hace
        desde el navegador.</p>
      <p>El motivo de pasar por aquí y no quedarte con la descarga es el historial.
        Cada vez que cambies algo, la versión anterior sigue estando, y poder cambiar
        de opinión sin perder por qué pensabas lo otro es la mitad del valor del método.</p>
      {URL_PLANTILLA && (
        <div className="acciones acciones-arriba">
          <a className="btn" href={URL_PLANTILLA} target="_blank" rel="noopener noreferrer">
            Abrir la plantilla en GitHub ↗
          </a>
        </div>
      )}

      <ol>
        {URL_PLANTILLA ? (
          <li><strong>Crea tu copia de la plantilla.</strong> Con el botón de arriba se
            abre en una pestaña nueva. Allí pulsa el botón verde
            <em> Use this template</em> → <em>Create a new repository</em>. Ponle nombre y
            márcala <em>Private</em>.</li>
        ) : (
          <li><strong>Crea tu copia de la plantilla.</strong> Ábrela en GitHub y pulsa
            el botón verde <em>Use this template</em> → <em>Create a new repository</em>.
            Ponle nombre y márcala <em>Private</em>.</li>
        )}
        <li><strong>Copia cada fichero.</strong> Vuelve aquí, pulsa el botón de copiar
          de cada uno.</li>
        <li><strong>Pégalo en su sitio.</strong> En tu repositorio, abre el fichero con
          el mismo nombre, pulsa el lápiz, pega y confirma con <em>Commit changes</em>.</li>
        <li><strong>Listo.</strong> Ya tienes tu método montado y con historial.</li>
      </ol>
      <div className="aviso">
        <p className="rotulo">Si no tienes cuenta</p>
        <p>El botón te la pide: correo, contraseña y dos minutos. Es gratis.</p>
      </div>
      <div className="acciones">
        <button className="btn btn-2" onClick={() => onIr(PASO_LISTO)}>Volver a mis ficheros</button>
      </div>
    </>
  );
}
