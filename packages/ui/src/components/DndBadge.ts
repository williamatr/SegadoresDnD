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
    size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  let colorClasses = 'bg-dnd-parchment-contrast text-dnd-ink border-dnd-border-antique';

  if (variant === 'crimson') {
    colorClasses = 'bg-dnd-crimson text-white border-dnd-crimson-hover shadow-xs';
  } else if (variant === 'gold') {
    colorClasses = 'bg-dnd-gold-surface text-dnd-gold border-dnd-gold shadow-xs';
  } else if (variant === 'terracotta') {
    colorClasses = 'bg-dnd-terracotta text-white border-dnd-border-strong shadow-xs';
  } else if (variant === 'ink') {
    colorClasses = 'bg-dnd-canvas text-dnd-ink border-dnd-border-antique shadow-xs';
  }

  const iconElement = icon
    ? React.createElement('span', { className: 'opacity-90' }, icon)
    : null;

  return React.createElement(
    'span',
    {
      className: `inline-flex items-center gap-1 font-dnd-title font-semibold tracking-wide border rounded-md select-none ${sizeClasses} ${colorClasses} ${className}`,
    },
    iconElement,
    children
  );
}
