import { callApp } from '@/shared/ui/legacy';

export function ScheduleDrawer() {
  return (
<div id="schedule-drawer-backdrop" className="schedule-drawer-backdrop" onClick={() => callApp("closeScheduleDrawer")}>
  <div className="schedule-drawer" onClick={(event) => event.stopPropagation()}>
    {/* Drawer Header */}
    <div className="schedule-drawer-header">
      <div className="schedule-drawer-title-box">
        <div className="schedule-drawer-icon">
          <i className="fas fa-receipt"></i>
        </div>
        <div>
          <h3 id="drawer-installment-title" style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0 }}>Échéance</h3>
          <p id="drawer-installment-date" style={{ fontSize: "0.76rem", color: "var(--text-muted)", margin: 0 }}>—</p>
        </div>
      </div>
      <button type="button" className="modal-close-btn" onClick={() => callApp("closeScheduleDrawer")} title="Fermer le volet">
        <i className="fas fa-times"></i>
      </button>
    </div>

    {/* Drawer Body */}
    <div className="schedule-drawer-body">
      {/* Hero Amount & Status Card */}
      <div className="schedule-drawer-hero">
        <div style={{ fontSize: "0.72rem", color: "var(--text-subtle)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px", marginBottom: "4px" }}>
          Montant Net de la Mensualité
        </div>
        <div id="drawer-hero-amount" style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--primary-700)", fontFamily: "var(--font-family-code)" }}>
          —
        </div>
        <div id="drawer-hero-status" style={{ marginTop: "8px" }}>
          <span className="badge badge-submitted">—</span>
        </div>
      </div>

      {/* Financial Breakdown Card */}
      <div className="card" style={{ padding: "1.25rem" }}>
        <h4 style={{ fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-muted)", marginBottom: "1rem" }}>
          <i className="fas fa-chart-pie text-primary mr-1"></i> Décomposition Financière
        </h4>
        
        {/* Segmented Visual Bar */}
        <div style={{ height: "10px", background: "var(--bg-body)", borderRadius: "var(--radius-full)", overflow: "hidden", display: "flex", marginBottom: "1rem", border: "1px solid var(--border-color)" }}>
          <div id="drawer-bar-principal" style={{ width: "85%", background: "var(--cif-primary-600)" }} title="Capital principal"></div>
          <div id="drawer-bar-interest" style={{ width: "9%", background: "var(--cif-gold-500)" }} title="Intérêts CreditFast"></div>
          <div id="drawer-bar-insurance" style={{ width: "6%", background: "var(--cif-emerald-500)" }} title="Assurance prêt"></div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem", fontSize: "0.82rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "0.5rem", borderBottom: "1px dashed var(--border-color)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "var(--cif-primary-600)" }}></span>
              <span>Capital Principal Amorti</span>
            </span>
            <strong id="drawer-val-principal" style={{ fontFamily: "var(--font-family-code)" }}>—</strong>
          </div>

          {/* <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 0.5rem; border-bottom: 1px dashed var(--border-color);">
            <span style="display: flex; align-items: center; gap: 6px;">
              <span style="width: 10px; height: 10px; border-radius: 50%; background: var(--cif-gold-500);"></span>
              <span>Intérêts Dégressifs (12% l'an)</span>
            </span>
            <strong id="drawer-val-interest" style="font-family: var(--font-family-code);">21 055 FCFA</strong>
          </div> */}

          {/* <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 0.5rem; border-bottom: 1px dashed var(--border-color);">
            <span style="display: flex; align-items: center; gap: 6px;">
              <span style="width: 10px; height: 10px; border-radius: 50%; background: var(--cif-emerald-500);"></span>
              <span>Prime d'Assurance Emprunteur</span>
            </span>
            <strong id="drawer-val-insurance" style="font-family: var(--font-family-code);">13 750 FCFA</strong>
          </div> */}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "0.25rem" }}>
            <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Capital Restant Dû après échéance :</span>
            <strong id="drawer-val-remaining" style={{ color: "var(--primary-800)", fontFamily: "var(--font-family-code)" }}>—</strong>
          </div>
        </div>
      </div>

      {/* Settlement Tracing / Receipt Info */}
      <div className="card" style={{ padding: "1.25rem" }}>
        <h4 style={{ fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-muted)", marginBottom: "0.85rem" }}>
          <i className="fas fa-shield-halved text-emerald mr-1"></i> Traçabilité & Quittance
        </h4>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.8rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--text-muted)" }}>Contrat de Prêt :</span>
            <span id="drawer-val-contract" style={{ fontWeight: 600 }}>—</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--text-muted)" }}>Mode de règlement :</span>
            <span id="drawer-val-provider" style={{ fontWeight: 600 }}>Mobile Money / Agence CreditFast</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--text-muted)" }}>Règlement effectif :</span>
            <span id="drawer-val-paydate" style={{ fontWeight: 600 }}>Non réglé (Échéance ouverte)</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--text-muted)" }}>Référence Quittance :</span>
            <span id="drawer-val-receipt" style={{ fontWeight: 600, fontFamily: "var(--font-family-code)" }}>Générée après paiement</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--text-muted)" }}>Certification :</span>
            <span style={{ color: "var(--cif-emerald-600)", fontWeight: 600 }}><i className="fas fa-check-circle"></i> Sceau Digital DigiCoop</span>
          </div>
        </div>
      </div>
    </div>

    {/* Drawer Footer Actions */}
    <div className="schedule-drawer-footer">
      <button type="button" className="btn btn-secondary" onClick={() => callApp("closeScheduleDrawer")}>
        Fermer
      </button>
      <div id="drawer-footer-actions" style={{ display: "flex", gap: "0.5rem" }}>
        {/* Dynamic based on payment status */}
      </div>
    </div>
  </div>
</div>
  );
}
