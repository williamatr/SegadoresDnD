# TASK-06: Autenticación, Sesión y Control de Acceso (Google OAuth + Allowlist)

> **Estado General:** 🟡 Pendiente
> **Agentes Responsables:** `backend-engineer`, `solution-architect-critic`
> **Paquetes Afectados:** `apps/segadores-web`

---

## 🎯 Objetivo de la Épica
Implementar el flujo de autenticación seguro mediante Google OAuth (Supabase Auth) y el middleware de Next.js en el Edge para validar la lista blanca de correos autorizados (`ALLOWED_EMAILS`), protegiendo las rutas privadas (`/portal`, `/personajes/[id]`) y asegurando la privacidad de la campaña.

---

## 📋 Subtareas y Checklist

- [ ] **SUBTASK-06.1: Cliente de Supabase Auth para Next.js App Router**
  - **Objetivo:** Configurar el cliente `@supabase/ssr` en `apps/segadores-web` para manejo seguro de cookies y sesión en Server y Client Components.
  - **Archivos:** `apps/segadores-web/lib/supabase/client.ts`, `apps/segadores-web/lib/supabase/server.ts`.
  - **Criterio de Aceptación:** Manejo transparente de sesión con refresco automático de tokens.

- [ ] **SUBTASK-06.2: Middleware de Next.js para Validación de Allowlist**
  - **Objetivo:** Interceptar rutas privadas en `apps/segadores-web/middleware.ts`, verificar si el correo del usuario figura en `ALLOWED_EMAILS` y rechazar accesos no autorizados con 403 Forbidden.
  - **Archivos:** `apps/segadores-web/middleware.ts`.
  - **Criterio de Aceptación:** Usuarios no registrados en la lista blanca son bloqueados antes de renderizar la app.

- [ ] **SUBTASK-06.3: Flujo de Login y Redirección en la Landing Page**
  - **Objetivo:** Conectar el botón *"Ingresar como Miembro de la Compañía"* con el popup/redirect de Google OAuth y retornar al usuario a su hoja de personaje.
  - **Archivos:** `apps/segadores-web/app/auth/callback/route.ts`.
  - **Criterio de Aceptación:** Inicio de sesión en un clic con redirección automática al portal.

---

## 📜 Registro de Ejecución y Cambios (Log)

| Fecha | Agente / Dev | Subtarea | Resumen de Cambios Realizados |
| :--- | :--- | :--- | :--- |
| *Sin iniciar* | - | - | - |
