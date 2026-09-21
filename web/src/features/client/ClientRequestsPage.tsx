import { Screen } from '@/shared/ui/Screen';
import { Button } from '@/shared/ui/Button';
import { callApp } from '@/shared/ui/legacy';
import { CreditWorkflowBoard } from '@/features/workflow/CreditWorkflowBoard';
import { useCreditRequests } from '@/features/workflow/useCreditRequests';
import { isCommitteeGranted } from '@/features/loans/granted';

export function ClientRequestsPage() {
  const { items } = useCreditRequests('mine');
  const waiting = items.filter((row) => (row.status || '').toUpperCase() === 'VERIFICATION_REQUIRED');
  const granted = items.filter((row) => isCommitteeGranted(row.status));
  const drafts = items.filter((row) => (row.status || '').toUpperCase() === 'DRAFT');

  return (
    <Screen viewId="view-client-requests">
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <i className="fas fa-folder-tree text-primary mr-2"></i> Mes demandes
          </h2>
          <p className="page-subtitle">Suivi de vos dossiers : envoi à l’agent, compléments, puis analyse. Un accord du comité ouvre l’échéancier.</p>
        </div>
        <div className="page-actions">
          <Button onClick={() => callApp('openNewLoanModal')}>
            <i className="fas fa-plus-circle"></i> Déposer une demande
          </Button>
        </div>
      </div>

      {drafts.length ? (
        <div className="card" style={{ marginBottom: '1rem', borderColor: 'rgba(59, 130, 246, 0.35)', background: 'rgba(59, 130, 246, 0.08)' }}>
          <div className="card-body" style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <p style={{ margin: 0, fontSize: '0.86rem' }}>
              {drafts.length} brouillon{drafts.length > 1 ? 's' : ''} non envoyé{drafts.length > 1 ? 's' : ''}. Reprenez pour joindre une pièce et une garantie, puis envoyez à l’agent.
            </p>
            <Button className="btn-sm" onClick={() => callApp('resumeDraftCreditRequest', drafts[0].id)}>
              Reprendre
            </Button>
          </div>
        </div>
      ) : null}

      {granted.length ? (
        <div className="card" style={{ marginBottom: '1rem', borderColor: 'rgba(81, 142, 69, 0.35)', background: 'rgba(81, 142, 69, 0.08)' }}>
          <div className="card-body" style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <p style={{ margin: 0, fontSize: '0.86rem' }}>
              {granted.length} crédit{granted.length > 1 ? 's' : ''} accordé{granted.length > 1 ? 's' : ''} par le comité. L’échéancier à régler est disponible.
            </p>
            <Button className="btn-sm" onClick={() => callApp('switchView', 'view-client-schedule')}>
              Voir l’échéancier
            </Button>
          </div>
        </div>
      ) : null}

      {waiting.length ? (
        <div className="card" style={{ marginBottom: '1rem', borderColor: 'rgba(180, 83, 9, 0.35)', background: 'rgba(255, 152, 0, 0.08)' }}>
          <div className="card-body" style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <p style={{ margin: 0, fontSize: '0.86rem' }}>
              {waiting.length} dossier{waiting.length > 1 ? 's' : ''} en attente de pièces ou de garantie. L’agent a demandé un complément.
            </p>
            <Button className="btn-sm" onClick={() => callApp('openUploadDocumentModal')}>
              Joindre une pièce
            </Button>
          </div>
        </div>
      ) : null}

      <div className="card" style={{ padding: '1rem 1.15rem 1.15rem' }}>
        <CreditWorkflowBoard
          source="mine"
          heading="Mes dossiers"
          onOpen={(id) => {
            const row = items.find((item) => String(item.id) === String(id));
            if (row && isCommitteeGranted(row.status)) {
              callApp('switchView', 'view-client-schedule');
              return;
            }
            callApp('openClientRequestDrawer', id);
          }}
        />
      </div>
    </Screen>
  );
}
