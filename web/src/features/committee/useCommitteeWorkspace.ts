import { useEffect, useState } from 'react';
import { listMyLoans, type Loan } from '@/api/loans';
import { useCreditRequests } from '@/features/workflow/useCreditRequests';
import type { CreditRequest } from '@/api/credit';

export function isCommitteePending(status?: string) {
  const key = (status || '').toUpperCase();
  return ['COMMITTEE', 'PENDING_COMMITTEE'].includes(key);
}

export function isCommitteeDecided(status?: string) {
  const key = (status || '').toUpperCase();
  return ['APPROVED', 'REJECTED', 'AMENDED'].includes(key);
}

export function useCommitteeWorkspace() {
  const requests = useCreditRequests('committee');
  const [loans, setLoans] = useState<Loan[]>([]);

  useEffect(() => {
    listMyLoans()
      .then(setLoans)
      .catch(() => setLoans([]));
  }, [requests.items]);

  const pending = requests.items.filter((row) => isCommitteePending(row.status));
  const approved = requests.items.filter((row) => (row.status || '').toUpperCase() === 'APPROVED');
  const amended = requests.items.filter((row) => (row.status || '').toUpperCase() === 'AMENDED');
  const rejected = requests.items.filter((row) => (row.status || '').toUpperCase() === 'REJECTED');
  const decided = requests.items.filter((row) => isCommitteeDecided(row.status));

  const volume = pending.reduce((sum, row) => sum + (row.requested_amount ?? 0), 0);
  const envelope = requests.items.reduce((sum, row) => sum + (row.requested_amount ?? 0), 0);

  return {
    ...requests,
    loans,
    pending,
    approved,
    amended,
    rejected,
    decided,
    volume,
    envelope,
  };
}

export function loanForRequest(loans: Loan[], request: CreditRequest) {
  return loans.find((loan) => loan.credit_request_id === request.id);
}
