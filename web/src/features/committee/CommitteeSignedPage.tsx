import { useMemo } from 'react';
import { Screen } from '@/shared/ui/Screen';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Button } from '@/shared/ui/Button';
import { AppTable } from '@/shared/ui/AppTable';
import { callApp } from '@/shared/ui/legacy';
import { borrowerName, creditStatusLabel, formatDate, formatFcfa } from '@/features/workflow/workflow';
import { useCommitteeWorkspace } from './useCommitteeWorkspace';

function downloadCsv(filename: string, rows: string[][]) {
  const body = rows.map((line) => line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';')).join('\n');
  const blob = new Blob([`\uFEFF${body}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function CommitteeSignedPage() {
  const { decided, loans, loading, reload, items } = useCommitteeWorkspace();

  const rows = useMemo(() => {
    const fromRequests = decided.map((row) => {
      const loan = loans.find((item) => item.credit_request_id === row.id);
      return {
        id: String(row.id),
        name: borrowerName(row),
        amount: formatFcfa(loan?.principal_amount ?? row.requested_amount),
        terms: loan?.duration_months
          ? `${loan.duration_months} mois`
          : row.duration_months
            ? `${row.duration_months} mois`
            : '—',
        decision: creditStatusLabel(row.status),
        date: formatDate(row.submitted_at || row.created_at),
      };
    });
    const covered = new Set(decided.map((row) => row.id));
    const fromLoans = loans
      .filter((loan) => loan.credit_request_id && !covered.has(loan.credit_request_id))
      .map((loan) => {
        const request = items.find((row) => row.id === loan.credit_request_id);
        return {
          id: String(loan.credit_request_id || loan.id),
          name: request ? borrowerName(request) : `Dossier ${loan.credit_request_id ?? loan.id}`,
          amount: formatFcfa(loan.principal_amount),
          terms: loan.duration_months ? `${loan.duration_months} mois` : '—',
          decision: 'Accordé',
          date: formatDate(loan.disbursed_at),
        };
      });
    return [...fromRequests, ...fromLoans];
  }, [decided, loans, items]);

  const exportRegister = () => {
    if (!rows.length) {
      return;
    }
    downloadCsv('registre-decisions.csv', [
      ['Dossier', 'Demandeur', 'Montant', 'Durée', 'Décision', 'Date'],
      ...rows.map((row) => [row.id, row.name, row.amount, row.terms, row.decision, row.date]),
    ]);
  };

  return (
    <Screen viewId="view-committee-signed">
      <PageHeader
        title="Registre des décisions"
        crumbs={['Comité de crédit', 'Décisions enregistrées']}
        actions={
          <>
            <Button variant="secondary" className="btn-sm" onClick={() => void reload()} disabled={loading}>
              <i className={`fas ${loading ? 'fa-circle-notch fa-spin' : 'fa-rotate'} mr-1`}></i> Actualiser
            </Button>
            <Button className="btn-sm" onClick={exportRegister} disabled={!rows.length}>
              <i className="fas fa-file-export"></i> Exporter le registre
            </Button>
          </>
        }
      />
      {!loading && rows.length === 0 ? (
        <div className="card">
          <div className="card-body">
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.86rem' }}>
              Aucune décision enregistrée pour le moment. Les accords et les refus apparaîtront ici après le vote.
            </p>
          </div>
        </div>
      ) : (
        <AppTable
          title={loading ? 'Chargement…' : 'Décisions du comité'}
          items={rows}
          onRowAction={(key) => callApp('openCommitteeModal', String(key))}
          columns={[
            { id: 'name', label: 'Demandeur', isRowHeader: true, render: (item) => item.name },
            { id: 'amount', label: 'Montant', render: (item) => item.amount },
            { id: 'terms', label: 'Durée', render: (item) => item.terms },
            { id: 'decision', label: 'Décision', render: (item) => item.decision },
            { id: 'date', label: 'Date', render: (item) => item.date },
          ]}
        />
      )}
    </Screen>
  );
}
