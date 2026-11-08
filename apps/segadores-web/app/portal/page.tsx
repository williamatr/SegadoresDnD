import { getCurrentPlayer } from '@/lib/auth/get-current-player';
import { PortalDashboard } from '@/components/portal/portal-dashboard';
import { createAdminClient } from '@/lib/supabase/admin';
import type { AdminPlayerItem } from '@/app/api/admin/invitations/route';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Portal de Campaña | Segadores de Orcos',
  description: 'Consola táctica y de gestión para los aventureros de la campaña Segadores de Orcos.',
};

export default async function PortalPage() {
  const { user, player } = await getCurrentPlayer();

  let initialPlayers: AdminPlayerItem[] = [];
  if (player?.role === 'dm') {
    try {
      const admin = createAdminClient();
      const { data, error } = await admin
        .from('players')
        .select('id, auth_user_id, email, display_name, role, assigned_character_slug, invited_by, created_at, updated_at')
        .order('created_at', { ascending: true });

      if (data && !error) {
        initialPlayers = data.map(p => ({
          ...p,
          status: p.auth_user_id ? 'active' : 'pending',
        }));
      } else if (error && error.message?.includes('column')) {
        // Fallback defensivo si la migración de columnas aún no se ha ejecutado
        const { data: fallback } = await admin
          .from('players')
          .select('id, auth_user_id, email, display_name, role, created_at, updated_at')
          .order('created_at', { ascending: true });

        if (fallback) {
          initialPlayers = fallback.map(p => ({
            ...p,
            assigned_character_slug: null,
            invited_by: null,
            status: p.auth_user_id ? 'active' : 'pending',
          }));
        }
      }
    } catch (err) {
      console.warn('[PortalPage] Aviso al precargar aventureros para la consola del DM:', err);
    }
  }

  return (
    <PortalDashboard
      userEmail={user?.email || null}
      player={player}
      initialPlayers={initialPlayers}
    />
  );
}
