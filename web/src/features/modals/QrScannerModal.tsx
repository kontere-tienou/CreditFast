import { callApp } from '@/shared/ui/legacy';

export function QrScannerModal() {
  return (
    <>
{/* ====================================================================
     MODAL: SCANNER APPAREIL PHOTO & DÉTECTEUR QR CODES DOCUMENTS OFFICIELS UEMOA
     ==================================================================== */}
<div id="modal-qr-scanner" className="modal-backdrop" style={{ display: "none" }}>
  <div className="modal-dialog modal-dialog-lg qr-scanner-modal-dialog">
    <div className="modal-header">
      <div className="modal-header-title">
        <i className="fas fa-camera text-primary mr-2"></i>
        <div>
          <h4 style={{ margin: 0, fontSize: "1.05rem" }}>Scanner de QR Code Officiel UEMOA</h4>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Extraction automatique & Vérification d'authenticité de document</span>
        </div>
      </div>
      <button type="button" className="modal-close" onClick={() => callApp("closeQrScannerModal")} title="Fermer le scanner">
        <i className="fas fa-times"></i>
      </button>
    </div>

    <div className="modal-body" style={{ padding: "1.25rem" }}>
      {/* Main Scanning View */}
      <div id="qr-camera-viewport-container" className="qr-viewport-container">
        {/* Live Camera Video */}
        <video id="qr-video-feed" className="qr-video-element" playsInline autoPlay muted></video>
        <canvas id="qr-canvas-buffer" style={{ display: "none" }}></canvas>

        {/* Viewfinder Overlay Box */}
        <div className="qr-viewfinder-overlay" id="qr-viewfinder-overlay">
          <div className="qr-viewfinder-box">
            <div className="corner-border top-left"></div>
            <div className="corner-border top-right"></div>
            <div className="corner-border bottom-left"></div>
            <div className="corner-border bottom-right"></div>
            <div className="qr-laser-line" id="qr-laser-line"></div>
          </div>
          <div className="qr-viewfinder-status" id="qr-scanner-status-text">
            <i className="fas fa-circle-notch fa-spin mr-1"></i> Initialisation de la caméra...
          </div>
        </div>

        {/* Fallback Message if camera is denied or unavailable */}
        <div id="qr-camera-error-banner" className="qr-error-overlay" style={{ display: "none" }}>
          <i className="fas fa-video-slash" style={{ fontSize: "2.2rem", color: "var(--warning)", marginBottom: "0.5rem" }}></i>
          <h5 style={{ marginBottom: "0.25rem" }}>Accès Caméra Non Disponible</h5>
          <p id="qr-camera-error-desc" style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "0.75rem", maxWidth: "320px", textAlign: "center" }}>
            Veuillez autoriser l'accès à la caméra dans les permissions du navigateur ou importer un fichier image.
          </p>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "center" }}>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => callApp("startCameraFeed")}>
              <i className="fas fa-rotate-right"></i> Réessayer
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => document.getElementById("qr-file-fallback-input")?.click()}>
              <i className="fas fa-image"></i> Importer Image
            </button>
          </div>
        </div>
      </div>

      {/* Controls Toolbar */}
      <div className="qr-controls-toolbar">
        <div className="qr-controls-left">
          <button type="button" className="btn btn-secondary btn-sm" id="btn-qr-switch-camera" onClick={() => callApp("switchCameraFacingMode")} title="Changer d'objectif (Avant / Arrière)">
            <i className="fas fa-camera-rotate"></i> <span>Changer Caméra</span>
          </button>
          <button type="button" className="btn btn-secondary btn-sm" id="btn-qr-toggle-torch" onClick={() => callApp("toggleCameraTorch")} title="Allumer la lampe torche / Flash">
            <i className="fas fa-bolt"></i> <span>Flash</span>
          </button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => document.getElementById("qr-file-fallback-input")?.click()} title="Analyser une image enregistrée">
            <i className="fas fa-upload"></i> <span>Importer Fichier</span>
          </button>
          <input type="file" id="qr-file-fallback-input" accept="image/*" style={{ display: "none" }} onChange={(event) => callApp("handleQrImageUpload", event)} />
        </div>

        <div className="qr-controls-right">
          <span className="badge badge-submitted" id="qr-camera-status-badge">
            <i className="fas fa-satellite-dish mr-1"></i> Mode Direct
          </span>
        </div>
      </div>

      {/* Demo One-Click Test Presets */}
      <div className="qr-demo-presets-card">
        <div className="qr-demo-presets-title">
          <i className="fas fa-flask text-primary mr-1"></i>
          <span>Simulateur d'échantillons officiels UEMOA (Test instantané) :</span>
        </div>
        <div className="qr-demo-presets-buttons">
          <button type="button" className="btn btn-secondary btn-xs" onClick={() => callApp("simulateQrScanPreset", 'cni')}>
            <i className="fas fa-id-card text-emerald"></i> CNI Biométrique NINA
          </button>
          <button type="button" className="btn btn-secondary btn-xs" onClick={() => callApp("simulateQrScanPreset", 'invoice')}>
            <i className="fas fa-receipt text-primary"></i> Facture Normalisée DGI
          </button>
          <button type="button" className="btn btn-secondary btn-xs" onClick={() => callApp("simulateQrScanPreset", 'rccm')}>
            <i className="fas fa-certificate text-amber"></i> Registre RCCM & Activité
          </button>
        </div>
      </div>

      {/* Decoded Result Verification Box (Displayed when a QR is scanned) */}
      <div id="qr-scan-result-card" className="qr-scan-result-card" style={{ display: "none" }}>
        <div className="qr-result-header">
          <div className="qr-result-status-badge success">
            <i className="fas fa-shield-halved"></i>
            <span>Signature Cryptographique Certifiée UEMOA / BCEAO</span>
          </div>
          <span className="badge badge-submitted" id="qr-doc-type-badge">CNI Biométrique</span>
        </div>

        <div className="qr-result-body">
          <div className="qr-extracted-grid" id="qr-extracted-fields-container">
            {/* Dynamic Key-Value Pairs populated via JS */}
          </div>
        </div>

        <div className="qr-result-actions">
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => callApp("resetQrScannerState")}>
            <i className="fas fa-arrows-rotate"></i> Scanner un autre document
          </button>
          <button type="button" className="btn btn-success" id="btn-apply-qr-data" onClick={() => callApp("applyQrScanData")}>
            <i className="fas fa-check-double"></i> Appliquer les données au dossier
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
    </>
  );
}
