# TASK-07: Ingesta del Compendio Público SRD 5.2.1 (PDF), Habilidades Marciales y Segregación de Licencias

> **Estado General:** 🟡 Pendiente
> **Agentes Responsables:** `backend-engineer`, `frontend-engineer`
> **Paquetes Afectados:** `content/mocks/`, `packages/obsidian-engine`, `apps/segadores-web`

---

## 🎯 Objetivo de la Épica
1. Ingestar el catálogo completo de conjuros y habilidades de clase desde el manual oficial **`content/wiki/Assets/SP_SRD_CC_v5.2.1.pdf`** hacia **`content/mocks/Hechizos/`** y **`content/mocks/Habilidades/`** amparado estrictamente bajo la licencia Creative Commons CC-BY-4.0.
2. Incorporar soporte para **Habilidades y Maniobras de Combate** para que las clases marciales (Guerrero, Bárbaro, Monje, Pícaro) tengan su propio catálogo de acciones tácticas en el compendio (*Second Wind, Furia, Acción Súbita, Artes Marciales, etc.*).
3. Implementar la **segregación estricta de licencias y visibilidad**:
   - En la **Demo Pública (`/demo`) y accesos sin sesión**: Cargar única y exclusivamente los datos de `content/mocks/` (100% CC-BY-4.0).
   - En el **Portal de Campaña (`/portal`) autenticado**: Cargar el compendio completo y privado de la campaña (`content/wiki/`).
4. Soporte para prefiltrado automático por clase y personaje (`/hechizos?clase=...` o `/compendio?clase=...`).

---

## 📋 Subtareas y Checklist

- [ ] **SUBTASK-07.1: Extractor e Ingesta de Conjuros Públicos desde `SP_SRD_CC_v5.2.1.pdf`**
  - **Objetivo:** Crear un script de ingesta segmentada (`scripts/ingest-srd-spells.mjs`) que procese el rango de páginas de conjuros del PDF oficial `SP_SRD_CC_v5.2.1.pdf` mediante `pdftotext` y genere notas estructuradas en `content/mocks/Hechizos/*.md` con frontmatter YAML compatible con `@segadores/obsidian-engine`.
  - **Archivos:** `scripts/ingest-srd-spells.mjs`, `content/mocks/Hechizos/*.md`.
  - **Criterio de Aceptación:** Genera todos los conjuros oficiales del SRD 5.2.1 con niveles, componentes y descripciones limpias.

- [ ] **SUBTASK-07.2: Ingesta de Habilidades y Rasgos de Clases Marciales (SRD 5.2.1)**
  - **Objetivo:** Ingestar las habilidades principales de combate (Acción Súbita, Segundo Aliento, Furia Temeraria, Artes Marciales, Acción Astuta, etc.) en `content/mocks/Habilidades/*.md` para dar soporte a las clases sin magia.
  - **Archivos:** `content/mocks/Habilidades/*.md`, `packages/obsidian-engine/src/parser/compendium-extractor.ts`.
  - **Criterio de Aceptación:** Extractor de compendio unificado capaz de devolver tanto `spells` como `features/abilities`.

- [ ] **SUBTASK-07.3: Segregación Estricta de Licencias (Modo Público / Demo vs Modo Campaña / Portal)**
  - **Objetivo:** Asegurar que las consultas públicas desde Next.js solo expongan los mocks de `content/mocks/` y que el material privado de `content/wiki/` solo se sirva cuando el usuario tenga una sesión válida en `/portal`.
  - **Archivos:** `apps/segadores-web/app/hechizos/page.tsx`, `packages/obsidian-engine/src/filters/anti-metagame.ts`.
  - **Criterio de Aceptación:** Cero exposición de material con copyright de la campaña privada en rutas o respuestas públicas.

- [ ] **SUBTASK-07.4: Navegación y Prefiltrado Dinámico en el Compendio Unificado**
  - **Objetivo:** Actualizar la UI del explorador para alternar entre "Hechizos" y "Habilidades de Clase", aplicando automáticamente el filtro de la clase o personaje cuando se navega desde `/demo` o `/portal`.
  - **Archivos:** `apps/segadores-web/components/spells/spell-explorer.tsx`.
  - **Criterio de Aceptación:** Al hacer clic en un personaje guerrero o mago, el compendio se abre directamente prefiltrado por su clase y tipo de habilidad.

---

## 📜 Registro de Ejecución y Cambios (Log)

| Fecha | Agente / Dev | Subtarea | Resumen de Cambios Realizados |
| :--- | :--- | :--- | :--- |
| *Sin iniciar* | - | - | - |
