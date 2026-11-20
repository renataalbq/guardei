import { useIosInstallHint } from '../../hooks/useIosInstallHint';
import { Icon } from './Icon';

export function IosInstallHint() {
  const { isVisible, dismiss } = useIosInstallHint();
  if (!isVisible) return null;

  return (
    <aside aria-label="Instalar o Guardei" className="card relative p-4 pr-10 text-sm text-fg">
      <p className="font-display text-base font-bold">Instale o Guardei no seu iPhone</p>
      <p className="mt-1 text-muted">
        Toque em <Icon name="share" className="inline align-text-bottom text-base text-ink" /> <strong>Compartilhar</strong> na barra do
        Safari e depois em <strong>Adicionar à Tela de Início</strong>. Ele abre como app e funciona sem internet.
      </p>
      <button type="button" onClick={dismiss} aria-label="Fechar dica" className="absolute top-2 right-2 rounded-full p-2 text-muted">
        <Icon name="close" />
      </button>
    </aside>
  );
}
