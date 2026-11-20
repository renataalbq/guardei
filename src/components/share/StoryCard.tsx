import { forwardRef } from 'react';
import type { ChallengeProgress } from '../../domain/computeProgress';
import { formatCellNumber, formatCurrency } from '../../domain/formatCurrency';
import { computeMilestones } from '../../domain/milestones';
import { STORY_HEIGHT, STORY_WIDTH, computeStoryGridLayout } from '../../domain/storyLayout';
import type { Cell, Challenge } from '../../domain/types';
import { StrokePath } from '../grid/StrokePath';

const SIDE_PADDING = 72;
/** O Instagram cobre ~250px no topo (barra de progresso/perfil) e na base (responder); o conteúdo fica entre eles. */
const SAFE_TOP = 220;
const SAFE_BOTTOM = 220;
const GRID_PADDING = 24;
const GRID_GAP = 2;
const GRID_AREA_WIDTH = STORY_WIDTH - SIDE_PADDING * 2 - GRID_PADDING * 2;
const GRID_AREA_HEIGHT = 790;
const CELL_ASPECT_RATIO = { sequential: 1, weeks52: 4 / 3 } as const;
const STROKE_WIDTH = { sequential: 8, weeks52: 4.2 } as const;

interface StoryCardProps {
  challenge: Challenge;
  cells: Cell[];
  progress: ChallengeProgress;
}

/** Arte do story (1080×1920): progresso, a tabela com os riscos e a marca Guardei. Usa o tema do desafio. */
export const StoryCard = forwardRef<HTMLDivElement, StoryCardProps>(function StoryCard({ challenge, cells, progress }, ref) {
  const aspectRatio = CELL_ASPECT_RATIO[challenge.type];
  const layout = computeStoryGridLayout(cells.length, GRID_AREA_WIDTH, GRID_AREA_HEIGHT, aspectRatio, GRID_GAP);
  const { next, remainingToNext } = computeMilestones(progress.goal, progress.savedAmount);
  const numberSize = Math.round(layout.cellHeight * (challenge.type === 'weeks52' ? 0.4 : 0.5));
  const emptySlotsInLastRow = (layout.columns - (cells.length % layout.columns)) % layout.columns;

  return (
    <div
      ref={ref}
      data-theme={challenge.theme}
      className="flex flex-col bg-paper text-fg"
      style={{
        width: STORY_WIDTH,
        height: STORY_HEIGHT,
        padding: `${SAFE_TOP}px ${SIDE_PADDING}px ${SAFE_BOTTOM}px`,
        gap: 36,
        backgroundImage: 'var(--page-pattern)',
        backgroundSize: '36px 36px',
      }}
    >
      <section className="hero-gradient relative overflow-hidden" style={{ borderRadius: 56, padding: '44px 56px' }}>
        <p className="font-display font-bold text-white/80" style={{ fontSize: 44 }}>
          {challenge.name}
        </p>
        <p className="font-display leading-none font-extrabold" style={{ fontSize: 120, marginTop: 10 }}>
          {formatCurrency(progress.savedAmount)}
        </p>
        <p className="font-semibold text-white/80" style={{ fontSize: 38, marginTop: 14 }}>
          guardados de {formatCurrency(progress.goal)} · {Math.floor(progress.percent)}%
        </p>
        <div className="overflow-hidden rounded-full bg-white/25" style={{ height: 22, marginTop: 28 }}>
          <div className="h-full rounded-full bg-white" style={{ width: `${progress.percent > 0 ? Math.max(progress.percent, 2) : 0}%` }} />
        </div>
        <p className="font-semibold text-white/90" style={{ fontSize: 34, marginTop: 22 }}>
          {next ? `Faltam ${formatCurrency(remainingToNext)} para ${next.percent}% da meta` : 'Meta batida!'}
        </p>
      </section>

      <section className="flex flex-1 items-center justify-center bg-surface" style={{ borderRadius: 44, padding: GRID_PADDING }}>
        <div
          className="grid overflow-hidden bg-paper-line"
          style={{
            gridTemplateColumns: `repeat(${layout.columns}, ${layout.cellWidth}px)`,
            gridAutoRows: `${layout.cellHeight}px`,
            gap: GRID_GAP,
            borderRadius: 20,
          }}
        >
          {cells.map((cell) => {
            const isSaved = cell.savedAt !== undefined;
            return (
              <div key={cell.id} className={`relative flex items-center justify-center ${isSaved ? 'cell-paper-saved' : 'cell-paper'}`}>
                <span
                  className={`font-hand leading-none font-bold ${isSaved ? 'text-muted/60' : 'text-[var(--cell-number)]'}`}
                  style={{ fontSize: numberSize }}
                >
                  {formatCellNumber(cell.value)}
                </span>
                {isSaved && cell.stroke && (
                  <StrokePath stroke={cell.stroke} aspectRatio={aspectRatio} strokeWidth={STROKE_WIDTH[challenge.type]} animate={false} />
                )}
              </div>
            );
          })}
          {Array.from({ length: emptySlotsInLastRow }, (_, index) => (
            <div key={`empty-${index}`} className="cell-paper" />
          ))}
        </div>
      </section>

      <footer className="flex items-center justify-between" style={{ height: 72 }}>
        <span className="font-semibold text-muted" style={{ fontSize: 30 }}>
          {progress.savedCount} de {progress.totalCount} valores riscados
        </span>
        <span className="relative font-display leading-none font-extrabold tracking-tight text-ink-strong" style={{ fontSize: 56 }}>
          guardei
          <svg viewBox="0 0 160 16" className="absolute left-0 w-full" style={{ bottom: -14, height: 16 }} preserveAspectRatio="none">
            <path d="M3 10 C 40 4, 90 13, 157 5" fill="none" stroke="var(--accent)" strokeWidth="5" strokeLinecap="round" />
          </svg>
        </span>
      </footer>
    </div>
  );
});
