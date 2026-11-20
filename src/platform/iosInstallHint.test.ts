import { describe, expect, it } from 'vitest';
import { shouldShowIosInstallHint } from './iosInstallHint';

const iphoneSafari =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1';
const iphoneChrome =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/131.0 Mobile/15E148 Safari/604.1';
const ipadSafari =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15';
const androidChrome =
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36';

const base = { platform: 'iPhone', maxTouchPoints: 5, isStandalone: false };

describe('shouldShowIosInstallHint', () => {
  it('mostra no Safari do iPhone fora do app instalado', () => {
    expect(shouldShowIosInstallHint({ ...base, userAgent: iphoneSafari })).toBe(true);
  });

  it('mostra no Safari do iPad (que se apresenta como Mac)', () => {
    expect(shouldShowIosInstallHint({ ...base, platform: 'MacIntel', userAgent: ipadSafari })).toBe(true);
  });

  it('não mostra no Mac de verdade', () => {
    expect(shouldShowIosInstallHint({ ...base, platform: 'MacIntel', maxTouchPoints: 0, userAgent: ipadSafari })).toBe(false);
  });

  it('não mostra se já está instalado', () => {
    expect(shouldShowIosInstallHint({ ...base, userAgent: iphoneSafari, isStandalone: true })).toBe(false);
  });

  it('não mostra em outros navegadores ou no Android', () => {
    expect(shouldShowIosInstallHint({ ...base, userAgent: iphoneChrome })).toBe(false);
    expect(shouldShowIosInstallHint({ ...base, platform: 'Linux armv8l', userAgent: androidChrome })).toBe(false);
  });
});
