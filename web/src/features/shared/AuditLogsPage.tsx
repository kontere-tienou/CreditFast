import { useEffect, useMemo, useState } from 'react';
import { listAdminAuditLogs, type AuditLog } from '@/api';
import { Screen } from '@/shared/ui/Screen';
import { PageHeader } from '@/shared/ui/PageHeader';
import { AppTable } from '@/shared/ui/AppTable';

function displayValue(value: unknown): string {
  if (value == null || value === '') {
    return '—';
  }
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return '—';
}

function formatWhen(value?: string) {
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

export function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    listAdminAuditLogs()
      .then(setLogs)
      .catch(() => {
        setUnavailable(true);
        setLogs([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const rows = useMemo(
    () =>
      logs.map((log, index) => ({
        id: String(log.id ?? index),
        when: formatWhen(log.created_at),
        action: displayValue(log.action),
        actor: log.user?.full_name || log.user?.email || log.user_name || '—',
        entity: displayValue(log.entity || log.entity_type),
        details: displayValue(log.details ?? log.description),
      })),
    [logs],
  );

  return (
    <Screen viewId="view-audit-logs">
      <PageHeader title="Journal des actions" crumbs={['Espace métier', 'Traçabilité']} />
      {unavailable ? (
        <div className="card">
          <div className="card-body">
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.86rem' }}>
              Le journal détaillé n’est pas accessible depuis ce profil. Les avis et transmissions restent enregistrés sur chaque dossier.
            </p>
          </div>
        </div>
      ) : (
        <AppTable
          title={loading ? 'Chargement…' : 'Événements'}
          items={rows}
          columns={[
            { id: 'when', label: 'Date', isRowHeader: true, render: (item) => item.when },
            { id: 'action', label: 'Action', render: (item) => item.action },
            { id: 'actor', label: 'Auteur', render: (item) => item.actor },
            { id: 'entity', label: 'Dossier', render: (item) => item.entity },
            { id: 'details', label: 'Détail', render: (item) => item.details },
          ]}
        />
      )}
    </Screen>
  );
}
