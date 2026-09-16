import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fechaLarga } from '../lib/protocoloAiFirst';
import { plan, dondeEstoy, ics, LLAVE_PLAN } from '../lib/plan30';
import { TEXTOS } from '../lib/textos';
import { useToast } from '../components/Toast';

const LLAVE = 'metodo-ai-first';

function leerGuardado() {
  try { return JSON.parse(localStorage.getItem(LLAVE)) || {}; } catch (e) { return {}; }
}
function leerMarcas() {
  try { return JSON.parse(localStorage.getItem(LLAVE_PLAN)) || {}; } catch (e) { return {}; }
}

const TEXTO_DE = {
  'Cerrar la tanda': 'textos/4_cerrar_la_tanda.md',
  'Escribir el encargo': 'textos/1_escribir_el_encargo.md',
  'Abrir la siguiente tanda': 'textos/4_cerrar_la_tanda.md',
};

// La prueba de cada semana: lo que tiene que EXISTIR para que el tramo se
// llene. No se llena con el calendario — esa es toda la gracia.
const PRUEBA = [
  'Ya tengo tres frases literales suyas anotadas',
  'Ya existe la dirección y la he abierto en un móvil',
  'Ya la han mirado cinco personas de mi público',
  'Ya está publicado y he escrito qué cambié',
];

export default function Plan30() {
  const navigate = useNavigate();
  const toast = useToast();
  const d = useMemo(() => leerGuardado(), []);
  const p = useMemo(() => plan(d), [d]);
  const aqui = dondeEstoy(p);

  const [m, setM] = useState(() => leerMarcas());
  useEffect(() => {
    try { localStorage.setItem(LLAVE_PLAN, JSON.stringify(m)); } catch (e) { /* modo privado */ }
  }, [m]);

  const hechas = [0, 1, 2, 3].filter((i) => m['s' + (i + 1)]).length;
  const cambios = Number(m.cambios || 0);
  const sup = Number(m.sup || 0);
  const comp = Number(m.comp || 0);

  function copiar(clave, aviso) {
    const t = TEXTOS[clave];
    if (!t) return;
    navigator.clipboard?.writeText(t).then(
      () => toast(aviso || 'Texto copiado'),
      () => toast('No he podido copiar; ábrelo desde la carpeta')
    );
  }

  function bajarIcs() {
    const blob = new Blob([ics(d, p)], { type: 'text/calendar;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'metodo-30-dias.ics';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    toast('Fechas descargadas: ábrelo y tu calendario las añade');
  }

  const sinRecorrido = !d.quien && !d.persona;

  return (
    <div className="pagina">
      <p className="rotulo">El método · tu plan</p>
      <h1 className="plan-titular">En dos semanas tienes algo fuera.<br />En cuatro sabes qué cambiar.</h1>

      {sinRecorrido ? (
        <div className="aviso">
          <p className="rotulo">Todavía no hay plan</p>
          <p>Este plan se hace con lo que escribes en el recorrido: con quién hablas,
            qué día, y tu momento de parar a pensar. Sin eso son cuatro fechas vacías.</p>
          <div className="acciones">
            <button className="btn" onClick={() => navigate('/metodo/recorrido')}>Hacer el recorrido</button>
          </div>
        </div>
      ) : (
        <>
          <div className="tira-avance">
            <div className="tramos" role="img"
              aria-label={`${hechas} de 4 semanas con su prueba hecha`}>
              {[1, 2, 3, 4].map((n) => (
                <span key={n} className={'tramo' + (m['s' + n] ? ' lleno' : '')} />
              ))}
            </div>
            <label className="marcador">
              <input type="number" min="0" inputMode="numeric" value={cambios}
                onChange={(e) => setM({ ...m, cambios: e.target.value })} />
              <span>cosas cambiadas por lo que te dijeron</span>
            </label>
            <label className="marcador">
              <input type="number" min="0" inputMode="numeric" value={sup}
                onChange={(e) => setM({ ...m, sup: e.target.value })} />
              <span>suposiciones</span>
              <input type="number" min="0" inputMode="numeric" value={comp}
                onChange={(e) => setM({ ...m, comp: e.target.value })} />
              <span>comprobadas</span>
            </label>
          </div>

          <div className="hoy-octubre">
            <div>
              <p className="rotulo">Hoy tienes</p>
              <p>Una carpeta, un encargo y una suposición sin comprobar.</p>
            </div>
            <div>
              <p className="rotulo">El {fechaLarga(p.lanzamiento)}</p>
              <p>Una página fuera, cinco personas que la han mirado, y algo que has
                cambiado por lo que te dijeron.</p>
            </div>
          </div>

          {aqui && !aqui.pasado && (
            <p className="donde">Vas por el día {aqui.dia} de 30 · semana {aqui.semana}.</p>
          )}

          <div className="semanas">
            {p.semanas.map((s, i) => (
              <section key={s.n}
                className={'semana' + (aqui && !aqui.pasado && aqui.semana === s.n ? ' ahora' : '')}>
                <div className="cuando">
                  <p className="fecha">{fechaLarga(s.desde)} – {fechaLarga(s.hasta)}</p>
                  <p className="ayuda">Cierras el {fechaLarga(s.cierre)} a las {s.hora}</p>
                </div>
                <div className="quegano">
                  <p className="rotulo">Semana {s.n} · sales con</p>
                  <h2>{s.gano}</h2>
                  <p>{s.como}</p>
                  {s.uxm && (
                    <p className="uxm">Antes de enseñarla a nadie, pásala por{' '}
                      <a href="https://uxmachine.app" target="_blank" rel="noopener noreferrer">uxmachine.app</a>:
                      mide lo que tu página declara, no lo que promete, y te devuelve qué mirar
                      y con qué prueba. No te dice si tu web es buena; te dice qué no se entiende solo.</p>
                  )}
                  <label className="prueba">
                    <input type="checkbox" checked={!!m['s' + s.n]}
                      onChange={(e) => setM({ ...m, ['s' + s.n]: e.target.checked })} />
                    <span>{PRUEBA[i]}</span>
                  </label>
                  <div className="acciones">
                    <button className="btn btn-2"
                      onClick={() => copiar(TEXTO_DE[s.texto], `«${s.texto}» copiado`)}>
                      Copiar «{s.texto}»
                    </button>
                  </div>
                </div>
              </section>
            ))}
          </div>

          <div className="acciones">
            <button className="btn" onClick={bajarIcs}>Añadir las fechas a mi calendario</button>
            <button className="btn btn-2" onClick={() => navigate('/metodo')}>← El método</button>
          </div>

          <p className="ayuda pie-plan">Las fechas son tuyas y se mueven. La conversación de la
            semana 1, no: esa se reserva con antelación o no ocurre, y es la única pieza de
            todo esto que no se puede sustituir por nada.</p>

          <p className="ayuda">Lo que marcas aquí lo guarda tu navegador, no un servidor nuestro.</p>
        </>
      )}
    </div>
  );
}
