import { Button } from '@/shared/ui/Button';

export type ConfirmAlertTone = 'primary' | 'danger' | 'warning';

export type ConfirmAlertProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmAlertTone;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

const ICONS: Record<ConfirmAlertTone, string> = {
  primary: 'fa-circle-question',
  danger: 'fa-triangle-exclamation',
  warning: 'fa-triangle-exclamation',
};

export function ConfirmAlert({
  open,
  title,
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  tone = 'primary',
  busy = false,
  onCancel,
  onConfirm,
}: ConfirmAlertProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="cf-app-modal-backdrop"
      style={{ zIndex: 2600 }}
      onClick={(event) => {
        if (event.target === event.currentTarget && !busy) {
          onCancel();
        }
      }}
    >
      <div
        className="cf-app-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="cf-confirm-alert-title"
        aria-describedby="cf-confirm-alert-message"
        onClick={(event) => event.stopPropagation()}
        style={{ maxWidth: 460 }}
      >
        <div className="cf-app-modal-header">
          <div className="cf-app-modal-header-main">
            <div className="cf-app-modal-icon">
              <i className={`fas ${ICONS[tone]}`}></i>
            </div>
            <div>
              <h3 id="cf-confirm-alert-title">{title}</h3>
              <p>Confirmation requise</p>
            </div>
          </div>
          <button type="button" className="cf-app-modal-close" onClick={onCancel} disabled={busy} title="Fermer">
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="cf-app-modal-body">
          <p id="cf-confirm-alert-message" style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.5 }}>
            {message}
          </p>
        </div>
        <div className="cf-app-modal-footer">
          <Button type="button" variant="secondary" disabled={busy} onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button type="button" variant={tone === 'danger' ? 'danger' : tone === 'warning' ? 'warning' : 'primary'} disabled={busy} onClick={onConfirm}>
            {busy ? 'En cours…' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
