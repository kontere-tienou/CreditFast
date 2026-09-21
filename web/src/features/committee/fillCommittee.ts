import { toast } from '@heroui/react';
import {
  getCreditRequest,
  listCommitteeRequests,
  loadCreditAnalysis,
  submitCommitteeDecision,
  type CreditAnalysis,
  type CreditRequest,
} from '@/api/credit';
import { isApiError } from '@/api/errors';
import {
  borrowerName,
  creditStatusLabel,
  formatFcfa,
  getSelectedCreditRequestId,
  notifyRequestsChanged,
  setSelectedCreditRequestId,
} from '@/features/workflow/workflow';
import { isCommitteePending } from './useCommitteeWorkspace';

function setText(id: string, value: string) {
  const node = document.getElementById(id);
  if (node) {
    node.textContent = value;
  }
}

function setHtml(id: string, value: string) {
  const node = document.getElementById(id);
  if (node) {
    node.innerHTML = value;
  }
}

function showBackdrop(id: string, visible = true) {
  const modal = document.getElementById(id);
  if (!modal) {
    return;
  }
  if (!visible) {
    modal.classList.remove('active');
    modal.style.display = 'none';
    return;
  }
  modal.style.display = 'flex';
  window.requestAnimationFrame(() => modal.classList.add('active'));
}

function dash(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed || '—';
}

function formatScore(value?: number) {
  if (value == null || Number.isNaN(value)) {
    return null;
  }
  return Math.round(value <= 1 ? value * 100 : value);
}

function scoringLabel(recommendation?: string) {
  const key = (recommendation || '').toUpperCase();
  if (key === 'FAVORABLE') {
    return 'Avis favorable';
  }
  if (key === 'RESERVED') {
    return 'Avis réservé';
  }
  if (key === 'UNFAVORABLE') {
    return 'Avis défavorable';
  }
  return recommendation ? recommendation : 'Avis non renseigné';
}

function analystNotes(analysis: CreditAnalysis | null, row: CreditRequest) {
  const summary = analysis?.analysis_summary?.trim() || '';
  if (summary && !/cold start|api|ocr|xai|modèle scoring/i.test(summary)) {
    return summary;
  }
  const parts = [scoringLabel(analysis?.recommendation)];
  if (row.purpose) {
    parts.push(`Objet : ${row.purpose}.`);
  }
  return parts.join(' ');
}

function riskTone(score: number | null) {
  if (score == null) {
    return { label: 'Non calculé', cls: 'badge badge-submitted' };
  }
  if (score >= 75) {
    return { label: 'Risque faible', cls: 'badge badge-approved' };
  }
  if (score >= 50) {
    return { label: 'Risque modéré', cls: 'badge badge-submitted' };
  }
  return { label: 'Risque élevé', cls: 'badge badge-rejected' };
}

function fieldNumber(id: string, fallback?: number) {
  const node = document.getElementById(id) as HTMLInputElement | HTMLSelectElement | null;
  const value = Number(node?.value);
  if (Number.isFinite(value) && value > 0) {
    return value;
  }
  return fallback;
}

function fieldText(id: string) {
  const node = document.getElementById(id) as HTMLInputElement | null;
  return node?.value?.trim() || '';
}

async function loadRequest(id: number) {
  try {
    return await getCreditRequest(id);
  } catch {
    const rows = await listCommitteeRequests().catch(() => [] as CreditRequest[]);
    return rows.find((row) => row.id === id) ?? null;
  }
}

function borrowerLocation(row: CreditRequest) {
  return row.client?.city || row.client?.residential_zone || row.client?.address || '';
}

function setBar(id: string, value: number | null) {
  const bar = document.getElementById(id);
  if (!bar) {
    return;
  }
  const pct = value == null ? 0 : Math.max(0, Math.min(100, value));
  bar.style.width = `${pct}%`;
}

function bindLiveEstimate(row: CreditRequest) {
  const update = () => {
    const amount = fieldNumber('com-approved-amount', row.requested_amount) ?? 0;
    const duration = fieldNumber('com-approved-duration', row.duration_months) ?? 12;
    const rate = fieldNumber('com-interest-rate', 11.5) ?? 11.5;
    const monthly =
      duration > 0 ? Math.round((amount * (1 + (rate / 100) * (duration / 12))) / duration) : 0;
    const income = row.declared_monthly_income ?? 0;
    const effort = income > 0 ? ((monthly / income) * 100).toFixed(1) : '—';
    setText('com-live-monthly-payment', `${formatFcfa(monthly)} / mois`);
    const ratioEl = document.getElementById('com-live-effort-ratio');
    if (ratioEl) {
      ratioEl.textContent = effort === '—' ? '—' : `${effort}%`;
      const n = Number(effort);
      ratioEl.style.color = !Number.isFinite(n) || n <= 33 ? '#518e45' : '#b45309';
    }
  };
  ['com-approved-amount', 'com-approved-duration', 'com-interest-rate'].forEach((id) => {
    const node = document.getElementById(id) as HTMLElement | null;
    if (!node || node.dataset.bound === '1') {
      return;
    }
    node.addEventListener('input', update);
    node.addEventListener('change', update);
    node.dataset.bound = '1';
  });
  update();
}

