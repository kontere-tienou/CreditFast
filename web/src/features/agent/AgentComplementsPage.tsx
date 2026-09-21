import { Screen } from '@/shared/ui/Screen';
import { PageHeader } from '@/shared/ui/PageHeader';
import { StatCard } from '@/shared/ui/StatCard';
import { AppTable } from '@/shared/ui/AppTable';
import { DossierBrowser } from '@/shared/ui/DossierBrowser';
import { callApp } from '@/shared/ui/legacy';
import { borrowerName, creditStatusLabel, formatFcfa } from '@/features/workflow/workflow';
import { useAgentWorkspace } from './useAgentWorkspace';

export function AgentComplementsPage() {
  const { complements, items } = useAgentWorkspace();

  return (
    <Screen viewId="view-agent-complements">
      <PageHeader title="Pièces manquantes" crumbs={['Espace agent', 'Dossiers renvoyés au client']} />

      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        <StatCard tone="rose" icon="fa-file-circle-xmark" value={String(complements.length)} label="Compléments ouverts" trend={<>Renvoyés au demandeur</>} />
        <StatCard tone="primary" icon="fa-inbox" value={String(items.length)} label="File agent" trend={<>Tous les dossiers reçus</>} />
        <StatCard tone="amber" icon="fa-rotate" value={complements.length ? 'Oui' : 'Non'} label="Action requise" trend={<>Pièces ou garantie à rappeler</>} />
        <StatCard tone="emerald" icon="fa-check" value={String(Math.max(0, items.length - complements.length))} label="Hors complément" trend={<>Autres étapes</>} />
      </div>

      <DossierBrowser
        heading="Dossiers"
        items={complements.map((row) => ({
          id: String(row.id),
          title: borrowerName(row),
          meta: creditStatusLabel(row.status),
          hint: formatFcfa(row.requested_amount),
        }))}
        onOpen={(id) => callApp('openComplementsDrawer', id)}
        listView={
          complements.length ? (
            <AppTable
              chrome="plain"
              title="Compléments"
              items={complements.map((row) => ({ ...row, id: String(row.id) }))}
              columns={[
                { id: 'borrower', label: 'Emprunteur', isRowHeader: true, render: (row) => borrowerName(row) },
                { id: 'purpose', label: 'Objet', render: (row) => row.purpose || '—' },
                { id: 'amount', label: 'Montant', render: (row) => formatFcfa(row.requested_amount) },
                { id: 'status', label: 'Étape', render: (row) => creditStatusLabel(row.status) },
              ]}
              onRowAction={(key) => callApp('openComplementsDrawer', String(key))}
            />
          ) : (
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.86rem' }}>Aucun dossier en attente de pièces pour le moment.</p>
          )
        }
      />
    </Screen>
  );
}
