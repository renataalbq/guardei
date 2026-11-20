import type { ChallengeType } from './types';

interface ColumnRule {
  minCellWidth: number;
  minColumns: number;
  maxColumns: number;
}

/** Células grandes o bastante para tocar e riscar com o dedo no celular. */
const COLUMN_RULES: Record<ChallengeType, ColumnRule> = {
  sequential: { minCellWidth: 52, minColumns: 4, maxColumns: 10 },
  weeks52: { minCellWidth: 104, minColumns: 2, maxColumns: 4 },
};

/** Quantas colunas cabem na largura disponível sem deixar a célula pequena demais. */
export function computeGridColumns(containerWidth: number, type: ChallengeType, gap = 0): number {
  const { minCellWidth, minColumns, maxColumns } = COLUMN_RULES[type];
  const fitting = Math.floor((containerWidth + gap) / (minCellWidth + gap));
  return Math.min(maxColumns, Math.max(minColumns, fitting));
}
