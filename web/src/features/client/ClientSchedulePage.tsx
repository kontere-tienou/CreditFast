import { useEffect, useMemo, useState } from 'react';
import { Screen } from '@/shared/ui/Screen';
import { Button } from '@/shared/ui/Button';
import { callApp } from '@/shared/ui/legacy';
import { AppTable } from '@/shared/ui/AppTable';
import { loanNeedsDisbursement, type Loan, type LoanRepayment } from '@/api/loans';
import { formatDate, formatFcfa, loanStatusLabel, repaymentStatusLabel, REQUESTS_CHANGED_EVENT } from '@/features/workflow/workflow';
import { loanRepaymentKey } from '@/features/loans/postOctroi';
import { loadGrantedClientLoans, loadLoanRepayments, pickPrimaryLoan } from '@/features/loans/granted';

export function ClientSchedulePage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [repayments, setRepayments] = useState<LoanRepayment[]>([]);
  const [planned, setPlanned] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'PAID' | 'DUE' | 'UPCOMING'>('ALL');

  const loanKey = (loan: Loan) => (loan.id ? `loan-${loan.id}` : `request-${loan.credit_request_id ?? 0}`);

  useEffect(() => {
    const load = async () => {
      try {
        const { loans: nextLoans } = await loadGrantedClientLoans();
        setLoans(nextLoans);
        const primary = pickPrimaryLoan(nextLoans);
        setSelectedId((current) => {
          if (current && nextLoans.some((loan) => loanKey(loan) === current)) {
            return current;
          }
          return primary ? loanKey(primary) : null;
        });
      } catch {
        setLoans([]);
        setRepayments([]);
      }
    };
    void load();
    const onChange = () => void load();
    window.addEventListener(REQUESTS_CHANGED_EVENT, onChange);
    return () => window.removeEventListener(REQUESTS_CHANGED_EVENT, onChange);
  }, []);

  const activeLoan = loans.find((loan) => loanKey(loan) === selectedId) ?? pickPrimaryLoan(loans);

  useEffect(() => {
    if (!activeLoan) {
      setRepayments([]);
      setPlanned(false);
      return;
    }
    void loadLoanRepayments(activeLoan).then((result) => {
      setRepayments(result.rows);
      setPlanned(result.planned);
    });
  }, [activeLoan?.id, activeLoan?.credit_request_id, activeLoan?.status, loans.length]);

  const paid = repayments.filter((row) => (row.status || '').toUpperCase() === 'PAID');
  const due = repayments.filter((row) => {
    const status = (row.status || '').toUpperCase();
    return status === 'DUE' || status === 'PENDING' || status === 'OVERDUE' || status === 'LATE';
  });
  const upcoming = repayments.filter((row) => (row.status || '').toUpperCase() === 'UPCOMING' || (row.status || '').toUpperCase() === 'SCHEDULED');
  const nextDue = repayments.find((row) => (row.status || '').toUpperCase() !== 'PAID' && (row.id ?? 0) > 0) ?? repayments.find((row) => (row.status || '').toUpperCase() !== 'PAID');
  const paidAmount = paid.reduce((sum, row) => sum + (row.paid_amount ?? row.expected_amount ?? 0), 0);
  const remaining = activeLoan?.outstanding_amount ?? repayments.reduce((sum, row) => sum + (row.remaining_amount ?? 0), 0);
  const progressPct = repayments.length ? Math.round((paid.length / repayments.length) * 1000) / 10 : 0;
  const waitingFunds = Boolean(activeLoan && loanNeedsDisbursement(activeLoan));
  const canPay = Boolean(nextDue && (nextDue.id ?? 0) > 0 && !waitingFunds && !planned);

  const visible = useMemo(() => {
    if (filter === 'PAID') {
      return paid;
    }
    if (filter === 'DUE') {
      return due.length ? due : nextDue ? [nextDue] : [];
    }
    if (filter === 'UPCOMING') {
      return upcoming.length ? upcoming : repayments.filter((row) => (row.status || '').toUpperCase() !== 'PAID');
    }
    return repayments;
  }, [due, filter, nextDue, paid, repayments, upcoming]);

  return (
    <Screen viewId="view-client-schedule">
      <div className="page-header" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <h2 className="page-title">
            <i className="fas fa-calendar-days text-primary mr-2"></i> Mon échéancier
          </h2>
          <p className="page-subtitle">
            {activeLoan
              ? `Crédit accordé • ${formatFcfa(activeLoan.principal_amount)} • ${loanStatusLabel(activeLoan.status)}`
              : 'Aucun crédit accordé par le comité pour le moment'}
          </p>
        </div>
        <div className="page-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          <Button variant="success" onClick={() => callApp('openClientPaymentModal')} disabled={!canPay}>
            <i className="fas fa-wallet"></i> Voir le montant à régler
          </Button>
        </div>
      </div>

      {waitingFunds ? (
        <div className="card" style={{ marginBottom: '1rem', borderColor: 'rgba(81, 142, 69, 0.35)', background: 'rgba(81, 142, 69, 0.08)' }}>
          <div className="card-body" style={{ padding: '0.9rem 1.15rem' }}>
            <strong>Crédit accordé par le comité</strong>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              Votre dossier est accepté. L’échéancier à régler s’ouvre ici. Le premier versement est enregistré après la mise à disposition des fonds par votre chargé.
            </p>
          </div>
        </div>
      ) : null}

      {loans.length > 1 ? (
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <div className="card-body" style={{ padding: '0.85rem 1.15rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {loans.map((loan) => {
              const key = loanKey(loan);
              const selected = key === selectedId;
              return (
                <button
                  key={key}
                  type="button"
                  className={`btn btn-sm ${selected ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setSelectedId(key)}
                >
                  {formatFcfa(loan.principal_amount)} • {loan.duration_months ? `${loan.duration_months} mois` : loanStatusLabel(loan.status)}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="schedule-grid-responsive">
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 700 }}>Progression</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary-700)', fontFamily: 'var(--font-family-code)' }}>
            {repayments.length ? `${paid.length} / ${repayments.length} mensualités` : '—'}
          </div>
          <div style={{ width: '100%', height: 10, background: 'var(--bg-body)', borderRadius: 'var(--radius-full)', overflow: 'hidden', border: '1px solid var(--border-color)', margin: '0.5rem 0' }}>
            <div style={{ width: `${progressPct}%`, height: '100%', background: 'linear-gradient(90deg, var(--cif-emerald-500), var(--cif-emerald-600))' }}></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-subtle)' }}>
            <span>
              Remboursé : <strong>{formatFcfa(paidAmount)}</strong>
            </span>
            <span>
              Restant : <strong>{formatFcfa(remaining || (planned ? (activeLoan?.principal_amount ?? 0) : 0))}</strong>
            </span>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 700 }}>Prochaine échéance</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--cif-gold-700)', fontFamily: 'var(--font-family-code)' }}>
            {nextDue ? formatFcfa(nextDue.expected_amount) : '—'}
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 4 }}>
            {nextDue?.due_date ? formatDate(nextDue.due_date) : waitingFunds ? 'Dès le versement des fonds' : 'Aucune échéance à régler'}
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 700 }}>Crédits accordés</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--cif-emerald-700)', fontFamily: 'var(--font-family-code)' }}>
            {loans.length}
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 4 }}>Décisions du comité sur ce compte</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
          <div>
            <h3 className="card-title">
              <i className="fas fa-list-ol text-primary mr-1"></i> Échéances à régler
            </h3>
            <p className="card-subtitle">
              {repayments.length
                ? planned
                  ? `${repayments.length} mensualités prévues`
                  : `${repayments.length} lignes`
                : waitingFunds
                  ? 'En attente du versement des fonds'
                  : 'En attente d’un crédit accordé'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <FilterChip active={filter === 'ALL'} onClick={() => setFilter('ALL')} label={`Toutes (${repayments.length})`} />
            <FilterChip active={filter === 'PAID'} onClick={() => setFilter('PAID')} label={`Payées (${paid.length})`} />
            <FilterChip active={filter === 'DUE'} onClick={() => setFilter('DUE')} label={`Exigibles (${due.length || (nextDue ? 1 : 0)})`} />
            <FilterChip active={filter === 'UPCOMING'} onClick={() => setFilter('UPCOMING')} label="À venir" />
          </div>
        </div>
        {visible.length ? (
          <AppTable
            chrome="plain"
            title="Échéancier"
            items={visible.map((row) => ({ ...row, id: loanRepaymentKey(row.loan_id ?? activeLoan?.id ?? 0, row.id) }))}
            onRowAction={(key) => {
              if (!planned && (activeLoan?.id ?? 0) > 0) {
                callApp('openScheduleDrawer', String(key));
              }
            }}
            columns={[
              { id: 'due', label: 'Date limite', isRowHeader: true, render: (row) => formatDate(row.due_date) },
              { id: 'amount', label: 'Mensualité', render: (row) => formatFcfa(row.expected_amount) },
              { id: 'paid', label: 'Payé', render: (row) => formatFcfa(row.paid_amount) },
              { id: 'remaining', label: 'Reste', render: (row) => formatFcfa(row.remaining_amount) },
              { id: 'status', label: 'Statut', render: (row) => (planned ? 'À régler' : repaymentStatusLabel(row.status)) },
            ]}
          />
        ) : (
          <div className="card-body">
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.86rem' }}>
              {loans.length
                ? 'Le comité a accordé ce crédit. Les lignes de règlement apparaîtront dès que les fonds seront versés, ou dès que la mensualité du contrat sera connue.'
                : 'Aucun crédit accordé n’est encore rattaché à ce compte.'}
            </p>
          </div>
        )}
      </div>
    </Screen>
  );
}

function FilterChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button type="button" className={`btn btn-secondary btn-sm${active ? ' active' : ''}`} onClick={onClick}>
      {label}
    </button>
  );
}
