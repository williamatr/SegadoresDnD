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
        <div className="bg-gradient-to-r from-amber-950/95 via-slate-900/95 to-amber-950/95 border-b border-amber-600/50 text-amber-100 px-4 py-2.5 sticky top-16 z-30 shadow-xl backdrop-blur-md">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
              <div>
                <span className="font-fantasy font-bold text-xs text-dnd-gold tracking-wide uppercase mr-2">
                  Consola de Pruebas DM:
                </span>
                <span className="text-xs text-slate-200">
                  {isSimulating ? (
                    <>
                      Viendo el portal como: <strong className="text-dnd-gold-light">{simulatedHeroName}</strong> (Rol Jugador)
                    </>
                  ) : (
                    <>
                      Perspectiva actual: <strong className="text-red-400">Master DM 🔒</strong> (Control total)
                    </>
                  )}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-slate-400 mr-1 hidden sm:inline">Probar vista de:</span>
              <button
                onClick={() => {
                  setSimulatedHeroSlug(null);
                  setDmPreviewAsPlayer(false);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                  !isSimulating
                    ? 'bg-red-950 text-red-200 border-red-600 shadow ring-1 ring-red-500'
                    : 'bg-dnd-surface text-slate-300 border-dnd-border hover:text-slate-100'
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
                    onClick={() => {
                      setSimulatedHeroSlug(c.slug);
                      setSelectedSlug(c.slug);
                      setDmPreviewAsPlayer(false);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition ${
                      isAct
                        ? 'bg-amber-900/90 text-amber-200 border-amber-500 shadow-md ring-1 ring-amber-400 font-bold'
                        : 'bg-dnd-surface text-slate-300 border-dnd-border hover:text-slate-100 hover:border-slate-600'
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/40 border border-amber-800/40 text-dnd-gold-light text-xs font-medium">
              <Shield className="w-3.5 h-3.5" />
              Compañía Mercenaria &bull; Phandalin
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-100 font-fantasy">
              Portal de Campaña
            </h1>
            <p className="text-sm text-slate-400 max-w-xl">
              Consola táctica de los miembros de <strong className="text-slate-200">Segadores de Orcos</strong>. Suite completa de hojas de personaje reactivas (TASK-06) e inventario del baúl de provisiones.
            </p>
          </div>

          {/* Tarjeta de Sesión Activa */}
          <div className="p-4 rounded-2xl bg-dnd-card border border-dnd-border space-y-3 shrink-0 shadow-lg">
            <div className="flex items-center justify-between gap-4 border-b border-dnd-border/60 pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-dnd-gold to-amber-700 flex items-center justify-center text-slate-950 font-bold text-xs shadow-inner">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-100 block leading-tight">
                    {displayName}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono block">
                    {userEmail || 'Sesión Local'}
                  </span>
                </div>
              </div>

              {/* Distintivo de Rol */}
              {isDm ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-950/80 border border-red-700/60 text-red-300 font-bold text-[11px] shadow-sm">
                  <Lock className="w-3 h-3 text-red-400" /> Máster 🔒
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-950/50 border border-amber-800/40 text-dnd-gold-light font-semibold text-[11px]">
                  <UserCheck className="w-3 h-3 text-dnd-gold" /> Jugador
                </span>
              )}
            </div>

            {/* Controles de Sesión y Toggle DM */}
            <div className="flex items-center justify-between gap-2 pt-1 text-xs">
              {isDm ? (
                <button
                  onClick={() => setDmPreviewAsPlayer(!dmPreviewAsPlayer)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] transition ${
                    dmPreviewAsPlayer
                      ? 'bg-amber-950/40 text-amber-300 border-amber-800/50'
                      : 'bg-dnd-surface text-slate-300 border-dnd-border hover:text-slate-100'
                  }`}
                  title="Permite al Dungeon Master verificar la experiencia visual de un jugador ordinario"
                >
                  <Eye className="w-3 h-3" />
                  {dmPreviewAsPlayer ? 'Volver a Vista Máster' : 'Simular Vista Jugador'}
                </button>
              ) : (
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Shield className="w-3 h-3 text-slate-600" /> Rol asignado en BD
                </span>
              )}

              {/* Botón de Cerrar Sesión */}
              <form action="/auth/signout" method="POST">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dnd-surface hover:bg-red-950/50 border border-dnd-border hover:border-red-800/60 text-slate-300 hover:text-red-200 transition text-[11px] font-medium"
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
          <section className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-amber-950/50 via-slate-900 to-purple-950/30 border border-amber-600/50 shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-amber-800/40 pb-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-dnd-gold to-amber-700 flex items-center justify-center text-slate-950 shadow-lg shrink-0">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-700/60 text-dnd-gold-light text-[11px] font-semibold">
                    <Compass className="w-3 h-3 text-dnd-gold" />
                    Nuevo Aventurero en la Mesa
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold font-fantasy text-slate-100 tracking-wide mt-1">
                    Bienvenido a Segadores de Orcos, {displayName}
                  </h2>
                </div>
              </div>
            </div>

            <p className="text-sm text-slate-200 leading-relaxed max-w-3xl">
              Bienvenido Aventurero. William te ha dado acceso a la mesa. Puedes consultar e interactuar con cualquiera de las hojas de tus compañeros a continuación, o solicitar al DM que te vincule formalmente a tu héroe.
            </p>
          </section>
        )}

        {/* Selector de los 5 Héroes Reales de la Campaña */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Swords className="w-4 h-4 text-dnd-gold" />
              Héroes Oficiales de la Compañía (Niveles 7 y 8)
            </h2>
            {isReadOnlyForUser && (
              <span className="text-[11px] text-slate-400 font-mono">
                👀 Modo Lectura (Ficha de Compañero)
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {CAMPAIGN_CHARACTERS.map(c => {
              const isSelected = c.slug === selectedSlug;
              const isUserAssigned = effectiveAssignedSlug === c.slug;

              return (
                <button
                  key={c.slug}
                  onClick={() => setSelectedSlug(c.slug)}
                  className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between space-y-2 relative overflow-hidden ${
                    isSelected
                      ? 'bg-dnd-surface border-dnd-gold ring-1 ring-dnd-gold shadow-lg shadow-amber-950/30'
                      : 'bg-dnd-card border-dnd-border text-slate-400 hover:border-slate-600 hover:text-slate-200'
                  }`}
                >
                  {isUserAssigned && (
                    <span className="absolute top-2 right-2 inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-amber-950/90 border border-amber-600/60 text-dnd-gold-light text-[9px] font-bold shadow-sm">
                      <Star className="w-2.5 h-2.5 text-dnd-gold fill-dnd-gold" /> Tu Héroe
                    </span>
                  )}

                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-fantasy font-bold text-sm text-slate-100">
                        {c.name}
                      </span>
                    </div>
                    <span className="text-[11px] text-dnd-gold-light font-semibold block mt-0.5">
                      Nv. {c.level} &bull; {c.characterClass}
                    </span>
                    <span className="text-[10px] text-slate-500 block truncate">
                      {c.subclass}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-dnd-border/60">
                    <span className="text-emerald-400 font-semibold font-mono">{c.maxHp} PG</span>
                    <span className="text-amber-300 font-semibold font-mono">{c.armorClass} CA</span>
                    <span className="text-slate-500 font-mono">{c.race.split(' ')[0]}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* SUITE COMPLETA DE HOJA DE PERSONAJE (LAS 7 VISTAS INTERACTIVAS A–G) */}
        <section className="space-y-6 pt-4 border-t border-dnd-border/80">
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
        <section className="p-6 rounded-3xl bg-dnd-card border border-dnd-border space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-dnd-border/80 pb-3">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-400" />
              <h3 className="font-fantasy font-bold text-base text-slate-100">
                Baúl de la Compañía (Tesoro y Provisiones Compartidas)
              </h3>
            </div>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 font-mono">
              campaign_vault
            </span>
          </div>

          {/* Monedas de Campaña */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
            <div className="p-3 rounded-xl bg-dnd-surface border border-dnd-border">
              <span className="text-slate-500 block text-[10px]">Piezas de Oro</span>
              <span className="text-base font-bold text-dnd-gold">1,420 po</span>
            </div>
            <div className="p-3 rounded-xl bg-dnd-surface border border-dnd-border">
              <span className="text-slate-500 block text-[10px]">Piezas de Plata</span>
              <span className="text-base font-bold text-slate-300">380 pp</span>
            </div>
            <div className="p-3 rounded-xl bg-dnd-surface border border-dnd-border">
              <span className="text-slate-500 block text-[10px]">Pociones de Curación</span>
              <span className="text-base font-bold text-red-400">4 (Mayor)</span>
            </div>
            <div className="p-3 rounded-xl bg-dnd-surface border border-dnd-border">
              <span className="text-slate-500 block text-[10px]">Provisiones de Ración</span>
              <span className="text-base font-bold text-emerald-400">18 Días</span>
            </div>
          </div>

          {activeRole === 'dm' && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/50 text-red-200 text-xs flex items-center justify-between animate-in fade-in">
              <span className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-red-400" />
                <strong>Vista DM Activa:</strong> Acceso al libro secreto de reparto y objetos no identificados de Phandalin.
              </span>
              <span className="text-[10px] font-mono text-red-300">#dm-only</span>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
