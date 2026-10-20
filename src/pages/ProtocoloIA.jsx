import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../components/Toast';
import AvisosMes from '../components/AvisosMes';
import { alPortapapeles, bajar } from '../lib/portapapeles';
import { plan, ics, planMd, leemeMd } from '../lib/plan30';
import { TEXTOS } from '../lib/textos';
import {
  DISPARA, GENERICO, PIEZAS, REPARTO, VAGO,
  ficheros, hoy, lleno, partesVista, pega, soloEncargo,
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

// El repositorio plantilla que se copia con «Use this template». La salida
// GitHub del paso 10 abre su /generate en una pestaña nueva.
const URL_PLANTILLA = 'https://github.com/qtorb/metodo-ai-first-plantilla';

const N_PASOS = 9;
const PASO_LISTO = 10;
// Versión del estado guardado. Sin ella, lo guardado viene del recorrido de
// siete pasos y su _paso se traduce con MAPA_V1 al paso equivalente.
const VERSION = 2;
const MAPA_V1 = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 3, 6: 8, 7: 9, 8: 10, 9: 10 };

const CABECERA = {
  1: { rotulo: 'Para qué', titulo: 'Tu frase de valor', intro: 'Rellena los dos huecos. La frase se escribe sola debajo.' },
  2: { rotulo: 'En qué punto estás', titulo: 'Tu columna: en qué punto está tu proyecto', intro: 'Elige la que describe hoy, no la que te gustaría. La lista de abajo cambia con lo que elijas: es el método que te toca montar.' },
  3: { rotulo: 'Capa Tú', titulo: 'Líneas rojas y protocolo de uso', intro: 'Lo que no se toca y cuándo usas IA. Lo firmas tú y lo leen todas las IA que abran tu carpeta.' },
  4: { rotulo: 'Capa Roles', titulo: 'Quién decide qué, y dónde vive cada uno', intro: 'Quien construye no juzga si está bien. Cada rol vive en un sitio distinto, para que ninguno se dé la razón a sí mismo.' },
  5: { rotulo: 'Capa Herramientas', titulo: 'Tu stack', intro: 'Qué abres para cada rol y cuánto cuesta. Nada entra en el stack sin su fila.' },
  6: { rotulo: 'Capa Memoria', titulo: 'La memoria del proyecto', intro: 'Lo que decides y dónde lo dejas, por escrito y con fecha. Hoy dejas hecha la primera entrada.' },
  7: { rotulo: 'Capa Controles', titulo: 'Tu primer gate', intro: 'Un gate es un control con tres respuestas: cumple, incumple o no clasificado. Solo vale si demuestras que sabe decir que no.' },
  8: { rotulo: 'Realidad externa', titulo: 'Lo que vas a poner a prueba esta semana', intro: 'Tu método ya está montado. Ahora lo que falta es que pase algo fuera de tu mesa. Cuatro campos y sales de aquí con una cita.' },
  9: { rotulo: 'El encargo', titulo: 'Tu primer encargo', intro: 'Esto es lo que le vas a pedir a una IA para llegar a esa conversación con algo en la mano. Está escrito con tus respuestas; rellena los dos huecos y ya se puede enviar.' },
};

// El fichero que se ve escribiéndose dentro de cada paso, y los campos que
// cuentan para su «N de M».
const FICHERO_DE = {
  1: { f: 'metodo/00_VALOR.md', campos: ['quien', 'que'] },
  2: { f: 'metodo/00_VALOR.md', campos: ['quien', 'que', 'columna'] },
  3: { f: 'metodo/02_LINEAS_ROJAS.md', campos: ['roja1', 'roja2', 'roja3', 'usare', 'no-usare', 'validar', 'firma'] },
  4: { f: 'metodo/01_ROLES.md', campos: ['asesor', 'checkpoint'] },
  5: { f: 'metodo/09_STACK.md', campos: ['stack_asesor', 'stack_ejecutor', 'presupuesto'] },
  6: { f: 'metodo/07_CIERRE.md', campos: ['cierre_hoy'] },
  7: { f: 'metodo/encargos/primera-tanda.md', campos: ['gate', 'gate_falla'] },
  8: { f: 'metodo/03_HIPOTESIS.md', campos: ['suposicion', 'siNo', 'persona', 'cuando'] },
  9: { f: 'metodo/encargos/primera-tanda.md', campos: ['pieza', 'acepto'] },
};

const esB = (col) => col === 'B' || col === 'C';

