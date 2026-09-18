import { clearUiSession, getAccessToken, setUiSession, type UiSession } from '@/app/session';
import { apiJson } from './client';
import { ApiError, isNetworkError } from './errors';
import { mapApiRole } from './roles';
import type { AuthTokenResponse, ApiUser } from './types';

const LOGIN_TIMEOUT_MS = 25000;

function looksLikeEmail(identifier: string) {
  return identifier.includes('@');
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

  try {
    const payload = looksLikeEmail(value)
      ? await postLogin('/auth/staff/login', { email: value, password })
      : await postLogin('/auth/client/login', { phone: value.replace(/\s+/g, ''), password });
    const session = toApiSession(value, payload);
    setUiSession(session, options.persist);
    return session;
  } catch (error) {
    if (isNetworkError(error)) {
      throw new ApiError('Serveur d’authentification injoignable.', 0);
    }
    throw error;
  }
}

export async function fetchCurrentUser(): Promise<ApiUser> {
  const payload = await apiJson<{ user: ApiUser }>('/auth/me');
  return payload.user;
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
