# TASK-12: Sistema Temático Dual D&D 5.5e (Modo Claro / Pergamino Diurno vs Modo Oscuro / Códice Nocturno)

> **Estado General:** 📋 Especificación Arquitectónica Completa (Listo para Ejecución)
> **Agentes Responsables:** `frontend-engineer`, `theme-design-reviewer`
> **Paquetes Afectados:** `apps/segadores-web`, `packages/ui`, `packages/character-sheet`

---

## 🎯 1. Filosofía de Diseño y Objetivos de la Épica

El portal de campaña de **Segadores de Orcos (D&D 5.5e)** se utiliza en dos contextos físicos de juego marcadamente diferentes:
1. **Mesas Diurnas o Portátiles en Salas Iluminadas:** Jugadores que requieren un **Modo Claro ("Mesa de Estudio / Pergamino Diurno")** donde la pantalla evoque un libro de reglas abierto sobre un escritorio de roble iluminado, con pergamino nítido, tinta negra de imprenta, bordes envejecidos y carmesí heráldico.
2. **Mesas Nocturnas a la Luz de Velas o Ambientes Oscuros:** Jugadores que juegan de noche y sufren fatiga visual o deslumbramiento con el pergamino crema brillante. Requieren un **Modo Oscuro ("Códice Nocturno / Grimorio de Mazmorra")**, donde el fondo sea de cuero profundo/obsidiana y las hojas de personaje adopten un tono de vitela carbón oscura con texto marfil y acentos rúnicos dorados/carmesí rubí, sin caer en grises planos genéricos de software SaaS.

### Principios Arquitectónicos
* **Inversión de Dependencias y Pureza:** Los paquetes `packages/character-sheet` y `packages/ui` son agnósticos; responden fluidamente a las variables CSS semánticas y a la clase `.dark` sin importar Next.js, cookies ni Supabase.
* **Cero Parpadeo (0ms FOUC):** Inyección de un script síncrono ultra-ligero en `<head>` de `layout.tsx` para evaluar `localStorage` y `prefers-color-scheme` antes del primer pintado (First Paint).
* **Persistencia y Sincronización:** Persistencia en `localStorage` (`'segadores_theme'`) con soporte para 3 modos: `light`, `dark` y `system`.
* **Accesibilidad WCAG 2.1:** Ratios de contraste certificados $\ge 4.5:1$ (AA) para texto normal y $\ge 7:1$ (AAA) para títulos y bloques principales.

---

## 🎨 2. Matriz Canónica de Tokens Cromáticos (Design Tokens)

| Token Semántico | Variable CSS | Modo Claro (Pergamino Diurno) | Modo Oscuro (Códice Nocturno) | Rol Semántico & Ratio de Contraste |
| :--- | :--- | :---: | :---: | :--- |
| **Canvas** | `--dnd-canvas` | `#f4ede2` | `#0e0b08` | Fondo global de la aplicación (`body` / mesa física) |
| **Superficie Principal** | `--dnd-parchment` | `#fdf6ea` | `#1a1412` | Fondo de hojas de personaje, tarjetas y paneles |
| **Superficie Secundaria** | `--dnd-parchment-dark` | `#f4ebe1` | `#241c18` | Paneles anidados, inputs secundarios, celdas pares |
| **Superficie de Contraste** | `--dnd-parchment-contrast` | `#ede2cb` | `#2d221d` | Tablas, callouts, ranuras tácticas y badges |
| **Tinta Principal** | `--dnd-ink` | `#242528` | `#f7f1e6` | Texto corrido y números (Contraste $\ge 13.5:1$, AAA) |
| **Tinta Atenuada** | `--dnd-ink-muted` | `#58544d` | `#c7b9a5` | Metadatos, etiquetas y subtítulos (Contraste $\ge 5.9:1$, AA) |
| **Tinta Sutil** | `--dnd-ink-subtle` | `#8a7f72` | `#8c7e6c` | Textos de pie de página, notas marginales |
| **Borde Filigrana** | `--dnd-border-antique` | `#d4c2a5` | `#47372d` | Bordes envejecidos de tarjetas, filetes y líneas |
| **Borde Estructural** | `--dnd-border-strong` | `#bfa27e` | `#6b5344` | Separadores de bloque y contornos notched |
| **Carmesí Títulos/H1** | `--dnd-crimson` | `#58180D` | `#eb6b5b` | Encabezados de personaje, botones y marcas (AA) |
| **Carmesí Hover/Activo** | `--dnd-crimson-hover` | `#7a2021` | `#f07c6f` | Estados interactivos hover |
| **Carmesí Superficie** | `--dnd-crimson-surface` | `#faecea` | `#3d1512` | Fondos de alerta o badges carmesí |
| **Terracota / Ocre** | `--dnd-terracotta` | `#c45b1d` | `#e67e38` | H2, subtítulos de sección y badges de acción |
| **Oro Viejo / Rúnico** | `--dnd-gold` | `#99731e` / `#c29b38` | `#dcb144` | Acentos de nivel, divisores cónicos e inspiración |
| **Oro Claro / Brillante** | `--dnd-gold-light` | `#e5b960` | `#f3cf65` | Reflejos y texto seleccionado |
| **Oro Superficie** | `--dnd-gold-surface` | `#fef9c3` | `#3a2c10` | Fondos de inspiración activada |
| **Cuero de Encuadernación** | `--dnd-leather` | `#2c1e18` | `#15100d` | Cabeceras de navegación y pestañas inactivas |
| **Cuero Profundo** | `--dnd-leather-dark` | `#1b120e` | `#0a0806` | Marcos exteriores y fondos oscuros profundos |

