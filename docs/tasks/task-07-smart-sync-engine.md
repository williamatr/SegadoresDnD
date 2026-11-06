# TASK-07: Motor de Sincronización Inteligente Bidireccional (Obsidian <-> PostgreSQL)

> **Estado General:** 🟡 Pendiente
> **Agentes Responsables:** `backend-engineer`, `solution-architect-critic`
> **Paquetes Afectados:** `scripts/`, `apps/segadores-web`, `content/wiki/`

---

## 🎯 Objetivo de la Épica
Construir un motor CLI de comparación y sincronización inteligente bidireccional (`pnpm sync:diff` y `pnpm sync:smart`) entre las notas de Obsidian de los personajes (`content/wiki/Personajes_Jugadores/*.md`) y la base de datos de Supabase.
El motor debe realizar diffs semánticos campo por campo (HP, niveles, equipo, hechizos, lore), detectar cambios nuevos introducidos por el DM en Obsidian o por el jugador en la aplicación web, y realizar fusiones seguras sin destruir notas personales, formato Markdown ni callouts de Obsidian.

---

## 📋 Subtareas y Checklist

- [ ] **SUBTASK-07.1: Analizador Semántico de Markdown y Detección de Cambios (`scripts/sync-characters-diff.mjs`)**
  - **Objetivo:** Leer cada nota de `Personajes_Jugadores/`, parsear sus bloques (frontmatter, statblock, inventario, personalidad) y compararla contra el registro en `public.characters`.
  - **Comando:** `pnpm sync:diff`.
  - **Criterio de Aceptación:** Emite un reporte visual en consola tipo git-diff:
    - `🟢 Nuevo en Obsidian (Se enviará a BD)`
    - `🟡 Modificado en Web/BD (Se actualizará en Obsidian)`
    - `⚪ Sin cambios detectados`.

- [ ] **SUBTASK-07.2: Motor de Fusión No Destructiva (Merge Engine)**
  - **Objetivo:** Algoritmo que actualiza archivos `.md` de Obsidian preservando callouts (`[!statblock]`, `[!info]`), formato de wikilinks `[[...]]` e imágenes `![[...]` sin reescribir destructivamente el archivo.
  - **Criterio de Aceptación:** Modificar un valor (ej: HP actual) en el Markdown solo cambia la línea correspondiente de HP sin alterar el resto de la nota.

- [ ] **SUBTASK-07.3: Sincronización Inteligente Interactiva (`pnpm sync:smart`)**
  - **Objetivo:** CLI que presenta los cambios detectados y permite al DM elegir la dirección de actualización:
    - Opción 1: *Push Obsidian $\rightarrow$ Supabase* (prioriza notas del DM/bóveda).
    - Opción 2: *Pull Supabase $\rightarrow$ Obsidian* (prioriza cambios de partida en vivo de los jugadores).
    - Opción 3: *Auto-Merge inteligente* (fusiona adiciones sin conflictos).
  - **Criterio de Aceptación:** Registro de `last_synced_at` en base de datos.

---

## 📜 Registro de Ejecución y Cambios (Log)

| Fecha | Agente / Dev | Subtarea | Resumen de Cambios Realizados |
| :--- | :--- | :--- | :--- |
| *Sin iniciar* | - | - | - |
