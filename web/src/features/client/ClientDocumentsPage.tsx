import { useEffect, useMemo, useState } from 'react';
import { toast } from '@heroui/react';
import { Screen } from '@/shared/ui/Screen';
import { Button } from '@/shared/ui/Button';
import { CfSelect } from '@/shared/ui/CfSelect';
import { callApp } from '@/shared/ui/legacy';
import { AppTable } from '@/shared/ui/AppTable';
import {
  deleteCreditDocument,
  isRequestEditableByClient,
  listCreditRequestDocuments,
  listMyCreditRequests,
  type CreditDocument,
} from '@/api/credit';
import { deleteKycDocument, isKycDocumentRemovable, listKycDocuments, type KycDocument } from '@/api/profile';
import { isApiError } from '@/api/errors';
import { formatDate, notifyRequestsChanged, REQUESTS_CHANGED_EVENT } from '@/features/workflow/workflow';
import { documentCheck, identityCheck } from '@/features/workflow/compliance';

type DocFilter = 'ALL' | 'KYC' | 'CREDIT';

type ClientDocumentRow = {
  id: string;
  title: string;
  file: string;
  category: string;
  reference: string;
  validityLabel: string;
  validityValue: string;
  status: string;
  expiring: boolean;
  sortIndex: number;
  kind: 'KYC' | 'CREDIT';
  documentId: number;
  requestId?: number;
  removable: boolean;
  removeHint: string;
};

function toRow(
  doc: CreditDocument | KycDocument,
  source: DocFilter,
  index: number,
  request?: { id: number; status?: string },
): ClientDocumentRow {
  const file = doc.original_filename || `document-${doc.id}`;
  const title = doc.document_type || file;
  const expires = 'expires_at' in doc ? doc.expires_at : null;
  const kind = source === 'KYC' ? 'KYC' : 'CREDIT';
  const check = kind === 'KYC' ? identityCheck(doc.status) : documentCheck(doc.status);
  const id = kind === 'KYC' ? `KYC-${doc.id}` : `CREDIT-${request?.id ?? 0}-${doc.id}`;
  const removable = kind === 'KYC' ? isKycDocumentRemovable(doc.status) : isRequestEditableByClient(request?.status);
  return {
    id,
    title,
    file,
    category: kind === 'KYC' ? 'Identité' : 'Dossier de crédit',
    reference: String(doc.id),
    validityLabel: expires ? formatDate(expires) : formatDate(doc.uploaded_at),
    validityValue: expires || doc.uploaded_at || '',
    status: check.label,
    expiring: check.tone === 'bad' || check.tone === 'warn',
    sortIndex: index,
    kind,
    documentId: doc.id,
    requestId: request?.id,
    removable,
    removeHint: removable
      ? 'Retirer cette pièce'
      : kind === 'KYC'
        ? 'Pièce déjà contrôlée par l’agent : retrait impossible'
        : 'Dossier transmis : la pièce ne peut plus être retirée',
  };
}

