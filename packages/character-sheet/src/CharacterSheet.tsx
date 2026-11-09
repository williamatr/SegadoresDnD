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
import { TaperedRule, DndBadge } from '@segadores/ui';
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
      {/* 1. Encabezado Táctico del Personaje - Estilo Pergamino Editorial D&D 5e */}
      <header className="relative bg-dnd-parchment text-dnd-ink border border-dnd-border-antique shadow-lg p-5 sm:p-7 rounded-lg dnd-notched space-y-4">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            {/* Cintillas de Rasgos de Personaje */}
            <div className="flex items-center gap-2 flex-wrap">
              <DndBadge variant="parchment" size="sm">
                {character.race}
              </DndBadge>
              <DndBadge variant="crimson" size="sm">
                {character.character_class}
              </DndBadge>
              <DndBadge variant="gold" size="sm">
                Nivel {character.level}
              </DndBadge>
              <span
                className="text-xs px-2.5 py-0.5 rounded-md bg-dnd-parchment-contrast border border-dnd-border-antique text-dnd-crimson font-dnd-title font-bold flex items-center gap-1"
                title={`Puntos de Experiencia: ${(character.experience_points || 0).toLocaleString()} PX`}
              >
                <Sparkles className="w-3 h-3 text-dnd-gold" />
                {(character.experience_points || 0).toLocaleString()} PX
              </span>
            </div>

            {/* Nombre del Personaje en Cinzel Carmesí Profundo */}
            <h1 className="text-3xl sm:text-4xl font-dnd-title font-black text-dnd-crimson tracking-wide mt-2 drop-shadow-sm uppercase">
              {character.name}
            </h1>

            {/* Trasfondo y Alineamiento con serifa clásica */}
            <p className="text-xs text-dnd-ink-muted font-dnd-body mt-0.5">
              <span className="font-semibold text-dnd-ink">{character.background}</span> &bull;{' '}
              <span
                className={
                  character.alignment.toLowerCase().includes('pendiente')
                    ? 'text-dnd-terracotta italic font-semibold'
                    : 'text-dnd-ink-muted'
                }
              >
                {character.alignment}
              </span>
            </p>
          </div>

          {/* Medidores rápidos: Inspiración, Subir Nivel, Rol */}
          <div className="relative z-10 flex items-center gap-2.5 flex-wrap">
            {!readOnly && (
              <button
                type="button"
                onClick={() => setIsLevelUpModalOpen(true)}
                className="px-3.5 py-1.5 rounded-md bg-gradient-to-r from-dnd-terracotta to-dnd-gold hover:from-[#a34712] hover:to-[#a88225] text-white font-dnd-title font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md border border-dnd-gold transition active:scale-95"
                title="Abrir motor de subida de nivel y multiclase al 50%"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Subir Nivel</span>
              </button>
            )}

            {/* Sello de Inspiración */}
            <button
              disabled={readOnly}
              onClick={() => onToggleInspiration?.(!character.inspiration)}
              className={`px-3 py-1.5 rounded-md border text-xs font-dnd-title font-bold flex items-center gap-1.5 transition ${
                character.inspiration
                  ? 'bg-dnd-gold/20 border-dnd-gold text-dnd-gold font-bold shadow-sm'
                  : 'bg-dnd-parchment-contrast border-dnd-border-antique text-dnd-ink-muted hover:text-dnd-ink'
              }`}
              title="Inspiración del Dungeon Master (otorga ventaja en 1 tirada de d20)"
            >
              <Star
                className={`w-3.5 h-3.5 ${
                  character.inspiration ? 'fill-current text-dnd-gold' : ''
                }`}
              />
              <span>Inspiración</span>
            </button>

            {/* Distintivo de Rol */}
            {userRole === 'dm' ? (
              <span className="px-2.5 py-1.5 rounded-md bg-dnd-crimson border border-dnd-crimson-hover text-white font-dnd-title font-bold text-xs flex items-center gap-1 shadow-sm">
                <Lock className="w-3 h-3 text-dnd-gold-light" /> Máster 🔒
              </span>
            ) : (
              <span className="px-2.5 py-1.5 rounded-md bg-dnd-parchment-contrast border border-dnd-border-antique text-dnd-crimson font-dnd-title font-bold text-xs flex items-center gap-1">
                <UserCheck className="w-3 h-3 text-dnd-gold" /> Jugador
              </span>
            )}
          </div>
        </div>

        {/* Línea divisoria cónica canónica */}
        <TaperedRule variant="crimson" className="my-2" />

        {/* Barra Rápida de Salud y Defensas en el Encabezado */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 font-dnd-body text-xs text-dnd-ink">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-dnd-crimson shrink-0" />
            <span>
              PG: <strong className="font-dnd-title text-dnd-crimson text-sm">{character.current_hp}</strong>/{character.max_hp}
              {character.temp_hp > 0 && <span className="text-cyan-600 dark:text-cyan-400 font-semibold"> (+{character.temp_hp})</span>}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-dnd-gold shrink-0" />
            <span>
              CA Efectiva: <strong className="font-dnd-title text-dnd-crimson text-sm">{evaluatedState.effectiveAc}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-dnd-terracotta shrink-0" />
            <span>
              Velocidad: <strong className="font-dnd-title text-sm">{evaluatedState.effectiveSpeed} pies</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-dnd-gold shrink-0" />
            <span>
              Iniciativa: <strong className="font-dnd-title text-dnd-crimson text-sm">{character.initiative_modifier >= 0 ? `+${character.initiative_modifier}` : character.initiative_modifier}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-dnd-terracotta shrink-0" />
            <span>
              Agotamiento:{' '}
              <strong className={`font-dnd-title text-sm ${exhaustion > 0 ? 'text-dnd-crimson' : 'text-dnd-ink-muted'}`}>
                {exhaustion}/6
              </strong>
            </span>
          </div>
        </div>
      </header>

      {/* 2. Selector Responsivo de las 7 Pestañas A–G (Estilo Pestañas de Tomo de Cuero/Pergamino) */}
      <nav className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
        {TABS.map(tab => {
          const isSelected = tab.id === currentTab;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabSelect(tab.id)}
              className={`px-3.5 py-2.5 rounded-t-md border-t-2 text-left transition flex items-center gap-2.5 shrink-0 relative select-none ${
                isSelected
                  ? 'bg-dnd-parchment text-dnd-crimson border-t-dnd-gold border-x border-dnd-border-antique shadow-md z-10'
                  : 'bg-dnd-leather/90 hover:bg-dnd-leather text-dnd-ink-muted hover:text-dnd-ink border-t-transparent border-x border-dnd-leather-dark'
              }`}
            >
              {/* Letra de Vista (A–G) */}
              <div
                className={`w-6 h-6 rounded-md flex items-center justify-center font-dnd-title font-black text-xs shrink-0 ${
                  isSelected
                    ? 'bg-dnd-crimson text-white shadow-sm'
                    : 'bg-dnd-leather-dark text-dnd-gold border border-dnd-gold/30'
                }`}
              >
                {tab.letter}
              </div>

              <div>
                <span
                  className={`text-xs font-dnd-title font-bold block leading-tight ${
                    isSelected ? 'text-dnd-crimson' : 'text-dnd-ink'
                  }`}
                >
                  {tab.label}
                </span>
                <span
                  className={`text-xs block leading-tight font-dnd-body ${
                    isSelected ? 'text-dnd-ink-muted' : 'text-dnd-ink-subtle'
                  }`}
                >
                  {tab.subtitle}
                </span>
              </div>

              {/* Badges reactivos */}
              {tab.badge && (
                <span
                  className={`px-2 py-0.5 rounded-md text-xs font-dnd-title font-bold shrink-0 ${
                    tab.badgeVariant === 'red'
                      ? 'bg-dnd-crimson text-white shadow-xs'
                      : tab.badgeVariant === 'purple'
                        ? 'bg-purple-900 text-purple-200'
                        : tab.badgeVariant === 'emerald'
                          ? 'bg-emerald-800 text-emerald-100'
                          : 'bg-dnd-gold text-dnd-leather-dark font-bold'
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
