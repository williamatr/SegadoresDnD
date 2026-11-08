import React, { useState } from 'react';
import {
  Package,
  Shield,
  Swords,
  Sparkles,
  Coins,
  Check,
  Power,
  AlertTriangle,
  Info,
  Filter
} from 'lucide-react';
import type { BaseViewProps } from '../types.ts';
import type { InventoryItem, InventoryCategory } from '@segadores/dnd-core';
import { AttunementTracker } from '../components/AttunementTracker.tsx';

export function InventoryView({
  character,
  readOnly = false,
  onToggleAttunement,
  onToggleEquipped
}: BaseViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const items = character.inventory || [];
  const currency = character.currency || { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 };
  const attunementSlots = character.attunement_slots || 3;

  // Contar sintonizados activos
  const attunedItems = items.filter(i => i.requires_attunement && i.attuned);
  const attunedCount = attunedItems.length;

  // Filtrado de objetos
  const filteredItems = items.filter(item => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'attuned') return item.requires_attunement && item.attuned;
    if (selectedCategory === 'weapons') return item.category === 'weapon';
    if (selectedCategory === 'armor') return item.category === 'armor' || item.category === 'shield';
    if (selectedCategory === 'magic') return item.category === 'magic_item' || item.requires_attunement;
    if (selectedCategory === 'gear') return item.category === 'gear' || item.category === 'general';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 1. Panel Superior: Sintonización y Monedero Personal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        {/* Gestor de Sintonización Mágica */}
        <div className="lg:col-span-2">
          <AttunementTracker
            attunedCount={attunedCount}
            maxSlots={attunementSlots}
          />
        </div>

        {/* Monedero de Monedas */}
        <div className="p-4 rounded-2xl bg-dnd-card border border-dnd-border space-y-3 shadow-md">
          <div className="flex items-center justify-between border-b border-dnd-border/60 pb-2">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-dnd-gold" />
              <h4 className="font-fantasy font-semibold text-xs text-slate-200 uppercase tracking-wider">
                Monedero Personal
              </h4>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Bolsa del Aventurero</span>
          </div>

          <div className="grid grid-cols-5 gap-1.5 text-center">
            <div className="p-2 rounded-xl bg-dnd-surface border border-dnd-border">
              <span className="text-[9px] text-amber-700 font-bold block uppercase">PC</span>
              <span className="text-xs font-mono font-bold text-amber-600">{currency.cp}</span>
            </div>
            <div className="p-2 rounded-xl bg-dnd-surface border border-dnd-border">
              <span className="text-[9px] text-slate-400 font-bold block uppercase">PP</span>
              <span className="text-xs font-mono font-bold text-slate-300">{currency.sp}</span>
            </div>
            <div className="p-2 rounded-xl bg-dnd-surface border border-dnd-border">
              <span className="text-[9px] text-blue-400 font-bold block uppercase">PE</span>
              <span className="text-xs font-mono font-bold text-blue-300">{currency.ep}</span>
            </div>
            <div className="p-2 rounded-xl bg-dnd-surface border border-dnd-border ring-1 ring-dnd-gold/40">
              <span className="text-[9px] text-dnd-gold font-bold block uppercase">PO</span>
              <span className="text-xs font-mono font-extrabold text-dnd-gold">{currency.gp}</span>
            </div>
            <div className="p-2 rounded-xl bg-dnd-surface border border-dnd-border">
              <span className="text-[9px] text-cyan-400 font-bold block uppercase">PPT</span>
              <span className="text-xs font-mono font-bold text-cyan-300">{currency.pp}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Filtros de Categoría de Inventario */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-dnd-border/60">
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'all', label: 'Todos los Objetos', count: items.length },
            { id: 'attuned', label: 'Sintonizados', count: attunedCount },
            { id: 'weapons', label: 'Armas', count: items.filter(i => i.category === 'weapon').length },
            { id: 'armor', label: 'Armaduras / Escudos', count: items.filter(i => i.category === 'armor' || i.category === 'shield').length },
            { id: 'magic', label: 'Mágicos & Raros', count: items.filter(i => i.category === 'magic_item' || i.requires_attunement).length },
            { id: 'gear', label: 'Equipo & Mochila', count: items.filter(i => i.category === 'gear' || i.category === 'general').length }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 border ${
                selectedCategory === cat.id
                  ? 'bg-dnd-gold/20 border-dnd-gold text-dnd-gold-light shadow-sm'
                  : 'bg-dnd-surface border-dnd-border text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <span>{cat.label}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-900 font-mono">
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Lista de Objetos del Inventario */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredItems.map(item => {
          const isAttuned = item.requires_attunement && item.attuned;
          const isEquipped = item.equipped;

          return (
            <div
              key={item.slug}
              className={`p-4 rounded-2xl border transition flex flex-col justify-between space-y-3 relative overflow-hidden ${
                isAttuned
                  ? 'bg-gradient-to-br from-purple-950/20 via-dnd-surface to-dnd-card border-purple-800/60 shadow-md'
                  : isEquipped
                  ? 'bg-dnd-surface border-amber-800/50 shadow-md'
                  : 'bg-dnd-card border-dnd-border text-slate-400'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-fantasy font-bold text-sm text-slate-100">
                        {item.name}
                      </span>
                      {item.qty > 1 && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          x{item.qty}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-0.5 capitalize">
                      {item.category === 'weapon'
                        ? 'Arma'
                        : item.category === 'armor'
                        ? 'Armadura'
                        : item.category === 'shield'
                        ? 'Escudo'
                        : item.category === 'magic_item'
                        ? 'Objeto Mágico'
                        : 'Equipo de aventura'}
                    </span>
                  </div>

                  {/* Badges de Estado */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.requires_attunement && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isAttuned
                            ? 'bg-purple-950/80 border-purple-600 text-purple-300'
                            : 'bg-slate-900 border-slate-700 text-slate-400'
                        }`}
                      >
                        {isAttuned ? 'Sintonizado ✨' : 'Sin sintonizar'}
                      </span>
                    )}

                    {isEquipped && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-600 text-dnd-gold-light">
                        Equipado
                      </span>
                    )}
                  </div>
                </div>

                {/* Notas y Descripción */}
                {item.notes && (
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {item.notes}
                  </p>
                )}
              </div>

              {/* Botones de Acción (Equipar / Sintonizar) */}
              {!readOnly && (
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-dnd-border/60 text-xs">
                  {/* Botón de Equipar/Desequipar (Armas y Armaduras) */}
                  {(item.category === 'weapon' || item.category === 'armor' || item.category === 'shield') && (
                    <button
                      onClick={() => onToggleEquipped?.(item.slug)}
                      className={`px-3 py-1 rounded-lg border font-medium transition ${
                        isEquipped
                          ? 'bg-amber-950/40 border-amber-700/60 text-amber-300 hover:bg-amber-900/40'
                          : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      {isEquipped ? 'Desequipar' : 'Equipar'}
                    </button>
                  )}

                  {/* Interruptor de Sintonización */}
                  {item.requires_attunement && (
                    <button
                      onClick={() => onToggleAttunement?.(item.slug)}
                      className={`px-3 py-1 rounded-lg border font-medium flex items-center gap-1.5 transition ${
                        isAttuned
                          ? 'bg-purple-950/60 border-purple-600 text-purple-200 hover:bg-purple-900/60'
                          : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-purple-600'
                      }`}
                    >
                      <Sparkles className="w-3 h-3 text-purple-400" />
                      {isAttuned ? 'Desintonizar' : 'Sintonizar'}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
