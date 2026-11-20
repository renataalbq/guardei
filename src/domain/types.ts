export type ChallengeType = 'sequential' | 'weeks52';

export type ThemeId = 'caderno' | 'marca-texto' | 'escuro';

export const SEQUENTIAL_STEPS = [1, 2, 5, 10] as const;
export type SequentialStep = (typeof SEQUENTIAL_STEPS)[number];

/** Ponto do traço normalizado em relação à célula: (0,0) canto superior esquerdo, (1,1) inferior direito. */
export interface StrokePoint {
  x: number;
  y: number;
}

/** Data de calendário no formato ISO `YYYY-MM-DD` (sem fuso). */
export type CalendarDate = string;

export interface Challenge {
  id: string;
  name: string;
  /** Meta em reais (inteiro). */
  goal: number;
  type: ChallengeType;
  /** Multiplicador dos valores no sequencial (1, 2, 5 ou 10). No 52 semanas é sempre 1. */
  step: number;
  startDate: CalendarDate;
  endDate?: CalendarDate;
  /** Quanto a pessoa consegue guardar por mês, no máximo (reais). */
  monthlyLimit?: number;
  theme: ThemeId;
  createdAt: string;
  updatedAt: string;
}

export interface Cell {
  id: string;
  challengeId: string;
  /** Valor em reais. */
  value: number;
  /** Ordem na grade. */
  position: number;
  /** ISO; presente = riscado. */
  savedAt?: string;
  /** Traço normalizado (0–1 relativo à célula) para redesenhar o risco como foi feito. */
  stroke?: StrokePoint[];
  updatedAt: string;
}
