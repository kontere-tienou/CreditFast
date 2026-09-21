import type { CSSProperties } from 'react';
import { CfSelect } from '@/shared/ui/CfSelect';
import { callInteractions } from '@/shared/ui/legacy';

export function AnalystDossierModal() {
  return (
    <>
{/* ==========================================================================
     4. MODAL: 360° RISK ANALYST & OCR INSPECTOR (SCORING V2 & COLD START)
     ========================================================================== */}
<div id="dossier-modal" className="modal-backdrop">
  <div className="modal-dialog modal-xl">
    <div className="modal-header">
      <div>
        <h3 style={{ fontSize: "1.15rem", marginBottom: "2px" }}>
          <i className="fas fa-folder-open text-primary mr-1"></i> Dossier <span id="modal-dossier-ref">REQ-2026-0891</span>
        </h3>
        <p style={{ fontSize: "0.78rem", color: "var(--text-subtle)" }} id="modal-client-location">Bamako, Mali • ML-BKO-008821</p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }} id="modal-header-actions">
        <button type="button" className="btn btn-secondary btn-sm" id="modal-cold-start-btn" onClick={() => callInteractions("toggleColdStartInModal")} title="Basculer la simulation entre Modèle Standard et Cold Start">
          <i className="fas fa-seedling text-emerald"></i> Simuler Cold Start
        </button>
        <button type="button" className="modal-close-btn" onClick={() => callInteractions("closeModal", 'dossier-modal')}>&times;</button>
      </div>
    </div>

    <div className="modal-body">
      {/* Active Model & Confidence Badge Bar */}
      <div id="modal-model-badge" style={{ marginBottom: "0.85rem" }}></div>

      {/* Top Overview Bar */}
      <div className="capacity-card" style={{ marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
          <div>
            <h4 id="modal-client-name" style={{ fontSize: "1.2rem", color: "var(--text-main)" }}>Fatou Ndiaye</h4>
            <div style={{ fontSize: "0.78rem", color: "var(--text-subtle)" }}>Commerçante / Grossiste Textiles • 6 ans d'activité</div>
          </div>
          <div className="score-main-display" style={{ padding: "0.75rem 1.25rem" }}>
            <div className="score-gauge" id="modal-score-gauge" style={{ width: "70px", height: "70px", ['--score-deg']: "0deg" } as CSSProperties}>
              <div className="score-gauge-inner" style={{ width: "54px", height: "54px" }}>
                <div className="score-number" id="modal-score-val" style={{ fontSize: "1.2rem" }}>0</div>
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>Score Explicable V2</div>
              <div className="score-risk-tag" id="modal-score-risk-tag">Calcul en cours...</div>
            </div>
          </div>
        </div>

        {/* Financial Capacity Breakdown Equation */}
        <div className="capacity-equation">
          <div className="capacity-item">
            <div className="val" id="cap-income">800 000 FCFA</div>
            <div className="lbl">Revenus Totaux</div>
          </div>
          <div className="capacity-op">-</div>
          <div className="capacity-item">
            <div className="val" id="cap-expenses">380 000 FCFA</div>
            <div className="lbl">Charges & Dettes</div>
          </div>
          <div className="capacity-op">=</div>
          <div className="capacity-item capacity-result">
            <div className="val" id="cap-disposable">420 000 FCFA</div>
            <div className="lbl">Reste à Vivre</div>
          </div>
          <div className="capacity-op">vs</div>
          <div className="capacity-item">
            <div className="val" id="cap-installment">235 000 FCFA</div>
            <div className="lbl">Mensualité Prêt</div>
          </div>
        </div>

        <div id="cap-banner" className="capacity-comparison pass">
          {/* Dynamically Injected */}
        </div>
      </div>

      {/* Main Tabs / 2-Column Inspector */}
      <div className="ocr-grid">
        {/* Left: Supporting Docs & Human Verification */}
        <div>
          <h4 style={{ fontSize: "0.95rem", marginBottom: "0.75rem" }}>
            <i className="fas fa-file-invoice text-primary mr-1"></i> Pièces justificatives & lecture automatique
          </h4>
          <div id="modal-docs-list">
            {/* Documents Rendered Dynamically */}
          </div>

          {/* Anomalies Detected */}
          <h4 style={{ fontSize: "0.95rem", margin: "1.25rem 0 0.75rem" }}>
            <i className="fas fa-triangle-exclamation text-warning mr-1"></i> Contrôles Automatisés & Signaux
          </h4>
          <div id="modal-anomalies-list">
            {/* Anomalies Rendered Dynamically */}
          </div>
        </div>

        {/* Right: Explainable Multi-Factor Scoring & Recommendation */}
        <div>
          <h4 style={{ fontSize: "0.95rem", marginBottom: "0.75rem" }}>
            <i className="fas fa-scale-balanced text-primary mr-1"></i> Grille d'Explicabilité & Facteurs (Norme CreditFast)
          </h4>
          
          {/* Synthetic Matrix (Page 4 de la Note de Présentation) */}
          <div id="modal-scoring-synthesis-box" style={{ marginBottom: "1rem" }}>
            {/* Rendered Dynamically by JS */}
          </div>

          <div style={{ height: "170px", marginBottom: "1rem" }}>
            <canvas id="modal-radar-canvas"></canvas>
          </div>

          <div id="modal-factors-list" className="factors-list">
            {/* Factors Rendered Dynamically */}
          </div>

          {/* Role-Adapted Decision / Tracking Box */}
          <div id="modal-role-action-container">
            <div className="card" style={{ marginTop: "1.25rem", background: "var(--surface-card-subtle)" }}>
              <div className="card-body" style={{ padding: "1rem" }}>
                <h5 style={{ fontSize: "0.88rem", marginBottom: "0.5rem" }}><i className="fas fa-pen-to-square text-primary"></i> Avis & Recommandation de l'Analyste</h5>
                <div className="form-group" style={{ marginBottom: "0.75rem" }}>
                  <label className="form-label">Avis Consultatif</label>
                  <CfSelect id="analyst-reco-select" className="form-control">
                    <option value="FAVORABLE">Favorable pour passage en Comité</option>
                    <option value="RESERVE">Favorable sous réserve de compléments</option>
                    <option value="DEFAVORABLE">Défavorable (Risque trop élevé)</option>
                  </CfSelect>
                </div>
                <div className="form-group" style={{ marginBottom: "0.75rem" }}>
                  <label className="form-label">Note d'analyse de synthèse</label>
                  <textarea id="analyst-notes-input" className="form-control" rows={2} placeholder="Synthèse pour le comité de crédit..." defaultValue={"Capacité de remboursement vérifiée. Activité mature et stable. Documents proforma contrôlés avec succès."} />
                </div>
                <button type="button" className="btn btn-primary btn-block" style={{ width: "100%" }} onClick={() => callInteractions("submitAnalystReview")}>
                  <i className="fas fa-paper-plane"></i> Transmettre au Comité de Crédit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
    </>
  );
}
