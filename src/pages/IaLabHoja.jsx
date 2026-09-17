import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import sesionesData from '../data/sesiones.json';
import hojasData from '../data/hojas.json';
import Bloque from '../components/hoja/Bloque';
import Grupo from '../components/hoja/Grupo';
import TextoInline from '../components/TextoInline';
import { useToast } from '../components/Toast';
import { useDossier } from '../hooks/useDossier';
import { recolectarCheckKeys, generarProtocolo, algoRellenado, slug, bloquesSinEscribir } from '../lib/protocolo';
import { guiaEntera } from '../lib/guiaTexto';
import { bajar, alPortapapeles } from '../lib/portapapeles';

// Port de pintarHoja()/irPaso()/auto()/generar()/entregar() —
// guia-ai-first-src/index.html L2712-2947. Contenido y comportamiento se
// mantienen; el motor de estado pasa de manipulación de DOM a React.

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
  const [faltan, setFaltan] = useState(null);
  // Si al abrir ya hay avance, se entra donde se dejó —eso ya pasaba— pero
  // sin decirlo: el alumno aparecía en mitad de la hoja sin saber por qué.
  const [volviendo, setVolviendo] = useState(() => (guardadas._paso || 1) > 1);
  const debounceRef = useRef(null);
  const barraRef = useRef(null);

  // paso 0 + bloques + (contraste, si la hoja lo tiene) + salida.
  // La hoja 0 rediseñada mueve el contraste a un bloque, así que ya no es fijo.
  const NPASOS = hoja ? hoja.bloques.length + 2 + (hoja.contraste ? 1 : 0) : 0;

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

  // La tira de pasos puede no caber (la hoja 0 tiene trece). Dos cosas:
  // marcar que desborda —para que el borde derecho se difumine en vez de
  // cortarse en seco— y traer el paso activo a la vista, que si no en el
  // paso 11 el círculo encendido se queda fuera de la tira.
  useEffect(() => {
    const caja = barraRef.current;
    const tira = caja && caja.querySelector('.pb-in');
    if (!tira) return undefined;
    const mide = () => {
      const desborda = tira.scrollWidth > tira.clientWidth + 2;
      caja.classList.toggle('desborda', desborda);
      return desborda;
    };
    if (mide()) {
      const activo = tira.querySelector('.pdot.on');
      if (activo) {
        const izq = activo.offsetLeft - (tira.clientWidth - activo.offsetWidth) / 2;
        tira.scrollTo({ left: Math.max(0, izq), behavior: 'smooth' });
      }
    }
    window.addEventListener('resize', mide);
    return () => window.removeEventListener('resize', mide);
  }, [paso, verTodo]);

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

  // La puerta. No impide entregar: impide entregar sin enterarse.
  function generar(forzando) {
    const sin = bloquesSinEscribir(hoja, datos, checkKeys);
    if (sin.length && !forzando) {
      setFaltan(sin);
      setTimeout(() => document.getElementById('antesgen')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
      return;
    }
    setFaltan(null);
    const kicker = sesion.asignatura ? `IA-Lab ${sesion.etiqueta || sesion.n} · MMDD31 · UPF-BSM` : '';
    const t = generarProtocolo(hoja, datos, checkKeys, nombre, kicker);
    setTexto(t);
    const hoy = new Date().toISOString().slice(0, 10);
    guardaHoja(sesionN, { ...datos, _paso: paso, _total: NPASOS, _salida: t, _fin: hoy });
    toast('Protocolo generado');
    setTimeout(() => document.getElementById('texto')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
  }

  function entregar() {
    if (!texto.trim()) { generar(); return; }
    bajar(texto, 'protocolo-' + (slug(nombre) || 'sin-nombre') + '.txt', 'text/plain;charset=utf-8');
  }

  // duda<n>: sin la clave, el bloque no está marcado. Con la clave —aunque
  // esté vacía— sí, y sale en el protocolo al final.
  function onDuda(nBloque, valor) {
    setDatos((d) => {
      const next = { ...d };
      if (valor === null) delete next['duda' + nBloque];
      else next['duda' + nBloque] = valor;
      guardaHoja(sesionN, { ...next, _paso: paso, _total: NPASOS });
      return next;
    });
  }

  function copiarGuia() {
    alPortapapeles(guiaEntera())
      .then(() => toast('Guía copiada — pégasela al asistente'))
      .catch(() => toast('No se ha podido copiar'));
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

  // Los puntos de la tira tienen que ser exactamente los pasos que existen.
  // NPASOS ya cuenta el contraste sólo si la hoja lo trae; si aquí se
  // añadiera igualmente, la hoja 0 —que no tiene contraste— pintaría trece
  // puntos para doce pasos y el último paso saldría rotulado «Contraste».
  const pasos = [
    { t: 'Preparar' },
    ...hoja.bloques.map((b) => ({ t: b.titulo })),
    ...(hoja.contraste ? [{ t: 'Contraste' }] : []),
    { t: 'Tu protocolo' },
  ];

  return (
    <div className="wrap taller-lab">
      <button className="lnk volver" onClick={() => navigate('/ia-lab')}>← Todas mis hojas</button>
      <div id="pbar" ref={barraRef}>
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
          <button
            className="lnk"
            title={verTodo ? 'Volver a un paso cada vez' : 'Los diez pasos en una sola página: para repasar o imprimir'}
            onClick={() => setVerTodo((v) => !v)}
          >
            {verTodo ? 'Ver paso a paso' : 'Ver todo de una vez'}
          </button>
        </div>
      </div>

      {volviendo && !verTodo && (
        <Vuelta
          hoja={hoja}
          datos={datos}
          checkKeys={checkKeys}
          onCerrar={() => setVolviendo(false)}
          onPrincipio={() => { setVolviendo(false); irPaso(1); }}
        />
      )}

      <div id="pasos" className={verTodo ? 'todos' : ''}>
        {(verTodo ? pasos.map((_, i) => i + 1) : [paso]).map((numPaso) => (
          <section className={'wstep' + (numPaso === paso ? ' on' : '')} data-p={numPaso} key={numPaso}>
            {numPaso === 1 && (
              <PasoPreparar hoja={hoja} />
            )}
            {numPaso > 1 && numPaso <= hoja.bloques.length + 1 && (
              <Bloque
                b={hoja.bloques[numPaso - 2]}
                datos={datos}
                onChange={onCampoChange}
                total={hoja.bloques.length}
                duda={datos['duda' + hoja.bloques[numPaso - 2].n]}
                onDuda={onDuda}
                preparar={numPaso === 2 && hoja.paso0
                  ? { paso0: hoja.paso0, onCopiarPrompt: () => copiarCampo(hoja.paso0.prompt), onCopiarGuia: copiarGuia }
                  : null}
              />
            )}
            {hoja.contraste && numPaso === hoja.bloques.length + 2 && (
              <PasoContraste hoja={hoja} datos={datos} onChange={onCampoChange} />
            )}
            {numPaso === NPASOS && (
              <PasoSalida
                hoja={hoja}
                nombre={nombre}
                setNombre={setNombre}
                onNombreBlur={onNombreBlur}
                texto={texto}
                faltan={faltan}
                onIrABloque={(nb) => { setFaltan(null); irPaso(Number(nb) + 1); }}
                onGenerarIgual={() => generar(true)}
                onGenerar={() => generar()}
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

function PasoPreparar({ hoja }) {
  return (
    <>
      <header>
        <div className="kicker">{hoja.kicker}</div>
        <h1>{hoja.titulo}</h1>
        <p className="lede">{hoja.lede}</p>
        <div className="facts">{hoja.facts.map((f, i) => <span className="fact" key={i}>{f}</span>)}</div>
        {(hoja.nota || []).length > 0 && (
          <ul className="permisos">{hoja.nota.map((t, i) => <li key={i}>{t}</li>)}</ul>
        )}
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
      <p className="que p0ref">
        Va mejor con tu asistente preparado. Te digo cómo en el primer bloque, y son dos minutos.
      </p>
    </>
  );
}

// Vuelves a una hoja que dejaste a medias. Antes aparecías en mitad del
// recorrido sin explicación; ahora se dice dónde estás y por qué, y se
// ofrece la salida por si lo que querías era empezar de nuevo.
function Vuelta({ hoja, datos, checkKeys, onCerrar, onPrincipio }) {
  const sin = bloquesSinEscribir(hoja, datos, checkKeys);
  const total = (hoja.bloques || []).length;
  const hechos = total - sin.length;
  const ultimo = [...(hoja.bloques || [])].reverse().find((b) => !sin.includes(b));
  return (
    <div className="vuelta">
      <p>
        <b>Vuelves donde lo dejaste.</b>{' '}
        {hechos > 0
          ? `Llevas ${hechos} de ${total} bloques. El último que escribiste fue «${ultimo.titulo}».`
          : 'Todavía no has escrito nada: sigues donde estabas mirando.'}
      </p>
      <div className="va">
        <button className="lnk" onClick={onPrincipio}>Empezar por el principio</button>
        <button className="mini" onClick={onCerrar}>Seguir aquí</button>
      </div>
    </div>
  );
}

function PasoContraste({ hoja, datos, onChange }) {
  const c = hoja.contraste;
  return (
    <div className="blk" id="b08">
      <div className="num"><span>{c.n}</span>{c.min && <em>{c.min}</em>}</div>
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
  onGuardarAvance, onCargarAvance, onBorrarTodo, faltan, onIrABloque, onGenerarIgual,
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
      {faltan && faltan.length > 0 && (
        <div className="antesgen" id="antesgen">
          {faltan.length === (hoja.bloques || []).length ? (
            <>
              <p><b>Todavía no hay nada que generar.</b> La hoja está entera por escribir, y un fichero con los siete huecos no te sirve de nada ni a ti ni a quien lo lea.</p>
              <p>Empieza por el bloque que quieras: el orden no es sagrado.</p>
            </>
          ) : (
            <>
              <p>
                <b>Te {faltan.length === 1 ? 'falta un bloque' : `faltan ${faltan.length} bloques`}.</b>{' '}
                No pasa nada por dejar{faltan.length === 1 ? 'lo' : 'los'}: lo que pasa es que el fichero que entregas
                no dirá nada sobre {faltan.length === 1 ? 'eso' : 'ellos'}, y son de los que más falta te van a hacer
                dentro de tres meses.
              </p>
              <p>Si te has atascado en alguno, sáltalo y vuelve — el orden no es sagrado.</p>
            </>
          )}
          <div className="agl">
            {faltan.map((b) => (
              <button key={b.n} className="btn btn-g" onClick={() => onIrABloque(b.n)}>
                {+b.n} · {b.titulo}
              </button>
            ))}
          </div>
          {faltan.length < (hoja.bloques || []).length && (
            <button className="lnk sig" onClick={onGenerarIgual}>Generar con lo que hay</button>
          )}
        </div>
      )}
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
