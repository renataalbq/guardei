interface ProgressBarProps {
  percent: number;
  label: string;
  tone?: 'money' | 'light';
  size?: 'sm' | 'md';
}

export function ProgressBar({ percent, label, tone = 'money', size = 'md' }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, percent));
  const track = tone === 'light' ? 'bg-white/25' : 'bg-ink-soft';
  const fill = tone === 'light' ? 'bg-white' : 'bg-money';
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped)}
      className={`w-full overflow-hidden rounded-full ${track} ${size === 'sm' ? 'h-1.5' : 'h-2.5'}`}
    >
      <div
        className={`h-full rounded-full ${fill} transition-[width] duration-700 ease-out`}
        style={{ width: `${clamped > 0 ? Math.max(clamped, 2) : 0}%` }}
      />
    </div>
  );
}
