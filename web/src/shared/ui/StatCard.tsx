import type { MouseEventHandler, ReactNode } from 'react';

type StatCardProps = {
  icon: string;
  tone: 'primary' | 'emerald' | 'amber' | 'rose' | 'purple';
  value: ReactNode;
  valueId?: string;
  label: string;
  trend: ReactNode;
  trendUp?: boolean;
  onClick?: MouseEventHandler<HTMLDivElement>;
  title?: string;
  ariaLabel?: string;
  featured?: boolean;
};

export function StatCard({
  icon,
  tone,
  value,
  valueId,
  label,
  trend,
  trendUp = true,
  onClick,
  title,
  ariaLabel,
  featured = false,
}: StatCardProps) {
  return (
    <div
      className={`card stat-card${featured ? ' is-featured' : ''}`}
      role={ariaLabel ? 'region' : undefined}
      aria-label={ariaLabel}
      title={title}
      onClick={onClick}
      style={onClick ? { cursor: 'pointer' } : undefined}
    >
      <div className={`stat-icon-wrap ${tone}`}>
        <i className={`fas ${icon}`}></i>
      </div>
      <div className="stat-content">
        <div className="stat-value" id={valueId}>
          {value}
        </div>
        <div className="stat-label">{label}</div>
        <div className={`stat-trend ${trendUp ? 'up' : 'down'}`}>{trend}</div>
      </div>
    </div>
  );
}
