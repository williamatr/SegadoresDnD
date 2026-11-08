import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import type { User } from '@supabase/supabase-js';

export interface CurrentPlayer {
  id: string;
  email: string;
  display_name: string;
  role: 'dm' | 'player';
  assigned_character_slug?: string | null;
  invited_by?: string | null;
}

export interface SessionResult {
  user: User | null;
  player: CurrentPlayer | null;
}

/**
 * Obtiene el usuario autenticado y su perfil correspondiente en `public.players` para Server Components.
 */
export async function getCurrentPlayer(): Promise<SessionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user || !user.email) {
      // Sesión de desarrollo local (sin necesidad de Google OAuth en localhost)
      const devSession = cookies().get('segadores_dev_session')?.value;
      if (devSession) {
        if (devSession === 'dm') {
          return {
            user: {
              id: 'dev-dm-id',
              email: 'dm@ejemplo.com',
              user_metadata: { full_name: 'William (Dungeon Master)' },
            } as unknown as User,
            player: {
              id: 'dev-dm-id',
              email: 'dm@ejemplo.com',
              display_name: 'William (Dungeon Master)',
              role: 'dm',
              assigned_character_slug: 'zuma',
            },
          };
        }

        const charNames: Record<string, string> = {
          alizar: 'Alizar Thorne',
          eru: 'Eru Lion',
          honiel: 'Honiel Spellbinder',
          solaria: 'Solaria',
          zuma: 'Zuma Kobold',
        };
        const charName = charNames[devSession] || 'Aventurero';
        return {
          user: {
            id: `dev-${devSession}-id`,
            email: `${devSession}@segadores.local`,
            user_metadata: { full_name: charName },
          } as unknown as User,
          player: {
            id: `dev-${devSession}-id`,
            email: `${devSession}@segadores.local`,
            display_name: charName,
            role: 'player',
            assigned_character_slug: devSession,
          },
        };
      }

      return { user: null, player: null };
    }

    const email = user.email.trim().toLowerCase();
    const rawAdmin = process.env.ADMIN_EMAILS || process.env.DM_EMAILS || '';
    const adminList = rawAdmin
      .split(',')
      .map(e => e.trim().toLowerCase())
      .filter(Boolean);
    const isSuperDm = adminList.includes(email);

    // Consultar el perfil del jugador en public.players
    let player: {
      id: string;
      email: string;
      display_name: string;
      role: 'dm' | 'player';
      assigned_character_slug?: string | null;
      invited_by?: string | null;
    } | null = null;

    const { data, error: playerError } = await supabase
      .from('players')
      .select('id, email, display_name, role, assigned_character_slug, invited_by')
      .eq('email', email)
      .maybeSingle();

    if (playerError) {
      // Fallback defensivo si la migración de columnas aún no se ha ejecutado
      const fallback = await supabase
        .from('players')
        .select('id, email, display_name, role')
        .eq('email', email)
        .maybeSingle();

      if (fallback.data) {
        player = {
          ...fallback.data,
          assigned_character_slug: null,
          invited_by: null,
        };
      }
    } else {
      player = data;
    }

    if (!player) {
      if (isSuperDm) {
        return {
          user,
          player: {
            id: user.id,
            email,
            display_name: user.user_metadata?.full_name || 'Dungeon Master',
            role: 'dm',
            assigned_character_slug: 'zuma',
            invited_by: null,
          },
        };
      }
      return {
        user,
        player: null,
      };
    }

    const effectiveRole: 'dm' | 'player' = isSuperDm ? 'dm' : (player.role === 'dm' ? 'dm' : 'player');

    return {
      user,
      player: {
        id: player.id,
        email: player.email,
        display_name: player.display_name,
        role: effectiveRole,
        assigned_character_slug: player.assigned_character_slug ?? null,
        invited_by: player.invited_by ?? null,
      },
    };
  } catch (err) {
    console.error('[getCurrentPlayer] Error al resolver el jugador:', err);
    return { user: null, player: null };
  }
}
