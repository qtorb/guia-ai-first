# Manual AI-First

### Procedimiento para arrancar y sostener un proyecto trabajando con agentes de IA

*v1.6 · 26 de septiembre de 2026 · Albert Garcia Pujadas @qtorb*
*Derivado de la Guía AI-First v2.3. Este documento no desarrolla el porqué: explica solo el motivo operativo que hace falta para aplicar cada regla. El desarrollo está en la guía.*

---

## 0 · Por dónde entrar

Esto no se lee de principio a fin. Se busca. Encuentra abajo lo que estás
haciendo ahora y ve a ese capítulo; el resto no te hace falta todavía.

| Estás en… | Ve a |
|---|---|
| Tengo un plan y no sé cómo convertirlo en algo real | **1<!--cap:plan-vs-proyecto-->** |
| No sé qué puedo construir esta semana | **1.3<!--cap:lo-mas-pequeno-->** |
| Nunca he trabajado con un agente y no sé cómo es | **1.4<!--cap:por-dentro-->** |
| No sé si mi problema es el proyecto o cómo trabajo con la IA | **2.1<!--cap:ejes-->** |
| No sé cuánto de esto me toca | **2.2<!--cap:fase-->** |
| Empiezo mañana | **2.2<!--cap:fase-->** y **3<!--cap:dia-cero-->** |
| Voy a pedirle algo a un agente | **4.3<!--cap:escribir-encargo-->** |
| Me han entregado algo y no sé si aceptarlo | **4.5<!--cap:recibir-->** |
| Voy a pedirle criterio a un asesor de IA | **6<!--cap:modelos-->** |
| Tengo un backlog enorme y no sé priorizar | **7<!--cap:hipotesis-tarea-->** |
| Tengo que escribir un informe o entregable | **8<!--cap:escribir-informe-->** |
| Termino la jornada | **5<!--cap:cierre-dia-->** |
| Es viernes / toca revisar | **9<!--cap:checkpoint-->** y **10<!--cap:revision-->** |
| Algo ha fallado | **11<!--cap:fallo-->** |
| Tengo que tomar una decisión grande | **12<!--cap:contrastar-->** |
| No sé si seguir o parar | **13<!--cap:parar-->** |
| Estoy cansado y sigo produciendo | **14<!--cap:operador-->** |
| Qué herramientas monto, cuándo y cuánto cuestan | **15<!--cap:stack-->** |
| Necesito una plantilla o un formato de fichero | **Anexos** |

Si es tu primera vez, empieza por el capítulo 1<!--cap:plan-vs-proyecto-->: es el
único que no pide montar nada. Explica en qué punto estás y cómo es esto por
dentro, y te deja tres cosas escritas.

Cada capítulo empieza diciendo qué necesitas tener hecho antes, y termina con
una condición concreta para saber si has terminado de verdad. Si no la cumples,
no has terminado, aunque lo parezca.

**Sobre los tiempos.** Cada paso dice cuánto ocupa en cuatro tamaños: **un
momento** (cinco minutos o menos) · **medio rato** (diez a veinte) · **un rato
largo** (media hora larga) · **una sesión** (una o dos horas). Son tamaños, no
plazos: salen de cronometrar a una persona que ya sabía dónde estaba cada
fichero, así que la primera vez te va a costar más. Lo que dice si has
terminado es el «Hecho cuando», no el reloj.

---

## 1 · Antes de construir nada

**Antes:** nada. Es el primero y se lee entero. Es el único que no pide montar nada — pero sí deja tres cosas escritas, en 1.5<!--cap:que-haces-con-esto-->.

Si ya tienes algo funcionando que usa gente, sáltatelo y ve a 2.2<!--cap:fase-->.

### 1.1 · La pregunta que lo decide

**¿Puede alguien que no eres tú usar lo que tienes, o negarse a usarlo?**

Si la respuesta es no, lo que tienes describe algo que todavía no ha pasado.
No importa lo bueno que sea el documento.

### 1.2 · Pasa lo que tienes por cuatro categorías · medio rato

Coge lo que has escrito y reparte cada afirmación en una de estas cuatro:

**sabemos · suponemos · falta comprobar · no sabemos**

Casi todo va a caer en la segunda, y no es que esté mal hecho: son cosas que
no se pueden saber desde la mesa. Si alguien lo quiere, si pagaría, si volvería,
en qué momento se pierde, qué pregunta hace antes de decidir.

Subraya la suposición que, si resulta falsa, tira el resto. Esa es contra la
que vas a construir algo primero.

### 1.3 · La cosa más pequeña que puede existir esta semana

El salto no es «ahora constrúyelo». Construir entero lo que describe un plan es normalmente meses, y casi siempre sale mal, porque estás construyendo sobre suposiciones que nadie ha tocado.

El salto es: **¿cuál es la cosa más pequeña que puede existir y que alguien pueda usar o rechazar?**

Cuatro formas, de menos a más coste. Ninguna es un prototipo de nada: las cuatro son cosas reales.

**Una página que lo explica y recoge una respuesta.** Un texto que dice qué es esto y para quién, y una forma de que alguien deje su correo o te escriba. Se hace en una tarde. Te contesta a la única pregunta que importa al principio: si al leerlo, alguien quiere más.

**El servicio hecho a mano, para tres personas.** Sin herramienta, sin automatizar nada, sin producto. Tú haciendo el trabajo que describe el plan, para tres personas concretas, cobrando o gratis. Es lo que más enseña y lo que menos cuesta construir, porque no construyes nada. Y descubre en una semana las cosas que un plan no te habría dicho en un año.

**Una pieza sola, funcionando, para un caso.** No el sistema: el trozo que resuelve la parte más difícil, para un ejemplo real. Si eso no funciona, el resto da igual.

**Un documento que alguien usa para decidir.** Si lo tuyo es análisis o consultoría, la cosa real es que alguien tome una decisión con ello delante. No que esté bien escrito: que decida.

**Cómo eliges.** Coge la suposición más grande de tu plan —la que si es falsa lo tira todo— y elige lo más barato que la ponga a prueba. No lo que mejor quede. Lo más barato que pueda salir mal.

**La regla:** *es real cuando alguien que no eres tú puede usarlo o negarse a usarlo.* Un prototipo que solo funciona contigo delante explicándolo no ha cruzado esa línea.

### 1.4 · Cómo es esto por dentro

Si nunca has construido nada con agentes, «asesor» y «ejecutor» son palabras. Esto es lo que hay detrás, en concreto.

**Un agente es una conversación con un papel asignado.** No es un programa que instalas. Abres una conversación con un modelo, le dices qué papel ocupa y qué no decide, y a partir de ahí esa conversación es ese papel. Si necesitas otro papel, abres otra conversación. Esa es toda la magia.

**Tendrás dos, como mínimo.** Uno al que le pides criterio —qué construir, en qué orden, qué se puede afirmar— y otro al que le pides ejecución. No pueden ser la misma conversación, y la razón no es organizativa: quien construye algo no puede ser quien juzga si está bien, porque busca los fallos que su propio modelo mental contempla, que son exactamente los que ya evitó al construir.

**Una sesión de trabajo se parece a esto.** Decides qué decisión tiene que poder tomarse al final. Miras cómo está ahora lo que vas a tocar. Escribes lo que pides, diciendo también qué no se toca y cómo sabrás que está bien. Lo mandas. Vuelve algo. Lo compruebas sobre lo real, no sobre lo que el agente dice que hizo. Decides: vale, otra vuelta, deshacer o aparcar. Y escribes qué decidiste y por qué.

Eso es una **tanda**, y es la unidad de todo el método. Entre medio día y dos días.

**Y falla de tres maneras**, que conviene no confundir porque cada una se arregla en un sitio distinto:

<!-- BLOQUE: tres-fallos -->
- Deciden mal con toda la información delante → es del **control**.
- Deciden bien lo que les pediste, y les pediste lo que no era → es del **encargo**.
- Se les olvida: pierden el contexto y siguen como si nada → es de la **memoria**.

Antes de arreglar un fallo, decide cuál de las tres es. Arreglar el encargo cuando era la memoria no arregla nada.
<!-- /BLOQUE: tres-fallos -->

**Lo que cambia de verdad en tu trabajo.** Producir se ha abaratado y verificar no. Lo que no se abarata es saber cuál merece existir, detectar que una premisa era falsa, y acordarte dentro de tres semanas de por qué decidiste lo que decidiste. Ahí es donde se te va a ir el tiempo, y por eso el resto de este manual va casi todo de eso y casi nada de producir.

> **Lo que produces por encima de lo que puedes verificar es deuda, no avance.** Verificar sigue costando tu tiempo, y ahí no ha cambiado nada.

### 1.5 · Qué haces con esto · medio rato

Antes de pasar a 2.2<!--cap:fase-->, tres cosas por escrito:

1. **Pasa tu plan por las cuatro categorías.** Sabemos, suponemos, falta comprobar, no sabemos. Sin piedad.
2. **Subraya la suposición más grande.** La que, si resulta falsa, tira el resto.
3. **Escribe qué es lo más barato que la pondría a prueba**, y cuándo lo haces.

Eso tercero define tu primera tanda. El capítulo 2.2<!--cap:fase--> te dice cuánto método te toca para ella, el 3<!--cap:dia-cero--> te lo monta, y la abres en 4.1<!--cap:abrir-tanda-->.

---

## 2 · Dos preguntas y en qué fase estás

**Antes:** nada. Este capítulo se hace en frío, con el proyecto en la cabeza y nada más.

### 2.1 · Las dos preguntas · un momento

Cuando un proyecto con IA no avanza, casi siempre es por una de dos razones, y se notan igual: vas rápido y no llegas. Pero el arreglo es distinto, y aplicar el arreglo de una al problema de la otra es la forma más cara de perder un mes.

**Pregunta 1 · El proyecto.** ¿Sabes qué estás construyendo y para quién?
Contesta escribiendo, no pensando: *«Esto produce valor cuando ___ puede tomar mejor la decisión de ___»*. Con fecha de hoy. No para acertar: para poder notar el día que cambie. Si no puedes rellenarla, tu problema está aquí y no en cómo usas la IA.

