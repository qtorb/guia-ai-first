import { useNavigate } from 'react-router-dom';
import sesionesData from '../data/sesiones.json';
import { bajar } from '../lib/portapapeles';
import { slug } from '../lib/protocolo';
import { segundaSentada } from '../lib/segundaSentada';

// Port de pintarSesiones()/estadoDe() — guia-ai-first-src/index.html
// L2800-2825.
function estadoDe(dossier, n) {
  const d = dossier.hojas[n];
  if (!d) return null;
  const total = d._total || 0;
  const hechos = Object.keys(d).filter((k) => k[0] !== '_' && d[k] !== '' && d[k] !== false).length;
  // La hoja 0 se hace en dos sentadas: si la segunda espera, eso va antes.
  if (Number(n) === 10) {
    const vuelta = segundaSentada(d);
    if (vuelta) return { txt: 'Te espera la segunda sentada →', cls: 'curso', destino: vuelta.destino };
  }
  if (d._fin) return { txt: '✓ Terminada', cls: 'fin' };
  if (hechos) return { txt: `Paso ${d._paso || 1}${total ? ' de ' + total : ''} · Continuar →`, cls: 'curso' };
  return null;
}

export default function IaLabList({ dossierCtl }) {
  const navigate = useNavigate();
  const { dossier } = dossierCtl;
  const SES = sesionesData;

  const finalizadas = SES.sesiones.filter((s) => dossier.hojas[s.n] && dossier.hojas[s.n]._fin).length;

  function descargarDossier() {
    let t = 'MI DOSSIER · IA-Lab · MMDD31\n' + (dossier.proyecto._nombre || '') + '\n' + '='.repeat(58) + '\n\n';
    SES.sesiones.forEach((s) => {
      const d = dossier.hojas[s.n];
      if (d && d._salida) t += d._salida + '\n\n' + '='.repeat(58) + '\n\n';
    });
    bajar(t, 'dossier-' + (slug(dossier.proyecto._nombre || '') || 'ia-lab') + '.txt', 'text/plain;charset=utf-8');
  }

  return (
    <div className="wrap">
      <header>
        <div className="kicker">{SES.titulo}</div>
        <h1>Mis hojas de IA-Lab</h1>
        <p className="lede">{SES.lede}</p>
      </header>
      {/* Las herramientas no son sesiones y no van numeradas: si entran en la
          lista, el alumno lee «0, 1, encargo, 2» y se pregunta qué sesión es
          ésa. Van encima, con otra forma. */}
      {(SES.herramientas || []).map((h) => (
        <a
          key={h.n}
          className="herr"
          href={`#/ia-lab/${h.n}`}
          onClick={(e) => { e.preventDefault(); navigate(`/ia-lab/${h.n}`); }}
        >
          <div className="hrb">
            <b>{h.titulo}</b>
            <span>{h.lede}</span>
          </div>
          <em>Abrir →</em>
        </a>
      ))}
      <div className="ses">
        {SES.sesiones.map((s) => {
          const st = estadoDe(dossier, s.n);
          const hay = !!s.fichero;
          const Tag = hay ? 'a' : 'div';
          const destino = st?.destino || `/ia-lab/${s.n}`;
          return (
            <Tag
              key={s.n}
              className={'sc' + (hay ? '' : ' off') + (st && st.cls === 'fin' ? ' hecha' : '')}
              href={hay ? `#${destino}` : undefined}
              onClick={hay ? (e) => { e.preventDefault(); navigate(destino); } : undefined}
            >
              <div className="scn">{s.etiqueta || s.n}</div>
              <div className="scb">
                <b>{s.titulo}</b>
                <span className="sca">{s.asignatura}</span>
                <span className="scs">{s.salida}</span>
              </div>
              <div className="sce">
                {hay
                  ? (st ? <em className={st.cls}>{st.txt}</em> : <em className="disp">Disponible →</em>)
                  : <em className="aun">Aún no</em>}
              </div>
            </Tag>
          );
        })}
      </div>
      {finalizadas >= 2 && (
        <div className="acts" style={{ marginTop: 26 }}>
          <button className="btn btn-d" onClick={descargarDossier}>Descargar mi dossier ({finalizadas} piezas)</button>
        </div>
      )}
      <footer>IA-Lab · MMDD31 · UPF-BSM<br />Guía AI-First · Albert Garcia Pujadas · @qtorb</footer>
    </div>
  );
}
