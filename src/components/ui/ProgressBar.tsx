interface ProgressBarProps {
  percent: number;
  label: string;
}

export function ProgressBar({ percent, label }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped)}
      className="h-2 w-full overflow-hidden rounded-full bg-ink-soft"
    >
      <div className="h-full rounded-full bg-ink transition-[width] duration-500" style={{ width: `${clamped}%` }} />
    </div>
  );
}
