import { toast } from '@heroui/react';
import {
  getCreditRequest,
  listAgentRequests,
  listCreditRequestDocuments,
  listCreditRequestGuarantees,
  loadCreditAnalysis,
  requestComplements,
  verifyGuarantee,
  submitAnalystReview,
  submitHumanValidation,
  resolveAnomaly,
  type CreditAnalysis,
  type CreditGuarantee,
  type CreditRequest,
} from '@/api/credit';
import { getAgentClient, listAgentClientKycDocuments, verifyKycDocument, agentClientName, type AgentClient } from '@/api/agent';
import type { KycDocument } from '@/api/profile';
import { isApiError } from '@/api/errors';
import { getUiSession } from '@/app/session';
import { documentCheck, identityCheck, isDocumentRejected } from '@/features/workflow/compliance';
import { borrowerName, creditStatusLabel, formatDate, formatFcfa, getSelectedCreditRequestId, notifyRequestsChanged, setSelectedCreditRequestId } from '@/features/workflow/workflow';

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

function phoneHref(phone?: string | null, scheme: 'tel' | 'sms' = 'tel') {
  const digits = (phone || '').replace(/[^\d+]/g, '');
  return digits ? `${scheme}:${digits}` : null;
}

function bindHrefButton(id: string, href: string | null, emptyMessage: string) {
  const button = document.getElementById(id) as HTMLButtonElement | null;
  if (!button) {
    return;
  }
  button.onclick = (event) => {
    event.preventDefault();
    if (!href) {
      toast.info(emptyMessage);
      return;
    }
    window.location.href = href;
  };
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
  return recommendation ? recommendation : 'Non calculé';
}

function formatScore(value?: number) {
  if (value == null || Number.isNaN(value)) {
    return null;
  }
  return Math.round(value <= 1 ? value * 100 : value);
}

function locationFrom(fiche: AgentClient | null, request: CreditRequest) {
  return (
    fiche?.city ||
    fiche?.residential_zone ||
    fiche?.address ||
    request.client?.city ||
    request.client?.residential_zone ||
    request.client?.address ||
    ''
  );
}

async function loadRequest(id: number) {
  try {
    return await getCreditRequest(id);
  } catch {
    const rows = await listAgentRequests().catch(() => [] as CreditRequest[]);
    return rows.find((row) => row.id === id) ?? null;
  }
}

async function loadFiche(request: CreditRequest) {
  const clientId = request.client_id ?? request.client?.id;
  if (!clientId) {
    return null;
  }
  try {
    return await getAgentClient(clientId);
  } catch {
    return null;
  }
}

function mergeBorrower(request: CreditRequest, fiche: AgentClient | null) {
  const user = fiche?.user || request.client?.user;
  const name =
    (fiche ? agentClientName(fiche) : '') ||
    borrowerName({ client: { ...request.client, user } });
  return {
    name,
    phone: user?.phone || request.client?.phone || null,
    email: user?.email || request.client?.email || null,
    occupation: fiche?.occupation || request.client?.occupation || '',
    location: locationFrom(fiche, request),
    number: fiche?.client_number || request.client?.client_number || (request.client_id ? `#${request.client_id}` : ''),
    kyc: fiche?.kyc_status || request.client?.kyc_status || '',
  };
}

function applyScore(analysis: CreditAnalysis | null) {
  const score = formatScore(analysis?.overall_score);
  const confidence = formatScore(analysis?.confidence_score);
  setText('agent-drawer-score-val', score != null ? String(score) : '—');
  setText('agent-drawer-score-label', scoringLabel(analysis?.recommendation));
  setText('agent-drawer-confidence-val', confidence != null ? `${confidence}%` : '—');
  const progress = document.getElementById('agent-drawer-score-progress');
  if (progress) {
    progress.style.width = `${score ?? 0}%`;
  }
  const badge = document.getElementById('agent-drawer-score-label');
  if (badge) {
    const key = (analysis?.recommendation || '').toUpperCase();
    badge.className = `badge ${key === 'FAVORABLE' ? 'badge-approved' : key === 'UNFAVORABLE' ? 'badge-rejected' : 'badge-submitted'}`;
    badge.style.fontSize = '0.7rem';
  }
}

