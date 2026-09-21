import { CfSelect } from '@/shared/ui/CfSelect';
import { callApp } from '@/shared/ui/legacy';

export function SettingsModal() {
  return (
    <>
{/* ==========================================================================
     7. MODAL: PARAMÈTRES & PRÉFÉRENCES UTILISATEUR (SETTINGS)
     ========================================================================== */}
<div id="settings-modal" className="modal-backdrop" style={{ display: "none" }}>
  <div className="modal-dialog">
    <div className="modal-header">
      <div>
        <h3 style={{ fontSize: "1.15rem", marginBottom: "2px" }}>
          <i className="fas fa-sliders-h text-primary mr-1"></i> Paramètres & Préférences
        </h3>
        <p style={{ fontSize: "0.78rem", color: "var(--text-subtle)" }}>Personnalisez votre environnement de travail CIF</p>
      </div>
      <button type="button" className="modal-close-btn" onClick={() => callApp("closeSettingsModal")}>&times;</button>
    </div>

    <div className="modal-body">
      {/* Section 1: Thème & Apparence */}
      <div className="settings-group" style={{ marginBottom: "1.25rem" }}>
        <label className="form-label" style={{ fontWeight: 700, fontSize: "0.85rem", marginBottom: "0.5rem" }}>
          <i className="fas fa-palette text-primary mr-1"></i> Apparence & Thème
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.75rem" }}>
          <div className="settings-theme-option" id="opt-theme-light" onClick={() => callApp("setTheme", 'light')} style={{ border: "2px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "0.75rem", textAlign: "center", cursor: "pointer", transition: "all 0.2s" }}>
            <i className="fas fa-sun text-warning" style={{ fontSize: "1.4rem", marginBottom: "0.35rem", display: "block" }}></i>
            <span style={{ fontWeight: 600, fontSize: "0.82rem" }}>Mode Clair</span>
          </div>
          <div className="settings-theme-option" id="opt-theme-dark" onClick={() => callApp("setTheme", 'dark')} style={{ border: "2px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "0.75rem", textAlign: "center", cursor: "pointer", transition: "all 0.2s" }}>
            <i className="fas fa-moon text-primary" style={{ fontSize: "1.4rem", marginBottom: "0.35rem", display: "block" }}></i>
            <span style={{ fontWeight: 600, fontSize: "0.82rem" }}>Mode Sombre</span>
          </div>
        </div>
      </div>

      {/* Section 2: Fuseau Horaire & Région UEMOA */}
      <div className="settings-group" style={{ marginBottom: "1.25rem" }}>
        <label className="form-label" style={{ fontWeight: 700, fontSize: "0.85rem", marginBottom: "0.5rem" }}>
          <i className="fas fa-globe-africa text-emerald mr-1"></i> Fuseau Horaire & Pays par Défaut
        </label>
        <div className="form-row">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: "0.75rem" }}>Pays / Caisse d'attache</label>
            <CfSelect id="setting-country" className="form-control" defaultValue="ML" onChange={(event) => callApp("updateUserCountry", event.currentTarget.value)}>
              <option value="ML">Mali (Bamako - Direction Régionale)</option>
            </CfSelect>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: "0.75rem" }}>Fuseau Horaire</label>
            <input type="text" className="form-control" defaultValue="GMT+00:00 (Heure UEMOA)" readOnly style={{ background: "var(--bg-surface-secondary)" }} />
          </div>
        </div>
      </div>

      {/* Section 3: Notifications & Alertes */}
      <div className="settings-group">
        <label className="form-label" style={{ fontWeight: 700, fontSize: "0.85rem", marginBottom: "0.5rem" }}>
          <i className="fas fa-bell text-warning mr-1"></i> Préférences de Notification
        </label>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "0.82rem", cursor: "pointer" }}>
            <input type="checkbox" id="setting-notif-alerts" defaultChecked style={{ accentColor: "var(--primary-500)", width: "16px", height: "16px" }} />
            <span>Alertes lorsqu’une pièce n’est pas conforme</span>
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "0.82rem", cursor: "pointer" }}>
            <input type="checkbox" id="setting-notif-sound" defaultChecked style={{ accentColor: "var(--primary-500)", width: "16px", height: "16px" }} />
            <span>Notification sonore discrète lors de la convocation au comité</span>
          </label>
        </div>
      </div>
    </div>

    <div className="modal-footer">
      <button type="button" className="btn btn-secondary btn-sm" onClick={() => callApp("closeSettingsModal")}>Fermer</button>
      <button type="button" className="btn btn-primary btn-sm" onClick={() => callApp("saveSettings")}>
        <i className="fas fa-check mr-1"></i> Enregistrer Préférences
      </button>
    </div>
  </div>
</div>
    </>
  );
}