**Pregunta 2 · La relación con la IA.** ¿La manera en que trabajas con los modelos te está llevando a un sitio que no elegiste?
Señales: aceptas recomendaciones largas sin discutirlas · el proyecto tiene reglas que no recuerdas haber decidido · produces mucho y no sabes qué decisión ha mejorado · has acabado ejecutando o probando tú.
Si reconoces dos o más, tu problema está aquí, y el capítulo 6<!--cap:modelos--> es el primero que abres después del día cero.

Las dos pueden ser sí a la vez. Entonces el orden es: primero la 1, porque sin destinatario cualquier control que montes defiende una suposición.

**Queda:** la frase de la pregunta 1 en `metodo/00_VALOR.md`, con fecha.

### 2.2 · En qué fase estás · un momento

Elige una columna. No la que te gustaría: la que describe hoy.

<!-- BLOQUE: columnas-abc -->
- **A — Todavía no sé qué estoy construyendo.** Tienes una idea y ganas. Puede que hasta tengas claro para quién es. Lo que no tienes es ninguna prueba de que a alguien le importe. *Es el principio, y no es un problema.*
- **B — Ya sé qué es, y estoy probando si sirve.** Existe algo que puedes enseñar: una web, un documento, una primera versión. Estás averiguando si de verdad le resuelve algo a alguien.
- **C — Funciona, y hay gente usándolo.** Personas que no eres tú lo usan sin que tú estés delante. A partir de aquí, cada error lo paga alguien más.
<!-- /BLOQUE: columnas-abc -->

**Primero: ¿la columna de qué?** No de tu proyecto: de la cosa que estás construyendo ahora. Si ya tienes algo funcionando y además empiezas una oferta nueva, son dos cosas y cada una lleva su letra. Escribe una fila por cada una en `00_VALOR.md`. Mientras solo tengas una, es una sola fila y no cambia nada.

**Cuál le toca a esa cosa, en cuatro preguntas de sí o no.** Su columna es el último sí que puedes sostener:

1. ¿Existe algo que otra persona puede abrir o recibir sin que tú se lo expliques en directo?
2. ¿Alguien de fuera lo ha visto o lo ha recibido?
3. ¿Alguien lo ha usado sin ti delante y sin que se lo expliques?
4. ¿Un error lo pagaría ya alguien que no eres tú?

**A:** el 2 es no. **B:** el 2 es sí y el 3 es no. **C:** el 3 es sí.

Casos que confunden: una demo que enseñas tú sigue en A, porque falla el 1. Una página publicada que nadie ha abierto sigue en A, porque falla el 2: publicar no es que alguien la haya visto. Un servicio hecho a mano que alguien recibió es B, aunque haya sido una vez.

La columna decide cuatro cosas. Es la rejilla, y es el mecanismo central del manual: no hay versión simple y versión completa, hay columna.

<!-- BLOQUE: rejilla -->
| | **A** · No sé aún qué construyo | **B** · Ya sé qué, y pruebo si sirve | **C** · Sirve, y lo usa alguien |
|---|---|---|---|
| **Controles sobre la decisión**<br>*¿quién decide? ¿está escrito? ¿con fecha? ¿puedo cambiarlo?* | Valor con fecha · roles con su «NO decide» · encargo antes de dar autonomía · STOP escrito · cierre del día | Todo lo anterior · quién firma las cautelas que trae el modelo · lista de lo aparcado con la señal que lo devuelve | Todo lo anterior · un momento fijo en el calendario que abra esa lista |
| **Controles sobre el resultado**<br>*esto que ha salido, ¿pasa o no pasa?* | **Casi nada. Montarlos aquí es el error, no el rigor.** Cada control que escribes congela una suposición | Un gate de tres estados y **una prueba que debe fallar**, para saber que el gate funciona | El método entero · registrar en qué condiciones se midió cada cosa |
| **Fuera de la mesa** | Habla con una persona. Aunque no tengas nada que enseñar | Habla con cinco. Apunta cuántas veces has salido | Que alguien lo use sin ti delante y sin que se lo expliques |
| **Stack** | Un asesor · un ejecutor conversacional · texto plano versionado. Nada autónomo, nada de infraestructura | Entra el agente de código con repositorio · un sitio donde corra · datos gestionados · segundo proveedor para revisar · lectura y escritura separadas | Los gates como pruebas automáticas · condiciones de medida registradas · vigilancia del instrumento · copias fuera · tres proveedores · presupuesto con alarma |

**La regla que cruza las columnas:** cuanto menos sepas qué estás construyendo, más controles sobre la decisión y menos sobre el resultado. Los del resultado se ganan el sitio cuando ya sabes qué es un buen resultado, y no antes.

**La fila «fuera de la mesa» no es opcional en ninguna columna.** Es la única que no se puede hacer sentado y la que más tarda en dar señal.

**La letra es de una cosa, no de tu proyecto.** Se elige por lo que estás construyendo ahora: este producto, esta oferta nueva, esta hipótesis. Puedes tener dos a la vez y en columnas distintas, y es lo normal en cuanto algo empieza a funcionar: lo que ya usa gente está en C, la oferta nueva que nadie ha visto está en A, y cada una lleva su método. Si intentas poner una sola letra a todo, o montas controles de C sobre algo que aún no sabes qué es, o le quitas protección a lo que ya usa alguien.

**Se cambia de columna en las dos direcciones.** Algo puede volver de B a A cuando descubres que el destinatario era otro. Al volver se retiran controles, no se acumulan — **pero solo los de esa cosa**. Lo que ya usa gente no baja de columna nunca: si tu oferta nueva vuelve a A, el producto sigue en C y sus controles se quedan donde están.
<!-- /BLOQUE: rejilla -->

Cuatro palabras de la rejilla se usan aquí antes de tener capítulo. En una línea
cada una, y con eso basta para leer la tabla:

- **rol** — quién decide qué, con su «NO decide» escrito al lado. 3.1<!--cap:roles-->
- **encargo** — lo que le pides al ejecutor: qué, qué no, cómo se comprueba, cuándo se para. 4.3<!--cap:escribir-encargo-->
- **gate** — control sobre el resultado, con tres estados: cumple, incumple, no clasificado. Solo desde la columna B. 3.7<!--cap:primer-gate-->
- **STOP** — la condición que escribes antes de empezar para saber cuándo dejarlo. 13<!--cap:parar-->


**Queda:** la letra de tu columna, con fecha, en `metodo/00_VALOR.md`, debajo de la frase.

### 2.3 · Qué necesitas para el día cero

- **Un proyecto real** con la frase de 2.1<!--cap:ejes--> rellena.
- **Dos asistentes distintos como mínimo**: uno para criterio (asesor), otro para ejecutar. Pueden ser dos productos, dos proyectos dentro del mismo producto o dos conversaciones con instrucciones distintas. No pueden ser la misma conversación. El detalle de qué montar según tu columna está en el capítulo 15<!--cap:stack-->.
- **Una carpeta de texto plano** que no viva en un chat. En la columna A basta con que esté sincronizada; el repositorio remoto entra antes de que un ejecutor pueda escribir (capítulo 15.2<!--cap:stack-b-->). Lo que solo existe en un chat ya lo has perdido.
- **Un calendario** para dos citas fijas.
- **Tiempo**: el día cero son tres ratos largos, y no tienen que ser seguidos. El ciclo diario añade medio rato. El checkpoint semanal, un rato largo. Si no te caben, el método no te cabe y es mejor saberlo ahora.

**Hecho cuando:** `00_VALOR.md` tiene una frase con sujeto y decisión concretos, una fecha y una letra de columna.

---

## 3 · Día cero: montar el sistema

**Antes:** capítulo 2.2<!--cap:fase--> hecho — con la frase fechada y la letra de tu columna en `00_VALOR.md`. Sin eso, los pasos de aquí no saben qué instalarte.
**Duración:** tres ratos largos, en este orden. No tienen que ser seguidos. Cada paso usa el anterior.
**Lo que instalas depende de tu columna.** Cada paso dice si te toca. Lo marcado **[A]** se hace en todas; **[B+]** solo desde la columna B; **[C]** solo en la C.

### 3.1 · Los roles · medio rato · [A]

Crea `metodo/01_ROLES.md`. Por cada rol, dos columnas: **decide** / **NO decide**. Rellena la derecha primero: es la difícil y la única que sirve cuando hay prisa.

Mínimo cuatro roles:

**Fundador** (tú). Decide: intención, criterio de calidad, prioridad, restricciones, trade-offs, qué está prohibido, qué riesgos se asumen. Y todo lo que no esté delegado por escrito. NO decide: nada queda fuera de tu decisión — esa es la diferencia entre delegar y desaparecer. Pero ejecuta lo menos posible: cuando el que dirige ejecuta o prueba, no dirige nadie.

**Asesor.** Propone y objeta, con fuerza: qué se construye y en qué orden, para quién, qué se afirma en público, qué deuda se tolera. Su trabajo es señalar el riesgo, no impedir el movimiento. NO decide: nada de eso — todo sale como recomendación con fecha y la firmas tú en `08_DECISIONES.md`. Tampoco decide arquitectura, datos, orden técnico, si un cambio es seguro de publicar, **qué está prohibido** ni **qué cautelas asume el proyecto**. Si estas dos últimas no están escritas, se las queda sin que se lo pidas.

**Ejecutor.** Decide: nada. Ejecuta encargos cerrados. Cuando aparece algo no previsto, para y pregunta.

**Checkpoint.** Decide: cuándo se mira si hay que parar. NO decide: qué se construye, ni parar. El STOP lo firmas tú (13.3<!--cap:parar-firmar-->). No produce nada. Es una cita en el calendario, una persona o un agente con instrucciones propias; lo que no puede ser es implícito.

**Especialista técnico** [B+]. Decide: arquitectura, datos, orden técnico, seguridad del cambio. NO decide: alcance, afirmaciones públicas, prioridad comercial. Se crea cuando cambia el problema, no cuando aprieta el calendario.

**Queda:** `01_ROLES.md`.
**Hecho cuando:** cada rol tiene al menos tres cosas en la columna derecha y puedes decir en voz alta quién decide qué está prohibido (respuesta: solo tú).

