# Guía AI-First · registro de versiones

**Qué es esto:** el único sitio donde se mira qué versión es la buena. Si un fichero no aparece aquí, no cuenta.
**Última actualización:** 22 de septiembre de 2026.

> **Este fichero vive en el repositorio, y el repositorio es su sitio canónico.**
> Estuvo un tiempo en el proyecto de Claude. Se movió aquí el 22 de septiembre
> por la misma razón que dice su primera línea: un registro que no está donde
> está el código acaba describiendo una versión que ya no existe — que es
> exactamente lo que pasó entre el 13 y el 22 de septiembre.

---

## La regla de numeración

Tres reglas, y la tercera es la que evita el lío que teníamos:

1. **Un solo número de versión, y vive en la guía madre.** `Guia_AI-First_vX.Y.md`, en el proyecto. Todo lo demás deriva de ahí.

2. **Los derivados no tienen versión propia: heredan la de la guía.** El manual, la web, el deck y las hojas de sesión declaran **de qué versión de la guía salen**, no un número inventado. Un manual «v1.0» construido sobre una guía v2.0 es exactamente cómo se pierde el hilo.

3. **El nombre del fichero lleva versión y fecha.** `Guia_AI-First_v2.2_2026-08-24.html`. Nunca `offline 3.html`: ese «3» es del navegador al descargar, no una versión.

**Y una cuarta, operativa:** cuando haya dos ramas del mismo contenido —pasó y volverá a pasar—, no se numeran como si fueran consecutivas. Se marcan como ramas, se fusionan, y solo el resultado recibe número nuevo.

*Cómo se aplica esto a las iteraciones de un deck: ver la entrada del 12 de septiembre, al final.*

---

## Estado a 24 de agosto de 2026

### Viva

| Versión | Fichero | Dónde | Qué tiene |
|---|---|---|---|
| **v2.2** | `claude/Guia_AI-First_v2.2.md` | Proyecto | **La única versión viva.** Parte 2 narrada + todo lo de la v2.1 |

**Cifras de la v2.2, recomputadas:** 21.136 palabras · 18 partes · 5 anexos · 85 apartados · **18** entradas en el catálogo · **19** decisiones en el expediente (§2.13) · Regla 3 al **44 %** · 22 referencias cruzadas, **cero rotas**.

### Archivadas · no se editan

| Versión | Fichero | Por qué se archiva |
|---|---|---|
| v2.1 | `claude/Guia_AI-First_v2.1.md` | Rama de trabajo. Le faltaba la Parte 2 narrada. **Absorbida en la v2.2** |
| v2.0-web | `Guia_AIFirst_offline 3.html` · `guia-ai-first.zip` | Rama web. Tenía la Parte 2 narrada y le faltaba todo agosto. **Absorbida en la v2.2** |
| v2.0 | `claude/Guia_AI-First_v2_reescritura.md` | Origen común de las dos ramas |

---

## La bifurcación, para que no vuelva a pasar

Entre el 14 y el 23 de agosto hubo **dos ramas del mismo documento con el mismo nombre**, y ninguna era superconjunto de la otra:

- La **rama web** (`offline 3.html`) tenía la Parte 2 narrada: catorce apartados fechados, ~2.800 palabras, de «quién escribe esto» al dilema del 10 de agosto.
- La **rama de trabajo** (v2.1, en el proyecto) tenía §4.7 sobre el sesgo del asesor, los tres episodios de agosto, Watchtower, el catálogo de dieciocho y el Anexo E — y la Parte 2 reducida a tabla.

**Causa:** el entorno de trabajo se recicló entre dos sesiones y se llevó los ficheros locales. Lo que estaba en el proyecto sobrevivió; lo que solo estaba en la máquina, no. Está contado en §11.2 de la propia guía — *no se perdió nada importante, y eso fue suerte, no diseño* — y resultó ser optimista: sí se había perdido la Parte 2 narrada, y solo apareció cuando Albert volvió a subir el HTML el 24 de agosto.

**Es EL-DESCARTE-SILENCIOSO aplicado a la propia guía:** algo se cayó sin que ninguna cifra lo reflejara, y durante nueve días las dos ramas se llamaron igual.

---

## Derivados · qué versión declara cada uno

| Derivado | Fichero | Declara | Estado |
|---|---|---|---|
| Manual de trabajo | `Guia_AIFirst_manual.pptx` | *manual · sobre guía v2.2* | **En revisión** — ver más abajo |
| Web / offline | `guia-ai-first.zip` · `Guia_AIFirst_offline.html` | v2.0-web | **Sustituida.** Ver la entrada del 15-22 de septiembre |
| Deck de clase IA-Lab 1 | `IALab1_v09_2026-09-13.pptx` | v2.3 borrador | **Vivo** — 37 láminas |
| Hojas de sesión | `hojas/mmdd31/N.json` | — | La 0, la 1 y la plantilla de encargo hechas; 2-6 pendientes de pactar con cada docente |

### Manual PPTX · estado de la revisión en curso

Hecho:
- Pie de página a v1.1 y portada/cierre a *versión 1.1*
- Índice: «Doce fallos» → **Dieciocho**; «Diecisiete decisiones» → **Diecinueve**; paginación corregida
- Portada de la parte 4 y título de 4.1 actualizados
- Catálogo partido en **dos diapositivas** (9 + 9) para que quepan las dieciocho entradas, cada una con su traducción a marketing
- Parte 5 anunciada como **seis** reglas transversales

Pendiente:
- Diapositivas nuevas de **§4.7** (el sesgo del asesor): los dos tiempos, las dos reglas, el ejercicio yo·cliente·ley·modelo
- **§12.6/§12.7**: la tabla de qué puede y qué no puede decirte un revisor, y el caso de los cinco revisores con sus cifras
- **Watchtower** en la entropía del instrumento y en los gates
- Octava confusión catalogada (**cautela ≠ criterio**) en 5.2
- La razón nueva de **§13.4** (el único gate que un asesor no puede sesgar)
- Realinear las decisiones del stack (7.2/7.3) con las **diecinueve** de §2.13
- Sustituir «v1.1» por **«sobre guía v2.2»** en pie, portada y cierre, según la regla 2

---

