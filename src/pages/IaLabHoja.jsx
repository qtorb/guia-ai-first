import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import sesionesData from '../data/sesiones.json';
import hojasData from '../data/hojas.json';
import Bloque from '../components/hoja/Bloque';
import Grupo from '../components/hoja/Grupo';
import TextoInline from '../components/TextoInline';
import { useToast } from '../components/Toast';
import { useDossier } from '../hooks/useDossier';
import { recolectarCheckKeys, generarProtocolo, algoRellenado, slug } from '../lib/protocolo';
import { bajar, alPortapapeles } from '../lib/portapapeles';

// Port de pintarHoja()/irPaso()/auto()/generar()/entregar() —
// guia-ai-first-src/index.html L2712-2947. Contenido y comportamiento se
// mantienen; el motor de estado pasa de manipulación de DOM a React.

const ASISTENTES = [
  { nombre: 'ChatGPT ↗', url: 'https://chatgpt.com' },
  { nombre: 'Claude ↗', url: 'https://claude.ai' },
  { nombre: 'Gemini ↗', url: 'https://gemini.google.com' },
];

export default function IaLabHoja({ dossierCtl }) {
  const { n } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const sesionN = Number(n);
  const sesion = sesionesData.sesiones.find((s) => s.n === sesionN);
  const hoja = sesion?.fichero ? hojasData[sesion.fichero] : null;

  const { dossier, guardaHoja, guardaNombre, borraHoja, reemplazar, dossierRef } = dossierCtl;
  const guardadas = dossier.hojas[sesionN] || {};

  const checkKeys = useMemo(() => (hoja ? recolectarCheckKeys(hoja) : new Set()), [hoja]);
  const [datos, setDatos] = useState(() => ({ ...guardadas }));
  const [nombre, setNombre] = useState(dossier.proyecto._nombre || '');
  const [paso, setPaso] = useState(guardadas._paso || 1);
  const [texto, setTexto] = useState(guardadas._salida || '');
  const [verTodo, setVerTodo] = useState(false);
  const debounceRef = useRef(null);

  const NPASOS = hoja ? hoja.bloques.length + 3 : 0;

  // datos._total se fija al abrir, igual que abrirSesion() (L2839).
  useEffect(() => {
    if (hoja) guardaHoja(sesionN, { ...guardadas, _total: NPASOS });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hoja?.titulo]);

  function persistirYa(extra = {}) {
    guardaHoja(sesionN, { ...datos, ...extra, _paso: paso, _total: NPASOS });
  }

  function onCampoChange(k, valor) {
    setDatos((d) => {
      const next = { ...d, [k]: valor };
      return next;
    });
  }

  // autosave: debounce de 700ms tras el último cambio — igual que el
  // listener 'input' de init() (L3523).
  useEffect(() => {
    if (!hoja) return;
    if (!algoRellenado(datos, checkKeys, nombre, paso)) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      guardaHoja(sesionN, { ...datos, _paso: paso, _total: NPASOS });
    }, 700);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datos]);

  function onChecklistChange(k, valor) {
    // change (checkbox): guardado inmediato, como en el listener 'change' (L3524).
    setDatos((d) => {
      const next = { ...d, [k]: valor };
      guardaHoja(sesionN, { ...next, _paso: paso, _total: NPASOS });
      return next;
    });
  }

  function irPaso(nuevo) {
    const clamp = Math.max(1, Math.min(NPASOS, nuevo));
    setPaso(clamp);
    persistirYa();
    window.scrollTo(0, 0);
  }

  function onNombreBlur() {
    guardaNombre(nombre);
  }

  function generar() {
    const kicker = sesion.asignatura ? `IA-Lab ${sesion.etiqueta || sesion.n} · MMDD31 · UPF-BSM` : '';
    const t = generarProtocolo(hoja, datos, checkKeys, nombre, kicker);
    setTexto(t);
    const hoy = new Date().toISOString().slice(0, 10);
    guardaHoja(sesionN, { ...datos, _paso: paso, _total: NPASOS, _salida: t, _fin: hoy });
    toast('Protocolo generado');
    setTimeout(() => document.getElementById('texto')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
  }

  function entregar() {
    let t = texto;
    if (!t.trim()) {
      const kicker = sesion.asignatura ? `IA-Lab ${sesion.etiqueta || sesion.n} · MMDD31 · UPF-BSM` : '';
      t = generarProtocolo(hoja, datos, checkKeys, nombre, kicker);
      setTexto(t);
    }
    bajar(t, 'protocolo-' + (slug(nombre) || 'sin-nombre') + '.txt', 'text/plain;charset=utf-8');
  }

  function copiarCampo(valorTexto) {
    if (!valorTexto.trim()) { toast('Nada que copiar todavía'); return; }
    alPortapapeles(valorTexto).then(() => toast('Copiado al portapapeles'))
      .catch(() => toast('Selecciónalo a mano y cópialo con Ctrl+C'));
  }

  // Port de guardar()/cargar()/borrar() — L3020-3049. Trabajan sobre el
  // DOSSIER completo (todas las hojas), no solo la actual, así que leen y
  // escriben vía dossierRef/reemplazar en vez del estado local de esta hoja.
  function guardarAvance() {
    persistirYa();
    const base = dossierRef.current;
    const dCompleto = {
      ...base,
      proyecto: { ...base.proyecto, _nombre: nombre },
      hojas: { ...base.hojas, [sesionN]: { ...datos, _paso: paso, _total: NPASOS, _salida: texto } },
    };
    bajar(
      JSON.stringify({ v: 2, fecha: new Date().toISOString().slice(0, 10), d: dCompleto }, null, 1),
      'mi-dossier-ialab.json',
      'application/json'
    );
    toast('Avance descargado');
  }

  function cargarDesdeFichero(file) {
    const r = new FileReader();
    r.onload = (e) => {
      let j;
      try {
        j = JSON.parse(e.target.result);
      } catch (err) {
        toast('Ese fichero no se puede leer');
        return;
      }
      let hojaNueva;
      if (j.d) {
        reemplazar(j.d);
        hojaNueva = j.d.hojas?.[sesionN] || {};
        setNombre(j.d.proyecto?._nombre ?? nombre);
      } else {
        hojaNueva = j.datos || j;
        guardaHoja(sesionN, hojaNueva);
      }
      setDatos({ ...hojaNueva });
      setPaso(hojaNueva._paso || 1);
      setTexto(hojaNueva._salida || '');
      toast('Avance recuperado' + (j.fecha ? ' · guardado el ' + j.fecha : ''));
    };
    r.readAsText(file);
  }

  function borrarTodo() {
    if (!window.confirm('¿Seguro? Se borra lo que has escrito en esta hoja.')) return;
    borraHoja(sesionN);
    setDatos({});
    setNombre('');
    setTexto('');
    setPaso(1);
    window.scrollTo(0, 0);
  }

  if (!sesion || !hoja) {
    return (
      <div className="wrap">
        <p>No he podido cargar esta sesión.</p>
        <button className="btn btn-g" onClick={() => navigate('/ia-lab')}>← Todas mis hojas</button>
      </div>
    );
  }

  const pasos = [
    { t: 'Preparar' },
    ...hoja.bloques.map((b) => ({ t: b.titulo })),
    { t: 'Contraste' },
    { t: 'Tu protocolo' },
  ];

  return (
    <div className="wrap">
      <button className="lnk volver" onClick={() => navigate('/ia-lab')}>← Todas mis hojas</button>
      <div id="pbar">
        <div className="pb-in">
          {pasos.map((p, i) => (
            <button
              key={i}
              className={'pdot' + (i + 1 < paso ? ' done' : i + 1 === paso ? ' on' : '')}
              onClick={() => irPaso(i + 1)}
              title={p.t}
            >
              <i>{i + 1}</i><u>{p.t}</u>
            </button>
          ))}
        </div>
        <div className="pb-r">
          <span id="pinfo">{`Paso ${paso} de ${NPASOS}`}</span>
          <button className="lnk" onClick={() => setVerTodo((v) => !v)}>
            {verTodo ? 'Ver paso a paso' : 'Ver todo de una vez'}
          </button>
        </div>
      </div>

      <div id="pasos" className={verTodo ? 'todos' : ''}>
        {(verTodo ? pasos.map((_, i) => i + 1) : [paso]).map((numPaso) => (
          <section className={'wstep' + (numPaso === paso ? ' on' : '')} data-p={numPaso} key={numPaso}>
            {numPaso === 1 && (
              <PasoPreparar hoja={hoja} onCopiarPrompt={() => copiarCampo(hoja.paso0.prompt)} />
            )}
            {numPaso > 1 && numPaso <= hoja.bloques.length + 1 && (
              <Bloque b={hoja.bloques[numPaso - 2]} datos={datos} onChange={onCampoChange} />
            )}
            {numPaso === hoja.bloques.length + 2 && (
              <PasoContraste hoja={hoja} datos={datos} onChange={onCampoChange} />
            )}
            {numPaso === hoja.bloques.length + 3 && (
              <PasoSalida
                hoja={hoja}
                nombre={nombre}
                setNombre={setNombre}
                onNombreBlur={onNombreBlur}
                texto={texto}
                onGenerar={generar}
                onEntregar={entregar}
                onCopiarTexto={() => copiarCampo(texto)}
                onGuardarAvance={guardarAvance}
                onCargarAvance={cargarDesdeFichero}
                onBorrarTodo={borrarTodo}
              />
            )}
            {!verTodo && (
              <div className="pnav">
                {numPaso > 1 ? <button className="btn btn-g" onClick={() => irPaso(numPaso - 1)}>← Atrás</button> : <span />}
                {numPaso < NPASOS
                  ? <button className="btn btn-p" onClick={() => irPaso(numPaso + 1)}>Siguiente →</button>
                  : <span className="fin">Ya está. Has terminado.</span>}
              </div>
            )}
          </section>
        ))}
      </div>
      <footer>{hoja.pie}<br />Guía AI-First · Albert Garcia Pujadas · @qtorb</footer>
    </div>
  );
}