---

## 🛠️ 3. Estrategia de Implementación Técnica

### 3.1. Configuración de Tailwind (`apps/segadores-web/tailwind.config.ts`)
1. Establecer `darkMode: 'class'`.
2. Asignar los colores del objeto `dnd` directamente a las variables CSS dinámicas:
   ```ts
   colors: {
     dnd: {
       canvas: 'var(--dnd-canvas)',
       parchment: 'var(--dnd-parchment)',
       'parchment-dark': 'var(--dnd-parchment-dark)',
       'parchment-contrast': 'var(--dnd-parchment-contrast)',
       crimson: 'var(--dnd-crimson)',
       'crimson-hover': 'var(--dnd-crimson-hover)',
       'crimson-surface': 'var(--dnd-crimson-surface)',
       terracotta: 'var(--dnd-terracotta)',
       gold: 'var(--dnd-gold)',
       'gold-light': 'var(--dnd-gold-light)',
       'gold-surface': 'var(--dnd-gold-surface)',
       ink: 'var(--dnd-ink)',
       'ink-muted': 'var(--dnd-ink-muted)',
       'ink-subtle': 'var(--dnd-ink-subtle)',
       'border-antique': 'var(--dnd-border-antique)',
       'border-strong': 'var(--dnd-border-strong)',
       leather: 'var(--dnd-leather)',
       'leather-dark': 'var(--dnd-leather-dark)',
     }
   }
   ```

### 3.2. Reglas en `apps/segadores-web/app/globals.css`
* Declarar la paleta diurna en `:root`.
* Declarar la paleta nocturna en `.dark`.
* Adaptar las utilidades de textura:
  * `.bg-parchment-texture`: gradiente diurno en `:root`, gradiente de carbón/cuero en `.dark`.
  * `.bg-parchment-sheet`: sombra clara con relieve en `:root`, sombra de cuero profundo en `.dark`.
  * Scrollbars temáticos con fondos acordes a cada modo.

### 3.3. Script Anti-FOUC (0ms) en `apps/segadores-web/app/layout.tsx`
Inyección síncrona en `<head>`:
```tsx
<script
  dangerouslySetInnerHTML={{
    __html: `(function(){
      try {
        var t = localStorage.getItem('segadores_theme');
        var d = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (t === 'dark' || (!t && d)) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } catch (e) {}
    })();`
  }}
/>
```
Y en `<body>`:
```tsx
<body className="bg-dnd-canvas text-dnd-ink transition-colors duration-200 antialiased selection:bg-dnd-gold/30 selection:text-dnd-gold-light">
```

### 3.4. ThemeProvider y Hook `useTheme`
Crear `apps/segadores-web/components/theme/theme-provider.tsx`:
* Estado React para `theme` (`'light' | 'dark' | 'system'`) y `resolvedTheme` (`'light' | 'dark'`).
* Sincronización bidireccional con `localStorage` y listener de `prefers-color-scheme`.
* Hook personalizado `useTheme()` para cualquier componente del portal.

### 3.5. Componente Conmutador Heráldico (`ThemeToggle`)
Crear `apps/segadores-web/components/theme/theme-toggle.tsx`:
* Botón con estilo medieval que conmute entre **Pergamino Diurno** (icono `Sun` / `Scroll`) y **Códice Nocturno** (icono `Moon` / `BookMarked`).
* Tooltip temático inmersivo.
* Integración en la barra de navegación `Header.tsx` (desktop y drawer móvil) y como botón táctico rápido en `PortalDashboard.tsx`.

---

## 📦 4. Adaptación de Paquetes Agnósticos

