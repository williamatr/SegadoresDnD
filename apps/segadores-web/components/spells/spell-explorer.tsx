'use client';

import React, { useState, useMemo } from 'react';
import type { SpellEntry } from '@segadores/obsidian-engine';
import {
  Search,
  Filter,
  Sparkles,
  BookOpen,
  Clock,
  Zap,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';

interface SpellExplorerProps {
  initialSpells: SpellEntry[];
  isFallback?: boolean;
  initialClass?: string;
}

const SCHOOLS = [
  'Todas',
  'Abjuración',
  'Adivinación',
  'Conjuración',
  'Encantamiento',
  'Evocación',
  'Ilusión',
  'Nigromancia',
  'Transmutación'
];

const CLASSES = [
  'Todas',
  'Bardo',
  'Brujo',
  'Clérigo',
  'Druida',
  'Explorador',
  'Guerrero',
  'Hechicero',
  'Mago',
  'Monje',
  'Paladín',
  'Pícaro'
];

const LEVELS = [
  { value: -1, label: 'Todos los niveles' },
  { value: 0, label: 'Trucos (Nivel 0)' },
  { value: 1, label: 'Nivel 1' },
  { value: 2, label: 'Nivel 2' },
  { value: 3, label: 'Nivel 3' },
  { value: 4, label: 'Nivel 4' },
  { value: 5, label: 'Nivel 5' },
  { value: 6, label: 'Nivel 6' },
  { value: 7, label: 'Nivel 7' },
  { value: 8, label: 'Nivel 8' },
  { value: 9, label: 'Nivel 9' }
];

function getLevelBadgeStyle(level: number): { bg: string; text: string; border: string } {
  if (level === 0) {
    return { bg: 'bg-dnd-parchment-contrast', text: 'text-dnd-ink-muted', border: 'border-dnd-border-antique' };
  }
  if (level <= 2) {
    return { bg: 'bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-600/40' };
  }
  if (level <= 4) {
    return { bg: 'bg-dnd-parchment-contrast', text: 'text-dnd-crimson', border: 'border-dnd-crimson/40' };
  }
  if (level <= 6) {
    return { bg: 'bg-dnd-crimson-surface', text: 'text-dnd-crimson', border: 'border-dnd-crimson' };
  }
  return { bg: 'bg-dnd-gold-surface', text: 'text-dnd-gold', border: 'border-dnd-gold' };
}

export function SpellExplorer({ initialSpells, isFallback, initialClass }: SpellExplorerProps) {
  const [search, setSearch] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<number>(-1);
  const [selectedSchool, setSelectedSchool] = useState<string>('Todas');
  const [selectedClass, setSelectedClass] = useState<string>(
    initialClass && CLASSES.some(c => c.toLowerCase() === initialClass.toLowerCase())
      ? CLASSES.find(c => c.toLowerCase() === initialClass.toLowerCase())!
      : 'Todas'
  );
  const [filterConcentration, setFilterConcentration] = useState(false);
  const [filterRitual, setFilterRitual] = useState(false);
  const [filterMaterial, setFilterMaterial] = useState(false);
  const [expandedSpell, setExpandedSpell] = useState<string | null>(null);

  // Filtrado reactivo en cliente
  const filteredSpells = useMemo(() => {
    return initialSpells.filter(spell => {
      // Búsqueda por texto (nombre, escuela, descripción)
      if (search.trim()) {
        const query = search.toLowerCase();
        const inName = spell.name.toLowerCase().includes(query);
        const inSchool = spell.school.toLowerCase().includes(query);
        const inDesc = spell.description.toLowerCase().includes(query);
        if (!inName && !inSchool && !inDesc) return false;
      }

      // Filtro por nivel
      if (selectedLevel !== -1 && spell.level !== selectedLevel) {
        return false;
      }

      // Filtro por escuela
      if (selectedSchool !== 'Todas' && !spell.school.toLowerCase().includes(selectedSchool.toLowerCase())) {
        return false;
      }

      // Filtro por clase
      if (selectedClass !== 'Todas') {
        const matchesClass = spell.classes.some(cls =>
          cls.toLowerCase().includes(selectedClass.toLowerCase())
        );
        if (!matchesClass) return false;
      }

      // Filtro de concentración
      if (filterConcentration && !spell.concentration) {
        return false;
      }

      // Filtro de ritual
      if (filterRitual && !spell.ritual) {
        return false;
      }

      // Filtro de componente material
      if (filterMaterial && !spell.components.material) {
        return false;
      }

      return true;
    });
  }, [
    initialSpells,
    search,
    selectedLevel,
    selectedSchool,
    selectedClass,
    filterConcentration,
    filterRitual,
    filterMaterial
  ]);

  const resetFilters = () => {
    setSearch('');
    setSelectedLevel(-1);
    setSelectedSchool('Todas');
    setSelectedClass('Todas');
    setFilterConcentration(false);
    setFilterRitual(false);
    setFilterMaterial(false);
  };

  const hasActiveFilters =
    search !== '' ||
    selectedLevel !== -1 ||
    selectedSchool !== 'Todas' ||
    selectedClass !== 'Todas' ||
    filterConcentration ||
    filterRitual ||
    filterMaterial;

  return (
    <div className="space-y-6">
      {/* Aviso de Fallback si no hay wiki privada conectada */}
      {isFallback && (
        <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/40 text-amber-200 text-xs flex items-center gap-2">
          <Info className="w-4 h-4 shrink-0 text-amber-400" />
          <span>
            Mostrando hechizos de demostración pública bajo licencia CC-BY-4.0 (SRD 5.2.1).
          </span>
        </div>
      )}

      {/* Barra de Filtros y Búsqueda */}
      <div className="p-5 rounded-sm bg-dnd-parchment border-2 border-dnd-border-antique dnd-notched space-y-4 shadow-md text-dnd-ink">
        {/* Input de Búsqueda */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-dnd-ink-subtle" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre, escuela o descripción (ej: Fuego, Curar, Acelerar)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-sm bg-dnd-parchment-contrast border border-dnd-border-antique text-dnd-ink placeholder:text-dnd-ink-subtle text-sm focus:outline-none focus:border-dnd-gold transition"
          />
        </div>

        {/* Selectores de Nivel, Escuela y Clase */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-dnd-crimson font-dnd-title font-bold text-xs uppercase tracking-wider mb-1">Nivel de Conjuro</label>
            <select
              value={selectedLevel}
              onChange={e => setSelectedLevel(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-sm bg-dnd-parchment-contrast border border-dnd-border-antique text-dnd-ink focus:outline-none focus:border-dnd-gold font-dnd-body"
            >
              {LEVELS.map(lvl => (
                <option key={lvl.value} value={lvl.value}>
                  {lvl.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-dnd-crimson font-dnd-title font-bold text-xs uppercase tracking-wider mb-1">Escuela de Magia</label>
            <select
              value={selectedSchool}
              onChange={e => setSelectedSchool(e.target.value)}
              className="w-full px-3 py-2 rounded-sm bg-dnd-parchment-contrast border border-dnd-border-antique text-dnd-ink focus:outline-none focus:border-dnd-gold font-dnd-body"
            >
              {SCHOOLS.map(sch => (
                <option key={sch} value={sch}>
                  {sch}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-dnd-crimson font-dnd-title font-bold text-xs uppercase tracking-wider mb-1">Clase de Conjurador</label>
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 rounded-sm bg-dnd-parchment-contrast border border-dnd-border-antique text-dnd-ink focus:outline-none focus:border-dnd-gold font-dnd-body"
            >
              {CLASSES.map(cls => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Toggles Rápidos */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-dnd-border-antique">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setFilterConcentration(!filterConcentration)}
              className={`px-3 py-1.5 rounded-sm text-xs font-dnd-title uppercase tracking-wider font-semibold border transition flex items-center gap-1.5 ${
                filterConcentration
                  ? 'bg-dnd-gold-surface border-dnd-gold text-dnd-gold shadow-xs'
                  : 'bg-dnd-parchment-contrast border-dnd-border-antique text-dnd-ink-muted hover:text-dnd-ink'
              }`}
            >
              <Zap className="w-3 h-3 text-dnd-gold" />
              Concentración
            </button>

            <button
              onClick={() => setFilterRitual(!filterRitual)}
              className={`px-3 py-1.5 rounded-sm text-xs font-dnd-title uppercase tracking-wider font-semibold border transition flex items-center gap-1.5 ${
                filterRitual
                  ? 'bg-dnd-parchment-contrast border-dnd-crimson text-dnd-crimson shadow-xs'
                  : 'bg-dnd-parchment-contrast border-dnd-border-antique text-dnd-ink-muted hover:text-dnd-ink'
              }`}
            >
              <BookOpen className="w-3 h-3 text-dnd-gold" />
              Ritual
            </button>

            <button
              onClick={() => setFilterMaterial(!filterMaterial)}
              className={`px-3 py-1.5 rounded-sm text-xs font-dnd-title uppercase tracking-wider font-semibold border transition flex items-center gap-1.5 ${
                filterMaterial
                  ? 'bg-dnd-crimson-surface border-dnd-crimson text-dnd-crimson shadow-xs'
                  : 'bg-dnd-parchment-contrast border-dnd-border-antique text-dnd-ink-muted hover:text-dnd-ink'
              }`}
            >
              <Sparkles className="w-3 h-3 text-dnd-terracotta" />
              Requiere Material (M)
            </button>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1 text-xs text-dnd-crimson hover:text-dnd-gold font-dnd-title font-bold uppercase tracking-wider transition"
            >
              <RotateCcw className="w-3 h-3" /> Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Contador de Resultados */}
      <div className="flex items-center justify-between text-xs text-dnd-ink-muted px-1 font-dnd-body">
        <span>
          Mostrando <strong className="text-dnd-crimson font-dnd-title font-bold">{filteredSpells.length}</strong> de{' '}
          <strong className="text-dnd-crimson font-dnd-title font-bold">{initialSpells.length}</strong> hechizos catalogados
        </span>
      </div>

      {/* Grid de Hechizos */}
      {filteredSpells.length === 0 ? (
        <div className="text-center py-16 bg-dnd-parchment border-2 border-dnd-border-antique rounded-sm dnd-notched p-8 space-y-3 shadow-md">
          <BookOpen className="w-10 h-10 text-dnd-ink-subtle mx-auto" />
          <h3 className="text-lg font-bold text-dnd-crimson font-dnd-title uppercase">No se encontraron hechizos</h3>
          <p className="text-xs text-dnd-ink-muted max-w-sm mx-auto font-dnd-body">
            Prueba a relajar los términos de búsqueda o limpiar los filtros seleccionados.
          </p>
          <button
            onClick={resetFilters}
            className="mt-2 px-4 py-2 rounded-sm bg-dnd-parchment-contrast border border-dnd-border-antique text-dnd-crimson font-dnd-title font-bold uppercase tracking-wider text-xs hover:bg-dnd-parchment transition shadow-xs"
          >
            Restablecer todos los filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSpells.map(spell => {
            const isExpanded = expandedSpell === spell.slug;
            const badge = getLevelBadgeStyle(spell.level);

            return (
              <div
                key={spell.slug}
                className="p-5 rounded-sm bg-dnd-parchment text-dnd-ink border-2 border-dnd-border-antique dnd-notched hover:border-dnd-gold transition flex flex-col justify-between shadow-md space-y-4"
              >
                {/* Header de la Tarjeta */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-base font-bold text-dnd-crimson font-dnd-title leading-snug">
                      {spell.name}
                    </h3>
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-sm border shrink-0 font-dnd-title ${badge.bg} ${badge.text} ${badge.border}`}
                    >
                      {spell.levelLabel}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-dnd-ink-muted font-dnd-body">
                    <span className="text-dnd-gold font-dnd-title font-bold">{spell.school}</span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-dnd-ink-subtle" />
                      {spell.castingTime}
                    </span>
                    <span>&bull;</span>
                    <span>{spell.range}</span>
                  </div>
                </div>

                {/* Etiquetas de Propiedades y Componentes */}
                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                  {/* Componentes V, S, M */}
                  <span className="px-2 py-0.5 rounded-sm bg-dnd-parchment-contrast border border-dnd-border-antique text-dnd-ink font-mono">
                    {[
                      spell.components.verbal && 'V',
                      spell.components.somatic && 'S',
                      spell.components.material && 'M'
                    ]
                      .filter(Boolean)
                      .join(', ') || 'Ninguno'}
                  </span>

                  {spell.concentration && (
                    <span className="px-2 py-0.5 rounded-sm bg-dnd-gold-surface border border-dnd-gold text-dnd-gold flex items-center gap-1 font-dnd-title font-bold text-[10px] uppercase">
                      <Zap className="w-2.5 h-2.5" /> Concentración
                    </span>
                  )}

                  {spell.ritual && (
                    <span className="px-2 py-0.5 rounded-sm bg-dnd-parchment-contrast border border-dnd-border-antique text-dnd-crimson flex items-center gap-1 font-dnd-title font-bold text-[10px] uppercase">
                      <BookOpen className="w-2.5 h-2.5" /> Ritual
                    </span>
                  )}
                </div>

                {/* Descripción Corta / Expandida */}
                <div className="text-xs text-dnd-ink leading-relaxed font-dnd-body">
                  {isExpanded ? (
                    <div className="space-y-3 mt-2 pt-2 border-t border-dnd-border-antique/80">
                      <p className="whitespace-pre-wrap">{spell.description}</p>

                      {spell.components.materialDescription && (
                        <div className="p-2.5 rounded-sm bg-dnd-parchment-contrast border border-dnd-border-antique text-dnd-ink-muted text-[11px]">
                          <strong className="text-dnd-ink font-dnd-title">Componente Material:</strong>{' '}
                          {spell.components.materialDescription}
                        </div>
                      )}

                      {spell.higherLevels && (
                        <div className="p-2.5 rounded-sm bg-dnd-gold-surface/30 border border-dnd-gold/40 text-dnd-ink text-[11px]">
                          <strong className="text-dnd-gold font-dnd-title">A niveles superiores:</strong>{' '}
                          {spell.higherLevels}
                        </div>
                      )}

                      {spell.classes.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 pt-1 text-[11px] text-dnd-ink-muted">
                          <span className="text-dnd-ink-subtle font-dnd-title">Clases:</span>
                          {spell.classes.map(cls => (
                            <span
                              key={cls}
                              className="px-1.5 py-0.5 rounded-sm bg-dnd-parchment-contrast text-dnd-ink border border-dnd-border-antique font-dnd-title text-[10px]"
                            >
                              {cls}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="line-clamp-2 text-dnd-ink-muted">{spell.description}</p>
                  )}
                </div>

                {/* Botón Ver Más */}
                <div className="pt-2 border-t border-dnd-border-antique flex items-center justify-between text-xs">
                  <span className="text-dnd-ink-subtle text-[11px] font-dnd-body">{spell.duration}</span>

                  <button
                    onClick={() => setExpandedSpell(isExpanded ? null : spell.slug)}
                    className="inline-flex items-center gap-1 text-dnd-crimson hover:text-dnd-gold font-dnd-title font-bold text-xs uppercase tracking-wider transition"
                  >
                    {isExpanded ? (
                      <>
                        Menos detalles <ChevronUp className="w-3.5 h-3.5" />
                      </>
                    ) : (
                      <>
                        Ver detalles <ChevronDown className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
