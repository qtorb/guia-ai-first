import { useEffect, useRef } from 'react';

// El panel de la «i». Contesta las cinco preguntas que un alumno solo, en
// casa, un jueves por la noche, no tiene a quién hacerle: dónde estoy, qué
// sale de aquí, cuándo se hace esto, dónde se guarda lo que escribo y dónde
// encaja en el máster. Está en el mismo sitio en todas las hojas y en todos
// los pasos, que es lo que lo hace fiable.
//
// Se lleva además las tres acciones de dossier —guardar, retomar, empezar de
// cero— que antes sólo existían en el último paso: quien cambia de ordenador
// en el bloque 4 no tenía forma de llevarse lo escrito.
export default function Donde({
  hoja, sitio, salidas, onCerrar, onPrincipio, onVerTodo, verTodo,
  onGuardarAvance, onCargarAvance, onBorrarTodo,
}) {
  const ref = useRef(null);
  const fileRef = useRef(null);
  const d = hoja.donde || {};

  useEffect(() => {
    ref.current?.focus();
    const esc = (e) => { if (e.key === 'Escape') onCerrar(); };
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [onCerrar]);

  return (
    <div className="dnd" role="dialog" aria-modal="false" aria-label="Dónde estás" tabIndex={-1} ref={ref}>
      <div className="dnd-h">
        <h2>Dónde estás</h2>
        <button className="ayb" onClick={onCerrar}>Cerrar</button>
      </div>
      <div className="dnd-g">
        <div>
          <div className="lab">En esta hoja</div>
          <p>{sitio}</p>
        </div>
        <div>
          <div className="lab">Qué sale de aquí</div>
          <p>
            {salidas.length > 1
              ? `${salidas.length === 2 ? 'Dos' : salidas.length} documentos que te descargas: ${salidas.map((s) => `«${s.titulo}»`).join(' y ')}.`
              : `Un documento que te descargas: «${salidas[0]?.titulo || 'tu hoja'}».`}
          </p>
        </div>
        <div>
          <div className="lab">Cuándo se hace</div>
          <p>{d.cuando || 'En casa, después de la sesión. No hace falta acabarla de una sentada.'}</p>
        </div>
        <div>
          <div className="lab">Dónde se guarda</div>
          <p>Sin cuenta, como <b>borrador</b>: vive en este navegador y no viaja contigo a otro
            dispositivo. Entrando, queda <b>guardado</b> y lo retomas donde sea.</p>
        </div>
        <div>
          <div className="lab">Dónde encaja en el máster</div>
          <p>{d.encaja || 'Es una de las hojas de IA-Lab. Cada una deja una pieza de tu TFM.'}</p>
        </div>
      </div>
      <div className="dnd-a">
        <button className="ayb" onClick={onVerTodo}>{verTodo ? 'Volver a un paso cada vez' : 'Ver todos los pasos de una vez'}</button>
        <button className="ayb" onClick={onPrincipio}>Empezar por el principio</button>
        <button className="ayb" onClick={onGuardarAvance}>Guardar mi avance</button>
        <button className="ayb" onClick={() => fileRef.current?.click()}>Retomar desde un fichero</button>
        <button className="ayb" onClick={onBorrarTodo}>Empezar de cero</button>
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
      <p className="dnd-n">Si vas a seguir en otro ordenador, descarga tu avance y cárgalo allí.</p>
    </div>
  );
}