// Lo que cada paso escribe en la carpeta (las fichas del final del paso).
function escribeEn(paso, col) {
  switch (paso) {
    case 1: case 2: return ['metodo/00_VALOR.md'];
    case 3: return ['metodo/02_LINEAS_ROJAS.md'];
    case 4: return ['metodo/01_ROLES.md', 'roles/asesor.md'].concat(esB(col) ? ['roles/especialista.md'] : []);
    case 5: return ['metodo/09_STACK.md'];
    case 6: return ['metodo/07_CIERRE.md', 'metodo/08_DECISIONES.md'];
    case 7: return esB(col) ? ['metodo/encargos/primera-tanda.md'] : [];
    case 8: return ['metodo/03_HIPOTESIS.md', 'metodo/04_TAREAS.md'];
    case 9: return ['metodo/encargos/primera-tanda.md'];
    default: return [];
  }
}

// Las 18 filas del panel «Tu carpeta», en este orden. `pasos` = los pasos que
// la escriben; `fija` = etiqueta que no cambia con el paso.
function filasCarpeta(col) {
  return [
    { ruta: 'metodo/00_VALOR.md', pasos: [1, 2] },
    { ruta: 'metodo/02_LINEAS_ROJAS.md', pasos: [3] },
    { ruta: 'metodo/01_ROLES.md', pasos: [4] },
    { ruta: 'roles/asesor.md', pasos: [4] },
    { ruta: 'roles/especialista.md', pasos: [4], fija: esB(col) ? null : 'desde B' },
    { ruta: 'metodo/09_STACK.md', pasos: [5] },
    { ruta: 'metodo/07_CIERRE.md', pasos: [6] },
    { ruta: 'metodo/08_DECISIONES.md', pasos: [6] },
    { ruta: 'metodo/05_VISTO_NO_TOCADO.md', pasos: [], fija: 'se llena al trabajar' },
    { ruta: 'metodo/06_CATALOGO.md', pasos: [], fija: 'se llena al trabajar' },
    { ruta: 'metodo/03_HIPOTESIS.md', pasos: [8] },
    { ruta: 'metodo/04_TAREAS.md', pasos: [8] },
    { ruta: 'metodo/encargos/primera-tanda.md', pasos: esB(col) ? [7, 9] : [9] },
    { ruta: 'CLAUDE.md · AGENTS.md', pasos: [10] },
    { ruta: '.claude/skills/ · 5 skills', pasos: [10] },
    { ruta: 'textos/ · 5 textos para cualquier chat', pasos: [10] },
    { ruta: 'docs/MANUAL.md', pasos: [10] },
    { ruta: 'LEEME.md · PLAN.md · checkpoint.ics', pasos: [10] },
  ];
}

function estadoCarpeta(paso, col) {
  const filas = filasCarpeta(col).map((f) => {
    let estado;
    if (f.fija) estado = 'fija';
    else if (paso >= PASO_LISTO) estado = 'hecho';
    else if (f.pasos.includes(paso)) estado = 'ahora';
    else if (f.pasos.some((p) => p < paso)) estado = 'hecho';
    else estado = 'pendiente';
    const etiqueta = f.fija || (estado === 'ahora' ? 'se escribe ahora' : estado === 'hecho' ? 'hecho' : 'pendiente');
    return { ...f, estado, etiqueta };
  });
  const listos = filas.filter((f) => f.estado === 'hecho' || f.estado === 'ahora').length;
  return { filas, listos, total: filas.length };
}

// El recorrido guarda donde guardaba el sitio estático: una sola clave de
// localStorage con las respuestas en plano. No toca el dossier de IA-Lab —
// son dos cosas distintas y no deben mezclarse.
const LLAVE = 'metodo-ai-first';

function useEsAncho(px = 1040) {
  const q = `(min-width: ${px}px)`;
  const [ancho, setAncho] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(q).matches
  );
  useEffect(() => {
    const mq = window.matchMedia(q);
    const cambia = (e) => setAncho(e.matches);
    mq.addEventListener('change', cambia);
    return () => mq.removeEventListener('change', cambia);
  }, [q]);
  return ancho;
}

function leerGuardado() {
  let g;
  try { g = JSON.parse(localStorage.getItem(LLAVE)) || {}; } catch (e) { return {}; }
  // Estado del recorrido de siete pasos: mismo nombre de campo, otro número
  // de paso. Se traduce una vez y se guarda ya como v2.
  if (g._v !== VERSION && g._paso) g._paso = MAPA_V1[g._paso] || 1;
  return g;
}

