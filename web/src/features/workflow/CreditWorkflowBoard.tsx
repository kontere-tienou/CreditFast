import { toast } from '@heroui/react';
import { isApiError } from '@/api';
import { sendRequestToAnalysis, getAnalysisTransferBlockers, type CreditRequest } from '@/api/credit';
import { AppTable } from '@/shared/ui/AppTable';
import { DossierBrowser } from '@/shared/ui/DossierBrowser';
import { Button } from '@/shared/ui/Button';
import { callApp } from '@/shared/ui/legacy';
import { borrowerName, creditStatusLabel, formatFcfa, notifyRequestsChanged, setSelectedCreditRequestId } from './workflow';
import { useCreditRequests, type WorkflowSource } from './useCreditRequests';

type CreditWorkflowBoardProps = {
  source: WorkflowSource;
  heading: string;
  onOpen?: (id: string) => void;
  statusFilter?: string;
  searchQuery?: string;
};

function canSendToAnalyst(status?: string) {
  const key = (status || '').toUpperCase();
  return !['ANALYSIS', 'IN_ANALYSIS', 'PENDING_ANALYSIS', 'COMMITTEE', 'PENDING_COMMITTEE', 'APPROVED', 'REJECTED', 'AMENDED', 'VERIFICATION_REQUIRED', 'DRAFT'].includes(key);
}

export function CreditWorkflowBoard({ source, heading, onOpen, statusFilter = 'ALL', searchQuery = '' }: CreditWorkflowBoardProps) {
  const { items, loading, error, reload } = useCreditRequests(source);
  const needle = searchQuery.trim().toLowerCase();
  const visible = items.filter((row) => {
    if (statusFilter !== 'ALL') {
      const status = (row.status || '').toUpperCase();
      if (statusFilter === 'ANALYSIS') {
        if (!['ANALYSIS', 'IN_ANALYSIS', 'PENDING_ANALYSIS'].includes(status)) {
          return false;
        }
      } else if (statusFilter === 'COMMITTEE') {
        if (!['COMMITTEE', 'PENDING_COMMITTEE'].includes(status)) {
          return false;
        }
      } else if (status !== statusFilter) {
        return false;
      }
    }
    if (!needle) {
      return true;
    }
    const haystack = `${borrowerName(row)} ${row.purpose || ''} ${row.id} ${row.status || ''}`.toLowerCase();
    return haystack.includes(needle);
  });

  const open = (id: string) => {
    const numeric = Number(id);
    if (!Number.isNaN(numeric)) {
      setSelectedCreditRequestId(numeric);
    }
    onOpen?.(id);
  };

  const sendToAnalyst = async (row: CreditRequest) => {
    try {
      const { blockers } = await getAnalysisTransferBlockers(row.id);
      if (blockers.length) {
        toast.warning(`Transmission bloquée : ${blockers.join(', ')}.`);
        setSelectedCreditRequestId(row.id);
        onOpen?.(String(row.id));
        return;
      }
      await sendRequestToAnalysis(row.id);
      toast.success('Dossier transmis à l’analyste.');
      notifyRequestsChanged();
    } catch (err) {
      toast.danger(isApiError(err) ? err.message : 'Transmission à l’analyste impossible.');
    }
  };

  return (
    <div>
      {error ? (
        <p className="cf-auth-field-error-icon" style={{ margin: '0 0 0.75rem', color: '#991b1b', fontWeight: 600, fontSize: '0.82rem' }}>
          {error}
        </p>
      ) : null}
      <DossierBrowser
        heading={heading}
        items={visible.map((row) => ({
          id: String(row.id),
          title: borrowerName(row),
          meta: `${creditStatusLabel(row.status)} · ${row.purpose || 'Demande de prêt'}`,
          hint: formatFcfa(row.approved_amount ?? row.requested_amount),
        }))}
        onOpen={open}
        toolbar={
          <Button variant="secondary" className="btn-sm" onClick={() => void reload()} disabled={loading}>
            <i className={`fas ${loading ? 'fa-circle-notch fa-spin' : 'fa-rotate'} mr-1`}></i> Actualiser
          </Button>
        }
        listView={
          <AppTable
            title=""
            chrome="plain"
            searchable
            searchPlaceholder="Rechercher un dossier…"
            items={visible.map((row) => ({ ...row, id: String(row.id) }))}
            columns={[
              {
                id: 'borrower',
                label: 'Demandeur',
                isRowHeader: true,
                render: (row) => (
                  <div className="cf-table-stack">
                    <p className="cf-table-strong">{borrowerName(row)}</p>
                    <p className="cf-table-muted" title={row.purpose || undefined}>
                      {row.purpose || 'Demande de prêt'}
                    </p>
                  </div>
                ),
              },
              {
                id: 'amount',
                label: 'Montant',
                render: (row) => formatFcfa(row.approved_amount ?? row.requested_amount),
              },
              {
                id: 'duration',
                label: 'Durée',
                render: (row) => (row.duration_months ? `${row.duration_months} mois` : '—'),
              },
              {
                id: 'status',
                label: 'Étape',
                render: (row) => creditStatusLabel(row.status),
              },
              {
                id: 'actions',
                label: '',
                className: 'actions',
                render: (row) => (
                  <div className="cf-table-actions" style={{ display: 'flex', gap: '0.35rem' }}>
                    <button type="button" className="cf-table-icon-btn is-view" title="Ouvrir" onClick={() => open(String(row.id))}>
                      <i className="fas fa-eye"></i>
                    </button>
                    {source === 'mine' && (row.status || '').toUpperCase() === 'DRAFT' ? (
                      <>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={(event) => {
                            event.stopPropagation();
                            callApp('resumeDraftCreditRequest', row.id);
                          }}
                        >
                          Reprendre
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={(event) => {
                            event.stopPropagation();
                            callApp('deleteDraftCreditRequest', row.id);
                          }}
                        >
                          Supprimer
                        </button>
                      </>
                    ) : null}
                    {source === 'agent' && canSendToAnalyst(row.status) ? (
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={(event) => {
                          event.stopPropagation();
                          const dossier = items.find((item) => item.id === Number(row.id));
                          if (dossier) {
                            void sendToAnalyst(dossier);
                          }
                        }}
                      >
                        Analyste
                      </button>
                    ) : null}
                    {source === 'analyst' ? (
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={(event) => {
                          event.stopPropagation();
                          open(String(row.id));
                        }}
                      >
                        Analyser
                      </button>
                    ) : null}
                    {source === 'committee' ? (
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={(event) => {
                          event.stopPropagation();
                          open(String(row.id));
                        }}
                      >
                        Délibérer
                      </button>
                    ) : null}
                  </div>
                ),
              },
            ]}
            onRowAction={(key) => open(String(key))}
          />
        }
      />
      {!loading && visible.length === 0 && !error ? (
        <p style={{ margin: '0.75rem 0 0', color: 'var(--text-muted)', fontSize: '0.84rem' }}>Aucun dossier dans cette file pour le moment.</p>
      ) : null}
    </div>
  );
}
