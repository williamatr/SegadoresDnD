# TASK-02: Core de Reglas D&D 5.5e y Evaluador de Estados (`@segadores/dnd-core`)

> **Estado General:** 🟢 Completada
> **Agentes Responsables:** `backend-engineer`, `qa-integration-tester`
> **Paquetes Afectados:** `packages/dnd-core`, `content/mocks`

---

## 🎯 Objetivo de la Épica
Construir la biblioteca desacoplada y 100% pura `@segadores/dnd-core` (cero dependencias de UI o base de datos) que consolide:
1. Todos los contratos de tipos TypeScript (`Character`, `ActiveEffect`, `ClassResource`, `Spell`, `InventoryItem`, `ArmorCalculation`, `ActionAvailability`) alineados 1:1 con el esquema PostgreSQL de `TASK-01`.
2. Las funciones matemáticas deterministas de D&D 5.5e (modificadores de característica, bono de competencia, CD y ataque de conjuros, cálculo de CA, ataques con armas *Sutiles/Finesse* y descansos corto/largo).
3. Las reglas de mesa oficiales de *Segadores de Orcos*: **Tablas A y B de Heridas en Combate (d20)** y **progresión de experiencia multiclase al 50% por alcance (*Catch-Up*)**.
4. El **Evaluador de Estados (`evaluateCharacterState`)** que procesa las condiciones activas, heridas, armadura equipada y buffs para determinar los modificadores netos y qué acciones o conjuros quedan bloqueados (con motivo explícito para la Vista B).
5. La validación de los mocks públicos en `content/mocks/` bajo licencia CC-BY-4.0 (SRD 5.1/5.2.1) y una suite de tests unitarios con cobertura del 100%.

---

## 📋 Subtareas y Checklist

- [x] **SUBTASK-02.1: Contratos de Tipos TypeScript Canónicos**
  - **Objetivo:** Definir interfaces estrictas para `Character`, `AbilityScores`, `SkillProficiency`, `MulticlassEntry`, `SpellcastingStat`, `ClassResource`, `InventoryItem`, `ActiveEffect` (`condition | injury | buff | debuff`), `DeathSaves`, `ArmorCalculation` y `ActionAvailability`.
  - **Archivos:** `packages/dnd-core/src/types/character.ts`, `packages/dnd-core/src/types/effects.ts`, `packages/dnd-core/src/types/spells.ts`, `packages/dnd-core/index.ts`.
  - **Criterio de Aceptación:** Tipos 100% estrictos sin uso de `any` y alineados con las columnas de `public.characters` y `public.demo_characters`.

- [x] **SUBTASK-02.2: Fórmulas Matemáticas Base, Armas, CA y Descansos (D&D 5.5e)**
  - **Objetivo:** Implementar funciones puras:
    - `calculateAbilityModifier(score)`, `calculateProficiencyBonus(level)`, `calculateSpellSaveDC(mod, pb)`, `calculateSpellAttackBonus(mod, pb)`, `calculateGrappleOrShoveDC(strScore, pb)`.
    - `calculateArmorClass(options)`: soporta sin armadura (`10+DES`), Defensa sin Armadura de Monje (`10+DES+SAB`), Defensa sin Armadura de Bárbaro (`10+DES+CON`), Armadura de Mago (`13+DES`), armaduras ligeras/medias/pesadas (respetando que las fórmulas no se acumulan), escudos y *Combatiente con dos armas* (+1 CA).
    - `calculateWeaponAttack(options)`: soporta armas cuerpo a cuerpo, a distancia y con propiedad *Sutil/Precisión (Finesse)* eligiendo automáticamente entre FUE y DES, más dados elementales adicionales y *Ataque Furtivo*.
    - `applyShortRest` y `applyLongRest` (recuperación de PG, dados de golpe, ranuras, reducción de 1 nivel de agotamiento y recarga de `class_resources`).
  - **Archivos:** `packages/dnd-core/src/rules/abilities.ts`, `packages/dnd-core/src/rules/combat-calculator.ts`.
  - **Criterio de Aceptación:** Funciones puras deterministas sin efectos secundarios.

