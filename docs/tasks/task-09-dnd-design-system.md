# TASK-09: Sistema de Diseño Editorial D&D 5e (Tokens, Pergamino, Heráldica y Tipografía)

> **Estado General:** 🟢 Completada
> **Agentes Responsables:** `frontend-engineer`, `theme-design-reviewer`
> **Paquetes Afectados:** `packages/ui`, `apps/segadores-web`

---

## 🎯 Objetivo de la Épica
Establecer los cimientos visuales del nuevo lenguaje de diseño inspirado directamente en los manuales oficiales de Dungeons & Dragons (*Player's Handbook 2024*, *Monster Manual*, *Caldero de Tasha* y hojas oficiales). 
Reemplazar la estética moderna genérica ("estilo SaaS / iOS con fondos oscuros planos y glassmorphism") por una **experiencia táctil de libro de rol impreso**: papel pergamino cálido, tipografía editorial con jerarquía carmesí/terracota/oro, bordes grabados con esquinas acanaladas y líneas cónicas divisoras (*tapered rules*).

---

## 📋 Subtareas y Checklist

- [x] **SUBTASK-09.1: Paleta de Colores Canónica D&D y Texturas de Pergamino en Tailwind**
  - **Objetivo:** Configurar en `tailwind.config` de `apps/segadores-web` y `@segadores/ui` la paleta cromática extraída de los manuales físicos:
    - `dnd-parchment`: `#fdf6ea` (fondo de página de libro claro).
    - `dnd-parchment-dark`: `#f4ebe1` (pergamino envejecido para tarjetas y paneles).
    - `dnd-parchment-contrast`: `#ede2cb` (fondo para tablas y callouts).
    - `dnd-crimson`: `#58180D` (carmesí profundo canónico para H1 y marcos heráldicos).
    - `dnd-crimson-hover`: `#7a2021` (carmesí brillante para estados activos y botones).
    - `dnd-terracotta`: `#c45b1d` / `#b35a22` (terracota / ocre para H2 y badges).
    - `dnd-gold`: `#c29b38` / `#bfa254` (oro viejo envejecido para acentos y sellos).
    - `dnd-ink`: `#242528` (tinta negra editorial de imprenta para texto corrido).
    - `dnd-ink-muted`: `#58544d` (tinta atenuada para metadatos y subtítulos).
    - `dnd-border-antique`: `#d4c2a5` / `#c4b192` (filetes y bordes envejecidos).
  - **Archivos:** `apps/segadores-web/tailwind.config.ts`, `apps/segadores-web/app/globals.css`.

- [x] **SUBTASK-09.2: Tipografía de Manual Editorial de D&D (Google Fonts & Fallbacks)**
  - **Objetivo:** Incorporar la tríada tipográfica oficial en Next.js:
    - **Títulos y Rótulos Heráldicos:** `Cinzel` (emulando *Nodesto Caps* y *Modesto* de Wizards of the Coast).
    - **Cuerpo Narrativo y Mecánicas:** `Spectral` / `Crimson Pro` (emulando *Book Antiqua* / *Mrs Eaves* de imprenta).
    - Clases de utilidad y variables CSS en `globals.css`: `.font-dnd-title`, `.font-dnd-body`.
  - **Archivos:** `apps/segadores-web/app/layout.tsx`, `apps/segadores-web/app/globals.css`.

- [x] **SUBTASK-09.3: Componentes Anatómicos Core en `@segadores/ui`**
  - **Objetivo:** Construir los bloques de construcción gráficos que emulan los manuales:
    - **`TaperedRule`:** Componente SVG con la línea divisoria cónica en degradado carmesí/dorado.
    - **`ParchmentFrame`:** Contenedores con esquinas biseladas (45° / *notched corners*) y relieve de pergamino.
    - **`DropCap`:** Letra capitular iluminada de 2 líneas de alto para inicios de sección.
    - **`HeraldicShield`:** Escudo medieval heráldico (heater shield) para Clase de Armadura (CA).
    - **`DndBadge`:** Insignias de versalitas con estilos de cintilla y cera carmesí/oro.
    - **`DndTable`:** Estructura de tabla con cabecera vino y filas alternadas pergamino.
    - **Tests unitarios:** 8 pruebas automatizadas ejecutadas y validadas con `renderToStaticMarkup`.
  - **Archivos:** `packages/ui/src/components/*`, `packages/ui/index.ts`, `packages/ui/src/tests/components.test.ts`.

---

## 📜 Registro de Ejecución y Cambios (Log)

| Fecha | Agente / Dev | Subtarea | Resumen de Cambios Realizados |
| :--- | :--- | :--- | :--- |
| 2026-11-08 | `frontend-engineer` | SUBTASK-09.1, 09.2, 09.3 | Implementación completa de tokens Tailwind, tipografía Cinzel/Spectral, utilidades de pergamino y suite anatómica en `@segadores/ui` con 8 tests unitarios. |
