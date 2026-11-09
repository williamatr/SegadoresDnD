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
import { DndBadge, TaperedRule } from '@segadores/ui';
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
      {/* 1. Panel Superior: Sintonización y Monedero Personal Canónico */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        {/* Gestor de Sintonización Mágica */}
        <div className="lg:col-span-2">
          <AttunementTracker
            attunedCount={attunedCount}
            maxSlots={attunementSlots}
          />
        </div>

        {/* Monedero de 5 Divisas Canónicas D&D 5e */}
        <div className="p-4 rounded-sm bg-[#fdf6ea] text-[#242528] border-2 border-[#d4c2a5] dnd-notched space-y-3 shadow-md">
          <div className="flex items-center justify-between border-b border-[#d4c2a5]/80 pb-2">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-[#c29b38]" />
              <h4 className="font-dnd-title font-bold text-xs text-[#58180D] uppercase tracking-wider">
                Monedero Canónico
              </h4>
            </div>
            <span className="text-[10px] text-[#58544d] font-dnd-title uppercase">5 Divisas</span>
          </div>

          <div className="grid grid-cols-5 gap-1.5 text-center">
            <div className="p-2 rounded-sm bg-[#ede2cb] border border-[#d4c2a5]">
              <span className="text-[10px] text-[#b45309] font-dnd-title font-black block uppercase">PC</span>
              <span className="text-xs font-dnd-title font-bold text-[#78350f]">{currency.cp}</span>
            </div>
            <div className="p-2 rounded-sm bg-[#ede2cb] border border-[#d4c2a5]">
              <span className="text-[10px] text-[#64748b] font-dnd-title font-black block uppercase">PP</span>
              <span className="text-xs font-dnd-title font-bold text-[#334155]">{currency.sp}</span>
            </div>
            <div className="p-2 rounded-sm bg-[#ede2cb] border border-[#d4c2a5]">
              <span className="text-[10px] text-[#0284c7] font-dnd-title font-black block uppercase">PE</span>
              <span className="text-xs font-dnd-title font-bold text-[#0369a1]">{currency.ep}</span>
            </div>
            <div className="p-2 rounded-sm bg-[#fef9c3] border-2 border-[#ca8a04] shadow-sm">
              <span className="text-[10px] text-[#854d0e] font-dnd-title font-black block uppercase">PO</span>
              <span className="text-xs font-dnd-title font-black text-[#854d0e]">{currency.gp}</span>
            </div>
            <div className="p-2 rounded-sm bg-[#ede2cb] border border-[#d4c2a5]">
              <span className="text-[10px] text-[#0f766e] font-dnd-title font-black block uppercase">PPT</span>
              <span className="text-xs font-dnd-title font-bold text-[#115e59]">{currency.pp}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Filtros de Categoría de Inventario */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-[#d4c2a5]/80">
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
              className={`px-3 py-1.5 rounded-sm text-xs font-dnd-title font-bold transition flex items-center gap-1.5 border ${
                selectedCategory === cat.id
                  ? 'bg-[#58180D] border-[#7a2021] text-[#fdf6ea] shadow-sm'
                  : 'bg-[#f4ebe1] border-[#d4c2a5] text-[#58544d] hover:text-[#242528] hover:border-[#c29b38]'
              }`}
            >
              <span>{cat.label}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-sm bg-[#ede2cb] text-[#58180D] font-bold">
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Lista de Objetos del Inventario (Tarjetas de Objeto Mágico D&D 5e) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredItems.map(item => {
          const isAttuned = item.requires_attunement && item.attuned;
          const isEquipped = item.equipped;

          return (
            <div
              key={item.slug}
              className={`p-4 rounded-sm border-2 transition flex flex-col justify-between space-y-3 relative dnd-notched shadow-sm ${
                isAttuned
                  ? 'bg-[#fef9c3]/50 border-[#ca8a04]'
                  : isEquipped
                  ? 'bg-[#fdf6ea] border-[#c45b1d]'
                  : 'bg-[#fdf6ea] border-[#d4c2a5] text-[#242528]'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-dnd-title font-bold text-sm text-[#58180D] uppercase tracking-wide">
                        {item.name}
                      </span>
                      {item.qty > 1 && (
                        <span className="text-[10px] font-dnd-title font-bold px-1.5 py-0.5 rounded bg-[#ede2cb] text-[#58180D]">
                          x{item.qty}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[#58544d] font-dnd-title uppercase tracking-wider block mt-0.5">
                      • {item.category === 'weapon'
                        ? 'Arma'
                        : item.category === 'armor'
                        ? 'Armadura'
                        : item.category === 'shield'
                        ? 'Escudo'
                        : item.category === 'magic_item'
                        ? 'Objeto Mágico'
                        : 'Equipo de Aventura'} •
                    </span>
                  </div>

                  {/* Badges de Estado */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.requires_attunement && (
                      <DndBadge variant={isAttuned ? 'gold' : 'parchment'} size="sm">
                        {isAttuned ? 'Sintonizado ✨' : 'Sin sintonizar'}
                      </DndBadge>
                    )}

                    {isEquipped && (
                      <DndBadge variant="crimson" size="sm">
                        Equipado
                      </DndBadge>
                    )}
                  </div>
                </div>

                {/* Notas y Descripción Canónica */}
                {item.notes && (
                  <p className="text-xs text-[#242528] font-dnd-body mt-2 leading-relaxed italic bg-[#f4ebe1]/80 p-2.5 rounded-sm border border-[#d4c2a5]/60">
                    <strong className="font-dnd-title not-italic font-bold text-[#58180D]">Propiedad. </strong>
                    {item.notes}
                  </p>
                )}
              </div>

              {/* Botones de Acción (Equipar / Sintonizar) */}
              {!readOnly && (
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#d4c2a5]/60 text-xs">
                  {/* Botón de Equipar/Desequipar (Armas y Armaduras) */}
                  {(item.category === 'weapon' || item.category === 'armor' || item.category === 'shield') && (
                    <button
                      onClick={() => onToggleEquipped?.(item.slug)}
                      className={`px-3 py-1 rounded-sm border font-dnd-title font-bold text-xs uppercase tracking-wider transition shadow-sm ${
                        isEquipped
                          ? 'bg-[#58180D] border-[#7a2021] text-[#fdf6ea] hover:bg-[#7a2021]'
                          : 'bg-[#ede2cb] border-[#d4c2a5] text-[#58180D] hover:bg-[#d4c2a5]'
                      }`}
                    >
                      {isEquipped ? 'Desequipar' : 'Equipar'}
                    </button>
                  )}

                  {/* Interruptor de Sintonización */}
                  {item.requires_attunement && (
                    <button
                      onClick={() => onToggleAttunement?.(item.slug)}
                      className={`px-3 py-1 rounded-sm border font-dnd-title font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition shadow-sm ${
                        isAttuned
                          ? 'bg-[#c29b38] border-[#ca8a04] text-[#1b120e] hover:bg-[#a88225]'
                          : 'bg-[#ede2cb] border-[#d4c2a5] text-[#58180D] hover:bg-[#d4c2a5]'
                      }`}
                    >
                      <Sparkles className="w-3 h-3" />
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
