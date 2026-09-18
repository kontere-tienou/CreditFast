type ArcGaugeProps = {
  value: number;
  max?: number;
  min?: number;
  display?: string;
  caption?: string;
  color?: string;
};

export function ArcGauge({
  value,
  max = 100,
  min = 0,
  display,
  caption,
  color = '#1b4332',
}: ArcGaugeProps) {
  const width = 280;
  const height = 140;
  const cx = 140;
  const cy = 118;
  const radius = 100;
  const stroke = 14;
  const ratio = Math.min(1, Math.max(0, (value - min) / (max - min || 1)));
  const left = `${cx - radius} ${cy}`;
  const top = `${cx} ${cy - radius}`;
  const right = `${cx + radius} ${cy}`;
  const d = `M ${left} A ${radius} ${radius} 0 0 1 ${top} A ${radius} ${radius} 0 0 1 ${right}`;

  return (
    <div className="arc-gauge">
      <svg viewBox={`0 0 ${width} ${height}`} className="arc-gauge-svg" aria-hidden="true">
        <path
          d={d}
          fill="none"
          stroke="#e7eee8"
          strokeWidth={stroke}
          strokeLinecap="round"
          pathLength={100}
        />
        <path
          d={d}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={`${ratio * 100} 100`}
        />
      </svg>
      <div className="arc-gauge-center">
        <strong>{display ?? String(value)}</strong>
        {caption ? <span>{caption}</span> : null}
      </div>
    </div>
  );
}
