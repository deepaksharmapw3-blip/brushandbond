import React from 'react';

export interface MasonryGridProps {
  children: React.ReactNode;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
    wide?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const MasonryGrid: React.FC<MasonryGridProps> = ({
  children,
  columns = {
    mobile: 1,
    tablet: 2,
    desktop: 3,
    wide: 4,
  },
  gap = 'md',
  className = '',
}) => {
  const gapClasses = {
    sm: 'gap-4 space-y-4',
    md: 'gap-6 space-y-6',
    lg: 'gap-8 space-y-8',
  }[gap];

  const colClasses = `columns-${columns.mobile || 1} sm:columns-${columns.tablet || 2} lg:columns-${columns.desktop || 3} xl:columns-${columns.wide || 4}`;

  return (
    <div
      className={`${colClasses} ${gapClasses} [column-fill:_balance] ${className}`}
    >
      {React.Children.map(children, (child) => {
        if (!child) return null;
        return <div className="break-inside-avoid">{child}</div>;
      })}
    </div>
  );
};