export async function fillAndOpenAgentDrawer(identifier?: string) {
  const parsed = Number(identifier);
  const selected = Number.isFinite(parsed) && parsed > 0 ? parsed : getSelectedCreditRequestId();
  if (!selected) {
    toast.info('Aucun dossier sélectionné.');
    return;
  }
  const row = await loadRequest(selected);
  if (!row) {
    toast.info('Dossier introuvable en base.');
    return;
  }
  setSelectedCreditRequestId(row.id);

  const clientId = row.client_id ?? row.client?.id;
  const [docs, guarantees, fiche, analysis, kycDocs] = await Promise.all([
    listCreditRequestDocuments(row.id).catch(() => []),
    listCreditRequestGuarantees(row.id).catch(() => [] as CreditGuarantee[]),
    loadFiche(row),
    loadCreditAnalysis(row.id).catch(() => null),
    clientId ? listAgentClientKycDocuments(clientId).catch(() => [] as KycDocument[]) : Promise.resolve([] as KycDocument[]),
  ]);

  const nestedKyc = Array.isArray(fiche?.kyc_documents) ? fiche.kyc_documents : [];
  const identityDocs = kycDocs.length ? kycDocs : nestedKyc;
  const guarantee = guarantees[0];
  const income = row.declared_monthly_income;
  const expenses = row.declared_monthly_expenses;
  const disposable = income != null && expenses != null ? income - expenses : undefined;
  const borrower = mergeBorrower(row, fiche);
  const capacity = (row.repayment_capacity_status || '').toUpperCase();

  setText('agent-drawer-title', `Dossier #${row.id}`);
  setText('agent-drawer-date', `Déposé le ${formatDate(row.submitted_at || row.created_at)}`);
  setText('agent-drawer-hero-amount', formatFcfa(row.requested_amount));
  const statusEl = document.getElementById('agent-drawer-hero-status');
  if (statusEl) {
    statusEl.textContent = creditStatusLabel(row.status);
  }
  setText('agent-drawer-client-number', dash(borrower.number));
  setText('agent-drawer-client-name', borrower.name);
  setText('agent-drawer-client-occupation', dash(borrower.occupation));
  setText('agent-drawer-client-location', dash(borrower.location));
  setText('agent-drawer-client-phone', dash(borrower.phone));
  setText('agent-drawer-client-email', dash(borrower.email));
  const kyc = document.getElementById('agent-drawer-client-kyc');
  if (kyc) {
    const ident = identityCheck(borrower.kyc);
    kyc.textContent = borrower.kyc ? ident.label : '—';
    kyc.className = ident.badgeClass;
    kyc.style.fontSize = '0.68rem';
    (kyc as HTMLElement).style.alignSelf = 'flex-start';
  }
  const avatar = document.getElementById('agent-drawer-client-avatar') as HTMLImageElement | null;
  if (avatar) {
    avatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(borrower.name)}&background=1b4332&color=fff`;
  }
  bindHrefButton('agent-drawer-btn-sms', phoneHref(borrower.phone, 'sms'), 'Aucun téléphone en base.');
  bindHrefButton('agent-drawer-btn-call', phoneHref(borrower.phone, 'tel'), 'Aucun téléphone en base.');

  setHtml(
    'agent-drawer-capacity-badge',
    capacity === 'SUFFICIENT'
      ? '<span class="badge badge-approved">Capacité suffisante</span>'
      : capacity === 'INSUFFICIENT'
        ? '<span class="badge badge-rejected">Capacité insuffisante</span>'
        : '<span class="badge badge-submitted">—</span>',
  );
  setText('agent-drawer-duration', row.duration_months ? `${row.duration_months} mois` : '—');
  setText('agent-drawer-monthly-payment', formatFcfa(row.estimated_monthly_payment));
  setText('agent-drawer-income', formatFcfa(income));
  setText('agent-drawer-expenses', formatFcfa(expenses));
  setText('agent-drawer-disposable', formatFcfa(disposable));
  setText('agent-drawer-purpose', row.purpose || '—');
  setText('agent-drawer-guarantee-type', guarantee?.guarantee_type || '—');
  setText('agent-drawer-guarantee-desc', guarantee?.description || '—');
  setText('agent-drawer-guarantee-declared', formatFcfa(guarantee?.declared_value));
  setText('agent-drawer-guarantee-verified', formatFcfa(guarantee?.verified_value));
  setText('agent-drawer-guarantee-status', guarantee?.verification_status || 'Aucune');
  const totalPieces = docs.length + identityDocs.length;
  const complianceIssues = docs.filter(isDocumentRejected).length + identityDocs.filter(isDocumentRejected).length;
  const docsCount = document.getElementById('agent-drawer-docs-count');
  if (docsCount) {
    docsCount.textContent = `${totalPieces} pièce${totalPieces > 1 ? 's' : ''}`;
    docsCount.className = complianceIssues ? 'badge badge-rejected' : 'badge badge-submitted';
  }
  const list = document.getElementById('agent-drawer-docs-list');
  if (list) {
    const creditLines = docs.map((doc) => {
      const check = documentCheck(doc.status);
      const excerpt = doc.analysis_summary || (typeof doc.extracted_text === 'string' ? doc.extracted_text.slice(0, 90) : '');
      return `<div data-open-doc="CREDIT-${row.id}-${doc.id}" style="padding:0.45rem 0.55rem;border:1px solid var(--border-color);border-radius:var(--radius-sm);background:var(--bg-surface-secondary);cursor:pointer">
        <div style="display:flex;justify-content:space-between;gap:0.5rem;align-items:center">
          <span style="font-size:0.8rem;font-weight:600">${doc.original_filename || doc.document_type || 'Pièce de crédit'}</span>
          <span class="${check.badgeClass}" style="font-size:0.65rem;flex-shrink:0">${check.label}</span>
        </div>
        ${excerpt ? `<p style="margin:0.35rem 0 0;font-size:0.72rem;color:var(--text-muted)">${excerpt}${excerpt.length >= 90 ? '…' : ''}</p>` : '<p style="margin:0.35rem 0 0;font-size:0.72rem;color:var(--text-muted)">Le système lit cette pièce après dépôt. Cliquez pour ouvrir.</p>'}
      </div>`;
    });
    const kycLines = identityDocs.map((doc) => {
      const check = identityCheck(doc.status);
      const pending = check.tone !== 'good' && check.tone !== 'bad';
      return `<div data-open-doc="${clientId ? `KYC-${clientId}-${doc.id}` : `KYC-${doc.id}`}" style="padding:0.45rem 0.55rem;border:1px solid var(--border-color);border-radius:var(--radius-sm);cursor:pointer">
        <div style="display:flex;justify-content:space-between;gap:0.5rem;align-items:center">
          <span style="font-size:0.8rem;font-weight:600">Identité · ${doc.original_filename || doc.document_type || 'Pièce'}</span>
          <span class="${check.badgeClass}" style="font-size:0.65rem;flex-shrink:0">${check.label}</span>
        </div>
        ${pending && clientId ? `<div style="display:flex;gap:0.35rem;margin-top:0.4rem">
          <button type="button" class="btn btn-primary btn-sm" data-kyc-decision="VERIFIED" data-kyc-id="${doc.id}" style="font-size:0.68rem">Identité conforme</button>
          <button type="button" class="btn btn-secondary btn-sm" data-kyc-decision="REJECTED" data-kyc-id="${doc.id}" style="font-size:0.68rem">Non conforme</button>
        </div>` : ''}
      </div>`;
    });
    list.innerHTML =
      creditLines.concat(kycLines).join('') ||
      '<p style="margin:0;font-size:0.8rem;color:var(--text-muted)">Aucune pièce en base. Demandez des compléments.</p>';
    list.onclick = (event) => {
      const kycBtn = (event.target as HTMLElement).closest<HTMLElement>('[data-kyc-decision]');
      if (kycBtn && clientId) {
        event.stopPropagation();
        const documentId = Number(kycBtn.dataset.kycId);
        const decision = kycBtn.dataset.kycDecision as 'VERIFIED' | 'REJECTED';
        void verifyIdentityFromDrawer(clientId, documentId, decision);
        return;
      }
      const open = (event.target as HTMLElement).closest<HTMLElement>('[data-open-doc]');
      if (open?.dataset.openDoc) {
        void import('@/features/workflow/fillDocLightbox').then(({ openDocLightbox }) => openDocLightbox(open.dataset.openDoc));
      }
    };
  }
  applyScore(analysis);
  const ready =
    docs.length > 0 &&
    !docs.some(isDocumentRejected) &&
    !identityDocs.some(isDocumentRejected) &&
    guarantees.some((item) => (item.verification_status || '').toUpperCase() === 'VERIFIED');
  const transfer = document.getElementById('agent-drawer-btn-transfer') as HTMLButtonElement | null;
  if (transfer) {
    transfer.style.display = ready ? '' : 'none';
    transfer.disabled = !ready;
    transfer.title = ready
      ? 'Transmettre à l’analyste'
      : 'Pièces conformes, garantie et contrôle terrain sont requis.';
  }
  const analyse = document.getElementById('agent-drawer-btn-360') as HTMLButtonElement | null;
  if (analyse) {
    analyse.style.gridColumn = ready ? 'auto' : '1 / -1';
  }
  const complements = document.getElementById('agent-drawer-btn-complements');
  if (complements) {
    complements.className = `btn btn-sm agent-drawer-footer-btn ${ready ? 'btn-secondary' : 'btn-primary'}`;
  }
  showBackdrop('agent-drawer-backdrop');
}

export async function verifyIdentityFromDrawer(
  clientId: number,
  documentId: number,
  decision: 'VERIFIED' | 'REJECTED',
) {
  try {
    await verifyKycDocument(clientId, documentId, {
      decision,
      rejection_reason: decision === 'REJECTED' ? 'Pièce d’identité illisible ou non conforme.' : undefined,
    });
    notifyRequestsChanged();
    toast.success(decision === 'VERIFIED' ? 'Identité marquée conforme.' : 'Identité marquée non conforme.');
    await fillAndOpenAgentDrawer(String(getSelectedCreditRequestId() || ''));
  } catch (error) {
    toast.danger(isApiError(error) ? error.message : 'Impossible d’enregistrer le contrôle d’identité.');
  }
}

export async function requestComplementsFromAgentDrawer() {
  const id = getSelectedCreditRequestId();
  if (!id) {
    toast.info('Aucun dossier sélectionné.');
    return;
  }
  const comment = window.prompt(
    'Message au client (min. 5 caractères) :',
    'Merci de joindre les pièces justificatives et de déclarer une garantie pour que le dossier puisse être transmis à l’analyste.',
  );
  if (comment == null) {
    return;
  }
  if (comment.trim().length < 5) {
    toast.warning('Le commentaire doit contenir au moins 5 caractères.');
    return;
  }
  try {
    await requestComplements(id, comment.trim());
    notifyRequestsChanged();
    toast.success('Compléments demandés. Le demandeur est notifié dans son espace.');
    await fillAndOpenAgentDrawer(String(id));
  } catch (error) {
    toast.danger(isApiError(error) ? error.message : 'Impossible de demander des compléments.');
  }
}

export async function fillAndOpenInspectionDrawer(identifier?: string) {
  const guaranteeId = Number(identifier);
  if (!Number.isFinite(guaranteeId) || guaranteeId <= 0) {
    toast.info('Aucune garantie sélectionnée.');
    return;
  }
  const requests = await listAgentRequests().catch(() => [] as CreditRequest[]);
  let match: { request: CreditRequest; guarantee: CreditGuarantee } | null = null;
  for (const request of requests) {
    const items = await listCreditRequestGuarantees(request.id).catch(() => [] as CreditGuarantee[]);
    const guarantee = items.find((item) => item.id === guaranteeId);
    if (guarantee) {
      match = { request, guarantee };
      break;
    }
  }
  if (!match) {
    toast.info('Garantie introuvable en base.');
    return;
  }
  setSelectedCreditRequestId(match.request.id);
  const fiche = await loadFiche(match.request);
  const name = mergeBorrower(match.request, fiche).name;
  setText('insp-drawer-title', `Inspection • Dossier #${match.request.id}`);
  setText('insp-drawer-req-num', `#${match.request.id}`);
  setText('insp-drawer-client-name', name);
  setText('insp-drawer-client-loc', dash(locationFrom(fiche, match.request)));
  setText('insp-drawer-loan-amount', formatFcfa(match.request.requested_amount));
  setText('insp-drawer-val-declared', formatFcfa(match.guarantee.declared_value));
  setText('insp-drawer-val-verified', formatFcfa(match.guarantee.verified_value));
  setText('insp-drawer-desc', match.guarantee.description || '—');
  const status = document.getElementById('insp-drawer-status-badge');
  if (status) {
    status.textContent = match.guarantee.verification_status || 'PENDING';
  }
  setText('insp-client-name', `${name} • #${match.request.id}`);
  setText('insp-guarantee-type', match.guarantee.guarantee_type || '—');
  const hidden = document.getElementById('insp-guarantee-id') as HTMLInputElement | null;
  if (hidden) {
    hidden.value = String(match.guarantee.id);
  }
  const declared = document.getElementById('insp-declared-val') as HTMLInputElement | null;
  if (declared) {
    declared.value = match.guarantee.declared_value != null ? String(match.guarantee.declared_value) : '';
  }
  showBackdrop('inspection-drawer-backdrop');
}

