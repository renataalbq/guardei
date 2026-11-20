import type { ChallengeType, StrokePoint, ThemeId } from '../../domain/types';
import type { CellRecord, ChallengeRecord } from '../db';

/** Linha da tabela `challenges` no Supabase. */
export interface RemoteChallenge {
  id: string;
  name: string;
  goal: number;
  type: ChallengeType;
  step: number;
  start_date: string;
  end_date: string | null;
  monthly_limit: number | null;
  theme: ThemeId;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  server_updated_at?: string;
}

/** Linha da tabela `cells` no Supabase. */
export interface RemoteCell {
  id: string;
  challenge_id: string;
  value: number;
  position: number;
  saved_at: string | null;
  stroke: StrokePoint[] | null;
  updated_at: string;
  server_updated_at?: string;
}

/** Postgres devolve "2027-01-02T09:00:00+00:00"; no app usamos sempre o formato do toISOString. */
export function normalizeTimestamp(value: string): string {
  return new Date(value).toISOString();
}

const optionalTimestamp = (value: string | null) => (value === null ? undefined : normalizeTimestamp(value));

export function challengeToRemote(challenge: ChallengeRecord): RemoteChallenge {
  return {
    id: challenge.id,
    name: challenge.name,
    goal: challenge.goal,
    type: challenge.type,
    step: challenge.step,
    start_date: challenge.startDate,
    end_date: challenge.endDate ?? null,
    monthly_limit: challenge.monthlyLimit ?? null,
    theme: challenge.theme,
    created_at: challenge.createdAt,
    updated_at: challenge.updatedAt,
    deleted_at: challenge.deletedAt ?? null,
  };
}

export function challengeFromRemote(row: RemoteChallenge): ChallengeRecord {
  return {
    id: row.id,
    name: row.name,
    goal: row.goal,
    type: row.type,
    step: row.step,
    startDate: row.start_date,
    endDate: row.end_date ?? undefined,
    monthlyLimit: row.monthly_limit ?? undefined,
    theme: row.theme,
    createdAt: normalizeTimestamp(row.created_at),
    updatedAt: normalizeTimestamp(row.updated_at),
    deletedAt: optionalTimestamp(row.deleted_at),
    pendingSync: 0,
  };
}

export function cellToRemote(cell: CellRecord): RemoteCell {
  return {
    id: cell.id,
    challenge_id: cell.challengeId,
    value: cell.value,
    position: cell.position,
    saved_at: cell.savedAt ?? null,
    stroke: cell.stroke ?? null,
    updated_at: cell.updatedAt,
  };
}

export function cellFromRemote(row: RemoteCell): CellRecord {
  return {
    id: row.id,
    challengeId: row.challenge_id,
    value: row.value,
    position: row.position,
    savedAt: optionalTimestamp(row.saved_at),
    stroke: row.stroke ?? undefined,
    updatedAt: normalizeTimestamp(row.updated_at),
    pendingSync: 0,
  };
}

/**
 * Conflito: vale a alteração mais recente. A versão da nuvem só substitui a local
 * se for igual ou mais nova (igual = é o eco do que este aparelho acabou de enviar).
 */
export function shouldApplyRemoteVersion(local: { updatedAt: string } | undefined, remoteUpdatedAt: string): boolean {
  if (!local) return true;
  return Date.parse(remoteUpdatedAt) >= Date.parse(local.updatedAt);
}
