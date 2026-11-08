# TASK-06: Suite de Hojas de Personaje para Jugadores (7 Vistas Interactivas A–G)

> **Estado General:** 🟢 Completado
> **Agentes Responsables:** `frontend-engineer`, `theme-design-reviewer`, `deep-reasoning-specialist`
> **Paquetes Afectados:** `packages/character-sheet`, `apps/segadores-web`

---

## 🎯 Objetivo de la Épica
Construir la experiencia interactiva completa de la Hoja de Personaje en `@segadores/character-sheet`, dividida en **7 vistas/pestañas temáticas (Vistas A a G)**, e integrarla tanto en `/demo` (con persistencia interactiva en estado y `localStorage`) como en `/portal` (conectada a los datos reales de los 5 personajes de la campaña).
Los componentes de `@segadores/character-sheet` son 100% puros y agnósticos (controlados por `props` y callbacks), apoyándose en `@segadores/dnd-core` para todos los cálculos y bloqueos de estado.

---

## 📋 Arquitectura de las 7 Vistas (Subtareas)

- [x] **SUBTASK-06.A: VISTA A - Estadísticas y Defensas Nucleares (`CoreStatsView`)**
  - **Objetivo:** Panel de control de combate y atributos:
    - 6 Atributos (FUE, DES, CON, INT, SAB, CAR) con valores base y modificadores calculados.
    - Clase de Armadura (CA) dinámica con desglose, Velocidad con penalizadores por fatiga o heridas, Iniciativa y Percepción Pasiva.
    - Puntos de Golpe: Máximo, Actual y Temporales con botones táctiles rápidos (`+1`, `-1`, `+5`, `-5`, curar, dañar) y alerta automática de tirada en Tabla A / Tabla B de Heridas.
    - Contador interactivo de Salvaciones contra la Muerte (*Death Saves*: 3 éxitos / 3 fallos con reseteo e indicadores de estabilización o muerte).
    - Dados de Golpe consumibles, descansos Corto y Largo, selector de Agotamiento D&D 5.5e (0–6 con desglose de penalizaciones a d20 y velocidad).
    - Recursos de clase consumibles (`class_resources`: Destello de Genialidad, Forma Salvaje, Nuevas Energías, Acción Súbita, Inspiración Bárdica, etc.).
    - Lista completa de las 18 competencias en Habilidades (marcando normal vs pericia).

- [x] **SUBTASK-06.B: VISTA B - Consola de Combate en Vivo (`CombatConsoleView`)**
  - **Objetivo:** Lo que el personaje tiene disponible en ese instante exacto para el combate:
    - Dividido por economía de acción oficial: **Acciones Principales**, **Acciones Adicionales** (incluyendo beber pociones según 5.5e), **Reacciones** e **Interacción con Objetos**.
    - **Comportamiento reactivo (vía `evaluateCharacterState` de `dnd-core`):** Las habilidades/conjuros bloqueados se muestran atenuados con badges explicativos (*"Bloqueado por: Apresado"*, *"Bloqueado: Silenciado (requiere componente Verbal)"*, *"Bloqueado por: Falta de Aire"*).
    - Lanzadores: Distinción de CD/Ataque por clase en multiclase (ej. INT 12 / +4 vs CAR 13 / +5 en Zuma).
    - Armas equipadas listas para impactar con su bonificador al ataque (`+8 al impacto`), desglose de dados (`1d8+5 cortante + 1d6 eléctrico + 1d6 fuego`) y simulador interactivo de tirada de ataque y daño.
    - Ranuras de conjuro interactivas por nivel con checkboxes para gastar y recuperar.
    - Indicador de Concentración activa con cálculo de CD por daño.

- [x] **SUBTASK-06.C: VISTA C - Inventario Inteligente y Sintonización (`InventoryView`)**
  - **Objetivo:** Mochila personal, armas, armaduras, objetos mágicos y monedero:
    - Armas y Armaduras: Botones de equipar/desequipar con impacto en CA y combate.
    - Objetos Sintonizados: Control visual del límite de 3 ranuras (o 4 para Artificiero nivel 10+), desactivando beneficios mágicos de objetos no sintonizados con toggle interactivo y alerta de sobrecupo.
    - Tarjetas con descripción, curiosidades y bagatelas de campaña (ej. *Bragas de Benyonce*, *Sirena de cuarzo azul*, *Colmillo orco*, *Carta de un muerto*).
    - Monedero personal (PC, PP, PE, PO, PPT).

- [x] **SUBTASK-06.D: VISTA D - Hechizos y Habilidades Generales (`SpellsAndAbilitiesView`)**
  - **Objetivo:** Dos sub-vistas / pestañas:
    1. **Adquiridas / Aprendidas:** Todo lo que posee actualmente por clase, raza, subclase o dote.
    2. **Árbol de Aprendizaje:** Todo lo que puede desbloquear en niveles futuros (8, 9 y 10) para planificar subidas de nivel.
    - **Filtros Avanzados:**
      - Por Nivel (Truco a Nivel 4+).
      - Por Función/Rol: Daño, Soporte / Curación, Control de Masas, Utilidad.
      - Por Componentes Mágicos: **V** (Verbal), **S** (Somático), **M** (Material), **C** (Concentración), **R** (Ritual).
      - Búsqueda por texto.

