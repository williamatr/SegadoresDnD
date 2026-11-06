# TASK-05: Base de Datos PostgreSQL y Scripts de Sincronización

> **Estado General:** 🔵 En Progreso (3 de 4 subtareas completadas)
> **Agentes Responsables:** `backend-engineer`, `solution-architect-critic`
> **Paquetes Afectados:** `scripts/`, `apps/segadores-web/lib/supabase`, base de datos PostgreSQL

---

## 🎯 Objetivo de la Épica
Definir las tablas `players`, `campaigns`, `characters`, `campaign_characters`, `campaign_vault` y `demo_characters` en PostgreSQL (compatible con DataGrip y Supabase), e implementar los scripts CLI bidireccionales para leer las fichas iniciales de Obsidian (`Alizar.md`, `Eru.md`, `Honiel.md`, `Solaria.md`, `Zuma.md`), insertarlas en PostgreSQL (`sync:push`) y volcar el estado actualizado de la base de datos hacia las notas de Obsidian (`sync:pull`).

---

## 📋 Subtareas y Checklist

- [x] **SUBTASK-05.1: Migración DDL para Tablas Relacionales (con soporte N:M y Vault)**
  - **Objetivo:** Crear script SQL con definición de tipos, campos JSONB (`ability_scores`, `spell_slots`, `inventory`), relación muchos a muchos `campaign_characters`, baúl común y claves foráneas.
  - **Archivos:** `scripts/sql/01_init_schema.sql`.
  - **Criterio de Aceptación:** Script ejecutable directamente en DataGrip o Supabase SQL Editor sin errores de sintaxis.

- [x] **SUBTASK-05.2: Políticas de Seguridad Row Level Security (RLS)**
  - **Objetivo:** Definir políticas RLS que restrinjan a cada jugador a su propio registro, protejan el baúl común, otorguen permisos globales al DM y permitan lectura pública segura en `demo_characters`.
  - **Archivos:** `scripts/sql/02_rls_policies.sql`.
  - **Criterio de Aceptación:** Jugador no autenticado no puede mutar datos privados; `demo_characters` accesible para demo.

- [x] **SUBTASK-05.3: Script CLI de Ingesta y Orquestación (`pnpm sync:push`)**
  - **Objetivo:** Script Node.js que lea los 5 archivos Markdown en `content/wiki/Personajes_Jugadores/`, extraiga frontmatter y estadísticas `[!statblock]`, registre la campaña "Segadores de Orcos", inicialice el baúl común, inserte a los 5 personajes y cree los vínculos N:M en PostgreSQL.
  - **Archivos:** `scripts/sync-characters-push.mjs`.
  - **Criterio de Aceptación:** Los 5 personajes quedan registrados en PostgreSQL con sus datos íntegros y vinculados a la campaña `SEG-001`.

- [x] **SUBTASK-05.4: Migración DDL y RPC para Hojas de Personaje Mejoradas**
  - **Objetivo:** Ampliar `characters` y `demo_characters` con campos unificados `active_effects`, `personality`, `backstory`, `death_saves`, `inspiration`, `skills`, `saving_throws_prof`, `multiclass`, `attunement_slots`, `known_spells`. Crear funciones RPC `apply_character_effect` y `remove_character_effect` con permisos de seguridad y publicación en Supabase Realtime.
  - **Archivos:** `scripts/sql/03_character_sheet_enhancements.sql`.
  - **Criterio de Aceptación:** Script compatible con DataGrip y Supabase.

- [ ] **SUBTASK-05.5: Script CLI de Volcado (`pnpm sync:pull`)**
  - **Objetivo:** Script que consulte el estado actual de los personajes en PostgreSQL y actualice las notas locales de Obsidian preservando el formato y frontmatter.
  - **Archivos:** `scripts/sync-characters-pull.mjs`.
  - **Criterio de Aceptación:** Actualización limpia de `content/wiki/Personajes_Jugadores/*.md` sin perder notas previas.

---

## 📜 Registro de Ejecución y Cambios (Log)

| Fecha | Agente / Dev | Subtarea | Resumen de Cambios Realizados |
| :--- | :--- | :--- | :--- |
| 2026-11-05 | backend-engineer | SUBTASK-05.1 | Creado esquema SQL relacional completo con tablas `players`, `campaigns`, `characters`, `campaign_characters`, `campaign_vault` y `demo_characters`. Ejecutado en DataGrip. |
| 2026-11-05 | backend-engineer | SUBTASK-05.2 | Creadas políticas RLS para todas las tablas con función de seguridad `is_dm()` compatible con DataGrip. |
| 2026-11-05 | backend-engineer | SUBTASK-05.3 | Creado y ejecutado `scripts/sync-characters-push.mjs`. Parseados los 5 personajes reales de Obsidian (`Alizar`, `Eru`, `Honiel`, `Solaria`, `Zuma`), registrada la campaña `SEG-001`, baúl común y vínculos N:M creados en Supabase. |
| 2026-11-05 | backend-engineer | SUBTASK-05.3 | Creado y ejecutado `scripts/sync-demo-characters.mjs` (`pnpm sync:demo`). Ingestadas las 12 plantillas de clase de `personaje_de_prueba/` en `public.demo_characters` de Supabase. |
| 2026-11-06 | backend-engineer | SUBTASK-05.4 | Creado script SQL `03_character_sheet_enhancements.sql` con soporte para las 7 vistas (A a G), `active_effects` unificado, death saves, lore, funciones RPC seguras y Supabase Realtime. |
