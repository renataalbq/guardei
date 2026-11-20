import { useEffect } from 'react';
import type { ThemeId } from '../domain/types';

/**
 * Aplica o tema do desafio na página inteira (fundo, folhas, barra de status)
 * enquanto ele está aberto, e volta ao visual padrão ao sair.
 */
export function useApplyTheme(theme: ThemeId | undefined) {
  useEffect(() => {
    if (!theme) return;
    const root = document.documentElement;
    const themeColorMeta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    const previousThemeColor = themeColorMeta?.content;

    root.dataset.theme = theme;
    if (themeColorMeta) themeColorMeta.content = getComputedStyle(root).getPropertyValue('--paper').trim() || previousThemeColor || '';

    return () => {
      delete root.dataset.theme;
      if (themeColorMeta && previousThemeColor) themeColorMeta.content = previousThemeColor;
    };
  }, [theme]);
}