- [x] **SUBTASK-06.E: VISTA E - Lore, Personalidad y Crónica del Héroe (`LoreAndChronicleView`)**
  - **Objetivo:** Identidad narrativa e historia:
    - Rasgos de Personalidad, Ideales, Vínculos y Defectos editables.
    - Placeholders interactivos elegantes para campos pendientes (como en Solaria) permitiendo su edición inline inmediata.
    - Trasfondo formal (`background`) y alineamiento moral.
    - Crónica de Origen, Backstory y Apariencia Física.
    - Cuaderno de Notas de Sesión del jugador (`player_notes`) con persistencia.

- [x] **SUBTASK-06.F: VISTA F - Compendio Contextual de Reglas de mi Personaje (`ContextualRulesView`)**
  - **Objetivo:** Muestra únicamente las reglas mecánicas que aplican a este personaje concreto:
    - Propiedades de sus armas y armaduras equipadas (Sutil, Versátil, Ligera, Armadura pesada).
    - Reglas particulares únicas:
      - **Eru Lion:** Prótesis arcana de FUE 20 permanente y combo rúnico sónico de Gorthok.
      - **Alizar Thorne:** Tratamiento alquímico (+4 INT), elixires experimentales y aguante enano.
      - **Solaria:** Entidad simbiótica (+28 PG temp, 2d6 esporas, +1d6 necrótico) e infección fúngica.
      - **Honiel Spellbinder:** Esculpir conjuros en área, truco potenciado y defensa sin armadura.
      - **Zuma Kobold:** Ataque furtivo con Fuerza (+4d6 con Guanteletes de Ogro FUE 19), afortunado y mano de mago invisible.
    - Calculadora interactiva de la regla de multiclase al 50% con cálculo exacto de PX ahorrados mediante `calculateMulticlassLevelUpCost`.

- [x] **SUBTASK-06.G: VISTA G - Gestor de Condiciones, Heridas y Buffs (`ConditionsAndEffectsView`)**
  - **Objetivo:** Panel interactivo de estados en tiempo real:
    - Visualización de todos los `active_effects` (tipo, duración, quién lo aplicó, tratamiento) con botón para retirar.
    - **Tirador Interactivo de d20 para Heridas:** Selector de Tabla A (Heridas Menores) y Tabla B (Heridas Graves) con tirada animada de 1d20 y botón de aplicar a la ficha.
    - **Glosario de 15 Condiciones Estándar:** Activar / desactivar con 1 clic (Agarrado, Apresado, Asustado, Aturdido, Cegado, Derribado, Ensordecido, Envenenado, Hechizado, Incapacitado, Inconsciente, Invisible, Paralizado, Petrificado, Silenciado).
    - **Inyector de Buffs de Aliados:** Inyección rápida de *Guía*, *Bendición*, *Destello de Genialidad*, *Inspiración Bárdica*, *Escudo*.

---

## 📜 Registro de Ejecución y Cambios (Log)

| Fecha | Agente / Dev | Subtarea | Resumen de Cambios Realizados |
| :--- | :--- | :--- | :--- |
| 2026-11-08 | `deep-reasoning-specialist` | Ingesta 5 Héroes | Ingesta de los 5 personajes reales de `content/wiki/Personajes_Jugadores/` (`Alizar`, `Eru`, `Honiel`, `Solaria`, `Zuma`) reemplazando mocks inventados. Creación de `CAMPAIGN_FULL_CHARACTERS` con contrato canónico `Character`. |
| 2026-11-08 | `frontend-engineer` | SUBTASK-06.A a G | Construcción de la suite completa `@segadores/character-sheet`: `CharacterSheet`, `CoreStatsView`, `CombatConsoleView`, `InventoryView`, `SpellsAndAbilitiesView`, `LoreAndChronicleView`, `ContextualRulesView`, `ConditionsAndEffectsView`, y componentes tácticos (`HpTracker`, `DeathSavesTracker`, `ExhaustionSelector`, `ClassResourcesTracker`, `HitDiceTracker`, `AttunementTracker`). |
| 2026-11-08 | `frontend-engineer` | Integración Portal & Demo | Conexión de `CharacterSheet` en `portal-dashboard.tsx` y `app/demo/page.tsx` con soporte de persistencia local, reactividad y soporte para DM vs Jugador. |
| 2026-11-08 | `theme-design-reviewer` | Verificación & Tests | 34 tests unitarios pasando al 100% y verificación completa de tipos con `tsc --noEmit` en `apps/segadores-web`. |