### 3.2 · Instalar los roles en las herramientas · medio rato · [A]

Un rol en papel no hace nada. Cómo se instala en cada tipo de herramienta está en el capítulo 15.4<!--cap:stack-instalar-->. Lo mínimo:

**Asesor.** Proyecto o conversación permanente con instrucciones de sistema. Pega en ellas, en este orden: la frase de `00_VALOR.md`, tu columna, la fila del asesor de `01_ROLES.md` con su «NO decide», el bloque de etapa y umbral de evidencia (Anexo C.2) y las cuatro preguntas del Anexo C.1. Ese es su contrato.

**Ejecutor.** Una conversación nueva por encargo, o un agente de código. Sin contexto acumulado: lleva el encargo y el material. **[A]**: sin permiso de escritura sobre nada que no sea la carpeta del encargo. **[B+]**: agente de código con acceso al repositorio, restringido a lo que el encargo permita.

**Especialista técnico** [B+]. Proyecto o conversación permanente con su fila pegada. Puede ser el mismo producto que el asesor; no la misma conversación.

**Checkpoint.** Ver 3.5<!--cap:checkpoint-cita-->.

**Hecho cuando:** puedes abrir cada rol en menos de un minuto y cada uno tiene su «NO decide» en las instrucciones.

### 3.3 · Líneas rojas · medio rato · [A]

Crea `metodo/02_LINEAS_ROJAS.md`. Tres líneas mínimo: qué no afirmarás nunca sin evidencia; qué datos no compartirás nunca con un modelo; qué no publicarás nunca sin que lo mire alguien. Cada línea con **fecha de hoy y tu nombre**. La firma es lo que la distingue de una cautela que apareció sola.

**Hecho cuando:** tres líneas, fechadas, firmadas, ninguna escrita por un modelo.

### 3.4 · Los ficheros vacíos · un momento · [A]

Crea, vacíos salvo la cabecera (formatos en el Anexo D):

- `metodo/03_HIPOTESIS.md`
- `metodo/04_TAREAS.md`
- `metodo/05_VISTO_NO_TOCADO.md`
- `metodo/06_CATALOGO.md`
- `metodo/07_CIERRE.md`
- `metodo/08_DECISIONES.md`
- `metodo/09_STACK.md` — y escribe ya la primera fila: qué has montado hoy y por qué (capítulo 15.6<!--cap:stack-movimientos-->)
- `metodo/encargos/` y `metodo/activos/` (carpetas)

Donde vivan: en A, una carpeta sincronizada basta. El repositorio remoto entra antes de que un ejecutor pueda escribir en ellos (15.2<!--cap:stack-b-->).

**Hecho cuando:** existen todos.

### 3.5 · El Checkpoint con hora · un momento · [A]

Cita semanal de treinta minutos, con nombre «Checkpoint», el día y hora que sepas que vas a respetar. En la descripción, las cuatro preguntas fijas:

1. ¿Qué decisión concreta ha mejorado esta semana gracias a lo que he hecho?
2. ¿Qué estamos haciendo por inercia y ya no sé justificar?
3. ¿Qué contacto con el mundo real he tenido?
4. ¿Sigue cada cosa en su columna? Contéstala con las cuatro preguntas de 2.2<!--cap:fase-->, no de memoria.

**Hecho cuando:** la cita existe, se repite y tiene las cuatro preguntas dentro.

### 3.6 · El gate de realidad externa · un momento · [A]

Escribe en el calendario de **esta semana** una de estas cuatro cosas, con día: una conversación con alguien que podría comprar, usar o rechazar lo que haces; un envío; una publicación; un cobro. Si no cabe en la semana, ese es el problema del proyecto y lo acabas de encontrar en el día cero.

**Y antes de que llegue el día, cinco líneas sobre cómo va esa conversación.** No es un guion de ventas ni un cuestionario:

- **El nombre de una persona.** «Gente del sector» no es nadie: no se puede llamar.
- **Qué pones delante**: la frase, una página, una entrega hecha a mano, o nada.
- **Preguntas por lo que hace hoy**, no por lo que haría: *¿cómo resuelves esto ahora? ¿qué usas? ¿qué te cuesta?* «¿Lo usarías?» no vale como única pregunta: casi nadie le dice que no a un desconocido.
- **Hablas menos de la mitad del tiempo**, y una de tus preguntas tiene que poder contestarse «eso no es problema mío».
- **Después, tres frases suyas literales** en `03_HIPOTESIS.md`, no tu resumen. Y una cosa que te haya sorprendido: si no hay ninguna, o preguntaste mal o te dijeron lo que querías oír. Si lo único que puedes anotar es «le gustó», la conversación cuenta como cero.

**Hecho cuando:** hay una cita con una persona de fuera, con su nombre, o un envío con fecha.

### 3.7 · El primer gate y su prueba negativa · medio rato · [B+]

Solo desde la columna B. En la A, sáltalo: montar controles sobre el resultado sin saber qué es un buen resultado congela una suposición.

Escribe un gate, uno solo, para lo que más te preocupa que salga mal. Con nombre (`G-ALGO`), con la condición que verifica y con sus tres estados: cumple, incumple, no clasificado. Y escribe al lado la **prueba que debe fallar**: el caso concreto que el gate tiene que rechazar. Provócalo hoy. Si el gate no salta, no existe; reescríbelo hasta que salte.

**Hecho cuando:** el gate ha dado «incumple» al menos una vez, a propósito.

### 3.8 · Registrar condiciones de medida · medio rato · [C]

Solo en la columna C. Los modelos no son deterministas: una prueba que pasó no garantiza que vuelva a pasar, y dos resultados no son comparables si no sabes en qué condiciones se produjo cada uno. Añade a `06_CATALOGO.md` y a los criterios de aceptación de tus encargos un campo fijo: **modelo · versión · fecha · prompt o encargo usado**. Sin eso, en tres semanas no podrás contestar si el producto empeoró o cambió el material.

**Hecho cuando:** el campo existe y la última medida que tomaste lo tiene relleno.

### 3.9 · Cierre del día cero · un momento · [A]

Primera entrada en `07_CIERRE.md` con el formato del capítulo 5<!--cap:cierre-dia-->. Mañana empiezas por el capítulo 4<!--cap:ciclo-->.

---

## 4 · El ciclo: una tanda de trabajo

**Antes:** día cero hecho.

Una **tanda** es la unidad de trabajo: empieza con una decisión que hay que poder tomar y termina con una entrega observable. Dura entre medio día y dos días. Si dura más, son dos tandas.

Ocho pasos. No se saltan. Casi todos los problemas vienen de saltarse el 1, el 2 o el 5.

### 4.1 · Abrir la tanda · medio rato

Fichero nuevo en `metodo/encargos/` (nómbralo con fecha y tema). Cuatro líneas en la cabecera:

- **Decisión:** qué decisión concreta tiene que poder tomarse mejor al final.
- **Sabemos:** qué hay medido o comprobado.
- **Suponemos:** qué damos por cierto sin haberlo comprobado.
- **Contacto externo:** qué conversación, envío, publicación o cobro produce esta tanda. Si es «ninguno», mira la tanda anterior. Si también, esta tanda es obligatoriamente de contacto y no de construcción.

**Hecho cuando:** la primera línea no dice «avanzar» ni «mejorar»: dice qué decisión.

### 4.2 · Leer antes de tocar · medio rato

Media página sobre el estado real de lo que vas a tocar:

1. Qué hay ahora.
2. Quién o qué lo consume.
3. Qué compromisos hay firmados sobre ello.
4. Qué se rompería si cambia.
5. Una medida concreta del estado actual.
6. Un intento de refutar tu propia hipótesis: ¿qué tendría que ser cierto para que el cambio no hiciera falta?

Hazlo con un rol que **solo lea** si puedes. En la columna A eso es una instrucción en el primer mensaje: «no propongas cambios, solo describe lo que ves». Desde la B es un permiso de verdad —un agente sin escritura—, y entonces la regla se cumple sola porque no puede incumplirse.

Regla de tiempo: ningún cambio de más de dos horas empieza sin estos veinte minutos.

**Hecho cuando:** puedes escribir la media página. Si no puedes, ese es el trabajo de hoy.

### 4.3 · Escribir el encargo · medio rato

Un encargo se ejecuta literalmente, incluido lo que dice por accidente. Por eso se escribe con plantilla: la completa en el Anexo A, la corta (encargos de menos de una hora) en el Anexo B.

Bloque a bloque:

**OBJETO.** Qué hace el encargo, en dos frases. Y qué **no** es: el ejecutor rellena el hueco con lo más plausible si no lo cierras.

**PREFLIGHT.** Literal, siempre:
<!-- BLOQUE: preflight -->
Toda cifra citada aquí es una afirmación a recomputar.
Si tus números no coinciden con los míos, sigue con los tuyos y dilo.
Si algo de este encargo contradice lo que ves en el material real,
gana el material. Dilo antes de ejecutar.
<!-- /BLOQUE: preflight -->

**ALCANCE.** Lista numerada y cerrada.

**PROHIBIDO.** Lista numerada. Y: si cerrar el alcance exigiera salirse de aquí, STOP FUERA_DE_ALCANCE.

**GATES.** [B+] Los controles por los que pasa la entrega, con nombre y tres estados. **[A]: este bloque va vacío a propósito**, con la línea «sin gates de resultado: columna A». No es un olvido; es la rejilla.

**CRITERIO DE ACEPTACIÓN.** Dos líneas obligatorias en todas las columnas:
<!-- BLOQUE: criterio-aceptacion -->
No se acepta: [lo que sueles mirar porque es más cómodo — el borrador, la maqueta, la hoja de cálculo]
Se acepta: [lo que va a ver de verdad la persona a la que esto va dirigido]
<!-- /BLOQUE: criterio-aceptacion -->

**VEREDICTOS.** Lista cerrada de resultados posibles, tres o cuatro palabras. La entrega termina eligiendo una.

**STOP.** Total (la premisa era falsa, o cumplir exige salirse de lo permitido) y parcial (una parte cae; se entrega el resto y se declara cuál). Condiciones, de las cinco del capítulo 13<!--cap:parar-->, las que apliquen, con número.

