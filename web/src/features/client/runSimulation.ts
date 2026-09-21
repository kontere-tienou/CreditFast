import { toast } from '@heroui/react';
import { isApiError } from '@/api/errors';
import { fetchFinancialProfile } from '@/api/profile';
import {
  scenarioInterest,
  scenarioMonthly,
  scenarioTotal,
  simulateInstallments,
  type SimulationScenarioResult,
} from '@/api/simulations';
import { formatFcfa } from '@/features/workflow/workflow';

let timer: number | null = null;
let lastPainted: SimulationScenarioResult | null = null;

function num(id: string, fallback = 0) {
  const raw = String((document.getElementById(id) as HTMLInputElement | null)?.value ?? '').replace(/\s/g, '');
  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}

function setText(id: string, value: string) {
  const node = document.getElementById(id);
  if (node) {
    node.textContent = value;
  }
}

function durationOptions(base: number) {
  const unique = [...new Set([Math.max(3, base - 6), base, Math.min(36, base + 6)])].sort((a, b) => a - b);
  return unique;
}

function pickMain(rows: SimulationScenarioResult[], amount: number, duration: number) {
  return (
    rows.find((row) => row.duration_months === duration && (row.requested_amount == null || row.requested_amount === amount)) ??
    rows.find((row) => row.duration_months === duration) ??
    rows[0] ??
    null
  );
}

function paint(main: SimulationScenarioResult, amount: number, duration: number, income: number, expenses: number, alts: SimulationScenarioResult[]) {
  lastPainted = main;
  const monthly = scenarioMonthly(main);
  const interest = scenarioInterest(main);
  const total = scenarioTotal(main, amount);
  const fees = main.fees ?? main.insurance ?? null;
  const rest = main.rest_to_live ?? main.disposable_income ?? (monthly != null ? income - expenses - monthly : income - expenses);
  const status = (main.repayment_capacity_status || '').toUpperCase();

  setText('sim-amount-label', formatFcfa(amount));
  setText('sim-duration-label', `${duration} mois`);
  setText('sim-monthly-output', monthly != null ? formatFcfa(monthly) : '—');
  setText('sim-capital-output', formatFcfa(amount));
  setText('sim-interest-output', interest != null ? formatFcfa(interest) : '—');
  setText('sim-fees-output', fees != null ? formatFcfa(fees) : '—');
  setText('sim-total-cost-output', total != null ? formatFcfa(total) : '—');
  setText('sim-rest-to-live-output', `${formatFcfa(Math.max(0, rest))} / mois`);

  const badge = document.getElementById('sim-eligibility-badge');
  if (badge) {
    const ok = status === 'SUFFICIENT' || (status === '' && rest >= (monthly ?? 0));
    badge.className = `badge ${ok ? 'badge-approved' : 'badge-warning'}`;
    badge.innerHTML = ok
      ? '<i class="fas fa-circle-check"></i> Mensualité compatible'
      : '<i class="fas fa-triangle-exclamation"></i> À revoir avec l’agent';
  }
  const mode = document.getElementById('sim-scoring-mode-label');
  if (mode) {
    mode.innerHTML = 'Comparaison calculée pour votre dossier';
  }
  const bar = document.getElementById('sim-ratio-bar');
  if (bar && income > 0 && monthly != null) {
    const ratio = Math.min(100, ((expenses + monthly) / income) * 100);
    bar.style.width = `${ratio}%`;
    bar.style.background = ratio <= 40 ? '#518e45' : ratio <= 55 ? '#f1ca30' : '#ef4444';
  }
  if (monthly != null && total != null && total > 0) {
    const capitalPct = Math.round((amount / total) * 100);
    const interestPct = interest != null ? Math.round((interest / total) * 100) : Math.max(0, 100 - capitalPct);
    const feesPct = Math.max(0, 100 - capitalPct - interestPct);
    setText('sim-pie-capital-pct', `${capitalPct}%`);
    setText('sim-pie-interest-pct', `${interestPct}%`);
    setText('sim-pie-fees-pct', `${feesPct}%`);
    setText('sim-pie-capital-val', formatFcfa(amount));
    setText('sim-pie-interest-val', interest != null ? formatFcfa(interest) : '—');
    setText('sim-pie-fees-val', fees != null ? formatFcfa(fees) : '—');
    setText('sim-pie-center-val', '100%');
  }

  const compare = document.getElementById('sim-compare-list');
  if (compare) {
    const others = alts.filter((row) => row !== main && row.duration_months !== duration);
    compare.innerHTML = others.length
      ? others
          .map((row) => {
            const pay = scenarioMonthly(row);
            return `<div style="display:flex;justify-content:space-between;gap:0.5rem;font-size:0.78rem">
              <span>${row.duration_months ?? '—'} mois</span>
              <strong>${pay != null ? formatFcfa(pay) : '—'}</strong>
            </div>`;
          })
          .join('')
      : '<p style="margin:0;font-size:0.76rem;color:var(--text-muted)">Un seul scénario renvoyé.</p>';
  }
}

