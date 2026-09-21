import { toast } from '@heroui/react';
import { isApiError } from '@/api/errors';
import { getLoan, listLoanRepayments, listMyLoans, type Loan, type LoanRepayment } from '@/api/loans';
import { getUiSession } from '@/app/session';
import { formatDate, formatFcfa, notifyRequestsChanged, repaymentStatusLabel } from '@/features/workflow/workflow';

export type LoanRepaymentRef = {
  loanId: number;
  repaymentId: number;
};

let pendingPay: LoanRepaymentRef | null = null;

export function parseLoanRepaymentRef(identifier?: string | number | null): LoanRepaymentRef | null {
  const raw = String(identifier ?? '').trim();
  const match = raw.match(/^LOAN-(\d+)-RP-(\d+)$/i);
  if (match) {
    return { loanId: Number(match[1]), repaymentId: Number(match[2]) };
  }
  return null;
}

export function loanRepaymentKey(loanId: number, repaymentId: number) {
  return `LOAN-${loanId}-RP-${repaymentId}`;
}

function unpaid(row: LoanRepayment) {
  return (row.status || '').toUpperCase() !== 'PAID';
}

async function resolveRef(identifier?: unknown): Promise<{ loan: Loan; repayment: LoanRepayment } | null> {
  const parsed = parseLoanRepaymentRef(typeof identifier === 'string' || typeof identifier === 'number' ? identifier : undefined);
  if (parsed) {
    const loan = await getLoan(parsed.loanId);
    if (!loan) {
      return null;
    }
    const rows = loan.repayments?.length ? loan.repayments : await listLoanRepayments(loan.id);
    const repayment = rows.find((row) => row.id === parsed.repaymentId);
    return repayment ? { loan, repayment } : null;
  }

  const loans = await listMyLoans();
  const loan = loans.find((item) => (item.status || '').toUpperCase() === 'ACTIVE') ?? loans[0];
  if (!loan) {
    return null;
  }
  const rows = await listLoanRepayments(loan.id);
  const repayment = rows.find(unpaid) ?? rows[0];
  return repayment ? { loan, repayment } : { loan, repayment: { id: 0, loan_id: loan.id } };
}

function setText(id: string, value: string) {
  const node = document.getElementById(id);
  if (node) {
    node.textContent = value;
  }
}

function show(id: string, visible: boolean) {
  const modal = document.getElementById(id);
  if (!modal) {
    return;
  }
  if (id.endsWith('-backdrop')) {
    modal.classList.toggle('active', visible);
    return;
  }
  if (visible) {
    modal.style.display = 'flex';
    window.requestAnimationFrame(() => modal.classList.add('active'));
    return;
  }
  modal.classList.remove('active');
  window.setTimeout(() => {
    modal.style.display = 'none';
  }, 200);
}

export async function fillAndOpenScheduleDrawer(identifier?: unknown) {
  try {
    const resolved = await resolveRef(identifier);
    if (!resolved?.repayment.id) {
      toast.info('Aucune échéance à afficher pour ce prêt.');
      return;
    }
    const { loan, repayment } = resolved;
    const paid = (repayment.status || '').toUpperCase() === 'PAID';
    setText('drawer-installment-title', `Échéance #${repayment.id}`);
    setText('drawer-installment-date', repayment.due_date ? `Échéance au ${formatDate(repayment.due_date)}` : '—');
    setText('drawer-hero-amount', formatFcfa(repayment.expected_amount));
    const statusHost = document.getElementById('drawer-hero-status');
    if (statusHost) {
      statusHost.innerHTML = `<span class="badge ${paid ? 'badge-approved' : 'badge-submitted'}">${repaymentStatusLabel(repayment.status)}</span>`;
    }
    setText('drawer-val-principal', formatFcfa(repayment.expected_amount));
    setText('drawer-val-remaining', formatFcfa(repayment.remaining_amount ?? loan.outstanding_amount));
    setText('drawer-val-contract', `Prêt #${loan.id}`);
    setText('drawer-val-paydate', repayment.payment_date ? formatDate(repayment.payment_date) : 'Non réglé');
    setText('drawer-val-receipt', paid ? `Échéance #${repayment.id}` : 'Générée après enregistrement');
    const actions = document.getElementById('drawer-footer-actions');
    if (actions) {
      actions.innerHTML = paid
        ? ''
        : `<button type="button" class="btn btn-success" data-open-pay="${loanRepaymentKey(loan.id, repayment.id)}">Régler / enregistrer</button>`;
      actions.querySelector('[data-open-pay]')?.addEventListener('click', () => {
        show('schedule-drawer-backdrop', false);
        void openClientPaymentModal(loanRepaymentKey(loan.id, repayment.id));
      });
    }
    show('schedule-drawer-backdrop', true);
  } catch (error) {
    toast.danger(isApiError(error) ? error.message : 'Impossible d’ouvrir l’échéance.');
  }
}

