import React from 'react';
import {
  Shield,
  Dices,
  Info,
  Sparkles,
  AlertTriangle,
  ListTodo,
  Lock,
  FileText,
  ChevronDown
} from 'lucide-react';
import type { CalloutBlock, CalloutType } from '../types/callouts.ts';

interface CalloutTheme {
  border: string;
  bg: string;
  headerText: string;
  badgeBg?: string;
  badgeText?: string;
  icon: React.ComponentType<{ className?: string }>;
}

const CALLOUT_THEMES: Record<string, CalloutTheme> = {
  statblock: {
    border: 'border-amber-600/50',
    bg: 'bg-amber-950/20',
    headerText: 'text-amber-200 font-fantasy',
    icon: Shield
  },
  'dnd-grid': {
    border: 'border-amber-700/40',
    bg: 'bg-slate-950/50',
    headerText: 'text-amber-300 font-semibold',
    icon: Dices
  },
  info: {
    border: 'border-sky-700/50',
    bg: 'bg-sky-950/25',
    headerText: 'text-sky-200 font-semibold',
    icon: Info
  },
  tip: {
    border: 'border-emerald-700/50',
    bg: 'bg-emerald-950/25',
    headerText: 'text-emerald-200 font-semibold',
    icon: Sparkles
  },
  warning: {
    border: 'border-amber-700/60',
    bg: 'bg-amber-950/30',
    headerText: 'text-amber-300 font-semibold',
    icon: AlertTriangle
  },
  todo: {
    border: 'border-indigo-700/50',
    bg: 'bg-indigo-950/25',
    headerText: 'text-indigo-200 font-semibold',
    icon: ListTodo
  },
  dm: {
    border: 'border-red-700/60',
    bg: 'bg-red-950/40',
    headerText: 'text-red-200 font-bold',
    badgeBg: 'bg-red-900/60',
    badgeText: 'text-red-300 border border-red-700/50',
    icon: Lock
  },
  note: {
    border: 'border-slate-700/60',
    bg: 'bg-slate-900/40',
    headerText: 'text-slate-200 font-semibold',
    icon: FileText
  }
};

function getTheme(type: CalloutType): CalloutTheme {
  const norm = type.toLowerCase();
  return CALLOUT_THEMES[norm] || CALLOUT_THEMES.note;
}

export interface CalloutProps {
  callout: CalloutBlock;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Componente temático para callouts de Obsidian.
 * Compatible con Server y Client Components (usa <details> para colapsado nativo y accesible).
 */
export function Callout({ callout, className = '', children }: CalloutProps) {
  const theme = getTheme(callout.type);
  const IconComponent = theme.icon;
  const isCollapsible = callout.fold !== null;
  const defaultOpen = callout.fold !== '-';

  const headerContent = (
    <div className="flex items-center justify-between w-full gap-2">
      <div className="flex items-center gap-2.5">
        <IconComponent className="w-4 h-4 shrink-0 opacity-90" />
        <span className={`text-sm tracking-wide ${theme.headerText}`}>
          {callout.title}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {callout.isDmOnly && (
          <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-red-900/80 text-red-200 border border-red-600/40 flex items-center gap-1 shadow-sm">
            <Lock className="w-2.5 h-2.5" /> Confidencial DM
          </span>
        )}
        {isCollapsible && (
          <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform duration-200" />
        )}
      </div>
    </div>
  );

  const bodyContent = (
    <div className="text-sm leading-relaxed text-slate-300 mt-2.5 space-y-2 whitespace-pre-wrap font-sans">
      {children || callout.content}
    </div>
  );

  if (isCollapsible) {
    return (
      <details
        open={defaultOpen}
        className={`group my-4 rounded-xl border p-4 shadow-md transition-colors ${theme.border} ${theme.bg} ${className}`}
      >
        <summary className="list-none cursor-pointer select-none">
          {headerContent}
        </summary>
        {bodyContent}
      </details>
    );
  }

  return (
    <div
      className={`my-4 rounded-xl border p-4 shadow-md ${theme.border} ${theme.bg} ${className}`}
    >
      {headerContent}
      {bodyContent}
    </div>
  );
}