export async function hydrateSimulatorFromProfile() {
  try {
    const profile = await fetchFinancialProfile();
    const income = document.getElementById('sim-income-input') as HTMLInputElement | null;
    const charges = document.getElementById('sim-charges-input') as HTMLInputElement | null;
    if (income && profile?.monthly_income != null && !income.dataset.userEdited) {
      const other = profile.other_income ?? 0;
      income.value = String(profile.monthly_income + other);
    }
    if (charges && !charges.dataset.userEdited) {
      const totalCharges = (profile?.monthly_expenses ?? 0) + (profile?.existing_debt_payment ?? 0);
      if (totalCharges > 0) {
        charges.value = String(totalCharges);
      }
    }
  } catch {
    // empty fields stay as typed
  }
  await refreshClientSimulation();
}

export function scheduleClientSimulation() {
  if (timer) {
    window.clearTimeout(timer);
  }
  timer = window.setTimeout(() => {
    void refreshClientSimulation();
  }, 400);
}

export async function refreshClientSimulation() {
  const amount = num('sim-amount-range', 2500000);
  const duration = num('sim-duration-range', 12);
  const income = num('sim-income-input', 0);
  const expenses = num('sim-charges-input', 0);
  setText('sim-amount-label', formatFcfa(amount));
  setText('sim-duration-label', `${duration} mois`);
  if (amount < 10000) {
    return;
  }
  try {
    const rows = await simulateInstallments({
      monthly_income: income || undefined,
      monthly_expenses: expenses || undefined,
      scenarios: durationOptions(duration).map((months) => ({ requested_amount: amount, duration_months: months })),
    });
    const main = pickMain(rows, amount, duration);
    if (!main) {
      toast.info('Aucun scénario n’a été renvoyé pour ces montants.');
      return;
    }
    paint(main, amount, duration, income, expenses, rows);
  } catch (error) {
    toast.danger(isApiError(error) ? error.message : 'Simulation indisponible pour le moment.');
  }
}

export function applySimulationToLoan(open: (prefill: { amount: number; duration: number; purpose: string; income?: number; expenses?: number }) => void) {
  const amount = num('sim-amount-range', lastPainted?.requested_amount ?? 0);
  const duration = num('sim-duration-range', lastPainted?.duration_months ?? 12);
  const income = num('sim-income-input', 0);
  const expenses = num('sim-charges-input', 0);
  if (amount < 10000) {
    toast.warning('Choisissez un montant avant de déposer la demande.');
    return;
  }
  open({
    amount,
    duration,
    purpose: 'Demande issue du simulateur',
    income: income || undefined,
    expenses: expenses || undefined,
  });
  toast.success(`Montant et durée repris dans la demande : ${formatFcfa(amount)} sur ${duration} mois.`);
}

function compactChip(kind: 'amount' | 'duration', value: number) {
  document.querySelectorAll(`[id^="chip-${kind}-"]`).forEach((node) => {
    node.classList.toggle('active', node.id === `chip-${kind}-${value}`);
  });
}

