import { useEffect, useMemo, type CSSProperties } from 'react';

const CONFETTI_COLORS = ['#5b3df5', '#ff3d7f', '#10b981', '#ffb020', '#8a3cf2', '#38bdf8'];
const CONFETTI_PIECES = 36;
const VISIBLE_MS = 2_600;

interface MilestoneCelebrationProps {
  percent: number;
  onDone: () => void;
}

/** Confete e mensagem ao passar de um marco da meta. */
export function MilestoneCelebration({ percent, onDone }: MilestoneCelebrationProps) {
  useEffect(() => {
    const timer = setTimeout(onDone, VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [onDone]);

  const pieces = useMemo(
    () =>
      Array.from({ length: CONFETTI_PIECES }, (_, index) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 1.6 + Math.random() * 1.1,
        drift: (Math.random() - 0.5) * 160,
        spin: 360 + Math.random() * 540,
        color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
        wide: index % 3 === 0,
      })),
    [],
  );

  const message = percent >= 100 ? 'Meta batida!' : `${percent}% da meta!`;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden motion-reduce:hidden" aria-live="assertive">
      {pieces.map((piece, index) => (
        <span
          key={index}
          className="absolute top-0 block rounded-[2px]"
          style={
            {
              left: `${piece.left}%`,
              width: piece.wide ? 10 : 7,
              height: piece.wide ? 6 : 12,
              background: piece.color,
              animation: `confetti-fall ${piece.duration}s cubic-bezier(0.25, 0.6, 0.4, 1) ${piece.delay}s both`,
              '--drift': `${piece.drift}px`,
              '--spin': `${piece.spin}deg`,
            } as CSSProperties
          }
        />
      ))}
      <div className="absolute inset-x-0 top-1/3 flex justify-center">
        <p className="hero-gradient animate-[pop-in_450ms_ease-out_both] rounded-full px-6 py-3 font-display text-2xl font-extrabold shadow-[var(--shadow-brand)]">
          {message}
        </p>
      </div>
    </div>
  );
}
