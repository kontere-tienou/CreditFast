import { Screen } from '@/shared/ui/Screen';
import { PageHeader } from '@/shared/ui/PageHeader';
import { KpiHeroGrid } from '@/shared/ui/KpiHeroGrid';
import { PulseTimeline } from '@/shared/ui/PulseTimeline';
import { ScoreHeroCard } from '@/shared/ui/ScoreHeroCard';
import { StatCard } from '@/shared/ui/StatCard';
import { Button } from '@/shared/ui/Button';
import { callApp } from '@/shared/ui/legacy';
import { CommitteeSessionTable } from '@/shared/tables/registry';

export function CommitteeDashboardPage() {
  return (
    <Screen viewId="view-role-committee">
      <PageHeader
        title="Séance de Délibération du Comité de Crédit"
        crumbs={['Instance Décisionnaire', "Délibérations Collégiales, Vote & Décisions d'Octroi"]}
        actions={
          <>
            <Button variant="primary" className="btn-sm" onClick={() => callApp('switchView', 'view-committee-dossiers')}>
              <i className="fas fa-folder-gavel"></i> Dossiers à Délibérer & Votes
            </Button>
            <Button variant="secondary" className="btn-sm" onClick={() => callApp('switchView', 'view-committee-signed')}>
              <i className="fas fa-file-signature"></i> Procès-Verbaux (PV)
            </Button>
            <Button variant="secondary" className="btn-sm" onClick={() => callApp('switchView', 'view-audit-logs')}>
              <i className="fas fa-clock-rotate-left"></i> Journal d&apos;Audit
            </Button>
          </>
        }
      />

      <KpiHeroGrid>
        <ScoreHeroCard
          chart="bar"
          label="Décisions de séance"
          bars={[
            { label: 'Approuvés', value: 84, color: '#1b4332' },
            { label: 'Réserves', value: 10, color: '#f1ca30' },
            { label: 'Refus', value: 6, color: '#c2410c' },
          ]}
          trend={
            <>
              <i className="fas fa-gavel"></i> Qualité d&apos;octroi
            </>
          }
        />
        <StatCard
          tone="purple"
          icon="fa-scale-balanced"
          value="5"
          label="Dossiers en Séance"
          trendUp={false}
          trend={
            <>
              <i className="fas fa-gavel"></i> Délibération requise
            </>
          }
        />
        <StatCard
          tone="primary"
          icon="fa-vault"
          value="18.5 M"
          label="Volume Total Délibéré"
          trend={
            <>
              <i className="fas fa-check"></i> 5 dossiers
            </>
          }
        />
        <StatCard
          tone="amber"
          icon="fa-stopwatch"
          value="48 h"
          label="Délai Moyen Décision"
          trend={
            <>
              <i className="fas fa-bolt"></i> Objectif &lt; 72h
            </>
          }
        />
      </KpiHeroGrid>

      <PulseTimeline
        title="Parcours de séance"
        steps={[
          { title: 'Convocation', meta: 'Membres', state: 'done' },
          { title: 'Quorum', meta: 'Atteint', state: 'done' },
          { title: 'Dossiers', meta: '5 en main', state: 'done' },
          { title: 'Débat', meta: 'En cours', state: 'active' },
          { title: 'Vote', meta: 'Collégial', state: 'todo' },
          { title: 'PV', meta: 'SHA-256', state: 'todo' },
          { title: 'Agence', meta: 'Notification', state: 'todo' },
        ]}
      />

      <div className="card" style={{ marginTop: '1.25rem' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <i className="fas fa-gavel text-primary"></i> Dossiers Transmis par les Analystes Risque
            </h3>
            <p className="card-subtitle">Cliquez sur une ligne ou sur « Détails » pour afficher le volet d&apos;analyse approfondie</p>
          </div>
          <span className="badge badge-committee">
            <i className="fas fa-circle-dot mr-1 text-emerald"></i> Séance en cours
          </span>
        </div>
        <CommitteeSessionTable />
      </div>
    </Screen>
  );
}
