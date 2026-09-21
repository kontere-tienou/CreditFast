/**
 * CRÉDIT FAST - RELATIONAL DATABASE V2
 * Conforme au Guide Explicatif du Modèle de Données V2 (26 Tables Relationnelles)
 * Intègre : loans, loan_repayments, scoring_models, scoring_rules, Cold Start, residential_zone, confidence_score
 * Confédération des Institutions Financières d'Afrique de l'Ouest (CreditFast - DigiCoop-WA+)
 */

const STORAGE_KEY = "CREDIT_FAST_DATABASE_V3";

const DEFAULT_DATABASE = {
  // 1. Roles (4 Profils Métiers)
  roles: [
    {
      id: 1,
      name: "Analyste Risque",
      description: "Analyse détaillée, OCR, anomalies et scoring explicable V2",
    },
    {
      id: 2,
      name: "Chargé de Crédit",
      description:
        "Instruction des demandes de prêt, premières vérifications, compléments terrain",
    },
    {
      id: 3,
      name: "Comité de Crédit & Conformité",
      description:
        "Décision collégiale, ajustement montants/durées, signature et conformité LBC/FT",
    },
    {
      id: 4,
      name: "Client Emprunteur",
      description: "Parcours d’octroi, pièces, suivi en direct et échéancier",
    },
  ],

  // 2. Users
  users: [
    {
      id: 1,
      role_id: 1,
      first_name: "Ali",
      last_name: "Diallo",
      phone: "+223 70 12 34 56",
      email: "ali.diallo@creditfast.ml",
      status: "ACTIVE",
      avatar: "images/profil/profil01-04.jpg",
      country: "Mali",
    },
    {
      id: 2,
      role_id: 2,
      first_name: "Adama",
      last_name: "Traore",
      phone: "+223 90 23 45 67",
      email: "adama.traore@creditfast.ml",
      status: "ACTIVE",
      avatar: "images/profil/profil01-03.jpg",
      country: "Mali",
    },
    {
      id: 3,
      role_id: 3,
      first_name: "Mariam",
      last_name: "Keita",
      phone: "+223 66 34 56 78",
      email: "mariam.keita@creditfast.ml",
      status: "ACTIVE",
      avatar: "images/profil/profil01-01.jpg",
      country: "Mali",
    },
    {
      id: 4,
      role_id: 4,
      first_name: "Faratigi",
      last_name: "Ndiaye",
      phone: "+223 77 45 67 89",
      email: "fatou.ndiaye@gmail.com",
      status: "ACTIVE",
      avatar: "images/profil/profil01-02.jpg",
      country: "Mali",
    },
    {
      id: 5,
      role_id: 5,
      first_name: "Bakary",
      last_name: "Sanou",
      phone: "+223 76 56 78 90",
      email: "bakary.sanou@creditfast.ml",
      status: "ACTIVE",
      avatar: "images/profil/profil01-04.jpg",
      country: "Mali",
    },
    {
      id: 6,
      role_id: 4,
      first_name: "Amadou",
      last_name: "Sanogo",
      phone: "+223 70 88 99 00",
      email: "amadou.sanogo@gmail.com",
      status: "ACTIVE",
      avatar: "images/profil/profil01-03.jpg",
      country: "Mali",
    },
  ],

  // 3. Clients (avec format ID CreditFast : Code Caisse + Code Agence + N° Incrémentiel, residential_zone)
  clients: [
    {
      id: 1,
      user_id: 4,
      client_number: "ML-BKO-008821",
      date_of_birth: "1988-04-12",
      address: "Quartier Grand Marché, Rue 314",
      city: "Bamako",
      residential_zone: "Zone Urbaine Commerciale",
      occupation: "Commerçante / Grossiste Textiles",
      kyc_status: "VERIFIED",
      institution_verified_at: "2026-08-01T10:00:00Z",
      is_cold_start: false,
    },
    {
      id: 2,
      user_id: 6,
      client_number: "ML-BKO-004419",
      date_of_birth: "1982-11-03",
      address: "Secteur Badalabougou, Rue 22",
      city: "Bamako",
      residential_zone: "Zone Péri-urbaine Industrielle",
      occupation: "Transformateur Agroalimentaire",
      kyc_status: "VERIFIED",
      institution_verified_at: "2026-08-05T11:30:00Z",
      is_cold_start: false,
    },
    {
      id: 3,
      user_id: 7,
      client_number: "ML-BKO-003190",
      date_of_birth: "1991-07-25",
      address: "Marché Dabanani, Rue 102",
      city: "Bamako",
      residential_zone: "Zone Urbaine Dense",
      occupation: "Import-Export Quincaillerie",
      kyc_status: "PENDING_DOCUMENT",
      institution_verified_at: null,
      is_cold_start: false,
    },
    {
      id: 4,
      user_id: 8,
      client_number: "ML-BKO-005512",
      date_of_birth: "1985-09-18",
      address: "Zone Industrielle Sotuba",
      city: "Bamako",
      residential_zone: "Zone Péri-urbaine Mixte",
      occupation: "Aviculteur & Éleveur",
      kyc_status: "VERIFIED",
      institution_verified_at: "2026-08-08T09:15:00Z",
      is_cold_start: false,
    },
    {
      id: 5,
      user_id: 9,
      client_number: "ML-BKO-009023",
      date_of_birth: "1996-05-20",
      address: "Quartier Faladié",
      city: "Bamako",
      residential_zone: "Zone Rurale / Périphérique",
      occupation: "Jeune Artisan Menuisier",
      kyc_status: "VERIFIED",
      institution_verified_at: "2026-08-16T14:00:00Z",
      is_cold_start: true,
    }, // Nouveau client Cold Start
  ],

  // 4. KYC Documents
  kyc_documents: [
    {
      id: 1,
      client_id: 1,
      document_type: "CNI_CEDEAO",
      document_number: "MLI-19880412001",
      file_path: "cni_fatou.pdf",
      status: "VALIDATED",
      verified_by: 2,
      verified_at: "2026-08-01T10:30:00Z",
    },
    {
      id: 2,
      client_id: 2,
      document_type: "PASSPORT",
      document_number: "MLI-B0912441",
      file_path: "pass_amadou.pdf",
      status: "VALIDATED",
      verified_by: 1,
      verified_at: "2026-08-05T12:00:00Z",
    },
    {
      id: 3,
      client_id: 3,
      document_type: "CNI",
      document_number: "MLI-4412993",
      file_path: "cni_kodjo.pdf",
      status: "TO_COMPLETE",
      verified_by: 2,
      verified_at: "2026-08-10T15:00:00Z",
    },
  ],

  // 5. Activities (avec start_date et calcul de l'ancienneté)
  activities: [
    {
      id: 1,
      client_id: 1,
      activity_type: "COMMERCE_GROS_DETAIL",
      sector: "Textile & Prêt-à-porter",
      description:
        "Boutique physique + revente en gros au Grand Marché de Bamako",
      start_date: "2020-03-01",
      location: "Bamako Grand Marché",
      monthly_revenue: 1850000,
      status: "ACTIVE",
    },
    {
      id: 2,
      client_id: 2,
      activity_type: "AGRO_TRANSFORMATION",
      sector: "Transformation Céréalière",
      description: "Unité semi-industrielle de mouture et ensachage maïs/soja",
      start_date: "2022-06-15",
      location: "Zone artisanale Sotuba, Bamako",
      monthly_revenue: 3200000,
      status: "ACTIVE",
    },
    {
      id: 3,
      client_id: 3,
      activity_type: "QUINCAILLERIE_BTP",
      sector: "BTP & Outillage",
      description: "Distribution outillage et matériaux légers",
      start_date: "2024-02-01",
      location: "Marché Dabanani, Bamako",
      monthly_revenue: 1200000,
      status: "ACTIVE",
    },
    {
      id: 4,
      client_id: 4,
      activity_type: "ELEVAGE_AVICOLE",
      sector: "Aviculture Moderne",
      description: "Ferme avicole de 3000 pondeuses",
      start_date: "2021-09-01",
      location: "Zone Périphérique, Bamako",
      monthly_revenue: 2100000,
      status: "ACTIVE",
    },
    {
      id: 5,
      client_id: 5,
      activity_type: "ARTISANAT_BOIS",
      sector: "Menuiserie & Mobilier",
      description: "Atelier de fabrication meubles artisanaux",
      start_date: "2026-01-10",
      location: "Faladié, Bamako",
      monthly_revenue: 650000,
      status: "ACTIVE",
    },
  ],

  // 6. Financial Profiles
  financial_profiles: [
    {
      id: 1,
      client_id: 1,
      monthly_income: 650000,
      other_income: 150000,
      monthly_expenses: 320000,
      existing_debt_payment: 60000,
      dependents_count: 3,
      disposable_income: 420000,
    },
    {
      id: 2,
      client_id: 2,
      monthly_income: 1100000,
      other_income: 200000,
      monthly_expenses: 450000,
      existing_debt_payment: 120000,
      dependents_count: 4,
      disposable_income: 730000,
    },
    {
      id: 3,
      client_id: 3,
      monthly_income: 420000,
      other_income: 50000,
      monthly_expenses: 280000,
      existing_debt_payment: 90000,
      dependents_count: 2,
      disposable_income: 100000,
    },
    {
      id: 4,
      client_id: 4,
      monthly_income: 780000,
      other_income: 100000,
      monthly_expenses: 310000,
      existing_debt_payment: 80000,
      dependents_count: 3,
      disposable_income: 490000,
    },
    {
      id: 5,
      client_id: 5,
      monthly_income: 400000,
      other_income: 50000,
      monthly_expenses: 180000,
      existing_debt_payment: 0,
      dependents_count: 1,
      disposable_income: 270000,
    },
  ],

  // 7. Financial Accounts
  financial_accounts: [
    {
      id: 1,
      client_id: 1,
      account_number: "CPT-CF-ML-00918",
      account_type: "EPARGNE_COLLECTEE",
      balance: 1450000,
      opened_at: "2022-03-15",
      status: "ACTIVE",
    },
    {
      id: 2,
      client_id: 2,
      account_number: "CPT-CF-ML-04421",
      account_type: "COURANT_COMMERCIAL",
      balance: 2800000,
      opened_at: "2021-08-20",
      status: "ACTIVE",
    },
    {
      id: 3,
      client_id: 3,
      account_number: "CPT-CF-ML-01124",
      account_type: "EPARGNE_LIBRE",
      balance: 350000,
      opened_at: "2024-01-10",
      status: "ACTIVE",
    },
    {
      id: 4,
      client_id: 5,
      account_number: "CPT-CF-ML-00055",
      account_type: "EPARGNE_NOUVELLE",
      balance: 75000,
      opened_at: "2026-07-01",
      status: "ACTIVE",
    },
  ],

  // 8. Account Transactions
  account_transactions: [
    {
      id: 1,
      account_id: 1,
      transaction_type: "DEPOT",
      amount: 150000,
      transaction_date: "2026-08-10T14:20:00Z",
      reference: "DEP-ML-9981",
      description: "Versement recettes hebdomadaires textile",
    },
    {
      id: 2,
      account_id: 1,
      transaction_type: "RETRAIT",
      amount: 80000,
      transaction_date: "2026-08-04T09:15:00Z",
      reference: "RET-ML-9921",
      description: "Paiement fournisseur cotonnade",
    },
    {
      id: 3,
      account_id: 2,
      transaction_type: "DEPOT",
      amount: 650000,
      transaction_date: "2026-08-12T16:45:00Z",
      reference: "VIR-ML-0012",
      description: "Règlement client coopérative céréales",
    },
  ],

  // 9. Savings History
  savings_history: [
    {
      id: 1,
      client_id: 1,
      account_id: 1,
      period_start: "2026-04-01",
      period_end: "2026-06-30",
      total_deposits: 1800000,
      total_withdrawals: 950000,
      deposit_count: 24,
      withdrawal_count: 8,
      average_balance: 1320000,
      closing_balance: 1450000,
    },
    {
      id: 2,
      client_id: 2,
      account_id: 2,
      period_start: "2026-04-01",
      period_end: "2026-06-30",
      total_deposits: 4500000,
      total_withdrawals: 3200000,
      deposit_count: 36,
      withdrawal_count: 14,
      average_balance: 2400000,
      closing_balance: 2800000,
    },
  ],

  // 10. Real Loans & Repayments (Vrais Crédits Accordés et Remboursements - V2)
  loans: [
    {
      id: 1,
      client_id: 1,
      credit_request_id: 1,
      principal_amount: 2500000,
      interest_amount: 320000,
      total_amount: 2820000,
      duration_months: 12,
      monthly_payment: 235000,
      disbursed_at: "2026-06-05",
      maturity_date: "2027-06-05",
      outstanding_amount: 2350000,
      status: "ACTIVE",
    },
    {
      id: 2,
      client_id: 4,
      credit_request_id: 4,
      principal_amount: 3000000,
      interest_amount: 450000,
      total_amount: 3450000,
      duration_months: 14,
      monthly_payment: 246400,
      disbursed_at: "2025-05-10",
      maturity_date: "2026-07-10",
      outstanding_amount: 0,
      status: "CLOSED_PAID",
    },
  ],

  loan_repayments: [
    {
      id: 1,
      loan_id: 1,
      due_date: "2026-07-05",
      payment_date: "2026-07-04",
      expected_amount: 235000,
      paid_amount: 235000,
      days_late: 0,
      status: "PAID",
    },
    {
      id: 2,
      loan_id: 1,
      due_date: "2026-08-05",
      payment_date: "2026-08-05",
      expected_amount: 235000,
      paid_amount: 235000,
      days_late: 0,
      status: "PAID",
    },
    {
      id: 3,
      loan_id: 1,
      due_date: "2026-09-05",
      payment_date: null,
      expected_amount: 235000,
      paid_amount: 0,
      days_late: 0,
      status: "PENDING",
    },
    {
      id: 4,
      loan_id: 2,
      due_date: "2026-06-10",
      payment_date: "2026-06-10",
      expected_amount: 246400,
      paid_amount: 246400,
      days_late: 0,
      status: "PAID",
    },
  ],

  // 11. Scoring Models & Versioning (Moteur V2)
  scoring_models: [
    {
      id: 1,
      name: "Modèle Scoring Standard UEMOA",
      version: "V2.1",
      scoring_mode: "STANDARD",
      description:
        "Modèle d’évaluation complet pour clients avec historique d’épargne CIF ou crédits antérieurs.",
      status: "ACTIVE",
      effective_from: "2026-01-01T00:00:00Z",
      effective_to: null,
      created_by: 1,
    },
    {
      id: 2,
      name: "Modèle Scoring Inclusion Cold Start",
      version: "V1.0",
      scoring_mode: "COLD_START",
      description:
        "Modèle spécialisé pour primo-demandeurs sans antécédents financiers (Axé sur activité, zone, capacité nette et caution).",
      status: "ACTIVE",
      effective_from: "2026-06-01T00:00:00Z",
      effective_to: null,
      created_by: 1,
    },
  ],

  // 12. Scoring Rules (Règles et Poids par Modèle)
  scoring_rules: [
    // Standard Model Rules (Total Weight = 1.0)
    {
      id: 1,
      scoring_model_id: 1,
      rule_code: "REPAYMENT_CAPACITY",
      rule_name: "Capacité nette de remboursement",
      factor_type: "FINANCIAL",
      weight: 0.25,
      min_score: 0,
      max_score: 100,
      priority: 1,
      status: "ACTIVE",
    },
    {
      id: 2,
      scoring_model_id: 1,
      rule_code: "CREDIT_HISTORY",
      rule_name: "Comportement crédits antérieurs",
      factor_type: "BEHAVIOR",
      weight: 0.2,
      min_score: 0,
      max_score: 100,
      priority: 2,
      status: "ACTIVE",
    },
    {
      id: 3,
      scoring_model_id: 1,
      rule_code: "SAVINGS_DISCIPLINE",
      rule_name: "Historique d’épargne CIF",
      factor_type: "BEHAVIOR",
      weight: 0.15,
      min_score: 0,
      max_score: 100,
      priority: 3,
      status: "ACTIVE",
    },
    {
      id: 4,
      scoring_model_id: 1,
      rule_code: "ACTIVITY_STABILITY",
      rule_name: "Stabilité & Ancienneté activité",
      factor_type: "BUSINESS",
      weight: 0.15,
      min_score: 0,
      max_score: 100,
      priority: 4,
      status: "ACTIVE",
    },
    {
      id: 5,
      scoring_model_id: 1,
      rule_code: "GUARANTEE_COVERAGE",
      rule_name: "Couverture par garantie",
      factor_type: "COLLATERAL",
      weight: 0.1,
      min_score: 0,
      max_score: 100,
      priority: 5,
      status: "ACTIVE",
    },
    {
      id: 6,
      scoring_model_id: 1,
      rule_code: "OCR_DOCUMENT_INTEGRITY",
      rule_name: "Rapprochement OCR & Pièces",
      factor_type: "INTEGRITY",
      weight: 0.1,
      min_score: 0,
      max_score: 100,
      priority: 6,
      status: "ACTIVE",
    },
    {
      id: 7,
      scoring_model_id: 1,
      rule_code: "RESIDENTIAL_ZONE",
      rule_name: "Facteur contextuel zone d’habitation",
      factor_type: "CONTEXTUAL",
      weight: 0.05,
      min_score: 0,
      max_score: 100,
      priority: 7,
      status: "ACTIVE",
    },

    // Cold Start Model Rules (Pondération adaptée sans historique d'épargne/crédit)
    {
      id: 8,
      scoring_model_id: 2,
      rule_code: "REPAYMENT_CAPACITY",
      rule_name: "Capacité nette de remboursement",
      factor_type: "FINANCIAL",
      weight: 0.35,
      min_score: 0,
      max_score: 100,
      priority: 1,
      status: "ACTIVE",
    },
    {
      id: 9,
      scoring_model_id: 2,
      rule_code: "ACTIVITY_STABILITY",
      rule_name: "Stabilité & Ancienneté activité",
      factor_type: "BUSINESS",
      weight: 0.25,
      min_score: 0,
      max_score: 100,
      priority: 2,
      status: "ACTIVE",
    },
    {
      id: 10,
      scoring_model_id: 2,
      rule_code: "GUARANTEE_COVERAGE",
      rule_name: "Garanties matérielles & Caution solidaire",
      factor_type: "COLLATERAL",
      weight: 0.2,
      min_score: 0,
      max_score: 100,
      priority: 3,
      status: "ACTIVE",
    },
    {
      id: 11,
      scoring_model_id: 2,
      rule_code: "OCR_DOCUMENT_INTEGRITY",
      rule_name: "Rapprochement OCR & Justificatifs",
      factor_type: "INTEGRITY",
      weight: 0.1,
      min_score: 0,
      max_score: 100,
      priority: 4,
      status: "ACTIVE",
    },
    {
      id: 12,
      scoring_model_id: 2,
      rule_code: "RESIDENTIAL_ZONE",
      rule_name: "Enracinement & Zone d’habitation",
      factor_type: "CONTEXTUAL",
      weight: 0.1,
      min_score: 0,
      max_score: 100,
      priority: 5,
      status: "ACTIVE",
    },
  ],

  // 13. Credit Requests
  credit_requests: [
    {
      id: 1,
      client_id: 1,
      activity_id: 1,
      request_number: "REQ-2026-0891",
      requested_amount: 2500000,
      duration_months: 12,
      purpose: "Achat de stock tissus wax pour la fête de Tabaski",
      declared_monthly_income: 650000,
      declared_monthly_expenses: 320000,
      estimated_monthly_payment: 235000,
      disposable_income: 420000,
      repayment_capacity_status: "SUFFICIENT",
      status: "CREDIT_REVIEW",
      submitted_at: "2026-08-11T09:30:00Z",
      created_at: "2026-08-11T09:30:00Z",
      client_name: "Fatou Ndiaye",
      country: "Mali",
      city: "Bamako",
      score: 82,
      confidence_score: 94,
      is_cold_start: false,
    },
    {
      id: 2,
      client_id: 2,
      activity_id: 2,
      request_number: "REQ-2026-0892",
      requested_amount: 5000000,
      duration_months: 18,
      purpose: "Acquisition broyeur industriel et ensacheuse moderne",
      declared_monthly_income: 1100000,
      declared_monthly_expenses: 450000,
      estimated_monthly_payment: 320000,
      disposable_income: 730000,
      repayment_capacity_status: "SUFFICIENT",
      status: "COMMITTEE",
      submitted_at: "2026-08-12T14:15:00Z",
      created_at: "2026-08-12T14:15:00Z",
      client_name: "Amadou Sanogo",
      country: "Mali",
      city: "Bamako",
      score: 88,
      confidence_score: 96,
      is_cold_start: false,
    },
    {
      id: 3,
      client_id: 3,
      activity_id: 3,
      request_number: "REQ-2026-0893",
      requested_amount: 1800000,
      duration_months: 10,
      purpose: "Renouvellement stock outillage plomberie et électricité",
      declared_monthly_income: 420000,
      declared_monthly_expenses: 280000,
      estimated_monthly_payment: 195000,
      disposable_income: 100000,
      repayment_capacity_status: "INSUFFICIENT",
      status: "VERIFICATION_REQUIRED",
      submitted_at: "2026-08-14T11:00:00Z",
      created_at: "2026-08-14T11:00:00Z",
      client_name: "Kodjo Mensah",
      country: "Mali",
      city: "Bamako",
      score: 54,
      confidence_score: 72,
      is_cold_start: false,
    },
    {
      id: 4,
      client_id: 4,
      activity_id: 4,
      request_number: "REQ-2026-0894",
      requested_amount: 3200000,
      duration_months: 14,
      purpose: "Extension hangar d’élevage et aliments volailles",
      declared_monthly_income: 780000,
      declared_monthly_expenses: 310000,
      estimated_monthly_payment: 255000,
      disposable_income: 490000,
      repayment_capacity_status: "SUFFICIENT",
      status: "APPROVED",
      submitted_at: "2026-08-08T16:20:00Z",
      created_at: "2026-08-08T16:20:00Z",
      client_name: "Gérard Dossou",
      country: "Mali",
      city: "Bamako",
      score: 79,
      confidence_score: 91,
      is_cold_start: false,
    },
    {
      id: 5,
      client_id: 5,
      activity_id: 5,
      request_number: "REQ-2026-0895",
      requested_amount: 800000,
      duration_months: 8,
      purpose: "Achat de bois massif et outillage menuiserie (Cold Start)",
      declared_monthly_income: 400000,
      declared_monthly_expenses: 180000,
      estimated_monthly_payment: 112000,
      disposable_income: 270000,
      repayment_capacity_status: "SUFFICIENT",
      status: "ANALYSIS",
      submitted_at: "2026-08-17T10:00:00Z",
      created_at: "2026-08-17T10:00:00Z",
      client_name: "Ibrahima Koné",
      country: "Mali",
      city: "Bamako",
      score: 74,
      confidence_score: 85,
      is_cold_start: true, // Primo demandeur Cold Start
    },
  ],

  // 14. Guarantees
  guarantees: [
    {
      id: 1,
      credit_request_id: 1,
      guarantee_type: "STOCK_MARCHANDISE",
      description: "Stock de rouleaux de tissus wax et bazin en boutique",
      declared_value: 3800000,
      verified_value: 3400000,
      verification_status: "VERIFIED",
      verified_by: 2,
      verified_at: "2026-08-11T16:00:00Z",
    },
    {
      id: 2,
      credit_request_id: 2,
      guarantee_type: "EQUIPEMENT_MATERIEL",
      description: "Parc machine existant + gage sur nouveau broyeur",
      declared_value: 7500000,
      verified_value: 7000000,
      verification_status: "VERIFIED",
      verified_by: 1,
      verified_at: "2026-08-13T10:00:00Z",
    },
    {
      id: 3,
      credit_request_id: 3,
      guarantee_type: "CAUTION_SOLIDAIRE",
      description: "Caution d’un commerçant grossiste de Dabanani (Bamako)",
      declared_value: 2000000,
      verified_value: 0,
      verification_status: "UNVERIFIED",
      verified_by: null,
      verified_at: null,
    },
    {
      id: 4,
      credit_request_id: 5,
      guarantee_type: "CAUTION_SOLIDAIRE",
      description: "Caution solidaire du Maître Artisan Menuisier",
      declared_value: 1200000,
      verified_value: 1000000,
      verification_status: "VERIFIED",
      verified_by: 2,
      verified_at: "2026-08-17T11:00:00Z",
    },
  ],

  // 15. Documents
  documents: [
    {
      id: 1,
      credit_request_id: 1,
      document_type: "FACTURE_PROFORMA",
      original_filename: "Facture_Proforma_Wax_BATEXI.pdf",
      file_path: "assets/docs/facture_wax.pdf",
      mime_type: "application/pdf",
      uploaded_by: 4,
      uploaded_at: "2026-08-11T09:35:00Z",
      status: "VALIDATED",
    },
    {
      id: 2,
      credit_request_id: 1,
      document_type: "RELEVE_BANCAIRE",
      original_filename: "Releve_Compte_6_Mois_CreditFast_Bamako.pdf",
      file_path: "assets/docs/releve_bko.pdf",
      mime_type: "application/pdf",
      uploaded_by: 4,
      uploaded_at: "2026-08-11T09:36:00Z",
      status: "VALIDATED",
    },
    {
      id: 3,
      credit_request_id: 1,
      document_type: "REGISTRE_COMMERCE",
      original_filename: "RCCM_Bamako_ML-BKO-2020-B-142.pdf",
      file_path: "assets/docs/rccm.pdf",
      mime_type: "application/pdf",
      uploaded_by: 4,
      uploaded_at: "2026-08-11T09:37:00Z",
      status: "VALIDATED",
    },
    {
      id: 4,
      credit_request_id: 3,
      document_type: "FACTURE_ACHAT",
      original_filename: "Facture_Quincaillerie_Bamako.pdf",
      file_path: "assets/docs/facture_bko.pdf",
      mime_type: "application/pdf",
      uploaded_by: 7,
      uploaded_at: "2026-08-14T11:05:00Z",
      status: "FLAGGED",
    },
  ],

  // 16. Document Extractions (OCR Result)
  document_extractions: [
    {
      id: 1,
      document_id: 1,
      extracted_text:
        "BATEXI TEXTILE BAMAKO - FACTURE PROFORMA N° 2026-8812\nClient: FATOU NDIAYE\nObjet: 120 pièces Super Wax Hollandais\nMontant Total TTC: 2 480 000 FCFA\nDate: 08/08/2026",
      extraction_status: "EXTRACTED",
      extraction_confidence: 0.96,
      extracted_data: {
        fournisseur: "BATEXI TEXTILE BAMAKO",
        client_nom: "FATOU NDIAYE",
        montant_ttc: 2480000,
        date_facture: "2026-08-08",
        coherence_montant: true,
      },
      analyzed_at: "2026-08-11T09:40:00Z",
    },
    {
      id: 2,
      document_id: 2,
      extracted_text:
        "CONFEDERATION DES INSTITUTIONS FINANCIERES - RELEVE DE COMPTE CREDITFAST BAMAKO\nTitulaire: Mme Fatou Ndiaye\nSolde Moyen Mensuel: 1 320 000 FCFA\nMouvements Créditeurs 6 mois: 11 100 000 FCFA\nDate relevé: 31/07/2026",
      extraction_status: "EXTRACTED",
      extraction_confidence: 0.94,
      extracted_data: {
        solde_moyen: 1320000,
        mouvements_credits: 11100000,
        regularite_versements: "ELEVEE",
      },
      analyzed_at: "2026-08-11T09:42:00Z",
    },
    {
      id: 3,
      document_id: 4,
      extracted_text:
        "ETS BAMAKO OUTILLAGE - FACTURE N° 4410\nClient: KODJO MENSAH\nMontant Total: 1 200 000 FCFA (Diffère de la demande: 1 800 000 FCFA)\nDate: 12/01/2025 (Date antérieure de plus de 18 mois)",
      extraction_status: "FLAGGED_ANOMALY",
      extraction_confidence: 0.88,
      extracted_data: {
        fournisseur: "ETS BAMAKO OUTILLAGE",
        client_nom: "KODJO MENSAH",
        montant_ttc: 1200000,
        date_facture: "2025-01-12",
        coherence_montant: false,
      },
      analyzed_at: "2026-08-14T11:10:00Z",
    },
  ],

  // 17. Anomalies
  anomalies: [
    {
      id: 1,
      credit_request_id: 3,
      document_id: 4,
      anomaly_type: "DATE_INCOHERENTE",
      category: "OCR",
      severity: "CRITICAL",
      rule_name: "Validité Temporelle Pièce Proforma",
      description:
        "La date extraite par OCR sur la facture d’outillage (12/01/2025) est antérieure de plus de 18 mois au dépôt du dossier.",
      detected_value: "12/01/2025",
      expected_value: "Moins de 30 jours (< 16/07/2026)",
      engine: "Moteur OCR Tesseract",
      status: "OPEN",
      resolved_by: null,
      resolved_at: null,
      resolution_comment: null,
      created_at: "2026-08-14T11:12:00Z",
    },
    {
      id: 2,
      credit_request_id: 3,
      document_id: 4,
      anomaly_type: "MONTANT_DISCORDANT",
      category: "OCR",
      severity: "WARNING",
      rule_name: "Concordance Devis vs Demande",
      description:
        "Le montant extrait de la facture (1 200 000 FCFA) est significativement inférieur au montant de crédit sollicité (1 800 000 FCFA).",
      detected_value: "1 200 000 FCFA",
      expected_value: "1 800 000 FCFA (Écart -600 000 F)",
      engine: "Rapprochement Automatique GED",
      status: "OPEN",
      resolved_by: null,
      resolved_at: null,
      resolution_comment: null,
      created_at: "2026-08-14T11:12:00Z",
    },
    {
      id: 3,
      credit_request_id: 3,
      document_id: null,
      anomaly_type: "CAPACITE_INSUFFISANTE",
      category: "FINANCIAL",
      severity: "CRITICAL",
      rule_name: "Ratio Reste à Vivre / Échéance",
      description:
        "Le reste à vivre calculé (100 000 FCFA) ne couvre pas l’échéance mensuelle estimée du crédit (195 000 FCFA). Ratio critique de 0.51x.",
      detected_value: "100 000 F vs 195 000 F (0.51x)",
      expected_value: "Ratio ≥ 1.30x (Reste à vivre > 253 500 F)",
      engine: "Moteur Solvabilité",
      status: "OPEN",
      resolved_by: null,
      resolved_at: null,
      resolution_comment: null,
      created_at: "2026-08-14T11:15:00Z",
    },
    {
      id: 4,
      credit_request_id: 1,
      document_id: null,
      anomaly_type: "MULTI_COMPTE_RESEAU",
      category: "NETWORK",
      severity: "WARNING",
      rule_name: "Consolidation Multi-Caisses Bamako",
      description:
        "Détection d’un compte d’épargne inactif supplémentaire à la caisse de Badalabougou (Bamako) sans déclaration initiale dans la fiche KYC.",
      detected_value: "Caisse Badalabougou (Solde: 180 000 FCFA)",
      expected_value: "Déclaration centralisée CreditFast",
      engine: "Passerelle Régionale CreditFast",
      status: "OPEN",
      resolved_by: null,
      resolved_at: null,
      resolution_comment: null,
      created_at: "2026-08-12T09:30:00Z",
    },
    {
      id: 5,
      credit_request_id: 5,
      document_id: null,
      anomaly_type: "PRIMO_DEMANDEUR_COLD_START",
      category: "FINANCIAL",
      severity: "INFO",
      rule_name: "Signalement Inclusion Cold Start",
      description:
        "Absence d’antécédents bancaires et d’épargne historique. Basculement automatique vers le modèle de pondération Cold Start.",
      detected_value: "0 mois d’historique bancaire",
      expected_value: "Actif en Mode Cold Start (+30 pts)",
      engine: "Sélecteur de Modèle Prudentiel",
      status: "RESOLVED",
      resolved_by: 1,
      resolved_at: "2026-08-17T10:15:00Z",
      resolution_comment:
        "Dossier qualifié pour le modèle Cold Start avec caution solidaire de maître artisan validée.",
      created_at: "2026-08-17T10:00:00Z",
    },
  ],

  // 18. Credit Analyses (avec les 10 sous-scores V2, overall_score & confidence_score)
  credit_analyses: [
    {
      id: 1,
      credit_request_id: 1,
      scoring_model_id: 1,
      declared_income: 650000,
      documented_income: 620000,
      income_consistency_score: 92,
      expense_score: 85,
      activity_score: 90,
      document_score: 95,
      savings_score: 88,
      credit_history_score: 94,
      guarantee_score: 82,
      repayment_capacity_score: 89,
      residential_zone_score: 80,
      overall_score: 82,
      confidence_score: 94,
      recommendation: "FAVORABLE",
      analysis_summary:
        "Capacité de remboursement vérifiée. Activité textile mature (6 ans). Épargne moyenne de 1.32M FCFA et remboursements antérieurs impeccables.",
      created_at: "2026-08-12T15:00:00Z",
    },
  ],

  // 19. Credit Score Factors
  credit_score_factors: [
    {
      id: 1,
      credit_analysis_id: 1,
      scoring_rule_id: 1,
      factor_name: "Capacité nette de remboursement",
      factor_type: "FINANCIAL",
      score: 25,
      weight: 0.25,
      explanation:
        "Reste à vivre net de 420 000 FCFA couvre 1.78x l’échéance mensuelle.",
    },
    {
      id: 2,
      credit_analysis_id: 1,
      scoring_rule_id: 2,
      factor_name: "Historique de crédit & Remboursements",
      factor_type: "BEHAVIOR",
      score: 19,
      weight: 0.2,
      explanation:
        "100% des échéances passées réglées sans aucun jour de retard (0 days late).",
    },
    {
      id: 3,
      credit_analysis_id: 1,
      scoring_rule_id: 3,
      factor_name: "Discipline d’épargne CreditFast",
      factor_type: "BEHAVIOR",
      score: 14,
      weight: 0.15,
      explanation:
        "Solde moyen de 1 320 000 FCFA avec 24 versements enregistrés au trimestre.",
    },
    {
      id: 4,
      credit_analysis_id: 1,
      scoring_rule_id: 4,
      factor_name: "Ancienneté & Stabilité activité",
      factor_type: "BUSINESS",
      score: 14,
      weight: 0.15,
      explanation:
        "Activité formelle établie depuis plus de 6 ans à Bamako Grand Marché.",
    },
    {
      id: 5,
      credit_analysis_id: 1,
      scoring_rule_id: 5,
      factor_name: "Garanties & Pièces OCR",
      factor_type: "INTEGRITY",
      score: 10,
      weight: 0.1,
      explanation:
        "Stock de wax vérifié (3.4M FCFA) et facture proforma authentifiée (96% OCR).",
    },
  ],

  // 20. Human Validations
  human_validations: [
    {
      id: 1,
      credit_request_id: 1,
      document_id: 1,
      validator_id: 1,
      validation_type: "FACTURE_PROFORMA",
      decision: "VALIDATED",
      comment: "Facture proforma BATEXI authentifiée auprès du fournisseur.",
      validated_at: "2026-08-12T14:30:00Z",
    },
    {
      id: 2,
      credit_request_id: 1,
      document_id: 2,
      validator_id: 1,
      validation_type: "RELEVE_BANCAIRE",
      decision: "VALIDATED",
      comment: "Relevé certifié par le chef d’agence CreditFast Bamako.",
      validated_at: "2026-08-12T14:35:00Z",
    },
  ],

  // 21. Credit Reviews
  credit_reviews: [
    {
      id: 1,
      credit_request_id: 1,
      analyst_id: 1,
      review_status: "CONFORME",
      recommendation: "FAVORABLE",
      comment:
        "Dossier complet, score 82/100, indice de confiance 94%. Recommandé pour approbation comité.",
      reviewed_at: "2026-08-12T16:00:00Z",
    },
  ],

  // 22. Credit Committee Decisions
  credit_committee_decisions: [
    {
      id: 1,
      credit_request_id: 4,
      committee_member_id: 3,
      decision: "APPROVED",
      approved_amount: 3000000,
      approved_duration_months: 14,
      comment:
        "Approuvé avec décaissement conditionné au démarrage des travaux du hangar avicole.",
      decided_at: "2026-08-10T11:00:00Z",
    },
  ],

  // 23. Credit Status History
  credit_status_history: [
    {
      id: 1,
      credit_request_id: 1,
      changed_by: 2,
      old_status: "SUBMITTED",
      new_status: "ANALYSIS",
      comment: "Réception du dossier et affectation à l’analyste.",
      created_at: "2026-08-11T10:00:00Z",
    },
    {
      id: 2,
      credit_request_id: 1,
      changed_by: 1,
      old_status: "ANALYSIS",
      new_status: "CREDIT_REVIEW",
      comment: "Scoring explicable généré (82/100) et pièces validées.",
      created_at: "2026-08-12T16:00:00Z",
    },
  ],

  // 24. Notifications
  notifications: [
    {
      id: 1,
      user_id: 1,
      title: "Anomalie Détectée - Dossier #REQ-2026-0893",
      message:
        "Date de facture antérieure de 18 mois détectée par le moteur OCR.",
      type: "ANOMALY_ALERT",
      is_read: false,
      created_at: "2026-08-15T09:35:00Z",
    },
    {
      id: 2,
      user_id: 1,
      title: "Dossier prêt pour comité",
      message:
        "Le dossier REQ-2026-0892 (Amadou Sanogo) a été transmis au comité.",
      type: "COMMITTEE_READY",
      is_read: true,
      created_at: "2026-08-13T10:00:00Z",
    },
  ],

  // 25. Audit Logs
  audit_logs: [
    {
      id: 1,
      user_id: 1,
      action: "SCORING_V2_EVALUATION",
      entity_type: "credit_analyses",
      entity_id: 1,
      details:
        "Évaluation V2 du dossier REQ-2026-0891 (Score 82/100, Confiance 94%)",
      ip_address: "197.239.67.12",
      created_at: "2026-08-12T15:00:00Z",
    },
    {
      id: 2,
      user_id: 1,
      action: "OCR_EXTRACT_VERIFY",
      entity_type: "document_extractions",
      entity_id: 1,
      details:
        "Validation de l’extraction OCR de la facture SOTIBA (confiance 96%)",
      ip_address: "197.239.67.12",
      created_at: "2026-08-12T14:30:00Z",
    },
  ],

  // 26. Sanctions & Watchlist (Conformité DigiCoop-WA+)
  sanctions_watchlist: [
    {
      id: 1,
      full_name: "Ibrahim Ould Mohamed",
      aliases: "Al-Sahraoui",
      country: "Mali",
      category: "TERRORIST_FINANCING_FP",
      risk_level: "HIGH_BLOCKING",
      match_reason: "Inscrit sur la liste des sanctions régionales UEMOA / ONU",
    },
    {
      id: 2,
      full_name: "Ousmane Coulibaly",
      aliases: "Ex-Directeur Marchés Publics",
      country: "Mali",
      category: "PEP_PPE",
      risk_level: "ENHANCED_DILIGENCE",
      match_reason:
        "Personne Politiquement Exposée (PPE) - Exige validation conformité renforcée",
    },
  ],
};

