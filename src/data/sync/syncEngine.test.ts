import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import type { ChallengeDraft } from '../../domain/previewChallenge';
import { createChallengeRepository } from '../challengeRepository';
import { openGuardeiDatabase, type GuardeiDatabase } from '../db';
import { createLocalSyncStore } from './localSyncStore';
import type { RemoteCell, RemoteChallenge } from './remoteRows';
import { createSyncEngine, type RemoteStore } from './syncEngine';

type Owned<T> = T & { user_id: string; server_updated_at: string };

/** Nuvem em memória com as mesmas regras do SQL: RLS por dono e "vence o mais recente". */
function createFakeServer() {
  let tick = 0;
  const serverNow = () => new Date(Date.UTC(2030, 0, 1) + ++tick * 1_000).toISOString();
  const challenges = new Map<string, Owned<RemoteChallenge>>();
  const cells = new Map<string, Owned<RemoteCell>>();

  function upsert<T extends { id: string; updated_at: string }>(table: Map<string, Owned<T>>, rows: T[], userId: string) {
    for (const row of rows) {
      const existing = table.get(row.id);
      if (existing && existing.user_id !== userId) throw new Error('new row violates row-level security policy');
      if (existing && Date.parse(row.updated_at) < Date.parse(existing.updated_at)) continue;
      table.set(row.id, { ...row, user_id: userId, server_updated_at: serverNow() });
    }
  }

  function changedSince<T>(table: Map<string, Owned<T>>, userId: string, since: string | undefined): Owned<T>[] {
    return [...table.values()]
      .filter((row) => row.user_id === userId && (!since || row.server_updated_at > since))
      .sort((a, b) => a.server_updated_at.localeCompare(b.server_updated_at));
  }

  return {
    challenges,
    cells,
    remoteFor(account: { userId: string }): RemoteStore {
      return {
        ensureSession: async () => ({ userId: account.userId }),
        upsertChallenges: async (rows) => upsert(challenges, rows, account.userId),
        upsertCells: async (rows) => {
          for (const row of rows) {
            const parent = challenges.get(row.challenge_id);
            if (!parent || parent.user_id !== account.userId) throw new Error('new row violates row-level security policy');
          }
          upsert(cells, rows, account.userId);
        },
        fetchChallengesChangedSince: async (since) => changedSince(challenges, account.userId, since),
        fetchCellsChangedSince: async (since) => changedSince(cells, account.userId, since),
      };
    },
  };
}

function createDevice(server: ReturnType<typeof createFakeServer>, userId: string) {
  const account = { userId };
  const database: GuardeiDatabase = openGuardeiDatabase(`device-${crypto.randomUUID()}`);
  const clock = { now: new Date('2027-01-01T12:00:00.000Z') };
  const repository = createChallengeRepository(
    database,
    () => clock.now,
    () => {},
  );
  const engine = createSyncEngine(createLocalSyncStore(database), server.remoteFor(account));
  return { account, database, clock, repository, sync: () => engine.sync() };
}

const draft: ChallengeDraft = { name: '20 mil', goal: 20_000, type: 'sequential', step: 1, startDate: '2027-01-01', endDate: '2027-12-31' };

let server: ReturnType<typeof createFakeServer>;

beforeEach(() => {
  server = createFakeServer();
});

