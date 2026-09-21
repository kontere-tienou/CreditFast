import { apiJson } from './client';
import type { ApiRole, ApiUser } from './types';

export type StaffRole = Extract<ApiRole, 'admin' | 'credit_agent' | 'analyst' | 'committee_member'>;

export type StaffUser = ApiUser & {
  id: number;
};

export type ScoringModel = {
  id: number;
  name: string;
  version?: string;
  scoring_mode?: string;
  status?: string;
  description?: string | null;
  effective_from?: string | null;
};

export type AuditLog = {
  id: number | string;
  action?: string;
  entity?: string;
  entity_type?: string;
  details?: string | Record<string, unknown>;
  description?: string;
  ip?: string;
  ip_address?: string;
  created_at?: string;
  user?: { full_name?: string; email?: string };
  user_name?: string;
};

export type StoreStaffUserPayload = {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  password: string;
  role: StaffRole;
};

export type UpdateStaffUserPayload = {
  first_name?: string;
  last_name?: string;
  email?: string | null;
  phone?: string | null;
  status?: 'active' | 'inactive';
  role?: StaffRole;
};

export const STAFF_ROLES: StaffRole[] = ['admin', 'credit_agent', 'analyst', 'committee_member'];

export function isStaffRole(role: string | undefined | null): role is StaffRole {
  return Boolean(role && STAFF_ROLES.includes(role as StaffRole));
}

const CLIENT_ROLE_SLUGS = new Set(['client', 'demandeur', 'borrower']);

export function normalizeManagedRole(role: string | undefined | null): ManagedRole {
  const slug = (role || '').trim().toLowerCase();
  if (CLIENT_ROLE_SLUGS.has(slug)) {
    return 'client';
  }
  if (slug === 'credit_officer' || slug === 'officer' || slug === 'agent') {
    return 'credit_agent';
  }
  if (isStaffRole(slug)) {
    return slug;
  }
  return 'client';
}

export const STAFF_ROLE_CATALOG: Record<
  StaffRole,
  {
    slug: StaffRole;
    label: string;
    icon: string;
    tone: 'primary' | 'emerald' | 'amber' | 'purple';
    login: string;
    summary: string;
    capabilities: string[];
  }
> = {
  admin: {
    slug: 'admin',
    label: 'Administrateur',
    icon: 'fa-user-shield',
    tone: 'primary',
    login: 'E-mail professionnel · /auth/staff/login',
    summary: 'Pilotage système : comptes internes, modèles de scoring et journal d’audit.',
    capabilities: [
      'Créer, modifier et désactiver les comptes internes',
      'Attribuer un rôle staff (admin, chargé, analyste, comité)',
      'Réinitialiser le mot de passe d’un autre compte',
      'Créer et activer les modèles / règles de scoring',
      'Consulter le journal d’audit',
      'Peut aussi appeler les files agent, analyste, comité et décaissement',
    ],
  },
  credit_agent: {
    slug: 'credit_agent',
    label: 'Chargé de crédit',
    icon: 'fa-id-badge',
    tone: 'emerald',
    login: 'E-mail professionnel · /auth/staff/login',
    summary: 'Collecte terrain : file agent, fiches clients, vérifications et décaissement.',
    capabilities: [
      'Lister et instruire la file agent',
      'Demander des compléments (renvoi au client)',
      'Envoyer un dossier en analyse',
      'Vérifier KYC et garanties',
      'Saisir comptes institutionnels, mouvements et épargne (mode STANDARD)',
      'Lister / lire les fiches clients',
      'Décaisser un prêt et enregistrer un remboursement',
      'Déclencher le scoring (sans octroi)',
    ],
  },
  analyst: {
    slug: 'analyst',
    label: 'Analyste risque',
    icon: 'fa-chart-line',
    tone: 'amber',
    login: 'E-mail professionnel · /auth/staff/login',
    summary: 'Instruction risque : revue, anomalies et validation humaine.',
    capabilities: [
      'Lister la file d’analyse',
      'Enregistrer une revue (renvoi client si VERIFICATION_REQUIRED)',
      'Résoudre une anomalie',
      'Validation humaine (TO_COMPLETE renvoie au client)',
      'Vérifier KYC et garanties (contrats analyste)',
      'Déclencher le scoring et lire l’analyse',
    ],
  },
  committee_member: {
    slug: 'committee_member',
    label: 'Comité de crédit',
    icon: 'fa-gavel',
    tone: 'purple',
    login: 'E-mail professionnel · /auth/staff/login',
    summary: 'Octroi : file comité et décision (crée le prêt, sans décaissement).',
    capabilities: [
      'Lister la file comité',
      'Décider APPROVED / AMENDED / refus',
      'APPROVED ou AMENDED crée le prêt sans décaissement',
    ],
  },
};

