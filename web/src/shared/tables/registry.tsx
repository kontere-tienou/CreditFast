import type { ReactNode } from 'react';
import { Badge, BadgeWithDot } from '@/components/base/badges/badges';
import { Button } from '@/shared/ui/Button';
import { AppTable } from '@/shared/ui/AppTable';

type LoanRow = {
  id: string;
  name: string;
  subtitle: string;
  amount: string;
  amountValue: number;
  status: string;
  statusTone: 'success' | 'warning' | 'brand' | 'gray';
  date?: string;
};

function callApp(method: string, ...args: string[]) {
  const app = (window as unknown as { App?: Record<string, (...params: string[]) => void> }).App;
  app?.[method]?.(...args);
}

function PersonCell({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="cf-table-stack">
      <p className="cf-table-strong">{title}</p>
      <p className="cf-table-muted">{subtitle}</p>
    </div>
  );
}

function DetailsButton({ onClick, label = 'Détails' }: { onClick: () => void; label?: string }) {
  return (
    <Button variant="secondary" onClick={onClick}>
      {label}
    </Button>
  );
}

const clientRequests: LoanRow[] = [
  {
    id: 'REQ-2026-0891',
    name: 'REQ-2026-0891',
    subtitle: 'Achat de stock tissus wax Tabaski • Agence Grand Marché',
    amount: '2 500 000 FCFA',
    amountValue: 2500000,
    status: 'En cours',
    statusTone: 'brand',
    date: '11/08/2026',
  },
  {
    id: 'REQ-2025-0412',
    name: 'REQ-2025-0412',
    subtitle: 'Équipement machine à coudre industrielle',
    amount: '1 200 000 FCFA',
    amountValue: 1200000,
    status: 'Clôturé',
    statusTone: 'success',
    date: '14/04/2025',
  },
  {
    id: 'REQ-2024-0199',
    name: 'REQ-2024-0199',
    subtitle: 'Fonds de roulement boutique Médina',
    amount: '800 000 FCFA',
    amountValue: 800000,
    status: 'Clôturé',
    statusTone: 'success',
    date: '03/02/2024',
  },
];

const scheduleRows = Array.from({ length: 12 }, (_, index) => {
  const n = index + 1;
  const paid = n <= 2;
  const due = n === 3;
  return {
    id: `ECH-${n}`,
    installment: n,
    name: `Échéance N° ${n}`,
    date: `05/${String((6 + index) % 12 || 12).padStart(2, '0')}/2026`,
    amount: '235 000 FCFA',
    principal: '200 195 FCFA',
    remaining: `${(2300000 - index * 200000).toLocaleString('fr-FR')} FCFA`,
    status: paid ? 'Payée' : due ? 'Exigible' : 'À venir',
    statusTone: (paid ? 'success' : due ? 'warning' : 'gray') as LoanRow['statusTone'],
  };
});

const pipelineRows: LoanRow[] = [
  { id: 'REQ-2026-0891', name: 'Fatou Ndiaye', subtitle: 'REQ-2026-0891', amount: '2 500 000 FCFA', amountValue: 2500000, status: 'En analyse', statusTone: 'brand' },
  { id: 'REQ-2026-0902', name: 'Amadou Sanogo', subtitle: 'REQ-2026-0902', amount: '1 800 000 FCFA', amountValue: 1800000, status: 'Comité', statusTone: 'warning' },
  { id: 'REQ-2026-0844', name: 'Aïssata Diallo', subtitle: 'REQ-2026-0844', amount: '950 000 FCFA', amountValue: 950000, status: 'Soumise', statusTone: 'gray' },
  { id: 'REQ-2026-0811', name: 'Ibrahim Coulibaly', subtitle: 'REQ-2026-0811', amount: '3 200 000 FCFA', amountValue: 3200000, status: 'Accordé', statusTone: 'success' },
];

function LoanStatus({ tone, label }: { tone: LoanRow['statusTone']; label: string }) {
  return (
    <BadgeWithDot size="sm" color={tone === 'brand' ? 'indigo' : tone} type="modern">
      {label}
    </BadgeWithDot>
  );
}