function paintCompact(main: SimulationScenarioResult, amount: number, duration: number) {
  const monthly = scenarioMonthly(main);
  const interest = scenarioInterest(main);
  const total = scenarioTotal(main, amount);
  const fees = main.fees ?? main.insurance ?? 0;
  setText('compact-est-amount-val', formatFcfa(amount));
  setText('compact-est-duration-val', `${duration} Mois`);
  setText('compact-est-monthly-val', monthly != null ? formatFcfa(monthly) : 'Calcul…');
  setText('compact-est-total-interest', interest != null ? formatFcfa(interest) : '—');
  setText('compact-est-total-val', total != null ? formatFcfa(total) : '—');
  setText('amortization-table-summary-title', `${formatFcfa(amount)} sur ${duration} Mois`);
  if (monthly != null && total != null && total > 0) {
    const capitalPct = Math.round((amount / total) * 100);
    const interestPct = interest != null ? Math.round((interest / total) * 100) : Math.max(0, 100 - capitalPct);
    const feesPct = Math.max(0, 100 - capitalPct - interestPct);
    setText('compact-pie-pct-capital', `${capitalPct}%`);
    setText('compact-pie-pct-interest', `${interestPct}%`);
    setText('compact-pie-pct-fees', `${feesPct}%`);
    setText('compact-pie-val-capital', formatFcfa(amount));
    setText('compact-pie-val-interest', interest != null ? formatFcfa(interest) : '—');
    setText('compact-pie-val-fees', fees > 0 ? formatFcfa(fees) : '—');
    const capitalBar = document.getElementById('compact-bar-capital');
    const interestBar = document.getElementById('compact-bar-interest');
    const feesBar = document.getElementById('compact-bar-fees');
    if (capitalBar) {
      capitalBar.style.width = `${capitalPct}%`;
    }
    if (interestBar) {
      interestBar.style.width = `${interestPct}%`;
    }
    if (feesBar) {
      feesBar.style.width = `${feesPct}%`;
    }
  }
}

let compactTimer: number | null = null;

export function scheduleCompactEstimator() {
  if (compactTimer) {
    window.clearTimeout(compactTimer);
  }
  compactTimer = window.setTimeout(() => {
    void refreshCompactEstimator();
  }, 350);
}

export async function refreshCompactEstimator() {
  const amount = num('compact-est-amount-range', 2500000);
  const duration = num('compact-est-duration-range', 12);
  setText('compact-est-amount-val', formatFcfa(amount));
  setText('compact-est-duration-val', `${duration} Mois`);
  compactChip('amount', amount);
  compactChip('duration', duration);
  if (amount < 10000) {
    return;
  }
  let income = 0;
  let expenses = 0;
  try {
    const profile = await fetchFinancialProfile();
    income = (profile?.monthly_income ?? 0) + (profile?.other_income ?? 0);
    expenses = (profile?.monthly_expenses ?? 0) + (profile?.existing_debt_payment ?? 0);
  } catch {
    /* estimate without declared income */
  }
  try {
    const rows = await simulateInstallments({
      monthly_income: income || undefined,
      monthly_expenses: expenses || undefined,
      scenarios: [{ requested_amount: amount, duration_months: duration }],
    });
    const main = pickMain(rows, amount, duration);
    if (!main) {
      return;
    }
    paintCompact(main, amount, duration);
  } catch (error) {
    toast.danger(isApiError(error) ? error.message : 'Calculateur indisponible pour le moment.');
  }
}

export function applyFromCompactEstimator(open: (prefill: { amount: number; duration: number; purpose: string }) => void) {
  const amount = num('compact-est-amount-range', 2500000);
  const duration = num('compact-est-duration-range', 12);
  if (amount < 10000) {
    toast.warning('Choisissez un montant avant de déposer la demande.');
    return;
  }
  open({
    amount,
    duration,
    purpose: 'Demande issue du calculateur',
  });
  toast.success(`Montant et durée repris : ${formatFcfa(amount)} sur ${duration} mois.`);
}