export async function openInspectionFromAgentDrawer() {
  const id = getSelectedCreditRequestId();
  if (!id) {
    toast.info('Ouvrez d’abord un dossier.');
    return;
  }
  const items = await listCreditRequestGuarantees(id).catch(() => [] as CreditGuarantee[]);
  const pending = items.find((item) => (item.verification_status || 'PENDING').toUpperCase() !== 'VERIFIED') ?? items[0];
  if (!pending) {
    toast.warning('Aucune garantie à contrôler. Demandez un complément au demandeur.');
    return;
  }
  showBackdrop('agent-drawer-backdrop', false);
  await fillAndOpenInspectionDrawer(String(pending.id));
}

export async function saveInspectionReport() {
  const hidden = document.getElementById('insp-guarantee-id') as HTMLInputElement | null;
  const id = Number(hidden?.value);
  if (!Number.isFinite(id) || id <= 0) {
    toast.info('Aucune garantie sélectionnée.');
    return;
  }
  const verifiedRaw = (document.getElementById('insp-verified-val') as HTMLInputElement | null)?.value;
  const verifiedValue = verifiedRaw ? Number(verifiedRaw) : undefined;
  try {
    await verifyGuarantee(id, {
      verification_status: 'VERIFIED',
      verified_value: verifiedValue != null && !Number.isNaN(verifiedValue) ? verifiedValue : undefined,
    });
    notifyRequestsChanged();
    showBackdrop('modal-inspection', false);
    showBackdrop('inspection-drawer-backdrop', false);
    toast.success('Contrôle terrain enregistré. Vous pouvez transmettre à l’analyste si les pièces sont jointes.');
  } catch (error) {
    toast.danger(isApiError(error) ? error.message : 'Impossible d’enregistrer le contrôle.');
  }
}