## Lo que queda por hacer, en orden

1. **Terminar el manual** con la lista de arriba.
2. ~~**Regenerar la web** desde la v2.2~~ — hecho y superado: la web se reconstruyó entera en React entre el 15 y el 22 de septiembre. Ver esa entrada.
3. ~~**Regenerar el offline**~~ — el modelo de fichero único se abandonó con la migración.
4. **Borrar o marcar como archivados** los ficheros de las dos ramas, para que nadie los abra por error.

---

## 31 de agosto de 2026 · se elimina el §13.3

A petición del cliente se ha eliminado el apartado **§13.3 · El caso que sí tiene barro externo** —el caso de la consultora B2B— de las tres versiones `.md` (v2.2, v2.1 y v2.0-reescritura) y de la web.

En los `.md` se ha renumerado en consecuencia: el antiguo **13.4 · El gate de realidad externa** pasa a ser **13.3**, y el antiguo **13.5 · Por qué este gate es distinto de todos los demás** pasa a ser **13.4**. En el HTML **no** se ha renumerado, deliberadamente, para no romper las anclas.

Consecuencia para los derivados, según la regla 2: el **manual PPTX** y el **deck** heredan una Parte 13 con **un apartado menos**. Al revisarlos hay que quitar el caso y ajustar la numeración.

---

## 2 de septiembre de 2026 · «asiento» pasa a «rol», y «El lunes» a «Qué haces con esto»

Se abre `claude/Guia_AI-First_v2.3_borrador.md` como borrador de trabajo. **La v2.2 sigue siendo la última versión cerrada**: mientras el borrador esté abierto, es la v2.2 la que se cita.

El cambio es terminológico y pedagógico, no de contenido. **«Asiento» pasa a «rol»** —42 sitios, con siete frases reescritas porque vivían de la imagen del asiento vacío y con «rol» a secas quedaban cojas—. Y la etiqueta **«El lunes.» pasa a «Qué haces con esto.»** en las 66 etiquetas del texto. Un alumno de máster entiende «rol» sin explicación previa; «asiento» había que explicarlo cada vez.

Consecuencia para los derivados, según la regla 2: el **manual PPTX**, el **deck de clase** y la **web** heredan el cambio y hay que regenerarlos. En la web, además, el filtro de lectura «Solo el lunes» cambia de nombre.

---

## 12 de septiembre de 2026 · cómo se nombran las iteraciones de un deck

**El problema, con nombre.** Los ficheros `IALab_1_DECKCLASE_v4`, `v4_rol` y `v5` se saltan la regla 2: llevan número propio inventado. Y la v5 agravó el lío, porque subió de número por **un solo cambio de cifra** —«doce errores» a «dieciocho», diapositiva 48—, mientras que la v4_rol solo cambiaba dos diapositivas por el paso de «asiento» a «rol». Resultado: tres ficheros que parecen tres versiones y son el mismo deck del 2 de septiembre con dos retoques. No se podía contestar «¿cuál es la última?» sin abrirlos y compararlos.

**La regla, que reconcilia la regla 2 con la necesidad de numerar iteraciones.**

Un derivado sigue sin tener versión propia: **la versión es la de la guía de la que sale, y se declara dentro del fichero** —pie, portada y cierre—, igual que ya se prescribe para el manual. Lo que el nombre lleva es la **iteración**, que no es una versión: es qué pasada de trabajo es esta.

> **`<pieza>_v<NN>_<AAAA-MM-DD>.pptx`**
>
> `IALab1_v06_2026-09-12.pptx`, con el pie declarando *sobre guía v2.3*.

Cuatro precisiones que hacen que funcione:

1. **Número de dos cifras.** `v06`, no `v6`: si no, la v10 se ordena antes que la v9.
2. **Fecha en ISO, año-mes-día**, para que el orden alfabético sea el cronológico. `12-09-2026` no lo es.
3. **El número sube solo cuando cambia el contenido.** Una errata o una cifra corregida no es una iteración: mismo número, fecha nueva. Dos `v06` con fechas distintas son la misma pasada corregida. Es justo lo que no se respetó con la v5.
4. **No se renumera lo viejo.** Se continúa desde donde está —la próxima es la `v06`— para que nunca haya dos ficheros con el mismo nombre y distinto contenido.

**Nombres de pieza, para que no proliferen:** `IALab1`…`IALab6`, `Adaptacio`, `Manual`, `Hoja1`…`Hoja6`.

**Y el arreglo de fondo, que no es de nomenclatura.** Lo que hoy impidió saber cuál era la última no fue el nombre: fue que había ficheros en dos sitios y solo uno era visible desde aquí. **Un único lugar canónico, y que sea Drive**, que se ve desde la máquina de Albert y desde el entorno de trabajo. Si un deck no está ahí, no cuenta — exactamente lo que este registro ya dice de sí mismo en su primera línea.

### Estado real de los tres ficheros, comprobado abriéndolos

| Fichero | Fecha | Diapositivas | Qué lo separa del anterior |
|---|---|---|---|
| `IALab_1_DECKCLASE_v4.pptx` | 2 sep | 56 | El único que viene de Albert |
| `IALab_1_DECKCLASE_v4_rol.pptx` | 2 sep | 56 | Dos diapositivas: «asiento» → «rol» |
| `IALab_1_DECKCLASE_v5.pptx` | 9 sep | 56 | Una diapositiva: «doce errores» → «dieciocho» |

En Drive no hay ningún deck de IA-Lab: la única presentación con ese nombre es `Manual_metodo_IALab_MMDD31`, del 12 de agosto, que es el manual y no el deck de clase.

### Alcance de la revisión profunda del deck de IA-Lab 1

Contrastado abriendo el fichero, no los briefings. El deck está mejor de lo que decían los briefings —56 diapositivas, 73 imágenes, la poda y el rediseño ya hechos—, pero le falta todo lo decidido después del 2 de septiembre:

