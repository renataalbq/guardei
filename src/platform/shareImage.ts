export type ShareOutcome = 'shared' | 'downloaded' | 'cancelled';

/** Pode compartilhar arquivos pelo menu do sistema (iPhone/Android)? */
export function canShareImageFile(file: File): boolean {
  return typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] });
}

/**
 * Abre o menu de compartilhar do sistema com a imagem (Instagram, WhatsApp…) ou, sem suporte, baixa o arquivo.
 * Precisa ser chamado direto do toque do usuário: o Safari bloqueia `share` depois de esperas longas,
 * por isso a imagem deve estar pronta antes.
 */
export async function shareOrDownloadImage(file: File, text: string): Promise<ShareOutcome> {
  if (canShareImageFile(file)) {
    try {
      await navigator.share({ files: [file], text });
      return 'shared';
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return 'cancelled';
      // NotAllowedError e afins: cai para o download
    }
  }
  downloadFile(file);
  return 'downloaded';
}

export function downloadFile(file: File): void {
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = file.name;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
