/** Marcos da meta, em %: dividem um objetivo grande em etapas que parecem alcançáveis. */
export const MILESTONE_PERCENTS = [10, 25, 50, 75, 100] as const;

export interface Milestone {
  percent: number;
  amount: number;
  reached: boolean;
}

export interface MilestoneProgress {
  milestones: Milestone[];
  /** Próximo marco ainda não alcançado (undefined = meta batida). */
  next?: Milestone;
  /** Quanto falta para o próximo marco. */
  remainingToNext: number;
  /** 0–100: quanto do trecho entre o marco anterior e o próximo já foi percorrido. */
  percentOfCurrentStretch: number;
}

function milestoneAmount(goal: number, percent: number): number {
  return Math.round((goal * percent) / 100);
}

export function computeMilestones(goal: number, savedAmount: number): MilestoneProgress {
  const milestones = MILESTONE_PERCENTS.map((percent) => {
    const amount = milestoneAmount(goal, percent);
    return { percent, amount, reached: savedAmount >= amount };
  });
  const nextIndex = milestones.findIndex((milestone) => !milestone.reached);
  if (nextIndex === -1) return { milestones, remainingToNext: 0, percentOfCurrentStretch: 100 };

  const next = milestones[nextIndex]!;
  const previousAmount = nextIndex === 0 ? 0 : milestones[nextIndex - 1]!.amount;
  const stretch = next.amount - previousAmount;
  return {
    milestones,
    next,
    remainingToNext: next.amount - savedAmount,
    percentOfCurrentStretch: stretch > 0 ? Math.max(0, Math.min(100, ((savedAmount - previousAmount) / stretch) * 100)) : 0,
  };
}

/** Maior marco ultrapassado entre dois totais (para comemorar). */
export function findMilestoneCrossed(goal: number, savedBefore: number, savedAfter: number): number | undefined {
  let crossed: number | undefined;
  for (const percent of MILESTONE_PERCENTS) {
    const amount = milestoneAmount(goal, percent);
    if (savedBefore < amount && savedAfter >= amount) crossed = percent;
  }
  return crossed;
}