export async function fillAndOpenComplementsDrawer(identifier?: string) {
  const parsed = Number(identifier);
  const selected = Number.isFinite(parsed) && parsed > 0 ? parsed : getSelectedCreditRequestId();
  if (!selected) {
    toast.info('Aucun dossier sélectionné.');
    return;
  }
  const row = await loadRequest(selected);
  if (!row) {
    toast.info('Dossier introuvable en base.');
    return;
  }
  setSelectedCreditRequestId(row.id);
  const fiche = await loadFiche(row);
  const borrower = mergeBorrower(row, fiche);
  setText('comp-drawer-title', `Compléments • Dossier #${row.id}`);
  setText('comp-drawer-req-num', `#${row.id}`);
  setText('comp-drawer-client-name', borrower.name);
  setText('comp-drawer-client-loc', dash(borrower.location));
  setText('comp-drawer-client-phone', dash(borrower.phone));
  setText('comp-drawer-loan-amount', formatFcfa(row.requested_amount));
  showBackdrop('complements-drawer-backdrop');
}

export async function fillAndOpenAnalystDrawer(identifier?: string) {
  const parsed = Number(identifier);
  const selected = Number.isFinite(parsed) && parsed > 0 ? parsed : getSelectedCreditRequestId();
  if (!selected) {
    toast.info('Aucun dossier sélectionné.');
    return;
  }
  const row = await loadRequest(selected);
  if (!row) {
    toast.info('Dossier introuvable en base.');
    return;
  }
  setSelectedCreditRequestId(row.id);
  const [docs, guarantees, fiche, analysis] = await Promise.all([
    listCreditRequestDocuments(row.id).catch(() => []),
    listCreditRequestGuarantees(row.id).catch(() => [] as CreditGuarantee[]),
    loadFiche(row),
    loadCreditAnalysis(row.id).catch(() => null),
  ]);
  const borrower = mergeBorrower(row, fiche);
  const income = row.declared_monthly_income;
  const expenses = row.declared_monthly_expenses;
  const disposable = income != null && expenses != null ? income - expenses : undefined;
  const score = formatScore(analysis?.overall_score);
  const confidence = formatScore(analysis?.confidence_score);
  const role = getUiSession()?.role;
  const canReview = role === 'ANALYST' || role === 'ADMIN';

  setText('analyst-drawer-ref-badge', `#${row.id}`);
  setText('analyst-drawer-title', borrower.name);
  setText('analyst-drawer-subtitle', `Fiche 360° • ${creditStatusLabel(row.status)} • ${formatFcfa(row.requested_amount)}`);
  setText('analyst-drawer-status-badge', creditStatusLabel(row.status));
  setText('analyst-drawer-score-val', score != null ? String(score) : '—');
  setHtml(
    'analyst-drawer-risk-tag',
    `<i class="fas fa-shield-halved mr-1"></i> ${scoringLabel(analysis?.recommendation)}`,
  );
  setHtml(
    'analyst-drawer-confidence',
    `Indice de Confiance : <strong class="text-emerald">${confidence != null ? `${confidence}%` : '—'}</strong>`,
  );
  setText('analyst-drawer-client-id', dash(borrower.number));
  setText('analyst-drawer-client-name', borrower.name);
  setText('analyst-drawer-client-activity', dash(borrower.occupation));
  setHtml(
    'analyst-drawer-client-loc',
    `<i class="fas fa-location-dot text-primary mr-1"></i> ${dash(borrower.location)}`,
  );
  const avatar = document.getElementById('analyst-drawer-client-avatar') as HTMLImageElement | null;
  if (avatar) {
    avatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(borrower.name)}&background=4f46e5&color=fff`;
  }
  setText('analyst-drawer-income', formatFcfa(income));
  setText('analyst-drawer-expenses', formatFcfa(expenses));
  setText('analyst-drawer-disposable', formatFcfa(disposable));
  setText('analyst-drawer-installment', formatFcfa(row.estimated_monthly_payment));
  const capBanner = document.getElementById('analyst-drawer-cap-banner');
  if (capBanner) {
    const pass = disposable != null && row.estimated_monthly_payment != null && disposable >= row.estimated_monthly_payment;
    capBanner.className = `capacity-comparison ${pass ? 'pass' : 'fail'}`;
    capBanner.textContent =
      disposable == null
        ? 'Capacité non calculée en base.'
        : pass
          ? 'Reste à vivre supérieur à la mensualité estimée.'
          : 'Reste à vivre inférieur à la mensualité estimée.';
  }
  setText('analyst-drawer-docs-count', `${docs.length} pièce${docs.length > 1 ? 's' : ''}`);
  const docsList = document.getElementById('analyst-drawer-docs-list');
  if (docsList) {
    docsList.innerHTML = docs.length
      ? docs
          .map((doc) => {
            const check = documentCheck(doc.status);
            const excerpt = doc.analysis_summary || (typeof doc.extracted_text === 'string' ? doc.extracted_text.slice(0, 110) : '');
            return `<div data-open-doc="CREDIT-${row.id}-${doc.id}" style="padding:0.5rem 0.6rem;border:1px solid var(--border-color);border-radius:var(--radius-sm);background:var(--bg-surface-secondary);cursor:pointer">
              <div style="display:flex;justify-content:space-between;gap:0.5rem;align-items:center">
                <span style="font-size:0.8rem;font-weight:600">${doc.original_filename || doc.document_type || 'Pièce'}</span>
                <span class="${check.badgeClass}" style="font-size:0.65rem">${check.label}</span>
              </div>
              <p style="margin:0.35rem 0 0;font-size:0.72rem;color:var(--text-muted)">${excerpt || 'Lecture automatique après dépôt. Cliquez pour ouvrir.'}</p>
              ${canReview ? `<div style="display:flex;gap:0.35rem;flex-wrap:wrap;margin-top:0.45rem">
                <button type="button" class="btn btn-primary btn-sm" data-doc-decision="VALIDATED" data-doc-id="${doc.id}" style="font-size:0.68rem">Conforme</button>
                <button type="button" class="btn btn-secondary btn-sm" data-doc-decision="TO_COMPLETE" data-doc-id="${doc.id}" style="font-size:0.68rem">À reprendre</button>
                <button type="button" class="btn btn-secondary btn-sm" data-doc-decision="REJECTED" data-doc-id="${doc.id}" style="font-size:0.68rem">Non conforme</button>
              </div>` : ''}
            </div>`;
          })
          .join('')
      : '<p style="margin:0;font-size:0.8rem;color:var(--text-muted)">Aucune pièce en base.</p>';
    docsList.onclick = (event) => {
      const btn = (event.target as HTMLElement).closest<HTMLElement>('[data-doc-decision]');
      if (btn) {
        event.stopPropagation();
        const documentId = Number(btn.dataset.docId);
        const decision = btn.dataset.docDecision as 'VALIDATED' | 'TO_COMPLETE' | 'REJECTED';
        void submitHumanValidationFromDrawer(decision, documentId);
        return;
      }
      const open = (event.target as HTMLElement).closest<HTMLElement>('[data-open-doc]');
      if (open?.dataset.openDoc) {
        void import('@/features/workflow/fillDocLightbox').then(({ openDocLightbox }) => openDocLightbox(open.dataset.openDoc));
      }
    };
  }
  const signals: string[] = [];
  if (!docs.length) {
    signals.push('Pièces justificatives manquantes.');
  }
  if (docs.some(isDocumentRejected)) {
    signals.push('Au moins une pièce est non conforme après contrôle.');
  }
  if (analysis?.document_score != null && analysis.document_score < 50) {
    signals.push('Le contrôle automatique des pièces est insuffisant.');
  }
  if (!guarantees.length) {
    signals.push('Aucune garantie déclarée.');
  }
  if ((row.repayment_capacity_status || '').toUpperCase() === 'INSUFFICIENT') {
    signals.push('Capacité de remboursement insuffisante.');
  }
  setText('analyst-drawer-anom-count', `${signals.length} alerte${signals.length > 1 ? 's' : ''}`);
  const anomList = document.getElementById('analyst-drawer-anomalies-list');
  if (anomList) {
    anomList.innerHTML = signals.length
      ? signals.map((item) => `<div style="font-size:0.78rem;color:#991b1b">${item}</div>`).join('')
      : '<p style="margin:0;font-size:0.8rem;color:var(--text-muted)">Aucun signal automatique.</p>';
  }
  const factors = [
    ['Capacité de remboursement', analysis?.repayment_capacity_score],
    ['Cohérence des revenus', analysis?.income_consistency_score],
    ['Activité', analysis?.activity_score],
    ['Charges', analysis?.expense_score],
    ['Contrôle des pièces', analysis?.document_score],
    ['Épargne', analysis?.savings_score],
    ['Historique crédit', analysis?.credit_history_score],
    ['Garantie', analysis?.guarantee_score],
  ] as const;
  const factorsList = document.getElementById('analyst-drawer-factors-list');
  if (factorsList) {
    factorsList.innerHTML = analysis
      ? factors
          .map(([label, value]) => {
            const n = formatScore(value);
            return `<div style="display:flex;justify-content:space-between;font-size:0.78rem"><span>${label}</span><strong>${n != null ? `${n}/100` : '—'}</strong></div>`;
          })
          .join('')
      : '<p style="margin:0;font-size:0.8rem;color:var(--text-muted)">Analyse non calculée en base.</p>';
  }
  const notes = document.getElementById('analyst-drawer-notes-input') as HTMLTextAreaElement | null;
  if (notes) {
    notes.value = analysis?.analysis_summary || '';
  }
  const reco = document.getElementById('analyst-drawer-reco-select') as HTMLSelectElement | null;
  if (reco && analysis?.recommendation) {
    const key = analysis.recommendation.toUpperCase();
    reco.value = key === 'UNFAVORABLE' ? 'UNFAVORABLE' : key === 'RESERVED' ? 'RESERVED' : 'FAVORABLE';
  }
  const reviewActions = document.getElementById('analyst-drawer-review-actions');
  if (reviewActions) {
    reviewActions.style.display = canReview ? '' : 'none';
  }
  setText('modal-dossier-ref', `#${row.id}`);
  setText('modal-client-name', borrower.name);
  setText('modal-client-location', `${dash(borrower.location)} • ${dash(borrower.number)}`);
  setText('modal-score-val', score != null ? String(score) : '—');
  setText('cap-income', formatFcfa(income));
  setText('cap-expenses', formatFcfa(expenses));
  setText('cap-disposable', formatFcfa(disposable));
  setText('cap-installment', formatFcfa(row.estimated_monthly_payment));
  showBackdrop('analyst-drawer-backdrop');
}

