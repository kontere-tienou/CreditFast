import { callApp, callInteractions } from '@/shared/ui/legacy';

export function AgentDossierDrawer() {
  return (
<div id="agent-drawer-backdrop" className="schedule-drawer-backdrop" onClick={() => callApp("closeAgentDrawer")}>
  <div className="schedule-drawer" onClick={(event) => event.stopPropagation()}>
    {/* Drawer Header */}
    <div className="schedule-drawer-header">
      <div className="schedule-drawer-title-box">
        <div className="schedule-drawer-icon">
          <i className="fas fa-folder-open"></i>
        </div>
        <div>
          <h3 id="agent-drawer-title" style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Dossier N° REQ-2026-0891</h3>
          <p id="agent-drawer-date" style={{ fontSize: "0.74rem", color: "var(--text-muted)", margin: 0, marginTop: "2px" }}>Déposé le 11/08/2026 • Agence Assigamé</p>
        </div>
      </div>
      <button type="button" className="modal-close-btn" onClick={() => callApp("closeAgentDrawer")} title="Fermer le volet">
        <i className="fas fa-times"></i>
      </button>
    </div>

    {/* Drawer Body */}
    <div className="schedule-drawer-body">
      {/* 1. Hero Amount & Status Summary Banner */}
      <div className="drawer-hero-banner">
        <div className="drawer-hero-label">Montant Net Demandé</div>
        <div id="agent-drawer-hero-amount" className="drawer-hero-val">2 500 000 FCFA</div>
        <div style={{ marginTop: "10px", display: "flex", gap: "0.5rem", justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
          <span id="agent-drawer-hero-status-container">
            <span id="agent-drawer-hero-status" className="badge badge-submitted">En Traitement</span>
          </span>
          <span id="agent-drawer-hero-mode" className="badge badge-submitted" style={{ fontSize: "0.7rem" }}><i className="fas fa-history"></i> Standard</span>
          <span id="agent-drawer-hero-score-badge" className="badge badge-approved" style={{ fontSize: "0.7rem" }}><i className="fas fa-microchip"></i> Score IA : 84/100</span>
        </div>
      </div>

      {/* 2. Borrower & Contact Panel */}
      <div className="drawer-panel">
        <div className="drawer-panel-header">
          <h4 className="drawer-panel-title">
            <i className="fas fa-user-circle text-primary"></i> Profil Emprunteur & Contact
          </h4>
          <span id="agent-drawer-client-number" className="badge badge-submitted" style={{ fontFamily: "var(--font-family-code)", fontSize: "0.68rem" }}>SN-DKR-008821</span>
        </div>

        <div style={{ display: "flex", gap: "0.85rem", alignItems: "center", marginBottom: "0.85rem", paddingBottom: "0.85rem", borderBottom: "1px dashed var(--border-color)" }}>
          <img id="agent-drawer-client-avatar" src="https://ui-avatars.com/api/?name=Fatou+Ndiaye&background=4f46e5&color=fff" alt="" className="user-avatar" style={{ width: "46px", height: "46px", borderRadius: "var(--radius-md)", flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div id="agent-drawer-client-name" style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text-primary)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>Fatou Ndiaye</div>
            <div id="agent-drawer-client-occupation" style={{ fontSize: "0.76rem", color: "var(--text-muted)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>Commerçante / Grossiste Textiles</div>
          </div>
        </div>

        <div className="drawer-grid-2">
          <div className="drawer-kv">
            <span className="drawer-kv-label"><i className="fas fa-location-dot text-primary mr-1"></i> Localisation</span>
            <span id="agent-drawer-client-location" className="drawer-kv-value">Bamako, Mali</span>
          </div>
          <div className="drawer-kv">
            <span className="drawer-kv-label"><i className="fas fa-phone text-emerald mr-1"></i> Téléphone</span>
            <span id="agent-drawer-client-phone" className="drawer-kv-value" style={{ fontFamily: "var(--font-family-code)" }}>+223 77 45 67 89</span>
          </div>
          <div className="drawer-kv">
            <span className="drawer-kv-label"><i className="fas fa-envelope text-info mr-1"></i> Email</span>
            <span id="agent-drawer-client-email" className="drawer-kv-value" style={{ fontSize: "0.76rem" }}>fatou.ndiaye@gmail.com</span>
          </div>
          <div className="drawer-kv">
            <span className="drawer-kv-label"><i className="fas fa-id-card text-gold mr-1"></i> Conformité KYC</span>
            <span id="agent-drawer-client-kyc" className="badge badge-approved" style={{ fontSize: "0.68rem", alignSelf: "flex-start" }}><i className="fas fa-check-circle"></i> Conforme</span>
          </div>
        </div>

        {/* Quick Contact Action Buttons */}
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.85rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border-color-light, #f1f5f9)" }}>
          <button type="button" className="btn btn-secondary btn-sm" id="agent-drawer-btn-sms" style={{ flex: 1, justifyContent: "center", fontSize: "0.76rem" }}>
            <i className="fas fa-comment-sms text-primary"></i> Relance SMS
          </button>
          <button type="button" className="btn btn-secondary btn-sm" id="agent-drawer-btn-call" style={{ flex: 1, justifyContent: "center", fontSize: "0.76rem" }}>
            <i className="fas fa-phone text-emerald"></i> Appeler
          </button>
        </div>
      </div>

      {/* 3. Financial Capacity & Repayment Schedule Panel */}
      <div className="drawer-panel">
        <div className="drawer-panel-header">
          <h4 className="drawer-panel-title">
            <i className="fas fa-coins text-gold"></i> Paramètres Prêt & Capacité
          </h4>
          <span id="agent-drawer-capacity-badge">
            <span className="badge badge-capacity-sufficient"><i className="fas fa-check-circle"></i> Suffisante</span>
          </span>
        </div>

        <div className="drawer-grid-2" style={{ marginBottom: "0.75rem" }}>
          <div className="drawer-metric-box">
            <div className="drawer-kv-label">Durée Accordée</div>
            <div id="agent-drawer-duration" style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-family-code)" }}>18 Mois</div>
          </div>
          <div className="drawer-metric-box">
            <div className="drawer-kv-label">Mensualité Estimée</div>
            <div id="agent-drawer-monthly-payment" style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--primary-700)", fontFamily: "var(--font-family-code)" }}>500 000 FCFA</div>
          </div>
          <div className="drawer-metric-box">
            <div className="drawer-kv-label">Revenus Mensuels</div>
            <div id="agent-drawer-income" style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-family-code)" }}>1 450 000 FCFA</div>
          </div>
          <div className="drawer-metric-box">
            <div className="drawer-kv-label">Reste à Vivre Net</div>
            <div id="agent-drawer-disposable" style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--cif-emerald-700)", fontFamily: "var(--font-family-code)" }}>780 000 FCFA</div>
          </div>
        </div>

        <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "0.35rem", borderTop: "1px dashed var(--border-color)" }}>
          <span>Charges mensuelles déclarées :</span>
          <strong id="agent-drawer-expenses" style={{ color: "var(--text-primary)", fontFamily: "var(--font-family-code)" }}>670 000 FCFA</strong>
        </div>
      </div>

      {/* 4. Financing Purpose & Collaterals Panel */}
      <div className="drawer-panel">
        <div className="drawer-panel-header">
          <h4 className="drawer-panel-title">
            <i className="fas fa-shield-halved text-emerald"></i> Objet du Prêt & Garanties
          </h4>
          <span id="agent-drawer-guarantee-status" className="badge badge-approved" style={{ fontSize: "0.68rem" }}><i className="fas fa-check"></i> Inspecté sur terrain</span>
        </div>

        <div style={{ background: "var(--bg-surface-secondary)", padding: "0.75rem 0.85rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)", marginBottom: "0.75rem" }}>
          <div style={{ fontSize: "0.7rem", textTransform: "uppercase", fontWeight: 700, color: "var(--text-muted)", marginBottom: "2px" }}>Objet déclaré</div>
          <p id="agent-drawer-purpose" style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-primary)", margin: 0, lineHeight: 1.45 }}>
            Acquisition broyeur industriel et ensacheuse moderne
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem", fontSize: "0.78rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--text-muted)" }}>Type de garantie :</span>
            <strong id="agent-drawer-guarantee-type" style={{ color: "var(--text-primary)" }}>Stock Marchandises & Matériel</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--text-muted)" }}>Description :</span>
            <span id="agent-drawer-guarantee-desc" style={{ fontWeight: 500, textAlign: "right", maxWidth: "60%", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>Broyeur 15kW et ensacheuse</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "0.35rem", borderTop: "1px dashed var(--border-color)" }}>
            <span>Valeur déclarée : <strong id="agent-drawer-guarantee-declared" style={{ color: "var(--text-primary)", fontFamily: "var(--font-family-code)" }}>6 500 000 FCFA</strong></span>
            <span>Expertise terrain : <strong id="agent-drawer-guarantee-verified" style={{ color: "var(--cif-emerald-700)", fontFamily: "var(--font-family-code)" }}>5 800 000 FCFA</strong></span>
          </div>
        </div>
      </div>

      {/* 5. Attached Documents (GED) & OCR Panel */}
      <div className="drawer-panel">
        <div className="drawer-panel-header">
          <h4 className="drawer-panel-title">
            <i className="fas fa-file-contract text-primary"></i> Pièces Justificatives (GED)
          </h4>
          <span id="agent-drawer-docs-count" className="badge badge-submitted" style={{ fontSize: "0.68rem" }}>3 documents</span>
        </div>

        <div id="agent-drawer-docs-list" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {/* Dynamically populated */}
        </div>
      </div>

      {/* 6. Scoring V2 & Recommendation Panel */}
      <div className="drawer-panel">
        <div className="drawer-panel-header">
          <h4 className="drawer-panel-title">
            <i className="fas fa-chart-line text-purple"></i> Scoring  & Décision IA
          </h4>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span id="agent-drawer-score-val" style={{ fontSize: "1.25rem", fontWeight: 800, color: "#518e45", fontFamily: "var(--font-family-code)" }}>84</span>
            <span style={{ fontSize: "0.75rem", color: "var(--text-subtle)" }}>/100</span>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.78rem", marginBottom: "0.65rem" }}>
          <span id="agent-drawer-score-label" className="badge badge-approved" style={{ fontSize: "0.7rem" }}>Risque Faible</span>
          <span style={{ color: "var(--text-muted)" }}>Indice de confiance : <strong id="agent-drawer-confidence-val" style={{ color: "var(--cif-emerald-600)" }}>94%</strong></span>
        </div>

        <div style={{ height: "6px", background: "var(--bg-surface-secondary)", borderRadius: "var(--radius-full)", overflow: "hidden", border: "1px solid var(--border-color)" }}>
          <div id="agent-drawer-score-progress" style={{ width: "84%", height: "100%", background: "linear-gradient(90deg, #518e45, #518e45)", borderRadius: "var(--radius-full)" }}></div>
        </div>
      </div>
    </div>

    {/* Drawer Footer Actions */}
    <div className="schedule-drawer-footer">
      <button type="button" className="btn btn-secondary btn-sm" onClick={() => callApp("closeAgentDrawer")}>
        Fermer
      </button>
      <div id="agent-drawer-footer-actions" style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => { callApp("closeAgentDrawer"); callApp("switchView", 'view-agent-inspections'); }}>
          <i className="fas fa-motorcycle mr-1"></i> Inspections Terrain
        </button>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => { callApp("closeAgentDrawer"); callInteractions("openDossierModal", 1); }}>
          <i className="fas fa-magnifying-glass-chart mr-1"></i> Analyser 360°
        </button>
      </div>
    </div>
  </div>
</div>
  );
}