function PasoPreparar({ hoja, onCopiarPrompt }) {
  return (
    <>
      <header>
        <div className="kicker">{hoja.kicker}</div>
        <h1>{hoja.titulo}</h1>
        <p className="lede">{hoja.lede}</p>
        <div className="facts">{hoja.facts.map((f, i) => <span className="fact" key={i}>{f}</span>)}</div>
      </header>
      {hoja.intro.que.map((p, i) => <TextoInline key={i} texto={p} className="que" />)}
      <div className="cic">
        <div className="lab">De dónde sale esto</div>
        <TextoInline texto={hoja.intro.cicatriz} />
      </div>
      {(hoja.intro.extra || []).map(([t, txt], i) => (
        <div key={i}>
          <h3>{t}</h3>
          <TextoInline texto={txt} className="que" />
        </div>
      ))}
      <div className="paso0">
        <h3>{hoja.paso0.titulo}</h3>
        <TextoInline texto={hoja.paso0.texto} />
        <div className="sub">
          <div className="sn">1</div>
          <div className="sc">
            <b>Abre tu asistente</b>
            <div className="abrir">
              {ASISTENTES.map((a) => (
                <a key={a.url} className="btn btn-g" href={a.url} target="_blank" rel="noopener noreferrer">{a.nombre}</a>
              ))}
            </div>
          </div>
        </div>
        <div className="sub">
          <div className="sn">2</div>
          <div className="sc">
            <b>Pégale la guía entera</b>
            <p>Son unas cuarenta páginas. Se pega de una vez y el asistente la lee sola.</p>
          </div>
        </div>
        <div className="sub">
          <div className="sn">3</div>
          <div className="sc">
            <b>Y después, estas instrucciones</b>
            <p>Es lo que hace que deje de contestar por ti y empiece a preguntarte.</p>
            <div className="snip">{hoja.paso0.prompt}</div>
            <button className="btn btn-g mt" onClick={onCopiarPrompt}>Copiar las instrucciones</button>
          </div>
        </div>
        <p className="p0n">¿Sin asistente a mano? Puedes hacer la hoja igual — solo perderás las preguntas verdes.</p>
      </div>
    </>
  );
}

