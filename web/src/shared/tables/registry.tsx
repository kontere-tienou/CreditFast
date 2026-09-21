import type { ReactNode } from 'react';
import { Badge, BadgeWithDot } from '@/components/base/badges/badges';
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

function callApp(method: string, ...args: Array<string | number>) {
  const app = (window as unknown as { App?: Record<string, (...params: Array<string | number>) => void> }).App;
  app?.[method]?.(...args);
}

function PersonCell({ title, subtitle }: { title: string; subtitle: string }) {
  const initials = title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <div className="cf-table-person">
      <span className="cf-table-avatar" aria-hidden>
        {initials || '•'}
      </span>
      <div className="cf-table-stack">
        <p className="cf-table-strong">{title}</p>
        {subtitle ? (
          <p className="cf-table-muted" title={subtitle}>
            {subtitle}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function DetailsButton({ onClick, label = 'Afficher' }: { onClick: () => void; label?: string }) {
  return (
    <div className="cf-table-actions">
      <button
        type="button"
        className="cf-table-icon-btn is-view"
        title={label}
        onClick={(event) => {
          event.stopPropagation();
          onClick();
        }}
      >
        <i className="fas fa-eye"></i>
      </button>
    </div>
  );
}

const extraPeople = [
  { name: 'Awa Diarra', req: 'REQ-2026-0896' },
  { name: 'Moussa Coulibaly', req: 'REQ-2026-0897' },
  { name: 'Aminata Traoré', req: 'REQ-2026-0898' },
  { name: 'Oumar Cissé', req: 'REQ-2026-0899' },
  { name: 'Mariam Sow', req: 'REQ-2026-0901' },
  { name: 'Boubacar Diallo', req: 'REQ-2026-0902' },
  { name: 'Hawa Touré', req: 'REQ-2026-0903' },
  { name: 'Abdoulaye Keita', req: 'REQ-2026-0904' },
];

const extraStatuses: Array<{ status: string; statusTone: LoanRow['statusTone'] }> = [
  { status: 'En analyse', statusTone: 'brand' },
  { status: 'Comité', statusTone: 'warning' },
  { status: 'Accordé', statusTone: 'success' },
  { status: 'Vérif. requise', statusTone: 'gray' },
];

const extraClientRequests: LoanRow[] = extraPeople.map((person, index) => ({
  id: person.req,
  name: person.name,
  subtitle: 'Fonds de commerce',
  amount: `${(700_000 + index * 180_000).toLocaleString('fr-FR')} FCFA`,
  amountValue: 700000 + index * 180000,
  status: index % 3 === 0 ? 'En cours' : 'Clôturé',
  statusTone: index % 3 === 0 ? 'brand' : 'success',
  date: `${String(10 + index).padStart(2, '0')}/07/2026`,
}));

const extraPipeline: LoanRow[] = extraPeople.map((person, index) => ({
  id: String(6 + index),
  name: person.name,
  subtitle: person.req,
  amount: `${(900_000 + index * 220_000).toLocaleString('fr-FR')} FCFA`,
  amountValue: 900000 + index * 220000,
  ...extraStatuses[index % extraStatuses.length],
}));

const extraGuarantees = ['Stock & marchandises', 'Équipement & matériel', 'Caution solidaire', 'Véhicule utilitaire'];

const extraInspections = extraPeople.map((person, index) => ({
  id: String(5 + index),
  name: person.name,
  subtitle: person.req,
  amount: `${(1_200_000 + index * 300_000).toLocaleString('fr-FR')} FCFA`,
  guarantee: extraGuarantees[index % extraGuarantees.length],
  status: index % 4 === 0 ? 'À inspecter' : 'Vérifiée',
  statusTone: (index % 4 === 0 ? 'warning' : 'success') as LoanRow['statusTone'],
}));

const extraComplements = extraPeople.map((person, index) => ({
  id: String(104 + index),
  name: person.name,
  subtitle: person.req,
  piece: ['Facture proforma DGI actualisée', 'CNI recto / verso certifié', 'Engagement caution solidaire', 'Quittance loyer 3 mois'][index % 4],
}));

const extraAnomalies = extraPeople.map((person, index) => ({
  id: String(4 + index),
  name: person.name,
  subtitle: person.req,
  rule: ['Validité temporelle pièce proforma', 'Concordance devis vs demande', 'Ratio reste à vivre / échéance', 'Identité OCR vs dossier'][index % 4],
  severity: index % 2 === 0 ? 'Critique' : 'Avertissement',
}));

const clientRequests: LoanRow[] = [
  {
    id: 'REQ-2026-0891',
    name: 'Fatou Ndiaye',
    subtitle: 'Achat de stock tissus wax Tabaski',
    amount: '2 500 000 FCFA',
    amountValue: 2500000,
    status: 'En cours',
    statusTone: 'brand',
    date: '11/08/2026',
  },
  {
    id: 'REQ-2025-0412',
    name: 'Aminata Diallo',
    subtitle: 'Équipement machine à coudre industrielle',
    amount: '1 200 000 FCFA',
    amountValue: 1200000,
    status: 'Clôturé',
    statusTone: 'success',
    date: '14/04/2025',
  },
  {
    id: 'REQ-2024-0199',
    name: 'Mariam Sow',
    subtitle: 'Fonds de roulement boutique Médina',
    amount: '800 000 FCFA',
    amountValue: 800000,
    status: 'Clôturé',
    statusTone: 'success',
    date: '03/02/2024',
  },
  ...extraClientRequests,
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

export const pipelineRows: LoanRow[] = [
  { id: '1', name: 'Fatou Ndiaye', subtitle: 'REQ-2026-0891', amount: '2 500 000 FCFA', amountValue: 2500000, status: 'En analyse', statusTone: 'brand' },
  { id: '2', name: 'Amadou Sanogo', subtitle: 'REQ-2026-0892', amount: '5 000 000 FCFA', amountValue: 5000000, status: 'Comité', statusTone: 'warning' },
  { id: '3', name: 'Kodjo Mensah', subtitle: 'REQ-2026-0893', amount: '1 800 000 FCFA', amountValue: 1800000, status: 'Vérif. requise', statusTone: 'gray' },
  { id: '4', name: 'Gérard Dossou', subtitle: 'REQ-2026-0894', amount: '3 200 000 FCFA', amountValue: 3200000, status: 'Accordé', statusTone: 'success' },
  { id: '5', name: 'Ibrahima Koné', subtitle: 'REQ-2026-0895', amount: '800 000 FCFA', amountValue: 800000, status: 'En analyse', statusTone: 'brand' },
  ...extraPipeline,
];

export const inspectionRows = [
  { id: '1', name: 'Fatou Ndiaye', subtitle: 'REQ-2026-0891', amount: '3 400 000 FCFA', guarantee: 'Stock & marchandises', status: 'Vérifiée', statusTone: 'success' as LoanRow['statusTone'] },
  { id: '2', name: 'Amadou Sanogo', subtitle: 'REQ-2026-0892', amount: '7 000 000 FCFA', guarantee: 'Équipement & matériel', status: 'Vérifiée', statusTone: 'success' as LoanRow['statusTone'] },
  { id: '3', name: 'Kodjo Mensah', subtitle: 'REQ-2026-0893', amount: '2 000 000 FCFA', guarantee: 'Caution solidaire', status: 'À inspecter', statusTone: 'warning' as LoanRow['statusTone'] },
  { id: '4', name: 'Ibrahima Koné', subtitle: 'REQ-2026-0895', amount: '1 000 000 FCFA', guarantee: 'Caution solidaire', status: 'Vérifiée', statusTone: 'success' as LoanRow['statusTone'] },
  ...extraInspections,
];

export const complementRows = [
  { id: '101', name: 'Kodjo Mensah', subtitle: 'REQ-2026-0893', piece: 'Facture proforma DGI actualisée' },
  { id: '102', name: 'Kodjo Mensah', subtitle: 'REQ-2026-0893', piece: 'CNI recto / verso certifié' },
  { id: '103', name: 'Ibrahima Koné', subtitle: 'REQ-2026-0895', piece: 'Engagement caution solidaire' },
  ...extraComplements,
];

export const anomalyRows = [
  { id: '1', name: 'Kodjo Mensah', subtitle: 'REQ-2026-0893', rule: 'Validité temporelle pièce proforma', severity: 'Critique' },
  { id: '2', name: 'Kodjo Mensah', subtitle: 'REQ-2026-0893', rule: 'Concordance devis vs demande', severity: 'Avertissement' },
  { id: '3', name: 'Kodjo Mensah', subtitle: 'REQ-2026-0893', rule: 'Ratio reste à vivre / échéance', severity: 'Critique' },
  ...extraAnomalies,
];

function LoanStatus({ tone, label }: { tone: LoanRow['statusTone']; label: string }) {
  return (
    <BadgeWithDot size="sm" color={tone === 'brand' ? 'brand' : tone} type="modern">
      {label}
    </BadgeWithDot>
  );
}

export function ClientRequestsTable() {
  return (
    <AppTable
      title="Historique de mes Demandes de Crédit"
      badge={`${clientRequests.length} dossiers`}
      description="Suivi de vos prêts déposés auprès de CreditFast"
      items={clientRequests.map((row) => ({ ...row, date: row.date ?? '' }))}
      selectionMode="multiple"
      onRowAction={(key) => callApp('openClientRequestDrawer', String(key))}
      columns={[
        { id: 'name', label: 'Emprunteur', isRowHeader: true, allowsSorting: true, render: (item) => <PersonCell title={item.name} subtitle={item.date ?? ''} /> },
        { id: 'subtitle', label: 'Objet', allowsSorting: true, render: (item) => <span>{item.subtitle}</span> },
        { id: 'amountValue', label: 'Montant', allowsSorting: true, render: (item) => <span className="cf-table-amount">{item.amount}</span> },
        { id: 'status', label: 'Statut', allowsSorting: true, render: (item) => <LoanStatus tone={item.statusTone} label={item.status} /> },
        {
          id: 'actions',
          label: 'Action',
          className: 'cf-table-actions-col',
          render: (item) => <DetailsButton onClick={() => callApp('openClientRequestDrawer', item.id)} />,
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
      onRowAction={(key) => callApp('openScheduleDrawer', String(key))}
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
      searchable={false}
      showMenu={false}
      items={scheduleRows.slice(0, 4).map((row) => ({
        ...row,
        name: `Mensualité N° ${row.installment}`,
      }))}
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
      onRowAction={(key) => callApp('openAgentDrawer', String(key))}
      columns={[
        { id: 'name', label: 'Emprunteur', isRowHeader: true, allowsSorting: true, render: (item) => <PersonCell title={item.name} subtitle="Bamako • Commerce" /> },
        { id: 'amountValue', label: 'Montant', allowsSorting: true, render: (item) => <PersonCell title={item.amount} subtitle="12 mois" /> },
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
      items={inspectionRows}
      onRowAction={(key) => callApp('openInspectionDrawer', String(key))}
      columns={[
        { id: 'name', label: 'Dossier & Emprunteur', isRowHeader: true, allowsSorting: true, render: (item) => <PersonCell title={item.name} subtitle={item.subtitle} /> },
        { id: 'guarantee', label: 'Type de Garantie', render: (item) => item.guarantee },
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
      items={complementRows}
      onRowAction={(key) => callApp('openComplementsDrawer', String(key))}
      columns={[
        { id: 'name', label: 'Dossier & Emprunteur', isRowHeader: true, allowsSorting: true, render: (item) => <PersonCell title={item.name} subtitle={item.subtitle} /> },
        { id: 'piece', label: 'Pièce Attendue', render: (item) => item.piece },
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
      onRowAction={(key) => callApp('openAnalystDossierDrawer', String(key))}
      columns={[
        { id: 'name', label: 'Dossier & Emprunteur', isRowHeader: true, allowsSorting: true, render: (item) => <PersonCell title={item.name} subtitle={item.subtitle} /> },
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
      items={anomalyRows}
      onRowAction={(key) => callApp('openAnomalyDrawer', String(key))}
      columns={[
        { id: 'name', label: 'Dossier & Emprunteur', isRowHeader: true, allowsSorting: true, render: (item) => <PersonCell title={item.name} subtitle={item.subtitle} /> },
        { id: 'rule', label: 'Anomalie & Règle', render: (item) => item.rule },
        { id: 'severity', label: 'Gravité', render: (item) => <Badge color={item.severity === 'Critique' ? 'error' : 'warning'}>{item.severity}</Badge> },
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
  { id: 'f8', name: 'Ancienneté relation agence', type: 'Relation', weight: '4%' },
  { id: 'f9', name: 'Diversification des revenus', type: 'Activité', weight: '3%' },
  { id: 'f10', name: 'Endettement hors CreditFast', type: 'Financier', weight: '3%' },
  { id: 'f11', name: 'Qualité du dossier GED', type: 'Intégrité', weight: '2%' },
  { id: 'f12', name: 'Présence caution morale', type: 'Garantie', weight: '2%' },
];

const scoringColdStart = [
  { id: 'c1', name: 'Capacité nette de remboursement', type: 'Financier', weight: '35% (+10%)' },
  { id: 'c2', name: 'Stabilité & ancienneté activité', type: 'Activité', weight: '25% (+10%)' },
  { id: 'c3', name: 'Garanties & caution solidaire', type: 'Garantie', weight: '20% (+10%)' },
  { id: 'c4', name: "Zone d'habitation", type: 'Contexte', weight: '10% (+5%)' },
  { id: 'c5', name: 'Rapprochement OCR', type: 'Intégrité', weight: '10%' },
  { id: 'c6', name: 'Historique crédit / épargne', type: 'Non applicable', weight: '0%' },
  { id: 'c7', name: 'Ancienneté relation agence', type: 'Relation', weight: '4%' },
  { id: 'c8', name: 'Diversification des revenus', type: 'Activité', weight: '3%' },
  { id: 'c9', name: 'Présence caution morale', type: 'Garantie', weight: '3%' },
  { id: 'c10', name: 'Qualité du dossier GED', type: 'Intégrité', weight: '2%' },
  { id: 'c11', name: 'Régularité des dépôts', type: 'Comportement', weight: '2%' },
  { id: 'c12', name: 'Proximité agence', type: 'Contexte', weight: '1%' },
];

function ScoringTable({ title, items }: { title: string; items: { id: string; name: string; type: string; weight: string }[] }) {
  return (
    <AppTable
      chrome="plain"
      title={title}
      items={items}
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
      badge={`${pipelineRows.length} dossiers`}
      items={pipelineRows}
      onRowAction={(key) => callApp('openCommitteeModal', String(key))}
      columns={[
        { id: 'name', label: 'Dossier & Emprunteur', isRowHeader: true, allowsSorting: true, render: (item) => <PersonCell title={item.name} subtitle={item.subtitle} /> },
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
      onRowAction={(key) => callApp('openCommitteeDrawer', String(key))}
      columns={[
        { id: 'name', label: 'Dossier & Emprunteur', isRowHeader: true, allowsSorting: true, render: (item) => <PersonCell title={item.name} subtitle={item.subtitle} /> },
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
  const items = [
    { id: 'PV-2026-0889', req: 'REQ-2026-0889', name: 'Seydou Keita', city: 'Bamako', amount: '3 000 000 FCFA', terms: '9.5% • 18 mois', decision: 'ACCORD' as const, quorum: '3/3', date: '18/08/2026' },
    { id: 'PV-2026-0884', req: 'REQ-2026-0884', name: 'Aïssatou Ba', city: 'Bamako', amount: '1 800 000 FCFA', terms: '10.0% • 12 mois', decision: 'ACCORD' as const, quorum: '3/3', date: '17/08/2026' },
    { id: 'PV-2026-0878', req: 'REQ-2026-0878', name: 'Mahamadou Ouedraogo', city: 'Bamako', amount: 'Rejet collégial', terms: 'Refus d’octroi', decision: 'REJET' as const, quorum: 'Rejet', date: '15/08/2026' },
    { id: 'PV-2026-0865', req: 'REQ-2026-0865', name: 'Koffi Mensah', city: 'Bamako', amount: '3 500 000 FCFA', terms: '9.0% • 24 mois', decision: 'ACCORD' as const, quorum: '3/3', date: '12/08/2026' },
    ...extraPeople.map((person, index) => ({
      id: `PV-2026-08${70 + index}`,
      req: person.req,
      name: person.name,
      city: 'Bamako',
      amount: index % 5 === 0 ? 'Rejet collégial' : `${(1_500_000 + index * 200_000).toLocaleString('fr-FR')} FCFA`,
      terms: index % 5 === 0 ? 'Refus d’octroi' : '9.5% • 12 mois',
      decision: (index % 5 === 0 ? 'REJET' : 'ACCORD') as 'ACCORD' | 'REJET',
      quorum: index % 5 === 0 ? 'Rejet' : '3/3',
      date: `${String(11 - (index % 9)).padStart(2, '0')}/08/2026`,
    })),
  ];

  return (
    <AppTable
      title="Procès-Verbaux Validés & Notifiés aux Agences"
      description="Cliquez sur une ligne ou sur Détails pour ouvrir le procès-verbal scellé."
      badge={`${items.length} actes`}
      items={items}
      onRowAction={(key) => callApp('openSignedPvDrawer', String(key))}
      columns={[
        {
          id: 'name',
          label: 'Emprunteur',
          isRowHeader: true,
          allowsSorting: true,
          render: (item) => <PersonCell title={item.name} subtitle={item.city} />,
        },
        {
          id: 'amount',
          label: 'Conditions',
          render: (item) => <PersonCell title={item.amount} subtitle={item.terms} />,
        },
        {
          id: 'date',
          label: 'Date',
          allowsSorting: true,
          render: (item) => item.date,
        },
        {
          id: 'decision',
          label: 'Validation',
          allowsSorting: true,
          render: (item) => (
            <Badge color={item.decision === 'ACCORD' ? 'success' : 'error'}>
              {item.decision === 'ACCORD' ? item.quorum : 'Rejet'}
            </Badge>
          ),
        },
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
    { id: 'bko-sabalibougou', name: 'Sabalibougou', volume: '18 600 000 FCFA', dossiers: '49 dossiers', score: '77 / 100', par: '2.4%', status: 'Conforme' },
    { id: 'bko-lafiabougou', name: 'Lafiabougou', volume: '16 100 000 FCFA', dossiers: '42 dossiers', score: '80 / 100', par: '1.8%', status: '100% Conforme' },
    { id: 'bko-kalaban', name: 'Kalaban Coura', volume: '27 900 000 FCFA', dossiers: '73 dossiers', score: '76 / 100', par: '2.7%', status: 'Conforme' },
    { id: 'bko-magnambougou', name: 'Magnambougou', volume: '14 200 000 FCFA', dossiers: '38 dossiers', score: '71 / 100', par: '3.8%', status: 'Sous surveillance' },
    { id: 'bko-sotuba', name: 'Sotuba', volume: '19 800 000 FCFA', dossiers: '55 dossiers', score: '79 / 100', par: '2.0%', status: 'Conforme' },
    { id: 'bko-niarela', name: 'Niaréla', volume: '33 400 000 FCFA', dossiers: '91 dossiers', score: '83 / 100', par: '1.2%', status: '100% Conforme' },
    { id: 'bko-badalabougou', name: 'Badalabougou', volume: '21 050 000 FCFA', dossiers: '58 dossiers', score: '75 / 100', par: '2.9%', status: 'Conforme' },
    { id: 'bko-faladie', name: 'Faladié', volume: '12 700 000 FCFA', dossiers: '34 dossiers', score: '72 / 100', par: '3.5%', status: 'Sous surveillance' },
    { id: 'bko-banconi', name: 'Banconi', volume: '15 300 000 FCFA', dossiers: '41 dossiers', score: '78 / 100', par: '2.2%', status: 'Conforme' },
  ];

  return (
    <AppTable
      chrome="plain"
      title="Répartition des Crédits par Caisses & Agences CreditFast (Bamako)"
      items={items}
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
    { id: 'a5', time: '15/09/2026 17:44', action: 'INSPECTION_CLOSE', entity: 'REQ-2026-0892', details: 'Visite terrain validée', ip: '41.203.12.21' },
    { id: 'a6', time: '15/09/2026 14:08', action: 'DOC_REJECT', entity: 'REQ-2026-0893', details: 'Proforma expirée rejetée OCR', ip: '102.22.88.9' },
    { id: 'a7', time: '14/09/2026 19:33', action: 'SCORE_RUN', entity: 'REQ-2026-0895', details: 'Recalcul grille Cold Start', ip: '41.203.12.18' },
    { id: 'a8', time: '14/09/2026 11:02', action: 'RELANCE_SMS', entity: 'REQ-2026-0893', details: 'Relance pièce manquante', ip: '102.22.88.11' },
    { id: 'a9', time: '13/09/2026 16:27', action: 'COMMITTEE_OPEN', entity: 'SEANCE-44', details: 'Ouverture séance comité', ip: '41.203.12.18' },
    { id: 'a10', time: '13/09/2026 09:55', action: 'PROFILE_UPDATE', entity: 'ML-BKO-008821', details: 'Coordonnées emprunteur mises à jour', ip: '102.22.88.9' },
    { id: 'a11', time: '12/09/2026 18:41', action: 'DOC_UPLOAD', entity: 'REQ-2026-0891', details: 'CNI certifiée jointe', ip: '41.203.12.21' },
    { id: 'a12', time: '12/09/2026 08:19', action: 'LOGIN', entity: 'SESSION', details: 'Connexion espace comité', ip: '41.203.12.18' },
  ];

  return (
    <AppTable
      title="Piste d'Audit & Journal des Événements"
      badge="Immuable"
      items={items}
      columns={[
        { id: 'time', label: 'Horodatage', isRowHeader: true, allowsSorting: true, render: (item) => item.time },
        { id: 'action', label: 'Action', allowsSorting: true, render: (item) => <Badge color="brand">{item.action}</Badge> },
        { id: 'entity', label: 'Entité Modifiée', allowsSorting: true, render: (item) => item.entity },
        { id: 'details', label: "Détails de l'Opération", render: (item) => item.details },
        { id: 'ip', label: 'Adresse IP', render: (item) => item.ip },
      ]}
    />
  );
}

export type ClientDocumentRow = {
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
};

export function ClientDocumentsTable({ items }: { items: ClientDocumentRow[] }) {
  return (
    <AppTable
      chrome="plain"
      title="Pièces justificatives"
      items={items}
      defaultSort={{ column: 'sortIndex', direction: 'ascending' }}
      onRowAction={(key) => callApp('openDocLightbox', String(key))}
      rowClassName={(item) => (item.expiring ? 'cf-table-row-danger' : undefined)}
      columns={[
        {
          id: 'title',
          label: 'Document',
          isRowHeader: true,
          allowsSorting: true,
          render: (item) => <PersonCell title={item.title} subtitle={item.file} />,
        },
        { id: 'category', label: 'Catégorie', allowsSorting: true, render: (item) => item.category },
        {
          id: 'validityValue',
          label: 'Validité',
          allowsSorting: true,
          render: (item) => (
            <span className={item.expiring ? 'cf-table-danger-text' : undefined}>{item.validityLabel}</span>
          ),
        },
        {
          id: 'status',
          label: 'Statut',
          allowsSorting: true,
          render: (item) => (
            <Badge size="sm" color={item.expiring ? 'error' : 'success'}>
              {item.status}
            </Badge>
          ),
        },
        {
          id: 'actions',
          className: 'cf-table-actions-col',
          render: (item) => (
            <div className="cf-table-actions">
              <DetailsButton label="Aperçu" onClick={() => callApp('openDocLightbox', item.id)} />
            </div>
          ),
        },
      ]}
    />
  );
}

export const appTables: Record<string, ReactNode> = {
  'client-requests': <ClientRequestsTable />,
  'client-documents': <ClientDocumentsTable items={[]} />,
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
