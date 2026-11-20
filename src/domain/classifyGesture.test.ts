import { describe, expect, it } from 'vitest';
import { classifyGesture } from './classifyGesture';

describe('classifyGesture', () => {
  it('movimento curto ainda não decide (pode ser um toque)', () => {
    expect(classifyGesture(4, 3)).toBe('undecided');
  });

  it('horizontal predominante é risco, para qualquer lado', () => {
    expect(classifyGesture(12, 4)).toBe('scratch');
    expect(classifyGesture(-12, 5)).toBe('scratch');
  });

  it('vertical predominante é rolagem', () => {
    expect(classifyGesture(3, 14)).toBe('scroll');
    expect(classifyGesture(-6, -11)).toBe('scroll');
  });

  it('diagonal exata fica com a rolagem', () => {
    expect(classifyGesture(10, 10)).toBe('scroll');
  });
});
