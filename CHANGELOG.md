# Changelog (Registro de Cambios)

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/)
y este proyecto se adhiere a [Semantic Versioning](https://semver.org/lang/es/).

---

## [Unreleased] (Sin Publicar)

### Añadido
* **Arquitectura de Base de Datos Relacional y RLS en Supabase:** Creación de DDL (`scripts/sql/01_init_schema.sql`) y políticas de Row Level Security (`scripts/sql/02_rls_policies.sql`) con soporte de relación N:M (`campaign_characters`), baúl de campaña compartido (`campaign_vault`) y personajes de demostración aislados (`demo_characters`).
* **Scripts de Ingesta y Sincronización:**
  * `scripts/sync-characters-push.mjs` (`pnpm sync:push`): Ingesta y sanitización de fichas reales de jugadores desde Obsidian a PostgreSQL.
  * `scripts/sync-demo-characters.mjs` (`pnpm sync:demo`): Ingesta de 12 arquetipos de clase canónicos para la demo pública.
* **Sistema de Pre-Commit y Auditoría de Seguridad Automatizada:**
  * Hook nativo en `.githooks/pre-commit` vinculado mediante `prepare` (`git config core.hooksPath .githooks`).
  * Script `scripts/verify-secrets.mjs` que valida:
    * Detección de credenciales y secretos (GitHub PATs, Supabase JWTs/Service Keys, connection strings con contraseñas, claves privadas SSH/RSA/PGP, tokens AWS/Vercel).
    * Protección de Privacidad y PII: Bloqueo de correos electrónicos personales o reales (solo `@ejemplo.com` / `@example.com` autorizados), rutas absolutas locales del usuario (`/home/<usuario>`, `/Users/<usuario>`), especificaciones de hardware personal y posibles números telefónicos.
    * Bloqueo de nombres de archivo sensibles (`.env*`, `*system_specs*`, `*specs_report*`, `*personal*`, `*.pem`, `*.key`, `serviceAccount*.json`, temporales, volcados).
    * Restricción estricta de archivos `.sql` fuera de `scripts/sql/`.
    * Prohibición absoluta de archivos `.pdf` y control de tamaño máximo por archivo (10 MB).
    * Validador de sintaxis `.json` para prevenir fallos de compilación en CI/CD y Vercel.
    * Auditoría anti-metajuego y fugas de lore (`#dm-only`, `visibility: dm`, `> [!dm]`) en mocks públicos (`content/mocks/`).
* **Framework Multi-Agente y Backlog Estructurado:** Especificación de roles especialistas en `.agents/` y backlog de tareas en `docs/tasks/` (`task-00` a `task-06`).
* **Arquitectura de Visibilidad de Lore y Anti-Metajuego (Player vs DM):** Especificación en `PROJECT_SPEC.md` (Sección 4.4) y `GEMINI.md` (Regla 8) para el filtrado estricto por roles (`player` vs `dm`) mediante frontmatter (`visibility: 'player' | 'dm'`), tags (`#player-facing`, `#dm-only`) y callouts secretos (`> [!dm]`) procesados por `@segadores/obsidian-engine`.

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
