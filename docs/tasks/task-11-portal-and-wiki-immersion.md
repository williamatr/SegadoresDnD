# TASK-11: Inmersión Visual del Portal del Jugador, Wiki y Bitácora del DM

> **Estado General:** 🟡 Pendiente (Desbloqueado tras TASK-09 y en paralelo con TASK-10)
> **Agentes Responsables:** `frontend-engineer`, `theme-design-reviewer`
> **Paquetes Afectados:** `apps/segadores-web`, `packages/obsidian-engine`

---

## 🎯 Objetivo de la Épica
Extender la estética de tomo encuadernado y manual de D&D a todo el ecosistema de la aplicación web: el cascarón de navegación global, la portada y pantalla de acceso `/login`, el portal de campaña `/portal`, la consola del Dungeon Master y el renderizador de notas y compendios de lore (`@segadores/obsidian-engine`).

El objetivo es que los jugadores y el DM sientan que están abriendo un tomo físico de campaña, con lomo de cuero repujado, guardas de pergamino y sellos de lacre para las secciones privadas.

---

## 📋 Subtareas y Checklist

- [ ] **SUBTASK-11.1: Barra de Navegación y Shell de Tomo Encuadernado (Header & Footer)**
  - **Objetivo:** 
    - Reemplazar la barra de navegación oscura moderna de `Header.tsx` por una banda con estética de lomo de cuero encuadernado o pergamino oscuro texturizado, con filetes dorados superior e inferior.
    - Logotipo "Segadores de Orcos" con tipografía `Cinzel` heráldica y escudo o dagas cruzadas grabadas.
    - Menú de navegación con enlaces en versalitas / serifa y botón de acceso como medalla o cinta marcapáginas.
    - Pie de página (`Footer.tsx`) con tipografía editorial de imprenta, atribución canónica a Wizards of the Coast (SRD 5.1 / 5.2.1 CC-BY-4.0) y detalles en estilo de colofón de imprenta antigua.
  - **Archivos:** `apps/segadores-web/components/Header.tsx`, `apps/segadores-web/components/Footer.tsx`.

- [ ] **SUBTASK-11.2: Pantalla de Acceso `/login` y Portal de Campaña `/portal`**
  - **Objetivo:**
    - Transformar `/login` en la portada o primera página de un libro de aventuras: fondo de pergamino con grabado central, título en carmesí profundo `dnd-crimson` y botón de "Continuar con Google" integrado con ornamentación de fantasía (estilo medallón o sello de acceso seguro).
    - Portal de Campaña `/portal`: Tarjetas de personajes con marcos de retrato de aventurero, sellos de nivel e insignias de estado (Vivo, Inconsciente, Misión en curso).
    - Consola del Dungeon Master: Panel de administración con estética de "Bitácora secreta del DM", con pestañas de pergamino y cinta divisoria.
  - **Archivos:** `apps/segadores-web/app/login/page.tsx`, `apps/segadores-web/app/portal/page.tsx`, `apps/segadores-web/components/admin/`.

- [ ] **SUBTASK-11.3: Bloques de Estadísticas de Monstruos Canónicos (*Statblocks D&D 5e*)**
  - **Objetivo:**
    - Refactorizar el renderizado del callout `[!statblock]` en `@segadores/obsidian-engine` para que coincida milimétricamente con el diseño oficial del *Monster Manual* y el SRD 5.2.1:
      - Encabezado con nombre del monstruo en carmesí oscuro `dnd-crimson` y tamaño/tipo/alineamiento en cursiva.
      - Línea divisoria cónica dorada `TaperedRule`.
      - Ficha de CA, Puntos de Golpe y Velocidad con sangría.
      - Barra de 6 atributos en tabla horizontal de fondo ocre suave con bordes dobles.
      - Rasgos y Acciones con sangría francesa y título de la acción en negrita cursiva (`***Espada Larga.*** *Ataque con arma cuerpo a cuerpo...*`).
  - **Archivos:** `packages/obsidian-engine/src/callouts/statblock.ts` (o componentes React equivalentes).

- [ ] **SUBTASK-11.4: Callouts Temáticos de Lore y Protección DM/Jugador con Estilo Grimorio**
  - **Objetivo:**
    - Estilizar los callouts de notas (`[!info]`, `[!dnd-grid]`, `[!lore]`, `[!warning]`) con fondos pergamino diferenciados, bordes dobles y marcadores medievales.
    - Bloque secreto `> [!dm]`: Diseñar un marco distintivo con borde de cera carmesí, textura de tinta confidencial y candado medieval dorado 🔒, asegurando que para los jugadores quede 100% purgado del DOM tal como lo exige la regla de anti-metajuego.
  - **Archivos:** `packages/obsidian-engine/src/callouts/`, `apps/segadores-web/app/wiki/`.

---

## 📜 Registro de Ejecución y Cambios (Log)

| Fecha | Agente / Dev | Subtarea | Resumen de Cambios Realizados |
| :--- | :--- | :--- | :--- |
| *Pendiente* | `frontend-engineer` | - | Creación de la épica para inmersión visual del portal y wiki de D&D. |
