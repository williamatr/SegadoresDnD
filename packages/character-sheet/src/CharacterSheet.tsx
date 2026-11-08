import React, { useState } from 'react';
import {
  Shield,
  Swords,
  Package,
  BookOpen,
  Scroll,
  BookMarked,
  Activity,
  Heart,
  Sparkles,
  Zap,
  Star,
  Flame,
  Lock,
  UserCheck
} from 'lucide-react';
import type { CharacterSheetProps, CharacterSheetTab, TabConfig } from './types.ts';
import { evaluateCharacterState } from '@segadores/dnd-core';
import { CoreStatsView } from './views/CoreStatsView.tsx';
import { CombatConsoleView } from './views/CombatConsoleView.tsx';
import { InventoryView } from './views/InventoryView.tsx';
import { SpellsAndAbilitiesView } from './views/SpellsAndAbilitiesView.tsx';
import { LoreAndChronicleView } from './views/LoreAndChronicleView.tsx';
import { ContextualRulesView } from './views/ContextualRulesView.tsx';
import { ConditionsAndEffectsView } from './views/ConditionsAndEffectsView.tsx';
import { LevelUpModal } from './components/LevelUpModal.tsx';

export function CharacterSheet({
  character,
  activeTab: controlledTab,
  onTabChange,
  readOnly = false,
  userRole = 'player',
  evaluatedState: externalEvaluatedState,
  className = '',
  onUpdateHp,
  onUpdateDeathSaves,
  onUpdateHitDice,
  onUpdateExhaustion,
  onUpdateResource,
  onUpdateSpellSlot,
  onToggleConcentration,
  onToggleInspiration,
  onToggleAttunement,
  onToggleEquipped,
  onApplyEffect,
  onRemoveEffect,
  onUpdatePersonalityField,
  onUpdatePlayerNotes,
  onShortRest,
  onLongRest,
  onTriggerInjuryTable,
  onLevelUp
}: CharacterSheetProps) {
  // Manejo de pestaña activa (controlada o interna)
  const [internalTab, setInternalTab] = useState<CharacterSheetTab>('stats');
  const [isLevelUpModalOpen, setIsLevelUpModalOpen] = useState(false);
  const currentTab = controlledTab || internalTab;

  const handleTabSelect = (tab: CharacterSheetTab) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalTab(tab);
    }
  };

  // Evaluar estado con @segadores/dnd-core
  const evaluatedState = externalEvaluatedState || evaluateCharacterState(character);

  const activeEffectsCount = character.active_effects?.length || 0;
  const exhaustion = character.exhaustion || 0;
  const attunedItemsCount = (character.inventory || []).filter(i => i.requires_attunement && i.attuned).length;

  // Configuración de las 7 pestañas A–G
  const TABS: TabConfig[] = [
    {
      id: 'stats',
      letter: 'A',
      label: 'Estadísticas Nucleares',
      subtitle: 'Atributos & Defensas',
      badge: exhaustion > 0 ? `Fatiga ${exhaustion}` : null,
      badgeVariant: 'red'
    },
    {
      id: 'combat',
      letter: 'B',
      label: 'Consola de Combate',
      subtitle: 'Acciones & Armas',
      badge: character.concentrating_on ? 'Concentrado' : null,
      badgeVariant: 'purple'
    },
    {
      id: 'inventory',
      letter: 'C',
      label: 'Inventario & Sintonización',
      subtitle: 'Mochila & Equipo',
      badge: `${attunedItemsCount}/${character.attunement_slots || 3}`,
      badgeVariant: 'gold'
    },
    {
      id: 'spells',
      letter: 'D',
      label: 'Hechizos & Habilidades',
      subtitle: 'Grimorio & Rasgos',
      badge: character.known_spells?.length ? `${character.known_spells.length}` : null,
      badgeVariant: 'purple'
    },
    {
      id: 'lore',
      letter: 'E',
      label: 'Lore & Crónica',
      subtitle: 'Personalidad & Notas',
      badge: character.alignment.toLowerCase().includes('pendiente') ? 'Pendiente' : null,
      badgeVariant: 'emerald'
    },
    {
      id: 'rules',
      letter: 'F',
      label: 'Reglas Contextuales',
      subtitle: 'Mecánicas de mi Héroe',
      badge: null
    },
    {
      id: 'effects',
      letter: 'G',
      label: 'Condiciones & Heridas',
      subtitle: 'Tablas A/B & Estados',
      badge: activeEffectsCount > 0 ? `${activeEffectsCount}` : null,
      badgeVariant: 'red'
    }
  ];

  return (
    <div className={`space-y-6 max-w-6xl w-full mx-auto ${className}`}>
      {/* 1. Encabezado Táctico del Personaje */}
      <header className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-dnd-card via-slate-900 to-dnd-card border border-dnd-border shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-950/70 border border-amber-800/50 text-dnd-gold font-semibold font-fantasy uppercase">
                {character.race}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300 font-mono">
                {character.character_class}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-dnd-surface border border-dnd-gold/60 text-dnd-gold-light font-bold">
                Nivel {character.level}
              </span>
              <span
                className="text-xs px-2.5 py-0.5 rounded-full bg-slate-900 border border-amber-600/50 text-amber-300 font-mono flex items-center gap-1 font-semibold"
                title={`Puntos de Experiencia: ${(character.experience_points || 0).toLocaleString()} PX`}
              >
                <Sparkles className="w-3 h-3 text-dnd-gold" />
                {(character.experience_points || 0).toLocaleString()} PX
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-100 font-fantasy tracking-wide mt-1.5">
              {character.name}
            </h1>

            <p className="text-xs text-slate-400 mt-0.5">
              {character.background} &bull;{' '}
              <span className={character.alignment.toLowerCase().includes('pendiente') ? 'text-amber-400 italic' : 'text-slate-300'}>
                {character.alignment}
              </span>
            </p>
          </div>

          {/* Medidores rápidos de Encabezado: Inspiración, Concentración, Rol */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Botón de Subir de Nivel */}
            {!readOnly && (
              <button
                type="button"
                onClick={() => setIsLevelUpModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950 font-fantasy font-bold text-xs uppercase tracking-wide flex items-center gap-1.5 shadow-md shadow-amber-950/40 transition active:scale-95"
                title="Abrir motor de subida de nivel y multiclase al 50%"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Subir Nivel</span>
              </button>
            )}

            {/* Toggle de Inspiración */}
            <button
              disabled={readOnly}
              onClick={() => onToggleInspiration?.(!character.inspiration)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                character.inspiration
                  ? 'bg-amber-500/20 border-dnd-gold text-dnd-gold shadow-md'
                  : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
              }`}
              title="Inspiración del Dungeon Master (otorga ventaja en 1 tirada de d20)"
            >
              <Star className={`w-3.5 h-3.5 ${character.inspiration ? 'fill-dnd-gold' : ''}`} />
              <span>Inspiración</span>
            </button>

            {/* Distintivo de Rol */}
            {userRole === 'dm' ? (
              <span className="px-2.5 py-1.5 rounded-xl bg-red-950/80 border border-red-700 text-red-300 font-bold text-xs flex items-center gap-1">
                <Lock className="w-3 h-3 text-red-400" /> Máster 🔒
              </span>
            ) : (
              <span className="px-2.5 py-1.5 rounded-xl bg-amber-950/40 border border-amber-800/40 text-dnd-gold-light font-semibold text-xs flex items-center gap-1">
                <UserCheck className="w-3 h-3 text-dnd-gold" /> Jugador
              </span>
            )}
          </div>
        </div>

        {/* Barra Rápida de Salud y Defensas en el Encabezado */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-dnd-border/60 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Heart className="w-4 h-4 text-red-400 shrink-0" />
            <span>
              PG: <strong className="text-emerald-400 font-mono">{character.current_hp}</strong>/{character.max_hp}
              {character.temp_hp > 0 && <span className="text-cyan-400 font-mono"> (+{character.temp_hp})</span>}
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-300">
            <Shield className="w-4 h-4 text-dnd-gold shrink-0" />
            <span>
              CA Efectiva: <strong className="text-amber-300 font-mono">{evaluatedState.effectiveAc}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-300">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Velocidad: <strong className="text-slate-200 font-mono">{evaluatedState.effectiveSpeed} pies</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-300">
            <Sparkles className="w-4 h-4 text-dnd-gold shrink-0" />
            <span>
              Experiencia: <strong className="text-amber-300 font-mono">{(character.experience_points || 0).toLocaleString()}</strong> PX
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-300">
            <Flame className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              Agotamiento:{' '}
              <strong className={exhaustion > 0 ? 'text-red-400 font-mono' : 'text-slate-400 font-mono'}>
                {exhaustion}/6
              </strong>
            </span>
          </div>
        </div>
      </header>

      {/* 2. Selector Responsivo de las 7 Pestañas A–G */}
      <nav className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
        {TABS.map(tab => {
          const isSelected = tab.id === currentTab;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabSelect(tab.id)}
              className={`px-3.5 py-2.5 rounded-2xl border text-left transition flex items-center gap-2.5 shrink-0 relative ${
                isSelected
                  ? 'bg-dnd-surface border-dnd-gold ring-1 ring-dnd-gold shadow-lg shadow-amber-950/20'
                  : 'bg-dnd-card border-dnd-border text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {/* Letra de Vista (A–G) */}
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center font-fantasy font-extrabold text-xs shrink-0 ${
                  isSelected
                    ? 'bg-dnd-gold text-slate-950 shadow-inner'
                    : 'bg-slate-900 border border-slate-700 text-slate-400'
                }`}
              >
                {tab.letter}
              </div>

              <div>
                <span
                  className={`text-xs font-bold block leading-tight ${
                    isSelected ? 'text-slate-100 font-fantasy' : 'text-slate-300'
                  }`}
                >
                  {tab.label}
                </span>
                <span className="text-[10px] text-slate-500 block leading-tight">
                  {tab.subtitle}
                </span>
              </div>

              {/* Badges reactivos */}
              {tab.badge && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold shrink-0 ${
                    tab.badgeVariant === 'red'
                      ? 'bg-red-950 border border-red-700 text-red-300'
                      : tab.badgeVariant === 'purple'
                      ? 'bg-purple-950 border border-purple-700 text-purple-300'
                      : tab.badgeVariant === 'emerald'
                      ? 'bg-emerald-950 border border-emerald-700 text-emerald-300'
                      : 'bg-amber-950 border border-amber-700 text-dnd-gold-light'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* 3. Renderizado Condicional de la Vista Activa A–G */}
      <main className="transition-all duration-200">
        {currentTab === 'stats' && (
          <CoreStatsView
            character={character}
            readOnly={readOnly}
            userRole={userRole}
            evaluatedState={evaluatedState}
            onUpdateHp={onUpdateHp}
            onUpdateDeathSaves={onUpdateDeathSaves}
            onUpdateHitDice={onUpdateHitDice}
            onUpdateExhaustion={onUpdateExhaustion}
            onUpdateResource={onUpdateResource}
            onShortRest={onShortRest}
            onLongRest={onLongRest}
            onTriggerInjuryTable={table => handleTabSelect('effects')}
            onOpenLevelUp={() => setIsLevelUpModalOpen(true)}
            onLevelUp={onLevelUp}
          />
        )}

        {currentTab === 'combat' && (
          <CombatConsoleView
            character={character}
            readOnly={readOnly}
            userRole={userRole}
            evaluatedState={evaluatedState}
            onUpdateSpellSlot={onUpdateSpellSlot}
            onToggleConcentration={onToggleConcentration}
          />
        )}

        {currentTab === 'inventory' && (
          <InventoryView
            character={character}
            readOnly={readOnly}
            userRole={userRole}
            evaluatedState={evaluatedState}
            onToggleAttunement={onToggleAttunement}
            onToggleEquipped={onToggleEquipped}
          />
        )}

        {currentTab === 'spells' && (
          <SpellsAndAbilitiesView
            character={character}
            readOnly={readOnly}
            userRole={userRole}
            evaluatedState={evaluatedState}
          />
        )}

        {currentTab === 'lore' && (
          <LoreAndChronicleView
            character={character}
            readOnly={readOnly}
            userRole={userRole}
            evaluatedState={evaluatedState}
            onUpdatePersonalityField={onUpdatePersonalityField}
            onUpdatePlayerNotes={onUpdatePlayerNotes}
          />
        )}

        {currentTab === 'rules' && (
          <ContextualRulesView
            character={character}
            readOnly={readOnly}
            userRole={userRole}
            evaluatedState={evaluatedState}
          />
        )}

        {currentTab === 'effects' && (
          <ConditionsAndEffectsView
            character={character}
            readOnly={readOnly}
            userRole={userRole}
            evaluatedState={evaluatedState}
            onApplyEffect={onApplyEffect}
            onRemoveEffect={onRemoveEffect}
          />
        )}
      </main>

      {/* Modal Interactivo de Subida de Nivel y Multiclase */}
      <LevelUpModal
        character={character}
        isOpen={isLevelUpModalOpen}
        onClose={() => setIsLevelUpModalOpen(false)}
        onConfirmLevelUp={onLevelUp}
        readOnly={readOnly}
      />
    </div>
  );
}
