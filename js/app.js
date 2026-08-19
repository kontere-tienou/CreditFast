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
    this.initLiveDateTime();
    this.initProfileDropdown();
    this.initRoleSelector();
    this.initSearch();
    this.initClientWizard();
    this.initComplianceScreening();
    this.initNotifications();
    this.initServiceWorkerAndOffline();

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

  // 0. Theme Manager (Light / Dark Mode)
  currentTheme: 'light',

  initTheme() {
    const savedTheme = localStorage.getItem('APP_THEME') || 'light';
    this.setTheme(savedTheme);
  },

  setTheme(theme) {
    this.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('APP_THEME', theme);

    // Update icons in topbar and auth page
    const authIcon = document.getElementById('auth-theme-icon');
    if (authIcon) {
      authIcon.className = theme === 'dark' ? 'fas fa-sun text-warning' : 'fas fa-moon';
    }

    const topbarThemeBtn = document.getElementById('theme-toggle-btn');
    if (topbarThemeBtn) {
      const topbarIcon = topbarThemeBtn.querySelector('i');
      if (topbarIcon) {
        topbarIcon.className = theme === 'dark' ? 'fas fa-sun text-warning' : 'fas fa-moon';
      }
    }
  },

  toggleTheme() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
    this.showToast(`Mode ${newTheme === 'dark' ? 'Sombre' : 'Clair'} activé`, 'info');
  },

  // 1. Authentication & Session Manager
  switchAuthTab(tab) {
    const tabExpress = document.getElementById('auth-tab-express');
    const tabManual = document.getElementById('auth-tab-manual');
    const contentExpress = document.getElementById('auth-tab-content-express');
    const contentManual = document.getElementById('auth-tab-content-manual');

    if (tab === 'express') {
      if (tabExpress) tabExpress.classList.add('active');
      if (tabManual) tabManual.classList.remove('active');
      if (contentExpress) contentExpress.classList.add('active');
      if (contentManual) contentManual.classList.remove('active');
    } else {
      if (tabManual) tabManual.classList.add('active');
      if (tabExpress) tabExpress.classList.remove('active');
      if (contentManual) contentManual.classList.add('active');
      if (contentExpress) contentExpress.classList.remove('active');
      
      const emailInput = document.getElementById('login-email');
      if (emailInput) setTimeout(() => emailInput.focus(), 50);
    }
  },

  togglePasswordVisibility(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    if (!input) return;

    if (input.type === 'password') {
      input.type = 'text';
      if (icon) {
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
      }
    } else {
      input.type = 'password';
      if (icon) {
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
      }
    }
  },

  showDemoCredentialsHelp() {
    const accounts = APP_CONSTANTS.DEMO_ACCOUNTS;
    let helpMsg = 'Comptes Démo (Mot de passe universel: "demo") :\n';
    accounts.forEach(a => {
      helpMsg += `• ${a.name} (${a.badge}) : ${a.email}${a.clientNumber ? ' ou ' + a.clientNumber : ''}\n`;
    });
    this.showToast('4 profils de test disponibles dans l\'onglet Accès Express ou par email/identifiant (mot de passe: "demo")', 'info');
  },

  initAuth() {
    // Restore remembered identifier if present
    const rememberedId = localStorage.getItem('REMEMBER_ME_CRED');
    const emailInput = document.getElementById('login-email');
    if (rememberedId && emailInput) {
      emailInput.value = rememberedId;
    }

    // 1-Click Demo Account Buttons
    const demoBtns = document.querySelectorAll('.demo-persona-btn');
    demoBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const personaId = btn.getAttribute('data-demo-id');
        const persona = APP_CONSTANTS.DEMO_ACCOUNTS.find(a => a.id === personaId);
        if (persona) {
          const emailInput = document.getElementById('login-email');
          const pwdInput = document.getElementById('login-password');
          if (emailInput) emailInput.value = persona.email;
          if (pwdInput) pwdInput.value = persona.password;
          
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
        const rawInput = document.getElementById('login-email') ? document.getElementById('login-email').value.trim() : '';
        const rawInputLower = rawInput.toLowerCase();
        const rememberCheckbox = document.getElementById('remember-me-checkbox');

        if (rememberCheckbox && rememberCheckbox.checked && rawInput) {
          localStorage.setItem('REMEMBER_ME_CRED', rawInput);
        } else {
          localStorage.removeItem('REMEMBER_ME_CRED');
        }

        // Multi-field smart matching: email, clientNumber, phone, partial name
        const match = APP_CONSTANTS.DEMO_ACCOUNTS.find(a => 
          (a.email && a.email.toLowerCase() === rawInputLower) ||
          (a.clientNumber && a.clientNumber.toLowerCase() === rawInputLower) ||
          (a.phone && a.phone.replace(/\s+/g, '') === rawInput.replace(/\s+/g, '')) ||
          (a.name && a.name.toLowerCase().includes(rawInputLower))
        ) || APP_CONSTANTS.DEMO_ACCOUNTS[2]; // Default to Analyst

        const submitBtn = document.getElementById('btn-submit-login');
        const btnContent = document.getElementById('login-btn-content');

        if (submitBtn && btnContent) {
          submitBtn.disabled = true;
          btnContent.innerHTML = '<i class="fas fa-circle-notch fa-spin mr-2"></i> Authentification sécurisée...';
        }

        setTimeout(() => {
          if (submitBtn && btnContent) {
            submitBtn.disabled = false;
            btnContent.innerHTML = '<i class="fas fa-right-to-bracket mr-1"></i> Se Connecter à mon Espace';
          }
          this.login(match);
        }, 350);
      });
    }

    // Logout Buttons (Intercept and open confirmation dialog)
    document.querySelectorAll('.btn-action-logout').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.openLogoutConfirmModal();
      });
    });
  },

  openLogoutConfirmModal() {
    // 1. Close profile dropdown menu if open
    const profileMenu = document.getElementById('profile-dropdown-menu');
    const profileBtn = document.getElementById('topbar-profile-btn');
    if (profileMenu) profileMenu.classList.remove('show');
    if (profileBtn) profileBtn.classList.remove('active');

    // 2. Populate active user data in the confirmation modal
    const user = this.currentUser || APP_CONSTANTS.DEMO_ACCOUNTS[2];
    const roleConfig = APP_CONSTANTS.ROLES[user.role] || APP_CONSTANTS.ROLES.ANALYST;

    const avatarImg = document.getElementById('logout-confirm-user-avatar');
    const avatarFlag = document.getElementById('logout-confirm-avatar-flag');
    const userName = document.getElementById('logout-confirm-user-name');
    const userRole = document.getElementById('logout-confirm-user-role');
    const userEmail = document.getElementById('logout-confirm-user-email');

    if (avatarImg) avatarImg.src = user.avatar;
    if (avatarFlag) {
      const flagCode = user.countryFlag || (user.id === 'demo-client' ? 'sn' : user.id === 'demo-agent' ? 'tg' : user.id === 'demo-committee' ? 'ml' : user.id === 'demo-compliance' ? 'bj' : 'bf');
      avatarFlag.innerHTML = `<span class="fi fi-${flagCode} fis"></span>`;
    }
    if (userName) userName.textContent = user.name;
    if (userRole) {
      userRole.textContent = roleConfig.name;
      userRole.style.color = roleConfig.badgeColor;
      userRole.style.backgroundColor = roleConfig.badgeBg;
      userRole.style.borderColor = roleConfig.badgeColor;
    }
    if (userEmail) userEmail.textContent = user.email;

    // 3. Display the modal
    const modal = document.getElementById('modal-confirm-logout');
    if (modal) {
      modal.style.display = 'flex';
      setTimeout(() => modal.classList.add('active'), 10);
    } else {
      // Fallback: If modal container is not found, logout directly
      this.logout();
    }
  },

  closeLogoutConfirmModal() {
    const modal = document.getElementById('modal-confirm-logout');
    if (modal) {
      modal.classList.remove('active');
      modal.style.display = 'none';
    }
  },

  confirmLogout() {
    this.closeLogoutConfirmModal();
    this.logout();
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

    // Render Role-Specific Notifications in Topbar
    this.renderNotificationsForRole(user.role);

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

    // Topbar Profile Header Elements
    const topbarAvatar = document.getElementById('topbar-avatar-img');
    const topbarName = document.getElementById('topbar-user-name');
    const topbarRole = document.getElementById('topbar-user-role');
    const menuAvatar = document.getElementById('menu-avatar-img');
    const menuName = document.getElementById('menu-user-name');
    const menuEmail = document.getElementById('menu-user-email');
    const menuRoleBadge = document.getElementById('menu-user-role-badge');

    const roleConfig = APP_CONSTANTS.ROLES[user.role] || APP_CONSTANTS.ROLES.ANALYST;

    if (roleBadge) roleBadge.textContent = user.title || roleConfig.name;
    if (userName) userName.textContent = user.name;
    if (userAvatar) userAvatar.src = user.avatar;
    if (globalRoleSelect) globalRoleSelect.value = user.role;

    if (topbarAvatar) topbarAvatar.src = user.avatar;
    if (topbarName) topbarName.textContent = user.name;
    if (topbarRole) topbarRole.textContent = user.title || roleConfig.name;

    if (menuAvatar) menuAvatar.src = user.avatar;
    if (menuName) menuName.textContent = user.name;
    if (menuEmail) menuEmail.textContent = user.email;
    if (menuRoleBadge) {
      menuRoleBadge.textContent = roleConfig.name;
      menuRoleBadge.style.color = roleConfig.badgeColor;
      menuRoleBadge.style.backgroundColor = roleConfig.badgeBg;
      menuRoleBadge.style.borderColor = roleConfig.badgeColor;
    }

    if (rolePill) {
      rolePill.textContent = roleConfig.shortName;
      rolePill.style.color = roleConfig.badgeColor;
      rolePill.style.backgroundColor = roleConfig.badgeBg;
      rolePill.style.borderColor = roleConfig.badgeColor;
    }

    // Dynamic Topbar Flag & Country sync based on logged-in user profile
    const userCountryCode = user.countryCode || (user.id === 'demo-client' ? 'SN' : user.id === 'demo-agent' ? 'TG' : user.id === 'demo-committee' ? 'ML' : user.id === 'demo-compliance' ? 'BJ' : 'BF');
    this.updateUserCountry(userCountryCode);
  },

  // 2. DYNAMIC ROLE-SPECIFIC SIDEBAR RENDERER
  renderSidebarForRole(roleCode) {
    const container = document.getElementById('sidebar-menu-container');
    if (!container) return;

    const roleConfig = APP_CONSTANTS.ROLES[roleCode] || APP_CONSTANTS.ROLES.ANALYST;
    let html = '';

    roleConfig.navGroups.forEach((group, gIdx) => {
      html += `
        <div class="sidebar-nav-group" id="sidebar-nav-group-${gIdx}">
          <div class="menu-group-title">${group.title}</div>
          <ul class="nav-items-list">
      `;
      group.items.forEach(item => {
        const badgeHtml = item.badge 
          ? `<span class="nav-badge ${item.badgeClass || ''}">${item.badge}</span>` 
          : '';
        const tooltipText = item.badge ? `${item.label} • ${item.badge}` : item.label;
        const isCurrentActive = this.currentView === item.target;

        html += `
          <li class="nav-item ${isCurrentActive ? 'active' : ''}">
            <a class="nav-link" href="javascript:void(0)" onclick="App.switchView('${item.target}'); return false;" data-view-target="${item.target}" data-nav-title="${tooltipText}" title="${item.label}">
              <i class="fas ${item.icon}"></i>
              <span class="nav-link-text">${item.label}</span>
              ${badgeHtml}
            </a>
          </li>
        `;
      });
      html += `</ul></div>`;
    });

    container.innerHTML = html;

    // Attach click events on new links for extra safety
    container.querySelectorAll('[data-view-target]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetView = link.getAttribute('data-view-target');
        if (targetView) {
          this.switchView(targetView);
        }

        // Auto close drawer on mobile screens
        if (window.innerWidth <= 992) {
          const sidebar = document.getElementById('sidebar');
          const backdrop = document.getElementById('sidebar-backdrop');
          if (sidebar) sidebar.classList.remove('mobile-open');
          if (backdrop) {
            backdrop.classList.remove('active');
            setTimeout(() => backdrop.style.display = 'none', 250);
          }
        }
      });
    });
  },

  // Helper to switch active role dynamically and re-render sidebar + view
  switchRole(roleCode) {
    const roleConfig = APP_CONSTANTS.ROLES[roleCode] || APP_CONSTANTS.ROLES.ANALYST;
    this.currentRole = roleConfig.code;
    
    // Find matching demo persona or update currentUser
    const persona = APP_CONSTANTS.DEMO_ACCOUNTS.find(a => a.role === roleConfig.code) || {
      id: `user-${roleConfig.code.toLowerCase()}`,
      name: roleConfig.name,
      role: roleConfig.code,
      email: `${roleConfig.code.toLowerCase()}@cif-ao.org`,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      title: roleConfig.shortName
    };

    this.currentUser = persona;
    localStorage.setItem('AUTH_USER', JSON.stringify(persona));

    // Update Topbar and User Header
    this.updateUserHeader(persona);

    // Re-render role-specific sidebar
    this.renderSidebarForRole(roleConfig.code);

    // Re-render role notifications
    this.renderNotificationsForRole(roleConfig.code);

    // Switch to role default home view
    this.switchView(roleConfig.homeView);
  },

  // 3. SPA Navigation Router with Role-Based Access Control (RBAC Guard)
  switchView(viewId) {
    // Role-Based Access Control verification
    const userRole = this.currentRole || (this.currentUser ? this.currentUser.role : 'ANALYST');
    const allowedViews = (APP_CONSTANTS.ROLE_PERMITTED_VIEWS && APP_CONSTANTS.ROLE_PERMITTED_VIEWS[userRole]) || [];
    
    // Strict RBAC Guard: If target view is not allowed for current role, redirect to role home
    if (allowedViews.length > 0 && !allowedViews.includes(viewId)) {
      const roleConfig = APP_CONSTANTS.ROLES[userRole] || APP_CONSTANTS.ROLES.ANALYST;
      const targetFallback = roleConfig.homeView || 'view-role-analyst';
      this.showToast(`Accès restreint : cette page est réservée à l'espace ${roleConfig.name}`, 'warning');
      viewId = targetFallback;
    }

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
    if (viewId === 'view-role-client' || viewId === 'view-client-schedule' || viewId === 'view-client-requests') {
      this.renderBorrowerDashboard();
    } else if (viewId === 'view-client-simulator') {
      this.updateClientSimulation();
    } else if (viewId === 'view-role-agent') {
      this.renderAgentDashboard();
    } else if (viewId === 'view-agent-inspections') {
      this.renderAgentInspections();
    } else if (viewId === 'view-agent-clients') {
      this.renderAgentClientsPortfolio();
    } else if (viewId === 'view-agent-complements') {
      this.renderAgentComplements();
    } else if (viewId === 'view-role-analyst' || viewId === 'view-analyst-dossiers') {
      this.renderAnalystDashboard();
    } else if (viewId === 'view-analyst-anomalies') {
      this.renderAnalystAnomalies();
    } else if (viewId === 'view-role-committee' || viewId === 'view-committee-signed') {
      this.renderCommitteeDashboard();
    } else if (viewId === 'view-role-compliance' || viewId === 'view-compliance-screening') {
      this.renderComplianceDashboard();
    } else if (viewId === 'view-scoring-admin') {
      this.updateColdStartComparisonSim();
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

    this.updateCompactEstimator();
  },

  // [ROLE 2] AGENT DE CRÉDIT (CHARGÉ DE CLIENTÈLE)
  agentSortKey: null,
  agentSortDir: 'asc',

  sortAgentTable(key) {
    if (this.agentSortKey === key) {
      this.agentSortDir = this.agentSortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.agentSortKey = key;
      this.agentSortDir = (key === 'requested_amount') ? 'desc' : 'asc';
    }

    const fieldLabels = {
      request_number: 'N° Dossier / Date',
      client_name: 'Client Emprunteur',
      requested_amount: 'Montant Demandé',
      purpose: 'Objet du Prêt',
      status: 'Statut'
    };

    const dirLabel = this.agentSortDir === 'asc' ? 'croissant' : 'décroissant';
    this.showToast(`Tri par ${fieldLabels[key] || key} (${dirLabel})`, 'info');

    this.renderAgentDashboard(true);
  },

  renderAgentDashboard(animated = false) {
    AppCharts.setupDefaults();
    AppCharts.renderActivitySparkline('agent-activity-sparkline');

    const tbody = document.getElementById('agent-pipeline-table-body');
    if (!tbody) return;

    // Update Header Sort Icons & Active state
    const sortKeys = ['request_number', 'client_name', 'requested_amount', 'purpose', 'status'];
    sortKeys.forEach(k => {
      const thEl = document.querySelector(`.sortable-th[onclick*="'${k}'"]`);
      const iconEl = document.getElementById(`sort-icon-${k}`);
      if (thEl) {
        if (this.agentSortKey === k) {
          thEl.classList.add('active-sort');
          if (iconEl) {
            iconEl.className = `fas fa-sort-${this.agentSortDir === 'asc' ? 'up' : 'down'} sort-icon`;
          }
        } else {
          thEl.classList.remove('active-sort');
          if (iconEl) {
            iconEl.className = 'fas fa-sort sort-icon';
          }
        }
      }
    });

    let requests = [...DB.get('credit_requests')];

    if (this.agentSortKey) {
      const key = this.agentSortKey;
      const isAsc = this.agentSortDir === 'asc';

      requests.sort((a, b) => {
        let valA = a[key];
        let valB = b[key];

        if (key === 'requested_amount') {
          return isAsc ? Number(valA) - Number(valB) : Number(valB) - Number(valA);
        } else if (key === 'request_number') {
          const timeA = new Date(a.created_at || 0).getTime();
          const timeB = new Date(b.created_at || 0).getTime();
          return isAsc ? timeA - timeB : timeB - timeA;
        } else {
          const strA = String(valA || '').toLowerCase();
          const strB = String(valB || '').toLowerCase();
          return isAsc ? strA.localeCompare(strB, 'fr') : strB.localeCompare(strA, 'fr');
        }
      });
    }

    const rowClass = animated ? 'sort-row-animated' : '';

    tbody.innerHTML = requests.map(r => `
      <tr class="${rowClass}">
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
        <td style="text-align: right;">
          <button class="btn btn-secondary btn-sm" onclick="App.showToast('Demande de pièces complémentaires envoyée par SMS au client', 'info')">
            <i class="fas fa-paper-plane"></i> Relancer Pièces
          </button>
        </td>
      </tr>
    `).join('');
  },

  // =========================================================================
  // [ROLE 2 - PAGE 2] INSPECTIONS & VISITES TERRAIN DES GARANTIES
  // =========================================================================
  agentInspFilter: 'ALL',
  agentInspSearch: '',

  renderAgentInspections() {
    const tbody = document.getElementById('agent-inspections-table-body');
    if (!tbody) return;

    const guarantees = DB.get('guarantees');
    const requests = DB.get('credit_requests');
    const clients = DB.get('clients');

    // Calculate KPIs
    let pendingCount = 0;
    let verifiedCount = 0;
    let totalVerifiedVal = 0;
    let totalDeclaredVal = 0;
    let totalRequestedLoanVal = 0;
    let anomaliesCount = 0;

    const items = guarantees.map(g => {
      const req = requests.find(r => r.id == g.credit_request_id) || {};
      const client = clients.find(c => c.id == req.client_id) || {};
      
      const isVerified = g.verification_status === 'VERIFIED';
      if (isVerified) {
        verifiedCount++;
        totalVerifiedVal += (g.verified_value || 0);
      } else {
        pendingCount++;
      }
      totalDeclaredVal += (g.declared_value || 0);
      if (req.requested_amount) totalRequestedLoanVal += req.requested_amount;

      if (g.declared_value && g.verified_value && g.declared_value > g.verified_value * 1.3) {
        anomaliesCount++;
      }

      return {
        ...g,
        clientName: req.client_name || 'Emprunteur CIF',
        requestNumber: req.request_number || 'REQ-2026-0000',
        city: req.city || client.city || 'UEMOA',
        country: req.country || 'UEMOA',
        zone: client.residential_zone || 'Urbaine'
      };
    });

    // Update KPIs UI
    const pendingEl = document.getElementById('insp-kpi-pending');
    const verifiedEl = document.getElementById('insp-kpi-verified');
    const ratioEl = document.getElementById('insp-kpi-ratio');
    const anomEl = document.getElementById('insp-kpi-anomalies');
    const countAllEl = document.getElementById('insp-count-all');
    const countPendingEl = document.getElementById('insp-count-pending');
    const countVerifiedEl = document.getElementById('insp-count-verified');

    if (pendingEl) pendingEl.textContent = pendingCount;
    if (verifiedEl) verifiedEl.textContent = `${(totalVerifiedVal / 1000000).toFixed(1)}M`;
    if (ratioEl) ratioEl.textContent = totalRequestedLoanVal > 0 ? `${Math.round((totalVerifiedVal / totalRequestedLoanVal) * 100)}%` : '135%';
    if (anomEl) anomEl.textContent = anomaliesCount;
    if (countAllEl) countAllEl.textContent = guarantees.length;
    if (countPendingEl) countPendingEl.textContent = pendingCount;
    if (countVerifiedEl) countVerifiedEl.textContent = verifiedCount;

    // Apply Filter & Search
    let filtered = items;
    if (this.agentInspFilter === 'PENDING') {
      filtered = filtered.filter(i => i.verification_status !== 'VERIFIED');
    } else if (this.agentInspFilter === 'VERIFIED') {
      filtered = filtered.filter(i => i.verification_status === 'VERIFIED');
    } else if (this.agentInspFilter === 'STOCK') {
      filtered = filtered.filter(i => i.guarantee_type === 'STOCK_MARCHANDISE');
    } else if (this.agentInspFilter === 'CAUTION') {
      filtered = filtered.filter(i => i.guarantee_type === 'CAUTION_SOLIDAIRE');
    }

    if (this.agentInspSearch) {
      const q = this.agentInspSearch.toLowerCase();
      filtered = filtered.filter(i => 
        i.clientName.toLowerCase().includes(q) ||
        i.requestNumber.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.city.toLowerCase().includes(q)
      );
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-subtle);">
            <i class="fas fa-search" style="font-size: 1.5rem; margin-bottom: 0.5rem; display: block;"></i>
            Aucune inspection ne correspond aux filtres sélectionnés.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(item => {
      const isVerif = item.verification_status === 'VERIFIED';
      const typeLabels = {
        'STOCK_MARCHANDISE': { label: 'Stock Marchandises', icon: 'fa-boxes-stacked', color: '#0ea5e9' },
        'EQUIPEMENT_MATERIEL': { label: 'Machines & Équipement', icon: 'fa-gears', color: '#8b5cf6' },
        'CAUTION_SOLIDAIRE': { label: 'Caution Solidaire', icon: 'fa-user-shield', color: '#10b981' },
        'GAGE_VEHICULE': { label: 'Gage Véhicule / Matériel', icon: 'fa-truck-front', color: '#f59e0b' }
      };
      const tCfg = typeLabels[item.guarantee_type] || { label: item.guarantee_type, icon: 'fa-shield', color: '#64748b' };

      return `
        <tr>
          <td>
            <strong>${item.requestNumber}</strong>
            <div style="font-size: 0.8rem; font-weight: 600; color: var(--text-primary); margin-top: 2px;">${item.clientName}</div>
            <div style="font-size: 0.72rem; color: var(--text-subtle);">${item.city}, ${item.country}</div>
          </td>
          <td>
            <span class="badge" style="background: rgba(14, 165, 233, 0.12); color: ${tCfg.color}; border: 1px solid ${tCfg.color}; font-size: 0.75rem;">
              <i class="fas ${tCfg.icon} mr-1"></i> ${tCfg.label}
            </span>
          </td>
          <td>
            <div style="font-size: 0.82rem; color: var(--text-primary); font-weight: 500;">${item.description}</div>
            <div style="font-size: 0.72rem; color: var(--text-subtle); margin-top: 2px;">
              <i class="fas fa-location-dot mr-1"></i> ${item.zone}
            </div>
          </td>
          <td><strong style="color: var(--text-primary);">${CreditScoringEngine.formatFCFA(item.declared_value)}</strong></td>
          <td>
            ${isVerif 
              ? `<strong style="color: #047857; font-weight: 700;">${CreditScoringEngine.formatFCFA(item.verified_value)}</strong>` 
              : '<span style="color: var(--text-subtle); font-style: italic;">Non expertisé</span>'}
          </td>
          <td>
            ${isVerif 
              ? `<span class="badge badge-approved"><i class="fas fa-check-circle"></i> Validée</span>`
              : `<span class="badge badge-warning"><i class="fas fa-motorcycle"></i> À Visiter</span>`}
          </td>
          <td style="text-align: right;">
            <button class="btn ${isVerif ? 'btn-secondary' : 'btn-primary'} btn-sm" onclick="App.openInspectionModal(${item.id})">
              <i class="fas ${isVerif ? 'fa-pen-to-square' : 'fa-clipboard-check'} mr-1"></i> ${isVerif ? 'Modifier' : 'Inspecter'}
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  filterInspections(filterType, btn) {
    this.agentInspFilter = filterType;
    if (btn) {
      const container = document.getElementById('insp-filter-buttons');
      if (container) {
        container.querySelectorAll('button').forEach(b => {
          b.classList.remove('btn-primary');
          if (!b.classList.contains('btn-secondary')) b.classList.add('btn-secondary');
        });
        btn.classList.remove('btn-secondary');
        btn.classList.add('btn-primary');
      }
    }
    this.renderAgentInspections();
  },

  searchInspections(query) {
    this.agentInspSearch = query;
    this.renderAgentInspections();
  },

  openInspectionModal(guaranteeId) {
    const g = DB.findById('guarantees', guaranteeId);
    if (!g) return;

    const req = DB.findById('credit_requests', g.credit_request_id) || {};
    const client = DB.findById('clients', req.client_id) || {};

    const modal = document.getElementById('modal-inspection');
    if (!modal) return;

    document.getElementById('insp-guarantee-id').value = g.id;
    document.getElementById('modal-insp-title').textContent = `Inspection de Garantie • Dossier ${req.request_number || 'N/A'}`;
    document.getElementById('insp-client-name').textContent = `${req.client_name || 'Client CIF'} • N° CIF : ${client.client_number || 'SN-DKR-008821'}`;
    document.getElementById('insp-guarantee-type').textContent = `${g.guarantee_type} • ${g.description}`;
    document.getElementById('insp-declared-val').value = CreditScoringEngine.formatFCFA(g.declared_value);
    document.getElementById('insp-verified-val').value = g.verified_value || g.declared_value || 1000000;
    document.getElementById('insp-location').value = `${req.city || 'Dakar'} - ${client.residential_zone || 'Zone Commerciale'}`;
    document.getElementById('insp-notes').value = g.verified_at ? `Contrôle sur site effectué avec succès. Actifs conformes au descriptif.` : `Visite d'atelier effectuée. Matériel en bon état de fonctionnement, couverture suffisante.`;

    const statusBadge = document.getElementById('insp-status-badge');
    if (statusBadge) {
      const isVerif = g.verification_status === 'VERIFIED';
      statusBadge.className = isVerif ? 'badge badge-approved' : 'badge badge-warning';
      statusBadge.textContent = isVerif ? 'Déjà Expertisé' : 'À Visiter Terrain';
    }

    modal.style.display = 'flex';
    modal.classList.add('active');
  },

  openNewInspectionModal() {
    const guarantees = DB.get('guarantees');
    if (guarantees.length > 0) {
      this.openInspectionModal(guarantees[0].id);
    } else {
      this.showToast('Aucune garantie en attente à planifier', 'info');
    }
  },

  saveInspectionReport() {
    const gId = Number(document.getElementById('insp-guarantee-id')?.value);
    const verifiedVal = Number(document.getElementById('insp-verified-val')?.value || 1000000);
    const notes = document.getElementById('insp-notes')?.value || 'Contrôle terrain validé';
    const condition = document.getElementById('insp-condition')?.value || 'BON';
    const reputation = document.getElementById('insp-reputation')?.value || 'TRES_FAVORABLE';

    if (gId) {
      DB.update('guarantees', gId, {
        verified_value: verifiedVal,
        verification_status: 'VERIFIED',
        verified_by: 2,
        verified_at: new Date().toISOString(),
        condition: condition,
        reputation: reputation,
        agent_notes: notes
      });

      DB.addAuditLog(2, 'INSPECTION_GARANTIE_VALIDEE', 'guarantees', gId, `Garantie #${gId} valorisée à ${CreditScoringEngine.formatFCFA(verifiedVal)} (${condition})`);
    }

    this.closeModal('modal-inspection');
    this.showToast('Rapport de visite terrain certifié & garantie validée avec succès', 'success');
    this.renderAgentInspections();
    this.renderAgentDashboard();
  },

  // =========================================================================
  // [ROLE 2 - PAGE 3] PORTEFEUILLE EMPRUNTEURS CIF
  // =========================================================================
  agentClientFilter: 'ALL',
  agentClientSearch: '',

  renderAgentClientsPortfolio() {
    const container = document.getElementById('agent-clients-grid');
    if (!container) return;

    const clients = DB.get('clients');
    const loans = DB.get('loans');
    const accounts = DB.get('financial_accounts');
    const requests = DB.get('credit_requests');

    let totalSavings = 0;
    let totalLoans = 0;
    let coldStartCount = 0;

    const clientCards = clients.map(c => {
      const clientLoans = loans.filter(l => l.client_id == c.id);
      const clientAccounts = accounts.filter(a => a.client_id == c.id);
      const clientReqs = requests.filter(r => r.client_id == c.id);
      const user = DB.findById('users', c.user_id) || {};

      const fullName = user.first_name ? `${user.first_name} ${user.last_name}` : (clientReqs[0]?.client_name || 'Sociétaire CIF');
      const country = user.country || clientReqs[0]?.country || 'Sénégal';
      const avatar = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=0ea5e9&color=fff`;

      const savingsBalance = clientAccounts.reduce((sum, a) => sum + (a.balance || 0), 0);
      const activeLoan = clientLoans.find(l => l.status === 'ACTIVE');
      const loanAmount = activeLoan ? activeLoan.outstanding_amount : 0;

      totalSavings += savingsBalance;
      totalLoans += loanAmount;
      if (c.is_cold_start) coldStartCount++;

      return {
        ...c,
        fullName,
        country,
        avatar,
        savingsBalance,
        activeLoan,
        loanAmount,
        reqCount: clientReqs.length,
        isColdStart: c.is_cold_start
      };
    });

    // Update KPI numbers
    const kpiTotal = document.getElementById('client-kpi-total');
    const kpiSavings = document.getElementById('client-kpi-savings');
    const kpiLoans = document.getElementById('client-kpi-loans');
    const kpiCold = document.getElementById('client-kpi-coldstart');
    const countAll = document.getElementById('clients-count-all');

    if (kpiTotal) kpiTotal.textContent = clients.length;
    if (kpiSavings) kpiSavings.textContent = `${(totalSavings / 1000000).toFixed(2)}M`;
    if (kpiLoans) kpiLoans.textContent = `${(totalLoans / 1000000).toFixed(1)}M`;
    if (kpiCold) kpiCold.textContent = coldStartCount;
    if (countAll) countAll.textContent = clients.length;

    // Filter & Search
    let filtered = clientCards;
    if (this.agentClientFilter === 'COLD_START') {
      filtered = filtered.filter(c => c.isColdStart);
    } else if (this.agentClientFilter === 'ACTIVE_LOAN') {
      filtered = filtered.filter(c => c.loanAmount > 0);
    } else if (this.agentClientFilter === 'VERIFIED') {
      filtered = filtered.filter(c => c.kyc_status === 'VERIFIED');
    }

    if (this.agentClientSearch) {
      const q = this.agentClientSearch.toLowerCase();
      filtered = filtered.filter(c => 
        c.fullName.toLowerCase().includes(q) ||
        c.client_number.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.occupation.toLowerCase().includes(q)
      );
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-subtle); background: var(--bg-surface); border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
          <i class="fas fa-users-slash" style="font-size: 2rem; margin-bottom: 0.75rem; color: var(--text-muted); display: block;"></i>
          Aucun membre ne correspond à vos critères de recherche.
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(c => `
      <div class="card" style="display: flex; flex-direction: column; justify-content: space-between; border-top: 3px solid ${c.isColdStart ? '#10b981' : 'var(--primary-600)'};">
        <div class="card-body" style="padding: 1.25rem;">
          <!-- Top avatar & badges -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
            <div style="display: flex; gap: 0.75rem; align-items: center;">
              <img src="${c.avatar}" alt="" style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover; border: 2px solid var(--border-color);">
              <div>
                <h4 style="font-size: 0.95rem; font-weight: 700; margin: 0; color: var(--text-primary);">${c.fullName}</h4>
                <div style="font-size: 0.72rem; color: var(--text-subtle); font-family: var(--font-mono);">${c.client_number}</div>
              </div>
            </div>
            <div>
              ${c.isColdStart 
                ? '<span class="badge badge-warning" style="font-size: 0.68rem;"><i class="fas fa-seedling"></i> Cold Start</span>' 
                : '<span class="badge badge-submitted" style="font-size: 0.68rem;"><i class="fas fa-history"></i> Membre CIF</span>'}
            </div>
          </div>

          <!-- Occupation & Location -->
          <div style="font-size: 0.8rem; color: var(--text-primary); font-weight: 600; margin-bottom: 0.25rem;">
            <i class="fas fa-briefcase text-primary mr-1"></i> ${c.occupation}
          </div>
          <div style="font-size: 0.74rem; color: var(--text-subtle); margin-bottom: 1rem;">
            <i class="fas fa-location-dot text-danger mr-1"></i> ${c.city}, ${c.country} • ${c.residential_zone}
          </div>

          <!-- Financial Snapshot Grid -->
          <div style="background: var(--bg-body); border-radius: var(--radius-md); padding: 0.75rem; display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 1rem; border: 1px solid var(--border-color);">
            <div>
              <div style="font-size: 0.68rem; text-transform: uppercase; color: var(--text-subtle); font-weight: 700;">Épargne CIF</div>
              <div style="font-size: 0.9rem; font-weight: 800; color: #047857;">${CreditScoringEngine.formatFCFA(c.savingsBalance)}</div>
            </div>
            <div>
              <div style="font-size: 0.68rem; text-transform: uppercase; color: var(--text-subtle); font-weight: 700;">Encours Prêt</div>
              <div style="font-size: 0.9rem; font-weight: 800; color: ${c.loanAmount > 0 ? 'var(--primary-700)' : 'var(--text-subtle)'};">
                ${c.loanAmount > 0 ? CreditScoringEngine.formatFCFA(c.loanAmount) : 'Aucun prêt'}
              </div>
            </div>
          </div>

          <!-- KYC status -->
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.72rem; margin-bottom: 1rem;">
            <span style="color: var(--text-subtle);">Statut Identité KYC :</span>
            <span class="badge ${c.kyc_status === 'VERIFIED' ? 'badge-approved' : 'badge-verification'}">
              <i class="fas ${c.kyc_status === 'VERIFIED' ? 'fa-check' : 'fa-clock'} mr-1"></i> ${c.kyc_status === 'VERIFIED' ? 'Vérifié Agence' : 'À Compléter'}
            </span>
          </div>

          <!-- Action Buttons -->
          <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
            <button class="btn btn-secondary btn-sm" style="flex: 1;" onclick="App.showToast('Ouverture du contact WhatsApp pour ${c.fullName}...', 'info')">
              <i class="fab fa-whatsapp text-emerald"></i> Contacter
            </button>
            <button class="btn btn-primary btn-sm" style="flex: 1;" onclick="App.openDossier360(${c.id})">
              <i class="fas fa-eye"></i> Profil 360°
            </button>
          </div>
        </div>
      </div>
    `).join('');
  },

  filterClientPortfolio(filter, btn) {
    this.agentClientFilter = filter;
    if (btn) {
      const container = document.getElementById('clients-filter-buttons');
      if (container) {
        container.querySelectorAll('button').forEach(b => {
          b.classList.remove('btn-primary');
          if (!b.classList.contains('btn-secondary')) b.classList.add('btn-secondary');
        });
        btn.classList.remove('btn-secondary');
        btn.classList.add('btn-primary');
      }
    }
    this.renderAgentClientsPortfolio();
  },

  searchClientPortfolio(query) {
    this.agentClientSearch = query;
    this.renderAgentClientsPortfolio();
  },

  exportClientsCsv() {
    const clients = DB.get('clients');
    const requests = DB.get('credit_requests');
    
    let csv = 'ID_CIF,Nom_Client,Ville,Pays,Zone_Chalandise,Profession,Statut_KYC,Cold_Start\n';
    clients.forEach(c => {
      const req = requests.find(r => r.client_id == c.id) || {};
      const name = req.client_name || 'Membre CIF';
      const country = req.country || 'UEMOA';
      csv += `"${c.client_number}","${name}","${c.city}","${country}","${c.residential_zone}","${c.occupation}","${c.kyc_status}","${c.is_cold_start ? 'OUI' : 'NON'}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Portefeuille_Clients_CIF_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.showToast('Export CSV du portefeuille clients généré avec succès', 'success');
  },

  // =========================================================================
  // [ROLE 2 - PAGE 4] PIÈCES MANQUANTES & RELANCES DOCUMENTAIRES
  // =========================================================================
  renderAgentComplements() {
    const tbody = document.getElementById('agent-complements-table-body');
    if (!tbody) return;

    const docs = DB.get('documents');
    const requests = DB.get('credit_requests');
    const anomalies = DB.get('anomalies');

    // List of pending / missing / flagged pieces
    const items = [
      {
        id: 101,
        credit_request_id: 3,
        document_type: 'FACTURE_PROFORMA_ACTUALISEE',
        expected_doc_name: 'Nouvelle Facture Proforma Quincaillerie (< 30 jours)',
        reason: 'Date OCR antérieure de 18 mois (12/01/2025). Écart de montant de 600 000 F constaté.',
        severity: 'CRITICAL',
        reminders_sent: 2,
        last_reminder: 'Il y a 2 jours',
        status: 'ANOMALY_OPEN'
      },
      {
        id: 102,
        credit_request_id: 3,
        document_type: 'CNI_RECTO_VERSO',
        expected_doc_name: 'Carte Nationale d\'Identité (Recto/Verso Certifié)',
        reason: 'Document illisible / flou sur la date de validité.',
        severity: 'WARNING',
        reminders_sent: 1,
        last_reminder: 'Hier à 15h30',
        status: 'PENDING_UPLOAD'
      },
      {
        id: 103,
        credit_request_id: 5,
        document_type: 'ENGAGEMENT_CAUTION_SOLIDAIRE',
        expected_doc_name: 'Attestation d\'Engagement Caution Maître Artisan',
        reason: 'Signature physique requise pour validation Cold Start au dossier.',
        severity: 'INFO',
        reminders_sent: 1,
        last_reminder: 'Ce matin à 09h00',
        status: 'PENDING_UPLOAD'
      },
      {
        id: 104,
        credit_request_id: 2,
        document_type: 'ATTESTATION_NON_REDEVANCE',
        expected_doc_name: 'Quittance CIE / Électricité Usine Ouaga',
        reason: 'Justificatif d\'implantation du broyeur semi-industriel.',
        severity: 'WARNING',
        reminders_sent: 0,
        last_reminder: 'Jamais relancé',
        status: 'PENDING_UPLOAD'
      }
    ];

    const missingKpi = document.getElementById('comp-kpi-missing');
    const remindersKpi = document.getElementById('comp-kpi-reminders');
    if (missingKpi) missingKpi.textContent = items.length;
    if (remindersKpi) remindersKpi.textContent = items.reduce((sum, i) => sum + i.reminders_sent, 0) + 4;

    tbody.innerHTML = items.map(item => {
      const req = requests.find(r => r.id == item.credit_request_id) || {};
      const clientName = req.client_name || 'Client Emprunteur';
      const reqNumber = req.request_number || 'REQ-2026-0000';

      return `
        <tr>
          <td>
            <strong>${reqNumber}</strong>
            <div style="font-size: 0.8rem; font-weight: 600; color: var(--text-primary); margin-top: 2px;">${clientName}</div>
            <div style="font-size: 0.72rem; color: var(--text-subtle);">${req.city || 'Lomé'}, ${req.country || 'Togo'}</div>
          </td>
          <td>
            <div style="font-weight: 700; font-size: 0.82rem; color: var(--text-primary);">
              <i class="fas fa-file-lines text-primary mr-1"></i> ${item.expected_doc_name}
            </div>
            <div style="font-size: 0.7rem; color: var(--text-subtle); font-family: var(--font-mono);">${item.document_type}</div>
          </td>
          <td>
            <div style="font-size: 0.78rem; color: ${item.severity === 'CRITICAL' ? '#b91c1c' : (item.severity === 'WARNING' ? '#b45309' : 'var(--text-secondary)')}; font-weight: 500;">
              <i class="fas ${item.severity === 'CRITICAL' ? 'fa-ban text-danger' : 'fa-triangle-exclamation text-warning'} mr-1"></i>
              ${item.reason}
            </div>
          </td>
          <td>
            <span style="font-size: 0.78rem; font-weight: 600; color: var(--text-primary);">${item.last_reminder}</span>
            <div style="font-size: 0.7rem; color: var(--text-subtle);">${item.reminders_sent} relance${item.reminders_sent > 1 ? 's' : ''} transmise${item.reminders_sent > 1 ? 's' : ''}</div>
          </td>
          <td>
            <span class="badge ${item.status === 'ANOMALY_OPEN' ? 'badge-rejected' : 'badge-verification'}">
              ${item.status === 'ANOMALY_OPEN' ? 'Anomalie Rejet' : 'En Attente'}
            </span>
          </td>
          <td style="text-align: right;">
            <div style="display: flex; gap: 0.35rem; justify-content: flex-end;">
              <button class="btn btn-secondary btn-sm" onclick="App.triggerDocReminder(${item.id}, '${clientName.replace(/'/g, "\\'")}', '${item.expected_doc_name.replace(/'/g, "\\'")}')" title="Envoyer une relance par SMS/WhatsApp">
                <i class="fas fa-paper-plane text-primary"></i> Relancer
              </button>
              <button class="btn btn-primary btn-sm" onclick="App.markDocReceived(${item.id})" title="Marquer comme reçu et conforme">
                <i class="fas fa-check"></i> Reçu
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  triggerDocReminder(docId, clientName, docName) {
    this.showToast(`Relance SMS & WhatsApp transmise avec succès à ${clientName} pour : « ${docName} »`, 'success');
  },

  triggerBulkSmsReminder() {
    this.showToast('Campagne de relance groupée déclenchée : 4 SMS et notifications WhatsApp envoyés aux emprunteurs', 'success');
    const remindersKpi = document.getElementById('comp-kpi-reminders');
    if (remindersKpi) {
      remindersKpi.textContent = Number(remindersKpi.textContent || 8) + 4;
    }
  },

  markDocReceived(docId) {
    DB.insert('documents', {
      credit_request_id: 3,
      document_type: 'PIECE_COMPLEMENTAIRE_REGULARISEE',
      original_filename: `Piece_Regularisee_${docId}.pdf`,
      file_path: 'assets/docs/regularisee.pdf',
      mime_type: 'application/pdf',
      uploaded_by: 2,
      uploaded_at: new Date().toISOString(),
      status: 'VALIDATED'
    });

    DB.addAuditLog(2, 'DOCUMENT_REGULARISE_AGENT', 'documents', docId, `Pièce complémentaire #${docId} validée et rattachée au dossier.`);

    this.showToast('Document enregistré, certifié conforme et intégré à la GED du dossier', 'success');
    this.renderAgentComplements();
  },

  // [ROLE 3] ANALYSTE RISQUE (SCORING V2 & 360°)
  renderAnalystDashboard() {
    AppCharts.setupDefaults();
    AppCharts.renderEvolutionChart('evolution-chart-canvas', 'year');
    AppCharts.renderRiskDoughnut('risk-doughnut-canvas');
    AppCharts.renderRegionalChart('regional-chart-canvas');
    AppInteractions.renderRequestsTable();
  },

  // [ROLE 3 - PAGE 2] DÉTECTION DES ANOMALIES & CONTRÔLES RISQUES
  analystAnomFilter: 'ALL',
  analystAnomSearch: '',

  renderAnalystAnomalies() {
    const tbody = document.getElementById('analyst-anomalies-table-body');
    if (!tbody) return;

    const anomalies = DB.get('anomalies');
    const requests = DB.get('credit_requests');
    const clients = DB.get('clients');

    // Enrich anomaly items
    const enriched = anomalies.map(a => {
      const req = requests.find(r => r.id === a.credit_request_id) || {};
      const client = clients.find(c => c.id === req.client_id) || {};
      return {
        ...a,
        request_number: req.request_number || `REQ-2026-000${a.credit_request_id || 1}`,
        client_name: req.client_name || 'Client CIF',
        country: req.country || 'Sénégal',
        city: req.city || 'Dakar',
        category: a.category || (a.anomaly_type?.includes('OCR') || a.document_id ? 'OCR' : (a.anomaly_type?.includes('MULTI') || a.anomaly_type?.includes('CAUTION') ? 'NETWORK' : 'FINANCIAL')),
        rule_name: a.rule_name || a.anomaly_type || 'Règle de Contrôle Automatisé',
        engine: a.engine || (a.document_id ? 'Moteur OCR Tesseract V2.2' : 'Calculateur Risque & Solvabilité V2')
      };
    });

    // Update KPI counters
    const totalActive = enriched.filter(a => a.status === 'OPEN').length;
    const critCount = enriched.filter(a => a.status === 'OPEN' && a.severity === 'CRITICAL').length;
    const ocrCount = enriched.filter(a => a.status === 'OPEN' && a.category === 'OCR').length;
    const finCount = enriched.filter(a => a.status === 'OPEN' && a.category === 'FINANCIAL').length;
    const multiCount = enriched.filter(a => a.status === 'OPEN' && a.category === 'NETWORK').length;

    const kpiTotal = document.getElementById('anom-kpi-total');
    const kpiOcr = document.getElementById('anom-kpi-ocr');
    const kpiFin = document.getElementById('anom-kpi-fin');
    const kpiMulti = document.getElementById('anom-kpi-multi');
    const countAll = document.getElementById('anom-count-all');
    const countCrit = document.getElementById('anom-count-crit');

    if (kpiTotal) kpiTotal.textContent = totalActive;
    if (kpiOcr) kpiOcr.textContent = ocrCount;
    if (kpiFin) kpiFin.textContent = finCount;
    if (kpiMulti) kpiMulti.textContent = multiCount;
    if (countAll) countAll.textContent = enriched.length;
    if (countCrit) countCrit.textContent = critCount;

    // Render Centerpiece Circular Chart.js Chart
    if (window.AppCharts && typeof window.AppCharts.renderAnomaliesDonut === 'function') {
      window.AppCharts.renderAnomaliesDonut('anomalies-distribution-chart', {
        critical: critCount,
        ocr: ocrCount,
        financial: finCount,
        network: multiCount,
        total: totalActive
      });
    }

    // Apply Filter
    let filtered = [...enriched];
    if (this.analystAnomFilter === 'CRITICAL') {
      filtered = filtered.filter(a => a.severity === 'CRITICAL');
    } else if (this.analystAnomFilter === 'OCR') {
      filtered = filtered.filter(a => a.category === 'OCR');
    } else if (this.analystAnomFilter === 'FINANCIAL') {
      filtered = filtered.filter(a => a.category === 'FINANCIAL');
    } else if (this.analystAnomFilter === 'NETWORK') {
      filtered = filtered.filter(a => a.category === 'NETWORK');
    } else if (this.analystAnomFilter === 'RESOLVED') {
      filtered = filtered.filter(a => a.status === 'RESOLVED');
    }

    // Apply Search
    if (this.analystAnomSearch) {
      const q = this.analystAnomSearch.toLowerCase();
      filtered = filtered.filter(a =>
        a.request_number.toLowerCase().includes(q) ||
        a.client_name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.rule_name.toLowerCase().includes(q) ||
        a.city.toLowerCase().includes(q) ||
        a.country.toLowerCase().includes(q)
      );
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 2.5rem; color: var(--text-subtle);">
            <i class="fas fa-shield-check" style="font-size: 2rem; color: var(--cif-emerald-500); margin-bottom: 0.75rem; display: block;"></i>
            <div style="font-weight: 600; font-size: 0.95rem; color: var(--text-primary);">Aucune anomalie ne correspond aux filtres appliqués</div>
            <div style="font-size: 0.8rem; margin-top: 0.25rem;">Tous les dossiers sous ces critères sont intègres ou déjà traités.</div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(item => {
      const isCritical = item.severity === 'CRITICAL';
      const isWarning = item.severity === 'WARNING';
      const isOpen = item.status === 'OPEN';

      const sevBadge = isCritical
        ? `<span class="badge badge-rejected" style="font-weight: 700;"><i class="fas fa-circle-exclamation mr-1"></i> Critique</span>`
        : (isWarning
          ? `<span class="badge badge-warning"><i class="fas fa-triangle-exclamation mr-1"></i> Élevé</span>`
          : `<span class="badge badge-submitted"><i class="fas fa-info-circle mr-1"></i> Informatif</span>`);

      const statusBadge = isOpen
        ? `<span class="badge badge-verification"><i class="fas fa-clock mr-1"></i> Ouvert</span>`
        : `<span class="badge badge-approved"><i class="fas fa-check mr-1"></i> Résolu</span>`;

      const typeIcon = item.category === 'OCR'
        ? 'fa-file-lines text-primary'
        : (item.category === 'NETWORK' ? 'fa-network-wired text-purple' : 'fa-calculator text-warning');

      return `
        <tr id="anomaly-row-${item.id}" class="anomaly-table-row ${!isOpen ? 'anomaly-row-resolved' : ''}">
          <td>
            <a href="javascript:void(0)" onclick="AppInteractions.openDossierModal(${item.credit_request_id})" style="font-weight: 700; color: var(--cif-primary-600); text-decoration: none;">
              ${item.request_number} <i class="fas fa-arrow-up-right-from-square" style="font-size: 0.7rem; margin-left: 2px;"></i>
            </a>
            <div style="font-size: 0.82rem; font-weight: 600; color: var(--text-primary); margin-top: 2px;">${item.client_name}</div>
            <div style="font-size: 0.72rem; color: var(--text-subtle);">
              <i class="fas fa-location-dot mr-1"></i> ${item.city}, ${item.country}
            </div>
          </td>
          <td>${sevBadge}</td>
          <td>
            <div style="font-weight: 700; font-size: 0.82rem; color: var(--text-primary);">
              <i class="fas ${typeIcon} mr-1"></i> ${item.rule_name}
            </div>
            <div style="font-size: 0.7rem; color: var(--text-subtle); font-family: var(--font-mono);">${item.anomaly_type}</div>
          </td>
          <td>
            <div style="font-size: 0.8rem; color: var(--text-primary); max-width: 280px; line-height: 1.4;">
              ${item.description}
            </div>
          </td>
          <td>
            <div style="font-size: 0.78rem;">
              <div style="color: ${isCritical ? '#b91c1c' : '#b45309'}; font-weight: 600;">
                <i class="fas fa-xmark text-danger mr-1"></i> ${item.detected_value || 'N/A'}
              </div>
              <div style="color: #047857; font-size: 0.72rem; margin-top: 2px;">
                <i class="fas fa-check text-emerald mr-1"></i> ${item.expected_value || 'Conforme'}
              </div>
            </div>
          </td>
          <td>
            <span class="badge" style="background: rgba(14, 165, 233, 0.1); color: #0284c7; border: 1px solid rgba(14, 165, 233, 0.3); font-size: 0.72rem;">
              <i class="fas fa-microchip mr-1"></i> ${item.engine}
            </span>
          </td>
          <td>${statusBadge}</td>
          <td style="text-align: right;">
            <div style="display: flex; gap: 0.35rem; justify-content: flex-end; flex-wrap: wrap;">
              <button class="btn btn-primary btn-sm" onclick="AppInteractions.openDossierModal(${item.credit_request_id})" title="Inspecter le dossier à 360°">
                <i class="fas fa-magnifying-glass mr-1"></i> 360°
              </button>
              ${isOpen ? `
                <button class="btn btn-secondary btn-sm" onclick="App.resolveAnomaly(${item.id})" title="Lever cette anomalie après vérification manuelle">
                  <i class="fas fa-check text-emerald"></i> Lever
                </button>
                <button class="btn btn-secondary btn-sm" onclick="App.requestFieldCheckForAnomaly(${item.id})" title="Demander une contre-expertise terrain à l'Agent">
                  <i class="fas fa-motorcycle text-warning"></i> Terrain
                </button>
              ` : `
                <button class="btn btn-secondary btn-sm" onclick="App.reopenAnomaly(${item.id})" title="Rouvrir le signalement">
                  <i class="fas fa-rotate text-muted"></i> Rouvrir
                </button>
              `}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  filterAnalystAnomalies(category, btn) {
    this.analystAnomFilter = category;
    if (btn) {
      const container = document.getElementById('anom-filter-buttons');
      if (container) {
        container.querySelectorAll('button').forEach(b => {
          b.classList.remove('btn-primary');
          if (!b.classList.contains('btn-secondary')) b.classList.add('btn-secondary');
        });
        btn.classList.remove('btn-secondary');
        btn.classList.add('btn-primary');
      }
    }
    this.renderAnalystAnomalies();
  },

  searchAnalystAnomalies(query) {
    this.analystAnomSearch = query;
    this.renderAnalystAnomalies();
  },

  resolveAnomaly(anomalyId) {
    const a = DB.findById('anomalies', anomalyId);
    if (!a) return;

    const row = document.getElementById(`anomaly-row-${anomalyId}`);
    if (row) {
      row.classList.add('resolving');
      // Déclenche l'animation de transition en fondu sortant
      setTimeout(() => {
        row.classList.add('resolving-fade-out');
      }, 40);
    }

    setTimeout(() => {
      DB.update('anomalies', anomalyId, {
        status: 'RESOLVED',
        resolved_by: (this.currentUser ? this.currentUser.id : 1),
        resolved_at: new Date().toISOString(),
        resolution_comment: 'Anomalie contrôlée et levée par l\'analyste risque après revue contradictoire.'
      });

      DB.addAuditLog(
        (this.currentUser ? this.currentUser.id : 1),
        'ANOMALIE_LEVEE_ANALYSTE',
        'anomalies',
        anomalyId,
        `Anomalie #${anomalyId} (${a.anomaly_type}) levée avec succès.`
      );

      this.showToast(`Anomalie #${anomalyId} levée avec succès. Dossier réévalué.`, 'success');
      this.renderAnalystAnomalies();

      // Effet lumineux sur la ligne mise à jour si toujours présente
      const updatedRow = document.getElementById(`anomaly-row-${anomalyId}`);
      if (updatedRow) {
        updatedRow.classList.add('resolved-flash');
      }
    }, 450);
  },

  reopenAnomaly(anomalyId) {
    const row = document.getElementById(`anomaly-row-${anomalyId}`);
    if (row) {
      row.classList.add('resolving');
    }

    setTimeout(() => {
      DB.update('anomalies', anomalyId, {
        status: 'OPEN',
        resolved_by: null,
        resolved_at: null,
        resolution_comment: null
      });

      this.showToast(`Anomalie #${anomalyId} rouverte pour surveillance active.`, 'info');
      this.renderAnalystAnomalies();

      const updatedRow = document.getElementById(`anomaly-row-${anomalyId}`);
      if (updatedRow) {
        updatedRow.classList.add('resolved-flash');
      }
    }, 200);
  },

  requestFieldCheckForAnomaly(anomalyId) {
    const a = DB.findById('anomalies', anomalyId);
    if (!a) return;

    const req = DB.findById('credit_requests', a.credit_request_id) || {};
    
    DB.addAuditLog(
      (this.currentUser ? this.currentUser.id : 1),
      'DEMANDE_VERIFICATION_TERRAIN',
      'credit_requests',
      a.credit_request_id,
      `Mission de contre-expertise terrain transmise à l'Agent de Crédit pour l'anomalie : ${a.description}`
    );

    this.showToast(`Ordre de mission terrain transmis à l'Agent pour le dossier ${req.request_number || 'en cours'}.`, 'success');
  },

  runFullAnomalyScan() {
    this.showToast('Scan algorithmique global et rapprochement OCR en cours...', 'info');
    setTimeout(() => {
      this.renderAnalystAnomalies();
      this.showToast('Scan terminé : 5 signaux analysés, base d\'intégrité 100% synchronisée.', 'success');
    }, 450);
  },

  exportAnomaliesCsv() {
    const anomalies = DB.get('anomalies');
    const requests = DB.get('credit_requests');

    let csv = 'ID;Numero_Dossier;Client;Gravite;Type_Anomalie;Description;Valeur_Detectee;Valeur_Attendue;Statut;Date_Detection\n';
    anomalies.forEach(a => {
      const req = requests.find(r => r.id === a.credit_request_id) || {};
      csv += `"${a.id}";"${req.request_number || ''}";"${req.client_name || ''}";"${a.severity}";"${a.anomaly_type}";"${(a.description || '').replace(/"/g, '""')}";"${(a.detected_value || '').replace(/"/g, '""')}";"${(a.expected_value || '').replace(/"/g, '""')}";"${a.status}";"${a.created_at || ''}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Registre_Anomalies_CIF_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.showToast('Export CSV du registre des anomalies téléchargé avec succès', 'success');
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
    const closeBtn = document.getElementById('sidebar-close-btn');
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');

    const toggleDrawer = () => {
      if (window.innerWidth <= 992) {
        const isOpen = sidebar.classList.toggle('mobile-open');
        if (backdrop) {
          if (isOpen) {
            backdrop.style.display = 'block';
            setTimeout(() => backdrop.classList.add('active'), 10);
          } else {
            backdrop.classList.remove('active');
            setTimeout(() => backdrop.style.display = 'none', 250);
          }
        }
      } else {
        document.body.classList.toggle('sidebar-collapsed');
      }
    };

    const closeMobileDrawer = () => {
      if (sidebar) sidebar.classList.remove('mobile-open');
      if (backdrop) {
        backdrop.classList.remove('active');
        setTimeout(() => backdrop.style.display = 'none', 250);
      }
    };

    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleDrawer();
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        closeMobileDrawer();
      });
    }

    if (backdrop) {
      backdrop.addEventListener('click', () => {
        closeMobileDrawer();
      });
    }
  },

  // Live Date & Clock Display in Topbar (Updating Every Second)
  initLiveDateTime() {
    const clockEl = document.getElementById('topbar-clock-display');
    if (!clockEl) return;

    const updateClock = () => {
      const now = new Date();
      
      const days = ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'];
      const months = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

      const dayName = days[now.getDay()];
      const dayNum = now.getDate();
      const monthName = months[now.getMonth()];
      const year = now.getFullYear();

      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      const secs = String(now.getSeconds()).padStart(2, '0');

      clockEl.textContent = `${dayName} ${dayNum} ${monthName} ${year} • ${hours}:${mins}:${secs}`;
    };

    updateClock();
    setInterval(updateClock, 1000);
  },

  // Profile Dropbox (Dropdown: Paramètres & Déconnexion)
  initProfileDropdown() {
    const profileBtn = document.getElementById('topbar-profile-btn');
    const profileMenu = document.getElementById('profile-dropdown-menu');

    if (profileBtn && profileMenu) {
      profileBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = profileMenu.classList.toggle('show');
        profileBtn.classList.toggle('active', isOpen);

        // Close notifications if open
        const notifDropdown = document.getElementById('notif-dropdown');
        if (notifDropdown) notifDropdown.style.display = 'none';
      });

      // Close dropdown when clicking anywhere outside
      document.addEventListener('click', (e) => {
        if (!profileBtn.contains(e.target) && !profileMenu.contains(e.target)) {
          profileMenu.classList.remove('show');
          profileBtn.classList.remove('active');
        }
      });

      // Close on Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          profileMenu.classList.remove('show');
          profileBtn.classList.remove('active');
          const logoutModal = document.getElementById('modal-confirm-logout');
          if (logoutModal && logoutModal.style.display !== 'none') {
            this.closeLogoutConfirmModal();
          }
        }
      });
    }
  },

  // Edit Profile Modal Handlers (Email & Phone / Mobile Money updates)
  openEditProfileModal() {
    const modal = document.getElementById('modal-edit-profile');
    const profileMenu = document.getElementById('profile-dropdown-menu');
    const profileBtn = document.getElementById('topbar-profile-btn');
    if (profileMenu) profileMenu.classList.remove('show');
    if (profileBtn) profileBtn.classList.remove('active');

    const user = this.currentUser || APP_CONSTANTS.DEMO_ACCOUNTS[2];

    const emailInput = document.getElementById('edit-profile-email');
    const phoneInput = document.getElementById('edit-profile-phone');
    const titleInput = document.getElementById('edit-profile-title');
    const avatarImg = document.getElementById('edit-profile-avatar-img');
    const avatarFlag = document.getElementById('edit-profile-avatar-flag');
    const cardName = document.getElementById('edit-profile-card-name');
    const cardRole = document.getElementById('edit-profile-card-role');
    const cardLocation = document.getElementById('edit-profile-card-location');

    if (emailInput) emailInput.value = user.email || '';
    if (phoneInput) phoneInput.value = user.phone || '+226 70 88 99 00';
    if (titleInput) titleInput.value = `${user.title || ''} • ${user.location || ''}`;
    if (avatarImg) avatarImg.src = user.avatar || '';
    if (cardName) cardName.textContent = user.name || '';
    
    const roleConfig = APP_CONSTANTS.ROLES[user.role] || APP_CONSTANTS.ROLES.ANALYST;
    if (cardRole) {
      cardRole.textContent = roleConfig.shortName || roleConfig.name;
      cardRole.style.color = roleConfig.badgeColor;
      cardRole.style.backgroundColor = roleConfig.badgeBg;
      cardRole.style.borderColor = roleConfig.badgeColor;
    }
    
    if (cardLocation) {
      const locSpan = cardLocation.querySelector('span');
      if (locSpan) locSpan.textContent = user.location || 'UEMOA';
    }

    if (avatarFlag) {
      const flagCode = (user.countryFlag || user.countryCode || 'bf').toLowerCase();
      avatarFlag.innerHTML = `<span class="fi fi-${flagCode} fis" title="${user.countryName || 'UEMOA'}"></span>`;
    }

    if (modal) {
      modal.style.display = 'flex';
      setTimeout(() => modal.classList.add('active'), 10);
    }
  },

  closeEditProfileModal() {
    const modal = document.getElementById('modal-edit-profile');
    if (modal) {
      modal.classList.remove('active');
      setTimeout(() => modal.style.display = 'none', 250);
    }
  },

  saveUserProfile() {
    const emailInput = document.getElementById('edit-profile-email');
    const phoneInput = document.getElementById('edit-profile-phone');

    if (!emailInput || !phoneInput) return;

    const newEmail = emailInput.value.trim();
    const newPhone = phoneInput.value.trim();

    if (!newEmail || !newEmail.includes('@')) {
      this.showToast('Veuillez saisir une adresse e-mail valide', 'danger');
      return;
    }

    if (!newPhone || newPhone.length < 6) {
      this.showToast('Veuillez saisir un numéro de téléphone valide', 'danger');
      return;
    }

    if (this.currentUser) {
      this.currentUser.email = newEmail;
      this.currentUser.phone = newPhone;
      localStorage.setItem('AUTH_USER', JSON.stringify(this.currentUser));
    }

    // Update in UI
    const menuEmail = document.getElementById('menu-user-email');
    if (menuEmail) menuEmail.textContent = newEmail;

    this.closeEditProfileModal();
    this.showToast(`Profil mis à jour : E-mail (${newEmail}) et Téléphone (${newPhone}) enregistrés`, 'success');
  },

  // Settings Modal Handlers
  openSettingsModal() {
    const modal = document.getElementById('settings-modal');
    const profileMenu = document.getElementById('profile-dropdown-menu');
    const profileBtn = document.getElementById('topbar-profile-btn');
    if (profileMenu) profileMenu.classList.remove('show');
    if (profileBtn) profileBtn.classList.remove('active');

    if (modal) {
      modal.style.display = 'flex';
      setTimeout(() => modal.classList.add('active'), 10);
      
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      this.updateSettingsThemeUI(currentTheme);
    }
  },

  closeSettingsModal() {
    const modal = document.getElementById('settings-modal');
    if (modal) {
      modal.classList.remove('active');
      setTimeout(() => modal.style.display = 'none', 250);
    }
  },

  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('THEME_PREF', theme);
    this.updateThemeButtonIcon(theme);
    this.updateSettingsThemeUI(theme);
    this.showToast(`Thème basculé en mode ${theme === 'dark' ? 'Sombre' : 'Clair'}`, 'info');
  },

  updateSettingsThemeUI(theme) {
    const optLight = document.getElementById('opt-theme-light');
    const optDark = document.getElementById('opt-theme-dark');
    if (optLight && optDark) {
      optLight.classList.toggle('active', theme === 'light');
      optDark.classList.toggle('active', theme === 'dark');
    }
  },

  updateUserCountry(code) {
    const map = {
      'BF': { name: 'Burkina Faso (Ouagadougou)', code: 'bf' },
      'SN': { name: 'Sénégal (Dakar)', code: 'sn' },
      'TG': { name: 'Togo (Lomé)', code: 'tg' },
      'BJ': { name: 'Bénin (Cotonou)', code: 'bj' },
      'ML': { name: 'Mali (Bamako)', code: 'ml' },
      'CI': { name: 'Côte d\'Ivoire (Abidjan)', code: 'ci' },
      'NE': { name: 'Niger (Niamey)', code: 'ne' },
      'GW': { name: 'Guinée-Bissau (Bissau)', code: 'gw' }
    };
    const c = map[code] || map['BF'];
    
    // 1. Update circular overlay flag badge on topbar user avatar
    const topbarAvatarFlag = document.getElementById('topbar-avatar-flag');
    if (topbarAvatarFlag) {
      topbarAvatarFlag.innerHTML = `<span class="fi fi-${c.code} fis" title="${c.name}"></span>`;
    }

    // 2. Update circular overlay flag badge in profile dropdown header
    const menuAvatarFlag = document.getElementById('menu-avatar-flag');
    if (menuAvatarFlag) {
      menuAvatarFlag.innerHTML = `<span class="fi fi-${c.code} fis" title="${c.name}"></span>`;
    }

    // 3. Update circular overlay flag badge on sidebar user avatar
    const sidebarAvatarFlag = document.getElementById('sidebar-avatar-flag');
    if (sidebarAvatarFlag) {
      sidebarAvatarFlag.innerHTML = `<span class="fi fi-${c.code} fis" title="${c.name}"></span>`;
    }

    // 4. Update sidebar region text
    const sidebarCountryText = document.getElementById('sidebar-country-text');
    if (sidebarCountryText) {
      sidebarCountryText.textContent = c.name;
    }

    // 5. Update settings modal country select if open
    const settingCountrySelect = document.getElementById('setting-country');
    if (settingCountrySelect && settingCountrySelect.value !== code) {
      settingCountrySelect.value = code;
    }

    if (this.currentUser) {
      this.currentUser.countryCode = code;
      this.currentUser.countryName = c.name;
      this.currentUser.countryFlag = c.code;
    }
  },

  // ==========================================================================
  // [FEATURE] SERVICE WORKER & OFFLINE RESILIENCE CONTROLLER
  // ==========================================================================
  initServiceWorkerAndOffline() {
    // 1. Register Service Worker for offline asset caching
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('[ServiceWorker] Registre actif avec portée :', registration.scope);
          })
          .catch((err) => {
            console.warn('[ServiceWorker] Note : Enregistrement SW en environnement de prévisualisation :', err);
          });
      });
    }

    // 2. Listen to network connectivity changes
    window.addEventListener('online', () => {
      this.updateOfflineStatus(true);
      this.showToast('Connexion rétablie : Synchronisation temps réel active', 'success');
    });

    window.addEventListener('offline', () => {
      this.updateOfflineStatus(false);
      this.showToast('Mode Hors-Ligne Actif : Vos données du tableau de bord restent consultables via le cache local', 'info');
    });

    // Check initial connectivity status
    this.updateOfflineStatus(navigator.onLine);
  },

  updateOfflineStatus(isOnline) {
    const topbarBadge = document.getElementById('topbar-offline-badge');
    const borrowerAlert = document.getElementById('borrower-offline-alert');

    if (topbarBadge) {
      topbarBadge.style.display = isOnline ? 'none' : 'inline-flex';
    }
    if (borrowerAlert) {
      borrowerAlert.style.display = isOnline ? 'none' : 'block';
    }
  },

  saveSettings() {
    this.closeSettingsModal();
    this.showToast('Vos préférences ont été enregistrées avec succès', 'success');
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
    const searchContainer = document.getElementById('topbar-search-container');
    const mobileSearchBtn = document.getElementById('mobile-search-trigger-btn');
    const closeMobileSearchBtn = document.getElementById('search-close-mobile-btn');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const q = e.target.value;
        if (this.currentRole === 'ANALYST') {
          AppInteractions.renderRequestsTable('ALL', q);
        }
      });
    }

    if (mobileSearchBtn && searchContainer) {
      mobileSearchBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        searchContainer.classList.add('mobile-active');
        if (searchInput) searchInput.focus();
      });
    }

    if (closeMobileSearchBtn && searchContainer) {
      closeMobileSearchBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        searchContainer.classList.remove('mobile-active');
      });
    }

    document.addEventListener('click', (e) => {
      if (searchContainer && searchContainer.classList.contains('mobile-active')) {
        if (!searchContainer.contains(e.target) && (!mobileSearchBtn || !mobileSearchBtn.contains(e.target))) {
          searchContainer.classList.remove('mobile-active');
        }
      }
    });
  },

  // =========================================================================
  // ROLE-BASED NOTIFICATIONS MANAGER
  // =========================================================================
  currentRoleNotifications: [],
  currentNotifFilter: 'ALL',

  initNotifications() {
    const notifBtn = document.getElementById('notif-bell-btn');
    const notifDropdown = document.getElementById('notif-dropdown');

    if (notifBtn && notifDropdown) {
      notifBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = notifDropdown.style.display === 'block';
        notifDropdown.style.display = isOpen ? 'none' : 'block';

        // Close profile dropdown if open
        const profileMenu = document.getElementById('profile-dropdown-menu');
        const profileBtn = document.getElementById('topbar-profile-btn');
        if (profileMenu) profileMenu.classList.remove('show');
        if (profileBtn) profileBtn.classList.remove('active');
      });

      // Close dropdown when clicking outside
      document.addEventListener('click', (e) => {
        if (!notifBtn.contains(e.target) && !notifDropdown.contains(e.target)) {
          notifDropdown.style.display = 'none';
        }
      });

      // Close on Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          notifDropdown.style.display = 'none';
        }
      });
    }
  },

  renderNotificationsForRole(roleCode) {
    const role = roleCode || (this.currentUser ? this.currentUser.role : 'ANALYST');
    const roleConfig = APP_CONSTANTS.ROLES[role] || APP_CONSTANTS.ROLES.ANALYST;

    // Load list from constants clone
    const notifs = (APP_CONSTANTS.ROLE_NOTIFICATIONS && APP_CONSTANTS.ROLE_NOTIFICATIONS[role]) || [];
    this.currentRoleNotifications = JSON.parse(JSON.stringify(notifs));
    this.currentNotifFilter = 'ALL';

    // Subtitle update
    const subtitleEl = document.getElementById('notif-header-subtitle');
    if (subtitleEl) {
      subtitleEl.textContent = `Alertes & Flux : Espace ${roleConfig.name}`;
    }

    // Render Filter Chips
    const filterContainer = document.getElementById('notif-filter-bar');
    if (filterContainer) {
      const filters = (APP_CONSTANTS.ROLE_NOTIFICATION_FILTERS && APP_CONSTANTS.ROLE_NOTIFICATION_FILTERS[role]) || [{ key: 'ALL', label: 'Toutes' }];
      filterContainer.innerHTML = filters.map((f, idx) => `
        <button class="notif-chip ${idx === 0 ? 'active' : ''}" data-filter-key="${f.key}" onclick="App.filterNotifications('${f.key}', this)">
          ${f.icon ? `<i class="fas ${f.icon} mr-1"></i>` : ''} ${f.label}
        </button>
      `).join('');
    }

    // Update Footer Action Button text
    const footerText = document.getElementById('notif-footer-action-text');
    if (footerText) {
      if (role === 'CLIENT') footerText.textContent = 'Accéder à mes demandes & dossiers';
      else if (role === 'CREDIT_OFFICER') footerText.textContent = 'Consulter le portefeuille guichet';
      else if (role === 'COMMITTEE') footerText.textContent = 'Voir les décisions & procès-verbaux';
      else if (role === 'COMPLIANCE') footerText.textContent = 'Ouvrir le registre d\'audit LBC/FT';
      else footerText.textContent = 'Consulter l\'historique d\'audit CIF';
    }

    this.updateNotificationListUI();
  },

  updateNotificationListUI() {
    const container = document.getElementById('notif-list-container');
    const badgeTop = document.getElementById('topbar-notif-badge');
    const badgeUnread = document.getElementById('notif-unread-count-badge');
    if (!container) return;

    const notifs = this.currentRoleNotifications || [];
    const unreadCount = notifs.filter(n => n.unread).length;

    // Update Topbar badge & bell pulse animation
    const notifBtn = document.getElementById('notif-bell-btn');
    if (badgeTop) {
      badgeTop.textContent = unreadCount;
      badgeTop.style.display = unreadCount > 0 ? 'flex' : 'none';
      badgeTop.classList.toggle('pulse', unreadCount > 0);
    }
    if (notifBtn) {
      notifBtn.classList.toggle('has-unread', unreadCount > 0);
      notifBtn.classList.toggle('bell-pulse', unreadCount > 0);
    }

    // Update Dropdown header badge
    if (badgeUnread) {
      badgeUnread.textContent = `${unreadCount} Non Lue${unreadCount > 1 ? 's' : ''}`;
      badgeUnread.className = `badge ${unreadCount > 0 ? 'badge-submitted' : 'badge-approved'}`;
    }

    // Filter items
    const filtered = this.currentNotifFilter === 'ALL' 
      ? notifs 
      : notifs.filter(n => n.category === this.currentNotifFilter);

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 2rem 1rem; color: var(--text-subtle);">
          <i class="fas fa-bell-slash" style="font-size: 1.8rem; margin-bottom: 0.5rem; opacity: 0.5;"></i>
          <p style="font-size: 0.82rem; margin: 0;">Aucune notification dans cette catégorie.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(item => `
      <div class="notif-item ${item.unread ? 'unread' : ''} notif-cat-${item.category}" onclick="App.handleNotificationClick(${item.id}, '${item.targetView}')">
        <div class="notif-item-icon ${item.iconType || 'primary'}">
          <i class="fas ${item.icon}"></i>
        </div>
        <div class="notif-item-content">
          <div class="notif-item-header">
            <span class="notif-item-title">${item.title}</span>
            ${item.unread ? '<span class="notif-unread-dot"></span>' : ''}
          </div>
          <p class="notif-item-desc">${item.desc}</p>
          <div class="notif-item-meta">
            <span class="notif-item-tag"><i class="fas fa-tag mr-1"></i> ${item.tag}</span>
            <span class="notif-item-time"><i class="far fa-clock mr-1"></i> ${item.time}</span>
          </div>
        </div>
      </div>
    `).join('');
  },

  filterNotifications(category, chipEl) {
    this.currentNotifFilter = category;
    const chips = document.querySelectorAll('#notif-filter-bar .notif-chip');
    chips.forEach(c => c.classList.remove('active'));
    if (chipEl) chipEl.classList.add('active');
    this.updateNotificationListUI();
  },

  handleNotificationClick(notifId, targetView) {
    const notif = (this.currentRoleNotifications || []).find(n => n.id === notifId);
    if (notif) {
      notif.unread = false;
    }

    this.updateNotificationListUI();

    // Close notification dropdown
    const notifDropdown = document.getElementById('notif-dropdown');
    if (notifDropdown) notifDropdown.style.display = 'none';

    // Navigate to target view if provided and valid
    if (targetView) {
      this.switchView(targetView);
    }
  },

  markAllNotificationsRead() {
    (this.currentRoleNotifications || []).forEach(n => {
      n.unread = false;
    });
    this.updateNotificationListUI();
    this.showToast('Toutes les notifications ont été marquées comme lues', 'success');
  },

  handleNotifFooterAction() {
    const notifDropdown = document.getElementById('notif-dropdown');
    if (notifDropdown) notifDropdown.style.display = 'none';

    const role = this.currentRole || (this.currentUser ? this.currentUser.role : 'ANALYST');
    if (role === 'CLIENT') {
      this.switchView('view-client-requests');
    } else if (role === 'CREDIT_OFFICER') {
      this.switchView('view-agent-clients');
    } else if (role === 'COMMITTEE') {
      this.switchView('view-role-committee');
    } else if (role === 'COMPLIANCE') {
      this.switchView('view-audit-logs');
    } else {
      this.switchView('view-audit-logs');
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

  handleWizardProfileModeChange(mode) {
    const isCold = mode === 'COLD_START';
    const labelStd = document.getElementById('label-profile-standard');
    const labelCold = document.getElementById('label-profile-coldstart');
    const indicator = document.getElementById('wiz-cold-start-indicator');
    const info = document.getElementById('wiz-cold-start-info');

    if (labelStd && labelCold) {
      if (isCold) {
        labelCold.style.borderColor = 'var(--primary-600)';
        labelCold.style.background = 'var(--cif-emerald-50, #f0fdf4)';
        labelStd.style.borderColor = 'var(--border-color)';
        labelStd.style.background = 'var(--bg-surface)';
      } else {
        labelStd.style.borderColor = 'var(--primary-600)';
        labelStd.style.background = 'var(--cif-primary-50, #eff6ff)';
        labelCold.style.borderColor = 'var(--border-color)';
        labelCold.style.background = 'var(--bg-surface)';
      }
    }

    if (indicator) {
      indicator.className = isCold ? 'badge badge-warning' : 'badge badge-submitted';
      indicator.innerHTML = isCold ? '<i class="fas fa-check"></i> Mode Cold Start Activé' : '<i class="fas fa-history"></i> Mode Standard (Historique)';
    }

    if (info) {
      info.style.display = isCold ? 'block' : 'none';
    }
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

    const isColdStart = (document.querySelector('input[name="wiz-profile-mode"]:checked')?.value || 'COLD_START') === 'COLD_START';

    const cap = CreditScoringEngine.calculateCapacity(inc, 0, exp, 0, amount, months);

    // Create or find client
    const newClient = DB.insert('clients', {
      user_id: 4,
      client_number: `${country.substring(0, 2).toUpperCase()}-${city.substring(0, 3).toUpperCase()}-00${Math.floor(1000 + Math.random() * 9000)}`,
      address: city,
      city: city,
      residential_zone: 'Zone Péri-urbaine Mixte',
      occupation: document.getElementById('wiz-sector')?.value || 'Commerce de Détail / Gros',
      kyc_status: 'VERIFIED',
      institution_verified_at: new Date().toISOString(),
      is_cold_start: isColdStart
    });

    const newReq = DB.insert('credit_requests', {
      client_id: newClient.id,
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
      is_cold_start: isColdStart,
      score: isColdStart ? 80 : 75
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

    this.showSuccessModal({
      title: 'Demande de Crédit Déposée avec Succès !',
      subtitle: `Votre dossier #${newReq.request_number} a été scellé par empreinte cryptographique et transmis au service d'analyse CIF.`,
      reference: newReq.request_number,
      amount: CreditScoringEngine.formatFCFA(amount),
      payment: `${CreditScoringEngine.formatFCFA(cap.estimatedPayment)} / mois (${months} mois)`,
      statusHtml: '<i class="fas fa-circle-check"></i> Enregistré & En Attente d\'Analyse',
      statusClass: 'badge-approved',
      primaryBtnText: 'Consulter mon Tableau de Bord Emprunteur',
      onPrimaryClick: () => {
        if (this.currentRole === 'CLIENT') {
          this.switchView('view-role-client');
        } else {
          this.switchView('view-analyst-dossiers');
          AppInteractions.renderRequestsTable();
        }
      },
      receiptTitle: `Recipisse_Demande_${newReq.request_number}.pdf`
    });
  },

  initComplianceScreening() {
    const screenBtn = document.getElementById('btn-screen-client');
    const nameInput = document.getElementById('screen-client-name');
    const resultBox = document.getElementById('screening-result-box');

    const performScreen = (inputEl, targetBox) => {
      const query = inputEl ? inputEl.value.trim().toLowerCase() : '';
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
        if (targetBox) {
          targetBox.innerHTML = `
            <div class="anomaly-item critical" style="margin-top: 1rem;">
              <i class="fas fa-shield-halved anomaly-icon"></i>
              <div class="anomaly-content">
                <h5>ALERTE CONFORMITÉ : Correspondance Détectée (${match.risk_level})</h5>
                <p><strong>Cible :</strong> ${match.full_name} (${match.country})</p>
                <p><strong>Catégorie :</strong> ${match.category}</p>
                <p><strong>Motif de signalement :</strong> ${match.match_reason}</p>
                <div style="margin-top: 6px; display: flex; gap: 0.5rem;">
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
        }
        this.showToast('Alerte LBC/FT détectée sur la liste de surveillance !', 'danger');
      } else {
        if (targetBox) {
          targetBox.innerHTML = `
            <div class="anomaly-item info" style="margin-top: 1rem;">
              <i class="fas fa-circle-check anomaly-icon" style="color: #10b981;"></i>
              <div class="anomaly-content">
                <h5>Contrôle Négatif - Aucun Signalement</h5>
                <p>Le client '<strong>${inputEl ? inputEl.value : ''}</strong>' ne figure sur aucune liste de sanctions UEMOA/ONU/GAFI et ne présente pas d'alerte PPE bloquante.</p>
              </div>
            </div>
          `;
        }
        this.showToast('Filtrage conforme : Aucun risque détecté', 'success');
      }
    };

    if (screenBtn && nameInput) {
      screenBtn.addEventListener('click', () => performScreen(nameInput, resultBox));
      nameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          performScreen(nameInput, resultBox);
        }
      });
    }

    const altInput = document.getElementById('screening-full-name-input');
    if (altInput) {
      altInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.showToast('Contrôle approfondi exécuté : Diligence conforme', 'success');
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

  // =========================================================================
  // CLIENT / DEMANDEUR EXTENDED FEATURES & INTERACTIONS
  // =========================================================================

  filterClientDocs(category, buttonEl) {
    const buttons = document.querySelectorAll('#doc-filter-buttons button');
    buttons.forEach(b => {
      b.classList.remove('btn-primary', 'active');
      b.classList.add('btn-secondary');
    });
    if (buttonEl) {
      buttonEl.classList.remove('btn-secondary');
      buttonEl.classList.add('btn-primary', 'active');
    }

    const cards = document.querySelectorAll('#client-documents-grid .doc-card-item');
    cards.forEach(card => {
      if (category === 'ALL' || card.dataset.category === category) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  },

  handleClientDocUpload(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    this.showToast(`Numérisation OCR en cours pour : ${file.name}...`, 'info');

    setTimeout(() => {
      const grid = document.getElementById('client-documents-grid');
      if (grid) {
        const newCard = document.createElement('div');
        newCard.className = 'card doc-card-item';
        newCard.dataset.category = 'INVOICE';
        newCard.style.padding = '1.25rem';
        newCard.style.position = 'relative';
        newCard.innerHTML = `
          <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1rem;">
            <div style="display: flex; gap: 0.75rem; align-items: center;">
              <div style="width: 42px; height: 42px; border-radius: var(--radius-md); background: #dcfce7; color: #15803d; display: flex; align-items: center; justify-content: center; font-size: 1.25rem;">
                <i class="fas fa-file-circle-check"></i>
              </div>
              <div>
                <h4 style="font-size: 0.88rem; font-weight: 700; margin-bottom: 2px;">${file.name}</h4>
                <span style="font-size: 0.72rem; color: var(--text-subtle);">${(file.size / 1024).toFixed(0)} Ko • Téléversé à l'instant</span>
              </div>
            </div>
          </div>
          <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 1rem;">
            <div><strong>Analyse IA :</strong> Données extraites avec succès</div>
            <div><strong>Conformité :</strong> Certifié sans anomalie</div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 0.75rem;">
            <span class="badge badge-approved"><i class="fas fa-check-circle"></i> OCR Validé 100%</span>
            <button class="btn btn-secondary btn-sm" onclick="App.showToast('Aperçu du document...', 'info')">
              <i class="fas fa-eye"></i> Aperçu
            </button>
          </div>
        `;
        grid.prepend(newCard);
      }
      this.showToast(`Document "${file.name}" extrait et transmis à votre analyste !`, 'success');
      event.target.value = '';
    }, 1200);
  },

  handleClientDocDrop(event) {
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      this.handleClientDocUpload({ target: { files: files, value: '' } });
    }
  },

  updateClientSimulation() {
    const amountRange = document.getElementById('sim-amount-range');
    const durationRange = document.getElementById('sim-duration-range');
    const incomeInput = document.getElementById('sim-income-input');
    const chargesInput = document.getElementById('sim-charges-input');
    const productSelect = document.getElementById('sim-product-select');

    if (!amountRange || !durationRange) return;

    const amount = parseInt(amountRange.value, 10) || 2500000;
    const duration = parseInt(durationRange.value, 10) || 12;
    const income = parseInt(incomeInput ? incomeInput.value : 850000, 10) || 850000;
    const charges = parseInt(chargesInput ? chargesInput.value : 180000, 10) || 180000;

    let rateAnnual = 0.12;
    if (productSelect) {
      if (productSelect.value === 'AGRICULTURAL') rateAnnual = 0.095;
      else if (productSelect.value === 'EQUIPMENT') rateAnnual = 0.11;
      else if (productSelect.value === 'GROUP') rateAnnual = 0.135;
    }

    const amountLabel = document.getElementById('sim-amount-label');
    const durationLabel = document.getElementById('sim-duration-label');
    if (amountLabel) amountLabel.textContent = CreditScoringEngine.formatFCFA(amount);
    if (durationLabel) durationLabel.textContent = `${duration} Mois`;

    // Standard degressive amortization calculation
    const rateMonthly = rateAnnual / 12;
    const monthlyPayment = (amount * rateMonthly) / (1 - Math.pow(1 + rateMonthly, -duration));
    const totalPayments = monthlyPayment * duration;
    const totalInterest = totalPayments - amount;
    const feesAndInsurance = Math.round(amount * 0.015);
    const monthlyTotal = Math.round(monthlyPayment + (feesAndInsurance / duration));

    const monthlyOutput = document.getElementById('sim-monthly-output');
    const capitalOutput = document.getElementById('sim-capital-output');
    const interestOutput = document.getElementById('sim-interest-output');
    const feesOutput = document.getElementById('sim-fees-output');
    const totalCostOutput = document.getElementById('sim-total-cost-output');

    if (monthlyOutput) monthlyOutput.textContent = CreditScoringEngine.formatFCFA(monthlyTotal);
    if (capitalOutput) capitalOutput.textContent = CreditScoringEngine.formatFCFA(amount);
    if (interestOutput) interestOutput.textContent = CreditScoringEngine.formatFCFA(Math.round(totalInterest));
    if (feesOutput) feesOutput.textContent = CreditScoringEngine.formatFCFA(feesAndInsurance);
    if (totalCostOutput) totalCostOutput.textContent = CreditScoringEngine.formatFCFA(Math.round(amount + totalInterest + feesAndInsurance));

    // Debt ratio and rest-to-live
    const totalMonthlyDebt = charges + monthlyTotal;
    const debtRatio = income > 0 ? (totalMonthlyDebt / income) * 100 : 0;
    const restToLive = income - totalMonthlyDebt;

    const ratioOutput = document.getElementById('sim-ratio-output');
    const ratioBar = document.getElementById('sim-ratio-bar');
    const restToLiveOutput = document.getElementById('sim-rest-to-live-output');
    const eligibilityBadge = document.getElementById('sim-eligibility-badge');

    if (ratioOutput) {
      if (debtRatio <= 33) {
        ratioOutput.style.color = '#047857';
        ratioOutput.textContent = `${debtRatio.toFixed(1)}% (Conforme norme UEMOA ≤ 33%)`;
      } else if (debtRatio <= 45) {
        ratioOutput.style.color = '#b45309';
        ratioOutput.textContent = `${debtRatio.toFixed(1)}% (Attention : Proche du seuil d'alerte)`;
      } else {
        ratioOutput.style.color = '#b91c1c';
        ratioOutput.textContent = `${debtRatio.toFixed(1)}% (Dépassement du seuil maximal de 45%)`;
      }
    }

    if (ratioBar) {
      ratioBar.style.width = `${Math.min(debtRatio, 100)}%`;
      ratioBar.style.background = debtRatio <= 33 ? '#10b981' : (debtRatio <= 45 ? '#f59e0b' : '#ef4444');
    }

    if (restToLiveOutput) {
      restToLiveOutput.textContent = `${CreditScoringEngine.formatFCFA(Math.max(0, restToLive))} / mois`;
      restToLiveOutput.style.color = restToLive >= 200000 ? '#047857' : (restToLive >= 100000 ? '#b45309' : '#b91c1c');
    }

    if (eligibilityBadge) {
      const isColdStartSim = document.getElementById('sim-cold-start-toggle')?.checked ?? true;
      const simModeLabel = document.getElementById('sim-scoring-mode-label');

      if (simModeLabel) {
        if (isColdStartSim) {
          simModeLabel.innerHTML = '<i class="fas fa-seedling text-emerald"></i> Modèle Cold Start UEMOA Appliqué (Score Est. 82/100 • Risque Faible)';
        } else {
          simModeLabel.innerHTML = '<i class="fas fa-history text-primary"></i> Modèle Standard CIF Appliqué (Score Est. 78/100)';
        }
      }

      if (debtRatio <= 40 && restToLive >= 150000) {
        eligibilityBadge.className = 'badge badge-approved';
        eligibilityBadge.innerHTML = isColdStartSim 
          ? '<i class="fas fa-seedling"></i> Éligible Cold Start CIF' 
          : '<i class="fas fa-circle-check"></i> Éligible CIF Standard';
      } else {
        eligibilityBadge.className = 'badge badge-verification';
        eligibilityBadge.innerHTML = '<i class="fas fa-triangle-exclamation"></i> Étude Approfondie Requise';
      }
    }
  },

  updateColdStartComparisonSim() {
    const capSlider = document.getElementById('cs-sim-cap');
    const actSlider = document.getElementById('cs-sim-act');
    const garSlider = document.getElementById('cs-sim-gar');
    const ocrSlider = document.getElementById('cs-sim-ocr');

    if (!capSlider) return;

    const capRatio = parseFloat(capSlider.value) || 2.2;
    const actYears = parseFloat(actSlider.value) || 4;
    const garPct = parseFloat(garSlider.value) || 100;
    const ocrPct = parseFloat(ocrSlider.value) || 95;

    // Update labels
    const capValEl = document.getElementById('cs-sim-cap-val');
    const actValEl = document.getElementById('cs-sim-act-val');
    const garValEl = document.getElementById('cs-sim-gar-val');
    const ocrValEl = document.getElementById('cs-sim-ocr-val');

    if (capValEl) capValEl.textContent = `${capRatio.toFixed(1)}x (${capRatio >= 2 ? 'Très Bon' : (capRatio >= 1.3 ? 'Conforme' : 'Faible')})`;
    if (actValEl) actValEl.textContent = `${actYears} an${actYears > 1 ? 's' : ''} d'activité`;
    if (garValEl) garValEl.textContent = `${garPct}% de couverture`;
    if (ocrValEl) ocrValEl.textContent = `${ocrPct}% (KYC Certifié)`;

    // Score calculations
    // Sub-scores 0-100
    const scoreCap = Math.min(100, Math.round(capRatio * 42));
    const scoreAct = Math.min(100, Math.round(actYears * 18));
    const scoreGar = Math.min(100, Math.round(garPct * 0.9));
    const scoreOcr = Math.min(100, ocrPct);
    const scoreContext = 80;

    // Standard Model: penalizes zero prior credit (0) and zero savings (0) (35% total weight = 0 points)
    // Formula: 25% cap + 15% act + 10% gar + 10% ocr + 5% context + 0 (credit 20% + savings 15%)
    const stdScore = Math.round(
      (scoreCap * 0.25) +
      (scoreAct * 0.15) +
      (scoreGar * 0.10) +
      (scoreOcr * 0.10) +
      (scoreContext * 0.05) +
      0 // No history penalty in traditional standard scoring
    );

    // Cold Start Model: 35% cap + 25% act + 20% gar + 10% context + 10% ocr
    const csScore = Math.min(100, Math.round(
      (scoreCap * 0.35) +
      (scoreAct * 0.25) +
      (scoreGar * 0.20) +
      (scoreContext * 0.10) +
      (scoreOcr * 0.10)
    ));

    const stdScoreEl = document.getElementById('cs-sim-std-score');
    const csScoreEl = document.getElementById('cs-sim-cs-score');
    const stdBadgeEl = document.getElementById('cs-sim-std-badge');
    const csBadgeEl = document.getElementById('cs-sim-cs-badge');
    const gainBadgeEl = document.getElementById('cs-sim-gain-badge');

    if (stdScoreEl) stdScoreEl.innerHTML = `${stdScore}<span style="font-size: 1rem; color: var(--text-subtle);">/100</span>`;
    if (csScoreEl) csScoreEl.innerHTML = `${csScore}<span style="font-size: 1rem; color: var(--text-subtle);">/100</span>`;

    if (stdBadgeEl) {
      if (stdScore >= 70) {
        stdBadgeEl.className = 'badge badge-approved';
        stdBadgeEl.textContent = 'Éligible';
      } else if (stdScore >= 55) {
        stdBadgeEl.className = 'badge badge-warning';
        stdBadgeEl.textContent = 'Douteux';
      } else {
        stdBadgeEl.className = 'badge badge-rejected';
        stdBadgeEl.textContent = 'Pénalisé (Zéro antécédent)';
      }
    }

    if (csBadgeEl) {
      if (csScore >= 70) {
        csBadgeEl.className = 'badge badge-approved';
        csBadgeEl.innerHTML = '<i class="fas fa-check"></i> Éligible Comité';
      } else {
        csBadgeEl.className = 'badge badge-warning';
        csBadgeEl.innerHTML = '<i class="fas fa-triangle-exclamation"></i> Étude Approfondie';
      }
    }

    if (gainBadgeEl) {
      const diff = csScore - stdScore;
      gainBadgeEl.textContent = `+${diff} pts d'Inclusion Financière`;
    }
  },

  applyFromSimulation() {
    const amountRange = document.getElementById('sim-amount-range');
    const durationRange = document.getElementById('sim-duration-range');
    const amount = amountRange ? amountRange.value : 2500000;
    const duration = durationRange ? durationRange.value : 12;

    this.switchView('view-client-wizard');

    // Pre-fill amount and duration in wizard if elements exist
    const wizAmount = document.getElementById('wiz-loan-amount');
    const wizDuration = document.getElementById('wiz-loan-duration');
    if (wizAmount) {
      wizAmount.value = amount;
      wizAmount.dispatchEvent(new Event('input'));
    }
    if (wizDuration) {
      wizDuration.value = duration;
      wizDuration.dispatchEvent(new Event('input'));
    }

    this.showToast(`Simulation transférée : ${CreditScoringEngine.formatFCFA(parseInt(amount, 10))} sur ${duration} mois`, 'success');
  },

  openClientPaymentModal(dueIndex = 3, amount = 235000) {
    const modal = document.getElementById('client-payment-modal');
    const dueLabel = document.getElementById('payment-modal-due-label');
    const amountLabel = document.getElementById('payment-modal-amount-label');
    const btnConfirm = document.getElementById('btn-confirm-momo-pay');

    if (dueLabel) dueLabel.textContent = `Échéance N° ${dueIndex} (05/09/2026)`;
    if (amountLabel) amountLabel.textContent = CreditScoringEngine.formatFCFA(amount);
    if (btnConfirm) btnConfirm.innerHTML = `<i class="fas fa-lock mr-2"></i> Confirmer le Paiement de ${CreditScoringEngine.formatFCFA(amount)}`;

    if (modal) {
      modal.style.display = 'flex';
    }
  },

  closeClientPaymentModal() {
    const modal = document.getElementById('client-payment-modal');
    if (modal) modal.style.display = 'none';
  },

  triggerMobileMoneyPayment(provider) {
    this.openClientPaymentModal(3, 235000);
    const radios = document.querySelectorAll('input[name="momo_provider"]');
    radios.forEach(r => {
      if (r.value.toLowerCase().includes(provider.toLowerCase().split(' ')[0])) {
        r.checked = true;
      }
    });
  },

  submitClientPayment(event) {
    event.preventDefault();
    const phone = document.getElementById('payment-phone-number')?.value || '77 540 88 12';
    const selectedProvider = document.querySelector('input[name="momo_provider"]:checked')?.value || 'Orange Money';

    this.closeClientPaymentModal();
    this.showToast(`Requête USSD envoyée vers le +221 ${phone} (${selectedProvider})...`, 'info');

    setTimeout(() => {
      // Update the table row in schedule if rendered
      const due3Row = document.querySelector('#client-schedule-table-body tr:nth-child(3)');
      if (due3Row) {
        due3Row.style.background = '';
        if (due3Row.children[7]) {
          due3Row.children[7].innerHTML = `<span class="badge badge-approved"><i class="fas fa-check"></i> Payé le 18/08 (${selectedProvider})</span>`;
        }
        if (due3Row.children[8]) {
          due3Row.children[8].innerHTML = `<button class="btn btn-secondary btn-sm" onclick="App.showToast('Téléchargement du reçu REC-2026-0905', 'success')"><i class="fas fa-file-invoice"></i> Reçu #3</button>`;
        }
      }

      this.showSuccessModal({
        title: 'Paiement Mobile Money Validé !',
        subtitle: `Le règlement de votre échéance N° 3 a été débité et certifié via ${selectedProvider}.`,
        reference: 'TXN-MOMO-2026-0905-8821',
        amount: '235 000 FCFA',
        payment: 'Échéance N° 3 Soldée (Principal: 208 333 F + Intérêts: 26 667 F)',
        statusHtml: `<i class="fas fa-circle-check"></i> Règlement Confirmé (${selectedProvider})`,
        statusClass: 'badge-approved',
        primaryBtnText: 'Voir mon Échéancier de Remboursement',
        onPrimaryClick: () => {
          this.switchView('view-client-schedule');
        },
        receiptTitle: 'Recu_Paiement_MOMO_2026_0905.pdf'
      });
    }, 1200);
  },

  sendAdvisorMessage() {
    const input = document.getElementById('advisor-msg-input');
    if (!input || !input.value.trim()) return;

    const messageText = input.value.trim();
    const chatContainer = document.getElementById('advisor-chat-messages');

    if (chatContainer) {
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      // Append user message
      const userMsgDiv = document.createElement('div');
      userMsgDiv.style.display = 'flex';
      userMsgDiv.style.gap = '0.75rem';
      userMsgDiv.style.alignItems = 'flex-start';
      userMsgDiv.style.maxWidth = '80%';
      userMsgDiv.style.alignSelf = 'flex-end';
      userMsgDiv.style.flexDirection = 'row-reverse';
      userMsgDiv.innerHTML = `
        <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--primary-600); color: white; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 700; flex-shrink: 0;">
          FN
        </div>
        <div>
          <div style="font-size: 0.72rem; color: var(--text-subtle); margin-bottom: 2px; text-align: right;">Vous • Aujourd'hui à ${timeStr}</div>
          <div style="background: var(--primary-600); color: white; padding: 0.75rem 1rem; border-radius: var(--radius-lg); font-size: 0.82rem; line-height: 1.5;">
            ${messageText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
          </div>
        </div>
      `;
      chatContainer.appendChild(userMsgDiv);
      chatContainer.scrollTop = chatContainer.scrollHeight;

      input.value = '';

      // Simulated Advisor reply
      setTimeout(() => {
        const advisorMsgDiv = document.createElement('div');
        advisorMsgDiv.style.display = 'flex';
        advisorMsgDiv.style.gap = '0.75rem';
        advisorMsgDiv.style.alignItems = 'flex-start';
        advisorMsgDiv.style.maxWidth = '80%';
        advisorMsgDiv.innerHTML = `
          <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" alt="Kofi" class="user-avatar" style="width: 32px; height: 32px; flex-shrink: 0;">
          <div>
            <div style="font-size: 0.72rem; color: var(--text-subtle); margin-bottom: 2px;">Kofi Mensah • À l'instant</div>
            <div style="background: var(--bg-surface); padding: 0.75rem 1rem; border-radius: var(--radius-lg); border: 1px solid var(--border-color); font-size: 0.82rem; line-height: 1.5; color: var(--text-primary);">
              Bien noté Madame Ndiaye. Je prends en compte votre message pour le passage en comité. N'hésitez pas si vous avez des pièces complémentaires à téléverser.
            </div>
          </div>
        `;
        chatContainer.appendChild(advisorMsgDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        this.showToast('Nouveau message de votre conseiller Kofi Mensah', 'info');
      }, 1500);
    }
  },

  handleBookAppointment(event) {
    event.preventDefault();
    const date = document.getElementById('appt-date')?.value || '2026-08-21';
    const time = document.getElementById('appt-time')?.value || '14:00';
    const reason = document.getElementById('appt-reason')?.selectedOptions[0]?.text || 'Instruction Dossier';

    this.showToast(`Rendez-vous confirmé le ${date} à ${time} avec Kofi Mensah (${reason}) ! Un SMS de rappel vous a été envoyé.`, 'success');
  },

  initNotifications() {
    const notifBtn = document.getElementById('notif-bell-btn');
    const notifDropdown = document.getElementById('notif-dropdown');

    if (notifBtn && notifDropdown) {
      notifBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isHidden = notifDropdown.style.display === 'none' || !notifDropdown.style.display;
        notifDropdown.style.display = isHidden ? 'block' : 'none';

        // Close profile dropdown if open
        const profileMenu = document.getElementById('profile-dropdown-menu');
        const profileBtn = document.getElementById('topbar-profile-btn');
        if (profileMenu) profileMenu.classList.remove('show');
        if (profileBtn) profileBtn.classList.remove('active');
      });

      document.addEventListener('click', (e) => {
        if (!notifBtn.contains(e.target) && !notifDropdown.contains(e.target)) {
          notifDropdown.style.display = 'none';
        }
      });
    }
  },

  markAllNotificationsRead() {
    const items = document.querySelectorAll('.notif-item.unread');
    items.forEach(item => item.classList.remove('unread'));

    const badge = document.getElementById('topbar-notif-badge');
    if (badge) badge.style.display = 'none';

    const unreadCountBadge = document.getElementById('notif-unread-count-badge');
    if (unreadCountBadge) {
      unreadCountBadge.className = 'badge badge-approved';
      unreadCountBadge.textContent = '0 Non Lue';
    }

    this.showToast('Toutes les notifications ont été marquées comme lues', 'success');
  },

  filterNotifications(category, btn) {
    if (btn) {
      const container = document.getElementById('notif-filter-bar');
      if (container) {
        container.querySelectorAll('.notif-chip').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
      }
    }

    const items = document.querySelectorAll('.notif-item');
    items.forEach(item => {
      if (category === 'ALL') {
        item.style.display = 'flex';
      } else if (item.classList.contains(`notif-cat-${category}`)) {
        item.style.display = 'flex';
      } else {
        item.style.display = 'none';
      }
    });
  },

  handleNotificationClick(dossierId, targetView) {
    const notifDropdown = document.getElementById('notif-dropdown');
    if (notifDropdown) notifDropdown.style.display = 'none';

    if (targetView) {
      this.switchView(targetView);
    }

    if (dossierId) {
      setTimeout(() => {
        this.openDossier360(dossierId);
      }, 150);
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
  },

  // ==========================================================================
  // BROWSER CAMERA & OFFICIAL DOCUMENT QR CODE SCANNER ENGINE
  // ==========================================================================
  qrTargetContext: 'identity', // 'identity' | 'document' | 'general'
  qrMediaStream: null,
  qrFacingMode: 'environment', // 'environment' (back) or 'user' (front)
  qrScanningActive: false,
  qrTorchActive: false,
  lastDecodedQrData: null,
  qrAnimationId: null,

  openQrScannerModal(context = 'identity') {
    this.qrTargetContext = context;
    const modal = document.getElementById('modal-qr-scanner');
    if (!modal) return;

    modal.style.display = 'flex';
    this.resetQrScannerState();

    // Contextual title / subtitle adjustment
    const titleEl = modal.querySelector('.modal-header-title h4');
    const descEl = modal.querySelector('.modal-header-title span');
    if (context === 'identity') {
      if (titleEl) titleEl.textContent = "Scanner QR Pièce d'Identité UEMOA (CNI / NINA)";
      if (descEl) descEl.textContent = "Authentification automatique du demandeur par scan caméra";
    } else if (context === 'document') {
      if (titleEl) titleEl.textContent = "Scanner QR Document Officiel (Facture / RCCM / Titre)";
      if (descEl) descEl.textContent = "Validation d'authenticité et certification cryptographique";
    } else {
      if (titleEl) titleEl.textContent = "Scanner de Documents & QR Codes UEMOA";
      if (descEl) descEl.textContent = "Extraction automatique et rattachement aux dossiers de crédit";
    }

    // Launch camera automatically
    this.startCameraFeed();
  },

  closeQrScannerModal() {
    this.stopCameraFeed();
    const modal = document.getElementById('modal-qr-scanner');
    if (modal) modal.style.display = 'none';
  },

  async startCameraFeed() {
    const video = document.getElementById('qr-video-feed');
    const errorBanner = document.getElementById('qr-camera-error-banner');
    const statusText = document.getElementById('qr-scanner-status-text');
    const errorDesc = document.getElementById('qr-camera-error-desc');

    if (errorBanner) errorBanner.style.display = 'none';
    if (statusText) statusText.innerHTML = '<i class="fas fa-circle-notch fa-spin mr-1"></i> Recherche de QR Code officiel...';

    this.stopCameraFeed();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      if (errorBanner) errorBanner.style.display = 'flex';
      if (errorDesc) errorDesc.textContent = "Votre navigateur ne prend pas en charge l'accès direct à la caméra. Vous pouvez utiliser le chargement d'image ou le simulateur de scan express ci-dessous.";
      return;
    }

    try {
      const constraints = {
        video: {
          facingMode: this.qrFacingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.qrMediaStream = stream;

      if (video) {
        video.srcObject = stream;
        video.setAttribute('playsinline', 'true');
        await video.play();
      }

      this.qrScanningActive = true;
      this.processQrVideoFrame();
      this.showToast('Caméra activée avec succès', 'info');
    } catch (err) {
      console.warn('Camera stream error:', err);
      if (errorBanner) errorBanner.style.display = 'flex';
      if (errorDesc) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          errorDesc.textContent = "L'autorisation d'accès à la caméra a été refusée par le navigateur. Vous pouvez autoriser la caméra dans la barre d'adresse ou utiliser le simulateur express.";
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          errorDesc.textContent = "Aucun capteur caméra détecté. Utilisez le simulateur d'échantillons ou chargez un fichier image.";
        } else {
          errorDesc.textContent = `Erreur caméra : ${err.message || 'Périphérique indisponible'}. Utilisez le mode simulation express ci-dessous.`;
        }
      }
    }
  },

  stopCameraFeed() {
    this.qrScanningActive = false;
    if (this.qrAnimationId) {
      cancelAnimationFrame(this.qrAnimationId);
      this.qrAnimationId = null;
    }
    if (this.qrMediaStream) {
      this.qrMediaStream.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (e) {}
      });
      this.qrMediaStream = null;
    }
    const video = document.getElementById('qr-video-feed');
    if (video) {
      video.srcObject = null;
    }
  },

  async switchCameraFacingMode() {
    this.qrFacingMode = (this.qrFacingMode === 'environment') ? 'user' : 'environment';
    const switchBtn = document.getElementById('btn-qr-switch-camera');
    if (switchBtn) {
      switchBtn.innerHTML = `<i class="fas fa-camera-rotate"></i> <span>${this.qrFacingMode === 'environment' ? 'Arrière' : 'Avant'}</span>`;
    }
    await this.startCameraFeed();
  },

  async toggleCameraTorch() {
    if (!this.qrMediaStream) return;
    const track = this.qrMediaStream.getVideoTracks()[0];
    if (!track) return;

    try {
      const capabilities = track.getCapabilities ? track.getCapabilities() : {};
      if (capabilities.torch) {
        this.qrTorchActive = !this.qrTorchActive;
        await track.applyConstraints({
          advanced: [{ torch: this.qrTorchActive }]
        });
        const torchBtn = document.getElementById('btn-qr-toggle-torch');
        if (torchBtn) {
          torchBtn.classList.toggle('btn-primary', this.qrTorchActive);
          torchBtn.classList.toggle('btn-secondary', !this.qrTorchActive);
        }
        this.showToast(this.qrTorchActive ? 'Flash allumé' : 'Flash éteint', 'info');
      } else {
        this.showToast('Flash/Torche non pris en charge par ce capteur', 'warning');
      }
    } catch (e) {
      this.showToast('Contrôle du flash indisponible sur cet appareil', 'warning');
    }
  },

  processQrVideoFrame() {
    if (!this.qrScanningActive) return;

    const video = document.getElementById('qr-video-feed');
    const canvas = document.getElementById('qr-canvas-buffer');

    if (video && video.readyState === video.HAVE_ENOUGH_DATA && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Try decoding with jsQR if loaded
        if (typeof window.jsQR === 'function') {
          const code = window.jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert'
          });
          if (code && code.data) {
            this.handleQrScanSuccess(code.data);
            return;
          }
        }
      }
    }

    this.qrAnimationId = requestAnimationFrame(() => this.processQrVideoFrame());
  },

  handleQrScanSuccess(rawData) {
    this.stopCameraFeed();

    // Play subtle audio confirmation
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.18);
    } catch (e) {}

    // Parse payload into structured official document data
    let docData = null;
    try {
      if (typeof rawData === 'string' && rawData.startsWith('{')) {
        docData = JSON.parse(rawData);
      }
    } catch (e) {}

    if (!docData) {
      // Create rich structured data based on context or scanned string
      if (this.qrTargetContext === 'identity' || (typeof rawData === 'string' && rawData.includes('CNI'))) {
        docData = {
          type: 'CNI_BIOMETRIQUE_UEMOA',
          typeLabel: 'Carte Nationale d\'Identité Biométrique UEMOA',
          docNumber: 'CNI-ML-2026-B88219',
          holderName: 'Ibrahima Koné',
          phone: '+223 70 88 99 00',
          country: 'Mali',
          city: 'Bamako - Faladié',
          issuer: 'Ministère de la Sécurité & de la Protection Civile (Mali)',
          issueDate: '12/03/2024',
          expiryDate: '11/03/2034',
          hash: 'SHA256:4f8e91a2...c8901'
        };
      } else {
        docData = {
          type: 'FACTURE_NORMALISEE_DGI',
          typeLabel: 'Facture Normalisée Sécurisée DGI / UEMOA',
          docNumber: 'FACT-DGI-2026-8819',
          holderName: 'Quincaillerie & Outillage Faladié',
          amount: '800 000 FCFA',
          rccm: 'MA-BKO-2023-B-4410',
          issuer: 'Direction Générale des Impôts (DGI Mali)',
          issueDate: '15/07/2026',
          hash: 'UEMOA-SIGN-RSA2048:e3b0c442...98ff'
        };
      }
    }

    this.lastDecodedQrData = docData;
    this.displayQrScanResult(docData);
  },

  displayQrScanResult(data) {
    const resultCard = document.getElementById('qr-scan-result-card');
    const badgeType = document.getElementById('qr-doc-type-badge');
    const fieldsContainer = document.getElementById('qr-extracted-fields-container');

    if (!resultCard || !fieldsContainer) return;

    if (badgeType) {
      badgeType.textContent = data.typeLabel || data.type;
    }

    let html = '';
    if (data.docNumber) {
      html += `
        <div class="qr-extracted-item">
          <div class="qr-extracted-lbl">N° Document Certifié</div>
          <div class="qr-extracted-val text-primary">${data.docNumber}</div>
        </div>
      `;
    }
    if (data.holderName) {
      html += `
        <div class="qr-extracted-item">
          <div class="qr-extracted-lbl">Titulaire / Bénéficiaire</div>
          <div class="qr-extracted-val">${data.holderName}</div>
        </div>
      `;
    }
    if (data.country || data.city) {
      html += `
        <div class="qr-extracted-item">
          <div class="qr-extracted-lbl">Localisation UEMOA</div>
          <div class="qr-extracted-val">${data.city ? data.city + ', ' : ''}${data.country || ''}</div>
        </div>
      `;
    }
    if (data.amount) {
      html += `
        <div class="qr-extracted-item">
          <div class="qr-extracted-lbl">Montant TTC Normalisé</div>
          <div class="qr-extracted-val text-emerald">${data.amount}</div>
        </div>
      `;
    }
    if (data.rccm) {
      html += `
        <div class="qr-extracted-item">
          <div class="qr-extracted-lbl">N° Registre RCCM</div>
          <div class="qr-extracted-val">${data.rccm}</div>
        </div>
      `;
    }
    if (data.issuer) {
      html += `
        <div class="qr-extracted-item">
          <div class="qr-extracted-lbl">Autorité Émettrice</div>
          <div class="qr-extracted-val" style="font-size: 0.76rem;">${data.issuer}</div>
        </div>
      `;
    }
    if (data.hash) {
      html += `
        <div class="qr-extracted-item" style="grid-column: 1 / -1;">
          <div class="qr-extracted-lbl">Empreinte Cryptographique (BCEAO / UEMOA Trust Framework)</div>
          <div class="qr-extracted-val" style="font-family: monospace; font-size: 0.72rem; color: var(--emerald-600);">${data.hash}</div>
        </div>
      `;
    }

    fieldsContainer.innerHTML = html;
    resultCard.style.display = 'block';
  },

  resetQrScannerState() {
    const resultCard = document.getElementById('qr-scan-result-card');
    if (resultCard) resultCard.style.display = 'none';
    this.lastDecodedQrData = null;
    if (document.getElementById('modal-qr-scanner').style.display !== 'none') {
      this.startCameraFeed();
    }
  },

  simulateQrScanPreset(presetKey) {
    let mockData = {};
    if (presetKey === 'cni') {
      mockData = {
        type: 'CNI_BIOMETRIQUE_UEMOA',
        typeLabel: 'Carte Nationale d\'Identité Biométrique CEDEAO/UEMOA',
        docNumber: 'CNI-BF-2026-992104',
        holderName: 'Oumar Traoré',
        phone: '+226 76 11 22 33',
        country: 'Burkina Faso',
        city: 'Ouagadougou - Secteur 15 (Patte d\'Oie)',
        issuer: 'Office National d\'Identification (Burkina Faso)',
        issueDate: '04/01/2025',
        expiryDate: '03/01/2035',
        hash: 'SHA256:7c9e012fa89b4412...09e8bf'
      };
    } else if (presetKey === 'invoice') {
      mockData = {
        type: 'FACTURE_NORMALISEE_DGI',
        typeLabel: 'Facture Normalisée DGI avec Timbre Électronique',
        docNumber: 'FAC-DGI-SN-2026-4401',
        holderName: 'Établissements Bois & Outillage Moderne',
        amount: '1 200 000 FCFA',
        rccm: 'SN-DKR-2022-B-9912',
        issuer: 'Direction Générale des Impôts et Domaines (Sénégal)',
        issueDate: '14/08/2026',
        hash: 'RSA2048-CERT:4a5c90fe...1142ab'
      };
    } else if (presetKey === 'rccm') {
      mockData = {
        type: 'RCCM_REGISTRE_COMMERCE',
        typeLabel: 'Extrait Registre du Commerce et du Crédit Mobilier (RCCM)',
        docNumber: 'RCCM-ML-BKO-2023-B-7721',
        holderName: 'Menuiserie Artisanale Koné & Frères',
        country: 'Mali',
        city: 'Bamako',
        rccm: 'ML-BKO-2023-B-7721',
        issuer: 'Greffe du Tribunal de Commerce de Bamako',
        issueDate: '20/05/2023',
        hash: 'OHADA-RCCM-VERIF:8819cc02...33da'
      };
    }

    this.handleQrScanSuccess(JSON.stringify(mockData));
    this.showToast(`Échantillon officiel ${mockData.typeLabel} scanné avec succès`, 'success');
  },

  handleQrImageUpload(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        let qrDecoded = null;
        if (typeof window.jsQR === 'function') {
          qrDecoded = window.jsQR(imageData.data, imageData.width, imageData.height);
        }

        if (qrDecoded && qrDecoded.data) {
          this.handleQrScanSuccess(qrDecoded.data);
          this.showToast('QR Code détecté et validé depuis le fichier image', 'success');
        } else {
          // Fallback simulation with document metadata
          this.simulateQrScanPreset(this.qrTargetContext === 'identity' ? 'cni' : 'invoice');
          this.showToast('Document analysé avec succès par le moteur de reconnaissance', 'success');
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  },

  applyQrScanData() {
    const data = this.lastDecodedQrData;
    if (!data) return;

    if (this.qrTargetContext === 'identity' || data.type === 'CNI_BIOMETRIQUE_UEMOA') {
      // Auto fill wizard step 1
      const nameInput = document.getElementById('wiz-fullname');
      const phoneInput = document.getElementById('wiz-phone');
      const countryInput = document.getElementById('wiz-country');
      const cityInput = document.getElementById('wiz-city');
      const badge = document.getElementById('wizard-identity-qr-badge');
      const badgeText = document.getElementById('wizard-identity-qr-text');

      if (nameInput && data.holderName) nameInput.value = data.holderName;
      if (phoneInput && data.phone) phoneInput.value = data.phone;
      if (countryInput && data.country) countryInput.value = data.country;
      if (cityInput && data.city) cityInput.value = data.city;

      if (badge && badgeText) {
        badge.style.display = 'flex';
        badgeText.textContent = `${data.typeLabel || 'CNI Biométrique'} N° ${data.docNumber || ''} • Titulaire : ${data.holderName || ''} (Authentifié 100% via UEMOA QR)`;
      }

      this.showToast('Informations d\'identité et KYC renseignées automatiquement depuis le QR Code', 'success');
    } else {
      // Auto attach document in step 6 or general
      const docBadge = document.getElementById('wizard-doc-qr-badge');
      const docBadgeText = document.getElementById('wizard-doc-qr-text');

      if (docBadge && docBadgeText) {
        docBadge.style.display = 'flex';
        docBadgeText.textContent = `${data.typeLabel || 'Document Officiel'} (${data.docNumber || 'Réf certifiée'}) rattaché au dossier avec empreinte cryptographique validée.`;
      }

      // If invoice amount exists and amount input is on step 4 or guarantee
      if (data.amount) {
        const guaranteeValInput = document.getElementById('wiz-guarantee-val');
        if (guaranteeValInput && data.amount.includes('1 200 000')) {
          guaranteeValInput.value = 1200000;
        }
      }

      this.showToast('Document officiel certifié rattaché avec succès au dossier', 'success');
    }

    this.closeQrScannerModal();
  },

  // ==========================================================================
  // MODAL MANAGEMENT HELPERS
  // ==========================================================================
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.style.display = 'flex';
    setTimeout(() => {
      modal.classList.add('active');
    }, 10);
  },

  closeModal(modalId) {
    if (!modalId) return;
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      setTimeout(() => {
        if (!modal.classList.contains('active')) {
          modal.style.display = 'none';
        }
      }, 250);
    }
    if (window.AppInteractions && typeof window.AppInteractions.closeModal === 'function') {
      window.AppInteractions.closeModal(modalId);
    }
  },

  openDossier360(dossierIdentifier) {
    if (window.AppInteractions && typeof window.AppInteractions.openDossierModal === 'function') {
      window.AppInteractions.openDossierModal(dossierIdentifier);
    }
  },

  openDossierModal(dossierIdentifier) {
    if (window.AppInteractions && typeof window.AppInteractions.openDossierModal === 'function') {
      window.AppInteractions.openDossierModal(dossierIdentifier);
    }
  },

  closeDossierModal() {
    this.closeModal('dossier-modal');
  },

  openCommitteeModal(dossierId) {
    if (window.AppInteractions && typeof window.AppInteractions.openCommitteeModal === 'function') {
      window.AppInteractions.openCommitteeModal(dossierId);
    }
  },

  closeCommitteeModal() {
    this.closeModal('committee-modal');
  },

  // ==========================================================================
  // [FEATURE] COMPACT LOAN ESTIMATION COMPONENT (BORROWER DASHBOARD)
  // ==========================================================================
  updateCompactEstimator() {
    const amountSlider = document.getElementById('compact-est-amount-range');
    const durationSlider = document.getElementById('compact-est-duration-range');
    if (!amountSlider || !durationSlider) return;

    const amount = parseInt(amountSlider.value, 10) || 2500000;
    const duration = parseInt(durationSlider.value, 10) || 12;

    const amountValEl = document.getElementById('compact-est-amount-val');
    const durationValEl = document.getElementById('compact-est-duration-val');
    if (amountValEl) amountValEl.textContent = CreditScoringEngine.formatFCFA(amount);
    if (durationValEl) durationValEl.textContent = `${duration} Mois`;

    // Monthly interest rate: 1.2% per month (standard UEMOA microfinance scale)
    const rateMonthly = 0.012;
    const monthlyPayment = (amount * rateMonthly) / (1 - Math.pow(1 + rateMonthly, -duration));
    const totalPayments = monthlyPayment * duration;
    const totalInterest = totalPayments - amount;
    const insuranceAndFees = Math.round(amount * 0.012);
    const monthlyTotal = Math.round(monthlyPayment + (insuranceAndFees / duration));
    const totalCost = Math.round(totalInterest + insuranceAndFees);
    const totalRepaid = Math.round(amount + totalCost);

    const monthlyValEl = document.getElementById('compact-est-monthly-val');
    const totalValEl = document.getElementById('compact-est-total-val');
    const costValEl = document.getElementById('compact-est-cost-val');

    if (monthlyValEl) monthlyValEl.textContent = CreditScoringEngine.formatFCFA(monthlyTotal);
    if (totalValEl) totalValEl.textContent = CreditScoringEngine.formatFCFA(totalRepaid);
    if (costValEl) costValEl.textContent = CreditScoringEngine.formatFCFA(totalCost);

    // Update active preset chips
    document.querySelectorAll('.compact-preset-chip').forEach(chip => chip.classList.remove('active'));
    const amountChip = document.getElementById(`chip-amount-${amount}`);
    const durationChip = document.getElementById(`chip-duration-${duration}`);
    if (amountChip) amountChip.classList.add('active');
    if (durationChip) durationChip.classList.add('active');
  },

  setCompactPresetAmount(amount) {
    const slider = document.getElementById('compact-est-amount-range');
    if (slider) {
      slider.value = amount;
      this.updateCompactEstimator();
    }
  },

  setCompactPresetDuration(months) {
    const slider = document.getElementById('compact-est-duration-range');
    if (slider) {
      slider.value = months;
      this.updateCompactEstimator();
    }
  },

  applyFromCompactEstimator() {
    const amountSlider = document.getElementById('compact-est-amount-range');
    const durationSlider = document.getElementById('compact-est-duration-range');
    const amount = amountSlider ? parseInt(amountSlider.value, 10) : 2500000;
    const duration = durationSlider ? parseInt(durationSlider.value, 10) : 12;

    this.switchView('view-client-wizard');

    // Pre-fill amount and duration in wizard
    const wizAmount = document.getElementById('wiz-amount');
    const wizDuration = document.getElementById('wiz-duration');
    if (wizAmount) {
      wizAmount.value = amount;
      wizAmount.dispatchEvent(new Event('input'));
    }
    if (wizDuration) {
      wizDuration.value = duration;
      wizDuration.dispatchEvent(new Event('input'));
    }

    this.showToast(`Simulation transférée : ${CreditScoringEngine.formatFCFA(amount)} sur ${duration} mois`, 'success');
  },

  // ==========================================================================
  // [FEATURE] SUCCESS ANIMATION MODAL CONTROLLER (GREEN CHECKMARK)
  // ==========================================================================
  successOnPrimaryCallback: null,
  successReceiptFilename: 'Recipisse_Transaction_CIF.pdf',

  showSuccessModal(config = {}) {
    const modal = document.getElementById('modal-success-animation');
    if (!modal) return;

    const titleEl = document.getElementById('success-modal-title');
    const subtitleEl = document.getElementById('success-modal-subtitle');
    const refEl = document.getElementById('success-detail-ref');
    const amountEl = document.getElementById('success-detail-amount');
    const paymentEl = document.getElementById('success-detail-payment');
    const statusEl = document.getElementById('success-detail-status');
    const primaryBtn = document.getElementById('success-modal-primary-btn');

    if (titleEl && config.title) titleEl.textContent = config.title;
    if (subtitleEl && config.subtitle) subtitleEl.textContent = config.subtitle;
    if (refEl && config.reference) refEl.textContent = config.reference;
    if (amountEl && config.amount) amountEl.textContent = config.amount;
    if (paymentEl && config.payment) paymentEl.textContent = config.payment;

    if (statusEl && config.statusHtml) {
      statusEl.innerHTML = config.statusHtml;
      if (config.statusClass) {
        statusEl.className = `badge ${config.statusClass}`;
      }
    }

    if (primaryBtn && config.primaryBtnText) {
      primaryBtn.innerHTML = `<i class="fas fa-arrow-right mr-1"></i> ${config.primaryBtnText}`;
    }

    this.successOnPrimaryCallback = config.onPrimaryClick || null;
    this.successReceiptFilename = config.receiptTitle || 'Recipisse_Transaction_CIF.pdf';

    modal.style.display = 'flex';
    setTimeout(() => {
      modal.classList.add('active');
    }, 10);
  },

  closeSuccessModal() {
    const modal = document.getElementById('modal-success-animation');
    if (modal) {
      modal.classList.remove('active');
      setTimeout(() => {
        modal.style.display = 'none';
      }, 250);
    }

    if (typeof this.successOnPrimaryCallback === 'function') {
      const cb = this.successOnPrimaryCallback;
      this.successOnPrimaryCallback = null;
      cb();
    }
  },

  downloadSuccessReceipt() {
    this.showToast(`Génération du récépissé officiel sécurisé (${this.successReceiptFilename})...`, 'info');
    setTimeout(() => {
      this.showToast(`Récépissé ${this.successReceiptFilename} téléchargé avec succès !`, 'success');
    }, 600);
  },

  // ==========================================================================
  // [FEATURE] LIGHT-BOX DOCUMENT PREVIEW & OCR VIEWER
  // ==========================================================================
  docLightboxZoom: 1,
  docLightboxRotation: 0,
  currentLightboxDocKey: 'proforma',

  openDocLightbox(docKey = 'proforma') {
    this.currentLightboxDocKey = docKey;
    this.docLightboxZoom = 1;
    this.docLightboxRotation = 0;

    const modal = document.getElementById('modal-doc-lightbox');
    if (!modal) return;

    const docData = this.getDocLightboxData(docKey);

    // Set Topbar info
    const titleEl = document.getElementById('doc-lightbox-title');
    const metaEl = document.getElementById('doc-lightbox-meta');
    const badgeEl = document.getElementById('doc-lightbox-badge');
    const iconEl = document.getElementById('doc-lightbox-file-icon');
    const confScoreEl = document.getElementById('doc-lightbox-conf-score');

    if (titleEl) titleEl.textContent = docData.title;
    if (metaEl) metaEl.textContent = docData.meta;
    if (badgeEl) {
      badgeEl.className = `badge ${docData.badgeClass || 'badge-approved'}`;
      badgeEl.innerHTML = docData.badgeHtml;
    }
    if (iconEl) iconEl.className = docData.iconClass || 'fas fa-file-pdf';
    if (confScoreEl) confScoreEl.textContent = `${docData.confidenceScore || '99.8%'} Confiance`;

    // Render OCR Fields in Sidebar
    const fieldsList = document.getElementById('doc-lightbox-fields-list');
    if (fieldsList) {
      fieldsList.innerHTML = docData.fields.map(f => `
        <div class="doc-ocr-field-row">
          <span class="doc-ocr-field-lbl">${f.label}</span>
          <span class="doc-ocr-field-val">${f.value}</span>
        </div>
      `).join('');
    }

    // Render Document Sheet Content
    const renderedContent = document.getElementById('doc-lightbox-rendered-content');
    if (renderedContent) {
      renderedContent.innerHTML = docData.sheetHtml;
    }

    this.applyLightboxTransform();

    modal.style.display = 'flex';
    setTimeout(() => {
      modal.classList.add('active');
    }, 10);
  },

  closeDocLightbox() {
    const modal = document.getElementById('modal-doc-lightbox');
    if (!modal) return;
    modal.classList.remove('active');
    setTimeout(() => {
      modal.style.display = 'none';
    }, 250);
  },

  zoomDocLightbox(factor) {
    if (factor > 1) {
      this.docLightboxZoom = Math.min(2.2, this.docLightboxZoom * factor);
    } else {
      this.docLightboxZoom = Math.max(0.6, this.docLightboxZoom * factor);
    }
    this.applyLightboxTransform();
  },

  resetDocLightboxZoom() {
    this.docLightboxZoom = 1;
    this.docLightboxRotation = 0;
    this.applyLightboxTransform();
  },

  rotateDocLightbox() {
    this.docLightboxRotation = (this.docLightboxRotation + 90) % 360;
    this.applyLightboxTransform();
  },

  applyLightboxTransform() {
    const sheet = document.getElementById('doc-lightbox-sheet');
    const zoomVal = document.getElementById('doc-lightbox-zoom-val');
    if (sheet) {
      sheet.style.transform = `scale(${this.docLightboxZoom}) rotate(${this.docLightboxRotation}deg)`;
    }
    if (zoomVal) {
      zoomVal.textContent = `${Math.round(this.docLightboxZoom * 100)}%`;
    }
  },

  downloadDocLightbox() {
    const docData = this.getDocLightboxData(this.currentLightboxDocKey);
    this.showToast(`Téléchargement de : ${docData.filename || 'Document_Officiel.pdf'}...`, 'info');
    setTimeout(() => {
      this.showToast(`Document "${docData.title}" téléchargé avec succès`, 'success');
    }, 500);
  },

  getDocLightboxData(docKey) {
    const docs = {
      cni: {
        title: "Carte Nationale d'Identité Biométrique CEDEAO",
        meta: "PDF / Image HD • 1.1 Mo • Certifié OCR UEMOA 100%",
        badgeClass: "badge-approved",
        badgeHtml: "<i class=\"fas fa-check-circle\"></i> Identité Certifiée",
        iconClass: "fas fa-id-card",
        confidenceScore: "100%",
        filename: "CNI_Biometrique_Fatou_Ndiaye.pdf",
        fields: [
          { label: "N° Carte Nationale", value: "1 756 1989 00412" },
          { label: "Nom & Prénom", value: "NDIAYE Fatou" },
          { label: "Date de Naissance", value: "14/03/1989 (Dakar)" },
          { label: "Nationalité", value: "Sénégalaise (CEDEAO / UEMOA)" },
          { label: "Délivrée le", value: "15/03/2019 par DAF Dakar" },
          { label: "Date d'Expiration", value: "14/03/2029 (En cours de validité)" },
          { label: "Puce Biométrique", value: "UID-SN-882104-OK" }
        ],
        sheetHtml: `
          <div style="border: 2px solid #15803d; border-radius: 12px; padding: 1.5rem; background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%); position: relative; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
            <!-- Header Senegal -->
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #15803d; padding-bottom: 0.75rem; margin-bottom: 1.25rem;">
              <div style="font-size: 0.75rem; font-weight: 800; color: #15803d; text-transform: uppercase; line-height: 1.3;">
                RÉPUBLIQUE DU SÉNÉGAL<br><span style="font-size: 0.65rem; color: #047857;">COMMUNAUTÉ ÉCONOMIQUE DES ÉTATS DE L'AFRIQUE DE L'OUEST</span>
              </div>
              <div style="display: flex; align-items: center; gap: 0.4rem;">
                <div style="width: 28px; height: 18px; background: linear-gradient(to right, #15803d 33.3%, #facc15 33.3%, #facc15 66.6%, #dc2626 66.6%); border-radius: 2px; border: 1px solid rgba(0,0,0,0.2);"></div>
                <span style="font-size: 0.75rem; font-weight: 800; color: #1e293b;">CEDEAO / ECOWAS</span>
              </div>
            </div>

            <!-- Card Body with Avatar and Fields -->
            <div style="display: grid; grid-template-columns: 110px 1fr; gap: 1.25rem; align-items: center;">
              <div style="text-align: center;">
                <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=240&auto=format&fit=crop&q=80" alt="Fatou Ndiaye" style="width: 100px; height: 120px; object-fit: cover; border-radius: 6px; border: 2px solid #cbd5e1; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
                <div style="font-size: 0.65rem; font-weight: 700; color: #15803d; margin-top: 4px;"><i class="fas fa-fingerprint"></i> Biométrie OK</div>
              </div>
              <div style="font-size: 0.76rem; color: #334155; line-height: 1.6;">
                <div><span style="font-weight: 700; color: #0f172a;">NOM :</span> NDIAYE</div>
                <div><span style="font-weight: 700; color: #0f172a;">PRÉNOM :</span> Fatou</div>
                <div><span style="font-weight: 700; color: #0f172a;">NÉ LE :</span> 14/03/1989 à Dakar</div>
                <div><span style="font-weight: 700; color: #0f172a;">SEXE :</span> F • <span style="font-weight: 700; color: #0f172a;">TAILLE :</span> 1.68 m</div>
                <div><span style="font-weight: 700; color: #0f172a;">N° IDENTIFIANT :</span> <strong style="font-family: monospace; color: #1e40af;">1 756 1989 00412</strong></div>
                <div><span style="font-weight: 700; color: #0f172a;">VALIDITÉ :</span> 15/03/2019 - 14/03/2029</div>
              </div>
            </div>

            <!-- MRZ Band -->
            <div style="margin-top: 1.5rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 0.6rem; font-family: monospace; font-size: 0.72rem; color: #0f172a; letter-spacing: 2px; line-height: 1.4;">
              IDSNANDIAYE<<FATOU<<<<<<<<<<<<<<<<<<<<<<<<<<<br>
              17561989004128SEN8903144F2903141<<<<<<<<<<<<6
            </div>

            <!-- Hologram stamp watermark -->
            <div style="position: absolute; bottom: 20px; right: 25px; border: 2px dashed rgba(21, 128, 61, 0.4); border-radius: 50%; width: 70px; height: 70px; display: flex; align-items: center; justify-content: center; transform: rotate(-15deg); color: rgba(21, 128, 61, 0.6); font-size: 0.65rem; font-weight: 900; text-align: center; pointer-events: none;">
              SÉNÉGAL<br>OFFICIEL<br>UEMOA
            </div>
          </div>
        `
      },
      rccm: {
        title: "Extrait Registre du Commerce et du Crédit Mobilier (RCCM)",
        meta: "PDF • 850 Ko • Greffe Tribunal de Commerce de Dakar",
        badgeClass: "badge-approved",
        badgeHtml: "<i class=\"fas fa-check-circle\"></i> RCCM Authentifié",
        iconClass: "fas fa-landmark",
        confidenceScore: "99.9%",
        filename: "RCCM_Confection_Fatou_Dakar.pdf",
        fields: [
          { label: "N° Immatriculation RCCM", value: "SN.DKR.2022.A.18402" },
          { label: "NINEA (Fiscal)", value: "008923412 2A2" },
          { label: "Dénomination Commerciale", value: "ATELIER COUTURE & WAX FATOU" },
          { label: "Forme Juridique", value: "Entreprise Individuelle (Artisanat)" },
          { label: "Date Immatriculation", value: "18/02/2022" },
          { label: "Siège Social", value: "Médina Rue 22 x 15, Dakar (Sénégal)" },
          { label: "Activité Déclarée", value: "Confection textile, négoce de tissus et prêt-à-porter" }
        ],
        sheetHtml: `
          <div style="border: 2px solid #334155; padding: 2rem; background: #ffffff; color: #0f172a; font-family: serif;">
            <div style="text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 1rem; margin-bottom: 1.5rem;">
              <h4 style="font-size: 1.1rem; margin: 0; text-transform: uppercase; font-weight: 800; letter-spacing: 1px;">OHADA - RÉPUBLIQUE DU SÉNÉGAL</h4>
              <h5 style="font-size: 0.9rem; margin: 4px 0 0 0; color: #475569;">TRIBUNAL DE COMMERCE HORS CLASSE DE DAKAR</h5>
              <div style="font-size: 0.8rem; font-weight: 700; color: #047857; margin-top: 6px;">EXTRAIT D'IMMATRICULATION AU RCCM</div>
            </div>

            <div style="font-size: 0.82rem; line-height: 1.8; color: #1e293b;">
              <p><strong>N° DU DOSSIER :</strong> SN.DKR.2022.A.18402 • <strong>NINEA :</strong> 008923412 2A2</p>
              <p><strong>DÉNOMINATION :</strong> ATELIER DE COUTURE & WAX FATOU</p>
              <p><strong>EXPLOITANT :</strong> NDIAYE Fatou (Nationalité Sénégalaise)</p>
              <p><strong>OBJET SOCIAL :</strong> Fabrication, confection artisanale de vêtements traditionnels et modernes, importation et distribution de textiles Wax, Bazin et soieries.</p>
              <p><strong>ADRESSE DE L'ÉTABLISSEMENT :</strong> Rue 22 x 15 Médina, Dakar</p>
              <p><strong>DATE DE DÉBUT D'ACTIVITÉ :</strong> 01 Février 2022</p>
            </div>

            <div style="margin-top: 2rem; display: flex; justify-content: space-between; align-items: flex-end;">
              <div style="font-size: 0.72rem; color: #64748b; font-family: sans-serif;">
                Délivré à Dakar le 18/02/2022<br>Certifié conforme par le Greffe
              </div>
              <div style="text-align: center;">
                <div style="border: 2px solid #dc2626; color: #dc2626; font-size: 0.65rem; font-weight: 900; padding: 0.5rem 0.75rem; border-radius: 4px; transform: rotate(-5deg); display: inline-block;">
                  GREFFE TRIBUNAL DE COMMERCE<br>DAKAR - SÉNÉGAL<br>ENREGISTRÉ
                </div>
              </div>
            </div>
          </div>
        `
      },
      proforma: {
        title: "Facture Proforma Fournisseur Stock Wax Assigamé",
        meta: "PDF • 1.4 Mo • Éts Textile Assigamé Lomé (Togo)",
        badgeClass: "badge-approved",
        badgeHtml: "<i class=\"fas fa-check-circle\"></i> Devis & Proforma Validé",
        iconClass: "fas fa-file-invoice-dollar",
        confidenceScore: "99.8%",
        filename: "Facture_Proforma_PF-2026-0881.pdf",
        fields: [
          { label: "Fournisseur", value: "Établissements Textile Assigamé & Cie" },
          { label: "Réf Devis Proforma", value: "PF-2026-0881" },
          { label: "Date d'Émission", value: "08 Août 2026" },
          { label: "Validité de l'Offre", value: "30 Jours (jusqu'au 07/09/2026)" },
          { label: "Montant HT", value: "2 300 000 FCFA" },
          { label: "Transport & TVA", value: "200 000 FCFA" },
          { label: "Montant Total TTC", value: "2 500 000 FCFA" },
          { label: "Objet d'Achat", value: "Rouleaux Wax Hollandais & Bazin Riche" }
        ],
        sheetHtml: `
          <div style="background: #ffffff; padding: 2rem; border: 1px solid #e2e8f0; color: #1e293b; font-family: sans-serif;">
            <!-- Supplier Header -->
            <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0284c7; padding-bottom: 1rem; margin-bottom: 1.5rem;">
              <div>
                <h4 style="font-size: 1.15rem; font-weight: 800; color: #0284c7; margin: 0;">ÉTS TEXTILES ASSIGAMÉ & CIE</h4>
                <div style="font-size: 0.76rem; color: #64748b; margin-top: 3px;">
                  Grand Marché de Lomé - Allée Centrale N° 44 • Togo<br>
                  Tél : +228 90 22 41 80 • NIF : 1002934811
                </div>
              </div>
              <div style="text-align: right;">
                <span class="badge" style="background: #e0f2fe; color: #0369a1; font-weight: 800; font-size: 0.8rem; padding: 0.35rem 0.75rem;">
                  FACTURE PROFORMA
                </span>
                <div style="font-size: 0.76rem; font-weight: 700; margin-top: 6px;">N° PF-2026-0881</div>
                <div style="font-size: 0.72rem; color: #64748b;">Date : 08/08/2026</div>
              </div>
            </div>

            <!-- Client Info Box -->
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 0.85rem; margin-bottom: 1.5rem; font-size: 0.78rem;">
              <div style="font-weight: 700; color: #0f172a; margin-bottom: 3px;">CLIENT DESTINATAIRE :</div>
              <div>Mme Fatou NDIAYE • Atelier Couture & Confection</div>
              <div>Médina Rue 22 x 15, Dakar (Sénégal) • Tél : +221 77 540 88 12</div>
            </div>

            <!-- Items Table -->
            <table style="width: 100%; border-collapse: collapse; font-size: 0.78rem; margin-bottom: 1.5rem;">
              <thead>
                <tr style="background: #f1f5f9; text-align: left; border-bottom: 2px solid #cbd5e1;">
                  <th style="padding: 0.6rem;">Désignation des Articles</th>
                  <th style="padding: 0.6rem; text-align: center;">Qté</th>
                  <th style="padding: 0.6rem; text-align: right;">Prix Unit.</th>
                  <th style="padding: 0.6rem; text-align: right;">Montant Total</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 0.6rem;"><strong>Super Wax Hollandais Véritable (6 yards)</strong><br><span style="color: #64748b; font-size: 0.7rem;">Coloris assortis Tabaski / Fêtes</span></td>
                  <td style="padding: 0.6rem; text-align: center;">40 pcs</td>
                  <td style="padding: 0.6rem; text-align: right;">35 000 F</td>
                  <td style="padding: 0.6rem; text-align: right; font-weight: 600;">1 400 000 F</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 0.6rem;"><strong>Bazin Riche Getzner Autriche (10 mètres)</strong><br><span style="color: #64748b; font-size: 0.7rem;">Blanc, Bleu Ciel et Teintures traditionnelles</span></td>
                  <td style="padding: 0.6rem; text-align: center;">10 pcs</td>
                  <td style="padding: 0.6rem; text-align: right;">90 000 F</td>
                  <td style="padding: 0.6rem; text-align: right; font-weight: 600;">900 000 F</td>
                </tr>
              </tbody>
            </table>

            <!-- Totals -->
            <div style="display: flex; justify-content: flex-end; margin-bottom: 1.5rem;">
              <div style="width: 250px; font-size: 0.8rem;">
                <div style="display: flex; justify-content: space-between; padding: 0.3rem 0;">
                  <span>Sous-total HT :</span>
                  <span>2 300 000 FCFA</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 0.3rem 0; border-bottom: 1px solid #e2e8f0;">
                  <span>Fret maritime & Assurance :</span>
                  <span>200 000 FCFA</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; font-weight: 800; font-size: 0.95rem; color: #0284c7;">
                  <span>TOTAL NET À PAYER :</span>
                  <span>2 500 000 FCFA</span>
                </div>
              </div>
            </div>

            <!-- Footer Cachet -->
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed #cbd5e1; padding-top: 1rem;">
              <div style="font-size: 0.7rem; color: #64748b;">
                Modalité : Livraison contre paiement CIF / Caisse Médina Dakar
              </div>
              <div style="border: 2px solid #0369a1; color: #0369a1; font-weight: 800; font-size: 0.68rem; padding: 0.4rem 0.8rem; border-radius: 4px; transform: rotate(-3deg);">
                ÉTS TEXTILES ASSIGAMÉ<br>POUR ACCORD ET VENTE
              </div>
            </div>
          </div>
        `
      },
      senelec: {
        title: "Quittance d'Électricité Senelec (Justificatif Domicile)",
        meta: "PDF • 920 Ko • Senelec Agence Médina Dakar",
        badgeClass: "badge-approved",
        badgeHtml: "<i class=\"fas fa-check-circle\"></i> Domicile Certifié",
        iconClass: "fas fa-bolt",
        confidenceScore: "99.5%",
        filename: "Quittance_Senelec_Fatou_Ndiaye.pdf",
        fields: [
          { label: "Organisme Émetteur", value: "SENELEC Sénégal" },
          { label: "N° Police / Compteur", value: "884-2190-33" },
          { label: "Titulaire Abonnement", value: "Mme Fatou NDIAYE" },
          { label: "Adresse Fournie", value: "Rue 22 x 15 Médina, Dakar" },
          { label: "Période Facturée", value: "Juillet 2026" },
          { label: "Statut Règlement", value: "Acquitté / 0 F solde impayé" }
        ],
        sheetHtml: `
          <div style="background: #ffffff; padding: 2rem; border: 1px solid #e2e8f0; color: #1e293b; font-family: sans-serif;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f59e0b; padding-bottom: 0.75rem; margin-bottom: 1.25rem;">
              <div>
                <h4 style="font-size: 1.2rem; font-weight: 900; color: #d97706; margin: 0;">SENELEC</h4>
                <div style="font-size: 0.72rem; color: #64748b;">Société Nationale d'Électricité du Sénégal</div>
              </div>
              <span class="badge badge-approved" style="font-size: 0.75rem; padding: 0.35rem 0.6rem;">
                <i class="fas fa-check"></i> FACTURE ACQUITTÉE
              </span>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; font-size: 0.78rem; margin-bottom: 1.5rem;">
              <div style="background: #fefce8; padding: 0.75rem; border-radius: 6px; border: 1px solid #fef08a;">
                <div style="font-weight: 700; color: #854d0e; margin-bottom: 4px;">ABONNÉ / TITULAIRE :</div>
                <div>NDIAYE Fatou</div>
                <div>Rue 22 x 15 Médina Dakar</div>
                <div>Code Distr. : DKR-MED-04</div>
              </div>
              <div style="background: #f8fafc; padding: 0.75rem; border-radius: 6px; border: 1px solid #e2e8f0;">
                <div style="font-weight: 700; color: #334155; margin-bottom: 4px;">DONNÉES COMPTEUR :</div>
                <div>Police N° : <strong>884-2190-33</strong></div>
                <div>Tarif : Usage Domestique Petite Puissance</div>
                <div>Index Consommé : 240 kWh</div>
              </div>
            </div>

            <div style="font-size: 0.8rem; border-top: 1px solid #e2e8f0; padding-top: 1rem; display: flex; justify-content: space-between;">
              <span>Montant Facture TTC : <strong>28 450 FCFA</strong></span>
              <span style="color: #15803d; font-weight: 700;">SOLDE ANTÉRIEUR : 0 FCFA</span>
            </div>
          </div>
        `
      },
      guarantee: {
        title: "Attestation de Nantissement d'Épargne CIF",
        meta: "PDF • 1.8 Mo • Caisse CIF Médina Dakar",
        badgeClass: "badge-approved",
        badgeHtml: "<i class=\"fas fa-check-circle\"></i> Sûreté Enregistrée",
        iconClass: "fas fa-shield-halved",
        confidenceScore: "100%",
        filename: "Attestation_Nantissement_Epargne.pdf",
        fields: [
          { label: "Type de Sûreté", value: "Gage Espèces & Nantissement Compte Épargne" },
          { label: "N° Compte Gagiste", value: "SN-DKR-SAV-004128" },
          { label: "Titulaire du Compte", value: "Mme Fatou NDIAYE" },
          { label: "Montant Bloqué", value: "500 000 FCFA" },
          { label: "Taux de Couverture", value: "20% du Prêt Principal" },
          { label: "Caisse Dépositaire", value: "Caisse Mutuelle CIF Médina Dakar" }
        ],
        sheetHtml: `
          <div style="background: #ffffff; padding: 2rem; border: 2px solid #4f46e5; border-radius: 8px; color: #1e293b; font-family: sans-serif;">
            <div style="text-align: center; border-bottom: 2px solid #4f46e5; padding-bottom: 1rem; margin-bottom: 1.5rem;">
              <h4 style="font-size: 1.1rem; font-weight: 800; color: #4f46e5; margin: 0;">CONFÉDÉRATION DES INSTITUTIONS FINANCIÈRES (CIF)</h4>
              <h5 style="font-size: 0.85rem; color: #64748b; margin: 4px 0 0 0;">Caisse Mutuelle d'Épargne et de Crédit - Agence Médina Dakar</h5>
              <div style="font-size: 0.8rem; font-weight: 800; color: #15803d; margin-top: 6px;">ACTE DE NANTISSEMENT D'ÉPARGNE LIQUIDE</div>
            </div>

            <div style="font-size: 0.8rem; line-height: 1.8;">
              <p>Par les présentes, la soussignée <strong>Mme Fatou NDIAYE</strong> consent à titre de garantie solidaire le nantissement à hauteur de <strong>500 000 FCFA</strong> de son compte d'épargne N° <code>SN-DKR-SAV-004128</code> ouvert auprès de la Caisse CIF Médina.</p>
              <p>Cette sûreté liquide garantit le remboursement effectif du prêt N° <code>REQ-2026-0895</code> d'un montant de 2 500 000 FCFA consenti pour une durée de 12 mois.</p>
            </div>

            <div style="margin-top: 2rem; display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed #cbd5e1; padding-top: 1rem;">
              <div style="font-size: 0.72rem; color: #64748b;">
                Fait à Dakar, le 12/08/2026<br>Visa du Chef d'Agence CIF
              </div>
              <div style="border: 2px solid #4f46e5; color: #4f46e5; font-size: 0.68rem; font-weight: 800; padding: 0.4rem 0.8rem; border-radius: 4px;">
                CAISSE CIF MÉDINA<br>SERVICE ENGAGEMENTS
              </div>
            </div>
          </div>
        `
      },
      contract: {
        title: "Contrat Cadre de Financement & Prêt Électronique CIF",
        meta: "PDF • 2.2 Mo • Signé Numériquement via OTP UEMOA",
        badgeClass: "badge-approved",
        badgeHtml: "<i class=\"fas fa-signature\"></i> Signé & Scellé",
        iconClass: "fas fa-file-contract",
        confidenceScore: "100%",
        filename: "Contrat_Pret_CIF_2026_0895.pdf",
        fields: [
          { label: "Contrat N°", value: "CTR-CIF-DKR-2026-0895" },
          { label: "Emprunteur", value: "Mme Fatou NDIAYE" },
          { label: "Montant du Financement", value: "2 500 000 FCFA" },
          { label: "Taux d'Intérêt", value: "1.20% / mois dégressif (14.4% l'an)" },
          { label: "Échéances", value: "12 mensualités de 235 000 FCFA" },
          { label: "Horodatage Signature", value: "18/08/2026 à 09:30:14 GMT" },
          { label: "Signature Électronique", value: "Certifiée conforme OTP SMS (SHA-256 Validé)" }
        ],
        sheetHtml: `
          <div style="background: #ffffff; padding: 2rem; border: 2px solid #047857; border-radius: 8px; color: #1e293b; font-family: serif;">
            <div style="text-align: center; border-bottom: 2px solid #047857; padding-bottom: 1rem; margin-bottom: 1.5rem;">
              <h4 style="font-size: 1.15rem; font-weight: 900; color: #047857; margin: 0; font-family: sans-serif;">DIGICOOP-WA+ • CONTRAT DE CRÉDIT CIF</h4>
              <div style="font-size: 0.76rem; color: #64748b; font-family: sans-serif; margin-top: 3px;">CONTRAT N° CTR-CIF-DKR-2026-0895</div>
            </div>

            <div style="font-size: 0.8rem; line-height: 1.8;">
              <p><strong>ARTICLE 1 - OBJET :</strong> La Caisse CIF accorde à Mme Fatou NDIAYE un prêt professionnel d'un montant de <strong>2 500 000 FCFA</strong> destiné à l'acquisition de stock commercial de textile.</p>
              <p><strong>ARTICLE 2 - REMBOURSEMENT :</strong> L'emprunteur s'engage à rembourser le prêt selon l'échéancier mensuel dégressif annexé, en 12 termes égaux de <strong>235 000 FCFA</strong> prélevés via Mobile Money ou guichet.</p>
              <p><strong>ARTICLE 3 - DISPOSITIF COLD START :</strong> Ce prêt bénéficie du programme d'inclusion financière DigiCoop-WA+ sans pénalité d'absence d'historique bancaire préalable.</p>
            </div>

            <div style="margin-top: 2rem; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 0.85rem; font-family: sans-serif; font-size: 0.74rem;">
              <div style="font-weight: 700; color: #15803d; margin-bottom: 2px;"><i class="fas fa-certificate mr-1"></i> SIGNATURE ÉLECTRONIQUE CERTIFIÉE</div>
              <div style="color: #334155;">Signé par Fatou NDIAYE (OTP +221 77 540 88 12) • Horodatage certifié SHA-256 : <code>9f83ab20...551c4a</code></div>
            </div>
          </div>
        `
      }
    };

    return docs[docKey] || docs.proforma;
  }
};

window.App = App;
window.openEditProfileModal = () => App.openEditProfileModal && App.openEditProfileModal();
window.closeEditProfileModal = () => App.closeEditProfileModal && App.closeEditProfileModal();
window.saveUserProfile = () => App.saveUserProfile && App.saveUserProfile();
window.openLogoutConfirmModal = () => App.openLogoutConfirmModal && App.openLogoutConfirmModal();
window.closeLogoutConfirmModal = () => App.closeLogoutConfirmModal && App.closeLogoutConfirmModal();
window.confirmLogout = () => App.confirmLogout && App.confirmLogout();
window.logout = () => App.logout && App.logout();

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

