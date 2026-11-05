# TASK-00: Infraestructura Base del Monorepo y Next.js Shell

> **Estado General:** 🟡 Pendiente
> **Agentes Responsables:** `frontend-engineer`, `qa-integration-tester`
> **Paquetes Afectados:** `apps/segadores-web`, raíz (`package.json`, `pnpm-workspace.yaml`)

---

## 🎯 Objetivo de la Épica
Configurar la base técnica del monorepo, instalando las dependencias necesarias con `pnpm`, configurando TypeScript y Tailwind CSS en `apps/segadores-web`, y asegurando que `pnpm build` compile limpiamente para que Vercel pueda desplegar el proyecto sin fallos de compilación.

---

## 📋 Subtareas y Checklist

- [ ] **SUBTASK-00.1: Instalación de Dependencias Base**
  - **Objetivo:** Instalar dependencias de Next.js, React 18/19, Tailwind CSS, Lucide React y utilidades en `apps/segadores-web`.
  - **Archivos:** `apps/segadores-web/package.json`, `pnpm-lock.yaml`.
  - **Criterio de Aceptación:** `pnpm install` se ejecuta sin errores de resolución de paquetes en workspaces.

- [ ] **SUBTASK-00.2: Configuración de TypeScript y Tailwind**
  - **Objetivo:** Crear archivos de configuración de compilador y estilos base.
  - **Archivos:** `apps/segadores-web/tsconfig.json`, `apps/segadores-web/next.config.mjs`, `apps/segadores-web/tailwind.config.ts`, `apps/segadores-web/app/globals.css`.
  - **Criterio de Aceptación:** Clases de Tailwind reconocidas y compiladas correctamente.

- [ ] **SUBTASK-00.3: Verificación de Build en Verde (Vercel-Ready)**
  - **Objetivo:** Crear punto de entrada mínimo funcional (`app/layout.tsx` y `app/page.tsx`) y validar la compilación integral.
  - **Archivos:** `apps/segadores-web/app/layout.tsx`, `apps/segadores-web/app/page.tsx`.
  - **Criterio de Aceptación:** `turbo run build` o `pnpm --filter segadores-web build` finaliza con código 0.

---

## 📜 Registro de Ejecución y Cambios (Log)

| Fecha | Agente / Dev | Subtarea | Resumen de Cambios Realizados |
| :--- | :--- | :--- | :--- |
| *Sin iniciar* | - | - | - |
