import { useMemo, useState } from 'react';
import { Screen } from '@/shared/ui/Screen';
import { PageHeader } from '@/shared/ui/PageHeader';
import { StatCard } from '@/shared/ui/StatCard';
import { Button } from '@/shared/ui/Button';
import { AppTable } from '@/shared/ui/AppTable';
import { callApp } from '@/shared/ui/legacy';
import { agentClientName } from '@/api/agent';
import { useAgentWorkspace } from './useAgentWorkspace';
import { AgentClientSheet } from './AgentClientSheet';

export function AgentClientsPage() {
  const { clients, loading, reloadAll } = useAgentWorkspace();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'KYC' | 'PENDING'>('ALL');
  const [openClientId, setOpenClientId] = useState<number | null>(null);

  const verified = clients.filter((row) => (row.kyc_status || '').toUpperCase() === 'VERIFIED');
  const pendingKyc = clients.filter((row) => (row.kyc_status || '').toUpperCase() !== 'VERIFIED');

  const visible = useMemo(() => {
    const byStatus =
      filter === 'KYC' ? verified : filter === 'PENDING' ? pendingKyc : clients;
    const needle = query.trim().toLowerCase();
    if (!needle) {
      return byStatus;
    }
    return byStatus.filter((row) =>
      [agentClientName(row), row.client_number, row.city, row.occupation, row.user?.phone, row.user?.email]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(needle),
    );
  }, [clients, filter, pendingKyc, query, verified]);

  return (
    <Screen viewId="view-agent-clients">
      <PageHeader
        title="Portefeuille emprunteurs"
        crumbs={['Espace agent', 'Fiches clients']}
        actions={
          <Button onClick={() => callApp('openNewLoanModal')}>
            <i className="fas fa-file-circle-plus mr-1"></i> Enregistrer une demande
          </Button>
        }
      />

      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        <StatCard tone="primary" icon="fa-address-book" value={String(clients.length)} label="Fiches en base" trend={<>Portefeuille chargé</>} />
        <StatCard tone="emerald" icon="fa-check-circle" value={String(verified.length)} label="KYC validé" trend={<>Statut VERIFIED</>} />
        <StatCard tone="amber" icon="fa-hourglass-half" value={String(pendingKyc.length)} label="KYC en attente" trend={<>À examiner</>} />
        <StatCard tone="purple" icon="fa-rotate" value={loading ? '…' : String(visible.length)} label="Résultat affiché" trend={<>Filtre courant</>} />
      </div>

      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div className="card-body" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button type="button" className={`btn btn-sm ${filter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('ALL')}>
              Tous ({clients.length})
            </button>
            <button type="button" className={`btn btn-sm ${filter === 'KYC' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('KYC')}>
              KYC validé ({verified.length})
            </button>
            <button type="button" className={`btn btn-sm ${filter === 'PENDING' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('PENDING')}>
              KYC en attente ({pendingKyc.length})
            </button>
          </div>
          <input
            type="search"
            className="form-control form-control-sm"
            placeholder="Nom, n° membre, ville…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            style={{ minWidth: 220 }}
          />
        </div>
      </div>

      {visible.length ? (
        <AppTable
          chrome="plain"
          title="Fiches clients"
          items={visible.map((row) => ({ ...row, id: String(row.id) }))}
          onRowAction={(key) => setOpenClientId(Number(key))}
          columns={[
            { id: 'name', label: 'Emprunteur', isRowHeader: true, render: (row) => agentClientName({ ...row, id: Number(row.id) }) },
            { id: 'number', label: 'N° membre', render: (row) => row.client_number || '—' },
            { id: 'city', label: 'Ville', render: (row) => row.city || row.residential_zone || '—' },
            { id: 'kyc', label: 'KYC', render: (row) => row.kyc_status || '—' },
            { id: 'phone', label: 'Téléphone', render: (row) => row.user?.phone || '—' },
            {
              id: 'actions',
              label: '',
              className: 'actions',
              render: (row) => (
                <button
                  type="button"
                  className="btn btn-secondary btn-xs"
                  title="Ouvrir la fiche : comptes, mouvements, épargne"
                  onClick={(event) => {
                    event.stopPropagation();
                    setOpenClientId(Number(row.id));
                  }}
                >
                  <i className="fas fa-piggy-bank"></i> Épargne
                </button>
              ),
            },
          ]}
        />
      ) : (
        <div className="card">
          <div className="card-body">
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.86rem' }}>Aucune fiche client en base pour le moment.</p>
          </div>
        </div>
      )}

      <AgentClientSheet clientId={openClientId} onClose={() => setOpenClientId(null)} onChanged={() => void reloadAll()} />
    </Screen>
  );
}