describe('sincronização', () => {
  it('envia o desafio e as células e limpa as pendências', async () => {
    const phone = createDevice(server, 'ana');
    const challenge = await phone.repository.createChallenge(draft);
    const [first] = await phone.repository.listCells(challenge.id);
    await phone.repository.markCellAsSaved(first!.id, [
      { x: 0, y: 0.5 },
      { x: 1, y: 0.5 },
    ]);

    await phone.sync();

    expect(server.challenges.size).toBe(1);
    expect(server.cells.size).toBe(199);
    expect(server.cells.get(first!.id)?.saved_at).toBe('2027-01-01T12:00:00.000Z');
    expect(await phone.database.challenges.where('pendingSync').equals(1).count()).toBe(0);
    expect(await phone.database.cells.where('pendingSync').equals(1).count()).toBe(0);
  });

  it('outro aparelho da mesma conta recebe tudo, com o risco igual', async () => {
    const phone = createDevice(server, 'ana');
    const challenge = await phone.repository.createChallenge(draft);
    const cells = await phone.repository.listCells(challenge.id);
    await phone.repository.markCellAsSaved(cells[36]!.id, [
      { x: 0.1, y: 0.4 },
      { x: 0.9, y: 0.6 },
    ]);
    await phone.sync();

    const tablet = createDevice(server, 'ana');
    await tablet.sync();

    expect((await tablet.repository.listChallenges()).map((c) => c.name)).toEqual(['20 mil']);
    const tabletCells = await tablet.repository.listCells(challenge.id);
    expect(tabletCells).toHaveLength(199);
    expect(tabletCells[36]).toMatchObject({
      value: 37,
      stroke: [
        { x: 0.1, y: 0.4 },
        { x: 0.9, y: 0.6 },
      ],
    });
  });

  it('não mistura contas diferentes', async () => {
    const ana = createDevice(server, 'ana');
    await ana.repository.createChallenge(draft);
    await ana.sync();

    const bruno = createDevice(server, 'bruno');
    await bruno.sync();
    expect(await bruno.repository.listChallenges()).toEqual([]);
  });

  it('alteração antiga de um aparelho que estava offline não sobrescreve a mais nova', async () => {
    const phone = createDevice(server, 'ana');
    const challenge = await phone.repository.createChallenge(draft);
    await phone.sync();
    const tablet = createDevice(server, 'ana');
    await tablet.sync();
    const [cell] = await phone.repository.listCells(challenge.id);

    // celular (offline) risca às 10h
    phone.clock.now = new Date('2027-02-01T10:00:00.000Z');
    await phone.repository.markCellAsSaved(cell!.id, [
      { x: 0, y: 0.5 },
      { x: 1, y: 0.5 },
    ]);
    // tablet risca e desfaz às 11h, e sincroniza primeiro
    tablet.clock.now = new Date('2027-02-01T11:00:00.000Z');
    await tablet.repository.markCellAsSaved(cell!.id, [
      { x: 0, y: 0.5 },
      { x: 1, y: 0.5 },
    ]);
    await tablet.repository.unmarkCell(cell!.id);
    await tablet.sync();

    // celular volta a ter internet
    await phone.sync();

    expect(server.cells.get(cell!.id)?.saved_at).toBeNull();
    expect((await phone.repository.listCells(challenge.id))[0]?.savedAt).toBeUndefined();
  });

  it('alteração local mais nova não é desfeita pelo que vem da nuvem', async () => {
    const phone = createDevice(server, 'ana');
    const challenge = await phone.repository.createChallenge(draft);
    await phone.sync();
    const tablet = createDevice(server, 'ana');
    await tablet.sync();
    const [cell] = await phone.repository.listCells(challenge.id);

    tablet.clock.now = new Date('2027-02-01T10:00:00.000Z');
    await tablet.repository.markCellAsSaved(cell!.id, [
      { x: 0, y: 0.5 },
      { x: 1, y: 0.5 },
    ]);
    await tablet.sync();

    phone.clock.now = new Date('2027-02-01T12:00:00.000Z');
    await phone.repository.markCellAsSaved(cell!.id, [
      { x: 0, y: 0.3 },
      { x: 1, y: 0.3 },
    ]);
    await phone.sync();
    await tablet.sync();

    expect(server.cells.get(cell!.id)?.stroke).toEqual([
      { x: 0, y: 0.3 },
      { x: 1, y: 0.3 },
    ]);
    expect((await tablet.repository.listCells(challenge.id))[0]?.stroke).toEqual([
      { x: 0, y: 0.3 },
      { x: 1, y: 0.3 },
    ]);
  });

  it('apagar um desafio chega aos outros aparelhos', async () => {
    const phone = createDevice(server, 'ana');
    const challenge = await phone.repository.createChallenge(draft);
    await phone.sync();
    const tablet = createDevice(server, 'ana');
    await tablet.sync();

    phone.clock.now = new Date('2027-03-01T00:00:00.000Z');
    await phone.repository.deleteChallenge(challenge.id);
    await phone.sync();
    await tablet.sync();

    expect(await tablet.repository.listChallenges()).toEqual([]);
    expect(await tablet.repository.listCells(challenge.id)).toEqual([]);
    expect(server.challenges.get(challenge.id)?.deleted_at).toBe('2027-03-01T00:00:00.000Z');
  });

  it('ao entrar numa conta existente, o que foi criado como anônimo vai junto para ela', async () => {
    const oldPhone = createDevice(server, 'ana');
    await oldPhone.repository.createChallenge(draft);
    await oldPhone.sync();

    const newPhone = createDevice(server, 'anonimo-1');
    await newPhone.repository.createChallenge({ ...draft, name: 'Viagem', goal: 5_000 });
    await newPhone.sync();

    newPhone.account.userId = 'ana'; // entrou com o e-mail da conta da Ana
    await newPhone.sync();

    const names = (await newPhone.repository.listChallenges()).map((c) => c.name).sort();
    expect(names).toEqual(['20 mil', 'Viagem']);
    const anaChallengesOnServer = [...server.challenges.values()].filter((row) => row.user_id === 'ana');
    expect(anaChallengesOnServer).toHaveLength(2);

    await oldPhone.sync();
    expect((await oldPhone.repository.listChallenges()).map((c) => c.name).sort()).toEqual(['20 mil', 'Viagem']);
  });

  it('sincronizar de novo sem mudanças não envia nada', async () => {
    const phone = createDevice(server, 'ana');
    await phone.repository.createChallenge(draft);
    await phone.sync();
    const before = [...server.cells.values()].map((row) => row.server_updated_at);
    await phone.sync();
    expect([...server.cells.values()].map((row) => row.server_updated_at)).toEqual(before);
  });
});

describe('localSyncStore.markCellsSynced', () => {
  it('não limpa a pendência se a célula mudou enquanto era enviada', async () => {
    const phone = createDevice(server, 'ana');
    const challenge = await phone.repository.createChallenge(draft);
    const store = createLocalSyncStore(phone.database);
    const sent = await store.listPendingCells();

    phone.clock.now = new Date('2027-01-05T00:00:00.000Z');
    const [first] = await phone.repository.listCells(challenge.id);
    await phone.repository.markCellAsSaved(first!.id, [
      { x: 0, y: 0.5 },
      { x: 1, y: 0.5 },
    ]);

    await store.markCellsSynced(sent);
    expect(await store.listPendingCells()).toHaveLength(1);
  });
});