**NO ABRIR FRENTES NUEVOS.** Lo que aparezca y no esté previsto va a `05_VISTO_NO_TOCADO.md`, en una línea.

**ENTREGA.** Qué y dónde. **[C]**: con modelo, versión, fecha. Y la última línea, obligatoria, sin opción a «ninguno»:
> MODO_DE_FALLO_NO_PREVISTO: cómo puede esto estar mal de una forma que el encargo no anticipa. Si no encuentras ninguna, di qué buscaste para descartarlo.

**Hecho cuando:** los diez bloques tienen contenido (o el de GATES tiene su línea de columna A), el PREFLIGHT está literal y la última línea es el modo de fallo. Guarda el fichero antes de enviarlo.

### 4.4 · Ejecutar

Envías el encargo con el material. Y mientras ejecuta, **tú no ejecutas**. No pruebas, no corriges de paso, no abres otro frente. Haces una de tres cosas: preparas la siguiente tanda, atiendes el contacto externo declarado, o nada.

Si el ejecutor vuelve con «esto contradice el material», eso es el sistema funcionando. Contestas con el material delante, corriges el encargo, vuelve a ejecutar. No lo resuelves a mano.

### 4.5 · Recibir la entrega · medio rato

En este orden:

<!-- BLOQUE: recibir-entrega -->
1. **Lee primero el `MODO_DE_FALLO_NO_PREVISTO`.** Es el bloque más valioso de la entrega y el último; por eso se lee primero. Si dice «ninguno», la entrega no es válida: se devuelve pidiendo qué buscó para descartarlo.
2. **Lee el veredicto.** Tiene que ser una palabra de la lista cerrada. Si es prosa, se devuelve.
3. **Comprueba las cifras recomputadas** contra las que tú escribiste. Si difieren, las suyas son las buenas hasta que demuestres lo contrario.
4. **Aplica el criterio de aceptación sobre el artefacto real.** No sobre lo que el ejecutor dice que hizo. Si no puedes observarlo tú, alguien tiene que hacerlo y no puede ser el ejecutor.
5. **Pasa cada gate** y anota su estado. *(Solo desde la columna B.)*
6. **Mira lo visto y no tocado.** Lo que haya entrado no se arregla ahora.
<!-- /BLOQUE: recibir-entrega -->

**Hecho cuando:** el criterio de aceptación se ha observado sobre lo real, y (desde B) cada gate tiene un estado escrito.

### 4.6 · Qué hacer con el resultado de cada gate · [B+]

**Cumple.** Pasa a 4.7<!--cap:decidir-->.

**Incumple.** Dos opciones: iterar (se corrige el encargo, no el resultado a mano, y vuelve a 4.4<!--cap:ejecutar-->) o STOP según lo escrito. Cuenta las iteraciones: al llegar al número del STOP se para aunque parezca que la siguiente lo arregla. Siempre lo parece.

**No clasificado.** Se detiene todo. No es un «casi cumple»: el gate no distingue este caso, así que está mal formulado o el encargo trajo algo no contemplado. Vuelve a 4.2<!--cap:leer-antes-->, lee lo que el gate no supo clasificar, reformula el gate y vuelve a 4.5<!--cap:recibir-->. Tres «no clasificado» seguidos: la tanda está mal abierta; vuelve a 4.1<!--cap:abrir-tanda-->.

**Un gate que siempre da «cumple».** Sospecha. 11.4<!--cap:comprobar-controles--> antes de fiarte.

En la columna A no hay gates: el criterio de aceptación sobre lo real hace su papel, y lo que no pasa va a 4.7<!--cap:decidir--> como «iterar» o «revertir».

### 4.7 · Decidir · un momento

Una de cuatro palabras en `08_DECISIONES.md`: **aceptar · iterar · revertir · aparcar**. Con ella: por qué, qué alternativa se descartó, quién lo propuso (tú, el asesor, el ejecutor, alguien de fuera), qué te haría cambiar de opinión.

Lo de `05_VISTO_NO_TOCADO.md` se decide ahora: pasa a `03_HIPOTESIS.md` con una línea, o se borra. No pasa a tareas.

**Hecho cuando:** hay una entrada con la columna «quién lo propuso» rellena.

### 4.8 · Cerrar la tanda · un momento

1. Si el modo de fallo no previsto era bueno, ponle nombre y mételo en `06_CATALOGO.md`. Mayúsculas y guiones.
2. Si algo de esta tanda lo has hecho ya tres veces igual, va a `metodo/activos/` como plantilla, con quién la usa y cuándo.
3. ¿Se produjo el contacto externo declarado? Si no, se arrastra y cuenta como el primer «ninguno».
4. **Coste de la tanda:** tokens o euros gastados, en una línea, al lado de qué decisión mejoró. Si no puedes contar la decisión, ese es el dato.

### 4.9 · Un ciclo recorrido, como ejemplo

*Ilustrativo, no un caso real. Proyecto en columna B.*

**4.1<!--cap:abrir-tanda-->** Decisión: si publicamos la nueva página de precios el lunes. Sabemos: la actual convierte al 1,2 % sobre 4.100 visitas del último mes. Suponemos: que el problema es la claridad del plan intermedio. Contacto externo: enviarla a dos clientes actuales antes de publicar.

**4.2<!--cap:leer-antes-->** Lectura: tres planes, la enlazan cuatro páginas y dos correos automáticos, hay una promesa pública de «sin permanencia». Refutación: el 60 % del tráfico es móvil y la página no se ha probado en móvil; puede que el problema no sea el texto.

**4.3<!--cap:escribir-encargo-->** Encargo. OBJETO: rediseñar texto y estructura; NO es cambiar precios ni planes. PREFLIGHT literal. ALCANCE: (1) tres planes con la misma información en el mismo orden, (2) «sin permanencia» visible sin scroll en móvil, (3) una sola llamada a la acción por plan. PROHIBIDO: precios, correos automáticos, las otras páginas. GATES: G-MOVIL (legible entera a 375 px) · G-PROMESA (la frase aparece literal) · G-ENLACES (los cuatro enlaces entrantes siguen llegando). CRITERIO: no se acepta la maqueta; se acepta la página publicada en pruebas, abierta en un móvil real. VEREDICTOS: LISTA_PARA_PUBLICAR · NECESITA_ITERACION · BLOQUEADA_POR_DEPENDENCIA. STOP: dos iteraciones sin pasar G-MOVIL; si exige tocar precios, FUERA_DE_ALCANCE. ENTREGA: URL de pruebas y modo de fallo.

**4.4<!--cap:ejecutar-->** El ejecutor devuelve antes de empezar: «el encargo dice cuatro enlaces entrantes; cuento seis». Se acepta su cifra, se corrige el encargo, se anota en el catálogo que la lectura de 4.2<!--cap:leer-antes--> se quedó corta.

**4.5<!--cap:recibir-->** Modo de fallo no previsto: «"sin permanencia" es literal, pero en el plan superior la letra pequeña dice "12 meses"; G-PROMESA la daría por cumplida». Veredicto: NECESITA_ITERACION. G-MOVIL cumple, G-ENLACES cumple, G-PROMESA: no clasificado.

**4.6<!--cap:resultado-gate-->** Se reformula G-PROMESA: «la frase aparece literal y ninguna condición del mismo plan la contradice». Segunda entrega: LISTA_PARA_PUBLICAR, tres gates cumplen.

**4.7<!--cap:decidir-->** Decisión: aparcar la publicación hasta que los dos clientes la vean. Quién lo propuso: yo. Cambio de opinión si los dos dicen que se entiende sin preguntar nada.

**4.8<!--cap:cerrar-tanda-->** Catálogo: «LA-FRASE-QUE-CUMPLE-Y-LA-LETRA-PEQUENA-QUE-DESMIENTE», arreglado en la formulación del gate, no en la página. Activo: la estructura de gates para páginas públicas, tercera vez, pasa a plantilla. Coste: 1,40 € en tokens del agente; decisión que mejoró: la de no publicar el lunes.

---

## 5 · Cierre del día · medio rato

**Antes:** nada. Se hace al terminar la jornada, no al empezar la siguiente: al día siguiente ya has perdido por qué descartaste lo que descartaste.

Entrada en `07_CIERRE.md` con fecha y cinco líneas:

1. **Qué decidí hoy.**
2. **Por qué.**
3. **Qué descarté.**
4. **Qué queda abierto.**
5. **Siguiente paso**: el primero de mañana, concreto, para empezar sin reconstruir.

Más una línea de **coste del día** (tokens o euros, de las tandas del día). Si pagas una suscripción plana, el coste marginal es cero y el dato no es ese: escribe las horas y, si tu proveedor lo enseña, cuánto del cupo llevas gastado.

Y una comprobación: si has tomado hoy una decisión estructural (algo que cuesta deshacer) después de una jornada larga, márcala «REVISAR MAÑANA». Si la decisión fue **no hacer algo**, márcala también: las renuncias no dejan rastro.

**Hecho cuando:** la quinta línea es una acción que puedes empezar mañana a las nueve sin abrir ninguna conversación antigua.

---

## 6 · Trabajar con modelos: lo que hay que asumir, y cómo pedir criterio

**Antes:** roles instalados (3.2<!--cap:instalar-roles-->).

### 6.1 · Seis cosas que hay que tener asumidas · lectura, 5 min

**No todos son iguales.** Cambiar de modelo no es cambiar de marca: cambia lo que se te da bien pedirle y lo que se te va a colar. Por eso `09_STACK.md` registra qué modelo ocupa qué rol.

**No son deterministas.** La misma pregunta dos veces puede dar dos respuestas. Una prueba que pasó no garantiza que vuelva a pasar; comparar dos resultados exige saber en qué condiciones se produjo cada uno (3.8<!--cap:condiciones-medida-->, columna C).

**Fallan de tres maneras, y cada una se arregla en un sitio distinto:**
<!-- BLOQUE: tres-fallos -->
- Deciden mal con toda la información delante → es del **control**.
- Deciden bien lo que les pediste, y les pediste lo que no era → es del **encargo**.
- Se les olvida: pierden el contexto y siguen como si nada → es de la **memoria**.

