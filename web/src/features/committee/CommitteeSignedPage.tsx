import { Screen } from '@/shared/ui/Screen';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Button } from '@/shared/ui/Button';
import { callApp } from '@/shared/ui/legacy';
import { CommitteeSignedTable } from '@/shared/tables/registry';

export function CommitteeSignedPage() {
  return (
    <Screen viewId="view-committee-signed">
      <PageHeader
        title="Registre des Décisions & Procès-Verbaux Signés"
        crumbs={['Gouvernance Régionale', 'Historique des Actes de Décision Scellés']}
        actions={
          <>
            <Button variant="secondary" className="btn-sm" onClick={() => callApp('switchView', 'view-role-committee')}>
              <i className="fas fa-arrow-left"></i> Séance en Cours
            </Button>
            <Button className="btn-sm" onClick={() => callApp('downloadAllSignedPvsCsv')}>
              <i className="fas fa-file-export"></i> Exporter le Registre
            </Button>
          </>
        }
      />
      <CommitteeSignedTable />
    </Screen>
  );
}
