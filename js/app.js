/**
 * CRÉDIT FAST - APPLICATION CONTROLLER & ROLE ROUTER V2
 * Gestion dynamique des 5 espaces métiers indépendants (Sidebar, Dashboard & Écrans dédiés)
 * Confédération des Institutions Financières d'Afrique de l'Ouest (CIF - DigiCoop-WA+)
 */

const App = {
  currentUser: null,
  currentRole: 'ANALYST',
  currentView: 'view-role-analyst',

  init() {
    this.initTheme();
    this.initAuth();
    this.initSidebarToggle();
    this.initRoleSelector();
    this.initSearch();
    this.initClientWizard();
    this.initComplianceScreening();
    this.initNotifications();
    this.initLanguageSelector();

    // Check existing auth session or auto-load default persona
    const savedUser = localStorage.getItem('AUTH_USER');
    if (savedUser) {
      try {
        this.login(JSON.parse(savedUser));
      } catch (e) {
        this.showLoginScreen();
      }
    } else {
      this.showLoginScreen();
    }
  },

  // 1. Authentication & Session Manager
  initAuth() {
    // 1-Click Demo Account Buttons
    const demoBtns = document.querySelectorAll('.demo-persona-btn');
    demoBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const personaId = btn.getAttribute('data-demo-id');
        const persona = APP_CONSTANTS.DEMO_ACCOUNTS.find(a => a.id === personaId);
        if (persona) {
          document.getElementById('login-email').value = persona.email;
          document.getElementById('login-password').value = persona.password;
          
          demoBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');

          this.login(persona);
        }
      });
    });

    // Login Form Submit
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();

        const match = APP_CONSTANTS.DEMO_ACCOUNTS.find(a => a.email.toLowerCase() === email.toLowerCase()) 
          || APP_CONSTANTS.DEMO_ACCOUNTS[2]; // Default to Analyst

        this.login(match);
      });
    }

    // Logout Buttons
    document.querySelectorAll('.btn-action-logout').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.logout();
      });
    });
  },

  login(user) {
    this.currentUser = user;
    this.currentRole = user.role;
    localStorage.setItem('AUTH_USER', JSON.stringify(user));

    // Hide Auth View & Show App Shell
    const authView = document.getElementById('auth-view');
    const mainApp = document.getElementById('app-wrapper');
    if (authView) authView.style.display = 'none';
    if (mainApp) mainApp.style.display = 'flex';

    // Update Topbar Info
    this.updateUserHeader(user);

    // Render Role-Specific Sidebar & Navigate to Dedicated Home Dashboard
    this.renderSidebarForRole(user.role);

    const roleConfig = APP_CONSTANTS.ROLES[user.role] || APP_CONSTANTS.ROLES.ANALYST;
    this.switchView(roleConfig.homeView);

    this.showToast(`Connecté en tant que ${user.name} (${roleConfig.name})`, 'success');
  },

  logout() {
    this.currentUser = null;
    localStorage.removeItem('AUTH_USER');
    this.showLoginScreen();
    this.showToast('Vous avez été déconnecté avec succès', 'info');
  },

  showLoginScreen() {
    const authView = document.getElementById('auth-view');
    const mainApp = document.getElementById('app-wrapper');
    if (authView) authView.style.display = 'flex';
    if (mainApp) mainApp.style.display = 'none';
  },

  updateUserHeader(user) {
    const roleBadge = document.getElementById('user-role-display');
    const userName = document.getElementById('user-name-display');
    const userAvatar = document.getElementById('user-avatar-display');
    const globalRoleSelect = document.getElementById('global-role-select');
    const rolePill = document.getElementById('user-role-pill-badge');

    const roleConfig = APP_CONSTANTS.ROLES[user.role] || APP_CONSTANTS.ROLES.ANALYST;

    if (roleBadge) roleBadge.textContent = user.title || roleConfig.name;
    if (userName) userName.textContent = user.name;
    if (userAvatar) userAvatar.src = user.avatar;
    if (globalRoleSelect) globalRoleSelect.value = user.role;

    if (rolePill) {
      rolePill.textContent = roleConfig.shortName;
      rolePill.style.color = roleConfig.badgeColor;
      rolePill.style.backgroundColor = roleConfig.badgeBg;
      rolePill.style.borderColor = roleConfig.badgeColor;
    }
  },

  // 2. DYNAMIC ROLE-SPECIFIC SIDEBAR RENDERER
  renderSidebarForRole(roleCode) {
    const container = document.getElementById('sidebar-menu-container');
    if (!container) return;

    const roleConfig = APP_CONSTANTS.ROLES[roleCode] || APP_CONSTANTS.ROLES.ANALYST;
    let html = '';

    roleConfig.navGroups.forEach(group => {
      html += `<div class="menu-group-title">${group.title}</div><ul>`;
      group.items.forEach(item => {
        const badgeHtml = item.badge 
          ? `<span class="nav-badge ${item.badgeClass || ''}">${item.badge}</span>` 
          : '';

        html += `
          <li class="nav-item">
            <a class="nav-link" data-view-target="${item.target}">
              <i class="fas ${item.icon}"></i>
              <span class="nav-link-text">${item.label}</span>
              ${badgeHtml}
            </a>
          </li>
        `;
      });
      html += `</ul>`;
    });

    container.innerHTML = html;

    // Attach click events on new links
    container.querySelectorAll('[data-view-target]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetView = link.getAttribute('data-view-target');
        this.switchView(targetView);
      });
    });
  },

  // 3. SPA Navigation Router with Dynamic Role Rendering
  switchView(viewId) {
    this.currentView = viewId;

    // Highlight active nav item
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    const activeLink = document.querySelector(`[data-view-target="${viewId}"]`);
    if (activeLink && activeLink.parentElement) {
      activeLink.parentElement.classList.add('active');
    }

    // Toggle view visibility
    document.querySelectorAll('.app-view').forEach(view => {
      view.style.display = 'none';
    });
    const target = document.getElementById(viewId);
    if (target) {
      target.style.display = 'block';
    }

    // Execute role-specific initializers
    if (viewId === 'view-role-client' || viewId === 'view-client-schedule') {
      this.renderBorrowerDashboard();
    } else if (viewId === 'view-role-agent' || viewId === 'view-agent-clients') {
      this.renderAgentDashboard();
    } else if (viewId === 'view-role-analyst' || viewId === 'view-analyst-dossiers') {
      this.renderAnalystDashboard();
    } else if (viewId === 'view-role-committee' || viewId === 'view-committee-signed') {
      this.renderCommitteeDashboard();
    } else if (viewId === 'view-role-compliance' || viewId === 'view-compliance-screening') {
      this.renderComplianceDashboard();
    } else if (viewId === 'view-audit-logs') {
      this.renderAuditLogs();
    }

    // Close mobile drawer if open
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (sidebar) sidebar.classList.remove('mobile-open');
    if (backdrop) backdrop.classList.remove('active');

    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  // =========================================================================
  // 4. SPECIFIC DASHBOARD RENDERERS FOR EACH OF THE 5 ROLES
  // =========================================================================

  // [ROLE 1] DEMANDEUR / CLIENT EMPRUNTEUR
  renderBorrowerDashboard() {
    const req = DB.findById('credit_requests', 1); // Fatou Ndiaye
    const client = DB.findById('clients', 1);
    if (!req) return;

    const nameEl = document.getElementById('borrower-banner-name');
    const numEl = document.getElementById('borrower-member-num');
    if (nameEl) nameEl.textContent = this.currentUser ? this.currentUser.name : 'Fatou Ndiaye';
    if (numEl) numEl.textContent = client ? client.client_number : 'SN-DKR-008821';

    const activeAmount = document.getElementById('borrower-active-amount');
    const activePurpose = document.getElementById('borrower-active-purpose');
    const activeRef = document.getElementById('borrower-active-ref');
    const activeStatus = document.getElementById('borrower-active-status');

    if (activeAmount) activeAmount.textContent = CreditScoringEngine.formatFCFA(req.requested_amount);
    if (activePurpose) activePurpose.textContent = req.purpose;
    if (activeRef) activeRef.textContent = req.request_number;
    if (activeStatus) activeStatus.innerHTML = AppInteractions.getStatusBadge(req.status);
  },

  // [ROLE 2] AGENT DE CRÉDIT (CHARGÉ DE CLIENTÈLE)
  renderAgentDashboard() {
    const tbody = document.getElementById('agent-pipeline-table-body');
    if (!tbody) return;

    const requests = DB.get('credit_requests');
    tbody.innerHTML = requests.map(r => `
      <tr>
        <td><strong>${r.request_number}</strong><div style="font-size: 0.72rem; color: var(--text-subtle);">${new Date(r.created_at).toLocaleDateString('fr-FR')}</div></td>
        <td>
          <div class="client-cell">
            <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(r.client_name)}&background=0ea5e9&color=fff" alt="">
            <div>
              <div class="client-name">${r.client_name}</div>
              <div class="client-sub">${r.city}, ${r.country}</div>
            </div>
          </div>
        </td>
        <td><span class="amount-cell">${CreditScoringEngine.formatFCFA(r.requested_amount)}</span></td>
        <td>${r.purpose}</td>
        <td>${AppInteractions.getStatusBadge(r.status)}</td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="App.showToast('Demande de pièces complémentaires envoyée par SMS au client', 'info')">
            <i class="fas fa-paper-plane"></i> Relancer Pièces
          </button>
        </td>
      </tr>
    `).join('');
  },

  // [ROLE 3] ANALYSTE RISQUE (SCORING V2 & 360°)
  renderAnalystDashboard() {
    AppCharts.setupDefaults();
    AppCharts.renderEvolutionChart('evolution-chart-canvas', 'year');
    AppCharts.renderRiskDoughnut('risk-doughnut-canvas');
    AppCharts.renderRegionalChart('regional-chart-canvas');
    AppInteractions.renderRequestsTable();
  },

  // [ROLE 4] COMITÉ DE CRÉDIT (DÉCISIONNAIRE)
  renderCommitteeDashboard() {
    const tbody = document.getElementById('committee-requests-table-body');
    if (!tbody) return;

    // Dossiers en attente de passage au comité
    const pendingReqs = DB.get('credit_requests').filter(r => r.status === 'COMMITTEE' || r.status === 'CREDIT_REVIEW' || r.status === 'ANALYSIS');

    tbody.innerHTML = pendingReqs.map(r => {
      const evalData = CreditScoringEngine.evaluateDossier(r.id);
      return `
        <tr>
          <td><strong>${r.request_number}</strong></td>
          <td>
            <strong>${r.client_name}</strong>
            <div style="font-size: 0.72rem; color: var(--text-subtle);">${r.city} • N° ${r.client_id}</div>
          </td>
          <td><span class="amount-cell">${CreditScoringEngine.formatFCFA(r.requested_amount)}</span> (${r.duration_months} mois)</td>
          <td>
            <span class="badge ${r.repayment_capacity_status === 'SUFFICIENT' ? 'badge-capacity-sufficient' : 'badge-capacity-insufficient'}">
              ${r.repayment_capacity_status === 'SUFFICIENT' ? 'Reste à vivre suffisant' : 'Insuffisant'}
            </span>
          </td>
          <td>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-weight: 800; font-size: 0.95rem; color: ${evalData.riskColor};">${evalData.overallScore}</span>
              <span style="font-size: 0.7rem; color: var(--text-subtle);">/100 (Confiance: ${evalData.confidenceScore}%)</span>
            </div>
          </td>
          <td>
            <span class="badge badge-analysis"><i class="fas fa-thumbs-up"></i> Avis Favorable Analyste</span>
          </td>
          <td>
            <button class="btn btn-primary btn-sm" onclick="AppInteractions.openCommitteeModal(${r.id})">
              <i class="fas fa-gavel"></i> Délibérer & Voter
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  // [ROLE 5] RESPONSABLE CONFORMITÉ LBC / FT / FP
  renderComplianceDashboard() {
    // Refresh screening status
  },

  // 5. General Controls
  initTheme() {
    const savedTheme = localStorage.getItem('THEME_PREF') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    this.updateThemeButtonIcon(savedTheme);

    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('THEME_PREF', next);
        this.updateThemeButtonIcon(next);
        this.showToast(`Mode ${next === 'dark' ? 'Sombre' : 'Clair'} activé`, 'info');
      });
    }
  },

  updateThemeButtonIcon(theme) {
    const btn = document.getElementById('theme-toggle-btn');
    if (btn) {
      btn.innerHTML = theme === 'dark' 
        ? '<i class="fas fa-sun" style="color: #f59e0b;"></i>' 
        : '<i class="fas fa-moon"></i>';
    }
  },

  initSidebarToggle() {
    const toggleBtn = document.getElementById('sidebar-toggle-btn');
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');

    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener('click', () => {
        if (window.innerWidth <= 992) {
          sidebar.classList.toggle('mobile-open');
          if (backdrop) backdrop.classList.toggle('active');
        } else {
          document.body.classList.toggle('sidebar-collapsed');
        }
      });
    }

    if (backdrop) {
      backdrop.addEventListener('click', () => {
        if (sidebar) sidebar.classList.remove('mobile-open');
        backdrop.classList.remove('active');
      });
    }
  },

  initRoleSelector() {
    const roleSelect = document.getElementById('global-role-select');
    if (roleSelect) {
      roleSelect.addEventListener('change', (e) => {
        const role = e.target.value;
        const persona = APP_CONSTANTS.DEMO_ACCOUNTS.find(a => a.role === role) || APP_CONSTANTS.DEMO_ACCOUNTS[0];
        this.login(persona);
      });
    }
  },

  initSearch() {
    const searchInput = document.getElementById('global-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const q = e.target.value;
        if (this.currentRole === 'ANALYST') {
          AppInteractions.renderRequestsTable('ALL', q);
        }
      });
    }
  },

  initClientWizard() {
    let currentStep = 1;
    const totalSteps = 6;

    const setStep = (step) => {
      currentStep = step;
      document.querySelectorAll('.wizard-step-content').forEach(el => el.style.display = 'none');
      const activeContent = document.getElementById(`wizard-step-${step}`);
      if (activeContent) activeContent.style.display = 'block';

      document.querySelectorAll('.wizard-step').forEach((el, idx) => {
        const stepNum = idx + 1;
        el.classList.remove('active', 'completed');
        if (stepNum === step) el.classList.add('active');
        else if (stepNum < step) el.classList.add('completed');
      });
    };

    document.querySelectorAll('[data-wizard-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.getAttribute('data-wizard-action');
        if (action === 'next' && currentStep < totalSteps) {
          setStep(currentStep + 1);
        } else if (action === 'prev' && currentStep > 1) {
          setStep(currentStep - 1);
        } else if (action === 'submit') {
          this.submitNewCreditRequest();
        }
      });
    });

    const updateWizardCalculation = () => {
      const inc = Number(document.getElementById('wiz-income')?.value || 500000);
      const exp = Number(document.getElementById('wiz-expenses')?.value || 200000);
      const debt = Number(document.getElementById('wiz-debt')?.value || 50000);
      const amount = Number(document.getElementById('wiz-amount')?.value || 1500000);
      const months = Number(document.getElementById('wiz-duration')?.value || 12);

      const cap = CreditScoringEngine.calculateCapacity(inc, 0, exp, debt, amount, months);
      
      const dispEl = document.getElementById('wiz-calc-disposable');
      const instEl = document.getElementById('wiz-calc-installment');
      const badgeEl = document.getElementById('wiz-calc-status');

      if (dispEl) dispEl.textContent = CreditScoringEngine.formatFCFA(cap.disposableIncome);
      if (instEl) instEl.textContent = CreditScoringEngine.formatFCFA(cap.estimatedPayment);
      if (badgeEl) {
        badgeEl.className = `badge ${cap.isSufficient ? 'badge-capacity-sufficient' : 'badge-capacity-insufficient'}`;
        badgeEl.textContent = cap.statusText;
      }
    };

    ['wiz-income', 'wiz-expenses', 'wiz-debt', 'wiz-amount', 'wiz-duration'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', updateWizardCalculation);
    });

    updateWizardCalculation();
  },

  submitNewCreditRequest() {
    const clientName = document.getElementById('wiz-fullname')?.value || 'Nouveau Membre CIF';
    const city = document.getElementById('wiz-city')?.value || 'Ouagadougou';
    const country = document.getElementById('wiz-country')?.value || 'Burkina Faso';
    const amount = Number(document.getElementById('wiz-amount')?.value || 1500000);
    const months = Number(document.getElementById('wiz-duration')?.value || 12);
    const purpose = document.getElementById('wiz-purpose')?.value || 'Financement fond de roulement';
    const inc = Number(document.getElementById('wiz-income')?.value || 600000);
    const exp = Number(document.getElementById('wiz-expenses')?.value || 250000);

    const cap = CreditScoringEngine.calculateCapacity(inc, 0, exp, 0, amount, months);

    const newReq = DB.insert('credit_requests', {
      client_id: 1,
      request_number: `REQ-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      requested_amount: amount,
      duration_months: months,
      purpose: purpose,
      declared_monthly_income: inc,
      declared_monthly_expenses: exp,
      estimated_monthly_payment: cap.estimatedPayment,
      disposable_income: cap.disposableIncome,
      repayment_capacity_status: cap.status,
      status: 'SUBMITTED',
      created_at: new Date().toISOString(),
      client_name: clientName,
      country: country,
      city: city,
      score: 75
    });

    const newDoc = DB.insert('documents', {
      credit_request_id: newReq.id,
      document_type: 'FACTURE_PROFORMA',
      original_filename: 'Facture_Devis_Equipement.pdf',
      file_path: 'assets/docs/devis.pdf',
      uploaded_at: new Date().toISOString()
    });

    OCREngine.scanDocument(newDoc.id);

    DB.addAuditLog(4, 'NEW_CREDIT_SUBMISSION', 'credit_requests', newReq.id, `Nouvelle demande de ${CreditScoringEngine.formatFCFA(amount)} déposée par ${clientName}`);

    this.showToast('Demande enregistrée avec succès ! Redirection...', 'success');
    
    if (this.currentRole === 'CLIENT') {
      this.switchView('view-role-client');
    } else {
      this.switchView('view-analyst-dossiers');
      AppInteractions.renderRequestsTable();
    }
  },

  initComplianceScreening() {
    const screenBtn = document.getElementById('btn-screen-client');
    const nameInput = document.getElementById('screen-client-name');
    const resultBox = document.getElementById('screening-result-box');

    if (screenBtn && nameInput && resultBox) {
      screenBtn.addEventListener('click', () => {
        const query = nameInput.value.trim().toLowerCase();
        if (!query) {
          this.showToast('Veuillez saisir un nom ou matricule client', 'warning');
          return;
        }

        const watchlist = DB.get('sanctions_watchlist');
        const match = watchlist.find(item => 
          item.full_name.toLowerCase().includes(query) || 
          item.aliases.toLowerCase().includes(query)
        );

        if (match) {
          resultBox.innerHTML = `
            <div class="anomaly-item critical" style="margin-top: 1rem;">
              <i class="fas fa-shield-halved anomaly-icon"></i>
              <div class="anomaly-content">
                <h5>ALERTE CONFORMITÉ : Correspondance Détectée (${match.risk_level})</h5>
                <p><strong>Cible :</strong> ${match.full_name} (${match.country})</p>
                <p><strong>Catégorie :</strong> ${match.category}</p>
                <p><strong>Motif de signalement :</strong> ${match.match_reason}</p>
                <div style="margin-top: 6px;">
                  <button class="btn btn-danger btn-sm" onclick="App.showToast('Gel préventif appliqué et signalement transmis à la cellule LBC', 'danger')">
                    <i class="fas fa-lock"></i> Bloquer Opération
                  </button>
                  <button class="btn btn-secondary btn-sm" onclick="App.showToast('Examen de diligence renforcée ouvert', 'info')">
                    Ouvrir Enquête
                  </button>
                </div>
              </div>
            </div>
          `;
          this.showToast('Alerte LBC/FT détectée sur la liste de surveillance !', 'danger');
        } else {
          resultBox.innerHTML = `
            <div class="anomaly-item info" style="margin-top: 1rem;">
              <i class="fas fa-check-shield anomaly-icon"></i>
              <div class="anomaly-content">
                <h5>Contrôle Négatif - Aucun Signalement</h5>
                <p>Le client '<strong>${nameInput.value}</strong>' ne figure sur aucune liste de sanctions UEMOA/ONU/GAFI et ne présente pas d'alerte PPE bloquante.</p>
              </div>
            </div>
          `;
          this.showToast('Filtrage conforme : Aucun risque détecté', 'success');
        }
      });
    }
  },

  renderAuditLogs() {
    const container = document.getElementById('audit-logs-table-body');
    if (!container) return;

    const logs = DB.get('audit_logs');
    container.innerHTML = logs.map(log => `
      <tr>
        <td>
          <span style="font-family: var(--font-family-code); font-size: 0.76rem;">${new Date(log.created_at || log.timestamp).toLocaleString('fr-FR')}</span>
        </td>
        <td>
          <span class="badge badge-submitted">${log.action}</span>
        </td>
        <td>
          <strong>${log.entity_type}</strong> <span style="font-size: 0.72rem; color: var(--text-subtle);">#${log.entity_id}</span>
        </td>
        <td>
          <div style="font-size: 0.8rem;">${log.details}</div>
        </td>
        <td>
          <span style="font-family: var(--font-family-code); font-size: 0.72rem; color: var(--text-subtle);">${log.ip_address}</span>
        </td>
      </tr>
    `).join('');
  },

  initNotifications() {
    const notifBtn = document.getElementById('notif-bell-btn');
    const notifDropdown = document.getElementById('notif-dropdown');

    if (notifBtn && notifDropdown) {
      notifBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        notifDropdown.classList.toggle('active');
      });

      document.addEventListener('click', () => {
        notifDropdown.classList.remove('active');
      });
    }
  },

  initLanguageSelector() {
    const sel = document.getElementById('country-lang-select');
    if (sel) {
      sel.addEventListener('change', (e) => {
        this.showToast(`Zone UEMOA sélectionnée : ${e.target.value}`, 'info');
      });
    }
  },

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle text-success';
    if (type === 'danger') icon = 'fa-exclamation-circle text-danger';
    if (type === 'warning') icon = 'fa-triangle-exclamation text-warning';

    toast.innerHTML = `
      <i class="fas ${icon} toast-icon"></i>
      <div style="flex: 1; font-size: 0.82rem; font-weight: 500;">${message}</div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
};

window.App = App;

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
