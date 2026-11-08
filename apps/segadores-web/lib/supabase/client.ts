import { createBrowserClient } from '@supabase/ssr';

/**
 * Cliente de Supabase para su uso en Client Components en el navegador.
 * Maneja automáticamente la persistencia de sesión en cookies del navegador.
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Degradación elegante si no hay credenciales configuradas (ej. builds estáticos o modo mock)
    console.warn('[Supabase Client] Variables NEXT_PUBLIC_SUPABASE_* no detectadas. Usando cliente degradado.');
  }

  return createBrowserClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-anon-key'
  );
}
