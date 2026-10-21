# @segadores/web (apps/segadores-web)

Aplicación orquestadora principal basada en Next.js (App Router).

## Responsabilidades
- Autenticación con Google OAuth vía Supabase.
- Protección de rutas con middleware de lista blanca (`ALLOWED_EMAILS`).
- Rutas dinámicas para la Wiki (`/wiki/[...slug]`) y Hojas de Personaje (`/personajes/[id]`).
- Integración en tiempo real con Supabase Realtime para la mesa de juego.
