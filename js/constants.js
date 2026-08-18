/**
 * CRÉDIT FAST - JAVASCRIPT CONSTANTS & ROLE DEFINITIONS
 * Configuration stricte des 5 espaces métiers indépendants
 * Confédération des Institutions Financières d'Afrique de l'Ouest (CIF - DigiCoop-WA+)
 */

const APP_CONSTANTS = {
  COLORS: {
    PRIMARY: '#4f46e5',
    PRIMARY_DARK: '#312e81',
    PRIMARY_LIGHT: '#818cf8',
    PRIMARY_BG: 'rgba(79, 70, 229, 0.12)',

    EMERALD: '#10b981',
    EMERALD_DARK: '#047857',
    EMERALD_BG: 'rgba(16, 185, 129, 0.12)',

    GOLD: '#f59e0b',
    GOLD_DARK: '#b45309',
    GOLD_BG: 'rgba(245, 158, 11, 0.12)',

    DANGER: '#ef4444',
    DANGER_DARK: '#b91c1c',
    DANGER_BG: 'rgba(239, 68, 68, 0.12)',

    INFO: '#0ea5e9',
    PURPLE: '#8b5cf6',

    SLATE_900: '#0f172a',
    SLATE_700: '#334155',
    SLATE_400: '#94a3b8',
    SLATE_100: '#f1f5f9'
  },

  // Configuration détaillée de chaque profil métier indépendant
  ROLES: {
    CLIENT: {
      code: 'CLIENT',
      name: 'Demandeur / Emprunteur',
      shortName: 'Demandeur',
      badgeColor: '#10b981',
      badgeBg: 'rgba(16, 185, 129, 0.15)',
      homeView: 'view-role-client',
      navGroups: [
        {
          title: 'Mon Espace Crédit',
          items: [
            { id: 'nav-client-dash', target: 'view-role-client', icon: 'fa-house-user', label: 'Mon Tableau de Bord', badge: 'Actif', badgeClass: 'success' },
            { id: 'nav-client-requests', target: 'view-client-requests', icon: 'fa-folder-tree', label: 'Mes Demandes en Cours', badge: '1 En attente', badgeClass: 'primary' },
            { id: 'nav-client-apply', target: 'view-client-wizard', icon: 'fa-file-circle-plus', label: 'Nouvelle Demande', badge: '6 Étapes', badgeClass: 'warning' },
            { id: 'nav-client-simulator', target: 'view-client-simulator', icon: 'fa-calculator', label: 'Simulateur de Prêt' }
          ]
        },
        {
          title: 'Gestion & Paiements',
          items: [
            { id: 'nav-client-schedule', target: 'view-client-schedule', icon: 'fa-calendar-days', label: 'Mon Échéancier Réel' },
            { id: 'nav-client-docs', target: 'view-client-documents', icon: 'fa-folder-closed', label: 'Mes Pièces & Devis' }
          ]
        },
        {
          title: 'Assistance & Agence',
          items: [
            { id: 'nav-client-advisor', target: 'view-client-advisor', icon: 'fa-headset', label: 'Mon Conseiller & Agence', badge: 'En ligne', badgeClass: 'success' }
          ]
        }
      ]
    },

    CREDIT_OFFICER: {
      code: 'CREDIT_OFFICER',
      name: 'Agent de Crédit / Chargé de Clientèle',
      shortName: 'Agent de Crédit',
      badgeColor: '#0ea5e9',
      badgeBg: 'rgba(14, 165, 233, 0.15)',
      homeView: 'view-role-agent',
      navGroups: [
        {
          title: 'Guichet & Collecte',
          items: [
            { id: 'nav-agent-dash', target: 'view-role-agent', icon: 'fa-inbox', label: 'Tableau de Bord Agent', badge: 'Pipeline', badgeClass: 'primary' },
            { id: 'nav-agent-intake', target: 'view-client-wizard', icon: 'fa-user-plus', label: 'Enregistrer une Demande' },
            { id: 'nav-agent-inspections', target: 'view-agent-inspections', icon: 'fa-clipboard-check', label: 'Inspections Garanties', badge: '3', badgeClass: 'warning' }
          ]
        },
        {
          title: 'Portefeuille & Clients',
          items: [
            { id: 'nav-agent-clients', target: 'view-agent-clients', icon: 'fa-users', label: 'Portefeuille Emprunteurs' },
            { id: 'nav-agent-complements', target: 'view-agent-complements', icon: 'fa-triangle-exclamation', label: 'Pièces Manquantes' }
          ]
        }
      ]
    },

    ANALYST: {
      code: 'ANALYST',
      name: 'Analyste Risque & Scoring V2',
      shortName: 'Analyste Risque',
      badgeColor: '#4f46e5',
      badgeBg: 'rgba(79, 70, 229, 0.15)',
      homeView: 'view-role-analyst',
      navGroups: [
        {
          title: 'Supervision & Analyse',
          items: [
            { id: 'nav-analyst-dash', target: 'view-role-analyst', icon: 'fa-chart-line', label: 'Vue Risques & Octrois', badge: 'Live', badgeClass: 'primary' },
            { id: 'nav-analyst-dossiers', target: 'view-analyst-dossiers', icon: 'fa-folder-tree', label: 'Dossiers à Instruire', badge: '5', badgeClass: 'success' },
            { id: 'nav-analyst-models', target: 'view-scoring-admin', icon: 'fa-sliders', label: 'Moteurs & Règles V2', badge: 'Cold Start', badgeClass: 'warning' }
          ]
        },
        {
          title: 'Contrôles & Audit',
          items: [
            { id: 'nav-analyst-anomalies', target: 'view-analyst-anomalies', icon: 'fa-triangle-exclamation', label: 'Anomalies Détectées' },
            { id: 'nav-analyst-audit', target: 'view-audit-logs', icon: 'fa-clock-rotate-left', label: 'Journal d’Audit' }
          ]
        }
      ]
    },

    COMMITTEE: {
      code: 'COMMITTEE',
      name: 'Membre du Comité de Crédit',
      shortName: 'Comité de Crédit',
      badgeColor: '#8b5cf6',
      badgeBg: 'rgba(139, 92, 246, 0.15)',
      homeView: 'view-role-committee',
      navGroups: [
        {
          title: 'Séances de Délibération',
          items: [
            { id: 'nav-com-dash', target: 'view-role-committee', icon: 'fa-scale-balanced', label: 'Séance du Comité', badge: '2 à voter', badgeClass: 'warning' },
            { id: 'nav-com-signed', target: 'view-committee-signed', icon: 'fa-file-signature', label: 'Décisions Signées' }
          ]
        },
        {
          title: 'Rapports & Gouvernance',
          items: [
            { id: 'nav-com-reports', target: 'view-committee-reports', icon: 'fa-chart-pie', label: 'Rapports d’Octroi CIF' }
          ]
        }
      ]
    },

    COMPLIANCE: {
      code: 'COMPLIANCE',
      name: 'Responsable Conformité LBC / FT / FP',
      shortName: 'Conformité LBC/FT',
      badgeColor: '#ef4444',
      badgeBg: 'rgba(239, 68, 68, 0.15)',
      homeView: 'view-role-compliance',
      navGroups: [
        {
          title: 'Surveillance & Sanctions',
          items: [
            { id: 'nav-comp-dash', target: 'view-role-compliance', icon: 'fa-shield-halved', label: 'Console Conformité', badge: '2 Alertes', badgeClass: 'danger' },
            { id: 'nav-comp-screening', target: 'view-compliance-screening', icon: 'fa-magnifying-glass', label: 'Filtrage Listes PPE & ONU' },
            { id: 'nav-comp-multi', target: 'view-compliance-multi', icon: 'fa-network-wired', label: 'Consolidation Multi-Comptes' }
          ]
        },
        {
          title: 'Traçabilité Réglementaire',
          items: [
            { id: 'nav-comp-audit', target: 'view-audit-logs', icon: 'fa-file-contract', label: 'Déclarations de Soupçon' }
          ]
        }
      ]
    }
  },

  // Profils démo prêt à l'emploi
  DEMO_ACCOUNTS: [
    {
      id: 'demo-client',
      role: 'CLIENT',
      email: 'fatou.ndiaye@gmail.com',
      password: 'demo',
      name: 'Fatou Ndiaye',
      title: 'Emprunteuse • Commerçante Grossiste',
      location: 'Dakar, Sénégal (Caisse Médina)',
      clientNumber: 'SN-DKR-008821',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      badge: 'Demandeur',
      badgeColor: '#10b981',
      description: 'Accédez à votre tableau de bord emprunteur, suivez votre prêt, payez vos échéances et déposez une nouvelle demande.'
    },
    {
      id: 'demo-agent',
      role: 'CREDIT_OFFICER',
      email: 'kofi.mensah@cif-ao.org',
      password: 'demo',
      name: 'Kofi Mensah',
      title: 'Chargé de Crédit & Clientèle',
      location: 'Lomé, Togo (Agence Assigamé)',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      badge: 'Agent de Crédit',
      badgeColor: '#0ea5e9',
      description: 'Gérez le pipeline de collecte au guichet, les pièces manquantes et la vérification terrain des garanties.'
    },
    {
      id: 'demo-analyst',
      role: 'ANALYST',
      email: 'aminata.diallo@cif-ao.org',
      password: 'demo',
      name: 'Aminata Diallo',
      title: 'Analyste Risque Senior',
      location: 'Ouagadougou, Burkina Faso (Siège CIF)',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      badge: 'Analyste Risque',
      badgeColor: '#4f46e5',
      description: 'Exécutez le rapprochement OCR, le calcul du Reste à Vivre, la simulation Cold Start et le scoring explicable V2.'
    },
    {
      id: 'demo-committee',
      role: 'COMMITTEE',
      email: 'moussa.traore@cif-ao.org',
      password: 'demo',
      name: 'Moussa Traoré',
      title: 'Président du Comité de Crédit',
      location: 'Bamako, Mali (Caisse Régionale)',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      badge: 'Comité',
      badgeColor: '#8b5cf6',
      description: 'Délibérez en séance collégiale, ajustez les montants/durées accordés et signez numériquement les procès-verbaux.'
    },
    {
      id: 'demo-compliance',
      role: 'COMPLIANCE',
      email: 'bakary.sanou@cif-ao.org',
      password: 'demo',
      name: 'Bakary Sanou',
      title: 'Officier Conformité LBC / FT / FP',
      location: 'Cotonou, Bénin (Direction UEMOA)',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      badge: 'Conformité LBC',
      badgeColor: '#ef4444',
      description: 'Supervisez le filtrage PPE, les sanctions régionales UEMOA/ONU et la consolidation des comptes.'
    }
  ],

  // Statuts des Demandes & Badges
  STATUS_CONFIG: {
    SUBMITTED: { label: 'Soumis', class: 'badge-submitted', color: '#0ea5e9' },
    ANALYSIS: { label: 'En Analyse', class: 'badge-analysis', color: '#8b5cf6' },
    VERIFICATION_REQUIRED: { label: 'Vérif. Requise', class: 'badge-verification', color: '#f59e0b' },
    CREDIT_REVIEW: { label: 'Revue Analyste', class: 'badge-analysis', color: '#4f46e5' },
    COMMITTEE: { label: 'En Comité', class: 'badge-committee', color: '#a855f7' },
    APPROVED: { label: 'Approuvé', class: 'badge-approved', color: '#10b981' },
    REJECTED: { label: 'Rejeté', class: 'badge-rejected', color: '#ef4444' }
  }
};

window.APP_CONSTANTS = APP_CONSTANTS;
