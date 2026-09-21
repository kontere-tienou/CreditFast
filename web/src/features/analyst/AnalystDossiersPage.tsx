import { useState } from 'react';
import { Screen } from '@/shared/ui/Screen';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Button } from '@/shared/ui/Button';
import { callApp } from '@/shared/ui/legacy';
import { CreditWorkflowBoard } from '@/features/workflow/CreditWorkflowBoard';
import { useAnalystWorkspace } from './useAnalystWorkspace';

const FILTERS = [
  { id: 'ALL', label: 'Tous les dossiers' },
  { id: 'ANALYSIS', label: 'En analyse' },
  { id: 'VERIFICATION_REQUIRED', label: 'Compléments demandés' },
  { id: 'COMMITTEE', label: 'Chez le comité' },
  { id: 'APPROVED', label: 'Approuvés' },
] as const;

export function AnalystDossiersPage() {
  const { reload, loading } = useAnalystWorkspace();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['id']>('ALL');

  return (
    <Screen viewId="view-analyst-dossiers">
      <PageHeader
        title="Dossiers à instruire"
        crumbs={['Espace analyste', 'Instruction']}
        actions={
          <Button variant="secondary" className="btn-sm" onClick={() => void reload()} disabled={loading}>
            <i className={`fas ${loading ? 'fa-circle-notch fa-spin' : 'fa-rotate'} mr-1`}></i> Actualiser
          </Button>
        }
      />

      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div
          className="card-body"
          style={{
            padding: '1rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {FILTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`btn btn-sm ${filter === item.id ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilter(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
            Ouvrez un dossier pour consulter le score, les pièces et donner votre avis au comité.
          </div>
        </div>
      </div>

      <CreditWorkflowBoard
        source="analyst"
        heading="Liste des dossiers"
        statusFilter={filter}
        onOpen={(id) => callApp('openAnalystDossierDrawer', id)}
      />
    </Screen>
  );
}
