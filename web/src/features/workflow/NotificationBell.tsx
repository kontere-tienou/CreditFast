import { useEffect, useRef, useState } from 'react';
import { toast } from '@heroui/react';
import {
  deleteNotification,
  getNotification,
  listNotifications,
  markNotificationRead,
  notificationTypeLabel,
  type AppNotification,
} from '@/api/notifications';
import { isApiError } from '@/api/errors';
import { getUiSession } from '@/app/session';
import { formatDate, REQUESTS_CHANGED_EVENT } from './workflow';

function formatDateTime(value?: string | null) {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return formatDate(value);
  }
  return date.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
}

function targetViewFor(item: AppNotification): { view: string; label: string } | null {
  const type = (item.type || '').toUpperCase();
  const text = `${item.title || ''} ${item.message || ''}`.toLowerCase();
  if (type === 'COMPLEMENTS_REQUESTED' || text.includes('complément') || text.includes('pièce')) {
    return { view: 'view-client-documents', label: 'Joindre une pièce' };
  }
  if (type === 'LOAN_DISBURSED' || text.includes('décaiss') || text.includes('échéanc')) {
    return { view: 'view-client-schedule', label: 'Voir l’échéancier' };
  }
  if (type === 'STATUS_UPDATE' || text.includes('dossier') || text.includes('demande')) {
    return { view: 'view-client-requests', label: 'Voir mes demandes' };
  }
  return null;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [detail, setDetail] = useState<AppNotification | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  const reload = async () => {
    try {
      const payload = await listNotifications();
      setItems(payload.items.slice(0, 12));
      setUnread(payload.unread);
    } catch {
      setItems([]);
    }
  };

  useEffect(() => {
    void reload();
    const timer = window.setInterval(() => void reload(), 45000);
    const onChange = () => void reload();
    window.addEventListener(REQUESTS_CHANGED_EVENT, onChange);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener(REQUESTS_CHANGED_EVENT, onChange);
    };
  }, []);

  useEffect(() => {
    if (!open) {
      setActiveId(null);
      setDetail(null);
      return;
    }
    const onPointer = (event: MouseEvent) => {
      if (!boxRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointer);
    return () => document.removeEventListener('mousedown', onPointer);
  }, [open]);

  const openDetail = async (item: AppNotification) => {
    if (activeId === item.id) {
      setActiveId(null);
      setDetail(null);
      return;
    }
    setActiveId(item.id);
    setDetail(item);
    if (!item.is_read) {
      void markNotificationRead(item.id).then(() => void reload()).catch(() => undefined);
    }
    try {
      const full = await getNotification(item.id);
      if (full) {
        setDetail((current) => (current?.id === item.id ? { ...item, ...full, is_read: true } : current));
      }
    } catch {
      // le résumé de la liste suffit si le détail est indisponible
    }
  };

  const remove = async (id: number) => {
    try {
      await deleteNotification(id);
      setItems((rows) => rows.filter((row) => row.id !== id));
      if (activeId === id) {
        setActiveId(null);
        setDetail(null);
      }
      void reload();
    } catch (error) {
      toast.danger(isApiError(error) ? error.message : 'Impossible de retirer cette notification.');
    }
  };

  const goTo = (view: string) => {
    window.App?.switchView?.(view);
    setOpen(false);
  };

  return (
    <div ref={boxRef} style={{ position: 'relative' }}>
      <button
        className="topbar-action-btn"
        title="Centre de Notifications"
        type="button"
        style={{ position: 'relative' }}
        onClick={() => {
          setOpen((was) => !was);
          if (!open) {
            void reload();
          }
        }}
      >
        <i className="fas fa-bell"></i>
        {unread > 0 ? <span className="cf-notif-badge">{unread > 9 ? '9+' : unread}</span> : null}
      </button>
      {open ? (
        <div className="cf-notif-panel">
          <div className="cf-notif-panel-head">Notifications</div>
          {items.length === 0 ? (
            <p className="cf-notif-empty">Aucune notification.</p>
          ) : (
            <ul className="cf-notif-list">
              {items.map((item) => {
                const isActive = activeId === item.id;
                const shown = isActive && detail ? detail : item;
                const target = getUiSession()?.role === 'CLIENT' ? targetViewFor(shown) : null;
                return (
                  <li key={item.id}>
                    <div className="cf-notif-row">
                      <button
                        type="button"
                        className={`cf-notif-item${item.is_read ? '' : ' is-unread'}`}
                        aria-expanded={isActive}
                        onClick={() => void openDetail(item)}
                      >
                        <strong>{item.title || notificationTypeLabel(item.type)}</strong>
                        <span>{item.message || ''}</span>
                      </button>
                      <button
                        type="button"
                        className="cf-notif-remove"
                        title="Retirer cette notification"
                        aria-label="Retirer cette notification"
                        onClick={(event) => {
                          event.stopPropagation();
                          void remove(item.id);
                        }}
                      >
                        <i className="fas fa-xmark"></i>
                      </button>
                    </div>
                    {isActive ? (
                      <div className="cf-notif-detail">
                        <strong>{shown.title || notificationTypeLabel(shown.type)}</strong>
                        <p>{shown.message || 'Aucun détail supplémentaire.'}</p>
                        <small>
                          {notificationTypeLabel(shown.type)}
                          {shown.created_at ? ` · ${formatDateTime(shown.created_at)}` : ''}
                        </small>
                        <div className="cf-notif-detail-actions">
                          {target ? (
                            <button type="button" className="btn btn-primary btn-xs" onClick={() => goTo(target.view)}>
                              {target.label}
                            </button>
                          ) : null}
                          <button type="button" className="btn btn-secondary btn-xs" onClick={() => void remove(item.id)}>
                            <i className="fas fa-trash-can"></i> Retirer
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
