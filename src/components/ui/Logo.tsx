/** "guardei" com um risco rosa por baixo, como quem acabou de riscar um número. */
export function Logo({ className = '' }: { className?: string }) {
  return (
    <span
      className={`relative inline-block font-display text-[2.5rem] leading-none font-extrabold tracking-tight text-ink-strong ${className}`}
    >
      guardei
      <svg viewBox="0 0 160 16" className="absolute -bottom-2 left-0 h-3 w-full" aria-hidden="true" preserveAspectRatio="none">
        <path d="M3 10 C 40 4, 90 13, 157 5" fill="none" stroke="var(--accent)" strokeWidth="5" strokeLinecap="round" />
      </svg>
    </span>
  );
}
