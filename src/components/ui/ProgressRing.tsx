interface ProgressRingProps {
  percent: number;
  size?: number;
  thickness?: number;
  /** "light" para usar sobre o gradiente. */
  tone?: 'brand' | 'light';
  label: string;
}

/** Anel de progresso com a % no centro. */
export function ProgressRing({ percent, size = 64, thickness = 7, tone = 'brand', label }: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(100, percent));
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const track = tone === 'light' ? 'rgb(255 255 255 / 0.25)' : 'var(--ink-soft)';
  const fill = tone === 'light' ? '#ffffff' : 'var(--money)';
  const display = clamped > 0 && clamped < 1 ? '<1' : Math.floor(clamped).toString();

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped)}
      className="relative shrink-0"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={track} strokeWidth={thickness} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={fill}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped / 100)}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <span
        className={`absolute inset-0 flex items-center justify-center font-display font-bold font-numeric ${
          tone === 'light' ? 'text-white' : 'text-fg'
        }`}
        style={{ fontSize: size * 0.24 }}
      >
        {display}%
      </span>
    </div>
  );
}
