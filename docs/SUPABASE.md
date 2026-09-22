# Sincronizar entre dispositivos · montaje

Quince minutos, una vez. Al acabar, la web tiene tres puertas de entrada
—Google, GitHub y enlace por correo— y lo que un alumno escribe en el
portátil le aparece en el móvil.

> **Lo que esto NO es.** No es un control de acceso. Las hojas funcionan
> enteras sin cuenta y eso no se toca. La web tiene dos estados y los llama
> siempre igual: sin cuenta se trabaja en **borrador** —lo escrito vive en
> ese navegador y no sale de ahí—, y entrando queda **guardado**. Que el
> borrador no salga del navegador es lo que hace que alguien escriba en la
> hoja 1 lo que piensa de verdad y no lo que queda bien. Entrar sirve para
> una sola cosa: seguir en otro dispositivo.

**Mientras las dos variables del paso 4 no existan, toda esta capa está
apagada** y la web se comporta exactamente como antes. Por eso el código
puede estar en producción antes que el proyecto de Supabase.

---

## 1 · El proyecto

En [supabase.com](https://supabase.com) → **New project**.

* Región: **Europa** (Frankfurt o Londres). Van a vivir ahí TFM de personas
  con nombre y apellido; la región es lo primero que preguntará cualquiera
  que mire esto con ojos de RGPD.
* Guarda la contraseña de la base de datos donde guardes esas cosas. No hace
  falta para nada de lo de aquí, pero sin ella no se recupera el proyecto.

## 2 · La tabla y quién puede leerla

El esquema vive en el repositorio, en **`supabase/migrations/0001_dossier.sql`**,
no en un panel. Ábrelo, copia el fichero entero, pégalo en el *SQL Editor* de
Supabase y ejecuta.

Dos cosas que ese fichero explica por dentro y conviene tener claras:

* **Una fila por persona con un JSON dentro**, sin normalizar. Lo que se guarda
  es exactamente lo que el navegador tiene, y partirlo en tablas obligaría a
  mantener dos formas del mismo dato sincronizadas a mano.
* **Lo que protege los datos es la política de seguridad a nivel de fila**, no
  esconder la clave. La clave anónima viaja dentro del JavaScript que descarga
  cualquiera; la política la comprueba el servidor.

> **La integración de GitHub de Supabase queda apagada.** Aplica a producción
> lo que haya en `supabase/` cada vez que fusionas en `main`, y eso convertiría
> cada merge en una vía para cambiar la base donde viven los TFM. El esquema se
> aplica a mano, a propósito. La carpeta está en el formato que esa integración
> espera por si algún día se decide encenderla.

## 3 · Las tres puertas

*Authentication → Providers*. La URL de vuelta es la misma en las tres:

```
https://guia.qtorb.com
```

Y en *Authentication → URL Configuration*, **Site URL**: `https://guia.qtorb.com`.

### Google

1. [Google Cloud Console](https://console.cloud.google.com) → proyecto nuevo.
2. *APIs & Services → OAuth consent screen*: tipo **External**, nombre de la
   aplicación «Guía AI-First», tu correo de soporte.
3. *Credentials → Create credentials → OAuth client ID*, tipo **Web application**.
4. En *Authorized redirect URIs* pega la que te da Supabase en su pantalla de
   Google (es del tipo `https://<ref>.supabase.co/auth/v1/callback`).
5. Copia el **Client ID** y el **Client Secret** a Supabase y activa el proveedor.

### GitHub

1. GitHub → *Settings → Developer settings → OAuth Apps → New OAuth App*.
2. **Homepage URL**: `https://guia.qtorb.com`
3. **Authorization callback URL**: la misma que te da Supabase.
4. Copia **Client ID** y genera un **Client Secret**; los dos a Supabase.

### Enlace por correo — y es la puerta principal

Ya viene encendido. En *Authentication → Providers → Email*, deja **Confirm
email** activo y desactiva **Enable email provider password** si quieres que
sea solo enlace, sin contraseñas.

**Va primero en el panel, y no por orden alfabético.** Es la única de las tres
puertas que se puede dejar entera con el dominio y el diseño del sitio. Google
y GitHub enseñan por el camino la dirección larga del servidor de Supabase, y
eso **no se puede quitar gratis**: Google solo pinta el nombre y el logo de una
app cuando ha pasado *verificación de marca*, y esa exige verificar todos los
dominios autorizados — incluido el del URI de redirección, que es de Supabase y
no nuestro. El único arreglo es el add-on de dominio propio, $10/mes sobre plan
de pago.

**Y hay una razón operativa además de estética:** el servidor de correo que
Supabase da por defecto es compartido y tiene un límite bajo por hora. Cuarenta
alumnos entrando la misma tarde lo rozan.

#### Montar el envío propio (Postmark)

1. **En Postmark**, comprueba que el dominio desde el que vas a enviar está
   verificado (*Sender Signatures* o *Domains*), con sus registros DKIM y de
   Return-Path puestos en el DNS. Si ya envías desde `qtorb.com`, ya está.
2. Entra en el **servidor** que vayas a usar → *API Tokens*. El **Server API
   token** vale a la vez de usuario y de contraseña SMTP.
3. Usa el flujo **transaccional**, no el de difusión: un enlace de acceso no es
   una newsletter, y mezclarlos ensucia la reputación de envío de los dos.

#### Conectarlo a Supabase

*Project Settings → Authentication → SMTP Settings* → activar **Enable Custom
SMTP**:

| Campo | Valor |
|---|---|
| Sender email | la dirección verificada en Postmark |
| Sender name | `Guía AI-First` |
| Host | `smtp.postmarkapp.com` |
| Port | `587` |
| Username | el Server API token |
| Password | el mismo Server API token |

#### Las plantillas · son DOS, y esto no es opcional

**Supabase no manda «Magic Link» la primera vez.** Cuando la dirección todavía
no existe como usuario, el mismo botón de «entrar con correo» dispara la
plantilla **Confirm signup**; «Magic Link» sólo se usa a partir de la segunda
vez. Si sólo se pega una, el primer correo que ve un alumno —justo el que
decide si vuelve— sale en inglés, sin diseño y sin logo. Se descubrió a base
de recibirlo.

| Cuándo sale | Plantilla de Supabase | Fichero | Asunto sugerido |
|---|---|---|---|
| La **primera** vez con esa dirección | *Confirm signup* | [`docs/correo/confirmar-alta.html`](correo/confirmar-alta.html) | **Confirma tu correo y entras en la Guía AI-First** |
| Todas las **siguientes** | *Magic Link* | [`docs/correo/enlace-magico.html`](correo/enlace-magico.html) | **Tu enlace para entrar en la Guía AI-First** |

Las dos están en *Authentication → Emails*, y cada una se pega entera en su
pestaña. Comparten estructura a propósito: **si se cambia una, se cambia la
otra.** La diferencia real son tres frases y el rótulo del botón.

Las otras plantillas de esa pantalla —*Invite user*, *Change Email Address*,
*Reset Password*, *Reauthentication*— no se disparan con este montaje: no hay
contraseñas, no hay invitaciones y no se puede cambiar el correo desde la web.
El día que alguna de esas cosas exista, su plantilla habrá que escribirla.

Están escritas con las reglas del correo, que no son las de la web: todo en
línea, tablas en vez de flex —Outlook sigue usando el motor de Word—, nada de
SVG, y con `color-scheme` declarado para que Apple Mail y Outlook dejen de
inventarse la versión oscura. El botón no depende del enlace: el tamaño sale de
la celda, así que un cliente que se coma el `padding` del `<a>` deja el botón
igual de grande. Dicen además las dos cosas que la gente pregunta siempre: que
el enlace hay que abrirlo **en el mismo dispositivo** desde el que se pidió, y
que si no lo has pedido tú no tienes que hacer nada.

## 4 · Las dos variables

**La URL** no hace falta buscarla en ningún sitio: es el *Project ID* que sale
en *Project Settings → General*, con el sufijo de Supabase —
`https://<project-id>.supabase.co`.

**La clave** está en *Project Settings → API Keys*. Ahí hay dos listas y
conviene no confundirlas:

* **Publishable key** (`sb_publishable_…`) — **es esta.** La propia pantalla lo
  dice: *segura en un navegador si has activado la seguridad a nivel de fila*,
  que es exactamente lo que hace el paso 2.
* **Secret keys** (`sb_secret_…`) — **esta nunca.** Se salta la seguridad a
  nivel de fila y leería las filas de todo el mundo. No sale del panel.

> **Ojo al nombre.** La variable se llama `VITE_SUPABASE_ANON_KEY` por historia
> —Supabase llamaba *anon* a esta clave hasta hace poco— pero lo que va dentro
> es la *publishable*. No le cambies el nombre a la variable: el código busca
> ese. Si algún día la publishable diera problemas, la pestaña *Legacy anon,
> service_role API keys* sigue teniendo la `anon` del formato antiguo y vale
> igual.

En GitHub, *Settings → Secrets and variables → Actions → pestaña **Variables**
→ New repository variable*, dos veces:

| Nombre | Valor |
|---|---|
| `VITE_SUPABASE_URL` | `https://<project-id>.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | la clave `sb_publishable_…` |

**Variables y no secretos, a propósito.** Esa clave va dentro del JavaScript
que se descarga cualquiera: esconderla no protegería nada y guardarla como
secreto solo haría creer que sí. Lo que protege los datos es la política del
paso 2.

Si un nombre se escribe mal, el despliegue **no falla**: simplemente el botón
«Entrar» no aparece. Es el mismo comportamiento que con las variables
ausentes, así que conviene comprobar los nombres antes de buscar el fallo en
otro sitio.

## 5 · Relanzar el despliegue

Las variables se leen al construir, así que hasta que no haya un despliegue
nuevo no cambia nada.

*Actions* → en la **columna izquierda** pincha **«Deploy a GitHub Pages»** →
arriba a la derecha aparece **Run workflow**. Ese botón sólo sale dentro de la
página del workflow, no en la lista general de *Actions* — es donde todo el
mundo lo busca y no está.

Si no aparece, sirve igual abrir el último despliegue de la lista y darle a
*Re-run all jobs*: las variables se leen en el momento de ejecutar. Y en
último caso, cualquier commit a `main` dispara el despliegue.

Cuando termine, aparece el botón **Entrar** al final de la barra.

---

## Cómo se comporta

**Qué se guarda.** Lo que escribes en las hojas y en el recorrido del método,
tal cual está en el navegador, más el correo con el que entras. Nada más: ni
qué páginas visitas ni cuánto tardas.

**Cuándo sube.** Dos segundos después de dejar de escribir, si has entrado.

**Cuando entras y hay dos versiones.** Esta es la única regla que importa:

* No hay nada en la nube → sube lo de este navegador.
* No hay nada aquí → baja lo de la nube.
* Hay las dos y el sello de la nube es el del último envío de este navegador
  → este navegador es la continuación: sube.
* **Hay las dos y no coinciden → no se decide solo. Se pregunta una vez.**

El último caso es el alumno que escribió en el portátil y luego en el móvil
sin entrar. Elegir por él borraría trabajo, así que elige él.

**Salir** no borra nada de este navegador. **Borrar mis datos** sí: se lleva
las dos copias y cierra la sesión. Eso es lo que hay que poder contestar
cuando alguien ejerza su derecho de supresión.

## Lo que queda por decidir antes de dárselo a los alumnos

1. **Una línea en la web** diciendo qué se guarda, dónde y cómo se borra. El
   botón ya existe; el texto no.
2. **Quién es el responsable del tratamiento**: tú a título personal o la
   UPF-BSM. No es lo mismo y conviene preguntarlo antes, no después.
3. **Qué pasa en junio**, cuando el curso acaba: si las filas se borran, se
   archivan o se quedan.
