import { createClient } from '@supabase/supabase-js';

// Salvaguarda: Este cliente utiliza SUPABASE_SERVICE_ROLE_KEY y NUNCA debe ejecutarse en el navegador.
// (El paquete opcional 'server-only' no está instalado en este entorno, por lo que usamos este guard en tiempo de ejecución).
if (typeof window !== 'undefined') {
  throw new Error('El cliente administrativo de Supabase (admin) solo puede ejecutarse en el servidor.');
}

/**
 * Cliente administrativo de Supabase con privilegios de rol de servicio (bypassa RLS).
 * Uso exclusivo en operaciones de backend autorizadas (ej. vincular auth_user_id en el callback de OAuth).
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Variables SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY no configuradas en el entorno del servidor.');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