1. **Dice «Seis sesiones»** en las diapositivas 2 y 55. *(Corregido después: son seis. Ver la entrada del 12 de septiembre por la tarde.)*
2. **No están los dos ejes**, que son el marco que ordena el bloque. Dos o tres diapositivas.
3. **No está el segundo entregable del primer día**, el TFM en una página. No es una etiqueta: es un tramo nuevo con plantilla, y pide unos 15 minutos de tres horas que ya están llenas. **Algo tiene que ceder, y eso lo decide Albert.**
4. **No está el material que llega de «Adaptación»** —prompts, prevención de alucinaciones—. **Bloqueado:** depende de que antes se haga la poda de Adaptación.
5. **Catorce diapositivas pasan de 60 palabras.**
6. Sigue declarándose **v2.0, sin revisar** contra la guía. Hay que pasar cifras y afirmaciones una a una: es lo que falló con los «doce errores», y también arrastra el §13.3 eliminado el 31 de agosto.

**El punto 4 es el que manda en el calendario:** una revisión profunda hecha antes de la poda de Adaptación habrá que rehacerla en parte.

---

## IA-Lab 1 · el deck nuevo (12 de septiembre)

`IALab1_v06_2026-09-12.pptx` · 33 diapositivas · construido desde cero sobre `Guion_IALab1_v06.md`, no editando el v5.

**Por qué desde cero y no parcheando el v5.** Los seis puntos de arriba no son retoques: el bloque de los dos ejes, el tramo del TFM en una página y la poda de las catorce diapositivas largas tocan la estructura entera. Parchear habría dejado un deck de 56 diapositivas con dos lógicas dentro.

**Qué se ha aprovechado del v5:** las 21 imágenes que se usan aquí salen de sus 73. No se ha rehecho ninguna.

**Qué queda resuelto de la lista anterior:** el 1, el 2 (los dos ejes son un tramo propio), el 3 (el TFM en una página son 25 minutos, y lo que cede es la demo, que baja a 35), el 5 (ninguna diapositiva pasa de 60 palabras).

**Qué sigue abierto:** el 4, que depende de la poda de Adaptación, y el 6, que depende de si el deck se declara sobre la v2.3 borrador o esperamos a cerrarla — hoy el pie dice «sobre guía v2.3».

**Lo que el briefing de diseño pedía y no está:** las capturas reales de UXMachine. Se pedían como prueba material y nunca se hicieron. Ninguno de los 21 ficheros es una captura, así que el deck sostiene la afirmación «esto sale de construir un producto real» solo con la palabra.

---

## IA-Lab 1 · sobre la plantilla oficial UPF-BSM (12 de septiembre)

`IALab1_UPF_v07_2026-09-12.pptx` · 34 diapositivas.

**Dónde estaba la plantilla oficial.** Dentro del propio `Intro_MMDD-30 explicació_TFM_v3.pptx`. Ese fichero lleva tres patrones; el tercero es el institucional, con 22 maquetas en catalán —Portada, Portada vermella, Índex, Inici Capítol, Contingut de text, Contingut imatge, Contingut lliure, Taules, Professor, Webgrafia, Bibliografia, Contraportada— y el logo en todas.

**Tres datos que conviene tener escritos:**

1. **El rojo institucional es C8102E**, muestreado del logo. Es exactamente el que ya usaba el deck. No hubo que cambiar la paleta.
2. **La plantilla no es 16:9.** Mide 10,83 × 7,5 pulgadas (relación 1,44). El deck anterior era 13,3 × 7,5. En un proyector 16:9 la plantilla oficial deja franjas laterales — no es un error del deck, es la plantilla.
3. **La tipografía institucional es Plain Medium**, que es de pago. Si no está instalada, PowerPoint la sustituye y los titulares cambian de anchura. El cuerpo que se ha añadido va en Arial, que es la fuente declarada en el tema.

**Cómo se ha adaptado.** Las maquetas oficiales llevan el peso: portada roja, divisores en «Inici Capítol», fichas en «Contingut de text», contraportada de gracias. Las doce narrativas usan «Contingut lliure»: la banda blanca superior con el rótulo y el título en rojo se mantiene, y de ahí abajo la foto va a sangre con el logo en blanco. Así la diapositiva narrativa conserva su fuerza y sigue siendo institucional en todas.

**Lo que se conserva del deck anterior:** el guion v06 entero y las 21 imágenes.

**Descartada** el mismo día: demasiado rígida. Ver la entrada del v08.

---

## IA-Lab 1 · v08, sobre la plantilla del propio v4 (12 de septiembre)

`IALab1_v08_2026-09-12.pptx` · 33 diapositivas. **Descartada la ruta de la plantilla institucional del MMDD30** (v07): demasiado rígida.

**Qué es «la plantilla», exactamente.** El `IALab_1_DECKCLASE_v4.pptx` no tiene patrón ni maquetas: su único layout está vacío y cada diapositiva se dibuja entera. Así que la plantilla es un conjunto de convenciones, y son estas:

* 16:9 real, 13,33 × 7,5.
* Calibri en todo. Courier New solo para código.
* Paleta: C8102E rojo · 1F2430 y 16181D tinta · 5B6270 gris · D7DDE8 y E7EAF0 filetes.
* Logo UPF-BSM arriba a la derecha en 11,14 / 0,32 · 1,50 × 0,395, en las diapositivas que no son portada. Rojo sobre claro, blanco sobre oscuro — los dos ficheros están en el propio v4.
* Columna de contenido en x = 0,80, ancho 11,90.
* Lámina de contenido: rótulo 11 pt negrita roja en y = 0,42 · titular 34 pt en 0,75 · entradilla 16 pt en 1,66 · línea de cierre 15 pt abajo.
* Portada: caja de filete rojo 0,55 / 0,55 · 12,20 × 4,55, nombre y correo alineados a la derecha, mes en rojo abajo a la derecha, logo abajo a la izquierda.

**Frente al v4 se ha añadido** un número de página discreto abajo a la derecha, que el v4 no tenía.

**Ventaja frente a la ruta institucional:** sin limitaciones de maqueta, las láminas narrativas vuelven a ser foto a sangre de borde a borde, y el bloque «AHORA» es una pantalla roja entera. La plantilla del MMDD30 no permitía ninguna de las dos cosas sin romperla.

---

## IA-Lab 1 · v09, el rediseño de las fotos y la tipografía (12 de septiembre)

`IALab1_v09_2026-09-12.pptx` · 33 diapositivas.

