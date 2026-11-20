import { useEffect, useRef, useState } from 'react';
import type { ChallengeProgress } from '../../domain/computeProgress';
import { STORY_HEIGHT, STORY_WIDTH, buildShareFileName, buildShareText } from '../../domain/storyLayout';
import type { Cell, Challenge } from '../../domain/types';
import { renderElementToPng } from '../../platform/renderElementToPng';
import { canShareImageFile, downloadFile, shareOrDownloadImage } from '../../platform/shareImage';
import { BottomSheet } from '../ui/BottomSheet';
import { Icon } from '../ui/Icon';
import { StoryCard } from './StoryCard';

interface ShareStorySheetProps {
  challenge: Challenge;
  cells: Cell[];
  progress: ChallengeProgress;
  onClose: () => void;
}

type ImageState = { status: 'rendering' } | { status: 'ready'; file: File; previewUrl: string } | { status: 'failed' };

/**
 * Gera a imagem assim que abre (o Safari só deixa compartilhar logo após o toque,
 * então a imagem precisa estar pronta antes do botão), mostra a prévia e compartilha ou baixa.
 */
export function ShareStorySheet({ challenge, cells, progress, onClose }: ShareStorySheetProps) {
  const storyRef = useRef<HTMLDivElement>(null);
  const [image, setImage] = useState<ImageState>({ status: 'rendering' });
  const [notice, setNotice] = useState<string | undefined>();
  // a arte usa os dados do momento em que a folha abriu
  const [snapshot] = useState(() => ({ challenge, cells, progress }));
  const shareText = buildShareText(snapshot.progress.savedAmount, snapshot.progress.goal);

  useEffect(() => {
    let cancelled = false;
    let previewUrl: string | undefined;
    (async () => {
      try {
        const blob = await renderElementToPng(storyRef.current!, { width: STORY_WIDTH, height: STORY_HEIGHT });
        if (cancelled) return;
        const file = new File([blob], buildShareFileName(snapshot.challenge.name), { type: 'image/png' });
        previewUrl = URL.createObjectURL(blob);
        setImage({ status: 'ready', file, previewUrl });
      } catch (error) {
        console.error('Falha ao gerar a imagem do story', error);
        if (!cancelled) setImage({ status: 'failed' });
      }
    })();
    return () => {
      cancelled = true;
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [snapshot]);

  async function handleShare() {
    if (image.status !== 'ready') return;
    const outcome = await shareOrDownloadImage(image.file, shareText);
    if (outcome === 'downloaded') setNotice('Imagem baixada! Agora é só postar no seu story.');
    if (outcome === 'shared') onClose();
  }

  const canShare = image.status === 'ready' && canShareImageFile(image.file);

  return (
    <BottomSheet open title="Compartilhar progresso" onClose={onClose}>
      {/* Arte em tamanho real, fora da tela, usada para gerar a imagem. */}
      <div aria-hidden="true" style={{ position: 'fixed', left: -100_000, top: 0, pointerEvents: 'none' }}>
        <StoryCard ref={storyRef} challenge={snapshot.challenge} cells={snapshot.cells} progress={snapshot.progress} />
      </div>

      <div className="mx-auto aspect-[9/16] w-full max-w-[15rem] overflow-hidden rounded-3xl bg-ink-soft shadow-[var(--shadow-card)]">
        {image.status === 'ready' ? (
          <img src={image.previewUrl} alt="Prévia da imagem para o story" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center text-sm font-semibold text-muted">
            {image.status === 'rendering' ? (
              <>
                <span className="h-8 w-8 animate-spin rounded-full border-4 border-ink/20 border-t-ink" />
                Preparando sua imagem…
              </>
            ) : (
              'Não foi possível gerar a imagem. Feche e tente de novo.'
            )}
          </div>
        )}
      </div>

      {notice && <p className="mt-4 text-center text-sm font-semibold text-money-fg">{notice}</p>}

      <div className="mt-5 flex flex-col gap-2">
        <button
          type="button"
          disabled={image.status !== 'ready'}
          onClick={() => void handleShare()}
          className="btn-primary w-full py-4 text-lg"
        >
          <Icon name="share" /> {canShare ? 'Compartilhar' : 'Baixar imagem'}
        </button>
        {canShare && image.status === 'ready' && (
          <button
            type="button"
            onClick={() => {
              downloadFile(image.file);
              setNotice('Imagem salva!');
            }}
            className="rounded-2xl bg-ink-soft py-3.5 font-bold text-ink active:scale-[0.97]"
          >
            Salvar imagem
          </button>
        )}
      </div>
    </BottomSheet>
  );
}
