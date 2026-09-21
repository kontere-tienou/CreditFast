import type { RoleCode } from '@/app/roles';
import type { ApiRole } from './types';

const ROLE_ALIASES: Record<string, RoleCode> = {
  CLIENT: 'CLIENT',
  client: 'CLIENT',
  demandeur: 'CLIENT',
  borrower: 'CLIENT',
  CREDIT_OFFICER: 'CREDIT_OFFICER',
  credit_officer: 'CREDIT_OFFICER',
  credit_agent: 'CREDIT_OFFICER',
  agent: 'CREDIT_OFFICER',
  officer: 'CREDIT_OFFICER',
  ANALYST: 'ANALYST',
  analyst: 'ANALYST',
  COMMITTEE: 'COMMITTEE',
  committee: 'COMMITTEE',
  committee_member: 'COMMITTEE',
  admin: 'ADMIN',
  ADMIN: 'ADMIN',
};

export function mapApiRole(role: ApiRole | string | undefined): RoleCode {
  if (!role) {
    return 'CLIENT';
  }
  return ROLE_ALIASES[role] ?? ROLE_ALIASES[role.toLowerCase()] ?? 'CLIENT';
}
