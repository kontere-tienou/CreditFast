import { callApp } from '@/shared/ui/legacy';

export function PaymentModal() {
  return (
    <>
{/* ====================================================================
     [MODAL] PAIEMENT D'ÉCHÉANCE MOBILE MONEY (DEMANDEUR CREDITFAST)
     ==================================================================== */}
<div id="client-payment-modal" className="modal-backdrop" style={{ display: "none", position: "fixed", inset: 0, zIndex: 2000, alignItems: "center", justifyContent: "center", background: "rgba(15, 23, 42, 0.65)", backdropFilter: "blur(4px)" }}>
  <div className="modal-dialog" style={{ maxWidth: "500px", width: "92%", background: "var(--bg-surface)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-2xl)", border: "1px solid var(--border-color)", overflow: "hidden" }}>
    
    {/* Modal Header */}
    <div className="modal-header" style={{ padding: "1.25rem 1.5rem", background: "linear-gradient(135deg, var(--cif-emerald-500), var(--cif-emerald-600))", color: "white" }}>
      <div>
        <h4 style={{ fontSize: "1.1rem", fontWeight: 800, margin: 0, color: "white" }}>
          <i className="fas fa-mobile-screen mr-2"></i> Règlement d'Échéance CreditFast
        </h4>
          <span style={{ fontSize: "0.76rem", color: "#d1fae5" }}>Montant à régler et enregistrement en agence</span>
      </div>
      <button type="button" className="modal-close-btn" style={{ color: "white", background: "rgba(255,255,255,0.2)", border: "none", width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} onClick={() => callApp("closeClientPaymentModal")}>
        <i className="fas fa-times"></i>
      </button>
    </div>

    {/* Modal Body */}
    <div className="modal-body" style={{ padding: "1.5rem" }}>
      <form id="client-payment-form" onSubmit={(event) => { event.preventDefault(); callApp("submitClientPayment", event); }}>
        {/* Summary Box */}
        <div style={{ background: "var(--bg-body)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)", padding: "1rem", marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "4px" }}>
            <span>Prêt Concerné :</span>
            <strong id="payment-modal-loan-label" style={{ color: "var(--text-primary)" }}>—</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "4px" }}>
            <span>Échéance visée :</span>
            <strong style={{ color: "var(--cif-gold-700)" }} id="payment-modal-due-label">—</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px dashed var(--border-color)", paddingTop: "6px", marginTop: "6px" }}>
            <span style={{ fontWeight: 700, fontSize: "0.85rem" }}>Montant à Débiter :</span>
            <strong style={{ fontSize: "1.35rem", color: "var(--primary-700)", fontFamily: "var(--font-family-code)" }} id="payment-modal-amount-label">—</strong>
          </div>
        </div>

        <p id="payment-client-hint" style={{ fontSize: "0.78rem", color: "var(--text-muted)", margin: "0 0 1rem 0", lineHeight: 1.45 }}>
          Le montant à régler est indiqué ci-dessus. L’enregistrement du paiement est fait par votre chargé à l’agence.
        </p>

        <div id="payment-staff-fields" hidden>
          <div className="form-group" style={{ marginBottom: "0.85rem" }}>
            <label className="form-label" style={{ fontSize: "0.8rem" }}>Montant encaissé *</label>
            <input type="number" min="0.01" step="1" id="payment-paid-amount" className="form-control" />
          </div>
          <div className="form-group" style={{ marginBottom: "1.25rem" }}>
            <label className="form-label" style={{ fontSize: "0.8rem" }}>Date d’encaissement</label>
            <input type="date" id="payment-paid-date" className="form-control" />
          </div>
        </div>

        {/* Provider Selection */}
        <div className="form-group" style={{ marginBottom: "1.25rem" }}>
          <label className="form-label" style={{ fontSize: "0.8rem", fontWeight: 700 }}>Sélectionnez votre moyen de paiement *</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.5rem" }} id="momo-provider-buttons">
            <label className="momo-option-btn active" style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.65rem 0.85rem", border: "2px solid #ff7900", background: "rgba(255, 121, 0, 0.06)", borderRadius: "var(--radius-md)", cursor: "pointer" }}>
              <input type="radio" name="momo_provider" value="Orange Money" defaultChecked style={{ accentColor: "#ff7900" }} />
              <span style={{ fontWeight: 700, fontSize: "0.82rem", color: "var(--text-primary)" }}>Orange Money</span>
            </label>
            <label className="momo-option-btn" style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.65rem 0.85rem", border: "1px solid var(--border-color)", background: "var(--bg-surface)", borderRadius: "var(--radius-md)", cursor: "pointer" }}>
              <input type="radio" name="momo_provider" value="Wave" style={{ accentColor: "#1dc5d8" }} />
              <span style={{ fontWeight: 700, fontSize: "0.82rem", color: "var(--text-primary)" }}>Wave Mali</span>
            </label>
            <label className="momo-option-btn" style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.65rem 0.85rem", border: "1px solid var(--border-color)", background: "var(--bg-surface)", borderRadius: "var(--radius-md)", cursor: "pointer" }}>
              <input type="radio" name="momo_provider" value="Moov Money" style={{ accentColor: "#005ba4" }} />
              <span style={{ fontWeight: 700, fontSize: "0.82rem", color: "var(--text-primary)" }}>Moov Money Mali</span>
            </label>
            <label className="momo-option-btn" style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.65rem 0.85rem", border: "1px solid var(--border-color)", background: "var(--bg-surface)", borderRadius: "var(--radius-md)", cursor: "pointer" }}>
              <input type="radio" name="momo_provider" value="Sama Money" style={{ accentColor: "#ffcc00" }} />
              <span style={{ fontWeight: 700, fontSize: "0.82rem", color: "var(--text-primary)" }}>Sama Money</span>
            </label>
          </div>
        </div>

        {/* Phone Number Input */}
        <div className="form-group" style={{ marginBottom: "1.25rem" }}>
          <label className="form-label" style={{ fontSize: "0.8rem" }}>Numéro de Compte Mobile Money *</label>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <span style={{ padding: "0.5rem 0.75rem", background: "var(--bg-body)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", fontSize: "0.85rem", fontWeight: 700 }}>+223</span>
            <input type="tel" id="payment-phone-number" className="form-control" placeholder="70 00 00 00" required style={{ fontSize: "0.9rem", fontWeight: 600 }} />
          </div>
          <span style={{ fontSize: "0.72rem", color: "var(--text-subtle)", marginTop: "4px", display: "block" }}>Référence Mobile Money ou agence, si disponible.</span>
        </div>

        {/* Submit Button */}
        <button type="submit" id="btn-confirm-momo-pay" className="btn btn-success btn-lg" style={{ width: "100%", justifyContent: "center" }}>
          <i className="fas fa-lock mr-2"></i> J’ai noté le montant
        </button>
      </form>
    </div>
  </div>
</div>
    </>
  );
}
