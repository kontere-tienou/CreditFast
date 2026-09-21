import {
  addCreditGuarantee,
  createCreditRequest,
  getClientSubmitBlockers,
  getCreditRequest,
  submitCreditRequest,
  updateCreditRequest,
  uploadCreditDocument,
  type StoreCreditRequestPayload,
} from '@/api/credit';
import { persistWizardFiche } from './persistFiche';

export function mapGuaranteeType(raw: string) {
  const key = raw.toUpperCase();
  if (key.includes('CAUTION')) {
    return 'CAUTION';
  }
  if (key.includes('PARCELLE') || key.includes('FONCIER') || key.includes('TERRAIN')) {
    return 'FONCIER';
  }
  if (key.includes('STOCK') || key.includes('BOUTIQUE') || key.includes('MARCHAND')) {
    return 'BOUTIQUE';
  }
  if (key.includes('EPARGNE')) {
    return 'EPARGNE';
  }
  return 'MATERIEL';
}

function fieldValue(id: string) {
  return String((document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null)?.value ?? '').trim();
}

function fieldNumber(id: string) {
  const value = Number(fieldValue(id).replace(/\s/g, ''));
  return Number.isFinite(value) ? value : 0;
}

function readWizardRequest(activityId?: number): StoreCreditRequestPayload {
  const guaranteeType = fieldValue('wiz-guarantee-type');
  const guaranteeValue = fieldNumber('wiz-guarantee-val');
  return {
    requested_amount: fieldNumber('wiz-amount') || 0,
    duration_months: fieldNumber('wiz-duration') || 6,
    purpose: fieldValue('wiz-purpose') || 'Demande de prêt',
    declared_monthly_income: fieldNumber('wiz-income') || 0,
    declared_monthly_expenses: fieldNumber('wiz-expenses') || 0,
    activity_id: activityId,
    guarantee: guaranteeType
      ? {
          guarantee_type: mapGuaranteeType(guaranteeType),
          declared_value: guaranteeValue,
          description: fieldValue('wiz-guarantee-desc') || undefined,
        }
      : undefined,
  };
}

function wizardFile() {
  const fileInput = document.getElementById('wiz-doc-file') as HTMLInputElement | null;
  return {
    file: fileInput?.files?.[0] ?? null,
    documentType: fieldValue('wiz-doc-type') || 'PREUVE_REVENU',
  };
}

async function upsertRequest(request: StoreCreditRequestPayload, draftId?: number) {
  if (draftId) {
    const updated = await updateCreditRequest(draftId, {
      requested_amount: request.requested_amount,
      duration_months: request.duration_months,
      purpose: request.purpose,
      declared_monthly_income: request.declared_monthly_income,
      declared_monthly_expenses: request.declared_monthly_expenses,
      activity_id: request.activity_id ?? null,
    });
    if (request.guarantee?.guarantee_type && request.guarantee.declared_value > 0) {
      try {
        await addCreditGuarantee(updated.id, request.guarantee);
      } catch {
        /* already declared on this draft */
      }
    }
    return updated;
  }
  return createCreditRequest(request);
}

export async function saveDraftLoanApplication() {
  const { activityId } = await persistWizardFiche();
  const request = readWizardRequest(activityId);
  if (request.requested_amount < 10000) {
    throw new Error('Indiquez un montant d’au moins 10 000 FCFA pour enregistrer le brouillon.');
  }
  const draftId = Number(fieldValue('wiz-draft-id')) || undefined;
  const saved = await upsertRequest(
    {
      ...request,
      guarantee:
        request.guarantee?.guarantee_type && request.guarantee.declared_value > 0 ? request.guarantee : undefined,
    },
    draftId,
  );
  const { file, documentType } = wizardFile();
  if (file) {
    try {
      await uploadCreditDocument(saved.id, file, documentType);
    } catch {
      throw new Error('Brouillon enregistré, mais la pièce n’a pas pu être jointe. Ajoutez-la depuis Mes pièces.');
    }
  }
  const draftField = document.getElementById('wiz-draft-id') as HTMLInputElement | null;
  if (draftField) {
    draftField.value = String(saved.id);
  }
  return saved;
}

export async function submitCompleteLoanApplication(input?: {
  request?: StoreCreditRequestPayload;
  file?: File | null;
  documentType?: string;
}) {
  const { activityId } = await persistWizardFiche();
  const request = input?.request ?? readWizardRequest(activityId);
  if (activityId && !request.activity_id) {
    request.activity_id = activityId;
  }
  if (!request.guarantee?.guarantee_type || !(request.guarantee.declared_value > 0)) {
    throw new Error('Déclarez une garantie (type et valeur) avant d’envoyer le dossier à l’agent.');
  }
  const { file, documentType } = input?.file !== undefined ? { file: input.file, documentType: input.documentType || 'PREUVE_REVENU' } : wizardFile();
  if (!file) {
    throw new Error('Joignez au moins une pièce justificative avant d’envoyer le dossier à l’agent.');
  }

  const draftId = Number(fieldValue('wiz-draft-id')) || undefined;
  const created = await upsertRequest(request, draftId);
  try {
    await uploadCreditDocument(created.id, file, documentType);
  } catch {
    throw new Error('La pièce n’a pas pu être jointe. Le dossier reste en brouillon : ajoutez un fichier puis renvoyez.');
  }

  const { blockers } = await getClientSubmitBlockers(created.id);
  if (blockers.length) {
    throw new Error(`Envoi impossible : ${blockers.join(' et ')} manquant${blockers.length > 1 ? 's' : ''}.`);
  }

  await submitCreditRequest(created.id);
  return created;
}

export async function completeAndResubmit(id: number, file?: File | null, documentType?: string) {
  if (file) {
    await uploadCreditDocument(id, file, documentType || 'PREUVE_REVENU');
  }
  const { blockers } = await getClientSubmitBlockers(id);
  if (blockers.length) {
    throw new Error(`Encore manquant : ${blockers.join(' et ')}.`);
  }
  return submitCreditRequest(id);
}

export async function loadDraftForWizard(id: number) {
  return getCreditRequest(id);
}
