import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { toast } from '@heroui/react';
import { Screen } from '@/shared/ui/Screen';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Button } from '@/shared/ui/Button';
import { AppTable } from '@/shared/ui/AppTable';
import { Badge } from '@/components/base/badges/badges';
import { isApiError } from '@/api';
import {
  createScoringModel,
  createScoringRule,
  listScoringModels,
  SCORING_FACTOR_TYPES,
  updateScoringModelStatus,
  type ScoringFactorType,
  type ScoringModel,
} from '@/api/admin';

const STATUSES = ['DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED'] as const;

export function AdminScoringPage() {
  const [models, setModels] = useState<ScoringModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ruleSaving, setRuleSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    version: 'V1.0',
    scoring_mode: 'STANDARD' as 'STANDARD' | 'COLD_START',
    description: '',
  });
  const [rule, setRule] = useState({
    modelId: '',
    rule_code: '',
    rule_name: '',
    factor_type: 'income_consistency' as ScoringFactorType,
    weight: '10',
    description: '',
  });

  const load = async () => {
    setLoading(true);
    try {
      setModels(await listScoringModels());
    } catch (error) {
      toast.danger(isApiError(error) ? error.message : 'Impossible de charger les modèles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const rows = useMemo(
    () =>
      models.map((model) => ({
        ...model,
        id: String(model.id),
      })),
    [models],
  );

  const onCreate = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await createScoringModel({
        name: form.name.trim(),
        version: form.version.trim(),
        scoring_mode: form.scoring_mode,
        description: form.description.trim() || undefined,
      });
      toast.success('Modèle enregistré (brouillon jusqu’à activation).');
      setForm({ name: '', version: 'V1.0', scoring_mode: 'STANDARD', description: '' });
      await load();
    } catch (error) {
      toast.danger(isApiError(error) ? error.message : 'Création impossible.');
    } finally {
      setSaving(false);
    }
  };

  const onCreateRule = async (event: FormEvent) => {
    event.preventDefault();
    if (!rule.modelId) {
      toast.danger('Sélectionnez un modèle.');
      return;
    }
    setRuleSaving(true);
    try {
      await createScoringRule(Number(rule.modelId), {
        rule_code: rule.rule_code.trim(),
        rule_name: rule.rule_name.trim(),
        factor_type: rule.factor_type,
        weight: Number(rule.weight),
        description: rule.description.trim() || undefined,
      });
      toast.success('Règle ajoutée au modèle.');
      setRule({ ...rule, rule_code: '', rule_name: '', description: '' });
    } catch (error) {
      toast.danger(isApiError(error) ? error.message : 'Règle impossible à enregistrer.');
    } finally {
      setRuleSaving(false);
    }
  };

  const onStatus = async (modelId: string, status: (typeof STATUSES)[number]) => {
    try {
      await updateScoringModelStatus(Number(modelId), status);
      toast.success(`Statut ${status} appliqué.`);
      await load();
    } catch (error) {
      toast.danger(isApiError(error) ? error.message : 'Mise à jour impossible.');
    }
  };

  return (
    <Screen viewId="view-admin-scoring">
      <PageHeader title="Modèles de scoring" crumbs={['Administration', 'STANDARD & Cold Start']} />

      <form className="card admin-panel" onSubmit={onCreate}>
        <h3 className="card-title">Nouveau modèle</h3>
        <div className="admin-form-grid">
          <label className="form-group">
            <span className="form-label">Nom</span>
            <input className="form-control" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </label>
          <label className="form-group">
            <span className="form-label">Version</span>
            <input className="form-control" required value={form.version} onChange={(event) => setForm({ ...form, version: event.target.value })} />
          </label>
          <label className="form-group">
            <span className="form-label">Mode</span>
            <select className="form-control" value={form.scoring_mode} onChange={(event) => setForm({ ...form, scoring_mode: event.target.value as 'STANDARD' | 'COLD_START' })}>
              <option value="STANDARD">STANDARD</option>
              <option value="COLD_START">COLD_START</option>
            </select>
          </label>
          <label className="form-group">
            <span className="form-label">Description</span>
            <input className="form-control" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          </label>
        </div>
        <div className="page-actions" style={{ marginTop: '1rem' }}>
          <Button type="submit" disabled={saving}>
            {saving ? 'Enregistrement…' : 'Créer le modèle'}
          </Button>
        </div>
      </form>

      <form className="card admin-panel" onSubmit={onCreateRule}>
        <h3 className="card-title">Ajouter une règle</h3>
        <div className="admin-form-grid">
          <label className="form-group">
            <span className="form-label">Modèle</span>
            <select className="form-control" required value={rule.modelId} onChange={(event) => setRule({ ...rule, modelId: event.target.value })}>
              <option value="">Choisir…</option>
              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name} {model.version ? `(${model.version})` : ''}
                </option>
              ))}
            </select>
          </label>
          <label className="form-group">
            <span className="form-label">Code</span>
            <input className="form-control" required placeholder="R_CAP_02" value={rule.rule_code} onChange={(event) => setRule({ ...rule, rule_code: event.target.value })} />
          </label>
          <label className="form-group">
            <span className="form-label">Nom</span>
            <input className="form-control" required value={rule.rule_name} onChange={(event) => setRule({ ...rule, rule_name: event.target.value })} />
          </label>
          <label className="form-group">
            <span className="form-label">Facteur</span>
            <select className="form-control" value={rule.factor_type} onChange={(event) => setRule({ ...rule, factor_type: event.target.value as ScoringFactorType })}>
              {SCORING_FACTOR_TYPES.map((factor) => (
                <option key={factor} value={factor}>
                  {factor}
                </option>
              ))}
            </select>
          </label>
          <label className="form-group">
            <span className="form-label">Poids (0–100)</span>
            <input className="form-control" type="number" min={0} max={100} step="0.1" required value={rule.weight} onChange={(event) => setRule({ ...rule, weight: event.target.value })} />
          </label>
          <label className="form-group">
            <span className="form-label">Description</span>
            <input className="form-control" value={rule.description} onChange={(event) => setRule({ ...rule, description: event.target.value })} />
          </label>
        </div>
        <div className="page-actions" style={{ marginTop: '1rem' }}>
          <Button type="submit" disabled={ruleSaving || models.length === 0}>
            {ruleSaving ? 'Enregistrement…' : 'Ajouter la règle'}
          </Button>
        </div>
      </form>

      <AppTable
        title={loading ? 'Chargement…' : 'Grilles enregistrées'}
        badge={`${rows.length} modèles`}
        items={rows}
        columns={[
          { id: 'name', label: 'Modèle', isRowHeader: true, allowsSorting: true, render: (item) => <strong>{item.name}</strong> },
          { id: 'version', label: 'Version', render: (item) => item.version || '—' },
          { id: 'scoring_mode', label: 'Mode', render: (item) => item.scoring_mode || '—' },
          {
            id: 'status',
            label: 'Statut',
            render: (item) => <Badge color={item.status === 'ACTIVE' ? 'success' : 'gray'}>{item.status || 'DRAFT'}</Badge>,
          },
          {
            id: 'actions',
            label: 'Contrôle',
            render: (item) => (
              <select
                className="form-control"
                value={item.status || 'DRAFT'}
                onChange={(event) => void onStatus(item.id, event.target.value as (typeof STATUSES)[number])}
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            ),
          },
        ]}
      />
    </Screen>
  );
}
