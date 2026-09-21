import { clearUiSession, getAccessToken } from '@/app/session';
import { ApiError } from './errors';
import type { ApiErrorBody } from './types';

export const apiBaseUrl = (import.meta.env.VITE_API_URL ?? 'https://creditfast-api.onrender.com/api').replace(/\/$/, '');

type ApiClientOptions = RequestInit & {
  skipAuth?: boolean;
};

async function parseErrorBody(response: Response): Promise<ApiErrorBody | undefined> {
  try {
    return (await response.json()) as ApiErrorBody;
  } catch {
    return undefined;
  }
}

export async function apiClient(path: string, init: ApiClientOptions = {}): Promise<Response> {
  const { skipAuth, headers: initHeaders, ...rest } = init;
  const headers = new Headers(initHeaders);
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  if (rest.body instanceof FormData) {
    headers.delete('Content-Type');
  } else if (rest.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (!skipAuth) {
    const token = getAccessToken();
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...rest,
    headers,
  });

  if (response.status === 401 && !skipAuth) {
    clearUiSession();
  }

  return response;
}

export async function apiBlob(path: string): Promise<{ blob: Blob; contentType: string; filename?: string }> {
  const response = await apiClient(path, {
    headers: { Accept: '*/*' },
  });
  if (!response.ok) {
    const body = await parseErrorBody(response);
    throw new ApiError(body?.message || `Impossible de télécharger le fichier (${response.status})`, response.status, body);
  }
  const disposition = response.headers.get('Content-Disposition') || '';
  const named = disposition.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);
  const blob = await response.blob();
  return {
    blob,
    contentType: response.headers.get('Content-Type') || blob.type || 'application/octet-stream',
    filename: named?.[1] ? decodeURIComponent(named[1].trim()) : undefined,
  };
}

export async function apiJson<T>(path: string, init: ApiClientOptions = {}): Promise<T> {
  const response = await apiClient(path, init);

  if (!response.ok) {
    const body = await parseErrorBody(response);
    const fieldError = body?.errors ? Object.values(body.errors).flat()[0] : undefined;
    throw new ApiError(fieldError || body?.message || `Erreur ${response.status}`, response.status, body);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
