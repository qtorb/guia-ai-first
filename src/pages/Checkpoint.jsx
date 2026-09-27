import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { alPortapapeles, bajar } from '../lib/portapapeles';
import { hoy, fechaLarga } from '../lib/protocoloAiFirst';
import { TEXTOS } from '../lib/textos';
import { bloqueCheckpoint, leerCheckpoints, guardarCheckpoints } from '../lib/checkpoint';
import { leerAviso, pausar, reanudar, nota } from '../lib/avisos';
import { LLAVE_PLAN } from '../lib/plan30';

function leerMetodo() {
  try { return JSON.parse(localStorage.getItem('metodo-ai-first')) || {}; } catch (e) { return {}; }
}
function leerPlan30() {
  try { return JSON.parse(localStorage.getItem(LLAVE_PLAN)) || {}; } catch (e) { return {}; }
}

const VACIA = {
  r1: '', r2: '', r3: '', col: '', colTxt: '',
  contactos: '', cambios: '', comprobadas: '',
  veredicto: '', porque: '', quien: '', dia: '',
};

export default function Checkpoint({ n }) {
  const navigate = useNavigate();
  const toast = useToast();
  const d = useMemo(leerMetodo, []);
  const letra = d.columna || '';

  const [entradas, setEntradas] = useState(() =>
    leerCheckpoints().slice().sort((a, b) => (a.fecha < b.fecha ? 1 : -1))
  );
  const fechaHoy = hoy();
  const entradaHoy = entradas.find((e) => e.fecha === fechaHoy);
  const anterior = entradas.find((e) => e.fecha !== fechaHoy);

  const [f, setF] = useState(() => (entradaHoy ? { ...VACIA, ...entradaHoy } : VACIA));
  const [guardado, setGuardado] = useState(!!entradaHoy);

  const set = (k, v) => setF((prev) => ({ ...prev, [k]: v }));

  function copiarTexto5() {
    alPortapapeles(TEXTOS['textos/5_checkpoint.md']).then(
      () => toast('«El checkpoint de la semana» copiado'),
      () => toast('No he podido copiarlo: selecciónalo y cópialo a mano')
    );
  }

  const contactosNum = Number(f.contactos || 0);
  const cambiosNum = Number(f.cambios || 0);
  const comprobadasNum = Number(f.comprobadas || 0);
  const saltaReglaContacto = contactosNum === 0 && anterior && Number(anterior.contactos || 0) === 0;

  const puedeGuardar = !!f.veredicto && !!(f.porque || '').trim();

  async function guardar() {
    const entrada = {
      fecha: fechaHoy,
      r1: f.r1 || '', r2: f.r2 || '', r3: f.r3 || '',
      col: f.col || 'si', colTxt: f.colTxt || '',
      contactos: contactosNum, cambios: cambiosNum, comprobadas: comprobadasNum,
      veredicto: f.veredicto, porque: f.porque || '',
      quien: (f.quien || '').trim(), dia: (f.dia || '').trim(),
    };

    // Se sustituye la de hoy si ya existía, restando antes sus números.
    const sinHoy = entradas.filter((e) => e.fecha !== fechaHoy);
    const nuevas = [entrada, ...sinHoy].sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
    guardarCheckpoints(nuevas);
    setEntradas(nuevas);

    const m = leerPlan30();
    const antes = entradaHoy || { contactos: 0, cambios: 0, comp: 0 };
    const plan30 = {
      ...m,
      contactos: Number(m.contactos || 0) - Number(antes.contactos || 0) + contactosNum,
      cambios: Number(m.cambios || 0) - Number(antes.cambios || 0) + cambiosNum,
      comp: Number(m.comp || 0) - Number(antes.comprobadas || 0) + comprobadasNum,
    };
    try {
      localStorage.setItem(LLAVE_PLAN, JSON.stringify(plan30));
      window.dispatchEvent(new Event('guia-local'));
    } catch (e) { /* modo privado */ }

    if (entrada.quien && entrada.dia && n?.estado === 'dentro') {
      try {
        const { activo } = await leerAviso();
        if (activo) await nota(`${entrada.quien}, el ${fechaLarga(entrada.dia)}`);
      } catch (e) { /* no se avisa de nada */ }
    }

    setGuardado(true);
    toast('Semana cerrada');
  }

  const bloqueHoy = guardado ? bloqueCheckpoint(
    { ...f, contactos: contactosNum, cambios: cambiosNum, comprobadas: comprobadasNum, fecha: fechaHoy },
    letra
  ) : '';

  // Pausar / reanudar los avisos, igual que en AvisosMes.
  const [aviso, setAviso] = useState(null); // { activo, pausaHasta } | null
  const [ocupado, setOcupado] = useState(false);
  useEffect(() => {
    if (n?.estado !== 'dentro') return undefined;
    let vivo = true;
    leerAviso().then((a) => { if (vivo) setAviso(a); }).catch(() => {});
    return () => { vivo = false; };
  }, [n]);

  async function pausarAvisos() {
    if (ocupado) return;
    setOcupado(true);
    try {
      const fecha = await pausar();
      setAviso((a) => ({ ...a, pausaHasta: fecha }));
      toast(`Hecho: no te escribo hasta el ${fechaLarga(String(fecha || '').slice(0, 10))}`);
    } catch (e) {
      toast('No he podido guardarlo. Inténtalo otra vez en un momento.');
    } finally {
      setOcupado(false);
    }
  }
  async function reanudarAvisos() {
    if (ocupado) return;
    setOcupado(true);
    try {
      await reanudar();
      setAviso((a) => ({ ...a, pausaHasta: null }));
      toast('Hecho: vuelvo a escribirte');
    } catch (e) {
      toast('No he podido guardarlo. Inténtalo otra vez en un momento.');
    } finally {
      setOcupado(false);
    }
  }
  const enPausa = aviso?.pausaHasta && new Date(aviso.pausaHasta) > new Date();

  return (
    <div className="pagina">
      <p className="rotulo">El método · cierre de semana</p>
      <h1>Cierre de semana</h1>

      <div className="entradilla">
        <p>Media hora, una vez por semana. Cuatro preguntas fijas, tres números y un
          veredicto que firmas tú. Al guardar te llevas el bloque para tu <code>07_CIERRE.md</code>.</p>
      </div>

      <p className="ayuda">¿Prefieres hacerlo con tu IA y tu carpeta delante?{' '}
        <button className="lnk" onClick={copiarTexto5}>Copiar el texto 5</button>
      </p>

      {anterior && anterior.quien && anterior.dia && (
        <div className="aviso">
          <p className="rotulo">Dijiste que esta semana empezaba por aquí</p>
          <p>Hablar con {anterior.quien}, el {fechaLarga(anterior.dia)}.</p>
        </div>
      )}

      {anterior && (
        <details className="fichero">
          <summary><span>La semana pasada · {fechaLarga(anterior.fecha)}</span><span className="rotulo">abrir</span></summary>
          <pre>{bloqueCheckpoint(anterior, letra)}</pre>
        </details>
      )}

      <div className="campo">
        <label htmlFor="cp-r1">1 · ¿Qué decisión concreta ha mejorado esta semana gracias a lo que he hecho?</label>
        <p className="ayuda" id="ayuda-cp-r1">Si no sabes nombrar una, escríbelo tal cual: la semana ha sido de producción, no de avance.</p>
        <textarea id="cp-r1" aria-describedby="ayuda-cp-r1" value={f.r1} onChange={(e) => set('r1', e.target.value)} />
      </div>

      <div className="campo">
        <label htmlFor="cp-r2">2 · ¿Qué estamos haciendo por inercia y ya no sé justificar?</label>
        <p className="ayuda" id="ayuda-cp-r2">Una cosa basta.</p>
        <textarea id="cp-r2" aria-describedby="ayuda-cp-r2" value={f.r2} onChange={(e) => set('r2', e.target.value)} />
      </div>

      <div className="campo">
        <label htmlFor="cp-r3">3 · ¿Qué contacto con el mundo real he tenido?</label>
        <p className="ayuda" id="ayuda-cp-r3">Conversaciones con personas de fuera. No cuentan reuniones internas, revisiones ni modelos.</p>
        <textarea id="cp-r3" aria-describedby="ayuda-cp-r3" value={f.r3} onChange={(e) => set('r3', e.target.value)} />
      </div>

      <fieldset className="cierre1">
        <legend>4 · ¿Sigue cada cosa en su columna?</legend>
        <label className={'op-cierre' + (f.col === 'si' ? ' on' : '')}>
          <input type="radio" name="cp-col" value="si" checked={f.col === 'si'} onChange={() => set('col', 'si')} />
          <span><b>Sí</b><span className="pie">{letra ? `Sigue en ${letra}.` : 'Nada ha cambiado de fase.'}</span></span>
        </label>
        <label className={'op-cierre' + (f.col === 'no' ? ' on' : '')}>
          <input type="radio" name="cp-col" value="no" checked={f.col === 'no'} onChange={() => set('col', 'no')} />
          <span><b>No</b><span className="pie">Algo ya no está donde estaba.</span></span>
        </label>
      </fieldset>

      {f.col === 'no' && (
        <>
          <div className="campo">
            <label htmlFor="cp-col">Qué ha cambiado</label>
            <textarea id="cp-col" value={f.colTxt} onChange={(e) => set('colTxt', e.target.value)} />
          </div>
          <div className="aviso">
            <p>Cambia la letra en <code>00_VALOR.md</code>, con la fecha. Y antes de seguir, lee el
              10.3 del manual: cambiar de columna es añadir o retirar controles, no seguir con los mismos.</p>
            <p>
              <a href="#/guia/revision" onClick={(e) => { e.preventDefault(); navigate('/guia/revision'); }}
                style={{ minHeight: 44, display: 'inline-flex', alignItems: 'center' }}>
                Abrir el capítulo 10 del manual →
              </a>
            </p>
          </div>
        </>
      )}

      <h2>Los tres números</h2>
      <p className="ayuda">Se suman a los contadores de tu plan, que no se reinician nunca.</p>
      <label className="marcador">
        <input type="number" min="0" inputMode="numeric" value={f.contactos} onChange={(e) => set('contactos', e.target.value)} />
        <span>conversaciones con gente de fuera</span>
      </label>
      <label className="marcador">
        <input type="number" min="0" inputMode="numeric" value={f.cambios} onChange={(e) => set('cambios', e.target.value)} />
        <span>cosas cambiadas por lo que te dijeron</span>
      </label>
      <label className="marcador">
        <input type="number" min="0" inputMode="numeric" value={f.comprobadas} onChange={(e) => set('comprobadas', e.target.value)} />
        <span>suposiciones comprobadas</span>
      </label>

      {saltaReglaContacto && (
        <div className="aviso mal">
          <p className="rotulo">La regla del contacto</p>
          <p>Dos semanas sin hablar con nadie de fuera. La que viene empieza por ahí: ¿con quién y qué día?</p>
          <div className="campo">
            <label htmlFor="cp-quien">Con quién</label>
            <input type="text" id="cp-quien" value={f.quien} onChange={(e) => set('quien', e.target.value)} />
          </div>
          <div className="campo">
            <label htmlFor="cp-dia">Qué día</label>
            <input type="date" id="cp-dia" value={f.dia} onChange={(e) => set('dia', e.target.value)} />
          </div>
        </div>
      )}

      <fieldset className="cierre1">
        <legend>El veredicto · lo firmas tú</legend>
        <label className={'op-cierre' + (f.veredicto === 'seguimos' ? ' on' : '')}>
          <input type="radio" name="cp-ver" value="seguimos" checked={f.veredicto === 'seguimos'} onChange={() => set('veredicto', 'seguimos')} />
          <span><b>Seguimos</b><span className="pie">Lo que hay sigue teniendo sentido.</span></span>
        </label>
        <label className={'op-cierre' + (f.veredicto === 'cambiamos' ? ' on' : '')}>
          <input type="radio" name="cp-ver" value="cambiamos" checked={f.veredicto === 'cambiamos'} onChange={() => set('veredicto', 'cambiamos')} />
          <span><b>Cambiamos</b><span className="pie">Algo de esta semana obliga a cambiar de plan.</span></span>
        </label>
        <label className={'op-cierre' + (f.veredicto === 'paramos' ? ' on' : '')}>
          <input type="radio" name="cp-ver" value="paramos" checked={f.veredicto === 'paramos'} onChange={() => set('veredicto', 'paramos')} />
          <span><b>Paramos</b><span className="pie">Todo o una parte. El manual, en el capítulo 13, dice cómo parar bien.</span></span>
        </label>
      </fieldset>
      <div className="campo">
        <label htmlFor="cp-porque">Por qué</label>
        <textarea id="cp-porque" value={f.porque} onChange={(e) => set('porque', e.target.value)} />
      </div>

      <div className="acciones">
        <button className="btn" onClick={guardar} disabled={!puedeGuardar}>
          {entradaHoy || guardado ? 'Guardar los cambios' : 'Guardar el cierre de semana'}
        </button>
      </div>
      <p className="ayuda">{n?.estado === 'dentro'
        ? 'Se guarda en tu cuenta y en este navegador.'
        : 'Se guarda en este navegador. Si entras con tu cuenta, también en ella.'}</p>

      {guardado && (
        <>
          <p className="rotulo">Para tu 07_CIERRE.md</p>
          <details className="fichero" open>
            <summary><span>07_CIERRE.md · checkpoint del {fechaLarga(fechaHoy)}</span><span className="rotulo">abrir</span></summary>
            <pre>{bloqueHoy}</pre>
            <div className="pie">
              <button className="btn btn-2" onClick={() => alPortapapeles(bloqueHoy).then(() => toast('Bloque copiado'))}>Copiar</button>
              <button className="btn btn-2" onClick={() => bajar(bloqueHoy, `checkpoint-${fechaHoy}.md`, 'text/markdown;charset=utf-8')}>Descargar .md</button>
            </div>
          </details>
          <p className="ayuda">Pégalo arriba del todo en <code>metodo/07_CIERRE.md</code>, debajo de la cabecera.
            La web guarda una copia, pero la que cuenta es la de tu carpeta.</p>
        </>
      )}

      {n?.estado === 'dentro' && aviso?.activo && (
        enPausa ? (
          <p className="ayuda">En pausa hasta el {fechaLarga(String(aviso.pausaHasta).slice(0, 10))}. {' '}
            <button className="lnk" onClick={reanudarAvisos}>Reanudar</button></p>
        ) : (
          <p className="ayuda">Te escribo cada semana, el día de tu checkpoint. {' '}
            <button className="lnk" onClick={pausarAvisos}>Pausar dos semanas</button></p>
        )
      )}

      <div className="acciones">
        <button className="btn btn-2" onClick={() => navigate('/metodo')}>← El método</button>
      </div>
    </div>
  );
}
