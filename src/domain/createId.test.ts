import { afterEach, describe, expect, it, vi } from 'vitest';
import { createId } from './createId';

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('createId', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('gera UUID v4', () => {
    expect(createId()).toMatch(UUID_V4);
  });

  it('funciona sem crypto.randomUUID (página aberta pelo IP da rede, sem HTTPS)', () => {
    vi.stubGlobal('crypto', { getRandomValues: crypto.getRandomValues.bind(crypto) });
    const ids = new Set(Array.from({ length: 500 }, () => createId()));
    expect(ids.size).toBe(500);
    for (const id of ids) expect(id).toMatch(UUID_V4);
  });
});
