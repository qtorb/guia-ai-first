# Método AI-First · plantilla de proyecto

Plantilla para arrancar y sostener un proyecto trabajando con agentes de IA. La haces tuya, rellenas una frase, eliges en qué fase estás, y el manual te dice qué montar y qué no.

**Si acabas de llegar: [`LEEME_PRIMERO.md`](LEEME_PRIMERO.md).** Diez minutos, sin instalar nada y sin terminal.

---

## Qué es

<!-- BLOQUE: que-es-esto -->
La IA abarata producir. No abarata decidir qué merece existir, ni darse cuenta de que partías de algo falso, ni acordarte dentro de tres semanas de por qué decidiste lo que decidiste.

Y hay algo más que pasa desapercibido: cuando trabajas solo con agentes desaparece de golpe toda la fricción que en una empresa sale gratis. Nadie te discute, nadie te frena, nadie pregunta en una reunión. Ganas velocidad y pierdes los frenos a la vez.

Esto es volver a poner esos frenos a mano, y solo los que te tocan hoy.
<!-- /BLOQUE: que-es-esto -->

En la práctica son diez ficheros de texto y un procedimiento. No se instala nada.

## Lo que decide todo: la columna

El método no tiene versión simple y versión completa. Tiene tres columnas, y tu fase decide qué instalas:

<!-- BLOQUE: rejilla -->
| | **A** · No sé aún qué construyo | **B** · Ya sé qué, y pruebo si sirve | **C** · Sirve, y lo usa alguien |
|---|---|---|---|
| **Controles sobre la decisión**<br>*¿quién decide? ¿está escrito? ¿con fecha? ¿puedo cambiarlo?* | Valor con fecha · roles con su «NO decide» · encargo antes de dar autonomía · STOP escrito · cierre del día | Todo lo anterior · quién firma las cautelas que trae el modelo · lista de lo aparcado con la señal que lo devuelve | Todo lo anterior · un momento fijo en el calendario que abra esa lista |
| **Controles sobre el resultado**<br>*esto que ha salido, ¿pasa o no pasa?* | **Casi nada. Montarlos aquí es el error, no el rigor.** Cada control que escribes congela una suposición | Un gate de tres estados y **una prueba que debe fallar**, para saber que el gate funciona | El método entero · registrar en qué condiciones se midió cada cosa |
| **Fuera de la mesa** | Habla con una persona. Aunque no tengas nada que enseñar | Habla con cinco. Apunta cuántas veces has salido | Que alguien lo use sin ti delante y sin que se lo expliques |
| **Stack** | Un asesor · un ejecutor conversacional · texto plano versionado. Nada autónomo, nada de infraestructura | Entra el agente de código con repositorio · un sitio donde corra · datos gestionados · segundo proveedor para revisar · lectura y escritura separadas | Los gates como pruebas automáticas · condiciones de medida registradas · vigilancia del instrumento · copias fuera · tres proveedores · presupuesto con alarma |

**La regla que cruza las columnas:** cuanto menos sepas qué estás construyendo, más controles sobre la decisión y menos sobre el resultado. Los del resultado se ganan el sitio cuando ya sabes qué es un buen resultado, y no antes.

**La fila «fuera de la mesa» no es opcional en ninguna columna.** Es la única que no se puede hacer sentado y la que más tarda en dar señal.

**Se cambia de columna en las dos direcciones.** Un proyecto puede volver de B a A cuando descubre que el destinatario era otro. Cuando vuelves, se retiran controles, no se acumulan.
<!-- /BLOQUE: rejilla -->

## Los tres primeros pasos

```
1. Haz tuya la plantilla              boton "Use this template"
2. Rellena metodo/00_VALOR.md         una frase y una letra
3. Abre docs/MANUAL.md, capítulo 1<!--cap:plan-vs-proyecto-->    diez minutos
4. Haz el día cero, capítulo 2        una o dos horas
```

A partir de ahí, el capítulo 3<!--cap:dia-cero--> es el ciclo que repites y el 4 es el cierre del día.

## El mapa de ficheros

