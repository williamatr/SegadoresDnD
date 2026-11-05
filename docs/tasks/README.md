# Tablero de Tareas y Backlog - SegadoresDnD

> **Índice central de épicas y subtareas para el Agente Orquestador y desarrolladores.**
> Este documento rige el ciclo de vida de cualquier funcionalidad. Las tareas se gestionan como **Épicas** con subtareas granulares, checklists `[ ]` y registro histórico de cambios.

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
   * Añade la nueva épica a la tabla de este archivo.
4. **Registro Histórico Obligatorio (Log):**
   * Al finalizar cada subtarea, se marca con `[x]` y se añade una fila a la tabla de **Registro de Ejecución y Cambios** de esa tarea con fecha, agente responsable y resumen de lo realizado.

---

## 📋 Tablero de Épicas (Sprint 1: MVP Portal del Jugador)

| ID | Épica / Módulo | Estado | Agentes Asignados | Archivo de Especificación |
| :--- | :--- | :---: | :--- | :--- |
| **TASK-00** | **Infraestructura Base y Next.js Shell** | 🟡 Pendiente | `frontend-engineer`, `qa-integration-tester` | [task-00-base-infrastructure.md](./task-00-base-infrastructure.md) |
| **TASK-01** | **Landing Page Principal & Rutas** | 🟡 Pendiente | `frontend-engineer`, `theme-design-reviewer` | [task-01-landing-shell.md](./task-01-landing-shell.md) |
| **TASK-02** | **Core de Reglas D&D y Mocks SRD Legales** | 🟡 Pendiente | `backend-engineer`, `qa-integration-tester` | [task-02-dnd-core-mocks.md](./task-02-dnd-core-mocks.md) |
| **TASK-03** | **Componentes UI de la Hoja de Personaje** | 🟡 Pendiente | `frontend-engineer`, `theme-design-reviewer` | [task-03-character-sheet-ui.md](./task-03-character-sheet-ui.md) |
| **TASK-04** | **Motor Markdown & Compendio de Jugadores** | 🟡 Pendiente | `backend-engineer`, `frontend-engineer` | [task-04-obsidian-engine.md](./task-04-obsidian-engine.md) |
| **TASK-05** | **Base de Datos PostgreSQL & Scripts de Sync** | 🟡 Pendiente | `backend-engineer`, `solution-architect-critic` | [task-05-data-sync-backend.md](./task-05-data-sync-backend.md) |
| **TASK-06** | **Autenticación, Sesión y Allowlist (Google)** | 🟡 Pendiente | `backend-engineer`, `solution-architect-critic` | [task-06-auth-and-access-control.md](./task-06-auth-and-access-control.md) |

---

## 🔄 Flujo de Ejecución por Tarea

```mermaid
flowchart LR
    A["1. Consultar docs/tasks/\n(Checklist pendiente)"] --> B["2. Crítica y Blindaje\n(solution-architect-critic)"]
    B --> C["3. Ejecución de Subtarea\n(Frontend / Backend)"]
    C --> D["4. QA e Integración\n(qa-integration-tester)"]
    D --> E["5. Revisión Visual\n(theme-design-reviewer)"]
    E --> F["6. Marcar [x] y Log\n(Historial de la tarea) ✅"]
```
