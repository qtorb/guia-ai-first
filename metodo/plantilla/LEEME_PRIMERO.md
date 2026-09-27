# Empieza aquí

Cuatro pasos, unos quince minutos, y ya estás trabajando. No hace falta instalar nada ni saber programar: todo se escribe desde esta misma página web.

---

## Paso 1 · Haz tuya esta plantilla · 2 min

Ahora estás viendo la plantilla original. Necesitas tu propia copia para poder escribir en ella.

1. Arriba a la derecha, botón verde **Use this template** → **Create a new repository**.
2. En **Repository name**, el nombre de tu proyecto.
3. Marca **Private**, porque lo que vas a escribir aquí es tuyo: decisiones, dudas, a veces material de cliente.
4. Abajo, **Create repository**.

En unos segundos tienes tu copia. **A partir de aquí trabajas en ella.**

> **Repositorio** es una carpeta que además guarda el historial: cada vez que cambias algo, la versión anterior sigue estando. Esa es la razón de que el método viva aquí y no en un documento suelto — poder cambiar de opinión sin perder por qué pensabas lo otro es la mitad del valor.

Si no tienes cuenta de GitHub, el botón te la pide: correo, contraseña, dos minutos.

---

## Paso 2 · Escribe la frase que gobierna todo · 5 min

Abre la carpeta `metodo` y dentro `00_VALOR.md`. Pulsa el **icono del lápiz**, arriba a la derecha del texto, y completa la frase. Para guardar: abajo, **Commit changes**, y confirmar.

<!-- BLOQUE: frase-valor -->
> Este trabajo produce valor cuando **[quién]** puede tomar mejor la decisión de **[qué]**.

Una persona concreta y una decisión concreta. Sin adjetivos.

**Una que funciona:**

> *Este trabajo produce valor cuando una responsable de marketing sin equipo técnico puede tomar mejor la decisión de qué cambiar en su web antes de pagar un rediseño.*

**Dos que no, y por qué:**

> *…cuando ayudo a las empresas a mejorar su presencia digital.*
> No hay decisión. «Mejorar» no es algo que alguien decida un martes por la mañana.

> *…cuando los usuarios tienen una experiencia mejor.*
> «Los usuarios» no es nadie en concreto, así que mañana no sabrás a quién preguntar si vas bien.

**Por qué esta frase primero.** Es contra lo que vas a comparar todo lo demás. Nadie la acierta a la primera y no hace falta: el valor está en que esté escrita y fechada, para que el día que deje de ser cierta lo notes. Si no está escrita, cambia igual y no te enteras.

**Si no te sale, para aquí.** No sigas con el resto. No es que lo estés haciendo mal: es que todavía no sabes para quién es, y eso no lo resuelve ningún método — lo resuelve hablar con alguien que pudiera ser ese «quién». Vuelve cuando puedas escribirla, aunque sea dentro de una semana.
<!-- /BLOQUE: frase-valor -->

---

## Paso 3 · Di en qué punto estás · 2 min

Más abajo en el mismo fichero hay un hueco que pone **Columna**. Escribe una letra:

<!-- BLOQUE: columnas-abc -->
- **A — Todavía no sé qué estoy construyendo.** Tienes una idea y ganas. Puede que hasta tengas claro para quién es. Lo que no tienes es ninguna prueba de que a alguien le importe. *La mayoría de la gente empieza aquí, y no es un problema: es el principio.*
- **B — Ya sé qué es, y estoy probando si sirve.** Existe algo que puedes enseñar: una web, un documento, una primera versión. Estás averiguando si de verdad le resuelve algo a alguien.
- **C — Funciona, y hay gente usándolo.** Personas que no eres tú lo usan sin que tú estés delante. A partir de aquí, cada error lo paga alguien más.
<!-- /BLOQUE: columnas-abc -->

Elige la que describe hoy, no la que te gustaría.

**Para qué sirve esto.** El método no es el mismo en las tres. En la A son cuatro cosas y en la C bastantes más, y no es una escala de exigencia: son controles distintos. Poner una letra por encima de donde estás te hace montar comprobaciones sobre un resultado que todavía no sabes cómo tiene que ser, y eso no es rigor — es comprometerte con una suposición y ponerle maquinaria para no poder cambiar de idea.

---

## Paso 4 · Abre el manual · 10 min

Ya tienes lo mínimo montado. Ahora **[`docs/MANUAL.md`](docs/MANUAL.md)**, capítulo 1<!--cap:plan-vs-proyecto-->.