export function ClientRequestsTable() {
  return (
    <AppTable
      title="Historique de mes Demandes de Crédit"
      badge="3 dossiers"
      description="Suivi de vos prêts déposés auprès de CreditFast"
      items={clientRequests.map((row) => ({ ...row, date: row.date ?? '' }))}
      selectionMode="multiple"
      columns={[
        { id: 'name', label: 'Réf. Dossier', isRowHeader: true, allowsSorting: true, render: (item) => <PersonCell title={item.name} subtitle={item.date ?? ''} /> },
        { id: 'subtitle', label: 'Objet du Financement', allowsSorting: true, render: (item) => <span>{item.subtitle}</span> },
        { id: 'amountValue', label: 'Montant Demandé', allowsSorting: true, render: (item) => <span className="cf-table-amount">{item.amount}</span> },
        { id: 'status', label: 'Statut', allowsSorting: true, render: (item) => <LoanStatus tone={item.statusTone} label={item.status} /> },
        {
          id: 'actions',
          label: '',
          render: (item) => (
            <div className="cf-table-actions">
              <DetailsButton onClick={() => callApp('openClientRequestDrawer', item.id)} />
            </div>
          ),
        },
      ]}
    />
  );
}

export function ClientScheduleTable() {
  return (
    <AppTable
      chrome="plain"
      title="Échéancier"
      items={scheduleRows}
      pageSize={6}
      columns={[
        { id: 'installment', label: 'Échéance', isRowHeader: true, allowsSorting: true, render: (item) => <strong>{item.name}</strong> },
        { id: 'date', label: 'Date Limite', allowsSorting: true, render: (item) => item.date },
        { id: 'amount', label: 'Mensualité', render: (item) => <span className="cf-table-amount">{item.amount}</span> },
        { id: 'principal', label: 'Amortissement', className: 'cf-hide-sm', render: (item) => item.principal },
        { id: 'remaining', label: 'Capital Restant', className: 'cf-hide-md', render: (item) => item.remaining },
        { id: 'status', label: 'Statut', allowsSorting: true, render: (item) => <LoanStatus tone={item.statusTone} label={item.status} /> },
        {
          id: 'actions',
          render: (item) => (
            <div className="cf-table-actions">
              <DetailsButton onClick={() => callApp('openScheduleDrawer', item.id)} />
            </div>
          ),
        },
      ]}
    />
  );
}

export function ClientCalendarTable() {
  return (
    <AppTable
      chrome="plain"
      className="cf-table-compact"
      title="Calendrier"
      items={scheduleRows.slice(0, 4).map((row) => ({
        ...row,
        name: `Mensualité N° ${row.installment}`,
      }))}
      pageSize={4}
      columns={[
        {
          id: 'name',
          label: 'Règlement',
          isRowHeader: true,
          render: (item) => (
            <span className="cf-table-truncate" title={item.name}>
              {item.name}
            </span>
          ),
        },
        {
          id: 'date',
          label: 'Date prévue',
          render: (item) => (
            <span className="cf-table-truncate" title={item.date}>
              {item.date}
            </span>
          ),
        },
        {
          id: 'amount',
          label: 'Montant',
          render: (item) => (
            <span className="cf-table-amount cf-table-truncate" title={item.amount}>
              {item.amount.replaceAll(' ', '\u00a0')}
            </span>
          ),
        },
        {
          id: 'status',
          label: 'État',
          render: (item) => (
            <span className="cf-table-truncate" title={item.status}>
              <LoanStatus tone={item.statusTone} label={item.status} />
            </span>
          ),
        },
      ]}
    />
  );
}

export function AgentPipelineTable() {
  return (
    <AppTable
      chrome="plain"
      title="Pipeline"
      items={pipelineRows}
      columns={[
        { id: 'id', label: 'N° Dossier', isRowHeader: true, allowsSorting: true, render: (item) => <span className="cf-table-strong">{item.id}</span> },
        { id: 'name', label: 'Client Emprunteur', allowsSorting: true, render: (item) => <PersonCell title={item.name} subtitle="Bamako • Commerce" /> },
        { id: 'amountValue', label: 'Montant & Durée', allowsSorting: true, render: (item) => <PersonCell title={item.amount} subtitle="12 mois" /> },
        { id: 'status', label: 'Statut', allowsSorting: true, render: (item) => <LoanStatus tone={item.statusTone} label={item.status} /> },
        {
          id: 'actions',
          render: (item) => (
            <div className="cf-table-actions">
              <DetailsButton onClick={() => callApp('openAgentDrawer', item.id)} />
            </div>
          ),
        },
      ]}
    />
  );
}

