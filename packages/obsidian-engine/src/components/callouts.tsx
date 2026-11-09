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
    border: 'border-2 border-[#58180D]',
    bg: 'bg-[#fdf1dc] text-[#242528] dnd-notched-sm shadow-md',
    headerText: 'text-[#58180D] font-dnd-title font-bold uppercase tracking-wider',
    icon: Shield
  },
  'dnd-grid': {
    border: 'border-2 border-[#c29b38]',
    bg: 'bg-[#fdf6ea] text-[#242528] dnd-notched-sm shadow-sm',
    headerText: 'text-[#78350f] font-dnd-title font-bold uppercase tracking-wider',
    icon: Dices
  },
  info: {
    border: 'border-2 border-[#d4c2a5]',
    bg: 'bg-[#fdf6ea] text-[#242528] dnd-notched-sm shadow-sm',
    headerText: 'text-[#58180D] font-dnd-title font-bold uppercase tracking-wider',
    icon: Info
  },
  tip: {
    border: 'border-2 border-[#15803d]',
    bg: 'bg-[#f0fdf4] text-[#14532d] dnd-notched-sm shadow-sm',
    headerText: 'text-[#15803d] font-dnd-title font-bold uppercase tracking-wider',
    icon: Sparkles
  },
  warning: {
    border: 'border-2 border-[#b45309]',
    bg: 'bg-[#fef3c7] text-[#78350f] dnd-notched-sm shadow-sm',
    headerText: 'text-[#b45309] font-dnd-title font-bold uppercase tracking-wider',
    icon: AlertTriangle
  },
  todo: {
    border: 'border-2 border-[#4338ca]',
    bg: 'bg-[#eef2ff] text-[#312e81] dnd-notched-sm shadow-sm',
    headerText: 'text-[#4338ca] font-dnd-title font-bold uppercase tracking-wider',
    icon: ListTodo
  },
  dm: {
    border: 'border-2 border-[#7a2021]',
    bg: 'bg-[#fbeeed] text-[#58180D] dnd-notched-sm shadow-md',
    headerText: 'text-[#58180D] font-dnd-title font-bold uppercase tracking-wider',
    badgeBg: 'bg-[#58180D]',
    badgeText: 'text-[#fdf6ea] border border-[#7a2021]',
    icon: Lock
  },
  note: {
    border: 'border-2 border-[#d4c2a5]',
    bg: 'bg-[#fdf6ea] text-[#242528] dnd-notched-sm shadow-sm',
    headerText: 'text-[#58180D] font-dnd-title font-bold uppercase tracking-wider',
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
          <span className="text-[10px] uppercase tracking-wider font-dnd-title font-bold px-2 py-0.5 rounded-sm bg-[#58180D] text-[#fdf6ea] border border-[#7a2021] flex items-center gap-1 shadow-xs">
            <Lock className="w-2.5 h-2.5 text-[#c29b38]" /> Confidencial DM 🔒
          </span>
        )}
        {isCollapsible && (
          <ChevronDown className="w-4 h-4 text-[#8a7f72] group-open:rotate-180 transition-transform duration-200" />
        )}
      </div>
    </div>
  );

  const bodyContent = (
    <div className="text-xs leading-relaxed text-[#242528]/90 mt-2.5 space-y-2 whitespace-pre-wrap font-dnd-body">
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
