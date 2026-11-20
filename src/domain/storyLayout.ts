import { formatCurrency } from './formatCurrency';

export const STORY_WIDTH = 1080;
export const STORY_HEIGHT = 1920;

export interface StoryGridLayout {
  columns: number;
  rows: number;
  cellWidth: number;
  cellHeight: number;
}

/**
 * Escolhe quantas colunas usar para que todas as células caibam na área
 * (largura × altura) com o maior tamanho possível.
 */
export function computeStoryGridLayout(
  cellCount: number,
  areaWidth: number,
  areaHeight: number,
  cellAspectRatio = 1,
  gap = 0,
): StoryGridLayout {
  let best: StoryGridLayout = { columns: 1, rows: cellCount, cellWidth: 0, cellHeight: 0 };
  for (let columns = 1; columns <= cellCount; columns++) {
    const rows = Math.ceil(cellCount / columns);
    const widthLimited = (areaWidth - gap * (columns - 1)) / columns;
    const heightLimited = ((areaHeight - gap * (rows - 1)) / rows) * cellAspectRatio;
    const cellWidth = Math.floor(Math.min(widthLimited, heightLimited));
    if (cellWidth > best.cellWidth) best = { columns, rows, cellWidth, cellHeight: Math.floor(cellWidth / cellAspectRatio) };
  }
  return best;
}

/** Texto que acompanha a imagem ao compartilhar. */
export function buildShareText(savedAmount: number, goal: number): string {
  if (savedAmount >= goal) return `Bati minha meta de ${formatCurrency(goal)}! Risquei todos os números no Guardei.`;
  if (savedAmount === 0) return `Comecei meu desafio de ${formatCurrency(goal)} no Guardei!`;
  return `Já guardei ${formatCurrency(savedAmount)} de ${formatCurrency(goal)} no meu desafio do Guardei!`;
}

/** "20 mil em 2027" → "guardei-20-mil-em-2027.png" */
export function buildShareFileName(challengeName: string): string {
  const slug = challengeName
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  return `guardei${slug ? `-${slug}` : ''}.png`;
}
