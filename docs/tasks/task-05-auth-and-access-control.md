# TASK-05: Autenticación, Sesión y Control de Acceso (Google OAuth + Allowlist)

> **Estado General:** 🟢 Completada
> **Agentes Responsables:** `backend-engineer`, `solution-architect-critic`
> **Paquetes Afectados:** `apps/segadores-web`

---

## 🎯 Objetivo de la Épica
Implementar el flujo de autenticación seguro mediante Google OAuth (Supabase Auth), los clientes `@supabase/ssr` y el middleware de Next.js en el Edge para validar la lista blanca de correos autorizados (`ALLOWED_EMAILS`), protegiendo las rutas privadas (`/portal`, `/personajes/[slug]`) e identificando el rol (`player` vs `dm`).

---

## 📋 Subtareas y Checklist

- [x] **SUBTASK-05.1: Clientes de Supabase SSR para Next.js App Router**
  - **Objetivo:** Configurar `@supabase/ssr` en `apps/segadores-web` para manejo seguro de cookies, sesión y suscripciones Realtime en Server y Client Components.
  - **Archivos:** `apps/segadores-web/lib/supabase/client.ts`, `apps/segadores-web/lib/supabase/server.ts`, `apps/segadores-web/lib/supabase/middleware.ts`, `apps/segadores-web/lib/supabase/admin.ts`.
  - **Criterio de Aceptación:** Manejo transparente de sesión con refresco automático de tokens.

- [x] **SUBTASK-05.2: Middleware de Next.js para Validación de Allowlist (`ALLOWED_EMAILS`)**
  - **Objetivo:** Interceptar rutas privadas en `apps/segadores-web/middleware.ts`, verificar si el correo del usuario figura en `ALLOWED_EMAILS` (o en `public.players`) y rechazar accesos no autorizados con redirección o vista 403 Forbidden sin bloquear `/demo`.
  - **Archivos:** `apps/segadores-web/middleware.ts`, `apps/segadores-web/app/acceso-denegado/page.tsx`.
  - **Criterio de Aceptación:** Usuarios no registrados en la lista blanca son bloqueados antes de renderizar rutas privadas; `/demo` permanece 100% pública.

- [x] **SUBTASK-05.3: Flujo de Login con Google OAuth y Callback (`/login` y `/auth/callback`)**
  - **Objetivo:** Construir la vista temática `/login` y el endpoint `/auth/callback` que intercambia el código OAuth por sesión, sincroniza el registro en `public.players` y redirige al usuario a `/portal`.
  - **Archivos:** `apps/segadores-web/app/login/page.tsx`, `apps/segadores-web/app/auth/callback/route.ts`, `apps/segadores-web/app/auth/signout/route.ts`, `apps/segadores-web/lib/auth/get-current-player.ts`, `apps/segadores-web/components/portal/portal-dashboard.tsx`, `apps/segadores-web/app/portal/page.tsx`.
  - **Criterio de Aceptación:** Inicio de sesión con Google en un clic y redirección automática al portal con rol verificado.

---

## 📜 Registro de Ejecución y Cambios (Log)

| Fecha | Agente / Dev | Subtarea | Resumen de Cambios Realizados |
| :--- | :--- | :--- | :--- |
| 2026-11-08 | `backend-engineer` | SUBTASK-05.1, 05.2, 05.3 | Implementación de clientes `@supabase/ssr` (browser, server, middleware, admin), middleware Edge con refresco de sesión vía `getUser()` y allowlist de doble nivel (`public.players` y `ALLOWED_EMAILS`), vista temática `/login` con Google OAuth, callback `/auth/callback` con auto-vinculación de `auth_user_id` vía cliente admin y salvaguarda anti-escalada de rol (nunca asigna 'dm'), endpoint POST `/auth/signout`, vista 403 `/acceso-denegado` y conversión de `/portal` a Server Component con visualización de rol real. Carga segura de variables de entorno de la raíz en `next.config.mjs` sin exponer secretos. |
