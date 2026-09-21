import { apiJson } from './client';
import { unwrapCollection } from './admin';
import { asAccounts, asHistories, type FinancialAccount, type KycDocument, type SavingsHistory } from './profile';
import type { ApiUser } from './types';

export type AgentClient = {
  id: number;
  client_number?: string;
  kyc_status?: string;
  city?: string | null;
  residential_zone?: string | null;
  occupation?: string | null;
  address?: string | null;
  user?: ApiUser;
  kyc_documents?: KycDocument[];
  financial_accounts?: FinancialAccount[];
  savings_histories?: SavingsHistory[];
  savings_history?: SavingsHistory[];
};

export type StoreFinancialAccountPayload = {
  account_number: string;
  account_type: string;
  balance?: number | null;
  opened_at?: string | null;
  status?: string | null;
};

export type StoreAccountTransactionPayload = {
  transaction_type: string;
  amount: number;
  transaction_date: string;
  reference?: string | null;
  description?: string | null;
};

export type StoreSavingsHistoryPayload = {
  account_id?: number | null;
  period_start: string;
  period_end: string;
  total_deposits: number;
  total_withdrawals: number;
  deposit_count: number;
  withdrawal_count: number;
  average_balance: number;
  closing_balance: number;
};

export const FINANCIAL_ACCOUNT_TYPES = ['EPARGNE', 'COURANT', 'TONTINE', 'DAT'] as const;
export const ACCOUNT_TRANSACTION_TYPES = ['DEPOSIT', 'WITHDRAWAL'] as const;

export function accountTypeLabel(type?: string) {
  const key = (type || '').toUpperCase();
  const labels: Record<string, string> = {
    EPARGNE: 'Épargne',
    SAVINGS: 'Épargne',
    COURANT: 'Compte courant',
    CURRENT: 'Compte courant',
    TONTINE: 'Tontine',
    DAT: 'Dépôt à terme',
  };
  return labels[key] || type || 'Compte';
}

export function transactionTypeLabel(type?: string) {
  const key = (type || '').toUpperCase();
  return key === 'WITHDRAWAL' ? 'Retrait' : key === 'DEPOSIT' ? 'Dépôt' : type || '—';
}

function normalizeAgentClient(client: AgentClient): AgentClient {
  const raw = client as unknown as Record<string, unknown>;
  return {
    ...client,
    financial_accounts: asAccounts(raw.financial_accounts),
    savings_histories: asHistories(raw.savings_histories ?? raw.savings_history),
  };
}

function unwrapClients(payload: unknown) {
  const rows = unwrapCollection<AgentClient>(payload);
  if (rows.length) {
    return rows;
  }
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    if (Array.isArray(record.clients)) {
      return record.clients as AgentClient[];
    }
  }
  return [];
}

export async function listAgentClients() {
  const rows: AgentClient[] = [];
  let page = 1;
  let lastPage = 1;
  do {
    const payload = await apiJson<unknown>(`/agent/clients?page=${page}&per_page=100`);
    const batch = unwrapClients(payload);
    rows.push(...batch);
    const record = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : {};
    const meta = record.meta && typeof record.meta === 'object' ? (record.meta as Record<string, unknown>) : undefined;
    const last = record.last_page ?? meta?.last_page;
    lastPage = typeof last === 'number' && last >= 1 ? last : 1;
    page += 1;
  } while (page <= lastPage && page <= 20);
  return rows;
}

export function unwrapAgentClient(payload: unknown): AgentClient | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }
  const record = payload as Record<string, unknown>;
  if (record.client && typeof record.client === 'object' && 'id' in record.client) {
    return record.client as AgentClient;
  }
  if (record.data && typeof record.data === 'object' && 'id' in record.data) {
    return record.data as AgentClient;
  }
  if (typeof record.id === 'number') {
    return record as AgentClient;
  }
  return null;
}

export async function getAgentClient(id: number) {
  const payload = await apiJson<unknown>(`/agent/clients/${id}`);
  const client = unwrapAgentClient(payload);
  if (!client) {
    throw new Error('Fiche client introuvable.');
  }
  return normalizeAgentClient(client);
}

export async function storeClientFinancialAccount(clientId: number, body: StoreFinancialAccountPayload) {
  return apiJson<unknown>(`/agent/clients/${clientId}/financial-accounts`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function storeAccountTransaction(accountId: number, body: StoreAccountTransactionPayload) {
  return apiJson<unknown>(`/agent/financial-accounts/${accountId}/transactions`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function storeClientSavingsHistory(clientId: number, body: StoreSavingsHistoryPayload) {
  return apiJson<unknown>(`/agent/clients/${clientId}/savings-history`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function listAgentClientKycDocuments(clientId: number) {
  try {
    const payload = await apiJson<unknown>(`/agent/clients/${clientId}/kyc-documents`);
    const rows = unwrapCollection<KycDocument>(payload);
    if (rows.length) {
      return rows;
    }
    const record = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : {};
    if (Array.isArray(record.kyc_documents)) {
      return record.kyc_documents as KycDocument[];
    }
    return [];
  } catch {
    return [];
  }
}

export async function verifyKycDocument(
  clientId: number,
  documentId: number,
  body: { decision: 'PENDING' | 'VERIFIED' | 'REJECTED'; rejection_reason?: string },
) {
  return apiJson<unknown>(`/agent/clients/${clientId}/kyc-documents/${documentId}/verify`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function agentClientName(client: AgentClient) {
  if (client.user?.full_name?.trim()) {
    return client.user.full_name.trim();
  }
  const assembled = [client.user?.first_name, client.user?.last_name].filter(Boolean).join(' ').trim();
  return assembled || client.client_number || `Client #${client.id}`;
}
