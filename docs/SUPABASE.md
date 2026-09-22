# Sincronizar entre dispositivos · montaje

Quince minutos, una vez. Al acabar, la web tiene tres puertas de entrada
—Google, GitHub y enlace por correo— y lo que un alumno escribe en el
portátil le aparece en el móvil.

> **Lo que esto NO es.** No es un control de acceso. Las hojas funcionan
> enteras sin cuenta y eso no se toca: la página promete en tres sitios que
> no pide cuentas ni contraseñas, y esa promesa es la que hace que alguien
> escriba en la hoja 1 lo que piensa de verdad y no lo que queda bien.
> Entrar sirve para una sola cosa: llevarte lo escrito a otro sitio.

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

### Enlace por correo

Ya viene encendido. En *Authentication → Providers → Email*, deja **Confirm
email** activo y desactiva **Enable email provider password** si quieres que
sea solo enlace, sin contraseñas.

> El correo que manda Supabase por defecto sale de su servidor compartido y
> tiene un límite bajo por hora. Para cuarenta personas en una tarde conviene
> conectar un SMTP propio en *Project Settings → Auth → SMTP Settings*.

## 4 · Las dos variables

En Supabase, *Project Settings → API*: copia **Project URL** y **anon public**.

En GitHub, *Settings → Secrets and variables → Actions → Variables → New
repository variable*, dos veces:

| Nombre | Valor |
|---|---|
| `VITE_SUPABASE_URL` | `https://<ref>.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | la clave `anon public` |

**Variables y no secretos, a propósito.** Esa clave va dentro del JavaScript
que se descarga cualquiera: esconderla no protegería nada y guardarla como
secreto solo haría creer que sí. Lo que protege los datos es la política del
paso 2.

Relanza el despliegue (*Actions → Deploy a GitHub Pages → Run workflow*) y
aparecerá el botón **Entrar** al final de la barra.

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
