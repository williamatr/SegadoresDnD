# Changelog (Registro de Cambios)

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/)
y este proyecto se adhiere a [Semantic Versioning](https://semver.org/lang/es/).

---

## [Unreleased] (Sin Publicar)

## [0.0.1] - 2026-10-23

### Añadido
* **Arquitectura Monorepo:** Estructura modular basada en Turborepo y pnpm workspaces dividida en `apps/` y `packages/`.
* **Componentes Agnósticos:** Especificación de diseño de contratos de datos (`Data Contracts`) para desacoplar componentes de UI (`packages/character-sheet`), lógica pura (`packages/dnd-core`) y motor de Markdown (`packages/obsidian-engine`).
* **Estrategia de Dos Repositorios:** Separación entre el repositorio de código abierto/portafolio y el repositorio privado de notas de Obsidian (`content/wiki/` vía Git Submodule) para proteger material con derechos de autor de D&D.
* **Documentación Técnica:**
  * Creación de `PROJECT_SPEC.md` con arquitectura, esquemas de base de datos Supabase, reglas de seguridad y roadmap.
  * Creación de `SYSTEM_SPECS.md` con especificaciones del entorno de desarrollo (Arch Linux, KDE Wayland, `yay` como AUR helper, Node.js `v26.11.1` y `pnpm` `v11.28.5`).
  * Creación de plantilla oficial de Pull Request en `.github/pull_request_template.md`.
* **Licencia de Código:** Adopción de la licencia permisiva [MIT](./LICENSE) para el código y componentes del proyecto.
* **Estrategia de Ramas:** Definición del flujo Git Flow (`develop` $\rightarrow$ `main`) y configuración de GitHub Rulesets con protección contra force push, borrado accidental e historial lineal.
* **Reglas del Sistema para IAs (GEMINI.md):** Creación de [GEMINI.md](./GEMINI.md) para inyectar reglas estrictas de desarrollo, prohibición de exponer datos privados en mocks y convenciones de código a los agentes.
* **Políticas Estrictas de Git para Agentes:** Incorporación en [GEMINI.md](./GEMINI.md) de la prohibición absoluta de `git push`, solicitud obligatoria de confirmación previa para `git commit`/`git add` y apego estricto al Git Flow.
* **Mocks Públicos SRD 5.1/5.2.1 (content/mocks/):** Fixtures públicos amparados bajo Creative Commons (CC-BY-4.0) para pruebas y compilación pública sin requerir acceso al repo privado.
* **Script de Sincronización Inteligente (scripts/sync-wiki.mjs):** Script ejecutado en `predev` (`pnpm dev`) para sincronizar el submódulo o activar los mocks automáticamente sin romper el servidor.

### Cambiado
* Reemplazo de enlaces simbólicos de Linux (`ln -s`) por submódulos de Git para garantizar compatibilidad con Vercel.
* Vinculación del submódulo `content/wiki` apuntando al repositorio privado de notas (`SegadoresDnD-Private.git`).
