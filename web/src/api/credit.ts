import { apiBlob, apiJson } from './client';
import { unwrapCollection } from './admin';

export type CreditRequestClient = {
  id?: number;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  phone?: string | null;
  email?: string | null;
  client_number?: string;
  city?: string | null;
  residential_zone?: string | null;
  occupation?: string | null;
  address?: string | null;
  kyc_status?: string;
  user?: {
    first_name?: string;
    last_name?: string;
    full_name?: string;
    name?: string;
    phone?: string | null;
    email?: string | null;
  };
};

export type CreditRequest = {
  id: number;
  client_id?: number;
  requested_amount?: number;
  duration_months?: number;
  purpose?: string;
  status?: string;
  repayment_capacity_status?: string;
  estimated_monthly_payment?: number;
  declared_monthly_income?: number;
  declared_monthly_expenses?: number;
  submitted_at?: string | null;
  created_at?: string;
  approved_amount?: number;
  approved_duration_months?: number;
  activity_id?: number;
  loan_id?: number;
  loan?: { id?: number; status?: string; principal_amount?: number; duration_months?: number; monthly_payment?: number };
  client?: CreditRequestClient;
};

export type CreditAnalysis = {
  id?: number;
  overall_score?: number;
  confidence_score?: number;
  recommendation?: string;
  analysis_summary?: string;
  repayment_capacity_score?: number;
  income_consistency_score?: number;
  activity_score?: number;
  expense_score?: number;
  document_score?: number;
  savings_score?: number;
  credit_history_score?: number;
  guarantee_score?: number;
  created_at?: string;
};

export type CreditGuarantee = {
  id: number;
  credit_request_id?: number;
  guarantee_type?: string;
  declared_value?: number;
  description?: string | null;
  verification_status?: string;
  verified_value?: number | null;
};

export type StoreCreditRequestPayload = {
  requested_amount: number;
  duration_months: number;
  purpose: string;
  declared_monthly_income: number;
  declared_monthly_expenses: number;
  activity_id?: number;
  guarantee?: {
    guarantee_type: string;
    declared_value: number;
    description?: string;
  };
};

export type UpdateCreditRequestPayload = {
  requested_amount?: number;
  duration_months?: number;
  purpose?: string;
  declared_monthly_income?: number;
  declared_monthly_expenses?: number;
  activity_id?: number | null;
};

type CreditRequestEnvelope = {
  message?: string;
  credit_request?: CreditRequest;
  data?: CreditRequest;
};

export function unwrapCreditRequest(payload: unknown): CreditRequest {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Réponse dossier invalide.');
  }
  const record = payload as CreditRequestEnvelope & CreditRequest & { loan?: CreditRequest['loan'] };
  const base = record.credit_request?.id
    ? record.credit_request
    : record.data && typeof record.data === 'object' && 'id' in record.data
      ? record.data
      : typeof record.id === 'number'
        ? (record as CreditRequest)
        : null;
  if (!base) {
    throw new Error('Dossier introuvable dans la réponse.');
  }
  const loan = base.loan ?? record.loan;
  return {
    ...base,
    loan,
    loan_id: base.loan_id ?? loan?.id,
    approved_amount: base.approved_amount ?? loan?.principal_amount,
    approved_duration_months: base.approved_duration_months ?? loan?.duration_months,
  };
}

async function listPaged(path: string) {
  const rows: CreditRequest[] = [];
  let page = 1;
  let lastPage = 1;
  do {
    const payload = await apiJson<unknown>(`${path}${path.includes('?') ? '&' : '?'}page=${page}&per_page=100`);
    const batch = unwrapCollection<CreditRequest>(payload);
    if (batch.length) {
      rows.push(...batch);
    } else if (payload && typeof payload === 'object') {
      const record = payload as Record<string, unknown>;
      for (const key of ['credit_requests', 'requests']) {
        if (Array.isArray(record[key])) {
          rows.push(...(record[key] as CreditRequest[]));
        }
      }
    }
    const record = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : {};
    const meta = record.meta && typeof record.meta === 'object' ? (record.meta as Record<string, unknown>) : undefined;
    const last = record.last_page ?? meta?.last_page;
    lastPage = typeof last === 'number' && last >= 1 ? last : 1;
    page += 1;
  } while (page <= lastPage && page <= 20);
  return rows;
}