- [x] **SUBTASK-02.3: Matriz de Heridas en Combate (Tablas A y B - d20)**
  - **Objetivo:** Mapear los 11 rangos de la **Tabla A (Heridas Menores / Estrés de Combate)** y los 12 rangos de la **Tabla B (Heridas Graves / Trauma Crítico)** con sus disparadores (`evaluateInjuryTrigger`), efectos mecánicos y método de curación.
  - **Archivos:** `packages/dnd-core/src/rules/lingering-injuries.ts`.
  - **Criterio de Aceptación:** Función determinista `getInjuryDetails(table: 'A' | 'B', d20Roll: number)` y `evaluateInjuryTrigger({ damageTaken, maxHp, currentHpAfterDamage, isCriticalHit, deathSaveRoll })`.

- [x] **SUBTASK-02.4: Calculadora de Experiencia y Progresión Multiclase al 50% (*Catch-Up*)**
  - **Objetivo:** Implementar la tabla oficial de umbrales de PX (niveles 1 a 20), cálculo de nivel de lanzador multiclase ($\times 1$ completos, $\lceil \div 2 \rceil$ medios lanzadores/Artífice, $\lfloor \div 3 \rfloor$ Caballero Arcano / Embaucador Arcano) y la regla de mesa del **50% de coste en PX** mientras la clase secundaria esté por debajo de la clase más alta.
  - **Archivos:** `packages/dnd-core/src/rules/multiclass.ts`.
  - **Criterio de Aceptación:** Valida exactamente los costes de alcance (`150 PX` Nv.1, `150 PX` Nv.2, `300 PX` Nv.3, `900 PX` Nv.4, etc.) y retorno al 100% al igualar nivel.

- [x] **SUBTASK-02.5: Evaluador de Estados y Disponibilidad de Acciones (`evaluateCharacterState`)**
  - **Objetivo:** Función que recibe un `Character` y evalúa sus `active_effects`, `exhaustion` (penalizador `-2 × Nivel` y `-5 × Nivel` pies), inventario equipado y reglas específicas de clase, devolviendo:
    - Estadísticas efectivas netas (CA final, velocidad final, penalizador d20, bonos de dados activos como `+1d4` por *Bendición*).
    - Bloqueos explícitos de acciones y conjuros (ej. *Silenciado* $\rightarrow$ bloquea conjuros con componente Verbal `V`; *Incapacitado/Aturdido/Paralizado* $\rightarrow$ bloquea acciones y reacciones y rompe concentración; *Agarrado/Apresado* $\rightarrow$ velocidad 0; *Armadura equipada en Monje* $\rightarrow$ bloquea *Artes Marciales* y *Movimiento sin Armadura* pero mantiene activos *Puntos de Ki*; *Artífice* $\rightarrow$ advierte requisito de foco `M`).
  - **Archivos:** `packages/dnd-core/src/rules/state-evaluator.ts`.
  - **Criterio de Aceptación:** Cubre las condiciones del SRD 5.2.1, las heridas de Tablas A/B y las interacciones tácticas de clase.

- [x] **SUBTASK-02.6: Validación de Mocks SRD (CC-BY-4.0) y Suite de Pruebas Unitarias**
  - **Objetivo:** Verificar el cumplimiento SRD de `content/mocks/` y ejecutar tests unitarios automatizados para todos los módulos de `@segadores/dnd-core`.
  - **Archivos:** `packages/dnd-core/src/tests/rules.test.ts`, `content/mocks/**`.
  - **Criterio de Aceptación:** `pnpm --filter @segadores/dnd-core test` pasa el 100% de los tests con código 0.

---

## 📜 Registro de Ejecución y Cambios (Log)

| Fecha | Agente / Dev | Subtarea | Resumen de Cambios Realizados |
| :--- | :--- | :--- | :--- |
| 2026-11-07 | `backend-engineer`, `qa-integration-tester` | `SUBTASK-02.1` a `02.6` | Implementación completa de `@segadores/dnd-core`: contratos de tipos 1:1 con PostgreSQL, fórmulas D&D 5.5e, calculadora de combate y descansos, Tablas A y B de heridas persistentes (d20), calculadora multiclase con regla del 50% en PX, evaluador de estados (`evaluateCharacterState`) y suite de 9 bloques de pruebas unitarias pasando al 100%. |
