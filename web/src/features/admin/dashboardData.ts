import type { StaffRole } from '@/api/admin';

/** Switch to `'api'` once list endpoints are assembled in `loadAdminDashboardFromApi`. */
export const ADMIN_DASHBOARD_SOURCE: 'placeholder' | 'api' = 'placeholder';

export type AdminQueueKey = 'agent' | 'analyst' | 'committee' | 'disburse';

export type AdminAuditPreview = {
  id: string;
  when: string;
  action: string;
  actor: string;
  entity: string;
  details: string;
};

export type AdminDashboardSnapshot = {
  users: {
    total: number;
    active: number;
    inactive: number;
    byRole: Record<StaffRole, number>;
  };
  scoring: {
    total: number;
    active: number;
    draft: number;
    inactive: number;
    archived: number;
    activeName: string | null;
  };
  roles: {
    system: number;
    custom: number;
  };
  queues: Record<AdminQueueKey, number>;
  audit: AdminAuditPreview[];
};

export const PLACEHOLDER_ADMIN_DASHBOARD: AdminDashboardSnapshot = {
  users: {
    total: 9,
    active: 8,
    inactive: 1,
    byRole: {
      admin: 1,
      credit_agent: 5,
      analyst: 1,
      committee_member: 2,
    },
  },
  scoring: {
    total: 3,
    active: 1,
    draft: 1,
    inactive: 1,
    archived: 0,
    activeName: 'Grille STANDARD V1',
  },
  roles: {
    system: 5,
    custom: 1,
  },
  queues: {
    agent: 12,
    analyst: 5,
    committee: 3,
    disburse: 2,
  },
  audit: [
    {
      id: 'a1',
      when: '2026-09-18T11:24:00.000Z',
      action: 'user.updated',
      actor: 'Admin Crédit Fast',
      entity: 'users',
      details: 'role: credit_agent · status: active',
    },
    {
      id: 'a2',
      when: '2026-09-18T10:02:00.000Z',
      action: 'scoring.status',
      actor: 'Admin Crédit Fast',
      entity: 'scoring_models',
      details: 'DRAFT → ACTIVE · Grille STANDARD V1',
    },
    {
      id: 'a3',
      when: '2026-09-17T16:41:00.000Z',
      action: 'user.created',
      actor: 'Admin Crédit Fast',
      entity: 'users',
      details: 'credit_agent · agent@creditfast.ml',
    },
    {
      id: 'a4',
      when: '2026-09-17T09:15:00.000Z',
      action: 'password.reset',
      actor: 'Admin Crédit Fast',
      entity: 'users',
      details: 'sessions révoquées',
    },
    {
      id: 'a5',
      when: '2026-09-16T14:08:00.000Z',
      action: 'user.deactivated',
      actor: 'Admin Crédit Fast',
      entity: 'users',
      details: 'compte inactif',
    },
    {
      id: 'a6',
      when: '2026-09-16T08:33:00.000Z',
      action: 'scoring.rule',
      actor: 'Admin Crédit Fast',
      entity: 'scoring_rules',
      details: 'R_CAP_02 · weight 15',
    },
  ],
};

export type AdminOpsTask = {
  id: string;
  title: string;
  meta: string;
  tone: 'warn' | 'info' | 'good';
  to: string;
};

