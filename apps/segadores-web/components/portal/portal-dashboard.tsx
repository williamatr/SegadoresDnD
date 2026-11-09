'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Shield,
  Swords,
  Coins,
  Package,
  Lock,
  Eye,
  UserCheck,
  Sparkles,
  LogOut,
  ChevronRight,
  ExternalLink,
  Star,
  Compass,
  ArrowRight
} from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { TaperedRule, DndBadge } from '@segadores/ui';
import {
  CAMPAIGN_CHARACTERS,
  CAMPAIGN_FULL_CHARACTERS,
  getCampaignCharacterBySlug,
  type CampaignCharacterPreview
} from '@/lib/campaign/characters';
import { CharacterSheet, type CharacterSheetTab } from '@segadores/character-sheet';
import type { Character, ActiveEffect, DeathSaves, CharacterPersonality } from '@segadores/dnd-core';
import { DmInvitationsConsole } from '@/components/portal/dm-invitations-console';
import type { AdminPlayerItem } from '@/app/api/admin/invitations/route';

export interface PortalDashboardProps {
  userEmail: string | null;
  player: {
    id: string;
    email: string;
    display_name: string;
    role: 'dm' | 'player';
    assigned_character_slug?: string | null;
    invited_by?: string | null;
  } | null;
  initialPlayers?: AdminPlayerItem[];
}

