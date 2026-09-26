# Roles

> Quién decide qué. Y sobre todo: **qué no decide cada uno**.
> Manual: capítulo 3.1<!--cap:roles-->. Cómo se instalan: 3.2<!--cap:instalar-roles--> y 15.4<!--cap:stack-instalar-->.

**La columna de la derecha vale más que la de la izquierda.** Es la que evita que un rol se coma a otro cuando hay prisa, y con prisa siempre se come el que produce al que decide. Rellénala primero.

Mínimo cuatro roles. El especialista técnico, solo desde la columna B.

---

## Fundador

*Eres tú. Ejecuta lo menos posible: cuando el que dirige ejecuta o prueba, no dirige nadie.*

| Decide | NO decide |
|---|---|
| Intención, criterio de calidad, prioridad | — |
| Restricciones y trade-offs | |
| **Qué está prohibido** y qué riesgos se asumen | |
| Autoridad final cuando hay desacuerdo | |

---

## Asesor

*Te da criterio, no ejecución. Sus cautelas no son decisiones tuyas hasta que las firmes (manual 6.3<!--cap:consulta-recibir-->).*

| Decide | NO decide |
|---|---|
| Qué se construye y en qué orden | Arquitectura, datos, orden técnico |
| A quién sirve y cuál es la unidad de valor | Si un cambio es seguro de publicar |
| Qué se puede afirmar en público | **Qué está prohibido** |
| Qué deuda se tolera y a cambio de qué | **Qué cautelas asume el proyecto** |

Las dos últimas de la derecha son las que más se cuelan. Si no están escritas, el asesor se las queda sin que se lo pidas.

---

## Ejecutor

*Ejecuta encargos cerrados. Sus instrucciones permanentes están en `CLAUDE.md` / `AGENTS.md`.*

| Decide | NO decide |
|---|---|
| Nada | Todo lo demás |

Cuando aparece algo que el encargo no contempla: para y pregunta. No elige. Lo no previsto va a `05_VISTO_NO_TOCADO.md`, en una línea, y no se arregla de paso.

---

## Checkpoint

*El único rol que no produce nada. Por eso es el primero que desaparece cuando hay prisa, y el único que detecta que llevas tres días resolviendo el problema equivocado.*

| Decide | NO decide |
|---|---|
| Cuándo se para | Qué se construye |

**Cita en el calendario:** ____________ (día y hora)

Puede ser una persona, un agente con instrucciones propias, o tú con el móvil en silencio. Lo que no puede ser es implícito. Sus cuatro preguntas fijas están en el manual, capítulo 9<!--cap:checkpoint-->.

---

## Especialista técnico · solo desde la columna B

*Se crea cuando cambia el problema, no cuando aprieta el calendario.*

| Decide | NO decide |
|---|---|
| Arquitectura y modelo de datos | Alcance de producto |
| Orden de ejecución técnica | Afirmaciones públicas |
| Si un cambio es seguro | Prioridad comercial |

---

## Notas

**Un rol con el que nunca has discutido no está haciendo su trabajo.** La fricción no es un fallo de configuración: es la señal de que hay dos criterios en la mesa y no uno.

**Si el mismo choque se repite tres veces**, no es un mal día: es un campo que falta en la definición del rol. Se escribe aquí y en las instrucciones del rol, no en el chat.

**Tres reglas de trato**, que no dependen de la herramienta: nombrar el rol antes de pedir · no cambiar de rol a mitad de conversación (si hace falta otro papel, otra conversación) · declarar apertura y cierre de sesión, que es lo que hace barato el reinicio de contexto.
