import { apiJson } from './client';

export type SimulationScenarioInput = {
  requested_amount: number;
  duration_months: number;
};

export type SimulationScenarioResult = {
  requested_amount?: number;
  duration_months?: number;
  monthly_payment?: number;
  estimated_monthly_payment?: number;
  installment?: number;
  total_interest?: number;
  interest_amount?: number;
  total_amount?: number;
  total_cost?: number;
  fees?: number;
  insurance?: number;
  disposable_income?: number;
  rest_to_live?: number;
  repayment_capacity_status?: string;
};

export function scenarioMonthly(row: SimulationScenarioResult) {
  return row.monthly_payment ?? row.estimated_monthly_payment ?? row.installment ?? null;
}

export function scenarioInterest(row: SimulationScenarioResult) {
  return row.total_interest ?? row.interest_amount ?? null;
}

export function scenarioTotal(row: SimulationScenarioResult, amount: number) {
  if (row.total_cost != null) {
    return row.total_cost;
  }
  if (row.total_amount != null) {
    return row.total_amount;
  }
  const monthly = scenarioMonthly(row);
  const months = row.duration_months;
  if (monthly != null && months) {
    return monthly * months;
  }
  const interest = scenarioInterest(row);
  return interest != null ? amount + interest : null;
}

function unwrapScenarios(payload: unknown): SimulationScenarioResult[] {
  if (!payload || typeof payload !== 'object') {
    return [];
  }
  const record = payload as Record<string, unknown>;
  const bags = [record.scenarios, record.results, record.comparisons, record.data];
  for (const bag of bags) {
    if (Array.isArray(bag) && bag.length) {
      return bag as SimulationScenarioResult[];
    }
    if (bag && typeof bag === 'object' && Array.isArray((bag as { data?: unknown }).data)) {
      return (bag as { data: SimulationScenarioResult[] }).data;
    }
  }
  if (typeof record.monthly_payment === 'number' || typeof record.estimated_monthly_payment === 'number') {
    return [record as SimulationScenarioResult];
  }
  return [];
}

export async function simulateInstallments(body: {
  monthly_income?: number;
  monthly_expenses?: number;
  existing_debt_payment?: number;
  scenarios: SimulationScenarioInput[];
}) {
  const payload = await apiJson<unknown>('/simulations/installments', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return unwrapScenarios(payload);
}
