type InsightTile = {
  label: string;
  value: string;
  hint: string;
  ring?: number;
  badge?: string;
  tone?: 'good' | 'warn' | 'info';
};

type InsightTilesProps = {
  tiles: InsightTile[];
};

function MiniRing({ value }: { value: number }) {
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference * Math.min(1, Math.max(0, value / 100));

  return (
    <svg className="insight-mini-ring" viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="20" cy="20" r={radius} fill="none" stroke="#e7eee8" strokeWidth="4" />
      <circle
        cx="20"
        cy="20"
        r={radius}
        fill="none"
        stroke="#1b4332"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={`${progress} ${circumference}`}
        transform="rotate(-90 20 20)"
      />
    </svg>
  );
}

export function InsightTiles({ tiles }: InsightTilesProps) {
  return (
    <div className="insight-tile-grid">
      {tiles.map((tile) => (
        <article key={tile.label} className="insight-tile">
          <div className="insight-tile-top">
            <span>{tile.label}</span>
            {typeof tile.ring === 'number' ? <MiniRing value={tile.ring} /> : null}
          </div>
          <strong>{tile.value}</strong>
          <p>
            {tile.badge ? <em className={`insight-badge ${tile.tone ?? 'info'}`}>{tile.badge}</em> : null}
            {tile.hint}
          </p>
        </article>
      ))}
    </div>
  );
}
