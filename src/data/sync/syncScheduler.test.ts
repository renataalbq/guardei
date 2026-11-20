import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createSyncScheduler } from './syncScheduler';

function createControllableEngine() {
  const calls: Array<() => void> = [];
  return {
    calls,
    engine: {
      sync: vi.fn(() => new Promise<void>((resolve) => calls.push(resolve))),
    },
  };
}

describe('syncScheduler', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('sem nuvem configurada fica desativado', () => {
    const scheduler = createSyncScheduler(null, { isOnline: () => true });
    scheduler.request();
    expect(scheduler.getStatus().state).toBe('disabled');
  });

  it('agrupa pedidos seguidos numa sincronização só', async () => {
    const { engine, calls } = createControllableEngine();
    const scheduler = createSyncScheduler(engine, { isOnline: () => true, debounceMs: 1_000 });
    scheduler.request();
    scheduler.request();
    scheduler.request();
    await vi.advanceTimersByTimeAsync(1_000);
    expect(engine.sync).toHaveBeenCalledTimes(1);
    calls[0]!();
  });

  it('nunca roda duas ao mesmo tempo; o que chegar durante roda depois', async () => {
    const { engine, calls } = createControllableEngine();
    const scheduler = createSyncScheduler(engine, { isOnline: () => true });
    const first = scheduler.runNow();
    void scheduler.runNow();
    void scheduler.runNow();
    expect(engine.sync).toHaveBeenCalledTimes(1);
    expect(scheduler.getStatus().state).toBe('syncing');

    calls[0]!();
    await vi.advanceTimersByTimeAsync(0);
    expect(engine.sync).toHaveBeenCalledTimes(2);
    calls[1]!();
    await first;
    expect(scheduler.getStatus().state).toBe('idle');
    expect(scheduler.getStatus().lastSyncedAt).toBeDefined();
  });

  it('sem internet fica "offline" sem tentar', async () => {
    const { engine } = createControllableEngine();
    const scheduler = createSyncScheduler(engine, { isOnline: () => false });
    await scheduler.runNow();
    expect(engine.sync).not.toHaveBeenCalled();
    expect(scheduler.getStatus().state).toBe('offline');
  });

  it('erro aparece no status e não impede a próxima tentativa', async () => {
    const engine = { sync: vi.fn().mockRejectedValueOnce(new Error('falhou')).mockResolvedValueOnce(undefined) };
    const scheduler = createSyncScheduler(engine, { isOnline: () => true });
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    await scheduler.runNow();
    expect(scheduler.getStatus()).toMatchObject({ state: 'error', errorMessage: 'falhou' });
    await scheduler.runNow();
    expect(scheduler.getStatus().state).toBe('idle');
  });
});