Antes de arreglar un fallo, decide cuál de las tres es. Arreglar el encargo cuando era la memoria no arregla nada.
<!-- /BLOQUE: tres-fallos -->

**Tienen sesgos, y vienen de cómo aprendieron.** Su manual por defecto es el de una organización grande: comités, validaciones, fases, prudencia. Si tu proyecto es una persona y tres semanas, te lo van a dar igual, con muy buena redacción. El bloque de etapa y umbral de evidencia (Anexo C.2) existe para eso.

**Tienen algo parecido a una ideología.** Su ética viene de fábrica y no la eligió nadie de tu proyecto. No se corrige: se nombra cuando aparece y decides tú quién firma (6.3<!--cap:consulta-recibir-->).

**Y los seguros que pones contra todo lo anterior pueden bloquearte.** Frenos, límites y reglas funcionan; también hunden proyectos. La rejilla de 2.2<!--cap:fase--> es la respuesta: controles sobre la decisión siempre, sobre el resultado solo cuando sabes qué es un buen resultado.

### 6.2 · Preparar la consulta · medio rato

En un fichero, antes de abrir la conversación: a quién sirve esto (la frase de `00_VALOR.md`) · qué decisión hay que tomar, una · qué está fuera de discusión · tres preguntas concretas · sabemos / suponemos, separados. Un documento sin preguntas recibe elogios.

### 6.3 · Recibir la respuesta · medio rato

<!-- BLOQUE: asesor-filtro -->
Subraya cada frase que restrinja algo: *no deberías, convendría evitar, habría que validar antes, sería prudente, mejor esperar*. Al lado de cada una, quién lo decide: **yo · el cliente · la ley · el modelo.**

Lo que caiga en «el modelo» se borra. Si te sigue pareciendo buena idea, lo reescribes tú, con tus palabras, con fecha y firma. Entonces ya es una decisión.
<!-- /BLOQUE: asesor-filtro -->
1. Si la evidencia que te pide **no puede existir todavía** a esta altura del proyecto, es bloqueo de *playbook* —la cautela por defecto de una organización grande, no un riesgo de tu proyecto—: se declara supuesto, se escribe qué lo refutaría y cuándo se comprueba, y se sigue. Si **sí puede existir** y no la has buscado, el bloqueo es correcto: se busca.
2. Si la respuesta es demasiado redonda: *¿qué tendría que ser cierto para que estuviera equivocada?* Sin respuesta, era playbook.
3. Si le señalas exceso de cautela y se pasa al otro extremo, no lo ha arreglado: ha cambiado de fallo. Pide qué parte sostiene y con qué.

### 6.4 · Dónde va lo que sale

Todo a `03_HIPOTESIS.md`: propuestas y también objeciones. Una objeción de un modelo tampoco es una decisión. Nada pasa a `04_TAREAS.md` desde aquí; pasa por el capítulo 7<!--cap:hipotesis-tarea-->.

**Y si el mismo choque se repite tres veces**, no es un mal día: es un campo que falta en la definición del rol. Se escribe en `01_ROLES.md` y en las instrucciones del rol, no en el chat.

**Hecho cuando:** no queda ninguna restricción nueva en el proyecto sin autor con fecha.

---

## 7 · De hipótesis a tarea

**Antes:** `03_HIPOTESIS.md` y `04_TAREAS.md` existen.

Pipeline obligatorio: **idea → hipótesis → evidencia → decisión → tarea.** Nunca idea → tarea.

**Entrada.** Todo lo que sale de una conversación con IA, un brainstorming, una revisión o `05_VISTO_NO_TOCADO.md` entra en `03_HIPOTESIS.md`: qué se afirma y qué evidencia haría falta.

**Comprobación.** Para pasar a tarea hace falta **una** comprobación, escrita: un dato mirado, tres casos abiertos, una persona preguntada. «Parece razonable» no es una comprobación. 

<!-- BLOQUE: recorrido-senal -->
**Lo que ves → qué NO te dice → compruébalo → decide**

El segundo paso es el que todo el mundo se salta, y es donde está casi siempre el error.

Un ejemplo. Ves que una página tiene diecinueve enlaces sin destino. Eso es lo que ves. Lo que no te dice: si son enlaces rotos **o** botones que funcionan de otra manera. Son dos cosas distintas y el dato no las separa. Comprobarlo cuesta un minuto: abres la página y pulsas tres. Y entonces decides.

Saltarse el segundo paso es cómo se acaba «arreglando» algo que funcionaba.
<!-- /BLOQUE: recorrido-senal -->

**Salida.** Solo entra en `04_TAREAS.md` lo que trae la línea de evidencia. La tarea que sale muchas veces no es la que parecía y suele ser más barata. Lo que lleva tres semanas sin comprobar se borra en el checkpoint.

**Hecho cuando:** `04_TAREAS.md` es más corto que `03_HIPOTESIS.md` y cada tarea tiene su evidencia al lado.

---

## 8 · Escribir un informe o entregable sin afirmar de más

**Antes:** el trabajo hecho. Se aplica a cualquier cosa que salga del proyecto hacia alguien.

**Antes de escribir.** Cuatro columnas, rellenas de verdad: **sabemos · suponemos · falta comprobar · no sabemos.** La cuarta es la que da credibilidad.

**Mientras escribes.**
- Cada hipótesis lleva `[HIPÓTESIS — no medida]`. Sin marca, al segundo uso es dato.
- Cada afirmación general lleva al lado sobre cuántos casos la observaste. Tres páginas no son la web.
- Cada «no hay» se decide antes: ¿«no hay» o «no lo hemos encontrado»?
- Cada porcentaje: ¿qué hay en el denominador? Si es «lo que mi herramienta consiguió leer», reescríbelo con el total real y declara la cobertura como limitación tuya, en apartado aparte.
- Cada recomendación recorre señal → límite → comprobación → decisión.
- **[C]** Cada medida lleva modelo, versión, fecha y encargo.

**Antes de enviar · Promise Audit · 15 min.** Busca: **garantizamos · mejor · siempre · identifica · predice · optimiza · aumenta · decide · recomienda.** Por cada una, ¿hay evidencia de que ocurre de forma consistente? Si no, se reescribe; no se suaviza con un asterisco. Y en las dos direcciones: exagerar hacia lo malo también es afirmar más que la prueba.

**Hecho cuando:** el apartado «no sabemos» existe y no está vacío, y ningún porcentaje tiene el instrumento por denominador.

---

## 9 · Checkpoint semanal · un rato largo

**Antes:** la cita de 3.5<!--cap:checkpoint-cita-->. No produce nada.

1. Contesta por escrito las cuatro preguntas fijas. Si la primera no tiene respuesta concreta, la semana ha sido de producción, no de avance.
2. **Gate de realidad externa.** Cuenta las conversaciones con personas de fuera. No reuniones internas, no revisiones, no modelos. Cero dos semanas seguidas: la próxima empieza con contacto.
3. **La columna.** Si la respuesta a la cuarta pregunta es «no», cambia la letra en `00_VALOR.md` con fecha y ve al capítulo 10.3<!--cap:retirar-controles-->: cambiar de columna es añadir o retirar controles, no seguir con los mismos.
4. Lee `07_CIERRE.md` de la semana: las marcas «REVISAR MAÑANA» que no se revisaron.
5. Lee `08_DECISIONES.md`: cada restricción que propuso un asesor y no firmaste tú, se firma ahora o se borra.
6. `03_HIPOTESIS.md`: lo que lleva tres semanas sin comprobar, fuera.
7. `09_STACK.md`: ¿ha entrado o salido algo esta semana sin fila? Se añade ahora.
8. El bloque de checkpoint en `07_CIERRE.md`, con el formato de su cabecera: las cuatro respuestas, los tres números y el veredicto —seguimos, cambiamos o paramos— con su porqué.

**Hecho cuando:** el bloque del punto 8 existe.

---

## 10 · Revisión periódica · cada 2–4 semanas · una sesión

**Antes:** al menos dos checkpoints hechos.

### 10.1 · La regla

Termina en tres decisiones visibles: **una cosa que se mantiene, una que se cambia, una que se aparca.** Sin tres decisiones no ha sido una revisión: ha sido una lectura.

### 10.2 · La lista

- Un aprendizaje real de este ciclo (no una idea nueva).
- ¿Está separado lo medido de lo supuesto en todo lo que ha salido?
- ¿Ha entrado al menos una entrada nueva en `06_CATALOGO.md`?
- De cada fallo: ¿se arregló en el mecanismo o donde se observó?
- ¿Alguna afirmación pública por encima de su evidencia, en cualquier dirección?
- ¿Qué restricción ha adoptado el proyecto este ciclo, y quién la firmó?
- ¿Qué he decidido NO hacer este ciclo, y por qué?
- ¿Qué hipótesis han pasado a tarea y con qué evidencia?
- ¿Qué se ha automatizado? ¿Se había hecho a mano tres veces igual antes?
- ¿Qué output se ha convertido en activo, y quién lo usa?
- ¿Qué parte del sistema está costando más tiempo del que ahorra?
- **Stack:** coste del ciclo dividido por decisiones que mejoraron. ¿Hay algo en `09_STACK.md` que no ha justificado su fila?
- Gate de realidad externa del ciclo: cuántos contactos, cuántas tandas sin ninguno.
- ¿En qué estado llego yo? ¿He decidido algo estructural cansado?
- Siguiente paso concreto.

### 10.3 · Retirar controles

Un método que solo sabe crecer acaba en liturgia. En cada revisión, y siempre que cambies de columna:

> **Un control que nunca se ha puesto en rojo o está sin probar, o sobra.** Si lleva tres ciclos en verde, pruébalo a propósito una vez. Si salta, se queda. Si no salta ni con el caso que debería tumbarlo, retíralo y anota por qué.

Quitar un control es una decisión con autor y fecha, igual que ponerlo. Va a `08_DECISIONES.md`.

**Hecho cuando:** hay tres decisiones en `08_DECISIONES.md` y cada control en pie ha reventado alguna vez.

---

## 11 · Cuando algo falla

**Antes:** nada. Se abre en el momento.

