export type GestureKind = 'undecided' | 'scratch' | 'scroll';

/** Distância (px) que o dedo precisa andar antes de decidir se é risco ou rolagem. */
export const GESTURE_DECISION_DISTANCE = 10;

/**
 * Risco só quando o movimento horizontal predomina nos primeiros ~10px;
 * caso contrário é rolagem e o navegador cuida dela.
 */
export function classifyGesture(dx: number, dy: number, decisionDistance: number = GESTURE_DECISION_DISTANCE): GestureKind {
  if (Math.hypot(dx, dy) < decisionDistance) return 'undecided';
  return Math.abs(dx) > Math.abs(dy) ? 'scratch' : 'scroll';
}
