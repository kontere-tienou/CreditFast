import { CfSelect } from '@/shared/ui/CfSelect';
import { callApp } from '@/shared/ui/legacy';

export function AppointmentModal() {
  return (
    <>
{/* ====================================================================
     [MODAL] PRISE DE RENDEZ-VOUS AVEC LE CONSEILLER (DEMANDEUR CIF)
     ==================================================================== */}
<div id="client-appointment-modal" className="modal" style={{ display: "none", position: "fixed", inset: 0, zIndex: 2000, alignItems: "center", justifyContent: "center", background: "rgba(15, 23, 42, 0.65)", backdropFilter: "blur(4px)" }}>
  <div className="modal-dialog" style={{ maxWidth: "540px", width: "92%", background: "var(--bg-surface)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-2xl)", border: "1px solid var(--border-color)", overflow: "hidden", animation: "modalFadeIn 0.25s ease-out" }}>
    
    {/* Modal Header */}
    <div className="modal-header" style={{ padding: "1.25rem 1.5rem", background: "linear-gradient(135deg, var(--cif-primary-600), var(--cif-primary-800))", color: "white", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(255, 255, 255, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>
          <i className="fas fa-calendar-check text-white"></i>
        </div>
        <div>
          <h4 style={{ fontSize: "1.05rem", fontWeight: 800, margin: 0, color: "white" }}>
            Prendre Rendez-vous
          </h4>
          <span style={{ fontSize: "0.76rem", color: "#cbd5e1" }}>Avec votre conseiller CreditFast</span>
        </div>
      </div>
      <button type="button" className="modal-close-btn" style={{ color: "white", background: "rgba(255,255,255,0.2)", border: "none", width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} onClick={() => callApp("closeAppointmentModal")} title="Fermer">
        <i className="fas fa-times"></i>
      </button>
    </div>

    {/* Modal Body */}
    <div className="modal-body" style={{ padding: "1.5rem", maxHeight: "calc(90vh - 120px)", overflowY: "auto" }}>
      
      {/* Advisor Quick Info Strip */}
      <div style={{ background: "var(--bg-body)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)", padding: "0.85rem 1rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div className="user-avatar" style={{ width: "42px", height: "42px", border: "2px solid var(--primary-300)", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-surface)" }}>
            <i className="fas fa-user-tie"></i>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text-primary)" }}>Conseiller</div>
            <div style={{ fontSize: "0.74rem", color: "var(--primary-600)", fontWeight: 600 }}>Assignation dès qu’un chargé est lié à votre dossier</div>
          </div>
        </div>
        <span className="badge badge-approved" style={{ fontSize: "0.68rem" }}>
          <i className="fas fa-circle-check"></i> Disponible
        </span>
      </div>

      <form id="client-appointment-modal-form" onSubmit={(event) => callApp("handleBookAppointmentModal", event)}>
        {/* Meeting Format Selection (Agency / Phone / Video) */}
        <div className="form-group" style={{ marginBottom: "1.1rem" }}>
          <label className="form-label" style={{ fontSize: "0.78rem", fontWeight: 700 }}>Format du Rendez-vous *</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem" }} id="appt-modal-type-selection">
            <label className="appt-type-option" style={{ border: "2px solid var(--primary-600)", background: "var(--primary-50)", padding: "0.65rem 0.5rem", borderRadius: "var(--radius-md)", textAlign: "center", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
              <input type="radio" name="appt_channel" value="AGENCY" defaultChecked style={{ accentColor: "var(--primary-600)" }} />
              <i className="fas fa-building-columns text-primary" style={{ fontSize: "1rem" }}></i>
              <span style={{ fontSize: "0.75rem", fontWeight: 700 }}>En Agence</span>
            </label>
            <label className="appt-type-option" style={{ border: "1px solid var(--border-color)", background: "var(--bg-surface)", padding: "0.65rem 0.5rem", borderRadius: "var(--radius-md)", textAlign: "center", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
              <input type="radio" name="appt_channel" value="PHONE" style={{ accentColor: "var(--primary-600)" }} />
              <i className="fas fa-phone-volume text-emerald" style={{ fontSize: "1rem" }}></i>
              <span style={{ fontSize: "0.75rem", fontWeight: 700 }}>Par Téléphone</span>
            </label>
            <label className="appt-type-option" style={{ border: "1px solid var(--border-color)", background: "var(--bg-surface)", padding: "0.65rem 0.5rem", borderRadius: "var(--radius-md)", textAlign: "center", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
              <input type="radio" name="appt_channel" value="VIDEO" style={{ accentColor: "var(--primary-600)" }} />
              <i className="fas fa-video text-primary" style={{ fontSize: "1rem" }}></i>
              <span style={{ fontSize: "0.75rem", fontWeight: 700 }}>Visioconférence</span>
            </label>
          </div>
        </div>

        {/* Reason */}
        <div className="form-group" style={{ marginBottom: "1rem" }}>
          <label className="form-label" style={{ fontSize: "0.78rem", fontWeight: 700 }}>Motif du Rendez-vous *</label>
          <CfSelect id="appt-modal-reason" className="form-control" required defaultValue="EXAM_DOSSIER" style={{ fontSize: "0.82rem" }}>
            <option value="EXAM_DOSSIER">Finalisation & Signature de mon Financement</option>
            <option value="GUARANTEE_DROP">Dépôt de justificatifs complémentaires</option>
            <option value="SAVINGS_ADVICE">Conseils personnalisés en épargne & développement</option>
            <option value="SCHEDULE_REVIEW">Échéancier de remboursement & questions</option>
            <option value="OTHER">Autre question ou accompagnement</option>
          </CfSelect>
        </div>

        {/* Date & Time Row */}
        <div className="grid-2" style={{ gap: "0.75rem", marginBottom: "1rem" }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: "0.78rem", fontWeight: 700 }}>Date souhaitée *</label>
            <input type="date" id="appt-modal-date" className="form-control" required style={{ fontSize: "0.82rem" }} />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: "0.78rem", fontWeight: 700 }}>Créneau horaire *</label>
            <CfSelect id="appt-modal-time" className="form-control" required defaultValue="14:00" style={{ fontSize: "0.82rem" }}>
              <option value="09:00">09h00 - 09h45</option>
              <option value="10:30">10h30 - 11h15</option>
              <option value="14:00">14h00 - 14h45</option>
              <option value="15:30">15h30 - 16h15</option>
              <option value="16:30">16h30 - 17h15</option>
            </CfSelect>
          </div>
        </div>

        {/* Notes */}
        <div className="form-group" style={{ marginBottom: "1.25rem" }}>
          <label className="form-label" style={{ fontSize: "0.78rem" }}>Précisions pour votre conseiller (facultatif)</label>
          <textarea id="appt-modal-notes" className="form-control" rows={2} placeholder="Ex: Je souhaite faire le point sur la libération des fonds pour mon stock..." style={{ fontSize: "0.82rem", resize: "none" }} />
        </div>

        {/* Security / Confirmation Notice */}
        <div style={{ background: "rgba(81, 142, 69, 0.08)", border: "1px solid rgba(81, 142, 69, 0.2)", borderRadius: "var(--radius-md)", padding: "0.75rem", marginBottom: "1.25rem", fontSize: "0.75rem", color: "var(--cif-emerald-700)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <i className="fas fa-bell text-emerald" style={{ fontSize: "1rem" }}></i>
          <span>Un SMS de confirmation et de rappel 24h avant vous sera automatiquement envoyé au <strong>+223 77 540 88 12</strong>.</span>
        </div>

        {/* Modal Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
          <button type="button" className="btn btn-secondary" onClick={() => callApp("closeAppointmentModal")}>
            Annuler
          </button>
          <button type="submit" className="btn btn-success">
            <i className="fas fa-check-circle mr-1"></i> Confirmer le Rendez-vous
          </button>
        </div>
      </form>
    </div>
  </div>
</div>
    </>
  );
}
