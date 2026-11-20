export interface BrowserEnvironment {
  userAgent: string;
  platform: string;
  maxTouchPoints: number;
  /** Já está aberto como app instalado (tela de início). */
  isStandalone: boolean;
}

function isIosDevice({ userAgent, platform, maxTouchPoints }: BrowserEnvironment): boolean {
  if (/iPhone|iPad|iPod/.test(userAgent)) return true;
  // iPadOS se apresenta como Mac, mas tem toque
  return platform === 'MacIntel' && maxTouchPoints > 1;
}

function isSafari(userAgent: string): boolean {
  return /Safari/.test(userAgent) && !/CriOS|FxiOS|EdgiOS|OPiOS|GSA|Instagram|FBAN|FBAV/.test(userAgent);
}

/** Mostra a dica "Adicionar à Tela de Início" só no Safari do iOS, fora do app instalado. */
export function shouldShowIosInstallHint(environment: BrowserEnvironment): boolean {
  return isIosDevice(environment) && isSafari(environment.userAgent) && !environment.isStandalone;
}

export function readBrowserEnvironment(): BrowserEnvironment {
  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    maxTouchPoints: navigator.maxTouchPoints,
    isStandalone: navigatorWithStandalone.standalone === true || window.matchMedia('(display-mode: standalone)').matches,
  };
}
