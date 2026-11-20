import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import type { ChallengeDraft } from '../domain/previewChallenge';
import { openGuardeiDatabase } from './db';
import { createChallengeRepository, type ChallengeRepository } from './challengeRepository';

const draft: ChallengeDraft = {
  name: '  20 mil em 2027 ',
  goal: 20_000,
  type: 'sequential',
  step: 1,
  startDate: '2027-01-01',
  endDate: '2027-12-31',
  monthlyLimit: 1_500,
};

let repository: ChallengeRepository;
let clock: Date;

beforeEach(() => {
  clock = new Date('2027-01-01T12:00:00.000Z');
  repository = createChallengeRepository(openGuardeiDatabase(`test-${crypto.randomUUID()}`), () => clock);
});

describe('challengeRepository', () => {
  it('cria o desafio com as células na ordem', async () => {
    const challenge = await repository.createChallenge(draft);
    expect(challenge).toMatchObject({ name: '20 mil em 2027', goal: 20_000, theme: 'caderno', monthlyLimit: 1_500 });

    const cells = await repository.listCells(challenge.id);
    expect(cells).toHaveLength(199);
    expect(cells.map((cell) => cell.position)).toEqual([...Array(199).keys()]);
    expect(cells.reduce((sum, cell) => sum + cell.value, 0)).toBe(20_000);
  });

  it('salva a meta arredondada pelo step', async () => {
    const challenge = await repository.createChallenge({ ...draft, goal: 1_003, step: 5 });
    expect(challenge.goal).toBe(1_005);
  });

  it('marca e desmarca células guardando o traço', async () => {
    const challenge = await repository.createChallenge(draft);
    const [first, second] = await repository.listCells(challenge.id);
    clock = new Date('2027-01-02T09:00:00.000Z');

    await repository.markCellsAsSaved([
      { cellId: first!.id, stroke: [{ x: 0, y: 0.5 }, { x: 1, y: 0.5 }] },
      { cellId: second!.id, stroke: [{ x: 0, y: 0.4 }, { x: 0.8, y: 0.5 }] },
    ]);
    let cells = await repository.listCells(challenge.id);
    expect(cells[0]).toMatchObject({ savedAt: '2027-01-02T09:00:00.000Z', stroke: [{ x: 0, y: 0.5 }, { x: 1, y: 0.5 }] });
    expect(cells[1]?.savedAt).toBeDefined();

    await repository.unmarkCell(first!.id);
    cells = await repository.listCells(challenge.id);
    expect(cells[0]?.savedAt).toBeUndefined();
    expect(cells[0]?.stroke).toBeUndefined();
  });

  it('não sobrescreve uma célula que já estava riscada', async () => {
    const challenge = await repository.createChallenge(draft);
    const [first] = await repository.listCells(challenge.id);
    await repository.markCellAsSaved(first!.id, [{ x: 0, y: 0.5 }, { x: 1, y: 0.5 }]);
    clock = new Date('2027-02-01T00:00:00.000Z');
    await repository.markCellAsSaved(first!.id, [{ x: 0, y: 0.1 }, { x: 1, y: 0.1 }]);
    const [after] = await repository.listCells(challenge.id);
    expect(after?.stroke?.[0]?.y).toBe(0.5);
  });

  it('lista vários desafios e apaga um com suas células', async () => {
    const first = await repository.createChallenge(draft);
    clock = new Date('2027-01-05T00:00:00.000Z');
    const second = await repository.createChallenge({ ...draft, name: '52 semanas', type: 'weeks52', goal: 10_000 });

    expect((await repository.listChallenges()).map((challenge) => challenge.id)).toEqual([second.id, first.id]);
    await repository.deleteChallenge(first.id);
    expect(await repository.listChallenges()).toHaveLength(1);
    expect(await repository.listCells(first.id)).toEqual([]);
    expect(await repository.listCells(second.id)).toHaveLength(52);
  });
});
