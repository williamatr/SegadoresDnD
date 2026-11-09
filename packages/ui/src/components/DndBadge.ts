import React from 'react';

export interface DndBadgeProps {
  children: React.ReactNode;
  variant?: 'crimson' | 'gold' | 'parchment' | 'terracotta' | 'ink';
  size?: 'sm' | 'md';
  className?: string;
  icon?: React.ReactNode;
}

/**
 * DndBadge: Etiqueta o insignia editorial para escuelas de magia, competencias,
 * alineamientos o estados, inspirada en cintillas de manuales y sellos de cera.
 */
export function DndBadge({
  children,
  variant = 'parchment',
  size = 'md',
  className = '',
  icon,
}: DndBadgeProps) {
  const sizeClasses =
    size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  let colorClasses = 'bg-[#f4ebe1] text-[#242528] border-[#d4c2a5]';

  if (variant === 'crimson') {
    colorClasses = 'bg-[#58180D] text-[#fdf6ea] border-[#7a2021] shadow-sm';
  } else if (variant === 'gold') {
    colorClasses = 'bg-[#fef9c3] text-[#854d0e] border-[#ca8a04] shadow-sm';
  } else if (variant === 'terracotta') {
    colorClasses = 'bg-[#c45b1d] text-[#fdf6ea] border-[#9a4312] shadow-sm';
  } else if (variant === 'ink') {
    colorClasses = 'bg-[#242528] text-[#fdf6ea] border-[#58544d] shadow-sm';
  }

  const iconElement = icon
    ? React.createElement('span', { className: 'opacity-90' }, icon)
    : null;

  return React.createElement(
    'span',
    {
      className: `inline-flex items-center gap-1 font-dnd-title font-semibold tracking-wider uppercase border rounded-sm select-none ${sizeClasses} ${colorClasses} ${className}`,
    },
    iconElement,
    children
  );
}
