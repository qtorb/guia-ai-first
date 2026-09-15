import { useNavigate } from 'react-router-dom';
import manual from '../data/manual.json';

// Port de portadaHtml() — guia-ai-first-src/index.html:3462-3479.
export default function Home({ dossierCtl }) {
  const navigate = useNavigate();
  const { dossier } = dossierCtl;
  const totalCapitulos = Object.keys(manual.capitulos).length;
  const hojasEmpezadas = Object.keys(dossier.hojas || {}).length;

  return (
    <div className="ent">
      <div className="ent-in">
        <div className="kicker">IA-LAB · MMDD31 · UPF-BSM</div>
        <h1 className="enth1">Dos cosas:<br />un método y un recorrido.</h1>
        <p className="lede">
          Desde mayo de 2026, Albert Garcia Pujadas ha construido un producto él solo con agentes de
          inteligencia artificial, y ha ido anotando lo que aprendía el día que lo aprendía. De ahí
          salió el <b>método</b>. Y de lo aprendido salió <b>IA-Lab</b>: seis sesiones donde ese
          método se aplica a tu propio proyecto.
        </p>
        <div className="dospuertas">
          <a className="gp gp-lab" href="#/ia-lab" onClick={(e) => { e.preventDefault(); navigate('/ia-lab'); }}>
            <span className="gpk">Si vienes de clase, por aquí</span><b>IA-Lab</b>
            <span className="gpd">Tu recorrido del curso: seis sesiones, seis piezas y, al final, tu TFM. Se hace, no se lee.</span>
            {hojasEmpezadas > 0 && <span className="p-est">Tienes una hoja empezada</span>}
            <span className="gpgo">Ver el recorrido →</span>
          </a>
          <a className="gp gp-guia" href="#/metodo" onClick={(e) => { e.preventDefault(); navigate('/metodo'); }}>
            <span className="gpk">El método que hay debajo</span><b>El Método AI-First</b>
            <span className="gpd">
              Móntalo en quince minutos y sal con los ficheros de tu método escritos. Debajo,
              {' '}{totalCapitulos} capítulos cortos: cada uno es algo que pasó, la decisión que hubo
              que tomar y lo que costó equivocarse.
            </span>
            <span className="gpgo">Empezar →</span>
          </a>
        </div>
        <p className="entorienta">
          Aquí se trabajan <b>dos cosas que se confunden</b>: <b>tu proyecto</b> —qué construyes, para
          quién y para qué— y <b>tu relación con la IA</b> —cómo trabajas con ella—. Fallan igual y se
          arreglan en sitios distintos. Si lo que no tienes claro es lo primero, entra por IA-Lab; si
          lo que no controlas es lo segundo, entra por el método. La mayoría empieza por IA-Lab.
        </p>
        <p className="entpie">Nada de lo que escribas sale de tu navegador. No hay cuentas ni contraseñas.</p>
      </div>
    </div>
  );
}
