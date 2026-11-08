# TASK-01: Base de Datos PostgreSQL, RLS y Scripts de Sincronización Base

> **Estado General:** 🟢 Completada (5 de 5 subtareas finalizadas y auditadas)
> **Agentes Responsables:** `backend-engineer`, `solution-architect-critic`
> **Paquetes Afectados:** `scripts/`, `scripts/sql/`, base de datos PostgreSQL / Supabase

---

## 🎯 Objetivo de la Épica
Definir las tablas `players`, `campaigns`, `characters`, `campaign_characters`, `campaign_vault` y `demo_characters` en PostgreSQL (compatible con DataGrip y Supabase), blindar las políticas RLS y funciones RPC, e implementar los scripts CLI bidireccionales para leer las fichas iniciales de Obsidian (`Alizar.md`, `Eru.md`, `Honiel.md`, `Solaria.md`, `Zuma.md`), insertarlas en PostgreSQL (`sync:push`), cargar las 12 plantillas de clase (`sync:demo`) y volcar el estado actualizado de la base de datos hacia las notas de Obsidian (`sync:pull`).

---

## 📋 Subtareas y Checklist

- [x] **SUBTASK-01.1: Migración DDL para Tablas Relacionales (con soporte N:M y Vault)**
  - **Objetivo:** Crear script SQL con definición de tipos, campos JSONB (`ability_scores`, `spell_slots`, `inventory`), relación muchos a muchos `campaign_characters`, baúl común y claves foráneas.
  - **Archivos:** `scripts/sql/01_init_schema.sql`.
  - **Criterio de Aceptación:** Script ejecutable directamente en DataGrip o Supabase SQL Editor sin errores de sintaxis.

- [x] **SUBTASK-01.2: Políticas de Seguridad Row Level Security (RLS)**
  - **Objetivo:** Definir políticas RLS que restrinjan a cada jugador a la edición de su propio registro, impidan la escalada de privilegios en `players.role`, protejan el baúl común, otorguen permisos globales al DM y permitan lectura pública segura en `demo_characters`.
  - **Archivos:** `scripts/sql/02_rls_policies.sql`.
  - **Criterio de Aceptación:** Jugador no autenticado no puede mutar datos privados; un jugador no puede auto-asignarse rol `'dm'`; `demo_characters` accesible para demo.

- [x] **SUBTASK-01.3: Scripts CLI de Ingesta (`pnpm sync:push` y `pnpm sync:demo`)**
  - **Objetivo:** Scripts Node.js que lean los 5 archivos Markdown en `content/wiki/Personajes_Jugadores/` y las 12 plantillas en `content/wiki/personaje_de_prueba/`, extraigan frontmatter, estadísticas, habilidades, multiclase, conjuros, inventario y recursos de clase, registren la campaña `SEG-001`, el baúl común y creen los vínculos N:M en PostgreSQL.
  - **Archivos:** `scripts/sync-characters-push.mjs`, `scripts/sync-demo-characters.mjs`.
  - **Criterio de Aceptación:** Los 5 personajes reales y las 12 plantillas demo quedan registrados en PostgreSQL con sus datos íntegros.

- [x] **SUBTASK-01.4: Migración DDL y RPC para Hojas de Personaje Mejoradas (Vistas A–G)**
  - **Objetivo:** Ampliar de forma idempotente `characters` y `demo_characters` con `background`, `active_effects`, `class_resources`, `personality`, `backstory`, `death_saves`, `inspiration`, `exhaustion`, `concentrating_on`, `skills`, `saving_throws_prof`, `multiclass`, `spellcasting_stats`, `attunement_slots`, `known_spells`. Crear funciones RPC seguras `apply_character_effect` y `remove_character_effect` y publicación en Supabase Realtime.
  - **Archivos:** `scripts/sql/03_character_sheet_enhancements.sql`.
  - **Criterio de Aceptación:** Script 100% idempotente compatible con DataGrip y Supabase.

- [x] **SUBTASK-01.5: Script CLI de Volcado (`pnpm sync:pull`)**
  - **Objetivo:** Script que consulte el estado actual de los personajes en PostgreSQL y actualice las notas locales de Obsidian preservando el formato y frontmatter.
  - **Archivos:** `scripts/sync-characters-pull.mjs`.
  - **Criterio de Aceptación:** Actualización limpia y no destructiva de `content/wiki/Personajes_Jugadores/*.md` sin perder notas previas.

---

## 📜 Registro de Ejecución y Cambios (Log)

| Fecha | Agente / Dev | Subtarea | Resumen de Cambios Realizados |
| :--- | :--- | :--- | :--- |
| 2026-11-05 | backend-engineer | SUBTASK-01.1 | Creado esquema SQL relacional completo con tablas `players`, `campaigns`, `characters`, `campaign_characters`, `campaign_vault` y `demo_characters`. Ejecutado en DataGrip. |
| 2026-11-05 | backend-engineer | SUBTASK-01.2 | Creadas políticas RLS para todas las tablas con función de seguridad `is_dm()` compatible con DataGrip. |
| 2026-11-05 | backend-engineer | SUBTASK-01.3 | Creados y ejecutados `scripts/sync-characters-push.mjs` y `scripts/sync-demo-characters.mjs`. |
| 2026-11-06 | backend-engineer | SUBTASK-01.4 | Creado script SQL `03_character_sheet_enhancements.sql` con soporte para las 7 vistas (A a G), `active_effects` unificado, funciones RPC seguras y Supabase Realtime. |
| 2026-11-07 | solution-architect-critic / backend-engineer | SUBTASK-01.1 a 01.5 | Auditoría y saneamiento integral: blindaje RLS contra escalada de rol en `players`, `SET search_path = public` en funciones `SECURITY DEFINER`, adición de `class_resources`, `background`, `exhaustion`, `concentrating_on`, `spellcasting_stats` y paridad 100% en `demo_characters`. Reparación completa del parser en `sync-characters-push.mjs` y `sync-demo-characters.mjs`, e implementación de `scripts/sync-characters-pull.mjs`. Ejecutado y verificado en DataGrip. |
