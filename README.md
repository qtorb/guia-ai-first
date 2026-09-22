# Guía AI-First · web

El sitio de **https://qtorb.github.io/guia-ai-first/**. Dos barrios dentro de la misma web:

- **El Método AI-First** — 18 capítulos, mapa, buscador y el bloque de 30 días. Abierto a cualquiera.
- **IA-Lab** — las hojas de trabajo del MMDD31 (UPF-BSM). Cada una se rellena y devuelve uno o dos documentos.

Nada de lo que el alumno escribe sale de su navegador. No hay cuentas, ni contraseñas, ni servidor.

## La documentación vive aquí

- **[`docs/REGISTRO.md`](docs/REGISTRO.md)** — el registro de versiones. **El único sitio donde se mira qué versión es la buena. Si algo no aparece ahí, no cuenta.** Lleva también las reglas de numeración y las decisiones de diseño con su porqué.

Un asiento por **pasada**, no por pull request: una pasada es un cambio que altera lo que el alumno ve o lo que la hoja le pide. Y cada asiento de web lleva las mismas tres cifras, medidas igual — que es lo que da `scripts/medir.mjs`.

## Arrancar

```
npm install
npm run dev
```

`npm run build` genera `dist/`. El `prebuild` construye antes `src/data/manual.json` a partir de `content-source/MANUAL.md`, así que **el manual se edita en el Markdown, no en el JSON**.

## Publicar

Empujar a `main`. GitHub Actions construye y despliega en Pages (`.github/workflows/`). No hay nada que subir a mano.

## Medir antes de dar una pasada por buena

```
npm i -D playwright && npx playwright install chromium
node scripts/medir.mjs                    # producción
node scripts/medir.mjs http://localhost:4173/guia-ai-first/   # un build local
```

Devuelve las tres cifras del asiento: peso de la primera carga en móvil, alto y palabras de la pantalla que más pesa, y los fallos de accesibilidad. **Sale con código 1 si hay alguno**, así que sirve de puerta.

El objetivo es **AAA**: 7:1 de contraste para texto normal, 4,5:1 para texto grande, y 44×44 px de objetivo táctil. Hoy está en cero fallos, en siete pantallas × 390/768/1440 × claro y oscuro.

> Una advertencia que cuesta cara olvidar: navegar entre rutas por hash dentro de un mismo contexto de navegador **no remonta la aplicación**, y el barrido se salta pasos en silencio. Por eso `medir.mjs` abre un contexto nuevo en cada combinación. Está explicado dentro del fichero.

## Dónde está cada cosa

```
content-source/MANUAL.md   el manual, en Markdown — se edita aquí
src/data/hojas.json        las hojas de IA-Lab: bloques, campos, encargos, plantillas de salida
src/data/sesiones.json     qué sesiones existen y qué hoja usa cada una
src/pages/IaLabHoja.jsx    el motor de una hoja: pasos, autoguardado, generación
src/components/hoja/       bloque, campos, panel «dónde estoy», comparación grabada
src/styles/guia.css        los dos barrios, y por qué cada color es el que es
scripts/medir.mjs          las tres cifras del asiento
docs/REGISTRO.md           el registro de versiones
```

## Dos cosas que conviene saber antes de tocar

**El color literal dentro de una regla que también redefine el fondo es un fallo de modo oscuro esperando fecha.** Ha pasado tres veces: un título en 1,03:1 —invisible—, un rótulo en 1,84:1 y un gris en 2,18:1. Los tres por el mismo motivo. Si escribes un `#hex` en una regla, pregúntate qué pinta encima en oscuro.

**El dossier del alumno vive en el `localStorage` del dominio por el que entró.** Cambiar de dominio lo vacía. El dominio definitivo tiene que estar montado **antes** de dar ningún enlace a los alumnos, no después.
