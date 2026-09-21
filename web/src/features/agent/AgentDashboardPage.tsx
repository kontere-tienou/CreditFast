import { Screen } from '@/shared/ui/Screen';
import { PageHeader } from '@/shared/ui/PageHeader';
import { StatCard } from '@/shared/ui/StatCard';
import { Button } from '@/shared/ui/Button';
import { callApp } from '@/shared/ui/legacy';
import { CreditWorkflowBoard } from '@/features/workflow/CreditWorkflowBoard';
import { useAgentWorkspace } from './useAgentWorkspace';

function lastSevenDayCounts(dates: Array<string | null | undefined>) {
  const buckets = Array.from({ length: 7 }, () => 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  dates.forEach((value) => {
    if (!value) {
      return;
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return;
    }
    date.setHours(0, 0, 0, 0);
    const diff = Math.round((now.getTime() - date.getTime()) / 86400000);
    if (diff >= 0 && diff < 7) {
      buckets[6 - diff] += 1;
    }
  });
  return buckets;
}

function ActivitySparkline({ values }: { values: number[] }) {
  const width = 130;
  const height = 38;
  const max = Math.max(...values, 1);
  const step = values.length > 1 ? width / (values.length - 1) : width;
  const points = values.map((value, index) => {
    const x = index * step;
    const y = height - 4 - (value / max) * (height - 8);
    return `${x},${y}`;
  });
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <polyline fill="none" stroke="#5b4bdb" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" points={points.join(' ')} />
      {values.map((value, index) => {
        const x = index * step;
        const y = height - 4 - (value / max) * (height - 8);
        return <circle key={index} cx={x} cy={y} r={index === values.length - 1 ? 3.2 : 0} fill="#5b4bdb" />;
      })}
    </svg>
  );
}

export function AgentDashboardPage() {
  const { items, complements, pendingGuarantees, clients } = useAgentWorkspace();
  const atCounter = items.filter((row) => {
    const status = (row.status || '').toUpperCase();
    return !['ANALYSIS', 'IN_ANALYSIS', 'PENDING_ANALYSIS', 'COMMITTEE', 'PENDING_COMMITTEE', 'APPROVED', 'REJECTED', 'AMENDED'].includes(status);
  });
  const verifiedKyc = clients.filter((row) => (row.kyc_status || '').toUpperCase() === 'VERIFIED').length;
  const kycShare = clients.length ? Math.round((verifiedKyc / clients.length) * 100) : 0;
  const weekBuckets = lastSevenDayCounts(items.map((row) => row.submitted_at || row.created_at));
  const weekTotal = weekBuckets.reduce((sum, value) => sum + value, 0);

  return (
    <Screen viewId="view-role-agent">
      <PageHeader
        title="Espace Agent de Crédit • Portefeuille & Instruction"
        crumbs={['Opérations Guichet', 'File agent • CreditFast']}
        extra={
          <div className="header-sparkline-widget" title="Dossiers déposés sur les 7 derniers jours">
            <div className="sparkline-meta">
              <div className="sparkline-title">
                <i className="fas fa-chart-line text-primary"></i>
                <span>Tendance d'activité</span>
              </div>
              <div className="sparkline-stat">
                <span className="sparkline-val">{weekTotal}</span>
                <span className="sparkline-sub">dossiers / 7j</span>
              </div>
            </div>
            <div className="sparkline-canvas-container">
              <ActivitySparkline values={weekBuckets} />
            </div>
          </div>
        }
        actions={
          <Button onClick={() => callApp('openNewLoanModal')} title="Enregistrer une nouvelle demande de crédit">
            <i className="fas fa-file-circle-plus mr-1"></i> Enregistrer Nouvelle Demande
          </Button>
        }
      />

      <div className="grid-4">
        <StatCard
          tone="primary"
          icon="fa-inbox"
          value={String(items.length)}
          label="Dossiers au Guichet"
          onClick={() => callApp('switchView', 'view-role-agent')}
          trend={
            <>
              <i className="fas fa-arrow-up"></i> {atCounter.length} à instruire
            </>
          }
        />
        <StatCard
          tone="amber"
          icon="fa-clipboard-check"
          value={String(pendingGuarantees.length)}
          label="Pré-inspections Garanties"
          onClick={() => callApp('switchView', 'view-agent-inspections')}
          trend={
            <>
              <i className="fas fa-motorcycle"></i> À visiter sur le terrain
            </>
          }
          trendUp={false}
        />
        <StatCard
          tone="rose"
          icon="fa-triangle-exclamation"
          value={String(complements.length)}
          label="Pièces Manquantes"
          onClick={() => callApp('switchView', 'view-agent-complements')}
          trend={
            <>
              <i className="fas fa-phone"></i> Relances nécessaires
            </>
          }
          trendUp={false}
        />
        <StatCard
          tone="emerald"
          icon="fa-users"
          value={`${kycShare}%`}
          label="Portefeuille Sociétaires"
          onClick={() => callApp('switchView', 'view-agent-clients')}
          trend={
            <>
              <i className="fas fa-check"></i> {clients.length} membres actifs
            </>
          }
        />
      </div>

      <div className="card" style={{ marginTop: '1.25rem', padding: '1rem 1.15rem 1.15rem' }}>
        <CreditWorkflowBoard source="agent" heading="File guichet" onOpen={(id) => callApp('openAgentDrawer', id)} />
      </div>
    </Screen>
  );
}
