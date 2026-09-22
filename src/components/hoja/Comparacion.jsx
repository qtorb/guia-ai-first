import TextoInline from '../TextoInline';

// Dos ejecuciones reales del mismo caso, una al lado de otra: la petición que
// haría cualquiera y la que enseña la hoja. No se generan en el momento —
// están escritas en hojas.json, copiadas de un ensayo, con su modelo y su
// fecha debajo. Es lo que permite que el alumno vea el efecto sin tener nada
// abierto, y lo que obliga a revisarlas cuando el sello se queda viejo.
export default function Comparacion({ c }) {
  return (
    <div className="cmpg">
      <div className="cmpc">
        {[c.izq, c.der].map((lado, i) => (
          <div className={'cmpl' + (i ? ' der' : '')} key={i}>
            <div className="cmpt">{lado.titulo}</div>
            <p className="cmpp">{lado.peticion}</p>
            <pre className="cmps">{lado.salida}</pre>
          </div>
        ))}
      </div>
      {c.sello && <div className="cmpf">{c.sello}</div>}
      {c.nota && <TextoInline texto={c.nota} className="cmpn" />}
    </div>
  );
}
