import { callApp } from '@/shared/ui/legacy';

export function SuccessAnimationModal() {
  return (
    <>
{/* ====================================================================
     [MODAL] ANIMATION DE SUCCÈS & VALIDATION TRANSACTIONS (GREEN CHECKMARK)
     ==================================================================== */}
<div id="modal-success-animation" className="modal" style={{ display: "none", position: "fixed", inset: 0, zIndex: 2200, alignItems: "center", justifyContent: "center", background: "rgba(15, 23, 42, 0.7)", backdropFilter: "blur(5px)" }}>
  <div className="success-anim-dialog">
    {/* Animated Checkmark SVG */}
    <div className="success-icon-wrapper">
      <div className="success-icon-glow"></div>
      <svg className="checkmark-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
        <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
        <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
      </svg>
    </div>

    {/* Title & Subtitle */}
    <h3 className="success-anim-title" id="success-modal-title">Demande Transmise avec Succès !</h3>
    <p className="success-anim-subtitle" id="success-modal-subtitle">
      Votre dossier a été horodaté et transmis avec succès aux services d'analyse de la Caisse CIF.
    </p>

    {/* Details Card */}
    <div className="success-details-card" id="success-modal-details-card">
      <div className="success-detail-row">
        <span className="success-detail-label">Référence :</span>
        <span className="success-detail-val" id="success-detail-ref">—</span>
      </div>
      <div className="success-detail-row">
        <span className="success-detail-label">Montant :</span>
        <span className="success-detail-val" id="success-detail-amount" style={{ color: "var(--primary-700)" }}>—</span>
      </div>
      <div className="success-detail-row">
        <span className="success-detail-label">Mensualité Estimée :</span>
        <span className="success-detail-val" id="success-detail-payment" style={{ color: "var(--cif-emerald-600)" }}>—</span>
      </div>
      <div className="success-detail-row">
        <span className="success-detail-label">Statut :</span>
        <span className="badge badge-approved" id="success-detail-status" style={{ fontSize: "0.7rem" }}>
          <i className="fas fa-circle-check"></i> Enregistré & Conforme
        </span>
      </div>
    </div>

    {/* Actions */}
    <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
      <button type="button" className="btn btn-success btn-lg" id="success-modal-primary-btn" onClick={() => callApp("closeSuccessModal")} style={{ width: "100%", justifyContent: "center" }}>
        <i className="fas fa-arrow-right mr-1"></i> Poursuivre vers mon Espace
      </button>
      <button type="button" className="btn btn-secondary btn-sm" id="success-modal-secondary-btn" onClick={() => callApp("downloadSuccessReceipt")} style={{ width: "100%", justifyContent: "center" }}>
        <i className="fas fa-file-arrow-down mr-1"></i> Télécharger le Récépissé Officiel (PDF)
      </button>
    </div>
  </div>
</div>
    </>
  );
}