export function AgentInspectionsTable() {
  return (
    <AppTable
      title="Registre des Inspections Matérielles & Cautions Solidaires"
      badge="Temps réel"
      items={pipelineRows}
      columns={[
        { id: 'name', label: 'Dossier & Emprunteur', isRowHeader: true, allowsSorting: true, render: (item) => <PersonCell title={item.name} subtitle={item.id} /> },
        { id: 'subtitle', label: 'Type de Garantie', render: () => 'Stock & marchandises' },
        { id: 'amount', label: 'Valorisation', render: (item) => <PersonCell title={item.amount} subtitle="Retenue 90%" /> },
        { id: 'status', label: 'Statut Contrôle', render: (item) => <LoanStatus tone={item.statusTone} label={item.status} /> },
        {
          id: 'actions',
          render: (item) => (
            <div className="cf-table-actions">
              <DetailsButton onClick={() => callApp('openInspectionDrawer', item.id)} />
            </div>
          ),
        },
      ]}
    />
  );
}

export function AgentComplementsTable() {
  return (
    <AppTable
      title="File d'Attente des Pièces à Collecter & Relancer"
      badge="Actions requises"
      description="Cliquez sur Détails pour régulariser le dossier"
      items={pipelineRows.slice(0, 3)}
      columns={[
        { id: 'name', label: 'Dossier & Emprunteur', isRowHeader: true, allowsSorting: true, render: (item) => <PersonCell title={item.name} subtitle={item.id} /> },
        { id: 'subtitle', label: 'Pièce Attendue', render: () => 'Facture proforma DGI' },
        { id: 'date', label: 'Dernière Relance', render: () => '12/08/2026' },
        { id: 'status', label: 'Statut GED', render: () => <Badge color="warning">En attente</Badge> },
        {
          id: 'actions',
          render: (item) => (
            <div className="cf-table-actions">
              <DetailsButton onClick={() => callApp('openComplementsDrawer', item.id)} label="Relancer" />
            </div>
          ),
        },
      ]}
    />
  );
}

export function AnalystDossiersTable() {
  return (
    <AppTable
      title="Dossiers à instruire"
      badge={`${pipelineRows.length} dossiers`}
      items={pipelineRows}
      columns={[
        { id: 'name', label: 'Dossier & Emprunteur', isRowHeader: true, allowsSorting: true, render: (item) => <PersonCell title={item.name} subtitle={item.id} /> },
        { id: 'amountValue', label: 'Montant Demandé', allowsSorting: true, render: (item) => <span className="cf-table-amount">{item.amount}</span> },
        { id: 'score', label: 'Score Risque', render: () => <strong>78 / 100</strong> },
        { id: 'status', label: 'Statut', allowsSorting: true, render: (item) => <LoanStatus tone={item.statusTone} label={item.status} /> },
        {
          id: 'actions',
          render: (item) => (
            <div className="cf-table-actions">
              <DetailsButton onClick={() => callApp('openAnalystDossierDrawer', item.id)} label="Détails 360°" />
            </div>
          ),
        },
      ]}
    />
  );
}

export function AnalystAnomaliesTable() {
  return (
    <AppTable
      title="Registre Opérationnel des Signaux & Anomalies"
      badge="Contrôles prudentiels"
      items={pipelineRows.slice(0, 3).map((row) => ({ ...row, subtitle: 'Validité temporelle pièce proforma' }))}
      columns={[
        { id: 'name', label: 'Dossier & Emprunteur', isRowHeader: true, allowsSorting: true, render: (item) => <PersonCell title={item.name} subtitle={item.id} /> },
        { id: 'subtitle', label: 'Anomalie & Règle', render: (item) => item.subtitle },
        { id: 'status', label: 'Gravité', render: () => <Badge color="error">Critique</Badge> },
        { id: 'ged', label: 'Statut', render: () => <Badge color="warning">Ouvert</Badge> },
        {
          id: 'actions',
          render: (item) => (
            <div className="cf-table-actions">
              <DetailsButton onClick={() => callApp('openAnomalyDrawer', item.id)} label="360°" />
            </div>
          ),
        },
      ]}
    />
  );
}

const scoringStandard = [
  { id: 'f1', name: 'Capacité nette de remboursement', type: 'Financier', weight: '25%' },
  { id: 'f2', name: 'Comportement crédits antérieurs', type: 'Comportement', weight: '20%' },
  { id: 'f3', name: "Discipline d'épargne CreditFast", type: 'Comportement', weight: '15%' },
  { id: 'f4', name: 'Stabilité & ancienneté activité', type: 'Activité', weight: '15%' },
  { id: 'f5', name: 'Couverture par garanties', type: 'Garantie', weight: '10%' },
  { id: 'f6', name: 'Rapprochement OCR', type: 'Intégrité', weight: '10%' },
  { id: 'f7', name: "Zone d'habitation", type: 'Contexte', weight: '5%' },
];