export async function openAnalyst360FromAgent() {
  const id = getSelectedCreditRequestId();
  showBackdrop('agent-drawer-backdrop', false);
  await fillAndOpenAnalystDrawer(id ? String(id) : undefined);
}

export async function requestComplementFromAnalystDrawer() {
  const id = getSelectedCreditRequestId();
  if (!id) {
    toast.info('Aucun dossier sélectionné.');
    return;
  }
  const comment = window.prompt('Motif des compléments (min. 5 caractères) :');
  if (comment == null) {
    return;
  }
  if (comment.trim().length < 5) {
    toast.warning('Le commentaire doit contenir au moins 5 caractères.');
    return;
  }
  try {
    const role = getUiSession()?.role;
    if (role === 'ANALYST' || role === 'ADMIN') {
      await submitAnalystReview(id, {
        recommendation: 'RESERVED',
        comment: comment.trim(),
        next_step: 'VERIFICATION_REQUIRED',
      });
    } else {
      await requestComplements(id, comment.trim());
    }
    notifyRequestsChanged();
    showBackdrop('analyst-drawer-backdrop', false);
    toast.success('Compléments demandés au client.');
  } catch (error) {
    toast.danger(isApiError(error) ? error.message : 'Impossible de demander des compléments.');
  }
}

export async function submitHumanValidationFromDrawer(
  decision: 'VALIDATED' | 'TO_COMPLETE' | 'REJECTED' = 'VALIDATED',
  documentId?: number,
) {
  const id = getSelectedCreditRequestId();
  if (!id) {
    toast.info('Aucun dossier sélectionné.');
    return;
  }
  const comment =
    decision === 'VALIDATED'
      ? 'Pièces contrôlées et acceptées.'
      : decision === 'TO_COMPLETE'
        ? 'Pièce à reprendre après le contrôle automatique.'
        : 'Pièce non conforme.';
  try {
    await submitHumanValidation(id, {
      validation_type: 'DOCUMENT',
      decision,
      comment,
      ...(documentId ? { document_id: documentId } : {}),
    });
    notifyRequestsChanged();
    toast.success(
      decision === 'VALIDATED'
        ? 'Conformité des pièces enregistrée.'
        : decision === 'TO_COMPLETE'
          ? 'Le demandeur doit reprendre la pièce.'
          : 'Pièce marquée non conforme.',
    );
  } catch (error) {
    toast.danger(isApiError(error) ? error.message : 'Impossible d’enregistrer le contrôle des pièces.');
  }
}

