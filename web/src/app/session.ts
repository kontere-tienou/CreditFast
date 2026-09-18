import { VIEW_PATHS, type RoleCode } from '@/app/roles';

const SESSION_KEY = 'CREDITFAST_UI_SESSION';

export type UiSession = {
  identifier: string;
  role: RoleCode;
};

export function getUiSession(): UiSession | null {
  const raw = window.sessionStorage.getItem(SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as UiSession;
  } catch {
    return null;
  }
}

export function setUiSession(session: UiSession): void {
  window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearUiSession(): void {
  window.sessionStorage.removeItem(SESSION_KEY);
}

export function installLegacyAppBridge(navigate: (path: string) => void): void {
  const methods: Record<string, (...args: string[]) => unknown> = {
    switchView: (viewId: string) => {
      const path = VIEW_PATHS[viewId];
      if (path) {
        navigate(path);
      }
    },
    openNewLoanModal: () => navigate('/app/client/wizard'),
    openLogoutConfirmModal: () => {
      clearUiSession();
      navigate('/');
    },
  };

  const app = new Proxy(methods, {
    get(target, prop) {
      if (typeof prop === 'string' && prop in target) {
        return target[prop];
      }

      return () => undefined;
    },
  });

  (window as unknown as { App: typeof app }).App = app;
}
