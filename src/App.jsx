import { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import { useDossier } from './hooks/useDossier';
import Home from './pages/Home';
import IaLabList from './pages/IaLabList';
import IaLabHoja from './pages/IaLabHoja';
import GuiaIndex from './pages/GuiaIndex';
import GuiaCapitulo from './pages/GuiaCapitulo';
import ProtocoloIA from './pages/ProtocoloIA';
import Mapa from './pages/Mapa';
import MetodoPortada from './pages/MetodoPortada';
import Plan30 from './pages/Plan30';

function Barra() {
  const navigate = useNavigate();
  const loc = useLocation();
  const enHoja = loc.pathname.startsWith('/ia-lab');
  return (
    <div id="bar" className={enHoja ? 'ctx-hoja' : 'ctx-guia'}>
      <div className="in">
        <div className="brand" onClick={() => navigate('/metodo')} style={{ cursor: 'pointer' }}>
          Guía AI-First<small>IA-Lab · MMDD31</small>
        </div>
        <div className="tabs">
          <button className={'tab' + (!enHoja ? ' on' : '')} onClick={() => navigate('/metodo')}>
            <b>El método</b><small>montarlo y consultarlo</small>
          </button>
          <button className={'tab' + (enHoja ? ' on' : '')} onClick={() => navigate('/ia-lab')}>
            <b>IA-Lab</b><small>Hacer los ejercicios</small>
          </button>
        </div>
        <div className="spacer" />
        <button id="ayuda" onClick={() => navigate('/dos-puertas')}>¿Por dónde empiezo?</button>
      </div>
    </div>
  );
}

function Shell({ dossierCtl }) {
  const loc = useLocation();
  const esPortada = loc.pathname === '/dos-puertas';
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
          {/* La entrada del sitio es el método. La portada de dos puertas
              sigue existiendo en /dos-puertas (el botón «¿Por dónde
              empiezo?» lleva ahí). */}
          <Route path="/" element={<Navigate to="/metodo" replace />} />
          <Route path="/dos-puertas" element={<Home dossierCtl={dossierCtl} />} />
          <Route path="/ia-lab" element={<IaLabList dossierCtl={dossierCtl} />} />
          <Route path="/ia-lab/:n" element={<IaLabHoja dossierCtl={dossierCtl} />} />
          <Route path="/metodo" element={<MetodoPortada />} />
          <Route path="/metodo/mapa" element={<Mapa />} />
          <Route path="/metodo/plan" element={<Plan30 />} />
          <Route path="/metodo/recorrido" element={<ProtocoloIA />} />
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