// Database Store Class
class DatabaseStore {
  constructor() {
    this.init();
  }

  init() {
    // Purge legacy storage keys
    const legacyKeys = ["CREDIT_FAST_DATABASE_V2", "CREDIT_FAST_DATABASE_V1", "CREDIT_FAST_DATABASE", "CREDIT_FAST_DB"];
    legacyKeys.forEach(k => {
      try { localStorage.removeItem(k); } catch (e) {}
    });

    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      this.data = JSON.parse(JSON.stringify(DEFAULT_DATABASE));
      this.save();
    } else {
      try {
        this.data = JSON.parse(saved);
      } catch (e) {
        this.data = JSON.parse(JSON.stringify(DEFAULT_DATABASE));
        this.save();
      }
    }

    // Migration & sanitization: ensure all users, clients and credit_requests are 100% Malian (Bamako districts)
    if (this.data) {
      let needsSave = false;
      const malianAgencies = {
        1: { district: "Grand Marché", address: "Quartier Grand Marché, Rue 314", occ: "Commerçante / Grossiste Textiles", client_num: "ML-BKO-008821" },
        2: { district: "Badalabougou", address: "Secteur Badalabougou, Rue 22", occ: "Transformateur Agroalimentaire", client_num: "ML-BKO-004419" },
        3: { district: "Dabanani", address: "Marché Dabanani, Rue 102", occ: "Import-Export Quincaillerie", client_num: "ML-BKO-003190" },
        4: { district: "Sotuba", address: "Zone Industrielle Sotuba", occ: "Aviculteur & Éleveur", client_num: "ML-BKO-005512" },
        5: { district: "Faladié", address: "Quartier Faladié", occ: "Jeune Artisan Menuisier", client_num: "ML-BKO-009023" },
      };

      if (Array.isArray(this.data.credit_requests)) {
        this.data.credit_requests.forEach((req) => {
          req.country = "Mali";
          req.city = "Bamako";
          needsSave = true;
        });
      }

      if (Array.isArray(this.data.clients)) {
        this.data.clients.forEach((c) => {
          c.city = "Bamako";
          const info = malianAgencies[c.id];
          if (info) {
            c.address = info.address;
            c.occupation = info.occ;
            c.client_number = info.client_num;
          }
          needsSave = true;
        });
      }

      if (Array.isArray(this.data.users)) {
        this.data.users.forEach((u) => {
          u.country = "Mali";
          needsSave = true;
        });
      }

      if (needsSave) {
        this.save();
      }
    }
  }

  save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
  }

  reset() {
    this.data = JSON.parse(JSON.stringify(DEFAULT_DATABASE));
    this.save();
  }

  get(table) {
    return this.data[table] || [];
  }

  findById(table, id) {
    return (this.data[table] || []).find((item) => item.id == id);
  }

  insert(table, item) {
    if (!this.data[table]) this.data[table] = [];
    const maxId = this.data[table].reduce(
      (max, obj) => (obj.id > max ? obj.id : max),
      0,
    );
    item.id = maxId + 1;
    this.data[table].push(item);
    this.save();
    return item;
  }

  update(table, id, updates) {
    if (!this.data[table]) return null;
    const index = this.data[table].findIndex((item) => item.id == id);
    if (index !== -1) {
      this.data[table][index] = { ...this.data[table][index], ...updates };
      this.save();
      return this.data[table][index];
    }
    return null;
  }

  addAuditLog(userId, action, entityType, entityId, details) {
    const log = {
      id: (this.data.audit_logs.length || 0) + 1,
      user_id: userId,
      action: action,
      entity_type: entityType,
      entity_id: entityId,
      details: details,
      ip_address: "197.239.67.12",
      created_at: new Date().toISOString(),
    };
    this.data.audit_logs.unshift(log);
    this.save();
    return log;
  }
}

// Global instance
window.DB = new DatabaseStore();
