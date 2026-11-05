# TASK-04: Motor de Markdown y Compendio de Consulta para Jugadores

> **Estado General:** 🟡 Pendiente
> **Agentes Responsables:** `backend-engineer`, `frontend-engineer`
> **Paquetes Afectados:** `packages/obsidian-engine`, `apps/segadores-web`

---

## 🎯 Objetivo de la Épica
Construir el motor agnóstico `@segadores/obsidian-engine` para transformar notas Markdown de Obsidian (hechizos, equipo, clases) en datos tipados, e implementar el catálogo/buscador interactivo de referencia rápida de hechizos y herramientas para los jugadores en la web.

---

## 📋 Subtareas y Checklist

- [ ] **SUBTASK-04.1: Parser de Frontmatter YAML y Wikilinks**
  - **Objetivo:** Parsear metadatos (`escuela`, `nivel`, `tiempo_de_lanzamiento`, `tags`) y transformar enlaces `[[Nota]]` a rutas web relativas.
  - **Archivos:** `packages/obsidian-engine/parser/frontmatter.ts`, `packages/obsidian-engine/parser/wikilinks.ts`.
  - **Criterio de Aceptación:** Devuelve objeto estructurado con metadatos y contenido parseado.

- [ ] **SUBTASK-04.2: Renderizador de Callouts Temáticos de Obsidian**
  - **Objetivo:** Convertir bloques Obsidian `> [!statblock]`, `> [!info]`, `> [!warning]` en componentes estilizados.
  - **Archivos:** `packages/obsidian-engine/components/callouts.tsx`.
  - **Criterio de Aceptación:** Estilo visual coherente con la temática medieval de fantasía.

- [ ] **SUBTASK-04.3: Filtro Anti-Metajuego (Player vs DM)**
  - **Objetivo:** Purgar callouts secretos `> [!dm]` y archivos con `visibility: dm` cuando el contexto sea de jugador (`player-facing`).
  - **Archivos:** `packages/obsidian-engine/filters/anti-metagame.ts`.
  - **Criterio de Aceptación:** Cero fugas de información secreta en vistas de jugador.

- [ ] **SUBTASK-04.4: Buscador y Compendio de Hechizos para Jugadores**
  - **Objetivo:** Vista web `/hechizos` en `apps/segadores-web` con filtros por nivel, clase y escuela de magia, con búsqueda en tiempo real.
  - **Archivos:** `apps/segadores-web/app/hechizos/page.tsx`, `apps/segadores-web/components/spells/spell-explorer.tsx`.
  - **Criterio de Aceptación:** Búsqueda instantánea en cliente sin recargar la página.

---

## 📜 Registro de Ejecución y Cambios (Log)

| Fecha | Agente / Dev | Subtarea | Resumen de Cambios Realizados |
| :--- | :--- | :--- | :--- |
| *Sin iniciar* | - | - | - |