### 11.1 · Nombrarlo · un momento

Antes de arreglar nada, entrada en `06_CATALOGO.md`: nombre en mayúsculas con guiones, qué pasó, «dónde se arregló» vacío por ahora. **[C]** Con modelo, versión y fecha.

Si no sabes qué nombre ponerle, busca el síntoma:

<!-- BLOQUE: sintomas-catalogo -->
**«Todo está en verde y algo va mal»** — el instrumento mide mal la medida, o ningún control mira la dimensión que falla.

**«El sistema dice que no hay nada»** — un mecanismo que no ejecuta su función contesta «no hay», y suena igual que un no de verdad. O se aceptó un «no aparece» sin demostrar, en la misma corrida, que el instrumento encuentra un caso conocido.

**«La cifra no cuadra con lo que pasa de verdad»** — el denominador es del instrumento y no del mundo; o el titular es más ancho que la prueba; o la medida es cierta y la atribución falsa.

**«Me han dado un consejo y no sé si fiarme»** — una señal saltó a recomendación sin pasar por comprobación; o una cautela del asesor entró como si fuera una decisión.

**«Lo arreglé y ha vuelto»** — se arregló donde se observó, no donde se produce.

**«Avanzo mucho y no llego a ninguna parte»** — avance interno contado como avance real.
<!-- /BLOQUE: sintomas-catalogo -->

### 11.2 · Decidir de cuál de las tres es · un momento

Antes de tocar nada (6.1<!--cap:modelos-asumir-->): ¿decidió mal con todo delante (control), decidió bien lo que no era (encargo), o se le olvidó (memoria)? El arreglo va a ese sitio y no a otro.

### 11.3 · Arreglar en el mecanismo

¿Dónde se produce este fallo, no dónde lo he visto? Un fallo arreglado donde se observó está escondido, no arreglado. Antes de cerrar: *si esto mismo apareciera en otro sitio, ¿lo pararía algo?* Si no, no está arreglado. Entonces se rellena «dónde se arregló».

### 11.4 · Comprobar los controles · [B+]

Un control que siempre da verde puede estar bien o roto, y desde fuera se ven igual:

1. **Prueba negativa.** Provoca la condición que debe bloquear. Si no revienta, no existe.
2. **Control positivo.** Antes de aceptar un «no encuentra nada», tiene que encontrar en la misma corrida un caso que sabes que está.
3. **Dimensión no mirada.** Debajo de tu panel, una línea: «esto no mira: ___», tres cosas.

### 11.5 · Comprobar una cifra antes de decidir con ella

¿De dónde sale exactamente? ¿Qué tuvo que funcionar bien para que sea cierta? ¿He visto alguna vez a ese mecanismo dar un resultado malo? Si la tercera es «no», la cifra no está verificada: está sin poner a prueba.

---

## 12 · Contrastar una decisión grande

**Antes:** una decisión que cambia alcance, gasto, a quién sirves o qué afirmas en público. No para el día a día.

### 12.1 · Preparar el material · medio rato

Un documento con: a quién sirve, qué decisión, qué está fuera de discusión (si falta, la unanimidad no vale nada: será un error repetido N veces) · lo medido separado de lo opinado · tus propios errores incluidos · tres preguntas concretas · sobre qué le pides opinión a cada revisor **y sobre qué no**. Ninguno decide a quién sirves, cuánto cobras ni cómo te posicionas.

### 12.2 · Elegir revisores

Mínimo tres. Al menos una persona de fuera. Si usas modelos, de proveedores distintos, en conversación nueva, sin contexto, sin saber de los otros. Dos opiniones idénticas son una. Si un revisor se recusa por tener contexto previo, es la mejor respuesta que vas a recibir.

### 12.3 · Repartir

Cambia el orden del material para cada uno: si el orden lo pones tú, la coincidencia también. Si lo evaluado tiene presentación, congélala antes y no la toques durante la evaluación.

### 12.4 · Leer las respuestas

- Lo que coinciden todos sin hablarse: se arregla sin discutir.
- Lo que dice uno solo pero se puede comprobar: se comprueba. Un hallazgo verificable no necesita votos.
- De un modelo: si dice que algo no se entiende, créetelo del todo; si dice que se entiende, a medias. No es un usuario.
- Lo que ningún modelo puede decirte (si alguien lo hará, si se hace largo, dónde abandona la gente): a una persona.

### 12.5 · Cerrar

Entrada en `08_DECISIONES.md` con una de las cuatro palabras y qué revisor pesó en qué.

---

## 13 · Cuándo parar

**Antes:** cualquier cosa que vaya a durar más de una tanda.

### 13.1 · La línea que se escribe antes de empezar

Antes de empezar, una línea: *¿qué tendría que pasar para que lo dejara?* Sin respuesta, no estás decidiendo continuar. Un plazo no vale: dice cuándo miras, no qué miras.

### 13.2 · Las cinco condiciones

Las cinco condiciones. Elige y numera las que apliquen:

<!-- BLOQUE: stop-condiciones -->
1. Tras N iteraciones no mejora.
2. Una prueba refuta el supuesto principal.
3. La complejidad supera el valor.
4. Exige cambiar algo fuera del alcance.
5. Aparece una dependencia no resuelta.
<!-- /BLOQUE: stop-condiciones -->

**Si es tu primera tanda y no sabes cuáles marcar:** la 2 siempre, porque toda primera tanda existe para poner a prueba un supuesto. La 4 si el encargo toca algo que ya funciona. Las otras tres piden un número o una dependencia que todavía no tienes; déjalas para cuando aparezcan.

*Un plazo no es una condición de parada: dice cuándo miras, no qué miras.*

### 13.3 · Parar total o parcial · lo firmas tú

Cuando se cumple una, se para: total o parcial (se entrega lo que se pudo y se declara qué cayó). `08_DECISIONES.md`: «revertir» o «aparcar». El STOP lo firmas tú. Si lo propone el asesor y su motivo no es una de las cinco, es 6.3<!--cap:consulta-recibir--> otra vez.

### 13.4 · La señal sin condición escrita

Señal sin condición escrita: el gasto (tokens, horas, dinero) sube y ninguna decisión mejora. No es presupuesto: es exploración sin criterio de parada. `09_STACK.md` y el campo de coste del cierre existen para verlo a tiempo.

---

## 14 · Cuando el problema eres tú

**Antes:** nada. Se abre cuando reconoces una señal.

Eres la única pieza sin repuesto. Cuando te degradas, la producción no baja: solo empeoran las decisiones, y nadie lo ve.

**Señales.** Aceptas recomendaciones largas sin discutirlas (el operador cansado no solo decide peor: acepta mejor) · has decidido algo estructural tras una jornada larga · dos tandas sin contacto externo y no te parece grave · estás ejecutando o probando tú · `07_CIERRE.md` lleva tres días sin entrada.

**Qué hacer**, por orden de rendimiento:

1. Cierra con el capítulo 5<!--cap:cierre-dia--> aunque no hayas terminado.
2. Reduce alcance antes que calidad: cuando queda poca energía la tentación es acabar; lo correcto es acortar.
3. Recupera estado desde `07_CIERRE.md`, nunca desde la memoria.
4. Ninguna decisión estructural hoy: «REVISAR MAÑANA».
5. El Checkpoint no se mueve. Es la única fricción que queda y la que se salta cuando hay prisa.

---

## 15 · Stack: qué, cuándo, cuánto, cómo

**Antes:** tu columna (2.2<!--cap:fase-->). Este capítulo es la fila «stack» de la rejilla, desarrollada.

Dos distinciones antes de nada. **Una herramienta es lo que abres. Un stack es lo que abres, qué rol ocupa cada cosa, qué dato pasa de una a otra y dónde queda guardado el resultado.** La prueba: ¿dónde vive lo que produjiste el martes pasado? Si es «en una conversación, en algún sitio», no hay stack. Y: **las capas de IA rotan; las que no son IA sostienen.** Al rediseñar se cambia lo que se mueve, no lo que sostiene.

Los nombres de productos van fechados: **septiembre de 2026**. Las cifras son órdenes de magnitud a esa fecha, para saber en qué unidad se cuenta; las tuyas serán otras y van en `09_STACK.md`.

### 15.1 · Columna A · No sé aún qué construyo

**Qué.**
- *Asesor*: un modelo de conversación con proyecto e instrucciones permanentes.
- *Ejecutor*: conversación nueva por encargo, en el mismo producto o en otro. Sin permiso de escritura sobre nada.
- *Memoria*: una carpeta de texto plano con la `metodo/`. Versionada si sabes (un repositorio local basta); si no, una carpeta sincronizada. Lo importante es que no viva en el chat.
- *Nada más.* Ningún agente autónomo, ninguna infraestructura, ningún dato gestionado.

**Cuándo entra.** El día cero. **Cuándo sale de A:** cuando tienes una versión enseñable y una persona de fuera que la ha visto.

**Cuánto.** Una suscripción de pago de un proveedor (orden de magnitud: veinte euros al mes; los planes altos, cien a doscientos). Montaje: una hora. Tokens: los que cubre la suscripción.

**Cómo.** 3.2<!--cap:instalar-roles-->. Las instrucciones del asesor llevan, en este orden: valor, columna, su fila de roles, Anexo C.2, Anexo C.1.

**Qué no montar aquí, aunque puedas.** Un agente con acceso de escritura a código, un pipeline, una automatización de nada. Todo eso congela una suposición sobre un producto que aún no sabes cuál es.

### 15.2 · Columna B · Ya sé qué, y pruebo si sirve

**Qué entra, además de lo de A.**
- *Ejecutor con repositorio*: un agente de código con acceso al repositorio, restringido por encargo. Es el paso donde un error deja de ser un texto y pasa a tocar lo real, y por eso es el que exige los gates.
- *Repositorio remoto*: el historial real. Es lo que convierte «tirar el 75 %» en una decisión y no en una pérdida.
- *Un sitio donde corra*: que lo construido esté funcionando, no solo en local. Infraestructura gestionada de bajo coste.
- *Datos gestionados*: una base de datos administrada donde vive lo que el producto guarda.
- *Segundo proveedor*: para revisión independiente (capítulo 12<!--cap:contrastar-->). Que no comparta proveedor con el asesor.
- *Lectura y escritura separadas físicamente*: un entorno o rol solo lectura para 4.2<!--cap:leer-antes-->, otro para 4.4<!--cap:ejecutar-->. Cuando el que lee no tiene permiso para escribir, la regla no se puede incumplir por descuido.
- *Especialista técnico*, si la complejidad lo pide (3.1<!--cap:roles-->).

