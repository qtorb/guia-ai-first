// Sincronizar lo que escribes entre navegadores. Nada más.
//
// La web sigue funcionando entera sin cuenta: eso no es una concesión, es la
// promesa que está escrita en tres sitios de la página y la que hace que la
// gente escriba lo que piensa de verdad en la hoja 1. Entrar SOLO añade que
// lo que escribas aquí aparezca también en tu móvil.
//
// Por debajo es Supabase: una fila por persona, con seguridad a nivel de fila
// para que nadie pueda leer la de otro. La clave anónima de abajo está pensada
// para vivir en el navegador —no es un secreto— y lo que protege los datos es
// la política SQL, no esconderla. Está en docs/SUPABASE.md.
//
// Si las dos variables de entorno no están, `hayNube` es false y toda la capa
// desaparece sin romper nada: la web queda exactamente como estaba. Por eso
// este código puede entrar en producción antes de que exista el proyecto de
// Supabase.

const URL = import.meta.env.VITE_SUPABASE_URL;
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const hayNube = Boolean(URL && ANON);

// La librería de Supabase pesa 50 KB comprimidos sobre una primera carga que
// entera son 287, y la inmensa mayoría de quien entra no va a usar cuenta —
// ni la necesita, porque las hojas funcionan sin ella. Así que NO se carga
// con la página: se carga la primera vez que alguien pulsa «Entrar», o al
// arrancar solo si este navegador ya tiene una sesión guardada.
//
// Medido: con carga diferida la portada sigue en 287 KB; importándola de
// golpe pasaba a 337.
let _cliente = null;
export async function cliente() {
  if (!hayNube) return null;
  if (_cliente) return _cliente;
  const { createClient } = await import('@supabase/supabase-js');
  _cliente = createClient(URL, ANON, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      // PKCE y no el flujo implícito: el implícito devuelve el token en el
      // fragmento (#access_token=…) y esta web usa HashRouter, así que el
      // router y el token se pelearían por el mismo sitio. PKCE vuelve con
      // ?code=… en la cadena de consulta, que no estorba.
      flowType: 'pkce',
      detectSessionInUrl: true,
    },
  });
  return _cliente;
}

// ¿Hay ya una sesión en este navegador? Supabase la guarda en una clave
// `sb-<ref>-auth-token`. Mirarla es lo que permite no cargar la librería a
// quien nunca ha entrado. Y el `?code=` de la vuelta de Google también
// obliga a cargarla, claro.
export function convieneCargar() {
  if (!hayNube) return false;
  if (typeof window !== 'undefined' && window.location.search.includes('code=')) return true;
  try {
    for (let i = 0; i < localStorage.length; i += 1) {
      const k = localStorage.key(i);
      if (k && k.startsWith('sb-') && k.endsWith('-auth-token')) return true;
    }
  } catch (e) { /* modo privado */ }
  return false;
}

// Todo lo que la web guarda en este navegador. Si algún día aparece una clave
// nueva, va aquí y se sincroniza sola.
export const CLAVES = [
  'ialab-dossier-v2',    // las hojas de IA-Lab
  'metodo-ai-first',     // el recorrido del método
  'metodo-plan30',       // el plan de 30 días
  'protocolo-ialab1-v1', // formato viejo, por si alguien lo arrastra
];

const SELLO = 'nube-ultimo-envio';

export function leerLocal() {
  const out = {};
  for (const k of CLAVES) {
    try {
      const v = localStorage.getItem(k);
      if (v !== null) out[k] = v;
    } catch (e) { /* modo privado */ }
  }
  return out;
}

export function hayAlgoLocal() {
  const d = leerLocal();
  // El dossier vacío se guarda igualmente al abrir una hoja, así que «hay
  // algo» no puede ser «existe la clave»: tiene que mirar dentro.
  try {
    const j = JSON.parse(d['ialab-dossier-v2'] || 'null');
    if (j?.d && Object.keys(j.d.hojas || {}).length) return true;
  } catch (e) { /* noop */ }
  for (const k of ['metodo-ai-first', 'metodo-plan30', 'protocolo-ialab1-v1']) {
    try {
      const j = JSON.parse(d[k] || 'null');
      if (j && Object.keys(j).length) return true;
    } catch (e) { /* noop */ }
  }
  return false;
}

export function escribirLocal(datos) {
  for (const k of CLAVES) {
    try {
      if (datos && typeof datos[k] === 'string') localStorage.setItem(k, datos[k]);
      else localStorage.removeItem(k);
    } catch (e) { /* noop */ }
  }
}

export function selloEnviado() {
  try { return localStorage.getItem(SELLO); } catch (e) { return null; }
}
function guardaSello(v) {
  try { if (v) localStorage.setItem(SELLO, v); else localStorage.removeItem(SELLO); } catch (e) { /* noop */ }
}

export async function leerRemoto(userId) {
  const c = await cliente();
  const { data, error } = await c
    .from('dossier').select('datos, actualizado').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  return data || null;
}

export async function enviarRemoto(userId) {
  const c = await cliente();
  const { data, error } = await c
    .from('dossier')
    .upsert({ user_id: userId, datos: leerLocal(), actualizado: new Date().toISOString() })
    .select('actualizado').single();
  if (error) throw error;
  guardaSello(data.actualizado);
  return data.actualizado;
}

export async function traerRemoto(userId) {
  const fila = await leerRemoto(userId);
  if (!fila) return false;
  escribirLocal(fila.datos);
  guardaSello(fila.actualizado);
  return true;
}

export async function borrarRemoto(userId) {
  const c = await cliente();
  // Los avisos del mes primero: borrar el aviso arrastra sus recordatorios.
  const av = await c.from('aviso').delete().eq('user_id', userId);
  if (av.error) throw av.error;
  const { error } = await c.from('dossier').delete().eq('user_id', userId);
  if (error) throw error;
  guardaSello(null);
}

// Dónde estaba el alumno antes de irse a Google. OAuth vuelve a la raíz del
// sitio, así que sin esto siempre reaparecería en la portada.
const VUELTA = 'nube-vuelta';
export function recuerdaDonde() {
  try { sessionStorage.setItem(VUELTA, window.location.hash || '#/'); } catch (e) { /* noop */ }
}
export function vuelveDonde() {
  try {
    const h = sessionStorage.getItem(VUELTA);
    sessionStorage.removeItem(VUELTA);
    if (h && h !== window.location.hash) window.location.hash = h;
  } catch (e) { /* noop */ }
}

export async function entrarCon(proveedor) {
  recuerdaDonde();
  const c = await cliente();
  const { error } = await c.auth.signInWithOAuth({
    provider: proveedor,
    options: { redirectTo: window.location.origin + window.location.pathname },
  });
  if (error) throw error;
}

export async function entrarPorCorreo(correo) {
  recuerdaDonde();
  const c = await cliente();
  const { error } = await c.auth.signInWithOtp({
    email: correo,
    options: { emailRedirectTo: window.location.origin + window.location.pathname },
  });
  if (error) throw error;
}
