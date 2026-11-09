# Changelog (Registro de Cambios)

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/)
y este proyecto se adhiere a [Semantic Versioning](https://semver.org/lang/es/).

---

## [Unreleased]

### Añadido
* **Sistema de Diseño Editorial D&D 5e (`@segadores/ui` & Tailwind) (TASK-09):**
  * Configurada la paleta canónica de manual de D&D 5e en `tailwind.config.ts`: pergamino claro (`#fdf6ea`), pergamino envejecido (`#f4ebe1`), carmesí oficial (`#58180D`), terracota (`#c45b1d`), oro viejo (`#c29b38`), tinta de imprenta (`#242528`) y lomo de cuero (`#2c1e18`).
  * Integrada la tipografía oficial `Cinzel` (encabezados y rótulos) y `Spectral` (cuerpo editorial de libro de rol) con fallbacks sólidos y clases `.font-dnd-title` y `.font-dnd-body`.
  * Implementados los componentes anatómicos en `@segadores/ui`: `TaperedRule` (línea divisoria SVG cónica), `ParchmentFrame` (marcos biselados notched 45°), `DropCap` (letra capitular de oro), `HeraldicShield` (escudo medieval para Clase de Armadura), `DndBadge` (insignias en versalitas) y `DndTable` (tablas alternadas pergamino/carmesí).
  * Añadida suite de 8 tests unitarios en `@segadores/ui` validados mediante `renderToStaticMarkup`.
* **Redirecciones Canónicas y Dominio Oficial (`apps/segadores-web`):**
  * Enrutamiento de enlaces de invitación y retornos OAuth de Google directamente al dominio canónico `www.segadoresdnd.com`, evitando desajustes de origen cruzado en vistas previas de Vercel.
* **Backlog de Inmersión Visual D&D 5e (Sprint 2):**
  * Creadas las épicas de diseño y refactor visual: `TASK-09` (Sistema de Diseño Editorial D&D 5e: tokens, paleta pergamino, heráldica y tipografía), `TASK-10` (Refactor de la Hoja de Personaje D&D 5e: escudo medieval CA, cajas notched y tarjetas de conjuro) y `TASK-11` (Inmersión Visual del Portal, Wiki y Bitácora del DM).
  * Reorganizado el tablero `docs/tasks/README.md` priorizando la experiencia y juego en mesa de los aventureros antes de las tareas de tooling interno (`TASK-07` y `TASK-08`).

## [0.1.2]

### Corregido
* **Seguridad y Control de Acceso en Producción:**
  * Bloqueado y purgado el panel y endpoints de inicio de sesión de desarrollo local (`/api/auth/dev-login` y cookie `segadores_dev_session`) fuera del entorno `NODE_ENV === 'development'`, impidiendo que sea visible en la UI o ejecutable en producción (`www.segadoresdnd.com`).
* **CI/CD en Vercel y Resolución de Dependencias:**
  * Sincronizado `pnpm-lock.yaml` para incluir la especificación de `lucide-react@^0.460.0` bajo el paquete `@segadores/character-sheet` y las 7 dependencias de `@segadores/obsidian-engine`, resolviendo el error `[ERR_PNPM_OUTDATED_LOCKFILE]` al desplegar en Vercel con `--frozen-lockfile`.
  * Añadidas dependencias de desarrollo `@types/react` y `@types/react-dom` en `@segadores/character-sheet` y `@segadores/ui`, solucionando el error de compilación de TypeScript en Vercel por aislamiento de enlaces simbólicos en `node_modules`.

### Añadido
* **Gobernanza de CI/CD y Despliegues en Vercel (`GEMINI.md` - Sección 10 y `PROJECT_SPEC.md`):**
  * Especificación obligatoria para agentes y desarrolladores sobre integridad estricta del lockfile (`--frozen-lockfile`), prohibición de commitear `package.json` sin su correspondiente `pnpm-lock.yaml`, declaración mandatoria de `@types/react` y `@types/react-dom` en cada paquete con JSX/TSX del workspace para superar el aislamiento de pnpm, checklist de validación local previa (`pnpm install --frozen-lockfile` y `turbo run build`) y tolerancia a fallos en submódulos privados.
* **Integración de Vercel CLI Global en Entorno de Desarrollo:**
  * Documentada la disponibilidad de `vercel` CLI global instalado vía `pnpm` en `SYSTEM_SPECS.md`, `PROJECT_SPEC.md`, `README.md` y cheatsheet central de Obsidian (`Comandos de Sistema.md`).
  * Eliminado campo redundante `workspaces` de `package.json` de la raíz para respetar la especificación nativa de `pnpm-workspace.yaml` y silenciar advertencias de `pnpm`.
* **Soporte Universal para Tiradas Físicas en Mesa de Juego (Juego Híbrido Mesa / Digital):**
  * **Subida de Nivel (`LevelUpModal.tsx` en `@segadores/character-sheet` y `level-up.ts` en `@segadores/dnd-core`):**
    * Selector de 3 vías en el Paso 3 para el incremento de PG Máximos: *Media Fija Oficial*, *Dado Digital Interactivo* y *Tiré en Mesa 🎲 (Físico)*.
    * Teclado numérico rápido (1 al valor del dado de clase, ej. d6, d8, d10, d12) con cálculo reactivo inmediato: `Dado físico + Mod. CON = +X PG Máximos`.
    * Soporte para `hpMethod: 'manual'` en el motor matemático de reglas (`packages/dnd-core/src/rules/level-up.ts`) con acotación canónica de límites de frontera (1 a valor del dado de clase).
  * **Dados de Golpe y Curación en Descansos Cortos (`HitDiceTracker.tsx` en `@segadores/character-sheet`):**
    * Botones duales independientes: `🎲 Tirar Digital` y `🎲 Tiré en Mesa (Físico)`.
    * Panel desplegable con teclado numérico (1 a valor del dado de golpe), adición automática del modificador de Constitución y botón de aplicación de curación física con distinción en notificaciones.
  * **Heridas Persistentes y Traumatismos (`ConditionsAndEffectsView.tsx` en `@segadores/character-sheet`):**
    * Botonera dual para Tabla A (Heridas Menores) y Tabla B (Heridas Graves): `Tirar 1d20 Digital` y `🎲 Tiré en Mesa (1d20 Físico)`.
    * Selector interactivo de 1 a 20 para buscar y aplicar de inmediato a la ficha la lesión exacta obtenida con el dado físico en la mesa.
  * **Salvaciones contra la Muerte (`DeathSavesTracker.tsx` en `@segadores/character-sheet`):**
    * Incorporación de botones `🎲 Tirar Digital` y `🎲 Tiré en Mesa (1d20)` con selector rápido de 1 al 20 y aplicación canónica de reglas de 5e (pifia 1: +2 fallos, 2-9: +1 fallo, 10-19: +1 éxito, 20: estabilización / crítico natural) junto con mensaje de historial.
  * **Consola de Combate y Tirador Táctico Libre (`CombatConsoleView.tsx` en `@segadores/character-sheet`):**
    * Cada arma equipada cuenta ahora con selector dual: `🎲 Tirar Digital` y `🎲 Tiré en Mesa`.
    * Panel desplegable de tirada física por arma con botonera rápida para el d20 (1 al 20, botones directos de pifia 1 y crítico 20), desglose en tiempo real `d20 + mod. ataque = total al impacto`, campo numérico para daño físico total sacado en la mesa, y registro con distintivo visual en vivo `🎲 Tirado en Mesa`.
    * **Tirador Táctico Libre para Bufos y Reglas de Campaña:** Widget interactivo integrado para cualquier dado de juego (`d4`, `d6`, `d8`, `d10`, `d12`, `d20`) con selector de tirada digital o registro físico en mesa, modificador ajustable y campo de motivo (Inspiración Bárdica, Bendición, Salvación, Daño adicional, Resonancia Rúnica, etc.).
* **Pruebas de Estado y Mutación (State Diff & Mutation Testing):**
  * Nueva prueba unitaria en `packages/dnd-core/src/tests/level-up.test.ts` verificando el cálculo exacto de PG con tirada manual en mesa (`hpMethod = manual`), comprobación del diferencial de estado antes vs después, invariabilidad de propiedades no alteradas y pruebas de límites de frontera (Boundary Testing). Total: 45 pruebas unitarias pasando al 100%.

## [0.0.2]

### Añadido
* **Regla Estricta de Repositorio sobre Integridad y Veracidad de Tests (`GEMINI.md` - Sección 9):**
  * Prohibición terminante de tests tautológicos o placebo (aserciones vacías, `assert.ok(true)`, o pruebas que no ejecutan la lógica real de producción).
  * Exigencia obligatoria de comprobación del diferencial de estado (*State Diff Verification*): capturar y comparar el estado ANTES y DESPUÉS de cualquier mutación (subida de nivel, curación, daño, descanso, deducción de PX, etc.), verificando la fórmula matemática exacta.
  * Prohibición de auto-mocking engañoso sobre el motor de reglas (`@segadores/dnd-core`), componentes puros (`@segadores/character-sheet`) y motores de Markdown (`@segadores/obsidian-engine`), restringiendo mocks exclusivamente a límites de I/O de red externos.
  * Comprobación obligatoria de casos de error y fronteras (*Boundary Testing*) garantizando que ante fallos no ocurran mutaciones parciales ni corrupciones de estado.
* **Motor de Subida de Nivel (Level-Up Engine) y Modal Interactivo con Vista Previa (`@segadores/dnd-core`, `@segadores/character-sheet`, `apps/segadores-web`):**
  * **Motor Matemático Puro en `@segadores/dnd-core` (`src/rules/level-up.ts`):**
    * Función `validateLevelUp(character, targetClass)`: evalúa avance en clases existentes o inicio de nuevas multiclases, aplicando la Regla de Campaña personalizada de Multiclase al 50% de Alcance (Catch-Up) cuando el nivel objetivo es menor a la clase principal, o 100% RAW cuando está igualada o es la clase primaria. Valida puntos de experiencia disponibles, calcula PX restantes o faltantes y bloquea avances por encima del nivel épico máximo 20.
    * Función `previewLevelUp(character, targetClass, options)`: genera una vista previa completa e inmutable del personaje simulando la subida antes de persistirla en base de datos. Calcula aumento de PG por media fija oficial o tirada de dado manual (`options.hpMethod`), actualiza dados de golpe acumulados (`formatHitDiceTotal`, ej. `7d6 + 2d8`), deduce el coste de PX de la reserva del héroe, recalcula el bonificador de competencia (PB) si el personaje alcanza los umbrales de nivel 5, 9, 13 o 17 (actualizando habilidades, CD de salvación y ataques mágicos), ajusta espacios de conjuros multiclase y escala recursos de clase (ej. desbloqueo y actualización de Puntos de Ki para Monje Nivel 2+).
    * Función `applyLevelUp(character, targetClass, options)`: ejecuta formalmente la subida con validación estricta previa, lanzando excepción si faltan PX.
    * Catálogo canónico de datos de clase: dados de golpe (d6, d8, d10, d12) y rasgos de clase esenciales por nivel para las 13 clases oficiales de D&D 5.5e / SRD 5.2.1 (Mago, Monje, Guerrero, Paladín, Artífice, Druida, Pícaro, Bardo, Clérigo, Hechicero, Brujo, Explorador, Bárbaro).
  * **Componente Modal Interactivo `LevelUpModal` en `@segadores/character-sheet`:**
    * Diálogo accesible y responsivo con estética Dark Fantasy para gestionar la subida de nivel en 5 pasos:
      1. Selección de clase a subir (tarjetas individuales para clases actuales o selector para nueva multiclase).
      2. Validación de PX en vivo con distintivos temáticos de Regla de Campaña (resaltado de ahorro de PX y alerta en rojo de PX faltantes si no alcanza).
      3. Selector de método de PG (media fija oficial o tirador interactivo de dados con animación de tirada en tiempo real).
      4. **Vista Previa ("Mira, así quedaría tu héroe")**: tablero comparativo ANTES vs DESPUÉS con distintivos visuales esmeralda/dorados para aumentos de estadísticas (Nivel, Clases, PG, Dados de Golpe, PX, Competencia y Recursos) junto con el desglose de nuevos rasgos desbloqueados.
      5. Botón de confirmación `Confirmar Subida de Nivel` con estados de carga y confirmación animada.
    * Integración de botón de activación `⚡ Subir de Nivel` en el encabezado táctico de `CharacterSheet.tsx` y en la tarjeta de progreso de experiencia de `CoreStatsView.tsx`.
  * **Integración en `apps/segadores-web`:**
    * Conexión del callback `onLevelUp` en `PortalDashboard` (`components/portal/portal-dashboard.tsx`) para actualizar de forma inmediata e interactiva la ficha del aventurero en memoria y almacenamiento local.
    * Conexión en `app/demo/page.tsx` para permitir a usuarios y visitantes probar la simulación de subida de nivel de los héroes de demostración.
  * **Pruebas Unitarias Exhaustivas:** Suite de pruebas en `packages/dnd-core/src/tests/level-up.test.ts` y ampliación de `packages/character-sheet/src/tests/character-sheet.test.ts` (verificando a Honiel Spellbinder Mago 7 / Monje 1 subiendo a Monje 2 al 50% de coste, desbloqueando Ki y alcanzando PB +4). 42 tests unitarios pasando al 100% y 0 errores de TypeScript (`tsc --noEmit`).
* **Suite de Hojas de Personaje para Jugadores (Las 7 Vistas Interactivas A–G) e Ingesta de los 5 Héroes Reales (`@segadores/character-sheet`, `apps/segadores-web` - TASK-06 Completada):**
  * **Ingesta Oficial de los 5 Héroes Reales de la Campaña:** Ingesta directa de los archivos de Obsidian en `content/wiki/Personajes_Jugadores/` reemplazando los mocks anteriores por:
    * **Alizar Thorne** (`alizar`): Enano de la colina, Artificiero (Alquimista) Nivel 7 (FUE 11, DES 12, CON 15, INT 18, SAB 19, CAR 7 - CA 17/20, HP 63, Destello de Genialidad, Tratamiento Alquímico, Elixires).
    * **Eru Lion** (`eru`): Alto Elfo, Guerrero (Nivel 7) / Paladín (Nivel 1) Nivel 8 (FUE 20, DES 10, CON 16, INT 8, SAB 10, CAR 6 - CA 25, HP 58, Prótesis arcana permanente de FUE 20, Rúthaglar y Aerasúl de Gorthok, Nuevas Energías).
    * **Honiel Spellbinder** (`honiel`): Elfo Lunar, Mago Evocación (Nivel 7) / Monje (Nivel 1) Nivel 8 (FUE 8, DES 14, CON 14, INT 18, SAB 13, CAR 7 - CA 21, HP 44, Marginem Noctis, Esculpir Conjuros, Defensa sin Armadura).
    * **Solaria** (`solaria`): Humana, Druida Círculo de las Esporas Nivel 7 (FUE 8, DES 12, CON 10, INT 15, SAB 20, CAR 14 - CA 14, HP 54, Entidad Simbiótica con +28 PG temp y +1d6 necrótico, Infección Fúngica, Halo de Esporas, y placeholders interactivos para campos pendientes).
    * **Zuma Kobold** (`zuma`): Mediano Piesligeros, Pícaro Embaucador Arcano (Nivel 7) / Bardo (Nivel 1) Nivel 8 (FUE 10 [19 con Guanteletes de Ogro], DES 15, CON 12, INT 13, SAB 7, CAR 14 - CA 19, HP 60, Sa Yue de Gorthok, Ataque Furtivo 4d6 con Fuerza, Acordeón de Gli-Aerth, Inspiración Bárdica).
  * **Paquete Agnóstico y Desacoplado `@segadores/character-sheet`:**
    * Componente Raíz `CharacterSheet`: selector de las 7 pestañas A–G con estética Dark Fantasy, cabecera táctica con medidor rápido de salud, toggle de inspiración, indicador de concentración activa, nivel de agotamiento y soporte para modos `editable` y `readOnly`.
    * **VISTA A (`CoreStatsView`):** Estadísticas nucleares, 6 atributos con modificador y tiradas de salvación con competencia, métricas defensivas dinámicas (CA, velocidad con penalizador, iniciativa, percepción pasiva), controlador táctil de PG (`HpTracker`) con botones rápidos (`-5`, `-1`, `+1`, `+5`, daño y curación directa) y alerta reactiva de tirada en Tabla A / Tabla B, contador interactivo de Salvaciones contra la Muerte (`DeathSavesTracker`: 3 éxitos / 3 fallos con reseteo), dados de golpe consumibles (`HitDiceTracker`) con botones de Descanso Corto y Largo, selector de Agotamiento D&D 5.5e (`ExhaustionSelector`: 0–6 con badge del penalizador), recursos de clase (`ClassResourcesTracker`) y lista de las 18 habilidades de D&D con marcado de competencia y pericia.
    * **VISTA B (`CombatConsoleView`):** Consola de combate en vivo organizada por economía oficial de acciones (Principal, Adicional con beber pociones según 5.5e, Reacción e Interacción con objetos), atenuación reactiva de acciones bloqueadas mediante `evaluateCharacterState` de `dnd-core`, armas equipadas listas para impactar con bonificador calculado (`+8 al impacto`), desglose de dados (`1d8+5 cortante + 1d6 eléctrico + 1d6 fuego`) y simulador de tirada de ataque y daño, ranuras de conjuro interactivas por nivel con checkboxes de gasto/recuperación, y aptitud mágica multiclase dual.
    * **VISTA C (`InventoryView`):** Inventario inteligente y sintonización mágica (`AttunementTracker`) con control estricto del límite de 3 ranuras (o 4 para artificiero), interruptor para sintonizar/desintonizar, equipamiento de armas y armaduras con cálculo transparente de CA, curiosidades de campaña y monedero personal (PC, PP, PE, PO, PPT).
    * **VISTA D (`SpellsAndAbilitiesView`):** Pestañas de conjuros adquiridos vs árbol de progresión futura (niveles 8, 9 y 10), con filtros avanzados por nivel (Truco a Nivel 4+), función/rol (Daño, Soporte, Control, Utilidad) y componentes mágicos (V, S, M, C, R).
    * **VISTA E (`LoreAndChronicleView`):** Pilares de personalidad (rasgos, ideales, vínculos y defectos) con placeholders interactivos para campos pendientes (como en Solaria), trasfondo formal, alineamiento moral, crónica de origen, apariencia física y libreta de notas de sesión del jugador (`player_notes`).
    * **VISTA F (`ContextualRulesView`):** Reglas exclusivas que aplican al héroe activo (prótesis arcana de FUE 20 de Eru, combo sónico de Gorthok, tratamiento alquímico de Alizar, entidad simbiótica de Solaria, sneak attack con Fuerza de Zuma, propiedades de armas) y calculadora interactiva de la regla de multiclase al 50% con cálculo de ahorro de PX mediante `calculateMulticlassLevelUpCost`.
    * **VISTA G (`ConditionsAndEffectsView`):** Gestor de efectos activos en tiempo real con opción de retiro, tirador interactivo de dados d20 para Heridas (Tabla A y Tabla B) con animación y aplicación directa a la ficha, glosario de las 15 condiciones estándar de D&D accionable con 1 clic, e inyector rápido de buffs aliados.
  * **Integración en `apps/segadores-web`:** Conexión de `CharacterSheet` en `portal-dashboard.tsx` para los 5 héroes reales de la mesa y en `app/demo/page.tsx` para demostración pública interactiva con persistencia de sesión.
* **Consola de Administración de Aventureros, Invitaciones y Asignación de Héroes por el DM (`apps/segadores-web` & `scripts/sql`):**
  * Script SQL idempotente `scripts/sql/04_player_invitations.sql`: ampliación de `public.players` con columnas `assigned_character_slug` e `invited_by`, índices de rendimiento y políticas RLS para que el Dungeon Master inserte, actualice y revoque accesos en la mesa.
  * Route Handlers de administración en `/api/admin/invitations` (`apps/segadores-web/app/api/admin/invitations/route.ts`): endpoints seguros `GET`, `POST` y `DELETE` protegidos con validación estricta de rol DM (`role === 'dm'`), prevención de auto-revocación para el Master DM y sincronización automática de `characters.player_id`.
  * Componente de interfaz reactiva `DmInvitationsConsole` (`apps/segadores-web/components/portal/dm-invitations-console.tsx`): formulario de invitación para autorizar cuentas de Google con asignación de héroe de campaña (Zuma, Eru Illúvatar, Gary, Rick, Skelly o creación libre a futuro), selector de rol (Jugador / Co-DM), copia instantánea de enlaces de invitación (`/login?invited=true`) al portapapeles y tabla interactiva de aventureros con estados (🟢 Activo / ⏳ Invitación pendiente), edición rápida y modal de confirmación de revocación.
  * Experiencia del Jugador Invitado en `PortalDashboard` (`apps/segadores-web/components/portal/portal-dashboard.tsx`): apertura y selección automática del personaje asignado en base de datos (`assigned_character_slug`), distintivo visual de héroe propio, y tarjeta arcana informativa para aventureros de creación libre sin personaje asignado aún.
  * Tarjeta de bienvenida temática en `/login` (`apps/segadores-web/app/login/page.tsx`) activada mediante el parámetro `?invited=true`.
  * Módulo desacoplado de héroes de campaña (`apps/segadores-web/lib/campaign/characters.ts`) y suite de pruebas unitarias (`apps/segadores-web/lib/campaign/characters.test.mjs`) ejecutadas con `node:test`.
* **Autenticación Google OAuth, Allowlist y Clientes Supabase SSR (`apps/segadores-web` - TASK-05 Completada):**
  * Configuración integral de clientes `@supabase/ssr` con cookies seguras y degradación elegante: cliente para navegador (`apps/segadores-web/lib/supabase/client.ts`), servidor con `cookies()` (`apps/segadores-web/lib/supabase/server.ts`), helper de sesión para Edge (`apps/segadores-web/lib/supabase/middleware.ts`) y cliente administrativo con privilegios de rol de servicio (`apps/segadores-web/lib/supabase/admin.ts`).
  * Middleware en el Edge (`apps/segadores-web/middleware.ts`) con verificación criptográfica de sesiones vía `supabase.auth.getUser()` (rechazo estricto de `getSession` en servidor) y control de acceso en dos niveles: validación principal contra `public.players` y lista blanca de fallback mediante `ALLOWED_EMAILS`.
  * Redirección segura anti-open-redirect desde rutas privadas (`/portal`, `/personajes/*`) hacia la nueva vista temática `/login` conservando la ruta de destino original (`?next=...`).
  * Vista temática de login en `/login` (`apps/segadores-web/app/login/page.tsx`) con diseño de fantasía oscura D&D, botón de Google OAuth y panel informativo de errores parametrizado con `Suspense`.
  * Route Handler de intercambio OAuth en `/auth/callback` (`apps/segadores-web/app/auth/callback/route.ts`): intercambio atómico de código por sesión, auto-vinculación de `auth_user_id` en `public.players` mediante el cliente admin y registro automático de nuevos usuarios de la lista blanca forzando rol `'player'` (salvaguarda estricta anti-escalada al rol `'dm'`).
  * Endpoint seguro de cierre de sesión en `/auth/signout` (`apps/segadores-web/app/auth/signout/route.ts`) mediante método POST y redirección 303 al inicio (`/`).
  * Vista de error 403 personalizada y temática en `/acceso-denegado` (`apps/segadores-web/app/acceso-denegado/page.tsx`) con botón de cierre de sesión para cuentas autenticadas no autorizadas en la mesa.
  * Helper de sesión para Server Components (`apps/segadores-web/lib/auth/get-current-player.ts`) y conversión de `/portal` a Server Component conectado al perfil real del jugador (`apps/segadores-web/components/portal/portal-dashboard.tsx`), sustituyendo el simulador ficticio por el rol y nombre reales con soporte de vista previa de jugador para el DM.
  * Carga segura de variables de entorno de la raíz en `next.config.mjs` utilizando `@next/env` sin exponer secretos ni crear enlaces simbólicos inseguros.
* **Landing Page, Compendio `/hechizos` y Cascarón de Rutas (`apps/segadores-web` - TASK-04 Completada):**
  * Modularización de componentes de navegación y pie de página ([`Header`](file:///home/william/Proyectos/Webs/SegadoresDnD/apps/segadores-web/components/layout/header.tsx) y [`Footer`](file:///home/william/Proyectos/Webs/SegadoresDnD/apps/segadores-web/components/layout/footer.tsx)) con menú responsive adaptado a móviles.
  * Modal informativo accesible [`AboutProjectModal`](file:///home/william/Proyectos/Webs/SegadoresDnD/apps/segadores-web/components/landing/about-project-modal.tsx) detallando el licenciamiento dual (Código MIT + Contenido D&D SRD bajo CC-BY-4.0) y el origen de la campaña en la mesa de William Tovar.
  * Buscador y compendio interactivo de hechizos en [`/hechizos`](file:///home/william/Proyectos/Webs/SegadoresDnD/apps/segadores-web/app/hechizos/page.tsx) con el componente [`SpellExplorer`](file:///home/william/Proyectos/Webs/SegadoresDnD/apps/segadores-web/components/spells/spell-explorer.tsx) conectado a `@segadores/obsidian-engine`, con filtros por nivel (Truco a Nivel 9), escuela, clase, componentes (`V`, `S`, `M`), concentración y ritual.
  * Cascarón de demostración pública en [`/demo`](file:///home/william/Proyectos/Webs/SegadoresDnD/apps/segadores-web/app/demo/page.tsx) con selector visual de los 12 arquetipos canónicos de clase y persistencia de selección en `localStorage`.
  * Cascarón del portal de campaña en [`/portal`](file:///home/william/Proyectos/Webs/SegadoresDnD/apps/segadores-web/app/portal/page.tsx) con vista de los 5 personajes de *Segadores de Orcos* (*Zuma, Eru, Gary, Rick, Skelly*), tesoro compartido (`campaign_vault`) y simulador de roles anti-metajuego (Jugador vs Máster 🔒).
  * Enlace y navegación íntegra entre todas las rutas sin errores 404 y compilación de Next.js 14 verificada al 100%.
* **Motor Markdown, Callouts y Anti-Metajuego (`@segadores/obsidian-engine` - TASK-03 Completada):**
  * Parser agnóstico de frontmatter YAML y metadatos inline (`src/parser/frontmatter.ts`), normalizador de tags y detector automático de visibilidad (`'player' | 'dm'`).
  * Extractor y transformador de wikilinks (`src/parser/wikilinks.ts`): soporte para enlaces simples, con alias (`[[Nota|Alias]]`), anclas (`[[Nota#Seccion]]`), incrustaciones (`![[Nota]]`) y assets multimedia (`![[imagen.png]]`).
  * Extractor de compendio (`src/parser/compendium-extractor.ts`): extracción automática de conjuros (`SpellEntry`) y objetos (`ItemEntry`) soportando formatos YAML y sintaxis inline de Obsidian, con escaneo y fallback automático entre `content/wiki/` y `content/mocks/`.
  * Filtro anti-metajuego estricto (`src/filters/anti-metagame.ts`): purga completa de bloques confidenciales `> [!dm]` para jugadores, restricción de acceso a carpetas reservadas (`Campañas predefinidas/`, `Bestiario/`, `Notas del Máster/`, `Secretos/`) y filtrado seguro de árboles de navegación.
  * Renderizador de callouts de Obsidian (`src/parser/callouts.ts` y `src/components/callouts.tsx`): segmentador de texto y componente React temático compatible con SSR (utiliza `<details>` para colapsado nativo y accesible) con diseño personalizado de fantasía oscura (`statblock`, `dnd-grid`, `info`, `tip`, `warning`, `todo`, `dm` con sello 🔒).
  * Suite de 20 pruebas unitarias automatizadas (`src/tests/*.test.ts`) ejecutadas con `node:test`.
* **Motor de Reglas D&D 5.5e y Evaluador de Estados (`@segadores/dnd-core` - TASK-02 Completada):**
  * Contratos de tipos TypeScript estrictos (`src/types/character.ts`, `src/types/effects.ts`, `src/types/spells.ts`) alineados 1:1 con `public.characters` y `public.demo_characters`.
  * Fórmulas matemáticas D&D 5.5e y calculadora de combate (`src/rules/abilities.ts`, `src/rules/combat-calculator.ts`): modificadores de característica, bonificador de competencia, habilidades y salvaciones con agotamiento 5.5e (`-2 × nivel`), CD de conjuros, CD de agarre/empujón y concentración, cálculo de CA sin acumular fórmulas incompatibles, ataques con armas *Sutiles (Finesse)* y descansos corto/largo.
  * Matriz de Heridas en Combate (`src/rules/lingering-injuries.ts`): mapeo íntegro de la Tabla A (Heridas Menores / Estrés de Combate - d20) y Tabla B (Heridas Graves y Persistentes - d20) con evaluación automática de disparadores (`evaluateInjuryTrigger`) y conversión a `ActiveEffect`.
  * Progresión Multiclase al 50% por Alcance (`src/rules/multiclass.ts`): cálculo de coste incremental de PX al 50% (*Catch-Up*) mientras la clase secundaria sea menor que la clase principal, y cálculo de espacios de conjuro multiclase.
  * Evaluador de Estados y Disponibilidad de Acciones (`src/rules/state-evaluator.ts`): cálculo de modificadores netos, bloqueos explícitos de acciones y recordatorios tácticos de clase (Monje con armadura, Artífice con foco Material, Druida de las Esporas y lanzador multiclase dual).
  * Suite de pruebas unitarias (`src/tests/rules.test.ts`) ejecutada con `node:test`.
* **Reorganización Secuencial del Backlog (`docs/tasks/`):** Reestructuración de las épicas en orden estricto de dependencias (`TASK-00` a `TASK-07`).
* **Saneamiento Integral de Base de Datos y Cierre de TASK-01 (antes TASK-05):**
  * Blindaje de seguridad RLS en `scripts/sql/02_rls_policies.sql`: cláusula `WITH CHECK` en `public.players` para impedir escalada de privilegios (`role = 'dm'`), y `SET search_path = public` en funciones `SECURITY DEFINER`.
  * Ampliación idempotente en `scripts/sql/03_character_sheet_enhancements.sql`: soporte para `background`, `class_resources` (Ki, Forma Salvaje, Acción Súbita, Destello de Genialidad, Inspiración Bárdica), `exhaustion` (0–6 D&D 5.5e), `concentrating_on`, `spellcasting_stats` (doble aptitud mágica en multiclase), paridad 100% de columnas en `public.demo_characters` y publicación idempotente de Supabase Realtime para `characters` y `campaign_vault`.
  * Reparación del parser en `scripts/sync-characters-push.mjs` y `scripts/sync-demo-characters.mjs`: soporte dual para tablas e inline de atributos, extracción real de habilidades y pericias, desglose de multiclase con subclase, ranuras de conjuro, conjuros conocidos/preparados, inventario categorizado con sintonización y recursos de clase.
  * Nuevo script `scripts/sync-characters-pull.mjs` (`pnpm sync:pull`) para volcado quirúrgico y no destructivo desde PostgreSQL hacia las fichas Markdown de Obsidian.
  * Directivas anti-indexación (`X-Robots-Tag: noindex, nofollow, noarchive` en `next.config.mjs`, `robots` en `layout.tsx` y `public/robots.txt`) y escaneo de `@segadores/obsidian-engine` en `tailwind.config.ts`.
* **Infraestructura Base y Shell de Next.js (TASK-00 Completada):**
  * Configuración completa de Next.js 14 App Router, TypeScript y Tailwind CSS con paleta temática de fantasía oscura y pergaminos D&D (`apps/segadores-web`).
  * Creación de `layout.tsx` y `page.tsx` base con hero de campaña, accesos a demo pública y créditos legales (MIT + CC-BY-4.0).
  * Verificación de compilación limpia en monorepo con Turborepo (`turbo run build` / `pnpm build`) saliendo con código 0 (Vercel-Ready).
* **Ampliación DDL y Funciones RPC para Hojas de Personaje (03_character_sheet_enhancements.sql):**
  * Campo unificado `active_effects` (JSONB) para almacenar condiciones, buffs, debuffs y heridas temporales/persistentes.
  * Campos mecánicos y narrativos: `death_saves` (éxitos/fallos 0-3), `inspiration`, `skills`, `saving_throws_prof`, `personality` (rasgos, ideales, vínculos, defectos), `backstory` (TEXT independiente), `multiclass` y `attunement_slots`.
  * Funciones de seguridad `apply_character_effect` (autorizada para DM, jugador y aliados para buffs) y `remove_character_effect` (restringida estrictamente al DM y al dueño de la ficha).
  * Habilitación de Supabase Realtime para la tabla `characters`.
* **Nuevas Épicas en Backlog (`docs/tasks/`):**
  * `TASK-03`: Suite de Hojas de Personaje para Jugadores (Especificación completa de las 7 Vistas interactivas A a G).
  * `TASK-07`: Motor de Sincronización Inteligente Bidireccional (Obsidian $\leftrightarrow$ PostgreSQL) con diff semántico (`pnpm sync:diff` y `pnpm sync:smart`).
  * `TASK-08`: Motor de Reglas D&D y Evaluador de Estados en `@segadores/dnd-core` (Tablas A y B de Heridas d20, Evaluador de Estados y regla de multiclase al 50% de coste en PX).
* **Actualización de Scripts de Ingesta:** Extracción automática de competencias en salvaciones, habilidades, multiclase y personalidad desde las notas de Obsidian en `scripts/sync-characters-push.mjs` y `scripts/sync-demo-characters.mjs`.
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
* **Integración de Vercel CLI Global en Entorno de Desarrollo:**
  * Documentada la disponibilidad de `vercel` CLI global instalado vía `pnpm` en `SYSTEM_SPECS.md`, `PROJECT_SPEC.md`, `README.md` y cheatsheet central de Obsidian (`Comandos de Sistema.md`).
  * Eliminado campo redundante `workspaces` de `package.json` de la raíz para respetar la especificación nativa de `pnpm-workspace.yaml` y silenciar advertencias de `pnpm`.
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
