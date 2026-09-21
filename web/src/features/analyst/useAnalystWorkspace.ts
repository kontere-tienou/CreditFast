import { useCallback, useEffect, useState } from 'react';
import {
  getAnalysisTransferBlockers,
  listAnalystAnomalies,
  type CreditAnomaly,
  type CreditRequest,
} from '@/api/credit';
import { useCreditRequests } from '@/features/workflow/useCreditRequests';
import { borrowerName } from '@/features/workflow/workflow';

export type AnalystSignal = CreditAnomaly & {
  request?: CreditRequest;
  borrower?: string;
};

let cachedSignals: AnalystSignal[] = [];

export function getCachedAnalystSignals() {
  return cachedSignals;
}

export function useAnalystWorkspace() {
  const requests = useCreditRequests('analyst');
  const [signals, setSignals] = useState<AnalystSignal[]>([]);

  const reloadSignals = useCallback(async (rows: CreditRequest[]) => {
    const fromApi = await listAnalystAnomalies();
    if (fromApi.length) {
      const mapped = fromApi.map((item) => {
        const request = rows.find((row) => row.id === item.credit_request_id);
        return { ...item, request, borrower: request ? borrowerName(request) : 'Demandeur' };
      });
      cachedSignals = mapped;
      setSignals(mapped);
      return;
    }
    const derived: AnalystSignal[] = [];
    await Promise.all(
      rows.map(async (request) => {
        const { blockers } = await getAnalysisTransferBlockers(request.id);
        if (blockers.includes('pièces justificatives')) {
          derived.push({
            id: request.id * 10 + 1,
            credit_request_id: request.id,
            anomaly_type: 'PIECES_MANQUANTES',
            severity: 'HIGH',
            status: 'OPEN',
            description: 'Aucune pièce justificative n’est jointe au dossier.',
            request,
            borrower: borrowerName(request),
          });
        }
        if (blockers.some((item) => item.includes('non conforme'))) {
          derived.push({
            id: request.id * 10 + 4,
            credit_request_id: request.id,
            anomaly_type: 'PIECES_NON_CONFORMES',
            severity: 'HIGH',
            status: 'OPEN',
            description: 'Le contrôle automatique a rejeté au moins une pièce. Elle doit être reprise avant le comité.',
            request,
            borrower: borrowerName(request),
          });
        }
        if (blockers.includes('garantie')) {
          derived.push({
            id: request.id * 10 + 2,
            credit_request_id: request.id,
            anomaly_type: 'GARANTIE_MANQUANTE',
            severity: 'MEDIUM',
            status: 'OPEN',
            description: 'Aucune garantie n’est déclarée sur le dossier.',
            request,
            borrower: borrowerName(request),
          });
        }
        if ((request.repayment_capacity_status || '').toUpperCase() === 'INSUFFICIENT') {
          derived.push({
            id: request.id * 10 + 3,
            credit_request_id: request.id,
            anomaly_type: 'CAPACITE_INSUFFISANTE',
            severity: 'HIGH',
            status: 'OPEN',
            description: 'Le reste à vivre est inférieur à la mensualité estimée.',
            request,
            borrower: borrowerName(request),
          });
        }
      }),
    );
    cachedSignals = derived;
    setSignals(derived);
  }, []);

  useEffect(() => {
    if (requests.loading) {
      return;
    }
    void reloadSignals(requests.items);
  }, [reloadSignals, requests.items, requests.loading]);

  const inAnalysis = requests.items.filter((row) => {
    const status = (row.status || '').toUpperCase();
    return ['ANALYSIS', 'IN_ANALYSIS', 'PENDING_ANALYSIS'].includes(status);
  });
  const committee = requests.items.filter((row) => {
    const status = (row.status || '').toUpperCase();
    return ['COMMITTEE', 'PENDING_COMMITTEE'].includes(status);
  });
  const complements = requests.items.filter((row) => (row.status || '').toUpperCase() === 'VERIFICATION_REQUIRED');
  const approved = requests.items.filter((row) => (row.status || '').toUpperCase() === 'APPROVED');

  return {
    ...requests,
    signals,
    inAnalysis,
    committee,
    complements,
    approved,
  };
}
