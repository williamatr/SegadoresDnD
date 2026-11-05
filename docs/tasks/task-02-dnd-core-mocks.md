# TASK-02: Core de Reglas D&D y Mocks SRD Legales

> **Estado General:** 🟡 Pendiente
> **Agentes Responsables:** `backend-engineer`, `qa-integration-tester`
> **Paquetes Afectados:** `packages/dnd-core`, `content/mocks`

---

## 🎯 Objetivo de la Épica
Construir la biblioteca desacoplada `@segadores/dnd-core` con la lógica matemática pura de D&D (atributos, modificadores, bono de competencia, ranuras de conjuro) y validar que los mocks públicos de `content/mocks/` cumplan estrictamente con la licencia Creative Commons CC-BY-4.0 del SRD oficial 5.1/5.2.1.

---

## 📋 Subtareas y Checklist

- [ ] **SUBTASK-02.1: Modelado de Interfaces y Tipos de TypeScript**
  - **Objetivo:** Definir tipos canónicos para Personaje, Atributos, Puntos de Golpe, Ranuras de Conjuro y Equipo.
  - **Archivos:** `packages/dnd-core/types/character.ts`, `packages/dnd-core/types/spells.ts`, `packages/dnd-core/index.ts`.
  - **Criterio de Aceptación:** Tipos 100% estrictos sin uso de `any`.

- [ ] **SUBTASK-02.2: Funciones Matemáticas Puras de D&D**
  - **Objetivo:** Implementar `calculateAbilityModifier(score)`, `calculateProficiencyBonus(level)`, `calculateSpellSaveDC(abilityMod, profBonus)` y lógica de descansos.
  - **Archivos:** `packages/dnd-core/rules/abilities.ts`, `packages/dnd-core/rules/combat.ts`.
  - **Criterio de Aceptación:** Funciones puras deterministas, sin efectos secundarios.

- [ ] **SUBTASK-02.3: Validación de Mocks Públicos Legales (SRD 5.1/5.2)**
  - **Objetivo:** Asegurar que los archivos en `content/mocks/` (Clases, Hechizos, Personajes) contengan datos que encajen con los tipos de `@segadores/dnd-core` y respeten el SRD público.
  - **Archivos:** `content/mocks/Personajes/*.md`, `content/mocks/Hechizos/*.md`.
  - **Criterio de Aceptación:** Prohibición absoluta de material comercial no amparado en CC-BY-4.0.

- [ ] **SUBTASK-02.4: Pruebas Unitarias Automatizadas**
  - **Objetivo:** Escribir tests unitarios para todas las fórmulas matemáticas.
  - **Archivos:** `packages/dnd-core/tests/rules.test.ts`.
  - **Criterio de Aceptación:** Cobertura de tests del 100% sobre las funciones matemáticas del core.

---

## 📜 Registro de Ejecución y Cambios (Log)

| Fecha | Agente / Dev | Subtarea | Resumen de Cambios Realizados |
| :--- | :--- | :--- | :--- |
| *Sin iniciar* | - | - | - |
