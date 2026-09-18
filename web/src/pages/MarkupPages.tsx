import { HtmlView } from '@/shared/ui/HtmlView';
import { appTables } from '@/shared/tables/registry';
import agentClients from '@/markup/agent/clients.html?raw';
import agentComplements from '@/markup/agent/complements.html?raw';
import agentDashboard from '@/markup/agent/dashboard.html?raw';
import agentInspections from '@/markup/agent/inspections.html?raw';
import agentInspectionModal from '@/markup/agent/modal-inspection.html?raw';
import analystAnomalies from '@/markup/analyst/anomalies.html?raw';
import analystDashboard from '@/markup/analyst/dashboard.html?raw';
import analystDossiers from '@/markup/analyst/dossiers.html?raw';
import analystScoring from '@/markup/analyst/scoring-admin.html?raw';
import analystDossierModal from '@/markup/analyst/modal-dossier-360.html?raw';
import clientAdvisor from '@/markup/client/advisor.html?raw';
import clientDashboard from '@/markup/client/dashboard.html?raw';
import clientDocuments from '@/markup/client/documents.html?raw';
import clientRequests from '@/markup/client/requests.html?raw';
import clientSchedule from '@/markup/client/schedule.html?raw';
import clientSimulator from '@/markup/client/simulator.html?raw';
import clientWizard from '@/markup/client/wizard.html?raw';
import clientAppointmentModal from '@/markup/client/modal-appointment.html?raw';
import clientLoanModal from '@/markup/client/modal-loan-application.html?raw';
import clientPaymentModal from '@/markup/client/modal-payment.html?raw';
import committeeAudit from '@/markup/committee/audit-logs.html?raw';
import committeeDashboard from '@/markup/committee/dashboard.html?raw';
import committeeDossiers from '@/markup/committee/dossiers.html?raw';
import committeeModal from '@/markup/committee/modal-committee.html?raw';
import modalDocLightbox from '@/markup/shared/modal-doc-lightbox.html?raw';
import modalEditProfile from '@/markup/shared/modal-edit-profile.html?raw';
import modalQrScanner from '@/markup/shared/modal-qr-scanner.html?raw';
import modalSettings from '@/markup/shared/modal-settings.html?raw';
import modalSuccess from '@/markup/shared/modal-success-animation.html?raw';

type MarkupPageProps = {
  html: string;
  viewId?: string;
};

export function MarkupPage({ html, viewId }: MarkupPageProps) {
  return <HtmlView html={html} viewId={viewId} slots={appTables} />;
}

export const markupPages = {
  clientDashboard: () => <MarkupPage html={clientDashboard} viewId="view-role-client" />,
  clientRequests: () => <MarkupPage html={clientRequests} viewId="view-client-requests" />,
  clientSimulator: () => <MarkupPage html={clientSimulator} viewId="view-client-simulator" />,
  clientSchedule: () => <MarkupPage html={clientSchedule} viewId="view-client-schedule" />,
  clientDocuments: () => <MarkupPage html={clientDocuments} viewId="view-client-documents" />,
  clientAdvisor: () => <MarkupPage html={clientAdvisor} viewId="view-client-advisor" />,
  clientWizard: () => <MarkupPage html={clientWizard} viewId="view-client-wizard" />,
  agentDashboard: () => <MarkupPage html={agentDashboard} viewId="view-role-agent" />,
  agentInspections: () => <MarkupPage html={agentInspections} viewId="view-agent-inspections" />,
  agentClients: () => <MarkupPage html={agentClients} viewId="view-agent-clients" />,
  agentComplements: () => <MarkupPage html={agentComplements} viewId="view-agent-complements" />,
  analystDashboard: () => <MarkupPage html={analystDashboard} viewId="view-role-analyst" />,
  analystDossiers: () => <MarkupPage html={analystDossiers} viewId="view-analyst-dossiers" />,
  analystScoring: () => <MarkupPage html={analystScoring} viewId="view-scoring-admin" />,
  analystAnomalies: () => <MarkupPage html={analystAnomalies} viewId="view-analyst-anomalies" />,
  analystAudit: () => <MarkupPage html={committeeAudit} viewId="view-audit-logs" />,
  committeeDashboard: () => <MarkupPage html={committeeDashboard} viewId="view-role-committee" />,
  committeeDossiers: () => <MarkupPage html={committeeDossiers} viewId="view-committee-dossiers" />,
  committeeSigned: () => <MarkupPage html={committeeDashboard} viewId="view-committee-signed" />,
  committeeAudit: () => <MarkupPage html={committeeAudit} viewId="view-audit-logs" />,
};

export function LegacyModals() {
  const html = [
    agentInspectionModal,
    analystDossierModal,
    clientAppointmentModal,
    clientLoanModal,
    clientPaymentModal,
    committeeModal,
    modalDocLightbox,
    modalEditProfile,
    modalQrScanner,
    modalSettings,
    modalSuccess,
  ].join('\n');

  return <HtmlView html={html} />;
}
