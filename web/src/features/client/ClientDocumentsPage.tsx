import { useEffect, useMemo, useState } from 'react';
import { Screen } from '@/shared/ui/Screen';
import { Button } from '@/shared/ui/Button';
import { callApp } from '@/shared/ui/legacy';
import { ClientDocumentsTable, type ClientDocumentRow } from '@/shared/tables/registry';

type DocCategory = 'ID' | 'INVOICE' | 'GUARANTEE' | 'CONTRACT';
type DocFilter = 'ALL' | 'EXPIRING' | DocCategory;
type DocsView = 'table' | 'icons';

type ClientDoc = {
  category: DocCategory;
  categoryLabel: string;
  validity: string;
  lightbox: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  file: string;
  reference: string;
  lines: string[];
  badge: string;
  badgeIcon: string;
};

const CLIENT_DOCS: ClientDoc[] = [
  {
    category: 'ID',
    categoryLabel: 'Identité & Registre',
    validity: '2029-03-14',
    lightbox: 'cni',
    icon: 'fa-id-card',
    iconBg: '#eef4ee',
    iconColor: '#1b4332',
    title: 'CNI Biométrique CEDEAO',
    file: 'CNI_Fatou_Ndiaye_recto_verso.pdf',
    reference: 'N° 1 756 1989 00412',
    lines: ['N° Pièce : 1 756 1989 00412', 'Validité : 14/03/2029 (En cours de validité)', 'Ajouté le : 11/08/2026 à 10:15'],
    badge: 'Validé 100%',
    badgeIcon: 'fa-check-circle',
  },
  {
    category: 'ID',
    categoryLabel: 'Identité & Registre',
    validity: '2027-02-15',
    lightbox: 'rccm',
    icon: 'fa-stamp',
    iconBg: '#fef3c7',
    iconColor: '#ff9800',
    title: 'Extrait RCCM / NINEA',
    file: 'RCCM_SN_DKR_2022_B_890.pdf',
    reference: 'SN.DKR.2022.B.890',
    lines: ['N° RCCM : SN.DKR.2022.B.890', 'NINEA : 008923412 2A2', 'Validité : 15/02/2027 (Certifié conforme)'],
    badge: 'Certifié Conforme',
    badgeIcon: 'fa-check-circle',
  },
  {
    category: 'INVOICE',
    categoryLabel: 'Factures & Devis',
    validity: '2026-09-07',
    lightbox: 'proforma',
    icon: 'fa-receipt',
    iconBg: '#ede9fe',
    iconColor: '#7c3aed',
    title: 'Facture Proforma Stock Wax',
    file: 'Facture_Grossiste_Wax_Bamako.pdf',
    reference: '2 500 000 FCFA',
    lines: ['Fournisseur : Éts Textile Bamako', 'Montant Total : 2 500 000 FCFA', 'Échéance Validité : 07/09/2026 (Validité 30 jours)'],
    badge: 'Conforme au prêt',
    badgeIcon: 'fa-check-double',
  },
  {
    category: 'INVOICE',
    categoryLabel: 'Factures & Devis',
    validity: '2026-08-30',
    lightbox: 'senelec',
    icon: 'fa-bolt',
    iconBg: '#dcfce7',
    iconColor: '#15803d',
    title: 'Justificatif de Domicile',
    file: 'Facture_EDM_Juillet_2026.pdf',
    reference: 'EDM-SA Bamako',
    lines: ['Organisme : EDM-SA Bamako Grand Marché', 'Adresse : Rue 314 x Porte 12, Grand Marché Bamako', 'Échéance Validité : 30/08/2026'],
    badge: 'Vérifié',
    badgeIcon: 'fa-check-circle',
  },
  {
    category: 'GUARANTEE',
    categoryLabel: 'Garanties & Nantissement',
    validity: '2027-08-11',
    lightbox: 'guarantee',
    icon: 'fa-shield-halved',
    iconBg: '#f3e8ff',
    iconColor: '#9333ea',
    title: 'Acte de Garantie & Nantissement',
    file: 'Acte_Nantissement_Compte_CreditFast.pdf',
    reference: '500 000 FCFA bloqués',
    lines: ['Type : Nantissement Compte Épargne', 'Montant Bloqué : 500 000 FCFA', 'Validité : 11/08/2027 (Enregistré)'],
    badge: 'Actif & Enregistré',
    badgeIcon: 'fa-lock',
  },
  {
    category: 'CONTRACT',
    categoryLabel: 'Contrats Signés',
    validity: '2027-08-11',
    lightbox: 'contract',
    icon: 'fa-signature',
    iconBg: 'var(--cif-primary-100)',
    iconColor: 'var(--ds-30)',
    title: 'Contrat de Prêt Cadre CreditFast',
    file: 'Contrat_Signe_CreditFast_DKR_8821.pdf',
    reference: 'SHA-256 8f9a2e3…b71c',
    lines: ['Signature : Électronique Certifiée (OTP)', 'Validité : 11/08/2027 (Scellé)', 'Empreinte SHA-256 : 8f9a2e3...b71c'],
    badge: 'Signé & Scellé',
    badgeIcon: 'fa-certificate',
  },
  {
    category: 'ID',
    categoryLabel: 'Identité & Registre',
    validity: '2028-11-02',
    lightbox: 'passport',
    icon: 'fa-passport',
    iconBg: '#eef4ee',
    iconColor: '#1b4332',
    title: 'Passeport biométrique',
    file: 'Passeport_Fatou_Ndiaye.pdf',
    reference: 'N° A 2041987',
    lines: ['N° Pièce : A 2041987', 'Validité : 02/11/2028', 'Ajouté le : 04/07/2026 à 09:40'],
    badge: 'Validé 100%',
    badgeIcon: 'fa-check-circle',
  },
  {
    category: 'INVOICE',
    categoryLabel: 'Factures & Devis',
    validity: '2026-10-12',
    lightbox: 'water',
    icon: 'fa-droplet',
    iconBg: '#dbeafe',
    iconColor: '#1d4ed8',
    title: 'Quittance SOMAGEP',
    file: 'Quittance_SOMAGEP_Aout_2026.pdf',
    reference: 'SOMAGEP Bamako',
    lines: ['Organisme : SOMAGEP', 'Adresse : Grand Marché Bamako', 'Échéance : 12/10/2026'],
    badge: 'Vérifié',
    badgeIcon: 'fa-check-circle',
  },
  {
    category: 'GUARANTEE',
    categoryLabel: 'Garanties & Nantissement',
    validity: '2027-01-20',
    lightbox: 'caution',
    icon: 'fa-handshake',
    iconBg: '#f3e8ff',
    iconColor: '#9333ea',
    title: 'Acte de caution solidaire',
    file: 'Caution_Solidaire_Keita.pdf',
    reference: 'Caution Awa Keita',
    lines: ['Type : Caution solidaire', 'Garant : Awa Keita', 'Validité : 20/01/2027'],
    badge: 'Actif',
    badgeIcon: 'fa-lock',
  },
  {
    category: 'CONTRACT',
    categoryLabel: 'Contrats Signés',
    validity: '2026-12-01',
    lightbox: 'avenant',
    icon: 'fa-file-signature',
    iconBg: 'var(--cif-primary-100)',
    iconColor: 'var(--ds-30)',
    title: 'Avenant n°1 au contrat cadre',
    file: 'Avenant_1_CreditFast_DKR_8821.pdf',
    reference: 'SHA-256 4c11…aa02',
    lines: ['Signature : Électronique Certifiée', 'Validité : 01/12/2026', 'Empreinte SHA-256 : 4c11...aa02'],
    badge: 'Signé',
    badgeIcon: 'fa-certificate',
  },
  {
    category: 'INVOICE',
    categoryLabel: 'Factures & Devis',
    validity: '2026-09-28',
    lightbox: 'tax',
    icon: 'fa-file-invoice',
    iconBg: '#ede9fe',
    iconColor: '#7c3aed',
    title: 'Attestation fiscale DGI',
    file: 'Attestation_Fiscale_DGI_2026.pdf',
    reference: 'DGI-ML-8821',
    lines: ['Organisme : DGI Mali', 'Référence : DGI-ML-8821', 'Échéance : 28/09/2026'],
    badge: 'Conforme',
    badgeIcon: 'fa-check-double',
  },
  {
    category: 'ID',
    categoryLabel: 'Identité & Registre',
    validity: '2027-05-18',
    lightbox: 'photo',
    icon: 'fa-image',
    iconBg: '#fef3c7',
    iconColor: '#ff9800',
    title: 'Photo d’identité récente',
    file: 'Photo_Identite_2026.jpg',
    reference: 'Format biométrique',
    lines: ['Format : 35 × 45 mm', 'Date : 18/05/2026', 'Ajouté le : 18/05/2026'],
    badge: 'Accepté',
    badgeIcon: 'fa-check-circle',
  },
];

