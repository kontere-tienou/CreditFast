# CreditFast - Plateforme d'Octroi, Scoring & Conformité Microfinance

The production HTML/CSS/JS app stays at the repository root. The React SPA (Vite + TypeScript) lives in `web/` and is not wired to screens yet.

```bash
cd web
npm install
npm run dev
```

API base URL: `web/.env.example` (`VITE_API_URL`).

## 📁 Architecture Modulaire par Rôle & Utilisateur

Le projet est structuré avec une séparation claire et modulaire des dossiers selon les rôles utilisateurs et les domaines fonctionnels :

```text
├── views/
│   ├── auth/                          # Module Authentification & Onboarding
│   │   └── auth.html                  # Écran de connexion & hero slider communicant
│   │
│   ├── client/                        # RÔLE 1 : Demandeur / Emprunteur (TPE / Particulier)
│   │   ├── dashboard.html             # Tableau de bord client (synthèse, progression)
│   │   ├── requests.html              # Historique des demandes de prêt
│   │   ├── schedule.html              # Échéancier de remboursement interactif
│   │   ├── documents.html             # Espace dépôt & gestion des justificatifs
│   │   ├── advisor.html               # Messagerie & contact conseiller dédié
│   │   ├── simulator.html             # Simulateur de crédit & capacité d'emprunt
│   │   ├── wizard.html                # Tunnel de demande de microcrédit pas-à-pas
│   │   └── modal-payment.html         # Fenêtre modale de paiement Mobile Money
│   │
│   ├── agent/                         # RÔLE 2 : Agent de Crédit / Collecteur Terrain
│   │   ├── dashboard.html             # Tableau de bord tournée & objectifs
│   │   ├── inspections.html           # Audits & visites terrain certifiées
│   │   ├── clients.html               # Portefeuille clients & collecte de proximité
│   │   ├── complements.html           # Suivi des pièces complémentaires
│   │   └── modal-inspection.html      # Formulaire d'audit terrain & photos de stock
│   │
│   ├── analyst/                       # RÔLE 3 : Analyste Risque
│   │   ├── dashboard.html             # Tableau de bord risque & file d'attente
│   │   ├── dossiers.html              # Instruction des dossiers & scoring
│   │   ├── anomalies.html             # Détection d'anomalies OCR & incohérences
│   │   ├── scoring-admin.html         # Paramétrage des grilles de score BCEAO
│   │   └── modal-dossier-360.html     # Vue 360° du dossier & vérification OCR
│   │
│   ├── committee/                     # RÔLE 4 : Comité d'Octroi & Conformité
│   │   ├── dashboard.html             # Sessions du comité & votes collégiaux
│   │   ├── dossier.html               # Dossier de deliberation
│   │   ├── audit-logs.html            # Piste d'audit & journalisation des actions
│   │   └── modal-committee.html       # Procès-verbal de délibération d'octroi
│   │
│   ├── shared/                        # Composants Partagés & Modales Communes
│   │   ├── sidebar.html               # Barre de navigation latérale dynamique
│   │   ├── topbar.html                # Barre supérieure (recherche, notifications, profil)
│   │   ├── toasts.html                # Système de notifications toast
│   │   ├── modal-settings.html        # Paramètres généraux & préférences
│   │   ├── modal-edit-profile.html    # Modification de profil utilisateur
│   │   ├── modal-qr-scanner.html      # Scanner QR Code pour quittances
│   │   ├── modal-success-animation.html # Animation de confirmation d'action
│   │   └── modal-doc-lightbox.html    # Visionneuse haute résolution de documents
│   │
│   └── layout/                        # Squelette HTML Global
│       ├── head.html                  # Balises méta, CSS, polices
│       └── scripts.html               # Chargement ordonné des modules JavaScript
│
├── js/                                # Logique Applicative & Moteurs
│   ├── constants.js                   # Constantes, statuts et clés de stockage
│   ├── data.js                        # Modèles de données & profils de démonstration
│   ├── credit-scoring.js              # Moteur de scoring financier UEMOA
│   ├── ocr-engine.js                  # Moteur d'analyse & détection OCR
│   ├── charts.js                      # Graphiques & visualisations statistiques
│   ├── interactions.js                # Gestionnaires d'événements & formulaires
│   └── app.js                         # Contrôleur principal & routage par rôle
│
├── css/                               # Feuilles de Styles
│   ├── constants.css                  # Variables CSS (couleurs, rayons, typographies)
│   ├── style.css                      # Styles de base & mise en page
│   ├── components.css                 # Composants UI, boutons, badges, hero slider
│   └── dark.css                       # Thème sombre haute lisibilité
│
├── images/                            # Ressources graphiques & visuels du slider
└── build.js                           # Script de compilation & assemblage automatique
```
