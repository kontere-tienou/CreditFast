import { Screen } from '@/shared/ui/Screen';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Button } from '@/shared/ui/Button';
import { StatCard } from '@/shared/ui/StatCard';
import { KpiHeroGrid } from '@/shared/ui/KpiHeroGrid';
import { PulseTimeline } from '@/shared/ui/PulseTimeline';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isApiError } from '@/api';
import { listAdminAuditLogs, listAdminUsers, listScoringModels } from '@/api/admin';
import { toast } from '@heroui/react';

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState(0);
  const [models, setModels] = useState(0);
  const [logs, setLogs] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.allSettled([listAdminUsers(), listScoringModels(), listAdminAuditLogs()])
      .then((results) => {
        if (!active) {
          return;
        }
        const [userResult, modelResult, logResult] = results;
        if (userResult.status === 'fulfilled') {
          setUsers(userResult.value.length);
        }
        if (modelResult.status === 'fulfilled') {
          setModels(modelResult.value.length);
        }
        if (logResult.status === 'fulfilled') {
          setLogs(logResult.value.length);
        }
        const firstError = results.find((result) => result.status === 'rejected');
        if (firstError && firstError.status === 'rejected') {
          const error = firstError.reason;
          toast.danger(isApiError(error) ? error.message : 'Impossible de charger le pilotage admin.');
        }
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

  return (
    <Screen viewId="view-role-admin">
      <PageHeader
        title="Administration Système CreditFast"
        crumbs={['Contrôle', 'Comptes, scoring & audit']}
        actions={
          <Button onClick={() => navigate('/app/admin/users')}>
            <i className="fas fa-user-plus"></i> Créer un utilisateur
          </Button>
        }
      />

      <KpiHeroGrid>
        <StatCard
          featured
          tone="primary"
          icon="fa-user-shield"
          value={loading ? '—' : String(users)}
          label="Comptes internes"
          trend={
            <>
              <i className="fas fa-users"></i> Agents, analystes, comité, admin
            </>
          }
          onClick={() => navigate('/app/admin/users')}
        />
        <StatCard
          tone="emerald"
          icon="fa-sliders"
          value={loading ? '—' : String(models)}
          label="Modèles de scoring"
          trend={
            <>
              <i className="fas fa-check"></i> Grilles STANDARD / Cold Start
            </>
          }
          onClick={() => navigate('/app/admin/scoring')}
        />
        <StatCard
          tone="amber"
          icon="fa-clipboard-list"
          value={loading ? '—' : String(logs)}
          label="Événements d’audit"
          trend={
            <>
              <i className="fas fa-clock-rotate-left"></i> Piste immuable
            </>
          }
          onClick={() => navigate('/app/admin/audit')}
        />
        <StatCard
          tone="purple"
          icon="fa-server"
          value="API"
          label="Contrôle système"
          trend={
            <>
              <i className="fas fa-link"></i> Sanctum • rôles internes
            </>
          }
        />
      </KpiHeroGrid>

      <PulseTimeline
        title="Chaîne d’administration"
        steps={[
          { title: 'Créer compte', meta: 'Interne', state: 'done' },
          { title: 'Attribuer rôle', meta: 'RBAC', state: 'done' },
          { title: 'Habiliter', meta: 'API', state: 'done' },
          { title: 'Activer scoring', meta: 'Modèle', state: 'active' },
          { title: 'Superviser', meta: 'Audit', state: 'todo' },
          { title: 'Révoquer', meta: 'Session', state: 'todo' },
          { title: 'Archiver', meta: 'Système', state: 'todo' },
        ]}
      />
    </Screen>
  );
}
