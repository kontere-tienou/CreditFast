import { callApp } from '@/shared/ui/legacy';

export function InspectionDrawer() {
  return (
<div id="inspection-drawer-backdrop" className="schedule-drawer-backdrop" onClick={() => callApp("closeInspectionDrawer")}>
    <div id="inspection-sidedrawer" className="schedule-drawer" onClick={(event) => event.stopPropagation()} aria-label="Volet détail inspection et caution">
      <div className="schedule-drawer-header">
        <div className="schedule-drawer-header-content">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
            <span className="badge badge-submitted" id="insp-drawer-type-badge"><i className="fas fa-shield"></i> Garantie</span>
            <span id="insp-drawer-status-badge" className="badge badge-approved"><i className="fas fa-check"></i> Validée</span>
          </div>
          <h3 id="insp-drawer-title" className="schedule-drawer-title" style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Inspection</h3>
          <p id="insp-drawer-subtitle" className="schedule-drawer-subtitle" style={{ fontSize: "0.76rem", color: "var(--text-muted)", margin: 0, marginTop: "2px" }}>Contrôle physique, valorisation et garanties</p>
        </div>
        <button type="button" className="modal-close-btn" onClick={() => callApp("closeInspectionDrawer")} title="Fermer le volet">
          <i className="fas fa-times"></i>
        </button>
      </div>

      <div className="schedule-drawer-body">
        {/* Section 1 : Emprunteur & Dossier */}
        <div className="drawer-panel">
          <div className="drawer-panel-header">
            <h4 className="drawer-panel-title"><i className="fas fa-user-circle text-primary mr-1"></i> Emprunteur Associé</h4>
            <span id="insp-drawer-req-num" className="badge badge-submitted" style={{ fontFamily: "var(--font-family-code)", fontSize: "0.7rem" }}>—</span>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "0.75rem" }}>
            <img id="insp-drawer-client-avatar" src="https://ui-avatars.com/api/?name=Client&background=4f46e5&color=fff" alt="" className="user-avatar" style={{ width: "44px", height: "44px", borderRadius: "var(--radius-md)", flexShrink: 0 }} />
            <div style={{ minWidth: 0 }}>
              <div id="insp-drawer-client-name" style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text-primary)" }}>Demandeur</div>
              <div id="insp-drawer-client-loc" style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>—</div>
            </div>
          </div>
          <div className="drawer-grid-2">
            <div className="drawer-kv">
              <span className="drawer-kv-label">Montant du Prêt</span>
              <span id="insp-drawer-loan-amount" className="drawer-kv-value" style={{ color: "var(--primary-700)", fontFamily: "var(--font-family-code)", fontWeight: 700 }}>—</span>
            </div>
            <div className="drawer-kv">
              <span className="drawer-kv-label">Taux Couverture Garantie</span>
              <span id="insp-drawer-coverage-ratio" className="drawer-kv-value" style={{ color: "#518e45", fontWeight: 700 }}>140%</span>
            </div>
          </div>
        </div>

        {/* Section 2 : Valorisation Financière & Expertise */}
        <div className="drawer-panel">
          <div className="drawer-panel-header">
            <h4 className="drawer-panel-title"><i className="fas fa-scale-balanced text-warning mr-1"></i> Expertise Financière</h4>
            <span id="insp-drawer-eval-status" className="badge badge-approved">Conforme</span>
          </div>
          <div className="drawer-grid-2" style={{ marginBottom: "0.75rem" }}>
            <div className="drawer-metric-box">
              <div className="drawer-kv-label">Valeur Déclarée Client</div>
              <div id="insp-drawer-val-declared" style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-family-code)" }}>3 500 000 F</div>
            </div>
            <div className="drawer-metric-box">
              <div className="drawer-kv-label">Valeur Retenue Expert</div>
              <div id="insp-drawer-val-verified" style={{ fontSize: "0.95rem", fontWeight: 800, color: "#1b4332", fontFamily: "var(--font-family-code)" }}>3 400 000 F</div>
            </div>
          </div>
          <div style={{ background: "var(--bg-body)", padding: "0.65rem 0.85rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)", fontSize: "0.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
              <span style={{ color: "var(--text-muted)" }}>Décote / Dépréciation appliquée :</span>
              <strong id="insp-drawer-discount-pct" style={{ color: "var(--text-primary)" }}>3.0%</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>Gage enregistré au RCCM :</span>
              <span className="badge badge-approved" style={{ fontSize: "0.65rem" }}><i className="fas fa-check"></i> Acte Enregistré</span>
            </div>
          </div>
        </div>

        {/* Section 3 : Constats & Détails Terrain */}
        <div className="drawer-panel">
          <div className="drawer-panel-header">
            <h4 className="drawer-panel-title"><i className="fas fa-clipboard-list text-info mr-1"></i> Constats sur Site</h4>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: "0.78rem" }}>
            <div className="drawer-kv">
              <span className="drawer-kv-label">Description Complète du Bien</span>
              <span id="insp-drawer-desc" className="drawer-kv-value" style={{ fontWeight: 600, color: "var(--text-primary)" }}>Stock de 450 rouleaux de tissus Wax Super-Bazin et dentelles importées</span>
            </div>
            <div className="drawer-kv">
              <span className="drawer-kv-label">Localisation Exacte</span>
              <span id="insp-drawer-location" className="drawer-kv-value">Grand Marché de Bamako, Rue 314, Boutique 12</span>
            </div>
            <div className="drawer-grid-2">
              <div className="drawer-kv">
                <span className="drawer-kv-label">État & Conservabilité</span>
                <span id="insp-drawer-condition" className="badge badge-approved" style={{ alignSelf: "flex-start" }}>Bon état / Rotation rapide</span>
              </div>
              <div className="drawer-kv">
                <span className="drawer-kv-label">Avis Enquête Voisinage</span>
                <span id="insp-drawer-reputation" className="badge badge-submitted" style={{ alignSelf: "flex-start" }}>Très Favorable</span>
              </div>
            </div>
            <div className="drawer-kv">
              <span className="drawer-kv-label">Observations Détaillées de l'Agent</span>
              <p id="insp-drawer-notes" style={{ background: "var(--bg-body)", padding: "0.6rem 0.8rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)", fontSize: "0.75rem", color: "var(--text-primary)", margin: 0, lineHeight: 1.45 }}>
                Visite sur site effectuée le 14/08/2026. Stock physique vérifié, conforme aux factures d'achat et aux déclarations du registre d'inventaire.
              </p>
            </div>
          </div>
        </div>

        {/* Section 4 : Justificatifs & Photos Terrain */}
        <div className="drawer-panel">
          <div className="drawer-panel-header">
            <h4 className="drawer-panel-title"><i className="fas fa-camera text-emerald mr-1"></i> Pièces & Preuves Terrain</h4>
            <span className="badge badge-submitted">2 Photos Géolocalisées</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
            <div style={{ border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", padding: "0.5rem", textAlign: "center", background: "var(--bg-body)" }}>
              <i className="fas fa-image text-primary" style={{ fontSize: "1.5rem", marginBottom: "0.25rem", display: "block" }}></i>
              <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--text-primary)", display: "block" }}>Vue_Ensemble_Stock.jpg</span>
              <span style={{ fontSize: "0.65rem", color: "var(--text-subtle)" }}>Horodatée GPS 12.6392°N</span>
            </div>
            <div style={{ border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", padding: "0.5rem", textAlign: "center", background: "var(--bg-body)" }}>
              <i className="fas fa-file-contract text-warning" style={{ fontSize: "1.5rem", marginBottom: "0.25rem", display: "block" }}></i>
              <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--text-primary)", display: "block" }}>Acte_Gage_RCCM.pdf</span>
              <span style={{ fontSize: "0.65rem", color: "var(--text-subtle)" }}>Signé & Enregistré</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sidedrawer Footer Actions */}
      <div className="schedule-drawer-footer">
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => callApp("closeInspectionDrawer")}>Fermer</button>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button type="button" id="insp-drawer-btn-edit" className="btn btn-primary btn-sm" onClick={() => callApp("openInspectionModalFromDrawer")}>
            <i className="fas fa-pen-to-square mr-1"></i> Modifier / Ré-inspecter
          </button>
        </div>
      </div>
    </div>
  </div>
  );
}