function daysUntil(iso: string) {
  const validityDate = new Date(`${iso}T23:59:59`);
  return Math.ceil((validityDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function formatValidity(iso: string) {
  const [year, month, day] = iso.split('-');
  return `${day}/${month}/${year}`;
}

function toTableRow(doc: ClientDoc, index: number): ClientDocumentRow {
  const days = daysUntil(doc.validity);
  const expiring = days <= 30;
  const dateLabel = formatValidity(doc.validity);
  const validityLabel = expiring
    ? days < 0
      ? `${dateLabel} (Expiré depuis ${Math.abs(days)} j)`
      : `${dateLabel} (Expire dans ${days} j)`
    : `${dateLabel} (En cours de validité)`;

  return {
    id: doc.lightbox,
    title: doc.title,
    file: doc.file,
    category: doc.categoryLabel,
    reference: doc.reference,
    validityLabel,
    validityValue: doc.validity,
    status: expiring ? 'À renouveler' : 'Validé & conforme',
    expiring,
    sortIndex: index,
  };
}

export function ClientDocumentsPage() {
  const [view, setView] = useState<DocsView>('table');
  const [filter, setFilter] = useState<DocFilter>('ALL');

  const tableRows = useMemo(() => {
    return CLIENT_DOCS.map(toTableRow).filter((row) => {
      if (filter === 'ALL') {
        return true;
      }
      if (filter === 'EXPIRING') {
        return row.expiring;
      }
      const source = CLIENT_DOCS.find((doc) => doc.lightbox === row.id);
      return source?.category === filter;
    });
  }, [filter]);

  useEffect(() => {
    const onFilter = (event: Event) => {
      const category = (event as CustomEvent<DocFilter>).detail;
      if (category) {
        setFilter(category);
      }
    };
    window.addEventListener('creditfast-docs-filter', onFilter);
    return () => window.removeEventListener('creditfast-docs-filter', onFilter);
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      callApp('checkAndHighlightExpiringDocs');
      if (view === 'icons') {
        const button = document.querySelector(`#doc-filter-buttons [data-doc-filter="${filter}"]`);
        callApp('filterClientDocs', filter, button);
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [view, filter]);

  return (
    <Screen viewId="view-client-documents">
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <i className="fas fa-folder-closed text-primary mr-2"></i> Mes Pièces Justificatives & Devis
          </h2>
          <p className="page-subtitle">
            Espace sécurisé de gestion documentaire, contrôle de validité et vérification par Reconnaissance Optique de Caractères{' '}
          </p>
        </div>
        <div className="page-actions">
          <Button onClick={() => callApp('openUploadDocumentModal')}>
            <i className="fas fa-cloud-arrow-up"></i> Téléverser un Document
          </Button>
        </div>
      </div>

      <div id="client-docs-expiring-alert"></div>

      <div className="anomaly-item info" style={{ marginBottom: '1.25rem', overflow: 'hidden' }}>
        <i className="fas fa-shield-halved anomaly-icon" style={{ color: 'var(--cif-emerald-600)' }}></i>
        <div className="anomaly-content">
          <h5 style={{ color: 'var(--cif-emerald-700)' }}>Dossier documentaire conforme aux normes</h5>
          <p>
            Vos pièces justificatives pour la demande #REQ-2026-0891 ont été extraites avec succès et certifiées par le module OCR CreditFast. Les pièces dont la date
            d&apos;échéance approche sont automatiquement signalées en rouge pour renouvellement anticipé.
          </p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div
          className="card-body"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            flexWrap: 'wrap',
            padding: '0.85rem 1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <label htmlFor="client-docs-filter-select" style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              Filtrer
            </label>
            <select
              id="client-docs-filter-select"
              className="form-control"
              style={{ width: 'auto', minWidth: 240 }}
              value={filter}
              onChange={(event) => setFilter(event.target.value as DocFilter)}
            >
              <option value="ALL">Tous les documents (6)</option>
              <option value="EXPIRING">Validité &lt; 30 jours</option>
              <option value="ID">Identité &amp; Registre (2)</option>
              <option value="INVOICE">Factures &amp; Devis (2)</option>
              <option value="GUARANTEE">Garanties &amp; Nantissement (1)</option>
              <option value="CONTRACT">Contrats signés (1)</option>
            </select>
          </div>

          <div className="docs-view-toggle" role="group" aria-label="Mode d'affichage">
            <button
              type="button"
              className={view === 'table' ? 'active' : undefined}
              title="Vue liste"
              onClick={() => setView('table')}
            >
              <i className="fas fa-list"></i> Liste
            </button>
            <button
              type="button"
              className={view === 'icons' ? 'active' : undefined}
              title="Vue icônes"
              onClick={() => setView('icons')}
            >
              <i className="fas fa-grip"></i> Icônes
            </button>
          </div>
        </div>
      </div>

      <div id="doc-filter-buttons" hidden>
        <button type="button" data-doc-filter="ALL" className="btn btn-primary btn-sm active" onClick={() => setFilter('ALL')}>
          Tous
        </button>
        <button type="button" data-doc-filter="EXPIRING" id="btn-filter-expiring" className="btn btn-secondary btn-sm" onClick={() => setFilter('EXPIRING')}>
          Expirant (<span id="expiring-filter-count">2</span>)
        </button>
        <button type="button" data-doc-filter="ID" className="btn btn-secondary btn-sm" onClick={() => setFilter('ID')}>
          Identité
        </button>
        <button type="button" data-doc-filter="INVOICE" className="btn btn-secondary btn-sm" onClick={() => setFilter('INVOICE')}>
          Factures
        </button>
        <button type="button" data-doc-filter="GUARANTEE" className="btn btn-secondary btn-sm" onClick={() => setFilter('GUARANTEE')}>
          Garanties
        </button>
        <button type="button" data-doc-filter="CONTRACT" className="btn btn-secondary btn-sm" onClick={() => setFilter('CONTRACT')}>
          Contrats
        </button>
      </div>

      {view === 'table' ? (
        <>
          <div id="client-documents-grid" hidden>
            {CLIENT_DOCS.map((doc) => (
              <DocCard key={doc.lightbox} doc={doc} />
            ))}
          </div>
          <ClientDocumentsTable items={tableRows} />
        </>
      ) : (
        <div className="grid-3" id="client-documents-grid">
          {CLIENT_DOCS.map((doc) => (
            <DocCard key={doc.lightbox} doc={doc} />
          ))}
        </div>
      )}
    </Screen>
  );
}

function DocIcon({ doc, size = 42 }: { doc: ClientDoc; size?: number }) {
  return (
    <div
      className="doc-icon-box"
      style={{
        width: size,
        height: size,
        borderRadius: 'var(--radius-md)',
        background: doc.iconBg,
        color: doc.iconColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size > 40 ? '1.25rem' : '1rem',
        flexShrink: 0,
      }}
    >
      <i className={`fas ${doc.icon}`}></i>
    </div>
  );
}

function DocCard({ doc }: { doc: ClientDoc }) {
  return (
    <div
      className="card doc-card-item"
      data-category={doc.category}
      data-validity-date={doc.validity}
      style={{ padding: '1.25rem', position: 'relative', cursor: 'pointer', transition: 'all 0.2s ease' }}
      onClick={() => callApp('openDocLightbox', doc.lightbox)}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <DocIcon doc={doc} />
          <div>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: 2 }}>{doc.title}</h4>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>{doc.file}</span>
          </div>
        </div>
        <div className="doc-header-badge-slot"></div>
      </div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
        {doc.lines.map((line) => (
          <div key={line} className={line.startsWith('Validité') || line.startsWith('Échéance') ? 'doc-validity-row' : undefined}>
            <strong>{line.split(':')[0]} :</strong>
            {line.slice(line.indexOf(':') + 1)}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
        <span className="badge badge-approved doc-footer-status">
          <i className={`fas ${doc.badgeIcon}`}></i> {doc.badge}
        </span>
        <Button
          className="btn-sm"
          onClick={(event) => {
            event.stopPropagation();
            callApp('openDocLightbox', doc.lightbox);
          }}
        >
          <i className="fas fa-eye"></i> Aperçu Sécurisé
        </Button>
      </div>
    </div>
  );
}
