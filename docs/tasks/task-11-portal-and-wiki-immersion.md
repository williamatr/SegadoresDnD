# TASK-11: Inmersión Visual del Portal del Jugador, Wiki y Bitácora del DM

> **Estado General:** 🟢 Completado
> **Agentes Responsables:** `frontend-engineer`, `theme-design-reviewer`
> **Paquetes Afectados:** `apps/segadores-web`, `packages/obsidian-engine`

---

## 🎯 Objetivo de la Épica
Extender la estética de tomo encuadernado y manual de D&D a todo el ecosistema de la aplicación web: el cascarón de navegación global, la portada y pantalla de acceso `/login`, el portal de campaña `/portal`, la consola del Dungeon Master y el renderizador de notas y compendios de lore (`@segadores/obsidian-engine`).

El objetivo es que los jugadores y el DM sientan que están abriendo un tomo físico de campaña, con lomo de cuero repujado, guardas de pergamino y sellos de lacre para las secciones privadas.

---

## 📋 Subtareas y Checklist

- [x] **SUBTASK-11.1: Barra de Navegación y Shell de Tomo Encuadernado (Header & Footer)**
  - **Objetivo:** 
    - Reemplazada la barra de navegación oscura moderna de `Header.tsx` por una banda con estética de lomo de cuero encuadernado (`#1c130e`), con doble filete dorado (`#c29b38`).
    - Logotipo "Segadores de Orcos" con tipografía `Cinzel` heráldica y escudo de dagas cruzadas grabado.
    - Menú de navegación con enlaces en versalitas / serifa y botón de acceso al portal como sello heráldico en carmesí oficial y oro.
    - Pie de página (`Footer.tsx`) con línea divisoria cónica `TaperedRule` dorada, atribución canónica a Wizards of the Coast (SRD 5.1 / 5.2.1 CC-BY-4.0) y detalles en estilo de colofón de imprenta antigua.
  - **Archivos:** `apps/segadores-web/components/layout/header.tsx`, `apps/segadores-web/components/layout/footer.tsx`.

- [x] **SUBTASK-11.2: Pantalla de Acceso `/login` y Portal de Campaña `/portal`**
  - **Objetivo:**
    - Transformada la pantalla `/login` en la portada o primera página de un libro de aventuras: fondo de pergamino claro con marco biselado `dnd-notched`, título en carmesí profundo `Cinzel` (`#58180D`), divisoria cónica `TaperedRule` y botón de "Continuar con Google" integrado con ornamentación de sello heráldico.
    - Portal de Campaña `/portal`: Tarjetas de los 5 personajes con marcos de pergamino biselados `dnd-notched-sm`, sellos de nivel, medallas de clase e insignias de estado (Vivo, PG en verde bosque, CA en oro viejo).
    - Consola del Dungeon Master (`dm-invitations-console.tsx`): Bitácora secreta del DM con tarjetas de pergamino, formulario de autorización con campos en crema de manual y distintivos de cera carmesí.
    - Baúl de la Compañía: Contenedor de pergamino con las reservas de oro, plata, pociones de curación y raciones.
  - **Archivos:** `apps/segadores-web/app/login/page.tsx`, `apps/segadores-web/components/portal/portal-dashboard.tsx`, `apps/segadores-web/components/portal/dm-invitations-console.tsx`.

- [x] **SUBTASK-11.3: Bloques de Estadísticas de Monstruos Canónicos (*Statblocks D&D 5e*)**
  - **Objetivo:**
    - Refactorizado el renderizado del callout `[!statblock]` en `@segadores/obsidian-engine` con estética oficial de suplementos de D&D:
      - Marco de pergamino amarillento (`#fdf1dc`) con esquinas biseladas `dnd-notched-sm` y borde doble carmesí (`#58180D`).
      - Encabezado con nombre del monstruo en carmesí oscuro `Cinzel` (`font-dnd-title`).
      - Tipografía editorial `Spectral` (`font-dnd-body`) para el cuerpo y acciones.
  - **Archivos:** `packages/obsidian-engine/src/components/callouts.tsx`.

- [x] **SUBTASK-11.4: Callouts Temáticos de Lore y Protección DM/Jugador con Estilo Grimorio**
  - **Objetivo:**
    - Estilizados los callouts de notas (`[!info]`, `[!dnd-grid]`, `[!tip]`, `[!warning]`, `[!todo]`) con fondos pergamino diferenciados, bordes biselados `dnd-notched-sm` y tipografía editorial.
    - Bloque secreto `> [!dm]`: Diseñado un marco distintivo con pergamino carmesí suave (`#fbeeed`), borde carmesí de lacre (`#7a2021`) y sello medieval dorado 🔒 (`Confidencial DM`), manteniendo la purga absoluta del DOM para jugadores exigida por las reglas de anti-metajuego.
  - **Archivos:** `packages/obsidian-engine/src/components/callouts.tsx`.

---

## 📜 Registro de Ejecución y Cambios (Log)

| Fecha | Agente / Dev | Subtarea | Resumen de Cambios Realizados |
| :--- | :--- | :--- | :--- |
| 2026-11-08 | `frontend-engineer` | SUBTASK-11.1 | Rediseñados `header.tsx` y `footer.tsx` con lomo de cuero encuadernado, filetes dorados, colofón de imprenta antigua y `TaperedRule`. |
| 2026-11-08 | `frontend-engineer` | SUBTASK-11.2 | Rediseñados `/login`, `/portal` y la consola del DM (`dm-invitations-console.tsx`) en pergamino biselado, sellos de héroes e insignias de estado. |
| 2026-11-08 | `frontend-engineer` | SUBTASK-11.3, 11.4 | Rediseñados los callouts `[!statblock]`, `[!dm]` confidencial y notas temáticas en `@segadores/obsidian-engine` con estética de manual D&D 5e. |