function PasoContraste({ hoja, datos, onChange }) {
  const c = hoja.contraste;
  return (
    <div className="blk" id="b08">
      <div className="num"><span>{c.n}</span><em>{c.min}</em></div>
      <h2>{c.titulo}</h2>
      <TextoInline texto={c.que} className="que" />
      <div className="contraste">
        <h3>Tres pruebas</h3>
        <ol>{c.pruebas.map((p, i) => <TextoInline key={i} as="li" texto={p} />)}</ol>
      </div>
      <div style={{ marginTop: 20 }}>
        {(c.grupos || []).map((g, i) => <Grupo key={i} g={g} datos={datos} onChange={onChange} />)}
      </div>
    </div>
  );
}

function PasoSalida({
  hoja, nombre, setNombre, onNombreBlur, texto, onGenerar, onEntregar, onCopiarTexto,
  onGuardarAvance, onCargarAvance, onBorrarTodo,
}) {
  const fileRef = useRef(null);
  return (
    <div id="out">
      <div className="num">ÚLTIMO PASO</div>
      <h2>{hoja.salida.titulo}</h2>
      <TextoInline texto={hoja.salida.que} className="que" />
      <div className="nombre">
        <div className="field">
          <label>Tu nombre <span className="hint">para el fichero de entrega</span></label>
          <input
            type="text"
            id="nombre"
            placeholder="Nombre y apellido"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            onBlur={onNombreBlur}
          />
        </div>
      </div>
      <div className="acts">
        <button className="btn btn-p" onClick={onGenerar}>Generar mi protocolo</button>
      </div>
      <textarea id="texto" value={texto} readOnly placeholder="Pulsa «Generar mi protocolo» y aparecerá aquí." />
      <h3 style={{ marginTop: 36 }}>Y ahora, tres cosas que hacer con él</h3>
      <div className="final">
        <div className="fcard">
          <b>1 · Pégalo en tu asistente</b>
          <span>Detrás de la guía. A partir de ahí sabe con qué reglas trabajas.</span>
          <button className="btn btn-g" onClick={onCopiarTexto}>Copiar mi protocolo</button>
        </div>
        <div className="fcard">
          <b>2 · Entrégalo</b>
          <span>Descarga el fichero y súbelo a Aula Global como entrega de la sesión.</span>
          <button className="btn btn-d" onClick={onEntregar}>Descargar para entregar</button>
        </div>
        <div className="fcard">
          <b>3 · Guárdalo para dentro de tres meses</b>
          <span>Un protocolo que no relees es un documento más. Imprímelo o guarda el PDF.</span>
          <button className="btn btn-g" onClick={() => window.print()}>Imprimir / PDF</button>
        </div>
      </div>
      <h3 style={{ marginTop: 36 }}>Cambiar de ordenador</h3>
      <p className="que">
        Tu avance se guarda en <b>este</b> navegador. Si vas a seguir en otro sitio, descarga el fichero y cárgalo allí.
      </p>
      <div className="acts">
        <button className="btn btn-g" onClick={onGuardarAvance}>Guardar mi avance</button>
        <button className="btn btn-g" onClick={() => fileRef.current?.click()}>Retomar desde un fichero</button>
        <button className="btn btn-g" onClick={onBorrarTodo}>Empezar de cero</button>
        <input
          type="file"
          ref={fileRef}
          accept=".json,application/json"
          style={{ display: 'none' }}
          onChange={(e) => {
            const f = e.target.files[0];
            if (f) onCargarAvance(f);
            e.target.value = '';
          }}
        />
      </div>
    </div>
  );
}
