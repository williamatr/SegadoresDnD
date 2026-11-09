import React from 'react';

export interface HeraldicShieldProps {
  value: number | string;
  label?: string;
  sublabel?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'steel' | 'parchment' | 'gold';
}

/**
 * HeraldicShield: El clásico escudo heráldico medieval (heater shield)
 * utilizado en las hojas oficiales de D&D para la Clase de Armadura (CA).
 */
export function HeraldicShield({
  value,
  label = 'CA',
  sublabel,
  className = '',
  size = 'md',
  variant = 'parchment',
}: HeraldicShieldProps) {
  const sizeClasses = {
    sm: 'w-14 h-16',
    md: 'w-20 h-24',
    lg: 'w-28 h-32',
  }[size];

  const valueFontClasses = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-4xl',
  }[size];

  const labelFontClasses = {
    sm: 'text-[9px]',
    md: 'text-[11px]',
    lg: 'text-xs',
  }[size];

  let fillColor = '#fdf6ea';
  let strokeColor = '#58180D';
  let innerStrokeColor = '#c29b38';
  let textColor = '#58180D';

  if (variant === 'steel') {
    fillColor = '#e2e8f0';
    strokeColor = '#334155';
    innerStrokeColor = '#94a3b8';
    textColor = '#0f172a';
  } else if (variant === 'gold') {
    fillColor = '#fef9c3';
    strokeColor = '#854d0e';
    innerStrokeColor = '#ca8a04';
    textColor = '#713f12';
  }

  const outerShield = React.createElement('path', {
    d: 'M 10 10 Q 50 15 90 10 L 90 60 Q 90 100 50 115 Q 10 100 10 60 Z',
    fill: fillColor,
    stroke: strokeColor,
    strokeWidth: '4',
    strokeLinejoin: 'round',
  });

  const innerGoldRule = React.createElement('path', {
    d: 'M 16 18 Q 50 22 84 18 L 84 58 Q 84 92 50 106 Q 16 92 16 58 Z',
    fill: 'none',
    stroke: innerStrokeColor,
    strokeWidth: '1.5',
  });

  const svg = React.createElement(
    'svg',
    {
      viewBox: '0 0 100 120',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      className: 'absolute inset-0 w-full h-full drop-shadow-md',
    },
    outerShield,
    innerGoldRule
  );

  const valueSpan = React.createElement(
    'span',
    {
      className: `font-dnd-title font-black leading-none tracking-tight ${valueFontClasses}`,
      style: { color: textColor },
    },
    value
  );

  const labelSpan = label
    ? React.createElement(
        'span',
        {
          className: `font-dnd-title font-bold uppercase tracking-wider mt-0.5 ${labelFontClasses}`,
          style: { color: strokeColor },
        },
        label
      )
    : null;

  const sublabelSpan = sublabel
    ? React.createElement(
        'span',
        {
          className:
            'text-[8px] text-[#58544d] italic tracking-tight line-clamp-1 max-w-[80%]',
        },
        sublabel
      )
    : null;

  const contentDiv = React.createElement(
    'div',
    {
      className:
        'relative z-10 flex flex-col items-center justify-center text-center mt-0.5',
    },
    valueSpan,
    labelSpan,
    sublabelSpan
  );

  return React.createElement(
    'div',
    {
      className: `relative inline-flex flex-col items-center justify-center select-none ${sizeClasses} ${className}`,
    },
    svg,
    contentDiv
  );
}
