import { useMemo, useState } from 'react';
import { Screen } from '@/shared/ui/Screen';
import { PageHeader } from '@/shared/ui/PageHeader';
import { StatCard } from '@/shared/ui/StatCard';
import { Button } from '@/shared/ui/Button';
import { callApp } from '@/shared/ui/legacy';
import { CreditWorkflowBoard } from '@/features/workflow/CreditWorkflowBoard';
import { formatFcfa } from '@/features/workflow/workflow';
import { useCommitteeWorkspace } from './useCommitteeWorkspace';

const FILTERS = [
  { id: 'ALL', label: 'Tous les dossiers' },
  { id: 'COMMITTEE', label: 'En attente de vote' },
  { id: 'APPROVED', label: 'Accordés' },
  { id: 'AMENDED', label: 'Accordés avec conditions' },
  { id: 'REJECTED', label: 'Refusés' },
] as const;

export function CommitteeDossiersPage() {
  const { items, loading, reload, pending, approved, amended, rejected, volume, envelope } = useCommitteeWorkspace();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['id']>('COMMITTEE');
  const [query, setQuery] = useState('');

  const counts = useMemo(
    () => ({
      ALL: items.length,
      COMMITTEE: pending.length,
      APPROVED: approved.length,
      AMENDED: amended.length,
      REJECTED: rejected.length,
    }),
    [items.length, pending.length, approved.length, amended.length, rejected.length],
  );

  return (
    <Screen viewId="view-committee-dossiers">
      <PageHeader
        title="Dossiers à délibérer"
        crumbs={['Comité de crédit', 'Séance']}
        actions={
          <>
            <Button variant="secondary" className="btn-sm" onClick={() => void reload()} disabled={loading}>
              <i className={`fas ${loading ? 'fa-circle-notch fa-spin' : 'fa-rotate'} mr-1`}></i> Actualiser
            </Button>
            <Button className="btn-sm" onClick={() => callApp('openFirstPendingCommitteeVote')}>
              <i className="fas fa-gavel"></i> Voter le dossier suivant
            </Button>
          </>
        }
      />

      <div className="grid-4" style={{ marginBottom: '1.25rem' }}>
        <StatCard
          tone="primary"
          icon="fa-vault"
          value={loading ? '…' : formatFcfa(envelope || volume)}
          label="Enveloppe soumise"
          trend={<>{items.length} dossier{items.length > 1 ? 's' : ''}</>}
        />
        <StatCard
          tone="amber"
          icon="fa-gavel"
          value={loading ? '…' : String(pending.length)}
          label="En attente de vote"
          trendUp={false}
          onClick={() => setFilter('COMMITTEE')}
          trend={<>Décision requise</>}
        />
        <StatCard
          tone="emerald"
          icon="fa-file-signature"
          value={loading ? '…' : String(approved.length + amended.length)}
          label="Validés en séance"
          onClick={() => setFilter('APPROVED')}
          trend={<>{amended.length} avec conditions</>}
        />
        <StatCard
          tone="rose"
          icon="fa-ban"
          value={loading ? '…' : String(rejected.length)}
          label="Refusés"
          onClick={() => setFilter('REJECTED')}
          trend={<>Hors octroi</>}
        />
      </div>

      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.85rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {FILTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`btn btn-sm ${filter === item.id ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilter(item.id)}
              >
                {item.label} ({counts[item.id]})
              </button>
            ))}
          </div>
          <div className="form-group" style={{ margin: 0, flex: 1, maxWidth: 360, minWidth: 220, position: 'relative' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Rechercher un demandeur ou un objet…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              style={{ paddingLeft: '2rem', fontSize: '0.82rem' }}
            />
            <i
              className="fas fa-search"
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                fontSize: '0.8rem',
              }}
            ></i>
          </div>
        </div>
      </div>

      <CreditWorkflowBoard
        source="committee"
        heading="File du comité"
        statusFilter={filter}
        searchQuery={query}
        onOpen={(id) => callApp('openCommitteeModal', id)}
      />
    </Screen>
  );
}
