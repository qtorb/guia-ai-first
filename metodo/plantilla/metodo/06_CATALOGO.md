# Catálogo de fallos

> Un fallo sin nombre se repite, porque cada vez parece nuevo. El nombre no es decoración: es el índice.
> Manual: capítulo 11<!--cap:fallo-->.

**Nombres feos, en mayúsculas y con guiones.** Son los que se recuerdan.

**La columna «dónde se arregló» es la que importa.** Un fallo arreglado donde se observó, y no donde se produce, no está arreglado: está escondido, y vuelve por otro sitio. Antes de cerrar cada entrada: *si esto mismo apareciera en otro sitio, ¿lo pararía algo?*

**Cómo se alimenta sin esperar a un desastre:** el bloque `MODO_DE_FALLO_NO_PREVISTO` que cierra cada encargo. Cuando la respuesta sea buena, ponle nombre y métela aquí.

---

| Nombre | Qué pasó | De cuál de las tres | Dónde se arregló | Condiciones |
|---|---|---|---|---|
| | | | | |

*De cuál de las tres: **control** (decidió mal con todo delante) · **encargo** (decidió bien lo que no era) · **memoria** (perdió el contexto y siguió). Condiciones, solo en columna C: modelo · versión · fecha.*

<!-- EJEMPLO
| LA-FRASE-QUE-CUMPLE-Y-LA-LETRA-PEQUENA-QUE-DESMIENTE | El gate daba por buena una promesa que la letra pequeña del mismo plan contradecía | control | En la formulación del gate, no en la página | — |
-->

---

## Los síntomas, si no sabes qué nombre ponerle

<!-- BLOQUE: sintomas-catalogo -->
**«Todo está en verde y algo va mal»** — el instrumento mide mal la medida, o ningún control mira la dimensión que falla.

**«El sistema dice que no hay nada»** — un mecanismo que no ejecuta su función contesta «no hay», y suena igual que un no de verdad. O se aceptó un «no aparece» sin demostrar, en la misma corrida, que el instrumento encuentra un caso conocido.

**«La cifra no cuadra con lo que pasa de verdad»** — el denominador es del instrumento y no del mundo; o el titular es más ancho que la prueba; o la medida es cierta y la atribución falsa.

**«Me han dado un consejo y no sé si fiarme»** — una señal saltó a recomendación sin pasar por comprobación; o una cautela del asesor entró como si fuera una decisión.

**«Lo arreglé y ha vuelto»** — se arregló donde se observó, no donde se produce.

**«Avanzo mucho y no llego a ninguna parte»** — avance interno contado como avance real.
<!-- /BLOQUE: sintomas-catalogo -->
