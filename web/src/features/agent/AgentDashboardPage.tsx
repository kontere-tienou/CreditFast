import { Screen } from '@/shared/ui/Screen';
import { PageHeader } from '@/shared/ui/PageHeader';
import { StatCard } from '@/shared/ui/StatCard';
import { KpiHeroGrid } from '@/shared/ui/KpiHeroGrid';
import { PulseTimeline } from '@/shared/ui/PulseTimeline';
import { ScoreHeroCard } from '@/shared/ui/ScoreHeroCard';
import { Button } from '@/shared/ui/Button';
import { callApp } from '@/shared/ui/legacy';
import { AgentPipelineTable } from '@/shared/tables/registry';

export function AgentDashboardPage() {
  return (
    <Screen viewId="view-role-agent">
      <PageHeader
        title="Espace Agent de Crédit • Portefeuille & Instruction"
        crumbs={['Opérations Guichet', 'Agence Nyèsigiso Grand Marché (Bamako, Mali • CreditFast)']}
        extra={
          <div className="header-sparkline-widget" id="agent-activity-widget" title="Rythme de soumission des demandes sur les 7 derniers jours">
            <div className="sparkline-meta">
              <div className="sparkline-title">
                <i className="fas fa-chart-line text-primary"></i>
                <span>Tendance d&apos;Activité</span>
              </div>
              <div className="sparkline-stat">
                <span className="sparkline-val">23</span>
                <span className="sparkline-sub">dossiers / 7j</span>
                <span className="sparkline-trend">
                  <i className="fas fa-arrow-trend-up"></i> +18%
                </span>
              </div>
            </div>
            <div className="sparkline-canvas-container">
              <canvas id="agent-activity-sparkline"></canvas>
            </div>
          </div>
        }
        actions={
          <Button onClick={() => callApp('openNewLoanModal')} title="Enregistrer une nouvelle demande de crédit pour un emprunteur">
            <i className="fas fa-file-circle-plus mr-1"></i> Enregistrer Nouvelle Demande
          </Button>
        }
      />

      <KpiHeroGrid>
        <ScoreHeroCard
          chart="bar"
          label="Charge du guichet"
          bars={[
            { label: 'Guichet', value: 42, color: '#1b4332' },
            { label: 'Inspections', value: 8, color: '#f1ca30' },
            { label: 'Pièces', value: 12, color: '#c2410c' },
          ]}
          trend={
            <>
              <i className="fas fa-arrow-up"></i> Semaine en cours
            </>
          }
        />
        <StatCard
          tone="primary"
          icon="fa-inbox"
          value="42"
          label="Dossiers au Guichet"
          onClick={() => callApp('switchView', 'view-role-agent')}
          title="Voir tous les dossiers de financement"
          trend={
            <>
              <i className="fas fa-arrow-up"></i> +8 cette semaine
            </>
          }
        />
        <StatCard
          tone="amber"
          icon="fa-clipboard-check"
          value="8"
          label="Pré-inspections Garanties"
          trendUp={false}
          onClick={() => callApp('switchView', 'view-agent-inspections')}
          title="Accéder aux inspections garanties terrain"
          trend={
            <>
              <i className="fas fa-motorcycle"></i> À visiter sur le terrain
            </>
          }
        />
        <StatCard
          tone="rose"
          icon="fa-triangle-exclamation"
          value="12"
          label="Pièces Manquantes"
          trendUp={false}
          onClick={() => callApp('switchView', 'view-agent-complements')}
          title="Accéder aux pièces manquantes et relances"
          trend={
            <>
              <i className="fas fa-phone"></i> Relances nécessaires
            </>
          }
        />
      </KpiHeroGrid>

      <PulseTimeline
        title="Rythme d’instruction · 7 jours"
        steps={[
          { title: 'Collecte', meta: 'Guichet', state: 'done' },
          { title: 'OCR', meta: 'Pièces', state: 'done' },
          { title: 'Terrain', meta: '3 visites', state: 'active' },
          { title: 'Relance', meta: '12 dossiers', state: 'todo' },
          { title: 'Analyse', meta: 'Transmission', state: 'todo' },
          { title: 'Comité', meta: 'Calé', state: 'todo' },
          { title: 'PV', meta: 'Suivi', state: 'todo' },
        ]}
      />

      <div className="card" style={{ marginTop: '1.25rem' }}>
        <div className="card-header" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
          <div>
            <h3 className="card-title">
              <i className="fas fa-file-invoice-dollar text-primary mr-1"></i> Registre des Demandes de Financement
            </h3>
            <p className="card-subtitle">Instruction Guichet & Terrain • Cliquez sur une ligne pour ouvrir la fiche détaillée du dossier</p>
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <button type="button" id="filter-agent-all" className="btn btn-secondary btn-sm active" onClick={(event) => callApp('filterAgentPipeline', 'ALL', event.currentTarget)}>
              Toutes (<span id="agent-filter-count-all">0</span>)
            </button>
            <button type="button" id="filter-agent-submitted" className="btn btn-secondary btn-sm" onClick={(event) => callApp('filterAgentPipeline', 'SUBMITTED', event.currentTarget)}>
              <i className="fas fa-inbox text-primary"></i> Soumises (<span id="agent-filter-count-submitted">0</span>)
            </button>
            <button type="button" id="filter-agent-review" className="btn btn-secondary btn-sm" onClick={(event) => callApp('filterAgentPipeline', 'REVIEW', event.currentTarget)}>
              <i className="fas fa-hourglass-half text-warning"></i> En Vérification (<span id="agent-filter-count-review">0</span>)
            </button>
            <button type="button" id="filter-agent-approved" className="btn btn-secondary btn-sm" onClick={(event) => callApp('filterAgentPipeline', 'APPROVED', event.currentTarget)}>
              <i className="fas fa-circle-check text-success"></i> Comité / Accordées (<span id="agent-filter-count-approved">0</span>)
            </button>
          </div>
        </div>
        <AgentPipelineTable />
      </div>
    </Screen>
  );
}
