import { useEffect, useMemo, useState } from 'react';
import { toast } from '@heroui/react';
import { Screen } from '@/shared/ui/Screen';
import { PageHeader } from '@/shared/ui/PageHeader';
import { AppTable } from '@/shared/ui/AppTable';
import { isApiError, listScoringModels, type ScoringModel } from '@/api';

function modeLabel(value?: string) {
  const key = (value || '').toUpperCase();
  if (key === 'COLD_START') {
    return 'Primo-demandeurs';
  }
  return 'Historique client';
}

function statusLabel(value?: string) {
  const key = (value || '').toUpperCase();
  if (key === 'ACTIVE') {
    return 'Actif';
  }
  if (key === 'DRAFT') {
    return 'Brouillon';
  }
  if (key === 'INACTIVE') {
    return 'Inactif';
  }
  if (key === 'ARCHIVED') {
    return 'Archivé';
  }
  return value || '—';
}

export function AnalystScoringPage() {
  const [models, setModels] = useState<ScoringModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listScoringModels()
      .then(setModels)
      .catch((error) => {
        toast.danger(isApiError(error) ? error.message : 'Impossible de charger les grilles de score.');
        setModels([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const rows = useMemo(() => models.map((model) => ({ ...model, id: String(model.id) })), [models]);

  return (
    <Screen viewId="view-scoring-admin">
      <PageHeader title="Grilles de score" crumbs={['Espace analyste', 'Aide à la décision']} />
      {rows.length ? (
        <AppTable
          title={loading ? 'Chargement…' : 'Modèles disponibles'}
          items={rows}
          columns={[
            { id: 'name', label: 'Nom', isRowHeader: true, render: (item) => item.name || '—' },
            { id: 'version', label: 'Version', render: (item) => item.version || '—' },
            { id: 'scoring_mode', label: 'Public', render: (item) => modeLabel(item.scoring_mode) },
            { id: 'status', label: 'Statut', render: (item) => statusLabel(item.status) },
            { id: 'description', label: 'Description', render: (item) => item.description || '—' },
          ]}
        />
      ) : (
        <div className="card">
          <div className="card-body">
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.86rem' }}>
              {loading ? 'Chargement des grilles…' : 'Aucune grille de score n’est encore disponible pour consultation.'}
            </p>
          </div>
        </div>
      )}
    </Screen>
  );
}
