import { NextResponse, type NextRequest } from 'next/server';
import { getCurrentPlayer } from '@/lib/auth/get-current-player';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export interface AdminPlayerItem {
  id: string;
  auth_user_id: string | null;
  email: string;
  display_name: string;
  role: 'dm' | 'player';
  assigned_character_slug: string | null;
  invited_by: string | null;
  created_at: string;
  updated_at: string;
  status: 'active' | 'pending';
}

/**
 * GET /api/admin/invitations
 * Obtiene la lista completa de aventureros autorizados e invitados en public.players.
 * Requiere privilegios estrictos de Dungeon Master (role === 'dm').
 */
export async function GET(request: NextRequest) {
  try {
    const { player } = await getCurrentPlayer();

    if (!player || player.role !== 'dm') {
      return NextResponse.json(
        { error: 'Acceso denegado. Se requieren privilegios de Dungeon Master.' },
        { status: 403 }
      );
    }

    let admin;
    try {
      admin = createAdminClient();
    } catch {
      return NextResponse.json(
        { error: 'Configuración de base de datos no disponible en el servidor.' },
        { status: 503 }
      );
    }

    const { data: players, error } = await admin
      .from('players')
      .select('id, auth_user_id, email, display_name, role, assigned_character_slug, invited_by, created_at, updated_at')
      .order('created_at', { ascending: true });

    if (error) {
      // Fallback si la columna no existe aún
      if (error.message?.includes('column')) {
        const { data: fallbackPlayers, error: fallbackError } = await admin
          .from('players')
          .select('id, auth_user_id, email, display_name, role, created_at, updated_at')
          .order('created_at', { ascending: true });

        if (fallbackError) {
          return NextResponse.json({ error: fallbackError.message }, { status: 500 });
        }

        const items: AdminPlayerItem[] = (fallbackPlayers || []).map(p => ({
          ...p,
          assigned_character_slug: null,
          invited_by: null,
          status: p.auth_user_id ? 'active' : 'pending',
        }));

        return NextResponse.json({ players: items });
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const items: AdminPlayerItem[] = (players || []).map(p => ({
      ...p,
      status: p.auth_user_id ? 'active' : 'pending',
    }));

    return NextResponse.json({ players: items });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno al consultar aventureros.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/admin/invitations
 * Registra o actualiza la autorización de un aventurero en public.players.
 * Si se asigna un personaje oficial, vincula también characters.player_id si la tabla existe.
 * Requiere privilegios estrictos de Dungeon Master (role === 'dm').
 */
export async function POST(request: NextRequest) {
  try {
    const { player: dmPlayer } = await getCurrentPlayer();

    if (!dmPlayer || dmPlayer.role !== 'dm') {
      return NextResponse.json(
        { error: 'Acceso denegado. Se requieren privilegios de Dungeon Master.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const rawEmail = body.email;
    const rawDisplayName = body.displayName;
    const rawCharacterSlug = body.assignedCharacterSlug;
    const rawRole = body.role;

    if (!rawEmail || typeof rawEmail !== 'string') {
      return NextResponse.json({ error: 'El correo electrónico de Google es obligatorio.' }, { status: 400 });
    }

    const email = rawEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'El formato del correo electrónico es inválido.' }, { status: 400 });
    }

    if (!rawDisplayName || typeof rawDisplayName !== 'string' || rawDisplayName.trim().length < 2) {
      return NextResponse.json({ error: 'El nombre del jugador debe tener al menos 2 caracteres.' }, { status: 400 });
    }

    const displayName = rawDisplayName.trim().slice(0, 100);
    const role: 'dm' | 'player' = rawRole === 'dm' ? 'dm' : 'player';
    const characterSlug: string | null =
      rawCharacterSlug && typeof rawCharacterSlug === 'string' && rawCharacterSlug.trim() !== '' && rawCharacterSlug !== 'none'
        ? rawCharacterSlug.trim().toLowerCase()
        : null;

    let admin;
    try {
      admin = createAdminClient();
    } catch {
      return NextResponse.json(
        { error: 'Configuración de base de datos no disponible en el servidor.' },
        { status: 503 }
      );
    }

    // Verificar si el jugador ya existe por correo
    const { data: existingPlayer } = await admin
      .from('players')
      .select('id, auth_user_id, email, display_name, role, assigned_character_slug')
      .eq('email', email)
      .maybeSingle();

    let savedPlayerId: string;

    if (existingPlayer) {
      // Actualizar registro existente conservando auth_user_id intacto
      savedPlayerId = existingPlayer.id;
      const { error: updateError } = await admin
        .from('players')
        .update({
          display_name: displayName,
          role,
          assigned_character_slug: characterSlug,
          invited_by: dmPlayer.id,
        })
        .eq('id', existingPlayer.id);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }
    } else {
      // Insertar nuevo aventurero con auth_user_id null (esperando su primer login con Google)
      const { data: newPlayer, error: insertError } = await admin
        .from('players')
        .insert({
          email,
          display_name: displayName,
          role,
          assigned_character_slug: characterSlug,
          invited_by: dmPlayer.id,
        })
        .select('id')
        .single();

      if (insertError || !newPlayer) {
        return NextResponse.json({ error: insertError?.message || 'Fallo al registrar aventurero.' }, { status: 500 });
      }

      savedPlayerId = newPlayer.id;
    }

    // Si se seleccionó un personaje y la tabla characters existe, actualizar characters.player_id
    if (characterSlug) {
      try {
        // Desvincular cualquier personaje previo asignado a este jugador para evitar duplicados
        await admin
          .from('characters')
          .update({ player_id: null })
          .eq('player_id', savedPlayerId);

        // Asignar el nuevo personaje
        await admin
          .from('characters')
          .update({ player_id: savedPlayerId })
          .eq('slug', characterSlug);
      } catch (charErr) {
        console.warn('[invitations API] No se pudo vincular characters.player_id en la BD:', charErr);
      }
    } else {
      // Si el personaje fue removido o fijado en "Ninguno", liberar asignaciones previas
      try {
        await admin
          .from('characters')
          .update({ player_id: null })
          .eq('player_id', savedPlayerId);
      } catch (charErr) {
        console.warn('[invitations API] Error al limpiar asignación de personaje:', charErr);
      }
    }

    const rawOrigin = request.nextUrl.origin;
    const canonicalOrigin =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (rawOrigin.includes('vercel.app') ? 'https://www.segadoresdnd.com' : rawOrigin);
    const invitationLink = `${canonicalOrigin}/login?invited=true`;

    return NextResponse.json({
      success: true,
      playerId: savedPlayerId,
      email,
      displayName,
      role,
      assignedCharacterSlug: characterSlug,
      invitationLink,
      message: `Aventurero ${displayName} autorizado exitosamente con rol ${role}.`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error inesperado al procesar la invitación.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/invitations
 * Revoca el acceso de un jugador eliminando su registro de public.players y desvinculando personajes.
 * Protege al propio Master DM de auto-eliminación.
 * Requiere privilegios estrictos de Dungeon Master (role === 'dm').
 */
export async function DELETE(request: NextRequest) {
  try {
    const { player: dmPlayer } = await getCurrentPlayer();

    if (!dmPlayer || dmPlayer.role !== 'dm') {
      return NextResponse.json(
        { error: 'Acceso denegado. Se requieren privilegios de Dungeon Master.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    let targetId = searchParams.get('id');

    if (!targetId) {
      try {
        const body = await request.json();
        targetId = body.id;
      } catch {
        // JSON vacío o ausente
      }
    }

    if (!targetId || typeof targetId !== 'string') {
      return NextResponse.json({ error: 'El ID del aventurero a revocar es obligatorio.' }, { status: 400 });
    }

    // Salvaguarda: El DM no puede revocar su propio acceso
    if (targetId === dmPlayer.id) {
      return NextResponse.json(
        { error: 'No puedes revocar tu propio acceso de Master DM.' },
        { status: 400 }
      );
    }

    let admin;
    try {
      admin = createAdminClient();
    } catch {
      return NextResponse.json(
        { error: 'Configuración de base de datos no disponible en el servidor.' },
        { status: 503 }
      );
    }

    // Verificar si el objetivo es un DM principal definido en variables de entorno
    const { data: targetPlayer } = await admin
      .from('players')
      .select('id, email, display_name')
      .eq('id', targetId)
      .maybeSingle();

    if (!targetPlayer) {
      return NextResponse.json({ error: 'El aventurero no fue encontrado en la base de datos.' }, { status: 404 });
    }

    const rawAdmin = process.env.ADMIN_EMAILS || process.env.DM_EMAILS || '';
    const adminList = rawAdmin.split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
    if (adminList.includes(targetPlayer.email.toLowerCase())) {
      return NextResponse.json(
        { error: 'No es posible revocar a un Dungeon Master protegido en variables de entorno.' },
        { status: 400 }
      );
    }

    // Desvincular fichas de personajes asociadas
    try {
      await admin
        .from('characters')
        .update({ player_id: null })
        .eq('player_id', targetId);
    } catch (charErr) {
      console.warn('[invitations DELETE] Error al desvincular personajes:', charErr);
    }

    // Eliminar registro de public.players
    const { error: deleteError } = await admin
      .from('players')
      .delete()
      .eq('id', targetId);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Acceso revocado para ${targetPlayer.display_name} (${targetPlayer.email}).`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error inesperado al revocar acceso.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
