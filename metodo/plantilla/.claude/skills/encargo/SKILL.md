---
name: encargo
description: Escribe un encargo del método AI-First para pasárselo a un agente ejecutor. Úsala cuando vayas a pedirle a una IA que construya, cambie o produzca algo dentro de un proyecto que sigue este método. Lee la columna del proyecto y adapta lo que exige.
---

# Escribir un encargo

Un encargo no es un prompt. Un prompt pide; un encargo además dice qué no se toca, cómo se comprobará que está bien y cuándo hay que parar. Esa diferencia es la que se puede auditar después.

Y un encargo **se ejecuta literalmente**, incluido lo que diga por accidente. Por eso se escribe entero antes de enviarlo.

## Antes de escribir nada

Lee `metodo/00_VALOR.md` para saber dos cosas: la frase de valor y **la columna** (A, B o C). Si el fichero no existe o la columna está vacía, dilo y pide que se rellene antes de seguir; no supongas una columna.

La columna cambia lo que exige este encargo:

- **A** — el bloque GATES va vacío, con la línea literal `sin gates de resultado: columna A`. No es un olvido: montar controles sobre el resultado cuando todavía no se sabe qué es un buen resultado congela una suposición.
- **B y C** — cada gate lleva nombre, la condición que verifica y **el caso concreto que debe rechazar**.
- **C** — el bloque ENTREGA pide además modelo, versión y fecha.

## Lo que preguntas, en este orden

Pregunta de una en una, no todas a la vez. Si la respuesta a la primera es vaga, insiste antes de seguir: todo lo demás depende de ella.

1. **¿Qué decisión concreta tiene que poder tomarse mejor al terminar esto?** No vale «avanzar», «mejorar» ni «tenerlo listo». Si no hay decisión, la tanda está mal abierta.
2. **¿Qué sabes ya, medido o comprobado?** Y por separado: **¿qué estás suponiendo?**
3. **¿Qué contacto con el exterior produce esta tanda** —una conversación, un envío, una publicación, un cobro—? Si es «ninguno», pregunta por la tanda anterior: si también fue «ninguno», dilo claramente, porque entonces esta tanda debería ser de contacto y no de construcción.
4. **La lectura previa.** Antes de escribir el encargo hace falta saber qué hay ahora, quién consume lo que se va a tocar, qué se rompería y una medida del estado actual. Si no la tiene, ofrécete a hacerla tú leyendo el material; si no hay material accesible, dilo y no escribas el encargo todavía.
5. **Qué no se puede tocar.** Insiste aquí: es el bloque que más se olvida y el que más caro sale.
6. **Cuál es el sustituto que se suele mirar** (el borrador, la maqueta, el test en local) **y qué va a ver de verdad el destinatario**. Nombrar el sustituto es lo que impide caer en él.
7. **Qué haría parar esto.** De las cinco condiciones: N iteraciones sin mejorar, una prueba que refuta el supuesto principal, la complejidad supera el valor, exige salirse del alcance, aparece una dependencia no resuelta. Una fecha no vale como condición de parada.

## Qué escribes

Rellena la plantilla de `metodo/encargos/_PLANTILLA.md` y guarda el resultado en `metodo/encargos/AAAA-MM-DD_tema.md`. Si esa plantilla existe en el proyecto, úsala tal cual: es la fuente, y puede haber cambiado.

Tres bloques van **literales**, sin parafrasear ni acortar: PREFLIGHT, el criterio de aceptación con sus dos líneas, y la última línea de ENTREGA.

## No termines si falta algo

No entregues un encargo sin STOP, sin criterio de aceptación observable sobre lo real, o sin la línea final de modo de fallo no previsto. Si el usuario quiere saltárselos, dilo en una frase y espera: la versión corta del Anexo B sigue siendo un encargo y sigue llevando las cuatro cosas.

No rellenes tú los huecos que solo puede decidir quien encarga: para qué es, qué no se toca, qué haría parar. Si falta uno, pregúntalo. Ese es exactamente el hueco que un agente rellena con lo más plausible y que después cuesta una semana.
