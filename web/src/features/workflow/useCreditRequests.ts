import { useCallback, useEffect, useState } from 'react';
import {
  listAgentRequests,
  listAnalystRequests,
  listCommitteeRequests,
  listMyCreditRequests,
  type CreditRequest,
} from '@/api/credit';
import { REQUESTS_CHANGED_EVENT } from './workflow';

export type WorkflowSource = 'mine' | 'agent' | 'analyst' | 'committee';

export function useCreditRequests(source: WorkflowSource) {
  const [items, setItems] = useState<CreditRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const rows =
        source === 'agent'
          ? await listAgentRequests()
          : source === 'analyst'
            ? await listAnalystRequests()
            : source === 'committee'
              ? await listCommitteeRequests()
              : await listMyCreditRequests();
      setItems(rows);
    } catch (err) {
      setItems([]);
      setError(err instanceof Error ? err.message : 'Impossible de charger les dossiers.');
    } finally {
      setLoading(false);
    }
  }, [source]);

  useEffect(() => {
    void reload();
    const onChange = () => {
      void reload();
    };
    window.addEventListener(REQUESTS_CHANGED_EVENT, onChange);
    return () => window.removeEventListener(REQUESTS_CHANGED_EVENT, onChange);
  }, [reload]);

  return { items, loading, error, reload };
}
