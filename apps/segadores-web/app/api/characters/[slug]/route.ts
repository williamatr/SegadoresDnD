import { NextResponse, type NextRequest } from 'next/server';
import { getCurrentPlayer } from '@/lib/auth/get-current-player';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Character } from '@segadores/dnd-core';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ slug: string }> | { slug: string };
}

/**
 * PATCH /api/characters/[slug] | POST /api/characters/[slug]
 * Persiste mutaciones de estado de ficha en la tabla public.characters de Supabase.
 * Control de Acceso:
 * - El DM (role === 'dm') puede modificar cualquier personaje de la campaña.
 * - Un Jugador (role === 'player') solo puede modificar su personaje asignado (player.assigned_character_slug === slug).
 */
async function handleUpdateCharacter(request: NextRequest, context: RouteContext) {
  try {
    const params = await context.params;
    const slug = params?.slug ? decodeURIComponent(params.slug).trim() : null;

    if (!slug) {
      return NextResponse.json(
        { error: 'El parámetro "slug" de la ruta es obligatorio.' },
        { status: 400 }
      );
    }

    const { player, user } = await getCurrentPlayer();

    if (!player && !user) {
      return NextResponse.json(
        { error: 'Sesión no iniciada. Debes autenticarte para modificar personajes.' },
        { status: 401 }
      );
    }

    // Control de acceso RBAC
    const isDm = player?.role === 'dm';
    const isAssignedPlayer = player?.role === 'player' && player.assigned_character_slug === slug;

    if (!isDm && !isAssignedPlayer) {
      return NextResponse.json(
        { error: `Acceso denegado. No tienes permisos para modificar al personaje "${slug}".` },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { error: 'Cuerpo de solicitud inválido o vacío.' },
        { status: 400 }
      );
    }

    const characterData = (body.character || body) as Partial<Character>;

    let admin;
    try {
      admin = createAdminClient();
    } catch {
      // Entorno sin credenciales de Supabase (ej. local de desarrollo sin .env o pruebas offline)
      return NextResponse.json({
        success: true,
        persistedLocally: true,
        slug,
        character: characterData,
        message: 'Variables de Supabase no configuradas. Cambio retenido localmente.'
      });
    }

    // Payload tipado de columnas oficiales y mutables en public.characters
    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
      last_synced_at: new Date().toISOString()
    };

    if (characterData.current_hp !== undefined) updatePayload.current_hp = characterData.current_hp;
    if (characterData.temp_hp !== undefined) updatePayload.temp_hp = characterData.temp_hp;
    if (characterData.max_hp !== undefined) updatePayload.max_hp = characterData.max_hp;
    if (characterData.armor_class !== undefined) updatePayload.armor_class = characterData.armor_class;
    if (characterData.speed !== undefined) updatePayload.speed = characterData.speed;
    if (characterData.exhaustion !== undefined) updatePayload.exhaustion = characterData.exhaustion;
    if (characterData.death_saves !== undefined) updatePayload.death_saves = characterData.death_saves;
    if (characterData.hit_dice_current !== undefined) updatePayload.hit_dice_current = characterData.hit_dice_current;
    if (characterData.inspiration !== undefined) updatePayload.inspiration = characterData.inspiration;
    if (characterData.spell_slots !== undefined) updatePayload.spell_slots = characterData.spell_slots;
    if (characterData.inventory !== undefined) updatePayload.inventory = characterData.inventory;
    if (characterData.currency !== undefined) updatePayload.currency = characterData.currency;
    if (characterData.prepared_spells !== undefined) updatePayload.prepared_spells = characterData.prepared_spells;
    if (characterData.active_effects !== undefined) updatePayload.active_effects = characterData.active_effects;
    if (characterData.class_resources !== undefined) updatePayload.class_resources = characterData.class_resources;
    if (characterData.player_notes !== undefined) updatePayload.player_notes = characterData.player_notes;
    if (characterData.personality !== undefined) updatePayload.personality = characterData.personality;
    if (characterData.concentrating_on !== undefined) updatePayload.concentrating_on = characterData.concentrating_on;
    if (characterData.level !== undefined) updatePayload.level = characterData.level;
    if (characterData.experience_points !== undefined) updatePayload.experience_points = characterData.experience_points;
    if (characterData.multiclass !== undefined) updatePayload.multiclass = characterData.multiclass;

    const { data: updatedRecord, error: dbError } = await admin
      .from('characters')
      .update(updatePayload)
      .eq('slug', slug)
      .select('*')
      .maybeSingle();

    if (dbError) {
      console.error(`[API characters/${slug}] Error actualizando en Supabase:`, dbError);
      return NextResponse.json(
        { error: `Error en base de datos: ${dbError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      slug,
      character: updatedRecord || characterData,
      updated_at: updatePayload.updated_at
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno al actualizar personaje';
    console.error('[API characters/[slug]] Excepción:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return handleUpdateCharacter(request, context);
}

export async function POST(request: NextRequest, context: RouteContext) {
  return handleUpdateCharacter(request, context);
}
