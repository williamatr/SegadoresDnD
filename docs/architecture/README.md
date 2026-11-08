# Arquitectura del Sistema - SegadoresDnD

> **Directorio de referencia arquitectónica central para desarrolladores y agentes de IA.**
> Todos los agentes que colaboren en este repositorio deben consultar estos documentos y diagramas antes de implementar o refactorizar código.

---

## 🗺️ Mapa de Documentación

| Documento | Enfoque | Contenido Principal |
| :--- | :--- | :--- |
| **[01-system-overview.md](./01-system-overview.md)** | **Visión General** | Propósito del sistema, problema que resuelve, dualidad Pública (Demo) vs Privada (Campaña) y diagrama de alto nivel. |
| **[02-data-flow.md](./02-data-flow.md)** | **Flujo de Datos** | Diagramas de secuencia y flujo unidireccional (compendio estático) vs bidireccional (hojas interactivas con PostgreSQL y Obsidian). |
| **[03-monorepo-structure.md](./03-monorepo-structure.md)** | **Monorepo & Desacoplamiento** | Inversión de dependencias, límites de paquetes (`apps/*` vs `packages/*`), contratos de datos puros. |
| **[04-security-and-roles.md](./04-security-and-roles.md)** | **Seguridad y Permisos** | Google OAuth, lista blanca (`ALLOWED_EMAILS`), control Player vs DM, RLS en PostgreSQL y anti-metajuego (`> [!dm]`). |

---

## 🏛️ Diagrama General de la Arquitectura

```mermaid
flowchart TD
    subgraph Clientes [Entornos de Consumo]
        WEB_PUBLIC["Visitante / Reclutador (Ruta /demo)"]
        WEB_PLAYER["Jugador en Sesión (Ruta /portal)"]
        DM_LOCAL["Dungeon Master en Local (DataGrip + Obsidian)"]
    end

    subgraph Orquestador [apps/segadores-web (Next.js App Router)]
        LANDING["Landing Page (/) con 3 Opciones de Entrada"]
        AUTH_GATE["Middleware de Auth (Google + Allowlist)"]
        PORTAL_APP["Portal del Jugador & Compendio"]
    end

    subgraph PaquetesAgnosticos [packages/ - Librerías Puras]
        CORE["@segadores/dnd-core\n(Reglas, Fórmulas, Dados, Modificadores)"]
        SHEET["@segadores/character-sheet\n(Componentes UI puros y controlados)"]
        ENGINE["@segadores/obsidian-engine\n(Parser Markdown, Wikilinks, Callouts)"]
    end

    subgraph DatosYAlmacenamiento [Fuentes de Datos]
        DB_POSTGRES[(PostgreSQL / Supabase\nTablas: players, characters)]
        OBS_PRIVATE["Bóveda Obsidian Privada\n(content/wiki/ - Submódulo Git)"]
        MOCKS_PUBLIC["Mocks Públicos SRD 5.1/5.2\n(content/mocks/ - CC-BY-4.0)"]
    end

    WEB_PUBLIC --> LANDING
    WEB_PLAYER --> AUTH_GATE --> PORTAL_APP
    DM_LOCAL <-->|Inspección SQL| DB_POSTGRES
    DM_LOCAL <-->|Edición Notas| OBS_PRIVATE

    LANDING --> SHEET
    PORTAL_APP --> SHEET
    PORTAL_APP --> ENGINE
    SHEET --> CORE

    PORTAL_APP <-->|Mutaciones en vivo| DB_POSTGRES
    ENGINE -->|Compilación Lore Privado| OBS_PRIVATE
    ENGINE -->|Compilación Demo Pública| MOCKS_PUBLIC
```