export const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
  admin: STAFF_ROLE_CATALOG.admin.label,
  credit_agent: STAFF_ROLE_CATALOG.credit_agent.label,
  analyst: STAFF_ROLE_CATALOG.analyst.label,
  committee_member: STAFF_ROLE_CATALOG.committee_member.label,
};

export type ManagedRole = StaffRole | 'client';

export const USER_ROLE_LABELS: Record<ManagedRole, string> = {
  ...STAFF_ROLE_LABELS,
  client: 'Client',
};

export function roleLabel(role: string | undefined | null) {
  if (role && role in USER_ROLE_LABELS) {
    return USER_ROLE_LABELS[role as ManagedRole];
  }
  return role || '—';
}

function paginationLastPage(payload: unknown) {
  if (!payload || typeof payload !== 'object') {
    return 1;
  }
  const record = payload as Record<string, unknown>;
  const meta = record.meta && typeof record.meta === 'object' ? (record.meta as Record<string, unknown>) : undefined;
  const last = record.last_page ?? record.lastPage ?? meta?.last_page ?? meta?.lastPage;
  return typeof last === 'number' && last >= 1 ? last : 1;
}

export function unwrapCollection<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) {
    return payload as T[];
  }
  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const record = payload as Record<string, unknown>;
  for (const key of ['data', 'users', 'items', 'models', 'logs']) {
    const value = record[key];
    if (Array.isArray(value)) {
      return value as T[];
    }
    if (value && typeof value === 'object' && Array.isArray((value as { data?: unknown }).data)) {
      return (value as { data: T[] }).data;
    }
  }

  return [];
}

export async function listAdminUsers() {
  const users: StaffUser[] = [];
  let page = 1;
  let lastPage = 1;

  do {
    const payload = await apiJson<unknown>(`/admin/users?page=${page}&per_page=100`);
    users.push(...unwrapCollection<StaffUser>(payload));
    lastPage = paginationLastPage(payload);
    page += 1;
  } while (page <= lastPage && page <= 50);

  return users;
}

export async function getAdminUser(userId: number) {
  const payload = await apiJson<StaffUser | { user?: StaffUser; data?: StaffUser }>(`/admin/users/${userId}`);
  if (payload && typeof payload === 'object' && 'user' in payload && payload.user) {
    return payload.user;
  }
  if (payload && typeof payload === 'object' && 'data' in payload && payload.data) {
    return payload.data;
  }
  return payload as StaffUser;
}

export async function createAdminUser(body: StoreStaffUserPayload) {
  return apiJson<{ user?: StaffUser; message?: string }>('/admin/users', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function updateAdminUser(userId: number, body: UpdateStaffUserPayload) {
  return apiJson<{ user?: StaffUser; message?: string }>(`/admin/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export async function deactivateAdminUser(userId: number) {
  return apiJson<{ message?: string }>(`/admin/users/${userId}`, { method: 'DELETE' });
}

export function restoreAdminUser(userId: number) {
  return updateAdminUser(userId, { status: 'active' });
}

export function isInactiveUser(status?: string | null) {
  const key = (status || '').toLowerCase();
  return key === 'inactive' || key === 'disabled' || key === 'deleted' || key === 'suspended';
}

export async function resetAdminUserPassword(userId: number, password: string) {
  return apiJson<{ message?: string }>(`/admin/users/${userId}/password`, {
    method: 'PUT',
    body: JSON.stringify({ password, password_confirmation: password }),
  });
}

export async function listScoringModels() {
  const payload = await apiJson<unknown>('/admin/scoring-models');
  return unwrapCollection<ScoringModel>(payload);
}

export async function createScoringModel(body: {
  name: string;
  version: string;
  scoring_mode: 'STANDARD' | 'COLD_START';
  description?: string;
  effective_from?: string;
}) {
  return apiJson<{ message?: string }>('/admin/scoring-models', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function updateScoringModelStatus(modelId: number, status: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED') {
  return apiJson<{ message?: string }>(`/admin/scoring-models/${modelId}/status`, {
    method: 'POST',
    body: JSON.stringify({ status }),
  });
}

export async function listAdminAuditLogs() {
  const payload = await apiJson<unknown>('/admin/audit-logs');
  return unwrapCollection<AuditLog>(payload);
}

export const SCORING_FACTOR_TYPES = [
  'income_consistency',
  'expense',
  'activity',
  'document',
  'savings',
  'credit_history',
  'guarantee',
  'repayment_capacity',
  'residential_zone',
] as const;

export type ScoringFactorType = (typeof SCORING_FACTOR_TYPES)[number];

export async function createScoringRule(
  modelId: number,
  body: {
    rule_code: string;
    rule_name: string;
    factor_type: ScoringFactorType;
    weight: number;
    description?: string;
  },
) {
  return apiJson<{ message?: string }>(`/admin/scoring-models/${modelId}/rules`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
