import { useEffect } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import { useDossier } from './hooks/useDossier';
import Home from './pages/Home';
import IaLabList from './pages/IaLabList';
import IaLabHoja from './pages/IaLabHoja';
import GuiaIndex from './pages/GuiaIndex';
import GuiaCapitulo from './pages/GuiaCapitulo';
import ProtocoloIA from './pages/ProtocoloIA';

// La sesión 1 («Mi protocolo de IA») es el asistente del Método AI-First
// portado de sitio.py: otra estructura de página (taller + fichero en vivo),
// no el motor de bloques de hojas.json. El resto de sesiones siguen con
// IaLabHoja.
function HojaRuta({ dossierCtl }) {
  const { n } = useParams();
  if (Number(n) === 1) return <ProtocoloIA dossierCtl={dossierCtl} sesionN={1} />;
  return <IaLabHoja dossierCtl={dossierCtl} />;
}

function Barra() {
  const navigate = useNavigate();
  const loc = useLocation();
  const enHoja = loc.pathname.startsWith('/ia-lab');
  return (
    <div id="bar" className={enHoja ? 'ctx-hoja' : 'ctx-guia'}>
      <div className="in">
        <div className="brand" onClick={() => navigate('/guia')} style={{ cursor: 'pointer' }}>
          Guía AI-First<small>IA-Lab · MMDD31</small>
        </div>
        <div className="tabs">
          <button className={'tab' + (!enHoja ? ' on' : '')} onClick={() => navigate('/guia')}>
            <b>El método</b><small>apuntes cortos</small>
          </button>
          <button className={'tab' + (enHoja ? ' on' : '')} onClick={() => navigate('/ia-lab')}>
            <b>IA-Lab</b><small>Hacer los ejercicios</small>
          </button>
        </div>
        <div className="spacer" />
        <button id="ayuda" onClick={() => navigate('/')}>¿Por dónde empiezo?</button>
      </div>
    </div>
  );
}

function Shell({ dossierCtl }) {
  const loc = useLocation();
  const esPortada = loc.pathname === '/';
  const enHoja = loc.pathname.startsWith('/ia-lab');

  // Port de ver()/verPortada() — guia-ai-first-src/index.html:3444-3451,
  // 3485-3490: las reglas de color/layout (--ctx rojo en la hoja, etc.)
  // cuelgan de clases en <body>, no del router.
  useEffect(() => {
    document.body.classList.toggle('ctx-hoja', enHoja);
    document.body.classList.toggle('ctx-guia', !enHoja);
    document.body.classList.toggle('en-entrada', esPortada);
    window.scrollTo(0, 0);
  }, [loc.pathname, enHoja, esPortada]);

  return (
    <>
      {!esPortada && <Barra />}
      <main>
        <Routes>
          <Route path="/" element={<Home dossierCtl={dossierCtl} />} />
          <Route path="/ia-lab" element={<IaLabList dossierCtl={dossierCtl} />} />
          <Route path="/ia-lab/:n" element={<HojaRuta dossierCtl={dossierCtl} />} />
          <Route path="/guia" element={<GuiaIndex />} />
          <Route path="/guia/:ident" element={<GuiaCapitulo />} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  const dossierCtl = useDossier();
  return (
    <HashRouter>
      <ToastProvider>
        <Shell dossierCtl={dossierCtl} />
      </ToastProvider>
    </HashRouter>
  );
}
