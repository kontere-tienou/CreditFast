import { callApp } from '@/shared/ui/legacy';

export function DocLightboxModal() {
  return (
    <>
{/* ====================================================================
     [MODAL] VISIONNEUSE LIGHTBOX DE DOCUMENTS & EXTRACTION OCR (GED)
     ==================================================================== */}
<div id="modal-doc-lightbox" className="doc-lightbox-modal" onClick={(event) => { if (event.target === event.currentTarget) callApp("closeDocLightbox"); }}>
  <div className="doc-lightbox-container" onClick={(event) => event.stopPropagation()}>
    {/* Topbar */}
    <div className="doc-lightbox-topbar">
      <div className="doc-lightbox-title-box">
        <div className="doc-lightbox-icon">
          <i className="fas fa-file-pdf" id="doc-lightbox-file-icon"></i>
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <h4 style={{ fontSize: "0.95rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }} id="doc-lightbox-title">
              Facture Proforma Stock Wax Assigamé
            </h4>
            <span className="badge badge-approved" id="doc-lightbox-badge" style={{ fontSize: "0.68rem" }}>
              <i className="fas fa-check-circle"></i> OCR Validé 100%
            </span>
          </div>
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }} id="doc-lightbox-meta">
            PDF • 1.4 Mo • Horodaté le 11/08/2026 à 10:15
          </span>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
        {/* Zoom & Rotation Controls */}
        <div className="doc-lightbox-toolbar">
          <button type="button" className="doc-tool-btn" onClick={() => callApp("zoomDocLightbox", 0.85)} title="Zoom Arrière (-)">
            <i className="fas fa-magnifying-glass-minus"></i>
          </button>
          <span style={{ fontSize: "0.72rem", fontWeight: 700, padding: "0 0.25rem", fontFamily: "var(--font-family-code)" }} id="doc-lightbox-zoom-val">100%</span>
          <button type="button" className="doc-tool-btn" onClick={() => callApp("zoomDocLightbox", 1.15)} title="Zoom Avant (+)">
            <i className="fas fa-magnifying-glass-plus"></i>
          </button>
          <button type="button" className="doc-tool-btn" onClick={() => callApp("resetDocLightboxZoom")} title="Réinitialiser la taille">
            <i className="fas fa-arrows-rotate"></i>
          </button>
          <button type="button" className="doc-tool-btn" onClick={() => callApp("rotateDocLightbox")} title="Pivoter de 90°">
            <i className="fas fa-rotate-right"></i>
          </button>
        </div>

        {/* Download & Close */}
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => callApp("downloadDocLightbox")} title="Télécharger le fichier original">
          <i className="fas fa-download mr-1"></i> Télécharger
        </button>
        <button type="button" className="btn btn-outline btn-sm" onClick={() => callApp("closeDocLightbox")} style={{ borderRadius: "50%", width: "32px", height: "32px", padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }} title="Fermer (Échap)">
          <i className="fas fa-times"></i>
        </button>
      </div>
    </div>

    {/* Main Content Area (Split Canvas + OCR Meta Sidebar) */}
    <div className="doc-lightbox-main">
      {/* Canvas Area (Document Page) */}
      <div className="doc-lightbox-canvas-area" id="doc-lightbox-canvas-area">
        <div id="doc-lightbox-sheet" className="doc-lightbox-preview-sheet" style={{ transform: "scale(1) rotate(0deg)", width: "620px", minHeight: "800px", padding: "2rem", position: "relative" }}>
          {/* Dynamically Rendered Document Content */}
          <div id="doc-lightbox-rendered-content">
            {/* Default Content populated dynamically by js/app.js */}
          </div>
        </div>
      </div>

      {/* OCR Insights & Data Extraction Sidebar */}
      <div className="doc-lightbox-sidebar">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.85rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.65rem" }}>
          <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <i className="fas fa-brain text-primary"></i> Moteur IA & OCR CIF
          </div>
          <span className="badge badge-client" style={{ fontSize: "0.68rem" }} id="doc-lightbox-conf-score">99.8% Confiance</span>
        </div>

        <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
          Toutes les données textuelles et métadonnées ont été extraites par Reconnaissance Optique de Caractères conforme UEMOA.
        </p>

        {/* Dynamic Extracted Fields Container */}
        <div id="doc-lightbox-fields-list" style={{ marginBottom: "1.25rem" }}>
          {/* Items injected dynamically */}
        </div>

        {/* Compliance & Fraud Checks */}
        <div style={{ marginTop: "auto", background: "var(--bg-body)", borderRadius: "var(--radius-md)", padding: "0.75rem", border: "1px solid var(--border-color)" }}>
          <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "0.4rem", textTransform: "uppercase" }}>
            <i className="fas fa-shield-halved text-emerald mr-1"></i> Contrôles de Conformité
          </div>
          <div style={{ fontSize: "0.7rem", color: "var(--text-subtle)", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <i className="fas fa-check text-emerald"></i> Format conforme UEMOA
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <i className="fas fa-check text-emerald"></i> Signature et cachet reconnus
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <i className="fas fa-check text-emerald"></i> Intégrité du fichier certifiée SHA-256
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
