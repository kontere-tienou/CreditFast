export const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

export async function apiClient(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');

  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers,
  });
}
