import { Link } from 'react-router-dom';
import manual from '../data/manual.json';

// Port de pagina_metodo() — herramientas/sitio.py:2121-2149.
export default function GuiaIndex() {
  return (
    <div className="wrap">
      <p className="rotulo">El método</p>
      <h1>El método, por situación</h1>
      <p>
        {Object.keys(manual.capitulos).length} capítulos ordenados por lo que estás haciendo, no por
        su número. Busca el tuyo abajo. El resto no te hace falta todavía.
      </p>
      {manual.grupos.map((g) => (
        <section className="grupo" key={g.nombre}>
          <h2>{g.nombre}</h2>
          <ul className="lista">
            {g.entradas.map(({ ident, resuelve }) => {
              const cap = manual.capitulos[ident];
              return (
                <li key={ident}>
                  <Link to={`/guia/${ident}`}>
                    {cap?.num && <span className="num">{cap.num}</span>}
                    <span>{resuelve}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
