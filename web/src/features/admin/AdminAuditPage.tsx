import { useEffect, useMemo, useState } from 'react';
import { toast } from '@heroui/react';
import { Screen } from '@/shared/ui/Screen';
import { PageHeader } from '@/shared/ui/PageHeader';
import { AppTable } from '@/shared/ui/AppTable';
import { Badge } from '@/components/base/badges/badges';
import { isApiError } from '@/api';
import { listAdminAuditLogs, type AuditLog } from '@/api/admin';

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
        actionLabel: log.action || '—',
        entityLabel: log.entity || log.entity_type || '—',
        detailLabel: log.details || log.description || '—',
        actor: log.user?.full_name || log.user?.email || log.user_name || '—',
        when: log.created_at || '—',
        ipLabel: log.ip || log.ip_address || '—',
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
            render: (item) => <Badge color="indigo">{item.actionLabel}</Badge>,
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
