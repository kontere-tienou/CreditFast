export type RoleRecord = {
  id: string;
  name: string;
  slug: string;
  system: boolean;
  permissions: string[];
};

export type PermissionGroup = {
  id: string;
  label: string;
  items: { id: string; label: string }[];
};

export const ROLE_PERMISSION_GROUPS: PermissionGroup[] = [
  {
    id: 'admin',
    label: 'Administration',
    items: [
      { id: 'admin.users.read', label: 'Lister / lire les comptes internes' },
      { id: 'admin.users.write', label: 'Créer et modifier un compte interne' },
      { id: 'admin.users.password', label: 'Réinitialiser un mot de passe' },
      { id: 'admin.users.deactivate', label: 'Désactiver un compte' },
      { id: 'admin.scoring', label: 'Modèles et règles de scoring' },
      { id: 'admin.audit', label: 'Journal d’audit' },
    ],
  },
  {
    id: 'agent',
    label: 'Chargé de crédit',
    items: [
      { id: 'agent.requests', label: 'File agent' },
      { id: 'agent.complements', label: 'Demander des compléments' },
      { id: 'agent.send_analysis', label: 'Envoyer en analyse' },
      { id: 'agent.kyc', label: 'Vérifier KYC' },
      { id: 'agent.guarantee', label: 'Vérifier une garantie' },
      { id: 'agent.clients', label: 'Fiches clients' },
      { id: 'agent.financial', label: 'Comptes, mouvements, épargne' },
      { id: 'loans.disburse', label: 'Décaisser un prêt' },
      { id: 'loans.repay', label: 'Enregistrer un remboursement' },
    ],
  },
  {
    id: 'analyst',
    label: 'Analyse risque',
    items: [
      { id: 'analyst.requests', label: 'File d’analyse' },
      { id: 'analyst.review', label: 'Enregistrer une revue' },
      { id: 'analyst.anomalies', label: 'Résoudre une anomalie' },
      { id: 'analyst.validation', label: 'Validation humaine' },
      { id: 'scoring.evaluate', label: 'Calculer / lire le scoring' },
    ],
  },
  {
    id: 'committee',
    label: 'Comité',
    items: [
      { id: 'committee.requests', label: 'File comité' },
      { id: 'committee.decide', label: 'Décider (octroi / amendement / refus)' },
    ],
  },
  {
    id: 'client',
    label: 'Client',
    items: [
      { id: 'client.profile', label: 'Profil, activités, KYC, financier' },
      { id: 'client.requests', label: 'Créer / soumettre une demande' },
      { id: 'client.documents', label: 'Pièces et garanties de dossier' },
      { id: 'loans.read', label: 'Consulter ses prêts et échéances' },
    ],
  },
  {
    id: 'shared',
    label: 'Commun',
    items: [
      { id: 'auth.session', label: 'Session, profil auth, mot de passe' },
      { id: 'notifications', label: 'Notifications' },
      { id: 'simulations', label: 'Simulation d’échéances' },
    ],
  },
];

const SHARED = ['auth.session', 'notifications', 'simulations'] as const;

export const SYSTEM_ROLES: RoleRecord[] = [
  {
    id: 'system-admin',
    name: 'Administrateur',
    slug: 'admin',
    system: true,
    permissions: [
      ...ROLE_PERMISSION_GROUPS.find((group) => group.id === 'admin')!.items.map((item) => item.id),
      ...ROLE_PERMISSION_GROUPS.find((group) => group.id === 'agent')!.items.map((item) => item.id),
      ...ROLE_PERMISSION_GROUPS.find((group) => group.id === 'analyst')!.items.map((item) => item.id),
      ...ROLE_PERMISSION_GROUPS.find((group) => group.id === 'committee')!.items.map((item) => item.id),
      ...SHARED,
    ],
  },
  {
    id: 'system-credit-agent',
    name: 'Chargé de crédit',
    slug: 'credit_agent',
    system: true,
    permissions: [
      ...ROLE_PERMISSION_GROUPS.find((group) => group.id === 'agent')!.items.map((item) => item.id),
      'scoring.evaluate',
      'loans.read',
      ...SHARED,
    ],
  },
  {
    id: 'system-analyst',
    name: 'Analyste risque',
    slug: 'analyst',
    system: true,
    permissions: [
      ...ROLE_PERMISSION_GROUPS.find((group) => group.id === 'analyst')!.items.map((item) => item.id),
      'agent.kyc',
      'agent.guarantee',
      ...SHARED,
    ],
  },
  {
    id: 'system-committee',
    name: 'Comité de crédit',
    slug: 'committee_member',
    system: true,
    permissions: [...ROLE_PERMISSION_GROUPS.find((group) => group.id === 'committee')!.items.map((item) => item.id), ...SHARED],
  },
];

const STORAGE_KEY = 'CREDITFAST_ADMIN_ROLE_REGISTRY';

function isRoleRecord(value: unknown): value is RoleRecord {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const record = value as RoleRecord;
  return Boolean(record.id && record.name && record.slug && Array.isArray(record.permissions));
}

export function loadRoleRegistry(): RoleRecord[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return SYSTEM_ROLES.map((role) => ({ ...role, permissions: [...role.permissions] }));
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return SYSTEM_ROLES.map((role) => ({ ...role, permissions: [...role.permissions] }));
    }
    const custom = parsed.filter(
      (item): item is RoleRecord => isRoleRecord(item) && !item.system && item.slug !== 'client',
    );
    const storedSystem = parsed.filter((item): item is RoleRecord => isRoleRecord(item) && item.system);
    const system = SYSTEM_ROLES.map((role) => {
      const override = storedSystem.find((item) => item.slug === role.slug);
      return override
        ? { ...role, name: override.name, permissions: override.permissions }
        : { ...role, permissions: [...role.permissions] };
    });
    return [...system, ...custom];
  } catch {
    return SYSTEM_ROLES.map((role) => ({ ...role, permissions: [...role.permissions] }));
  }
}

export function saveRoleRegistry(roles: RoleRecord[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(roles));
}

export function slugifyRole(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 40);
}

export function emptyRoleDraft(): RoleRecord {
  return {
    id: '',
    name: '',
    slug: '',
    system: false,
    permissions: [...SHARED],
  };
}
