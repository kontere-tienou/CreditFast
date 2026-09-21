import { Screen } from '@/shared/ui/Screen';
import { Button } from '@/shared/ui/Button';
import { callApp } from '@/shared/ui/legacy';

export function ClientAdvisorPage() {
  return (
    <Screen viewId="view-client-advisor">
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <i className="fas fa-headset text-primary mr-2"></i> Mon conseiller
          </h2>
          <p className="page-subtitle">L’assignation d’un chargé de clientèle et l’historique d’échanges viendront de la base.</p>
        </div>
        <div className="page-actions">
          <Button onClick={() => callApp('openAppointmentModal')}>
            <i className="fas fa-calendar-plus"></i> Prendre rendez-vous
          </Button>
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.5rem' }}>Conseiller attitré</h3>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0 }}>
            Aucun conseiller n’est encore rattaché à ce compte. Dès qu’un agent sera lié à votre dossier, ses coordonnées s’afficheront ici.
          </p>
        </div>

        <div className="card" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', minHeight: 360 }}>
          <div className="card-header" style={{ padding: '0.85rem 1.25rem' }}>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 700, margin: 0 }}>Messagerie</h4>
          </div>
          <div id="advisor-chat-messages" style={{ flex: 1, padding: '1.25rem', overflowY: 'auto', background: 'var(--bg-body)' }}>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.84rem' }}>Aucun message en base pour le moment.</p>
          </div>
          <div style={{ padding: '0.85rem 1.25rem', background: 'var(--bg-surface)', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              type="text"
              id="advisor-msg-input"
              className="form-control"
              placeholder="Écrivez un message…"
              style={{ flex: 1, fontSize: '0.85rem' }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  callApp('sendAdvisorMessage');
                }
              }}
            />
            <Button className="btn-sm" onClick={() => callApp('sendAdvisorMessage')}>
              <i className="fas fa-paper-plane"></i> Envoyer
            </Button>
          </div>
        </div>
      </div>
    </Screen>
  );
}