export function closeScheduleDrawer() {
  show('schedule-drawer-backdrop', false);
}

export async function openClientPaymentModal(identifier?: unknown) {
  try {
    const resolved = await resolveRef(identifier);
    if (!resolved?.repayment.id) {
      toast.info('Aucune échéance à régler pour le moment.');
      return;
    }
    const { loan, repayment } = resolved;
    if (!unpaid(repayment)) {
      toast.info('Cette échéance est déjà réglée.');
      return;
    }
    pendingPay = { loanId: loan.id, repaymentId: repayment.id };
    setText('payment-modal-loan-label', `Prêt #${loan.id}`);
    setText('payment-modal-due-label', repayment.due_date ? formatDate(repayment.due_date) : `Échéance #${repayment.id}`);
    setText('payment-modal-amount-label', formatFcfa(repayment.expected_amount ?? repayment.remaining_amount));
    const btn = document.getElementById('btn-confirm-momo-pay');
    const staff = getUiSession()?.role === 'CREDIT_OFFICER' || getUiSession()?.role === 'ADMIN';
    if (btn) {
      btn.innerHTML = staff
        ? `<i class="fas fa-check mr-2"></i> Enregistrer ${formatFcfa(repayment.expected_amount ?? repayment.remaining_amount)}`
        : `<i class="fas fa-eye mr-2"></i> J’ai noté le montant`;
    }
    const hint = document.getElementById('payment-client-hint');
    if (hint) {
      hint.textContent = staff
        ? 'Le règlement est enregistré ici par le chargé, après encaissement en agence ou Mobile Money.'
        : 'Le montant à régler est indiqué ci-dessus. L’enregistrement du paiement est fait par votre chargé à l’agence.';
    }
    const amountInput = document.getElementById('payment-paid-amount') as HTMLInputElement | null;
    const dateInput = document.getElementById('payment-paid-date') as HTMLInputElement | null;
    if (amountInput) {
      amountInput.value = String(repayment.remaining_amount ?? repayment.expected_amount ?? '');
    }
    if (dateInput) {
      dateInput.value = new Date().toISOString().slice(0, 10);
    }
    document.getElementById('payment-staff-fields')?.toggleAttribute('hidden', !staff);
    show('client-payment-modal', true);
  } catch (error) {
    toast.danger(isApiError(error) ? error.message : 'Impossible d’ouvrir le règlement.');
  }
}

export function closeClientPaymentModal() {
  show('client-payment-modal', false);
  pendingPay = null;
}

export async function submitClientPayment(event?: Event) {
  event?.preventDefault();
  const session = getUiSession();
  const staff = session?.role === 'CREDIT_OFFICER' || session?.role === 'ADMIN';
  if (!staff) {
    closeClientPaymentModal();
    toast.info('Présentez ce montant à l’agence. Votre chargé enregistre le règlement une fois le versement reçu.');
    return;
  }
  if (!pendingPay) {
    toast.warning('Choisissez une échéance à enregistrer.');
    return;
  }
  const amount = Number((document.getElementById('payment-paid-amount') as HTMLInputElement | null)?.value);
  if (!Number.isFinite(amount) || amount < 0.01) {
    toast.warning('Indiquez le montant encaissé.');
    return;
  }
  const paymentDate = (document.getElementById('payment-paid-date') as HTMLInputElement | null)?.value || undefined;
  const comment = (document.getElementById('payment-phone-number') as HTMLInputElement | null)?.value?.trim();
  const provider = (document.querySelector('input[name="momo_provider"]:checked') as HTMLInputElement | null)?.value;
  try {
    const { recordLoanRepayment } = await import('@/api/loans');
    await recordLoanRepayment(pendingPay.loanId, pendingPay.repaymentId, {
      paid_amount: amount,
      payment_date: paymentDate,
      comment: [provider, comment].filter(Boolean).join(' · ') || undefined,
    });
    closeClientPaymentModal();
    notifyRequestsChanged();
    toast.success('Remboursement enregistré.');
  } catch (error) {
    toast.danger(isApiError(error) ? error.message : 'Enregistrement impossible pour le moment.');
  }
}