export function listMyCreditRequests() {
  return listPaged('/credit-requests');
}

export function listAgentRequests() {
  return listPaged('/agent/requests');
}

export function listAnalystRequests() {
  return listPaged('/analyst/requests');
}

export function listCommitteeRequests() {
  return listPaged('/committee/requests');
}

export async function createCreditRequest(body: StoreCreditRequestPayload) {
  const payload = await apiJson<unknown>('/credit-requests', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return unwrapCreditRequest(payload);
}

export async function updateCreditRequest(id: number, body: UpdateCreditRequestPayload) {
  const payload = await apiJson<unknown>(`/credit-requests/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
  return unwrapCreditRequest(payload);
}

export async function deleteCreditRequest(id: number) {
  return apiJson<unknown>(`/credit-requests/${id}`, { method: 'DELETE' });
}

export async function submitCreditRequest(id: number) {
  const payload = await apiJson<unknown>(`/credit-requests/${id}/submit`, { method: 'POST' });
  return unwrapCreditRequest(payload);
}

export async function sendRequestToAnalysis(id: number) {
  const payload = await apiJson<unknown>(`/agent/requests/${id}/send-to-analysis`, { method: 'POST' });
  try {
    return unwrapCreditRequest(payload);
  } catch {
    return { id } as CreditRequest;
  }
}

export type CreditDocument = {
  id: number;
  credit_request_id?: number;
  document_type?: string;
  original_filename?: string;
  mime_type?: string;
  status?: string;
  uploaded_at?: string;
  file_size?: number;
  ocr_confidence?: number;
  extracted_text?: string | null;
  extracted_data?: Record<string, unknown> | null;
  analysis_summary?: string | null;
};

function asExtractedMap(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function unwrapDocument(payload: unknown): CreditDocument | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }
  const record = payload as Record<string, unknown>;
  const nested = record.document && typeof record.document === 'object' ? (record.document as Record<string, unknown>) : record;
  if (typeof nested.id !== 'number') {
    return null;
  }
  const extracted =
    asExtractedMap(nested.extracted_data) ||
    asExtractedMap(nested.ocr_result) ||
    asExtractedMap(nested.extraction) ||
    asExtractedMap(nested.fields);
  return {
    ...(nested as CreditDocument),
    extracted_data: extracted,
    extracted_text: typeof nested.extracted_text === 'string' ? nested.extracted_text : (nested.ocr_text as string | undefined) ?? null,
    analysis_summary: typeof nested.analysis_summary === 'string' ? nested.analysis_summary : null,
  };
}

export async function getCreditDocument(requestId: number, documentId: number) {
  const payload = await apiJson<unknown>(`/credit-requests/${requestId}/documents/${documentId}`);
  return unwrapDocument(payload);
}

export async function enrichCreditDocuments(requestId: number, docs: CreditDocument[]) {
  const detailed = await Promise.all(
    docs.map(async (doc) => {
      try {
        const full = await getCreditDocument(requestId, doc.id);
        return full ? { ...doc, ...full } : doc;
      } catch {
        return doc;
      }
    }),
  );
  return detailed;
}

export async function fetchCreditDocumentFile(documentId: number) {
  return apiBlob(`/documents/${documentId}/file`);
}

export async function listCreditRequestDocuments(id: number) {
  const payload = await apiJson<unknown>(`/credit-requests/${id}/documents`);
  return unwrapCollection<CreditDocument>(payload).map((doc) => unwrapDocument(doc) ?? doc);
}

export async function getCreditRequest(id: number) {
  const payload = await apiJson<unknown>(`/credit-requests/${id}`);
  return unwrapCreditRequest(payload);
}

export async function listCreditRequestGuarantees(id: number) {
  const payload = await apiJson<unknown>(`/credit-requests/${id}/guarantees`);
  return unwrapCollection<CreditGuarantee>(payload);
}

export const GUARANTEE_TYPES = ['MATERIEL', 'BOUTIQUE', 'FONCIER', 'EPARGNE', 'CAUTION'] as const;

export function guaranteeTypeLabel(type?: string) {
  const key = (type || '').toUpperCase();
  const labels: Record<string, string> = {
    MATERIEL: 'Bien matériel',
    BOUTIQUE: 'Fonds de commerce',
    FONCIER: 'Terrain ou immeuble',
    EPARGNE: 'Épargne nantie',
    CAUTION: 'Caution d’une personne',
  };
  return labels[key] || type || 'Garantie';
}

export function guaranteeStatusLabel(status?: string) {
  const key = (status || 'PENDING').toUpperCase();
  const labels: Record<string, string> = {
    PENDING: 'En attente de contrôle',
    VERIFIED: 'Acceptée',
    REJECTED: 'Refusée',
  };
  return labels[key] || status || '—';
}

export type GuaranteeInput = { guarantee_type: string; declared_value: number; description?: string | null };

export async function addCreditGuarantee(id: number, body: GuaranteeInput) {
  return apiJson<unknown>(`/credit-requests/${id}/guarantees`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function updateCreditGuarantee(requestId: number, guaranteeId: number, body: GuaranteeInput) {
  return apiJson<unknown>(`/credit-requests/${requestId}/guarantees/${guaranteeId}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export async function deleteCreditGuarantee(requestId: number, guaranteeId: number) {
  return apiJson<unknown>(`/credit-requests/${requestId}/guarantees/${guaranteeId}`, { method: 'DELETE' });
}

export async function deleteCreditDocument(requestId: number, documentId: number) {
  return apiJson<unknown>(`/credit-requests/${requestId}/documents/${documentId}`, { method: 'DELETE' });
}

/** Le client peut encore retoucher pièces et garanties tant que le dossier est chez lui. */
export function isRequestEditableByClient(status?: string) {
  return ['DRAFT', 'VERIFICATION_REQUIRED'].includes((status || '').toUpperCase());
}

export async function uploadCreditDocument(id: number, file: File, documentType: string) {
  const form = new FormData();
  form.append('document_type', documentType);
  form.append('file', file);
  return apiJson<unknown>(`/credit-requests/${id}/documents`, {
    method: 'POST',
    body: form,
  });
}

export async function getClientSubmitBlockers(id: number) {
  const [docs, guarantees] = await Promise.all([
    listCreditRequestDocuments(id).catch(() => []),
    listCreditRequestGuarantees(id).catch(() => [] as CreditGuarantee[]),
  ]);
  const blockers: string[] = [];
  if (!docs.length) {
    blockers.push('pièce justificative');
  }
  if (!guarantees.length) {
    blockers.push('garantie');
  }
  return { blockers, docs, guarantees };
}

function isRejectedDocumentStatus(status?: string) {
  return ['REJECTED', 'FAILED', 'INVALID', 'ERROR'].includes((status || '').toUpperCase());
}

export function documentComplianceBlockersFrom(docs: CreditDocument[]) {
  const rejected = docs.filter((doc) => isRejectedDocumentStatus(doc.status));
  const blockers: string[] = [];
  if (rejected.length) {
    blockers.push(
      rejected.length > 1 ? `${rejected.length} pièces non conformes` : 'pièce non conforme après contrôle',
    );
  }
  return { blockers, rejected };
}

export async function getDocumentComplianceBlockers(id: number) {
  const docs = await listCreditRequestDocuments(id);
  return { ...documentComplianceBlockersFrom(docs), docs };
}

export async function getAnalysisTransferBlockers(id: number) {
  const { docs, guarantees } = await getClientSubmitBlockers(id);
  const { blockers: compliance } = documentComplianceBlockersFrom(docs);
  const blockers: string[] = [];
  if (!docs.length) {
    blockers.push('pièces justificatives');
  }
  blockers.push(...compliance);
  if (!guarantees.length) {
    blockers.push('garantie');
  } else if (!guarantees.some((item) => (item.verification_status || '').toUpperCase() === 'VERIFIED')) {
    blockers.push('contrôle terrain de la garantie');
  }
  return { blockers, docs, guarantees };
}

export async function requestComplements(id: number, comment: string) {
  const payload = await apiJson<unknown>(`/agent/requests/${id}/request-complements`, {
    method: 'POST',
    body: JSON.stringify({ comment }),
  });
  return unwrapCreditRequest(payload);
}

export async function verifyGuarantee(
  id: number,
  body: { verification_status: 'PENDING' | 'VERIFIED' | 'REJECTED'; verified_value?: number },
) {
  return apiJson<unknown>(`/agent/guarantees/${id}/verify`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function unwrapCreditAnalysis(payload: unknown): CreditAnalysis | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }
  const record = payload as Record<string, unknown>;
  if (record.analysis && typeof record.analysis === 'object') {
    return record.analysis as CreditAnalysis;
  }
  if (typeof record.overall_score === 'number' || typeof record.confidence_score === 'number') {
    return record as CreditAnalysis;
  }
  if (record.data && typeof record.data === 'object') {
    return unwrapCreditAnalysis(record.data);
  }
  return null;
}

export async function getCreditAnalysis(id: number) {
  const payload = await apiJson<unknown>(`/credit-requests/${id}/analysis`);
  return unwrapCreditAnalysis(payload);
}

export async function evaluateCreditScore(id: number) {
  const payload = await apiJson<unknown>(`/credit-requests/${id}/score`, { method: 'POST' });
  return unwrapCreditAnalysis(payload);
}

export async function loadCreditAnalysis(id: number) {
  try {
    const existing = await getCreditAnalysis(id);
    if (existing) {
      return existing;
    }
  } catch {
    // 404 when no analysis has been calculated yet
  }
  return evaluateCreditScore(id);
}

export type CreditAnomaly = {
  id: number;
  credit_request_id?: number;
  anomaly_type?: string;
  severity?: string;
  description?: string;
  status?: string;
};

export async function listAnalystAnomalies() {
  try {
    const payload = await apiJson<unknown>('/analyst/anomalies');
    return unwrapCollection<CreditAnomaly>(payload);
  } catch {
    return [];
  }
}

export async function resolveAnomaly(
  id: number,
  body: { status: 'OPEN' | 'RESOLVED' | 'IGNORED'; resolution_comment: string },
) {
  return apiJson<unknown>(`/analyst/anomalies/${id}/resolve`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function submitHumanValidation(
  requestId: number,
  body: {
    validation_type: string;
    decision: 'VALIDATED' | 'TO_COMPLETE' | 'REJECTED';
    document_id?: number;
    comment?: string;
  },
) {
  return apiJson<unknown>(`/analyst/requests/${requestId}/human-validation`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function submitAnalystReview(
  id: number,
  body: {
    recommendation: 'FAVORABLE' | 'RESERVED' | 'UNFAVORABLE';
    comment: string;
    next_step: 'COMMITTEE' | 'VERIFICATION_REQUIRED';
  },
) {
  const payload = await apiJson<unknown>(`/analyst/requests/${id}/review`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return unwrapCreditRequest(payload);
}

export type CommitteeDecision = 'APPROVED' | 'REJECTED' | 'AMENDED';

export async function submitCommitteeDecision(
  id: number,
  body: {
    decision: CommitteeDecision;
    comment: string;
    approved_amount?: number;
    approved_duration_months?: number;
  },
) {
  const payload = await apiJson<unknown>(`/committee/requests/${id}/decide`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  try {
    return unwrapCreditRequest(payload);
  } catch {
    return { id } as CreditRequest;
  }
}