export function buildAdminOpsTasks(snapshot: AdminDashboardSnapshot): AdminOpsTask[] {
  const tasks: AdminOpsTask[] = [];

  if (snapshot.scoring.active === 0) {
    tasks.push({
      id: 'scoring-active',
      title: 'Aucun modèle de scoring ACTIVE',
      meta: 'Les dossiers ne peuvent pas être notés tant qu’un modèle n’est pas activé.',
      tone: 'warn',
      to: '/app/admin/scoring',
    });
  } else if (snapshot.scoring.draft > 0) {
    tasks.push({
      id: 'scoring-draft',
      title: `${snapshot.scoring.draft} modèle${snapshot.scoring.draft > 1 ? 's' : ''} en brouillon`,
      meta: snapshot.scoring.activeName ? `Actif : ${snapshot.scoring.activeName}` : 'Activer ou archiver les brouillons.',
      tone: 'info',
      to: '/app/admin/scoring',
    });
  }

  if (snapshot.users.inactive > 0) {
    tasks.push({
      id: 'users-inactive',
      title: `${snapshot.users.inactive} compte${snapshot.users.inactive > 1 ? 's' : ''} inactif${snapshot.users.inactive > 1 ? 's' : ''}`,
      meta: 'Vérifier révocation des sessions et éventuelle réactivation.',
      tone: 'info',
      to: '/app/admin/users',
    });
  }

  if (snapshot.queues.committee > 0) {
    tasks.push({
      id: 'queue-committee',
      title: `${snapshot.queues.committee} dossiers en file comité`,
      meta: 'Octroi en attente — lecture seule ici tant que l’API n’est pas branchée.',
      tone: 'warn',
      to: '/app/admin',
    });
  }

  if (snapshot.queues.disburse > 0) {
    tasks.push({
      id: 'queue-disburse',
      title: `${snapshot.queues.disburse} prêts à décaisser`,
      meta: 'Action chargé / admin via l’API prêts.',
      tone: 'info',
      to: '/app/admin',
    });
  }

  if (tasks.length === 0) {
    tasks.push({
      id: 'ok',
      title: 'Rien à traiter',
      meta: 'Comptes, scoring et files sont dans les seuils.',
      tone: 'good',
      to: '/app/admin',
    });
  }

  return tasks;
}

export async function loadAdminDashboard(): Promise<AdminDashboardSnapshot> {
  if (ADMIN_DASHBOARD_SOURCE === 'api') {
    return loadAdminDashboardFromApi();
  }
  return structuredClone(PLACEHOLDER_ADMIN_DASHBOARD);
}

/** Assemble live admin lists when `ADMIN_DASHBOARD_SOURCE` is `'api'`. Queues stay 0 until those endpoints exist. */
async function loadAdminDashboardFromApi(): Promise<AdminDashboardSnapshot> {
  const { listAdminUsers, listScoringModels, listAdminAuditLogs } = await import('@/api/admin');
  const [users, models, logs] = await Promise.all([listAdminUsers(), listScoringModels(), listAdminAuditLogs()]);

  const byRole: AdminDashboardSnapshot['users']['byRole'] = {
    admin: 0,
    credit_agent: 0,
    analyst: 0,
    committee_member: 0,
  };

  for (const user of users) {
    const role = user.role as keyof typeof byRole;
    if (role in byRole) {
      byRole[role] += 1;
    }
  }

  const scoringStatus = (status?: string) => (status || '').toUpperCase();

  return {
    users: {
      total: users.length,
      active: users.filter((user) => user.status !== 'inactive').length,
      inactive: users.filter((user) => user.status === 'inactive').length,
      byRole,
    },
    scoring: {
      total: models.length,
      active: models.filter((model) => scoringStatus(model.status) === 'ACTIVE').length,
      draft: models.filter((model) => scoringStatus(model.status) === 'DRAFT').length,
      inactive: models.filter((model) => scoringStatus(model.status) === 'INACTIVE').length,
      archived: models.filter((model) => scoringStatus(model.status) === 'ARCHIVED').length,
      activeName: models.find((model) => scoringStatus(model.status) === 'ACTIVE')?.name ?? null,
    },
    roles: {
      system: 5,
      custom: 0,
    },
    queues: {
      agent: 0,
      analyst: 0,
      committee: 0,
      disburse: 0,
    },
    audit: logs.slice(0, 6).map((log, index) => ({
      id: String(log.id ?? index),
      when: log.created_at || '',
      action: String(log.action || '—'),
      actor: log.user?.full_name || log.user?.email || log.user_name || '—',
      entity: String(log.entity || log.entity_type || '—'),
      details: typeof log.details === 'string' ? log.details : JSON.stringify(log.details ?? log.description ?? ''),
    })),
  };
}
