import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { AuthPage } from '@/features/auth';
import { getUiSession } from '@/app/session';
import { AppShell } from '@/shared/layout/AppShell';
import { LegacyModals, markupPages } from '@/pages/MarkupPages';

function RequireSession() {
  if (!getUiSession()) {
    return <Navigate to="/" replace />;
  }

  return (
    <AppShell>
      <Outlet />
      <LegacyModals />
    </AppShell>
  );
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route path="/app" element={<RequireSession />}>
        <Route index element={<Navigate to="client" replace />} />
        <Route path="client" element={markupPages.clientDashboard()} />
        <Route path="client/requests" element={markupPages.clientRequests()} />
        <Route path="client/simulator" element={markupPages.clientSimulator()} />
        <Route path="client/schedule" element={markupPages.clientSchedule()} />
        <Route path="client/documents" element={markupPages.clientDocuments()} />
        <Route path="client/advisor" element={markupPages.clientAdvisor()} />
        <Route path="client/wizard" element={markupPages.clientWizard()} />
        <Route path="agent" element={markupPages.agentDashboard()} />
        <Route path="agent/inspections" element={markupPages.agentInspections()} />
        <Route path="agent/clients" element={markupPages.agentClients()} />
        <Route path="agent/complements" element={markupPages.agentComplements()} />
        <Route path="analyst" element={markupPages.analystDashboard()} />
        <Route path="analyst/dossiers" element={markupPages.analystDossiers()} />
        <Route path="analyst/scoring" element={markupPages.analystScoring()} />
        <Route path="analyst/anomalies" element={markupPages.analystAnomalies()} />
        <Route path="analyst/audit" element={markupPages.analystAudit()} />
        <Route path="committee" element={markupPages.committeeDashboard()} />
        <Route path="committee/dossiers" element={markupPages.committeeDossiers()} />
        <Route path="committee/signed" element={markupPages.committeeSigned()} />
        <Route path="committee/audit" element={markupPages.committeeAudit()} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
