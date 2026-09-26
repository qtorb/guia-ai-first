import { useEffect, useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  leerPanel, hojasIaLab, nombrePaso, PASOS_METODO, diasDesde, usaIaLab, usaMetodo, aCsv, estadoHoja,
} from '../lib/panel';
import { bajar } from '../lib/portapapeles';

// El panel de actividad. Solo lo ve el administrador: lo comprueba la base de
// datos, no esta página. Aquí no hay nada que esconder porque lo que no es
// suyo no llega: las funciones del servidor no devuelven lo escrito.

const fecha = (f) => (f ? new Date(f).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : '—');
function haceCuanto(f) {
  const d = diasDesde(f);
  if (d == null) return '—';
  if (d === 0) return 'hoy';
  if (d === 1) return 'ayer';
  return `hace ${d} días`;
}

function Barra({ k, v, max, caliente }) {
  const w = max ? Math.round((v / max) * 100) : 0;
  return (
    <div className="pb-bar">
      <span className="k">{k}</span>
      <span className="t"><i className={caliente ? 'hot' : ''} style={{ width: w + '%' }} /></span>
      <span className="v">{v}</span>
    </div>
  );
}

export default function Panel({ n, vista }) {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(null);
  const uid = n.usuario?.id;

  useEffect(() => {
    if (!uid) return undefined;
    let vivo = true;
    setError(null);
    leerPanel()
      .then((d) => { if (vivo) setDatos(d); })
      .catch((e) => { if (vivo) setError(e.code === '42501' || /autorizado/.test(e.message || '') ? 'noadmin' : (e.message || String(e))); });
    return () => { vivo = false; };
  }, [uid]);

  if (!n.hay) return <Aviso t="El panel necesita la cuenta de la web configurada." />;
  if (n.estado === 'cargando') return <Aviso t="Cargando…" />;
  if (!uid) return <Aviso t="Entra con tu cuenta, arriba a la derecha, para ver el panel." />;
  if (error === 'noadmin') return <Aviso t="Esta página no está disponible para esta cuenta." />;
  if (error) return <Aviso t={'No se ha podido cargar el panel: ' + error} />;
  if (!datos) return <Aviso t="Cargando…" />;

  return (
    <div className="panel">
      <nav className="pb-tabs" aria-label="Vistas del panel">
        <NavLink to="/panel" end>Actividad</NavLink>
        <NavLink to="/panel/personas">Personas</NavLink>
      </nav>
      {vista === 'personas' ? <Personas datos={datos} /> : <Resumen datos={datos} />}
    </div>
  );
}

function Aviso({ t }) {
  return <div className="panel"><p className="pb-aviso">{t}</p></div>;
}

