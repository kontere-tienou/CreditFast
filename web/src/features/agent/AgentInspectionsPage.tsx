import { Screen } from '@/shared/ui/Screen';
import { PageHeader } from '@/shared/ui/PageHeader';
import { StatCard } from '@/shared/ui/StatCard';
import { Button } from '@/shared/ui/Button';
import { callApp } from '@/shared/ui/legacy';
import { AgentInspectionsTable } from '@/shared/tables/registry';

export function AgentInspectionsPage() {
  return (
    <Screen viewId="view-agent-inspections">
      <PageHeader
        title={
          <>
            <i className="fas fa-clipboard-check text-warning mr-2"></i> Inspections & Visites Terrain des Garanties
          </>
        }
        crumbs={['Espace Agent de Crédit', 'Contrôle Physique & Valorisation des Actifs CreditFast']}
        actions={
          <>
            <Button variant="secondary" onClick={() => callApp('openQrScannerModal', 'guarantee')} title="Scanner le QR Code d'un certificat de gage ou d'une carte grise">
              <i className="fas fa-qrcode text-primary mr-1"></i> Scanner Gage QR
            </Button>
            <Button onClick={() => callApp('openNewInspectionModal')}>
              <i className="fas fa-plus-circle mr-1"></i> Planifier une Visite Terrain
            </Button>
          </>
        }
      />

      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        <StatCard
          tone="amber"
          icon="fa-motorcycle"
          value="3"
          valueId="insp-kpi-pending"
          label="Visites Terrain à Réaliser"
          trendUp={false}
          trend={
            <>
              <i className="fas fa-clock"></i> 2 prévues aujourd&apos;hui
            </>
          }
        />
        <StatCard
          tone="emerald"
          icon="fa-shield-halved"
          value="14.6M"
          valueId="insp-kpi-verified"
          label="Valeur Garanties Vérifiées"
          trend={
            <>
              <i className="fas fa-arrow-up"></i> 100% conformes{' '}
            </>
          }
        />
        <StatCard
          tone="primary"
          icon="fa-scale-balanced"
          value="138%"
          valueId="insp-kpi-ratio"
          label="Couverture Moyenne / Prêt"
          trend={
            <>
              <i className="fas fa-check-double"></i> Au-dessus du seuil (120%)
            </>
          }
        />
        <StatCard
          tone="rose"
          icon="fa-triangle-exclamation"
          value="1"
          valueId="insp-kpi-anomalies"
          label="Écart de Valorisation"
          trendUp={false}
          trend={
            <>
              <i className="fas fa-magnifying-glass"></i> À contre-expertiser
            </>
          }
        />
      </div>

      <AgentInspectionsTable />
    </Screen>
  );
}
