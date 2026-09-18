import { ROLE_PROFILES, VIEW_PATHS } from '@/app/roles';
import { getUiSession } from '@/app/session';
import { toast } from '@heroui/react';

type LegacyApp = {
  currentRole?: string;
  currentView?: string;
  currentUser?: { name?: string; role?: string; email?: string };
  switchView?: (viewId: string) => void;
  openNewLoanModal?: (prefill?: { amount?: number | string; duration?: number | string; purpose?: string }) => void;
  updateWizardCalculation?: () => void;
  openLogoutConfirmModal?: () => void;
  logout?: () => void;
  confirmLogout?: () => void;
  showToast?: (message: string, type?: string) => void;
  renderBorrowerDashboard?: () => void;
  updateCompactEstimator?: () => void;
  checkAndHighlightExpiringDocs?: () => void;
  renderClientSchedule?: (filter?: string) => void;
  updateClientSimulation?: () => void;
  renderAgentDashboard?: () => void;
  renderAgentInspections?: () => void;
  renderAgentClientsPortfolio?: () => void;
  renderAgentComplements?: () => void;
  renderAnalystDashboard?: () => void;
  renderAnalystAnomalies?: () => void;
  renderCommitteeDashboard?: () => void;
  renderCommitteeDossiersPage?: () => void;
  renderSignedPvTable?: () => void;
  updateColdStartComparisonSim?: () => void;
  renderAuditLogs?: () => void;
  initClientWizard?: () => void;
  openUploadDocumentModal?: () => void;
  closeUploadDocumentModal?: () => void;
  filterClientDocs?: (category: string, buttonEl?: Element | null) => void;
  handleClientDocUpload?: (event: Event) => void;
};

declare global {
  interface Window {
    __CREDITFAST_SPA__?: boolean;
    App?: LegacyApp;
    AppCharts?: { setupDefaults?: () => void };
    APP_CONSTANTS?: Record<string, unknown>;
  }
}

export function patchLegacyApp(navigate: (path: string) => void): void {
  window.__CREDITFAST_SPA__ = true;
  const app: LegacyApp = window.App ?? {};
  const originalToast = app.showToast?.bind(app);

  const showBackdrop = (id: string, visible: boolean) => {
    const modal = document.getElementById(id);
    if (!modal) {
      return;
    }
    if (visible) {
      modal.style.display = 'flex';
      window.requestAnimationFrame(() => modal.classList.add('active'));
      return;
    }
    modal.classList.remove('active');
    window.setTimeout(() => {
      modal.style.display = 'none';
    }, 200);
  };

  app.openUploadDocumentModal = () => showBackdrop('modal-upload-document', true);
  app.closeUploadDocumentModal = () => showBackdrop('modal-upload-document', false);

  const originalFilterDocs = app.filterClientDocs?.bind(app);
  app.filterClientDocs = (category: string, buttonEl?: Element | null) => {
    originalFilterDocs?.(category, buttonEl);
    document.querySelectorAll('#client-documents-grid .doc-card-item').forEach((card) => {
      const show = card.style.display !== 'none';
      if (card.tagName === 'TR') {
        card.style.display = show ? 'table-row' : 'none';
      } else if (show) {
        card.style.display = '';
      }
    });
    window.dispatchEvent(new CustomEvent('creditfast-docs-filter', { detail: category }));
  };

  const originalUpload = app.handleClientDocUpload?.bind(app);
  app.handleClientDocUpload = (event: Event) => {
    originalUpload?.(event);
    app.closeUploadDocumentModal?.();
  };

  app.switchView = (viewId: string) => {
    if (viewId === 'view-client-wizard') {
      app.openNewLoanModal?.();
      return;
    }
    const path = VIEW_PATHS[viewId];
    if (path) {
      navigate(path);
    }
  };

  const leave = () => {
    void import('@/api/auth')
      .then(({ logoutFromApi }) => logoutFromApi())
      .finally(() => navigate('/'));
  };
  app.openLogoutConfirmModal = leave;
  app.logout = leave;
  app.confirmLogout = leave;

  app.showToast = (message: string, type = 'info') => {
    const container = document.getElementById('toast-container');
    if (container && originalToast) {
      originalToast(message, type);
      return;
    }

    if (type === 'success') {
      toast.success(message);
    } else if (type === 'danger') {
      toast.danger(message);
    } else if (type === 'warning') {
      toast.warning(message);
    } else {
      toast.info(message);
    }
  };

  window.App = app;
}

export function hydrateLegacyPage(viewId?: string): void {
  const app = window.App;
  if (!app) {
    return;
  }

  const session = getUiSession();
  if (session) {
    const profile = ROLE_PROFILES[session.role];
    app.currentRole = session.role;
    app.currentView = viewId;
    app.currentUser = {
      role: session.role,
      email: session.identifier,
      name: session.name ?? profile.displayName,
    };
  }

  window.AppCharts?.setupDefaults?.();

  if (!viewId) {
    return;
  }

  const runners: Record<string, () => void> = {
    'view-role-client': () => {
      app.renderBorrowerDashboard?.();
      app.updateCompactEstimator?.();
    },
    'view-client-requests': () => app.renderBorrowerDashboard?.(),
    'view-client-documents': () => app.checkAndHighlightExpiringDocs?.(),
    'view-client-simulator': () => app.updateClientSimulation?.(),
    'view-client-schedule': () => app.renderClientSchedule?.(),
    'view-role-agent': () => app.renderAgentDashboard?.(),
    'view-agent-inspections': () => app.renderAgentInspections?.(),
    'view-agent-clients': () => app.renderAgentClientsPortfolio?.(),
    'view-agent-complements': () => app.renderAgentComplements?.(),
    'view-role-analyst': () => app.renderAnalystDashboard?.(),
    'view-analyst-dossiers': () => app.renderAnalystDashboard?.(),
    'view-analyst-anomalies': () => app.renderAnalystAnomalies?.(),
    'view-role-committee': () => app.renderCommitteeDashboard?.(),
    'view-committee-dossiers': () => app.renderCommitteeDossiersPage?.(),
    'view-committee-signed': () => app.renderSignedPvTable?.(),
    'view-scoring-admin': () => app.updateColdStartComparisonSim?.(),
    'view-audit-logs': () => app.renderAuditLogs?.(),
  };

  runners[viewId]?.();
}
