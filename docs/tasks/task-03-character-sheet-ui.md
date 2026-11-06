# TASK-03: Suite de Hojas de Personaje para Jugadores (7 Vistas Interactivas)

> **Estado General:** 🟡 Pendiente
> **Agentes Responsables:** `frontend-engineer`, `theme-design-reviewer`
> **Paquetes Afectados:** `packages/character-sheet`, `apps/segadores-web`

---

## 🎯 Objetivo de la Épica
Construir la experiencia interactiva completa de la Hoja de Personaje para los jugadores de la campaña, dividida en **7 vistas/pestañas temáticas (Vistas A a G)**.
Los componentes deben ser puros, controlados por props, altamente responsivos (móvil y escritorio) y reactivos en tiempo real a los cambios de combate, estados y buffs inyectados por el DM o aliados.

---

## 📋 Arquitectura de las 7 Vistas (Subtareas)

- [ ] **SUBTASK-03.A: VISTA A - Estadísticas y Defensas Nucleares**
  - **Objetivo:** Panel de control de combate y atributos:
    - 6 Atributos (FUE, DES, CON, INT, SAB, CAR) con valores base y modificadores.
    - Clase de Armadura (CA) dinámica, Velocidad e Iniciativa.
    - Puntos de Golpe: Máximo, Actual y Temporales con botones táctiles rápidos (`+1`, `-1`, daño, curación).
    - Contador interactivo de Salvaciones contra la Muerte (*Death Saves*: 3 éxitos / 3 fallos con reseteo).
    - Dados de Golpe consumibles y botón de alternancia de Inspiración.
    - Lista de Competencias en Salvaciones y Habilidades (marcando normal vs pericia).
    - Ranuras de Conjuro por Nivel interactivas (Niveles 1 al 9).

- [ ] **SUBTASK-03.B: VISTA B - Consola de Combate en Vivo (Acciones, Hechizos y Objetos Listos)**
  - **Objetivo:** Lo que el personaje tiene disponible en ese instante exacto para el combate:
    - Dividido por economía de acción oficial: **Acciones Principales**, **Acciones Adicionales** (incluyendo beber pociones), **Reacciones** y **Objetos en Mano / Sintonizados**.
    - **Comportamiento reactivo:** Las habilidades/conjuros bloqueados se muestran en gris con un badge explicativo (*"Bloqueado por: Apresado"*, *"Bloqueado: Silenciado (requiere componente Verbal)"*, *"Bloqueado: Requiere no llevar armadura"*).
    - Magos y lanzadores: Selección visual de conjuros preparados para el día.
    - Sugerencias tácticas con 1 clic: dados de tirada de ataque y daño correspondientes.

- [ ] **SUBTASK-03.C: VISTA C - Inventario Inteligente y Calculadora de Equipo**
  - **Objetivo:** Mochila, armas, armaduras y objetos mágicos:
    - Armas: Cálculo automático de bonificador de ataque (`+8 al impacto`) y desglose de dados de daño (`1d8+5 cortante + 1d6 eléctrico`).
    - Armaduras: Desglose transparente de la CA (base + destreza con límite + bonus mágico + escudo).
    - Objetos Sintonizados: Control visual del límite de 3 ranuras (o 4 para Artificiero nivel 10+).
    - Tarjetas con descripción corta y modal/drawer con descripción completa del compendio.

- [ ] **SUBTASK-03.D: VISTA D - Hechizos y Habilidades Generales (Aprendidas vs Por Aprender)**
  - **Objetivo:** Dos sub-vistas / menús desplegables:
    1. **Adquiridas / Aprendidas:** Todo lo que posee actualmente por clase, raza, subclase o dote.
    2. **Árbol de Aprendizaje:** Todo lo que puede desbloquear en niveles futuros para planificar subidas de nivel.
    - **Filtros Avanzados:**
      - Por Nivel (Truco a Nivel 9).
      - Por Función/Rol: Daño, Soporte / Curación, Control de Masas, Utilidad / Interpretación (*Disfrazarse, Cambiar de forma*).
      - Por Componentes Mágicos: **V** (Verbal), **S** (Somático), **M** (Material), **C** (Concentración), **R** (Ritual).

- [ ] **SUBTASK-03.E: VISTA E - Lore, Personalidad y Crónica del Héroe**
  - **Objetivo:** Identidad narrativa e historia:
    - Rasgos de Personalidad, Ideales, Vínculos y Defectos.
    - Trasfondo formal y alineamiento.
    - Crónica de Campaña y Backstory (eventos clave de *Segadores de Orcos*).
    - Apariencia física y retrato en alta resolución.

- [ ] **SUBTASK-03.F: VISTA F - Compendio Contextual de Reglas de mi Personaje**
  - **Objetivo:** Extrae del compendio y de las notas del máster ÚNICAMENTE las reglas que aplican a este personaje:
    - Reglas de sus armas y armaduras equipadas (desventajas en sigilo, propiedades sutil, a dos manos, arrojadiza).
    - Reglas de sus condiciones particulares (amputación de Eru, foco obligatorio de Alizar, cota mithral de Honiel).
    - Regla de multiclase al 50% con sus costos de PX específicos.

- [ ] **SUBTASK-03.G: VISTA G - Gestor de Condiciones, Heridas y Buffs/Debuffs (Tiempo Real)**
  - **Objetivo:** Panel interactivo en tiempo real conectado a Supabase Realtime:
    - Visualización de todos los `active_effects` (tipo, duración, quién lo aplicó).
    - **Inyección por Aliados:** Un compañero puede lanzar un buff (ej. *Guía*, *Escudo de la fe*) y agregarlo a la hoja.
    - **Inyección por DM:** El DM puede aplicar condiciones del glosario o heridas de las Tablas A y B con 1 clic.
    - **Seguridad:** Solo el DM o el dueño de la ficha tienen permisos para retirar o limpiar estados.
    - Modifica dinámicamente los dados sugeridos en la Vista B (ej. *"Tienes +1d4 por Guía"*).

---

## 📜 Registro de Ejecución y Cambios (Log)

| Fecha | Agente / Dev | Subtarea | Resumen de Cambios Realizados |
| :--- | :--- | :--- | :--- |
| *Sin iniciar* | - | - | - |
