# Tablero de Tareas y Backlog - SegadoresDnD

> **Índice central de épicas y subtareas para el Agente Orquestador y desarrolladores.**
> Este documento rige el ciclo de vida de cualquier funcionalidad. Las tareas están organizadas por **Sprints orientados al valor del jugador**, donde la experiencia inmersiva y visual de D&D tiene máxima prioridad para habilitar el juego y exploración de la mesa.

---

## 📜 Reglas de Gestión de Tareas (Protocolo de Backlog)

Cuando el usuario solicita implementar una funcionalidad o idea nueva, todos los agentes deben seguir este protocolo:

1. **Búsqueda y Mapeo Previo:**
   * El Orquestador revisa este tablero antes de escribir una sola línea de código.
2. **Si encaja en una Épica existente:**
   * **Incompleta:** Toma la siguiente subtarea pendiente `[ ]` sin rehacer lo que ya esté marcado con `[x]`.
   * **Completada:** Si se trata de una mejora o extensión, **añade una nueva subtarea (`SUBTASK-XX.N`)** a esa épica con su respectivo checklist, conservando intacto el historial anterior.
3. **Si es una funcionalidad nueva:**
   * Crea un nuevo archivo `docs/tasks/task-XX-[nombre].md` siguiendo la plantilla estándar de épica.
   * Añade la nueva épica a la tabla correspondiente en este archivo.
4. **Registro Histórico Obligatorio (Log):**
   * Al finalizar cada subtarea, se marca con `[x]` y se añade una fila a la tabla de **Registro de Ejecución y Cambios** de esa tarea con fecha, agente responsable y resumen de lo realizado.

---

## 📋 Tablero de Épicas por Sprint

### 🏆 Sprint 1: Fundaciones, Core de Reglas y Auth MVP (Completado 🟢)

| ID | Épica / Módulo | Estado | Agentes Asignados | Archivo de Especificación |
| :--- | :--- | :---: | :--- | :--- |
| **TASK-00** | **Infraestructura Base y Next.js Shell** | 🟢 Completada | `frontend-engineer`, `qa-integration-tester` | [task-00-base-infrastructure.md](./task-00-base-infrastructure.md) |
| **TASK-01** | **Base de Datos PostgreSQL, RLS y Sync Base** | 🟢 Completada | `backend-engineer`, `solution-architect-critic` | [task-01-database-and-sync.md](./task-01-database-and-sync.md) |
| **TASK-02** | **Core de Reglas D&D 5.5e y Evaluador de Estados (`@segadores/dnd-core`)** | 🟢 Completada | `backend-engineer`, `qa-integration-tester` | [task-02-dnd-core-rules-engine.md](./task-02-dnd-core-rules-engine.md) |
| **TASK-03** | **Motor Markdown, Callouts y Anti-Metajuego (`@segadores/obsidian-engine`)** | 🟢 Completada | `backend-engineer`, `frontend-engineer` | [task-03-obsidian-engine.md](./task-03-obsidian-engine.md) |
| **TASK-04** | **Landing Page, Compendio `/hechizos` y Cascarón de Rutas (`/demo`, `/portal`)** | 🟢 Completada | `frontend-engineer`, `theme-design-reviewer` | [task-04-landing-and-routes.md](./task-04-landing-and-routes.md) |
| **TASK-05** | **Autenticación Google OAuth, Allowlist y Clientes Supabase SSR** | 🟢 Completada | `backend-engineer`, `solution-architect-critic` | [task-05-auth-and-access-control.md](./task-05-auth-and-access-control.md) |

---

### 🔥 Sprint 2: Inmersión Visual D&D 5e y Experiencia del Jugador (PRIORIDAD MÁXIMA 🔴)
*Enfocado directamente en lo que ven y tocan los jugadores: estética de libro físico de D&D, hoja de personaje interactiva, escudo CA, cajas notched y grimorio.*

