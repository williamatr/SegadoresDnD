import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  BookOpen,
  Search,
  CheckCircle2,
  TrendingUp,
  Flame,
  Shield,
  HeartHandshake,
  Compass,
  Zap,
  RotateCcw,
  Lock,
  Unlock,
  AlertTriangle,
  Scroll,
  Layers,
  Sword
} from 'lucide-react';
import { DndBadge, TaperedRule } from '@segadores/ui';
import {
  getSpellPreparationRules,
  getSpellsForClass,
  CANONICAL_SPELLS_CATALOG,
  getCanonicalSpellBySlugOrName,
  getClassFeatures,
  isEvocationSavant,
  getClassMilestoneReward,
  type ClassFeatureItem,
  type CanonicalSpellData,
  type SpellPreparationRules
} from '@segadores/dnd-core';
import type { BaseViewProps } from '../types.ts';

interface SpellDisplayItem {
  name: string;
  level: number;
  school: string;
  role: 'daño' | 'soporte' | 'control' | 'utilidad';
  castingTime: string;
  range: string;
  components: { v: boolean; s: boolean; m: boolean; c: boolean; r: boolean };
  prepared: boolean;
  alwaysPrepared: boolean;
  description: string;
  effectSummary?: string;
}

// Catálogo complementario para roles y metadatos adicionales
const ROLE_LOOKUP: Record<string, 'daño' | 'soporte' | 'control' | 'utilidad'> = {
  'Curar heridas': 'soporte',
  'Palabra de curación': 'soporte',
  'Piedad con los moribundos': 'soporte',
  'Guía': 'soporte',
  'Falsa vida': 'soporte',
  'Arma mágica': 'soporte',
  'Caída de pluma': 'soporte',
  'Potenciar característica': 'soporte',
  'Animar a los muertos': 'soporte',
  'Escudo': 'soporte',
  'Armadura de mago': 'soporte',
  'Enmarañar': 'control',
  'Crecimiento espinoso': 'control',
  'Ceguera/Sordera': 'control',
  'Rayo debilitador': 'control',
  'Maremoto': 'control',
  'Confusión': 'control',
  'Hechizar persona': 'control',
  'Dormir': 'control',
  'Sugestión': 'control',
  'Maldecir (Bestow Curse)': 'control',
  'Látigo de espinas': 'daño',
  'Rayo nauseabundo': 'daño',
  'Esfera flamígera': 'daño',
  'Flecha ácida de Melf': 'daño',
  'Agarre electrizante': 'daño',
  'Fuego sagrado': 'daño',
  'Rociada venenosa': 'daño',
  'Manos ardientes': 'daño',
  'Hacer añicos': 'daño',
  'Tocar a los muertos': 'daño',
  'Toque helado': 'daño',
  'Cuchillo de hielo': 'daño',
  'Saeta guía': 'daño',
  'Rayo de luna': 'daño',
  'Marchitar': 'daño',
  'Burlar': 'daño',
  'Susurros disonantes': 'daño',
  'Ola atronadora': 'daño',
  'Proyectil mágico': 'daño',
  'Rayo de escarcha': 'daño',
  'Bola de fuego': 'daño',
  'Relámpago': 'daño',
  'Toque vampírico': 'daño',
  'Asesino fantasmal': 'daño',
  'Muro de fuego': 'daño'
};