**El defecto que se corrige.** Hasta la v08, las fotos se oscurecían entre un 45 y un 60 % para poder poner texto encima. Se usaban como textura. Abriéndolas todas juntas se ve que no lo son: la valla sola en medio del campo es el control que no controla nada; la rotativa abandonada escupiendo papel es la sobreproducción; el fichero de cajones es el catálogo de errores; el camino de tierra al lado del pavimentado es por dónde pasa la gente de verdad. Ninguna se veía.

**Las tres reglas nuevas**

1. **No se pone texto sobre una foto** salvo que la foto tenga hueco real. Por defecto se parte el marco: la foto ocupa media diapositiva o una banda superior, a plena fuerza y sin velo; el texto va sobre fondo sólido.
2. **A toda página solo cuando la foto es el argumento** — dos casos en el deck — y entonces muy pocas palabras, en el hueco que la foto ya tiene, con degradado solo ahí y un velo superior que le da suelo al logo.
3. **Escala tipográfica un nivel por encima**: titulares 42-52 · afirmaciones 38-46 · entradillas 23 · cuerpo de tarjeta 17 · filas 19 · listas 19-20 · cintas 22-24.

**El sistema que ordena todas las láminas:** una franja blanca de 0,95 pulgadas en la parte de arriba, con el logo siempre arriba a la derecha en rojo. Debajo, cada lámina hace lo que necesita. Las dos de foto a toda página son la excepción y llevan el logo en blanco sobre un velo superior.

**Cuatro variantes de lámina narrativa**, según lo que pida la foto: partición con foto a la derecha, partición con foto a la izquierda y texto sobre tinta, banda horizontal, y foto a toda página con degradado lateral.

**Consecuencia:** con la letra más grande cabe menos texto. Se ha recortado copia en unas doce láminas.

---

## El PPT de la propuesta para JMF y los co-docentes (12 de septiembre)

`IALab_proposta_JMF_2026-09-12.pptx` · 17 láminas · catalán · construido sobre el guión `claude/Guion_PPT_JMF_codocents.md`.

**Dos momentos, un solo fichero.** Momento 1: se lo lee JMF, solo, antes de hablarlo. Momento 2: con su feedback incorporado, va a los cuatro co-docentes para preparar la reunión de una hora. Solo cambia la última lámina.

**La regla que lo gobierna:** *explica cómo funciona una sesión; no imparte ninguna.* Fuera a propósito: los dos ejes, el protocolo de siete bloques, cualquier prompt, el catálogo de errores por dentro, y UXMachine como producto — aparece una sola vez, en una línea, como origen del método.

**El encargo a los co-docentes ocupa cuatro láminas seguidas** (9 a 12), no una nota al final, y va en tono de convite: el caso lo eliges tú y eso es lo que da autoridad a la sesión · cuatro preguntas para saber si el caso que tienen en la cabeza ya sirve · las tres cosas que se piden y, en un recuadro aparte, las que NO se piden · y el número que calcularán primero: tres horas de aula y una reunión de una hora.

**Sin fechas**, siguiendo el criterio ya fijado para el documento de JMF. El calendario va aparte. La lámina 16 propone la evaluación (nota aislada, peso limitado, sin tocar los Hitos) pero deja el peso abierto.

**Pendiente para el momento 2:** la fecha de la reunión, la lámina de cierre en versión co-docentes (tres cosas que traer preparadas) y, si se quiere, una lámina personalizada por co-docente con su sesión. Y la versión castellana, que se genera del mismo origen.

---

## Corrección: IA-Lab son SEIS sesiones (12 de septiembre, tarde)

Durante unos días el bloque se contó como siete, metiendo «Adaptación profesional a la IA» dentro. **No va dentro:** es la puerta y se cuenta aparte. IA-Lab son seis sesiones y dieciocho horas lectivas.

Esto tiene una consecuencia útil: **los cuatro documentos de sesión del 12 de agosto ya lo decían bien** («la segunda de seis», «la tercera de seis»…). No hay nada que renumerar en ellos.

