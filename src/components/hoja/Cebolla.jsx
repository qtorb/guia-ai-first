// La cebolla de cinco capas del deck, en pequeño: la capa del paso se
// enciende. Es decorativa: la capa se dice en el texto, al lado.
const CAPAS = ['Controles', 'Memoria', 'Herramientas', 'Roles', 'Tú'];
const RADIOS = [46, 37, 28, 19, 10];

export default function Cebolla({ capa }) {
  return (
    <svg className="cebolla" viewBox="0 0 100 100" width="84" height="84" aria-hidden="true" focusable="false">
      {CAPAS.map((c, i) => (
        <circle key={c} cx="50" cy="50" r={RADIOS[i]} className={c === capa ? 'on' : ''} />
      ))}
    </svg>
  );
}
