# TASK-03: Componentes Desacoplados de la Hoja de Personaje

> **Estado General:** 🟡 Pendiente
> **Agentes Responsables:** `frontend-engineer`, `theme-design-reviewer`
> **Paquetes Afectados:** `packages/character-sheet`, `packages/ui`

---

## 🎯 Objetivo de la Épica
Construir los componentes visuales puros y controlados para la hoja de personaje en `packages/character-sheet`. Cada componente debe ser 100% agnóstico a la infraestructura (sin dependencias de Supabase ni APIs directas), recibiendo datos por `props` y emitiendo mutaciones vía callbacks para su uso en la web y en la demo pública.

---

## 📋 Subtareas y Checklist

- [ ] **SUBTASK-03.1: Widget de Vitalidad y Puntos de Golpe (`HitPointsTracker`)**
  - **Objetivo:** Mostrar HP actual, máximo y temporal con botones táctiles rápidos (`+1`, `-1`, daño custom, curación rápida y dados de golpe).
  - **Archivos:** `packages/character-sheet/components/hit-points-tracker.tsx`.
  - **Criterio de Aceptación:** Botones táctiles de mínimo 44px de alto para fácil pulsación en teléfonos móviles.

- [ ] **SUBTASK-03.2: Rejilla de Ranuras de Conjuro (`SpellSlotsGrid`)**
  - **Objetivo:** Casillas interactivas para marcar ranuras de conjuro gastadas por nivel (niveles 1 al 9), con feedback visual y botón de reinicio por descanso largo.
  - **Archivos:** `packages/character-sheet/components/spell-slots-grid.tsx`.
  - **Criterio de Aceptación:** Estado controlado por props `(slots, onToggleSlot)`.

- [ ] **SUBTASK-03.3: Bloque de Atributos y Modificadores (`AbilityScoresBlock`)**
  - **Objetivo:** Vista compacta de los 6 atributos (FUE, DES, CON, INT, SAB, CAR) mostrando valor base y modificador calculado con estilo pergamino.
  - **Archivos:** `packages/character-sheet/components/ability-scores-block.tsx`.
  - **Criterio de Aceptación:** Modificadores calculados automáticamente vía `@segadores/dnd-core`.

- [ ] **SUBTASK-03.4: Listado de Hechizos Preparados e Inventario**
  - **Objetivo:** Lista de conjuros preparados/conocidos con tarjetas desplegables para ver detalles, y sección de inventario básico (armas, armaduras, monedas).
  - **Archivos:** `packages/character-sheet/components/prepared-spells-list.tsx`, `packages/character-sheet/components/inventory-list.tsx`.
  - **Criterio de Aceptación:** Desplegable ágil sin recargar pantalla.

- [ ] **SUBTASK-03.5: Componente Ensamblado `<CharacterSheet />`**
  - **Objetivo:** Ensamblar todos los submódulos en la vista principal de la hoja de personaje con diseño responsive de 1 columna en móvil y 2-3 columnas en tablet/escritorio.
  - **Archivos:** `packages/character-sheet/index.ts`.
  - **Criterio de Aceptación:** Componente puro importable con `<CharacterSheet data={character} onUpdate={handleUpdate} />`.

---

## 📜 Registro de Ejecución y Cambios (Log)

| Fecha | Agente / Dev | Subtarea | Resumen de Cambios Realizados |
| :--- | :--- | :--- | :--- |
| *Sin iniciar* | - | - | - |