function fillShared(row: CreditRequest, analysis: CreditAnalysis | null) {
  const name = borrowerName(row);
  const location = dash(borrowerLocation(row));
  const score = formatScore(analysis?.overall_score);
  const confidence = formatScore(analysis?.confidence_score);
  const income = row.declared_monthly_income;
  const expenses = row.declared_monthly_expenses;
  const disposable = income != null && expenses != null ? income - expenses : undefined;
  const risk = riskTone(score);
  const cashflow = formatScore(analysis?.repayment_capacity_score ?? analysis?.income_consistency_score);
  const guarantee = formatScore(analysis?.guarantee_score);
  const stability = formatScore(analysis?.credit_history_score ?? analysis?.activity_score);

  setText('com-dossier-num', `#${row.id}`);
  setHtml('com-client-name', `<i class="fas fa-user mr-1"></i> ${name}${location !== '—' ? ` (${location})` : ''}`);
  setText('com-requested-amount', formatFcfa(row.requested_amount));
  setText('com-requested-duration', row.duration_months ? `${row.duration_months} mois` : '—');
  setText('com-score-value', score != null ? String(score) : '—');
  setHtml('com-risk-level', risk.label);
  const riskEl = document.getElementById('com-risk-level');
  if (riskEl) {
    riskEl.className = risk.cls;
  }
  setText('com-disposable-income', formatFcfa(disposable));
  setText(
    'com-analyst-notes',
    analystNotes(analysis, row),
  );

  const amountInput = document.getElementById('com-approved-amount') as HTMLInputElement | null;
  if (amountInput) {
    amountInput.value = String(row.requested_amount ?? '');
  }
  const durationSelect = document.getElementById('com-approved-duration') as HTMLSelectElement | null;
  if (durationSelect && row.duration_months) {
    const value = String(row.duration_months);
    if (![...durationSelect.options].some((option) => option.value === value)) {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = `${row.duration_months} mois`;
      durationSelect.appendChild(option);
    }
    durationSelect.value = value;
  }
  const conditions = document.getElementById('com-conditions') as HTMLInputElement | null;
  if (conditions && !conditions.value) {
    conditions.value = '';
    conditions.placeholder = 'Motif ou conditions (au moins 5 caractères)';
  }

  setText('com-drawer-req-badge', `#${row.id}`);
  setHtml('com-drawer-risk-badge', `<i class="fas fa-shield-halved"></i> ${risk.label}`);
  const drawerRisk = document.getElementById('com-drawer-risk-badge');
  if (drawerRisk) {
    drawerRisk.className = risk.cls;
  }
  setText('com-drawer-title', name);
  setText('com-drawer-subtitle', `Dossier • ${creditStatusLabel(row.status)} • ${formatFcfa(row.requested_amount)}`);
  setText('com-drawer-client-id', row.client_id ? `ID ${row.client_id}` : '—');
  setText('com-drawer-client-name', name);
  setHtml('com-drawer-location', `<i class="fas fa-location-dot text-primary mr-1"></i> ${location}`);
  const avatar = document.getElementById('com-drawer-avatar') as HTMLImageElement | null;
  if (avatar) {
    avatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1b4332&color=fff`;
  }
  setText('com-drawer-amount', formatFcfa(row.requested_amount));
  setText('com-drawer-duration', row.duration_months ? `Durée : ${row.duration_months} mois` : 'Durée : —');
  setText('com-drawer-installment', formatFcfa(row.estimated_monthly_payment));
  setText('com-drawer-activity', dash(row.purpose || row.client?.occupation));
  setText('com-drawer-surplus', formatFcfa(disposable));
  setHtml(
    'com-drawer-conf-badge',
    `<i class="fas fa-check-double"></i> Confiance ${confidence != null ? `${confidence}%` : '—'}`,
  );
  setText('com-drawer-overall-score', score != null ? String(score) : '—');
  setText('com-drawer-pillar-cashflow', cashflow != null ? `${cashflow} / 100` : '—');
  setText('com-drawer-pillar-coldstart', guarantee != null ? `${guarantee} / 100` : '—');
  setText('com-drawer-pillar-stability', stability != null ? `${stability} / 100` : '—');
  setBar('com-drawer-bar-cashflow', cashflow);
  setBar('com-drawer-bar-coldstart', guarantee);
  setBar('com-drawer-bar-stability', stability);

  const voteGrid = document.querySelector('.committee-decision-cards-grid') as HTMLElement | null;
  if (voteGrid) {
    voteGrid.style.opacity = isCommitteePending(row.status) ? '1' : '0.55';
    voteGrid.style.pointerEvents = isCommitteePending(row.status) ? 'auto' : 'none';
  }

  bindLiveEstimate(row);
}

export async function fillAndOpenCommitteeDrawer(identifier?: string) {
  const parsed = Number(identifier);
  const selected = Number.isFinite(parsed) && parsed > 0 ? parsed : getSelectedCreditRequestId();
  if (!selected) {
    toast.info('Aucun dossier sélectionné.');
    return;
  }
  const row = await loadRequest(selected);
  if (!row) {
    toast.info('Dossier introuvable.');
    return;
  }
  setSelectedCreditRequestId(row.id);
  const analysis = await loadCreditAnalysis(row.id).catch(() => null);
  fillShared(row, analysis);
  showBackdrop('committee-drawer-backdrop');
}

export async function fillAndOpenCommitteeModal(identifier?: string) {
  const parsed = Number(identifier);
  const selected = Number.isFinite(parsed) && parsed > 0 ? parsed : getSelectedCreditRequestId();
  if (!selected) {
    toast.info('Aucun dossier sélectionné.');
    return;
  }
  const row = await loadRequest(selected);
  if (!row) {
    toast.info('Dossier introuvable.');
    return;
  }
  setSelectedCreditRequestId(row.id);
  const analysis = await loadCreditAnalysis(row.id).catch(() => null);
  fillShared(row, analysis);
  showBackdrop('committee-drawer-backdrop', false);
  showBackdrop('committee-modal');
}

export function closeCommitteeDrawer() {
  showBackdrop('committee-drawer-backdrop', false);
}

export function closeCommitteeModal() {
  showBackdrop('committee-modal', false);
}

export async function openCommitteeModalFromDrawer() {
  const id = getSelectedCreditRequestId();
  await fillAndOpenCommitteeModal(id ? String(id) : undefined);
}

export async function openFirstPendingCommitteeVote() {
  const rows = await listCommitteeRequests().catch(() => [] as CreditRequest[]);
  const first = rows.find((row) => isCommitteePending(row.status)) ?? rows[0];
  if (!first) {
    toast.info('Aucun dossier en attente de vote.');
    return;
  }
  await fillAndOpenCommitteeModal(String(first.id));
}

let deciding = false;

export async function submitCommitteeDecisionFromModal(rawDecision?: string) {
  if (deciding) {
    return;
  }
  const id = getSelectedCreditRequestId();
  if (!id) {
    toast.info('Ouvrez d’abord un dossier.');
    return;
  }
  const row = await loadRequest(id);
  if (!row) {
    toast.info('Dossier introuvable.');
    return;
  }
  if (!isCommitteePending(row.status)) {
    toast.info('Ce dossier a déjà été tranché.');
    return;
  }

  const amount = fieldNumber('com-approved-amount', row.requested_amount);
  const duration = fieldNumber('com-approved-duration', row.duration_months);
  let comment = fieldText('com-conditions');
  const intent = (rawDecision || 'APPROVED').toUpperCase();

  let decision: 'APPROVED' | 'REJECTED' | 'AMENDED' = 'APPROVED';
  if (intent === 'REJECTED') {
    decision = 'REJECTED';
    if (comment.length < 5) {
      comment = 'Refus du comité de crédit.';
    }
  } else if (intent === 'AMENDED' || intent === 'RESERVED') {
    const sameAmount = amount != null && row.requested_amount != null && amount === row.requested_amount;
    const sameDuration = duration != null && row.duration_months != null && duration === row.duration_months;
    decision = sameAmount && sameDuration ? 'APPROVED' : 'AMENDED';
    if (comment.length < 5) {
      comment = decision === 'AMENDED' ? 'Accord du comité avec conditions ajustées.' : 'Accord du comité.';
    }
  } else {
    const sameAmount = amount != null && row.requested_amount != null && amount === row.requested_amount;
    const sameDuration = duration != null && row.duration_months != null && duration === row.duration_months;
    decision = sameAmount && sameDuration ? 'APPROVED' : 'AMENDED';
    if (comment.length < 5) {
      comment = decision === 'AMENDED' ? 'Accord du comité avec montant ou durée ajustés.' : 'Accord du comité.';
    }
  }

  try {
    deciding = true;
    await submitCommitteeDecision(id, {
      decision,
      comment,
      ...(decision === 'REJECTED'
        ? {}
        : {
            approved_amount: amount,
            approved_duration_months: duration,
          }),
    });
    closeCommitteeModal();
    closeCommitteeDrawer();
    notifyRequestsChanged();
    const labels = {
      APPROVED: 'Crédit accordé aux conditions demandées.',
      AMENDED: 'Crédit accordé avec les conditions ajustées.',
      REJECTED: 'Dossier refusé par le comité.',
    };
    toast.success(labels[decision]);
  } catch (error) {
    toast.danger(isApiError(error) ? error.message : 'La décision n’a pas pu être enregistrée.');
  } finally {
    deciding = false;
  }
}
