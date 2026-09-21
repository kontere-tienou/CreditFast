import { toast } from '@heroui/react';
import {
  deleteCreditDocument,
  deleteCreditGuarantee,
  addCreditGuarantee,
  getCreditAnalysis,
  GUARANTEE_TYPES,
  guaranteeStatusLabel,
  guaranteeTypeLabel,
  isRequestEditableByClient,
  listCreditRequestDocuments,
  listCreditRequestGuarantees,
  listMyCreditRequests,
  updateCreditGuarantee,
  type CreditAnalysis,
  type CreditDocument,
  type CreditGuarantee,
  type CreditRequest,
} from '@/api/credit';
import { isApiError } from '@/api/errors';
import {
  creditStatusLabel,
  formatDate,
  formatFcfa,
  getSelectedCreditRequestId,
  loanStatusLabel,
  notifyRequestsChanged,
  setSelectedCreditRequestId,
} from '@/features/workflow/workflow';

function esc(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function setText(id: string, value: string) {
  const node = document.getElementById(id);
  if (node) {
    node.textContent = value;
  }
}

function setHtml(id: string, html: string) {
  const node = document.getElementById(id);
  if (node) {
    node.innerHTML = html;
  }
}

function fail(error: unknown, fallback: string) {
  toast.danger(isApiError(error) ? error.message : error instanceof Error ? error.message : fallback);
}

function statusBadgeClass(status?: string) {
  const key = (status || '').toUpperCase();
  if (['APPROVED', 'AMENDED', 'DISBURSED'].includes(key)) return 'badge-approved';
  if (key === 'REJECTED') return 'badge-rejected';
  if (key === 'VERIFICATION_REQUIRED') return 'badge-verification';
  if (key.includes('COMMITTEE')) return 'badge-committee';
  if (key.includes('ANALY') || key === 'CREDIT_REVIEW') return 'badge-analysis';
  return 'badge-submitted';
}

/** Rang atteint dans le parcours : 0 dépôt, 1 agent, 2 analyse, 3 comité, 4 décision. */
function statusRank(status?: string) {
  const key = (status || '').toUpperCase();
  if (key === 'DRAFT') return 0;
  if (['SUBMITTED', 'RECEIVED', 'UNDER_REVIEW', 'VERIFICATION_REQUIRED'].includes(key)) return 1;
  if (['ANALYSIS', 'IN_ANALYSIS', 'PENDING_ANALYSIS', 'CREDIT_REVIEW'].includes(key)) return 2;
  if (['COMMITTEE', 'PENDING_COMMITTEE'].includes(key)) return 3;
  if (['APPROVED', 'AMENDED', 'REJECTED', 'DISBURSED'].includes(key)) return 4;
  return 1;
}

function renderStepper(row: CreditRequest, analysis: CreditAnalysis | null) {
  const status = (row.status || '').toUpperCase();
  const rank = statusRank(status);
  const decisionMeta =
    status === 'REJECTED'
      ? 'Le comité n’a pas retenu la demande.'
      : status === 'DISBURSED'
        ? 'Fonds mis à disposition.'
        : ['APPROVED', 'AMENDED'].includes(status)
          ? `Crédit accordé${row.approved_amount ? ` : ${formatFcfa(row.approved_amount)}` : ''}${row.approved_duration_months ? ` sur ${row.approved_duration_months} mois` : ''}.`
          : 'En attente de la décision du comité.';

  const steps = [
    {
      label: 'Demande déposée',
      meta: status === 'DRAFT' ? 'Brouillon à compléter puis à envoyer.' : `Envoyée le ${formatDate(row.submitted_at || row.created_at)}.`,
    },
    {
      label: 'Vérification par l’agent',
      meta:
        status === 'VERIFICATION_REQUIRED'
          ? 'L’agent attend une pièce ou une garantie de votre part.'
          : rank > 1
            ? 'Pièces et garantie contrôlées.'
            : 'L’agent contrôle vos pièces et votre garantie.',
    },
    {
      label: 'Analyse du dossier',
      meta: analysis?.created_at
        ? `Analyse réalisée le ${formatDate(analysis.created_at)}.`
        : rank > 2
          ? 'Analyse terminée.'
          : rank === 2
            ? 'L’analyste étudie votre capacité de remboursement.'
            : 'À venir après la vérification.',
    },
    {
      label: 'Passage en comité',
      meta: rank === 3 ? 'Le comité examine le dossier.' : rank > 3 ? 'Le comité a statué.' : 'À venir après l’analyse.',
    },
    { label: 'Décision', meta: decisionMeta },
  ];

  const html = steps
    .map((step, index) => {
      const completed = rank > index || (index === 4 && rank === 4);
      const active = !completed && rank === index;
      const rejected = index === 4 && status === 'REJECTED';
      const dotBg = rejected ? '#b91c1c' : completed ? 'var(--cif-emerald-500)' : active ? 'var(--cif-primary-500)' : 'var(--bg-surface)';
      const dotColor = completed || active ? '#fff' : 'var(--text-muted)';
      const dotBorder = completed || active ? dotBg : 'var(--border-color)';
      const icon = rejected ? 'fa-xmark' : completed ? 'fa-check' : active ? 'fa-spinner fa-spin' : '';
      return `
        <div style="display:flex;gap:0.75rem;align-items:flex-start">
          <div style="width:26px;height:26px;border-radius:50%;flex:0 0 26px;display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:700;background:${dotBg};color:${dotColor};border:2px solid ${dotBorder}">
            ${icon ? `<i class="fas ${icon}"></i>` : index + 1}
          </div>
          <div style="flex:1;min-width:0">
            <div style="font-size:0.82rem;font-weight:700;color:${active ? 'var(--primary-700)' : 'var(--text-primary)'}">${esc(step.label)}</div>
            <div style="font-size:0.74rem;color:var(--text-muted);line-height:1.4">${esc(step.meta)}</div>
          </div>
        </div>`;
    })
    .join('');
  setHtml('crd-drawer-stepper-container', html);

  const badge = document.getElementById('crd-drawer-step-badge');
  if (badge) {
    badge.textContent = creditStatusLabel(row.status);
    badge.className = `badge ${statusBadgeClass(row.status)}`;
    badge.style.fontSize = '0.68rem';
  }
}

function renderDocuments(row: CreditRequest, docs: CreditDocument[], refresh: () => void) {
  setText('crd-drawer-docs-count', `${docs.length} pièce${docs.length > 1 ? 's' : ''}`);
  const editable = isRequestEditableByClient(row.status);
  const html = docs.length
    ? docs
        .map(
          (doc) => `
          <div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem;font-size:0.8rem;padding:0.35rem 0;border-bottom:1px dashed var(--border-color)">
            <div style="min-width:0;flex:1">
              <div style="font-weight:600;color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(doc.document_type || 'Document')}</div>
              <div style="color:var(--text-muted);font-size:0.72rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(doc.original_filename || `pièce #${doc.id}`)}</div>
            </div>
            <div style="display:flex;gap:0.3rem;flex:0 0 auto">
              <button type="button" class="btn btn-secondary btn-xs" data-doc-view="${doc.id}" title="Voir la pièce"><i class="fas fa-eye"></i></button>
              ${editable ? `<button type="button" class="btn btn-secondary btn-xs" data-doc-delete="${doc.id}" title="Retirer cette pièce"><i class="fas fa-trash-can"></i></button>` : ''}
            </div>
          </div>`,
        )
        .join('')
    : '<p style="margin:0;font-size:0.8rem;color:var(--text-muted)">Aucune pièce jointe pour ce dossier.</p>';
  setHtml('crd-drawer-docs-list', html);

  const list = document.getElementById('crd-drawer-docs-list');
  list?.querySelectorAll<HTMLButtonElement>('[data-doc-view]').forEach((button) => {
    button.addEventListener('click', () => {
      window.App?.openDocLightbox?.(`CREDIT-${row.id}-${button.dataset.docView}`);
    });
  });
  list?.querySelectorAll<HTMLButtonElement>('[data-doc-delete]').forEach((button) => {
    button.addEventListener('click', async () => {
      const documentId = Number(button.dataset.docDelete);
      if (!window.confirm('Retirer cette pièce du dossier ?')) {
        return;
      }
      button.disabled = true;
      try {
        await deleteCreditDocument(row.id, documentId);
        toast.success('Pièce retirée du dossier.');
        notifyRequestsChanged();
        refresh();
      } catch (error) {
        button.disabled = false;
        fail(error, 'Impossible de retirer cette pièce.');
      }
    });
  });
}

function guaranteeForm(prefix: string, current?: CreditGuarantee) {
  const options = GUARANTEE_TYPES.map(
    (type) => `<option value="${type}"${(current?.guarantee_type || '').toUpperCase() === type ? ' selected' : ''}>${esc(guaranteeTypeLabel(type))}</option>`,
  ).join('');
  return `
    <div id="${prefix}-form" style="display:grid;gap:0.5rem;padding:0.65rem;border:1px solid var(--border-color);border-radius:var(--radius-md);background:var(--bg-body);margin-top:0.5rem">
      <label style="display:grid;gap:0.2rem;font-size:0.74rem;font-weight:600">Nature
        <select id="${prefix}-type" class="form-control" style="font-size:0.8rem">${options}</select>
      </label>
      <label style="display:grid;gap:0.2rem;font-size:0.74rem;font-weight:600">Valeur estimée (FCFA)
        <input id="${prefix}-value" type="number" min="0" step="1000" class="form-control" style="font-size:0.8rem" value="${current?.declared_value ?? ''}" />
      </label>
      <label style="display:grid;gap:0.2rem;font-size:0.74rem;font-weight:600">Description
        <input id="${prefix}-desc" type="text" class="form-control" style="font-size:0.8rem" placeholder="Ex. motocyclette, stock de marchandises" value="${esc(current?.description || '')}" />
      </label>
      <div style="display:flex;gap:0.4rem;justify-content:flex-end">
        <button type="button" class="btn btn-secondary btn-xs" id="${prefix}-cancel">Annuler</button>
        <button type="button" class="btn btn-primary btn-xs" id="${prefix}-save">${current ? 'Enregistrer' : 'Ajouter'}</button>
      </div>
    </div>`;
}

function readGuaranteeForm(prefix: string) {
  const type = (document.getElementById(`${prefix}-type`) as HTMLSelectElement | null)?.value || '';
  const value = Number((document.getElementById(`${prefix}-value`) as HTMLInputElement | null)?.value || 0);
  const description = (document.getElementById(`${prefix}-desc`) as HTMLInputElement | null)?.value.trim() || '';
  if (!type) {
    toast.warning('Choisissez la nature de la garantie.');
    return null;
  }
  if (!(value > 0)) {
    toast.warning('Indiquez la valeur estimée de la garantie.');
    return null;
  }
  return { guarantee_type: type, declared_value: value, description: description || null };
}

function renderGuarantees(row: CreditRequest, guarantees: CreditGuarantee[], refresh: () => void) {
  const editable = isRequestEditableByClient(row.status);
  const verified = guarantees.some((item) => (item.verification_status || '').toUpperCase() === 'VERIFIED');
  const rejected = guarantees.length > 0 && guarantees.every((item) => (item.verification_status || '').toUpperCase() === 'REJECTED');
  const badge = document.getElementById('crd-drawer-guar-status');
  if (badge) {
    badge.textContent = !guarantees.length ? 'Aucune' : verified ? 'Acceptée' : rejected ? 'Refusée' : 'En attente';
    badge.className = `badge ${!guarantees.length ? 'badge-submitted' : verified ? 'badge-approved' : rejected ? 'badge-rejected' : 'badge-verification'}`;
    badge.style.fontSize = '0.68rem';
  }

  const items = guarantees
    .map((item) => {
      const pending = (item.verification_status || 'PENDING').toUpperCase() === 'PENDING';
      const canEdit = editable && pending;
      return `
        <div data-guar-row="${item.id}" style="padding:0.45rem 0;border-bottom:1px dashed var(--border-color)">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:0.5rem">
            <div style="min-width:0;flex:1">
              <div style="font-weight:700;color:var(--text-primary)">${esc(guaranteeTypeLabel(item.guarantee_type))} · ${esc(formatFcfa(item.declared_value))}</div>
              ${item.description ? `<div style="font-size:0.74rem;color:var(--text-muted)">${esc(item.description)}</div>` : ''}
              <div style="font-size:0.72rem;color:var(--text-muted)">${esc(guaranteeStatusLabel(item.verification_status))}${item.verified_value ? ` · valeur retenue ${esc(formatFcfa(item.verified_value))}` : ''}</div>
            </div>
            ${
              canEdit
                ? `<div style="display:flex;gap:0.3rem;flex:0 0 auto">
                    <button type="button" class="btn btn-secondary btn-xs" data-guar-edit="${item.id}" title="Modifier"><i class="fas fa-pen"></i></button>
                    <button type="button" class="btn btn-secondary btn-xs" data-guar-delete="${item.id}" title="Retirer"><i class="fas fa-trash-can"></i></button>
                  </div>`
                : ''
            }
          </div>
          <div data-guar-editor="${item.id}"></div>
        </div>`;
    })
    .join('');

  const empty = '<p style="margin:0;font-size:0.8rem;color:var(--text-muted)">Aucune garantie déclarée pour ce dossier.</p>';
  const addButton = editable
    ? `<div style="margin-top:0.5rem"><button type="button" class="btn btn-secondary btn-xs" id="crd-guar-add"><i class="fas fa-plus"></i> Déclarer une garantie</button><div id="crd-guar-add-editor"></div></div>`
    : '';
  setHtml('crd-drawer-guar-content', `${items || empty}${addButton}`);

  const root = document.getElementById('crd-drawer-guar-content');
  if (!root) {
    return;
  }

  root.querySelectorAll<HTMLButtonElement>('[data-guar-delete]').forEach((button) => {
    button.addEventListener('click', async () => {
      const guaranteeId = Number(button.dataset.guarDelete);
      if (!window.confirm('Retirer cette garantie du dossier ?')) {
        return;
      }
      button.disabled = true;
      try {
        await deleteCreditGuarantee(row.id, guaranteeId);
        toast.success('Garantie retirée.');
        notifyRequestsChanged();
        refresh();
      } catch (error) {
        button.disabled = false;
        fail(error, 'Impossible de retirer cette garantie.');
      }
    });
  });

  root.querySelectorAll<HTMLButtonElement>('[data-guar-edit]').forEach((button) => {
    button.addEventListener('click', () => {
      const guaranteeId = Number(button.dataset.guarEdit);
      const current = guarantees.find((item) => item.id === guaranteeId);
      const editor = root.querySelector<HTMLElement>(`[data-guar-editor="${guaranteeId}"]`);
      if (!editor || !current) {
        return;
      }
      const prefix = `crd-guar-${guaranteeId}`;
      editor.innerHTML = guaranteeForm(prefix, current);
      document.getElementById(`${prefix}-cancel`)?.addEventListener('click', () => {
        editor.innerHTML = '';
      });
      const save = document.getElementById(`${prefix}-save`) as HTMLButtonElement | null;
      save?.addEventListener('click', async () => {
        const body = readGuaranteeForm(prefix);
        if (!body || save.disabled) {
          return;
        }
        save.disabled = true;
        try {
          await updateCreditGuarantee(row.id, guaranteeId, body);
          toast.success('Garantie mise à jour.');
          notifyRequestsChanged();
          refresh();
        } catch (error) {
          save.disabled = false;
          fail(error, 'Impossible de modifier cette garantie.');
        }
      });
    });
  });

  document.getElementById('crd-guar-add')?.addEventListener('click', () => {
    const editor = document.getElementById('crd-guar-add-editor');
    if (!editor) {
      return;
    }
    const prefix = 'crd-guar-new';
    editor.innerHTML = guaranteeForm(prefix);
    document.getElementById(`${prefix}-cancel`)?.addEventListener('click', () => {
      editor.innerHTML = '';
    });
    const save = document.getElementById(`${prefix}-save`) as HTMLButtonElement | null;
    save?.addEventListener('click', async () => {
      const body = readGuaranteeForm(prefix);
      if (!body || save.disabled) {
        return;
      }
      save.disabled = true;
      try {
        await addCreditGuarantee(row.id, body);
        toast.success('Garantie ajoutée au dossier.');
        notifyRequestsChanged();
        refresh();
      } catch (error) {
        save.disabled = false;
        fail(error, 'Impossible d’ajouter cette garantie.');
      }
    });
  });
}

function renderFooter(row: CreditRequest) {
  const actions = document.getElementById('crd-drawer-footer-actions');
  if (!actions) {
    return;
  }
  const status = (row.status || '').toUpperCase();
  if (status === 'DRAFT') {
    actions.innerHTML = `<button type="button" class="btn btn-primary btn-sm" id="crd-resume-draft">Reprendre</button>
      <button type="button" class="btn btn-secondary btn-sm" id="crd-delete-draft">Supprimer</button>`;
    document.getElementById('crd-resume-draft')?.addEventListener('click', () => {
      window.App?.closeClientRequestDrawer?.();
      window.App?.resumeDraftCreditRequest?.(row.id);
    });
    document.getElementById('crd-delete-draft')?.addEventListener('click', () => {
      window.App?.deleteDraftCreditRequest?.(row.id);
    });
    return;
  }
  if (status === 'VERIFICATION_REQUIRED') {
    actions.innerHTML = `<button type="button" class="btn btn-primary btn-sm" id="crd-add-doc"><i class="fas fa-paperclip"></i> Joindre une pièce</button>`;
    document.getElementById('crd-add-doc')?.addEventListener('click', () => {
      window.App?.closeClientRequestDrawer?.();
      window.App?.openUploadDocumentModal?.();
    });
    return;
  }
  if (['APPROVED', 'AMENDED', 'DISBURSED'].includes(status)) {
    actions.innerHTML = `<button type="button" class="btn btn-primary btn-sm" id="crd-open-schedule"><i class="fas fa-calendar-days"></i> Voir l’échéancier</button>`;
    document.getElementById('crd-open-schedule')?.addEventListener('click', () => {
      window.App?.closeClientRequestDrawer?.();
      window.App?.switchView?.('view-client-schedule');
    });
    return;
  }
  actions.innerHTML = '';
}

export async function fillClientRequestDrawer(identifier?: string | number): Promise<boolean> {
  const parsed = Number(identifier);
  const selected = Number.isFinite(parsed) && parsed > 0 ? parsed : getSelectedCreditRequestId();
  const rows = await listMyCreditRequests().catch(() => [] as CreditRequest[]);
  const row = rows.find((item) => item.id === selected) ?? rows[0];
  if (!row) {
    toast.info('Aucun dossier en base pour le moment.');
    return false;
  }
  setSelectedCreditRequestId(row.id);

  setText('crd-drawer-title', `Dossier #${row.id}`);
  setText('crd-drawer-subtitle', `Déposé le ${formatDate(row.submitted_at || row.created_at)}`);
  setText('crd-drawer-amount', formatFcfa(row.requested_amount));
  setHtml('crd-drawer-status', `<span class="badge ${statusBadgeClass(row.status)}">${esc(creditStatusLabel(row.status))}</span>`);
  setText('crd-drawer-purpose', row.purpose || '—');
  const duration = row.duration_months ? `${row.duration_months} mois` : '—';
  setText('crd-drawer-duration-val', duration);
  setText('crd-drawer-duration-badge', duration);
  setText('crd-drawer-monthly-val', formatFcfa(row.estimated_monthly_payment ?? row.loan?.monthly_payment));
  setText('crd-drawer-insurance-val', '—');
  setText(
    'crd-drawer-cost-val',
    row.duration_months && (row.estimated_monthly_payment ?? row.loan?.monthly_payment)
      ? formatFcfa((row.estimated_monthly_payment ?? row.loan?.monthly_payment ?? 0) * row.duration_months)
      : '—',
  );
  setText('crd-drawer-disbursement-val', row.loan?.status ? loanStatusLabel(row.loan.status) : 'Après accord du comité');

  const refresh = () => void fillClientRequestDrawer(row.id);

  const [docs, guarantees, analysis] = await Promise.all([
    listCreditRequestDocuments(row.id).catch(() => [] as CreditDocument[]),
    listCreditRequestGuarantees(row.id).catch(() => [] as CreditGuarantee[]),
    statusRank(row.status) >= 2 ? getCreditAnalysis(row.id).catch(() => null) : Promise.resolve(null),
  ]);

  renderStepper(row, analysis);
  renderDocuments(row, docs, refresh);
  renderGuarantees(row, guarantees, refresh);
  renderFooter(row);
  return true;
}
