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
    return { bg: 'bg-slate-800/80', text: 'text-slate-300', border: 'border-slate-700' };
  }
  if (level <= 2) {
    return { bg: 'bg-emerald-950/60', text: 'text-emerald-300', border: 'border-emerald-700/50' };
  }
  if (level <= 4) {
    return { bg: 'bg-sky-950/60', text: 'text-sky-300', border: 'border-sky-700/50' };
  }
  if (level <= 6) {
    return { bg: 'bg-indigo-950/60', text: 'text-indigo-300', border: 'border-indigo-700/50' };
  }
  return { bg: 'bg-amber-950/60', text: 'text-dnd-gold-light', border: 'border-dnd-gold/50' };
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
      <div className="p-5 rounded-2xl bg-dnd-card border border-dnd-border space-y-4 shadow-lg">
        {/* Input de Búsqueda */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre, escuela o descripción (ej: Fuego, Curar, Acelerar)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-dnd-surface border border-dnd-border text-slate-100 placeholder:text-slate-500 text-sm focus:outline-none focus:border-dnd-gold/60 transition"
          />
        </div>

        {/* Selectores de Nivel, Escuela y Clase */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-slate-400 font-medium mb-1">Nivel de Conjuro</label>
            <select
              value={selectedLevel}
              onChange={e => setSelectedLevel(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg bg-dnd-surface border border-dnd-border text-slate-200 focus:outline-none focus:border-dnd-gold/60"
            >
              {LEVELS.map(lvl => (
                <option key={lvl.value} value={lvl.value}>
                  {lvl.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Escuela de Magia</label>
            <select
              value={selectedSchool}
              onChange={e => setSelectedSchool(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-dnd-surface border border-dnd-border text-slate-200 focus:outline-none focus:border-dnd-gold/60"
            >
              {SCHOOLS.map(sch => (
                <option key={sch} value={sch}>
                  {sch}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Clase de Conjurador</label>
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-dnd-surface border border-dnd-border text-slate-200 focus:outline-none focus:border-dnd-gold/60"
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
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-dnd-border/60">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setFilterConcentration(!filterConcentration)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition flex items-center gap-1.5 ${
                filterConcentration
                  ? 'bg-amber-950/60 border-amber-600 text-amber-300'
                  : 'bg-dnd-surface border-dnd-border text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3 h-3 text-amber-400" />
              Concentración
            </button>

            <button
              onClick={() => setFilterRitual(!filterRitual)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition flex items-center gap-1.5 ${
                filterRitual
                  ? 'bg-sky-950/60 border-sky-600 text-sky-300'
                  : 'bg-dnd-surface border-dnd-border text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3 h-3 text-sky-400" />
              Ritual
            </button>

            <button
              onClick={() => setFilterMaterial(!filterMaterial)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition flex items-center gap-1.5 ${
                filterMaterial
                  ? 'bg-indigo-950/60 border-indigo-600 text-indigo-300'
                  : 'bg-dnd-surface border-dnd-border text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3 h-3 text-indigo-400" />
              Requiere Material (M)
            </button>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-dnd-gold transition"
            >
              <RotateCcw className="w-3 h-3" /> Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Contador de Resultados */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>
          Mostrando <strong className="text-slate-200">{filteredSpells.length}</strong> de{' '}
          <strong className="text-slate-200">{initialSpells.length}</strong> hechizos catalogados
        </span>
      </div>

      {/* Grid de Hechizos */}
      {filteredSpells.length === 0 ? (
        <div className="text-center py-16 bg-dnd-card border border-dnd-border rounded-2xl p-8 space-y-3">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-200">No se encontraron hechizos</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Prueba a relajar los términos de búsqueda o limpiar los filtros seleccionados.
          </p>
          <button
            onClick={resetFilters}
            className="mt-2 px-4 py-2 rounded-xl bg-dnd-surface border border-dnd-border text-dnd-gold text-xs font-medium hover:bg-slate-800 transition"
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
                className="p-5 rounded-2xl bg-dnd-card border border-dnd-border hover:border-dnd-gold/40 transition flex flex-col justify-between shadow-md space-y-4"
              >
                {/* Header de la Tarjeta */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-base font-bold text-slate-100 font-fantasy leading-snug">
                      {spell.name}
                    </h3>
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0 ${badge.bg} ${badge.text} ${badge.border}`}
                    >
                      {spell.levelLabel}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <span className="text-dnd-gold-light font-medium">{spell.school}</span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {spell.castingTime}
                    </span>
                    <span>&bull;</span>
                    <span>{spell.range}</span>
                  </div>
                </div>

                {/* Etiquetas de Propiedades y Componentes */}
                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                  {/* Componentes V, S, M */}
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono">
                    {[
                      spell.components.verbal && 'V',
                      spell.components.somatic && 'S',
                      spell.components.material && 'M'
                    ]
                      .filter(Boolean)
                      .join(', ') || 'Ninguno'}
                  </span>

                  {spell.concentration && (
                    <span className="px-2 py-0.5 rounded bg-amber-950/70 border border-amber-800/50 text-amber-300 flex items-center gap-1 font-medium">
                      <Zap className="w-2.5 h-2.5" /> Concentración
                    </span>
                  )}

                  {spell.ritual && (
                    <span className="px-2 py-0.5 rounded bg-sky-950/70 border border-sky-800/50 text-sky-300 flex items-center gap-1 font-medium">
                      <BookOpen className="w-2.5 h-2.5" /> Ritual
                    </span>
                  )}
                </div>

                {/* Descripción Corta / Expandida */}
                <div className="text-xs text-slate-300 leading-relaxed font-sans">
                  {isExpanded ? (
                    <div className="space-y-3 mt-2 pt-2 border-t border-dnd-border/80">
                      <p className="whitespace-pre-wrap">{spell.description}</p>

                      {spell.components.materialDescription && (
                        <div className="p-2.5 rounded-lg bg-dnd-surface border border-slate-800 text-slate-400 text-[11px]">
                          <strong className="text-slate-200">Componente Material:</strong>{' '}
                          {spell.components.materialDescription}
                        </div>
                      )}

                      {spell.higherLevels && (
                        <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-900/40 text-amber-200 text-[11px]">
                          <strong className="text-dnd-gold">A niveles superiores:</strong>{' '}
                          {spell.higherLevels}
                        </div>
                      )}

                      {spell.classes.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 pt-1 text-[11px] text-slate-400">
                          <span className="text-slate-500">Clases:</span>
                          {spell.classes.map(cls => (
                            <span
                              key={cls}
                              className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800"
                            >
                              {cls}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="line-clamp-2 text-slate-400">{spell.description}</p>
                  )}
                </div>

                {/* Botón Ver Más */}
                <div className="pt-2 border-t border-dnd-border/60 flex items-center justify-between text-xs">
                  <span className="text-slate-500 text-[11px]">{spell.duration}</span>

                  <button
                    onClick={() => setExpandedSpell(isExpanded ? null : spell.slug)}
                    className="inline-flex items-center gap-1 text-dnd-gold hover:text-dnd-gold-light font-medium transition"
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
