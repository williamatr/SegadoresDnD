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
      <header className="relative bg-[#fdf6ea] text-[#242528] border-2 border-[#d4c2a5] shadow-xl p-5 sm:p-7 rounded-sm dnd-notched space-y-4">
        {/* Adorno de fondo de hoja física */}
        <div className="absolute inset-0 pointer-events-none border border-[#c4b192]/50 m-1 rounded-sm" />

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
                className="text-[11px] px-2 py-0.5 rounded-sm bg-[#ede2cb] border border-[#d4c2a5] text-[#58180D] font-dnd-title font-bold flex items-center gap-1"
                title={`Puntos de Experiencia: ${(character.experience_points || 0).toLocaleString()} PX`}
              >
                <Sparkles className="w-3 h-3 text-[#c29b38]" />
                {(character.experience_points || 0).toLocaleString()} PX
              </span>
            </div>

            {/* Nombre del Personaje en Cinzel Carmesí Profundo */}
            <h1 className="text-3xl sm:text-4xl font-dnd-title font-black text-[#58180D] tracking-wide mt-2 drop-shadow-sm uppercase">
              {character.name}
            </h1>

            {/* Trasfondo y Alineamiento con serifa clásica */}
            <p className="text-xs text-[#58544d] font-dnd-body mt-0.5">
              <span className="font-semibold text-[#242528]">{character.background}</span> &bull;{' '}
              <span
                className={
                  character.alignment.toLowerCase().includes('pendiente')
                    ? 'text-[#c45b1d] italic font-semibold'
                    : 'text-[#58544d]'
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
                className="px-3.5 py-1.5 rounded-sm bg-gradient-to-r from-[#c45b1d] to-[#c29b38] hover:from-[#a34712] hover:to-[#a88225] text-[#fdf6ea] font-dnd-title font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md border border-[#c29b38] transition active:scale-95"
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
              className={`px-3 py-1.5 rounded-sm border text-xs font-dnd-title font-bold flex items-center gap-1.5 transition ${
                character.inspiration
                  ? 'bg-[#c29b38]/20 border-[#c29b38] text-[#854d0e] shadow-sm'
                  : 'bg-[#ede2cb] border-[#d4c2a5] text-[#58544d] hover:text-[#242528]'
              }`}
              title="Inspiración del Dungeon Master (otorga ventaja en 1 tirada de d20)"
            >
              <Star
                className={`w-3.5 h-3.5 ${
                  character.inspiration ? 'fill-[#c29b38] text-[#854d0e]' : ''
                }`}
              />
              <span>Inspiración</span>
            </button>

            {/* Distintivo de Rol */}
            {userRole === 'dm' ? (
              <span className="px-2.5 py-1.5 rounded-sm bg-[#58180D] border border-[#7a2021] text-[#fdf6ea] font-dnd-title font-bold text-xs flex items-center gap-1 shadow-sm">
                <Lock className="w-3 h-3 text-[#e5b960]" /> Máster 🔒
              </span>
            ) : (
              <span className="px-2.5 py-1.5 rounded-sm bg-[#ede2cb] border border-[#d4c2a5] text-[#58180D] font-dnd-title font-bold text-xs flex items-center gap-1">
                <UserCheck className="w-3 h-3 text-[#c29b38]" /> Jugador
              </span>
            )}
          </div>
        </div>

        {/* Línea divisoria cónica canónica */}
        <TaperedRule variant="crimson" className="my-2" />

        {/* Barra Rápida de Salud y Defensas en el Encabezado */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 font-dnd-body text-xs text-[#242528]">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-[#58180D] shrink-0" />
            <span>
              PG: <strong className="font-dnd-title text-[#58180D] text-sm">{character.current_hp}</strong>/{character.max_hp}
              {character.temp_hp > 0 && <span className="text-cyan-700 font-semibold"> (+{character.temp_hp})</span>}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#c29b38] shrink-0" />
            <span>
              CA Efectiva: <strong className="font-dnd-title text-[#58180D] text-sm">{evaluatedState.effectiveAc}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#c45b1d] shrink-0" />
            <span>
              Velocidad: <strong className="font-dnd-title text-sm">{evaluatedState.effectiveSpeed} pies</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#c29b38] shrink-0" />
            <span>
              Experiencia: <strong className="font-dnd-title text-sm">{(character.experience_points || 0).toLocaleString()}</strong> PX
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#c45b1d] shrink-0" />
            <span>
              Agotamiento:{' '}
              <strong className={`font-dnd-title text-sm ${exhaustion > 0 ? 'text-[#58180D]' : 'text-[#58544d]'}`}>
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
                  ? 'bg-[#fdf6ea] text-[#58180D] border-t-[#c29b38] border-x border-[#d4c2a5] shadow-md z-10'
                  : 'bg-[#2c1e18]/90 hover:bg-[#2c1e18] text-[#d4c2a5] hover:text-[#fdf6ea] border-t-transparent border-x border-[#3d2a22]'
              }`}
            >
              {/* Letra de Vista (A–G) */}
              <div
                className={`w-6 h-6 rounded-sm flex items-center justify-center font-dnd-title font-black text-xs shrink-0 ${
                  isSelected
                    ? 'bg-[#58180D] text-[#fdf6ea] shadow-sm'
                    : 'bg-[#1b120e] text-[#c29b38] border border-[#c29b38]/30'
                }`}
              >
                {tab.letter}
              </div>

              <div>
                <span
                  className={`text-xs font-dnd-title font-bold block leading-tight ${
                    isSelected ? 'text-[#58180D]' : 'text-[#e2e8f0]'
                  }`}
                >
                  {tab.label}
                </span>
                <span
                  className={`text-[10px] block leading-tight font-dnd-body ${
                    isSelected ? 'text-[#58544d]' : 'text-[#94a3b8]'
                  }`}
                >
                  {tab.subtitle}
                </span>
              </div>

              {/* Badges reactivos */}
              {tab.badge && (
                <span
                  className={`px-1.5 py-0.5 rounded-sm text-[10px] font-dnd-title font-bold shrink-0 ${
                    tab.badgeVariant === 'red'
                      ? 'bg-[#58180D] text-[#fdf6ea]'
                      : tab.badgeVariant === 'purple'
                        ? 'bg-purple-900 text-purple-200'
                        : tab.badgeVariant === 'emerald'
                          ? 'bg-emerald-800 text-emerald-100'
                          : 'bg-[#c29b38] text-[#1b120e]'
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