export function PortalDashboard({ userEmail, player, initialPlayers = [] }: PortalDashboardProps) {
  const isDm = player?.role === 'dm';

  // Si el usuario es DM, puede alternar para previsualizar cómo ve la mesa un jugador
  const [dmPreviewAsPlayer, setDmPreviewAsPlayer] = useState(false);
  // Simulación específica por personaje para pruebas de DM en local / desarrollo
  const [simulatedHeroSlug, setSimulatedHeroSlug] = useState<string | null>(null);

  // Selección automática de personaje: si el usuario tiene asignado un personaje, se preselecciona;
  // si es DM, se selecciona 'zuma' o el primero de la lista.
  const defaultCharSlug = player?.assigned_character_slug || (isDm ? 'zuma' : 'alizar');
  const [selectedSlug, setSelectedSlug] = useState<string>(defaultCharSlug);
  const [activeSheetTab, setActiveSheetTab] = useState<CharacterSheetTab>('stats');

  // Estado mutable local de las 5 fichas de personaje
  const [charactersMap, setCharactersMap] = useState<Record<string, Character>>(() => {
    return { ...CAMPAIGN_FULL_CHARACTERS };
  });

  // Cargar estado guardado en localStorage si existe para persistencia de sesión táctica
  useEffect(() => {
    try {
      const saved = localStorage.getItem('segadores_portal_characters');
      if (saved) {
        const parsed = JSON.parse(saved);
        setCharactersMap(prev => ({ ...prev, ...parsed }));
      }
    } catch {
      // Ignorar fallo de parseo
    }
  }, []);

  const saveCharactersMap = (newMap: Record<string, Character>) => {
    setCharactersMap(newMap);
    try {
      localStorage.setItem('segadores_portal_characters', JSON.stringify(newMap));
    } catch {
      // Ignorar límites de almacenamiento
    }
  };

  const isSimulating = isDm && simulatedHeroSlug !== null;
  const activeRole: 'dm' | 'player' = isSimulating ? 'player' : (isDm ? (dmPreviewAsPlayer ? 'player' : 'dm') : 'player');
  const effectiveAssignedSlug = isSimulating ? simulatedHeroSlug : player?.assigned_character_slug;
  const simulatedHeroName = simulatedHeroSlug ? CAMPAIGN_CHARACTERS.find(c => c.slug === simulatedHeroSlug)?.name : null;
  const displayName = isSimulating ? `${simulatedHeroName} (Simulado)` : (player?.display_name || userEmail?.split('@')[0] || 'Aventurero');
  const hasAssignedCharacter = Boolean(effectiveAssignedSlug);

  // Personaje actualmente seleccionado
  const activeCharRecord: Character = charactersMap[selectedSlug] || charactersMap['zuma'] || CAMPAIGN_FULL_CHARACTERS['zuma'];
  const activePreview = getCampaignCharacterBySlug(selectedSlug) || CAMPAIGN_CHARACTERS[0];

  // Permisos: Si es DM (sin simular), puede editar cualquier ficha. Si es jugador (o simula ser jugador), solo la que tenga asignada.
  const isReadOnlyForUser = activeRole === 'player' && effectiveAssignedSlug !== selectedSlug;

  // Actualizador genérico de la ficha activa
  const updateCurrentCharacter = (updater: (prev: Character) => Character) => {
    setCharactersMap(prev => {
      const current = prev[selectedSlug] || CAMPAIGN_FULL_CHARACTERS[selectedSlug] || prev['zuma'];
      const updated = updater({ ...current });
      const nextMap = { ...prev, [selectedSlug]: updated };
      saveCharactersMap(nextMap);
      return nextMap;
    });
  };

  // Handlers para la suite de CharacterSheet
  const handleUpdateHp = (currentHp: number, tempHp: number) => {
    updateCurrentCharacter(c => ({
      ...c,
      current_hp: currentHp,
      temp_hp: tempHp
    }));
  };

  const handleUpdateDeathSaves = (deathSaves: DeathSaves) => {
    updateCurrentCharacter(c => ({
      ...c,
      death_saves: deathSaves
    }));
  };

  const handleUpdateHitDice = (current: number) => {
    updateCurrentCharacter(c => ({
      ...c,
      hit_dice_current: current
    }));
  };

  const handleUpdateExhaustion = (exhaustion: number) => {
    updateCurrentCharacter(c => ({
      ...c,
      exhaustion
    }));
  };

  const handleUpdateResource = (resourceId: string, used: number) => {
    updateCurrentCharacter(c => ({
      ...c,
      class_resources: (c.class_resources || []).map(r =>
        r.id === resourceId ? { ...r, used } : r
      )
    }));
  };

  const handleUpdateSpellSlot = (level: string, used: number) => {
    updateCurrentCharacter(c => {
      const slots = { ...(c.spell_slots || {}) };
      if (slots[level]) {
        slots[level] = { ...slots[level], used };
      }
      return { ...c, spell_slots: slots };
    });
  };

  const handleToggleConcentration = (spellName: string | null) => {
    updateCurrentCharacter(c => ({
      ...c,
      concentrating_on: spellName
    }));
  };

  const handleToggleInspiration = (hasInspiration: boolean) => {
    updateCurrentCharacter(c => ({
      ...c,
      inspiration: hasInspiration
    }));
  };

  const handleToggleAttunement = (itemSlug: string) => {
    updateCurrentCharacter(c => ({
      ...c,
      inventory: (c.inventory || []).map(it =>
        it.slug === itemSlug ? { ...it, attuned: !it.attuned } : it
      )
    }));
  };

  const handleToggleEquipped = (itemSlug: string) => {
    updateCurrentCharacter(c => ({
      ...c,
      inventory: (c.inventory || []).map(it =>
        it.slug === itemSlug ? { ...it, equipped: !it.equipped } : it
      )
    }));
  };

  const handleApplyEffect = (effect: ActiveEffect) => {
    updateCurrentCharacter(c => ({
      ...c,
      active_effects: [...(c.active_effects || []), effect]
    }));
  };

  const handleRemoveEffect = (effectId: string) => {
    updateCurrentCharacter(c => ({
      ...c,
      active_effects: (c.active_effects || []).filter(e => e.id !== effectId)
    }));
  };

  const handleUpdatePersonalityField = (field: keyof CharacterPersonality, value: string) => {
    updateCurrentCharacter(c => ({
      ...c,
      personality: {
        ...(c.personality || { traits: '', ideals: '', bonds: '', flaws: '' }),
        [field]: value
      }
    }));
  };

  const handleUpdatePlayerNotes = (notes: string) => {
    updateCurrentCharacter(c => ({
      ...c,
      player_notes: notes
    }));
  };

  const handleShortRest = () => {
    updateCurrentCharacter(c => {
      // Restaurar recursos de descanso corto
      const updatedResources = (c.class_resources || []).map(r =>
        r.recharge === 'short_rest' ? { ...r, used: 0 } : r
      );
      return {
        ...c,
        class_resources: updatedResources
      };
    });
  };

  const handleLongRest = () => {
    updateCurrentCharacter(c => {
      // Restaurar PG al 100%
      const maxHp = c.max_hp;
      // Reducir agotamiento en 1
      const newExhaustion = Math.max(0, (c.exhaustion || 0) - 1);
      // Recuperar ranuras
      const restoredSlots = { ...(c.spell_slots || {}) };
      for (const k of Object.keys(restoredSlots)) {
        restoredSlots[k] = { ...restoredSlots[k], used: 0 };
      }
      // Recuperar todos los recursos diarios y de descanso corto
      const restoredResources = (c.class_resources || []).map(r => ({ ...r, used: 0 }));
      // Recuperar la mitad de los dados de golpe
      const totalDice = c.level;
      const currentDice = c.hit_dice_current;
      const recoveredDice = Math.min(totalDice, currentDice + Math.max(1, Math.floor(totalDice / 2)));

      return {
        ...c,
        current_hp: maxHp,
        temp_hp: 0,
        exhaustion: newExhaustion,
        hit_dice_current: recoveredDice,
        spell_slots: restoredSlots,
        class_resources: restoredResources,
        concentrating_on: null,
        death_saves: { successes: 0, failures: 0 }
      };
    });
  };

  const handleLevelUp = (updatedCharacter: Character) => {
    updateCurrentCharacter(() => updatedCharacter);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Header />

      {/* BARRA DE SIMULACIÓN DE PERSPECTIVA DE JUGADOR (Modo de Pruebas DM) */}
      {isDm && (
        <div className="bg-[#1c130e] border-b-2 border-[#c29b38]/60 text-[#fdf6ea] px-4 py-2.5 sticky top-16 z-30 shadow-xl">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#c29b38] animate-pulse shrink-0" />
              <div>
                <span className="font-dnd-title font-bold text-xs text-[#c29b38] tracking-wider uppercase mr-2">
                  Consola de Pruebas DM:
                </span>
                <span className="text-xs font-dnd-body text-[#d4c2a5]">
                  {isSimulating ? (
                    <>
                      Viendo el portal como: <strong className="text-[#fdf6ea] font-dnd-title">{simulatedHeroName}</strong> (Rol Jugador)
                    </>
                  ) : (
                    <>
                      Perspectiva actual: <strong className="text-[#f87171] font-dnd-title">Master DM 🔒</strong> (Control total)
                    </>
                  )}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-dnd-body text-[#a89b88] mr-1 hidden sm:inline">Probar vista de:</span>
              <button
                type="button"
                onClick={() => {
                  setSimulatedHeroSlug(null);
                  setDmPreviewAsPlayer(false);
                }}
                className={`px-2.5 py-1 rounded-sm text-[11px] font-dnd-title font-bold uppercase tracking-wider border transition ${
                  !isSimulating
                    ? 'bg-[#58180D] text-[#fdf6ea] border-[#7a2021] shadow-sm'
                    : 'bg-[#2c1e18] text-[#d4c2a5] border-[#58544d] hover:text-[#fdf6ea]'
                }`}
                title="Restaurar vista completa de Dungeon Master con consola de invitaciones y edición total"
              >
                👑 Vista DM
              </button>
              {CAMPAIGN_CHARACTERS.map(c => {
                const isAct = simulatedHeroSlug === c.slug;
                return (
                  <button
                    key={c.slug}
                    type="button"
                    onClick={() => {
                      setSimulatedHeroSlug(c.slug);
                      setSelectedSlug(c.slug);
                      setDmPreviewAsPlayer(false);
                    }}
                    className={`px-2.5 py-1 rounded-sm text-[11px] font-dnd-title font-medium uppercase tracking-wider border transition ${
                      isAct
                        ? 'bg-[#c29b38] text-[#1c130e] border-[#eab308] font-bold shadow-sm'
                        : 'bg-[#2c1e18] text-[#d4c2a5] border-[#58544d] hover:text-[#fdf6ea]'
                    }`}
                    title={`Simular qué vería ${c.name} al entrar al portal`}
                  >
                    {c.name.split(' ')[0]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 space-y-10">
        {/* Encabezado y Perfil de Jugador Autenticado */}
        <section className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-2">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2">
              <DndBadge variant="parchment" size="sm" icon={<Shield className="w-3.5 h-3.5 text-[#58180D]" />}>
                Compañía Mercenaria &bull; Phandalin
              </DndBadge>
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-wider text-[#58180D] font-dnd-title uppercase">
              Portal de Campaña
            </h1>
            <p className="text-sm text-[#58544d] font-dnd-body max-w-xl leading-relaxed">
              Consola táctica de los miembros de <strong className="text-[#58180D] font-dnd-title">Segadores de Orcos</strong>. Suite completa de hojas de personaje reactivas e inventario del baúl de provisiones.
            </p>
          </div>

          {/* Tarjeta de Sesión Activa */}
          <div className="p-4 rounded-sm bg-[#fdf6ea] text-[#242528] border-2 border-[#d4c2a5] dnd-notched space-y-3 shrink-0 shadow-md">
            <div className="flex items-center justify-between gap-4 border-b border-[#d4c2a5]/80 pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-sm bg-[#58180D] border border-[#c29b38] flex items-center justify-center text-[#c29b38] font-dnd-title font-bold text-xs shadow-sm">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <span className="text-xs font-dnd-title font-bold text-[#58180D] block leading-tight">
                    {displayName}
                  </span>
                  <span className="text-[10px] text-[#58544d] font-mono block">
                    {userEmail || 'Sesión Local'}
                  </span>
                </div>
              </div>

              {/* Distintivo de Rol */}
              {isDm ? (
                <DndBadge variant="crimson" size="sm" icon={<Lock className="w-3 h-3 text-[#fdf6ea]" />}>
                  Máster 🔒
                </DndBadge>
              ) : (
                <DndBadge variant="parchment" size="sm" icon={<UserCheck className="w-3 h-3 text-[#58180D]" />}>
                  Jugador
                </DndBadge>
              )}
            </div>

            {/* Controles de Sesión y Toggle DM */}
            <div className="flex items-center justify-between gap-2 pt-1 text-xs">
              {isDm ? (
                <button
                  type="button"
                  onClick={() => setDmPreviewAsPlayer(!dmPreviewAsPlayer)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm border text-[11px] font-dnd-title uppercase tracking-wider transition ${
                    dmPreviewAsPlayer
                      ? 'bg-[#58180D] text-[#fdf6ea] border-[#7a2021]'
                      : 'bg-[#ede2cb] text-[#58544d] border-[#d4c2a5] hover:text-[#242528]'
                  }`}
                  title="Permite al Dungeon Master verificar la experiencia visual de un jugador ordinario"
                >
                  <Eye className="w-3 h-3" />
                  {dmPreviewAsPlayer ? 'Volver a Máster' : 'Simular Jugador'}
                </button>
              ) : (
                <span className="text-[11px] text-[#58544d] font-dnd-body flex items-center gap-1">
                  <Shield className="w-3 h-3 text-[#b45309]" /> Rol en BD
                </span>
              )}

              {/* Botón de Cerrar Sesión */}
              <form action="/auth/signout" method="POST">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-[#ede2cb] hover:bg-[#fbeeed] border border-[#d4c2a5] hover:border-[#7a2021] text-[#58544d] hover:text-[#58180D] transition text-[11px] font-dnd-title font-semibold uppercase tracking-wider"
                >
                  <LogOut className="w-3 h-3" />
                  Cerrar sesión
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* CONSOLA DE ADMINISTRACIÓN DEL DM (Solo visible para DM cuando no está en modo simulación) */}
        {activeRole === 'dm' && (
          <DmInvitationsConsole
            currentDmId={player?.id || ''}
            initialPlayers={initialPlayers}
          />
        )}

        {/* TARJETA INFORMATIVA PARA JUGADOR INVITADO SIN PERSONAJE ASIGNADO AÚN */}
        {activeRole === 'player' && !hasAssignedCharacter && (
          <section className="p-6 sm:p-7 rounded-sm bg-[#ede2cb] border-2 border-[#c29b38] dnd-notched shadow-lg space-y-4 animate-in fade-in text-[#242528]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#c29b38]/40 pb-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-sm bg-[#58180D] border-2 border-[#c29b38] flex items-center justify-center text-[#c29b38] shadow-md shrink-0">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5">
                    <DndBadge variant="gold" size="sm">
                      Nuevo Aventurero en la Mesa
                    </DndBadge>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold font-dnd-title text-[#58180D] tracking-wide mt-1 uppercase">
                    Bienvenido a Segadores de Orcos, {displayName}
                  </h2>
                </div>
              </div>
            </div>

            <p className="text-sm text-[#242528]/90 font-dnd-body leading-relaxed max-w-3xl">
              Bienvenido Aventurero. William te ha dado acceso a la mesa. Puedes consultar e interactuar con cualquiera de las hojas de tus compañeros a continuación, o solicitar al DM que te vincule formalmente a tu héroe.
            </p>
          </section>
        )}

        {/* Selector de los 5 Héroes Reales de la Campaña */}
        <section className="space-y-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#58180D] font-dnd-title uppercase tracking-wider flex items-center gap-2">
                <Swords className="w-4 h-4 text-[#b45309]" />
                Héroes Oficiales de la Compañía (Niveles 7 y 8)
              </h2>
              {isReadOnlyForUser && (
                <span className="text-[11px] text-[#58544d] font-dnd-body italic">
                  👀 Modo Lectura (Ficha de Compañero)
                </span>
              )}
            </div>
            <TaperedRule variant="crimson" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {CAMPAIGN_CHARACTERS.map(c => {
              const isSelected = c.slug === selectedSlug;
              const isUserAssigned = effectiveAssignedSlug === c.slug;

              return (
                <button
                  key={c.slug}
                  type="button"
                  onClick={() => setSelectedSlug(c.slug)}
                  className={`p-3.5 rounded-sm border-2 text-left transition flex flex-col justify-between space-y-2 relative overflow-hidden dnd-notched-sm ${
                    isSelected
                      ? 'bg-[#fdf6ea] border-[#b45309] ring-2 ring-[#c29b38]/60 shadow-md text-[#242528]'
                      : 'bg-[#ede2cb] border-[#d4c2a5] text-[#58544d] hover:border-[#b45309]/60 hover:bg-[#fdf6ea]'
                  }`}
                >
                  {isUserAssigned && (
                    <span className="absolute top-2 right-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm bg-[#58180D] border border-[#c29b38] text-[#fdf6ea] text-[9px] font-dnd-title font-bold uppercase shadow-xs">
                      <Star className="w-2.5 h-2.5 text-[#c29b38] fill-[#c29b38]" /> Tu Héroe
                    </span>
                  )}

                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-dnd-title font-bold text-sm text-[#58180D]">
                        {c.name}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#78350f] font-dnd-body font-semibold block mt-0.5">
                      Nv. {c.level} &bull; {c.characterClass}
                    </span>
                    <span className="text-[10px] text-[#58544d] font-dnd-body block truncate">
                      {c.subclass}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-[#d4c2a5]/80 font-dnd-title">
                    <span className="text-[#15803d] font-bold">{c.maxHp} PG</span>
                    <span className="text-[#b45309] font-bold">{c.armorClass} CA</span>
                    <span className="text-[#58544d] text-[10px]">{c.race.split(' ')[0]}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* SUITE COMPLETA DE HOJA DE PERSONAJE (LAS 7 VISTAS INTERACTIVAS A–G) */}
        <section className="space-y-6 pt-4 border-t border-[#d4c2a5]">
          <CharacterSheet
            character={activeCharRecord}
            activeTab={activeSheetTab}
            onTabChange={setActiveSheetTab}
            readOnly={isReadOnlyForUser}
            userRole={activeRole}
            onUpdateHp={handleUpdateHp}
            onUpdateDeathSaves={handleUpdateDeathSaves}
            onUpdateHitDice={handleUpdateHitDice}
            onUpdateExhaustion={handleUpdateExhaustion}
            onUpdateResource={handleUpdateResource}
            onUpdateSpellSlot={handleUpdateSpellSlot}
            onToggleConcentration={handleToggleConcentration}
            onToggleInspiration={handleToggleInspiration}
            onToggleAttunement={handleToggleAttunement}
            onToggleEquipped={handleToggleEquipped}
            onApplyEffect={handleApplyEffect}
            onRemoveEffect={handleRemoveEffect}
            onUpdatePersonalityField={handleUpdatePersonalityField}
            onUpdatePlayerNotes={handleUpdatePlayerNotes}
            onShortRest={handleShortRest}
            onLongRest={handleLongRest}
            onLevelUp={handleLevelUp}
          />
        </section>

        {/* Baúl de la Compañía (Campaign Vault) */}
        <section className="p-6 rounded-sm bg-[#fdf6ea] text-[#242528] border-2 border-[#d4c2a5] dnd-notched space-y-4 shadow-md">
          <div className="space-y-1">
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-[#b45309]" />
                <h3 className="font-dnd-title font-bold text-base text-[#58180D] uppercase tracking-wider">
                  Baúl de la Compañía (Tesoro y Provisiones Compartidas)
                </h3>
              </div>
              <DndBadge variant="parchment" size="sm">
                campaign_vault
              </DndBadge>
            </div>
            <TaperedRule variant="crimson" />
          </div>

          {/* Monedas y Provisiones */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
            <div className="p-3 rounded-sm bg-[#ede2cb] border border-[#d4c2a5]">
              <span className="text-[#58544d] font-dnd-title text-[10px] uppercase block">Piezas de Oro</span>
              <span className="text-base font-dnd-title font-bold text-[#b45309]">1,420 po</span>
            </div>
            <div className="p-3 rounded-sm bg-[#ede2cb] border border-[#d4c2a5]">
              <span className="text-[#58544d] font-dnd-title text-[10px] uppercase block">Piezas de Plata</span>
              <span className="text-base font-dnd-title font-bold text-[#334155]">380 pp</span>
            </div>
            <div className="p-3 rounded-sm bg-[#ede2cb] border border-[#d4c2a5]">
              <span className="text-[#58544d] font-dnd-title text-[10px] uppercase block">Pociones de Curación</span>
              <span className="text-base font-dnd-title font-bold text-[#58180D]">4 (Mayor)</span>
            </div>
            <div className="p-3 rounded-sm bg-[#ede2cb] border border-[#d4c2a5]">
              <span className="text-[#58544d] font-dnd-title text-[10px] uppercase block">Provisiones de Ración</span>
              <span className="text-base font-dnd-title font-bold text-[#15803d]">18 Días</span>
            </div>
          </div>

          {activeRole === 'dm' && (
            <div className="p-3 rounded-sm bg-[#fbeeed] border border-[#7a2021] text-[#58180D] text-xs flex items-center justify-between animate-in fade-in font-dnd-body">
              <span className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-[#7a2021]" />
                <strong>Vista DM Activa:</strong> Acceso al libro secreto de reparto y objetos no identificados de Phandalin.
              </span>
              <span className="text-[10px] font-mono font-bold text-[#7a2021]">#dm-only</span>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