| ID | Épica / Módulo | Estado | Agentes Asignados | Archivo de Especificación |
| :--- | :--- | :---: | :--- | :--- |
| **TASK-09** | **Sistema de Diseño Editorial D&D 5e (Tokens, Pergamino, Heráldica y Tipografía)** | 🔴 Alta Prioridad | `frontend-engineer`, `theme-design-reviewer` | [task-09-dnd-design-system.md](./task-09-dnd-design-system.md) |
| **TASK-10** | **Refactor Visual de la Hoja de Personaje D&D 5e (Heráldica, Escudo CA, Cajas Notched y Tarjetas de Hechizos)** | 🟡 Pendiente | `frontend-engineer`, `theme-design-reviewer` | [task-10-dnd-character-sheet-refactor.md](./task-10-dnd-character-sheet-refactor.md) |
| **TASK-11** | **Inmersión Visual del Portal del Jugador, Wiki y Bitácora del DM** | 🟡 Pendiente | `frontend-engineer`, `theme-design-reviewer` | [task-11-portal-and-wiki-immersion.md](./task-11-portal-and-wiki-immersion.md) |

---

### 📦 Sprint 3: Herramientas Internas, Ingesta SRD y Vistas Avanzadas (Pospuesto a Sprint 3 🟡)
*Herramientas de soporte, sincronización y catálogos masivos que no bloquean las partidas ni la exploración de los jugadores.*

| ID | Épica / Módulo | Estado | Agentes Asignados | Archivo de Especificación |
| :--- | :--- | :---: | :--- | :--- |
| **TASK-06** | **Suite de Hojas de Personaje: Vistas Satélite Avanzadas (A–G) (`@segadores/character-sheet`)** | 🟡 Pospuesta | `frontend-engineer`, `theme-design-reviewer` | [task-06-character-sheet-ui.md](./task-06-character-sheet-ui.md) |
| **TASK-07** | **Ingesta del Compendio Público SRD 5.2.1 (PDF), Habilidades y Segregación** | 🟡 Pospuesta | `backend-engineer`, `frontend-engineer` | [task-07-public-srd-compendium.md](./task-07-public-srd-compendium.md) |
| **TASK-08** | **Motor CLI de Sincronización Inteligente (`sync:diff` y `sync:smart`)** | 🟡 Pospuesta | `backend-engineer`, `solution-architect-critic` | [task-08-smart-sync-engine.md](./task-08-smart-sync-engine.md) |

---

## 🔄 Mapa de Dependencias Secuenciales y Priorización

```mermaid
flowchart TD
    subgraph Sprint1["Sprint 1: Fundaciones & Auth (Completado 🟢)"]
        T00["TASK-00 🟢\nInfraestructura"] --> T01["TASK-01 🟢\nPostgreSQL & Sync"]
        T01 --> T02["TASK-02 🟢\n@segadores/dnd-core"]
        T02 --> T03["TASK-03 🟢\n@segadores/obsidian-engine"]
        T03 --> T04["TASK-04 🟢\nLanding & Rutas"]
        T04 --> T05["TASK-05 🟢\nAuth Google & SSR"]
    end

    subgraph Sprint2["Sprint 2: Experiencia Inmersiva D&D 5e (PRIORIDAD ACTUAL 🔴)"]
        T05 --> T09["TASK-09 🔴\nSistema de Diseño D&D 5e\n(Tokens, Pergamino, Fuentes, SVG)"]
        T09 --> T10["TASK-10 🟡\nRefactor Hoja Personaje\n(Escudo CA, Cajas Notched, Hechizos)"]
        T09 --> T11["TASK-11 🟡\nInmersión Portal, Wiki & DM\n(Lomo Cuero, Statblocks, Callouts)"]
    end

    subgraph Sprint3["Sprint 3: Herramientas Internas & Compendio (Pospuesto 🟡)"]
        T10 --> T06["TASK-06 🟡\nVistas Satélite Avanzadas A–G"]
        T11 --> T07["TASK-07 🟡\nIngesta SRD 5.2.1 PDF"]
        T07 --> T08["TASK-08 🟡\nSmart Sync Engine CLI"]
    end
```
