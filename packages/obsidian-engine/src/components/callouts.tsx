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
    border: 'border border-dnd-crimson/50',
    bg: 'bg-dnd-parchment text-dnd-ink rounded-lg shadow-sm',
    headerText: 'text-dnd-crimson font-dnd-title font-bold tracking-wide',
    icon: Shield
  },
  'dnd-grid': {
    border: 'border border-dnd-gold/60',
    bg: 'bg-dnd-parchment text-dnd-ink rounded-lg shadow-sm',
    headerText: 'text-dnd-gold font-dnd-title font-bold tracking-wide',
    icon: Dices
  },
  info: {
    border: 'border border-dnd-border-antique',
    bg: 'bg-dnd-parchment text-dnd-ink rounded-lg shadow-sm',
    headerText: 'text-dnd-crimson font-dnd-title font-bold tracking-wide',
    icon: Info
  },
  tip: {
    border: 'border border-emerald-600/40',
    bg: 'bg-emerald-950/10 text-dnd-ink rounded-lg shadow-sm',
    headerText: 'text-emerald-700 dark:text-emerald-400 font-dnd-title font-bold tracking-wide',
    icon: Sparkles
  },
  warning: {
    border: 'border border-amber-600/40',
    bg: 'bg-amber-950/10 text-dnd-ink rounded-lg shadow-sm',
    headerText: 'text-amber-700 dark:text-amber-400 font-dnd-title font-bold tracking-wide',
    icon: AlertTriangle
  },
  todo: {
    border: 'border border-indigo-600/40',
    bg: 'bg-indigo-950/10 text-dnd-ink rounded-lg shadow-sm',
    headerText: 'text-indigo-700 dark:text-indigo-400 font-dnd-title font-bold tracking-wide',
    icon: ListTodo
  },
  dm: {
    border: 'border border-dnd-crimson',
    bg: 'bg-dnd-crimson-surface text-dnd-ink rounded-lg shadow-sm',
    headerText: 'text-dnd-crimson font-dnd-title font-bold tracking-wide',
    badgeBg: 'bg-dnd-crimson',
    badgeText: 'text-white border border-dnd-gold',
    icon: Lock
  },
  note: {
    border: 'border border-dnd-border-antique',
    bg: 'bg-dnd-parchment text-dnd-ink rounded-lg shadow-sm',
    headerText: 'text-dnd-crimson font-dnd-title font-bold tracking-wide',
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
        <IconComponent className="w-4 h-4 shrink-0 opacity-90 text-dnd-crimson" />
        <span className={`text-sm tracking-wide ${theme.headerText}`}>
          {callout.title}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {callout.isDmOnly && (
          <span className="text-xs uppercase tracking-wider font-dnd-title font-bold px-2 py-0.5 rounded-md bg-dnd-crimson text-white border border-dnd-gold flex items-center gap-1 shadow-xs">
            <Lock className="w-3 h-3 text-dnd-gold" /> Confidencial DM 🔒
          </span>
        )}
        {isCollapsible && (
          <ChevronDown className="w-4 h-4 text-dnd-ink-subtle group-open:rotate-180 transition-transform duration-200" />
        )}
      </div>
    </div>
  );

  const bodyContent = (
    <div className="text-xs leading-relaxed text-dnd-ink/90 mt-2.5 space-y-2 whitespace-pre-wrap font-dnd-body">
      {children || callout.content}
    </div>
  );

  if (isCollapsible) {
    return (
      <details
        open={defaultOpen}
        className={`group my-4 rounded-lg border p-4 shadow-sm transition-colors ${theme.border} ${theme.bg} ${className}`}
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
      className={`my-4 rounded-lg border p-4 shadow-sm ${theme.border} ${theme.bg} ${className}`}
    >
      {headerContent}
      {bodyContent}
    </div>
  );
}