const scoringColdStart = [
  { id: 'c1', name: 'Capacité nette de remboursement', type: 'Financier', weight: '35% (+10%)' },
  { id: 'c2', name: 'Stabilité & ancienneté activité', type: 'Activité', weight: '25% (+10%)' },
  { id: 'c3', name: 'Garanties & caution solidaire', type: 'Garantie', weight: '20% (+10%)' },
  { id: 'c4', name: "Zone d'habitation", type: 'Contexte', weight: '10% (+5%)' },
  { id: 'c5', name: 'Rapprochement OCR', type: 'Intégrité', weight: '10%' },
  { id: 'c6', name: 'Historique crédit / épargne', type: 'Non applicable', weight: '0%' },
];

function ScoringTable({ title, items }: { title: string; items: { id: string; name: string; type: string; weight: string }[] }) {
  return (
    <AppTable
      chrome="plain"
      title={title}
      items={items}
      pageSize={10}
      columns={[
        { id: 'name', label: 'Facteur Évalué', isRowHeader: true, allowsSorting: true, render: (item) => item.name },
        { id: 'type', label: 'Type', allowsSorting: true, render: (item) => <Badge color="brand">{item.type}</Badge> },
        { id: 'weight', label: 'Pondération', allowsSorting: true, render: (item) => <strong>{item.weight}</strong> },
      ]}
    />
  );
}

export function ScoringStandardTable() {
  return <ScoringTable title="Modèle standard" items={scoringStandard} />;
}

export function ScoringColdStartTable() {
  return <ScoringTable title="Modèle Cold Start" items={scoringColdStart} />;
}

export function CommitteeDossiersTable() {
  return (
    <AppTable
      title="Dossiers Soumis pour Délibération et Vote Électronique"
      badge="5 dossiers"
      items={pipelineRows}
      columns={[
        { id: 'name', label: 'Dossier & Emprunteur', isRowHeader: true, allowsSorting: true, render: (item) => <PersonCell title={item.name} subtitle={item.id} /> },
        { id: 'amountValue', label: 'Montant Demandé', allowsSorting: true, render: (item) => <span className="cf-table-amount">{item.amount}</span> },
        { id: 'score', label: 'Diagnostic Risque XAI', render: () => '78 / 100' },
        { id: 'status', label: 'Statut Délibération', allowsSorting: true, render: (item) => <LoanStatus tone={item.statusTone} label={item.status} /> },
        {
          id: 'actions',
          render: (item) => (
            <div className="cf-table-actions">
              <DetailsButton onClick={() => callApp('openCommitteeVote', item.id)} label="Délibérer" />
            </div>
          ),
        },
      ]}
    />
  );
}

export function CommitteeSessionTable() {
  return (
    <AppTable
      chrome="plain"
      title="Dossiers Transmis par les Analystes Risque"
      badge="Séance en cours"
      items={pipelineRows}
      columns={[
        { id: 'name', label: 'Dossier & Emprunteur', isRowHeader: true, allowsSorting: true, render: (item) => <PersonCell title={item.name} subtitle={item.id} /> },
        { id: 'amount', label: 'Financement', render: (item) => item.amount },
        { id: 'score', label: 'Score Risque IA', render: () => '82 / 100' },
        { id: 'status', label: 'Avis Analyste', render: () => <Badge color="success">Favorable</Badge> },
        {
          id: 'actions',
          render: (item) => (
            <div className="cf-table-actions">
              <DetailsButton onClick={() => callApp('openCommitteeDrawer', item.id)} />
            </div>
          ),
        },
      ]}
    />
  );
}

export function CommitteeSignedTable() {
  return (
    <AppTable
      chrome="plain"
      title="Procès-Verbaux Validés & Notifiés aux Agences"
      items={pipelineRows.slice(0, 3).map((row) => ({ ...row, id: `PV-${row.id}` }))}
      columns={[
        { id: 'id', label: 'Réf. PV / Dossier', isRowHeader: true, allowsSorting: true, render: (item) => item.id },
        { id: 'name', label: 'Emprunteur', allowsSorting: true, render: (item) => item.name },
        { id: 'amount', label: 'Conditions Accordées', render: (item) => item.amount },
        { id: 'status', label: 'Validation', render: () => <Badge color="success">SHA-256</Badge> },
        {
          id: 'actions',
          render: (item) => (
            <div className="cf-table-actions">
              <DetailsButton onClick={() => callApp('openSignedPvDrawer', item.id)} />
            </div>
          ),
        },
      ]}
    />
  );
}

