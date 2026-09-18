import { callApp } from '@/shared/ui/legacy';

export function LoanApplicationModal() {
  return (
    <>
{/* ====================================================================
     [MODAL] DEMANDE DE FINANCEMENT & CRÉDIT CREDITFAST (PARCOURS EN 6 ÉTAPES)
     Plateforme Régionale CreditFast UEMOA
     ==================================================================== */}
<div id="modal-loan-application" className="modal-backdrop" style={{ display: "none", position: "fixed", inset: 0, zIndex: 2100, alignItems: "center", justifyContent: "center", background: "rgba(15, 23, 42, 0.7)", backdropFilter: "blur(5px)" }}>
  <div className="modal-dialog modal-xl" style={{ maxWidth: "900px", width: "95%", maxHeight: "90vh", background: "var(--bg-surface)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-2xl)", border: "1px solid var(--border-color)", display: "flex", flexDirection: "column", overflow: "hidden", animation: "modalFadeIn 0.25s ease-out" }}>

    {/* Modal Header */}
    <div className="modal-header" id="modal-loan-app-header" style={{ padding: "1.25rem 1.75rem", background: "linear-gradient(135deg, var(--cif-emerald-600, #518e45), var(--cif-emerald-700, #1b4332))", color: "white", borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "rgba(255, 255, 255, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem" }}>
          <i className="fas fa-file-circle-plus"></i>
        </div>
        <div>
          <h3 style={{ fontSize: "1.15rem", fontWeight: 800, margin: 0, color: "white", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span id="modal-loan-app-title">Faire une Demande de Prêt CreditFast</span>
            <span className="badge" id="modal-loan-app-badge" style={{ background: "rgba(255, 255, 255, 0.25)", color: "white", fontSize: "0.68rem", fontWeight: 600, padding: "2px 8px", borderRadius: "12px" }}>Parcours
              6 Étapes</span>
          </h3>
          <p id="modal-loan-app-subtitle" style={{ fontSize: "0.76rem", color: "#d1fae5", margin: "2px 0 0 0" }}>
            Instruction rapide, calcul transparent de votre mensualité & transmission sécurisée à votre conseiller
          </p>
        </div>
      </div>
      <button type="button" className="modal-close-btn" style={{ color: "white", background: "rgba(255,255,255,0.18)", border: "none", width: "34px", height: "34px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s" }} onClick={() => callApp("closeNewLoanModal")} title="Fermer la fenêtre">
        <i className="fas fa-times"></i>
      </button>
    </div>

    {/* Modal Body (Scrollable Wizard) */}
    <div className="modal-body" style={{ padding: "1.5rem 1.75rem", overflowY: "auto", flex: 1 }}>

      {/* 6-Step Indicator */}
      <div className="wizard-nav" style={{ marginBottom: "1.5rem", paddingBottom: "1rem", borderBottom: "1px solid var(--border-color)" }}>
        <div className="wizard-step active" id="modal-wstep-1" onClick={() => callApp("setModalWizardStep", 1)} style={{ cursor: "pointer" }}>
          <div className="wizard-step-circle">1</div>
          <div className="wizard-step-label">Identité</div>
        </div>
        <div className="wizard-step" id="modal-wstep-2" onClick={() => callApp("setModalWizardStep", 2)} style={{ cursor: "pointer" }}>
          <div className="wizard-step-circle">2</div>
          <div className="wizard-step-label">Activité</div>
        </div>
        <div className="wizard-step" id="modal-wstep-3" onClick={() => callApp("setModalWizardStep", 3)} style={{ cursor: "pointer" }}>
          <div className="wizard-step-circle">3</div>
          <div className="wizard-step-label">Finances</div>
        </div>
        <div className="wizard-step" id="modal-wstep-4" onClick={() => callApp("setModalWizardStep", 4)} style={{ cursor: "pointer" }}>
          <div className="wizard-step-circle">4</div>
          <div className="wizard-step-label">Demande</div>
        </div>
        <div className="wizard-step" id="modal-wstep-5" onClick={() => callApp("setModalWizardStep", 5)} style={{ cursor: "pointer" }}>
          <div className="wizard-step-circle">5</div>
          <div className="wizard-step-label">Garantie</div>
        </div>
        <div className="wizard-step" id="modal-wstep-6" onClick={() => callApp("setModalWizardStep", 6)} style={{ cursor: "pointer" }}>
          <div className="wizard-step-circle">6</div>
          <div className="wizard-step-label">Justificatifs</div>
        </div>
      </div>

      {/* Step 1: Identité */}
      <div id="modal-wizard-step-1" className="modal-wizard-step-content">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
          <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>
            <i className="fas fa-id-card text-primary mr-2"></i> Étape 1 : Informations Personnelles
          </h4>
          <button type="button" className="btn btn-primary-subtle btn-sm" onClick={() => callApp("openQrScannerModal", 'identity')} title="Scanner le QR Code d'une pièce d'identité officielle">
            <i className="fas fa-camera text-primary mr-1"></i> <strong>Scanner QR / NINA (Caméra)</strong>
          </button>
        </div>

        {/* Verified QR Document Banner */}
        <div id="modal-wizard-identity-qr-badge" className="anomaly-item info" style={{ display: "none", marginBottom: "1.25rem" }}>
          <i className="fas fa-shield-halved anomaly-icon text-emerald" style={{ fontSize: "1.4rem" }}></i>
          <div className="anomaly-content">
            <h5 style={{ color: "var(--emerald, #518e45)", fontWeight: 700 }}>Pièce d'Identité Certifiée</h5>
            <p id="modal-wizard-identity-qr-text" style={{ fontSize: "0.8rem", margin: 0 }}>NINA Biométrique authentifiée
              avec succès.</p>
          </div>
          <button type="button" className="btn btn-outline btn-xs" onClick={() => callApp("openQrScannerModal", 'identity')} style={{ marginLeft: "auto" }}>
            <i className="fas fa-rotate"></i> Re-scanner
          </button>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" style={{ fontSize: "0.8rem", fontWeight: 600 }}>Nom et Prénom *</label>
            <input type="text" id="wiz-fullname" className="form-control" defaultValue="Fatou Ndiaye" required />
          </div>
          <div className="form-group">
            <label className="form-label" style={{ fontSize: "0.8rem", fontWeight: 600 }}>Numéro de Téléphone *</label>
            <input type="tel" id="wiz-phone" className="form-control" defaultValue="+223 77 54 01 28" required />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label" style={{ fontSize: "0.8rem", fontWeight: 600 }}>Pays de Résidence</label>
            <select id="wiz-country" className="form-control">
              <option value="Mali" selected>Mali (Bamako)</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label" style={{ fontSize: "0.8rem", fontWeight: 600 }}>Ville & Quartier / Zone</label>
            <input type="text" id="wiz-city" className="form-control" defaultValue="Bamako - Grand Marché" />
          </div>
        </div>

        {/* Profil d'Éligibilité & Cold Start (Inclusion Financière) */}
        <div style={{ background: "var(--bg-body)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)", padding: "1.15rem", marginTop: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <label className="form-label" style={{ margin: 0, fontSize: "0.84rem", fontWeight: 700, color: "var(--text-primary)" }}>
              <i className="fas fa-seedling text-emerald mr-1"></i> Profil d'Inclusion & Antécédents Financiers
            </label>
            <span className="badge badge-warning" id="modal-wiz-cold-start-indicator" style={{ fontSize: "0.7rem" }}>
              <i className="fas fa-check"></i> Mode Cold Start Activé
            </span>
          </div>

          <div className="grid-2" style={{ gap: "0.75rem", marginBottom: "0.75rem" }}>
            <label style={{ border: "2px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "0.85rem", cursor: "pointer", display: "flex", gap: "0.75rem", alignItems: "flex-start", background: "var(--bg-surface)", transition: "all 0.2s" }} id="modal-label-profile-standard">
              <input type="radio" name="wiz-profile-mode" id="modal-wiz-profile-standard" value="STANDARD" onChange={() => callApp("handleWizardProfileModeChange", 'STANDARD')} style={{ marginTop: "3px" }} />
              <div>
                <strong style={{ fontSize: "0.82rem", color: "var(--text-primary)", display: "block" }}>Membre Existant
                  CreditFast</strong>
                <span style={{ fontSize: "0.73rem", color: "var(--text-subtle)", lineHeight: 1.3, display: "block" }}>Déjà
                  client avec compte d'épargne ou historique régulier.</span>
              </div>
            </label>

            <label style={{ border: "2px solid var(--primary-600)", borderRadius: "var(--radius-md)", padding: "0.85rem", cursor: "pointer", display: "flex", gap: "0.75rem", alignItems: "flex-start", background: "var(--cif-emerald-50, #eef4ee)", transition: "all 0.2s" }} id="modal-label-profile-coldstart">
              <input type="radio" name="wiz-profile-mode" id="modal-wiz-profile-coldstart" value="COLD_START" defaultChecked onChange={() => callApp("handleWizardProfileModeChange", 'COLD_START')} style={{ marginTop: "3px" }} />
              <div>
                <strong style={{ fontSize: "0.82rem", color: "var(--emerald, #1b4332)", display: "block" }}>
                  <i className="fas fa-seedling"></i> Primo-Demandeur (Cold Start)
                </strong>
                <span style={{ fontSize: "0.73rem", color: "var(--text-subtle)", lineHeight: 1.3, display: "block" }}>Nouveau
                  bénéficiaire : évaluation inclusive par solvabilité réelle.</span>
              </div>
            </label>
          </div>

          <div id="modal-wiz-cold-start-info" style={{ background: "rgba(81, 142, 69, 0.08)", borderLeft: "3px solid var(--emerald, #518e45)", padding: "0.6rem 0.85rem", borderRadius: "0 var(--radius-md) var(--radius-md) 0", fontSize: "0.75rem", color: "var(--text-muted-dark)" }}>
            <i className="fas fa-balance-scale text-emerald mr-1"></i> <strong>Modèle d'Inclusion CreditFast:</strong>
            L'absence d'historique n'est pas pénalisée. Les pondérations s'adaptent à votre capacité réelle de
            remboursement et à vos garanties de proximité.
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem" }}>
          <button type="button" className="btn btn-primary" onClick={() => callApp("setModalWizardStep", 2)}>
            Suivant : Activité <i className="fas fa-arrow-right ml-1"></i>
          </button>
        </div>
      </div>

      {/* Step 2: Activité */}
      <div id="modal-wizard-step-2" className="modal-wizard-step-content" style={{ display: "none" }}>
        <h4 style={{ marginBottom: "1.25rem", fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>
          <i className="fas fa-store text-primary mr-2"></i> Étape 2 : Votre Activité Économique
        </h4>
        <div className="form-group">
          <label className="form-label" style={{ fontSize: "0.8rem", fontWeight: 600 }}>Secteur d'Activité *</label>
          <select id="wiz-sector" className="form-control">
            <option value="Commerce de Tissus & Habillement (Wax/Bazin)" selected>Commerce de Tissus & Habillement
              (Wax/Bazin)</option>
            <option value="Artisanat & Menuiserie Bois">Artisanat & Menuiserie Bois</option>
            <option value="Transformation Agroalimentaire">Transformation Agroalimentaire</option>
            <option value="Commerce Général & Demi-Gros">Commerce Général & Demi-Gros</option>
            <option value="Aviculture & Élevage">Aviculture & Élevage</option>
            <option value="BTP & Quincaillerie">BTP & Quincaillerie</option>
          </select>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label" style={{ fontSize: "0.8rem", fontWeight: 600 }}>Ancienneté de votre activité
              (Années)</label>
            <input type="number" id="wiz-seniority" className="form-control" defaultValue="4" />
          </div>
          <div className="form-group">
            <label className="form-label" style={{ fontSize: "0.8rem", fontWeight: 600 }}>Emplacement Commercial /
              Boutique</label>
            <input type="text" id="wiz-location" className="form-control" defaultValue="Grand Marché / Dabanani, Bamako (Mali)" />
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1.5rem" }}>
          <button type="button" className="btn btn-secondary" onClick={() => callApp("setModalWizardStep", 1)}><i className="fas fa-arrow-left mr-1"></i> Précédent</button>
          <button type="button" className="btn btn-primary" onClick={() => callApp("setModalWizardStep", 3)}>Suivant : Finances <i className="fas fa-arrow-right ml-1"></i></button>
        </div>
      </div>

      {/* Step 3: Finances */}
      <div id="modal-wizard-step-3" className="modal-wizard-step-content" style={{ display: "none" }}>
        <h4 style={{ marginBottom: "1.25rem", fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>
          <i className="fas fa-calculator text-primary mr-2"></i> Étape 3 : Revenus, Charges & Capacité
        </h4>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label" style={{ fontSize: "0.8rem", fontWeight: 600 }}>Revenu Mensuel Moyen de l'Activité
              (FCFA) *</label>
            <input type="number" id="wiz-income" className="form-control" defaultValue="850000" />
          </div>
          <div className="form-group">
            <label className="form-label" style={{ fontSize: "0.8rem", fontWeight: 600 }}>Dépenses Mensuelles & Ménage (FCFA)
              *</label>
            <input type="number" id="wiz-expenses" className="form-control" defaultValue="320000" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label" style={{ fontSize: "0.8rem", fontWeight: 600 }}>Mensualités d'autres crédits en cours
              (FCFA)</label>
            <input type="number" id="wiz-debt" className="form-control" defaultValue="0" />
          </div>
          <div className="form-group">
            <label className="form-label" style={{ fontSize: "0.8rem", fontWeight: 600 }}>Nombre de personnes à charge</label>
            <input type="number" id="wiz-dependents" className="form-control" defaultValue="3" />
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1.5rem" }}>
          <button type="button" className="btn btn-secondary" onClick={() => callApp("setModalWizardStep", 2)}><i className="fas fa-arrow-left mr-1"></i> Précédent</button>
          <button type="button" className="btn btn-primary" onClick={() => callApp("setModalWizardStep", 4)}>Suivant : Demande <i className="fas fa-arrow-right ml-1"></i></button>
        </div>
      </div>

      {/* Step 4: Demande */}
      <div id="modal-wizard-step-4" className="modal-wizard-step-content" style={{ display: "none" }}>
        <h4 style={{ marginBottom: "1.25rem", fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>
          <i className="fas fa-money-bill-wave text-primary mr-2"></i> Étape 4 : Détails du Financement Souhaité
        </h4>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label" style={{ fontSize: "0.8rem", fontWeight: 600 }}>Montant Demandé (FCFA) *</label>
            <input type="number" id="wiz-amount" className="form-control" defaultValue="2500000" min="100000" step="50000" />
          </div>
          <div className="form-group">
            <label className="form-label" style={{ fontSize: "0.8rem", fontWeight: 600 }}>Durée Souhaitée (Mois) *</label>
            <input type="number" id="wiz-duration" className="form-control" defaultValue="12" min="3" max="36" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label" style={{ fontSize: "0.8rem", fontWeight: 600 }}>Objet précis de votre financement
            *</label>
          <textarea id="wiz-purpose" className="form-control" rows={2} defaultValue={"Achat de stock conteneur tissus wax et bazin riche pour les commandes de Tabaski"} />
        </div>

        {/* Live Capacity Simulator Card */}
        <div className="capacity-card" style={{ marginTop: "1rem", background: "var(--bg-body)", padding: "1rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-color)" }}>
          <h5 style={{ fontSize: "0.82rem", color: "var(--text-muted-dark)", marginBottom: "0.5rem", fontWeight: 700 }}>
            <i className="fas fa-calculator text-primary mr-1"></i> Estimation Instantanée de votre Confort Financier
          </h5>
          <div className="capacity-equation" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
            <div className="capacity-item">
              <div className="val" id="wiz-calc-disposable" style={{ fontSize: "1.1rem", fontWeight: 800, color: "#1b4332" }}>530
                000 FCFA</div>
              <div className="lbl" style={{ fontSize: "0.72rem", color: "var(--text-subtle)" }}>Reste à Vivre Disponible</div>
            </div>
            <div className="capacity-op" style={{ fontWeight: 700, color: "var(--text-subtle)" }}>vs</div>
            <div className="capacity-item">
              <div className="val" id="wiz-calc-installment" style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--primary-700)" }}>235 000 FCFA</div>
              <div className="lbl" style={{ fontSize: "0.72rem", color: "var(--text-subtle)" }}>Mensualité Estimée</div>
            </div>
            <div className="capacity-item">
              <span id="wiz-calc-status" className="badge badge-capacity-sufficient" style={{ fontSize: "0.76rem", padding: "6px 12px" }}>Capacité Suffisante</span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1.5rem" }}>
          <button type="button" className="btn btn-secondary" onClick={() => callApp("setModalWizardStep", 3)}><i className="fas fa-arrow-left mr-1"></i> Précédent</button>
          <button type="button" className="btn btn-primary" onClick={() => callApp("setModalWizardStep", 5)}>Suivant : Garanties <i className="fas fa-arrow-right ml-1"></i></button>
        </div>
      </div>

      {/* Step 5: Garanties */}
      <div id="modal-wizard-step-5" className="modal-wizard-step-content" style={{ display: "none" }}>
        <h4 style={{ marginBottom: "1.25rem", fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>
          <i className="fas fa-shield-alt text-primary mr-2"></i> Étape 5 : Déclaration de Garantie
        </h4>
        <div className="form-group">
          <label className="form-label" style={{ fontSize: "0.8rem", fontWeight: 600 }}>Type de Garantie Proposée</label>
          <select id="wiz-guarantee-type" className="form-control">
            <option value="STOCK_MARCHANDISE" selected>Stock de marchandise / Tissus & Devis</option>
            <option value="CAUTION_SOLIDAIRE">Caution solidaire d'un commerçant / artisan</option>
            <option value="EQUIPEMENT_MATERIEL">Équipement professionnel / Matériel</option>
            <option value="PARCELLE_TERRAIN">Titre foncier / Attestation d'attribution</option>
          </select>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label" style={{ fontSize: "0.8rem", fontWeight: 600 }}>Valeur Estimée de la Garantie
              (FCFA)</label>
            <input type="number" id="wiz-guarantee-val" className="form-control" defaultValue="3200000" />
          </div>
          <div className="form-group">
            <label className="form-label" style={{ fontSize: "0.8rem", fontWeight: 600 }}>Description de la garantie</label>
            <input type="text" id="wiz-guarantee-desc" className="form-control" defaultValue="Stock tissus wax et factures proforma certifiées Bamako" />
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1.5rem" }}>
          <button type="button" className="btn btn-secondary" onClick={() => callApp("setModalWizardStep", 4)}><i className="fas fa-arrow-left mr-1"></i> Précédent</button>
          <button type="button" className="btn btn-primary" onClick={() => callApp("setModalWizardStep", 6)}>Suivant : Justificatifs &
            Signature <i className="fas fa-arrow-right ml-1"></i></button>
        </div>
      </div>

      {/* Step 6: Justificatifs & OCR */}
      <div id="modal-wizard-step-6" className="modal-wizard-step-content" style={{ display: "none" }}>
        <h4 style={{ marginBottom: "1.25rem", fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>
          <i className="fas fa-file-arrow-up text-primary mr-2"></i> Étape 6 : Dépôt des Justificatifs & Signature
        </h4>

        <div className="grid-2" style={{ gap: "1rem", marginBottom: "1.25rem" }}>
          {/* Option A: Scanner via Caméra QR Code */}
          <div style={{ border: "2px dashed var(--primary-300)", borderRadius: "var(--radius-lg)", padding: "1.25rem", textAlign: "center", background: "var(--bg-surface-secondary)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "var(--primary-50)", color: "var(--primary-600)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", margin: "0 auto 0.5rem" }}>
                <i className="fas fa-camera"></i>
              </div>
              <h5 style={{ marginBottom: "0.25rem", fontSize: "0.9rem", fontWeight: 700 }}>Scanner en Direct (Caméra)</h5>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
                Scannez le QR Code officiel de votre devis normalisé, facture DGI ou reçu.
              </p>
            </div>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => callApp("openQrScannerModal", 'document')} style={{ width: "100%", justifyContent: "center" }}>
              <i className="fas fa-qrcode mr-2"></i> Lancer la Caméra & Scanner QR
            </button>
          </div>

          {/* Option B: Téléverser un Fichier */}
          <div style={{ border: "2px dashed var(--border-color)", borderRadius: "var(--radius-lg)", padding: "1.25rem", textAlign: "center", background: "var(--bg-surface-secondary)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "var(--bg-surface)", color: "var(--text-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", margin: "0 auto 0.5rem", border: "1px solid var(--border-color)" }}>
                <i className="fas fa-file-pdf"></i>
              </div>
              <h5 style={{ marginBottom: "0.25rem", fontSize: "0.9rem", fontWeight: 700 }}>Joindre un Fichier (PDF / Photo)
              </h5>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
                Format PDF, JPEG ou PNG .
              </p>
            </div>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => callApp("showToast", 'Document joint avec succès (Devis_Fournisseur_bko.pdf)', 'success')} style={{ width: "100%", justifyContent: "center" }}>
              <i className="fas fa-folder-open mr-2"></i> Parcourir Fichiers...
            </button>
          </div>
        </div>

        {/* Scanned Document Banner if available */}
        <div id="modal-wizard-doc-qr-badge" className="anomaly-item info" style={{ display: "none", marginBottom: "1.25rem" }}>
          <i className="fas fa-file-circle-check anomaly-icon text-emerald" style={{ fontSize: "1.4rem" }}></i>
          <div className="anomaly-content">
            <h5 style={{ color: "var(--emerald, #518e45)", fontWeight: 700 }}>Document Officiel Vérifié par QR Code</h5>
            <p id="modal-wizard-doc-qr-text" style={{ fontSize: "0.8rem", margin: 0 }}>Facture certifiée attachée avec
              succès au dossier.</p>
          </div>
        </div>

        {/* Consent Checkbox */}
        <div style={{ background: "rgba(81, 142, 69, 0.08)", borderRadius: "var(--radius-md)", padding: "0.85rem 1rem", border: "1px solid rgba(81, 142, 69, 0.25)", marginBottom: "1.25rem" }}>
          <label style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem", cursor: "pointer", margin: 0, fontSize: "0.78rem", color: "var(--text-primary)" }}>
            <input type="checkbox" id="modal-wiz-consent" defaultChecked style={{ marginTop: "2px", accentColor: "var(--cif-emerald-500)" }} />
            <span>
              Je certifie l'exactitude des informations fournies et j'autorise la Caisse CreditFast à instruire ma
              demande de financement selon les normes.
            </span>
          </label>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1.5rem", borderTop: "1px solid var(--border-color)", paddingTop: "1rem" }}>
          <button type="button" className="btn btn-secondary" onClick={() => callApp("setModalWizardStep", 5)}><i className="fas fa-arrow-left mr-1"></i> Précédent</button>
          <button type="button" id="modal-loan-app-submit-btn" className="btn btn-success btn-lg" onClick={() => callApp("submitNewCreditRequest")}>
            <i className="fas fa-paper-plane mr-2"></i> Confirmer & Soumettre ma Demande
          </button>
        </div>
      </div>

    </div>
  </div>
</div>
    </>
  );
}
