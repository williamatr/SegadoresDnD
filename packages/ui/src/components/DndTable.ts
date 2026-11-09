import React from 'react';

export interface DndTableProps {
  headers: React.ReactNode[];
  rows: React.ReactNode[][];
  className?: string;
  caption?: string;
}

/**
 * DndTable: Tabla canónica de manual de D&D (Player's Handbook / Tasha).
 * Cabecera en carmesí profundo con texto en versalitas y filas alternadas
 * en pergamino suave con bordes envejecidos.
 */
export function DndTable({
  headers,
  rows,
  className = '',
  caption,
}: DndTableProps) {
  const captionElement = caption
    ? React.createElement(
        'caption',
        {
          className:
            'font-dnd-title font-bold text-base text-[#58180D] p-2.5 text-left bg-[#ede2cb] border-b border-[#d4c2a5]',
        },
        caption
      )
    : null;

  const headerCells = headers.map((h, i) =>
    React.createElement(
      'th',
      {
        key: i,
        className:
          'py-2.5 px-3.5 border-b border-[#7a2021] first:pl-4 last:pr-4',
      },
      h
    )
  );

  const thead = React.createElement(
    'thead',
    null,
    React.createElement(
      'tr',
      {
        className:
          'bg-[#58180D] text-[#fdf6ea] font-dnd-title font-semibold tracking-wider text-xs uppercase select-none',
      },
      headerCells
    )
  );

  const bodyRows = rows.map((row, rIdx) => {
    const isEven = rIdx % 2 === 0;
    const rowClass = isEven
      ? 'bg-[#fdf6ea]'
      : 'bg-[#f4ebe1] hover:bg-[#ede2cb] transition-colors';

    const cells = row.map((cell, cIdx) =>
      React.createElement(
        'td',
        {
          key: cIdx,
          className: 'py-2 px-3.5 first:pl-4 last:pr-4',
        },
        cell
      )
    );

    return React.createElement(
      'tr',
      {
        key: rIdx,
        className: rowClass,
      },
      cells
    );
  });

  const tbody = React.createElement(
    'tbody',
    { className: 'divide-y divide-[#d4c2a5]/50 font-dnd-body' },
    bodyRows
  );

  const table = React.createElement(
    'table',
    {
      className:
        'w-full text-left border-collapse text-sm text-[#242528]',
    },
    captionElement,
    thead,
    tbody
  );

  return React.createElement(
    'div',
    {
      className: `overflow-x-auto my-4 border border-[#d4c2a5] shadow-sm rounded-sm ${className}`,
    },
    table
  );
}