function pasoDeQuery(query) {
  const p = Number(query.get('paso'));
  return p >= 1 && p <= PASO_LISTO ? p : null;
}

export default function ProtocoloIA({ n }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [query] = useSearchParams();
  const guardadas = useMemo(leerGuardado, []);

  const [d, setD] = useState(() => ({ fecha: hoy(), ...guardadas }));
  // El mapa enlaza a un paso concreto (?paso=N), como paso-N.html en el sitio.
  const [paso, setPaso] = useState(() => pasoDeQuery(query) || guardadas._paso || 1);
  const [verGate, setVerGate] = useState(false);
  const debounce = useRef(null);
  const tituloRef = useRef(null);
  const esAncho = useEsAncho(1040);
  const conPanel = useEsAncho(960);

  // al cambiar de paso el foco va al título, no al <body>: con teclado, si no,
  // hay que tabular otra vez desde la cabecera
  useEffect(() => {
    tituloRef.current?.focus();
  }, [paso]);

  // el mapa enlaza a ?paso=N estando ya dentro del recorrido
  useEffect(() => {
    const p = pasoDeQuery(query);
    if (p) setPaso(p);
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
      localStorage.setItem(LLAVE, JSON.stringify({ ...datos, ...extra, _paso: Math.min(p, PASO_LISTO), _v: VERSION }));
      // Aviso para la copia en la nube: sin él, el avance del método solo
      // subía cuando cambiaba una hoja de IA-Lab.
      window.dispatchEvent(new Event('guia-local'));
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
    // El paso 8 para igual que el 1 y el 2. Sin sus cuatro campos, el paso 9
    // escribe un encargo con huecos «[por escribir]» y el plan de 30 días se
    // monta sobre una conversación que no existe.
    if (paso === 8) {
      const falta = ['suposicion', 'siNo', 'persona', 'cuando'].find((k) => !(d[k] || '').trim());
      if (falta) {
        setVerGate(true);
        setTimeout(() => {
          document.getElementById('gate')?.scrollIntoView({ block: 'center' });
          document.getElementById(falta)?.focus();
        }, 0);
        return;
      }
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
  const carpeta = estadoCarpeta(paso, d.columna);

  const enPaso = paso <= N_PASOS;
  const vista = FICHERO_DE[paso];
  const escribe = escribeEn(paso, d.columna);

  return (
    <div className="pagina ancha">
      <div className="volver-fila">
        <button className="lnk volver" onClick={() => navigate('/metodo')}>← Método AI-First</button>
        <button className="lnk volver" onClick={() => navigate('/metodo/mapa')}>Ver el mapa completo →</button>
      </div>

      <Progreso paso={paso} onIr={irPaso} />

      {enPaso ? (
        <div className="taller taller-carpeta">
          <div className="paso">
            <p className="rotulo">Paso {paso} de {N_PASOS} · {CABECERA[paso].rotulo}</p>
            <h1 tabIndex={-1} ref={tituloRef}>{CABECERA[paso].titulo}</h1>
            {!conPanel && <Carpeta carpeta={carpeta} movil />}
            <p>{CABECERA[paso].intro}</p>

            <Vista d={d} fichero={vista.f} campos={vista.campos} />

            {paso === 1 && <Paso1 d={d} set={set} verGate={verGate} />}
            {paso === 2 && <Paso2 d={d} set={set} verGate={verGate} />}
            {paso === 3 && (<><Paso3 d={d} set={set} /><Paso5 d={d} set={set} /><Firma d={d} set={set} /></>)}
            {paso === 4 && <Paso4 d={d} set={set} />}
            {paso === 5 && <PasoStack d={d} set={set} />}
            {paso === 6 && <PasoMemoria d={d} set={set} />}
            {paso === 7 && <PasoGate d={d} set={set} />}
            {paso === 8 && <Paso6 d={d} set={set} verGate={verGate} />}
            {paso === 9 && (
              <Paso7
                d={d} set={set} esAncho={esAncho}
                texto={soloEncargo(fs['metodo/encargos/primera-tanda.md'])}
                onCopiar={copiar}
              />
            )}

            {escribe.length > 0 && (
              <div className="escribe">
                <p className="escribe-rot">Este paso escribe en tu carpeta</p>
                <ul className="escribe-fichas">
                  {escribe.map((f) => <li key={f}>{f}</li>)}
                </ul>
              </div>
            )}

            <div className="acciones">
              <button className="btn" onClick={siguiente}>
                {paso === N_PASOS ? 'Ver lo que me llevo' : 'Siguiente'}
              </button>
              <button className="btn btn-2" onClick={() => (paso === 1 ? navigate('/metodo') : irPaso(paso - 1))}>
                Atrás
              </button>
            </div>
          </div>

          {conPanel && <Carpeta carpeta={carpeta} />}
        </div>
      ) : (
        <div className="taller taller-carpeta">
          <div className="paso paso-listo">
            <Listo d={d} fs={fs} onCopiar={copiar} onIr={irPaso} navigate={navigate} toast={toast} n={n} tituloRef={tituloRef}
              carpetaMovil={!conPanel ? <Carpeta carpeta={carpeta} movil /> : null} />
          </div>
          {conPanel && <Carpeta carpeta={carpeta} />}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Progreso({ paso, onIr }) {
  return (
    <div className="progreso-fila">
      <nav className="progreso" aria-label="Progreso del recorrido">
        {Array.from({ length: PASO_LISTO }, (_, i) => {
          const n = i + 1;
          const nombre = n === PASO_LISTO ? 'Llévatelo' : `Paso ${n}`;
          const cls = n < paso ? 'punto hecho' : n === paso ? 'punto aqui' : 'punto';
          if (n < paso) {
            return (
              <button key={n} className={cls} onClick={() => onIr(n)} aria-label={`Volver a ${n === PASO_LISTO ? 'Llévatelo' : `el paso ${n}`}`}>
                <span />
              </button>
            );
          }
          return (
            <span
              key={n}
              className={cls}
              role="img"
              aria-current={n === paso ? 'step' : undefined}
              aria-label={n === paso ? `${nombre}, aquí` : `${nombre}, todavía no`}
            >
              <span />
            </span>
          );
        })}
      </nav>
      <p className="progreso-txt">{paso <= N_PASOS ? `paso ${paso} de ${N_PASOS}` : 'Llévatelo'}</p>
    </div>
  );
}

function ListaCarpeta({ filas }) {
  return (
    <ul className="carpeta-filas">
      {filas.map((f) => (
        <li key={f.ruta} className={'carpeta-fila ' + f.estado}>
          <span className="carpeta-ruta">{f.ruta}</span>
          <span className="carpeta-etq">{f.etiqueta}</span>
        </li>
      ))}
    </ul>
  );
}

function Carpeta({ carpeta, movil }) {
  const resumen = `${carpeta.listos} de ${carpeta.total} listos`;
  if (movil) {
    return (
      <details className="carpeta carpeta-movil">
        <summary>Tu carpeta · {resumen}</summary>
        <ListaCarpeta filas={carpeta.filas} />
      </details>
    );
  }
  return (
    <aside className="carpeta carpeta-panel" aria-label="Tu carpeta">
      <div>
        <p className="carpeta-tit">Tu carpeta</p>
        <p className="carpeta-sub" role="status">{resumen}</p>
      </div>
      <ListaCarpeta filas={carpeta.filas} />
    </aside>
  );
}

function Vista({ d, fichero, campos }) {
  const texto = ficheros(d, true)[fichero] || '';
  const partes = partesVista(texto);
  const hechos = campos.filter((k) => lleno(k, d)).length;
  return (
    <details className="vista vista-movil">
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

      {verGate && (!q || !w) && (
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
    </>
  );
}

// La firma va al final del paso 3, después de las líneas rojas y de las tres
// reglas de uso: firma las dos cosas.
function Firma({ d, set }) {
  return (
    <div className="campo">
      <label htmlFor="firma">Tu nombre, para firmarlas</label>
      <input type="text" id="firma" placeholder="Nombre y apellido" autoComplete="name"
        value={d.firma || ''} onChange={(e) => set('firma', e.target.value)} />
    </div>
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
        <p className="ayuda">Tu asesor sale con tu frase de valor y tu columna ya puestas. Lo pegas una vez en las instrucciones del proyecto, Gem o GPT donde viva.</p>
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

// Esta pista dejó de dar el visto bueno, y es a propósito. Decía «Se puede
// incumplir. Vale.» en cuanto encontraba una conjunción, así que aprobaba
// «cuando sea importante» y «si me apetece» igual que una regla de verdad —
// cuatro revisores externos lo cazaron y la prueba es fácil de repetir. Un
// regex puede detectar que FALTA algo; no puede saber que una regla vale, y
// decirlo enseñaba justo lo contrario de lo que enseña el método.
//
// Lo que queda son los dos diagnósticos que sí detectan algo real, y el
// tercer campo tiene el suyo: su etiqueta ya dice «antes de aceptar una
// respuesta», así que el disparador se lo da la pregunta y lo que le puede
// faltar es qué se mira.
function pistaDe(v, campo) {
  const t = (v || '').trim();
  if (!t) return { txt: '', cls: 'pista' };
  if (VAGO.test(t)) {
    return { txt: 'Eso no se puede incumplir: nadie sabría decir si la has roto. Escribe qué harías o qué no.', cls: 'pista avisa' };
  }
  if (campo === 'validar') {
    return { txt: '', cls: 'pista' };
  }
  if (!DISPARA.test(t)) {
    return { txt: 'Falta el cuándo. Tal como está, no dice qué la activa.', cls: 'pista avisa' };
  }
  return { txt: '', cls: 'pista' };
}

function Paso5({ d, set }) {
  return (
    <>

      {REGLAS.map(([k, label, ayuda]) => {
        const p = pistaDe(d[k], k);
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

/* --------------------- paso 5 nuevo: el stack --------------------- */

function CampoTexto({ d, set, k, label, ayuda, ph }) {
  return (
    <div className="campo">
      <label htmlFor={k}>{label}</label>
      <p className="ayuda" id={`ayuda-${k}`}>{ayuda}</p>
      <input type="text" id={k} aria-describedby={`ayuda-${k}`} autoComplete="off"
        placeholder={ph} value={d[k] || ''} onChange={(e) => set(k, e.target.value)} />
    </div>
  );
}

function PasoStack({ d, set }) {
  return (
    <>
      <CampoTexto d={d} set={set} k="stack_asesor" label="Tu asesor trabaja en"
        ayuda="El producto y el plan. Un proyecto de Claude, un Gem de Gemini, un proyecto de ChatGPT…"
        ph="un proyecto de Claude, plan gratuito" />
      <CampoTexto d={d} set={set} k="stack_ejecutor" label="Lo que ejecuta trabaja en"
        ayuda="Otra conversación, otro asistente o un agente de código. Nunca el mismo sitio que el asesor."
        ph="una conversación nueva de ChatGPT" />
      {esB(d.columna) && (
        <CampoTexto d={d} set={set} k="stack_fuera" label="Te revisa desde fuera"
          ayuda="Un asistente que no conoce tu proyecto y busca lo flojo."
          ph="Gemini, sin instrucciones mías" />
      )}
      <CampoTexto d={d} set={set} k="presupuesto" label="Presupuesto al mes"
        ayuda="Lo que estás dispuesto a pagar. 0 € es una respuesta válida."
        ph="0 €" />
    </>
  );
}

/* -------------------- paso 6 nuevo: la memoria -------------------- */

function PasoMemoria({ d, set }) {
  return (
    <>
      <CampoTexto d={d} set={set} k="cierre_hoy" label="Dónde lo dejas hoy"
        ayuda="Una línea. Es lo primero que leerás la próxima vez, antes de abrir nada."
        ph="he escrito mi método y tengo cita con Marta el jueves" />
      <CampoTexto d={d} set={set} k="cambiar_columna" label="Qué te haría cambiar de columna"
        ayuda="Algo que puedas ver, no una sensación."
        ph="que dos personas usen la página sin que yo esté delante" />
    </>
  );
}

/* --------------------- paso 7 nuevo: el gate --------------------- */

// En columna A no hay gates de resultado (manual, rejilla A/B/C): el paso se
// enseña sin campos y el encargo sigue saliendo sin gate.
function PasoGate({ d, set }) {
  return (
    <>
      {esB(d.columna) ? (
        <>
          <CampoTexto d={d} set={set} k="gate" label="Qué comprueba"
            ayuda="Algo que se mira en lo entregado, no en lo que dice quien lo entrega."
            ph="cada cifra de la página lleva enlace a su fuente" />
          <CampoTexto d={d} set={set} k="gate_falla" label="La prueba que debe fallar"
            ayuda="Un caso que sabes que está mal. Si el gate lo da por bueno, no controla nada."
            ph="una cifra sin enlace: el gate tiene que decir incumple" />
        </>
      ) : (
        <p>En tu columna todavía no hay gates: llegan cuando pases a B.</p>
      )}
      <p>El catálogo de fallos queda abierto en tu carpeta. Se llena cuando algo falle: con nombre, en mayúsculas y con guiones.</p>
    </>
  );
}

/* --------------------------- paso 6 --------------------------- */

const GENERICOS_PERSONA = ['gente', 'usuarios', 'clientes', 'empresas', 'alguien',
  'personas', 'el sector', 'mi target', 'mi público', 'la gente'];

function Paso6({ d, set, verGate }) {
  const per = (d.persona || '').trim().toLowerCase();
  let reaccion = '';
  if (per && GENERICOS_PERSONA.some((g) => per === g || per.indexOf(g + ' ') === 0)) {
    reaccion = 'Eso no es nadie a quien puedas escribir mañana. Pon un nombre.';
  } else if ((d.suposicion || '').trim() && !(d.siNo || '').trim()) {
    reaccion = 'Falta qué haces si resulta falso. Escrito después no vale: para entonces ya sabrás la respuesta.';
  } else if ((d.suposicion || '').trim() && !per) {
    reaccion = 'Falta el nombre de quien puede decirte si eso es verdad.';
  } else if (per && !(d.cuando || '').trim()) {
    reaccion = 'Falta el día. Lo que no tiene fecha no ocurre.';
  } else if ((d.cuando || '').trim() && d.cuando < hoy()) {
    reaccion = 'Ese día ya pasó. La conversación es la que abre el mes, así que tiene que estar por delante.';
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

      {/* Va pegado a la suposición y antes de nombrar a nadie: se escribe
          mientras todavía no se sabe la respuesta, que es lo único que impide
          racionalizarlo después. Mismo texto que trae la plantilla en
          metodo/03_HIPOTESIS.md — si cambia uno, cambian los dos. */}
      <div className="campo">
        <label htmlFor="siNo">Y si resulta falso, ¿qué haces?</label>
        <p className="ayuda" id="ayuda-sino">Escríbelo <b>ahora</b>, que todavía no
          sabes la respuesta. Después de la conversación siempre aparece una manera
          de que lo que oíste encaje con lo que ya querías hacer.</p>
        <textarea id="siNo" aria-describedby="ayuda-sino"
          placeholder="no monto la página de servicios y me dedico a buscar tres casos más antes de construir nada"
          value={d.siNo || ''} onChange={(e) => set('siNo', e.target.value)} />
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
        <input type="date" id="cuando" aria-describedby="ayuda-cuando" min={hoy()}
          value={d.cuando || ''} onChange={(e) => set('cuando', e.target.value)} />
      </div>

      {reaccion && <div className="reaccion" role="status">{reaccion}</div>}

      {verGate && (
        <div className="aviso" id="gate" role="status" aria-live="polite">
          <p className="rotulo">Para aquí</p>
          {/* Mismo gesto que el gate del paso 1, que es el único sitio del sitio
              donde se absuelve a alguien: no es que lo hagas mal, es que todavía no
              sabes algo — y eso se arregla fuera de aquí. La empatía va donde se
              bloquea, no repartida por todas partes. */}
          <p>El encargo del paso 9 se escribe con estos cuatro campos, y el mes se
            cuelga de esa conversación. Sin un nombre y sin un día, lo que te llevas es
            una carpeta con huecos. Si no se te ocurre a quién preguntar, no es que te
            falte método: es que todavía no tienes a quién, y eso se resuelve fuera de
            aquí. Ese es el hallazgo de hoy. Vuelve cuando tengas el nombre.</p>
        </div>
      )}

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

/* --------------------------- paso 10: llévatelo --------------------------- */

// Las cinco skills del método, tal como viven en la plantilla.
const SKILLS = ['encargo', 'recibir-entrega', 'cierre-del-dia', 'cerrar-la-tanda', 'checkpoint'];

const LEEME_SKILLS = `# Las skills del método

1. Descarga el paquete.
2. En Claude: sube cada skill a tu cuenta y tus ficheros al proyecto donde vive tu asesor.
3. En Claude Code: ya funcionan dentro de la carpeta, sin instalar nada.
`;

const SALIDAS = [
  {
    id: 'github',
    nombre: 'GitHub',
    para: 'Si ya trabajas con repositorio o vas a construir algo.',
    recibes: ['Tu repositorio privado', 'Los ficheros que has escrito', '.claude/skills/ · 5 skills', 'CLAUDE.md · AGENTS.md'],
    como: [
      'Crea tu copia desde la plantilla. Márcala como privada.',
      'Descarga la carpeta para GitHub y descomprímela.',
      'En tu copia: Add file → Upload files, arrastra las carpetas metodo y roles, y pulsa Commit changes. Sustituyen a las de la plantilla.',
    ],
    manana: 'Abres el repositorio con tu asistente o tu agente. Lee tus reglas y tus roles sin que se los expliques.',
  },
  {
    id: 'skills',
    nombre: 'Skills',
    para: 'Si trabajas con Claude y quieres que el método se aplique solo.',
    recibes: ['5 skills: encargo, recibir entrega, cierre del día, cerrar la tanda y checkpoint', 'Tus ficheros, para darlos como conocimiento del proyecto'],
    como: [
      'Descarga el paquete.',
      'En Claude: sube cada skill a tu cuenta y tus ficheros al proyecto donde vive tu asesor.',
      'En Claude Code: ya funcionan dentro de la carpeta, sin instalar nada.',
    ],
    manana: 'Escribes "encargo" o "cierre del día" y la skill te lleva paso a paso, sin saltarte nada.',
  },
  {
    id: 'markdown',
    nombre: 'Markdown',
    para: 'Si usas ChatGPT, Gemini u otro chat, o aún no usas GitHub.',
    recibes: ['La carpeta en .md, comprimida', 'textos/ · 5 textos para pegar en cualquier chat', 'PLAN.md y el calendario'],
    como: [
      'Descarga la carpeta.',
      'Guárdala en Drive o donde ya guardes tus cosas.',
      'Pega las instrucciones de roles/asesor.md en tu Gem o proyecto.',
    ],
    manana: 'Abres el texto que toca (escribir el encargo, recibir la entrega, cerrar el día) y lo pegas en tu chat.',
  },
];

function Listo({ d, fs, onCopiar, navigate, toast, n, tituloRef, carpetaMovil }) {
  const p30 = useMemo(() => plan(d), [d]);
  const [bajando, setBajando] = useState('');

  function bajarIcs() {
    const blob = new Blob([ics(d, p30)], { type: 'text/calendar;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'metodo-mi-mes.ics';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    toast('Fechas descargadas: ábrelo y tu calendario las añade');
  }

  function soltar(blob, nombre) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = nombre;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  // Todo lo que lleva la carpeta: los ficheros rellenados por el recorrido,
  // el resto de la plantilla (fuente.json, sin VERSION.md ni LICENSE), los
  // cinco textos, el LEEME, el plan y el calendario.
  async function todo() {
    const { default: fuenteCompleta } = await import('../data/fuente.json');
    const out = {};
    Object.entries(fuenteCompleta).forEach(([nombre, contenido]) => {
      if (nombre === 'VERSION.md' || nombre === 'LICENSE') return;
      out[nombre] = contenido;
    });
    Object.entries(fs).forEach(([nombre, contenido]) => { out[nombre] = contenido; });
    Object.entries(TEXTOS).forEach(([nombre, contenido]) => { out[nombre] = contenido; });
    out['LEEME.md'] = leemeMd(d, p30);
    out['PLAN.md'] = planMd(d, p30);
    out['metodo-mi-mes.ics'] = ics(d, p30);
    return out;
  }

  async function zipDe(ficherosZip) {
    const { default: JSZip } = await import('jszip');
    const zip = new JSZip();
    Object.entries(ficherosZip).forEach(([nombre, contenido]) => zip.file(nombre, contenido));
    return zip;
  }

  async function descargar(id) {
    setBajando(id);
    try {
      const t = await todo();
      if (id === 'markdown') {
        soltar(await (await zipDe(t)).generateAsync({ type: 'blob' }), 'metodo.zip');
        toast('Carpeta descargada');
      } else if (id === 'github') {
        // Solo metodo/** y roles/**: es lo que se arrastra a la copia de la
        // plantilla. Nada que empiece por punto.
        const sel = Object.fromEntries(Object.entries(t).filter(([nom]) =>
          (nom.startsWith('metodo/') || nom.startsWith('roles/')) && !nom.split('/').some((x) => x.startsWith('.'))));
        soltar(await (await zipDe(sel)).generateAsync({ type: 'blob' }), 'metodo-para-github.zip');
        toast('Carpeta para GitHub descargada');
      } else {
        // Un zip por skill (carpeta + SKILL.md), que es lo que se sube a
        // Claude; la carpeta metodo/ rellenada y .claude/skills/ tal cual, para
        // que en Claude Code funcionen sin instalar nada.
        const { default: JSZip } = await import('jszip');
        const paquete = new JSZip();
        for (const sk of SKILLS) {
          const ruta = `.claude/skills/${sk}/SKILL.md`;
          if (!t[ruta]) continue;
          const uno = new JSZip();
          uno.file(`${sk}/SKILL.md`, t[ruta]);
          paquete.file(`${sk}.zip`, await uno.generateAsync({ type: 'uint8array' }));
          paquete.file(ruta, t[ruta]);
        }
        Object.entries(t).forEach(([nom, contenido]) => { if (nom.startsWith('metodo/')) paquete.file(nom, contenido); });
        if (t['GLOSARIO.md']) paquete.file('GLOSARIO.md', t['GLOSARIO.md']);
        paquete.file('LEEME.md', LEEME_SKILLS);
        soltar(await paquete.generateAsync({ type: 'blob' }), 'skills-metodo.zip');
        toast('Skills descargadas');
      }
    } catch (e) {
      const texto = Object.entries(fs)
        .map(([nom, c]) => `${'='.repeat(70)}\n${nom}\n${'='.repeat(70)}\n\n${c}`)
        .join('\n\n');
      bajar(texto, 'metodo-ai-first.txt', 'text/plain;charset=utf-8');
      toast('Descargado en un solo fichero de texto');
    }
    setBajando('');
  }

  return (
    <>
      <h1 tabIndex={-1} ref={tituloRef} className="listo-h1">Tu método está montado. Elige dónde va a vivir.</h1>
      {carpetaMovil}
      <p className="listo-entrada">Las tres salidas llevan los mismos ficheros que has escrito. Lo que cambia es dónde viven y quién los lee cada día.</p>

      <div className="salidas">
        {SALIDAS.map((s) => (
          <article className="salida" key={s.id} aria-labelledby={`salida-${s.id}`}>
            <h2 id={`salida-${s.id}`}>{s.nombre}</h2>
            <p className="salida-para">{s.para}</p>
            <p className="salida-rot">Recibes</p>
            <ul>{s.recibes.map((r) => <li key={r}>{r}</li>)}</ul>
            <p className="salida-rot">Cómo</p>
            <ol>{s.como.map((c) => <li key={c}>{c}</li>)}</ol>
            <p className="salida-rot">Y mañana</p>
            <p>{s.manana}</p>
            <div className="salida-botones">
              {s.id === 'github' && (
                <a className="btn btn-p" href={URL_PLANTILLA + '/generate'} target="_blank" rel="noopener noreferrer">
                  Crear mi copia en GitHub
                </a>
              )}
              <button className="btn btn-p" onClick={() => descargar(s.id)} disabled={!!bajando}>
                {bajando === s.id ? 'Preparando…'
                  : s.id === 'github' ? 'Descargar la carpeta para GitHub'
                    : s.id === 'skills' ? 'Descargar skills' : 'Descargar carpeta'}
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="listo-cajas">
        <div className="listo-caja siempre">
          <h2>Siempre va dentro, elijas la que elijas</h2>
          <ul>
            <li>Tus ficheros del método, escritos en estos nueve pasos</li>
            <li>El primer encargo, listo para enviar</li>
            <li>El manual, enlazado capítulo a capítulo</li>
            <li>El checkpoint semanal en tu calendario, con las cuatro preguntas dentro</li>
          </ul>
        </div>
        <div className="listo-caja siguiente">
          <h2>Lo siguiente que haces</h2>
          <p>Envía el primer encargo hoy. El día de la conversación del paso 8, apunta en 03_HIPOTESIS.md qué te dijeron. La semana que viene, primer checkpoint: seguir, cambiar o parar.</p>
        </div>
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
          <button className="btn" onClick={() => navigate('/metodo/plan')}>Ver mi plan</button>
          <button className="btn btn-2" onClick={bajarIcs}>Añadir las fechas a mi calendario</button>
        </div>
        <AvisosMes n={n} />
        <p className="ayuda">Las fechas salen de lo que ya has escrito en los pasos 4 y 8.
          Son tuyas: se mueven. Y en la carpeta van los cinco textos que te acompañan
          después, en <code>textos/</code>, y el checkpoint de cada semana ya puesto en el calendario.</p>
      </div>

      <details className="pliegue pliegue-ficheros">
        <summary>Tus ficheros, uno a uno</summary>
        <div className="pliegue-en">
          {Object.entries(fs).map(([nombre, contenido]) => (
            <details className="fichero" key={nombre}>
              <summary><span>{nombre}</span><span className="rotulo">abrir</span></summary>
              <pre>{contenido}</pre>
              <div className="pie">
                <button className="btn btn-2" onClick={() => onCopiar(contenido, 'Fichero copiado')}>Copiar</button>
              </div>
            </details>
          ))}
        </div>
      </details>
    </>
  );
}