export function CommitteeAgenciesTable() {
  const items = [
    { id: 'bko-centre', name: 'Bamako Centre (Grand Marché)', volume: '54 200 000 FCFA', dossiers: '145 dossiers', score: '82 / 100', par: '1.4%', status: '100% Conforme' },
    { id: 'bko-aci', name: 'Bamako ACI 2000', volume: '31 800 000 FCFA', dossiers: '88 dossiers', score: '79 / 100', par: '2.1%', status: 'Conforme' },
    { id: 'bko-hamdallaye', name: 'Hamdallaye', volume: '22 400 000 FCFA', dossiers: '61 dossiers', score: '74 / 100', par: '3.2%', status: 'Sous surveillance' },
  ];

  return (
    <AppTable
      chrome="plain"
      title="Répartition des Crédits par Caisses & Agences CreditFast (Bamako)"
      items={items}
      pageSize={6}
      columns={[
        { id: 'name', label: 'Caisse & Agence', isRowHeader: true, allowsSorting: true, render: (item) => <strong>{item.name}</strong> },
        { id: 'volume', label: 'Volume & Portefeuille', render: (item) => <PersonCell title={item.volume} subtitle={item.dossiers} /> },
        { id: 'score', label: 'Score Risque Moyen', allowsSorting: true, render: (item) => item.score },
        { id: 'par', label: 'Sinistralité (PAR 30)', render: (item) => item.par },
        { id: 'status', label: 'Statut Conformité', render: (item) => <Badge color="success">{item.status}</Badge> },
      ]}
    />
  );
}

export function AuditLogsTable() {
  const items = [
    { id: 'a1', time: '17/09/2026 21:14', action: 'VOTE_COMMITTEE', entity: 'REQ-2026-0891', details: 'Décision favorable scellée', ip: '41.203.12.18' },
    { id: 'a2', time: '17/09/2026 18:02', action: 'SCORE_OVERRIDE', entity: 'REQ-2026-0902', details: 'Ajustement pondération Cold Start', ip: '41.203.12.18' },
    { id: 'a3', time: '16/09/2026 11:40', action: 'DOC_UPLOAD', entity: 'REQ-2026-0844', details: 'Facture DGI certifiée OCR', ip: '102.22.88.9' },
    { id: 'a4', time: '16/09/2026 09:11', action: 'LOGIN', entity: 'SESSION', details: 'Connexion espace analyste', ip: '102.22.88.9' },
  ];

  return (
    <AppTable
      title="Piste d'Audit & Journal des Événements"
      badge="Immuable"
      items={items}
      columns={[
        { id: 'time', label: 'Horodatage', isRowHeader: true, allowsSorting: true, render: (item) => item.time },
        { id: 'action', label: 'Action', allowsSorting: true, render: (item) => <Badge color="indigo">{item.action}</Badge> },
        { id: 'entity', label: 'Entité Modifiée', allowsSorting: true, render: (item) => item.entity },
        { id: 'details', label: "Détails de l'Opération", render: (item) => item.details },
        { id: 'ip', label: 'Adresse IP', render: (item) => item.ip },
      ]}
    />
  );
}

export const appTables: Record<string, ReactNode> = {
  'client-requests': <ClientRequestsTable />,
  'client-schedule': <ClientScheduleTable />,
  'client-calendar': <ClientCalendarTable />,
  'agent-pipeline': <AgentPipelineTable />,
  'agent-inspections': <AgentInspectionsTable />,
  'agent-complements': <AgentComplementsTable />,
  'analyst-dossiers': <AnalystDossiersTable />,
  'analyst-anomalies': <AnalystAnomaliesTable />,
  'scoring-standard': <ScoringStandardTable />,
  'scoring-coldstart': <ScoringColdStartTable />,
  'committee-dossiers': <CommitteeDossiersTable />,
  'committee-session': <CommitteeSessionTable />,
  'committee-signed': <CommitteeSignedTable />,
  'committee-agencies': <CommitteeAgenciesTable />,
  'audit-logs': <AuditLogsTable />,
};
