import { useCallback, useEffect, useState } from 'react';
import { listCreditRequestGuarantees, type CreditGuarantee, type CreditRequest } from '@/api/credit';
import { listAgentClients, type AgentClient } from '@/api/agent';
import { useCreditRequests } from '@/features/workflow/useCreditRequests';

export type GuaranteeRow = {
  request: CreditRequest;
  guarantee: CreditGuarantee;
};

export function useAgentWorkspace() {
  const requests = useCreditRequests('agent');
  const [clients, setClients] = useState<AgentClient[]>([]);
  const [guarantees, setGuarantees] = useState<GuaranteeRow[]>([]);

  const reloadExtras = useCallback(async (rows: CreditRequest[]) => {
    const [nextClients, nested] = await Promise.all([
      listAgentClients().catch(() => [] as AgentClient[]),
      Promise.all(
        rows.map(async (request) => {
          const items = await listCreditRequestGuarantees(request.id).catch(() => [] as CreditGuarantee[]);
          return items.map((guarantee) => ({ request, guarantee }));
        }),
      ),
    ]);
    setClients(nextClients);
    setGuarantees(nested.flat());
  }, []);

  useEffect(() => {
    if (requests.loading) {
      return;
    }
    void reloadExtras(requests.items);
  }, [reloadExtras, requests.items, requests.loading]);

  const complements = requests.items.filter((row) => (row.status || '').toUpperCase() === 'VERIFICATION_REQUIRED');
  const pendingGuarantees = guarantees.filter((row) => (row.guarantee.verification_status || 'PENDING').toUpperCase() === 'PENDING');

  return {
    ...requests,
    clients,
    guarantees,
    complements,
    pendingGuarantees,
    reloadAll: async () => {
      await requests.reload();
    },
  };
}
