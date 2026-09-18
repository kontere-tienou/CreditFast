import { callApp } from '@/shared/ui/legacy';

export function AnalystDossierDrawer() {
  return (
<div id="analyst-drawer-backdrop" className="schedule-drawer-backdrop" onClick={() => callApp("closeAnalystDossierDrawer")}>
    <div id="analyst-sidedrawer" className="schedule-drawer" onClick={(event) => event.stopPropagation()} aria-label="Volet instruction approfondie analyste risque">
      <div className="schedule-drawer-header">
        <div className="schedule-drawer-header-content">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem", flexWrap: "wrap" }}>
            <span className="badge badge-submitted" id="analyst-drawer-ref-badge" style={{ fontFamily: "var(--font-family-code)", fontWeight: 700 }}>REQ-2026-0891</span>
            <span id="analyst-drawer-model-badge" className="badge badge-warning" style={{ fontSize: "0.68rem" }}><i className="fas fa-seedling"></i> Cold Start</span>
            <span id="analyst-drawer-status-badge" className="badge badge-approved"><i className="fas fa-circle-check"></i> En Analyse</span>
          </div>
          <h3 id="analyst-drawer-title" className="schedule-drawer-title" style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>Fatou Ndiaye</h3>
          <p id="analyst-drawer-subtitle" className="schedule-drawer-subtitle" style={{ fontSize: "0.76rem", color: "var(--text-muted)", margin: 0, marginTop: "2px" }}>Fiche d'Instruction Analytique 360° • Solvabilité, OCR & Risque</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <button type="button" className="btn btn-secondary btn-sm" id="analyst-drawer-toggle-coldstart" onClick={() => callApp("toggleColdStartInDrawer")} title="Basculer la simulation entre Modèle Standard et Cold Start" style={{ fontSize: "0.72rem", padding: "0.3rem 0.6rem" }}>
            <i className="fas fa-seedling text-emerald"></i> Simuler Cold Start
          </button>
          <button type="button" className="modal-close-btn" onClick={() => callApp("closeAnalystDossierDrawer")} title="Fermer le volet">
            <i className="fas fa-times"></i>
          </button>
        </div>
      </div>

      <div className="schedule-drawer-body">
        {/* Hero Score & Solvabilité Banner */}
        <div className="drawer-hero-banner" style={{ background: "linear-gradient(135deg, rgba(27, 67, 50, 0.06), rgba(81, 142, 69, 0.04))", borderColor: "rgba(27, 67, 50, 0.2)", padding: "1rem 1.15rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
            <div style={{ textAlign: "left" }}>
              <div className="drawer-hero-label">Score d'Éligibilité & Risque XAI</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
                <span id="analyst-drawer-score-val" style={{ fontSize: "2rem", fontWeight: 800, color: "var(--primary-700)", fontFamily: "var(--font-family-code)" }}>93</span>
                <span style={{ fontSize: "0.95rem", color: "var(--text-muted)", fontWeight: 600 }}>/100</span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div id="analyst-drawer-risk-tag" className="badge badge-approved" style={{ fontSize: "0.8rem", padding: "0.3rem 0.7rem", marginBottom: "4px" }}>
                <i className="fas fa-shield-halved mr-1"></i> Risque Faible
              </div>
              <div id="analyst-drawer-confidence" style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 600 }}>
                Indice de Confiance : <strong className="text-emerald">95%</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Section 1 : Emprunteur & Capacité Financière Nette */}
        <div className="drawer-panel">
          <div className="drawer-panel-header">
            <h4 className="drawer-panel-title"><i className="fas fa-user-circle text-primary mr-1"></i> Emprunteur & Reste à Vivre</h4>
            <span id="analyst-drawer-client-id" className="badge badge-submitted" style={{ fontSize: "0.68rem" }}>ML-BKO-008821</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.85rem" }}>
            <img id="analyst-drawer-client-avatar" src="https://ui-avatars.com/api/?name=Client&background=4f46e5&color=fff" alt="" className="user-avatar" style={{ width: "44px", height: "44px", borderRadius: "var(--radius-md)", flexShrink: 0 }} />
            <div>
              <div id="analyst-drawer-client-name" style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text-primary)" }}>Fatou Ndiaye</div>
              <div id="analyst-drawer-client-activity" style={{ fontSize: "0.76rem", color: "var(--text-secondary)" }}>Commerçante / Grossiste Textiles • 6 ans d'activité</div>
              <div id="analyst-drawer-client-loc" style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "1px" }}>
                <i className="fas fa-location-dot text-primary mr-1"></i> Bamako (Grand Marché), Mali • Agence Marché Médine
              </div>
            </div>
          </div>

          {/* Équation financière Reste à Vivre */}
          <div style={{ background: "var(--bg-surface-secondary)", padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)", marginBottom: "0.75rem" }}>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.5rem" }}>
              <i className="fas fa-calculator text-primary mr-1"></i> Décomposition de la Capacité Nette
            </div>
            <div className="drawer-grid-2" style={{ marginBottom: "0.5rem" }}>
              <div className="drawer-kv">
                <span className="drawer-kv-label">Revenus Mensuels</span>
                <span id="analyst-drawer-income" className="drawer-kv-value" style={{ color: "#518e45", fontWeight: 700 }}>800 000 FCFA</span>
              </div>
              <div className="drawer-kv">
                <span className="drawer-kv-label">Charges & Dettes</span>
                <span id="analyst-drawer-expenses" className="drawer-kv-value" style={{ color: "#dc2626", fontWeight: 700 }}>380 000 FCFA</span>
              </div>
            </div>
            <div className="drawer-grid-2" style={{ paddingTop: "0.4rem", borderTop: "1px dashed var(--border-color)" }}>
              <div className="drawer-kv">
                <span className="drawer-kv-label">Reste à Vivre Dégagé</span>
                <span id="analyst-drawer-disposable" className="drawer-kv-value" style={{ color: "var(--primary-700)", fontWeight: 800, fontSize: "0.95rem" }}>420 000 FCFA</span>
              </div>
              <div className="drawer-kv">
                <span className="drawer-kv-label">Mensualité Prévue</span>
                <span id="analyst-drawer-installment" className="drawer-kv-value" style={{ fontWeight: 800, fontSize: "0.95rem" }}>235 000 FCFA</span>
              </div>
            </div>
          </div>

          <div id="analyst-drawer-cap-banner" className="capacity-comparison pass" style={{ margin: 0, padding: "0.5rem 0.75rem", borderRadius: "var(--radius-sm)", fontSize: "0.75rem" }}>
            {/* Injected dynamically */}
          </div>
        </div>

        {/* Section 2 : Extraction OCR & Pièces Justificatives GED */}
        <div className="drawer-panel">
          <div className="drawer-panel-header">
            <h4 className="drawer-panel-title"><i className="fas fa-file-invoice text-primary mr-1"></i> Pièces Justificatives & Contrôle OCR</h4>
            <span id="analyst-drawer-docs-count" className="badge badge-submitted" style={{ fontSize: "0.68rem" }}>4 documents</span>
          </div>
          <div id="analyst-drawer-docs-list" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {/* Rendered Docs */}
          </div>
        </div>

        {/* Section 3 : Alertes & Détection des Anomalies */}
        <div className="drawer-panel">
          <div className="drawer-panel-header">
            <h4 className="drawer-panel-title"><i className="fas fa-triangle-exclamation text-warning mr-1"></i> Signaux & Contrôles Automatisés</h4>
            <span id="analyst-drawer-anom-count" className="badge badge-warning" style={{ fontSize: "0.68rem" }}>0 alerte</span>
          </div>
          <div id="analyst-drawer-anomalies-list" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {/* Rendered Anomalies */}
          </div>
        </div>

        {/* Section 4 : Explicabilité & 5 Piliers CreditFast */}
        <div className="drawer-panel">
          <div className="drawer-panel-header">
            <h4 className="drawer-panel-title"><i className="fas fa-scale-balanced text-primary mr-1"></i> Grille d'Explicabilité Multi-Facteurs</h4>
            <span className="badge badge-approved" style={{ fontSize: "0.68rem" }}>Norme CreditFast</span>
          </div>
          <div id="analyst-drawer-factors-list" className="factors-list" style={{ gap: "0.5rem", display: "flex", flexDirection: "column" }}>
            {/* Rendered Factors */}
          </div>
        </div>

        {/* Section 5 : Avis & Recommandation pour le Comité */}
        <div className="drawer-panel">
          <div className="drawer-panel-header">
            <h4 className="drawer-panel-title"><i className="fas fa-pen-to-square text-emerald mr-1"></i> Recommandation de l'Analyste</h4>
            <span className="badge badge-submitted" style={{ fontSize: "0.68rem" }}>Comité d'Octroi</span>
          </div>
          <div className="form-group" style={{ marginBottom: "0.75rem" }}>
            <label className="form-label" style={{ fontSize: "0.75rem" }}>Avis Consultatif</label>
            <select id="analyst-drawer-reco-select" className="form-control" style={{ fontSize: "0.8rem" }}>
              <option value="FAVORABLE">Favorable pour passage en Comité</option>
              <option value="RESERVE">Favorable sous réserve de compléments</option>
              <option value="DEFAVORABLE">Défavorable (Risque trop élevé)</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: "0.75rem" }}>Note d'Analyse Synthétique</label>
            <textarea id="analyst-drawer-notes-input" className="form-control" rows={2} style={{ fontSize: "0.78rem" }} placeholder="Synthèse pour les membres du comité..." defaultValue={"Capacité de remboursement vérifiée et confirmée. Activité commerciale mature et régulière sur le marché de Bamako. Pièces justificatives et factures proforma validées."} />
          </div>
        </div>
      </div>

      {/* Sidedrawer Footer Actions */}
      <div className="schedule-drawer-footer">
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => callApp("closeAnalystDossierDrawer")}>
          <i className="fas fa-times mr-1"></i> Fermer
        </button>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => callApp("requestComplementFromAnalystDrawer")} title="Demander une contre-expertise terrain ou un document complémentaire">
            <i className="fas fa-motorcycle text-warning mr-1"></i> Complément Terrain
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => callApp("submitAnalystReviewFromDrawer")}>
            <i className="fas fa-paper-plane mr-1"></i> Transmettre au Comité
          </button>
        </div>
      </div>
    </div>
  </div>
  );
}
