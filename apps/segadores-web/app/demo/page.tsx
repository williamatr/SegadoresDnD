'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Dices,
  Shield,
  Swords,
  Sparkles,
  BookOpen,
  ArrowRight,
  Heart,
  Zap,
  CheckCircle2,
  Info,
  Layers,
  Compass
} from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { TaperedRule, DndBadge } from '@segadores/ui';
import { CharacterSheet, type CharacterSheetTab } from '@segadores/character-sheet';
import {
  PUBLIC_DEMO_PREVIEWS,
  PUBLIC_DEMO_FULL_CHARACTERS
} from '@/lib/demo/demo-characters';
import type { Character, ActiveEffect, DeathSaves, CharacterPersonality } from '@segadores/dnd-core';

interface DemoClassArchetype {
  id: string;
  name: string;
  role: string;
  hitDie: string;
  primaryStat: string;
  savingThrows: string[];
  description: string;
  startingAc: number;
  startingHp: number;
  featuredWeapon: string;
  signatureFeature: string;
}

const DEMO_CLASSES: DemoClassArchetype[] = [
  {
    id: 'guerrero',
    name: 'Guerrero',
    role: 'Defensor de Primera Línea y Maestro de Armas',
    hitDie: 'd10',
    primaryStat: 'Fuerza',
    savingThrows: ['Fuerza', 'Constitución'],
    description: 'Especialista en todo tipo de armas y armaduras pesadas. Capaz de resistir daño masivo y tomar aliento para curarse en pleno combate.',
    startingAc: 18,
    startingHp: 12,
    featuredWeapon: 'Espada Larga y Escudo',
    signatureFeature: 'Tomar Aliento (Second Wind) y Estilo de Combate'
  },
  {
    id: 'mago',
    name: 'Mago',
    role: 'Conjurador Académico y Daño de Área',
    hitDie: 'd6',
    primaryStat: 'Inteligencia',
    savingThrows: ['Inteligencia', 'Sabiduría'],
    description: 'Erudito de lo arcano que prepara conjuros de un grimorio. Domina proyectiles mágicos, ilusiones y defensas arcanas.',
    startingAc: 12,
    startingHp: 8,
    featuredWeapon: 'Varita / Bastón y Grimorio',
    signatureFeature: 'Recuperación Arcana y Conjuración de Rituales'
  },
  {
    id: 'picaro',
    name: 'Pícaro',
    role: 'Infiltrador, Pericias y Daño Crítico Furtivo',
    hitDie: 'd8',
    primaryStat: 'Destreza',
    savingThrows: ['Destreza', 'Inteligencia'],
    description: 'Experto en sigilo, trampas y ataques de oportunidad letales utilizando armas sutiles con su Ataque Furtivo.',
    startingAc: 14,
    startingHp: 9,
    featuredWeapon: 'Estoque y Dagas Arrojadizas',
    signatureFeature: 'Ataque Furtivo (Sneak Attack) y Acción Astuta'
  },
  {
    id: 'clerigo',
    name: 'Clérigo',
    role: 'Sanador Divino y Bastión Espiritual',
    hitDie: 'd8',
    primaryStat: 'Sabiduría',
    savingThrows: ['Sabiduría', 'Carisma'],
    description: 'Canalizador del poder de los dioses. Combina armaduras medias/pesadas con magia curativa y castigos radiantes.',
    startingAc: 16,
    startingHp: 10,
    featuredWeapon: 'Maza Sagrada y Escudo con Símbolo',
    signatureFeature: 'Canalizar Divinidad y Conjuros de Dominio'
  },
  {
    id: 'barbaro',
    name: 'Bárbaro',
    role: 'Coloso Imparable y Furia en Combate',
    hitDie: 'd12',
    primaryStat: 'Fuerza',
    savingThrows: ['Fuerza', 'Constitución'],
    description: 'Guerrero salvaje que desata su Furia para absorber la mitad del daño de armas y derribar enemigos con fuerza bruta.',
    startingAc: 15,
    startingHp: 15,
    featuredWeapon: 'Gran Hacha a Dos Manos',
    signatureFeature: 'Furia Temeraria y Defensa sin Armadura (CON)'
  },
  {
    id: 'bardo',
    name: 'Bardo',
    role: 'Inspiración, Diplomacia y Versatilidad',
    hitDie: 'd8',
    primaryStat: 'Carisma',
    savingThrows: ['Destreza', 'Carisma'],
    description: 'Músico y narrador que teje magia a través de palabras. Fortalece las tiradas de sus aliados con Inspiración Bárdica.',
    startingAc: 14,
    startingHp: 9,
    featuredWeapon: 'Estoque y Laúd de Conjuración',
    signatureFeature: 'Inspiración Bárdica y Aprendiz de Mucho'
  },
  {
    id: 'druida',
    name: 'Druida',
    role: 'Magia de la Naturaleza y Forma Salvaje',
    hitDie: 'd8',
    primaryStat: 'Sabiduría',
    savingThrows: ['Inteligencia', 'Sabiduría'],
    description: 'Guardián del equilibrio elemental. Capaz de transformarse en bestias y controlar plantas, venenos o esporas fungosas.',
    startingAc: 14,
    startingHp: 10,
    featuredWeapon: 'Cimitarra de Madera y Foco Druídico',
    signatureFeature: 'Forma Salvaje y Comunión con la Naturaleza'
  },
  {
    id: 'paladin',
    name: 'Paladín',
    role: 'Guerrero Santo y Castigo Radiante',
    hitDie: 'd10',
    primaryStat: 'Fuerza / Carisma',
    savingThrows: ['Sabiduría', 'Carisma'],
    description: 'Juramentado con un voto sagrado de justicia. Convierte ranuras de conjuro en daño radiante abrasador con Castigo Divino.',
    startingAc: 18,
    startingHp: 12,
    featuredWeapon: 'Espada Larga y Escudo con Blasón',
    signatureFeature: 'Castigo Divino (Divine Smite) e Imposición de Manos'
  },
  {
    id: 'explorador',
    name: 'Explorador',
    role: 'Rastreador Letal y Tirador de Precisión',
    hitDie: 'd10',
    primaryStat: 'Destreza / Sabiduría',
    savingThrows: ['Fuerza', 'Destreza'],
    description: 'Cazador errante de las fronteras salvajes. Experto en combate a distancia y magia de emboscada como Marca del Cazador.',
    startingAc: 15,
    startingHp: 11,
    featuredWeapon: 'Arco Largo y Espadas Cortas Gemelas',
    signatureFeature: 'Marca del Cazador y Explorador Nato'
  },
  {
    id: 'hechicero',
    name: 'Hechicero',
    role: 'Magia Innata y Metamagia',
    hitDie: 'd6',
    primaryStat: 'Carisma',
    savingThrows: ['Constitución', 'Carisma'],
    description: 'Portador de poder arcano en la sangre. Moldea y altera los conjuros mediante Puntos de Brujería y Metamagia.',
    startingAc: 12,
    startingHp: 8,
    featuredWeapon: 'Daga Ceremonial y Foco de Cristal',
    signatureFeature: 'Metamagia (Conjuro Acelerado / Sutil)'
  },
  {
    id: 'brujo',
    name: 'Brujo',
    role: 'Pactos Ocultos y Deflagración Mística',
    hitDie: 'd8',
    primaryStat: 'Carisma',
    savingThrows: ['Sabiduría', 'Carisma'],
    description: 'Pactante con entidades patronas sobrenaturales. Sus espacios de conjuro son de nivel máximo y recargan en descanso corto.',
    startingAc: 13,
    startingHp: 9,
    featuredWeapon: 'Guja Arcana y Deflagración Mística',
    signatureFeature: 'Magia de Pacto y Evocaciones Ocultas'
  },
  {
    id: 'monje',
    name: 'Monje',
    role: 'Artes Marciales, Agilidad y Ki',
    hitDie: 'd8',
    primaryStat: 'Destreza / Sabiduría',
    savingThrows: ['Fuerza', 'Destreza'],
    description: 'Maestro de la energía corporal. Golpea con puños desnudos, esquiva proyectiles y gasta Ki para desencadenar ráfagas de golpes.',
    startingAc: 16,
    startingHp: 10,
    featuredWeapon: 'Bastón y Golpes Desarmados',
    signatureFeature: 'Puntos de Ki (Ráfaga de Golpes) y Artes Marciales'
  }
];

