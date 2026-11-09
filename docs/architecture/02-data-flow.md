# 02 - Flujos de Datos (Data Flow Architecture)

El sistema opera bajo una distinción arquitectónica estricta entre **datos referenciales estáticos** y **datos de estado interactivo**.

---

## 1. Flujo Unidireccional (Datos Referenciales: Hechizos, Clases, Equipo)

Las reglas, conjuros, clases y descripciones de equipo son datos estáticos que no mutan durante una sesión de combate. Se leen desde Markdown en tiempo de compilación o Server-Side Rendering (SSR).

```mermaid
sequenceDiagram
    autonumber
    participant Obsidian as Bóveda Obsidian / Mocks
    participant Engine as @segadores/obsidian-engine
    participant NextApp as Next.js Server (apps/segadores-web)
    participant CDN as Vercel Edge / CDN
    participant Client as Navegador del Jugador

    Obsidian->>Engine: Entrega contenido Markdown + YAML Frontmatter
    Engine->>Engine: Parsea Frontmatter, formatea Wikilinks y Callouts
    Engine->>NextApp: Retorna objetos tipados (Spell, CharacterClass)
    NextApp->>CDN: Genera páginas cacheadas (SSG / ISR)
    Client->>CDN: Solicita /hechizos o consulta modal
    CDN-->>Client: Respuesta instantánea (0 ms, sin tocar base de datos)
```

---

## 2. Flujo Bidireccional (Hojas de Personaje: Estado en Vivo)

Los puntos de golpe (HP), ranuras de conjuro gastadas, inventario y notas de sesión cambian segundo a segundo en combate. Requieren persistencia inmediata en PostgreSQL y sincronización con las notas del DM.

```mermaid
sequenceDiagram
    autonumber
    actor Jugador as Jugador (Web)
    participant SheetUI as @segadores/character-sheet
    participant WebApp as Next.js App Router
    participant DB as PostgreSQL / Supabase
    actor DM as Dungeon Master (Obsidian / DataGrip)
    participant Script as Script CLI (pnpm sync:pull / push)
    participant Vault as content/wiki/Personajes_Jugadores/

    Jugador->>SheetUI: Resta 8 HP / Gasta ranura nivel 2
    SheetUI->>WebApp: Dispara Server Action o mutación optimista
    WebApp->>DB: UPDATE public.characters SET current_hp, spell_slots
    DB-->>WebApp: Confirmación + Evento Realtime (WebSocket)
    WebApp-->>SheetUI: Estado actualizado en pantalla

    opt Sincronización con Obsidian (Fin de Sesión)
        DM->>Script: Ejecuta pnpm sync:pull
        Script->>DB: SELECT * FROM public.characters
        Script->>Vault: Actualiza Frontmatter y Markdown en Alizar.md, Eru.md, etc.
        Vault-->>DM: Notas de Obsidian actualizadas con el estado final
    end
```

---

## 4. Guía Maestra de Sincronización

Para consultar los diagramas completos del pipeline de 3 eslabones (`Bóveda -> GitHub -> content/wiki/ -> Supabase -> Vercel`), la estructura exacta de tablas y la prohibición estricta de rutas locales externas, consulta **[Guía Canónica de Sincronización de Base de Datos y Lore](../DATABASE_SYNC_GUIDE.md)**.


```text
┌──────────────────────┬──────────────────────┬─────────────────────────────────────┐
│ Tipo de Información  │ Almacenamiento       │ Justificación Técnica               │
├──────────────────────┼──────────────────────┼─────────────────────────────────────┤
│ Vitalidad (HP/Dados) │ PostgreSQL (DB)      │ Mutaciones frecuentes en combate.   │
│ Ranuras de Conjuro   │ PostgreSQL (DB)      │ Estado volátil por descanso.        │
│ Inventario / Oro     │ PostgreSQL (JSONB)   │ Mutaciones en sesión.               │
│ Catálogo de Hechizos │ Markdown / JSON      │ Estático; búsqueda ultra rápida.    │
│ Reglas de Clases     │ Markdown / JSON      │ Canónico SRD 5.1/5.2.               │
│ Notas Privadas DM    │ Obsidian (content/)  │ Jamás expuestas a los jugadores.    │
└──────────────────────┴──────────────────────┴─────────────────────────────────────┘
```
