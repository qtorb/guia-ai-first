import { useNavigate } from 'react-router-dom';
import sesionesData from '../data/sesiones.json';
import { plan, dondeEstoy } from '../lib/plan30';
import { segundaSentada } from '../lib/segundaSentada';

// La portada del sitio: dos puertas, una por cada cosa que aquí se trabaja.
// Port de portadaHtml() — guia-ai-first-src/index.html:3462-3479 — rehecho en
// septiembre de 2026, cuando esta página pasó de ser una habitación lateral a
// la que solo se llegaba desde «¿Por dónde empiezo?» a ser la entrada del sitio.

const SESIONES = sesionesData.sesiones || [];

// Qué decirle a quien ya ha empezado. Lo sabe este navegador, no un servidor:
// si no hay nada guardado, la puerta no dice nada y recibe desde cero.
function avanceLab(dossier) {
  // Lo primero, si toca: la segunda sentada de la hoja 0 lleva días esperando.
  const vuelta = segundaSentada((dossier.hojas || {})[10]);
  if (vuelta) {
    return {
      est: `Te espera la segunda parte de la hoja 0 · escribiste hace ${vuelta.dias} días`,
      cta: 'Ir a la segunda parte →',
      destino: vuelta.destino,
    };
  }
  const empezadas = Object.entries(dossier.hojas || {})
    .filter(([, h]) => Object.keys(h).some((k) => k[0] !== '_' && String(h[k] ?? '').trim()));
  if (!empezadas.length) return null;
  // Con una sola hoja empezada, la tarjeta lleva directa a esa hoja; con
  // varias, a la lista.
  if (empezadas.length > 1) {
    const terminadas = empezadas.filter(([, h]) => h._fin).length;
    const est = `${empezadas.length} hojas empezadas`
      + (terminadas === 1 ? ' · 1 terminada' : terminadas > 1 ? ` · ${terminadas} terminadas` : '');
    return { est, destino: '/ia-lab' };
  }
  const [n, h] = empezadas[0];
  const ses = SESIONES.find((s) => String(s.n) === String(n));
  const etiqueta = ses ? (ses.etiqueta ?? ses.n) : n;
  const destino = `/ia-lab/${n}`;
  // Terminada: lo que queda por hacer ahí es volver a su documento.
  if (h._fin) {
    return {
      est: `Hoja ${etiqueta} · terminada`,
      cta: 'Ver tu documento →',
      destino: h._total ? `/ia-lab/${n}?paso=${h._total}` : destino,
    };
  }
  if (h._paso && h._total) return { est: `Hoja ${etiqueta} · paso ${h._paso} de ${h._total}`, destino };
  return { est: `Hoja ${etiqueta}, empezada`, destino };
}

// Devuelve {est, cta, destino} porque las dos cosas van juntas: «ver dónde vas» solo
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
        return { est: `Tu método, montado · día ${aqui.dia} de ${aqui.total}`, cta: 'Ver dónde vas →', destino: '/metodo/plan' };
      }
    } catch (e) { /* sin plan legible: se cae al paso */ }
  }
  const paso = Math.min(Number(d._paso) || 1, 9);
  return { est: `Empezado · paso ${paso} de 9`, cta: 'Seguir montándolo →', destino: '/metodo/recorrido' };
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
            ayuda de la IA, y anota lo que aprende el mismo día. De ahí salió esto.
          </p>
          <h1 className="enth1">Tu proyecto y tu forma de trabajar con la IA.</h1>
        </div>

        <div className="dospuertas">
          <a className="gp gp-lab" href={`#${lab ? lab.destino : '/ia-lab'}`} onClick={ir(lab ? lab.destino : '/ia-lab')}>
            <span className="gpk">MMDD31 · UPF-BSM</span>
            <b>IA-Lab</b>
            <span className="gpd">
              Seis sesiones para trabajar tu propio TFM. De cada una sales con una parte
              escrita. Empieza por la hoja 0, para buscar idea o poner a prueba la tuya: la
              recomendamos a todos. Ya están la hoja 0, la sesión 1 y tu plantilla de encargo;
              las demás se abren con cada sesión. Aquí no se lee: se escribe.
            </span>
            {lab && <span className="p-est">{lab.est}</span>}
            <span className="gpgo">{lab ? (lab.cta || 'Seguir donde lo dejaste →') : 'Ver las hojas →'}</span>
          </a>

          <a className="gp gp-guia" href={`#${metodo ? metodo.destino : '/metodo'}`} onClick={ir(metodo ? metodo.destino : '/metodo')}>
            <span className="gpk">Abierto a cualquiera</span>
            <b>El Método AI-First</b>
            <span className="gpd">
              Para trabajar con IA sin que se te vaya de las manos: qué le pides, qué
              revisas y qué no le dejas decidir. Lo preparas en quince minutos y te llevas
              tus ficheros escritos. Incluye un manual de 18 capítulos cortos.
            </span>
            {metodo && <span className="p-est">{metodo.est}</span>}
            <span className="gpgo">{metodo ? metodo.cta : 'Preparar el mío →'}</span>
          </a>
        </div>

        <p className="entorienta">
          Son dos problemas distintos que se confunden. Los dos acaban igual —semanas de
          trabajo que no llevan a ningún sitio—, pero se resuelven en sitios distintos. Si lo
          que no tienes claro es <b>tu proyecto</b>, entra en IA-Lab. Si lo que no controlas es
          <b>cómo trabajas con la IA</b>, entra en el método.
        </p>

        <div className="entpie">
          <span className="sello">Beta permanente</span>
          <p>Sin cuenta, lo que escribes es un <b>borrador</b> y solo se guarda en este
            navegador. Si entras con tu cuenta, queda <b>guardado</b> y lo tienes en cualquier
            dispositivo.</p>
        </div>
      </div>
    </div>
  );
}
