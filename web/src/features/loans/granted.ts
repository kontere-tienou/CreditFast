import { getCreditRequest, listMyCreditRequests, type CreditRequest } from '@/api/credit';
import { getLoan, listLoanRepayments, listMyLoans, type Loan, type LoanRepayment } from '@/api/loans';

export function isCommitteeGranted(status?: string) {
  return ['APPROVED', 'AMENDED'].includes((status || '').toUpperCase());
}

export function pickPrimaryLoan(loans: Loan[]) {
  const rank = (status?: string) => {
    const key = (status || '').toUpperCase();
    if (key === 'ACTIVE') {
      return 0;
    }
    if (key === 'APPROVED') {
      return 1;
    }
    if (key === 'DEFAULTED') {
      return 2;
    }
    if (key === 'CLOSED') {
      return 3;
    }
    return 9;
  };
  return [...loans].sort((first, second) => {
    const byStatus = rank(first.status) - rank(second.status);
    if (byStatus !== 0) {
      return byStatus;
    }
    return (second.id || 0) - (first.id || 0);
  })[0];
}

function loanFromGrantedRequest(request: CreditRequest): Loan {
  const nested = request.loan;
  return {
    id: nested?.id || request.loan_id || 0,
    credit_request_id: request.id,
    principal_amount: nested?.principal_amount ?? request.approved_amount ?? request.requested_amount,
    duration_months: nested?.duration_months ?? request.approved_duration_months ?? request.duration_months,
    monthly_payment: nested?.monthly_payment ?? request.estimated_monthly_payment,
    status: nested?.status || 'APPROVED',
  };
}

export function mergeGrantedLoans(loans: Loan[], requests: CreditRequest[]) {
  const covered = new Set(loans.map((loan) => loan.credit_request_id).filter((id): id is number => typeof id === 'number'));
  const extras = requests
    .filter((request) => isCommitteeGranted(request.status) && !covered.has(request.id))
    .map(loanFromGrantedRequest);
  return [...loans, ...extras];
}

export async function loadGrantedClientLoans() {
  const [loans, requests] = await Promise.all([
    listMyLoans().catch(() => [] as Loan[]),
    listMyCreditRequests().catch(() => [] as CreditRequest[]),
  ]);
  const merged = mergeGrantedLoans(loans, requests);
  const resolved = await Promise.all(
    merged.map(async (loan) => {
      if (loan.id) {
        return loan;
      }
      if (!loan.credit_request_id) {
        return loan;
      }
      try {
        const detail = await getCreditRequest(loan.credit_request_id);
        return loanFromGrantedRequest(detail);
      } catch {
        return loan;
      }
    }),
  );
  const unique = new Map<string, Loan>();
  for (const loan of resolved) {
    const key = loan.id ? `loan-${loan.id}` : `request-${loan.credit_request_id ?? 'x'}`;
    unique.set(key, loan);
  }
  return { loans: [...unique.values()], requests };
}

export function plannedRepayments(loan: Loan): LoanRepayment[] {
  const months = loan.duration_months ?? 0;
  const monthly =
    loan.monthly_payment ??
    (loan.principal_amount && months ? Math.round(loan.principal_amount / months) : 0);
  if (months < 1 || !monthly) {
    return [];
  }
  const start = loan.disbursed_at ? new Date(loan.disbursed_at) : new Date();
  if (Number.isNaN(start.getTime())) {
    return [];
  }
  return Array.from({ length: months }, (_, index) => {
    const due = new Date(start);
    due.setMonth(due.getMonth() + index + 1);
    return {
      id: -(index + 1),
      loan_id: loan.id,
      due_date: due.toISOString().slice(0, 10),
      expected_amount: monthly,
      paid_amount: 0,
      remaining_amount: monthly,
      status: 'PENDING',
    };
  });
}

export async function loadLoanRepayments(loan: Loan) {
  const fallback = plannedRepayments(loan);
  if (!loan.id) {
    return { rows: fallback, planned: fallback.length > 0 };
  }
  const detail = await getLoan(loan.id).catch(() => null);
  const nested = detail?.repayments ?? [];
  const listed = nested.length ? nested : await listLoanRepayments(loan.id).catch(() => [] as LoanRepayment[]);
  if (listed.length) {
    return { rows: listed, planned: false };
  }
  const planned = plannedRepayments(detail ?? loan);
  return { rows: planned, planned: planned.length > 0 };
}
