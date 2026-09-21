import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from '@heroui/react';
import { isApiError } from '@/api/errors';
import {
  disburseLoan,
  getLoan,
  listLoanRepayments,
  listMyLoans,
  loanNeedsDisbursement,
  recordLoanRepayment,
  type Loan,
  type LoanRepayment,
} from '@/api/loans';
import { listAgentClients, agentClientName, type AgentClient } from '@/api/agent';
import { Screen } from '@/shared/ui/Screen';
import { PageHeader } from '@/shared/ui/PageHeader';
import { StatCard } from '@/shared/ui/StatCard';
import { Button } from '@/shared/ui/Button';
import { AppTable } from '@/shared/ui/AppTable';
import {
  formatDate,
  formatFcfa,
  loanStatusLabel,
  notifyRequestsChanged,
  repaymentStatusLabel,
  REQUESTS_CHANGED_EVENT,
} from '@/features/workflow/workflow';

type Filter = 'ALL' | 'DISBURSE' | 'ACTIVE' | 'CLOSED';

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function unpaid(row: LoanRepayment) {
  return (row.status || '').toUpperCase() !== 'PAID';
}

export function AgentLoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [clients, setClients] = useState<AgentClient[]>([]);
  const [filter, setFilter] = useState<Filter>('DISBURSE');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [repayments, setRepayments] = useState<LoanRepayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [disburseDate, setDisburseDate] = useState(todayIso);
  const [disburseComment, setDisburseComment] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [paidDate, setPaidDate] = useState(todayIso);
  const [paidComment, setPaidComment] = useState('');
  const [selectedRepaymentId, setSelectedRepaymentId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [nextLoans, nextClients] = await Promise.all([
        listMyLoans().catch(() => [] as Loan[]),
        listAgentClients().catch(() => [] as AgentClient[]),
      ]);
      setLoans(nextLoans);
      setClients(nextClients);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const onChange = () => void load();
    window.addEventListener(REQUESTS_CHANGED_EVENT, onChange);
    return () => window.removeEventListener(REQUESTS_CHANGED_EVENT, onChange);
  }, [load]);

  const selected = loans.find((loan) => loan.id === selectedId) ?? null;
  const toDisburse = loans.filter(loanNeedsDisbursement);
  const active = loans.filter((loan) => (loan.status || '').toUpperCase() === 'ACTIVE');
  const closed = loans.filter((loan) => ['CLOSED', 'DEFAULTED'].includes((loan.status || '').toUpperCase()));

  const visible = useMemo(() => {
    if (filter === 'DISBURSE') {
      return toDisburse;
    }
    if (filter === 'ACTIVE') {
      return active;
    }
    if (filter === 'CLOSED') {
      return closed;
    }
    return loans;
  }, [active, closed, filter, loans, toDisburse]);

  useEffect(() => {
    if (!selectedId && visible[0]) {
      setSelectedId(visible[0].id);
    }
  }, [selectedId, visible]);

  useEffect(() => {
    if (!selectedId) {
      setRepayments([]);
      setSelectedRepaymentId(null);
      return;
    }
    void (async () => {
      const loan = await getLoan(selectedId).catch(() => null);
      const rows = loan?.repayments?.length ? loan.repayments : await listLoanRepayments(selectedId).catch(() => []);
      setRepayments(rows);
      const nextUnpaid = rows.find(unpaid);
      setSelectedRepaymentId(nextUnpaid?.id ?? rows[0]?.id ?? null);
      if (nextUnpaid) {
        setPaidAmount(String(nextUnpaid.remaining_amount ?? nextUnpaid.expected_amount ?? ''));
      }
    })();
  }, [selectedId, loans]);

  const clientLabel = (loan: { client_id?: number }) => {
    const client = clients.find((row) => row.id === loan.client_id);
    return client ? agentClientName(client) : `Client #${loan.client_id ?? '—'}`;
  };

  const onDisburse = async () => {
    if (!selected) {
      return;
    }
    setBusy(true);
    try {
      await disburseLoan(selected.id, {
        disbursed_at: disburseDate || undefined,
        comment: disburseComment.trim() || undefined,
      });
      toast.success('Fonds versés. L’échéancier est généré.');
      notifyRequestsChanged();
      await load();
    } catch (error) {
      toast.danger(isApiError(error) ? error.message : 'Décaissement impossible pour le moment.');
    } finally {
      setBusy(false);
    }
  };

  const onRecord = async () => {
    if (!selected || !selectedRepaymentId) {
      toast.warning('Choisissez une échéance.');
      return;
    }
    const amount = Number(paidAmount);
    if (!Number.isFinite(amount) || amount < 0.01) {
      toast.warning('Indiquez le montant encaissé.');
      return;
    }
    setBusy(true);
    try {
      await recordLoanRepayment(selected.id, selectedRepaymentId, {
        paid_amount: amount,
        payment_date: paidDate || undefined,
        comment: paidComment.trim() || undefined,
      });
      toast.success('Remboursement enregistré.');
      notifyRequestsChanged();
      await load();
    } catch (error) {
      toast.danger(isApiError(error) ? error.message : 'Enregistrement impossible pour le moment.');
    } finally {
      setBusy(false);
    }
  };

  const selectedRepayment = repayments.find((row) => row.id === selectedRepaymentId);
  const canDisburse = selected ? loanNeedsDisbursement(selected) : false;
  const canRecord = selected && (selected.status || '').toUpperCase() === 'ACTIVE' && Boolean(selectedRepayment && unpaid(selectedRepayment));

  return (
    <Screen viewId="view-agent-loans">
      <PageHeader
        title="Prêts, versement des fonds et échéances"
        crumbs={['Espace agent', 'Après octroi']}
        actions={
          <Button variant="secondary" className="btn-sm" onClick={() => void load()} disabled={loading}>
            <i className={`fas ${loading ? 'fa-circle-notch fa-spin' : 'fa-rotate'} mr-1`}></i> Actualiser
          </Button>
        }
      />

      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        <StatCard tone="amber" icon="fa-sack-dollar" value={String(toDisburse.length)} label="Fonds à verser" trend={<>Prêts accordés non décaissés</>} />
        <StatCard tone="primary" icon="fa-file-invoice-dollar" value={String(active.length)} label="Prêts en cours" trend={<>Remboursement ouvert</>} />
        <StatCard tone="emerald" icon="fa-circle-check" value={String(closed.length)} label="Soldés / clôturés" trend={<>Hors file active</>} />
        <StatCard tone="purple" icon="fa-list" value={loading ? '…' : String(loans.length)} label="Contrats en base" trend={<>Tous statuts</>} />
      </div>

      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div className="card-body" style={{ padding: '1rem 1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button type="button" className={`btn btn-sm ${filter === 'DISBURSE' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('DISBURSE')}>
            À verser ({toDisburse.length})
          </button>
          <button type="button" className={`btn btn-sm ${filter === 'ACTIVE' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('ACTIVE')}>
            En cours ({active.length})
          </button>
          <button type="button" className={`btn btn-sm ${filter === 'CLOSED' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('CLOSED')}>
            Clôturés ({closed.length})
          </button>
          <button type="button" className={`btn btn-sm ${filter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('ALL')}>
            Tous ({loans.length})
          </button>
        </div>
      </div>

      {visible.length ? (
        <AppTable
          chrome="plain"
          title="Contrats"
          items={visible.map((row) => ({ ...row, id: String(row.id) }))}
          onRowAction={(key) => setSelectedId(Number(key))}
          rowClassName={(row) => (Number(row.id) === selectedId ? 'is-selected' : undefined)}
          columns={[
            { id: 'id', label: 'Prêt', isRowHeader: true, render: (row) => `#${row.id}` },
            { id: 'client', label: 'Emprunteur', render: (row) => clientLabel(row) },
            { id: 'principal', label: 'Principal', render: (row) => formatFcfa(row.principal_amount) },
            { id: 'funds', label: 'Fonds versés', render: (row) => formatFcfa(row.funds_received) },
            { id: 'outstanding', label: 'Restant', render: (row) => formatFcfa(row.outstanding_amount) },
            { id: 'status', label: 'Statut', render: (row) => loanStatusLabel(row.status) },
            { id: 'disbursed', label: 'Versé le', render: (row) => formatDate(row.disbursed_at) },
          ]}
        />
      ) : (
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <div className="card-body">
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.86rem' }}>
              {loading ? 'Chargement…' : 'Aucun prêt dans ce filtre.'}
            </p>
          </div>
        </div>
      )}

      {selected ? (
        <div className="grid-2" style={{ marginTop: '1.25rem', alignItems: 'start' }}>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Versement des fonds — prêt #{selected.id}</h3>
              <p className="card-subtitle">{clientLabel(selected)} • {loanStatusLabel(selected.status)}</p>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {canDisburse
                  ? 'Le comité a accordé ce prêt. Le versement des fonds ouvre l’échéancier.'
                  : selected.disbursed_at
                    ? `Fonds versés le ${formatDate(selected.disbursed_at)}.`
                    : 'Ce contrat n’est pas en attente de versement.'}
              </p>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Date de versement</label>
                <input type="date" className="form-control" value={disburseDate} onChange={(event) => setDisburseDate(event.target.value)} disabled={!canDisburse} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Commentaire (facultatif)</label>
                <input type="text" className="form-control" value={disburseComment} onChange={(event) => setDisburseComment(event.target.value)} placeholder="Agence, Mobile Money…" disabled={!canDisburse} />
              </div>
              <Button onClick={() => void onDisburse()} disabled={!canDisburse || busy}>
                <i className="fas fa-hand-holding-dollar mr-1"></i> Verser les fonds
              </Button>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Enregistrer un remboursement</h3>
              <p className="card-subtitle">{repayments.length ? `${repayments.length} échéances` : 'Échéancier après versement des fonds'}</p>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {repayments.length ? (
                <AppTable
                  chrome="plain"
                  searchable={false}
                  showMenu={false}
                  title="Échéances"
                  items={repayments.map((row) => ({ ...row, id: String(row.id) }))}
                  onRowAction={(key) => {
                    const id = Number(key);
                    setSelectedRepaymentId(id);
                    const row = repayments.find((item) => item.id === id);
                    if (row) {
                      setPaidAmount(String(row.remaining_amount ?? row.expected_amount ?? ''));
                    }
                  }}
                  columns={[
                    { id: 'due', label: 'Date', isRowHeader: true, render: (row) => formatDate(row.due_date) },
                    { id: 'expected', label: 'Dû', render: (row) => formatFcfa(row.expected_amount) },
                    { id: 'paid', label: 'Payé', render: (row) => formatFcfa(row.paid_amount) },
                    { id: 'status', label: 'Statut', render: (row) => repaymentStatusLabel(row.status) },
                  ]}
                />
              ) : (
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>Pas d’échéancier tant que les fonds n’ont pas été versés.</p>
              )}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Montant encaissé</label>
                <input type="number" min="0.01" step="1" className="form-control" value={paidAmount} onChange={(event) => setPaidAmount(event.target.value)} disabled={!canRecord} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Date d’encaissement</label>
                <input type="date" className="form-control" value={paidDate} onChange={(event) => setPaidDate(event.target.value)} disabled={!canRecord} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Commentaire (facultatif)</label>
                <input type="text" className="form-control" value={paidComment} onChange={(event) => setPaidComment(event.target.value)} placeholder="Orange Money, agence…" disabled={!canRecord} />
              </div>
              <Button variant="success" onClick={() => void onRecord()} disabled={!canRecord || busy}>
                <i className="fas fa-receipt mr-1"></i> Enregistrer le règlement
                {selectedRepayment ? ` · #${selectedRepayment.id}` : ''}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </Screen>
  );
}
