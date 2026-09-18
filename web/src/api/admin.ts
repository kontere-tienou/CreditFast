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
  details?: string;
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
  email?: string;
  phone?: string | null;
  status?: 'active' | 'inactive';
  role?: StaffRole;
};

export const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
  admin: 'Administrateur',
  credit_agent: 'Chargé de crédit',
  analyst: 'Analyste risque',
  committee_member: 'Comité de crédit',
};

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
  const payload = await apiJson<unknown>('/admin/users');
  return unwrapCollection<StaffUser>(payload);
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