export function ClientDocumentsPage() {
  const [filter, setFilter] = useState<DocFilter>('ALL');
  const [rows, setRows] = useState<ClientDocumentRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  const removeRow = async (row: ClientDocumentRow) => {
    if (!row.removable || removing) {
      return;
    }
    const label = row.kind === 'KYC' ? 'cette pièce d’identité' : 'cette pièce du dossier';
    if (!window.confirm(`Retirer ${label} ?`)) {
      return;
    }
    setRemoving(row.id);
    try {
      if (row.kind === 'KYC') {
        await deleteKycDocument(row.documentId);
      } else if (row.requestId) {
        await deleteCreditDocument(row.requestId, row.documentId);
      }
      setRows((current) => current.filter((item) => item.id !== row.id));
      toast.success('Pièce retirée.');
      notifyRequestsChanged();
    } catch (error) {
      toast.danger(isApiError(error) ? error.message : 'Impossible de retirer cette pièce.');
    } finally {
      setRemoving(null);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [kyc, requests] = await Promise.all([listKycDocuments().catch(() => []), listMyCreditRequests().catch(() => [])]);
        const creditDocs = (
          await Promise.all(
            requests.map(async (request) => {
              const docs = await listCreditRequestDocuments(request.id).catch(() => [] as CreditDocument[]);
              return docs.map((doc, index) => toRow(doc, 'CREDIT', kyc.length + index, { id: request.id, status: request.status }));
            }),
          )
        ).flat();
        const next = [...kyc.map((doc, index) => toRow(doc, 'KYC', index)), ...creditDocs];
        setRows(next);
      } catch {
        setRows([]);
      } finally {
        setLoaded(true);
      }
    };
    void load();
    const onChange = () => void load();
    window.addEventListener(REQUESTS_CHANGED_EVENT, onChange);
    return () => window.removeEventListener(REQUESTS_CHANGED_EVENT, onChange);
  }, []);

  const visible = useMemo(() => {
    if (filter === 'ALL') {
      return rows;
    }
    return rows.filter((row) => (filter === 'KYC' ? row.category === 'Identité' : row.category.startsWith('Dossier')));
  }, [filter, rows]);

  const kycCount = rows.filter((row) => row.category === 'Identité').length;
  const creditCount = rows.length - kycCount;

  return (
    <Screen viewId="view-client-documents">
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <i className="fas fa-folder-closed text-primary mr-2"></i> Mes pièces justificatives
          </h2>
          <p className="page-subtitle">Chaque pièce est lue par le système après dépôt. L’agent confirme ensuite la conformité. Une pièce peut être retirée tant qu’elle n’a pas été contrôlée.</p>
        </div>
        <div className="page-actions">
          <Button onClick={() => callApp('openUploadDocumentModal')}>
            <i className="fas fa-cloud-arrow-up"></i> Téléverser un document
          </Button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div className="card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap', padding: '0.85rem 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <label htmlFor="client-docs-filter-select" style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              Filtrer
            </label>
            <CfSelect
              id="client-docs-filter-select"
              className="form-control"
              style={{ width: 'auto', minWidth: 240 }}
              value={filter}
              onChange={(event) => setFilter(event.target.value as DocFilter)}
            >
              <option value="ALL">Tous les documents ({rows.length})</option>
              <option value="KYC">Identité ({kycCount})</option>
              <option value="CREDIT">Dossiers de crédit ({creditCount})</option>
            </CfSelect>
          </div>
        </div>
      </div>

      {loaded && !rows.length ? (
        <div className="card">
          <div className="card-body">
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.86rem' }}>Aucun document n’est encore enregistré pour ce compte.</p>
          </div>
        </div>
      ) : (
        <AppTable
          chrome="plain"
          title="Pièces justificatives"
          items={visible}
          onRowAction={(key) => callApp('openDocLightbox', String(key))}
          columns={[
            { id: 'title', label: 'Document', isRowHeader: true, render: (row) => row.title },
            { id: 'file', label: 'Fichier', render: (row) => row.file },
            { id: 'category', label: 'Catégorie', render: (row) => row.category },
            { id: 'status', label: 'Contrôle', render: (row) => row.status },
            { id: 'date', label: 'Date', render: (row) => row.validityLabel },
            {
              id: 'actions',
              label: '',
              className: 'actions',
              render: (row) => (
                <div style={{ display: 'flex', gap: '0.3rem', justifyContent: 'flex-end' }} onClick={(event) => event.stopPropagation()}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-xs"
                    title="Voir la pièce"
                    onClick={(event) => {
                      event.stopPropagation();
                      callApp('openDocLightbox', row.id);
                    }}
                  >
                    <i className="fas fa-eye"></i>
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-xs"
                    title={row.removeHint}
                    disabled={!row.removable || removing === row.id}
                    onClick={(event) => {
                      event.stopPropagation();
                      void removeRow(row);
                    }}
                  >
                    <i className={`fas ${removing === row.id ? 'fa-spinner fa-spin' : 'fa-trash-can'}`}></i>
                  </button>
                </div>
              ),
            },
          ]}
        />
      )}
    </Screen>
  );
}
