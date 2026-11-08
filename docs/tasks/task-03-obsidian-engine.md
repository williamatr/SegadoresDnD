# TASK-03: Motor de Markdown, Callouts y Anti-Metajuego (`@segadores/obsidian-engine`)

> **Estado General:** 🟢 Completada
> **Agentes Responsables:** `backend-engineer`, `frontend-engineer`
> **Paquetes Afectados:** `packages/obsidian-engine`

---

## 🎯 Objetivo de la Épica
Construir el motor agnóstico `@segadores/obsidian-engine` para transformar notas Markdown de Obsidian (hechizos, equipo, clases, glosario de estados y lore) en estructuras tipadas y componentes visuales temáticos, garantizando el filtrado estricto anti-metajuego (`player` vs `dm`) antes de que cualquier dato llegue al navegador.

---

## 📋 Subtareas y Checklist

- [x] **SUBTASK-03.1: Parser de Frontmatter YAML y Transformador de Wikilinks**
  - **Objetivo:** Parsear metadatos (`escuela`, `nivel`, `tiempo_lanzamiento`, `alcance`, `componentes`, `duracion`, `visibility`, `tags`) y transformar enlaces `[[Nota]]` o `[[Nota|Alias]]` en rutas y referencias estructuradas.
  - **Archivos:** `packages/obsidian-engine/src/parser/frontmatter.ts`, `packages/obsidian-engine/src/parser/wikilinks.ts`.
  - **Criterio de Aceptación:** Devuelve objeto tipado con metadatos, enlaces extraídos y contenido limpio.

- [x] **SUBTASK-03.2: Extractor Estructurado de Compendio (Hechizos, Objetos y Estados)**
  - **Objetivo:** Parsear las notas de hechizos y objetos mágicos extrayendo automáticamente componentes (`V`, `S`, `M`, concentración, ritual), clases asociadas, requisitos de sintonización y descripciones cortas/completas para que las Vistas B, C, D y F de la Hoja de Personaje puedan consultarlas al instante.
  - **Archivos:** `packages/obsidian-engine/src/parser/compendium-extractor.ts`.
  - **Criterio de Aceptación:** Genera catálogo tipado de `SpellEntry` e `ItemEntry` tanto desde `content/wiki/` como desde `content/mocks/` en modo fallback.

- [x] **SUBTASK-03.3: Filtro Anti-Metajuego (Player vs DM)**
  - **Objetivo:** Purgar bloques callout `> [!dm]`, ocultar notas con `visibility: dm` o `#dm-only`, y bloquear carpetas restringidas (`Campañas predefinidas/`, `Bestiario/`, `Notas del Máster/`) cuando el rol sea `'player'`.
  - **Archivos:** `packages/obsidian-engine/src/filters/anti-metagame.ts`.
  - **Criterio de Aceptación:** Cero fugas de información confidencial del DM en el árbol devuelto a un jugador.

- [x] **SUBTASK-03.4: Renderizador de Callouts Temáticos de Obsidian**
  - **Objetivo:** Convertir bloques Obsidian `> [!statblock]`, `> [!dnd-grid]`, `> [!info]`, `> [!tip]`, `> [!warning]`, `> [!todo]` y `> [!dm]` (solo visible para el DM con sello 🔒) en componentes React estilizados con Tailwind.
  - **Archivos:** `packages/obsidian-engine/src/components/callouts.tsx`, `packages/obsidian-engine/src/parser/callouts.ts`, `packages/obsidian-engine/index.ts`.
  - **Criterio de Aceptación:** Componentes puros y accesibles coherentes con la estética de fantasía oscura.

---

## 📜 Registro de Ejecución y Cambios (Log)

| Fecha | Agente / Dev | Subtarea | Resumen de Cambios Realizados |
| :--- | :--- | :--- | :--- |
| 2026-11-08 | `backend-engineer`, `frontend-engineer` | `SUBTASK-03.1` a `03.4` | Implementación completa de `@segadores/obsidian-engine`: parser YAML y frontmatter sin dependencias pesadas, extractor de wikilinks y embeds multimedia, extractor de compendio estructurado (hechizos y objetos) con fallback wiki $\leftrightarrow$ mocks, filtro anti-metajuego (purgado de callouts `> [!dm]` y carpetas restringidas), parser y componente React `Callout` con soporte de colapsado `<details>` nativo accesible y paleta fantasía oscura. Suite de 20 pruebas unitarias aprobadas al 100%. |
