import { apiJson } from './client';
import { unwrapCollection } from './admin';

export type AppNotification = {
  id: number;
  title?: string;
  message?: string;
  type?: string;
  is_read?: boolean;
  read_at?: string | null;
  data?: Record<string, unknown> | null;
  created_at?: string;
};

export function notificationTypeLabel(type?: string) {
  const key = (type || '').toUpperCase();
  const labels: Record<string, string> = {
    STATUS_UPDATE: 'Suivi du dossier',
    COMPLEMENTS_REQUESTED: 'Pièces à compléter',
    LOAN_DISBURSED: 'Fonds versés',
    PASSWORD_RESET: 'Mot de passe réinitialisé',
  };
  return labels[key] || type || 'Information';
}

export async function listNotifications() {
  const payload = await apiJson<unknown>('/notifications');
  const items = unwrapCollection<AppNotification>(payload);
  const unread =
    payload && typeof payload === 'object' && typeof (payload as { unread_count?: unknown }).unread_count === 'number'
      ? (payload as { unread_count: number }).unread_count
      : items.filter((item) => !item.is_read).length;
  return { items, unread };
}

export async function getNotification(id: number): Promise<AppNotification | null> {
  const payload = await apiJson<unknown>(`/notifications/${id}`);
  if (!payload || typeof payload !== 'object') {
    return null;
  }
  const record = payload as Record<string, unknown>;
  const nested =
    record.notification && typeof record.notification === 'object'
      ? (record.notification as Record<string, unknown>)
      : record.data && typeof record.data === 'object' && !Array.isArray(record.data)
        ? (record.data as Record<string, unknown>)
        : record;
  return typeof nested.id === 'number' ? (nested as AppNotification) : null;
}

export function markNotificationRead(id: number) {
  return apiJson(`/notifications/${id}/read`, { method: 'POST' });
}

export function deleteNotification(id: number) {
  return apiJson(`/notifications/${id}`, { method: 'DELETE' });
}