**Corregido en `IALab_proposta_JMF_2026-09-12.pptx`,** en cinco sitios: portada, lámina 2, lámina 3 (la cadena pasa a «sis sessions → sis peces»), lámina 4 (la tabla pierde la fila de Adaptación, que baja al pie, y el titular pasa a «Sis sessions, divuit hores») y lámina 5 (que era «Per què són set i no sis» y ahora es «L'Adaptació és la porta, no és IA-Lab»).

**Y corregida la aritmética de la lámina 6**, que sumaba 190 minutos. Ahora 15 + 25 + 30 + 45 + 35 + 15 = 165, más quince de pausa: tres horas. Es la misma cuenta que usan los cinco guiones de sesión.

---

## IA-Lab 1 · v09 pasa a 37 láminas y qué pasa cuando el deck se edita a mano (13 de septiembre)

`IALab1_v09_2026-09-13.pptx` · 37 láminas. Mismo número de iteración que el 12 de septiembre: no es una pasada nueva, son cuatro láminas añadidas y un dato corregido. La regla 3 de la nomenclatura dice mismo número, fecha nueva.

**Las cuatro láminas nuevas** (14 a 17), decididas por Albert por encima de la recomendación de meter solo dos:

1. y 2. **El stack, mayo → hoy.** Una tabla de cinco filas —quién aconseja el producto, quién escribe el código, dónde se trabaja, quién revisa desde fuera, dónde vive lo aprendido— y una segunda lámina con las tres lecturas de esa tabla. No es una lámina técnica: es la prueba de que el criterio se construyó cambiando de instrumento, no de opinión.
3. y 4. **Dos capturas de UXMachine**, home y ejemplo de diagnóstico. **Todavía no existen.** El generador deja un marco de filete rojo discontinuo con el encargo escrito dentro, y las inserta solo si aparecen en `uxm/home.png` y `uxm/diagnostico.png`. Es la pieza que el briefing de diseño lleva pidiendo desde el principio.

**El dato corregido.** Fila «quién lo revisa desde fuera», columna HOY: *DeepSeek · Kimi · Gemini* pasa a **Grok · ChatGPT · Qwen**. Lo cambió Albert a mano y está ya en el generador.

### Lo que enseñó esa edición a mano

El fichero que devolvió Albert, editado en PowerPoint, traía **cien formas de más repartidas por catorce láminas**: en la 18, veinte formas pasaron a treinta y siete; en la 25, treinta y tres a cincuenta. Abriendo el XML se ve el patrón — los identificadores originales van del 2 al 21 y luego aparecen del 22 al 38 los mismos objetos, mismas coordenadas, mismo texto, apilados encima. Una copia completa del contenido de la lámina, invisible al ojo porque cae exactamente sobre el original.

No es grave hoy y sí lo es mañana: el texto se dibuja dos veces, cualquier retoque futuro toca una de las dos copias, y el fichero se degrada con cada guardado.

**La regla operativa, entonces:** el deck se genera por código (`build_v9.js`). Las correcciones se dictan y se aplican al generador; no se editan en PowerPoint. Si aun así se edita a mano, hay que decirlo, porque la siguiente regeneración se lleva por delante lo editado — y porque conviene comparar antes de dar el fichero por bueno.

---

## 13 de septiembre de 2026 · la web ya está publicada, y el TFM deja de estar bloqueado

**La web tiene URL propia y estable:** **https://qtorb.github.io/guia-ai-first/** — repositorio `qtorb/guia-ai-first`, GitHub Pages sobre `main` / raíz. Comprobado descargándola: idéntica byte a byte al maestro local, HTTP 200, HTTPS forzado. Se actualiza subiendo un `index.html` nuevo al repositorio.

Se abandona el enlace de artifact de Claude como forma de compartirla: quedaba fijado en una versión antigua y solo Albert podía soltarlo. **Este registro pasa a considerar esa URL el sitio canónico de la web.**

**Pendiente, con su orden:** el dominio propio `guia.qtorb.com` va en dos pasos y en este orden — primero el CNAME en CDMON (`guia` → `qtorb.github.io`), y solo cuando resuelva, el campo *Custom domain* en GitHub. Al revés, Pages deja de servir la URL `github.io` y la web queda caída mientras propaga. *(Hecho el 22 de septiembre. Ver esa entrada: faltaba un tercer paso que aquí no estaba previsto.)*

**Y una consecuencia que decide el calendario:** el dossier del alumno vive en el `localStorage` del dominio donde entró. Cambiar de dominio lo vacía. Si los alumnos van a guardar trabajo, el dominio definitivo tiene que estar montado **antes** de darles ningún enlace.

**Sigue sin resolver:** 4,2 MB en un solo fichero. Medio segundo en escritorio, veintidós segundos en un móvil de gama media. Son las imágenes incrustadas en base64; ningún hosting lo arregla. *(Resuelto el 15-22 de septiembre con la migración a React: 287 KB en la primera carga. Ver esa entrada.)*

### La posición institucional sobre el uso de IA en el TFM

Llevaba desde agosto marcada como bloqueante de IA-Lab 6. **Deja de serlo, por decisión de Albert:** la escuela no va a fijar posición —«son una mica freeriders»—, así que la posición es la que proponga IA-Lab. Y como la sesión 6 la imparte él solo, no hay nada que consensuar con nadie.

Consecuencia práctica: lo que era una espera pasa a ser una pieza por escribir —qué se puede y qué no se puede hacer con IA en el TFM, y cómo se documenta—, y no corre prisa: la sesión 6 es la última del bloque.

---

## 14 de septiembre de 2026 · Adaptación: la poda ya estaba hecha, y falta una pieza

`AdaptacionIA_MMDD31_qtorb v3.pptx` · 58 láminas · 5.436 palabras.

**No es una evolución del deck de la MMDD30.** Aquél era el `v7.9`, de 204 diapositivas. Éste es una reconstrucción desde cero sobre `claude/Brief_Adaptacion-IA_MMDD31.md`, con el recorrido nuevo: la hoja de las diez tareas que abre y a la que se vuelve cuatro veces, las tres diferencias, los tres verbos, los superpoderes exigidos con un ejemplo de esta semana, los cuatro movimientos del puesto y los tres compromisos del cierre.

**El «v3» del nombre no es una iteración.** El fichero es idéntico —cero diferencias de texto, mismo recuento de palabras— al que estaba guardado desde el 12 de agosto. Se abrió y se guardó el 14 de septiembre sin tocar contenido. Aplicando la regla del 12 de septiembre, esto es el mismo deck con fecha nueva, no una versión nueva.

**La poda está hecha, y eso desbloquea IA-Lab 1.** Comprobado contra el mapa de reasignación: el deck no contiene ni una sola mención a prompts, ni al método de verificación, ni al protocolo operativo, ni al canvas en clave de método. La frontera con IA-Lab 1 —«¿en quién me convierto?» frente a «¿cómo trabajo con criterio?»— se respeta. **El punto 4 de la revisión de IA-Lab 1, marcado como bloqueado desde el 12 de septiembre, deja de estarlo.**

**Y aparece un hueco, que es EL-DESCARTE-SILENCIOSO otra vez.** El mapa decía *partir* la alucinación: Adaptación conserva la conciencia del riesgo, IA-Lab 1 se queda el método de prevención. Lo que ha pasado es que **la palabra no aparece en ninguno de los dos decks**. Se quitó de uno y nunca llegó al otro. Ninguna cifra lo reflejaba porque los dos ficheros están, cada uno, bien.

Falta decidir dónde entra: una lámina de conciencia en Adaptación, el método en IA-Lab 1, o las dos cosas.

---

## 14 de septiembre de 2026 · Adaptación tiene sus imágenes

`AdaptacionIA_MMDD31_v04_2026-09-14.pptx` · 58 láminas · 14 MB · validación limpia · 174 minutos intactos.

**Las veinticinco imágenes están generadas y montadas.** Los huecos grises `[ IMAGEN ]` han desaparecido: cada uno lleva su foto, recortada al centro y ajustada al marco. Es la primera vez que el deck se puede proyectar entero.

**Cómo se hicieron.** Gemini (Nano Banana Pro), las veinticinco en una sola conversación para que compartieran acabado, con un prompt por imagen de cuatro líneas fijas: escena, `Style:`, `Avoid:` y `Aspect ratio:`. Los prompts están en `claude/Imagenes_AdaptacionIA_prompts.md`, ya actualizados con la versión que realmente funcionó.

**Lo que se aprendió, y sirve para IA-Lab 1 y para cualquier deck futuro:**

1. **El modelo ejecuta descripciones de posición, no comparaciones.** «La aguja lejos del inicio de la escala» dio una aguja en el cero; «swung clockwise all the way over to the right side of the dial» la puso donde tocaba. Lo mismo con los tres caminos: describir cada uno con su grado de desgaste funcionó donde «uno menos pisado que los otros» no.
2. **Las negaciones van en línea propia.** Dentro de la frase, «no blue technological glow» invocó justamente eso —la primera 06a salió con una red de nodos luminosos encima—. Como instrucción `Avoid:` separada, se obedece.
3. **No pedir texto dentro de la imagen.** Salió «professión» con dos eses en una lámina. El texto vive en el PowerPoint, que es donde se corrige sin regenerar nada.
4. **Las contradicciones entre escena y estilo se pagan.** «Fluorescent light» en la escena contra «natural available light» en el estilo: hasta que no se resolvió, el videoclub nocturno salía con luz de día.
5. **La proporción se mide sobre el hueco, no se supone.** Cuatro formatos distintos en este deck: once a 16:9, seis a 1:1, cuatro a 3:2 y cuatro a 4:5.

**Ajustes hechos en el montaje, no regenerando:** se han recortado los marcos de película que traían siete imágenes; se ha enfriado la 30 y calentado la 57b para que las parejas respiren igual; se ha subido el contraste de la 22, que era la más pálida; y se han **recolocado las bandas de texto de las láminas 23, 25, 37, 46 y 52**, donde la frase caía justo encima del sujeto. Mover una banda es un cambio de un objeto en una lámina; regenerar una foto que ya estaba bien, no.

**Sigue pendiente y no lo puede hacer ningún modelo:** los dos recuadros `[ ALBERT · TU HISTORIA ]` de las láminas 8 y 56. Esperan material personal suyo. El brief de diseño preveía cinco; hay dos.

**Y sigue abierta** la sexta yuxtaposición que pedía el brief: hay cinco —láminas 6, 11, 12, 40 y 57— y falta decidir dónde va la que falta.

---

## 15 – 22 de septiembre de 2026 · la web se reconstruye en React, y de una hoja pasan a tres

**Primero, una corrección de cifra.** En conversación se dijo «ocho parches desde el 14 de septiembre». Son **33 commits en 28 pull requests**, entre el 15 y el 22. La diferencia no es contable: en esos ocho días la web dejó de ser el fichero que este registro describía el 13 de septiembre y pasó a ser otra cosa. Es EL-DESCARTE-SILENCIOSO otra vez, en su forma más tonta: el registro seguía siendo verdad sobre un fichero que ya no existía.

### Lo que cambió de raíz

**El `index.html` de 4,2 MB ya no existe.** La web es una aplicación React + Vite que se despliega sola en GitHub Pages desde `main`, por Actions. Repositorio `qtorb/guia-ai-first`, misma URL: **https://qtorb.github.io/guia-ai-first/**.

**Y con eso cae el «sigue sin resolver» del 13 de septiembre.** Medido sobre producción, en un viewport de móvil: la portada son **7 peticiones y 287 KB**, contra los 4,2 MB de un solo fichero. Los veintidós segundos en un móvil de gama media se acabaron, y no por hosting: porque las imágenes dejaron de ir incrustadas en base64.

**Dos barrios, y se distinguen con dos variables y ninguna más:** la temperatura del papel y el acento. *El método AI-First* en papel frío y azul; *IA-Lab* en papel cálido (`#FCF9F6`) y rojo (`#8C1D2F`, 9,01:1 sobre blanco, marcador de posición hasta que llegue el hex de marca UPF-BSM). Lo que **significa** algo —verde cumple, ámbar lo escribes tú, oscuro no cumple— no cambia de barrio: si cambiara, el alumno tendría que reaprender el código al pasar de uno a otro.

### El inventario, a 22 de septiembre

| Pieza | Estado |
|---|---|
| Manual del método | 18 capítulos en 7 grupos, con buscador, filtros y mapa |
| Bloque de 30 días | destino, plan con fechas, `.ics` y los cuatro textos |
| **Hoja 0** · *Si todavía no tienes idea* | 10 bloques · 1 documento |
| **Hoja 1** · *Mi protocolo y mi TFM en una página* | 11 bloques en dos piezas (1A y 1B) · 2 documentos |
| **Plantilla de encargo** (herramienta, no sesión) | 5 bloques · 1 documento · panel que crece mientras escribes |
| Hojas 2 a 6 | pendientes de pactar con cada co-docente |

### Los cuatro mecanismos que funcionan

Salieron de esta tanda y conviene tenerlos escritos, porque son lo que hay que extender a las hojas que faltan:

1. **La comparación grabada.** Dos ejecuciones reales del mismo caso, una al lado de otra, escritas en el JSON con su modelo y su fecha. Permite ver el efecto sin tener ningún modelo abierto al otro lado — que es la condición de que la hoja sea autogestionable.
2. **El campo a ciegas.** Se contesta al empezar, se cierra al avanzar y se vuelve a abrir en el último paso, al lado de lo escrito. Nadie lo corrige: está para que se vea la distancia, que es la única prueba de que la sesión ha servido.
3. **«Compruébalo tú».** La comprobación la hace el alumno, no la pantalla. La hoja acompaña una sesión; no evalúa a quien escribe.
4. **El ejemplo plegado.** Terminado, pero cerrado por defecto y con el aviso de abrirlo después de escribir el tuyo.

### 22 de septiembre · la pasada de jerarquía

La crítica de Albert fue que la página empeoraba en jerarquía visual y que la fricción cognitiva era «elevada y creciendo». Medido antes de tocar nada, sobre producción: **un bloque eran 2.465 px de alto, 552 palabras y 33 cajas con fondo o borde**, con siete registros visuales antes del primer campo. **El último paso, 2.953 px, 639 palabras, 29 botones y 39 cajas**, con el mismo bloque repetido para 1A y 1B y dos veces el título «Dónde va esto en tu TFM». Y la causa de fondo, que es la que explicaba el «no es autogestionable ni en broma»: **ninguna pantalla decía en una frase qué había que hacer en ella.**

El principio que se fijó: **una pantalla, una tarea, un campo visible.** Se diseñó primero en wireframe —cuatro artboards, aprobados antes de tocar código— y después se implementó:

1. **Cada bloque abre con la tarea en una frase.** Campo `tarea` nuevo en las tres hojas: veintiséis frases escritas una a una. Los campos van detrás. El encargo para la IA, el ejemplo, de dónde sale la regla y la duda para la sesión se pliegan en **una fila de cuatro botones al pie, una abierta cada vez**.
2. **La tira pierde los rótulos**, truncados a 66 px e ilegibles. Se queda en puntos numerados —el número se conserva porque la hoja 0 tiene trece pasos y sin él saltar a uno es a ciegas— y lo que orienta pasa a ser la línea «1A · Bloque 1 de 7» y **el botón «i»**, que abre un panel con las cinco preguntas que nadie está ahí para contestar en casa un jueves por la noche: dónde estás, qué sale de aquí, cuándo se hace, dónde se guarda y dónde encaja en el máster. Se lleva además guardar, retomar y empezar de cero, que **solo existían en el último paso**: quien cambiaba de ordenador en el bloque 4 no tenía forma de llevarse lo escrito.
3. **El cierre deja de duplicarse:** el nombre una vez, las piezas en paralelo, las acciones en texto y un solo cierre compartido.

**Después:** el bloque, 1.267 px y 238 palabras. El cierre, 1.183 px, 9 botones y 10 cajas.

### El estado de accesibilidad, y cómo se mide

**0 fallos de contraste AAA y 0 objetivos táctiles por debajo de 44 px**, en siete pantallas × tres anchos (390 / 768 / 1440) × claro y oscuro.

**El método importa tanto como la cifra.** Navegar entre rutas por hash dentro de un mismo contexto de navegador **no remonta la aplicación**: los barridos hechos así se saltaban pasos en silencio y daban números optimistas. Cada combinación de ruta × ancho × esquema se mide en un **contexto nuevo**. Esto no es una precaución teórica: cuando se descubrió, hubo que rehacer barridos ya reportados y corregir a la baja.

Los dos últimos fallos que quedaban eran **el mismo error dos veces: valores de color escritos a mano donde debía haber variables.**

* La puerta de IA-Lab de la portada llevaba el rojo y el tinte literales, así que en oscuro conservaba el fondo rosa claro mientras el texto lo ponía la paleta oscura. El título quedaba en **1,03:1** — invisible. Ahora 14,74:1.
* El rótulo «lo escribes tú a mano» de la hoja 0 iba en blanco sobre `--accion`, que en oscuro es un ámbar claro: **1,84:1**. Con tinta oscura sobre el mismo ámbar, 10,04:1, y en claro no cambia nada.

Hay un tercero de la misma familia, ya arreglado antes: el barrio de IA-Lab redefinía el papel en cálido pero se dejaba `--mid` en el gris del papel frío, que en oscuro caía a 2,18:1 y se llevaba por delante los *hint* de los campos, los números de la tira y el pie de todas las hojas.

**La lección, entonces, es estrecha y comprobable:** un color literal dentro de una regla que también redefine el fondo es un fallo de modo oscuro esperando fecha.

### Lo que queda abierto

1. **Las dos salidas grabadas de la plantilla de encargo.** Los `[ PENDIENTE ]` y el sello `[ modelo y fecha del ensayo ]` de `hojas/mmdd31/encargo.json` esperan a que Albert ejecute los dos prompts una vez, en sesión limpia, y pase las dos salidas. Sin eso, el mecanismo 1 no funciona en esa hoja.
2. **La pasada de simplificación** sobre todas las piezas: una palabra por cosa —*hoja*, *ficha* y *plantilla* siguen chocando, y «hoja» significa dos cosas distintas entre el 16 y el 20 de octubre—, menos listas numeradas, y extender los cuatro mecanismos a las hojas que no los tienen.
3. **Las cinco decisiones** de `claude/Consistencia_tres_piezas.md`.
4. **El dominio.** Sigue vigente, y ahora con fecha encima: el dossier del alumno vive en el `localStorage` del dominio por el que entró. Cambiar de dominio lo vacía. **`guia.qtorb.com` tiene que estar montado antes de dar ningún enlace a los alumnos**, no después.

---

## Cómo se controla esto a partir de ahora

La regla que evita que vuelva a pasar lo de arriba, y solo esa:

**Un asiento por pasada, no por pull request.** Una pasada es un cambio que altera lo que el alumno ve o lo que la hoja le pide. Veintiocho PR no son veintiocho asientos: son cinco pasadas —migración, sistema visual, hoja 0, hoja 1, jerarquía—. Un arreglo suelto no abre asiento; se acumula al de su pasada.

**Y cada asiento de web lleva las mismas tres cifras, medidas igual:** alto y palabras de la pantalla que más pesa, fallos AAA de contraste y táctiles, y peso de la primera carga en móvil. Sin las tres, el asiento no dice si la pasada mejoró o empeoró — que es justo lo que no supimos contestar hasta que hubo que medirlo a posteriori.

---

## 22 de septiembre de 2026 · `guia.qtorb.com`, y el tercer paso que faltaba

**La URL canónica de la web pasa a ser https://guia.qtorb.com.** `qtorb.github.io/guia-ai-first/` redirige y deja de usarse.

**Por qué ahora y no en octubre.** Lo que ata el trabajo del alumno no es el hosting: es el **nombre del host**. El dossier vive en el `localStorage` del origen por el que entró, así que el único movimiento que lo borra es cambiar de hostname. Hoy ese movimiento es gratis —ningún alumno ha escrito nada todavía—; el 20 de octubre cuesta el trabajo de una promoción entera. Y a partir de aquí el dominio es propio, de modo que **mudar la web de Pages a Netlify, a Vercel o a una máquina propia es cambiar un registro DNS**: la URL no cambia y nadie pierde nada. Eso es exactamente lo que se compra con un dominio propio.

**Subdominio y no carpeta** (`guia.qtorb.com`, no `qtorb.com/guia`). Dos razones: apunta a donde se quiera con independencia de la web principal, y mantiene su almacenamiento separado del de `qtorb.com`. Son orígenes distintos y la elección es irreversible sin borrar lo que haya escrito la gente.

### El tercer paso, que la entrada del 13 de septiembre no preveía

Los dos pasos conocidos eran: CNAME en CDMON (`guia` → `qtorb.github.io`) y, cuando resuelva, *Custom domain* en GitHub. Falta uno, y es de código:

**Con dominio propio, Pages sirve el proyecto en la RAÍZ del dominio**, no en `/guia-ai-first/`. Así que `base` en `vite.config.js` pasa de `'/guia-ai-first/'` a `'/'`, y el dominio se escribe en `public/CNAME` para que viaje dentro del artefacto de cada despliegue.

**Los tres van juntos o hay ventana rota**, en los dos sentidos: si el código sale antes de que el dominio esté, `github.io` queda con todos los recursos en 404; si el dominio entra antes que el código, la web nueva queda igual. El orden que funciona es DNS → comprobar que resuelve → *Custom domain* en GitHub y fusionar el cambio de `base` en la misma sentada.

**Y no se rompe nada más**, porque el enrutador es de tipo hash: las rutas son `#/ia-lab/1` y no hacen falta reglas de reescritura en el servidor. Fue una decisión tomada por otro motivo que aquí sale gratis.

**Dos detalles operativos, los dos aprendidos a base de fallar.**

El primero: **en CDMON el destino va SIN punto final.** `qtorb.github.io`, no `qtorb.github.io.`. En un fichero de zona el punto final es la forma correcta —marca el nombre como absoluto— y así estaba escrito aquí, pero el formulario de CDMON pide el nombre y pone el punto él: con el punto contesta «El valor no és vàlid» y no deja guardar. La documentación de GitHub lo escribe con punto porque describe la zona, no el panel del registrador. Cada panel tiene su convención y hay que mirar el ejemplo que el propio formulario enseña debajo del campo.

El segundo: el certificado HTTPS tarda un rato en emitirse después de fijar el dominio, y hasta que está, *Enforce HTTPS* aparece en gris en los ajustes de GitHub. No es un error; es la espera.

### La documentación se muda al repositorio, el mismo día

Este registro vivía en el proyecto de Claude, separado del código que describe, y pasó lo previsible: entre el 13 y el 22 de septiembre la web se reconstruyó entera y el registro siguió describiendo un fichero de 4,2 MB que ya no existía. Ahora vive en `docs/REGISTRO.md`.

Con él van dos cosas que convierten la regla de los asientos en algo comprobable:

* **`scripts/medir.mjs`** da las tres cifras de cada asiento —peso de la primera carga en móvil, alto y palabras de la pantalla que más pesa, y los fallos de accesibilidad— y **sale con código 1 si hay alguno**, así que sirve de puerta y no de buena intención. Playwright no se añade como dependencia del proyecto: pesa más que la web entera y sólo hace falta el día que se mide.
* **El README** deja de ser la plantilla de Vite y dice qué es esto, cómo se publica, dónde está cada cosa y las dos trampas que ya han costado caras: el color literal dentro de una regla que también redefine el fondo, y que el dossier muere al cambiar de dominio.

---

## 22 de septiembre de 2026 · dos estados: borrador y guardado

**La web prometía en seis sitios algo que dejó de ser verdad el día que se montó la capa de cuentas:** «Nada de lo que escribas sale de tu navegador. No hay cuentas ni contraseñas.» Hay cuentas desde el commit de `nube`, y quien entra manda su dossier a un servidor. Una promesa vieja que sobrevive a su propio cambio no es un descuido de copia: es la clase de frase que un alumno cita cuando se entera de lo contrario.

**Lo que se descartó.** La salida rápida era hacer la cuenta obligatoria —autenticado se guarda, no autenticado no se guarda— y así la frase desaparece sin sustituta. Tiene tres costes que no se ven el primer día:

* Las propias hojas dicen en su texto que no se acaban de una sentada («No hace falta acabarla de una sentada», «son dos sentadas con una noche en medio»). Sin guardado local, cerrar la pestaña a media hoja 1 es empezar de cero.
* La cuenta pasa a ser obligatoria de hecho mientras el deck sigue diciendo que no lo es.
* El argumento de la hoja 1 —que escribas lo que piensas y no lo que queda bien— se apoya en que lo escrito no vaya a ninguna parte mientras no decidas tú.

**Lo que se decidió: dos estados, y se llaman siempre igual.**

| Estado | Qué significa | Cuándo |
|---|---|---|
| **Borrador** | Vive en el `localStorage` de este navegador. No sale de ahí. Si cambias de dispositivo, no viaja | Sin cuenta |
| **Guardado** | Además va al servidor, y lo retomas donde sea | Entrando |

**Las seis frases reescritas**, todas con esas dos palabras y ninguna otra: `src/pages/Home.jsx`, `src/pages/MetodoPortada.jsx`, `src/components/hoja/Donde.jsx` (el panel «i», apartado *Dónde se guarda*), `src/components/Cuenta.jsx` (titular incluido: «De borrador a guardado»), y las dos notas de pie de `src/data/hojas.json`. Con ellas, `public/privacidad.html` —que ya era honesta, pero llamaba a los dos estados por descripción y no por nombre— y el aviso de `docs/SUPABASE.md`, que citaba la promesa vieja como razón de diseño.

**Lo que esto todavía no resuelve.** Las palabras están; el **indicador no**. Ahora mismo el estado sólo se lee entrando en el panel de cuenta, y un estado que hay que ir a buscar no protege a nadie. Falta que la pantalla diga en todo momento en cuál de los dos estás. Va con la pieza «Lo que llevas», que está en wireframe y no en código.

**Medido antes de entregar:** primera carga en móvil 7 peticiones · 290 KB · 1,4 s; la pantalla que más pesa sigue siendo hoja 1 · bloque a 390 px (2.250 px · 232 palabras · 20 cajas · 6 botones); **0 fallos** de contraste AAA y de área táctil en las 42 combinaciones de ruta, ancho y modo.
