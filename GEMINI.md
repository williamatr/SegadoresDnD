# Reglas y Lineamientos del Proyecto SegadoresDnD

Este documento define las reglas de desarrollo, arquitectura, licencias y compatibilidad que DEBEN seguir todos los modelos de IA y desarrolladores que colaboren en este repositorio.

---

## 1. Licenciamiento Dual y Propiedad Intelectual

1. **Código Fuente del Proyecto (Licencia MIT):**
   * Todo el software original, lógica de TypeScript, componentes React, estilos Tailwind y configuraciones de infraestructura están bajo la licencia **MIT**.
   * Cualquier persona es libre de usar, estudiar y compilar el código fuente.
2. **Contenido de D&D y Mocks (Licencia Creative Commons CC-BY-4.0):**
   * Las reglas de juego, tablas y contenido textual de D&D presentes en `content/mocks/` derivan del **System Reference Document (SRD 5.1 / 5.2.1)** publicado por Wizards of the Coast LLC bajo licencia **CC-BY-4.0**.
   * La licencia CC-BY-4.0 **NO contamina el código fuente** (no es copyleft / no tiene cláusula ShareAlike). El código fuente sigue siendo 100% MIT.
   * **Atribución Obligatoria:** Se debe mantener la nota de atribución oficial a Wizards of the Coast en la documentación pública.

---

## 2. Regla Estricta para Generación de Mocks y Tests

* **Fuente Única Autorizada para Mocks Públicos:** Cualquier mock, dato de prueba o fixture añadido a `content/mocks/` o tests unitarios DEBE generarse **exclusivamente a partir del archivo oficial `SP_SRD_CC_v5.2.1.pdf`** (amparado bajo CC-BY-4.0).
* **Prohibición Terminante:**
  * **NUNCA** incluir datos reales de la campaña privada (`SegadoresDnD-Private`), notas del DM o fichas de los jugadores en carpetas públicas o tests.
  * **NUNCA** incluir material de libros comerciales con derechos exclusivos de Wizards of the Coast que no formen parte del SRD público (*Tasha's Cauldron of Everything*, *Xanathar's Guide to Everything*, *Monsters of the Multiverse*, etc.).
* **Estructura Estándar:** Los mocks deben usar la misma sintaxis compatible con `@segadores/obsidian-engine`: frontmatter YAML (`title`, `type`, `tags`), wikilinks relativos `[[...]]` y callouts temáticos (`[!statblock]`, `[!dnd-grid]`, `[!info]`).

---

## 3. Arquitectura del Monorepo (Inversión de Dependencias)

1. **Paquetes Agnósticos (`packages/*`):**
   * `@segadores/dnd-core`: Lógica matemática y reglas puras en TypeScript.
   * `@segadores/character-sheet`: Componentes UI puros y controlados.
   * `@segadores/obsidian-engine`: Parser agnóstico de Markdown y callouts.
   * **REGLA:** Estos paquetes **NUNCA** deben importar Supabase, cookies, ni variables de entorno. Reciben datos por `props` y notifican eventos vía callbacks.
2. **Aplicación Orquestadora (`apps/segadores-web`):**
   * Es la única autorizada para manejar Next.js App Router, llamadas a base de datos (Supabase), autenticación de Google y control de acceso.

---

## 4. Sincronización del Lore (Bóveda de Obsidian)

* **Submódulo Privado (`content/wiki/`):** Vinculado al repositorio privado `SegadoresDnD-Private`.
* **Script Inteligente (`scripts/sync-wiki.mjs`):**
  * `pnpm dev` ejecuta `predev` (`node scripts/sync-wiki.mjs`) con `GIT_TERMINAL_PROMPT=0`.
  * Si el entorno tiene acceso al repo privado, actualiza el submódulo silenciosamente.
  * Si el entorno es un clon público (reclutador / portafolio / sin internet), emite un aviso amigable y utiliza los mocks públicos de `content/mocks/` sin detener el arranque del servidor.

---

## 5. Mantenimiento de CHANGELOG y PRs

* En cada cambio funcional o corrección, actualizar la sección `[Unreleased]` de `CHANGELOG.md` antes de finalizar.
* Al abrir Pull Requests, completar `.github/pull_request_template.md`.

---

## 6. Especificaciones del Entorno Local

* **Sistema:** Arch Linux (Rolling Release) con KDE Plasma sobre Wayland.
* **Gestor de Paquetes:** `pnpm` (no `npm`), `pacman` y `yay` (nunca `apt`, `dnf` ni `paru`).
* **Terminal:** Editores `vim` o `nvim` (nunca `nano`).

---

## 7. Control de Versiones con Git (Regla Estricta para Agentes)

* **PROHIBICIÓN TOTAL DE `git push`:** Los agentes **NUNCA** deben ejecutar `git push` bajo ninguna circunstancia. El usuario es el **único** autorizado y encargado de realizar pushes a los repositorios remotos.
* **Confirmación Previa Obligatoria para `git commit` y `git add`:** Los agentes pueden preparar cambios con `git add` y proponer mensajes de commit semánticos, pero **SIEMPRE deben solicitar aprobación explícita al usuario ANTES de ejecutar el commit**, detallando claramente los archivos afectados y el mensaje que se va a utilizar.
* **Git Flow:** Ramas `feature/*` / `fix/*` $\rightarrow$ `develop` $\rightarrow$ `main`. Prohibido hacer commits directos a `main`.
