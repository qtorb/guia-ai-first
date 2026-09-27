# Encargo — [fecha] — [tema]

<!--
Copia este fichero con el nombre AAAA-MM-DD_tema.md y rellénalo.
Un encargo se ejecuta literalmente, incluido lo que diga por accidente.
Manual: capítulo 4.3<!--cap:escribir-encargo-->. Versión corta: _PLANTILLA_CORTA.md
Borra los comentarios como este antes de enviarlo.
-->

**Columna:** [A/B/C]

---

## Apertura de la tanda

**Decisión que tiene que poder tomarse al final:**
<!-- Qué decisión concreta. No «avanzar» ni «mejorar». -->

**Sabemos:**
<!-- Qué hay medido o comprobado. -->

**Suponemos:**
<!-- Qué damos por cierto sin haberlo comprobado. -->

**Contacto externo que produce esta tanda:**
<!-- Conversación, envío, publicación o cobro. Si es «ninguno» y la tanda
anterior también, esta tanda es de contacto y no de construcción. -->

---

## Lectura previa
<!-- Manual 3.2. Media página antes de escribir el resto.
Qué hay · quién lo consume · qué compromisos hay firmados · qué se rompería ·
una medida del estado actual · qué tendría que ser cierto para que el cambio no hiciera falta. -->

---

```
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
  1.
  2.

PROHIBIDO
  1.
  2.
  Si cerrar el alcance exigiera salirse de aquí: STOP FUERA_DE_ALCANCE.

GATES
  [Columna A: escribe exactamente esta línea y nada más:
   "sin gates de resultado: columna A"]

  G-NOMBRE-1 — qué condición verifica — caso concreto que debe rechazar
  G-NOMBRE-2 — qué condición verifica — caso concreto que debe rechazar
<!-- BLOQUE: gate-tres-estados -->
Todo control tiene tres respuestas, no dos: **pasa · no pasa · no lo sé**.

La tercera también frena el trabajo, y es la que casi nadie pone. Un control que solo sabe decir sí o no acaba metiendo en el «sí» todo lo que no entiende, porque no tiene otro sitio donde ponerlo. Y entonces parece que funciona, cuando lo que hace es dejar pasar justo lo raro.
<!-- /BLOQUE: gate-tres-estados -->

CRITERIO DE ACEPTACIÓN — sobre el artefacto real
<!-- BLOQUE: criterio-aceptacion -->
No se acepta: [lo que sueles mirar porque es más cómodo — el borrador, la maqueta, la hoja de cálculo]
Se acepta: [lo que va a ver de verdad la persona a la que esto va dirigido]
<!-- /BLOQUE: criterio-aceptacion -->

VEREDICTOS — elige uno al entregar; no prosa
  NOMBRE_1   qué significa
  NOMBRE_2   qué significa
  NOMBRE_3   qué significa

STOP
  Total si:
  Parcial si:            (se entrega el resto y se declara qué cayó)
  Condiciones:           [de las cinco, las que apliquen, con número]

NO ABRIR FRENTES NUEVOS
  Lo que aparezca y no esté previsto va a metodo/05_VISTO_NO_TOCADO.md,
  en una línea. No se arregla de paso.

ENTREGA
  Qué y dónde.
  [Columna C: modelo · versión · fecha]

  Termina obligatoriamente, sin opción a "ninguno", con:
  MODO_DE_FALLO_NO_PREVISTO — cómo puede esto estar mal de una forma
  que este encargo no anticipa. Si no encuentras ninguna, di qué
  buscaste para descartarlo.
```

---

## Al recibir la entrega
<!-- Manual 3.5. En este orden. -->

<!-- BLOQUE: recibir-entrega -->
1. **Lee primero el `MODO_DE_FALLO_NO_PREVISTO`.** Es el bloque más valioso de la entrega y el último; por eso se lee primero. Si dice «ninguno», la entrega no es válida: se devuelve pidiendo qué buscó para descartarlo.
2. **Lee el veredicto.** Tiene que ser una palabra de la lista cerrada. Si es prosa, se devuelve.
3. **Comprueba las cifras recomputadas** contra las que tú escribiste. Si difieren, las suyas son las buenas hasta que demuestres lo contrario.
4. **Aplica el criterio de aceptación sobre el artefacto real.** No sobre lo que el ejecutor dice que hizo. Si no puedes observarlo tú, alguien tiene que hacerlo y no puede ser el ejecutor.
5. **Pasa cada gate** y anota su estado. *(Solo desde la columna B.)*
6. **Mira lo visto y no tocado.** Lo que haya entrado no se arregla ahora.
<!-- /BLOQUE: recibir-entrega -->

**Estado de los gates:**

| Gate | Estado | Qué pasa ahora |
|---|---|---|
| | | |

*cumple → sigue · incumple → iterar o STOP · no clasificado → **detiene todo**: el gate no distingue este caso, se reformula y se vuelve a pasar.*

**Decisión** (va a `08_DECISIONES.md`): aceptar · iterar · revertir · aparcar

**Coste de la tanda:** ________ · **Decisión que mejoró:** ________

---

## Las cinco condiciones de STOP
<!-- Para copiar arriba las que apliquen. Manual 12.2. -->

<!-- BLOQUE: stop-condiciones -->
1. Tras N iteraciones no mejora.
2. Una prueba refuta el supuesto principal.
3. La complejidad supera el valor.
4. Exige cambiar algo fuera del alcance.
5. Aparece una dependencia no resuelta.
<!-- /BLOQUE: stop-condiciones -->

*Un plazo no es una condición de parada: dice cuándo miras, no qué miras.*
