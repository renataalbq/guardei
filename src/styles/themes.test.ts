/// <reference types="node" />
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { THEMES } from '../domain/themes';

const css = readFileSync(new URL('./index.css', import.meta.url), 'utf8');

function variablesOfBlock(selectorPattern: RegExp): Set<string> {
  const match = selectorPattern.exec(css);
  if (!match) return new Set();
  const start = css.indexOf('{', match.index);
  const end = css.indexOf('\n}', start);
  return new Set([...css.slice(start, end).matchAll(/^\s*(--[\w-]+)\s*:/gm)].map((m) => m[1]!));
}

const baseVariables = variablesOfBlock(/^:root,\s*\[data-theme='marca-texto'\]/m);

describe('temas (CSS)', () => {
  it('o tema base define as variáveis', () => {
    expect(baseVariables.size).toBeGreaterThan(20);
  });

  it.each(THEMES.map((theme) => theme.id))('o tema "%s" define todas as variáveis do tema base', (themeId) => {
    const variables = themeId === 'marca-texto' ? baseVariables : variablesOfBlock(new RegExp(`^\\[data-theme='${themeId}'\\]`, 'm'));
    const missing = [...baseVariables].filter((name) => !variables.has(name));
    expect(missing).toEqual([]);
  });
});
