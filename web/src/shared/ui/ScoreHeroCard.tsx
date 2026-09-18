import type { ReactNode } from 'react';
import { ArcGauge } from './ArcGauge';
import { BarHero, PieHero, type HeroSlice } from './HeroCharts';

type ScoreHeroCardProps = {
  label: string;
  chart: 'arc' | 'pie' | 'bar';
  value?: number;
  max?: number;
  min?: number;
  display?: string;
  caption?: string;
  trend?: ReactNode;
  rangeMin?: string;
  rangeMax?: string;
  slices?: HeroSlice[];
  bars?: HeroSlice[];
  featured?: boolean;
};

export function ScoreHeroCard({
  label,
  chart,
  value = 0,
  max = 100,
  min = 0,
  display,
  caption,
  trend,
  rangeMin,
  rangeMax,
  slices = [],
  bars = [],
  featured = false,
}: ScoreHeroCardProps) {
  return (
    <div className={`card score-hero-card${featured ? ' is-featured' : ''}`}>
      <div className="score-hero-copy">
        <p className="score-hero-label">{label}</p>
        {trend ? <div className="score-hero-trend">{trend}</div> : null}
      </div>

      {chart === 'arc' ? (
        <ArcGauge value={value} min={min} max={max} display={display} caption={caption} />
      ) : null}
      {chart === 'pie' ? <PieHero slices={slices} display={display ?? String(value)} caption={caption} /> : null}
      {chart === 'bar' ? <BarHero bars={bars} /> : null}

      {chart === 'arc' ? (
        <div className="score-hero-range">
          <span>{rangeMin ?? String(min)}</span>
          <span>{rangeMax ?? String(max)}</span>
        </div>
      ) : (
        <ul className="score-hero-legend">
          {(chart === 'pie' ? slices : bars).map((item) => (
            <li key={item.label}>
              <i style={{ background: item.color }}></i>
              {item.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