function Resumen({ datos }) {
  const { personas, atascos, avisos } = datos;
  const hojas = useMemo(hojasIaLab, []);
  const [todasFrases, setTodasFrases] = useState(false);

  const tot = personas.length;
  const altas7 = personas.filter((p) => diasDesde(p.alta) != null && diasDesde(p.alta) <= 7).length;
  const act7 = personas.filter((p) => diasDesde(p.ultima_actividad) != null && diasDesde(p.ultima_actividad) <= 7).length;
  const act30 = personas.filter((p) => diasDesde(p.ultima_actividad) != null && diasDesde(p.ultima_actividad) <= 30).length;
  const dos = personas.filter((p) => usaIaLab(p) && usaMetodo(p)).length;

  const vias = ['email', 'google', 'github'].map((v) => [v, personas.filter((p) => p.via === v).length]);
  const nomVia = { email: 'Correo', google: 'Google', github: 'GitHub' };

  const perm = [['El mismo día', 0, 0], ['1 a 7 días', 1, 7], ['8 a 30 días', 8, 30], ['Más de 30', 31, 1e9]].map(([k, a, b]) => {
    const v = personas.filter((p) => {
      if (!p.ultima_actividad || !p.alta) return false;
      const d = Math.floor((new Date(p.ultima_actividad) - new Date(p.alta)) / 86400000);
      return d >= a && d <= b;
    }).length;
    return [k, v];
  });
  const sinActividad = personas.filter((p) => !p.ultima_actividad).length;
  const maxPerm = Math.max(1, ...perm.map((x) => x[1]));

  const conMetodo = personas.filter((p) => p.metodo_paso != null);
  const llega = PASOS_METODO.map((_, i) => conMetodo.filter((p) => p.metodo_paso >= i + 1).length);
  let caida = -1; let mayor = 0;
  for (let i = 1; i < llega.length; i += 1) { const c = llega[i - 1] - llega[i]; if (c > mayor) { mayor = c; caida = i; } }

  const porPaso = {};
  atascos.forEach((a) => { const k = a.hoja + '·' + a.paso; porPaso[k] = (porPaso[k] || 0) + 1; });
  const ranking = Object.entries(porPaso).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxAt = Math.max(1, ...ranking.map((r) => r[1]));
  const tituloHoja = (h) => hojas.find((x) => x.n === h)?.titulo || 'Hoja ' + h;
  const frases = atascos.filter((a) => a.frase);

  return (
    <>
      <h1>Actividad</h1>
      <p className="pb-sub">IA-Lab y Método AI-First</p>
      <div className="pb-fijo">Solo cuenta a quien tiene cuenta. Quien trabaja sin cuenta no aparece aquí, a propósito.</div>

      <h2>Cuentas</h2>
      <div className="pb-tiles">
        <div className="pb-tile"><b>{tot}</b><span>cuentas</span><small>+{altas7} en los últimos 7 días</small></div>
        <div className="pb-tile"><b>{act7}</b><span>activas · 7 días</span><small>con algún cambio</small></div>
        <div className="pb-tile"><b>{act30}</b><span>activas · 30 días</span><small>con algún cambio</small></div>
        <div className="pb-tile"><b>{dos}</b><span>usan los dos bloques</span><small>IA-Lab y método</small></div>
      </div>
      <div className="pb-two">
        <div>
          <div className="pb-mute">Vía de entrada</div>
          {vias.map(([v, c]) => <Barra key={v} k={nomVia[v]} v={c} max={Math.max(1, tot)} />)}
        </div>
        <div>
          <div className="pb-mute">Permanencia · días entre el alta y la última actividad</div>
          {perm.map(([k, v], i) => <Barra key={k} k={k} v={v} max={maxPerm} caliente={i === 0} />)}
          {sinActividad > 0 && <div className="pb-mute">{sinActividad} sin ninguna actividad guardada</div>}
        </div>
      </div>

      <h2>IA-Lab · hoja a hoja</h2>
      <table className="pb-tabla">
        <thead><tr><th>Hoja</th><th>Empezada</th><th>Terminada</th><th>%</th><th>Dónde se quedan quienes no terminan</th></tr></thead>
        <tbody>
          {hojas.map((h) => {
            const est = personas.map((p) => p.hojas?.[h.n]).filter(Boolean);
            const fin = est.filter((e) => e.fin).length;
            const abiertas = est.filter((e) => !e.fin);
            const total = est[0]?.total || h.hoja.bloques.length + 2 + (h.hoja.contraste ? 1 : 0);
            const dist = Array.from({ length: total }, (_, i) => abiertas.filter((e) => (e.paso || 1) === i + 1).length);
            const maxD = Math.max(0, ...dist);
            const pico = maxD > 0 ? dist.indexOf(maxD) + 1 : null;
            return (
              <tr key={h.n}>
                <td>{h.titulo}</td>
                <td>{est.length}</td>
                <td>{fin}</td>
                <td>{est.length ? Math.round((fin / est.length) * 100) + '%' : '—'}</td>
                <td>
                  <div className="pb-steps" aria-hidden="true">
                    {dist.map((v, i) => <span key={i} className={i + 1 === pico ? 'hot' : ''} style={{ height: (maxD ? Math.max(4, (v / maxD) * 100) : 4) + '%' }} />)}
                  </div>
                  <div className="pb-mute">
                    {pico ? `Paso ${pico} de ${total} · ${maxD} ${maxD === 1 ? 'persona' : 'personas'} · «${nombrePaso(h.hoja, pico)}»` : 'Nadie se ha quedado a medias'}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <h2>Método AI-First · recorrido</h2>
      <div className="pb-two">
        <div>
          <div className="pb-mute">Hasta qué paso llega la gente (de {conMetodo.length} que empezaron)</div>
          {PASOS_METODO.map((t, i) => <Barra key={t} k={`${i + 1} · ${t}`} v={llega[i]} max={Math.max(1, conMetodo.length)} caliente={i === caida} />)}
        </div>
        <div className="pb-tiles dos">
          <div className="pb-tile"><b>{llega[6]}</b><span>terminan el recorrido</span></div>
          <div className="pb-tile"><b>{personas.filter((p) => p.plan30).length}</b><span>empiezan el plan de 30 días</span></div>
        </div>
      </div>

      <h2>Checkpoint</h2>
      <div className="pb-tiles">
        <div className="pb-tile">
          <b>{personas.reduce((s, p) => s + (p.semanas_cerradas || 0), 0)}</b>
          <span>semanas cerradas</span>
          <small>en {personas.filter((p) => (p.semanas_cerradas || 0) > 0).length} cuentas</small>
        </div>
        <div className="pb-tile"><b>{avisos?.correos_checkpoint ?? 0}</b><span>correos de checkpoint</span><small>enviados desde la semana 5</small></div>
        <div className="pb-tile"><b>{avisos?.correos_semana ?? 0}</b><span>correos del primer mes</span><small>semanas 1 a 4</small></div>
        <div className="pb-tile"><b>{avisos?.activos ?? 0}</b><span>reciben avisos</span><small>{avisos?.en_pausa ?? 0} en pausa</small></div>
      </div>

      <h2>Atascos · lo que escriben</h2>
      <div className="pb-two">
        <div>
          <div className="pb-mute">Pulsaciones del botón, por hoja y paso</div>
          {ranking.length === 0 && <div className="pb-mute">Todavía nadie lo ha pulsado.</div>}
          {ranking.map(([k, v], i) => {
            const [h, p] = k.split('·');
            return <Barra key={k} k={`${tituloHoja(h)} · paso ${p}`} v={v} max={maxAt} caliente={i === 0} />;
          })}
          <div className="pb-mute">Cuenta también a quien trabaja sin cuenta.</div>
        </div>
        <div>
          {frases.length === 0 && <div className="pb-mute">Sin frases todavía.</div>}
          {(todasFrases ? frases : frases.slice(0, 8)).map((a, i) => (
            <div className="pb-quote" key={i}>
              <div className="pb-mute">{tituloHoja(a.hoja)} · paso {a.paso} · {haceCuanto(a.creado)}</div>
              «{a.frase}»
            </div>
          ))}
          {frases.length > 8 && !todasFrases && <button className="btn btn-g" onClick={() => setTodasFrases(true)}>Ver todas ({frases.length})</button>}
        </div>
      </div>
    </>
  );
}

const FILTROS = [
  ['todas', 'Todas', () => true],
  ['parados', 'Sin actividad en 7 días', (p) => { const d = diasDesde(p.ultima_actividad); return d == null || d > 7; }],
  ['hoja1', 'Hoja 1 sin terminar', (p) => !p.hojas?.['1']?.fin],
  ['metodo', 'Usan el método', usaMetodo],
];

function Personas({ datos }) {
  const hojas = useMemo(hojasIaLab, []);
  const [filtro, setFiltro] = useState('todas');
  const [orden, setOrden] = useState({ k: 'ultima', asc: true });

  const f = FILTROS.find((x) => x[0] === filtro)[2];
  const lista = datos.personas.filter(f).slice().sort((a, b) => {
    const val = (p) => {
      if (orden.k === 'ultima') return p.ultima_actividad || '';
      if (orden.k === 'alta') return p.alta || '';
      if (orden.k === 'nombre') return (p.nombre || p.correo || '').toLowerCase();
      if (orden.k === 'metodo') return p.metodo_paso ?? -1;
      const e = p.hojas?.[orden.k];
      return e ? (e.fin ? 1000 : e.paso || 1) : -1;
    };
    const va = val(a); const vb = val(b);
    const r = va < vb ? -1 : va > vb ? 1 : 0;
    return orden.asc ? r : -r;
  });
  const ordena = (k) => setOrden((o) => ({ k, asc: o.k === k ? !o.asc : true }));
  const Cab = ({ k, children }) => (
    <th><button className="pb-th" onClick={() => ordena(k)} aria-sort={orden.k === k ? (orden.asc ? 'ascending' : 'descending') : 'none'}>{children}{orden.k === k ? (orden.asc ? ' ↑' : ' ↓') : ''}</button></th>
  );
  const viejo = (p) => { const d = diasDesde(p.ultima_actividad); return d == null || d > 7; };
  const via = { email: 'Correo', google: 'Google', github: 'GitHub' };

  return (
    <>
      <h1>Personas registradas</h1>
      <p className="pb-sub">{datos.personas.length} cuentas · una fila por persona</p>
      <div className="pb-fijo">Aquí se ve quién ha llegado hasta dónde. Nunca lo que ha escrito.</div>
      <div className="pb-filtros">
        {FILTROS.map(([k, t, fn]) => (
          <button key={k} className={'pb-chip' + (filtro === k ? ' on' : '')} aria-pressed={filtro === k} onClick={() => setFiltro(k)}>
            {t} ({datos.personas.filter(fn).length})
          </button>
        ))}
        <button className="pb-chip" onClick={() => bajar(aCsv(lista, hojas), 'personas-guia-ai-first.csv', 'text/csv;charset=utf-8')}>Descargar CSV</button>
      </div>

      <table className="pb-tabla pb-personas">
        <thead>
          <tr>
            <Cab k="nombre">Persona</Cab><th>Vía</th><Cab k="alta">Alta</Cab><Cab k="ultima">Última actividad</Cab>
            {hojas.map((h) => <Cab key={h.n} k={h.n}>{h.titulo}</Cab>)}
            <Cab k="metodo">Método</Cab><th>Plan 30</th><th>Semanas</th>
          </tr>
        </thead>
        <tbody>
          {lista.map((p) => (
            <tr key={p.correo}>
              <td data-l="Persona"><strong>{p.nombre || p.correo}</strong>{p.nombre && <div className="pb-mute">{p.correo}</div>}</td>
              <td data-l="Vía">{via[p.via] || p.via}</td>
              <td data-l="Alta">{fecha(p.alta)}</td>
              <td data-l="Última actividad" className={viejo(p) ? 'pb-viejo' : ''}>{haceCuanto(p.ultima_actividad)}</td>
              {hojas.map((h) => { const e = estadoHoja(p.hojas?.[h.n]); return <td key={h.n} data-l={h.titulo}><span className={'pb-st ' + e.tipo}>{e.txt}</span></td>; })}
              <td data-l="Método">{p.metodo_paso ? `${p.metodo_paso}/7` : '—'}</td>
              <td data-l="Plan 30">{p.plan30 ? 'sí' : '—'}</td>
              <td data-l="Semanas">{p.semanas_cerradas || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="pb-mute">«—» sin empezar · «7/11» paso en el que está · «✓» terminada. Más de 7 días sin actividad, en rojo. Pulsar una cabecera ordena por esa columna.</p>
    </>
  );
}