| Fichero | Qué es | Capítulo |
|---|---|---|
| `metodo/00_VALOR.md` | La frase de valor, con fecha, y tu columna | 2.1<!--cap:ejes--> y 2.2<!--cap:fase--> |
| `metodo/01_ROLES.md` | Quién decide qué, y **qué no decide** | 3.1<!--cap:roles--> |
| `metodo/02_LINEAS_ROJAS.md` | Límites con fecha y firma | 3.3<!--cap:lineas-rojas--> |
| `metodo/03_HIPOTESIS.md` | Todo lo que sale de una conversación con IA | 7<!--cap:hipotesis-tarea--> |
| `metodo/04_TAREAS.md` | Solo lo que trae evidencia | 7<!--cap:hipotesis-tarea--> |
| `metodo/05_VISTO_NO_TOCADO.md` | Lo no previsto que aparece durante un encargo | 4.5<!--cap:recibir--> |
| `metodo/06_CATALOGO.md` | Fallos con nombre | 11<!--cap:fallo--> |
| `metodo/07_CIERRE.md` | El diario: cinco líneas al terminar el día y, cada semana, el checkpoint | 5<!--cap:cierre-dia--> y 9<!--cap:checkpoint--> |
| `metodo/08_DECISIONES.md` | Qué se decidió, por qué, **quién lo propuso** | 4.7<!--cap:decidir--> |
| `metodo/09_STACK.md` | Qué herramienta entra, cuál sale y por qué | 15.6<!--cap:stack-movimientos--> |
| `metodo/encargos/` | Un fichero por encargo | 4.3<!--cap:escribir-encargo--> |
| `metodo/activos/` | Lo usado tres veces, con destino | 4.8<!--cap:cerrar-tanda--> |
| `textos/` | Cinco textos para pegar en cualquier chat | — |
| `roles/` | Bloques para pegar en tus asistentes | 3.2<!--cap:instalar-roles--> |
| `CLAUDE.md` · `AGENTS.md` | Instrucciones para el agente de código | 15.4<!--cap:stack-instalar--> |

## Las seis palabras

Significan algo más estrecho de lo normal:

<!-- BLOQUE: palabras-seis -->
**Columna** — en qué fase está tu proyecto: A, B o C. Decide cuánto método te toca ahora. Empezar por aquí te ahorra montar cosas que todavía no necesitas.

**Rol** — un papel con su frontera escrita. Lo importante no es lo que decide, sino **lo que NO decide**, escrito al lado. Vale igual para ti que para una IA.

**Encargo** — lo que pides, pero diciendo además tres cosas que un prompt normal no dice: qué no se toca, cómo sabrás que está bien, y cuándo hay que parar.

**Gate** — un control con tres respuestas posibles: pasa, no pasa, y **no lo sé**. La tercera también frena. Los controles que solo saben decir sí o no acaban aprobando todo lo que no entienden.

**Tanda** — un trozo de trabajo con principio y final: empieza con una decisión que hay que poder tomar y acaba con algo que se puede mirar. Entre medio día y dos días.

**STOP** — la condición que te hará parar, escrita **antes** de empezar. Ojo: una fecha no vale. «En dos semanas lo miro» dice cuándo miras, no qué miras.
<!-- /BLOQUE: palabras-seis -->

El glosario completo está en el Anexo F del manual.

## Cómo se usa esto con tu asistente

Los ficheros de `roles/` son bloques para pegar en las instrucciones permanentes de cada asistente. `CLAUDE.md` y `AGENTS.md` los lee solo un agente de código al arrancar en este repositorio: contienen el mismo texto en los dos formatos que se usan hoy.

No hace falta usar ningún producto concreto. Hace falta que el asesor y el ejecutor no sean la misma conversación.

## Límite declarado

<!-- BLOQUE: limite-declarado -->
Conviene que lo sepas antes de fiarte de nada de esto: sale de **un solo proyecto**, construido por una persona entre mayo y agosto de 2026. No hay estudio, ni muestra, ni comparación con nadie que trabaje de otra manera. Es la mejor evidencia que hay y a la vez la peor.

Lo que sí puedo decir es que cada regla de aquí dentro costó dinero o tiempo antes de estar escrita.
<!-- /BLOQUE: limite-declarado -->

## Si un paso no funciona

<!-- BLOQUE: feedback -->
Cuéntamelo. En la página de la plantilla en GitHub, pestaña **Issues** → botón **New issue**. Hay un formulario con cuatro preguntas y se tarda dos minutos.

No es cortesía ni es para quedar bien. Todo esto sale de **un solo proyecto**, el mío, así que el sitio exacto donde se te rompió es lo único que lo mejora de verdad. Un paso que no entendiste, una instrucción que no se podía seguir, un capítulo que no venía a cuento en tu caso: eso es justo lo que necesito saber.

Y no hace falta que sepas explicar por qué falló. Con decir «me quedé aquí» ya sirve.
<!-- /BLOQUE: feedback -->

---

Licencia CC BY-NC-ND 4.0 — úsalo en tu trabajo, incluido el que cobras; no lo vendas ni lo reempaquetes. Detalle en [`LICENSE`](LICENSE).

*Método AI-First · Albert Garcia Pujadas · [@qtorb](https://x.com/qtorb) · [qtorb.com](https://www.qtorb.com/)*
