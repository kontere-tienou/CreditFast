export type HeroSlice = {
  label: string;
  value: number;
  color: string;
};

type PieHeroProps = {
  slices: HeroSlice[];
  display: string;
  caption?: string;
};

export function PieHero({ slices, display, caption }: PieHeroProps) {
  const size = 168;
  const cx = 84;
  const cy = 84;
  const outer = 70;
  const inner = 44;
  const total = slices.reduce((sum, slice) => sum + slice.value, 0) || 1;
  let angle = -90;

  const polar = (radius: number, deg: number) => {
    const rad = (deg * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  };

  const donutPath = (start: number, end: number) => {
    const large = end - start > 180 ? 1 : 0;
    const a = polar(outer, start);
    const b = polar(outer, end);
    const c = polar(inner, end);
    const d = polar(inner, start);
    return `M ${a.x} ${a.y} A ${outer} ${outer} 0 ${large} 1 ${b.x} ${b.y} L ${c.x} ${c.y} A ${inner} ${inner} 0 ${large} 0 ${d.x} ${d.y} Z`;
  };

  return (
    <div className="pie-hero">
      <svg viewBox={`0 0 ${size} ${size}`} className="pie-hero-svg" aria-hidden="true">
        {slices.map((slice) => {
          const sweep = (slice.value / total) * 360;
          const start = angle;
          angle += sweep;
          return <path key={slice.label} d={donutPath(start, start + sweep)} fill={slice.color} />;
        })}
      </svg>
      <div className="pie-hero-center">
        <strong>{display}</strong>
        {caption ? <span>{caption}</span> : null}
      </div>
    </div>
  );
}

type BarHeroProps = {
  bars: HeroSlice[];
};

export function BarHero({ bars }: BarHeroProps) {
  const max = Math.max(...bars.map((bar) => bar.value), 1);

  return (
    <div className="bar-hero">
      {bars.map((bar) => (
        <div key={bar.label} className="bar-hero-row">
          <span>{bar.label}</span>
          <div className="bar-hero-track">
            <div
              className="bar-hero-fill"
              style={{ width: `${(bar.value / max) * 100}%`, background: bar.color }}
            />
          </div>
          <strong>{bar.value}</strong>
        </div>
      ))}
    </div>
  );
}
