import { Screen } from '@/shared/ui/Screen';
import { Button } from '@/shared/ui/Button';
import { callApp } from '@/shared/ui/legacy';
import { ClientRequestsTable } from '@/shared/tables/registry';

export function ClientRequestsPage() {
  return (
    <Screen viewId="view-client-requests">
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <i className="fas fa-folder-tree text-primary mr-2"></i> Mes Demandes de Prêt & Dossiers
          </h2>
          <p className="page-subtitle">Suivi en temps réel de l&apos;état d&apos;instruction de vos dossiers de microcrédit CreditFast</p>
        </div>
        <div className="page-actions">
          <Button onClick={() => callApp('openNewLoanModal')}>
            <i className="fas fa-plus-circle"></i> Déposer une Nouvelle Demande
          </Button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="borrower-metric-icon" style={{ background: 'var(--primary-50)', color: 'var(--primary-600)', width: 44, height: 44, fontSize: '1.2rem' }}>
              <i className="fas fa-hourglass-half"></i>
            </div>
            <div>
              <h3 className="card-title" style={{ marginBottom: 2 }}>
                Dossier Actif : #REQ-2026-0891
              </h3>
              <p className="card-subtitle">Achat de stock tissus wax pour la fête de Tabaski • Déposé le 11/08/2026</p>
            </div>
          </div>
          <div>
            <span className="badge badge-analysis" style={{ fontSize: '0.8rem', padding: '6px 14px' }}>
              <i className="fas fa-spinner fa-spin mr-1"></i> Revue Analyste Risque
            </span>
          </div>
        </div>
        <div className="card-body">
          <div className="grid-4" style={{ marginBottom: '1.5rem', background: 'var(--bg-body)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 700 }}>Montant Demandé</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-700)', fontFamily: 'var(--font-family-code)' }}>2 500 000 FCFA</div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 700 }}>Durée de Remboursement</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>12 Mois</div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 700 }}>Mensualité Estimée</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-family-code)' }}>235 000 FCFA</div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 700 }}>Agence Instructrice</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Grand Marché Bamako (Mali)</div>
            </div>
          </div>

          <div className="loan-progress-stepper" style={{ marginBottom: '1.25rem' }}>
            <LoanStep completed label="1. Demande Déposée" meta="11/08/2026 à 10:14" />
            <LoanStep completed label="2. Contrôle Pièces & OCR" meta="11/08/2026 à 14:30" />
            <LoanStep completed label="3. Reste à Vivre Conforme" meta="12/08/2026 à 09:05" />
            <LoanStep active label="4. Revue Finale Analyste" meta="En cours (Score: 78/100)" metaColor="var(--primary-600)" />
            <LoanStep number="5" label="5. Décision Comité" meta="Prévu le 20/08/2026" />
            <LoanStep number="6" label="6. Déblocage & Quittance" meta="Virement / Mobile Money" />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', flexWrap: 'wrap' }}>
            <Button variant="secondary" onClick={() => callApp('openDossier360', 'REQ-2026-0891')}>
              <i className="fas fa-file-invoice"></i> Voir Récapitulatif 360°
            </Button>
            <Button variant="secondary" onClick={() => callApp('switchView', 'view-client-documents')}>
              <i className="fas fa-paperclip"></i> Justificatifs Associés (4)
            </Button>
            <Button onClick={() => callApp('switchView', 'view-client-advisor')}>
              <i className="fas fa-comment-dots"></i> Poser une question à mon conseiller
            </Button>
          </div>
        </div>
      </div>

      <ClientRequestsTable />
    </Screen>
  );
}

function LoanStep({
  completed,
  active,
  number,
  label,
  meta,
  metaColor,
}: {
  completed?: boolean;
  active?: boolean;
  number?: string;
  label: string;
  meta: string;
  metaColor?: string;
}) {
  const className = ['loan-step-node', completed ? 'completed' : '', active ? 'active' : ''].filter(Boolean).join(' ');
  return (
    <div className={className}>
      <div className="dot">{completed ? <i className="fas fa-check"></i> : active ? <i className="fas fa-spinner fa-spin"></i> : number}</div>
      <div className="label">{label}</div>
      <div style={{ fontSize: '0.68rem', color: metaColor ?? 'var(--text-subtle)', fontWeight: active ? 700 : undefined }}>{meta}</div>
    </div>
  );
}
