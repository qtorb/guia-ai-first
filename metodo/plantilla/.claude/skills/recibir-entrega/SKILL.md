---
name: recibir-entrega
description: Revisa una entrega de un agente ejecutor siguiendo los seis pasos del método AI-First, en orden, y registra la decisión. Úsala cuando te hayan entregado algo y tengas que decidir si lo aceptas.
---

# Recibir una entrega

Seis pasos y van en este orden. El orden no es capricho: el bloque más valioso de una entrega es el último que se escribe, así que es el primero que se lee.

Antes de empezar, lee la columna en `metodo/00_VALOR.md` y el encargo correspondiente en `metodo/encargos/`. Sin el encargo delante no se puede aceptar nada: el criterio de aceptación está ahí.

## Los seis pasos

**1 · El modo de fallo no previsto, primero.** Búscalo al final de la entrega. Si dice «ninguno» o no está, la entrega no es válida: se devuelve pidiendo qué buscó para descartarlo. Si es bueno, apúntalo — va al catálogo en el paso final.

**2 · El veredicto.** Tiene que ser una de las palabras de la lista cerrada del encargo. Si viene un párrafo de conclusiones en vez de una palabra, se devuelve: la prosa admite varias lecturas y quien la lee elige la que confirma lo que ya pensaba.

**3 · Las cifras recomputadas.** Compara las que trae el ejecutor con las que decía el encargo. Si difieren, **las suyas son las buenas** hasta que se demuestre lo contrario: él estaba mirando el material y quien escribió el encargo no. Si la diferencia venía de un dato mal transcrito, eso es una entrada de catálogo.

**4 · El criterio de aceptación, sobre el artefacto real.** No sobre lo que el ejecutor dice que hizo. Si el criterio dice «la página cargada en un móvil», hay que abrirla. Si no puedes observarlo tú, alguien tiene que hacerlo, y no puede ser quien lo construyó. Si nadie puede observarlo ahora, dilo y no lo des por aceptado.

**5 · Los gates, uno por uno.** Solo desde la columna B; en la A este paso no existe y el criterio de aceptación hace su papel. Anota el estado de cada uno:

- *cumple* → sigue.
- *incumple* → o se itera corrigiendo **el encargo** (no el resultado a mano), o se para según el STOP escrito. Cuenta las iteraciones: al llegar al número del STOP se para, aunque parezca que la siguiente lo arregla. Siempre lo parece.
- *no clasificado* → **detiene todo**. No es un «casi cumple»: significa que el gate no distingue este caso, así que está mal formulado o el encargo trajo algo que no contemplaba. Se reformula el gate y se vuelve a pasar. Si tres gates seguidos dan «no clasificado», la tanda está mal abierta.

Si un gate lleva mucho tiempo dando siempre «cumple», dilo: un control que nunca ha reventado puede estar bien o estar roto, y desde fuera se ven igual.

**6 · Lo visto y no tocado.** Mira `metodo/05_VISTO_NO_TOCADO.md`. Lo que haya entrado durante el encargo no se arregla ahora: se decide en el paso siguiente si pasa a hipótesis o se borra.

## Cerrar

Escribe la decisión en `metodo/08_DECISIONES.md` con una de las cuatro palabras —aceptar, iterar, revertir, aparcar— y con lo que pide el fichero, incluida la columna **quién lo propuso**. Esa columna parece burocracia y es la única que dentro de tres meses permite ver de quién salieron las restricciones del proyecto.

Si el modo de fallo del paso 1 era bueno, ponle nombre en mayúsculas con guiones y añádelo a `metodo/06_CATALOGO.md`, con la columna de dónde se arregla: en el mecanismo, no donde se observó.

Y si el contacto externo que declaraba el encargo no se ha producido, dilo. Se arrastra a la siguiente tanda y cuenta como el primer «ninguno».
