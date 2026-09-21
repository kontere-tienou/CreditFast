export const REQUESTS_CHANGED_EVENT = 'creditfast-requests-changed';
export const PROFILE_CHANGED_EVENT = 'creditfast-profile-changed';

let selectedCreditRequestId: number | null = null;

export function setSelectedCreditRequestId(id: number | null) {
  selectedCreditRequestId = id;
}

export function getSelectedCreditRequestId() {
  return selectedCreditRequestId;
}

export function notifyRequestsChanged() {
  window.dispatchEvent(new CustomEvent(REQUESTS_CHANGED_EVENT));
}

export function notifyProfileChanged() {
  window.dispatchEvent(new CustomEvent(PROFILE_CHANGED_EVENT));
}

export function formatDate(value?: string | null) {
  if (!value) {
    return '—';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString('fr-FR');
}

export function formatFcfa(value?: number | null) {
  if (value == null || Number.isNaN(value)) {
    return '—';
  }
  return `${new Intl.NumberFormat('fr-FR').format(Math.round(value))} FCFA`;
}

export function creditStatusLabel(status?: string) {
  const key = (status || '').toUpperCase();
  const labels: Record<string, string> = {
    DRAFT: 'Brouillon',
    SUBMITTED: 'Soumise — agent',
    RECEIVED: 'Reçue au guichet',
    UNDER_REVIEW: 'Vérification agent',
    VERIFICATION_REQUIRED: 'Compléments demandés',
    IN_ANALYSIS: 'Chez l’analyste',
    ANALYSIS: 'Chez l’analyste',
    PENDING_ANALYSIS: 'Chez l’analyste',
    COMMITTEE: 'Comité',
    PENDING_COMMITTEE: 'Comité',
    APPROVED: 'Approuvée',
    REJECTED: 'Refusée',
    AMENDED: 'Accord amendé',
  };
  return labels[key] || status || '—';
}

export function loanStatusLabel(status?: string) {
  const key = (status || '').toUpperCase();
  const labels: Record<string, string> = {
    APPROVED: 'Accordé — fonds à verser',
    ACTIVE: 'En cours',
    CLOSED: 'Soldé',
    DEFAULTED: 'En défaut',
  };
  return labels[key] || status || '—';
}

export function repaymentStatusLabel(status?: string) {
  const key = (status || '').toUpperCase();
  const labels: Record<string, string> = {
    PENDING: 'À régler',
    PAID: 'Réglée',
    LATE: 'En retard',
    DUE: 'Exigible',
    OVERDUE: 'En retard',
    UPCOMING: 'À venir',
    SCHEDULED: 'À venir',
  };
  return labels[key] || status || '—';
}

function personName(person?: {
  full_name?: string;
  first_name?: string;
  last_name?: string;
  name?: string;
} | null) {
  if (person?.full_name?.trim()) {
    return person.full_name.trim();
  }
  const assembled = [person?.first_name, person?.last_name].filter(Boolean).join(' ').trim();
  return assembled || person?.name?.trim() || '';
}

export function borrowerName(row: {
  client?: {
    full_name?: string;
    first_name?: string;
    last_name?: string;
    user?: { full_name?: string; first_name?: string; last_name?: string; name?: string };
  };
}) {
  return personName(row.client?.user) || personName(row.client) || 'Demandeur';
}
