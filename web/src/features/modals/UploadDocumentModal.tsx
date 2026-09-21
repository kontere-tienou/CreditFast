import type { DragEvent } from 'react';
import { callApp } from '@/shared/ui/legacy';
import { Button } from '@/shared/ui/Button';
import { CfSelect } from '@/shared/ui/CfSelect';

function openClientFileInput() {
  document.getElementById('client-file-input')?.click();
}

export function UploadDocumentModal() {
  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.style.borderColor = 'var(--primary-300)';
    callApp('handleClientDocDrop', event.nativeEvent);
  };

  return (
    <div
      id="modal-upload-document"
      className="modal-backdrop"
      style={{ display: 'none', zIndex: 2100, background: 'rgba(15, 23, 42, 0.7)' }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          callApp('closeUploadDocumentModal');
        }
      }}
    >
      <div
        className="modal-dialog"
        style={{
          maxWidth: 560,
          width: '92%',
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-2xl)',
          border: '1px solid var(--border-color)',
          overflow: 'hidden',
        }}
      >
        <div
          className="modal-header"
          style={{
            padding: '1.15rem 1.5rem',
            background: 'linear-gradient(135deg, var(--cif-emerald-600, #518e45), var(--cif-emerald-700, #1b4332))',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.15rem',
              }}
            >
              <i className="fas fa-cloud-arrow-up"></i>
            </div>
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'white' }}>Téléverser un document</h4>
              <span style={{ fontSize: '0.76rem', color: '#d1fae5' }}>PDF, PNG ou JPG • 10 Mo max</span>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            style={{
              color: 'white',
              background: 'rgba(255,255,255,0.18)',
              border: 'none',
              width: 32,
              height: 32,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            onClick={() => callApp('closeUploadDocumentModal')}
            title="Fermer"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="modal-body" style={{ padding: '1.5rem' }}>
          <div
            className="upload-dropzone"
            style={{
              textAlign: 'center',
              padding: '2rem 1.25rem',
              border: '2px dashed var(--primary-300)',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-body)',
            }}
            onDragOver={(event) => {
              event.preventDefault();
              event.currentTarget.style.borderColor = 'var(--primary-600)';
            }}
            onDragLeave={(event) => {
              event.currentTarget.style.borderColor = 'var(--primary-300)';
            }}
            onDrop={onDrop}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'var(--primary-50)',
                color: 'var(--primary-600)',
                fontSize: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 0.75rem auto',
              }}
            >
              <i className="fas fa-file-arrow-up"></i>
            </div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>Glissez-déposez vos justificatifs ici</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Factures, quittances, contrat de bail ou justificatif de revenu. Le système lit le fichier après dépôt.
            </p>
            <div className="form-group" style={{ textAlign: 'left', marginBottom: '0.85rem' }}>
              <label className="form-label" htmlFor="upload-doc-type" style={{ fontSize: '0.78rem' }}>
                Type de pièce
              </label>
              <CfSelect id="upload-doc-type" className="form-control" defaultValue="PREUVE_REVENU">
                <option value="PREUVE_REVENU">Justificatif de revenu</option>
                <option value="JUSTIFICATIF_DOMICILE">Justificatif de domicile</option>
                <option value="FACTURE_ELECTRICITE">Facture d’électricité</option>
                <option value="CONTRAT_BAIL">Contrat de bail</option>
                <option value="RELEVE_BANCAIRE">Relevé</option>
                <option value="CNI">Carte nationale d’identité</option>
                <option value="PASSEPORT">Passeport</option>
                <option value="PIECE_IDENTITE">Autre pièce d’identité</option>
              </CfSelect>
            </div>
            <div className="form-group" style={{ textAlign: 'left', marginBottom: '0.85rem' }}>
              <label className="form-label" htmlFor="upload-doc-number" style={{ fontSize: '0.78rem' }}>
                Numéro de pièce (identité)
              </label>
              <input id="upload-doc-number" className="form-control" placeholder="Facultatif pour une CNI ou un passeport" />
            </div>
            <Button variant="secondary" className="btn-sm" onClick={openClientFileInput}>
              <i className="fas fa-arrow-up-from-bracket"></i> Parcourir mes fichiers locaux
            </Button>
            <input
              type="file"
              id="client-file-input"
              style={{ display: 'none' }}
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(event) => callApp('handleClientDocUpload', event.nativeEvent)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
