import { callApp } from '@/shared/ui/legacy';

export function SignedPvDrawer() {
  return (
<div id="signed-pv-drawer-backdrop" className="schedule-drawer-backdrop" onClick={() => callApp("closeSignedPvDrawer")}>
    <div id="signed-pv-sidedrawer" className="schedule-drawer" onClick={(event) => event.stopPropagation()} aria-label="Volet détail procès-verbal signé">
      <div className="schedule-drawer-header">
        <div className="schedule-drawer-header-content">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
            <span className="badge badge-submitted" id="pv-drawer-ref-badge" style={{ fontFamily: "var(--font-family-code)", fontWeight: 700 }}>PV-2026-0889</span>
            <span id="pv-drawer-status-badge" className="badge badge-approved"><i className="fas fa-circle-check"></i> Accord Collégial</span>
          </div>
          <h3 id="pv-drawer-title" className="schedule-drawer-title" style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>Seydou Keita</h3>
          <p id="pv-drawer-subtitle" className="schedule-drawer-subtitle" style={{ fontSize: "0.76rem", color: "var(--text-muted)", margin: 0, marginTop: "2px" }}>Procès-Verbal Officiel de Décision du Comité de Crédit</p>
        </div>
        <button type="button" className="modal-close-btn" onClick={() => callApp("closeSignedPvDrawer")} title="Fermer le volet">
          <i className="fas fa-times"></i>
        </button>
      </div>

      <div className="schedule-drawer-body">
        <div className="drawer-panel">
          <div className="drawer-panel-header">
            <h4 className="drawer-panel-title"><i className="fas fa-file-contract text-primary mr-1"></i> Termes & Conditions Financières</h4>
            <span id="pv-drawer-date" className="badge badge-submitted" style={{ fontSize: "0.68rem" }}>18/08/2026</span>
          </div>
          <div className="drawer-grid-2" style={{ marginBottom: "0.6rem" }}>
            <div className="drawer-metric-box">
              <div className="drawer-kv-label">Montant Validé</div>
              <div id="pv-drawer-amount" style={{ fontSize: "1.15rem", fontWeight: 800, color: "#518e45", fontFamily: "var(--font-family-code)" }}>3 000 000 F</div>
              <div id="pv-drawer-requested-diff" style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "2px" }}>Demande initiale : 3 000 000 F</div>
            </div>
            <div className="drawer-metric-box">
              <div className="drawer-kv-label">Modalités & Échéance</div>
              <div id="pv-drawer-terms" style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--primary-700)", fontFamily: "var(--font-family-code)" }}>9.5% • 18 mois</div>
              <div id="pv-drawer-monthly" style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "2px" }}>Échéance : ~190 400 F / mois</div>
            </div>
          </div>
          <div className="drawer-grid-2">
            <div className="drawer-kv">
              <span className="drawer-kv-label">Emprunteur & Activité</span>
              <span id="pv-drawer-client-info" className="drawer-kv-value" style={{ fontWeight: 600 }}>Seydou Keita (Menuiserie & BTP)</span>
            </div>
            <div className="drawer-kv">
              <span className="drawer-kv-label">Agence de Rattachement</span>
              <span id="pv-drawer-agency" className="drawer-kv-value">Bamako Principale (Mali)</span>
            </div>
          </div>
        </div>

        <div className="drawer-panel">
          <div className="drawer-panel-header">
            <h4 className="drawer-panel-title"><i className="fas fa-signature text-emerald mr-1"></i> Signatures Électroniques & Visas</h4>
            <span id="pv-drawer-quorum-badge" className="badge badge-approved"><i className="fas fa-users-check"></i> Quorum 3/3</span>
          </div>
          <div id="pv-drawer-signers-list" style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}></div>
        </div>

        <div className="drawer-panel">
          <div className="drawer-panel-header">
            <h4 className="drawer-panel-title"><i className="fas fa-shield-halved text-warning mr-1"></i> Sûretés & Modalités de Déblocage</h4>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: "0.78rem" }}>
            <div className="drawer-kv">
              <span className="drawer-kv-label">Garanties & Cautions Enregistrées</span>
              <p id="pv-drawer-guarantees" style={{ background: "var(--bg-body)", padding: "0.6rem 0.8rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)", fontSize: "0.75rem", color: "var(--text-primary)", margin: 0, lineHeight: 1.45 }}>
                Caution solidaire Maître Artisan enregistrée + Dépôt de garantie bloqué 10%
              </p>
            </div>
            <div className="drawer-kv">
              <span className="drawer-kv-label">Conditions Préalables au Décaissement</span>
              <p id="pv-drawer-disbursement" style={{ background: "var(--bg-body)", padding: "0.6rem 0.8rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)", fontSize: "0.75rem", color: "var(--text-primary)", margin: 0, lineHeight: 1.45 }}>
                Décaissement sur présentation de facture proforma fournisseur acquittée.
              </p>
            </div>
            <div className="drawer-kv">
              <span className="drawer-kv-label">Motivation Collégiale du Comité</span>
              <p id="pv-drawer-notes" style={{ background: "var(--bg-body)", padding: "0.6rem 0.8rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)", fontSize: "0.75rem", color: "var(--text-primary)", margin: 0, lineHeight: 1.45 }}>
                Dossier solide avec marge opérationnelle démontrée.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="schedule-drawer-footer" style={{ padding: "1rem 1.4rem", borderTop: "1px solid var(--border-color)", background: "var(--bg-surface)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem" }}>
        <button type="button" className="btn btn-secondary" onClick={() => callApp("closeSignedPvDrawer")} style={{ padding: "0.6rem 1rem" }}>
          <i className="fas fa-times mr-1"></i> Fermer
        </button>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button type="button" className="btn btn-secondary" onClick={() => callApp("notifyAgencyForPv")} style={{ padding: "0.6rem 0.9rem" }} title="Notifier l'agence par SMS/WhatsApp">
            <i className="fas fa-paper-plane mr-1 text-primary"></i> Notifier Agence
          </button>
          <button type="button" className="btn btn-primary" onClick={() => callApp("downloadSignedPvPdf")} style={{ padding: "0.6rem 1.15rem", fontWeight: 700 }}>
            <i className="fas fa-file-pdf mr-1"></i> Télécharger PV
          </button>
        </div>
      </div>
    </div>
  </div>
  );
}
