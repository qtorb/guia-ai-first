# Stack · libro de movimientos

> Qué entra, qué sale, qué rol ocupa y qué cuesta. **Nada entra en el stack sin fila.**
> Manual: capítulo 15<!--cap:stack-->.

Una herramienta es lo que abres. Un stack es lo que abres, qué rol ocupa cada cosa, qué dato pasa de una a otra y dónde queda guardado el resultado. La prueba de si tienes stack o solo herramientas: **¿dónde vive lo que produjiste el martes pasado?** Si la respuesta es «en una conversación, en algún sitio», no hay stack.

**Regla de adopción:** nada entra por una demo. Entra después de un trabajo real con consecuencias reales.

**Lo que dice esta tabla con el tiempo:** cuántos movimientos son salidas. Un stack se construye tanto quitando como poniendo, y quitar es lo que casi nadie cuenta. Si pasan tres meses sin filas nuevas, o el stack está estable o has dejado de escribirlo.

---

## Movimientos

| Fecha | Entra | Sale | Rol que ocupa | Motivo | Coste/mes |
|---|---|---|---|---|---|
| | | | | | |

<!-- EJEMPLO
| 14/09 | [producto] | — | Asesor | Día cero, columna A | 20 € |
| 14/09 | [producto] | — | Ejecutor conversacional | Día cero, columna A | incluido |
| 02/10 | [agente de código] | — | Ejecutor con repositorio | Primer encargo que toca más de un fichero | 100 € |
| 02/10 | — | [ejecutor conversacional] | — | Lo sustituye el agente de código | — |
-->

---

## El stack hoy

### Capas de IA — las que rotan

| Rol | Herramienta | Desde | Qué lo haría cambiar |
|---|---|---|---|
| Asesor | | | |
| Ejecutor | | | |
| Especialista técnico *(B+)* | | | |
| Revisión independiente *(B+)* | | | |
| En evaluación | | | No adoptado hasta un trabajo real con consecuencias |

### Capas que no son IA — las que sostienen

| Capa | Herramienta | Desde | Para qué |
|---|---|---|---|
| Repositorio y versionado *(B+)* | | | El historial real |
| Infraestructura *(B+)* | | | Que lo construido esté corriendo, no solo en local |
| Datos *(B+)* | | | Donde vive lo que el producto guarda |
| Copias fuera *(C)* | | | Lo que no puedes perder no vive en una sola máquina |
| Almacén del método | este repositorio | | Encargos, decisiones, catálogo |

> Al rediseñar un stack se cambia lo que se mueve, no lo que sostiene.

---

## Coste

**Presupuesto mensual:** ________ · **Umbral de alarma:** ________

Tres sitios donde se mira, ya montados por el resto del método: el coste de cada tanda (manual 4.8<!--cap:cerrar-tanda-->) · la línea del cierre del día (4) · la división coste entre decisiones que mejoraron, en la revisión (10).

Si no puedes contar las decisiones, ese es el dato.

**Y la alarma:** cuando el gasto sube sin que ninguna decisión mejore, no es un problema de presupuesto — es el aviso de que se está explorando sin criterio de parada (13).

---

## Los cinco criterios de selección

Cuando los nombres de productos de arriba hayan caducado, esto seguirá sirviendo:

<!-- BLOQUE: stack-criterios -->
1. **¿Me deja ver el trabajo o solo el resultado?** Lo que no se puede auditar no se puede firmar.
2. **¿Puedo llevarme lo que produzco?** Si tus encargos y plantillas solo existen dentro de un producto, el producto es tu método.
3. **¿Falla de forma visible o silenciosa?** Prefiere lo que rompe con estruendo a lo que degrada sin avisar.
4. **¿Dónde acaban mis datos y los de mi cliente?** No como cláusula legal: como decisión de trabajo. Determina qué puedes pegar y, por tanto, para qué te sirve.
5. **¿Me dice cuándo no debería fiarme de él?** Un revisor que sabe cuándo no puede revisar vale más que uno que siempre contesta.

**Regla de adopción:** nada entra por una demo. Entra después de un trabajo real con consecuencias reales.
<!-- /BLOQUE: stack-criterios -->