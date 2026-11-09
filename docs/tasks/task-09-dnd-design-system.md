# TASK-09: Sistema de Diseño Editorial D&D 5e (Tokens, Pergamino, Heráldica y Tipografía)

> **Estado General:** 🔴 Alta Prioridad (Siguiente en Ejecución)
> **Agentes Responsables:** `frontend-engineer`, `theme-design-reviewer`
> **Paquetes Afectados:** `packages/ui`, `apps/segadores-web`

---

## 🎯 Objetivo de la Épica
Establecer los cimientos visuales del nuevo lenguaje de diseño inspirado directamente en los manuales oficiales de Dungeons & Dragons (*Player's Handbook 2024*, *Monster Manual*, *Caldero de Tasha* y hojas oficiales). 
Reemplazar la estética moderna genérica ("estilo SaaS / iOS con fondos oscuros planos y glassmorphism") por una **experiencia táctil de libro de rol impreso**: papel pergamino cálido, tipografía editorial con jerarquía carmesí/terracota/oro, bordes grabados con esquinas acanaladas y líneas cónicas divisoras (*tapered rules*).

---

## 📋 Subtareas y Checklist

- [ ] **SUBTASK-09.1: Paleta de Colores Canónica D&D y Texturas de Pergamino en Tailwind**
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
  - **Archivos:** `apps/segadores-web/tailwind.config.ts` (o `.js`), `packages/ui/` y estilos globales `apps/segadores-web/app/globals.css`.

- [ ] **SUBTASK-09.2: Tipografía de Manual Editorial de D&D (Google Fonts & Fallbacks)**
  - **Objetivo:** Incorporar la tríada tipográfica oficial en Next.js (`next/font/google`):
    - **Títulos y Rótulos Heráldicos:** `Cinzel` / `MedievalSharp` (emulando *Nodesto Caps* y *Modesto* de Wizards of the Coast).
    - **Cuerpo Narrativo y Mecánicas:** `Spectral` / `Crimson Pro` (emulando *Book Antiqua* / *Mrs Eaves* de imprenta).
    - **Tablas y Estadísticas Condensadas:** `Scaly Sans` / `Cinzel Decorative` para valores numéricos y tablas.
  - **Archivos:** `apps/segadores-web/app/layout.tsx`, clases de utilidad `.font-dnd-title`, `.font-dnd-body`, `.font-dnd-stats`.

- [ ] **SUBTASK-09.3: Componentes Anatómicos Core en `@segadores/ui`**
  - **Objetivo:** Construir los bloques de construcción gráficos que emulan los manuales:
    - **`TaperedRule`:** Componente SVG con la línea divisoria cónica (gruesa en el centro y fina en los extremos) en degradado carmesí/dorado.
    - **`ParchmentFrame` / `NotchedCard`:** Contenedores con esquinas cóncavas o biseladas (45° / *notched corners*) con borde doble envejecido.
    - **`DropCap`:** Letra capitular iluminada de 2 líneas de alto con grabado en oro viejo para inicios de sección.
    - **`HeraldicCrest` / `DndBadge`:** Contenedores circulares u ovalados para blasones de clase e insignias de bonificadores.
    - **`DndTable`:** Estructura de tabla con cabecera carmesí/vino y filas alternadas melocotón/pergamino (`#f2ded0` / `#fdf6ea`).
  - **Archivos:** `packages/ui/src/components/TaperedRule.tsx`, `packages/ui/src/components/ParchmentFrame.tsx`, `packages/ui/src/components/DropCap.tsx`, `packages/ui/src/components/DndTable.tsx`, `packages/ui/index.ts`.

---

## 📜 Registro de Ejecución y Cambios (Log)

| Fecha | Agente / Dev | Subtarea | Resumen de Cambios Realizados |
| :--- | :--- | :--- | :--- |
| *Pendiente* | `frontend-engineer` | - | Creación de la épica para el sistema de diseño D&D 5e. |
