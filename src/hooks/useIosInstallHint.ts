import { useState } from 'react';
import { readBrowserEnvironment, shouldShowIosInstallHint } from '../platform/iosInstallHint';

const DISMISSED_KEY = 'guardei:ios-install-hint-dismissed';

function wasDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISSED_KEY) === '1';
  } catch {
    return false;
  }
}

/** Decide se mostra a dica de instalação no iPhone e lembra quando a pessoa dispensa. */
export function useIosInstallHint() {
  const [isVisible, setIsVisible] = useState(() => !wasDismissed() && shouldShowIosInstallHint(readBrowserEnvironment()));

  function dismiss() {
    setIsVisible(false);
    try {
      localStorage.setItem(DISMISSED_KEY, '1');
    } catch {
      // modo privado do Safari pode bloquear o localStorage; a dica só volta na próxima visita
    }
  }

  return { isVisible, dismiss };
}
