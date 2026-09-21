import type { CreditDocument } from '@/api/credit';
import type { KycDocument } from '@/api/profile';

export type DocumentCheckTone = 'good' | 'ok' | 'warn' | 'bad' | 'pending';

export type DocumentCheck = {
  tone: DocumentCheckTone;
  label: string;
  badgeClass: string;
};

function keyOf(status?: string) {
  return (status || 'UPLOADED').toUpperCase();
}

export function documentCheck(status?: string): DocumentCheck {
  const key = keyOf(status);
  if (['VALIDATED', 'VERIFIED', 'APPROVED', 'CONFORME', 'ACCEPTED'].includes(key)) {
    return { tone: 'good', label: 'Conforme', badgeClass: 'badge badge-approved' };
  }
  if (['REJECTED', 'FAILED', 'INVALID', 'ERROR'].includes(key)) {
    return { tone: 'bad', label: 'Non conforme', badgeClass: 'badge badge-rejected' };
  }
  if (['TO_COMPLETE', 'INCOMPLETE', 'NEEDS_REVIEW'].includes(key)) {
    return { tone: 'warn', label: 'À compléter', badgeClass: 'badge badge-warning' };
  }
  if (['PROCESSED', 'EXTRACTED', 'ANALYZED', 'OCR_DONE', 'REVIEWED'].includes(key)) {
    return { tone: 'ok', label: 'Lu par le système', badgeClass: 'badge badge-submitted' };
  }
  return { tone: 'pending', label: 'Lecture automatique en cours', badgeClass: 'badge badge-submitted' };
}

export function identityCheck(status?: string): DocumentCheck {
  const key = keyOf(status);
  if (key === 'VERIFIED') {
    return { tone: 'good', label: 'Identité conforme', badgeClass: 'badge badge-approved' };
  }
  if (key === 'REJECTED') {
    return { tone: 'bad', label: 'Identité non conforme', badgeClass: 'badge badge-rejected' };
  }
  return { tone: 'pending', label: 'Identité à contrôler', badgeClass: 'badge badge-submitted' };
}

export function isDocumentRejected(doc: CreditDocument | KycDocument) {
  return documentCheck(doc.status).tone === 'bad';
}

export function isDocumentPendingRead(doc: CreditDocument | KycDocument) {
  return documentCheck(doc.status).tone === 'pending';
}

export function summarizeDocumentCompliance(docs: CreditDocument[]) {
  const rejected = docs.filter(isDocumentRejected);
  const pending = docs.filter(isDocumentPendingRead);
  const read = docs.filter((doc) => documentCheck(doc.status).tone === 'ok' || documentCheck(doc.status).tone === 'good');
  const blockers: string[] = [];
  if (rejected.length) {
    blockers.push(`${rejected.length} pièce${rejected.length > 1 ? 's' : ''} non conforme${rejected.length > 1 ? 's' : ''}`);
  }
  return { rejected, pending, read, blockers };
}

export function documentLineHtml(name: string, status?: string) {
  const check = documentCheck(status);
  return `<div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem;font-size:0.8rem">
    <span>${name}</span>
    <span class="${check.badgeClass}" style="font-size:0.65rem;flex-shrink:0">${check.label}</span>
  </div>`;
}

export function transferBlockedMessage(blockers: string[]) {
  return `Transmission bloquée : ${blockers.join(', ')}.`;
}

const FIELD_LABELS: Record<string, string> = {
  amount: 'Montant',
  total: 'Montant',
  declared_value: 'Valeur déclarée',
  date: 'Date',
  issued_at: 'Date d’émission',
  due_date: 'Échéance',
  name: 'Nom',
  full_name: 'Nom',
  holder: 'Titulaire',
  issuer: 'Émetteur',
  vendor: 'Fournisseur',
  document_number: 'N° de pièce',
  number: 'N° de pièce',
  nina: 'NINA',
  cni: 'N° d’identité',
  address: 'Adresse',
  activity: 'Activité',
  income: 'Revenu relevé',
};

function humanizeKey(key: string) {
  return FIELD_LABELS[key] || key.replace(/[_-]+/g, ' ').replace(/^\w/, (letter) => letter.toUpperCase());
}

function flattenFields(value: unknown, prefix = ''): { label: string; value: string }[] {
  if (value == null || value === '') {
    return [];
  }
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return prefix ? [{ label: humanizeKey(prefix), value: String(value) }] : [];
  }
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => flattenFields(item, prefix ? `${prefix} ${index + 1}` : String(index + 1)));
  }
  if (typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).flatMap(([key, nested]) =>
      flattenFields(nested, prefix ? `${prefix}.${key}` : key),
    );
  }
  return [];
}

export function extractedFieldsFromDocument(doc: {
  extracted_data?: Record<string, unknown> | null;
  extracted_text?: string | null;
  analysis_summary?: string | null;
  document_type?: string;
  original_filename?: string;
}) {
  const fromData = flattenFields(doc.extracted_data).filter((row) => row.value.trim() && row.value !== '[object Object]');
  if (fromData.length) {
    return fromData.slice(0, 12);
  }
  const rows: { label: string; value: string }[] = [];
  if (doc.document_type) {
    rows.push({ label: 'Type', value: doc.document_type.replace(/[_-]+/g, ' ') });
  }
  if (doc.analysis_summary?.trim()) {
    rows.push({ label: 'Synthèse', value: doc.analysis_summary.trim() });
  }
  if (doc.extracted_text?.trim()) {
    rows.push({ label: 'Texte relevé', value: doc.extracted_text.trim().slice(0, 280) });
  }
  return rows;
}