**Cuándo entra cada cosa.** El agente de código y el repositorio: cuando el primer encargo de A necesita tocar más de un fichero. El sitio donde corra: cuando el criterio de aceptación diga «lo que ve el destinatario» y eso sea una URL. Los datos gestionados: cuando el producto guarde algo de alguien. El segundo proveedor: en la primera decisión grande (capítulo 12<!--cap:contrastar-->). El especialista: cuando cambia el problema, no cuando aprieta el calendario. **Cuándo sale de B:** cuando alguien lo usa sin ti delante y sin que se lo expliques.

**Cuánto.** Dos suscripciones (orden: cuarenta a trescientos euros al mes según planes). Infraestructura y datos gestionados en sus tramos bajos: de cero a unas decenas al mes. Tokens del agente de código: de céntimos a decenas de euros por tanda según modelo y tamaño; **mide la primera semana y escribe la cifra en `09_STACK.md`**, porque es el dato que dispara la alarma de 13.4<!--cap:parar-gasto-->. Montaje: medio día.

**Cómo.** El agente de código lleva un fichero de instrucciones en la raíz del repositorio con: la fila del ejecutor de `01_ROLES.md`, el PREFLIGHT literal, la regla de no abrir frentes y dónde está `05_VISTO_NO_TOCADO.md`. Sus permisos de escritura se limitan a lo que el encargo del día autoriza. El entorno de solo lectura es el mismo agente sin permiso de escritura, o una conversación aparte.

### 15.3 · Columna C · Sirve, y lo usa alguien

**Qué entra, además de lo de B.**
- *Los gates como pruebas automáticas*, cada una con su prueba negativa en el mismo conjunto: un gate que no tiene el caso que lo tumba no está probado.
- *Condiciones de medida registradas* (3.8<!--cap:condiciones-medida-->): modelo, versión, fecha, encargo, en cada resultado guardado.
- *Vigilancia del instrumento*: algo que compruebe periódicamente que lo que mide sigue midiendo, contra material guardado y conocido. Un instrumento que nunca falla no está midiendo.
- *Copias fuera de la máquina* de todo lo que no puedes perder: el repositorio no basta si lo que importa está en la base de datos o en un entorno que se recicla.
- *Tres proveedores o más* para revisar (capítulo 12<!--cap:contrastar-->), y un registro de qué modelo hizo de revisor cuándo.
- *Presupuesto de tokens con alarma*: un umbral mensual, y la regla de 13.4<!--cap:parar-gasto--> escrita al lado.

**Cuándo entra.** Los gates automáticos: en el primer cambio que pueda romper algo que alguien usa. La vigilancia del instrumento: la primera vez que una cifra tuya resulte falsa por el instrumento (11.5<!--cap:comprobar-cifra-->). Las copias: hoy, si estás en C y no las tienes. **Cuándo se retira algo:** 10.3<!--cap:retirar-controles-->, igual que cualquier control.

**Cuánto.** Se añade a B: infraestructura en tramo medio, almacenamiento de copias, y tokens de revisión (tres conversaciones nuevas por decisión grande). Lo que más cuesta no es dinero: es mantener las pruebas, y es tiempo tuyo o del especialista. Si el mantenimiento del sistema supera el tiempo de decidir, 10.2<!--cap:lista-revision--> lo caza.

**Cómo.** Los gates viven en el repositorio junto al código, se ejecutan solos antes de publicar, y cada uno tiene al lado el caso que debe rechazar. El registro de condiciones es un campo más en cada resultado guardado, no un documento aparte.

### 15.4 · Cómo se instala un rol en cada tipo de herramienta

Cuatro sitios donde puede vivir la definición de un rol. El contenido es el mismo; cambia dónde se pega.

- **Instrucciones de proyecto** (productos de conversación con proyectos): para asesor y especialista. Se pegan una vez y valen para todas las conversaciones del proyecto.
- **Prompt de sistema o primer mensaje** (productos sin proyectos): se pega al abrir cada conversación. Guárdalo en `metodo/activos/` para no reescribirlo.
- **Fichero de instrucciones del agente de código**, en la raíz del repositorio: para el ejecutor. Lo lee solo al arrancar.
- **Permisos**: lo que un rol puede tocar no se le dice, se le limita. Solo lectura para 4.2<!--cap:leer-antes-->; escritura acotada para 4.4<!--cap:ejecutar-->.

Tres reglas de trato que sostienen los roles y no dependen de la herramienta: nombrar el rol antes de pedir · no cambiar de rol a mitad de conversación (si hace falta otro papel, otra conversación) · declarar apertura y cierre de sesión, que es lo que hace barato el reinicio de contexto. Y un contexto que tienes que repetir en voz alta es un campo que falta en la definición del rol: se escribe allí, no en el chat.

### 15.5 · Criterios de selección · los que no caducan

<!-- BLOQUE: stack-criterios -->
1. **¿Me deja ver el trabajo o solo el resultado?** Lo que no se puede auditar no se puede firmar.
2. **¿Puedo llevarme lo que produzco?** Si tus encargos y plantillas solo existen dentro de un producto, el producto es tu método.
3. **¿Falla de forma visible o silenciosa?** Prefiere lo que rompe con estruendo a lo que degrada sin avisar.
4. **¿Dónde acaban mis datos y los de mi cliente?** No como cláusula legal: como decisión de trabajo. Determina qué puedes pegar y, por tanto, para qué te sirve.
5. **¿Me dice cuándo no debería fiarme de él?** Un revisor que sabe cuándo no puede revisar vale más que uno que siempre contesta.

**Regla de adopción:** nada entra por una demo. Entra después de un trabajo real con consecuencias reales.
<!-- /BLOQUE: stack-criterios -->

### 15.6 · El libro de movimientos · `09_STACK.md`

Una fila por cada cosa que entra o sale: fecha · entra · sale · rol que ocupa · motivo · coste mensual. **Nada entra sin fila.** Si en tres meses no hay filas nuevas, o el stack está estable o has dejado de escribirlo.

Y la lectura que da la tabla con el tiempo: cuántos movimientos son salidas. Un stack se construye tanto quitando como poniendo.

### 15.7 · Coste · dónde se mira

Tres sitios, ya montados por el resto del manual: el campo de coste de cada tanda (4.8<!--cap:cerrar-tanda-->) · la línea de coste del cierre del día (5<!--cap:cierre-dia-->) · la división coste / decisiones que mejoraron en la revisión (10). Si no puedes contar las decisiones, ese es el dato. Y la alarma de 13.4<!--cap:parar-gasto-->: gasto que sube sin decisión que mejore es exploración sin criterio de parada.

**Hecho cuando** (para todo el capítulo): `09_STACK.md` tiene una fila por cada herramienta que usas hoy, con su rol y su coste, y ninguna herramienta que uses está fuera de la tabla.

---

## Anexo A · Plantilla de encargo completa

```
ENCARGO — [fecha] — [tema] — columna [A/B/C]

DECISIÓN QUE TIENE QUE PODER TOMARSE AL FINAL
  ...

SABEMOS / SUPONEMOS / CONTACTO EXTERNO DE ESTA TANDA
  ...

OBJETO
  Qué hace este encargo.
  Qué NO es.

PREFLIGHT
<!-- BLOQUE: preflight -->
Toda cifra citada aquí es una afirmación a recomputar.
Si tus números no coinciden con los míos, sigue con los tuyos y dilo.
Si algo de este encargo contradice lo que ves en el material real,
gana el material. Dilo antes de ejecutar.
<!-- /BLOQUE: preflight -->

ALCANCE
  1. ...

PROHIBIDO
  1. ...
  Si cerrar el alcance exigiera salirse de aquí: STOP FUERA_DE_ALCANCE.

GATES
  [Columna A: "sin gates de resultado: columna A"]
  G-NOMBRE-1 — qué condición verifica — caso que debe rechazar
  Cada gate tiene tres estados: cumple · incumple · no clasificado.
  El tercero también detiene.

CRITERIO DE ACEPTACIÓN — sobre el artefacto real
<!-- BLOQUE: criterio-aceptacion -->
No se acepta: [lo que sueles mirar porque es más cómodo — el borrador, la maqueta, la hoja de cálculo]
Se acepta: [lo que va a ver de verdad la persona a la que esto va dirigido]
<!-- /BLOQUE: criterio-aceptacion -->

VEREDICTOS (elige uno al entregar; no prosa)
  NOMBRE_1   qué significa
  NOMBRE_2   qué significa

STOP
  Total si: ...
  Parcial si: ... (se entrega el resto y se declara qué cayó)
  Condiciones: [de las cinco, las que apliquen, con número]

NO ABRIR FRENTES NUEVOS
  Lo que aparezca y no esté previsto va a 05_VISTO_NO_TOCADO.md,
  en una línea. No se arregla de paso.

ENTREGA
  Qué y dónde.
  [Columna C: modelo · versión · fecha]
  Termina obligatoriamente, sin opción a "ninguno", con:
  MODO_DE_FALLO_NO_PREVISTO — cómo puede esto estar mal de una forma
  que este encargo no anticipa. Si no encuentras ninguna, di qué
  buscaste para descartarlo.
```

## Anexo B · Plantilla corta (encargos de menos de una hora)

```
OBJETO: ...
NO TOCAR: ...
SE ACEPTA SI: [observado sobre lo real, no sobre un sustituto]
CIFRAS: toda cifra de aquí es a recomputar; si no coincide, la tuya y dilo.
Y AL FINAL: ¿cómo podría estar equivocado esto de una forma
que yo no haya anticipado?
```

## Anexo C · Bloques para las instrucciones del asesor

### C.1 · Las cuatro preguntas

