import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@heroui/react';
import { Screen } from '@/shared/ui/Screen';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Button } from '@/shared/ui/Button';
import { StatCard } from '@/shared/ui/StatCard';
import { KpiHeroGrid } from '@/shared/ui/KpiHeroGrid';
import { InsightTiles } from '@/shared/ui/InsightTiles';
import { AppTable } from '@/shared/ui/AppTable';
import { Badge } from '@/components/base/badges/badges';
import { isApiError } from '@/api';
import { STAFF_ROLE_LABELS } from '@/api/admin';
import {
  ADMIN_DASHBOARD_SOURCE,
  buildAdminOpsTasks,
  loadAdminDashboard,
  type AdminDashboardSnapshot,
} from './dashboardData';

function formatWhen(value: string) {
  if (!value) {
    return '—';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

const QUEUE_LABELS = {
  agent: { label: 'File agent', hint: 'Compléments, KYC, envoi analyse' },
  analyst: { label: 'File analyse', hint: 'Revue, anomalies, validation' },
  committee: { label: 'File comité', hint: 'Décision d’octroi' },
  disburse: { label: 'À décaisser', hint: 'Prêts accordés, fonds non versés' },
} as const;

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const [snapshot, setSnapshot] = useState<AdminDashboardSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const demo = ADMIN_DASHBOARD_SOURCE === 'placeholder';

  useEffect(() => {
    let active = true;
    loadAdminDashboard()
      .then((next) => {
        if (active) {
          setSnapshot(next);
        }
      })
      .catch((error) => {
        toast.danger(isApiError(error) ? error.message : 'Impossible de charger le tableau de bord.');
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const tasks = useMemo(() => (snapshot ? buildAdminOpsTasks(snapshot) : []), [snapshot]);
  const auditRows = useMemo(
    () =>
      (snapshot?.audit ?? []).map((row) => ({
        ...row,
        whenLabel: formatWhen(row.when),
      })),
    [snapshot],
  );

  const users = snapshot?.users;
  const scoring = snapshot?.scoring;
  const roles = snapshot?.roles;
  const queues = snapshot?.queues;

  const roleBreakdown = users
    ? (Object.keys(STAFF_ROLE_LABELS) as Array<keyof typeof STAFF_ROLE_LABELS>)
        .map((role) => `${users.byRole[role]} ${STAFF_ROLE_LABELS[role]}`)
        .join(' · ')
    : '';

  return (
    <Screen viewId="view-role-admin">
      <PageHeader
        title="Administration Système CreditFast"
        crumbs={['Contrôle', 'Pilotage opérationnel']}
        extra={demo ? <Badge color="warning">Données de démonstration</Badge> : null}
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate('/app/admin/roles')}>
              <i className="fas fa-user-shield"></i> Rôles
            </Button>
            <Button variant="secondary" onClick={() => navigate('/app/admin/scoring')}>
              <i className="fas fa-sliders"></i> Scoring
            </Button>
            <Button variant="secondary" onClick={() => navigate('/app/admin/audit')}>
              <i className="fas fa-clipboard-list"></i> Audit
            </Button>
            <Button onClick={() => navigate('/app/admin/users?nouveau=1')}>
              <i className="fas fa-user-plus"></i> Créer un utilisateur
            </Button>
          </>
        }
      />

      {scoring && scoring.active === 0 ? (
        <div className="admin-alert is-warn">
          <i className="fas fa-triangle-exclamation"></i>
          <div>
            <strong>Aucun modèle ACTIVE</strong>
            <p>Activez une grille STANDARD ou Cold Start avant d’instruire des dossiers.</p>
          </div>
          <Button variant="secondary" onClick={() => navigate('/app/admin/scoring')}>
            Ouvrir le scoring
          </Button>
        </div>
      ) : null}

      <KpiHeroGrid>
        <StatCard
          featured
          tone="primary"
          icon="fa-user-shield"
          value={loading ? '—' : String(users?.total ?? 0)}
          label="Comptes internes"
          trend={
            <>
              <i className="fas fa-users"></i>{' '}
              {loading ? '…' : `${users?.active ?? 0} actifs · ${users?.inactive ?? 0} inactif${(users?.inactive ?? 0) > 1 ? 's' : ''}`}
            </>
          }
          title={roleBreakdown}
          onClick={() => navigate('/app/admin/users')}
        />
        <StatCard
          tone="emerald"
          icon="fa-sliders"
          value={loading ? '—' : String(scoring?.active ?? 0)}
          label="Modèles ACTIVE"
          trend={
            <>
              <i className="fas fa-layer-group"></i>{' '}
              {loading
                ? '…'
                : `${scoring?.draft ?? 0} brouillon${(scoring?.draft ?? 0) > 1 ? 's' : ''} · ${scoring?.total ?? 0} au total`}
            </>
          }
          onClick={() => navigate('/app/admin/scoring')}
        />
        <StatCard
          tone="amber"
          icon="fa-clipboard-list"
          value={loading ? '—' : String(snapshot?.audit.length ?? 0)}
          label="Derniers événements"
          trend={
            <>
              <i className="fas fa-clock-rotate-left"></i> Journal d’audit
            </>
          }
          onClick={() => navigate('/app/admin/audit')}
        />
        <StatCard
          tone="purple"
          icon="fa-lock"
          value={loading ? '—' : String((roles?.system ?? 0) + (roles?.custom ?? 0))}
          label="Rôles"
          trend={
            <>
              <i className="fas fa-user-shield"></i>{' '}
              {loading ? '…' : `${roles?.system ?? 0} système · ${roles?.custom ?? 0} perso`}
            </>
          }
          onClick={() => navigate('/app/admin/roles')}
        />
      </KpiHeroGrid>

      <p className="admin-section-label">Files métier</p>
      <InsightTiles
        tiles={[
          {
            label: QUEUE_LABELS.agent.label,
            value: loading ? '—' : String(queues?.agent ?? 0),
            hint: QUEUE_LABELS.agent.hint,
            badge: demo ? 'Démo' : undefined,
            tone: 'info',
          },
          {
            label: QUEUE_LABELS.analyst.label,
            value: loading ? '—' : String(queues?.analyst ?? 0),
            hint: QUEUE_LABELS.analyst.hint,
            badge: demo ? 'Démo' : undefined,
            tone: 'info',
          },
          {
            label: QUEUE_LABELS.committee.label,
            value: loading ? '—' : String(queues?.committee ?? 0),
            hint: QUEUE_LABELS.committee.hint,
            badge: demo ? 'Démo' : undefined,
            tone: (queues?.committee ?? 0) > 0 ? 'warn' : 'good',
          },
          {
            label: QUEUE_LABELS.disburse.label,
            value: loading ? '—' : String(queues?.disburse ?? 0),
            hint: QUEUE_LABELS.disburse.hint,
            badge: demo ? 'Démo' : undefined,
            tone: 'info',
          },
        ]}
      />

      <section className="card admin-panel admin-ops-panel">
        <h3 className="card-title">À traiter</h3>
        <ul className="admin-task-list">
          {loading ? (
            <li className="admin-task is-info">Chargement…</li>
          ) : (
            tasks.map((task) => (
              <li key={task.id}>
                <button type="button" className={`admin-task is-${task.tone}`} onClick={() => navigate(task.to)}>
                  <strong>{task.title}</strong>
                  <span>{task.meta}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      </section>

      <AppTable
        title="Derniers événements d’audit"
        badge={demo ? 'Démo' : `${auditRows.length}`}
        items={auditRows}
        pageSize={6}
        onRowAction={() => navigate('/app/admin/audit')}
        columns={[
          { id: 'whenLabel', label: 'Horodatage', isRowHeader: true, allowsSorting: true, render: (item) => item.whenLabel },
          {
            id: 'action',
            label: 'Action',
            allowsSorting: true,
            render: (item) => <Badge color="brand">{item.action}</Badge>,
          },
          { id: 'actor', label: 'Acteur', render: (item) => item.actor },
          { id: 'entity', label: 'Entité', render: (item) => item.entity },
          { id: 'details', label: 'Détails', render: (item) => item.details },
        ]}
      />
    </Screen>
  );
}
