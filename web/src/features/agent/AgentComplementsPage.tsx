import { Screen } from '@/shared/ui/Screen';
import { PageHeader } from '@/shared/ui/PageHeader';
import { StatCard } from '@/shared/ui/StatCard';
import { Button } from '@/shared/ui/Button';
import { callApp } from '@/shared/ui/legacy';
import { AgentComplementsTable } from '@/shared/tables/registry';

export function AgentComplementsPage() {
  return (
    <Screen viewId="view-agent-complements">
      <PageHeader
        title={
          <>
            <i className="fas fa-triangle-exclamation text-danger mr-2"></i> Pièces Manquantes & Relances Documentaires
          </>
        }
        crumbs={['Espace Agent de Crédit', 'Collecte Terrain & Régularisation des Dossiers en Suspens']}
        actions={
          <>
            <Button variant="secondary" onClick={() => callApp('openQrScannerModal', 'general')} title="Scanner le QR Code d'un document ou justificatif">
              <i className="fas fa-qrcode text-primary mr-1"></i> Scanner Document Mobile
            </Button>
            <Button onClick={() => callApp('triggerBulkSmsReminder')}>
              <i className="fas fa-paper-plane mr-1"></i> Relance Groupée SMS / WhatsApp
            </Button>
          </>
        }
      />

      <div className="anomaly-item warning" style={{ marginBottom: '1.5rem' }}>
        <i className="fas fa-bell-concierge anomaly-icon" style={{ color: 'var(--warning-dark)' }}></i>
        <div className="anomaly-content">
          <h5 style={{ color: 'var(--warning-dark)' }}>3 dossiers nécessitent une collecte complémentaire avant passage en Comité</h5>
          <p>Certaines pièces présentent une anomalie OCR (date dépassée, montant discordant) ou n&apos;ont pas encore été transmises par l&apos;emprunteur.</p>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        <StatCard
          tone="rose"
          icon="fa-file-circle-xmark"
          value="4"
          valueId="comp-kpi-missing"
          label="Pièces Manquantes ou Rejetées"
          trendUp={false}
          trend={
            <>
              <i className="fas fa-clock"></i> Bloquant l&apos;instruction
            </>
          }
        />
        <StatCard
          tone="primary"
          icon="fa-comment-sms"
          value="8"
          valueId="comp-kpi-reminders"
          label="Relances Transmises (7j)"
          trend={
            <>
              <i className="fas fa-paper-plane"></i> SMS & WhatsApp API
            </>
          }
        />
        <StatCard
          tone="amber"
          icon="fa-hourglass-half"
          value="1.8 j"
          label="Délai Moyen de Réponse Client"
          trend={
            <>
              <i className="fas fa-bolt"></i> Objectif agence : &lt; 3 jours
            </>
          }
        />
        <StatCard
          tone="emerald"
          icon="fa-shield-halved"
          value="91%"
          label="Taux de Régularisation"
          trend={
            <>
              <i className="fas fa-arrow-up"></i> Conforme aux normes CreditFast
            </>
          }
        />
      </div>

      <AgentComplementsTable />
    </Screen>
  );
}
