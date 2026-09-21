import { apiJson } from './client';
import { unwrapCollection } from './admin';

export type Loan = {
  id: number;
  client_id?: number;
  credit_request_id?: number;
  principal_amount?: number;
  interest_amount?: number;
  total_amount?: number;
  duration_months?: number;
  monthly_payment?: number;
  disbursed_at?: string | null;
  funds_received?: number;
  outstanding_amount?: number;
  status?: string;
  repayments?: LoanRepayment[];
};

export type LoanRepayment = {
  id: number;
  loan_id?: number;
  due_date?: string;
  payment_date?: string | null;
  expected_amount?: number;
  paid_amount?: number;
  remaining_amount?: number;
  days_late?: number;
  status?: string;
};

function unwrapLoans(payload: unknown) {
  const rows = unwrapCollection<Loan>(payload);
  if (rows.length) {
    return rows;
  }
  if (payload && typeof payload !== 'object') {
    return [];
  }
  const record = payload as Record<string, unknown>;
  for (const key of ['loans', 'data', 'items']) {
    const bag = record[key];
    if (Array.isArray(bag)) {
      return bag as Loan[];
    }
    if (bag && typeof bag === 'object') {
      const nested = bag as Record<string, unknown>;
      for (const inner of ['loans', 'data', 'items']) {
        if (Array.isArray(nested[inner])) {
          return nested[inner] as Loan[];
        }
      }
    }
  }
  return [];
}

export async function listMyLoans() {
  const rows: Loan[] = [];
  let page = 1;
  let lastPage = 1;
  do {
    const payload = await apiJson<unknown>(`/loans?page=${page}&per_page=100`);
    const batch = unwrapLoans(payload);
    rows.push(...batch);
    const record = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : {};
    const meta = record.meta && typeof record.meta === 'object' ? (record.meta as Record<string, unknown>) : undefined;
    const last = record.last_page ?? meta?.last_page;
    lastPage = typeof last === 'number' && last >= 1 ? last : 1;
    page += 1;
  } while (page <= lastPage && page <= 20);
  return rows;
}

export const listLoans = listMyLoans;

export async function listLoanRepayments(loanId: number) {
  const payload = await apiJson<unknown>(`/loans/${loanId}/repayments`);
  const rows = unwrapCollection<LoanRepayment>(payload);
  if (rows.length) {
    return rows;
  }
  if (payload && typeof payload === 'object' && Array.isArray((payload as { repayments?: unknown }).repayments)) {
    return (payload as { repayments: LoanRepayment[] }).repayments;
  }
  return [];
}

function unwrapLoan(payload: unknown): Loan | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }
  const record = payload as { loan?: Loan; data?: Loan } & Loan;
  if (record.loan && typeof record.loan === 'object') {
    return record.loan;
  }
  if (record.data && typeof record.data === 'object' && typeof (record.data as Loan).id === 'number') {
    return record.data;
  }
  if (typeof record.id === 'number') {
    return record;
  }
  return null;
}

export async function getLoan(loanId: number) {
  const payload = await apiJson<unknown>(`/loans/${loanId}`);
  return unwrapLoan(payload);
}

export async function disburseLoan(loanId: number, body: { disbursed_at?: string; comment?: string } = {}) {
  const payload = await apiJson<unknown>(`/loans/${loanId}/disburse`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return unwrapLoan(payload);
}

export async function recordLoanRepayment(
  loanId: number,
  repaymentId: number,
  body: { paid_amount: number; payment_date?: string; comment?: string },
) {
  const payload = await apiJson<unknown>(`/loans/${loanId}/repayments/${repaymentId}/record`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return unwrapLoan(payload);
}

export function loanNeedsDisbursement(loan: Loan) {
  return (loan.status || '').toUpperCase() === 'APPROVED';
}
