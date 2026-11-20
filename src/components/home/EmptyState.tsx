import { Link } from 'react-router';

const SAMPLE_VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
const SAMPLE_SAVED = new Set([2, 5, 6, 9, 13]);

/** Primeira visita: explica a ideia com uma tabelinha riscada e chama para criar o desafio. */
export function EmptyState() {
  return (
    <section className="hero-gradient relative overflow-hidden rounded-[2rem] px-6 pt-7 pb-6 shadow-[var(--shadow-brand)]">
      <div aria-hidden="true" className="pointer-events-none absolute -top-20 -left-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
      <p className="relative font-display text-[2.1rem] leading-[1.05] font-extrabold">
        Junte R$ 20 mil
        <br />
        riscando números.
      </p>
      <p className="relative mt-3 text-[0.95rem] text-white/85">
        Guardou R$ 37 hoje? Risca o 37. Quando todos estiverem riscados, a meta está batida.
      </p>

      <div aria-hidden="true" className="relative mt-5 grid grid-cols-5 gap-px overflow-hidden rounded-2xl bg-white/25">
        {SAMPLE_VALUES.map((value) => (
          <div key={value} className="relative flex aspect-square items-center justify-center bg-white/95">
            <span className={`font-hand text-2xl font-bold ${SAMPLE_SAVED.has(value) ? 'text-muted/50' : 'text-ink-strong'}`}>{value}</span>
            {SAMPLE_SAVED.has(value) && (
              <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
                <path d="M10 56 Q 50 44 90 50" fill="none" stroke="var(--marker)" strokeWidth="9" strokeLinecap="round" />
              </svg>
            )}
          </div>
        ))}
      </div>

      <Link
        to="/novo"
        className="relative mt-6 flex w-full items-center justify-center rounded-2xl bg-white py-4 font-display text-lg font-extrabold text-ink shadow-lg active:scale-[0.98]"
      >
        Criar meu desafio
      </Link>
    </section>
  );
}