### 4.1. `@segadores/ui`
* **`ParchmentFrame`:**
  * Reemplazar las clases rígidas `bg-[#fdf6ea] text-[#242528] border-[#d4c2a5]` por las utilidades semánticas `bg-dnd-parchment text-dnd-ink border-dnd-border-antique`.
  * En la variante `callout`, usar `bg-dnd-parchment-contrast text-dnd-ink border-l-4 border-l-dnd-crimson border-dnd-border-antique`.
* **`DndTable`:**
  * Cabecera con `bg-dnd-crimson text-dnd-parchment`.
  * Filas alternadas con `bg-dnd-parchment` y `bg-dnd-parchment-dark hover:bg-dnd-parchment-contrast`.
  * Texto en `text-dnd-ink`.
* **`HeraldicShield`:**
  * Variante `parchment`: utilizar `var(--dnd-parchment)` para `fill`, `var(--dnd-crimson)` para el trazo exterior y texto, y `var(--dnd-gold)` para el marco interno.
* **`TaperedRule`:**
  * El SVG dinámicamente enlaza a `var(--dnd-crimson)` y `var(--dnd-gold)` en sus `stopColor`.
* **`DndBadge` & `DropCap`:**
  * Usar tokens `bg-dnd-parchment`, `border-dnd-border-antique`, etc.

### 4.2. `@segadores/character-sheet`
* Reemplazar sistemáticamente los literales de color en la cabecera y en los bloques principales:
  * `bg-[#fdf6ea]` $\rightarrow$ `bg-dnd-parchment`
  * `bg-[#f4ebe1]` $\rightarrow$ `bg-dnd-parchment-dark`
  * `bg-[#ede2cb]` $\rightarrow$ `bg-dnd-parchment-contrast`
  * `text-[#242528]` $\rightarrow$ `text-dnd-ink`
  * `text-[#58544d]` $\rightarrow$ `text-dnd-ink-muted`
  * `border-[#d4c2a5]` $\rightarrow$ `border-dnd-border-antique`
  * `text-[#58180D]` $\rightarrow$ `text-dnd-crimson`
* Soporte para prop opcional `themeMode?: 'light' | 'dark' | 'auto'` en `CharacterSheetProps` para permitir aislamiento si la ficha se embebe en un contenedor independiente.

---

## 📋 5. Plan de Ejecución por Fases (Checklist)

- [ ] **SUBTASK-12.1: Tokens Cromáticos y Configuración de Tailwind**
  - Configurar `darkMode: 'class'` y tokens `dnd.*` con variables CSS en `apps/segadores-web/tailwind.config.ts`.
  - Definir `:root` (Light) y `.dark` (Dark) con texturas y scrollbars en `apps/segadores-web/app/globals.css`.

- [ ] **SUBTASK-12.2: Infraestructura Anti-FOUC y ThemeProvider**
  - Implementar script síncrono en `<head>` de `apps/segadores-web/app/layout.tsx`.
  - Crear contexto y hook `ThemeProvider` / `useTheme` en `apps/segadores-web/components/theme/theme-provider.tsx`.

- [ ] **SUBTASK-12.3: Componentes Anatómicos `@segadores/ui` Adaptables**
  - Refactorizar `ParchmentFrame`, `DndTable`, `HeraldicShield`, `TaperedRule` y `DndBadge` a tokens semánticos.
  - Ejecutar y verificar los tests unitarios (`pnpm --filter @segadores/ui test`).

- [ ] **SUBTASK-12.4: Control Visual `ThemeToggle` e Integración en Header y Portal**
  - Crear componente `ThemeToggle` con diseño medieval heráldico (Sol/Luna D&D).
  - Integrar en `Header.tsx` (desktop y móvil) y en `PortalDashboard.tsx`.

- [ ] **SUBTASK-12.5: Adaptación de `@segadores/character-sheet` y Vistas Satélite**
  - Migrar clases fijas en `CharacterSheet.tsx` y vistas clave (`CoreStatsView`, `CombatConsoleView`, etc.) a tokens semánticos.
  - Ejecutar tests de hoja de personaje (`pnpm --filter @segadores/character-sheet test`).

- [ ] **SUBTASK-12.6: Verificación E2E de Accesibilidad, Build y Lockfile**
  - Verificar `pnpm build` (`turbo run build`).
  - Auditar ratios de contraste en modo claro y modo oscuro.
  - Actualizar `CHANGELOG.md` en la sección `[Unreleased]`.

---

## 📜 6. Registro de Ejecución y Cambios (Log)

| Fecha | Agente / Dev | Subtarea | Resumen de Cambios Realizados |
| :--- | :--- | :--- | :--- |
| 2026-11-08 | `theme-design-reviewer` | TASK-12 (Spec) | Definición completa de arquitectura dual (Pergamino Diurno vs Códice Nocturno), matriz de tokens, estrategia anti-FOUC y plan de ejecución. |
