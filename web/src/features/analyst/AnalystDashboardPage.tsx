import { Screen } from '@/shared/ui/Screen';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Button } from '@/shared/ui/Button';
import { callApp, callCharts } from '@/shared/ui/legacy';
import { StatCard } from '@/shared/ui/StatCard';
import { KpiHeroGrid } from '@/shared/ui/KpiHeroGrid';
import { PulseTimeline } from '@/shared/ui/PulseTimeline';
import { ScoreHeroCard } from '@/shared/ui/ScoreHeroCard';

export function AnalystDashboardPage() {
  return (
    <Screen viewId="view-role-analyst">
      <PageHeader
        title="Supervision des Risques & Scoring Explicable"
        crumbs={['CreditFast', 'Supervision Microcrédit', 'Vue Régionale']}
        actions={
          <>
            <Button
              variant="secondary"
              className="btn-sm"
              onClick={() => {
                const db = (window as unknown as { DB?: { reset?: () => void } }).DB;
                db?.reset?.();
                callApp('showToast', 'Données réinitialisées avec succès', 'info');
              }}
            >
              <i className="fas fa-arrows-rotate"></i> Réinitialiser Données
            </Button>
            <Button onClick={() => callApp('openNewLoanModal')}>
              <i className="fas fa-plus"></i> Nouvelle Demande
            </Button>
          </>
        }
      />

      <KpiHeroGrid>
        <ScoreHeroCard
          chart="pie"
          label="Profil de risque"
          display="96.8%"
          caption="Recouvré"
          slices={[
            { label: 'Faible', value: 58, color: '#1b4332' },
            { label: 'Modéré', value: 27, color: '#518e45' },
            { label: 'Élevé', value: 15, color: '#f1ca30' },
          ]}
          trend={
            <>
              <i className="fas fa-check"></i> Seuil prudentiel
            </>
          }
        />
        <StatCard
          tone="primary"
          icon="fa-folder-open"
          value="190"
          label="Demandes Actives"
          trend={
            <>
              <i className="fas fa-arrow-up"></i> +12.5% ce mois
            </>
          }
        />
        <StatCard
          tone="emerald"
          icon="fa-coins"
          value="342.5 M"
          label="Encours Accordé (FCFA)"
          trend={
            <>
              <i className="fas fa-arrow-up"></i> +8.2% vs N-1
            </>
          }
        />
        <StatCard
          tone="rose"
          icon="fa-triangle-exclamation"
          value="5"
          label="Alertes & Anomalies"
          trendUp={false}
          title="Accéder au Registre des Anomalies & Discordances"
          onClick={() => callApp('switchView', 'view-analyst-anomalies')}
          trend={
            <>
              <i className="fas fa-shield-halved"></i> 2 Critiques • Cliquez pour ouvrir
            </>
          }
        />
      </KpiHeroGrid>

      <PulseTimeline
        title="Chaîne d’instruction risque"
        steps={[
          { title: 'Collecte', meta: 'Guichet', state: 'done' },
          { title: 'OCR', meta: 'Contrôle', state: 'done' },
          { title: 'Scoring', meta: 'XAI', state: 'done' },
          { title: 'Anomalies', meta: '5 signaux', state: 'active' },
          { title: 'Avis', meta: 'Analyste', state: 'todo' },
          { title: 'Comité', meta: 'Séance', state: 'todo' },
          { title: 'Suivi', meta: 'Encours', state: 'todo' },
        ]}
      />

      <div className="grid-dashboard-main">
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <i className="fas fa-chart-area text-primary"></i> Évolution des Octrois & Demandes
              </h3>
              <p className="card-subtitle">Volume mensuel en Millions FCFA pour le réseau des coopératives CreditFast</p>
            </div>
            <div className="btn-group">
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => callCharts('renderEvolutionChart', 'evolution-chart-canvas', 'year')}>
                Année
              </button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => callCharts('renderEvolutionChart', 'evolution-chart-canvas', 'month')}>
                Mois
              </button>
            </div>
          </div>
          <div className="card-body" style={{ height: 320 }}>
            <canvas id="evolution-chart-canvas"></canvas>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <i className="fas fa-chart-pie text-emerald"></i> Profil de Risque
              </h3>
              <p className="card-subtitle">Répartition basée sur le moteur de scoring explicable </p>
            </div>
          </div>
          <div className="card-body" style={{ height: 320 }}>
            <canvas id="risk-doughnut-canvas"></canvas>
          </div>
        </div>
      </div>

      <div className="row" style={{ marginTop: '1.25rem' }}>
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <i className="fas fa-globe-africa text-primary"></i> Encours par Quartier de Bamako (CreditFast MALI)
              </h3>
              <span className="badge badge-submitted">Les Ville/Quartiers du Mali </span>
            </div>
            <div className="card-body" style={{ height: 280 }}>
              <canvas id="regional-chart-canvas"></canvas>
            </div>
          </div>
        </div>
      </div>

      <div
        className="card"
        style={{
          marginTop: '1.5rem',
          border: '1px solid var(--border-color)',
          boxShadow: '0 4px 12px -2px rgba(15, 23, 42, 0.05)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
        }}
      >
        <div
          className="card-header"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
            padding: '1.15rem 1.5rem',
            background: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-color)',
          }}
        >
          <div>
            <h3 className="card-title" style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="fas fa-chart-line text-emerald" style={{ fontSize: '1.1rem' }}></i> Indicateurs de Performance & Efficacité Opérationnelle (CreditFast)
            </h3>
            <p className="card-subtitle" style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
              Métriques d&apos;impact pour les coopératives financières CreditFast (Mali - Bamako)
            </p>
          </div>
          <span className="impact-metric-badge green" style={{ fontSize: '0.75rem', padding: '0.35rem 0.8rem' }}>
            <i className="fas fa-circle-check"></i> Modèle Hybride & Responsable
          </span>
        </div>
        <div className="card-body" style={{ padding: '1.35rem 1.5rem', background: 'var(--bg-app)' }}>
          <div className="impact-metric-grid">
            <ImpactCard
              theme="indigo"
              icon="fa-bolt-lightning"
              title="Temps Moyen de Pré-Analyse"
              badge="green"
              badgeLabel="-85% vs manuel"
              value="15 min"
              sub="(au lieu de 48h)"
              bar="85%"
              barFill="linear-gradient(90deg, var(--ds-30), var(--ds-10))"
              desc="Instruction accélérée dès réception des pièces au guichet ou via l'application mobile."
            />
            <ImpactCard
              theme="emerald"
              icon="fa-brain"
              title="Extraction OCR & Cohérence"
              badge="green"
              badgeLabel="Précision Haute"
              value="96.4%"
              sub="de taux de lecture conforme"
              bar="96.4%"
              barFill="linear-gradient(90deg, #518e45, #518e45)"
              desc="Rapprochement instantané cartes NINA, quittances EDM-SA, factures proforma & devis."
            />
            <ImpactCard
              theme="amber"
              icon="fa-shield-halved"
              title="Incohérences & Discordances"
              badge="amber"
              badgeLabel="Alertes Actives"
              value="100%"
              sub="repérées avant comité"
              bar="100%"
              barFill="linear-gradient(90deg, #ff9800, #ffd700)"
              desc="Détection automatique des écarts de montants, doublons et pièces d'identité expirées."
            />
            <ImpactCard
              theme="purple"
              icon="fa-magnifying-glass-chart"
              title="Scoring 100% Explicable"
              badge="purple"
              badgeLabel="Audit Ready"
              value="100%"
              sub="justifié facteur par facteur"
              bar="100%"
              barFill="linear-gradient(90deg, #8b5cf6, #a78bfa)"
              desc="Zéro boîte noire : piliers de solvabilité, ratios d'effort et alertes certifiés pour le comité."
            />
            <ImpactCard
              theme="teal"
              icon="fa-clock-rotate-left"
              title="Temps Économisé / Dossier"
              badge="green"
              badgeLabel="Gain Productivité"
              value="~3h 30"
              sub="par agent et par dossier"
              bar="88%"
              barFill="linear-gradient(90deg, #14b8a6, #2dd4bf)"
              desc="Recentrage du chargé de crédit sur l'accompagnement client, le conseil et les visites terrain."
            />
            <ImpactCard
              theme="blue"
              icon="fa-user-shield"
              title="Supervision Humaine Finale"
              badge="blue"
              badgeLabel="Éthique & RSE"
              value="100%"
              sub="humain dans la boucle"
              bar="100%"
              barFill="linear-gradient(90deg, #3b82f6, #60a5fa)"
              desc="L'IA prépare, contrôle et alerte ; la décision souveraine d'octroi reste 100% humaine."
            />
          </div>
        </div>
      </div>
    </Screen>
  );
}

function ImpactCard({
  theme,
  icon,
  title,
  badge,
  badgeLabel,
  value,
  sub,
  bar,
  barFill,
  desc,
}: {
  theme: string;
  icon: string;
  title: string;
  badge: string;
  badgeLabel: string;
  value: string;
  sub: string;
  bar: string;
  barFill: string;
  desc: string;
}) {
  return (
    <div className={`impact-metric-card theme-${theme}`}>
      <div className="impact-metric-header">
        <div className="impact-metric-title-group">
          <div className={`impact-metric-icon ${theme}`}>
            <i className={`fas ${icon}`}></i>
          </div>
          <span className="impact-metric-title">{title}</span>
        </div>
        <span className={`impact-metric-badge ${badge}`}>{badgeLabel}</span>
      </div>
      <div className="impact-metric-body">
        <div className="impact-metric-value-row">
          <span className={`impact-metric-value ${theme}`}>{value}</span>
          <span className="impact-metric-subvalue">{sub}</span>
        </div>
        <div className="impact-metric-progress-track">
          <div className="impact-metric-progress-bar" style={{ width: bar, background: barFill }}></div>
        </div>
        <p className="impact-metric-desc">{desc}</p>
      </div>
    </div>
  );
}
