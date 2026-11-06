# TASK-08: Motor de Reglas D&D y Evaluador de Estados (@segadores/dnd-core)

> **Estado General:** 🟡 Pendiente
> **Agentes Responsables:** `backend-engineer`, `qa-integration-tester`
> **Paquetes Afectados:** `packages/dnd-core`

---

## 🎯 Objetivo de la Épica
Implementar en `@segadores/dnd-core` la lógica matemática pura, tipos de TypeScript y funciones deterministas para:
1. Evaluar las condiciones activas, heridas de combate y buffs de un personaje, calculando modificadores netos y bloqueos de acciones.
2. Calcular bonificadores de armas, ataques y fórmulas de armaduras.
3. Integrar la matriz oficial de la **Tabla A (Heridas Menores - d20)** y **Tabla B (Heridas Graves - d20)** de la campaña.
4. Calcular la progresión de experiencia multiclase al 50% de coste en PX según las reglas de mesa de *Segadores de Orcos*.

---

## 📋 Subtareas y Checklist

- [ ] **SUBTASK-08.1: Contratos de Tipos TypeScript (`ActiveEffect`, `Condition`, `Injury`, `BuffDebuff`)**
  - **Objetivo:** Definir interfaces formales para `ActiveEffect` (tipo, duración, quién aplicó, modificadores mecánicos), `AbilityScores`, `DeathSaves`, `ArmorCalculation` y `ActionAvailability`.
  - **Archivos:** `packages/dnd-core/src/types/effects.ts`, `packages/dnd-core/src/types/character.ts`.
  - **Criterio de Aceptación:** Tipos 100% estrictos sin `any`.

- [ ] **SUBTASK-08.2: Matriz de Heridas en Combate (Tablas A y B)**
  - **Objetivo:** Mapear en código los 10 resultados de la Tabla A (d20) y los 10 de la Tabla B (d20) documentados en `02_Reglas_de_Mesa_y_Combate.md`.
  - **Archivos:** `packages/dnd-core/src/rules/lingering-injuries.ts`.
  - **Criterio de Aceptación:** Función determinista `getInjuryDetails(table: 'A' | 'B', d20Roll: number): InjuryDefinition`.

- [ ] **SUBTASK-08.3: Evaluador de Estados y Disponibilidad de Acciones (`evaluateCharacterState`)**
  - **Objetivo:** Función que recibe el personaje con sus `active_effects` y devuelve:
    - Modificadores netos calculados (CA final, velocidad final, ventajas/desventajas activas).
    - Acciones deshabilitadas con motivo explícito (ej. *Apresado* $\rightarrow$ desactiva movimiento y da desventaja en ataques; *Silenciado* $\rightarrow$ bloquea conjuros con componente Verbal; *Armadura puesta* $\rightarrow$ desactiva artes marciales de monje).
  - **Archivos:** `packages/dnd-core/src/rules/state-evaluator.ts`.
  - **Criterio de Aceptación:** Tests unitarios cubriendo los 5 casos de los jugadores de la campaña.

- [ ] **SUBTASK-08.4: Calculadora de Armas, Ataque y Daño (`calculateWeaponAttack`)**
  - **Objetivo:** Función que determina si un arma usa FUE o DES (propiedad *Sutil* / Finesse, como *Sa Yue* de Zuma), añade el bonificador de competencia si corresponde y formatea el daño base + dados mágicos adicionales.
  - **Archivos:** `packages/dnd-core/src/rules/combat-calculator.ts`.
  - **Criterio de Aceptación:** Soporta ataques con dos armas y daño elemental adicional.

- [ ] **SUBTASK-08.5: Calculadora de Experiencia y Progresión Multiclase (`calculateMulticlassCost`)**
  - **Objetivo:** Implementar la regla de alcance (*Catch-Up*): mientras la clase secundaria esté por debajo del nivel de la clase principal, cuesta el 50% de PX. Al igualar el nivel, cuesta el 100%.
  - **Archivos:** `packages/dnd-core/src/rules/multiclass.ts`.
  - **Criterio de Aceptación:** Test unitario validando los umbrales de 150 PX (nivel 1), 150 PX (nivel 2), 300 PX (nivel 3), etc.

---

## 📜 Registro de Ejecución y Cambios (Log)

| Fecha | Agente / Dev | Subtarea | Resumen de Cambios Realizados |
| :--- | :--- | :--- | :--- |
| *Sin iniciar* | - | - | - |
