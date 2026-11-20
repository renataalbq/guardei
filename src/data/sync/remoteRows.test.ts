import { describe, expect, it } from 'vitest';
import type { CellRecord, ChallengeRecord } from '../db';
import { cellFromRemote, cellToRemote, challengeFromRemote, challengeToRemote, shouldApplyRemoteVersion } from './remoteRows';

const challenge: ChallengeRecord = {
  id: 'c1',
  name: '20 mil em 2027',
  goal: 20_000,
  type: 'sequential',
  step: 1,
  startDate: '2027-01-01',
  endDate: '2027-12-31',
  theme: 'caderno',
  createdAt: '2026-11-20T10:00:00.000Z',
  updatedAt: '2026-11-20T10:00:00.000Z',
  pendingSync: 1,
};

const cell: CellRecord = {
  id: 'x1',
  challengeId: 'c1',
  value: 37,
  position: 36,
  savedAt: '2027-01-02T09:00:00.000Z',
  stroke: [{ x: 0, y: 0.5 }, { x: 1, y: 0.4 }],
  updatedAt: '2027-01-02T09:00:00.000Z',
  pendingSync: 1,
};

describe('mapeamento local ↔ nuvem', () => {
  it('desafio vai e volta igual (sem a marca de pendente)', () => {
    const remote = challengeToRemote(challenge);
    expect(remote).toMatchObject({ start_date: '2027-01-01', end_date: '2027-12-31', monthly_limit: null, deleted_at: null });
    expect(challengeFromRemote(remote)).toEqual({ ...challenge, pendingSync: 0, monthlyLimit: undefined, deletedAt: undefined });
  });

  it('célula vai e volta igual', () => {
    expect(cellFromRemote(cellToRemote(cell))).toEqual({ ...cell, pendingSync: 0 });
  });

  it('célula não riscada usa null na nuvem', () => {
    const remote = cellToRemote({ ...cell, savedAt: undefined, stroke: undefined });
    expect(remote.saved_at).toBeNull();
    expect(remote.stroke).toBeNull();
    expect(cellFromRemote(remote).savedAt).toBeUndefined();
  });

  it('normaliza o formato de data do Postgres', () => {
    const fromPostgres = challengeFromRemote({ ...challengeToRemote(challenge), updated_at: '2026-11-20T10:00:00+00:00', deleted_at: '2026-12-01T08:30:00.5+00:00' });
    expect(fromPostgres.updatedAt).toBe('2026-11-20T10:00:00.000Z');
    expect(fromPostgres.deletedAt).toBe('2026-12-01T08:30:00.500Z');
  });
});

describe('shouldApplyRemoteVersion', () => {
  it('aplica quando não existe localmente', () => {
    expect(shouldApplyRemoteVersion(undefined, '2027-01-01T00:00:00.000Z')).toBe(true);
  });

  it('aplica quando a nuvem é mais nova ou igual', () => {
    expect(shouldApplyRemoteVersion({ updatedAt: '2027-01-01T00:00:00.000Z' }, '2027-01-02T00:00:00+00:00')).toBe(true);
    expect(shouldApplyRemoteVersion({ updatedAt: '2027-01-01T00:00:00.000Z' }, '2027-01-01T00:00:00+00:00')).toBe(true);
  });

  it('mantém a local quando ela é mais nova', () => {
    expect(shouldApplyRemoteVersion({ updatedAt: '2027-01-03T00:00:00.000Z' }, '2027-01-02T00:00:00+00:00')).toBe(false);
  });
});
