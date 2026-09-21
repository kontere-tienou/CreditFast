import { clearUiSession, getAccessToken, setUiSession, type UiSession } from '@/app/session';
import { apiJson } from './client';
import { ApiError, isApiError, isNetworkError } from './errors';
import { mapApiRole } from './roles';
import type { AuthTokenResponse, ApiUser } from './types';

const LOGIN_TIMEOUT_MS = 25000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function looksLikeEmail(identifier: string) {
  return EMAIL_PATTERN.test(identifier.trim());
}

/** E.164. Local 8-digit Mali numbers become +223…; other +country values are kept. */
export function normalizePhone(raw: string) {
  const compact = raw
    .trim()
    .replace(/[\s\u00a0()./-]/g, '')
    .replace(/^\uFF0B/, '+')
    .replace(/^00/, '+');

  const digits = compact.startsWith('+') ? compact.slice(1).replace(/\D/g, '') : compact.replace(/\D/g, '');

  if (digits.length < 8) {
    throw new ApiError('Saisissez un numéro de téléphone valide (8 chiffres, ou +223…).', 422);
  }

  if (compact.startsWith('+') || digits.startsWith('223') && digits.length >= 11) {
    return `+${digits}`;
  }

  if (digits.length === 8) {
    return `+223${digits}`;
  }

  return `+${digits}`;
}

function userDisplayName(user: ApiUser, identifier: string) {
  if (user.full_name?.trim()) {
    return user.full_name.trim();
  }
  if (user.name?.trim()) {
    return user.name.trim();
  }
  const assembled = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
  return assembled || user.email || user.phone || identifier;
}

function toApiSession(identifier: string, payload: AuthTokenResponse): UiSession {
  if (!payload.token || !payload.user) {
    throw new ApiError('Réponse d’authentification incomplète (token ou utilisateur manquant).', 502);
  }

  return {
    identifier: payload.user.email || payload.user.phone || identifier,
    role: mapApiRole(payload.user.role),
    token: payload.token,
    name: userDisplayName(payload.user, identifier),
    userId: String(payload.user.id),
    email: payload.user.email ?? undefined,
    phone: payload.user.phone ?? undefined,
  };
}

async function postLogin(path: string, body: Record<string, string>) {
  return apiJson<AuthTokenResponse>(path, {
    method: 'POST',
    skipAuth: true,
    signal: AbortSignal.timeout(LOGIN_TIMEOUT_MS),
    body: JSON.stringify(body),
  });
}

export async function loginWithCredentials(
  identifier: string,
  password: string,
  options: { persist?: boolean } = {},
): Promise<UiSession> {
  const value = identifier.trim();
  const secret = password.trim();

  try {
    const payload = looksLikeEmail(value)
      ? await postLogin('/auth/staff/login', { email: value, password: secret })
      : await postLogin('/auth/client/login', { phone: normalizePhone(value), password: secret });
    const session = toApiSession(value, payload);
    setUiSession(session, options.persist);
    return session;
  } catch (error) {
    if (isNetworkError(error)) {
      throw new ApiError('Serveur d’authentification injoignable.', 0);
    }
    if (isApiError(error) && looksLikeEmail(value)) {
      throw new ApiError(
        'E-mail non reconnu côté équipe. Les clients se connectent avec leur numéro (+223…), pas avec l’e-mail.',
        error.status,
        error.body,
      );
    }
    if (isApiError(error) && error.status === 422) {
      throw new ApiError(
        'Aucun compte client pour ce numéro / mot de passe. Inscrivez-vous, ou faites réinitialiser le mot de passe par un admin.',
        error.status,
        error.body,
      );
    }
    if (isApiError(error)) {
      throw new ApiError(
        error.message || 'Numéro ou mot de passe incorrect.',
        error.status,
        error.body,
      );
    }
    throw error;
  }
}

export async function registerClient(body: {
  first_name: string;
  last_name: string;
  phone: string;
  email?: string;
  password: string;
}) {
  return apiJson('/auth/register', {
    method: 'POST',
    skipAuth: true,
    body: JSON.stringify({
      ...body,
      phone: normalizePhone(body.phone),
    }),
  });
}

export async function fetchCurrentUser(): Promise<ApiUser> {
  const payload = await apiJson<ApiUser | { user: ApiUser }>('/auth/me');
  if (payload && typeof payload === 'object' && 'user' in payload && payload.user) {
    return payload.user;
  }
  return payload as ApiUser;
}

export async function updateOwnPassword(body: {
  current_password: string;
  password: string;
  password_confirmation: string;
}) {
  return apiJson('/auth/password', {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export async function logoutFromApi(): Promise<void> {
  const token = getAccessToken();
  try {
    if (token) {
      await apiJson('/auth/logout', { method: 'POST' });
    }
  } catch {
    // Session is cleared locally even if the API is unreachable.
  } finally {
    clearUiSession();
  }
}
