import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import sesionesData from '../data/sesiones.json';
import hojasData from '../data/hojas.json';
import Bloque from '../components/hoja/Bloque';
import Grupo from '../components/hoja/Grupo';
import TextoInline from '../components/TextoInline';
import { useToast } from '../components/Toast';
import { useDossier } from '../hooks/useDossier';
import { recolectarCheckKeys, generarProtocolo, algoRellenado, slug, bloquesSinEscribir, seccionesConPlantilla } from '../lib/protocolo';
import { guiaEntera } from '../lib/guiaTexto';
import { bajar, alPortapapeles } from '../lib/portapapeles';

// Port de pintarHoja()/irPaso()/auto()/generar()/entregar() —
// guia-ai-first-src/index.html L2712-2947. Contenido y comportamiento se
// mantienen; el motor de estado pasa de manipulación de DOM a React.

function hayApertura(hoja, datos) {
  return (hoja.apertura?.grupos || [])
    .flatMap((g) => g.campos)
    .some((c) => String(datos[c.k] ?? '').trim().length > 0);
}

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
  // Una hoja puede tener más de una pieza —la 1 tiene dos: 1A el protocolo y
  // 1B el TFM en una página—, y cada una genera su documento.
  const salidas = useMemo(() => (hoja ? (hoja.salidas || (hoja.salida ? [hoja.salida] : [])) : []), [hoja]);
  const [textos, setTextos] = useState(() => guardadas._salidas || (guardadas._salida ? { _: guardadas._salida } : {}));
  const [verTodo, setVerTodo] = useState(false);
  const [faltan, setFaltan] = useState(null);   // { parte, lista }
  // Si al abrir ya hay avance, se entra donde se dejó —eso ya pasaba— pero
  // sin decirlo: el alumno aparecía en mitad de la hoja sin saber por qué.
  const [volviendo, setVolviendo] = useState(() => (guardadas._paso || 1) > 1);
  const debounceRef = useRef(null);
  const barraRef = useRef(null);

  // paso 0 + bloques + (contraste, si la hoja lo tiene aparte) + salida.
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
    // persistirYa() leía `paso` del cierre anterior, así que guardaba el paso
    // del que venías: al volver, la hoja te dejaba uno antes.
    // Y al salir del paso 1 hacia delante, lo escrito a ciegas se cierra —sólo
    // si hay algo escrito, para que nadie se quede fuera por haber pulsado
    // «siguiente» sin querer.
    const cerrar = hoja.apertura && paso === 1 && clamp > 1 && hayApertura(hoja, datos);
    const extra = cerrar ? { _cerrada: 1 } : {};
    setDatos((d) => ({ ...d, ...extra }));
    guardaHoja(sesionN, { ...datos, ...extra, _paso: clamp, _total: NPASOS });
    window.scrollTo(0, 0);
  }

  function onNombreBlur() {
    guardaNombre(nombre);
  }

  // La puerta. No impide entregar: impide entregar sin enterarse. Con dos
  // piezas, cada una tiene la suya y mira sólo sus bloques.
  function generar(sal, forzando) {
    const clave = sal.parte || '_';
    const sin = bloquesSinEscribir(hoja, datos, checkKeys, sal.parte);
    if (sin.length && !forzando) {
      setFaltan({ parte: clave, lista: sin });
      setTimeout(() => document.getElementById('antesgen')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
      return;
    }
    setFaltan(null);
    const kicker = sesion.kicker || (sesion.asignatura ? `IA-Lab ${sesion.etiqueta || sesion.n} · MMDD31 · UPF-BSM` : '');
    const t = generarProtocolo(hoja, datos, checkKeys, nombre, kicker, sal);
    const nuevos = { ...textos, [clave]: t };
    setTextos(nuevos);
    const hoy = new Date().toISOString().slice(0, 10);
    guardaHoja(sesionN, { ...datos, _paso: paso, _total: NPASOS, _salidas: nuevos, _fin: hoy });
    toast((sal.parte ? sal.parte + ' · ' : '') + 'documento generado');
    setTimeout(() => document.getElementById('texto-' + clave)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
  }

  function entregar(sal) {
    const clave = sal.parte || '_';
    const t = textos[clave] || '';
    if (!t.trim()) { generar(sal); return; }
    const base = slug(sal.fichero || sal.doc || hoja.titulo) || 'hoja';
    bajar(t, base + '-' + (slug(nombre) || 'sin-nombre') + '.txt', 'text/plain;charset=utf-8');
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
      hojas: { ...base.hojas, [sesionN]: { ...datos, _paso: paso, _total: NPASOS, _salidas: textos } },
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
      setTextos(hojaNueva._salidas || (hojaNueva._salida ? { _: hojaNueva._salida } : {}));
      toast('Avance recuperado' + (j.fecha ? ' · guardado el ' + j.fecha : ''));
    };
    r.readAsText(file);
  }

  function borrarTodo() {
    if (!window.confirm('¿Seguro? Se borra lo que has escrito en esta hoja.')) return;
    borraHoja(sesionN);
    setDatos({});
    setNombre('');
    setTextos({});
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
  // Cada bloque sabe de qué parte es y qué número hace dentro de ella. El
  // contraste no numera: no es una regla más, es el paso que las repasa.
  const partes = hoja.partes || [];
  const rotulos = (() => {
    const cuenta = {};
    (hoja.bloques || []).forEach((b) => {
      if (b.esContraste) return;
      const k = b.parte || '_';
      cuenta[k] = (cuenta[k] || 0) + 1;
    });
    const va = {};
    let ultima = null;
    return (hoja.bloques || []).map((b) => {
      const k = b.parte || '_';
      const banda = b.parte && b.parte !== ultima ? partes.find((x) => x.id === b.parte) : null;
      ultima = b.parte || ultima;
      if (b.esContraste) return { txt: (b.parte ? b.parte + ' · ' : '') + 'Repasa lo escrito', banda };
      va[k] = (va[k] || 0) + 1;
      const n = `Bloque ${va[k]} de ${cuenta[k]}`;
      return { txt: (b.parte ? b.parte + ' · ' : '') + n, banda };
    });
  })();

  const pasos = [
    { t: hoja.apertura ? 'Antes de empezar' : 'Preparar' },
    ...hoja.bloques.map((b) => ({ t: (b.parte ? b.parte + ' · ' : '') + b.titulo })),
    ...(hoja.contraste ? [{ t: 'Contraste' }] : []),
    { t: salidas.length > 1 ? 'Tus dos piezas' : 'Tu protocolo' },
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
              hoja.apertura
                ? <PasoApertura hoja={hoja} datos={datos} onChange={onCampoChange} cerrada={!!datos._cerrada} />
                : <PasoPreparar hoja={hoja} />
            )}
            {numPaso > 1 && numPaso <= hoja.bloques.length + 1 && (
              <>
                {rotulos[numPaso - 2].banda && (
                  <ParteBanda parte={rotulos[numPaso - 2].banda} onIrAHoja={(nh) => navigate('/ia-lab/' + nh)} />
                )}
                <Bloque
                  b={hoja.bloques[numPaso - 2]}
                  datos={datos}
                  onChange={onCampoChange}
                  total={hoja.bloques.length}
                  rotulo={rotulos[numPaso - 2].txt}
                  duda={datos['duda' + hoja.bloques[numPaso - 2].n]}
                  onDuda={onDuda}
                  preparar={numPaso === 2 && hoja.paso0
                    ? { paso0: hoja.paso0, onCopiarPrompt: () => copiarCampo(hoja.paso0.prompt), onCopiarGuia: copiarGuia }
                    : null}
                />
              </>
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
                salidas={salidas}
                textos={textos}
                faltan={faltan}
                onIrABloque={(nb) => { setFaltan(null); irPaso(hoja.bloques.findIndex((x) => x.n === nb) + 2); }}
                onGenerarIgual={(sal) => generar(sal, true)}
                onGenerar={(sal) => generar(sal)}
                onEntregar={entregar}
                onCopiarTexto={(t) => copiarCampo(t)}
                onGuardarAvance={guardarAvance}
                onCargarAvance={cargarDesdeFichero}
                onBorrarTodo={borrarTodo}
                onIrAHoja={(nh) => navigate('/ia-lab/' + nh)}
                datos={datos}
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

// El paso 1 de una ficha de IA-Lab: las dos preguntas con las que abre la
// sesión, contestadas a ciegas. Se cierran al avanzar y se vuelven a abrir en
// el último paso, al lado de lo que haya escrito para entonces. Cerrado no es
// perdido: lo escrito sigue a la vista, sólo deja de poder editarse.
function PasoApertura({ hoja, datos, onChange, cerrada }) {
  const a = hoja.apertura;
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
      <div className={'aciegas' + (cerrada ? ' cerrada' : '')}>
        <h2>{a.titulo}</h2>
        {(a.que || []).map((p, i) => <TextoInline key={i} texto={p} className="que" />)}
        {cerrada ? (
          <>
            <p className="acav">Esto es lo que contestaste. Se abre otra vez en el último paso.</p>
            <dl className="acal">
              {(a.grupos || []).flatMap((g) => g.campos).map((c) => (
                <div key={c.k}>
                  <dt>{c.label}</dt>
                  <dd>{String(datos[c.k] ?? '').trim() || '— lo dejaste en blanco'}</dd>
                </div>
              ))}
            </dl>
          </>
        ) : (
          (a.grupos || []).map((g, i) => <Grupo key={i} g={g} datos={datos} onChange={onChange} />)
        )}
      </div>
    </>
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

// La banda que abre una parte: la 1 tiene dos piezas —1A el protocolo, 1B el
// TFM en una página— y conviene que se note dónde empieza cada una, igual que
// en el deck. Lleva también la salida a la hoja 0 para quien llega sin idea:
// la diapositiva 30 de la sesión lo dice en voz alta y la hoja no lo decía.
function ParteBanda({ parte, onIrAHoja }) {
  return (
    <div className="pbanda">
      <div className="pb-id">{parte.id}</div>
      <div className="pb-t">
        <h2>{parte.titulo}</h2>
        {parte.que && <TextoInline texto={parte.que} />}
      </div>
      {parte.ir && (
        <div className="pb-ir">
          <TextoInline texto={parte.ir.txt} />
          <button className="btn btn-g" onClick={() => onIrAHoja(parte.ir.n)}>{parte.ir.titulo} →</button>
        </div>
      )}
    </div>
  );
}

function PasoSalida({
  hoja, nombre, setNombre, onNombreBlur, salidas, textos, onGenerar, onEntregar, onCopiarTexto,
  onGuardarAvance, onCargarAvance, onBorrarTodo, faltan, onIrABloque, onGenerarIgual,
  onIrAHoja, datos,
}) {
  const fileRef = useRef(null);
  const ap = hoja.apertura;
  const camposAp = ap ? (ap.grupos || []).flatMap((g) => g.campos) : [];
  const hayAp = camposAp.some((c) => String(datos?.[c.k] ?? '').trim());
  return (
    <div id="out">
      <div className="num">ÚLTIMO PASO</div>
      <h2>{salidas.length > 1 ? 'Lo que te llevas' : salidas[0]?.titulo}</h2>
      {salidas.length > 1 && (
        <p className="que">Dos documentos, uno por pieza. Se generan y se descargan por separado.</p>
      )}
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

      {hayAp && (
        <div className="abre">
          <div className="lab">Se abre lo que escribiste al empezar</div>
          <dl className="acal">
            {camposAp.map((c) => (
              <div key={c.k}>
                <dt>{c.label}</dt>
                <dd>{String(datos[c.k] ?? '').trim() || '— lo dejaste en blanco'}</dd>
              </div>
            ))}
          </dl>
          <p className="n">Nadie corrige esto. Está aquí para que veas la distancia con lo que acabas de escribir, que es la única prueba de que la sesión ha servido.</p>
        </div>
      )}

      {salidas.map((sal) => (
        <Pieza
          key={sal.parte || '_'}
          sal={sal}
          hoja={hoja}
          texto={textos[sal.parte || '_'] || ''}
          faltan={faltan && faltan.parte === (sal.parte || '_') ? faltan.lista : null}
          onGenerar={() => onGenerar(sal)}
          onGenerarIgual={() => onGenerarIgual(sal)}
          onEntregar={() => onEntregar(sal)}
          onCopiarTexto={() => onCopiarTexto(textos[sal.parte || '_'] || '')}
          onIrABloque={onIrABloque}
          onIrAHoja={onIrAHoja}
          varias={salidas.length > 1}
        />
      ))}

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

// Una pieza del último paso: su texto, su puerta, sus tres cosas que hacer y
// su cierre. La hoja 1 pinta dos.
function Pieza({ sal, hoja, texto, faltan, onGenerar, onGenerarIgual, onEntregar, onCopiarTexto, onIrABloque, onIrAHoja, varias }) {
  const clave = sal.parte || '_';
  const totalSecciones = seccionesConPlantilla(hoja, sal.parte).length;
  return (
    <div className={'pieza' + (varias ? ' varias' : '')}>
      {varias && (
        <div className="pz-h">
          <span className="pz-id">{sal.parte}</span>
          <h3>{sal.titulo}</h3>
        </div>
      )}
      <TextoInline texto={sal.que} className="que" />
      <div className="acts">
        <button className="btn btn-p" onClick={onGenerar}>Generar {varias ? sal.parte : 'mi protocolo'}</button>
      </div>
      {faltan && faltan.length > 0 && (
        <div className="antesgen" id="antesgen">
          {faltan.length === totalSecciones ? (
            <>
              <p><b>Todavía no hay nada que generar.</b> Esta pieza está entera por escribir, y un fichero con todos los huecos no te sirve de nada ni a ti ni a quien lo lea.</p>
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
                {b.titulo}
              </button>
            ))}
          </div>
          {faltan.length < totalSecciones && (
            <button className="lnk sig" onClick={onGenerarIgual}>Generar con lo que hay</button>
          )}
        </div>
      )}
      <textarea id={'texto-' + clave} value={texto} readOnly placeholder="Pulsa «Generar» y aparecerá aquí." />
      <div className="final">
        <div className="fcard">
          <b>1 · Pégalo en tu asistente</b>
          <span>{sal.pegar || 'Detrás de la guía. A partir de ahí sabe con qué reglas trabajas.'}</span>
          <button className="btn btn-g" onClick={onCopiarTexto}>Copiar</button>
        </div>
        <div className="fcard">
          <b>2 · Entrégalo</b>
          {/* El sitio de entrega —Aula Global, Drive— está sin decidir. Vive en
              hojas.json y no en el código, para cambiarlo en las seis hojas a la
              vez el día que se cierre. */}
          <span>{sal.entrega || 'Descarga el fichero y súbelo donde se indique en clase.'}</span>
          <button className="btn btn-d" onClick={onEntregar}>Descargar</button>
        </div>
        <div className="fcard">
          <b>3 · Guárdalo</b>
          <span>{sal.guardar || 'Un documento que no relees es un documento más.'}</span>
          <button className="btn btn-g" onClick={() => window.print()}>Imprimir / PDF</button>
        </div>
      </div>
      {(sal.tfm || sal.abierto || sal.siguiente) && (
        <div className="cierra">
          {sal.tfm && (
            <div className="cbloq">
              <h3>{sal.tfm[0]}</h3>
              <TextoInline texto={sal.tfm[1]} className="que" />
            </div>
          )}
          {sal.abierto && (
            <div className="cbloq">
              <h3>{sal.abierto[0]}</h3>
              <TextoInline texto={sal.abierto[1]} className="que" />
            </div>
          )}
          {sal.siguiente && (
            <div className="csig">
              <TextoInline texto={sal.siguiente.txt} />
              <button className="btn btn-p" onClick={() => onIrAHoja(sal.siguiente.n)}>
                {sal.siguiente.titulo} →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