export default function DemoPage() {
  const [viewMode, setViewMode] = useState<'sheet' | 'archetypes'>('sheet');
  const [selectedHeroSlug, setSelectedHeroSlug] = useState<string>('valeros-srd');
  const [selectedClassId, setSelectedClassId] = useState<string>('guerrero');
  const [activeSheetTab, setActiveSheetTab] = useState<CharacterSheetTab>('stats');

  // Estado mutable local para interactuar con las fichas públicas de muestra
  const [demoCharacters, setDemoCharacters] = useState<Record<string, Character>>(() => {
    return { ...PUBLIC_DEMO_FULL_CHARACTERS };
  });

  // Cargar selección previa de localStorage
  useEffect(() => {
    try {
      const savedClass = localStorage.getItem('segadores_demo_class');
      if (savedClass && DEMO_CLASSES.some(c => c.id === savedClass)) {
        setSelectedClassId(savedClass);
      }
      const savedHero = localStorage.getItem('segadores_demo_hero');
      if (savedHero && PUBLIC_DEMO_FULL_CHARACTERS[savedHero]) {
        setSelectedHeroSlug(savedHero);
      }
      const savedData = localStorage.getItem('segadores_demo_characters_state');
      if (savedData) {
        setDemoCharacters(prev => ({ ...prev, ...JSON.parse(savedData) }));
      }
    } catch {
      // Ignorar fallos de acceso a localStorage
    }
  }, []);

  const saveDemoState = (newMap: Record<string, Character>) => {
    setDemoCharacters(newMap);
    try {
      localStorage.setItem('segadores_demo_characters_state', JSON.stringify(newMap));
    } catch {
      // Ignorar límites
    }
  };

  const selectHero = (slug: string) => {
    setSelectedHeroSlug(slug);
    try {
      localStorage.setItem('segadores_demo_hero', slug);
    } catch {}
  };

  const currentHero: Character = demoCharacters[selectedHeroSlug] || demoCharacters['valeros-srd'] || PUBLIC_DEMO_FULL_CHARACTERS['valeros-srd'];
  const currentClass = DEMO_CLASSES.find(c => c.id === selectedClassId) || DEMO_CLASSES[0];

  const updateCurrentHero = (updater: (prev: Character) => Character) => {
    setDemoCharacters(prev => {
      const current = prev[selectedHeroSlug] || PUBLIC_DEMO_FULL_CHARACTERS[selectedHeroSlug] || prev['valeros-srd'];
      const updated = updater({ ...current });
      const nextMap = { ...prev, [selectedHeroSlug]: updated };
      saveDemoState(nextMap);
      return nextMap;
    });
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 space-y-8">
        {/* Encabezado */}
        <section className="space-y-4 text-center sm:text-left">
          <div className="inline-flex items-center gap-2">
            <DndBadge variant="parchment" size="sm" icon={<Dices className="w-3.5 h-3.5 text-dnd-gold" />}>
              Demostración Pública Interactiva &bull; D&D 5.5e (SRD 5.2.1 + Campaña)
            </DndBadge>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl font-bold tracking-wide text-dnd-ink font-dnd-title uppercase leading-tight drop-shadow-sm">
              Suite Interactiva de Demostración
            </h1>
            <TaperedRule variant="gold" />
          </div>
          <p className="text-sm sm:text-base text-dnd-ink-muted font-dnd-body max-w-3xl leading-relaxed">
            Explora la experiencia completa de <strong className="text-dnd-crimson font-dnd-title">@segadores/character-sheet</strong> en vivo. Modifica Puntos de Golpe, activa heridas de las Tablas A y B, gasta ranuras de conjuro, sintoniza objetos y navega las 7 vistas tácticas de la hoja oficial.
          </p>
        </section>

        {/* Selector de Modo: Suite 7 Vistas vs Arquetipos Nivel 1 */}
        <div className="flex flex-wrap items-center gap-3 border-b border-dnd-border-antique pb-3 font-dnd-title">
          <button
            type="button"
            onClick={() => setViewMode('sheet')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider transition border ${
              viewMode === 'sheet'
                ? 'bg-dnd-crimson border-dnd-gold text-white shadow-md'
                : 'bg-dnd-parchment-contrast border-dnd-border-antique text-dnd-ink-muted hover:text-dnd-ink hover:bg-dnd-parchment'
            }`}
          >
            <Sparkles className="w-4 h-4 text-dnd-gold" />
            Hojas de Personaje Interactivas (7 Vistas A–G)
          </button>
          <button
            type="button"
            onClick={() => setViewMode('archetypes')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider transition border ${
              viewMode === 'archetypes'
                ? 'bg-dnd-crimson border-dnd-gold text-white shadow-md'
                : 'bg-dnd-parchment-contrast border-dnd-border-antique text-dnd-ink-muted hover:text-dnd-ink hover:bg-dnd-parchment'
            }`}
          >
            <Layers className="w-4 h-4 text-dnd-gold" />
            Arquetipos Canónicos Nivel 1 (SRD 5.2.1)
          </button>
        </div>

        {viewMode === 'sheet' ? (
          /* MODO A: SUITE DE HOJAS DE PERSONAJE (LAS 7 VISTAS INTERACTIVAS A–G) */
          <div className="space-y-6">
            {/* Barra de Selección de Héroes de Muestra Públicos (SRD 5.2.1) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-dnd-gold font-dnd-title uppercase tracking-wider block">
                  Selecciona un Héroe de Muestra (SRD 5.2.1) para Probar su Ficha:
                </span>
                <span className="text-[11px] text-dnd-gold font-dnd-title px-2 py-0.5 rounded-sm bg-dnd-crimson-surface border border-dnd-gold/40">
                  Licencia CC-BY-4.0 SRD
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {PUBLIC_DEMO_PREVIEWS.map(c => {
                  const isSelected = c.slug === selectedHeroSlug;
                  return (
                    <button
                      key={c.slug}
                      type="button"
                      onClick={() => selectHero(c.slug)}
                      className={`p-4 rounded-sm border-2 text-left transition flex flex-col justify-between space-y-2.5 dnd-notched ${
                        isSelected
                          ? 'bg-dnd-parchment text-dnd-ink border-dnd-gold ring-1 ring-dnd-gold shadow-md'
                          : 'bg-dnd-parchment-contrast hover:bg-dnd-parchment text-dnd-ink border-dnd-border-antique hover:border-dnd-gold shadow-xs'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-dnd-title font-bold text-sm text-dnd-crimson block uppercase tracking-wide">
                            {c.name}
                          </span>
                          {isSelected && (
                            <span className="text-[10px] font-dnd-title uppercase tracking-widest text-dnd-gold bg-dnd-gold-surface px-1.5 py-0.5 rounded border border-dnd-gold">
                              Activo
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-dnd-terracotta block font-dnd-title font-semibold mt-0.5">
                          Nv. {c.level} &bull; {c.characterClass} ({c.subclass})
                        </span>
                      </div>
                      <p className="text-xs text-dnd-ink-muted font-dnd-body line-clamp-2 leading-relaxed">
                        {c.specialTrait}
                      </p>
                      <div className="flex items-center justify-between text-[11px] pt-2 border-t border-dnd-border-antique text-dnd-ink-muted font-dnd-title">
                        <span className="text-dnd-crimson font-bold">{c.maxHp} PG</span>
                        <span className="text-dnd-gold font-bold">{c.armorClass} CA</span>
                        <span className="text-dnd-ink-subtle font-semibold">{c.race}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Renderizado de la Suite Completa */}
            <CharacterSheet
              character={currentHero}
              activeTab={activeSheetTab}
              onTabChange={setActiveSheetTab}
              readOnly={false}
              userRole="player"
              onUpdateHp={(hp, temp) => updateCurrentHero(c => ({ ...c, current_hp: hp, temp_hp: temp }))}
              onUpdateDeathSaves={ds => updateCurrentHero(c => ({ ...c, death_saves: ds }))}
              onUpdateHitDice={hd => updateCurrentHero(c => ({ ...c, hit_dice_current: hd }))}
              onUpdateExhaustion={ex => updateCurrentHero(c => ({ ...c, exhaustion: ex }))}
              onUpdateResource={(id, used) =>
                updateCurrentHero(c => ({
                  ...c,
                  class_resources: (c.class_resources || []).map(r => r.id === id ? { ...r, used } : r)
                }))
              }
              onUpdateSpellSlot={(lvl, used) =>
                updateCurrentHero(c => {
                  const s = { ...(c.spell_slots || {}) };
                  if (s[lvl]) s[lvl] = { ...s[lvl], used };
                  return { ...c, spell_slots: s };
                })
              }
              onToggleConcentration={sp => updateCurrentHero(c => ({ ...c, concentrating_on: sp }))}
              onToggleInspiration={insp => updateCurrentHero(c => ({ ...c, inspiration: insp }))}
              onToggleAttunement={slug =>
                updateCurrentHero(c => ({
                  ...c,
                  inventory: (c.inventory || []).map(it => it.slug === slug ? { ...it, attuned: !it.attuned } : it)
                }))
              }
              onToggleEquipped={slug =>
                updateCurrentHero(c => ({
                  ...c,
                  inventory: (c.inventory || []).map(it => it.slug === slug ? { ...it, equipped: !it.equipped } : it)
                }))
              }
              onApplyEffect={eff =>
                updateCurrentHero(c => ({
                  ...c,
                  active_effects: [...(c.active_effects || []), eff]
                }))
              }
              onRemoveEffect={id =>
                updateCurrentHero(c => ({
                  ...c,
                  active_effects: (c.active_effects || []).filter(e => e.id !== id)
                }))
              }
              onUpdatePersonalityField={(f, val) =>
                updateCurrentHero(c => ({
                  ...c,
                  personality: { ...(c.personality || { traits: '', ideals: '', bonds: '', flaws: '' }), [f]: val }
                }))
              }
              onUpdatePlayerNotes={n => updateCurrentHero(c => ({ ...c, player_notes: n }))}
              onShortRest={() =>
                updateCurrentHero(c => ({
                  ...c,
                  class_resources: (c.class_resources || []).map(r => r.recharge === 'short_rest' ? { ...r, used: 0 } : r)
                }))
              }
              onLongRest={() =>
                updateCurrentHero(c => {
                  const slots = { ...(c.spell_slots || {}) };
                  for (const k of Object.keys(slots)) slots[k] = { ...slots[k], used: 0 };
                  return {
                    ...c,
                    current_hp: c.max_hp,
                    temp_hp: 0,
                    exhaustion: Math.max(0, (c.exhaustion || 0) - 1),
                    spell_slots: slots,
                    class_resources: (c.class_resources || []).map(r => ({ ...r, used: 0 })),
                    death_saves: { successes: 0, failures: 0 },
                    concentrating_on: null
                  };
                })
              }
              onLevelUp={updatedHero => updateCurrentHero(() => updatedHero)}
            />
          </div>
        ) : (
          /* MODO B: ARQUETIPOS CANÓNICOS DE NIVEL 1 */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-xs font-bold text-dnd-gold font-dnd-title uppercase tracking-wider">
                Elige una Clase para Explorar
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {DEMO_CLASSES.map(cls => {
                  const isSelected = cls.id === selectedClassId;
                  return (
                    <button
                      key={cls.id}
                      type="button"
                      onClick={() => setSelectedClassId(cls.id)}
                      className={`p-3.5 rounded-sm border-2 text-left transition relative flex flex-col justify-between h-28 dnd-notched ${
                        isSelected
                          ? 'bg-dnd-parchment border-dnd-gold text-dnd-ink ring-1 ring-dnd-gold shadow-md'
                          : 'bg-dnd-parchment-contrast hover:bg-dnd-parchment border-dnd-border-antique hover:border-dnd-gold text-dnd-ink shadow-xs'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-dnd-title font-bold text-sm text-dnd-crimson uppercase tracking-wide">
                            {cls.name}
                          </span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-dnd-gold" />}
                        </div>
                        <span className="text-[11px] text-dnd-ink-muted font-dnd-body block mt-0.5">
                          Dado de Golpe: <strong className="text-dnd-crimson font-semibold">{cls.hitDie}</strong>
                        </span>
                      </div>

                      <span className="text-[10px] text-dnd-terracotta font-dnd-title font-bold truncate block uppercase tracking-wider">
                        {cls.primaryStat}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-6 rounded-sm bg-dnd-parchment text-dnd-ink border-2 border-dnd-border-antique dnd-notched space-y-6 shadow-xl sticky top-24">
              <div className="border-b border-dnd-border-antique pb-4 space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-dnd-terracotta font-dnd-title font-bold">
                  Arquetipo Seleccionado
                </span>
                <h3 className="text-2xl font-bold text-dnd-crimson font-dnd-title uppercase tracking-wide">
                  {currentClass.name} Nivel 1
                </h3>
                <p className="text-xs text-dnd-ink-muted font-dnd-body">{currentClass.role}</p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-3 rounded-sm bg-dnd-parchment-contrast border border-dnd-border-antique">
                  <span className="text-dnd-ink-muted block text-[10px] font-dnd-title uppercase">Puntos Golpe</span>
                  <span className="text-lg font-bold text-dnd-crimson font-dnd-title flex items-center justify-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-dnd-crimson" /> {currentClass.startingHp}
                  </span>
                </div>

                <div className="p-3 rounded-sm bg-dnd-parchment-contrast border border-dnd-border-antique">
                  <span className="text-dnd-ink-muted block text-[10px] font-dnd-title uppercase">Clase Armadura</span>
                  <span className="text-lg font-bold text-dnd-gold font-dnd-title flex items-center justify-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-dnd-gold" /> {currentClass.startingAc}
                  </span>
                </div>

                <div className="p-3 rounded-sm bg-dnd-parchment-contrast border border-dnd-border-antique">
                  <span className="text-dnd-ink-muted block text-[10px] font-dnd-title uppercase">Dado Golpe</span>
                  <span className="text-lg font-bold text-dnd-ink font-dnd-title flex items-center justify-center gap-1">
                    <Dices className="w-3.5 h-3.5 text-dnd-gold" /> {currentClass.hitDie}
                  </span>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <span className="text-dnd-ink-muted font-dnd-title uppercase text-[10px] tracking-wide block">Salvaciones Competentes:</span>
                  <div className="flex gap-1.5">
                    {currentClass.savingThrows.map(s => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded-sm bg-dnd-parchment-contrast border border-dnd-border-antique text-dnd-crimson font-dnd-title font-bold text-[11px]"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-dnd-ink-muted font-dnd-title uppercase text-[10px] tracking-wide block">Equipo Inicial Destacado:</span>
                  <p className="text-dnd-ink font-dnd-body text-xs font-semibold">{currentClass.featuredWeapon}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-dnd-ink-muted font-dnd-title uppercase text-[10px] tracking-wide block">Rasgo Emblemático:</span>
                  <p className="text-dnd-crimson font-dnd-title font-bold text-xs">{currentClass.signatureFeature}</p>
                </div>

                <p className="text-dnd-ink-muted font-dnd-body leading-relaxed pt-2 border-t border-dnd-border-antique">
                  {currentClass.description}
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href={`/hechizos?clase=${encodeURIComponent(currentClass.name)}`}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-dnd-crimson hover:bg-dnd-crimson-hover border border-dnd-gold text-white text-xs font-dnd-title font-bold uppercase tracking-wider shadow-sm transition"
                >
                  <BookOpen className="w-3.5 h-3.5 text-dnd-gold" />
                  Consultar Hechizos de {currentClass.name}
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
