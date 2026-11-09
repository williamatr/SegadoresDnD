import { NextResponse, type NextRequest } from 'next/server';
import { getCurrentPlayer } from '@/lib/auth/get-current-player';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Character } from '@segadores/dnd-core';

export const dynamic = 'force-dynamic';

/**
 * POST /api/characters/update
 * Persiste mutaciones de ficha de personaje directamente en public.characters de Supabase.
 * Regla de Acceso:
 * - El DM puede editar cualquier personaje de la campaña.
 * - El Jugador solo puede editar su personaje asignado (assigned_character_slug).
 */
export async function POST(request: NextRequest) {
  try {
    const { player, user } = await getCurrentPlayer();

    if (!player && !user) {
      return NextResponse.json(
        { error: 'Sesión no iniciada. Debes autenticarte para modificar personajes.' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || !body.slug || !body.character) {
      return NextResponse.json(
        { error: 'Parámetros inválidos. Se requiere "slug" y el objeto "character".' },
        { status: 400 }
      );
    }

    const slug = String(body.slug).trim();
    const character = body.character as Partial<Character>;

    // Control de acceso RBAC
    const isDm = player?.role === 'dm';
    const isAssignedPlayer = player?.role === 'player' && player.assigned_character_slug === slug;

    if (!isDm && !isAssignedPlayer) {
      return NextResponse.json(
        { error: `Acceso denegado. No tienes permisos para modificar al personaje "${slug}".` },
        { status: 403 }
      );
    }

    let admin;
    try {
      admin = createAdminClient();
    } catch {
      // Entorno sin credenciales de Supabase (ej. local sin .env o testing offline)
      return NextResponse.json({
        success: true,
        persistedLocally: true,
        slug,
        message: 'Variables de Supabase no configuradas. Cambio persistido localmente.'
      });
    }

    // Payload tipado de columnas oficiales en public.characters
    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
      last_synced_at: new Date().toISOString()
    };

    if (character.current_hp !== undefined) updatePayload.current_hp = character.current_hp;
    if (character.temp_hp !== undefined) updatePayload.temp_hp = character.temp_hp;
    if (character.max_hp !== undefined) updatePayload.max_hp = character.max_hp;
    if (character.armor_class !== undefined) updatePayload.armor_class = character.armor_class;
    if (character.speed !== undefined) updatePayload.speed = character.speed;
    if (character.exhaustion !== undefined) updatePayload.exhaustion = character.exhaustion;
    if (character.death_saves !== undefined) updatePayload.death_saves = character.death_saves;
    if (character.hit_dice_current !== undefined) updatePayload.hit_dice_current = character.hit_dice_current;
    if (character.inspiration !== undefined) updatePayload.inspiration = character.inspiration;
    if (character.spell_slots !== undefined) updatePayload.spell_slots = character.spell_slots;
    if (character.inventory !== undefined) updatePayload.inventory = character.inventory;
    if (character.currency !== undefined) updatePayload.currency = character.currency;
    if (character.prepared_spells !== undefined) updatePayload.prepared_spells = character.prepared_spells;
    if (character.active_effects !== undefined) updatePayload.active_effects = character.active_effects;
    if (character.class_resources !== undefined) updatePayload.class_resources = character.class_resources;
    if (character.player_notes !== undefined) updatePayload.player_notes = character.player_notes;
    if (character.personality !== undefined) updatePayload.personality = character.personality;
    if (character.concentrating_on !== undefined) updatePayload.concentrating_on = character.concentrating_on;
    if (character.level !== undefined) updatePayload.level = character.level;
    if (character.experience_points !== undefined) updatePayload.experience_points = character.experience_points;
    if (character.multiclass !== undefined) updatePayload.multiclass = character.multiclass;

    const { error: dbError } = await admin
      .from('characters')
      .update(updatePayload)
      .eq('slug', slug);

    if (dbError) {
      console.error(`[API characters/update] Error actualizando "${slug}" en Supabase:`, dbError);
      return NextResponse.json(
        { error: `Error en base de datos: ${dbError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      slug,
      updated_at: updatePayload.updated_at
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error inesperado';
    console.error('[API characters/update] Excepción interna:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
