import { Screen } from '@/shared/ui/Screen';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Button } from '@/shared/ui/Button';
import { callApp } from '@/shared/ui/legacy';
import { StatCard } from '@/shared/ui/StatCard';
import { CreditWorkflowBoard } from '@/features/workflow/CreditWorkflowBoard';
import { formatFcfa } from '@/features/workflow/workflow';
import { useAnalystWorkspace } from './useAnalystWorkspace';

export function AnalystDashboardPage() {
  const { items, loading, reload, inAnalysis, committee, complements, signals } = useAnalystWorkspace();
  const volume = items.reduce((sum, row) => sum + (row.requested_amount ?? 0), 0);

  return (
    <Screen viewId="view-role-analyst">
      <PageHeader
        title="Espace analyste • Instruction des dossiers"
        crumbs={['Analyse crédit', 'Tableau de bord']}
        actions={
          <Button variant="secondary" className="btn-sm" onClick={() => void reload()} disabled={loading}>
            <i className={`fas ${loading ? 'fa-circle-notch fa-spin' : 'fa-rotate'} mr-1`}></i> Actualiser
          </Button>
        }
      />

      <div className="grid-4" style={{ marginBottom: '1.25rem' }}>
        <StatCard
          tone="primary"
          icon="fa-folder-open"
          value={loading ? '…' : String(inAnalysis.length)}
          label="Dossiers en analyse"
          onClick={() => callApp('switchView', 'view-analyst-dossiers')}
          trend={<>{items.length} au total dans la file</>}
        />
        <StatCard
          tone="emerald"
          icon="fa-coins"
          value={loading ? '…' : formatFcfa(volume)}
          label="Montant à instruire"
          trend={<>Somme des montants demandés</>}
        />
        <StatCard
          tone="amber"
          icon="fa-gavel"
          value={loading ? '…' : String(committee.length)}
          label="En attente du comité"
          onClick={() => callApp('switchView', 'view-analyst-dossiers')}
          trend={<>Avis déjà transmis</>}
        />
        <StatCard
          tone="rose"
          icon="fa-triangle-exclamation"
          value={loading ? '…' : String(signals.length || complements.length)}
          label="Points à vérifier"
          trendUp={false}
          onClick={() => callApp('switchView', 'view-analyst-anomalies')}
          trend={<>{complements.length} renvoyé{complements.length > 1 ? 's' : ''} au client</>}
        />
      </div>

      <CreditWorkflowBoard source="analyst" heading="Dossiers à instruire" onOpen={(id) => callApp('openAnalystDossierDrawer', id)} />
    </Screen>
  );
}
