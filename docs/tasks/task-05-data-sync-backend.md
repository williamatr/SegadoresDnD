# TASK-05: Base de Datos PostgreSQL y Scripts de Sincronización

> **Estado General:** 🟡 Pendiente
> **Agentes Responsables:** `backend-engineer`, `solution-architect-critic`
> **Paquetes Afectados:** `scripts/`, `apps/segadores-web/lib/supabase`, base de datos PostgreSQL

---

## 🎯 Objetivo de la Épica
Definir las tablas `players` y `characters` en PostgreSQL (compatible con DataGrip y Supabase), e implementar los scripts CLI bidireccionales para leer las fichas iniciales de Obsidian (`Alizar.md`, `Eru.md`, `Honiel.md`, `Solaria.md`, `Zuma.md`), insertarlas en PostgreSQL (`sync:push`) y volcar el estado actualizado de la base de datos hacia las notas de Obsidian (`sync:pull`).

---

## 📋 Subtareas y Checklist

- [ ] **SUBTASK-05.1: Migración DDL para Tablas `players` y `characters`**
  - **Objetivo:** Crear script SQL con definición de tipos, campos JSONB (`ability_scores`, `spell_slots`, `inventory`), claves foráneas e índices.
  - **Archivos:** `scripts/sql/01_init_schema.sql`.
  - **Criterio de Aceptación:** Script ejecutable directamente en DataGrip o Supabase SQL Editor sin errores de sintaxis.

- [ ] **SUBTASK-05.2: Políticas de Seguridad Row Level Security (RLS)**
  - **Objetivo:** Definir políticas RLS que restrinjan a cada jugador a su propio registro y otorguen permisos globales al DM.
  - **Archivos:** `scripts/sql/02_rls_policies.sql`.
  - **Criterio de Aceptación:** Jugador no autenticado o con otro ID no puede leer ni modificar personajes ajenos.

- [ ] **SUBTASK-05.3: Script CLI de Ingesta (`pnpm sync:push`)**
  - **Objetivo:** Script Node.js que lea los 5 archivos Markdown en `content/wiki/Personajes_Jugadores/`, extraiga frontmatter y estadísticas `[!statblock]` y haga un `upsert` en PostgreSQL.
  - **Archivos:** `scripts/sync-characters-push.mjs`.
  - **Criterio de Aceptación:** Los 5 personajes quedan registrados en PostgreSQL con sus datos íntegros.

- [ ] **SUBTASK-05.4: Script CLI de Volcado (`pnpm sync:pull`)**
  - **Objetivo:** Script que consulte el estado actual de los personajes en PostgreSQL y actualice las notas locales de Obsidian preservando el formato y frontmatter.
  - **Archivos:** `scripts/sync-characters-pull.mjs`.
  - **Criterio de Aceptación:** Actualización limpia de `content/wiki/Personajes_Jugadores/*.md` sin perder notas previas.

---

## 📜 Registro de Ejecución y Cambios (Log)

| Fecha | Agente / Dev | Subtarea | Resumen de Cambios Realizados |
| :--- | :--- | :--- | :--- |
| *Sin iniciar* | - | - | - |
