import { toBlob } from 'html-to-image';

interface RenderOptions {
  width: number;
  height: number;
}

/**
 * Transforma um elemento da página numa imagem PNG.
 * O Safari às vezes gera a primeira imagem sem fontes/SVGs carregados; por isso renderiza duas vezes
 * e usa a segunda (contorno conhecido do html-to-image).
 */
export async function renderElementToPng(element: HTMLElement, { width, height }: RenderOptions): Promise<Blob> {
  const options = {
    width,
    height,
    canvasWidth: width,
    canvasHeight: height,
    pixelRatio: 1,
    cacheBust: true,
    // o elemento fica fora da tela; na imagem ele precisa estar na origem
    style: { transform: 'none', left: '0', top: '0', margin: '0' },
  };
  await document.fonts.ready;
  await toBlob(element, options);
  const blob = await toBlob(element, options);
  if (!blob) throw new Error('Não foi possível gerar a imagem.');
  return blob;
}