El manual no se lee entero ni en orden. Al principio hay una tabla que dice, para cada situación concreta —«voy a pedirle algo a un agente», «me han entregado algo y no sé si aceptarlo», «no sé si seguir o parar»—, a qué capítulo ir. Se usa como se usa un manual: buscando.

---

## Cómo se escribe aquí

Siempre igual: **abrir el fichero** → **icono del lápiz** → **escribir** → **Commit changes**.

Cada *Commit changes* guarda una versión nueva sin borrar la anterior. No existe el riesgo de perder algo por escribir encima.

**El que más vas a usar es `metodo/07_CIERRE.md`:** cinco líneas al terminar el día —qué decidí, por qué, qué descarté, qué queda abierto, por dónde empiezo mañana—. Si de todo esto solo incorporas una cosa, que sea esa. Es la que más devuelve por minuto invertido, y la razón es poco romántica: sin ella, cada mañana se va en reconstruir dónde te quedaste.

---

## Qué hay en cada sitio

| Dónde | Qué es | Qué haces con ello |
|---|---|---|
| `docs/MANUAL.md` | El manual entero | Lo consultas |
| `metodo/` | Tus ficheros de trabajo | Aquí escribes tú |
| `roles/` | Textos para pegar en tu asistente de IA | Copias y pegas |
| `CLAUDE.md`, `AGENTS.md` | Instrucciones para un agente de código | Solo desde la columna B |
| `.claude/skills/` | Cinco atajos, si trabajas con Claude Code | Se activan solos |
| `README.md`, `VERSION.md` | Resumen y número de versión | Nada |

Los ficheros de `metodo/` vienen con el formato puesto y un ejemplo dentro, marcado `<!-- EJEMPLO -->`. Bórralo cuando escribas lo tuyo.

---

## Si trabajas con Claude Code

En la carpeta `.claude/skills/` hay cinco atajos que se activan solos al abrir este proyecto. No hay que instalarlos ni invocarlos por su nombre: basta con decir lo que quieres hacer.

- **Escribir un encargo** — te pregunta lo que hace falta, en orden, y se niega a terminar sin condición de parada ni criterio de aceptación.
- **Cerrar el día** — las cinco líneas, con lo que ya sabe de la conversación propuesto para que solo corrijas.
- **Recibir una entrega** — los seis pasos de revisión en su orden, y escribe la decisión donde toca.
- **Cerrar la tanda** — cuando vuelves de hablar con alguien: saca sus frases literales, dice si tu suposición aguanta y abre la siguiente.
- **El checkpoint de la semana** — las cuatro preguntas fijas de una en una, la regla del contacto, lo que lleva tres semanas sin comprobar, y el bloque en `07_CIERRE.md` con el veredicto que firmas tú.

Si no usas Claude Code, no pasa nada: los cinco están en el manual y se hacen igual a mano. En `roles/` tienes los textos para pegar en cualquier otro asistente.

---

## Si algo no encaja

**No aparece el lápiz.** Estás en la plantilla original, no en tu copia. Vuelve al paso 1.

**No sé si se ha guardado.** Si ya no ves el botón *Commit changes* y el texto se ve como texto normal, está guardado.

**Hay una palabra del manual que no entiendo.** Anexo F, el glosario. Son trece términos y solo esos significan algo más estrecho de lo normal; el resto del manual está en castellano corriente.

**Esto es demasiado para lo que estoy haciendo.** Probablemente estés leyendo capítulos que no te tocan. Mira tu letra del paso 3 y haz solo lo que el capítulo 2 marca para esa letra. El resto no es que sea opcional: es que todavía no aplica.

## Y si un paso no funciona

<!-- BLOQUE: feedback -->
Cuéntamelo. En la página de la plantilla en GitHub, pestaña **Issues** → botón **New issue**. Hay un formulario con cuatro preguntas y se tarda dos minutos.

No es cortesía ni es para quedar bien. Todo esto sale de **un solo proyecto**, el mío, así que el sitio exacto donde se te rompió es lo único que lo mejora de verdad. Un paso que no entendiste, una instrucción que no se podía seguir, un capítulo que no venía a cuento en tu caso: eso es justo lo que necesito saber.

Y no hace falta que sepas explicar por qué falló. Con decir «me quedé aquí» ya sirve.
<!-- /BLOQUE: feedback -->
