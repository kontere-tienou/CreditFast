import { Screen } from '@/shared/ui/Screen';
import { PageHeader } from '@/shared/ui/PageHeader';
import { StatCard } from '@/shared/ui/StatCard';
import { Button } from '@/shared/ui/Button';
import { callApp } from '@/shared/ui/legacy';
import { DossierBrowser } from '@/shared/ui/DossierBrowser';
import { AppTable } from '@/shared/ui/AppTable';
import { useAnalystWorkspace } from './useAnalystWorkspace';

function typeLabel(value?: string) {
  const key = (value || '').toUpperCase();
  if (key.includes('PIECE') || key.includes('DOC')) {
    return 'Pièces manquantes';
  }
  if (key.includes('GARANT')) {
    return 'Garantie manquante';
  }
  if (key.includes('CAPACITE')) {
    return 'Capacité insuffisante';
  }
  return value || 'Point de contrôle';
}

function severityLabel(value?: string) {
  const key = (value || '').toUpperCase();
  if (key === 'HIGH' || key === 'CRITIQUE') {
    return 'Prioritaire';
  }
  if (key === 'MEDIUM') {
    return 'À traiter';
  }
  return 'Information';
}

export function AnalystAnomaliesPage() {
  const { signals, reload, loading, complements } = useAnalystWorkspace();
  const docs = signals.filter((row) => (row.anomaly_type || '').toUpperCase().includes('PIECE') || (row.anomaly_type || '').toUpperCase().includes('DOC'));
  const capacity = signals.filter((row) => (row.anomaly_type || '').toUpperCase().includes('CAPACITE'));
  const guarantees = signals.filter((row) => (row.anomaly_type || '').toUpperCase().includes('GARANT'));

  return (
    <Screen viewId="view-analyst-anomalies" role="region" aria-label="Points de contrôle">
      <PageHeader
        title="Points de contrôle"
        crumbs={['Espace analyste', 'Vérifications']}
        actions={
          <Button variant="secondary" onClick={() => void reload()} disabled={loading}>
            <i className={`fas ${loading ? 'fa-circle-notch fa-spin' : 'fa-rotate'} mr-1`}></i> Actualiser
          </Button>
        }
      />

      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        <StatCard tone="rose" icon="fa-triangle-exclamation" value={String(signals.length)} label="Points ouverts" trendUp={false} trend={<>À traiter avant avis</>} />
        <StatCard tone="primary" icon="fa-file-lines" value={String(docs.length)} label="Pièces incomplètes" trendUp={false} trend={<>Justificatifs manquants</>} />
        <StatCard tone="amber" icon="fa-calculator" value={String(capacity.length)} label="Capacité à revoir" trendUp={false} trend={<>Reste à vivre</>} />
        <StatCard tone="purple" icon="fa-shield-halved" value={String(guarantees.length || complements.length)} label="Garanties / relances" trendUp={false} trend={<>{complements.length} dossier{complements.length > 1 ? 's' : ''} renvoyé{complements.length > 1 ? 's' : ''}</>} />
      </div>

      {signals.length ? (
        <DossierBrowser
          heading="Registre des contrôles"
          items={signals.map((row) => ({
            id: String(row.id),
            title: row.borrower || 'Demandeur',
            meta: `${typeLabel(row.anomaly_type)} · ${severityLabel(row.severity)}`,
            hint: row.description || '—',
          }))}
          onOpen={(id) => callApp('openAnomalyDrawer', id)}
          listView={
            <AppTable
              chrome="plain"
              title=""
              items={signals.map((row) => ({ ...row, id: String(row.id) }))}
              columns={[
                { id: 'borrower', label: 'Emprunteur', isRowHeader: true, render: (row) => row.borrower || 'Demandeur' },
                { id: 'type', label: 'Contrôle', render: (row) => typeLabel(row.anomaly_type) },
                { id: 'severity', label: 'Priorité', render: (row) => severityLabel(row.severity) },
                { id: 'status', label: 'Statut', render: (row) => row.status || 'Ouvert' },
              ]}
              onRowAction={(key) => callApp('openAnomalyDrawer', String(key))}
            />
          }
        />
      ) : (
        <div className="card">
          <div className="card-body">
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.86rem' }}>Aucun point de contrôle ouvert sur les dossiers en file.</p>
          </div>
        </div>
      )}
    </Screen>
  );
}
