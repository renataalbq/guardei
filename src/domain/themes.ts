import type { ThemeId } from './types';

export interface ThemeOption {
  id: ThemeId;
  name: string;
  description: string;
}

export const THEMES: readonly ThemeOption[] = [
  { id: 'marca-texto', name: 'Marca-texto', description: 'Violeta e rosa, risco de marca-texto' },
  { id: 'caderno', name: 'Caderno', description: 'Folha quadriculada e caneta azul' },
  { id: 'escuro', name: 'Escuro', description: 'Fundo noturno e risco neon' },
];

/** Tema dos desafios novos (é também o visual do restante do app). */
export const DEFAULT_THEME: ThemeId = 'marca-texto';

export function isThemeId(value: string): value is ThemeId {
  return THEMES.some((theme) => theme.id === value);
}
