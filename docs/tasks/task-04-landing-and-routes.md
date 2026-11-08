# TASK-04: Landing Page, Buscador de Hechizos (`/hechizos`) y Cascarón de Rutas (`/demo`, `/portal`)

> **Estado General:** 🟢 Completada
> **Agentes Responsables:** `frontend-engineer`, `theme-design-reviewer`
> **Paquetes Afectados:** `apps/segadores-web`, `packages/ui`

---

## 🎯 Objetivo de la Épica
Modularizar la Landing Page principal (`/`), añadir la sección/modal *"Acerca del Proyecto"* y construir las rutas contenedoras `/demo`, `/portal` y el buscador interactivo de compendio `/hechizos` consumiendo `@segadores/obsidian-engine`.

---

## 📋 Subtareas y Checklist

- [x] **SUBTASK-04.1: Modularización del Hero, Navegación y Modal "Acerca del Proyecto"**
  - **Objetivo:** Extraer componentes reutilizables de cabecera y pie de página (`Header`, `Footer`), ajustar los botones de acción hacia `/portal` y `/demo`, e implementar el modal informativo *"Acerca del Proyecto"* explicando la filosofía de software libre (MIT + CC-BY-4.0) y el origen en la mesa de William Tovar.
  - **Archivos:** `apps/segadores-web/app/page.tsx`, `apps/segadores-web/components/landing/about-project-modal.tsx`, `apps/segadores-web/components/layout/header.tsx`, `apps/segadores-web/components/layout/footer.tsx`.
  - **Criterio de Aceptación:** Navegación accesible por teclado, estética de fantasía y atribución legal completa.

- [x] **SUBTASK-04.2: Buscador y Compendio de Hechizos (`/hechizos`)**
  - **Objetivo:** Construir la vista `/hechizos` en `apps/segadores-web` conectada al extractor de `@segadores/obsidian-engine`, con filtros en tiempo real por nivel (Truco a Nivel 9), clase, escuela de magia y componentes (`V`, `S`, `M`, Concentración, Ritual).
  - **Archivos:** `apps/segadores-web/app/hechizos/page.tsx`, `apps/segadores-web/components/spells/spell-explorer.tsx`.
  - **Criterio de Aceptación:** Búsqueda instantánea en cliente sin recargar la página y soporte automático de fallback a mocks SRD.

- [x] **SUBTASK-04.3: Cascarones de Rutas para Demo Pública (`/demo`) y Portal Privado (`/portal`)**
  - **Objetivo:** Crear las páginas `/demo` (selector de las 12 plantillas de clase con persistencia en `localStorage`) y `/portal` (selector de los 5 personajes de *Segadores de Orcos* y el Baúl de la Compañía) listas para montar el componente `<CharacterSheet />`.
  - **Archivos:** `apps/segadores-web/app/demo/page.tsx`, `apps/segadores-web/app/portal/page.tsx`.
  - **Criterio de Aceptación:** Cero enlaces rotos (404) desde la Landing Page y carga correcta de datos iniciales.

---

## 📜 Registro de Ejecución y Cambios (Log)

| Fecha | Agente / Dev | Subtarea | Resumen de Cambios Realizados |
| :--- | :--- | :--- | :--- |
| 2026-11-08 | `frontend-engineer`, `theme-design-reviewer` | `SUBTASK-04.1` a `04.3` | Implementación y cierre de TASK-04: modularización de `Header` y `Footer`, creación del modal accesible `AboutProjectModal` (MIT + CC-BY-4.0), buscador reactivo `/hechizos` conectado a `@segadores/obsidian-engine`, selector público `/demo` con los 12 arquetipos canónicos y cascarón del portal `/portal` con los 5 personajes de campaña, simulador anti-metajuego (Jugador vs DM) y baúl compartido (`campaign_vault`). Compilación Next.js 14 limpia al 100%. |