export async function requestDocumentReworkFromDrawer() {
  await submitHumanValidationFromDrawer('TO_COMPLETE');
}

export async function fillAndOpenAnomalyDrawer(identifier?: string) {
  const { getCachedAnalystSignals } = await import('@/features/analyst/useAnalystWorkspace');
  const signals = getCachedAnalystSignals();
  const match = signals.find((item) => String(item.id) === String(identifier)) ?? signals[0];
  if (!match) {
    toast.info('Aucun point de contrôle à afficher.');
    return;
  }
  if (match.credit_request_id) {
    setSelectedCreditRequestId(match.credit_request_id);
  }
  const request = match.request;
  setText('anom-drawer-ref-badge', request ? `#${request.id}` : '—');
  setText('anom-drawer-title', match.borrower || 'Point de contrôle');
  setText('anom-drawer-subtitle', match.description || 'Vérification du dossier');
  setText('anom-drawer-type-name', match.anomaly_type || 'CONTRÔLE');
  setText('anom-drawer-client-name', match.borrower || 'Demandeur');
  setText('anom-drawer-loan-amount', formatFcfa(request?.requested_amount));
  setText('anom-drawer-desc', match.description || '—');
  setText('anom-drawer-category-badge', 'Contrôle des pièces');
  setText('anom-drawer-doc-ocr-score', 'Lecture automatique');
  setText('anom-drawer-val-detected', '—');
  setText('anom-drawer-val-expected', 'Dossier complet et pièces lisibles');
  setText('anom-drawer-doc-name', match.description || 'Pièce du dossier');
  setText('anom-drawer-doc-type', 'Contrôle après dépôt');
  setText('anom-drawer-doc-status', match.status === 'OPEN' ? 'À traiter' : match.status || 'Ouvert');
  const category = document.getElementById('anom-drawer-category-badge');
  if (category) {
    category.className = 'badge badge-submitted';
  }
  const status = document.getElementById('anom-drawer-status-badge');
  if (status) {
    status.textContent = match.status || 'Ouvert';
  }
  const hidden = document.getElementById('anom-drawer-id') as HTMLInputElement | null;
  if (hidden) {
    hidden.value = String(match.id);
  }
  showBackdrop('anomaly-drawer-backdrop');
}

export async function resolveAnomalyFromDrawer() {
  const hidden = document.getElementById('anom-drawer-id') as HTMLInputElement | null;
  const id = Number(hidden?.value);
  const comment =
    String((document.getElementById('anom-drawer-comment-input') as HTMLTextAreaElement | null)?.value ?? '').trim() ||
    'Point vérifié et levé.';
  if (!Number.isFinite(id) || id <= 0) {
    toast.info('Aucun contrôle sélectionné.');
    return;
  }
  if (comment.length < 5) {
    toast.warning('Indiquez un commentaire d’au moins 5 caractères.');
    return;
  }
  try {
    await resolveAnomaly(id, { status: 'RESOLVED', resolution_comment: comment });
    showBackdrop('anomaly-drawer-backdrop', false);
    notifyRequestsChanged();
    toast.success('Point de contrôle levé.');
  } catch (error) {
    toast.danger(isApiError(error) ? error.message : 'Ce point est lié au dossier. Ouvrez l’analyse 360° pour le traiter.');
    showBackdrop('anomaly-drawer-backdrop', false);
  }
}