export function SpellsAndAbilitiesView({
  character,
  readOnly = false,
  onUpdateSpellSlot,
  onTogglePreparedSpell,
  onToggleConcentration
}: BaseViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<string>('learned');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [filterComponent, setFilterComponent] = useState<string>('all');
  const [catalogSchool, setCatalogSchool] = useState<string>('all');
  const [catalogLevel, setCatalogLevel] = useState<string>('all');
  const [catalogSearch, setCatalogSearch] = useState<string>('');

  const knownSpells = character.known_spells || [];
  const preparedSpells = character.prepared_spells || [];

  // 1. Reglas Canónicas de Preparación de Conjuros del Personaje
  const prepRules: SpellPreparationRules = useMemo(() => {
    return getSpellPreparationRules(character);
  }, [character]);

  // 2. Construcción de lista enriquecida de conjuros aprendidos
  const spellItems: SpellDisplayItem[] = useMemo(() => {
    return knownSpells.map(name => {
      const canonical = getCanonicalSpellBySlugOrName(name);
      const isAlwaysPrep = prepRules.alwaysPreparedSpells.some(
        s => s.toLowerCase() === name.toLowerCase()
      );
      const isCurrentlyPrep = preparedSpells.some(
        s => s.toLowerCase() === name.toLowerCase()
      );

      if (canonical) {
        return {
          name: canonical.name,
          level: canonical.level,
          school: canonical.school,
          role: ROLE_LOOKUP[canonical.name] || 'utilidad',
          castingTime: canonical.castingTime,
          range: canonical.range,
          components: {
            v: canonical.components.verbal,
            s: canonical.components.somatic,
            m: canonical.components.material,
            c: canonical.concentration,
            r: canonical.ritual
          },
          prepared: isCurrentlyPrep || isAlwaysPrep || canonical.level === 0,
          alwaysPrepared: isAlwaysPrep,
          description: canonical.description,
          effectSummary: canonical.effectSummary
        };
      }

      // Fallback genérico para conjuros no catalogados
      return {
        name,
        level: 1,
        school: 'Arcana',
        role: ROLE_LOOKUP[name] || 'utilidad',
        castingTime: '1 acción',
        range: '30 pies',
        components: { v: true, s: true, m: false, c: false, r: false },
        prepared: isCurrentlyPrep,
        alwaysPrepared: isAlwaysPrep,
        description: 'Conjuro adquirido de la campaña.'
      };
    });
  }, [knownSpells, preparedSpells, prepRules]);

  // 3. Filtrado de conjuros aprendidos
  const filteredSpells = useMemo(() => {
    return spellItems.filter(sp => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!sp.name.toLowerCase().includes(q) && !sp.school.toLowerCase().includes(q)) {
          return false;
        }
      }
      if (selectedLevel !== 'all') {
        const lvlNum = selectedLevel === '0' ? 0 : parseInt(selectedLevel, 10);
        if (sp.level !== lvlNum) return false;
      }
      if (selectedRole !== 'all' && sp.role !== selectedRole) {
        return false;
      }
      if (filterComponent !== 'all') {
        if (filterComponent === 'v' && !sp.components.v) return false;
        if (filterComponent === 's' && !sp.components.s) return false;
        if (filterComponent === 'm' && !sp.components.m) return false;
        if (filterComponent === 'c' && !sp.components.c) return false;
        if (filterComponent === 'r' && !sp.components.r) return false;
      }
      return true;
    });
  }, [spellItems, searchQuery, selectedLevel, selectedRole, filterComponent]);

  // 4. Agrupar por nivel
  const spellsByLevel = useMemo(() => {
    return filteredSpells.reduce((acc, sp) => {
      const key = sp.level === 0 ? 'Trucos (Cantrips)' : `Conjuros de Nivel ${sp.level}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(sp);
      return acc;
    }, {} as Record<string, SpellDisplayItem[]>);
  }, [filteredSpells]);

  // 5. Clases lanzadoras del personaje para el catálogo
  const castingClasses = useMemo(() => {
    const list: string[] = [];
    if (character.multiclass && character.multiclass.length > 0) {
      for (const mc of character.multiclass) {
        list.push(mc.class);
      }
    } else if (character.character_class) {
      list.push(character.character_class);
    }
    return list;
  }, [character]);

  // 6. Catálogo de conjuros disponibles para aprender/transcribir
  const catalogSpells = useMemo(() => {
    const spellMap = new Map<string, CanonicalSpellData>();
    for (const cls of castingClasses) {
      const clsSpells = getSpellsForClass(cls);
      for (const sp of clsSpells) {
        spellMap.set(sp.slug, sp);
      }
    }
    // Si no tiene clases lanzadoras estándar, mostrar catálogo general
    const list = spellMap.size > 0 ? Array.from(spellMap.values()) : CANONICAL_SPELLS_CATALOG;

    return list.filter(sp => {
      if (catalogSearch.trim()) {
        const q = catalogSearch.toLowerCase();
        if (!sp.name.toLowerCase().includes(q) && !sp.school.toLowerCase().includes(q)) {
          return false;
        }
      }
      if (catalogLevel !== 'all') {
        const lvl = parseInt(catalogLevel, 10);
        if (sp.level !== lvl) return false;
      }
      if (catalogSchool !== 'all') {
        if (sp.school.toLowerCase() !== catalogSchool.toLowerCase()) return false;
      }
      return true;
    }).sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));
  }, [castingClasses, catalogSearch, catalogLevel, catalogSchool]);

  // 7. Lista de clases para sub-pestañas dinámicas
  const multiclassEntries = useMemo(() => {
    if (character.multiclass && character.multiclass.length > 0) {
      return character.multiclass;
    }
    return [
      {
        class: character.character_class || 'Aventurero',
        level: character.level || 1,
        subclass: undefined
      }
    ];
  }, [character]);

  // Helper para renderizar espacios de conjuro por nivel
  const renderSlotTracker = (levelNum: number) => {
    if (levelNum === 0) return null;
    const levelKey = String(levelNum);
    const slotPool = character.spell_slots?.[levelKey];
    if (!slotPool || slotPool.total === 0) return null;

    const total = slotPool.total;
    const used = slotPool.used || 0;
    const available = Math.max(0, total - used);

    return (
      <div className="flex items-center gap-2 bg-dnd-parchment-contrast px-2.5 py-1 rounded-sm border border-dnd-border-antique shadow-xs">
        <span className="text-[10px] font-dnd-title font-bold text-dnd-crimson uppercase tracking-wider">
          Espacios:
        </span>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: total }).map((_, idx) => {
            const isSlotAvailable = idx < available;
            return (
              <button
                key={idx}
                type="button"
                disabled={readOnly || !onUpdateSpellSlot}
                onClick={() => {
                  if (readOnly || !onUpdateSpellSlot) return;
                  const newUsed = isSlotAvailable ? used + 1 : Math.max(0, used - 1);
                  onUpdateSpellSlot(levelKey, newUsed);
                }}
                title={
                  isSlotAvailable
                    ? `Espacio ${idx + 1} disponible (clic para consumir)`
                    : `Espacio ${idx + 1} consumido (clic para recuperar)`
                }
                className={`w-3.5 h-3.5 rounded-full border transition flex items-center justify-center text-[9px] font-bold ${
                  isSlotAvailable
                    ? 'bg-emerald-700 border-emerald-500 text-dnd-parchment shadow-xs hover:scale-110 cursor-pointer'
                    : 'bg-dnd-parchment-contrast border-dnd-border-antique text-dnd-ink-subtle opacity-60 hover:opacity-100 cursor-pointer'
                }`}
              >
                {isSlotAvailable ? '●' : '○'}
              </button>
            );
          })}
        </div>
        <span className="text-[10px] font-dnd-body font-bold text-dnd-ink-muted">
          ({available}/{total})
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* ============================================================== */}
      {/* 1. Barra de Navegación de Sub-Pestañas Superiores               */}
      {/* ============================================================== */}
      <div className="flex items-center justify-between border-b border-dnd-border-antique/80 pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Sub-Pestaña 1: Grimorio y Conjuros Adquiridos */}
          <button
            type="button"
            onClick={() => setActiveSubTab('learned')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-sm text-xs font-dnd-title font-bold transition border ${
              activeSubTab === 'learned'
                ? 'bg-dnd-parchment border-dnd-crimson text-dnd-crimson shadow-sm'
                : 'bg-dnd-parchment-contrast border-dnd-border-antique text-dnd-ink-muted hover:text-dnd-ink'
            }`}
          >
            <BookOpen className="w-4 h-4 text-dnd-gold" />
            Grimorio y Conjuros Adquiridos ({knownSpells.length})
          </button>

          {/* Sub-Pestaña 2: Catálogo de Conjuros por Aprender */}
          <button
            type="button"
            onClick={() => setActiveSubTab('catalog')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-sm text-xs font-dnd-title font-bold transition border ${
              activeSubTab === 'catalog'
                ? 'bg-dnd-parchment border-dnd-crimson text-dnd-crimson shadow-sm'
                : 'bg-dnd-parchment-contrast border-dnd-border-antique text-dnd-ink-muted hover:text-dnd-ink'
            }`}
          >
            <Sparkles className="w-4 h-4 text-dnd-gold" />
            Conjuros por Aprender (Catálogo de Clase)
          </button>

          {/* Sub-Pestañas Dinámicas por Clase de Multiclase */}
          {multiclassEntries.map(mc => {
            const tabKey = `class_${mc.class.toLowerCase()}`;
            const isActive = activeSubTab === tabKey;
            return (
              <button
                key={tabKey}
                type="button"
                onClick={() => setActiveSubTab(tabKey)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-sm text-xs font-dnd-title font-bold transition border ${
                  isActive
                    ? 'bg-dnd-parchment border-dnd-crimson text-dnd-crimson shadow-sm'
                    : 'bg-dnd-parchment-contrast border-dnd-border-antique text-dnd-ink-muted hover:text-dnd-ink'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-dnd-terracotta" />
                Clase: {mc.class} {mc.subclass ? `(${mc.subclass})` : ''} Nv.{mc.level}
              </button>
            );
          })}

          {/* Sub-Pestaña 4: Árbol de Aprendizaje y Progresión */}
          <button
            type="button"
            onClick={() => setActiveSubTab('progression')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-sm text-xs font-dnd-title font-bold transition border ${
              activeSubTab === 'progression'
                ? 'bg-dnd-parchment border-dnd-crimson text-dnd-crimson shadow-sm'
                : 'bg-dnd-parchment-contrast border-dnd-border-antique text-dnd-ink-muted hover:text-dnd-ink'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-dnd-terracotta" />
            Árbol de Aprendizaje & Progresión
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* VISTA 1: Grimorio y Conjuros Adquiridos (Con Preparación)     */}
      {/* ============================================================== */}
      {activeSubTab === 'learned' && (
        <div className="space-y-6">
          {/* Panel Editorial de Reglas de Preparación y Límite Canónico */}
          {prepRules.isPreparedCaster && (
            <div className="p-4 rounded-sm bg-dnd-parchment text-dnd-ink border-2 border-dnd-border-antique dnd-notched space-y-3 shadow-md">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-dnd-border-antique/80 pb-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Scroll className="w-4 h-4 text-dnd-gold" />
                    <h3 className="font-dnd-title font-bold text-sm text-dnd-crimson uppercase tracking-wide">
                      {prepRules.primaryPreparationMode === 'prepared'
                        ? 'Estudio Diario del Grimorio / Preparación de Conjuros'
                        : prepRules.primaryPreparationMode === 'hybrid'
                        ? 'Preparación Multiclase Híbrida'
                        : 'Conjuros Conocidos'}
                    </h3>
                  </div>
                  <p className="text-xs text-dnd-ink-muted font-dnd-body">
                    Fórmula oficial: <strong className="text-dnd-ink font-semibold">{prepRules.formulaDescription}</strong>
                  </p>
                </div>

                {/* Contador de Preparación Canónico */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] text-dnd-ink-muted uppercase font-dnd-title block">
                      Conjuros Preparados
                    </span>
                    <span className="text-base font-dnd-title font-bold text-dnd-crimson">
                      {prepRules.currentPreparedCount}{' '}
                      <span className="text-xs text-dnd-ink-muted font-normal">/ {prepRules.maxPreparedSpells} máx</span>
                    </span>
                  </div>

                  <div className="w-24 bg-dnd-parchment-contrast h-3 rounded-full border border-dnd-border-antique overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full transition-all ${
                        prepRules.currentPreparedCount >= prepRules.maxPreparedSpells
                          ? 'bg-amber-600'
                          : 'bg-emerald-600'
                      }`}
                      style={{
                        width: `${Math.min(
                          100,
                          (prepRules.currentPreparedCount / Math.max(1, prepRules.maxPreparedSpells)) * 100
                        )}%`
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Notas de Manual y Rituales */}
              <div className="text-[11px] text-dnd-ink-muted font-dnd-body space-y-1">
                {prepRules.canCastRitualsUnprepared && (
                  <p className="flex items-center gap-1.5 text-dnd-gold font-medium">
                    <span>✦</span>
                    <strong>Lanzamiento de Rituales:</strong> Puedes lanzar cualquier conjuro con el sello{' '}
                    <span className="px-1 py-0.2 rounded-sm bg-dnd-parchment-contrast text-dnd-crimson border border-dnd-crimson/50 font-mono font-bold text-[9px]">
                      R
                    </span>{' '}
                    directamente desde tu grimorio sin necesidad de tenerlo preparado (sumando 10 min al tiempo de lanzamiento).
                  </p>
                )}
                {prepRules.alwaysPreparedSpells.length > 0 && (
                  <p className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-400 font-medium">
                    <span>✦</span>
                    <strong>Conjuros de Subclase Siempre Preparados:</strong> Los conjuros otorgados por tu subclase (
                    {prepRules.alwaysPreparedSpells.join(', ')}) no consumen tu cupo diario de {prepRules.maxPreparedSpells} conjuros.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Barra de Búsqueda y Filtros */}
          <div className="p-4 rounded-sm bg-dnd-parchment text-dnd-ink border-2 border-dnd-border-antique dnd-notched space-y-3 shadow-md">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Búsqueda por Texto */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-dnd-ink-subtle" />
                <input
                  type="text"
                  placeholder="Buscar en el grimorio (nombre, escuela)..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-sm bg-dnd-parchment-contrast border border-dnd-border-antique text-xs text-dnd-ink placeholder:text-dnd-ink-subtle font-dnd-body focus:outline-none focus:border-dnd-gold"
                />
              </div>

              {/* Filtro por Nivel de Conjuro */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {['all', '0', '1', '2', '3', '4'].map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSelectedLevel(lvl)}
                    className={`px-2.5 py-1 rounded-md text-xs font-dnd-title font-bold border transition ${
                      selectedLevel === lvl
                        ? 'bg-dnd-crimson border-dnd-gold text-white shadow-xs'
                        : 'bg-dnd-parchment-contrast border-dnd-border-antique text-dnd-ink-muted hover:text-dnd-ink'
                    }`}
                  >
                    {lvl === 'all' ? 'Todos' : lvl === '0' ? 'Trucos' : `Nv ${lvl}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Filtros Secundarios: Rol y Sellos de Componente */}
            <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-dnd-border-antique/80 text-xs">
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-[11px] text-dnd-ink-muted font-dnd-title mr-1 uppercase">Rol:</span>
                {[
                  { id: 'all', label: 'Todos' },
                  { id: 'daño', label: 'Daño' },
                  { id: 'soporte', label: 'Soporte' },
                  { id: 'control', label: 'Control' },
                  { id: 'utilidad', label: 'Utilidad' }
                ].map(r => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedRole(r.id)}
                    className={`px-2 py-0.5 rounded-sm text-[11px] font-dnd-body border capitalize ${
                      selectedRole === r.id
                        ? 'bg-dnd-gold border-dnd-gold-light text-dnd-leather-dark font-bold'
                        : 'bg-dnd-parchment-contrast border-dnd-border-antique text-dnd-ink-muted hover:text-dnd-ink'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-[11px] text-dnd-ink-muted font-dnd-title mr-1 uppercase">Sellos:</span>
                {[
                  { id: 'all', label: 'Todos' },
                  { id: 'v', label: 'V' },
                  { id: 's', label: 'S' },
                  { id: 'm', label: 'M' },
                  { id: 'c', label: 'C (Conc.)' },
                  { id: 'r', label: 'R (Ritual)' }
                ].map(cmp => (
                  <button
                    key={cmp.id}
                    type="button"
                    onClick={() => setFilterComponent(cmp.id)}
                    className={`px-2 py-0.5 rounded-sm text-[11px] font-mono border ${
                      filterComponent === cmp.id
                        ? 'bg-dnd-terracotta border-dnd-terracotta text-dnd-parchment font-bold'
                        : 'bg-dnd-parchment-contrast border-dnd-border-antique text-dnd-ink-muted hover:text-dnd-ink'
                    }`}
                  >
                    {cmp.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tarjetas de Conjuros Agrupados por Nivel */}
          {Object.keys(spellsByLevel).length > 0 ? (
            Object.entries(spellsByLevel).map(([groupTitle, spells]) => {
              const sampleLevel = spells[0]?.level ?? 0;

              return (
                <div key={groupTitle} className="space-y-4">
                  {/* Encabezado con Contador de Slots */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-dnd-gold" />
                        <h4 className="font-dnd-title font-bold text-sm uppercase tracking-wider text-dnd-crimson">
                          {groupTitle}
                        </h4>
                        <span className="text-[11px] text-dnd-ink-muted font-dnd-body font-semibold">
                          ({spells.length} {spells.length === 1 ? 'conjuro' : 'conjuros'})
                        </span>
                      </div>

                      {renderSlotTracker(sampleLevel)}
                    </div>
                    <TaperedRule variant="crimson" />
                  </div>

                  {/* Grid de Conjuros */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {spells.map(spell => {
                      const isCantrip = spell.level === 0;
                      const isAlwaysPrepared = spell.alwaysPrepared;
                      const isPrepared = spell.prepared;
                      const canToggle = !readOnly && !isCantrip && !isAlwaysPrepared && !!onTogglePreparedSpell;
                      const cannotPrepareMore = !isPrepared && !prepRules.canPrepareMore;

                      return (
                        <div
                          key={spell.name}
                          className={`p-4 rounded-sm bg-dnd-parchment text-dnd-ink border-2 dnd-notched-sm flex flex-col justify-between space-y-3 shadow-sm transition ${
                            isPrepared
                              ? 'border-dnd-gold/80 bg-amber-500/5'
                              : 'border-dnd-border-antique opacity-85 hover:opacity-100 hover:border-dnd-gold'
                          }`}
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2 border-b border-dnd-border-antique/80 pb-2">
                              <div>
                                <span className="font-dnd-title font-bold text-sm text-dnd-crimson block">
                                  {spell.name}
                                </span>
                                <span className="text-[11px] text-dnd-gold font-dnd-body italic block">
                                  {spell.school} &bull; <span className="capitalize">{spell.role}</span> &bull; {spell.range}
                                </span>
                              </div>

                              {/* Sellos de Componentes */}
                              <div className="flex items-center gap-1">
                                {spell.components.v && (
                                  <span
                                    className="px-1.5 py-0.5 rounded-sm bg-dnd-parchment-contrast border border-dnd-border-antique text-dnd-ink-muted text-[10px] font-mono font-bold"
                                    title="Componente Verbal"
                                  >
                                    V
                                  </span>
                                )}
                                {spell.components.s && (
                                  <span
                                    className="px-1.5 py-0.5 rounded-sm bg-dnd-parchment-contrast border border-dnd-border-antique text-dnd-ink-muted text-[10px] font-mono font-bold"
                                    title="Componente Somático"
                                  >
                                    S
                                  </span>
                                )}
                                {spell.components.m && (
                                  <span
                                    className="px-1.5 py-0.5 rounded-sm bg-dnd-parchment-contrast border border-dnd-border-antique text-dnd-ink-muted text-[10px] font-mono font-bold"
                                    title="Componente Material"
                                  >
                                    M
                                  </span>
                                )}
                                {spell.components.c && (
                                  <span
                                    className="w-5 h-5 rounded-full bg-dnd-gold-surface text-dnd-gold border border-dnd-gold text-[10px] font-mono font-black flex items-center justify-center shadow-xs"
                                    title="Requiere Concentración (C)"
                                  >
                                    C
                                  </span>
                                )}
                                {spell.components.r && (
                                  <span
                                    className="w-5 h-5 rounded-full bg-dnd-parchment-contrast text-dnd-crimson border border-dnd-crimson/50 text-[10px] font-mono font-black flex items-center justify-center shadow-xs"
                                    title="Puede lanzarse como Ritual (R)"
                                  >
                                    R
                                  </span>
                                )}
                              </div>
                            </div>

                            <p className="text-xs text-dnd-ink font-dnd-body mt-2 leading-relaxed">
                              {spell.description}
                            </p>
                          </div>

                          {/* Pie de Tarjeta con Selector Interactivo de Preparación */}
                          <div className="flex items-center justify-between pt-2 border-t border-dnd-border-antique/80 text-[11px] gap-2">
                            <span className="text-dnd-ink-muted font-dnd-title uppercase tracking-wider text-[10px]">
                              {isCantrip ? 'Truco a Voluntad' : `Espacio Nv. ${spell.level}`}
                            </span>

                            {isCantrip ? (
                              <DndBadge variant="parchment" size="sm">
                                Truco a Voluntad
                              </DndBadge>
                            ) : isAlwaysPrepared ? (
                              <DndBadge
                                variant="gold"
                                size="sm"
                                icon={<CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                              >
                                Siempre Preparado (Subclase)
                              </DndBadge>
                            ) : canToggle ? (
                              <button
                                type="button"
                                onClick={() => onTogglePreparedSpell(spell.name)}
                                disabled={cannotPrepareMore}
                                title={
                                  cannotPrepareMore
                                    ? `Límite alcanzado (${prepRules.currentPreparedCount}/${prepRules.maxPreparedSpells}). Desprepara otro conjuro primero.`
                                    : isPrepared
                                    ? 'Clic para desmarcar de la lista preparada diaria'
                                    : 'Clic para preparar para el día'
                                }
                                className={`px-2.5 py-1 rounded-sm text-xs font-dnd-title font-bold border transition flex items-center gap-1.5 shadow-xs ${
                                  isPrepared
                                    ? 'bg-emerald-800 text-white border-emerald-600 hover:bg-emerald-700 cursor-pointer'
                                    : cannotPrepareMore
                                    ? 'bg-dnd-parchment-contrast border-dnd-border-antique text-dnd-ink-subtle opacity-50 cursor-not-allowed'
                                    : 'bg-dnd-parchment-contrast border-dnd-border-antique text-dnd-ink-muted hover:text-dnd-crimson hover:border-dnd-crimson cursor-pointer'
                                }`}
                              >
                                {isPrepared ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                                    <span>Preparado ✓</span>
                                  </>
                                ) : (
                                  <>
                                    <Zap className="w-3 h-3 text-dnd-gold" />
                                    <span>+ Preparar</span>
                                  </>
                                )}
                              </button>
                            ) : (
                              <DndBadge variant={isPrepared ? 'gold' : 'parchment'} size="sm">
                                {isPrepared ? 'Preparado' : 'Conocido'}
                              </DndBadge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 rounded-sm bg-dnd-parchment border-2 border-dnd-border-antique dnd-notched text-center text-xs text-dnd-ink-muted font-dnd-body">
              No se encontraron conjuros en el grimorio que coincidan con los filtros seleccionados.
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* VISTA 2: Catálogo de Conjuros por Aprender / Transcribir        */}
      {/* ============================================================== */}
      {activeSubTab === 'catalog' && (
        <div className="space-y-6">
          {/* Panel Informativo de Reglas de Transcripción */}
          <div className="p-4 rounded-sm bg-dnd-parchment text-dnd-ink border-2 border-dnd-border-antique dnd-notched space-y-2 shadow-md">
            <div className="flex items-center gap-2">
              <Scroll className="w-4 h-4 text-dnd-gold" />
              <h3 className="font-dnd-title font-bold text-sm text-dnd-crimson uppercase tracking-wide">
                Catálogo Canónico de Conjuros de Clase ({castingClasses.join(', ')})
              </h3>
            </div>
            <p className="text-xs text-dnd-ink font-dnd-body leading-relaxed">
              Consulta todos los conjuros oficiales disponibles para tu senda de clase. Si eres <strong>Mago</strong>, puedes copiar conjuros hallados en pergaminos o grimorios enemigos:{' '}
              <em>2 horas y 50 po por cada nivel de conjuro</em> (con la subclase <strong>Evocación</strong>, los conjuros de dicha escuela se reducen a <em>1 hora y 25 po por nivel</em>).
            </p>
          </div>

          {/* Filtros del Catálogo */}
          <div className="p-4 rounded-sm bg-dnd-parchment text-dnd-ink border-2 border-dnd-border-antique dnd-notched space-y-3 shadow-md">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-dnd-ink-subtle" />
                <input
                  type="text"
                  placeholder="Buscar en el catálogo de clase (nombre, escuela)..."
                  value={catalogSearch}
                  onChange={e => setCatalogSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-sm bg-dnd-parchment-contrast border border-dnd-border-antique text-xs text-dnd-ink placeholder:text-dnd-ink-subtle font-dnd-body focus:outline-none focus:border-dnd-gold"
                />
              </div>

              {/* Filtro de Nivel */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {['all', '0', '1', '2', '3', '4'].map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setCatalogLevel(lvl)}
                    className={`px-2.5 py-1 rounded-md text-xs font-dnd-title font-bold border transition ${
                      catalogLevel === lvl
                        ? 'bg-dnd-crimson border-dnd-gold text-white shadow-xs'
                        : 'bg-dnd-parchment-contrast border-dnd-border-antique text-dnd-ink-muted hover:text-dnd-ink'
                    }`}
                  >
                    {lvl === 'all' ? 'Todos' : lvl === '0' ? 'Trucos' : `Nv ${lvl}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Filtro por Escuela de Magia */}
            <div className="flex items-center gap-1 flex-wrap pt-2 border-t border-dnd-border-antique/80 text-xs">
              <span className="text-[11px] text-dnd-ink-muted font-dnd-title mr-1 uppercase">Escuela:</span>
              {[
                'all',
                'Evocación',
                'Abjuración',
                'Nigromancia',
                'Conjuración',
                'Transmutación',
                'Adivinación',
                'Encantamiento',
                'Ilusión'
              ].map(sch => (
                <button
                  key={sch}
                  type="button"
                  onClick={() => setCatalogSchool(sch)}
                  className={`px-2 py-0.5 rounded-sm text-[11px] font-dnd-body border capitalize ${
                    catalogSchool === sch
                      ? 'bg-dnd-gold border-dnd-gold-light text-dnd-leather-dark font-bold'
                      : 'bg-dnd-parchment-contrast border-dnd-border-antique text-dnd-ink-muted hover:text-dnd-ink'
                  }`}
                >
                  {sch === 'all' ? 'Todas' : sch}
                </button>
              ))}
            </div>
          </div>

          {/* Grid de Conjuros del Catálogo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {catalogSpells.map(spell => {
              const alreadyKnown = knownSpells.some(
                s => s.toLowerCase() === spell.name.toLowerCase() || s.toLowerCase() === spell.slug
              );
              const maxSlotAccessible = Math.max(
                0,
                ...Object.keys(character.spell_slots || {}).map(k => parseInt(k, 10))
              );
              const canCastLevel = spell.level === 0 || spell.level <= maxSlotAccessible;
              const isEvocationWizard =
                isEvocationSavant(character) &&
                (spell.school.toLowerCase() === 'evocación' || spell.school.toLowerCase() === 'evocation');

              return (
                <div
                  key={spell.slug}
                  className={`p-4 rounded-sm bg-dnd-parchment text-dnd-ink border-2 dnd-notched-sm flex flex-col justify-between space-y-3 shadow-sm transition ${
                    alreadyKnown
                      ? 'border-emerald-600/60 bg-emerald-500/5'
                      : 'border-dnd-border-antique hover:border-dnd-gold'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 border-b border-dnd-border-antique/80 pb-2">
                      <div>
                        <span className="font-dnd-title font-bold text-sm text-dnd-crimson block">
                          {spell.name}
                        </span>
                        <span className="text-[11px] text-dnd-gold font-dnd-body italic block">
                          {spell.school} &bull; {spell.level === 0 ? 'Truco' : `Nivel ${spell.level}`} &bull;{' '}
                          {spell.castingTime} &bull; {spell.range}
                        </span>
                      </div>

                      {/* Sellos */}
                      <div className="flex items-center gap-1">
                        {spell.components.verbal && (
                          <span className="px-1.5 py-0.5 rounded-sm bg-dnd-parchment-contrast border border-dnd-border-antique text-dnd-ink-muted text-[10px] font-mono font-bold">
                            V
                          </span>
                        )}
                        {spell.components.somatic && (
                          <span className="px-1.5 py-0.5 rounded-sm bg-dnd-parchment-contrast border border-dnd-border-antique text-dnd-ink-muted text-[10px] font-mono font-bold">
                            S
                          </span>
                        )}
                        {spell.components.material && (
                          <span className="px-1.5 py-0.5 rounded-sm bg-dnd-parchment-contrast border border-dnd-border-antique text-dnd-ink-muted text-[10px] font-mono font-bold">
                            M
                          </span>
                        )}
                        {spell.concentration && (
                          <span
                            className="w-5 h-5 rounded-full bg-dnd-gold-surface text-dnd-gold border border-dnd-gold text-[10px] font-mono font-black flex items-center justify-center shadow-xs"
                            title="Requiere Concentración"
                          >
                            C
                          </span>
                        )}
                        {spell.ritual && (
                          <span
                            className="w-5 h-5 rounded-full bg-dnd-parchment-contrast text-dnd-crimson border border-dnd-crimson/50 text-[10px] font-mono font-black flex items-center justify-center shadow-xs"
                            title="Ritual"
                          >
                            R
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-dnd-ink font-dnd-body mt-2 leading-relaxed">
                      {spell.description}
                    </p>

                    {spell.effectSummary && (
                      <p className="text-[11px] text-dnd-ink-muted font-dnd-body italic mt-1">
                        Efecto: {spell.effectSummary}
                      </p>
                    )}
                  </div>

                  {/* Estado de Adquisición */}
                  <div className="flex items-center justify-between pt-2 border-t border-dnd-border-antique/80 text-[11px] flex-wrap gap-2">
                    <div className="text-[10px] text-dnd-ink-muted font-dnd-title uppercase tracking-wider">
                      {alreadyKnown ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> En tu Grimorio / Lista
                        </span>
                      ) : canCastLevel ? (
                        <span className="text-dnd-gold font-bold">
                          Disponible para Transcribir / Aprender
                        </span>
                      ) : (
                        <span className="text-dnd-crimson flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Requiere Nivel Superior
                        </span>
                      )}
                    </div>

                    {!alreadyKnown && spell.level > 0 && canCastLevel && (
                      <span className="text-[10px] font-mono bg-dnd-parchment-contrast px-2 py-0.5 rounded-sm border border-dnd-border-antique text-dnd-ink-muted">
                        Copiar:{' '}
                        {isEvocationWizard
                          ? `${spell.level}h / ${spell.level * 25} po (-50%)`
                          : `${spell.level * 2}h / ${spell.level * 50} po`}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VISTAS 3+: Pestañas Dinámicas por Clase (Rasgos Niveles 1-20) */}
      {/* ============================================================== */}
      {multiclassEntries.map(mc => {
        const tabKey = `class_${mc.class.toLowerCase()}`;
        if (activeSubTab !== tabKey) return null;

        const features = getClassFeatures(mc.class);

        return (
          <div key={tabKey} className="space-y-6">
            {/* Encabezado Editorial de la Clase */}
            <div className="p-5 rounded-sm bg-dnd-parchment text-dnd-ink border-2 border-dnd-border-antique dnd-notched space-y-3 shadow-md">
              <div className="flex items-start justify-between gap-3 border-b border-dnd-border-antique/80 pb-3 flex-wrap">
                <div>
                  <h3 className="font-dnd-title font-bold text-base text-dnd-crimson uppercase tracking-wide flex items-center gap-2">
                    <Shield className="w-4 h-4 text-dnd-gold" />
                    Progreso Canónico de Clase: {mc.class} {mc.subclass ? `(${mc.subclass})` : ''}
                  </h3>
                  <p className="text-xs text-dnd-ink-muted font-dnd-body mt-0.5">
                    Nivel alcanzado actualmente en esta clase:{' '}
                    <strong className="text-dnd-crimson font-dnd-title text-sm">{mc.level}</strong> de 20
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <DndBadge variant="gold" size="sm">
                    {features.filter(f => mc.level >= f.level).length} Rasgos Desbloqueados
                  </DndBadge>
                  <DndBadge variant="parchment" size="sm">
                    {features.filter(f => mc.level < f.level).length} Futuros
                  </DndBadge>
                </div>
              </div>

              {/* Recordatorios de Multiclase y Restricciones */}
              <div className="text-xs text-dnd-ink font-dnd-body leading-relaxed bg-dnd-parchment-contrast p-3 rounded-sm border border-dnd-border-antique space-y-1">
                <p>
                  <strong>Beneficio de Multiclase al 50%:</strong> Mientras el nivel de esta clase sea inferior a tu clase principal, subir cada nivel te cuesta únicamente el 50% de los puntos de experiencia normales.
                </p>
                {mc.class.toLowerCase().includes('monje') && (
                  <p className="text-amber-800 dark:text-amber-300 font-semibold">
                    ⚠️ <strong>Restricción Marcial de Monje:</strong> <em>Artes Marciales</em> (dado d6 y ataque desarmado como acción adicional), <em>Defensa sin Armadura</em> (10 + DES + SAB) y <em>Movimiento sin Armadura</em> (+10 pies) quedan deshabilitados si vistes armadura o empuñas escudo.
                  </p>
                )}
              </div>
            </div>

            {/* Listado Completo de Rasgos (Niveles 1 a 20) */}
            <div className="space-y-4">
              {features.map(feature => {
                const isUnlocked = mc.level >= feature.level;

                return (
                  <div
                    key={feature.id}
                    className={`p-4 rounded-sm bg-dnd-parchment text-dnd-ink border-2 dnd-notched-sm space-y-2 shadow-sm transition ${
                      isUnlocked
                        ? 'border-dnd-gold/80 bg-amber-500/5'
                        : 'border-dnd-border-antique opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 border-b border-dnd-border-antique/80 pb-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        {isUnlocked ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <Lock className="w-4 h-4 text-dnd-ink-subtle shrink-0" />
                        )}
                        <div>
                          <span className="font-dnd-title font-bold text-sm text-dnd-crimson block">
                            {feature.name}
                          </span>
                          <span className="text-[11px] text-dnd-gold font-dnd-body italic">
                            Nivel {feature.level} &bull; {feature.subclass ? `Subclase: ${feature.subclass}` : 'Rasgo de Clase Base'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {feature.resourceCost && (
                          <span className="px-2 py-0.5 rounded-sm bg-dnd-parchment-contrast border border-dnd-border-antique text-dnd-terracotta text-[10px] font-dnd-title font-bold">
                            {feature.resourceCost}
                          </span>
                        )}
                        <DndBadge variant={isUnlocked ? 'gold' : 'parchment'} size="sm">
                          {isUnlocked ? `Desbloqueado (Nv. ${feature.level})` : `Requiere Nv. ${feature.level}`}
                        </DndBadge>
                      </div>
                    </div>

                    {feature.gearRestrictions && (
                      <div className="flex items-center gap-1.5 text-[11px] text-amber-800 dark:text-amber-400 font-semibold">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>{feature.gearRestrictions}</span>
                      </div>
                    )}

                    <p className="text-xs text-dnd-ink font-dnd-body leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* ============================================================== */}
      {/* VISTA 4: Árbol de Aprendizaje y Progresión Futura (50% XP)      */}
      {/* ============================================================== */}
      {activeSubTab === 'progression' && (
        <div className="p-6 rounded-sm bg-dnd-parchment text-dnd-ink border-2 border-dnd-border-antique dnd-notched space-y-6 shadow-md">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-dnd-gold" />
              <h3 className="font-dnd-title font-bold text-base text-dnd-crimson uppercase tracking-wide">
                Progresión y Árbol de Aprendizaje Futuro
              </h3>
            </div>
            <p className="text-xs text-dnd-ink-muted font-dnd-body">
              Planificación táctica de mejoras de característica, dotes y rasgos para los siguientes niveles de campaña (Niveles 8, 9 y 10).
            </p>
            <TaperedRule variant="crimson" />
          </div>

          <div className="space-y-4">
            {/* Regla de Oro: Catch-up Multiclase al 50% */}
            <div className="p-4 rounded-sm bg-dnd-gold/10 border-2 border-dnd-gold/70 space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-dnd-gold" />
                <h4 className="font-dnd-title font-bold text-xs text-dnd-crimson uppercase tracking-wider">
                  Regla de Mesa Oficial: Alcance de Multiclase al 50% de PX
                </h4>
              </div>
              <p className="text-xs text-dnd-ink font-dnd-body leading-relaxed">
                Para fomentar la versatilidad táctica y la narrativa de aprendizaje entre compañeros, mientras el nivel de tu clase secundaria sea estrictamente inferior al de tu clase primaria, el coste de puntos de experiencia para subir niveles en esa clase secundaria se <strong>reduce al 50%</strong> (ejemplo: Honiel subiendo Monje 2 a 3 cuesta 300 PX en lugar de 600 PX).
              </p>
            </div>

            {/* Hito Nivel 8 */}
            <div className="p-4 rounded-sm bg-dnd-parchment-contrast border border-dnd-border-antique space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-dnd-title font-bold text-xs text-dnd-crimson uppercase tracking-wider">
                  Nivel 8 (Hito Actual / Próximo)
                </span>
                <DndBadge variant="gold" size="sm">
                  Mejora de Característica o Dote
                </DndBadge>
              </div>
              <p className="text-xs text-dnd-ink font-dnd-body leading-relaxed">
                Aumento de Puntuación de Característica (+2 a un atributo o +1 a dos atributos) o elección de una dote general de D&D 5.5e (ej. <em>Combatiente con dos armas</em>, <em>Resiliente</em>, <em>Iniciativa Rápida</em>, <em>Alerta</em>).
              </p>
            </div>

            {/* Hito Nivel 9 */}
            <div className="p-4 rounded-sm bg-dnd-parchment-contrast border border-dnd-border-antique space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-dnd-title font-bold text-xs text-dnd-crimson uppercase tracking-wider">
                  Nivel 9
                </span>
                <DndBadge variant="parchment" size="sm">
                  Bonificador de Competencia +4
                </DndBadge>
              </div>
              <p className="text-xs text-dnd-ink font-dnd-body leading-relaxed">
                Tu bonificador por competencia asciende automáticamente a <strong className="text-dnd-crimson font-dnd-title">+4</strong>, incrementando todas tus tiradas de salvación competentes, habilidades, CD de conjuros y tiradas de ataque con armas.
              </p>
            </div>

            {/* Hito Nivel 10 */}
            <div className="p-4 rounded-sm bg-dnd-parchment-contrast border border-dnd-border-antique space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-dnd-title font-bold text-xs text-dnd-crimson uppercase tracking-wider">
                  Nivel 10
                </span>
                <DndBadge variant="crimson" size="sm">
                  Rasgos Avanzados de Subclase
                </DndBadge>
              </div>
              <p className="text-xs text-dnd-ink font-dnd-body leading-relaxed">
                {getClassMilestoneReward(character, 10)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
