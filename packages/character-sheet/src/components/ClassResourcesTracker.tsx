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
      <div className="p-4 rounded-2xl bg-dnd-card border border-dnd-border text-center text-xs text-slate-500">
        Sin recursos de clase consumibles registrados.
      </div>
    );
  }

  const formatRecharge = (type: string) => {
    switch (type) {
      case 'short_rest':
        return { label: 'Descanso Corto', icon: Sun, color: 'text-amber-400 border-amber-800/40 bg-amber-950/40' };
      case 'long_rest':
        return { label: 'Descanso Largo', icon: Moon, color: 'text-indigo-300 border-indigo-800/40 bg-indigo-950/40' };
      default:
        return { label: 'Pasivo / Diario', icon: Zap, color: 'text-slate-300 border-slate-700 bg-slate-900' };
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-dnd-card border border-dnd-border space-y-3 shadow-md">
      <div className="flex items-center gap-2 border-b border-dnd-border/60 pb-2">
        <Zap className="w-4 h-4 text-dnd-gold" />
        <h4 className="font-fantasy font-semibold text-xs text-slate-200 uppercase tracking-wider">
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
              className="p-3 rounded-xl bg-dnd-surface border border-dnd-border flex flex-col justify-between space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-slate-200 block leading-tight">
                    {res.name}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] border mt-1 ${rechargeInfo.color}`}
                  >
                    <Icon className="w-2.5 h-2.5" />
                    {rechargeInfo.label}
                  </span>
                </div>

                <div className="text-right">
                  <span className="font-mono text-sm font-bold text-dnd-gold-light">
                    {available} <span className="text-slate-500 text-xs">/ {res.max}</span>
                  </span>
                </div>
              </div>

              {/* Barra de progreso */}
              <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-amber-600 to-dnd-gold transition-all duration-200"
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
                    className="p-1 rounded bg-slate-900 hover:bg-red-950 border border-slate-700 hover:border-red-700 text-slate-300 hover:text-red-300 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    title="Gastar 1 uso"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    disabled={used <= 0}
                    onClick={() => onUpdateResource?.(res.id, used - 1)}
                    className="p-1 rounded bg-slate-900 hover:bg-emerald-950 border border-slate-700 hover:border-emerald-700 text-slate-300 hover:text-emerald-300 disabled:opacity-30 disabled:cursor-not-allowed transition"
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
