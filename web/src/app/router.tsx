import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { AuthPage } from '@/features/auth';
import { getUiSession, queueLoanModal } from '@/app/session';
import { ROLE_PROFILES } from '@/app/roles';
import { AppShell } from '@/shared/layout/AppShell';
import { LegacyModals } from '@/pages/MarkupPages';
import {
  ClientAdvisorPage,
  ClientDashboardPage,
  ClientDocumentsPage,
  ClientRequestsPage,
  ClientSchedulePage,
  ClientSimulatorPage,
} from '@/features/client';
import { AgentClientsPage, AgentComplementsPage, AgentDashboardPage, AgentInspectionsPage } from '@/features/agent';
import { AnalystAnomaliesPage, AnalystDashboardPage, AnalystDossiersPage, AnalystScoringPage } from '@/features/analyst';
import { CommitteeDashboardPage, CommitteeDossiersPage, CommitteeSignedPage } from '@/features/committee';
import { AuditLogsPage } from '@/features/shared/AuditLogsPage';
import { RequireRole } from '@/app/RequireRole';
import {
  AdminAuditPage,
  AdminDashboardPage,
  AdminScoringPage,
  AdminUsersPage,
} from '@/features/admin';

function AppHomeRedirect() {
  const session = getUiSession();
  return <Navigate to={session ? ROLE_PROFILES[session.role].homePath : '/app/client'} replace />;
}

function LoanWizardRedirect() {
  const session = getUiSession();
  queueLoanModal();
  return <Navigate to={session ? ROLE_PROFILES[session.role].homePath : '/app/client'} replace />;
}

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
        <Route index element={<AppHomeRedirect />} />
        <Route element={<RequireRole allow={['CLIENT']} />}>
          <Route path="client" element={<ClientDashboardPage />} />
          <Route path="client/requests" element={<ClientRequestsPage />} />
          <Route path="client/simulator" element={<ClientSimulatorPage />} />
          <Route path="client/schedule" element={<ClientSchedulePage />} />
          <Route path="client/documents" element={<ClientDocumentsPage />} />
          <Route path="client/advisor" element={<ClientAdvisorPage />} />
        </Route>
        <Route path="client/wizard" element={<LoanWizardRedirect />} />
        <Route element={<RequireRole allow={['CREDIT_OFFICER']} />}>
          <Route path="agent" element={<AgentDashboardPage />} />
          <Route path="agent/inspections" element={<AgentInspectionsPage />} />
          <Route path="agent/clients" element={<AgentClientsPage />} />
          <Route path="agent/complements" element={<AgentComplementsPage />} />
        </Route>
        <Route element={<RequireRole allow={['ANALYST']} />}>
          <Route path="analyst" element={<AnalystDashboardPage />} />
          <Route path="analyst/dossiers" element={<AnalystDossiersPage />} />
          <Route path="analyst/scoring" element={<AnalystScoringPage />} />
          <Route path="analyst/anomalies" element={<AnalystAnomaliesPage />} />
          <Route path="analyst/audit" element={<AuditLogsPage />} />
        </Route>
        <Route element={<RequireRole allow={['COMMITTEE']} />}>
          <Route path="committee" element={<CommitteeDashboardPage />} />
          <Route path="committee/dossiers" element={<CommitteeDossiersPage />} />
          <Route path="committee/signed" element={<CommitteeSignedPage />} />
          <Route path="committee/audit" element={<AuditLogsPage />} />
        </Route>
        <Route element={<RequireRole allow={['ADMIN']} />}>
          <Route path="admin" element={<AdminDashboardPage />} />
          <Route path="admin/users" element={<AdminUsersPage />} />
          <Route path="admin/scoring" element={<AdminScoringPage />} />
          <Route path="admin/audit" element={<AdminAuditPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
