import { CfSelect } from '@/shared/ui/CfSelect';
import { callApp } from '@/shared/ui/legacy';

export function InspectionModal() {
  return (
    <>
{/* ====================================================================
     MODAL RAPPORT D'INSPECTION TERRAIN DES GARANTIES (AGENT DE CRÉDIT)
     ==================================================================== */}
<div id="modal-inspection" className="modal-backdrop" style={{ display: "none" }}>
  <div className="modal-dialog" style={{ maxWidth: "650px" }}>
    <div className="modal-header">
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#fef3c7", color: "#ff9800", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem" }}>
          <i className="fas fa-clipboard-check"></i>
        </div>
        <div>
          <h3 className="modal-title" id="modal-insp-title">Rapport d'Inspection Terrain</h3>
          <div style={{ fontSize: "0.75rem", color: "var(--text-subtle)" }} id="modal-insp-subtitle">Contrôle physique, valorisation et solvabilité locale</div>
        </div>
      </div>
      <button type="button" className="modal-close" onClick={() => callApp("closeModal", 'modal-inspection')}>
        <i className="fas fa-xmark"></i>
      </button>
    </div>

    <div className="modal-body">
      <input type="hidden" id="insp-guarantee-id" defaultValue="" />
      
      {/* Guarantee info banner */}
      <div style={{ background: "var(--bg-body)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "0.85rem 1rem", marginBottom: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-primary)" }} id="insp-client-name">—</div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-subtle)" }} id="insp-guarantee-type">—</div>
          </div>
          <span className="badge badge-warning" id="insp-status-badge">À Visiter</span>
        </div>
      </div>

      {/* Form Inputs */}
      <div className="grid-2" style={{ gap: "1rem", marginBottom: "1rem" }}>
        <div className="form-group">
          <label className="form-label" style={{ fontSize: "0.8rem" }}>Valeur Déclarée (FCFA)</label>
          <input type="text" id="insp-declared-val" className="form-control" readOnly style={{ background: "var(--bg-body)", fontWeight: 600 }} />
        </div>
        <div className="form-group">
          <label className="form-label" style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--primary-700)" }}>Valeur Expertisée / Retenue (FCFA) *</label>
          <input type="number" id="insp-verified-val" className="form-control" placeholder="ex: 3400000" style={{ fontWeight: 700, color: "var(--primary-700)", borderColor: "var(--primary-400)" }} />
        </div>
      </div>

      <div className="form-group" style={{ marginBottom: "1rem" }}>
        <label className="form-label" style={{ fontSize: "0.8rem" }}>Localisation & Zone Visité Terrain *</label>
        <input type="text" id="insp-location" className="form-control" placeholder="ex: Grand Marché Bamako, Rue 314 (Boutique physique)" />
      </div>

      <div className="grid-2" style={{ gap: "1rem", marginBottom: "1rem" }}>
        <div className="form-group">
          <label className="form-label" style={{ fontSize: "0.8rem" }}>État Physique & Conservabilité *</label>
          <CfSelect id="insp-condition" className="form-control" defaultValue="BON">
            <option value="EXCELLENT">Excellent état / Neuf ou sous emballage</option>
            <option value="BON">Bon état / Rotation rapide de stock</option>
            <option value="MOYEN">État moyen / Vétusté partielle</option>
            <option value="MAUVAIS">Mauvais état / Risque de dépréciation</option>
          </CfSelect>
        </div>
        <div className="form-group">
          <label className="form-label" style={{ fontSize: "0.8rem" }}>Avis Enquête de Voisinage & Moralité *</label>
          <CfSelect id="insp-reputation" className="form-control" defaultValue="TRES_FAVORABLE">
            <option value="TRES_FAVORABLE">Très favorable (Bonne notoriété au marché)</option>
            <option value="FAVORABLE">Favorable (Activité régulière constatée)</option>
            <option value="RESERVE">Réserves (Activité récente ou intermittente)</option>
          </CfSelect>
        </div>
      </div>

      <div className="form-group" style={{ marginBottom: "1rem" }}>
        <label className="form-label" style={{ fontSize: "0.8rem" }}>Observations Détaillées de l'Agent *</label>
        <textarea id="insp-notes" className="form-control" rows={3} placeholder="Constats effectués sur place, vérification physique des stocks/machines, concordance avec le registre de commerce..." />
      </div>

      {/* Photo upload / mock */}
      <div style={{ border: "2px dashed var(--border-color)", borderRadius: "var(--radius-md)", padding: "0.85rem", textAlign: "center", background: "var(--bg-body)", marginBottom: "1rem" }}>
        <i className="fas fa-camera text-primary" style={{ fontSize: "1.4rem", marginBottom: "0.25rem" }}></i>
        <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-primary)" }}>Photos & Justificatifs Terrain</div>
        <div style={{ fontSize: "0.7rem", color: "var(--text-subtle)" }}>2 photos géolocalisées enregistrées par l'application mobile CreditFast</div>
      </div>
    </div>

    <div className="modal-footer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <button type="button" className="btn btn-secondary" onClick={() => callApp("closeModal", 'modal-inspection')}>Annuler</button>
      <button type="button" className="btn btn-primary" onClick={() => callApp("saveInspectionReport")}>
        <i className="fas fa-check-circle mr-1"></i> Valider le Contrôle Terrain
      </button>
    </div>
  </div>
</div>
    </>
  );
}
