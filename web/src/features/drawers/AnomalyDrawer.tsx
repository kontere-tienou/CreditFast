import { callApp } from '@/shared/ui/legacy';

export function AnomalyDrawer() {
  return (
<div id="anomaly-drawer-backdrop" className="schedule-drawer-backdrop" onClick={() => callApp("closeAnomalyDrawer")}>
    <div id="anomaly-sidedrawer" className="schedule-drawer" onClick={(event) => event.stopPropagation()} aria-label="Volet diagnostic approfondi anomalie risque">
      <div className="schedule-drawer-header">
        <div className="schedule-drawer-header-content">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem", flexWrap: "wrap" }}>
            <span className="badge badge-submitted" id="anom-drawer-ref-badge" style={{ fontFamily: "var(--font-family-code)", fontWeight: 700 }}>REQ-2026-0893</span>
            <span id="anom-drawer-sev-badge" className="badge badge-rejected"><i className="fas fa-circle-exclamation mr-1"></i> Critique</span>
            <span id="anom-drawer-status-badge" className="badge badge-verification"><i className="fas fa-clock mr-1"></i> Ouvert</span>
          </div>
          <h3 id="anom-drawer-title" className="schedule-drawer-title" style={{ fontSize: "1.08rem", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>Point de contrôle</h3>
          <p id="anom-drawer-subtitle" className="schedule-drawer-subtitle" style={{ fontSize: "0.76rem", color: "var(--text-muted)", margin: 0, marginTop: "2px" }}>—</p>
          <input type="hidden" id="anom-drawer-id" defaultValue="" />
        </div>
        <button type="button" className="modal-close-btn" onClick={() => callApp("closeAnomalyDrawer")} title="Fermer le volet">
          <i className="fas fa-times"></i>
        </button>
      </div>

      <div className="schedule-drawer-body">
        {/* Hero Diagnostic & Engine Banner */}
        <div className="drawer-hero-banner" id="anom-drawer-hero-banner" style={{ background: "linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(255, 152, 0, 0.05))", borderColor: "rgba(239, 68, 68, 0.25)", padding: "0.9rem 1.15rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
            <div>
              <div className="drawer-hero-label" id="anom-drawer-type-label">Type d'Anomalie Détectée</div>
              <div id="anom-drawer-type-name" style={{ fontSize: "1.15rem", fontWeight: 800, color: "#b91c1c" }}>—</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <span id="anom-drawer-engine-badge" className="badge" style={{ background: "rgba(27, 67, 50, 0.1)", color: "#1b4332", border: "1px solid rgba(27, 67, 50, 0.3)", fontSize: "0.74rem" }}>
                <i className="fas fa-clipboard-check mr-1"></i> Contrôle dossier 
              </span>
              <div id="anom-drawer-detected-date" style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "3px" }}>
                Détecté le 14/08/2026 à 11:12
              </div>
            </div>
          </div>
        </div>

        {/* Section 1 : Emprunteur & Dossier Associé */}
        <div className="drawer-panel">
          <div className="drawer-panel-header">
            <h4 className="drawer-panel-title"><i className="fas fa-user-circle text-primary mr-1"></i> Emprunteur & Demande Associée</h4>
            <button type="button" className="btn btn-secondary btn-sm" id="anom-drawer-btn-view-dossier" onClick={() => callApp("openDossierFromAnomalyDrawer")} style={{ fontSize: "0.72rem", padding: "0.25rem 0.55rem" }}>
              <i className="fas fa-magnifying-glass-chart mr-1"></i> Dossier 360°
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
            <img id="anom-drawer-client-avatar" src="https://ui-avatars.com/api/?name=Client&background=4f46e5&color=fff" alt="" className="user-avatar" style={{ width: "42px", height: "42px", borderRadius: "var(--radius-md)", flexShrink: 0 }} />
            <div>
              <div id="anom-drawer-client-name" style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text-primary)" }}>Kodjo Mensah</div>
              <div id="anom-drawer-client-loc" style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}><i className="fas fa-location-dot text-primary mr-1"></i> Bamako, Mali</div>
            </div>
          </div>
          <div className="drawer-grid-2">
            <div className="drawer-kv">
              <span className="drawer-kv-label">Montant du Crédit</span>
              <span id="anom-drawer-loan-amount" className="drawer-kv-value" style={{ color: "var(--primary-700)", fontFamily: "var(--font-family-code)", fontWeight: 700 }}>1 800 000 FCFA</span>
            </div>
            <div className="drawer-kv">
              <span className="drawer-kv-label">Score Risque Actuel</span>
              <span id="anom-drawer-risk-score" className="drawer-kv-value" style={{ fontWeight: 800, color: "#dc2626" }}>31 / 100</span>
            </div>
          </div>
        </div>

        {/* Section 2 : Diagnostic Détaillé & Rapprochement */}
        <div className="drawer-panel">
          <div className="drawer-panel-header">
            <h4 className="drawer-panel-title"><i className="fas fa-magnifying-glass-chart text-warning mr-1"></i> Rapprochement & Constats</h4>
            <span id="anom-drawer-category-badge" className="badge badge-submitted">Contrôle des pièces</span>
          </div>
          
          <div style={{ marginBottom: "0.75rem" }}>
            <label className="form-label" style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Description du Risque Identifié</label>
            <p id="anom-drawer-desc" style={{ background: "var(--bg-surface-secondary)", padding: "0.7rem 0.85rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)", fontSize: "0.78rem", color: "var(--text-primary)", margin: 0, lineHeight: 1.45 }}>
              La lecture automatique a signalé un écart sur cette pièce. Vérifiez le dossier avant de transmettre.
            </p>
          </div>

          <div className="drawer-grid-2" style={{ marginBottom: "0.5rem" }}>
            <div className="drawer-metric-box" style={{ borderLeft: "3px solid #dc2626" }}>
              <div className="drawer-kv-label" style={{ color: "#dc2626", fontWeight: 700 }}><i className="fas fa-xmark mr-1"></i> Valeur Détectée (Anormale)</div>
              <div id="anom-drawer-val-detected" style={{ fontSize: "0.88rem", fontWeight: 700, color: "#b91c1c", fontFamily: "var(--font-family-code)", marginTop: "3px" }}>12/01/2025</div>
            </div>
            <div className="drawer-metric-box" style={{ borderLeft: "3px solid #518e45" }}>
              <div className="drawer-kv-label" style={{ color: "#518e45", fontWeight: 700 }}><i className="fas fa-check mr-1"></i> Valeur Attendue / Norme</div>
              <div id="anom-drawer-val-expected" style={{ fontSize: "0.88rem", fontWeight: 700, color: "#1b4332", fontFamily: "var(--font-family-code)", marginTop: "3px" }}>Moins de 30 jours (&lt; 16/07/2026)</div>
            </div>
          </div>
        </div>

        {/* Section 3 : Pièce Justificative GED Associée */}
        <div className="drawer-panel" id="anom-drawer-doc-panel">
          <div className="drawer-panel-header">
            <h4 className="drawer-panel-title"><i className="fas fa-file-invoice text-info mr-1"></i> Pièce concernée</h4>
            <span id="anom-drawer-doc-ocr-score" className="badge badge-submitted">Lecture automatique</span>
          </div>
          <div id="anom-drawer-doc-content" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.6rem 0.75rem", background: "var(--bg-surface-secondary)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <i className="fas fa-file-pdf text-danger" style={{ fontSize: "1.25rem" }}></i>
              <div>
                <div id="anom-drawer-doc-name" style={{ fontWeight: 700, fontSize: "0.82rem", color: "var(--text-primary)" }}>Facture Proforma Outillage.pdf</div>
                <div id="anom-drawer-doc-type" style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Type : FACTURE • Rattaché le 14/08/2026</div>
              </div>
            </div>
            <span id="anom-drawer-doc-status" className="badge badge-warning">À rectifier</span>
          </div>
        </div>

        {/* Section 4 : Traitement Contradictoire & Décision */}
        <div className="drawer-panel">
          <div className="drawer-panel-header">
            <h4 className="drawer-panel-title"><i className="fas fa-pen-to-square text-emerald mr-1"></i> Résolution & Justification</h4>
            <span id="anom-drawer-resolution-badge" className="badge badge-verification">En Attente</span>
          </div>
          
          <div id="anom-drawer-resolved-info" style={{ display: "none", background: "rgba(81, 142, 69, 0.08)", padding: "0.75rem", borderRadius: "var(--radius-sm)", border: "1px solid rgba(81, 142, 69, 0.25)", marginBottom: "0.75rem" }}>
            <div style={{ fontSize: "0.75rem", color: "#1b4332", fontWeight: 700, marginBottom: "3px" }}>
              <i className="fas fa-check-circle mr-1"></i> Signalement Levé & Régularisé
            </div>
            <p id="anom-drawer-resolved-comment" style={{ fontSize: "0.74rem", color: "var(--text-primary)", margin: 0, lineHeight: 1.4 }}>
              Contrôle contradictoire effectué. Pièce rectifiée intégrée.
            </p>
            <div id="anom-drawer-resolved-meta" style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: "4px" }}>
              Levée par Analyste Risque #1 le 17/08/2026
            </div>
          </div>

          <div id="anom-drawer-form-resolution">
            <div className="form-group" style={{ marginBottom: "0.75rem" }}>
              <label className="form-label" style={{ fontSize: "0.75rem" }}>Commentaire d'Instruction / Motif de Levée</label>
              <textarea id="anom-drawer-comment-input" className="form-control" rows={2} style={{ fontSize: "0.78rem" }} placeholder="Indiquez le constat contradictoire ou la justification de levée..." />
            </div>
          </div>
        </div>
      </div>

      {/* Sidedrawer Footer Actions */}
      <div className="schedule-drawer-footer">
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => callApp("closeAnomalyDrawer")}>
          <i className="fas fa-times mr-1"></i> Fermer
        </button>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button type="button" className="btn btn-secondary btn-sm" id="anom-drawer-btn-field" onClick={() => { callApp("closeAnomalyDrawer"); callApp("openAnalystDossierDrawer"); }}>
            <i className="fas fa-magnifying-glass-chart mr-1"></i> Ouvrir l'analyse
          </button>
          <button type="button" className="btn btn-primary btn-sm" id="anom-drawer-btn-resolve" onClick={() => callApp("resolveAnomalyFromDrawer")}>
            <i className="fas fa-check mr-1"></i> Lever le point
          </button>
        </div>
      </div>
    </div>
  </div>
  );
}
