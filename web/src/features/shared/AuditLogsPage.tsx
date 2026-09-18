import { Screen } from '@/shared/ui/Screen';
import { PageHeader } from '@/shared/ui/PageHeader';
import { AuditLogsTable } from '@/shared/tables/registry';

export function AuditLogsPage() {
  return (
    <Screen viewId="view-audit-logs">
      <PageHeader title="Piste d'Audit & Journal des Événements" crumbs={['Traçabilité Réglementaire', 'Historique Immuable des Décisions']} />
      <AuditLogsTable />
    </Screen>
  );
}
