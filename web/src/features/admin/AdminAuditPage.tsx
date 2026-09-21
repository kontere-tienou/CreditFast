import { useEffect, useMemo, useState } from 'react';
import { toast } from '@heroui/react';
import { Screen } from '@/shared/ui/Screen';
import { PageHeader } from '@/shared/ui/PageHeader';
import { AppTable } from '@/shared/ui/AppTable';
import { Badge } from '@/components/base/badges/badges';
import { isApiError } from '@/api';
import { listAdminAuditLogs, type AuditLog } from '@/api/admin';

function displayAuditValue(value: unknown): string {
  if (value == null || value === '') {
    return '—';
  }
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.map(displayAuditValue).filter((part) => part !== '—').join(', ') || '—';
  }
  if (typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, nested]) => `${key}: ${displayAuditValue(nested)}`)
      .join(' · ');
  }
  return String(value);
}

function formatAuditWhen(value: unknown): string {
  const raw = displayAuditValue(value);
  if (raw === '—') {
    return raw;
  }
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    return raw;
  }
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listAdminAuditLogs()
      .then(setLogs)
      .catch((error) => {
        toast.danger(isApiError(error) ? error.message : 'Impossible de charger le journal.');
      })
      .finally(() => setLoading(false));
  }, []);

  const rows = useMemo(
    () =>
      logs.map((log, index) => ({
        ...log,
        id: String(log.id ?? index),
        actionLabel: displayAuditValue(log.action),
        entityLabel: displayAuditValue(log.entity || log.entity_type),
        detailLabel: displayAuditValue(log.details ?? log.description),
        actor: log.user?.full_name || log.user?.email || log.user_name || '—',
        when: formatAuditWhen(log.created_at),
        ipLabel: displayAuditValue(log.ip || log.ip_address),
      })),
    [logs],
  );

  return (
    <Screen viewId="view-admin-audit">
      <PageHeader title="Journal d’audit système" crumbs={['Administration', 'Traçabilité des actions']} />
      <AppTable
        title={loading ? 'Chargement…' : 'Événements'}
        badge={`${rows.length} lignes`}
        items={rows}
        columns={[
          { id: 'when', label: 'Horodatage', isRowHeader: true, allowsSorting: true, render: (item) => item.when },
          {
            id: 'actionLabel',
            label: 'Action',
            allowsSorting: true,
            render: (item) => <Badge color="brand">{item.actionLabel}</Badge>,
          },
          { id: 'actor', label: 'Acteur', render: (item) => item.actor },
          { id: 'entityLabel', label: 'Entité', render: (item) => item.entityLabel },
          { id: 'detailLabel', label: 'Détails', render: (item) => item.detailLabel },
          { id: 'ipLabel', label: 'IP', render: (item) => item.ipLabel },
        ]}
      />
    </Screen>
  );
}
