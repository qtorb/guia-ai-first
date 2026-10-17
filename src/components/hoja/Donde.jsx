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
    <div className="dnd" id="dnd" role="dialog" aria-modal="false" aria-label="Ayuda de esta hoja" tabIndex={-1} ref={ref}>
      <div className="dnd-h">
        <h2>Ayuda de esta hoja</h2>
        <button className="ayb" onClick={onCerrar}>Cerrar</button>
      </div>
      <div className="dnd-g">
        <div>
          <div className="lab">Dónde estás</div>
          <p>{sitio}</p>
        </div>
        <div>
          <div className="lab">Qué obtienes al final</div>
          <p>
            {salidas.length > 1
              ? `${salidas.length === 2 ? 'Dos' : salidas.length} documentos que puedes copiar o descargar: ${salidas.map((s) => `«${s.titulo}»`).join(' y ')}.`
              : `Un documento que puedes copiar o descargar: «${salidas[0]?.titulo || 'tu hoja'}».`}
          </p>
        </div>
        <div>
          <div className="lab">Cuándo hacerla</div>
          <p>{d.cuando || 'En casa, después de la sesión. No hace falta terminarla de una vez.'}</p>
        </div>
        <div>
          <div className="lab">Dónde se guarda lo que escribes</div>
          <p>Sin cuenta, lo que escribes se guarda <b>solo en este navegador</b>. Si inicias
            sesión, se guarda <b>en tu cuenta</b> y puedes seguir desde cualquier dispositivo.</p>
        </div>
        <div>
          <div className="lab">Cómo encaja en el máster</div>
          <p>{d.encaja || 'Es una de las hojas de IA-Lab. Cada una te deja un texto que puedes usar en tu TFM.'}</p>
        </div>
      </div>
      <div className="dnd-a">
        <button className="ayb" onClick={onVerTodo}>{verTodo ? 'Volver a un paso cada vez' : 'Ver todos los pasos juntos'}</button>
        <button className="ayb" onClick={onPrincipio}>Volver al paso 1</button>
        <button className="ayb" onClick={onGuardarAvance}>Guardar mi avance en un archivo</button>
        <button className="ayb" onClick={() => fileRef.current?.click()}>Cargar un archivo guardado</button>
        <button className="ayb" onClick={onBorrarTodo}>Borrar todo y empezar de nuevo</button>
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
      <p className="dnd-n">Si vas a seguir en otro dispositivo sin iniciar sesión, guarda tu avance en un archivo y cárgalo allí.</p>
    </div>
  );
}
