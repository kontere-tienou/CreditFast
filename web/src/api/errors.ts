import type { ApiErrorBody } from './types';

export class ApiError extends Error {
  status: number;
  body?: ApiErrorBody;

  constructor(message: string, status: number, body?: ApiErrorBody) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) {
    return true;
  }
  if (error instanceof DOMException && error.name === 'AbortError') {
    return true;
  }
  return error instanceof Error && (error.message === 'Failed to fetch' || error.name === 'AbortError');
}
