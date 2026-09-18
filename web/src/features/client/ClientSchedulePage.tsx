import { Screen } from '@/shared/ui/Screen';
import { Button } from '@/shared/ui/Button';
import { callApp, callInteractions } from '@/shared/ui/legacy';
import { ClientScheduleTable } from '@/shared/tables/registry';

export function ClientSchedulePage() {
  return (
    <Screen viewId="view-client-schedule">
      <div className="page-header" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <h2 className="page-title">
            <i className="fas fa-calendar-days text-primary mr-2"></i> Mon Échéancier de Remboursement Réel
          </h2>
          <p className="page-subtitle">Prêt Actif N° REQ-2025-0412 / Contrat CF-DKR-8821 • </p>
        </div>
        <div className="page-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          <Button variant="secondary" onClick={() => callApp('showToast', 'Génération du relevé complet au format PDF en cours...', 'info')}>
            <i className="fas fa-file-pdf text-danger"></i> <span className="hide-xs">Télécharger le</span> Relevé PDF
          </Button>
          <Button variant="success" onClick={() => callApp('openClientPaymentModal')}>
            <i className="fas fa-wallet"></i> Payer une Échéance
          </Button>
        </div>
      </div>

      <div className="schedule-grid-responsive">
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 700 }}>Progression du Prêt</div>
              <div id="schedule-metric-progress-text" style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary-700)', fontFamily: 'var(--font-family-code)' }}>
                2 / 12 Mensualités
              </div>
            </div>
            <span id="schedule-metric-progress-badge" className="badge badge-approved">
              <i className="fas fa-check"></i> 16.7% Payé
            </span>
          </div>
          <div style={{ width: '100%', height: 10, background: 'var(--bg-body)', borderRadius: 'var(--radius-full)', overflow: 'hidden', border: '1px solid var(--border-color)', marginBottom: '0.5rem' }}>
            <div
              id="schedule-metric-progress-bar"
              style={{ width: '16.7%', height: '100%', background: 'linear-gradient(90deg, var(--cif-emerald-500), var(--cif-emerald-600))', borderRadius: 'var(--radius-full)' }}
            ></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-subtle)' }}>
            <span>
              Remboursé : <strong id="schedule-metric-paid">470 000 FCFA</strong>
            </span>
            <span>
              Restant : <strong id="schedule-metric-remaining">2 030 000 FCFA</strong>
            </span>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 700 }}>Prochaine Échéance N° 3</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--cif-gold-700)', fontFamily: 'var(--font-family-code)' }}>235 000 FCFA</div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 4 }}>
                <i className="far fa-calendar text-gold mr-1"></i> Date limite : <strong>05 Septembre 2026</strong>
              </div>
            </div>
            <Button variant="warning" className="btn-sm" onClick={() => callApp('openClientPaymentModal', 3, 235000)}>
              <i className="fas fa-credit-card"></i> Régler
            </Button>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 700 }}>Épargne Nantie Sécurisée</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--cif-emerald-700)', fontFamily: 'var(--font-family-code)' }}>500 000 FCFA</div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 4 }}>
                <i className="fas fa-lock text-emerald mr-1"></i> Garantie bloquée à 20% du prêt
              </div>
            </div>
            <div
              className="borrower-metric-icon"
              style={{
                background: 'var(--cif-emerald-50)',
                color: 'var(--cif-emerald-600)',
                width: 38,
                height: 38,
                fontSize: '1.1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <i className="fas fa-shield-halved"></i>
            </div>
          </div>
        </div>
      </div>

      <div className="card schedule-quickpay-card">
        <div className="card-body schedule-quickpay-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-lg)',
                background: 'var(--cif-primary-600)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.3rem',
                flexShrink: 0,
              }}
            >
              <i className="fas fa-mobile-screen-button"></i>
            </div>
            <div>
              <h4 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: 2 }}>PaiementMobile Money</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Paiement instantané sans déplacement • Quittance numérique et SMS immédiat</p>
            </div>
          </div>
          <div className="schedule-momo-buttons">
            <MomoButton label="Orange Money" color="#ff7900" />
            <MomoButton label="Wave" color="#1dc5d8" />
            <MomoButton label="Moov Money" color="#005ba4" />
            <MomoButton label="MTN MoMo" color="#ffcc00" />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
          <div>
            <h3 className="card-title">
              <i className="fas fa-list-ol text-primary mr-1"></i> Échéancier de Remboursement (12 Mois)
            </h3>
            <p className="card-subtitle">Montant : 2 500 000 FCFA • Cliquez sur une ligne pour voir le détail complet</p>
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <button type="button" id="filter-sched-all" className="btn btn-secondary btn-sm active" onClick={(event) => callInteractions('filterScheduleTable', 'ALL', event.currentTarget)}>
              Toutes (12)
            </button>
            <button type="button" id="filter-sched-paid" className="btn btn-secondary btn-sm" onClick={(event) => callInteractions('filterScheduleTable', 'PAID', event.currentTarget)}>
              <i className="fas fa-circle-check text-success"></i> Payées (2)
            </button>
            <button type="button" id="filter-sched-due" className="btn btn-secondary btn-sm" onClick={(event) => callInteractions('filterScheduleTable', 'DUE', event.currentTarget)}>
              <i className="fas fa-clock text-warning"></i> Exigibles (1)
            </button>
            <button type="button" id="filter-sched-upcoming" className="btn btn-secondary btn-sm" onClick={(event) => callInteractions('filterScheduleTable', 'UPCOMING', event.currentTarget)}>
              À venir (9)
            </button>
          </div>
        </div>
        <ClientScheduleTable />
      </div>
    </Screen>
  );
}

function MomoButton({ label, color }: { label: string; color: string }) {
  return (
    <button
      type="button"
      className="btn btn-secondary btn-sm"
      onClick={() => callApp('triggerMobileMoneyPayment', label)}
      style={{ background: 'var(--bg-surface)', borderColor: color }}
    >
      <span style={{ display: 'inline-block', width: 8, height: 8, background: color, borderRadius: '50%', marginRight: 4 }}></span> {label}
    </button>
  );
}
