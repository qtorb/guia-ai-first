import { useNavigate } from 'react-router-dom';
import sesionesData from '../data/sesiones.json';
import { plan, dondeEstoy } from '../lib/plan30';

// La portada del sitio: dos puertas, una por cada cosa que aquí se trabaja.
// Port de portadaHtml() — guia-ai-first-src/index.html:3462-3479 — rehecho en
// septiembre de 2026, cuando esta página pasó de ser una habitación lateral a
// la que solo se llegaba desde «¿Por dónde empiezo?» a ser la entrada del sitio.

const SESIONES = sesionesData.sesiones || [];

// Qué decirle a quien ya ha empezado. Lo sabe este navegador, no un servidor:
// si no hay nada guardado, la puerta no dice nada y recibe desde cero.
function avanceLab(dossier) {
  const empezadas = Object.entries(dossier.hojas || {})
    .filter(([, h]) => Object.keys(h).some((k) => k[0] !== '_' && String(h[k] ?? '').trim()));
  if (!empezadas.length) return null;
  if (empezadas.length > 1) return `${empezadas.length} hojas empezadas`;
  const [n, h] = empezadas[0];
  const ses = SESIONES.find((s) => String(s.n) === String(n));
  const etiqueta = ses ? (ses.etiqueta ?? ses.n) : n;
  if (h._paso && h._total) return `Sesión ${etiqueta} · paso ${h._paso} de ${h._total}`;
  return `Sesión ${etiqueta}, empezada`;
}

// Devuelve {est, cta} porque las dos cosas van juntas: «ver dónde vas» solo
// tiene sentido si el plan de 30 días está corriendo; a medio montar, lo que
// toca decir es «sigue montándolo».
function avanceMetodo() {
  let d;
  try { d = JSON.parse(localStorage.getItem('metodo-ai-first')) || {}; } catch (e) { return null; }
  const hay = Object.keys(d).some((k) => k[0] !== '_' && String(d[k] ?? '').trim());
  if (!hay) return null;
  if (d.persona || d.cuando) {
    try {
      const aqui = dondeEstoy(plan(d));
      if (aqui && !aqui.pasado) {
        return { est: `Tu método, montado · día ${aqui.dia} de ${aqui.total}`, cta: 'Ver dónde vas →' };
      }
    } catch (e) { /* sin plan legible: se cae al paso */ }
  }
  const paso = Math.min(Number(d._paso) || 1, 7);
  return { est: `Empezado · paso ${paso} de 7`, cta: 'Seguir montándolo →' };
}

export default function Home({ dossierCtl }) {
  const navigate = useNavigate();
  const { dossier } = dossierCtl;
  const lab = avanceLab(dossier);
  const metodo = avanceMetodo();

  const ir = (destino) => (e) => { e.preventDefault(); navigate(destino); };

  return (
    <div className="ent">
      <div className="ent-in">
        <div>
          <p className="entcred">
            Desde mayo de 2026, Albert Garcia Pujadas construye un producto él solo con
            agentes y anota lo que aprende el día que lo aprende. De ahí salió esto.
          </p>
          <h1 className="enth1">Tu proyecto, y cómo trabajas con la IA.</h1>
        </div>

        <div className="dospuertas">
          <a className="gp gp-lab" href="#/ia-lab" onClick={ir('/ia-lab')}>
            <span className="gpk">MMDD31 · UPF-BSM</span>
            <b>IA-Lab</b>
            <span className="gpd">
              Seis sesiones sobre tu propio TFM. De cada una sales con una pieza escrita:
              el mapa de tu mercado, tu propuesta de valor, tu matriz de captación.
              Se hace, no se lee.
            </span>
            {lab && <span className="p-est">{lab}</span>}
            <span className="gpgo">{lab ? 'Seguir donde lo dejaste →' : 'Empezar el recorrido →'}</span>
          </a>

          <a className="gp gp-guia" href="#/metodo" onClick={ir('/metodo')}>
            <span className="gpk">Abierto a cualquiera</span>
            <b>El Método AI-First</b>
            <span className="gpd">
              Cómo trabajar con agentes sin que se te vaya de las manos: qué les pides,
              qué revisas y qué no delegas. Móntalo en quince minutos y sales con los
              ficheros de tu método escritos. Debajo, 18 capítulos cortos.
            </span>
            {metodo && <span className="p-est">{metodo.est}</span>}
            <span className="gpgo">{metodo ? metodo.cta : 'Montar el mío →'}</span>
          </a>
        </div>

        <p className="entorienta">
          Son dos cosas distintas y se confunden. Fallan igual —semanas de trabajo que no
          llevan a ningún sitio— y se arreglan en sitios distintos. Si lo que no tienes
          claro es <b>tu proyecto</b>, entra por IA-Lab. Si lo que no controlas es <b>cómo
          trabajas con la IA</b>, entra por el método.
        </p>

        <div className="entpie">
          <span className="sello">Beta permanente</span>
          <p>Nada de lo que escribas sale de tu navegador. No hay cuentas ni contraseñas.</p>
        </div>
      </div>
    </div>
  );
}
