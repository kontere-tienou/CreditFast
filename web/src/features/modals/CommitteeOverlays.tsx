import { callApp, callInteractions } from '@/shared/ui/legacy';

export function CommitteeOverlays() {
  return (
    <>
{/* ==========================================================================
     MODAL: COMITÉ DE CRÉDIT & CONFORMITÉ - DÉLIBÉRATION COLLÉGIALE
     ========================================================================== */}
<div id="committee-modal" className="modal-backdrop" style={{ display: "none" }}>
  <div className="modal-dialog committee-modal-dialog" style={{ maxWidth: "820px", width: "94%" }}>
    
    {/* Modal Header with Identity & Quorum */}
    <div className="modal-header" style={{ padding: "1.25rem 1.5rem", background: "linear-gradient(135deg, rgba(27, 67, 50, 0.04) 0%, rgba(139, 92, 246, 0.08) 100%)", borderBottom: "1px solid var(--border-color)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
        <div style={{ width: "44px", height: "44px", borderRadius: "var(--radius-md)", background: "var(--primary-50)", color: "var(--primary-600)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem", boxShadow: "var(--shadow-sm)" }}>
          <i className="fas fa-gavel"></i>
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
              Délibération du Comité de Crédit
            </h3>
            <span className="badge badge-submitted" id="com-dossier-num" style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>#REQ-2026-0891</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "3px" }}>
            <span id="com-client-name"><i className="fas fa-user mr-1"></i> Fatou Ndiaye (Bamako, Mali)</span>
            <span>•</span>
            <span style={{ color: "#518e45", fontWeight: 600 }}><i className="fas fa-users-viewfinder mr-1"></i> Quorum 3/3 Membres Atteint</span>
          </div>
        </div>
      </div>
      <button type="button" className="modal-close-btn" onClick={() => callInteractions("closeModal", 'committee-modal')} title="Fermer la délibération">&times;</button>
    </div>

    {/* Modal Body */}
    <div className="modal-body" style={{ padding: "1.5rem" }}>
      
      {/* 1. Dossier Synthesis Cards (3 Columns) */}
      <div className="grid-3" style={{ gap: "1rem", marginBottom: "1.25rem" }}>
        
        {/* Montant & Échéance */}
        <div className="card" style={{ padding: "0.9rem 1rem", background: "var(--bg-surface)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)" }}>
          <div style={{ fontSize: "0.72rem", textTransform: "uppercase", fontWeight: 700, color: "var(--text-muted)", marginBottom: "0.25rem" }}>
            Montant Demandé
          </div>
          <div id="com-requested-amount" className="amount-cell" style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--primary-700)" }}>
            2 500 000 FCFA
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
            Durée : <strong id="com-requested-duration">12 mois</strong> • Crédit Spot
          </div>
        </div>

        {/* Score Risque */}
        <div className="card" style={{ padding: "0.9rem 1rem", background: "var(--bg-surface)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)" }}>
          <div style={{ fontSize: "0.72rem", textTransform: "uppercase", fontWeight: 700, color: "var(--text-muted)", marginBottom: "0.25rem" }}>
            Score & Risque IA
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.35rem" }}>
            <span id="com-score-value" style={{ fontSize: "1.25rem", fontWeight: 800, color: "#518e45" }}>88</span>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>/100</span>
            <span className="badge badge-approved" id="com-risk-level" style={{ marginLeft: "auto", fontSize: "0.7rem" }}>Faible</span>
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
            <i className="fas fa-shield-halved text-emerald"></i> Modèle Cold Start 
          </div>
        </div>

        {/* Capacité & Reste à Vivre */}
        <div className="card" style={{ padding: "0.9rem 1rem", background: "var(--bg-surface)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)" }}>
          <div style={{ fontSize: "0.72rem", textTransform: "uppercase", fontWeight: 700, color: "var(--text-muted)", marginBottom: "0.25rem" }}>
            Capacité de Remboursement
          </div>
          <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--text-primary)" }} id="com-disposable-income">
            730 000 FCFA
          </div>
          <div style={{ fontSize: "0.75rem", color: "#518e45", fontWeight: 600, marginTop: "2px" }}>
            <i className="fas fa-circle-check"></i> Reste à vivre largement suffisant
          </div>
        </div>
      </div>

      {/* 2. Avis de Synthèse de l'Analyste & Surveillance LBC */}
      <div style={{ background: "rgba(27, 67, 50, 0.05)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", padding: "0.85rem 1rem", marginBottom: "1.5rem", display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
        <i className="fas fa-file-signature text-primary" style={{ fontSize: "1.1rem", marginTop: "2px" }}></i>
        <div style={{ fontSize: "0.82rem", lineHeight: 1.5, color: "var(--text-secondary)", flex: 1 }}>
          <div style={{ fontWeight: 700, color: "var(--primary-800)", marginBottom: "2px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Avis Favorable de l'Analyste Risque</span>
            <span className="badge badge-approved" style={{ fontSize: "0.68rem" }}><i className="fas fa-shield-halved"></i> Filtrage LBC/FT : RAS</span>
          </div>
          <span id="com-analyst-notes">
            « Capacité nette vérifiée (730k FCFA vs mensualité 235k FCFA), stocks de tissus nantis à 140% et antécédents de paiement irréprochables sur la Caisse Bamako Marché Médine. »
          </span>
        </div>
      </div>

      {/* 3. Ajustement des Termes Accordés */}
      <div className="card" style={{ padding: "1.25rem", background: "var(--bg-surface-secondary)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h4 style={{ fontSize: "0.92rem", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
            <i className="fas fa-sliders text-primary mr-1"></i> Paramètres du Prêt Validés par le Comité
          </h4>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Ajustables en séance</span>
        </div>

        <div className="grid-3" style={{ gap: "1rem", marginBottom: "1rem" }}>
          {/* Montant Accordé */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontWeight: 700, fontSize: "0.8rem" }}>Montant Accordé (FCFA)</label>
            <input type="number" id="com-approved-amount" className="form-control" defaultValue="2500000" step="50000" style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--primary-700)" }} />
          </div>

          {/* Durée */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontWeight: 700, fontSize: "0.8rem" }}>Durée Validée (Mois)</label>
            <select id="com-approved-duration" className="form-control" style={{ fontWeight: 600 }}>
              <option value="6">6 Mois (Court terme)</option>
              <option value="12" selected>12 Mois (Standard)</option>
              <option value="18">18 Mois (Moyen terme)</option>
              <option value="24">24 Mois (Investissement)</option>
            </select>
          </div>

          {/* Taux d'Intérêt */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontWeight: 700, fontSize: "0.8rem" }}>Taux Dégressif Annuel (%)</label>
            <input type="number" step="0.1" id="com-interest-rate" className="form-control" defaultValue="11.5" style={{ fontWeight: 600 }} />
          </div>
        </div>

        {/* Live Recalculation Bar */}
        <div style={{ background: "var(--bg-surface)", border: "1px dashed var(--border-color)", borderRadius: "var(--radius-sm)", padding: "0.75rem 1rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
            <i className="fas fa-calculator text-primary"></i>
            <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Échéance Mensuelle Estimée :</span>
            <strong id="com-live-monthly-payment" style={{ fontSize: "1.05rem", color: "#518e45" }}>221 600 FCFA / mois</strong>
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Taux d'effort ajusté : <strong id="com-live-effort-ratio" style={{ color: "#518e45" }}>26.1%</strong> (Plafond UEMOA ≤ 33%)
          </div>
        </div>

        {/* Conditions Particulières */}
        <div className="form-group" style={{ marginTop: "1rem", marginBottom: 0 }}>
          <label className="form-label" style={{ fontWeight: 600, fontSize: "0.8rem" }}>Conditions Particulières / Réserves éventuelles</label>
          <input type="text" id="com-conditions" className="form-control" defaultValue="Décaissement direct après mise en place de la garantie sur stock." placeholder="Ex: Décaissement en 2 tranches, caution solidaire exigée..." />
        </div>
      </div>

      {/* 4. Décision Finale Collégiale (3 Cartes Intuitives) */}
      <div style={{ marginTop: "1.5rem" }}>
        <h4 style={{ fontSize: "0.92rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.75rem", textAlign: "center" }}>
          Vote & Décision Finale du Comité
        </h4>

        <div className="grid-3 committee-decision-cards-grid" style={{ gap: "1rem" }}>
          
          {/* Option 1: Approuver */}
          <div className="committee-action-card approve" onClick={() => callInteractions("submitCommitteeDecision", 'APPROVED')}>
            <div className="action-card-header">
              <div className="action-icon-wrap" style={{ background: "rgba(81, 142, 69, 0.15)", color: "#518e45" }}>
                <i className="fas fa-circle-check"></i>
              </div>
              <div className="action-title" style={{ color: "#1b4332" }}>Approuver le Crédit</div>
            </div>
            <p className="action-desc">
              Accorder le prêt aux conditions validées et sceller le procès-verbal avec signature SHA-256.
            </p>
            <button type="button" className="btn btn-success w-full" style={{ fontWeight: 700, marginTop: "auto" }}>
              <i className="fas fa-signature mr-1"></i> Valider & Sceller
            </button>
          </div>

          {/* Option 2: Complément / Réserve */}
          <div className="committee-action-card reserve" onClick={() => callInteractions("submitCommitteeDecision", 'RESERVED')}>
            <div className="action-card-header">
              <div className="action-icon-wrap" style={{ background: "rgba(255, 152, 0, 0.15)", color: "#ff9800" }}>
                <i className="fas fa-rotate"></i>
              </div>
              <div className="action-title" style={{ color: "#b45309" }}>Complément Requis</div>
            </div>
            <p className="action-desc">
              Suspendre la décision pour demander des garanties additionnelles ou pièces à l'analyste.
            </p>
            <button type="button" className="btn btn-warning w-full" style={{ fontWeight: 700, marginTop: "auto" }}>
              <i className="fas fa-comment-dots mr-1"></i> Demander Infos
            </button>
          </div>

          {/* Option 3: Rejeter */}
          <div className="committee-action-card reject" onClick={() => callInteractions("submitCommitteeDecision", 'REJECTED')}>
            <div className="action-card-header">
              <div className="action-icon-wrap" style={{ background: "rgba(239, 68, 68, 0.15)", color: "#dc2626" }}>
                <i className="fas fa-circle-xmark"></i>
              </div>
              <div className="action-title" style={{ color: "#b91c1c" }}>Rejeter le Dossier</div>
            </div>
            <p className="action-desc">
              Refuser la demande pour dépassement de seuils prudentiels ou risque d'impayé avéré.
            </p>
            <button type="button" className="btn btn-danger w-full" style={{ fontWeight: 700, marginTop: "auto" }}>
              <i className="fas fa-ban mr-1"></i> Acter le Rejet
            </button>
          </div>

        </div>
      </div>

    </div>
  </div>
</div>

{/* ==========================================================================
     SIDEDRAWER VOLET LATÉRAL : ANALYSE APPROFONDIE DU DOSSIER COMITÉ
     ========================================================================== */}
<div id="committee-drawer-backdrop" className="schedule-drawer-backdrop" onClick={() => callApp("closeCommitteeDrawer")}>
  <div id="committee-sidedrawer" className="schedule-drawer" onClick={(event) => event.stopPropagation()} aria-label="Volet détail dossier comité">
    <div className="schedule-drawer-header">
      <div className="schedule-drawer-header-content">
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
          <span className="badge badge-submitted" id="com-drawer-req-badge" style={{ fontFamily: "var(--font-family-code)", fontWeight: 700 }}>#REQ-2026-0891</span>
          <span id="com-drawer-risk-badge" className="badge badge-approved"><i className="fas fa-shield-halved"></i> Risque Faible</span>
          <span className="badge badge-committee" style={{ fontSize: "0.68rem" }}>Séance Active</span>
        </div>
        <h3 id="com-drawer-title" className="schedule-drawer-title" style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>Amadou Sanogo</h3>
        <p id="com-drawer-subtitle" className="schedule-drawer-subtitle" style={{ fontSize: "0.76rem", color: "var(--text-muted)", margin: 0, marginTop: "2px" }}>Dossier de crédit • Bamako (Badalabougou), Mali • Décision Comité</p>
      </div>
      <button type="button" className="modal-close-btn" onClick={() => callApp("closeCommitteeDrawer")} title="Fermer le volet">
        <i className="fas fa-times"></i>
      </button>
    </div>

    <div className="schedule-drawer-body">
      {/* Section 1 : Emprunteur & Demande de Financement */}
      <div className="drawer-panel">
        <div className="drawer-panel-header">
          <h4 className="drawer-panel-title"><i className="fas fa-user-tie text-primary mr-1"></i> Fiche Emprunteur & Financement</h4>
          <span id="com-drawer-client-id" className="badge badge-submitted" style={{ fontSize: "0.68rem" }}>ID: CLI-2</span>
        </div>
        <div style={{ display: "flex", gap: "0.85rem", alignItems: "center", marginBottom: "0.85rem" }}>
          <img id="com-drawer-avatar" src="https://ui-avatars.com/api/?name=Amadou+Sanogo&background=4f46e5&color=fff" alt="" className="user-avatar" style={{ width: "46px", height: "46px", borderRadius: "var(--radius-md)", flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <div id="com-drawer-client-name" style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)" }}>Amadou Sanogo</div>
            <div id="com-drawer-location" style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}><i className="fas fa-location-dot text-primary mr-1"></i> Bamako (Badalabougou), Mali • Agence Principale</div>
          </div>
        </div>
        <div className="drawer-grid-2" style={{ marginBottom: "0.6rem" }}>
          <div className="drawer-metric-box">
            <div className="drawer-kv-label">Montant Sollicité</div>
            <div id="com-drawer-amount" style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--primary-700)", fontFamily: "var(--font-family-code)" }}>2 500 000 F</div>
            <div id="com-drawer-duration" style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "2px" }}>Durée : 12 mois</div>
          </div>
          <div className="drawer-metric-box">
            <div className="drawer-kv-label">Mensualité Estimée</div>
            <div id="com-drawer-installment" style={{ fontSize: "1.1rem", fontWeight: 800, color: "#1b4332", fontFamily: "var(--font-family-code)" }}>235 000 F</div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "2px" }}>Taux : 9.5% annuel</div>
          </div>
        </div>
        <div className="drawer-grid-2">
          <div className="drawer-kv">
            <span className="drawer-kv-label">Activité Déclarée</span>
            <span id="com-drawer-activity" className="drawer-kv-value" style={{ fontWeight: 600 }}>Commerce de gros & tissus</span>
          </div>
          <div className="drawer-kv">
            <span className="drawer-kv-label">Reste à Vivre Mensuel</span>
            <span id="com-drawer-surplus" className="drawer-kv-value" style={{ color: "#518e45", fontWeight: 700 }}>+ 385 000 FCFA</span>
          </div>
        </div>
      </div>

      {/* Section 2 : Scoring IA Explicable & Piliers XAI */}
      <div className="drawer-panel">
        <div className="drawer-panel-header">
          <h4 className="drawer-panel-title"><i className="fas fa-brain-circuit text-emerald mr-1"></i> Diagnostic Scoring Explicable (XAI)</h4>
          <span id="com-drawer-conf-badge" className="badge badge-approved"><i className="fas fa-check-double"></i> Confiance 94%</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg-body)", padding: "0.75rem 1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)", marginBottom: "0.75rem" }}>
          <div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Score de Crédibilité Global</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginTop: "2px" }}>
              <span id="com-drawer-overall-score" style={{ fontSize: "1.6rem", fontWeight: 900, color: "#518e45" }}>90</span>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>/100</span>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <span className="badge badge-approved" id="com-drawer-capacity-badge" style={{ fontSize: "0.74rem" }}><i className="fas fa-check"></i> Reste à vivre certifié</span>
            <div style={{ fontSize: "0.7rem", color: "var(--text-subtle)", marginTop: "3px" }}>Taux d'effort post-crédit : 28%</div>
          </div>
        </div>

        {/* Piliers XAI */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.75rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span><i className="fas fa-mobile-screen-button text-primary mr-1"></i> Flux Mobile Money & Bancaires</span>
            <strong id="com-drawer-pillar-cashflow" style={{ color: "#518e45" }}>92 / 100</strong>
          </div>
          <div className="progress-bar-container" style={{ height: "5px", marginBottom: "3px" }}>
            <div id="com-drawer-bar-cashflow" className="progress-bar" style={{ width: "92%", background: "#518e45" }}></div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span><i className="fas fa-id-card text-info mr-1"></i> Cold Start & Garanties Solidaires</span>
            <strong id="com-drawer-pillar-coldstart" style={{ color: "#518e45" }}>88 / 100</strong>
          </div>
          <div className="progress-bar-container" style={{ height: "5px", marginBottom: "3px" }}>
            <div id="com-drawer-bar-coldstart" className="progress-bar" style={{ width: "88%", background: "#3b82f6" }}></div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span><i className="fas fa-shield-halved text-warning mr-1"></i> Stabilité & Historique Réciproque</span>
            <strong id="com-drawer-pillar-stability" style={{ color: "#518e45" }}>85 / 100</strong>
          </div>
          <div className="progress-bar-container" style={{ height: "5px" }}>
            <div id="com-drawer-bar-stability" className="progress-bar" style={{ width: "85%", background: "#ff9800" }}></div>
          </div>
        </div>
      </div>

      {/* Section 3 : Avis Analyste & Contrôle Conformité LBC/FT */}
      {/* <div class="drawer-panel">
        <div class="drawer-panel-header">
          <h4 class="drawer-panel-title"><i class="fas fa-clipboard-check text-info mr-1"></i> Avis Analyste & Filtrage LBC/FT</h4>
          <span class="badge badge-approved"><i class="fas fa-shield-check"></i> Conforme UEMOA</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 0.6rem; font-size: 0.78rem;">
          <div class="drawer-kv">
            <span class="drawer-kv-label">Recommandation Analyste Risque</span>
            <p id="com-drawer-analyst-notes" style="background: var(--bg-body); padding: 0.6rem 0.8rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); font-size: 0.75rem; color: var(--text-primary); margin: 0; line-height: 1.45;">
              Avis favorable. Chiffre d'affaires récurrent vérifié sur les 6 derniers mois. Caution solidaire validée par l'artisan référent.
            </p>
          </div>
          <div class="drawer-grid-2">
            <div class="drawer-kv">
              <span class="drawer-kv-label">Filtrage Sanctions & PPE</span>
              <span class="badge badge-approved" style="align-self: flex-start;"><i class="fas fa-check"></i> RAS (0% Match)</span>
            </div>
            <div class="drawer-kv">
              <span class="drawer-kv-label">Gage & Sûretés</span>
              <span class="badge badge-submitted" style="align-self: flex-start;"><i class="fas fa-file-contract"></i> Acte RCCM Enregistré</span>
            </div>
          </div>
        </div>
      </div> */}
    </div>

    {/* Sidedrawer Footer Actions */}
    <div className="schedule-drawer-footer" style={{ padding: "1rem 1.4rem", borderTop: "1px solid var(--border-color)", background: "var(--bg-surface)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem" }}>
      <button type="button" className="btn btn-secondary" onClick={() => callApp("closeCommitteeDrawer")} style={{ padding: "0.6rem 1rem" }}>
        <i className="fas fa-times mr-1"></i> Fermer
      </button>
      <button type="button" className="btn btn-primary" onClick={() => callApp("openCommitteeModalFromDrawer")} style={{ padding: "0.6rem 1.25rem", fontWeight: 700 }}>
        <i className="fas fa-gavel mr-1"></i> Délibérer & Voter
      </button>
    </div>
  </div>
</div>
    </>
  );
}
