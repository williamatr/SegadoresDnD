# TASK-10: Refactor Visual de la Hoja de Personaje D&D 5e (Heráldica, Escudo CA, Cajas Notched y Tarjetas de Hechizos)

> **Estado General:** 🟢 Completado
> **Agentes Responsables:** `frontend-engineer`, `theme-design-reviewer`
> **Paquetes Afectados:** `packages/character-sheet`, `apps/segadores-web`

---

## 🎯 Objetivo de la Épica
Transformar integralmente el componente `@segadores/character-sheet` y sus vistas satélite desde la estética actual tipo "aplicación web oscura / panel SaaS" hacia una **réplica digital fiel y táctil de la hoja de personaje oficial de Dungeons & Dragons 5.5e / 2024**.

Aprovechando los tokens y componentes de `TASK-09`, se implementarán los elementos icónicos de las hojas impresas: el escudo medieval heráldico de CA, las cajas de atributos biseladas (*notched*) con óvalo inferior para modificadores, los orbes de salvación contra la muerte, el monedero vertical de 5 monedas y las tarjetas de inventario y conjuros con filetes y cabeceras de estilo manual.

---

## 📋 Subtareas y Checklist

- [x] **SUBTASK-10.1: Cabecera Heráldica y Cintillas de Pergamino del Aventurero**
  - **Objetivo:** Rediseñar la cabecera del personaje (`CharacterSheet.tsx`) para emular el encabezado clásico de manual:
    - Marco superior de pergamino envejecido (`#fdf6ea`) con bordes biselados `dnd-notched`, doble filete dorado/carmesí y sombra de hoja física.
    - Cintillas de pergamino para: Nombre del Personaje en `Cinzel` (`#58180D`), Clase & Nivel (`DndBadge` carmesí), Especie (`DndBadge` pergamino), Trasfondo, Alineamiento y Puntos de Experiencia.
    - Línea divisoria cónica `TaperedRule` y barra de vitalidad y defensas con tipografía editorial.
    - Pestañas de navegación A-G transformadas en marcadores de libro de cuero repujado (`#2c1e18`) y pergamino activo.
  - **Archivos:** `packages/character-sheet/src/CharacterSheet.tsx`.

- [x] **SUBTASK-10.2: Cajas de Características Clásicas Notched y Modificadores de Atributo**
  - **Objetivo:** Refactorizar la columna de características (`CoreStatsView.tsx`):
    - Cajas rectangulares con esquinas biseladas (45° / `dnd-notched-sm`) en pergamino claro con doble borde `border-[#d4c2a5]`.
    - Distribución canónica de manual: Puntuación base en número pequeño (`Base: 16`), Modificador grande protagónico en un óvalo/círculo central (`+3`), y tirada de salvación con indicador de maestría (punto relleno `●` o vacío `○`) en versalitas.
  - **Archivos:** `packages/character-sheet/src/views/CoreStatsView.tsx`.

- [x] **SUBTASK-10.3: Tríada de Combate Canónica (Escudo Medieval, Octágonos y Orbes de Muerte)**
  - **Objetivo:** Implementar los tres módulos centrales de combate de la hoja física:
    - **Clase de Armadura (CA):** Silueta SVG de escudo medieval de heráldica (*heater shield*) (`HeraldicShield.ts`) con textura de pergamino envejecido y número en relieve.
    - **Iniciativa y Velocidad:** Marcos con recorte biselado `dnd-notched` sobre pergamino y números grandes en `Cinzel`.
    - **Salvaciones contra la Muerte (*Death Saves*):** Remplazados los checkboxes genéricos por la tríada clásica de 3 orbes circulares encadenados `○─○─○` para Éxitos (verde bosque `#15803d`) y Fallos (carmesí `#58180D`) con línea horizontal conectora en `DeathSavesTracker.tsx`.
    - **Puntos de Golpe (*HpTracker.tsx*):** Contenedor de pergamino biselado, barra de vitalidad en carmesí degradado (`#58180D`) y botones táctiles en crema de manual.
  - **Archivos:** `packages/character-sheet/src/views/CoreStatsView.tsx`, `packages/character-sheet/src/components/DeathSavesTracker.tsx`, `packages/character-sheet/src/components/HpTracker.tsx`.

- [x] **SUBTASK-10.4: Monedero Apilado de 5 Monedas y Tarjetas de Inventario / Objetos Mágicos**
  - **Objetivo:** 
    - Monedero canónico con las 5 divisas en compartimentos rectangulares apilados: **PC** (Cobre), **PP** (Plata), **PE** (Electro), **PO** (Oro), **PPT** (Platino), con colores tenues metalizados acordes a cada metal.
    - Vista de inventario y equipo con formato de tarjeta de objeto mágico de los suplementos oficiales: cabecera en cinta ocre/terracota con espaciado de letras, texto de propiedad en cursiva con *lead-in* en negrita (`***Propiedad.***`) y pie de página en versalitas (`• OBJETO MÁGICO •`).
  - **Archivos:** `packages/character-sheet/src/views/InventoryView.tsx`, `packages/character-sheet/src/components/AttunementTracker.tsx`.

- [x] **SUBTASK-10.5: Grimorio y Libro de Conjuros de Mesa (Slots y Concentración)**
  - **Objetivo:** Refactorizar la pestaña de conjuros (`SpellsAndAbilitiesView.tsx`):
    - Separación de niveles de conjuro mediante líneas cónicas `TaperedRule` y títulos en `Cinzel`.
    - Selector interactivo de ranuras de conjuro (*spell slots*) representados como gemas o círculos rúnicos interactivos (`●`/`○`) que se consumen o restauran con un clic.
    - Distintivos claros para conjuros que requieren **Concentración (C)** o pueden lanzarse como **Ritual (R)** mediante sellos circulares clásicos de D&D.
  - **Archivos:** `packages/character-sheet/src/views/SpellsAndAbilitiesView.tsx`.

---

## 📜 Registro de Ejecución y Cambios (Log)

| Fecha | Agente / Dev | Subtarea | Resumen de Cambios Realizados |
| :--- | :--- | :--- | :--- |
| 2026-11-08 | `frontend-engineer` | SUBTASK-10.1, 10.2, 10.3 | Implementada cabecera de pergamino, cintillas y pestañas de libro de cuero en `CharacterSheet.tsx`, escudo medieval CA, cajas de características notched y 3 orbes encadenados de muerte en `DeathSavesTracker.tsx`. |
| 2026-11-08 | `frontend-engineer` | SUBTASK-10.4, 10.5 | Implementado monedero canónico de 5 divisas y tarjetas de objetos mágicos en `InventoryView.tsx`. Implementado grimorio con gemas de espacios de conjuro y sellos de Concentración/Ritual en `SpellsAndAbilitiesView.tsx`. |