```
<!-- BLOQUE: asesor-preguntas -->
1. Si recomiendas no hacer algo, di de dónde sale esa cautela:
   del material, de mi encargo, de la ley, o de tu criterio propio.
   En el último caso, dilo con esas palabras.

2. No corrijas un sesgo con el contrario. Si te digo que has sido
   demasiado prudente, no te pases al otro lado: dime qué parte
   de tu recomendación sostienes y con qué.

3. Separa lo que sabes de lo que supones y de lo que te parece
   prudente. Son tres cosas distintas y las escribes igual.

4. Al final de cada recomendación: ¿cómo podría estar equivocada
   de una forma que yo no haya anticipado?
<!-- /BLOQUE: asesor-preguntas -->
```

### C.2 · Etapa, umbral de evidencia y autoridad

```
<!-- BLOQUE: asesor-etapa -->
ETAPA
  Este proyecto no es una organización madura. En la fase en la que
  está, muchas decisiones se toman sin evidencia disponible porque
  todavía no puede existir.

UMBRAL DE EVIDENCIA
  Si la evidencia que reclamas no puede existir todavía, no bloquees:
  márcalo como supuesto, di qué lo refutaría, y sigue.
  Si sí puede existir y no la tengo porque no la he buscado,
  el bloqueo es correcto: dilo.

AUTORIDAD
  La decisión final es mía. Tu trabajo es señalar el riesgo,
  no impedir el movimiento.

PROHIBIDO
  Recomendar la práctica estándar sin decir para qué tipo
  de organización es estándar.
<!-- /BLOQUE: asesor-etapa -->
```

## Anexo D · Inventario y formato de los ficheros

| Fichero | Qué es | Se toca en |
|---|---|---|
| `00_VALOR.md` | La frase de valor, con fecha, y la columna actual | 2.1<!--cap:ejes-->, 9<!--cap:checkpoint--> |
| `01_ROLES.md` | Roles con decide / NO decide | 3.1<!--cap:roles-->, 6.4<!--cap:consulta-salida--> |
| `02_LINEAS_ROJAS.md` | Límites con fecha y firma | 3.3<!--cap:lineas-rojas-->, 6.3<!--cap:consulta-recibir--> |
| `03_HIPOTESIS.md` | Todo lo que sale de una conversación con IA | 6.4<!--cap:consulta-salida-->, 7<!--cap:hipotesis-tarea-->, 9<!--cap:checkpoint--> |
| `04_TAREAS.md` | Solo lo que trae evidencia | 7<!--cap:hipotesis-tarea--> |
| `05_VISTO_NO_TOCADO.md` | Lo no previsto durante un encargo | 4.5<!--cap:recibir-->, 4.8<!--cap:cerrar-tanda--> |
| `06_CATALOGO.md` | Fallos con nombre | 4.8<!--cap:cerrar-tanda-->, 11<!--cap:fallo--> |
| `07_CIERRE.md` | El diario | 5<!--cap:cierre-dia-->, 9<!--cap:checkpoint-->, 14<!--cap:operador--> |
| `08_DECISIONES.md` | Qué se decidió, por qué, quién lo propuso | 4.7<!--cap:decidir-->, 10<!--cap:revision-->, 12<!--cap:contrastar-->, 13<!--cap:parar--> |
| `09_STACK.md` | Libro de movimientos del stack | 3.4<!--cap:ficheros-vacios-->, 9<!--cap:checkpoint-->, 15.6<!--cap:stack-movimientos--> |
| `encargos/` | Un fichero por encargo | 4<!--cap:ciclo--> |
| `activos/` | Lo usado tres veces, con destino | 4.8<!--cap:cerrar-tanda--> |

**00_VALOR.md**
```
Este trabajo produce valor cuando ___ puede tomar mejor la decisión de ___.
Fecha: ...
Columna: [A/B/C] desde [fecha]
```

**01_ROLES.md**
```
## Asesor
Propone: ...
NO decide: nada de lo anterior. Firmo yo.

## Ejecutor
Decide: nada. Ejecuta encargos cerrados.

## Checkpoint
Mira si hay que parar. No para.
Cita: [día] a las [hora]
```

**02_LINEAS_ROJAS.md**
```
## 1 · Qué no afirmaré nunca sin evidencia
...
Fecha: ... · Firma: ...
```

**07_CIERRE.md**
```
## [fecha]
Decidí: ...
Por qué: ...
Descarté: ...
Abierto: ...
Mañana empiezo por: ...
Coste del día: ...
[REVISAR MAÑANA: ...]  (solo si hubo decisión estructural tarde)

## Checkpoint · [fecha]   (una vez por semana)
1. Decisión que ha mejorado: ...
2. Lo que hacemos por inercia: ...
3. Contacto con el mundo real: ... (N conversaciones)
4. Columna: sigue en [A/B/C]
Cambiado por lo que me dijeron: N · Suposiciones comprobadas: N
Veredicto: seguimos / cambiamos / paramos — porque ...
```

**08_DECISIONES.md**
```
| fecha | decisión (aceptar/iterar/revertir/aparcar) | por qué | alternativa descartada | quién lo propuso | qué me haría cambiar de opinión |
```

**06_CATALOGO.md**
```
| nombre (MAYUSCULAS-CON-GUIONES) | qué pasó | de cuál de las tres (control/encargo/memoria) | dónde se arregló | [C: modelo · versión · fecha] |
```

**03_HIPOTESIS.md**
```
| fecha | hipótesis | qué evidencia la confirmaría | origen (yo/asesor/ejecutor/fuera) | estado |
```

**04_TAREAS.md**
```
| fecha | tarea | evidencia que la justifica (obligatoria) | estado |
```

**05_VISTO_NO_TOCADO.md**
```
| fecha | encargo | qué se vio | decidido: hipótesis / borrar |
```

**09_STACK.md**
```
| fecha | entra | sale | rol que ocupa | motivo | coste/mes |
```

**activos/[nombre].md**
```
Origen: ...
Evidencia de que funciona: ...
Usado N veces (mínimo 3)
Quién lo usa y cuándo: ...   ← sin esto no es un activo
Condición de revisión: ...
Próxima acción: ...
```

## Anexo E · Fichero de instrucciones del ejecutor (columna B y C)

Para la raíz del repositorio, en el formato que lea tu agente de código.

<!-- BLOQUE: ejecutor-instrucciones -->
## ROL: ejecutor

No decides nada. Ejecutas encargos cerrados.

## PREFLIGHT

Toda cifra que cite un encargo es una afirmación a recomputar. Si no coincide con el material real, sigue con la tuya y dilo antes de ejecutar.

Si algo de un encargo contradice lo que ves en el material real, **gana el material**. Dilo antes de ejecutar. Que encuentres el fallo de un encargo es el comportamiento esperado: no obedezcas por deferencia.

## ANTES DE CAMBIAR NADA

Leer primero: qué hay, quién consume lo que se va a tocar, qué se rompería. Solo después, cambiar. El cambio es el mínimo que cumple el alcance.

## SI ALGO NO ESTÁ ESCRITO

Para y pregunta. No elijas. Un cambio no pedido es un cambio no verificado.

## NO ABRIR FRENTES NUEVOS

Lo que aparezca fuera del alcance va a `metodo/05_VISTO_NO_TOCADO.md`, **una línea**. No se arregla de paso, por evidente que parezca el arreglo.

## GATES

Cuando el encargo traiga gates, cada uno tiene tres estados: **cumple · incumple · no clasificado**. El tercero también detiene: no lo conviertas en «cumple» porque el caso no estaba contemplado. Si no sabes clasificar algo, eso es exactamente «no clasificado», y es información.

## ENTREGA

**Veredicto:** una palabra de la lista cerrada del encargo. No prosa.

**Y siempre, al final, sin opción a «ninguno»:**

```
MODO_DE_FALLO_NO_PREVISTO
  Cómo puede esto estar mal de una forma que el encargo no anticipa.
  Si no encuentras ninguna, di qué buscaste para descartarlo.
```

Este bloque es el más valioso de la entrega. Es el que alimenta `metodo/06_CATALOGO.md`.

## DÓNDE VIVE EL ESTADO

`metodo/07_CIERRE.md` es el estado del proyecto: qué se decidió ayer y por dónde se empieza hoy. Léelo antes de arrancar una sesión larga.

`metodo/00_VALOR.md` dice para quién es esto y en qué fase está. En columna A no hay gates de resultado y eso no es un olvido.
<!-- /BLOQUE: ejecutor-instrucciones -->

## Anexo F · Glosario

<!-- BLOQUE: glosario -->
**Columna** — la fase del proyecto: A (no sé qué construyo), B (sé qué y pruebo), C (lo usa alguien). Decide qué controles y qué stack tocan.
**Tanda** — unidad de trabajo: de una decisión que hay que poder tomar a una entrega observable. Medio día a dos días.
**Rol** — dominio explícito con lo que NO decide escrito al lado.
**Encargo** — petición que dice qué se hace, qué no se toca, cómo se comprueba y cuándo se para.
**Gate** — control sobre el resultado con tres respuestas: cumple, incumple, no clasificado. Solo desde la columna B.
**Control sobre la decisión** — ¿quién decide? ¿está escrito? ¿con fecha? ¿puedo cambiarlo? Se instala en todas las columnas.
**Veredicto** — resultado elegido de una lista cerrada fijada antes de ejecutar.
**Checkpoint** — cita fija para preguntar si seguimos resolviendo el problema correcto.
**STOP** — condición de parada escrita antes de empezar. Un plazo no es un STOP.
**Artefacto real** — lo que observa el destinatario final. Lo contrario de un sustituto.
**Activo** — output con origen, evidencia, estado, dónde vive, próxima acción y destino.
**Gate de realidad externa** — cada tanda declara qué contacto con el mundo produce. Dos «ninguno» seguidos obligan a que la siguiente sea de contacto.
**Stack** — lo que abres, qué rol ocupa cada cosa, qué dato pasa de una a otra y dónde queda guardado el resultado.
<!-- /BLOQUE: glosario -->

---

*Procedimiento derivado de un solo caso. Si lo sigues y un paso no funciona, ese paso es lo que más me interesa saber. — @qtorb*
