# TASK-10: Refactor Visual de la Hoja de Personaje D&D 5e (Heráldica, Escudo CA, Cajas Notched y Tarjetas de Hechizos)

> **Estado General:** 🟡 Pendiente (Desbloqueado tras TASK-09)
> **Agentes Responsables:** `frontend-engineer`, `theme-design-reviewer`
> **Paquetes Afectados:** `packages/character-sheet`, `apps/segadores-web`

---

## 🎯 Objetivo de la Épica
Transformar integralmente el componente `@segadores/character-sheet` y sus vistas satélite desde la estética actual tipo "aplicación web oscura / panel SaaS" hacia una **réplica digital fiel y táctil de la hoja de personaje oficial de Dungeons & Dragons 5.5e / 2024**.

Aprovechando los tokens y componentes de `TASK-09`, se implementarán los elementos icónicos de las hojas impresas: el escudo medieval heráldico de CA, las cajas de atributos biseladas (*notched*) con óvalo inferior para modificadores, los orbes de salvación contra la muerte, el monedero vertical de 5 monedas y las tarjetas de inventario y conjuros con filetes y cabeceras de estilo manual.

---

## 📋 Subtareas y Checklist

- [ ] **SUBTASK-10.1: Cabecera Heráldica y Cintillas de Pergamino del Aventurero**
  - **Objetivo:** Rediseñar la cabecera del personaje (`CharacterHeader.tsx`) para emular el encabezado clásico de manual:
    - Marco superior con cintillas de pergamino para: Nombre del Personaje, Clase & Nivel, Trasfondo, Especie / Raza, Alineamiento y Puntos de Experiencia.
    - Barra de Puntos de Golpe (HP) estilizada: contenedor de pergamino con reborde envejecido, números grandes de imprenta (`HP Actual / HP Máximo`), y barra de vitalidad en carmesí oscuro (`#58180D`) con textura de pulso o filete dorado en lugar de verde neón.
    - Indicador de Dados de Golpe (*Hit Dice*) y Puntos de Golpe Temporales con iconos de dados poliédricos grabados.
  - **Archivos:** `packages/character-sheet/src/components/CharacterHeader.tsx` (o subcomponentes asociados).

- [ ] **SUBTASK-10.2: Cajas de Características Clásicas Notched y Modificadores de Atributo**
  - **Objetivo:** Refactorizar la columna de características (`CoreStatsView.tsx` / `AbilityScores.tsx`):
    - Cajas rectangulares con esquinas biseladas (45° / *notched corners*) en pergamino claro con borde doble `dnd-border-antique`.
    - Distribución canónica de manual: Puntuación base en número pequeño en la parte superior central (ej. `16`) y Modificador grande protagónico en un óvalo/círculo recortado en la base inferior (ej. `+3`).
    - Lista de Tiradas de Salvación y Habilidades vinculadas directamente debajo o al costado de cada característica, con pequeños rombos/círculos de maestría (competencia y pericia/expertise) que se rellenan con tinta carmesí.
  - **Archivos:** `packages/character-sheet/src/components/CoreStatsView.tsx`, `packages/character-sheet/src/components/AbilityScores.tsx`.

- [ ] **SUBTASK-10.3: Tríada de Combate Canónica (Escudo Medieval, Octágonos y Orbes de Muerte)**
  - **Objetivo:** Implementar los tres módulos centrales de combate de la hoja física:
    - **Clase de Armadura (CA):** Silueta SVG de escudo medieval de heráldica (*heater shield*) con textura metálica/pergamino envejecido y número en relieve en fuente `Cinzel`.
    - **Iniciativa y Velocidad:** Marcos octagonales o biselados simétricos que contrasten con los rectángulos normales.
    - **Salvaciones contra la Muerte (*Death Saves*):** Remplazar los checkboxes genéricos por la tríada clásica de 3 orbes circulares encadenados `○-○-○` para Éxitos (tinta carmesí o verde bosque) y Fallos (tinta negra/cráneo).
  - **Archivos:** `packages/character-sheet/src/components/CombatStats.tsx`, `packages/character-sheet/src/components/DeathSavesTracker.tsx`.

- [ ] **SUBTASK-10.4: Monedero Apilado de 5 Monedas y Tarjetas de Inventario / Objetos Mágicos**
  - **Objetivo:** 
    - Monedero vertical canónico con las 5 divisas en compartimentos hexagonales o rectangulares apilados: **PC** (Cobre), **PP** (Plata), **PE** (Electro), **PO** (Oro), **PPT** (Platino), con colores tenues metalizados acordes a cada metal.
    - Vista de inventario y equipo con formato de tarjeta de objeto mágico de los suplementos oficiales: cabecera en cinta ocre/terracota con espaciado de letras, texto de propiedad en cursiva con *lead-in* en negrita (`***Propiedad.***`) y pie de página en versalitas (`• OBJETO MÁGICO •`).
  - **Archivos:** `packages/character-sheet/src/components/InventoryView.tsx`, `packages/character-sheet/src/components/EquipmentCard.tsx`.

- [ ] **SUBTASK-10.5: Grimorio y Libro de Conjuros de Mesa (Slots y Concentración)**
  - **Objetivo:** Refactorizar la pestaña de conjuros (`SpellsView.tsx`):
    - Separación de niveles de conjuro mediante líneas cónicas `TaperedRule` y títulos en `Cinzel`.
    - Selector de ranuras de conjuro (*spell slots*) representados como gemas o círculos rúnicos que se atenúan o vacían al consumirse.
    - Distintivos claros para conjuros que requieren **Concentración (C)** o pueden lanzarse como **Ritual (R)** mediante sellos circulares clásicos de D&D.
  - **Archivos:** `packages/character-sheet/src/components/SpellsView.tsx`, `packages/character-sheet/src/components/SpellCard.tsx`.

---

## 📜 Registro de Ejecución y Cambios (Log)

| Fecha | Agente / Dev | Subtarea | Resumen de Cambios Realizados |
| :--- | :--- | :--- | :--- |
| *Pendiente* | `frontend-engineer` | - | Creación de la épica para el refactor de la hoja de personaje D&D 5e. |
