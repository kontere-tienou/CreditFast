import { Screen } from '@/shared/ui/Screen';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Button } from '@/shared/ui/Button';
import { StatCard } from '@/shared/ui/StatCard';
import { callApp } from '@/shared/ui/legacy';
import { CreditWorkflowBoard } from '@/features/workflow/CreditWorkflowBoard';
import { formatFcfa } from '@/features/workflow/workflow';
import { useCommitteeWorkspace } from './useCommitteeWorkspace';

export function CommitteeDashboardPage() {
  const { items, loading, reload, pending, decided, volume, approved, rejected } = useCommitteeWorkspace();

  return (
    <Screen viewId="view-role-committee">
      <PageHeader
        title="Espace comité • Décision d’octroi"
        crumbs={['Comité de crédit', 'Tableau de bord']}
        actions={
          <>
            <Button variant="secondary" className="btn-sm" onClick={() => void reload()} disabled={loading}>
              <i className={`fas ${loading ? 'fa-circle-notch fa-spin' : 'fa-rotate'} mr-1`}></i> Actualiser
            </Button>
            <Button className="btn-sm" onClick={() => callApp('openFirstPendingCommitteeVote')}>
              <i className="fas fa-gavel mr-1"></i> Voter le dossier suivant
            </Button>
          </>
        }
      />

      <div className="grid-4" style={{ marginBottom: '1.25rem' }}>
        <StatCard
          tone="purple"
          icon="fa-gavel"
          value={loading ? '…' : String(pending.length)}
          label="À délibérer"
          onClick={() => callApp('switchView', 'view-committee-dossiers')}
          trend={<>{items.length} dossier{items.length > 1 ? 's' : ''} dans la file</>}
        />
        <StatCard
          tone="primary"
          icon="fa-vault"
          value={loading ? '…' : formatFcfa(volume)}
          label="Montant en séance"
          trend={<>Somme des demandes en attente</>}
        />
        <StatCard
          tone="emerald"
          icon="fa-file-signature"
          value={loading ? '…' : String(approved.length)}
          label="Accords"
          onClick={() => callApp('switchView', 'view-committee-signed')}
          trend={<>{decided.length} décision{decided.length > 1 ? 's' : ''} déjà prise{decided.length > 1 ? 's' : ''}</>}
        />
        <StatCard
          tone="rose"
          icon="fa-ban"
          value={loading ? '…' : String(rejected.length)}
          label="Refus"
          trendUp={false}
          trend={<>Dossiers non retenus</>}
        />
      </div>

      <CreditWorkflowBoard
        source="committee"
        heading="Dossiers transmis par l’analyste"
        statusFilter="COMMITTEE"
        onOpen={(id) => callApp('openCommitteeModal', id)}
      />
    </Screen>
  );
}
