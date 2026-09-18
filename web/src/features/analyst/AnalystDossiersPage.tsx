import { Screen } from '@/shared/ui/Screen';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Button } from '@/shared/ui/Button';
import { callInteractions } from '@/shared/ui/legacy';
import { AnalystDossiersTable } from '@/shared/tables/registry';

export function AnalystDossiersPage() {
  return (
    <Screen viewId="view-analyst-dossiers">
      <PageHeader
        title="Dossiers à Instruire • Espace Analyste"
        crumbs={['Analyse Risque', 'Instruction & Risque']}
        actions={
          <Button variant="secondary" className="btn-sm" onClick={() => callInteractions('renderRequestsTable', 'ALL')}>
            <i className="fas fa-rotate mr-1"></i> Actualiser
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
            <button
              type="button"
              className="btn btn-primary btn-sm"
              id="btn-filter-all"
              onClick={(event) => callInteractions('renderRequestsTable', 'ALL', '', event.currentTarget)}
            >
              Tous les dossiers
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              id="btn-filter-coldstart"
              onClick={(event) => callInteractions('renderRequestsTable', 'COLD_START', '', event.currentTarget)}
              style={{ borderColor: '#518e45', color: '#1b4332', background: '#eef4ee' }}
            >
              <i className="fas fa-seedling text-emerald mr-1"></i> Primo-Demandeurs (Cold Start)
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={(event) => callInteractions('renderRequestsTable', 'ANALYSIS', '', event.currentTarget)}>
              En Analyse
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={(event) => callInteractions('renderRequestsTable', 'VERIFICATION_REQUIRED', '', event.currentTarget)}
            >
              Vérif. Requise
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={(event) => callInteractions('renderRequestsTable', 'COMMITTEE', '', event.currentTarget)}>
              En Comité
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={(event) => callInteractions('renderRequestsTable', 'APPROVED', '', event.currentTarget)}>
              Approuvés
            </button>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
            <i className="fas fa-info-circle text-primary mr-1"></i> Cliquez sur une ligne ou sur <strong>Détails 360°</strong> pour ouvrir le volet
            d&apos;instruction latérale.
          </div>
        </div>
      </div>

      <AnalystDossiersTable />
    </Screen>
  );
}
