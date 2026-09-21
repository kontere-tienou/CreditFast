import { callApp } from '@/shared/ui/legacy';

export function ClientRequestDrawer() {
  return (
<div id="client-request-drawer-backdrop" className="schedule-drawer-backdrop" onClick={(event) => { if (event.target === event.currentTarget) callApp("closeClientRequestDrawer"); }}>
    <div className="schedule-drawer" style={{ maxWidth: "560px" }}>
      {/* Drawer Header */}
      <div className="schedule-drawer-header">
        <div className="schedule-drawer-title-box">
          <div className="schedule-drawer-icon" style={{ background: "var(--cif-primary-50)", color: "var(--cif-primary-600)" }}>
            <i className="fas fa-folder-open"></i>
          </div>
          <div>
            <h3 id="crd-drawer-title" style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>Dossier</h3>
            <p id="crd-drawer-subtitle" style={{ fontSize: "0.76rem", color: "var(--text-muted)", margin: 0 }}>—</p>
          </div>
        </div>
        <button type="button" className="modal-close-btn" onClick={() => callApp("closeClientRequestDrawer")} title="Fermer le volet latéral">
          <i className="fas fa-times"></i>
        </button>
      </div>

      {/* Drawer Body */}
      <div className="schedule-drawer-body">
        {/* Hero Amount & Status Card */}
        <div className="schedule-drawer-hero">
          <div style={{ fontSize: "0.72rem", color: "var(--text-subtle)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px", marginBottom: "4px" }}>
            Montant du Financement Demandé
          </div>
          <div id="crd-drawer-amount" style={{ fontSize: "1.85rem", fontWeight: 800, color: "var(--primary-700)", fontFamily: "var(--font-family-code)" }}>
            —
          </div>
          <div id="crd-drawer-status" style={{ marginTop: "8px" }}>
            <span className="badge badge-submitted">—</span>
          </div>
          <div id="crd-drawer-purpose" style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: "8px", fontWeight: 500 }}>
            —
          </div>
        </div>

        {/* Panel 1: Conditions Financières & Échéances */}
        <div className="drawer-panel">
          <div className="drawer-panel-header">
            <h4 className="drawer-panel-title">
              <i className="fas fa-calculator text-primary"></i> Modalités Financières & Échéances
            </h4>
            <span id="crd-drawer-duration-badge" className="badge badge-submitted">—</span>
          </div>
          <div className="drawer-grid-2">
            <div className="drawer-kv">
              <span className="drawer-kv-label">Durée du Prêt</span>
              <span className="drawer-kv-value" id="crd-drawer-duration-val">—</span>
            </div>
            <div className="drawer-kv">
              <span className="drawer-kv-label">Mensualité tout compris</span>
              <span className="drawer-kv-value" id="crd-drawer-monthly-val" style={{ color: "var(--primary-700)", fontFamily: "var(--font-family-code)" }}>—</span>
            </div>
            {/* <div class="drawer-kv">
              <span class="drawer-kv-label">Taux Dégressif UEMOA</span>
              <span class="drawer-kv-value" id="crd-drawer-rate-val">1.20% / mois</span>
            </div> */}
            <div className="drawer-kv">
              <span className="drawer-kv-label">Assurance Emprunteur</span>
              <span className="drawer-kv-value" id="crd-drawer-insurance-val">—</span>
            </div>
            <div className="drawer-kv">
              <span className="drawer-kv-label">Coût Global du Crédit</span>
              <span className="drawer-kv-value" id="crd-drawer-cost-val" style={{ color: "var(--cif-gold-700)", fontFamily: "var(--font-family-code)" }}>—</span>
            </div>
            <div className="drawer-kv">
              <span className="drawer-kv-label">Versement des Fonds</span>
              <span className="drawer-kv-value" id="crd-drawer-disbursement-val">Mobile Money & Agence</span>
            </div>
          </div>
        </div>

        {/* Panel 2: Parcours d'Instruction & Étapes Clés */}
        <div className="drawer-panel">
          <div className="drawer-panel-header">
            <h4 className="drawer-panel-title">
              <i className="fas fa-route text-primary"></i> Parcours d'Instruction en Direct
            </h4>
            <span id="crd-drawer-step-badge" className="badge badge-submitted" style={{ fontSize: "0.68rem" }}>—</span>
          </div>
          <div id="crd-drawer-stepper-container" style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
            {/* Stepper Dynamic Nodes */}
          </div>
        </div>

        {/* Panel 3: Pièces Justificatives Associées */}
        <div className="drawer-panel">
          <div className="drawer-panel-header">
            <h4 className="drawer-panel-title">
              <i className="fas fa-file-shield text-emerald"></i> Pièces & Justificatifs 
            </h4>
            <span id="crd-drawer-docs-count" className="badge badge-submitted" style={{ fontSize: "0.68rem" }}>0 pièce</span>
          </div>
          <div id="crd-drawer-docs-list" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {/* Dynamic docs list */}
          </div>
        </div>

        {/* Panel 4: Garanties & Sûretés */}
        <div className="drawer-panel">
          <div className="drawer-panel-header">
            <h4 className="drawer-panel-title">
              <i className="fas fa-shield-halved text-warning"></i> Garanties & Sûretés
            </h4>
            <span id="crd-drawer-guar-status" className="badge badge-submitted" style={{ fontSize: "0.68rem" }}>—</span>
          </div>
          <div id="crd-drawer-guar-content" style={{ fontSize: "0.8rem", lineHeight: 1.5, color: "var(--text-secondary)" }}>
            {/* Dynamic guarantee content */}
          </div>
        </div>

        {/* Panel 5: Agence & Conseiller Dédié */}
        <div className="drawer-panel">
          <div className="drawer-panel-header">
            <h4 className="drawer-panel-title">
              <i className="fas fa-user-tie text-primary"></i> Agence & Conseiller Attitré
            </h4>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
            <div className="user-avatar" style={{ width: "44px", height: "44px", borderRadius: "50%", background: "var(--bg-body)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
              <i className="fas fa-user-tie"></i>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--text-primary)" }}>Non assigné</div>
              <div style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>Aucun conseiller n’est encore lié à ce dossier.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Drawer Footer Actions */}
      <div className="schedule-drawer-footer">
        <button type="button" className="btn btn-secondary" onClick={() => callApp("closeClientRequestDrawer")}>
          Fermer
        </button>
        <div id="crd-drawer-footer-actions" style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {/* Dynamic Action Buttons */}
        </div>
      </div>
    </div>
  </div>
  );
}
