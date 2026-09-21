export type RoleCode = 'CLIENT' | 'CREDIT_OFFICER' | 'ANALYST' | 'COMMITTEE' | 'ADMIN';

export type NavItem = {
  id: string;
  path: string;
  icon: string;
  label: string;
  badge?: string;
  badgeClass?: string;
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

export type RoleProfile = {
  code: RoleCode;
  name: string;
  shortName: string;
  homePath: string;
  avatar: string;
  displayName: string;
  title: string;
  badgeColor: string;
  navGroups: NavGroup[];
};

export const VIEW_PATHS: Record<string, string> = {
  'view-role-client': '/app/client',
  'view-client-requests': '/app/client/requests',
  'view-client-simulator': '/app/client/simulator',
  'view-client-schedule': '/app/client/schedule',
  'view-client-documents': '/app/client/documents',
  'view-client-profile': '/app/client/profile',
  'view-client-advisor': '/app/client/advisor',
  'view-role-agent': '/app/agent',
  'view-agent-inspections': '/app/agent/inspections',
  'view-agent-clients': '/app/agent/clients',
  'view-agent-complements': '/app/agent/complements',
  'view-agent-loans': '/app/agent/loans',
  'view-role-analyst': '/app/analyst',
  'view-analyst-dossiers': '/app/analyst/dossiers',
  'view-scoring-admin': '/app/analyst/scoring',
  'view-analyst-anomalies': '/app/analyst/anomalies',
  'view-audit-logs': '/app/analyst/audit',
  'view-role-committee': '/app/committee',
  'view-committee-dossiers': '/app/committee/dossiers',
  'view-committee-signed': '/app/committee/signed',
  'view-role-admin': '/app/admin',
  'view-admin-users': '/app/admin/users',
  'view-admin-roles': '/app/admin/roles',
  'view-admin-scoring': '/app/admin/scoring',
  'view-admin-audit': '/app/admin/audit',
};

export const ROLE_PROFILES: Record<RoleCode, RoleProfile> = {
  CLIENT: {
    code: 'CLIENT',
    name: 'Demandeur / Emprunteur',
    shortName: 'Demandeur',
    homePath: '/app/client',
    avatar: '/images/profil/profil01-02.jpg',
    displayName: 'Demandeur',
    title: 'Espace client',
    badgeColor: '#518e45',
    navGroups: [
      {
        title: 'Mon Espace Crédit',
        items: [
          {
            id: 'nav-client-dash',
            path: '/app/client',
            icon: 'fa-house-user',
            label: 'Mon Tableau de Bord',
          },
          {
            id: 'nav-client-requests',
            path: '/app/client/requests',
            icon: 'fa-folder-tree',
            label: 'Mes Demandes en Cours',
          },
          {
            id: 'nav-client-simulator',
            path: '/app/client/simulator',
            icon: 'fa-calculator',
            label: 'Simulateur de Prêt',
          },
        ],
      },
      {
        title: 'Gestion & Paiements',
        items: [
          {
            id: 'nav-client-schedule',
            path: '/app/client/schedule',
            icon: 'fa-calendar-days',
            label: 'Mon Échéancier Réel',
          },
          {
            id: 'nav-client-docs',
            path: '/app/client/documents',
            icon: 'fa-folder-closed',
            label: 'Mes pièces',
          },
          {
            id: 'nav-client-profile',
            path: '/app/client/profile',
            icon: 'fa-user-pen',
            label: 'Mon profil',
          },
        ],
      },
      {
        title: 'Assistance & Agence',
        items: [
          {
            id: 'nav-client-advisor',
            path: '/app/client/advisor',
            icon: 'fa-headset',
            label: 'Mon Conseiller & Agence',
          },
        ],
      },
    ],
  },
  CREDIT_OFFICER: {
    code: 'CREDIT_OFFICER',
    name: 'Agent de Crédit / Chargé de Clientèle',
    shortName: 'Agent de Crédit',
    homePath: '/app/agent',
    avatar: '/images/profil/profil01-03.jpg',
    displayName: 'Chargé de crédit',
    title: 'Espace agent',
    badgeColor: '#f1ca30',
    navGroups: [
      {
        title: 'Guichet & Collecte',
        items: [
          {
            id: 'nav-agent-dash',
            path: '/app/agent',
            icon: 'fa-inbox',
            label: 'Tableau de Bord Agent',
          },
          {
            id: 'nav-agent-inspections',
            path: '/app/agent/inspections',
            icon: 'fa-clipboard-check',
            label: 'Inspections Garanties',
          },
        ],
      },
      {
        title: 'Portefeuille & Clients',
        items: [
          {
            id: 'nav-agent-clients',
            path: '/app/agent/clients',
            icon: 'fa-users',
            label: 'Portefeuille Emprunteurs',
          },
          {
            id: 'nav-agent-complements',
            path: '/app/agent/complements',
            icon: 'fa-triangle-exclamation',
            label: 'Pièces Manquantes',
          },
          {
            id: 'nav-agent-loans',
            path: '/app/agent/loans',
            icon: 'fa-hand-holding-dollar',
            label: 'Prêts & échéances',
          },
        ],
      },
    ],
  },
  ANALYST: {
    code: 'ANALYST',
    name: 'Analyste crédit',
    shortName: 'Analyste',
    homePath: '/app/analyst',
    avatar: '/images/profil/profil01-04.jpg',
    displayName: 'Ali Diallo',
    title: 'Analyste Risque Senior',
    badgeColor: '#1b4332',
    navGroups: [
      {
        title: 'Supervision & Analyse',
        items: [
          {
            id: 'nav-analyst-dash',
            path: '/app/analyst',
            icon: 'fa-chart-line',
            label: 'Tableau de bord',
          },
          {
            id: 'nav-analyst-dossiers',
            path: '/app/analyst/dossiers',
            icon: 'fa-folder-tree',
            label: 'Dossiers à instruire',
          },
          {
            id: 'nav-analyst-models',
            path: '/app/analyst/scoring',
            icon: 'fa-sliders',
            label: 'Grilles de score',
          },
        ],
      },
      {
        title: 'Contrôles & Audit',
        items: [
          {
            id: 'nav-analyst-anomalies',
            path: '/app/analyst/anomalies',
            icon: 'fa-triangle-exclamation',
            label: 'Points de contrôle',
          },
          {
            id: 'nav-analyst-audit',
            path: '/app/analyst/audit',
            icon: 'fa-clock-rotate-left',
            label: "Journal d'Audit",
          },
        ],
      },
    ],
  },
  COMMITTEE: {
    code: 'COMMITTEE',
    name: 'Comité de crédit',
    shortName: 'Comité',
    homePath: '/app/committee',
    avatar: '/images/profil/profil01-01.jpg',
    displayName: 'Membre du comité',
    title: 'Comité de crédit',
    badgeColor: '#ff9800',
    navGroups: [
      {
        title: 'Délibérations',
        items: [
          {
            id: 'nav-com-dash',
            path: '/app/committee',
            icon: 'fa-table-columns',
            label: 'Tableau de bord',
          },
          {
            id: 'nav-com-dossiers',
            path: '/app/committee/dossiers',
            icon: 'fa-folder-tree',
            label: 'Dossiers à délibérer',
          },
          {
            id: 'nav-com-signed',
            path: '/app/committee/signed',
            icon: 'fa-file-signature',
            label: 'Registre des décisions',
          },
          {
            id: 'nav-com-audit',
            path: '/app/committee/audit',
            icon: 'fa-clock-rotate-left',
            label: 'Journal des actions',
          },
        ],
      },
    ],
  },
  ADMIN: {
    code: 'ADMIN',
    name: 'Administration Système',
    shortName: 'Administration',
    homePath: '/app/admin',
    avatar: '/images/profil/profil01-01.jpg',
    displayName: 'Administrateur',
    title: 'Contrôle & Paramétrage CreditFast',
    badgeColor: '#1b4332',
    navGroups: [
      {
        title: 'Pilotage',
        items: [
          {
            id: 'nav-admin-dash',
            path: '/app/admin',
            icon: 'fa-gauge-high',
            label: 'Tableau de Bord Admin',
          },
          {
            id: 'nav-admin-users',
            path: '/app/admin/users',
            icon: 'fa-user-gear',
            label: 'Comptes & Utilisateurs',
          },
          {
            id: 'nav-admin-roles',
            path: '/app/admin/roles',
            icon: 'fa-user-shield',
            label: 'Rôles & habilitations',
          },
        ],
      },
      {
        title: 'Contrôle & Système',
        items: [
          {
            id: 'nav-admin-scoring',
            path: '/app/admin/scoring',
            icon: 'fa-sliders',
            label: 'Modèles de Scoring',
          },
          {
            id: 'nav-admin-audit',
            path: '/app/admin/audit',
            icon: 'fa-clipboard-list',
            label: "Journal d'Audit",
          },
        ],
      },
    ],
  },
};

export function roleFromPath(pathname: string): RoleCode {
  if (pathname.startsWith('/app/admin')) {
    return 'ADMIN';
  }
  if (pathname.startsWith('/app/agent')) {
    return 'CREDIT_OFFICER';
  }
  if (pathname.startsWith('/app/analyst')) {
    return 'ANALYST';
  }
  if (pathname.startsWith('/app/committee')) {
    return 'COMMITTEE';
  }

  return 'CLIENT';
}
