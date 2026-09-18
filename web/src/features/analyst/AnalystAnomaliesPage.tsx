import { Screen } from '@/shared/ui/Screen';
import { PageHeader } from '@/shared/ui/PageHeader';
import { StatCard } from '@/shared/ui/StatCard';
import { Button } from '@/shared/ui/Button';
import { callApp } from '@/shared/ui/legacy';
import { AnalystAnomaliesTable } from '@/shared/tables/registry';

export function AnalystAnomaliesPage() {
  return (
    <Screen viewId="view-analyst-anomalies" role="region" aria-label="Détection des Anomalies et Contrôles Risques">
      <PageHeader
        title="Détection des Anomalies & Contrôles Risques"
        crumbs={['Espace Analyste Risque', 'Audit Algorithmique & Rapprochement Automatisé (MALI)']}
        actions={
          <>
            <Button variant="secondary" onClick={() => callApp('runFullAnomalyScan')} title="Lancer un scan global des règles et de l'OCR">
              <i className="fas fa-arrows-rotate text-primary mr-1"></i> Scan Automatisé Temps Réel
            </Button>
            <Button onClick={() => callApp('exportAnomaliesCsv')} title="Télécharger le registre complet des anomalies en CSV">
              <i className="fas fa-file-csv mr-1"></i> Exporter Registre CSV
            </Button>
          </>
        }
      />

      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        <StatCard
          tone="rose"
          icon="fa-triangle-exclamation"
          value="5"
          valueId="anom-kpi-total"
          label="Anomalies Actives Détectées"
          trendUp={false}
          trend={
            <>
              <i className="fas fa-shield-halved"></i> Surveillance Risque
            </>
          }
          ariaLabel="Compteur Anomalies Actives"
        />
        <StatCard
          tone="primary"
          icon="fa-file-lines"
          value="2"
          valueId="anom-kpi-ocr"
          label="Discordances OCR & Pièces"
          trendUp={false}
          trend={
            <>
              <i className="fas fa-receipt"></i> Dates / Montants / Devis
            </>
          }
          ariaLabel="Compteur Discordances OCR"
        />
        <StatCard
          tone="amber"
          icon="fa-calculator"
          value="1"
          valueId="anom-kpi-fin"
          label="Solvabilité & Ratios"
          trendUp={false}
          trend={
            <>
              <i className="fas fa-coins"></i> Reste à vivre sous seuil
            </>
          }
          ariaLabel="Compteur Solvabilité et Ratios"
        />
        <StatCard
          tone="purple"
          icon="fa-network-wired"
          value="1"
          valueId="anom-kpi-multi"
          label="Réseau & Multi-Caisses"
          trendUp={false}
          trend={
            <>
              <i className="fas fa-handshake"></i> Cumul engagements CreditFast
            </>
          }
          ariaLabel="Compteur Réseau et Multi-Caisses"
        />
      </div>

      <AnalystAnomaliesTable />
    </Screen>
  );
}
