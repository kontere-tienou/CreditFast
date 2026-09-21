import { ROLE_PROFILES, type RoleCode } from '@/app/roles';
import { patchLegacyApp } from '@/app/legacy-runtime';

const SESSION_KEY = 'CREDITFAST_UI_SESSION';
const OPEN_LOAN_MODAL_KEY = 'CREDITFAST_OPEN_LOAN_MODAL';

export type UiSession = {
  identifier: string;
  role: RoleCode;
  token: string;
  name?: string;
  userId?: string;
  email?: string;
  phone?: string;
};

function readStoredSession(storage: Storage): UiSession | null {
  const raw = storage.getItem(SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<UiSession> & { source?: string };
    if (!parsed.identifier || !parsed.token || !parsed.role || !ROLE_PROFILES[parsed.role]) {
      return null;
    }
    return {
      identifier: parsed.identifier,
      role: parsed.role,
      token: parsed.token,
      name: parsed.name,
      userId: parsed.userId,
      email: parsed.email,
      phone: parsed.phone,
    };
  } catch {
    return null;
  }
}

export function getUiSession(): UiSession | null {
  return readStoredSession(window.sessionStorage) ?? readStoredSession(window.localStorage);
}

export function getAccessToken(): string | undefined {
  return getUiSession()?.token;
}

export function setUiSession(session: UiSession, persist = false): void {
  const payload = JSON.stringify(session);
  window.sessionStorage.setItem(SESSION_KEY, payload);
  if (persist) {
    window.localStorage.setItem(SESSION_KEY, payload);
    return;
  }
  window.localStorage.removeItem(SESSION_KEY);
}

export function patchUiSession(patch: Partial<UiSession>): void {
  const current = getUiSession();
  if (!current) {
    return;
  }
  const persist = Boolean(window.localStorage.getItem(SESSION_KEY));
  setUiSession({ ...current, ...patch }, persist);
}

export function clearUiSession(): void {
  window.sessionStorage.removeItem(SESSION_KEY);
  window.localStorage.removeItem(SESSION_KEY);
}

export function queueLoanModal(): void {
  window.sessionStorage.setItem(OPEN_LOAN_MODAL_KEY, '1');
}

export function consumeQueuedLoanModal(): boolean {
  if (window.sessionStorage.getItem(OPEN_LOAN_MODAL_KEY) !== '1') {
    return false;
  }
  window.sessionStorage.removeItem(OPEN_LOAN_MODAL_KEY);
  return true;
}

export function installLegacyAppBridge(navigate: (path: string) => void): void {
  patchLegacyApp(navigate);
}
