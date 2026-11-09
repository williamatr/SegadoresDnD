import React from 'react';
import { Zap, Plus, Minus, Moon, Sun } from 'lucide-react';
import type { ClassResource } from '@segadores/dnd-core';

interface ClassResourcesTrackerProps {
  resources: ClassResource[];
  onUpdateResource?: (resourceId: string, used: number) => void;
  readOnly?: boolean;
}

export function ClassResourcesTracker({
  resources = [],
  onUpdateResource,
  readOnly = false
}: ClassResourcesTrackerProps) {
  if (resources.length === 0) {
    return (
      <div className="p-4 rounded-sm bg-dnd-parchment text-dnd-ink-muted border-2 border-dnd-border-antique dnd-notched text-center text-xs font-dnd-body">
        Sin recursos de clase consumibles registrados.
      </div>
    );
  }

  const formatRecharge = (type: string) => {
    switch (type) {
      case 'short_rest':
        return { label: 'Descanso Corto', icon: Sun, color: 'text-dnd-gold border-dnd-gold bg-dnd-gold-surface' };
      case 'long_rest':
        return { label: 'Descanso Largo', icon: Moon, color: 'text-dnd-crimson border-dnd-crimson bg-dnd-crimson-surface' };
      default:
        return { label: 'Pasivo / Diario', icon: Zap, color: 'text-dnd-ink-muted border-dnd-border-antique bg-dnd-parchment-contrast' };
    }
  };

  return (
    <div className="p-4 rounded-sm bg-dnd-parchment text-dnd-ink border-2 border-dnd-border-antique dnd-notched space-y-3 shadow-md">
      <div className="flex items-center gap-2 border-b border-dnd-border-antique/80 pb-2">
        <Zap className="w-4 h-4 text-dnd-gold" />
        <h4 className="font-dnd-title font-bold text-xs text-dnd-crimson uppercase tracking-wider">
          Recursos de Clase y Poderes Consumibles
        </h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {resources.map(res => {
          const used = Math.max(0, Math.min(res.max, res.used || 0));
          const available = res.max - used;
          const rechargeInfo = formatRecharge(res.recharge);
          const Icon = rechargeInfo.icon;

          return (
            <div
              key={res.id}
              className="p-3 rounded-sm bg-dnd-parchment-dark border border-dnd-border-antique flex flex-col justify-between space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-xs font-dnd-title font-bold text-dnd-crimson block leading-tight">
                    {res.name}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm text-[10px] font-dnd-title font-semibold uppercase border mt-1 ${rechargeInfo.color}`}
                  >
                    <Icon className="w-2.5 h-2.5" />
                    {rechargeInfo.label}
                  </span>
                </div>

                <div className="text-right">
                  <span className="font-dnd-title text-sm font-bold text-dnd-crimson">
                    {available} <span className="text-dnd-ink-muted font-dnd-body text-xs">/ {res.max}</span>
                  </span>
                </div>
              </div>

              {/* Barra de progreso */}
              <div className="h-2 w-full bg-dnd-parchment-contrast rounded-full overflow-hidden border border-dnd-border-antique">
                <div
                  className="h-full bg-gradient-to-r from-dnd-terracotta via-dnd-gold to-dnd-gold-light transition-all duration-200"
                  style={{ width: `${(available / res.max) * 100}%` }}
                />
              </div>

              {/* Controles de gasto */}
              {!readOnly && (
                <div className="flex items-center justify-end gap-1.5 pt-1">
                  <button
                    type="button"
                    disabled={available <= 0}
                    onClick={() => onUpdateResource?.(res.id, used + 1)}
                    className="p-1 rounded-sm bg-dnd-parchment-contrast hover:bg-dnd-parchment border border-dnd-border-antique hover:border-dnd-crimson text-dnd-ink-muted hover:text-dnd-crimson disabled:opacity-30 disabled:cursor-not-allowed transition"
                    title="Gastar 1 uso"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    disabled={used <= 0}
                    onClick={() => onUpdateResource?.(res.id, used - 1)}
                    className="p-1 rounded-sm bg-dnd-parchment-contrast hover:bg-dnd-parchment border border-dnd-border-antique hover:border-[#15803d] text-dnd-ink-muted hover:text-[#15803d] disabled:opacity-30 disabled:cursor-not-allowed transition"
                    title="Recuperar 1 uso"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
