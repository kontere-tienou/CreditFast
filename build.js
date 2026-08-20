import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function buildIndexHtml() {
  const viewsDir = path.join(__dirname, 'views');
  
  const readView = (filePath) => fs.readFileSync(path.join(viewsDir, filePath), 'utf-8');

  const head = readView('layout/head.html');
  const auth = readView('auth/auth.html');
  const sidebar = readView('shared/sidebar.html');
  const topbar = readView('shared/topbar.html');
  const clientDashboard = readView('client/dashboard.html');
  const clientRequests = readView('client/requests.html');
  const clientSchedule = readView('client/schedule.html');
  const clientDocuments = readView('client/documents.html');
  const clientAdvisor = readView('client/advisor.html');
  const clientSimulator = readView('client/simulator.html');
  const agentDashboard = readView('agent/dashboard.html');
  const agentInspections = readView('agent/inspections.html');
  const agentClients = readView('agent/clients.html');
  const agentComplements = readView('agent/complements.html');
  const analystDashboard = readView('analyst/dashboard.html');
  const analystDossiers = readView('analyst/dossiers.html');
  const analystAnomalies = readView('analyst/anomalies.html');
  const committeeDashboard = readView('committee/dashboard.html');
  const complianceDashboard = readView('committee/compliance.html');
  const scoringAdmin = readView('analyst/scoring-admin.html');
  const clientWizard = readView('client/wizard.html');
  const auditLogs = readView('committee/audit-logs.html');
  const modalDossier360 = readView('analyst/modal-dossier-360.html');
  const modalCommittee = readView('committee/modal-committee.html');
  const modalInspection = readView('agent/modal-inspection.html');
  const modalSettings = readView('shared/modal-settings.html');
  const modalEditProfile = readView('shared/modal-edit-profile.html');
  const modalClientPayment = readView('client/modal-payment.html');
  const modalQrScanner = readView('shared/modal-qr-scanner.html');
  const modalSuccessAnimation = readView('shared/modal-success-animation.html');
  const modalDocLightbox = readView('shared/modal-doc-lightbox.html');
  const modalLoanApplication = readView('client/modal-loan-application.html');
  const modalAppointment = readView('client/modal-appointment.html');
  const toasts = readView('shared/toasts.html');
  const scripts = readView('layout/scripts.html');

  const outputHtml = `<!DOCTYPE html>
<html lang="fr" data-theme="light">
<head>
${head.split('\n').map(l => '  ' + l).join('\n')}
</head>
<body>

${auth}

<!-- ==========================================================================
     MAIN APPLICATION SHELL (AFTER AUTHENTICATION)
     ========================================================================== -->
<div id="app-wrapper" style="display: none;">
  <!-- Mobile Sidebar Overlay Backdrop -->
  <div id="sidebar-backdrop" class="modal-backdrop" style="display: none;"></div>

${sidebar.split('\n').map(l => '  ' + l).join('\n')}

  <!-- ==========================================================================
       2. Main Content Wrapper
       ========================================================================== -->
  <div id="main-wrapper">
${topbar.split('\n').map(l => '    ' + l).join('\n')}

    <!-- ==========================================================================
         3. Dynamic Views Container
         ========================================================================== -->
    <main class="page-container">
${clientDashboard.split('\n').map(l => '      ' + l).join('\n')}

${clientRequests.split('\n').map(l => '      ' + l).join('\n')}

${clientSchedule.split('\n').map(l => '      ' + l).join('\n')}

${clientDocuments.split('\n').map(l => '      ' + l).join('\n')}

${clientAdvisor.split('\n').map(l => '      ' + l).join('\n')}

${clientSimulator.split('\n').map(l => '      ' + l).join('\n')}

${agentDashboard.split('\n').map(l => '      ' + l).join('\n')}

${agentInspections.split('\n').map(l => '      ' + l).join('\n')}

${agentClients.split('\n').map(l => '      ' + l).join('\n')}

${agentComplements.split('\n').map(l => '      ' + l).join('\n')}

${analystDashboard.split('\n').map(l => '      ' + l).join('\n')}

${analystDossiers.split('\n').map(l => '      ' + l).join('\n')}

${analystAnomalies.split('\n').map(l => '      ' + l).join('\n')}

${committeeDashboard.split('\n').map(l => '      ' + l).join('\n')}

${complianceDashboard.split('\n').map(l => '      ' + l).join('\n')}

${scoringAdmin.split('\n').map(l => '      ' + l).join('\n')}

${clientWizard.split('\n').map(l => '      ' + l).join('\n')}

${auditLogs.split('\n').map(l => '      ' + l).join('\n')}
    </main>
  </div>
</div>

${modalDossier360}

${modalCommittee}

${modalInspection}

${modalSettings}

${modalEditProfile}

${modalClientPayment}

${modalQrScanner}

${modalSuccessAnimation}

${modalDocLightbox}

${modalLoanApplication}

${modalAppointment}

${toasts}

${scripts}

</body>
</html>
`;

  const outputPath = path.join(__dirname, 'index.html');
  fs.writeFileSync(outputPath, outputHtml, 'utf-8');

  // Copy build artifacts and assets to 'public' and 'dist' for Vercel / Netlify / static hosts
  const copyDir = (src, dest) => {
    if (!fs.existsSync(src)) return;
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      if (entry.isDirectory()) {
        copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  };

  const targetDirs = ['public', 'dist'];
  targetDirs.forEach((targetDir) => {
    const targetPath = path.join(__dirname, targetDir);
    if (!fs.existsSync(targetPath)) {
      fs.mkdirSync(targetPath, { recursive: true });
    }
    fs.writeFileSync(path.join(targetPath, 'index.html'), outputHtml, 'utf-8');
    copyDir(path.join(__dirname, 'css'), path.join(targetPath, 'css'));
    copyDir(path.join(__dirname, 'assets'), path.join(targetPath, 'assets'));
    copyDir(path.join(__dirname, 'js'), path.join(targetPath, 'js'));
    copyDir(path.join(__dirname, 'data'), path.join(targetPath, 'data'));
    copyDir(path.join(__dirname, 'images'), path.join(targetPath, 'images'));
    copyDir(path.join(__dirname, 'views'), path.join(targetPath, 'views'));
  });

  console.log('Successfully compiled index.html and generated public/ & dist/ directories for Vercel deployment.');
}

if (process.argv[1] === __filename) {
  buildIndexHtml();
}
