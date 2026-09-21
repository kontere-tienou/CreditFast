/**
 * CRÉDIT FAST - APPLICATION CONTROLLER & ROLE ROUTER V2
 * Gestion dynamique des 5 espaces métiers indépendants (Sidebar, Dashboard & Écrans dédiés)
 * Confédération des Institutions Financières d'Afrique de l'Ouest (CreditFast - DigiCoop-WA+)
 */

const App = {
  currentUser: null,
  currentRole: "ANALYST",
  currentView: "view-role-analyst",
  currentAuthSlide: 0,
  authSliderTimer: null,

  resolveCreditRequest(identifier) {
    const requests = (typeof DB !== "undefined" && DB.get("credit_requests")) || [];
    if (identifier == null || identifier === "") {
      return requests[0] || null;
    }
    const token = String(identifier).trim();
    if (/^\d+$/.test(token)) {
      const byId = requests.find((r) => r.id == token);
      if (byId) return byId;
    }
    const byNumber = requests.find(
      (r) => r.request_number === token || r.request_number === identifier,
    );
    if (byNumber) return byNumber;
    const byName = requests.find(
      (r) =>
        String(r.client_name || "").toLowerCase() === token.toLowerCase(),
    );
    if (byName) return byName;
    return null;
  },

  resolveAnomalyId(identifier) {
    const anomalies = (typeof DB !== "undefined" && DB.get("anomalies")) || [];
    const token = String(identifier ?? "").trim();
    if (/^\d+$/.test(token)) {
      const byId = anomalies.find((a) => a.id == token);
      if (byId) return byId.id;
    }
    const req = this.resolveCreditRequest(token);
    if (req) {
      const linked = anomalies.find((a) => a.credit_request_id == req.id);
      if (linked) return linked.id;
    }
    return anomalies[0] ? anomalies[0].id : null;
  },

  resolveGuaranteeId(identifier) {
    const guarantees = (typeof DB !== "undefined" && DB.get("guarantees")) || [];
    const token = String(identifier ?? "").trim();
    if (/^\d+$/.test(token)) {
      const byId = guarantees.find((g) => g.id == token);
      if (byId) return byId.id;
    }
    const req = this.resolveCreditRequest(token);
    if (req) {
      const linked = guarantees.find((g) => g.credit_request_id == req.id);
      if (linked) return linked.id;
    }
    return guarantees[0] ? guarantees[0].id : null;
  },

  resolveComplementId(identifier) {
    const token = String(identifier ?? "").trim();
    if (/^10[1-4]$/.test(token)) return Number(token);
    const req = this.resolveCreditRequest(token);
    const byRequest = { 3: 101, 2: 104, 5: 103 };
    if (req && byRequest[req.id]) return byRequest[req.id];
    return 101;
  },

  resolveInstallmentNumber(identifier) {
    if (typeof identifier === "number" && Number.isFinite(identifier)) {
      return identifier;
    }
    const match = String(identifier ?? "").match(/(\d+)/);
    return match ? Number(match[1]) : 1;
  },

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
    this.checkAndHighlightExpiringDocs();

    // Check existing auth session or auto-load default persona
    const savedUser = localStorage.getItem("AUTH_USER");
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
  currentTheme: "light",

  initTheme() {
    const savedTheme = localStorage.getItem("APP_THEME") || "light";
    this.setTheme(savedTheme);
  },

  setTheme(theme) {
    this.currentTheme = theme;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("APP_THEME", theme);

    // Update icons in topbar
    const topbarThemeBtn = document.getElementById("theme-toggle-btn");
    if (topbarThemeBtn) {
      const topbarIcon = topbarThemeBtn.querySelector("i");
      if (topbarIcon) {
        topbarIcon.className =
          theme === "dark" ? "fas fa-sun text-warning" : "fas fa-moon";
      }
    }
  },

  toggleTheme() {
    const newTheme = this.currentTheme === "dark" ? "light" : "dark";
    this.setTheme(newTheme);
    this.showToast(
      `Mode ${newTheme === "dark" ? "Sombre" : "Clair"} activé`,
      "info",
    );
  },

  // 1. Authentication & Session Manager
  switchAuthTab(tab) {
    const tabExpress = document.getElementById("auth-tab-express");
    const tabManual = document.getElementById("auth-tab-manual");
    const contentExpress = document.getElementById("auth-tab-content-express");
    const contentManual = document.getElementById("auth-tab-content-manual");

    if (tab === "express") {
      if (tabExpress) tabExpress.classList.add("active");
      if (tabManual) tabManual.classList.remove("active");
      if (contentExpress) contentExpress.classList.add("active");
      if (contentManual) contentManual.classList.remove("active");
    } else {
      if (tabManual) tabManual.classList.add("active");
      if (tabExpress) tabExpress.classList.remove("active");
      if (contentManual) contentManual.classList.add("active");
      if (contentExpress) contentExpress.classList.remove("active");

      const emailInput = document.getElementById("login-email");
      if (emailInput) setTimeout(() => emailInput.focus(), 50);
    }
  },

  togglePasswordVisibility(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    if (!input) return;

    if (input.type === "password") {
      input.type = "text";
      if (icon) {
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
      }
    } else {
      input.type = "password";
      if (icon) {
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
      }
    }
  },

  showDemoCredentialsHelp() {
    this.showToast(
      'Cliquez sur l\'un des 4 boutons en bas pour insérer instantanément les identifiants (mot de passe universel: "demo")',
      "info",
    );
  },

  fillDemoCredentials(personaId) {
    const persona = APP_CONSTANTS.DEMO_ACCOUNTS.find((a) => a.id === personaId);
    if (!persona) return;

    const emailInput = document.getElementById("login-email");
    const pwdInput = document.getElementById("login-password");

    if (emailInput) {
      emailInput.value = persona.email;
      emailInput.classList.add("input-highlight-pulse");
      setTimeout(
        () => emailInput.classList.remove("input-highlight-pulse"),
        800,
      );
    }
    if (pwdInput) {
      pwdInput.value = persona.password || "demo";
      pwdInput.classList.add("input-highlight-pulse");
      setTimeout(() => pwdInput.classList.remove("input-highlight-pulse"), 800);
    }

    const demoBtns = document.querySelectorAll(".demo-persona-btn");
    demoBtns.forEach((b) => {
      if (b.getAttribute("data-demo-id") === personaId) {
        b.classList.add("active");
      } else {
        b.classList.remove("active");
      }
    });

    this.showToast(
      `Identifiants de ${persona.name} (${persona.badge}) insérés !`,
      "info",
    );
  },

  // Interactive 3-Photo Hero Slider Controls
  initAuthSlider() {
    this.currentAuthSlide = 0;
    this.resumeAuthSlider();
  },

  setAuthSlide(idx) {
    const slides = document.querySelectorAll("#auth-hero-slider .auth-slide");
    const dots = document.querySelectorAll(
      "#auth-slider-dots .auth-slider-dot",
    );
    if (!slides.length) return;

    const total = slides.length;
    this.currentAuthSlide = ((idx % total) + total) % total;

    slides.forEach((slide, i) => {
      if (i === this.currentAuthSlide) {
        slide.classList.add("active");
      } else {
        slide.classList.remove("active");
      }
    });

    const textBlocks = document.querySelectorAll(".auth-slide-text-block");
    textBlocks.forEach((block, i) => {
      if (i === this.currentAuthSlide) {
        block.classList.add("active");
      } else {
        block.classList.remove("active");
      }
    });

    dots.forEach((dot, i) => {
      if (i === this.currentAuthSlide) {
        dot.classList.add("active");
      } else {
        dot.classList.remove("active");
      }
    });
  },

  nextAuthSlide() {
    this.setAuthSlide(this.currentAuthSlide + 1);
  },

  prevAuthSlide() {
    this.setAuthSlide(this.currentAuthSlide - 1);
  },

  pauseAuthSlider() {
    if (this.authSliderTimer) {
      clearInterval(this.authSliderTimer);
      this.authSliderTimer = null;
    }
  },

  resumeAuthSlider() {
    this.pauseAuthSlider();
    const sliderElem = document.getElementById("auth-hero-slider");
    if (!sliderElem) return;

    this.authSliderTimer = setInterval(() => {
      this.nextAuthSlide();
    }, 4500);
  },

  initAuth() {
    this.initAuthSlider();

    // Restore remembered identifier if present
    const rememberedId = localStorage.getItem("REMEMBER_ME_CRED");
    const emailInput = document.getElementById("login-email");
    if (rememberedId && emailInput) {
      emailInput.value = rememberedId;
    }

    // Demo Account Buttons (Pre-fills credentials on click)
    const demoBtns = document.querySelectorAll(".demo-persona-btn");
    demoBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const personaId = btn.getAttribute("data-demo-id");
        this.fillDemoCredentials(personaId);
      });
    });

    // Login Form Submit
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
      loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const rawInput = document.getElementById("login-email")
          ? document.getElementById("login-email").value.trim()
          : "";
        const rawInputLower = rawInput.toLowerCase();
        const rememberCheckbox = document.getElementById(
          "remember-me-checkbox",
        );

        if (rememberCheckbox && rememberCheckbox.checked && rawInput) {
          localStorage.setItem("REMEMBER_ME_CRED", rawInput);
        } else {
          localStorage.removeItem("REMEMBER_ME_CRED");
        }

        // Multi-field smart matching: email, clientNumber, phone, partial name
        const match =
          APP_CONSTANTS.DEMO_ACCOUNTS.find(
            (a) =>
              (a.email && String(a.email).toLowerCase() === rawInputLower) ||
              (a.clientNumber &&
                String(a.clientNumber).toLowerCase() === rawInputLower) ||
              (a.phone &&
                String(a.phone).replace(/\s+/g, "") ===
                  rawInput.replace(/\s+/g, "")) ||
              (a.name && String(a.name).toLowerCase().includes(rawInputLower)),
          ) || APP_CONSTANTS.DEMO_ACCOUNTS[2]; // Default to Analyst

        const submitBtn = document.getElementById("btn-submit-login");
        const btnContent = document.getElementById("login-btn-content");

        if (submitBtn && btnContent) {
          submitBtn.disabled = true;
          btnContent.innerHTML =
            '<i class="fas fa-circle-notch fa-spin mr-2"></i> Authentification sécurisée...';
        }

        setTimeout(() => {
          if (submitBtn && btnContent) {
            submitBtn.disabled = false;
            btnContent.innerHTML =
              '<i class="fas fa-right-to-bracket mr-1"></i> Se Connecter à mon Espace';
          }
          this.login(match);
        }, 350);
      });
    }

    // Logout Buttons (Intercept and open confirmation dialog)
    document.querySelectorAll(".btn-action-logout").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.openLogoutConfirmModal();
      });
    });
  },

  openLogoutConfirmModal() {
    // 1. Close profile dropdown menu if open
    const profileMenu = document.getElementById("profile-dropdown-menu");
    const profileBtn = document.getElementById("topbar-profile-btn");
    if (profileMenu) profileMenu.classList.remove("show");
    if (profileBtn) profileBtn.classList.remove("active");

    // 2. Populate active user data in the confirmation modal
    const user = this.currentUser || APP_CONSTANTS.DEMO_ACCOUNTS[2];
    const roleConfig =
      APP_CONSTANTS.ROLES[user.role] || APP_CONSTANTS.ROLES.ANALYST;

    const avatarImg = document.getElementById("logout-confirm-user-avatar");
    const avatarFlag = document.getElementById("logout-confirm-avatar-flag");
    const userName = document.getElementById("logout-confirm-user-name");
    const userRole = document.getElementById("logout-confirm-user-role");
    const userEmail = document.getElementById("logout-confirm-user-email");

    if (avatarImg) avatarImg.src = user.avatar;
    if (avatarFlag) {
      const flagCode =
        user.countryFlag ||
        (user.id === "demo-client"
          ? "ml"
          : user.id === "demo-agent"
            ? "tg"
            : user.id === "demo-committee"
              ? "ml"
              : user.id === "demo-compliance"
                ? "bj"
                : "bf");
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
    const modal = document.getElementById("modal-confirm-logout");
    if (modal) {
      modal.style.display = "flex";
      setTimeout(() => modal.classList.add("active"), 10);
    } else {
      // Fallback: If modal container is not found, logout directly
      this.logout();
    }
  },

  closeLogoutConfirmModal() {
    const modal = document.getElementById("modal-confirm-logout");
    if (modal) {
      modal.classList.remove("active");
      modal.style.display = "none";
    }
  },

  confirmLogout() {
    this.closeLogoutConfirmModal();
    this.logout();
  },

  login(user) {
    this.currentUser = user;
    this.currentRole = user.role;
    localStorage.setItem("AUTH_USER", JSON.stringify(user));

    // Hide Auth View & Show App Shell
    const authView = document.getElementById("auth-view");
    const mainApp = document.getElementById("app-wrapper");
    if (authView) authView.style.display = "none";
    if (mainApp) mainApp.style.display = "flex";

    // Update Topbar Info
    this.updateUserHeader(user);

    // Render Role-Specific Sidebar & Navigate to Dedicated Home Dashboard
    this.renderSidebarForRole(user.role);

    // Render Role-Specific Notifications in Topbar
    this.renderNotificationsForRole(user.role);

    const roleConfig =
      APP_CONSTANTS.ROLES[user.role] || APP_CONSTANTS.ROLES.ANALYST;
    this.switchView(roleConfig.homeView);

    this.showToast(
      `Connecté en tant que ${user.name} (${roleConfig.name})`,
      "success",
    );
  },

  logout() {
    this.currentUser = null;
    localStorage.removeItem("AUTH_USER");
    this.showLoginScreen();
    this.showToast("Vous avez été déconnecté avec succès", "info");
  },

  showLoginScreen() {
    const authView = document.getElementById("auth-view");
    const mainApp = document.getElementById("app-wrapper");
    if (authView) authView.style.display = "flex";
    if (mainApp) mainApp.style.display = "none";
  },

  updateUserHeader(user) {
    const roleBadge = document.getElementById("user-role-display");
    const userName = document.getElementById("user-name-display");
    const userAvatar = document.getElementById("user-avatar-display");
    const globalRoleSelect = document.getElementById("global-role-select");
    const rolePill = document.getElementById("user-role-pill-badge");

    // Topbar Profile Header Elements
    const topbarAvatar = document.getElementById("topbar-avatar-img");
    const topbarName = document.getElementById("topbar-user-name");
    const topbarRole = document.getElementById("topbar-user-role");
    const menuAvatar = document.getElementById("menu-avatar-img");
    const menuName = document.getElementById("menu-user-name");
    const menuEmail = document.getElementById("menu-user-email");
    const menuRoleBadge = document.getElementById("menu-user-role-badge");

    const roleConfig =
      APP_CONSTANTS.ROLES[user.role] || APP_CONSTANTS.ROLES.ANALYST;

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
    const userCountryCode =
      user.countryCode ||
      (user.id === "demo-client"
        ? "ML"
        : user.id === "demo-agent"
          ? "TG"
          : user.id === "demo-committee"
            ? "ML"
            : user.id === "demo-compliance"
              ? "BJ"
              : "BF");
    this.updateUserCountry(userCountryCode);
  },

  // 2. DYNAMIC ROLE-SPECIFIC SIDEBAR RENDERER
  renderSidebarForRole(roleCode) {
    const container = document.getElementById("sidebar-menu-container");
    if (!container) return;

    const roleConfig =
      APP_CONSTANTS.ROLES[roleCode] || APP_CONSTANTS.ROLES.ANALYST;
    let html = "";

    roleConfig.navGroups.forEach((group, gIdx) => {
      html += `
        <div class="sidebar-nav-group" id="sidebar-nav-group-${gIdx}">
          <div class="menu-group-title">${group.title}</div>
          <ul class="nav-items-list">
      `;
      group.items.forEach((item) => {
        const badgeHtml = item.badge
          ? `<span class="nav-badge ${item.badgeClass || ""}">${item.badge}</span>`
          : "";
        const tooltipText = item.badge
          ? `${item.label} • ${item.badge}`
          : item.label;
        const isCurrentActive = this.currentView === item.target;

        html += `
          <li class="nav-item ${isCurrentActive ? "active" : ""}">
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
    container.querySelectorAll("[data-view-target]").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const targetView = link.getAttribute("data-view-target");
        if (targetView) {
          this.switchView(targetView);
        }

        // Auto close drawer on mobile screens
        if (window.innerWidth <= 992) {
          const sidebar = document.getElementById("sidebar");
          const backdrop = document.getElementById("sidebar-backdrop");
          if (sidebar) sidebar.classList.remove("mobile-open");
          if (backdrop) {
            backdrop.classList.remove("active");
            setTimeout(() => (backdrop.style.display = "none"), 250);
          }
        }
      });
    });
  },

  // Helper to switch active role dynamically and re-render sidebar + view
  switchRole(roleCode) {
    const roleConfig =
      APP_CONSTANTS.ROLES[roleCode] || APP_CONSTANTS.ROLES.ANALYST;
    this.currentRole = roleConfig.code;

    // Find matching demo persona or update currentUser
    const persona = APP_CONSTANTS.DEMO_ACCOUNTS.find(
      (a) => a.role === roleConfig.code,
    ) || {
      id: `user-${roleConfig.code.toLowerCase()}`,
      name: roleConfig.name,
      role: roleConfig.code,
      email: `${roleConfig.code.toLowerCase()}@cif-ao.org`,
      avatar: "images/profil/profil01-04.jpg",
      title: roleConfig.shortName,
    };

    this.currentUser = persona;
    localStorage.setItem("AUTH_USER", JSON.stringify(persona));

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
    if (!viewId) return;

    // Role-Based Access Control verification
    const userRole =
      this.currentRole ||
      (this.currentUser ? this.currentUser.role : "COMMITTEE");
    const allowedViews =
      (APP_CONSTANTS.ROLE_PERMITTED_VIEWS &&
        APP_CONSTANTS.ROLE_PERMITTED_VIEWS[userRole]) ||
      [];

    // If target view is not directly in current role's allowed list, check if it belongs to another role and adapt smoothly
    if (
      Array.isArray(allowedViews) &&
      allowedViews.length > 0 &&
      !allowedViews.includes(viewId)
    ) {
      let targetRole = null;
      if (APP_CONSTANTS.ROLE_PERMITTED_VIEWS) {
        for (const [rCode, views] of Object.entries(
          APP_CONSTANTS.ROLE_PERMITTED_VIEWS,
        )) {
          if (views.includes(viewId)) {
            targetRole = rCode;
            break;
          }
        }
      }

      if (targetRole && targetRole !== userRole) {
        const targetRoleConfig = APP_CONSTANTS.ROLES[targetRole];
        if (targetRoleConfig) {
          const persona = APP_CONSTANTS.DEMO_ACCOUNTS.find(
            (a) => a.role === targetRole,
          ) || {
            id: `user-${targetRole.toLowerCase()}`,
            name: targetRoleConfig.name,
            role: targetRole,
            email: `${targetRole.toLowerCase()}@cif-ao.org`,
            avatar: "images/profil/profil01-01.jpg",
            title: targetRoleConfig.shortName,
          };
          this.currentRole = targetRole;
          this.currentUser = persona;
          localStorage.setItem("AUTH_USER", JSON.stringify(persona));
          this.updateUserHeader(persona);
          this.renderSidebarForRole(targetRole);
          this.renderNotificationsForRole(targetRole);
        }
      }
    }

    this.currentView = viewId;

    // Highlight active nav item
    document
      .querySelectorAll(".nav-item")
      .forEach((item) => item.classList.remove("active"));
    const activeLink = document.querySelector(`[data-view-target="${viewId}"]`);
    if (activeLink && activeLink.parentElement) {
      activeLink.parentElement.classList.add("active");
    }

    // Toggle view visibility
    document.querySelectorAll(".app-view").forEach((view) => {
      view.style.display = "none";
    });
    const target = document.getElementById(viewId);
    if (target) {
      target.style.display = "block";
    }

    // Execute role-specific initializers
    if (viewId === "view-role-client" || viewId === "view-client-requests") {
      this.renderBorrowerDashboard();
    } else if (viewId === "view-client-documents") {
      this.checkAndHighlightExpiringDocs();
    } else if (viewId === "view-client-schedule") {
      this.renderClientSchedule();
    } else if (viewId === "view-client-simulator") {
      this.updateClientSimulation();
    } else if (viewId === "view-role-agent") {
      this.renderAgentDashboard();
    } else if (viewId === "view-agent-inspections") {
      this.renderAgentInspections();
    } else if (viewId === "view-agent-clients") {
      this.renderAgentClientsPortfolio();
    } else if (viewId === "view-agent-complements") {
      this.renderAgentComplements();
    } else if (
      viewId === "view-role-analyst" ||
      viewId === "view-analyst-dossiers"
    ) {
      this.renderAnalystDashboard();
    } else if (viewId === "view-analyst-anomalies") {
      this.renderAnalystAnomalies();
    } else if (viewId === "view-role-committee") {
      this.renderCommitteeDashboard();
    } else if (viewId === "view-committee-dossiers") {
      this.renderCommitteeDossiersPage();
    } else if (viewId === "view-committee-signed") {
      this.renderSignedPvTable();
    } else if (
      viewId === "view-role-compliance" ||
      viewId === "view-compliance-screening"
    ) {
      this.renderComplianceDashboard();
    } else if (viewId === "view-scoring-admin") {
      this.updateColdStartComparisonSim();
    } else if (viewId === "view-audit-logs") {
      this.renderAuditLogs();
    }

    // Close mobile drawer if open
    const sidebar = document.getElementById("sidebar");
    const backdrop = document.getElementById("sidebar-backdrop");
    if (sidebar) sidebar.classList.remove("mobile-open");
    if (backdrop) backdrop.classList.remove("active");

    window.scrollTo({ top: 0, behavior: "smooth" });
  },

  // =========================================================================
  // 4. SPECIFIC DASHBOARD RENDERERS FOR EACH OF THE 5 ROLES
  // =========================================================================

  // [ROLE 1] DEMANDEUR / CLIENT EMPRUNTEUR
  renderBorrowerDashboard() {
    const req = DB.findById("credit_requests", 1); // Fatou Ndiaye
    const client = DB.findById("clients", 1);
    if (!req) return;

    const nameEl = document.getElementById("borrower-banner-name");
    const numEl = document.getElementById("borrower-member-num");
    if (nameEl)
      nameEl.textContent = this.currentUser
        ? this.currentUser.name
        : "Faratigi Ndiaye";
    if (numEl)
      numEl.textContent = client ? client.client_number : "ML-BKO-008821";

    const activeAmount = document.getElementById("borrower-active-amount");
    const activePurpose = document.getElementById("borrower-active-purpose");
    const activeRef = document.getElementById("borrower-active-ref");
    const activeStatus = document.getElementById("borrower-active-status");

    if (activeAmount)
      activeAmount.textContent = CreditScoringEngine.formatFCFA(
        req.requested_amount,
      );
    if (activePurpose) activePurpose.textContent = req.purpose;
    if (activeRef) activeRef.textContent = req.request_number;
    if (activeStatus)
      activeStatus.innerHTML = AppInteractions.getStatusBadge(req.status);

    this.updateCompactEstimator();
  },

  // [ROLE 2] AGENT DE CRÉDIT (CHARGÉ DE CLIENTÈLE)
  agentSortKey: null,
  agentSortDir: "asc",

  sortAgentTable(key) {
    if (this.agentSortKey === key) {
      this.agentSortDir = this.agentSortDir === "asc" ? "desc" : "asc";
    } else {
      this.agentSortKey = key;
      this.agentSortDir = key === "requested_amount" ? "desc" : "asc";
    }

    const fieldLabels = {
      request_number: "N° Dossier / Date",
      client_name: "Client Emprunteur",
      requested_amount: "Montant Demandé",
      purpose: "Objet du Prêt",
      status: "Statut",
    };

    const dirLabel = this.agentSortDir === "asc" ? "croissant" : "décroissant";
    this.showToast(`Tri par ${fieldLabels[key] || key} (${dirLabel})`, "info");

    this.renderAgentDashboard(true);
  },

  currentAgentPipelineFilter: "ALL",

  filterAgentPipeline(filter = "ALL", buttonEl = null) {
    this.currentAgentPipelineFilter = filter;

    const filterBtns = {
      ALL: "filter-agent-all",
      SUBMITTED: "filter-agent-submitted",
      REVIEW: "filter-agent-review",
      APPROVED: "filter-agent-approved",
    };

    Object.entries(filterBtns).forEach(([key, id]) => {
      const btn = document.getElementById(id);
      if (btn) {
        if (key === filter) {
          btn.classList.add("active");
        } else {
          btn.classList.remove("active");
        }
      }
    });

    this.renderAgentDashboard();
  },

  renderAgentPipeline(animated = false) {
    return this.renderAgentDashboard(animated);
  },

  renderAgentDashboard(animated = false) {
    AppCharts.setupDefaults();
    AppCharts.renderActivitySparkline("agent-activity-sparkline");

    const tbody = document.getElementById("agent-pipeline-table-body");
    if (!tbody) return;

    // Update Header Sort Icons & Active state
    const sortKeys = [
      "request_number",
      "client_name",
      "requested_amount",
      "status",
    ];
    sortKeys.forEach((k) => {
      const thEl = document.querySelector(`.sortable-th[onclick*="'${k}'"]`);
      const iconEl = document.getElementById(`sort-icon-${k}`);
      if (thEl) {
        if (this.agentSortKey === k) {
          thEl.classList.add("active-sort");
          if (iconEl) {
            iconEl.className = `fas fa-sort-${this.agentSortDir === "asc" ? "up" : "down"} sort-icon`;
          }
        } else {
          thEl.classList.remove("active-sort");
          if (iconEl) {
            iconEl.className = "fas fa-sort sort-icon";
          }
        }
      }
    });

    const allRequests = DB.get("credit_requests") || [];

    // Calculate filter tab counters
    const countAll = allRequests.length;
    const countSubmitted = allRequests.filter(
      (r) => r.status === "SUBMITTED",
    ).length;
    const countReview = allRequests.filter((r) =>
      ["ANALYSIS", "VERIFICATION_REQUIRED", "CREDIT_REVIEW"].includes(r.status),
    ).length;
    const countApproved = allRequests.filter((r) =>
      ["COMMITTEE", "APPROVED", "DISBURSED"].includes(r.status),
    ).length;

    const elCountAll = document.getElementById("agent-filter-count-all");
    const elCountSubmitted = document.getElementById(
      "agent-filter-count-submitted",
    );
    const elCountReview = document.getElementById("agent-filter-count-review");
    const elCountApproved = document.getElementById(
      "agent-filter-count-approved",
    );

    if (elCountAll) elCountAll.textContent = countAll;
    if (elCountSubmitted) elCountSubmitted.textContent = countSubmitted;
    if (elCountReview) elCountReview.textContent = countReview;
    if (elCountApproved) elCountApproved.textContent = countApproved;

    let requests = [...allRequests];

    // Apply Filter
    const activeFilter = this.currentAgentPipelineFilter || "ALL";
    if (activeFilter === "SUBMITTED") {
      requests = requests.filter((r) => r.status === "SUBMITTED");
    } else if (activeFilter === "REVIEW") {
      requests = requests.filter((r) =>
        ["ANALYSIS", "VERIFICATION_REQUIRED", "CREDIT_REVIEW"].includes(
          r.status,
        ),
      );
    } else if (activeFilter === "APPROVED") {
      requests = requests.filter((r) =>
        ["COMMITTEE", "APPROVED", "DISBURSED"].includes(r.status),
      );
    }

    if (this.agentSortKey) {
      const key = this.agentSortKey;
      const isAsc = this.agentSortDir === "asc";

      requests.sort((a, b) => {
        let valA = a[key];
        let valB = b[key];

        if (key === "requested_amount") {
          return isAsc
            ? Number(valA) - Number(valB)
            : Number(valB) - Number(valA);
        } else if (key === "request_number") {
          const timeA = new Date(a.created_at || 0).getTime();
          const timeB = new Date(b.created_at || 0).getTime();
          return isAsc ? timeA - timeB : timeB - timeA;
        } else {
          const strA = String(valA || "").toLowerCase();
          const strB = String(valB || "").toLowerCase();
          return isAsc
            ? strA.localeCompare(strB, "fr")
            : strB.localeCompare(strA, "fr");
        }
      });
    }

    const rowClass = animated ? "sort-row-animated" : "";

    if (requests.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 2.5rem; color: var(--text-subtle);">
            <i class="fas fa-folder-open" style="font-size: 2rem; margin-bottom: 0.5rem; display: block; color: var(--text-muted);"></i>
            <div style="font-weight: 600; color: var(--text-primary);">Aucune demande ne correspond à ce filtre.</div>
            <div style="font-size: 0.76rem; margin-top: 4px;">Sélectionnez l'onglet "Toutes" pour revoir l'ensemble des dossiers.</div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = requests
      .map((r) => {
        const capacityBadge =
          r.repayment_capacity_status === "SUFFICIENT"
            ? `<span class="badge badge-capacity-sufficient" style="font-size: 0.65rem; padding: 2px 6px;"><i class="fas fa-check-circle mr-1"></i> Capacité OK</span>`
            : `<span class="badge badge-capacity-insufficient" style="font-size: 0.65rem; padding: 2px 6px;"><i class="fas fa-triangle-exclamation mr-1"></i> Taux > 33%</span>`;

        return `
        <tr class="schedule-table-row ${rowClass}" onclick="App.openAgentDrawer(${r.id})">
          <td>
            <strong style="color: var(--primary-600); font-family: var(--font-mono);">${r.request_number}</strong>
            <div style="font-size: 0.72rem; color: var(--text-subtle);">${new Date(r.created_at).toLocaleDateString("fr-FR")}</div>
          </td>
          <td>
            <div class="client-cell">
              <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(r.client_name)}&background=0ea5e9&color=fff" alt="" class="user-avatar" style="width: 32px; height: 32px; border-radius: var(--radius-md);">
              <div>
                <div class="client-name" style="font-weight: 600;">${r.client_name}</div>
                <div class="client-sub" style="font-size: 0.72rem; color: var(--text-subtle);"><i class="fas fa-location-dot mr-1"></i>${r.city}, ${r.country}</div>
              </div>
            </div>
          </td>
          <td>
            <div>
              <strong class="amount-cell" style="font-family: var(--font-mono); font-weight: 700; color: var(--text-primary);">${CreditScoringEngine.formatFCFA(r.requested_amount)}</strong>
              <div style="font-size: 0.72rem; color: var(--text-subtle);">${r.duration_months} mois • ${r.purpose ? r.purpose.substring(0, 20) + (r.purpose.length > 20 ? "..." : "") : "Activité"}</div>
            </div>
          </td>
          <td>
            <div style="display: flex; flex-direction: column; gap: 4px; align-items: flex-start;">
              ${AppInteractions.getStatusBadge(r.status)}
              ${capacityBadge}
            </div>
          </td>
          <td style="text-align: right;">
            <div style="display: flex; justify-content: flex-end; gap: 0.35rem; align-items: center;">
              <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); App.openAgentDrawer(${r.id})" title="Voir le volet détail">
                <i class="fas fa-sidebar"></i> <span class="hide-xs">Détails</span>
              </button>
              <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); App.triggerDocReminder(${r.id}, '${r.client_name.replace(/'/g, "\\'")}', 'Demande de justificatifs complémentaires')" title="Relancer par SMS">
                <i class="fas fa-comment-sms text-primary"></i> <span class="hide-xs">SMS</span>
              </button>
            </div>
          </td>
        </tr>
      `;
      })
      .join("");
  },

  openAgentDrawer(requestId) {
    const req = this.resolveCreditRequest(requestId);
    if (!req) return;

    const client = DB.findById("clients", req.client_id) || {};
    const user = DB.findById("users", client.user_id) || {};
    const activity =
      (DB.get("activities") || []).find(
        (a) => a.client_id == req.client_id || a.id == req.activity_id,
      ) || {};
    const financialProfile =
      (DB.get("financial_profiles") || []).find(
        (fp) => fp.client_id == req.client_id,
      ) || {};
    const guarantees = (DB.get("guarantees") || []).filter(
      (g) => g.credit_request_id == req.id,
    );
    const documents = (DB.get("documents") || []).filter(
      (d) => d.credit_request_id == req.id,
    );
    const evalData = CreditScoringEngine.evaluateDossier(req.id) || {};

    // Header elements
    const titleEl = document.getElementById("agent-drawer-title");
    const dateEl = document.getElementById("agent-drawer-date");
    if (titleEl)
      titleEl.textContent = `Dossier N° ${req.request_number || "REQ-2026-0000"}`;
    if (dateEl) {
      const subDate = new Date(
        req.submitted_at || req.created_at || Date.now(),
      ).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
      dateEl.textContent = `Déposé le ${subDate} • Agence ${req.city || client.city || "Assigamé"}`;
    }

    // Hero amount & badges
    const heroAmount = document.getElementById("agent-drawer-hero-amount");
    const heroStatusContainer = document.getElementById(
      "agent-drawer-hero-status-container",
    );
    const heroMode = document.getElementById("agent-drawer-hero-mode");
    const heroScoreBadge = document.getElementById(
      "agent-drawer-hero-score-badge",
    );

    if (heroAmount)
      heroAmount.textContent = CreditScoringEngine.formatFCFA(
        req.requested_amount,
      );
    if (heroStatusContainer) {
      heroStatusContainer.innerHTML = AppInteractions.getStatusBadge(
        req.status,
      );
    }
    if (heroMode) {
      const isCold = req.is_cold_start || client.is_cold_start;
      heroMode.className = isCold
        ? "badge badge-warning"
        : "badge badge-submitted";
      heroMode.innerHTML = isCold
        ? '<i class="fas fa-seedling"></i> Mode Cold Start'
        : '<i class="fas fa-history"></i> Mode Standard';
    }

    const score = evalData.overallScore || req.score || 84;
    const confidence = evalData.confidenceScore || req.confidence_score || 94;
    if (heroScoreBadge) {
      heroScoreBadge.innerHTML = `<i class="fas fa-microchip"></i> Score IA : ${score}/100`;
      heroScoreBadge.className =
        score >= 75
          ? "badge badge-approved"
          : score >= 60
            ? "badge badge-warning"
            : "badge badge-rejected";
    }

    // Borrower card
    const clientNumberEl = document.getElementById(
      "agent-drawer-client-number",
    );
    const clientAvatarEl = document.getElementById(
      "agent-drawer-client-avatar",
    );
    const clientNameEl = document.getElementById("agent-drawer-client-name");
    const clientOccEl = document.getElementById(
      "agent-drawer-client-occupation",
    );
    const clientLocEl = document.getElementById("agent-drawer-client-location");
    const clientPhoneEl = document.getElementById("agent-drawer-client-phone");
    const clientEmailEl = document.getElementById("agent-drawer-client-email");
    const clientKycEl = document.getElementById("agent-drawer-client-kyc");
    const btnSms = document.getElementById("agent-drawer-btn-sms");
    const btnCall = document.getElementById("agent-drawer-btn-call");

    if (clientNumberEl)
      clientNumberEl.textContent = client.client_number || "ML-BKO-008821";
    if (clientAvatarEl)
      clientAvatarEl.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(req.client_name)}&background=4f46e5&color=fff`;
    if (clientNameEl) clientNameEl.textContent = req.client_name;
    if (clientOccEl)
      clientOccEl.textContent =
        client.occupation || activity.sector || "Commerçant / Entrepreneur";
    if (clientLocEl)
      clientLocEl.textContent = `${req.city || client.city || "Bamako"}, ${req.country || "Mali"} (${client.residential_zone || "Zone Urbaine"})`;
    if (clientPhoneEl)
      clientPhoneEl.textContent = user.phone || "+223 77 450 88 21";
    if (clientEmailEl)
      clientEmailEl.textContent = user.email || "fatou.ndiaye@gmail.com";
    if (clientKycEl) {
      const isKycOk = client.kyc_status === "VERIFIED";
      clientKycEl.className = isKycOk
        ? "badge badge-approved"
        : "badge badge-warning";
      clientKycEl.innerHTML = isKycOk
        ? '<i class="fas fa-check-circle"></i> Conforme'
        : '<i class="fas fa-clock"></i> En Attente Pièces';
    }
    if (btnSms) {
      btnSms.setAttribute(
        "onclick",
        `App.triggerDocReminder(${req.id}, '${req.client_name.replace(/'/g, "\\'")}', 'Relance de justificatifs')`,
      );
    }
    if (btnCall) {
      btnCall.setAttribute(
        "onclick",
        `App.showToast('Appel direct initié vers ${user.phone || "+223 77 450 88 21"}', 'info')`,
      );
    }

    // Financial capacity card
    const durationEl = document.getElementById("agent-drawer-duration");
    const monthlyPaymentEl = document.getElementById(
      "agent-drawer-monthly-payment",
    );
    const incomeEl = document.getElementById("agent-drawer-income");
    const expensesEl = document.getElementById("agent-drawer-expenses");
    const disposableEl = document.getElementById("agent-drawer-disposable");
    const capacityBadgeEl = document.getElementById(
      "agent-drawer-capacity-badge",
    );

    const estPayment =
      req.estimated_monthly_payment ||
      Math.round(req.requested_amount / (req.duration_months || 12));
    const incomeVal =
      req.declared_monthly_income || financialProfile.monthly_income || 1450000;
    const expensesVal =
      req.declared_monthly_expenses ||
      financialProfile.monthly_expenses ||
      670000;
    const disposableVal =
      req.disposable_income ||
      financialProfile.disposable_income ||
      incomeVal - expensesVal;

    if (durationEl)
      durationEl.textContent = `${req.duration_months || 12} Mois`;
    if (monthlyPaymentEl)
      monthlyPaymentEl.textContent = `${CreditScoringEngine.formatFCFA(estPayment)} / mois`;
    if (incomeEl)
      incomeEl.textContent = CreditScoringEngine.formatFCFA(incomeVal);
    if (expensesEl)
      expensesEl.textContent = CreditScoringEngine.formatFCFA(expensesVal);
    if (disposableEl)
      disposableEl.textContent = CreditScoringEngine.formatFCFA(disposableVal);
    if (capacityBadgeEl) {
      const isSufficient = req.repayment_capacity_status === "SUFFICIENT";
      capacityBadgeEl.innerHTML = isSufficient
        ? '<span class="badge badge-capacity-sufficient"><i class="fas fa-check-circle"></i> Suffisante</span>'
        : '<span class="badge badge-capacity-insufficient"><i class="fas fa-triangle-exclamation"></i> Insuffisante</span>';
    }

    // Purpose & Guarantee card
    const purposeEl = document.getElementById("agent-drawer-purpose");
    const guarTypeEl = document.getElementById("agent-drawer-guarantee-type");
    const guarStatusEl = document.getElementById(
      "agent-drawer-guarantee-status",
    );
    const guarDescEl = document.getElementById("agent-drawer-guarantee-desc");
    const guarDeclaredEl = document.getElementById(
      "agent-drawer-guarantee-declared",
    );
    const guarVerifiedEl = document.getElementById(
      "agent-drawer-guarantee-verified",
    );

    if (purposeEl)
      purposeEl.textContent =
        req.purpose ||
        "Financement de fonds de roulement et acquisition matériel";

    if (guarantees.length > 0) {
      const g = guarantees[0];
      const isVerified = g.verification_status === "VERIFIED";
      if (guarTypeEl)
        guarTypeEl.textContent =
          g.guarantee_type || "Stock Marchandises & Équipements";
      if (guarStatusEl) {
        guarStatusEl.className = isVerified
          ? "badge badge-approved"
          : "badge badge-warning";
        guarStatusEl.innerHTML = isVerified
          ? '<i class="fas fa-check"></i> Inspecté sur terrain'
          : '<i class="fas fa-motorcycle"></i> À Visiter sur terrain';
      }
      if (guarDescEl)
        guarDescEl.textContent =
          g.description || "Garantie matérielle vérifiée";
      if (guarDeclaredEl)
        guarDeclaredEl.textContent = CreditScoringEngine.formatFCFA(
          g.declared_value || 0,
        );
      if (guarVerifiedEl)
        guarVerifiedEl.textContent = isVerified
          ? CreditScoringEngine.formatFCFA(g.verified_value || 0)
          : "Non expertisé";
    } else {
      if (guarTypeEl) guarTypeEl.textContent = "Caution Solidaire";
      if (guarStatusEl) {
        guarStatusEl.className = "badge badge-submitted";
        guarStatusEl.innerHTML = "Caution validée";
      }
      if (guarDescEl)
        guarDescEl.textContent =
          "Engagement solidaire du groupement sociétaire";
      if (guarDeclaredEl) guarDeclaredEl.textContent = "N/A";
      if (guarVerifiedEl) guarVerifiedEl.textContent = "N/A";
    }

    // Documents & OCR card
    const docsCountEl = document.getElementById("agent-drawer-docs-count");
    const docsListEl = document.getElementById("agent-drawer-docs-list");
    if (docsCountEl)
      docsCountEl.textContent = `${documents.length} document(s)`;
    if (docsListEl) {
      if (documents.length === 0) {
        docsListEl.innerHTML =
          '<div style="font-size: 0.78rem; color: var(--text-muted); font-style: italic;">Aucun document rattaché.</div>';
      } else {
        docsListEl.innerHTML = documents
          .map((doc) => {
            const isValidated = doc.status === "VALIDATED";
            const isFlagged = doc.status === "FLAGGED";
            const docBadge = isValidated
              ? '<span class="badge badge-approved" style="font-size: 0.65rem;"><i class="fas fa-check"></i> OCR Conforme</span>'
              : isFlagged
                ? '<span class="badge badge-rejected" style="font-size: 0.65rem;"><i class="fas fa-triangle-exclamation"></i> Anomalie</span>'
                : '<span class="badge badge-submitted" style="font-size: 0.65rem;">En Attente</span>';

            return `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0.65rem; background: var(--bg-surface-secondary); border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
              <div style="display: flex; align-items: center; gap: 0.5rem; overflow: hidden; min-width: 0;">
                <i class="fas fa-file-lines text-primary" style="font-size: 0.85rem; flex-shrink: 0;"></i>
                <div style="font-size: 0.78rem; font-weight: 600; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">
                  ${doc.original_filename || doc.document_type}
                </div>
              </div>
              <div style="flex-shrink: 0; margin-left: 0.5rem;">${docBadge}</div>
            </div>
          `;
          })
          .join("");
      }
    }

    // Risk Score & Scoring V2 card
    const scoreValEl = document.getElementById("agent-drawer-score-val");
    const confValEl = document.getElementById("agent-drawer-confidence-val");
    const scoreLabelEl = document.getElementById("agent-drawer-score-label");
    const scoreBarEl = document.getElementById("agent-drawer-score-progress");

    if (scoreValEl) {
      scoreValEl.textContent = score;
      scoreValEl.style.color =
        evalData.riskColor ||
        (score >= 75 ? "#059669" : score >= 60 ? "#d97706" : "#dc2626");
    }
    if (confValEl) confValEl.textContent = `${confidence}%`;
    if (scoreLabelEl) {
      const riskLevel =
        evalData.riskLevel ||
        (score >= 75 ? "FAIBLE" : score >= 60 ? "MODERE" : "ELEVE");
      scoreLabelEl.className = `badge ${riskLevel === "FAIBLE" ? "badge-approved" : riskLevel === "MODERE" ? "badge-warning" : "badge-rejected"}`;
      scoreLabelEl.textContent =
        riskLevel === "FAIBLE"
          ? "Risque Faible"
          : riskLevel === "MODERE"
            ? "Risque Modéré"
            : "Risque Élevé";
    }
    if (scoreBarEl) {
      scoreBarEl.style.width = `${Math.min(100, Math.max(0, score))}%`;
      scoreBarEl.style.background =
        score >= 75
          ? "linear-gradient(90deg, #10b981, #059669)"
          : score >= 60
            ? "linear-gradient(90deg, #f59e0b, #d97706)"
            : "linear-gradient(90deg, #ef4444, #dc2626)";
    }

    // Footer action buttons
    const footerActions = document.getElementById(
      "agent-drawer-footer-actions",
    );
    if (footerActions) {
      footerActions.innerHTML = `
        <button class="btn btn-secondary btn-sm" onclick="App.closeAgentDrawer(); App.switchView('view-agent-inspections');">
          <i class="fas fa-motorcycle mr-1"></i> Inspections Terrain
        </button>
        <button class="btn btn-primary btn-sm" onclick="App.closeAgentDrawer(); AppInteractions.openDossierModal(${req.id});">
          <i class="fas fa-magnifying-glass-chart mr-1"></i> Analyser 360°
        </button>
      `;
    }

    // Open Backdrop
    const backdrop = document.getElementById("agent-drawer-backdrop");
    if (backdrop) backdrop.classList.add("active");
  },

  closeAgentDrawer() {
    const backdrop = document.getElementById("agent-drawer-backdrop");
    if (backdrop) backdrop.classList.remove("active");
  },

  // =========================================================================
  // [ROLE 2 - PAGE 2] INSPECTIONS & VISITES TERRAIN DES GARANTIES
  // =========================================================================
  agentInspFilter: "ALL",
  agentInspSearch: "",

  renderAgentInspections() {
    const tbody = document.getElementById("agent-inspections-table-body");
    if (!tbody) return;

    const guarantees = DB.get("guarantees");
    const requests = DB.get("credit_requests");
    const clients = DB.get("clients");

    // Calculate KPIs
    let pendingCount = 0;
    let verifiedCount = 0;
    let totalVerifiedVal = 0;
    let totalDeclaredVal = 0;
    let totalRequestedLoanVal = 0;
    let anomaliesCount = 0;

    const items = guarantees.map((g) => {
      const req = requests.find((r) => r.id == g.credit_request_id) || {};
      const client = clients.find((c) => c.id == req.client_id) || {};

      const isVerified = g.verification_status === "VERIFIED";
      if (isVerified) {
        verifiedCount++;
        totalVerifiedVal += g.verified_value || 0;
      } else {
        pendingCount++;
      }
      totalDeclaredVal += g.declared_value || 0;
      if (req.requested_amount) totalRequestedLoanVal += req.requested_amount;

      if (
        g.declared_value &&
        g.verified_value &&
        g.declared_value > g.verified_value * 1.3
      ) {
        anomaliesCount++;
      }

      return {
        ...g,
        clientName: req.client_name || "Emprunteur CIF",
        requestNumber: req.request_number || "REQ-2026-0000",
        city: req.city || client.city || "UEMOA",
        country: req.country || "UEMOA",
        zone: client.residential_zone || "Urbaine",
      };
    });

    // Update KPIs UI
    const pendingEl = document.getElementById("insp-kpi-pending");
    const verifiedEl = document.getElementById("insp-kpi-verified");
    const ratioEl = document.getElementById("insp-kpi-ratio");
    const anomEl = document.getElementById("insp-kpi-anomalies");
    const countAllEl = document.getElementById("insp-count-all");
    const countPendingEl = document.getElementById("insp-count-pending");
    const countVerifiedEl = document.getElementById("insp-count-verified");

    if (pendingEl) pendingEl.textContent = pendingCount;
    if (verifiedEl)
      verifiedEl.textContent = `${(totalVerifiedVal / 1000000).toFixed(1)}M`;
    if (ratioEl)
      ratioEl.textContent =
        totalRequestedLoanVal > 0
          ? `${Math.round((totalVerifiedVal / totalRequestedLoanVal) * 100)}%`
          : "135%";
    if (anomEl) anomEl.textContent = anomaliesCount;
    if (countAllEl) countAllEl.textContent = guarantees.length;
    if (countPendingEl) countPendingEl.textContent = pendingCount;
    if (countVerifiedEl) countVerifiedEl.textContent = verifiedCount;

    // Apply Filter & Search
    let filtered = items;
    if (this.agentInspFilter === "PENDING") {
      filtered = filtered.filter((i) => i.verification_status !== "VERIFIED");
    } else if (this.agentInspFilter === "VERIFIED") {
      filtered = filtered.filter((i) => i.verification_status === "VERIFIED");
    } else if (this.agentInspFilter === "STOCK") {
      filtered = filtered.filter(
        (i) => i.guarantee_type === "STOCK_MARCHANDISE",
      );
    } else if (this.agentInspFilter === "CAUTION") {
      filtered = filtered.filter(
        (i) => i.guarantee_type === "CAUTION_SOLIDAIRE",
      );
    }

    if (this.agentInspSearch) {
      const q = this.agentInspSearch.toLowerCase();
      filtered = filtered.filter(
        (i) =>
          (i.clientName && i.clientName.toLowerCase().includes(q)) ||
          (i.requestNumber && i.requestNumber.toLowerCase().includes(q)) ||
          (i.description && i.description.toLowerCase().includes(q)) ||
          (i.city && i.city.toLowerCase().includes(q)),
      );
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-subtle);">
            <i class="fas fa-search" style="font-size: 1.5rem; margin-bottom: 0.5rem; display: block;"></i>
            Aucune inspection ne correspond aux filtres sélectionnés.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered
      .map((item) => {
        const isVerif = item.verification_status === "VERIFIED";
        const typeLabels = {
          STOCK_MARCHANDISE: {
            label: "Stock Marchandises",
            icon: "fa-boxes-stacked",
            color: "#0ea5e9",
          },
          EQUIPEMENT_MATERIEL: {
            label: "Machines & Équipement",
            icon: "fa-gears",
            color: "#8b5cf6",
          },
          CAUTION_SOLIDAIRE: {
            label: "Caution Solidaire",
            icon: "fa-user-shield",
            color: "#10b981",
          },
          GAGE_VEHICULE: {
            label: "Gage Véhicule / Matériel",
            icon: "fa-truck-front",
            color: "#f59e0b",
          },
        };
        const tCfg = typeLabels[item.guarantee_type] || {
          label: item.guarantee_type,
          icon: "fa-shield",
          color: "#64748b",
        };

        return `
        <tr class="schedule-table-row" onclick="App.openInspectionDrawer(${item.id})">
          <td>
            <strong style="color: var(--primary-600); font-family: var(--font-mono);">${item.requestNumber}</strong>
            <div style="font-size: 0.8rem; font-weight: 600; color: var(--text-primary); margin-top: 2px;">${item.clientName}</div>
            <div style="font-size: 0.72rem; color: var(--text-subtle);">${item.city}, ${item.country}</div>
          </td>
          <td>
            <span class="badge" style="background: rgba(14, 165, 233, 0.12); color: ${tCfg.color}; border: 1px solid ${tCfg.color}; font-size: 0.72rem; padding: 3px 7px;">
              <i class="fas ${tCfg.icon} mr-1"></i> ${tCfg.label}
            </span>
            <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 3px; max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              ${item.description}
            </div>
          </td>
          <td>
            <div>
              <span style="font-size: 0.7rem; color: var(--text-subtle);">Déclarée :</span>
              <strong style="color: var(--text-primary); font-family: var(--font-mono); font-size: 0.82rem;"> ${CreditScoringEngine.formatFCFA(item.declared_value)}</strong>
            </div>
            <div style="margin-top: 2px;">
              <span style="font-size: 0.7rem; color: var(--text-subtle);">Expertisée :</span>
              ${
                isVerif
                  ? `<strong style="color: #047857; font-weight: 700; font-family: var(--font-mono); font-size: 0.82rem;"> ${CreditScoringEngine.formatFCFA(item.verified_value)}</strong>`
                  : '<span style="color: var(--text-subtle); font-style: italic; font-size: 0.72rem;"> En attente</span>'
              }
            </div>
          </td>
          <td>
            ${
              isVerif
                ? `<span class="badge badge-approved" style="font-size: 0.68rem; padding: 3px 6px;"><i class="fas fa-check-circle"></i> Validée</span>`
                : `<span class="badge badge-warning" style="font-size: 0.68rem; padding: 3px 6px;"><i class="fas fa-motorcycle"></i> À Visiter</span>`
            }
            <div style="font-size: 0.68rem; color: var(--text-subtle); margin-top: 2px;">
              <i class="fas fa-location-dot"></i> ${item.zone}
            </div>
          </td>
          <td style="text-align: right;">
            <div style="display: flex; justify-content: flex-end; gap: 0.35rem; align-items: center;">
              <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); App.openInspectionDrawer(${item.id})" title="Voir les détails complets en volet latéral">
                <i class="fas fa-eye text-primary"></i> Détails
              </button>
              <button class="btn ${isVerif ? "btn-secondary" : "btn-primary"} btn-sm" onclick="event.stopPropagation(); App.openInspectionModal(${item.id})" title="${isVerif ? "Modifier le rapport" : "Remplir le rapport d'inspection"}">
                <i class="fas ${isVerif ? "fa-pen-to-square" : "fa-clipboard-check"}"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
      })
      .join("");
  },

  currentInspectionDrawerId: null,

  openInspectionDrawer(guaranteeId) {
    const resolvedId = this.resolveGuaranteeId(guaranteeId);
    const g = DB.findById("guarantees", resolvedId);
    if (!g) return;

    this.currentInspectionDrawerId = g.id;
    const req = DB.findById("credit_requests", g.credit_request_id) || {};
    const client = DB.findById("clients", req.client_id) || {};

    const backdrop = document.getElementById("inspection-drawer-backdrop");
    const drawer = document.getElementById("inspection-sidedrawer");
    if (!drawer) return;

    // Header values
    const isVerif = g.verification_status === "VERIFIED";
    const typeBadge = document.getElementById("insp-drawer-type-badge");
    const statusBadge = document.getElementById("insp-drawer-status-badge");
    const titleEl = document.getElementById("insp-drawer-title");
    const subtitleEl = document.getElementById("insp-drawer-subtitle");

    if (typeBadge)
      typeBadge.innerHTML = `<i class="fas fa-shield"></i> ${g.guarantee_type || "Garantie"}`;
    if (statusBadge) {
      statusBadge.className = isVerif
        ? "badge badge-approved"
        : "badge badge-warning";
      statusBadge.innerHTML = isVerif
        ? '<i class="fas fa-check-circle"></i> Conforme & Validée'
        : '<i class="fas fa-clock"></i> Visite Terrain Requise';
    }
    if (titleEl)
      titleEl.textContent = `Inspection Garantie • ${req.request_number || "REQ-2026-0891"}`;
    if (subtitleEl)
      subtitleEl.textContent = `${client.city || "Bamako"} • ${client.residential_zone || "Zone Urbaine"}`;

    // Section 1: Emprunteur & Prêt
    const reqNumEl = document.getElementById("insp-drawer-req-num");
    const clientAvatar = document.getElementById("insp-drawer-client-avatar");
    const clientName = document.getElementById("insp-drawer-client-name");
    const clientLoc = document.getElementById("insp-drawer-client-loc");
    const loanAmount = document.getElementById("insp-drawer-loan-amount");
    const covRatio = document.getElementById("insp-drawer-coverage-ratio");

    if (reqNumEl) reqNumEl.textContent = req.request_number || "REQ-2026-0891";
    if (clientAvatar)
      clientAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(req.client_name || "Client")}&background=4f46e5&color=fff`;
    if (clientName) clientName.textContent = req.client_name || "Fatou Ndiaye";
    if (clientLoc)
      clientLoc.innerHTML = `<i class="fas fa-location-dot text-primary mr-1"></i> ${req.city || client.city || "Bamako"}, ${req.country || "Mali"} (${client.residential_zone || "Zone Urbaine"})`;
    if (loanAmount)
      loanAmount.textContent = CreditScoringEngine.formatFCFA(
        req.requested_amount || 2500000,
      );

    const valRetenue = g.verified_value || g.declared_value || 1000000;
    const loanAmt = req.requested_amount || 2500000;
    const covPct = Math.round((valRetenue / loanAmt) * 100);
    if (covRatio) {
      covRatio.textContent = `${covPct}%`;
      covRatio.style.color = covPct >= 120 ? "#059669" : "#d97706";
    }

    // Section 2: Expertise Financière
    const valDeclaredEl = document.getElementById("insp-drawer-val-declared");
    const valVerifiedEl = document.getElementById("insp-drawer-val-verified");
    const discountEl = document.getElementById("insp-drawer-discount-pct");
    const evalStatusEl = document.getElementById("insp-drawer-eval-status");

    if (valDeclaredEl)
      valDeclaredEl.textContent = CreditScoringEngine.formatFCFA(
        g.declared_value || 0,
      );
    if (valVerifiedEl)
      valVerifiedEl.textContent = isVerif
        ? CreditScoringEngine.formatFCFA(g.verified_value || 0)
        : "En cours d'expertise";

    const decVal = g.declared_value || 1;
    const verVal = g.verified_value || decVal;
    const discPct = Math.max(0, Math.round(((decVal - verVal) / decVal) * 100));
    if (discountEl) discountEl.textContent = isVerif ? `${discPct}%` : "N/A";
    if (evalStatusEl) {
      evalStatusEl.className = isVerif
        ? "badge badge-approved"
        : "badge badge-warning";
      evalStatusEl.textContent = isVerif
        ? "Expertise Validée"
        : "À Chiffrer sur Site";
    }

    // Section 3: Constats Terrain
    const descEl = document.getElementById("insp-drawer-desc");
    const locEl = document.getElementById("insp-drawer-location");
    const condEl = document.getElementById("insp-drawer-condition");
    const repEl = document.getElementById("insp-drawer-reputation");
    const notesEl = document.getElementById("insp-drawer-notes");

    if (descEl) descEl.textContent = g.description || "Description du gage";
    if (locEl)
      locEl.textContent = `${req.city || "Bamako"} - ${client.residential_zone || "Secteur Commercial"}`;
    if (condEl)
      condEl.textContent = g.condition
        ? `État : ${g.condition}`
        : "Bon état / Conforme";
    if (repEl)
      repEl.textContent = g.reputation
        ? `Avis : ${g.reputation}`
        : "Très Favorable (Voisinage)";
    if (notesEl)
      notesEl.textContent =
        g.agent_notes ||
        (isVerif
          ? "Visite sur site effectuée. Actifs constatés et en parfait état d'exploitation."
          : "Visite physique programmée par l'agent de crédit pour vérification d'inventaire et état de fonctionnement.");

    if (backdrop) backdrop.classList.add("active");
  },

  closeInspectionDrawer() {
    const backdrop = document.getElementById("inspection-drawer-backdrop");
    if (backdrop) backdrop.classList.remove("active");
  },

  openInspectionModalFromDrawer() {
    if (this.currentInspectionDrawerId) {
      this.closeInspectionDrawer();
      this.openInspectionModal(this.currentInspectionDrawerId);
    }
  },

  filterInspections(filterType, btn) {
    this.agentInspFilter = filterType;
    if (btn) {
      const container = document.getElementById("insp-filter-buttons");
      if (container) {
        container.querySelectorAll("button").forEach((b) => {
          b.classList.remove("btn-primary");
          if (!b.classList.contains("btn-secondary"))
            b.classList.add("btn-secondary");
        });
        btn.classList.remove("btn-secondary");
        btn.classList.add("btn-primary");
      }
    }
    this.renderAgentInspections();
  },

  searchInspections(query) {
    this.agentInspSearch = query;
    this.renderAgentInspections();
  },

  openInspectionModal(guaranteeId) {
    const g = DB.findById("guarantees", guaranteeId);
    if (!g) return;

    const req = DB.findById("credit_requests", g.credit_request_id) || {};
    const client = DB.findById("clients", req.client_id) || {};

    const modal = document.getElementById("modal-inspection");
    if (!modal) return;

    document.getElementById("insp-guarantee-id").value = g.id;
    document.getElementById("modal-insp-title").textContent =
      `Inspection de Garantie • Dossier ${req.request_number || "N/A"}`;
    document.getElementById("insp-client-name").textContent =
      `${req.client_name || "Client CreditFast"} • N° Client : ${client.client_number || "ML-BKO-008821"}`;
    document.getElementById("insp-guarantee-type").textContent =
      `${g.guarantee_type} • ${g.description}`;
    document.getElementById("insp-declared-val").value =
      CreditScoringEngine.formatFCFA(g.declared_value);
    document.getElementById("insp-verified-val").value =
      g.verified_value || g.declared_value || 1000000;
    document.getElementById("insp-location").value =
      `${req.city || "Bamako"} - ${client.residential_zone || "Zone Commerciale"}`;
    document.getElementById("insp-notes").value = g.verified_at
      ? `Contrôle sur site effectué avec succès. Actifs conformes au descriptif.`
      : `Visite d'atelier effectuée. Matériel en bon état de fonctionnement, couverture suffisante.`;

    const statusBadge = document.getElementById("insp-status-badge");
    if (statusBadge) {
      const isVerif = g.verification_status === "VERIFIED";
      statusBadge.className = isVerif
        ? "badge badge-approved"
        : "badge badge-warning";
      statusBadge.textContent = isVerif
        ? "Déjà Expertisé"
        : "À Visiter Terrain";
    }

    modal.style.display = "flex";
    modal.classList.add("active");
  },

  openNewInspectionModal() {
    const guarantees = DB.get("guarantees");
    if (guarantees.length > 0) {
      this.openInspectionModal(guarantees[0].id);
    } else {
      this.showToast("Aucune garantie en attente à planifier", "info");
    }
  },

  saveInspectionReport() {
    const gId = Number(document.getElementById("insp-guarantee-id")?.value);
    const verifiedVal = Number(
      document.getElementById("insp-verified-val")?.value || 1000000,
    );
    const notes =
      document.getElementById("insp-notes")?.value || "Contrôle terrain validé";
    const condition = document.getElementById("insp-condition")?.value || "BON";
    const reputation =
      document.getElementById("insp-reputation")?.value || "TRES_FAVORABLE";

    if (gId) {
      DB.update("guarantees", gId, {
        verified_value: verifiedVal,
        verification_status: "VERIFIED",
        verified_by: 2,
        verified_at: new Date().toISOString(),
        condition: condition,
        reputation: reputation,
        agent_notes: notes,
      });

      DB.addAuditLog(
        2,
        "INSPECTION_GARANTIE_VALIDEE",
        "guarantees",
        gId,
        `Garantie #${gId} valorisée à ${CreditScoringEngine.formatFCFA(verifiedVal)} (${condition})`,
      );
    }

    this.closeModal("modal-inspection");
    this.showToast(
      "Rapport de visite terrain certifié & garantie validée avec succès",
      "success",
    );
    this.renderAgentInspections();
    this.renderAgentDashboard();
  },

  // =========================================================================
  // [ROLE 2 - PAGE 3] PORTEFEUILLE EMPRUNTEURS CIF
  // =========================================================================
  agentClientFilter: "ALL",
  agentClientSearch: "",

  renderAgentClientsPortfolio() {
    const container = document.getElementById("agent-clients-grid");
    if (!container) return;

    const clients = DB.get("clients");
    const loans = DB.get("loans");
    const accounts = DB.get("financial_accounts");
    const requests = DB.get("credit_requests");

    let totalSavings = 0;
    let totalLoans = 0;
    let coldStartCount = 0;

    const clientCards = clients.map((c) => {
      const clientLoans = loans.filter((l) => l.client_id == c.id);
      const clientAccounts = accounts.filter((a) => a.client_id == c.id);
      const clientReqs = requests.filter((r) => r.client_id == c.id);
      const user = DB.findById("users", c.user_id) || {};

      const fullName = user.first_name
        ? `${user.first_name} ${user.last_name}`
        : clientReqs[0]?.client_name || "Sociétaire CreditFast";
      const country = user.country || clientReqs[0]?.country || "Mali";
      const avatar =
        user.avatar ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=0ea5e9&color=fff`;

      const savingsBalance = clientAccounts.reduce(
        (sum, a) => sum + (a.balance || 0),
        0,
      );
      const activeLoan = clientLoans.find((l) => l.status === "ACTIVE");
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
        isColdStart: c.is_cold_start,
      };
    });

    // Update KPI numbers
    const kpiTotal = document.getElementById("client-kpi-total");
    const kpiSavings = document.getElementById("client-kpi-savings");
    const kpiLoans = document.getElementById("client-kpi-loans");
    const kpiCold = document.getElementById("client-kpi-coldstart");
    const countAll = document.getElementById("clients-count-all");

    if (kpiTotal) kpiTotal.textContent = clients.length;
    if (kpiSavings)
      kpiSavings.textContent = `${(totalSavings / 1000000).toFixed(2)}M`;
    if (kpiLoans)
      kpiLoans.textContent = `${(totalLoans / 1000000).toFixed(1)}M`;
    if (kpiCold) kpiCold.textContent = coldStartCount;
    if (countAll) countAll.textContent = clients.length;

    // Filter & Search
    let filtered = clientCards;
    if (this.agentClientFilter === "COLD_START") {
      filtered = filtered.filter((c) => c.isColdStart);
    } else if (this.agentClientFilter === "ACTIVE_LOAN") {
      filtered = filtered.filter((c) => c.loanAmount > 0);
    } else if (this.agentClientFilter === "VERIFIED") {
      filtered = filtered.filter((c) => c.kyc_status === "VERIFIED");
    }

    if (this.agentClientSearch) {
      const q = this.agentClientSearch.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          (c.fullName && c.fullName.toLowerCase().includes(q)) ||
          (c.client_number && c.client_number.toLowerCase().includes(q)) ||
          (c.city && c.city.toLowerCase().includes(q)) ||
          (c.occupation && c.occupation.toLowerCase().includes(q)),
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

    container.innerHTML = filtered
      .map(
        (c) => `
      <div class="card" style="display: flex; flex-direction: column; justify-content: space-between; border-top: 3px solid ${c.isColdStart ? "#10b981" : "var(--primary-600)"};">
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
              ${
                c.isColdStart
                  ? '<span class="badge badge-warning" style="font-size: 0.68rem;"><i class="fas fa-seedling"></i> Cold Start</span>'
                  : '<span class="badge badge-submitted" style="font-size: 0.68rem;"><i class="fas fa-history"></i> Membre CIF</span>'
              }
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
              <div style="font-size: 0.9rem; font-weight: 800; color: ${c.loanAmount > 0 ? "var(--primary-700)" : "var(--text-subtle)"};">
                ${c.loanAmount > 0 ? CreditScoringEngine.formatFCFA(c.loanAmount) : "Aucun prêt"}
              </div>
            </div>
          </div>

          <!-- KYC status -->
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.72rem; margin-bottom: 1rem;">
            <span style="color: var(--text-subtle);">Statut Identité KYC :</span>
            <span class="badge ${c.kyc_status === "VERIFIED" ? "badge-approved" : "badge-verification"}">
              <i class="fas ${c.kyc_status === "VERIFIED" ? "fa-check" : "fa-clock"} mr-1"></i> ${c.kyc_status === "VERIFIED" ? "Vérifié Agence" : "À Compléter"}
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
    `,
      )
      .join("");
  },

  filterClientPortfolio(filter, btn) {
    this.agentClientFilter = filter;
    if (btn) {
      const container = document.getElementById("clients-filter-buttons");
      if (container) {
        container.querySelectorAll("button").forEach((b) => {
          b.classList.remove("btn-primary");
          if (!b.classList.contains("btn-secondary"))
            b.classList.add("btn-secondary");
        });
        btn.classList.remove("btn-secondary");
        btn.classList.add("btn-primary");
      }
    }
    this.renderAgentClientsPortfolio();
  },

  searchClientPortfolio(query) {
    this.agentClientSearch = query;
    this.renderAgentClientsPortfolio();
  },

  exportClientsCsv() {
    const clients = DB.get("clients");
    const requests = DB.get("credit_requests");

    let csv =
      "ID_CIF,Nom_Client,Ville,Pays,Zone_Chalandise,Profession,Statut_KYC,Cold_Start\n";
    clients.forEach((c) => {
      const req = requests.find((r) => r.client_id == c.id) || {};
      const name = req.client_name || "Membre CIF";
      const country = req.country || "UEMOA";
      csv += `"${c.client_number}","${name}","${c.city}","${country}","${c.residential_zone}","${c.occupation}","${c.kyc_status}","${c.is_cold_start ? "OUI" : "NON"}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Portefeuille_Clients_CIF_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.showToast(
      "Export CSV du portefeuille clients généré avec succès",
      "success",
    );
  },

  // =========================================================================
  // [ROLE 2 - PAGE 4] PIÈCES MANQUANTES & RELANCES DOCUMENTAIRES
  // =========================================================================
  renderAgentComplements() {
    const tbody = document.getElementById("agent-complements-table-body");
    if (!tbody) return;

    const docs = DB.get("documents");
    const requests = DB.get("credit_requests");
    const anomalies = DB.get("anomalies");

    // List of pending / missing / flagged pieces
    const items = [
      {
        id: 101,
        credit_request_id: 3,
        document_type: "FACTURE_PROFORMA_ACTUALISEE",
        expected_doc_name: "Facture Proforma (< 30j)",
        full_doc_name: "Nouvelle Facture Proforma Quincaillerie (< 30 jours)",
        short_motif: "Date OCR obsolète (> 18 mois)",
        reason:
          "Date OCR antérieure de 18 mois (12/01/2025). Écart de montant de 600 000 F constaté par rapport au plan de financement.",
        severity: "CRITICAL",
        reminders_sent: 2,
        last_reminder: "Il y a 2 jours",
        status: "ANOMALY_OPEN",
      },
      {
        id: 102,
        credit_request_id: 3,
        document_type: "CNI_RECTO_VERSO",
        expected_doc_name: "Carte Nationale d'Identité (CNI)",
        full_doc_name: "Carte Nationale d'Identité (Recto/Verso Certifié)",
        short_motif: "Scan flou / Illisible",
        reason:
          "Document illisible / flou sur la date de validité et numéro NINA/CNI.",
        severity: "WARNING",
        reminders_sent: 1,
        last_reminder: "Hier à 15h30",
        status: "PENDING_UPLOAD",
      },
      {
        id: 103,
        credit_request_id: 5,
        document_type: "ENGAGEMENT_CAUTION_SOLIDAIRE",
        expected_doc_name: "Engagement Caution Solidaire",
        full_doc_name: "Attestation d'Engagement Caution Maître Artisan",
        short_motif: "Signature physique requise",
        reason:
          "Signature physique requise pour validation Cold Start au dossier d'octroi.",
        severity: "INFO",
        reminders_sent: 1,
        last_reminder: "Ce matin à 09h00",
        status: "PENDING_UPLOAD",
      },
      {
        id: 104,
        credit_request_id: 2,
        document_type: "ATTESTATION_NON_REDEVANCE",
        expected_doc_name: "Quittance Électricité EDM-SA / Usine",
        full_doc_name: "Quittance EDM-SA / Électricité Usine Bamako (Badalabougou)",
        short_motif: "Compteur pro non justifié",
        reason:
          "Justificatif d'implantation du broyeur semi-industriel et compteur professionnel.",
        severity: "WARNING",
        reminders_sent: 0,
        last_reminder: "Jamais relancé",
        status: "PENDING_UPLOAD",
      },
    ];

    const missingKpi = document.getElementById("comp-kpi-missing");
    const remindersKpi = document.getElementById("comp-kpi-reminders");
    if (missingKpi) missingKpi.textContent = items.length;
    if (remindersKpi)
      remindersKpi.textContent =
        items.reduce((sum, i) => sum + i.reminders_sent, 0) + 4;

    tbody.innerHTML = items
      .map((item) => {
        const req = requests.find((r) => r.id == item.credit_request_id) || {};
        const clientName = req.client_name || "Client Emprunteur";
        const reqNumber = req.request_number || "REQ-2026-0000";

        return `
        <tr class="schedule-table-row" onclick="App.openComplementsDrawer(${item.id})">
          <td>
            <strong style="color: var(--primary-600); font-family: var(--font-mono);">${reqNumber}</strong>
            <div style="font-size: 0.8rem; font-weight: 600; color: var(--text-primary); margin-top: 2px;">${clientName}</div>
            <div style="font-size: 0.72rem; color: var(--text-subtle);">${req.city || "Bamako"}, ${req.country || "Mali"}</div>
          </td>
          <td>
            <div style="font-weight: 700; font-size: 0.82rem; color: var(--text-primary); max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              <i class="fas fa-file-lines text-primary mr-1"></i> ${item.expected_doc_name}
            </div>
            <div style="font-size: 0.72rem; color: ${item.severity === "CRITICAL" ? "#b91c1c" : item.severity === "WARNING" ? "#b45309" : "var(--text-muted)"}; font-weight: 600; margin-top: 3px; display: flex; align-items: center; gap: 4px;">
              <i class="fas ${item.severity === "CRITICAL" ? "fa-ban text-danger" : "fa-triangle-exclamation text-warning"}"></i>
              <span style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.short_motif}</span>
            </div>
          </td>
          <td>
            <span style="font-size: 0.78rem; font-weight: 600; color: var(--text-primary);">${item.last_reminder}</span>
            <div style="font-size: 0.7rem; color: var(--text-subtle);">${item.reminders_sent} relance${item.reminders_sent > 1 ? "s" : ""} transmise${item.reminders_sent > 1 ? "s" : ""}</div>
          </td>
          <td>
            <div style="display: flex; flex-direction: column; gap: 4px; align-items: flex-start;">
              <span class="badge ${item.status === "ANOMALY_OPEN" ? "badge-rejected" : "badge-verification"}" style="font-size: 0.68rem; padding: 2px 6px;">
                ${item.status === "ANOMALY_OPEN" ? "Anomalie Rejet" : "En Attente"}
              </span>
              <span class="badge ${item.severity === "CRITICAL" ? "badge-danger" : "badge-warning"}" style="font-size: 0.65rem; padding: 2px 5px;">
                ${item.severity === "CRITICAL" ? "Bloquant" : "Requis"}
              </span>
            </div>
          </td>
          <td style="text-align: right;">
            <div style="display: flex; gap: 0.35rem; justify-content: flex-end; align-items: center;">
              <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); App.openComplementsDrawer(${item.id})" title="Voir les détails complets en volet latéral">
                <i class="fas fa-eye text-primary"></i> Détails
              </button>
              <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); App.triggerDocReminder(${item.id}, '${clientName.replace(/'/g, "\\'")}', '${(item.full_doc_name || item.expected_doc_name).replace(/'/g, "\\'")}')" title="Envoyer une relance par SMS/WhatsApp">
                <i class="fas fa-paper-plane"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
      })
      .join("");
  },

  currentComplementDrawerId: null,

  openComplementsDrawer(itemId) {
    const items = [
      {
        id: 101,
        credit_request_id: 3,
        document_type: "FACTURE_PROFORMA_ACTUALISEE",
        expected_doc_name:
          "Nouvelle Facture Proforma Quincaillerie (< 30 jours)",
        reason:
          "Date OCR antérieure de 18 mois (12/01/2025). Écart de montant de 600 000 F constaté par rapport au plan de financement.",
        severity: "CRITICAL",
        reminders_sent: 2,
        last_reminder: "Il y a 2 jours",
        status: "ANOMALY_OPEN",
      },
      {
        id: 102,
        credit_request_id: 3,
        document_type: "CNI_RECTO_VERSO",
        expected_doc_name: "Carte Nationale d'Identité (Recto/Verso Certifié)",
        reason:
          "Document illisible / flou sur la date de validité et numéro NINA/CNI.",
        severity: "WARNING",
        reminders_sent: 1,
        last_reminder: "Hier à 15h30",
        status: "PENDING_UPLOAD",
      },
      {
        id: 103,
        credit_request_id: 5,
        document_type: "ENGAGEMENT_CAUTION_SOLIDAIRE",
        expected_doc_name: "Attestation d'Engagement Caution Maître Artisan",
        reason:
          "Signature physique requise pour validation Cold Start au dossier d'octroi.",
        severity: "INFO",
        reminders_sent: 1,
        last_reminder: "Ce matin à 09h00",
        status: "PENDING_UPLOAD",
      },
      {
        id: 104,
        credit_request_id: 2,
        document_type: "ATTESTATION_NON_REDEVANCE",
        expected_doc_name: "Quittance EDM-SA / Électricité Usine Bamako (Badalabougou)",
        reason:
          "Justificatif d'implantation du broyeur semi-industriel et compteur professionnel.",
        severity: "WARNING",
        reminders_sent: 0,
        last_reminder: "Jamais relancé",
        status: "PENDING_UPLOAD",
      },
    ];

    const item =
      items.find((i) => i.id == this.resolveComplementId(itemId)) || items[0];
    this.currentComplementDrawerId = item.id;

    const req = DB.findById("credit_requests", item.credit_request_id) || {};
    const client = DB.findById("clients", req.client_id) || {};

    const backdrop = document.getElementById("complements-drawer-backdrop");
    const drawer = document.getElementById("complements-sidedrawer");
    if (!drawer) return;

    // Badges & Headers
    const sevBadge = document.getElementById("comp-drawer-severity-badge");
    const statBadge = document.getElementById("comp-drawer-status-badge");
    const titleEl = document.getElementById("comp-drawer-title");
    const subtitleEl = document.getElementById("comp-drawer-subtitle");

    if (sevBadge) {
      sevBadge.className =
        item.severity === "CRITICAL"
          ? "badge badge-rejected"
          : "badge badge-warning";
      sevBadge.innerHTML =
        item.severity === "CRITICAL"
          ? '<i class="fas fa-ban"></i> Bloquant Comité'
          : '<i class="fas fa-triangle-exclamation"></i> Action Requise';
    }
    if (statBadge) {
      statBadge.className =
        item.status === "ANOMALY_OPEN"
          ? "badge badge-rejected"
          : "badge badge-submitted";
      statBadge.textContent =
        item.status === "ANOMALY_OPEN" ? "Anomalie Rejetée" : "En Attente GED";
    }
    if (titleEl)
      titleEl.textContent = `Pièce Requise • ${req.request_number || "REQ-2026-0891"}`;
    if (subtitleEl)
      subtitleEl.textContent = `${client.name || req.client_name || "Client Emprunteur"} • ${req.city || "Bamako"}`;

    // Section 1: Client
    const reqNumEl = document.getElementById("comp-drawer-req-num");
    const clientAvatar = document.getElementById("comp-drawer-client-avatar");
    const clientName = document.getElementById("comp-drawer-client-name");
    const clientLoc = document.getElementById("comp-drawer-client-loc");
    const clientPhone = document.getElementById("comp-drawer-client-phone");
    const loanAmt = document.getElementById("comp-drawer-loan-amount");

    if (reqNumEl) reqNumEl.textContent = req.request_number || "REQ-2026-0891";
    if (clientAvatar)
      clientAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(req.client_name || client.name || "Client")}&background=4f46e5&color=fff`;
    if (clientName)
      clientName.textContent = req.client_name || client.name || "Fatou Ndiaye";
    if (clientLoc)
      clientLoc.innerHTML = `<i class="fas fa-location-dot text-primary mr-1"></i> ${req.city || client.city || "Bamako"}, ${req.country || "Mali"}`;
    if (clientPhone)
      clientPhone.textContent = client.phone || "+223 77 45 67 89";
    if (loanAmt)
      loanAmt.textContent = CreditScoringEngine.formatFCFA(
        req.requested_amount || 2500000,
      );

    // Section 2: Document & Motif
    const docTypeEl = document.getElementById("comp-drawer-doc-type");
    const docNameEl = document.getElementById("comp-drawer-doc-name");
    const reasonEl = document.getElementById("comp-drawer-reason");

    if (docTypeEl) docTypeEl.textContent = item.document_type;
    if (docNameEl) docNameEl.textContent = item.expected_doc_name;
    if (reasonEl) reasonEl.textContent = item.reason;

    // Section 3: Reminders
    const remCountEl = document.getElementById("comp-drawer-reminders-count");
    if (remCountEl)
      remCountEl.textContent = `${item.reminders_sent} relance${item.reminders_sent > 1 ? "s" : ""} envoyée${item.reminders_sent > 1 ? "s" : ""}`;

    if (backdrop) backdrop.classList.add("active");
  },

  closeComplementsDrawer() {
    const backdrop = document.getElementById("complements-drawer-backdrop");
    if (backdrop) backdrop.classList.remove("active");
  },

  triggerReminderFromDrawer() {
    if (!this.currentComplementDrawerId) return;
    const clientName =
      document.getElementById("comp-drawer-client-name")?.textContent ||
      "l'emprunteur";
    const docName =
      document.getElementById("comp-drawer-doc-name")?.textContent ||
      "le document attendu";
    this.triggerDocReminder(
      this.currentComplementDrawerId,
      clientName,
      docName,
    );
  },

  markDocReceivedFromDrawer() {
    if (!this.currentComplementDrawerId) return;
    this.markDocReceived(this.currentComplementDrawerId);
    this.closeComplementsDrawer();
  },

  triggerDrawerFileUpload() {
    this.showToast(
      "Scanner de document initié : analyse OCR et vérification de conformité en cours...",
      "info",
    );
    setTimeout(() => {
      if (this.currentComplementDrawerId) {
        this.markDocReceived(this.currentComplementDrawerId);
        this.closeComplementsDrawer();
      }
    }, 1200);
  },

  triggerDocReminder(docId, clientName, docName) {
    this.showToast(
      `Relance SMS & WhatsApp transmise avec succès à ${clientName} pour : « ${docName} »`,
      "success",
    );
  },

  triggerBulkSmsReminder() {
    this.showToast(
      "Campagne de relance groupée déclenchée : 4 SMS et notifications WhatsApp envoyés aux emprunteurs",
      "success",
    );
    const remindersKpi = document.getElementById("comp-kpi-reminders");
    if (remindersKpi) {
      remindersKpi.textContent = Number(remindersKpi.textContent || 8) + 4;
    }
  },

  markDocReceived(docId) {
    DB.insert("documents", {
      credit_request_id: 3,
      document_type: "PIECE_COMPLEMENTAIRE_REGULARISEE",
      original_filename: `Piece_Regularisee_${docId}.pdf`,
      file_path: "assets/docs/regularisee.pdf",
      mime_type: "application/pdf",
      uploaded_by: 2,
      uploaded_at: new Date().toISOString(),
      status: "VALIDATED",
    });

    DB.addAuditLog(
      2,
      "DOCUMENT_REGULARISE_AGENT",
      "documents",
      docId,
      `Pièce complémentaire #${docId} validée et rattachée au dossier.`,
    );

    this.showToast(
      "Document enregistré, certifié conforme et intégré à la GED du dossier",
      "success",
    );
    this.renderAgentComplements();
  },

  // [ROLE 3] ANALYSTE RISQUE (SCORING V2 & 360°)
  renderAnalystDashboard() {
    AppCharts.setupDefaults();
    AppCharts.renderEvolutionChart("evolution-chart-canvas", "year");
    AppCharts.renderRiskDoughnut("risk-doughnut-canvas");
    AppCharts.renderRegionalChart("regional-chart-canvas");
    AppInteractions.renderRequestsTable();
  },

  // Sidedrawer Volet Latéral : Instruction & Analyse Risque 360°
  currentAnalystDrawerId: null,
  activeAnalystColdStartOverride: null,

  openAnalystDossierDrawer(dossierId, coldStartOverride = null) {
    const req = this.resolveCreditRequest(dossierId);
    if (!req) return;

    this.currentAnalystDrawerId = req.id;
    if (coldStartOverride !== null) {
      this.activeAnalystColdStartOverride = coldStartOverride;
    }

    const evalData =
      CreditScoringEngine.evaluateDossier(
        req.id,
        this.activeAnalystColdStartOverride,
      ) || {};
    const client = DB.findById("clients", req.client_id) || {};
    const docs = DB.get("documents").filter(
      (d) => d.credit_request_id == req.id,
    );
    const anomalies = DB.get("anomalies").filter(
      (a) => a.credit_request_id == req.id,
    );

    const backdrop = document.getElementById("analyst-drawer-backdrop");
    if (!backdrop) return;

    // Badges & Header
    const refBadge = document.getElementById("analyst-drawer-ref-badge");
    const modelBadge = document.getElementById("analyst-drawer-model-badge");
    const statusBadge = document.getElementById("analyst-drawer-status-badge");
    const titleEl = document.getElementById("analyst-drawer-title");
    const subtitleEl = document.getElementById("analyst-drawer-subtitle");
    const toggleBtn = document.getElementById("analyst-drawer-toggle-coldstart");

    if (refBadge)
      refBadge.textContent = req.request_number || `REQ-2026-${req.id}`;
    if (titleEl)
      titleEl.textContent = req.client_name || client.name || "Emprunteur";
    if (subtitleEl) {
      subtitleEl.textContent = `Fiche d'Instruction Analytique 360° • Bamako (${req.city || "Grand Marché"}), Mali`;
    }

    if (modelBadge) {
      if (evalData.isColdStart) {
        modelBadge.className = "badge badge-warning";
        modelBadge.innerHTML = `<i class="fas fa-seedling"></i> Mode Cold Start`;
      } else {
        modelBadge.className = "badge badge-submitted";
        modelBadge.innerHTML = `<i class="fas fa-history"></i> Modèle Standard`;
      }
    }

    if (statusBadge) {
      statusBadge.className = `badge ${
        req.status === "APPROVED"
          ? "badge-approved"
          : req.status === "REJECTED"
            ? "badge-rejected"
            : "badge-submitted"
      }`;
      statusBadge.textContent =
        req.status === "ANALYSIS"
          ? "En Analyse"
          : req.status === "COMMITTEE"
            ? "En Comité"
            : req.status === "VERIFICATION_REQUIRED"
              ? "Vérif. Requise"
              : req.status || "En Cours";
    }

    if (toggleBtn) {
      toggleBtn.innerHTML = evalData.isColdStart
        ? `<i class="fas fa-history text-primary"></i> Passer en Standard`
        : `<i class="fas fa-seedling text-emerald"></i> Simuler Cold Start`;
    }

    // Hero Score
    const scoreValEl = document.getElementById("analyst-drawer-score-val");
    const riskTagEl = document.getElementById("analyst-drawer-risk-tag");
    const confEl = document.getElementById("analyst-drawer-confidence");

    if (scoreValEl) {
      scoreValEl.textContent = evalData.overallScore || req.score || 70;
      scoreValEl.style.color = evalData.riskColor || "var(--primary-700)";
    }
    if (riskTagEl) {
      const riskClass =
        evalData.riskLevel === "CRITIQUE"
          ? "badge-rejected"
          : evalData.riskLevel === "ELEVE"
            ? "badge-warning"
            : "badge-approved";
      riskTagEl.className = `badge ${riskClass}`;
      riskTagEl.innerHTML = `<i class="fas fa-shield-halved mr-1"></i> ${
        evalData.riskLevel === "FAIBLE"
          ? "Risque Faible"
          : evalData.riskLevel === "MODERE"
            ? "Risque Modéré"
            : evalData.riskLevel || "Faible"
      }`;
    }
    if (confEl) {
      confEl.innerHTML = `Indice de Confiance : <strong class="text-emerald">${
        evalData.confidenceScore || 90
      }%</strong>`;
    }

    // Section 1 : Emprunteur & Capacité
    const clientIdEl = document.getElementById("analyst-drawer-client-id");
    const avatarEl = document.getElementById("analyst-drawer-client-avatar");
    const clientNameEl = document.getElementById("analyst-drawer-client-name");
    const clientActEl = document.getElementById(
      "analyst-drawer-client-activity",
    );
    const clientLocEl = document.getElementById("analyst-drawer-client-loc");
    const incomeEl = document.getElementById("analyst-drawer-income");
    const expensesEl = document.getElementById("analyst-drawer-expenses");
    const disposableEl = document.getElementById("analyst-drawer-disposable");
    const installmentEl = document.getElementById("analyst-drawer-installment");
    const capBannerEl = document.getElementById("analyst-drawer-cap-banner");

    if (clientIdEl)
      clientIdEl.textContent =
        client.client_number || `ML-BKO-00${req.client_id || 1}00`;
    if (avatarEl) {
      avatarEl.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
        req.client_name,
      )}&background=4f46e5&color=fff`;
    }
    if (clientNameEl) clientNameEl.textContent = req.client_name;
    if (clientActEl)
      clientActEl.textContent = `${
        client.occupation || client.activity || req.activity || "Commerçante / Grossiste"
      } • ${client.seniority_years || 5} ans d'activité`;
    if (clientLocEl) {
      clientLocEl.innerHTML = `<i class="fas fa-location-dot text-primary mr-1"></i> Bamako (${
        req.city || "Grand Marché"
      }), Mali • Agence Régionale`;
    }

    const income = evalData.capacity?.totalIncome || 800000;
    const expenses = evalData.capacity?.totalExpenses || 380000;
    const disposable =
      evalData.capacity?.disposableIncome || income - expenses;
    const installment =
      evalData.capacity?.monthlyInstallment ||
      Math.round(
        (req.requested_amount * 1.095) / (req.duration_months || 12),
      );
    const isSufficient = disposable >= installment;

    if (incomeEl) incomeEl.textContent = CreditScoringEngine.formatFCFA(income);
    if (expensesEl)
      expensesEl.textContent = CreditScoringEngine.formatFCFA(expenses);
    if (disposableEl) {
      disposableEl.textContent = CreditScoringEngine.formatFCFA(disposable);
      disposableEl.style.color = isSufficient ? "#059669" : "#dc2626";
    }
    if (installmentEl)
      installmentEl.textContent = CreditScoringEngine.formatFCFA(installment);

    if (capBannerEl) {
      capBannerEl.className = `capacity-comparison ${isSufficient ? "pass" : "fail"}`;
      capBannerEl.innerHTML = isSufficient
        ? `<i class="fas fa-circle-check text-emerald mr-1"></i> <strong>Capacité Nette Validée :</strong> Le reste à vivre (${CreditScoringEngine.formatFCFA(
            disposable,
          )}) couvre <strong>${Math.round(
            (disposable / installment) * 100,
          )}%</strong> de la mensualité (${CreditScoringEngine.formatFCFA(
            installment,
          )}).`
        : `<i class="fas fa-circle-xmark text-danger mr-1"></i> <strong>Alerte Capacité :</strong> Le reste à vivre (${CreditScoringEngine.formatFCFA(
            disposable,
          )}) est insuffisant pour honorer la mensualité (${CreditScoringEngine.formatFCFA(
            installment,
          )}).`;
    }

    // Section 2 : Documents GED & OCR
    const docsCountEl = document.getElementById("analyst-drawer-docs-count");
    const docsListEl = document.getElementById("analyst-drawer-docs-list");
    if (docsCountEl)
      docsCountEl.textContent = `${docs.length} document${
        docs.length > 1 ? "s" : ""
      }`;
    if (docsListEl) {
      if (docs.length === 0) {
        docsListEl.innerHTML = `<div style="font-size: 0.75rem; color: var(--text-muted); text-align: center; padding: 0.5rem;">Aucune pièce rattachée</div>`;
      } else {
        docsListEl.innerHTML = docs
          .map(
            (d) => `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.5rem 0.65rem; background: var(--bg-surface-secondary); border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <i class="fas ${
                d.doc_type === "NINA"
                  ? "fa-id-card text-primary"
                  : d.doc_type === "RCCM"
                    ? "fa-building text-info"
                    : d.doc_type === "FACTURE"
                      ? "fa-file-invoice text-emerald"
                      : "fa-file-lines text-warning"
              }"></i>
              <div>
                <div style="font-weight: 700; font-size: 0.78rem; color: var(--text-primary);">${
                  d.doc_name || d.name || d.doc_type
                }</div>
                <div style="font-size: 0.68rem; color: var(--text-muted);">Score OCR : <strong class="text-emerald">${
                  d.ocr_confidence || 98
                }%</strong> • Certifié Conforme</div>
              </div>
            </div>
            <span class="badge ${
              d.status === "VERIFIED" ? "badge-approved" : "badge-submitted"
            }" style="font-size: 0.65rem;">
              <i class="fas ${
                d.status === "VERIFIED" ? "fa-check" : "fa-clock"
              } mr-1"></i> ${d.status === "VERIFIED" ? "Validé" : "En révision"}
            </span>
          </div>
        `,
          )
          .join("");
      }
    }

    // Section 3 : Signaux & Anomalies
    const anomCountEl = document.getElementById("analyst-drawer-anom-count");
    const anomListEl = document.getElementById("analyst-drawer-anomalies-list");
    if (anomCountEl) {
      anomCountEl.textContent = `${anomalies.length} alerte${
        anomalies.length > 1 ? "s" : ""
      }`;
      anomCountEl.className = `badge ${
        anomalies.length > 0 ? "badge-warning" : "badge-approved"
      }`;
    }
    if (anomListEl) {
      if (anomalies.length === 0) {
        anomListEl.innerHTML = `<div style="font-size: 0.75rem; color: #059669; background: rgba(16, 185, 129, 0.08); padding: 0.5rem 0.75rem; border-radius: var(--radius-sm); border: 1px solid rgba(16, 185, 129, 0.2);"><i class="fas fa-check-circle mr-1"></i> Aucun signal d'anomalie ou risque de fraude détecté.</div>`;
      } else {
        anomListEl.innerHTML = anomalies
          .map(
            (a) => `
          <div style="padding: 0.5rem 0.65rem; background: rgba(245, 158, 11, 0.08); border-radius: var(--radius-sm); border: 1px solid rgba(245, 158, 11, 0.25);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2px;">
              <strong style="font-size: 0.76rem; color: #b45309;"><i class="fas fa-triangle-exclamation mr-1"></i> ${
                a.anomaly_type || "Contrôle automatique"
              }</strong>
              <span class="badge ${
                a.severity === "HIGH" ? "badge-rejected" : "badge-warning"
              }" style="font-size: 0.65rem;">${a.severity || "Moyen"}</span>
            </div>
            <p style="font-size: 0.72rem; color: var(--text-primary); margin: 0; line-height: 1.35;">${
              a.description || "Vérification requise sur cette pièce."
            }</p>
          </div>
        `,
          )
          .join("");
      }
    }

    // Section 4 : Explicabilité Multi-Facteurs
    const factorsListEl = document.getElementById(
      "analyst-drawer-factors-list",
    );
    if (factorsListEl) {
      const factors = evalData.factors || [
        {
          name: "Capacité Financière & Reste à Vivre",
          score: isSufficient ? 92 : 45,
          weight: 35,
          desc: "Revenus déclarés et flux d'activité stables sur le marché de Bamako.",
        },
        {
          name: "Stabilité d'Activité & Ancienneté",
          score: 88,
          weight: 25,
          desc: "Implantation commerciale pérenne (> 5 ans dans la commune).",
        },
        {
          name: "Qualité des Garanties Proposées",
          score: 85,
          weight: 20,
          desc: "Stock gagé et caution solidaire d'artisan certifiée.",
        },
        {
          name: "Fiabilité & Extraction OCR GED",
          score: 96,
          weight: 10,
          desc: "Concordance parfaite des données NINA et quittance EDM.",
        },
        {
          name: "Historique & Relations Bancaires",
          score: evalData.isColdStart ? 80 : 90,
          weight: 10,
          desc: evalData.isColdStart
            ? "Primo-demandeur : scoring enrichi sur comportement mobile money."
            : "Aucun impayé antérieur enregistré.",
        },
      ];

      factorsListEl.innerHTML = factors
        .map(
          (f) => `
        <div style="background: var(--bg-surface-secondary); padding: 0.55rem 0.75rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px;">
            <span style="font-weight: 700; font-size: 0.78rem; color: var(--text-primary);">${
              f.name
            }</span>
            <span style="font-family: var(--font-family-code); font-weight: 800; font-size: 0.82rem; color: ${
              f.score >= 70
                ? "#059669"
                : f.score >= 50
                  ? "#d97706"
                  : "#dc2626"
            };">${f.score}/100</span>
          </div>
          <div style="font-size: 0.7rem; color: var(--text-muted); line-height: 1.3;">${
            f.desc
          }</div>
        </div>
      `,
        )
        .join("");
    }

    // Open Backdrop
    backdrop.classList.add("active");
  },

  closeAnalystDossierDrawer() {
    const backdrop = document.getElementById("analyst-drawer-backdrop");
    if (backdrop) backdrop.classList.remove("active");
  },

  toggleColdStartInDrawer() {
    if (!this.currentAnalystDrawerId) return;
    const current = this.activeAnalystColdStartOverride;
    const next = current === null ? true : !current;
    this.openAnalystDossierDrawer(this.currentAnalystDrawerId, next);
    this.showToast(
      `Simulation basculée en mode ${next ? "COLD START (Primo-Demandeur)" : "STANDARD"}`,
      "info",
    );
  },

  submitAnalystReviewFromDrawer() {
    if (!this.currentAnalystDrawerId) return;
    const recoSelect = document.getElementById("analyst-drawer-reco-select");
    const notesInput = document.getElementById("analyst-drawer-notes-input");
    const reco = recoSelect ? recoSelect.value : "FAVORABLE";
    const notes = notesInput
      ? notesInput.value
      : "Dossier vérifié et transmis.";

    DB.insert("credit_reviews", {
      credit_request_id: this.currentAnalystDrawerId,
      analyst_id: 1,
      review_status:
        reco === "FAVORABLE"
          ? "CONFORME"
          : reco === "RESERVE"
            ? "AVEC_RESERVE"
            : "NON_CONFORME",
      analyst_decision: reco,
      comments: notes,
      created_at: new Date().toISOString(),
    });

    DB.update("credit_requests", this.currentAnalystDrawerId, {
      status: "COMMITTEE",
    });

    this.showToast(
      `Dossier #${this.currentAnalystDrawerId} transmis avec succès au Comité de Crédit !`,
      "success",
    );
    this.closeAnalystDossierDrawer();
    AppInteractions.renderRequestsTable();
  },

  requestComplementFromAnalystDrawer() {
    if (!this.currentAnalystDrawerId) return;
    this.showToast(
      `Demande de contre-expertise terrain transmise à l'Agent de Crédit pour le dossier #${this.currentAnalystDrawerId}`,
      "info",
    );
    this.closeAnalystDossierDrawer();
  },

  // [ROLE 3 - PAGE 2] DÉTECTION DES ANOMALIES & CONTRÔLES RISQUES
  analystAnomFilter: "ALL",
  analystAnomSearch: "",

  renderAnalystAnomalies() {
    const tbody = document.getElementById("analyst-anomalies-table-body");
    const anomalies = DB.get("anomalies");
    const requests = DB.get("credit_requests");
    const clients = DB.get("clients");

    // Enrich anomaly items
    const enriched = anomalies.map((a) => {
      const req = requests.find((r) => r.id === a.credit_request_id) || {};
      const client = clients.find((c) => c.id === req.client_id) || {};
      const anomType = String(a.anomaly_type || "");
      const isOcr = anomType.includes("OCR") || Boolean(a.document_id);
      const isNetwork =
        anomType.includes("MULTI") || anomType.includes("CAUTION");
      return {
        ...a,
        request_number:
          req.request_number || `REQ-2026-000${a.credit_request_id || 1}`,
        client_name: req.client_name || "Client CreditFast",
        country: req.country || "Mali",
        city: req.city || "Bamako",
        category:
          a.category || (isOcr ? "OCR" : isNetwork ? "NETWORK" : "FINANCIAL"),
        rule_name:
          a.rule_name || a.anomaly_type || "Règle de Contrôle Automatisé",
        engine:
          a.engine ||
          (a.document_id
            ? "Moteur OCR Tesseract V2.2"
            : "Calculateur Risque & Solvabilité V2"),
      };
    });

    // Update KPI counters
    const totalActive = enriched.filter((a) => a.status === "OPEN").length;
    const critCount = enriched.filter(
      (a) => a.status === "OPEN" && a.severity === "CRITICAL",
    ).length;
    const ocrCount = enriched.filter(
      (a) => a.status === "OPEN" && a.category === "OCR",
    ).length;
    const finCount = enriched.filter(
      (a) => a.status === "OPEN" && a.category === "FINANCIAL",
    ).length;
    const multiCount = enriched.filter(
      (a) => a.status === "OPEN" && a.category === "NETWORK",
    ).length;

    const kpiTotal = document.getElementById("anom-kpi-total");
    const kpiOcr = document.getElementById("anom-kpi-ocr");
    const kpiFin = document.getElementById("anom-kpi-fin");
    const kpiMulti = document.getElementById("anom-kpi-multi");
    const countAll = document.getElementById("anom-count-all");
    const countCrit = document.getElementById("anom-count-crit");

    if (kpiTotal) kpiTotal.textContent = totalActive;
    if (kpiOcr) kpiOcr.textContent = ocrCount;
    if (kpiFin) kpiFin.textContent = finCount;
    if (kpiMulti) kpiMulti.textContent = multiCount;
    if (countAll) countAll.textContent = enriched.length;
    if (countCrit) countCrit.textContent = critCount;

    // Render Centerpiece Circular Chart.js Chart
    if (
      window.AppCharts &&
      typeof window.AppCharts.renderAnomaliesDonut === "function"
    ) {
      window.AppCharts.renderAnomaliesDonut("anomalies-distribution-chart", {
        critical: critCount,
        ocr: ocrCount,
        financial: finCount,
        network: multiCount,
        total: totalActive,
      });
    }

    if (!tbody) return;

    // Apply Filter
    let filtered = [...enriched];
    if (this.analystAnomFilter === "CRITICAL") {
      filtered = filtered.filter((a) => a.severity === "CRITICAL");
    } else if (this.analystAnomFilter === "OCR") {
      filtered = filtered.filter((a) => a.category === "OCR");
    } else if (this.analystAnomFilter === "FINANCIAL") {
      filtered = filtered.filter((a) => a.category === "FINANCIAL");
    } else if (this.analystAnomFilter === "NETWORK") {
      filtered = filtered.filter((a) => a.category === "NETWORK");
    } else if (this.analystAnomFilter === "RESOLVED") {
      filtered = filtered.filter((a) => a.status === "RESOLVED");
    }

    // Apply Search
    if (this.analystAnomSearch) {
      const q = this.analystAnomSearch.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          (a.request_number && a.request_number.toLowerCase().includes(q)) ||
          (a.client_name && a.client_name.toLowerCase().includes(q)) ||
          (a.description && a.description.toLowerCase().includes(q)) ||
          (a.rule_name && a.rule_name.toLowerCase().includes(q)) ||
          (a.city && a.city.toLowerCase().includes(q)) ||
          (a.country && a.country.toLowerCase().includes(q)),
      );
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 2.5rem; color: var(--text-subtle);">
            <i class="fas fa-shield-check" style="font-size: 2rem; color: var(--cif-emerald-500); margin-bottom: 0.75rem; display: block;"></i>
            <div style="font-weight: 600; font-size: 0.95rem; color: var(--text-primary);">Aucune anomalie ne correspond aux critères</div>
            <div style="font-size: 0.8rem; margin-top: 0.25rem;">Tous les dossiers sous ces critères sont intègres ou déjà traités.</div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered
      .map((item) => {
        const isCritical = item.severity === "CRITICAL";
        const isWarning = item.severity === "WARNING";
        const isOpen = item.status === "OPEN";

        const sevBadge = isCritical
          ? `<span class="badge badge-rejected" style="font-weight: 700;"><i class="fas fa-circle-exclamation mr-1"></i> Critique</span>`
          : isWarning
            ? `<span class="badge badge-warning"><i class="fas fa-triangle-exclamation mr-1"></i> Élevé</span>`
            : `<span class="badge badge-submitted"><i class="fas fa-info-circle mr-1"></i> Informatif</span>`;

        const statusBadge = isOpen
          ? `<span class="badge badge-verification"><i class="fas fa-clock mr-1"></i> Ouvert</span>`
          : `<span class="badge badge-approved"><i class="fas fa-check mr-1"></i> Résolu</span>`;

        const typeIcon =
          item.category === "OCR"
            ? "fa-file-lines text-primary"
            : item.category === "NETWORK"
              ? "fa-network-wired text-purple"
              : "fa-calculator text-warning";

        return `
        <tr id="anomaly-row-${item.id}" class="schedule-table-row ${!isOpen ? "anomaly-row-resolved" : ""}" onclick="App.openAnomalyDrawer(${item.id})" style="cursor: pointer;" title="Cliquer pour afficher le diagnostic approfondi dans le volet latéral">
          <!-- Col 1 : Dossier & Emprunteur (Essentiel sans sous-texte) -->
          <td>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span style="font-weight: 700; font-size: 0.88rem; color: var(--text-primary);">${item.client_name}</span>
              <span class="badge badge-submitted" style="font-family: var(--font-family-code); font-weight: 700; font-size: 0.68rem;">${item.request_number}</span>
            </div>
          </td>

          <!-- Col 2 : Anomalie & Règle (Essentiel sans sous-texte) -->
          <td>
            <div style="font-weight: 600; font-size: 0.84rem; color: var(--text-primary);">
              <i class="fas ${typeIcon} mr-1"></i> ${item.rule_name}
            </div>
          </td>

          <!-- Col 3 : Gravité (Essentiel sans sous-texte) -->
          <td>${sevBadge}</td>

          <!-- Col 4 : Statut (Essentiel sans sous-texte) -->
          <td>${statusBadge}</td>

          <!-- Col 5 : Action -->
          <td style="text-align: right;">
            <div style="display: flex; gap: 0.35rem; justify-content: flex-end; align-items: center;">
              <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); App.openAnomalyDrawer(${item.id})" title="Ouvrir le volet latéral de diagnostic">
                <i class="fas fa-magnifying-glass-chart mr-1"></i> Détails
              </button>
              ${
                isOpen
                  ? `
                <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); App.resolveAnomaly(${item.id})" title="Lever cette anomalie après vérification">
                  <i class="fas fa-check text-emerald"></i> Lever
                </button>
              `
                  : `
                <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); App.reopenAnomaly(${item.id})" title="Rouvrir le signalement">
                  <i class="fas fa-rotate text-muted"></i>
                </button>
              `
              }
            </div>
          </td>
        </tr>
      `;
      })
      .join("");
  },

  filterAnalystAnomalies(category, btn) {
    this.analystAnomFilter = category;
    if (btn) {
      const container = document.getElementById("anom-filter-buttons");
      if (container) {
        container.querySelectorAll("button").forEach((b) => {
          b.classList.remove("btn-primary");
          if (!b.classList.contains("btn-secondary"))
            b.classList.add("btn-secondary");
        });
        btn.classList.remove("btn-secondary");
        btn.classList.add("btn-primary");
      }
    }
    this.renderAnalystAnomalies();
  },

  searchAnalystAnomalies(query) {
    this.analystAnomSearch = query;
    this.renderAnalystAnomalies();
  },

  resolveAnomaly(anomalyId) {
    const a = DB.findById("anomalies", anomalyId);
    if (!a) return;

    const row = document.getElementById(`anomaly-row-${anomalyId}`);
    if (row) {
      row.classList.add("resolving");
      // Déclenche l'animation de transition en fondu sortant
      setTimeout(() => {
        row.classList.add("resolving-fade-out");
      }, 40);
    }

    setTimeout(() => {
      DB.update("anomalies", anomalyId, {
        status: "RESOLVED",
        resolved_by: this.currentUser ? this.currentUser.id : 1,
        resolved_at: new Date().toISOString(),
        resolution_comment:
          "Anomalie contrôlée et levée par l'analyste risque après revue contradictoire.",
      });

      DB.addAuditLog(
        this.currentUser ? this.currentUser.id : 1,
        "ANOMALIE_LEVEE_ANALYSTE",
        "anomalies",
        anomalyId,
        `Anomalie #${anomalyId} (${a.anomaly_type}) levée avec succès.`,
      );

      this.showToast(
        `Anomalie #${anomalyId} levée avec succès. Dossier réévalué.`,
        "success",
      );
      this.renderAnalystAnomalies();

      // Effet lumineux sur la ligne mise à jour si toujours présente
      const updatedRow = document.getElementById(`anomaly-row-${anomalyId}`);
      if (updatedRow) {
        updatedRow.classList.add("resolved-flash");
      }
    }, 450);
  },

  reopenAnomaly(anomalyId) {
    const row = document.getElementById(`anomaly-row-${anomalyId}`);
    if (row) {
      row.classList.add("resolving");
    }

    setTimeout(() => {
      DB.update("anomalies", anomalyId, {
        status: "OPEN",
        resolved_by: null,
        resolved_at: null,
        resolution_comment: null,
      });

      this.showToast(
        `Anomalie #${anomalyId} rouverte pour surveillance active.`,
        "info",
      );
      this.renderAnalystAnomalies();

      const updatedRow = document.getElementById(`anomaly-row-${anomalyId}`);
      if (updatedRow) {
        updatedRow.classList.add("resolved-flash");
      }
    }, 200);
  },

  currentAnomalyDrawerId: null,

  openAnomalyDrawer(anomalyId) {
    const resolvedId = this.resolveAnomalyId(anomalyId);
    this.currentAnomalyDrawerId = resolvedId;
    const a = DB.findById("anomalies", resolvedId);
    if (!a) return;

    const req = DB.findById("credit_requests", a.credit_request_id) || {};
    const client = DB.findById("clients", req.client_id) || {};
    const doc = a.document_id ? DB.findById("documents", a.document_id) : null;
    const evalData = CreditScoringEngine.evaluateDossier(req.id) || {};

    const backdrop = document.getElementById("anomaly-drawer-backdrop");
    if (!backdrop) return;

    const isCritical = a.severity === "CRITICAL";
    const isWarning = a.severity === "WARNING";
    const isOpen = a.status === "OPEN";

    // Header badges & text
    const refBadge = document.getElementById("anom-drawer-ref-badge");
    const sevBadge = document.getElementById("anom-drawer-sev-badge");
    const statusBadge = document.getElementById("anom-drawer-status-badge");
    const titleEl = document.getElementById("anom-drawer-title");
    const subtitleEl = document.getElementById("anom-drawer-subtitle");

    if (refBadge) refBadge.textContent = req.request_number || `REQ-2026-${req.id || "00"}`;
    if (sevBadge) {
      sevBadge.className = `badge ${isCritical ? "badge-rejected" : isWarning ? "badge-warning" : "badge-submitted"}`;
      sevBadge.innerHTML = `<i class="fas ${isCritical ? "fa-circle-exclamation" : isWarning ? "fa-triangle-exclamation" : "fa-info-circle"} mr-1"></i> ${isCritical ? "Critique" : isWarning ? "Élevé" : "Informatif"}`;
    }
    if (statusBadge) {
      statusBadge.className = `badge ${isOpen ? "badge-verification" : "badge-approved"}`;
      statusBadge.innerHTML = `<i class="fas ${isOpen ? "fa-clock" : "fa-check"} mr-1"></i> ${isOpen ? "Ouvert" : "Résolu"}`;
    }
    if (titleEl) titleEl.textContent = a.rule_name || a.anomaly_type || "Anomalie Prudentielle";
    if (subtitleEl) {
      subtitleEl.textContent = `Contrôle de conformité ${a.category || "OCR"} • Règle #${a.id}`;
    }

    // Hero diagnostic banner
    const heroBanner = document.getElementById("anom-drawer-hero-banner");
    const typeName = document.getElementById("anom-drawer-type-name");
    const engineBadge = document.getElementById("anom-drawer-engine-badge");
    const detectedDate = document.getElementById("anom-drawer-detected-date");

    if (heroBanner) {
      heroBanner.style.background = isCritical
        ? "linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(245, 158, 11, 0.05))"
        : isWarning
          ? "linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(245, 158, 11, 0.03))"
          : "linear-gradient(135deg, rgba(79, 70, 229, 0.06), rgba(16, 185, 129, 0.04))";
      heroBanner.style.borderColor = isCritical ? "rgba(239, 68, 68, 0.25)" : "rgba(245, 158, 11, 0.25)";
    }
    if (typeName) {
      typeName.textContent = a.anomaly_type || "ANOMALIE_GENERALE";
      typeName.style.color = isCritical ? "#b91c1c" : isWarning ? "#b45309" : "#4f46e5";
    }
    if (engineBadge) {
      engineBadge.innerHTML = `<i class="fas fa-microchip mr-1"></i> ${a.engine || "Moteur Prudentiel CreditFast"}`;
    }
    if (detectedDate) {
      detectedDate.textContent = a.created_at
        ? `Détecté le ${new Date(a.created_at).toLocaleDateString("fr-FR")} à ${new Date(a.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`
        : "Détecté lors de l'instruction automatique";
    }

    // Section 1: Emprunteur & Demande
    const clientAvatar = document.getElementById("anom-drawer-client-avatar");
    const clientName = document.getElementById("anom-drawer-client-name");
    const clientLoc = document.getElementById("anom-drawer-client-loc");
    const loanAmount = document.getElementById("anom-drawer-loan-amount");
    const riskScore = document.getElementById("anom-drawer-risk-score");

    const clientDisplayName = req.client_name || client.name || "Emprunteur";
    if (clientAvatar) {
      clientAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(clientDisplayName)}&background=4f46e5&color=fff`;
    }
    if (clientName) clientName.textContent = clientDisplayName;
    if (clientLoc) {
      clientLoc.innerHTML = `<i class="fas fa-location-dot text-primary mr-1"></i> Bamako (${req.city || "Grand Marché"}), Mali`;
    }
    if (loanAmount) {
      loanAmount.textContent = CreditScoringEngine.formatFCFA(req.requested_amount || 2500000);
    }
    if (riskScore) {
      const sc = evalData.overallScore || req.score || 70;
      riskScore.textContent = `${sc} / 100`;
      riskScore.style.color = evalData.riskColor || (sc >= 70 ? "#059669" : sc >= 50 ? "#d97706" : "#dc2626");
    }

    // Section 2: Diagnostic & Rapprochement
    const categoryBadge = document.getElementById("anom-drawer-category-badge");
    const descEl = document.getElementById("anom-drawer-desc");
    const valDetected = document.getElementById("anom-drawer-val-detected");
    const valExpected = document.getElementById("anom-drawer-val-expected");

    if (categoryBadge) {
      categoryBadge.textContent =
        a.category === "OCR"
          ? "Contrôle OCR"
          : a.category === "NETWORK"
            ? "Réseau & Multi-Comptes"
            : "Solvabilité & Capacité";
    }
    if (descEl) descEl.textContent = a.description || "Aucune description spécifique disponible.";
    if (valDetected) valDetected.textContent = a.detected_value || "Incohérence constatée";
    if (valExpected) valExpected.textContent = a.expected_value || "Conforme aux normes prudentielles";

    // Section 3: Pièce Justificative GED
    const docPanel = document.getElementById("anom-drawer-doc-panel");
    const docOcrScore = document.getElementById("anom-drawer-doc-ocr-score");
    const docName = document.getElementById("anom-drawer-doc-name");
    const docType = document.getElementById("anom-drawer-doc-type");
    const docStatus = document.getElementById("anom-drawer-doc-status");

    if (docPanel) {
      if (doc || a.document_id) {
        docPanel.style.display = "block";
        if (docOcrScore) docOcrScore.textContent = `Score OCR : ${doc ? (doc.ocr_confidence || 95) : 94}%`;
        if (docName) docName.textContent = doc ? (doc.doc_name || doc.name || doc.doc_type) : "Pièce Justificative Proforma.pdf";
        if (docType) docType.textContent = `Type : ${doc ? doc.doc_type : "FACTURE"} • Rattaché au dossier`;
        if (docStatus) {
          docStatus.className = `badge ${isOpen ? "badge-warning" : "badge-approved"}`;
          docStatus.textContent = isOpen ? "À rectifier" : "Conforme";
        }
      } else {
        docPanel.style.display = "none";
      }
    }

    // Section 4: Traitement & Décision
    const resBadge = document.getElementById("anom-drawer-resolution-badge");
    const resInfo = document.getElementById("anom-drawer-resolved-info");
    const resComment = document.getElementById("anom-drawer-resolved-comment");
    const resMeta = document.getElementById("anom-drawer-resolved-meta");
    const formRes = document.getElementById("anom-drawer-form-resolution");
    const btnResolve = document.getElementById("anom-drawer-btn-resolve");
    const commentInput = document.getElementById("anom-drawer-comment-input");

    if (resBadge) {
      resBadge.className = `badge ${isOpen ? "badge-verification" : "badge-approved"}`;
      resBadge.textContent = isOpen ? "En Attente de Levée" : "Levée Validée";
    }

    if (isOpen) {
      if (resInfo) resInfo.style.display = "none";
      if (formRes) formRes.style.display = "block";
      if (btnResolve) {
        btnResolve.style.display = "inline-flex";
        btnResolve.innerHTML = `<i class="fas fa-check mr-1"></i> Lever l'Anomalie`;
      }
      if (commentInput) commentInput.value = "";
    } else {
      if (resInfo) resInfo.style.display = "block";
      if (resComment) resComment.textContent = a.resolution_comment || "Anomalie contrôlée et régularisée par l'analyste risque.";
      if (resMeta) {
        resMeta.textContent = `Régularisé le ${a.resolved_at ? new Date(a.resolved_at).toLocaleDateString("fr-FR") : "17/08/2026"} par Analyste Risque`;
      }
      if (formRes) formRes.style.display = "none";
      if (btnResolve) {
        btnResolve.style.display = "inline-flex";
        btnResolve.innerHTML = `<i class="fas fa-rotate mr-1"></i> Rouvrir l'Anomalie`;
      }
    }

    // Open Drawer
    backdrop.classList.add("active");
  },

  closeAnomalyDrawer() {
    const backdrop = document.getElementById("anomaly-drawer-backdrop");
    if (backdrop) backdrop.classList.remove("active");
  },

  openDossierFromAnomalyDrawer() {
    if (!this.currentAnomalyDrawerId) return;
    const a = DB.findById("anomalies", this.currentAnomalyDrawerId);
    if (!a) return;
    this.closeAnomalyDrawer();
    this.openAnalystDossierDrawer(a.credit_request_id);
  },

  resolveAnomalyFromDrawer() {
    if (!this.currentAnomalyDrawerId) return;
    const a = DB.findById("anomalies", this.currentAnomalyDrawerId);
    if (!a) return;

    if (a.status === "OPEN") {
      const commentInput = document.getElementById("anom-drawer-comment-input");
      const comment =
        commentInput && commentInput.value.trim()
          ? commentInput.value.trim()
          : "Anomalie contrôlée et levée après vérification contradictoire.";

      DB.update("anomalies", this.currentAnomalyDrawerId, {
        status: "RESOLVED",
        resolved_by: this.currentUser ? this.currentUser.id : 1,
        resolved_at: new Date().toISOString(),
        resolution_comment: comment,
      });

      DB.addAuditLog(
        this.currentUser ? this.currentUser.id : 1,
        "ANOMALIE_LEVEE_ANALYSTE",
        "anomalies",
        this.currentAnomalyDrawerId,
        `Anomalie #${this.currentAnomalyDrawerId} (${a.anomaly_type}) levée avec succès.`,
      );

      this.showToast(
        `Anomalie #${this.currentAnomalyDrawerId} levée avec succès.`,
        "success",
      );
      this.closeAnomalyDrawer();
      this.renderAnalystAnomalies();
    } else {
      this.reopenAnomaly(this.currentAnomalyDrawerId);
      this.closeAnomalyDrawer();
    }
  },

  requestFieldCheckFromAnomalyDrawer() {
    if (!this.currentAnomalyDrawerId) return;
    this.requestFieldCheckForAnomaly(this.currentAnomalyDrawerId);
    this.closeAnomalyDrawer();
  },

  requestFieldCheckForAnomaly(anomalyId) {
    const a = DB.findById("anomalies", anomalyId);
    if (!a) return;

    const req = DB.findById("credit_requests", a.credit_request_id) || {};

    DB.addAuditLog(
      this.currentUser ? this.currentUser.id : 1,
      "DEMANDE_VERIFICATION_TERRAIN",
      "credit_requests",
      a.credit_request_id,
      `Mission de contre-expertise terrain transmise à l'Agent de Crédit pour l'anomalie : ${a.description}`,
    );

    this.showToast(
      `Ordre de mission terrain transmis à l'Agent pour le dossier ${req.request_number || "en cours"}.`,
      "success",
    );
  },

  runFullAnomalyScan() {
    this.showToast(
      "Scan algorithmique global et rapprochement OCR en cours...",
      "info",
    );
    setTimeout(() => {
      this.renderAnalystAnomalies();
      this.showToast(
        "Scan terminé : 5 signaux analysés, base d'intégrité 100% synchronisée.",
        "success",
      );
    }, 450);
  },

  exportAnomaliesCsv() {
    const anomalies = DB.get("anomalies");
    const requests = DB.get("credit_requests");

    let csv =
      "ID;Numero_Dossier;Client;Gravite;Type_Anomalie;Description;Valeur_Detectee;Valeur_Attendue;Statut;Date_Detection\n";
    anomalies.forEach((a) => {
      const req = requests.find((r) => r.id === a.credit_request_id) || {};
      csv += `"${a.id}";"${req.request_number || ""}";"${req.client_name || ""}";"${a.severity}";"${a.anomaly_type}";"${(a.description || "").replace(/"/g, '""')}";"${(a.detected_value || "").replace(/"/g, '""')}";"${(a.expected_value || "").replace(/"/g, '""')}";"${a.status}";"${a.created_at || ""}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Registre_Anomalies_CIF_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.showToast(
      "Export CSV du registre des anomalies téléchargé avec succès",
      "success",
    );
  },

  // [ROLE 4] COMITÉ DE CRÉDIT (DÉCISIONNAIRE)
  activeCommitteeDossierId: null,
  committeeDossiersFilter: "ALL",
  committeeDossiersSearchQuery: "",

  renderCommitteeDashboard() {
    const tbody = document.getElementById("committee-requests-table-body");
    if (!tbody) return;

    // Dossiers en attente de passage au comité
    const pendingReqs = DB.get("credit_requests").filter(
      (r) =>
        r.status === "COMMITTEE" ||
        r.status === "CREDIT_REVIEW" ||
        r.status === "ANALYSIS",
    );

    tbody.innerHTML = pendingReqs
      .map((r) => {
        const evalData = CreditScoringEngine.evaluateDossier(r.id) || {};
        const riskBadgeClass =
          evalData.riskLevel === "CRITIQUE"
            ? "badge-rejected"
            : evalData.riskLevel === "ELEVE"
              ? "badge-warning"
              : "badge-approved";
        const riskLabel =
          evalData.riskLevel === "FAIBLE"
            ? "Risque Faible"
            : evalData.riskLevel === "MODERE"
              ? "Risque Modéré"
              : evalData.riskLevel || "Faible";

        return `
        <tr class="schedule-table-row" onclick="App.openCommitteeDrawer(${r.id})" style="cursor: pointer;" title="Cliquer pour afficher la fiche complète dans le volet latéral">
          <td style="white-space: nowrap;">
            <span class="badge badge-submitted" style="font-family: var(--font-family-code); font-weight: 700; margin-right: 8px;">${r.request_number}</span>
            <strong style="color: var(--text-primary); font-size: 0.9rem;">${r.client_name}</strong>
          </td>
          <td style="white-space: nowrap;">
            <strong class="amount-cell" style="color: var(--primary-700); font-family: var(--font-family-code); font-size: 0.92rem;">${CreditScoringEngine.formatFCFA(r.requested_amount)}</strong>
          </td>
          <td style="white-space: nowrap;">
            <span class="badge ${riskBadgeClass}" style="font-weight: 700; font-size: 0.76rem;">
              <i class="fas fa-shield-check mr-1"></i> ${evalData.overallScore || 85}/100 • ${riskLabel}
            </span>
          </td>
          <td style="white-space: nowrap;">
            <span class="badge badge-analysis" style="font-size: 0.74rem;">
              <i class="fas fa-thumbs-up mr-1"></i> Avis Favorable
            </span>
          </td>
          <td style="text-align: right; white-space: nowrap;">
            <div style="display: inline-flex; align-items: center; gap: 6px;">
              <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); App.openCommitteeDrawer(${r.id})" title="Voir tous les détails du dossier en volet latéral">
                <i class="fas fa-eye text-primary"></i> Détails
              </button>
              <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); AppInteractions.openCommitteeModal(${r.id})" title="Délibérer, ajuster les termes et voter">
                <i class="fas fa-gavel"></i> Voter
              </button>
            </div>
          </td>
        </tr>
      `;
      })
      .join("");
  },

  renderCommitteeDossiersPage(filter = this.committeeDossiersFilter, query = this.committeeDossiersSearchQuery) {
    this.committeeDossiersFilter = filter;
    this.committeeDossiersSearchQuery = query;

    const tbody = document.getElementById("com-dossiers-page-table-body");
    const countBadge = document.getElementById("com-dossiers-count-badge");
    if (!tbody) return;

    const allCommitteeReqs = DB.get("credit_requests").filter(
      (r) =>
        r.status === "COMMITTEE" ||
        r.status === "CREDIT_REVIEW" ||
        r.status === "ANALYSIS" ||
        r.status === "APPROVED",
    );

    // Calculate Dynamic KPIs
    const totalSessionAmount = allCommitteeReqs.reduce((sum, r) => sum + (r.requested_amount || 0), 0);
    const pendingReqs = allCommitteeReqs.filter((r) => r.status === "COMMITTEE" || r.status === "CREDIT_REVIEW");
    const approvedReqs = allCommitteeReqs.filter((r) => r.status === "APPROVED");
    const favorableReqs = allCommitteeReqs.filter((r) => {
      const evalData = CreditScoringEngine.evaluateDossier(r.id) || {};
      return evalData.riskLevel === "FAIBLE" || (evalData.overallScore || 0) >= 80;
    });
    const coldStartReqs = allCommitteeReqs.filter((r) => {
      const client = DB.findById("clients", r.client_id) || {};
      return client.is_cold_start || r.is_cold_start || (CreditScoringEngine.evaluateDossier(r.id) || {}).overallScore <= 88;
    });

    // Update KPI elements if present
    const kpiTotalAmount = document.getElementById("com-kpi-total-amount");
    const kpiTotalCount = document.getElementById("com-kpi-total-count");
    const kpiPendingCount = document.getElementById("com-kpi-pending-count");
    const kpiApprovedCount = document.getElementById("com-kpi-approved-count");
    const sessionTotalAmount = document.getElementById("com-session-total-amount");
    const sessionVotedRatio = document.getElementById("com-session-voted-ratio");

    const formattedTotalCompact =
      totalSessionAmount >= 1000000
        ? `${(totalSessionAmount / 1000000).toFixed(1).replace(".0", "")} M`
        : CreditScoringEngine.formatFCFA(totalSessionAmount);

    if (kpiTotalAmount) kpiTotalAmount.textContent = formattedTotalCompact;
    if (kpiTotalCount) kpiTotalCount.textContent = allCommitteeReqs.length.toString();
    if (kpiPendingCount) kpiPendingCount.textContent = pendingReqs.length.toString();
    if (kpiApprovedCount) kpiApprovedCount.textContent = approvedReqs.length.toString();
    if (sessionTotalAmount) sessionTotalAmount.textContent = CreditScoringEngine.formatFCFA(totalSessionAmount);
    if (sessionVotedRatio) sessionVotedRatio.textContent = `${approvedReqs.length} / ${allCommitteeReqs.length}`;

    // Update Tab Counters
    const countTabAll = document.getElementById("count-tab-all");
    const countTabPending = document.getElementById("count-tab-pending");
    const countTabFavorable = document.getElementById("count-tab-favorable");
    const countTabColdstart = document.getElementById("count-tab-coldstart");

    if (countTabAll) countTabAll.textContent = allCommitteeReqs.length.toString();
    if (countTabPending) countTabPending.textContent = pendingReqs.length.toString();
    if (countTabFavorable) countTabFavorable.textContent = favorableReqs.length.toString();
    if (countTabColdstart) countTabColdstart.textContent = coldStartReqs.length.toString();

    let reqs = [...allCommitteeReqs];

    // Apply Filter Tab
    if (filter === "PENDING_VOTE") {
      reqs = pendingReqs;
    } else if (filter === "FAVORABLE") {
      reqs = favorableReqs;
    } else if (filter === "COLD_START") {
      reqs = coldStartReqs;
    }

    // Apply Search Query
    if (query && query.trim()) {
      const q = query.trim().toLowerCase();
      reqs = reqs.filter((r) => {
        const client = DB.findById("clients", r.client_id) || {};
        return (
          (r.client_name && r.client_name.toLowerCase().includes(q)) ||
          (r.request_number && r.request_number.toLowerCase().includes(q)) ||
          (r.city && r.city.toLowerCase().includes(q)) ||
          (client.activity && client.activity.toLowerCase().includes(q))
        );
      });
    }

    if (countBadge) {
      countBadge.textContent = `${reqs.length} dossier${reqs.length > 1 ? "s" : ""} affiché${reqs.length > 1 ? "s" : ""}`;
    }

    if (reqs.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 2.5rem 1rem; color: var(--text-muted);">
            <i class="fas fa-folder-open" style="font-size: 2rem; margin-bottom: 0.5rem; display: block; opacity: 0.5;"></i>
            Aucun dossier ne correspond aux critères de recherche.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = reqs
      .map((r) => {
        const evalData = CreditScoringEngine.evaluateDossier(r.id) || {};
        const riskBadgeClass =
          evalData.riskLevel === "CRITIQUE"
            ? "badge-rejected"
            : evalData.riskLevel === "ELEVE"
              ? "badge-warning"
              : "badge-approved";
        const riskLabel =
          evalData.riskLevel === "FAIBLE"
            ? "Faible"
            : evalData.riskLevel === "MODERE"
              ? "Modéré"
              : evalData.riskLevel || "Faible";

        const statusBadgeClass =
          r.status === "APPROVED"
            ? "badge-approved"
            : r.status === "COMMITTEE"
              ? "badge-warning"
              : "badge-analysis";
        const statusIcon =
          r.status === "APPROVED"
            ? "fa-check-circle"
            : r.status === "COMMITTEE"
              ? "fa-hourglass-half"
              : "fa-thumbs-up";
        const statusLabel =
          r.status === "APPROVED"
            ? "Validé en Séance"
            : r.status === "COMMITTEE"
              ? "En attente de vote"
              : "Avis Favorable";

        return `
        <tr class="schedule-table-row" onclick="App.openCommitteeDrawer(${r.id})" style="cursor: pointer;" title="Cliquer pour afficher la fiche complète dans le volet latéral">
          <td style="white-space: nowrap;">
            <span class="badge badge-submitted" style="font-family: var(--font-family-code); font-weight: 700; margin-right: 8px;">${r.request_number}</span>
            <strong style="color: var(--text-primary); font-size: 0.9rem;">${r.client_name}</strong>
          </td>
          <td style="white-space: nowrap;">
            <strong class="amount-cell" style="color: var(--primary-700); font-family: var(--font-family-code); font-size: 0.92rem;">${CreditScoringEngine.formatFCFA(r.requested_amount)}</strong>
          </td>
          <td style="white-space: nowrap;">
            <span class="badge ${riskBadgeClass}" style="font-weight: 700; font-size: 0.74rem;">
              <i class="fas fa-shield-check mr-1"></i> ${evalData.overallScore || 85}/100 • Risque ${riskLabel}
            </span>
          </td>
          <td style="white-space: nowrap;">
            <span class="badge ${statusBadgeClass}" style="font-size: 0.74rem;">
              <i class="fas ${statusIcon} mr-1"></i> ${statusLabel}
            </span>
          </td>
          <td style="text-align: right; white-space: nowrap;">
            <div style="display: inline-flex; align-items: center; gap: 6px;">
              <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); App.openCommitteeDrawer(${r.id})" title="Voir tous les détails du dossier en volet latéral">
                <i class="fas fa-eye text-primary"></i> Détails
              </button>
              <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); AppInteractions.openCommitteeModal(${r.id})" title="Délibérer, ajuster les termes et voter">
                <i class="fas fa-gavel"></i> Voter
              </button>
            </div>
          </td>
        </tr>
      `;
      })
      .join("");
  },

  filterCommitteeDossiers(filterType, btn) {
    if (btn && btn.parentElement) {
      btn.parentElement.querySelectorAll(".btn").forEach((b) => {
        b.classList.remove("btn-primary");
        b.classList.add("btn-secondary");
      });
      btn.classList.remove("btn-secondary");
      btn.classList.add("btn-primary");
    }
    this.renderCommitteeDossiersPage(filterType, this.committeeDossiersSearchQuery);
  },

  searchCommitteeDossiers(query) {
    this.renderCommitteeDossiersPage(this.committeeDossiersFilter, query);
  },

  openFirstPendingCommitteeVote() {
    const pending = DB.get("credit_requests").find(
      (r) => r.status === "COMMITTEE" || r.status === "CREDIT_REVIEW" || r.status === "ANALYSIS",
    );
    if (pending && window.AppInteractions && typeof window.AppInteractions.openCommitteeModal === "function") {
      window.AppInteractions.openCommitteeModal(pending.id);
    } else {
      this.showToast("Tous les dossiers soumis ont déjà été traités.", "info");
    }
  },

  openCommitteeDrawer(dossierId) {
    const req = this.resolveCreditRequest(dossierId);
    if (!req) return;

    this.activeCommitteeDossierId = req.id;
    const evalData = CreditScoringEngine.evaluateDossier(req.id) || {};
    const client = DB.findById("clients", req.client_id) || {};
    const review =
      DB.get("credit_reviews").find((r) => r.credit_request_id == req.id) || {};

    const backdrop = document.getElementById("committee-drawer-backdrop");
    if (!backdrop) return;

    // Badges & Header
    const reqBadge = document.getElementById("com-drawer-req-badge");
    const riskBadge = document.getElementById("com-drawer-risk-badge");
    const titleEl = document.getElementById("com-drawer-title");
    const subtitleEl = document.getElementById("com-drawer-subtitle");

    // Malian Locations & Agencies Mapping for all borrowers
    const malianAgenciesMap = {
      1: { district: "Grand Marché", agency: "Agence Marché Médine", occupation: "Commerçante / Grossiste Textiles", client_num: "ML-BKO-008821" },
      2: { district: "Badalabougou", agency: "Agence Badalabougou", occupation: "Transformateur Agroalimentaire", client_num: "ML-BKO-004419" },
      3: { district: "Dabanani", agency: "Agence Dabanani", occupation: "Import-Export Quincaillerie", client_num: "ML-BKO-003190" },
      4: { district: "Sotuba", agency: "Agence Sotuba", occupation: "Aviculteur & Éleveur", client_num: "ML-BKO-005512" },
      5: { district: "Faladié", agency: "Agence Faladié", occupation: "Jeune Artisan Menuisier", client_num: "ML-BKO-009023" },
    };

    const clientKey = req.client_id || req.id;
    const malianInfo = malianAgenciesMap[clientKey] || {
      district: req.city && req.city !== "UEMOA" ? req.city : "Grand Marché",
      agency: "Agence Principale",
      occupation: "Activité commerciale & artisanat",
      client_num: `ML-BKO-00${clientKey}00`,
    };

    const locDistrict = `Bamako (${malianInfo.district})`;
    const locText = `${locDistrict}, Mali`;

    if (reqBadge)
      reqBadge.textContent = req.request_number || `#REQ-2026-${req.id}`;
    if (titleEl)
      titleEl.textContent = req.client_name || client.name || "Emprunteur";
    if (subtitleEl) {
      subtitleEl.textContent = `Dossier de crédit • ${locText} • Décision Comité`;
    }

    if (riskBadge) {
      const riskClass =
        evalData.riskLevel === "CRITIQUE"
          ? "badge-rejected"
          : evalData.riskLevel === "ELEVE"
            ? "badge-warning"
            : "badge-approved";
      riskBadge.className = `badge ${riskClass}`;
      riskBadge.innerHTML = `<i class="fas fa-shield-check"></i> ${evalData.riskLevel === "FAIBLE" ? "Risque Faible" : evalData.riskLevel === "MODERE" ? "Risque Modéré" : evalData.riskLevel || "Faible"}`;
    }

    // Section 1 : Emprunteur & Demande
    const clientIdEl = document.getElementById("com-drawer-client-id");
    const avatarEl = document.getElementById("com-drawer-avatar");
    const clientNameEl = document.getElementById("com-drawer-client-name");
    const locEl = document.getElementById("com-drawer-location");
    const amountEl = document.getElementById("com-drawer-amount");
    const durationEl = document.getElementById("com-drawer-duration");
    const installmentEl = document.getElementById("com-drawer-installment");
    const activityEl = document.getElementById("com-drawer-activity");
    const surplusEl = document.getElementById("com-drawer-surplus");

    if (clientIdEl)
      clientIdEl.textContent = `ID: ${client.client_number || malianInfo.client_num || "CLI-" + clientKey}`;
    if (avatarEl)
      avatarEl.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(req.client_name)}&background=4f46e5&color=fff`;
    if (clientNameEl) clientNameEl.textContent = req.client_name;
    if (locEl) {
      locEl.innerHTML = `<i class="fas fa-location-dot text-primary mr-1"></i> ${locText} • ${malianInfo.agency}`;
    }
    if (amountEl)
      amountEl.textContent = CreditScoringEngine.formatFCFA(
        req.requested_amount,
      );
    if (durationEl)
      durationEl.textContent = `Durée : ${req.duration_months} mois • Crédit Spot`;

    // Monthly installment calculation
    const rAmount = req.requested_amount || 2500000;
    const rDur = req.duration_months || 12;
    const estMonthly = Math.round((rAmount * (1 + 0.095 * (rDur / 12))) / rDur);
    if (installmentEl)
      installmentEl.textContent = CreditScoringEngine.formatFCFA(estMonthly);

    if (activityEl)
      activityEl.textContent =
        client.occupation || malianInfo.occupation || client.activity || req.activity || "Commerce général & négoce";
    if (surplusEl) {
      const surplus =
        req.disposable_income || client.disposable_income || 385000;
      surplusEl.textContent = `+ ${CreditScoringEngine.formatFCFA(surplus)}`;
    }

    // Section 2 : Scoring XAI
    const confBadge = document.getElementById("com-drawer-conf-badge");
    const overallScoreEl = document.getElementById("com-drawer-overall-score");
    const capBadge = document.getElementById("com-drawer-capacity-badge");

    if (confBadge)
      confBadge.innerHTML = `<i class="fas fa-check-double"></i> Confiance ${evalData.confidenceScore || 94}%`;
    if (overallScoreEl) {
      overallScoreEl.textContent = evalData.overallScore || req.score || 88;
      overallScoreEl.style.color = evalData.riskColor || "#059669";
    }
    if (capBadge) {
      const isSufficient = req.repayment_capacity_status === "SUFFICIENT";
      capBadge.className = `badge ${isSufficient ? "badge-approved" : "badge-rejected"}`;
      capBadge.innerHTML = `<i class="fas ${isSufficient ? "fa-check" : "fa-triangle-exclamation"}"></i> ${isSufficient ? "Reste à vivre certifié" : "Capacité insuffisante"}`;
    }

    // Pillar progress bars
    const scoreVal = evalData.overallScore || 88;
    const pCash = Math.min(98, Math.max(60, scoreVal + 2));
    const pCold = Math.min(95, Math.max(55, scoreVal - 2));
    const pStab = Math.min(95, Math.max(50, scoreVal - 5));

    const pCashEl = document.getElementById("com-drawer-pillar-cashflow");
    const pColdEl = document.getElementById("com-drawer-pillar-coldstart");
    const pStabEl = document.getElementById("com-drawer-pillar-stability");
    const bCashEl = document.getElementById("com-drawer-bar-cashflow");
    const bColdEl = document.getElementById("com-drawer-bar-coldstart");
    const bStabEl = document.getElementById("com-drawer-bar-stability");

    if (pCashEl) pCashEl.textContent = `${pCash} / 100`;
    if (pColdEl) pColdEl.textContent = `${pCold} / 100`;
    if (pStabEl) pStabEl.textContent = `${pStab} / 100`;
    if (bCashEl) bCashEl.style.width = `${pCash}%`;
    if (bColdEl) bColdEl.style.width = `${pCold}%`;
    if (bStabEl) bStabEl.style.width = `${pStab}%`;

    // Section 3 : Analyst Notes
    const notesEl = document.getElementById("com-drawer-analyst-notes");
    if (notesEl) {
      notesEl.textContent =
        review.analyst_comment ||
        `Avis d'octroi favorable émis par l'analyste risque. Activité vérifiée avec chiffre d'affaires récurrent sur les 6 derniers mois. Ratio d'endettement sain (${Math.round((estMonthly / (estMonthly + 385000)) * 100)}%).`;
    }

    // Show backdrop & trigger CSS transition
    backdrop.classList.add("active");
  },

  closeCommitteeDrawer() {
    const backdrop = document.getElementById("committee-drawer-backdrop");
    if (backdrop) backdrop.classList.remove("active");
  },

  openCommitteeModalFromDrawer() {
    this.closeCommitteeDrawer();
    if (
      this.activeCommitteeDossierId &&
      window.AppInteractions &&
      typeof window.AppInteractions.openCommitteeModal === "function"
    ) {
      window.AppInteractions.openCommitteeModal(this.activeCommitteeDossierId);
    }
  },

  // Signed PV Registry Data & Sidedrawer
  signedPvsRegistry: [
    {
      ref: "PV-2026-0889",
      req_number: "#REQ-2026-0889",
      client_name: "Seydou Keita",
      country: "Mali",
      country_code: "ml",
      city: "Bamako",
      activity: "Menuiserie métallique & BTP léger",
      agency: "Caisse Bamako Principale (Mali)",
      decision: "ACCORD",
      decision_label: "Accord Collégial Unanime",
      amount_granted: 3000000,
      amount_requested: 3000000,
      rate: "9.5% annuel",
      duration_months: 18,
      terms: "9.5% • 18 mois",
      monthly_payment: 190417,
      date_signed: "18/08/2026",
      time_signed: "16:45 GMT",
      quorum: "3/3 Signatures",
      sha: "9a8f4c21e5b7890123456789abcdef0123456789abcdef0123456789abcdef01",
      sha_short: "9a8f...4e12",
      signers: [
        {
          name: "Dr. Amadou Diallo",
          role: "Président du Comité de Crédit",
          status: "Signé électroniquement",
          date: "18/08/2026 16:30",
          cert: "Token UEMOA #991",
        },
        {
          name: "Fatou Camara",
          role: "Directrice des Risques",
          status: "Signé électroniquement",
          date: "18/08/2026 16:38",
          cert: "Token UEMOA #812",
        },
        {
          name: "Mamadou Traoré",
          role: "Responsable Conformité & LBC",
          status: "Signé électroniquement",
          date: "18/08/2026 16:45",
          cert: "Token UEMOA #405",
        },
      ],
      guarantees:
        "Caution solidaire Maître Artisan enregistrée + Dépôt de garantie bloqué 10% (300 000 FCFA).",
      disbursement_conditions:
        "Décaissement échelonné : 70% sur facture proforma fournisseur et 30% après PV de réception des matériaux.",
      committee_notes:
        "Dossier jugé très solide. Rentabilité démontrée avec marge opérationnelle supérieure à 35%. Reste à vivre vérifié.",
    },
    {
      ref: "PV-2026-0884",
      req_number: "#REQ-2026-0884",
      client_name: "Aïssatou Ba",
      country: "Mali",
      country_code: "ml",
      city: "Bamako",
      activity: "Transformation agroalimentaire & fruits séchés",
      agency: "Caisse Bamako Badalabougou (Mali)",
      decision: "ACCORD",
      decision_label: "Accord sous Quotité Ajustée",
      amount_granted: 1800000,
      amount_requested: 2200000,
      rate: "10.0% annuel",
      duration_months: 12,
      terms: "10.0% • 12 mois",
      monthly_payment: 165000,
      date_signed: "17/08/2026",
      time_signed: "14:20 GMT",
      quorum: "3/3 Signatures",
      sha: "bc723819a1234ef987654321fedcba0987654321fedcba0987654321fedcba09",
      sha_short: "bc72...8901",
      signers: [
        {
          name: "Dr. Amadou Diallo",
          role: "Président du Comité de Crédit",
          status: "Signé électroniquement",
          date: "17/08/2026 14:05",
          cert: "Token UEMOA #991",
        },
        {
          name: "Fatou Camara",
          role: "Directrice des Risques",
          status: "Signé électroniquement",
          date: "17/08/2026 14:12",
          cert: "Token UEMOA #812",
        },
        {
          name: "Mamadou Traoré",
          role: "Responsable Conformité & LBC",
          status: "Signé électroniquement",
          date: "17/08/2026 14:20",
          cert: "Token UEMOA #405",
        },
      ],
      guarantees:
        "Nantissement matériel séchoir solaire + Engagement solidaire GIE des productrices de Bamako.",
      disbursement_conditions:
        "Paiement direct au fabricant de séchoir solaire agréé avec facture acquittée.",
      committee_notes:
        "Quotité ramenée à 1 800 000 FCFA pour maintenir le taux d'effort en dessous du seuil de 30%.",
    },
    {
      ref: "PV-2026-0878",
      req_number: "#REQ-2026-0878",
      client_name: "Mahamadou Ouedraogo",
      country: "Mali",
      country_code: "ml",
      city: "Bamako",
      activity: "Transport interurbain & logistique",
      agency: "Caisse Bamako Dabanani (Mali)",
      decision: "REJET",
      decision_label: "Rejet Collégial Unanime",
      amount_granted: 0,
      amount_requested: 4500000,
      rate: "N/A",
      duration_months: 0,
      terms: "Refus d'octroi",
      monthly_payment: 0,
      date_signed: "15/08/2026",
      time_signed: "11:15 GMT",
      quorum: "Rejet Acté",
      sha: "df14aa33e99887766554433221100ffeeddccbbaa99887766554433221100ffe",
      sha_short: "df14...aa33",
      signers: [
        {
          name: "Dr. Amadou Diallo",
          role: "Président du Comité de Crédit",
          status: "Visa de Rejet Signé",
          date: "15/08/2026 11:00",
          cert: "Token UEMOA #991",
        },
        {
          name: "Fatou Camara",
          role: "Directrice des Risques",
          status: "Visa de Rejet Signé",
          date: "15/08/2026 11:08",
          cert: "Token UEMOA #812",
        },
        {
          name: "Mamadou Traoré",
          role: "Responsable Conformité & LBC",
          status: "Visa de Rejet Signé",
          date: "15/08/2026 11:15",
          cert: "Token UEMOA #405",
        },
      ],
      guarantees:
        "Garanties présentées jugées insuffisantes au regard de la charge d'endettement externe constatée.",
      disbursement_conditions:
        "N/A - Dossier classé sans suite. Notification de refus motivé transmise à l'agence locale.",
      committee_notes:
        "Reste à vivre négatif après intégration des encours externes déclarés à la Centrale des Risques BCEAO.",
    },
    {
      ref: "PV-2026-0865",
      req_number: "#REQ-2026-0865",
      client_name: "Koffi Mensah",
      country: "Mali",
      country_code: "ml",
      city: "Bamako",
      activity: "Grossiste Quincaillerie & Outillage",
      agency: "Caisse Bamako Grand Marché (Mali)",
      decision: "ACCORD",
      decision_label: "Accord Collégial",
      amount_granted: 3500000,
      amount_requested: 3500000,
      rate: "9.0% annuel",
      duration_months: 24,
      terms: "9.0% • 24 mois",
      monthly_payment: 172083,
      date_signed: "12/08/2026",
      time_signed: "17:10 GMT",
      quorum: "3/3 Signatures",
      sha: "44a9f812cb0033445566778899aabbccddeeff00112233445566778899aabbcc",
      sha_short: "44a9...bbcc",
      signers: [
        {
          name: "Dr. Amadou Diallo",
          role: "Président du Comité de Crédit",
          status: "Signé électroniquement",
          date: "12/08/2026 16:50",
          cert: "Token UEMOA #991",
        },
        {
          name: "Fatou Camara",
          role: "Directrice des Risques",
          status: "Signé électroniquement",
          date: "12/08/2026 17:02",
          cert: "Token UEMOA #812",
        },
        {
          name: "Mamadou Traoré",
          role: "Responsable Conformité & LBC",
          status: "Signé électroniquement",
          date: "12/08/2026 17:10",
          cert: "Token UEMOA #405",
        },
      ],
      guarantees:
        "Nantissement de stock commercial 120% + Caution solidaire du groupement des commerçants.",
      disbursement_conditions:
        "Virement direct sur compte fournisseur quincaillerie sur présentation du bon de commande validé.",
      committee_notes:
        "Historique de remboursement irréprochable sur les précédents cycles. Stock à rotation rapide.",
    },
  ],

  activeSignedPvRef: null,

  renderSignedPvTable() {
    const tbody = document.getElementById("signed-pvs-table-body");
    if (!tbody) return;

    tbody.innerHTML = this.signedPvsRegistry
      .map((pv) => {
        const isApproved = pv.decision === "ACCORD";

        return `
        <tr class="schedule-table-row" onclick="App.openSignedPvDrawer('${pv.ref}')" style="cursor: pointer;" title="Cliquer pour afficher les détails du procès-verbal scellé">
          <td>
            <strong style="font-family: var(--font-family-code); font-size: 0.85rem; color: var(--primary-700);">${pv.ref}</strong>
            <div style="font-size: 0.72rem; color: var(--text-subtle);">${pv.req_number}</div>
          </td>
          <td>
            <div style="font-weight: 700; font-size: 0.88rem; color: var(--text-primary);">${pv.client_name}</div>
            <div style="font-size: 0.72rem; color: var(--text-muted);"><i class="fas fa-location-dot text-primary mr-1"></i>${pv.city}, ${pv.country}</div>
          </td>
          <td>
            ${
              isApproved
                ? `<strong class="amount-cell" style="color: #059669; font-size: 0.95rem;">${CreditScoringEngine.formatFCFA(pv.amount_granted)}</strong>
                 <div style="font-size: 0.72rem; color: var(--text-muted);">${pv.terms}</div>`
                : `<strong class="amount-cell" style="color: #ef4444; font-size: 0.9rem;">REJET COLLÉGIAL</strong>
                 <div style="font-size: 0.72rem; color: var(--text-muted);">Refus motivé</div>`
            }
          </td>
          <td>
            <div style="display: flex; align-items: center; gap: 4px; flex-wrap: wrap;">
              <span class="badge ${isApproved ? "badge-approved" : "badge-rejected"}" style="font-size: 0.68rem;">
                <i class="fas ${isApproved ? "fa-check" : "fa-times"}"></i> ${pv.quorum}
              </span>
              <span style="font-size: 0.72rem; color: var(--text-muted);">${pv.date_signed}</span>
            </div>
            <div style="font-size: 0.68rem; color: var(--text-subtle); font-family: var(--font-family-code); margin-top: 2px;">
              SHA: ${pv.sha_short}
            </div>
          </td>
          <td style="text-align: right;">
            <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); App.openSignedPvDrawer('${pv.ref}')" title="Voir les détails complets du PV scellé">
              <i class="fas fa-eye text-primary"></i> Détails
            </button>
          </td>
        </tr>
      `;
      })
      .join("");
  },

  openSignedPvDrawer(pvRef) {
    this.activeSignedPvRef = pvRef;
    const pv = this.signedPvsRegistry.find((p) => p.ref === pvRef);
    if (!pv) return;

    const backdrop = document.getElementById("signed-pv-drawer-backdrop");
    if (!backdrop) return;

    const isApproved = pv.decision === "ACCORD";

    // Header & Badges
    const refBadge = document.getElementById("pv-drawer-ref-badge");
    const statusBadge = document.getElementById("pv-drawer-status-badge");
    const titleEl = document.getElementById("pv-drawer-title");
    const subtitleEl = document.getElementById("pv-drawer-subtitle");

    if (refBadge) refBadge.textContent = pv.ref;
    if (statusBadge) {
      statusBadge.className = `badge ${isApproved ? "badge-approved" : "badge-rejected"}`;
      statusBadge.innerHTML = `<i class="fas ${isApproved ? "fa-circle-check" : "fa-circle-xmark"}"></i> ${pv.decision_label}`;
    }
    if (titleEl) titleEl.textContent = pv.client_name;
    if (subtitleEl)
      subtitleEl.textContent = `Procès-Verbal Officiel scellé • ${pv.city}, ${pv.country} • ${pv.req_number}`;

    // Section 1 : Termes financiers
    const dateEl = document.getElementById("pv-drawer-date");
    const amountEl = document.getElementById("pv-drawer-amount");
    const diffEl = document.getElementById("pv-drawer-requested-diff");
    const termsEl = document.getElementById("pv-drawer-terms");
    const monthlyEl = document.getElementById("pv-drawer-monthly");
    const clientInfoEl = document.getElementById("pv-drawer-client-info");
    const agencyEl = document.getElementById("pv-drawer-agency");

    if (dateEl) dateEl.textContent = `${pv.date_signed} (${pv.time_signed})`;
    if (amountEl) {
      amountEl.textContent = isApproved
        ? CreditScoringEngine.formatFCFA(pv.amount_granted)
        : "0 FCFA";
      amountEl.style.color = isApproved ? "#059669" : "#ef4444";
    }
    if (diffEl) {
      diffEl.textContent = `Demande initiale : ${CreditScoringEngine.formatFCFA(pv.amount_requested)}`;
    }
    if (termsEl) termsEl.textContent = pv.terms;
    if (monthlyEl) {
      monthlyEl.textContent = isApproved
        ? `Échéance : ~${CreditScoringEngine.formatFCFA(pv.monthly_payment)} / mois`
        : "Sans échéance (Dossier rejeté)";
    }
    if (clientInfoEl)
      clientInfoEl.textContent = `${pv.client_name} (${pv.activity})`;
    if (agencyEl) agencyEl.textContent = pv.agency;

    // Section 2 : Signers
    const quorumBadge = document.getElementById("pv-drawer-quorum-badge");
    if (quorumBadge) {
      quorumBadge.className = `badge ${isApproved ? "badge-approved" : "badge-rejected"}`;
      quorumBadge.innerHTML = `<i class="fas ${isApproved ? "fa-users-check" : "fa-ban"}"></i> ${pv.quorum}`;
    }

    const signersList = document.getElementById("pv-drawer-signers-list");
    if (signersList && pv.signers) {
      signersList.innerHTML = pv.signers
        .map(
          (s) => `
        <div style="background: var(--bg-body); padding: 0.65rem 0.85rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;">
          <div>
            <div style="font-weight: 700; font-size: 0.82rem; color: var(--text-primary);">${s.name}</div>
            <div style="font-size: 0.72rem; color: var(--text-muted);">${s.role} • <span style="font-family: var(--font-family-code); color: var(--primary-700);">${s.cert}</span></div>
          </div>
          <div style="text-align: right;">
            <span class="badge ${isApproved ? "badge-approved" : "badge-rejected"}" style="font-size: 0.68rem;">
              <i class="fas fa-check-double mr-1"></i> ${s.status}
            </span>
            <div style="font-size: 0.68rem; color: var(--text-subtle); margin-top: 2px;">${s.date}</div>
          </div>
        </div>
      `,
        )
        .join("");
    }

    // Section 3 : Guarantees & Notes
    const guarEl = document.getElementById("pv-drawer-guarantees");
    const disbEl = document.getElementById("pv-drawer-disbursement");
    const notesEl = document.getElementById("pv-drawer-notes");

    if (guarEl) guarEl.textContent = pv.guarantees;
    if (disbEl) disbEl.textContent = pv.disbursement_conditions;
    if (notesEl) notesEl.textContent = pv.committee_notes;

    // Section 4 : SHA
    const shaEl = document.getElementById("pv-drawer-sha");
    if (shaEl) shaEl.textContent = pv.sha;

    backdrop.classList.add("active");
  },

  closeSignedPvDrawer() {
    const backdrop = document.getElementById("signed-pv-drawer-backdrop");
    if (backdrop) backdrop.classList.remove("active");
  },

  downloadSignedPvPdf() {
    const pv = this.signedPvsRegistry.find(
      (p) => p.ref === this.activeSignedPvRef,
    );
    const ref = pv ? pv.ref : "PV-2026-0889";
    this.showToast(
      `Génération du Procès-Verbal officiel ${ref} certifié SHA-256 en cours...`,
      "info",
    );
    setTimeout(() => {
      this.showToast(
        `Procès-Verbal ${ref} téléchargé avec succès (Format PDF A/3 conforme UEMOA)`,
        "success",
      );
    }, 800);
  },

  downloadAllSignedPvsCsv() {
    this.showToast(
      "Export du registre complet des décisions scellées au format CSV/Excel...",
      "info",
    );
    setTimeout(() => {
      this.showToast(
        "Registre des procès-verbaux scellés exporté avec succès (4 actes validés)",
        "success",
      );
    }, 600);
  },

  notifyAgencyForPv() {
    const pv = this.signedPvsRegistry.find(
      (p) => p.ref === this.activeSignedPvRef,
    );
    if (!pv) return;
    this.showToast(
      `Notification de décision pour ${pv.client_name} transmise à ${pv.agency} via passerelle SMS & Messagerie`,
      "success",
    );
  },

  showSignedPvDetails(ref, client, amount, terms, date, sha) {
    this.openSignedPvDrawer(ref);
  },

  // [ROLE 5] RESPONSABLE CONFORMITÉ LBC / FT / FP
  complianceScreeningRegistry: [
    {
      id: "SCR-2026-0942",
      date: "Aujourd'hui 09:42",
      full_date: "21/08/2026 09:42 GMT",
      client_name: "Ibrahim Ould Mohamed",
      country: "Mali",
      city: "Gao & Bamako",
      agency: "Caisse Grand Marché (Bamako, Mali)",
      id_number: "NINA : 01-78-05-14-9981-ML",
      dob: "Né le 14/05/1978 à Gao",
      aliases: "Ibrahim Mohamed, Abou Khalil, El-Ibrahimi",
      profession: "Négoce transfrontalier & Logistique",
      list_type: "Sanctions UEMOA / ONU",
      legal_framework:
        "Résolution Conseil de Sécurité ONU 2374 (2017) & Décret Ministériel UEMOA Gel des avoirs",
      match_score: 98,
      match_label: "Match 98%",
      status: "BLOCKED",
      status_label: "Blocage Conservatoire",
      measure_badge: "badge-rejected",
      officer: "Mamadou Traoré (Conformité LBC)",
      findings:
        "Concordance biométrique et patronymique avec l'entité inscrite sur la liste consolidée du Comité des Sanctions ONU. Compte et opérations immédiatement suspendus. Notification automatique émise à la CENTIF-Mali sous réf. CENTIF-ML-2026-0418.",
      sha: "4e81fa02cb778899aa112233445566778899aabbccddeeff0011223344556677",
      is_doubt_cleared: false,
      steps: [
        {
          title: "Contrôle Automatisé API Screening Multi-Registres",
          time: "09:42:01",
          status: "Alerte Rouge (Match 98%)",
          badge: "badge-rejected",
        },
        {
          title: "Examen de Non-Homonymie & Validation Pièce",
          time: "09:44:15",
          status: "Homonymie confirmée (NINA & Date naissance concordants)",
          badge: "badge-rejected",
        },
        {
          title: "Blocage Conservatoire des Comptes & Flux",
          time: "09:45:00",
          status: "Acté & Verrouillé",
          badge: "badge-rejected",
        },
        {
          title: "Télétransmission Bordereau Réglementaire CENTIF",
          time: "09:46:30",
          status: "Bordereau #DOS-CENTIF-0418 transmis",
          badge: "badge-approved",
        },
      ],
    },
    {
      id: "SCR-2026-0915",
      date: "Aujourd'hui 08:15",
      full_date: "21/08/2026 08:15 GMT",
      client_name: "Ousmane Coulibaly",
      country: "Mali",
      city: "Bamako",
      agency: "Caisse Bamako Badalabougou (Mali)",
      id_number: "NINA : 1829 1982 04182",
      dob: "Né le 22/09/1982 à Sikasso",
      aliases: "Ousmane C., El Hadj Coulibaly",
      profession: "Élu Municipal & Promoteur Immobilier",
      list_type: "Base PPE Nationale & UEMOA",
      legal_framework:
        "Directive UEMOA relative à la Lutte contre le Blanchiment & Personnes Politiquement Exposées",
      match_score: 74,
      match_label: "Exposé (PPE)",
      status: "PPE_ENHANCED",
      status_label: "Diligence Renforcée",
      measure_badge: "badge-warning",
      officer: "Mamadou Traoré (Conformité LBC)",
      findings:
        "Personne Politiquement Exposée (Adjoint au Maire). Justificatifs de patrimoine et d'origine licite des fonds requis. Validation obligatoire par la Direction des Risques avant tout décaissement de concours financier.",
      sha: "7f92a105dd889900bb2233445566778899aabbccddeeff001122334455667788",
      is_doubt_cleared: false,
      steps: [
        {
          title: "Filtrage Registre PEP / Déclaration d'Intérêt",
          time: "08:15:10",
          status: "Signalement PPE Identifié (Niveau 2)",
          badge: "badge-warning",
        },
        {
          title: "Questionnaire Renforcé Origine des Fonds",
          time: "08:22:00",
          status: "Déclaration transmise & en cours d'analyse",
          badge: "badge-submitted",
        },
        {
          title: "Contrôle Absence Sanctions / Gel des Avoirs",
          time: "08:25:30",
          status: "Aucune sanction internationale (0%)",
          badge: "badge-approved",
        },
      ],
    },
    {
      id: "SCR-2026-0888",
      date: "Hier 16:30",
      full_date: "20/08/2026 16:30 GMT",
      client_name: "Fatou Ndiaye",
      country: "Mali",
      city: "Bamako",
      agency: "Caisse Bamako Grand Marché (Mali)",
      id_number: "NINA : 1756 1990 04182",
      dob: "Née le 03/11/1990 à Bamako",
      aliases: "Aucun alias répertorié",
      profession: "Commerçante & Importatrice Textile",
      list_type: "Base Globale GAFI",
      legal_framework:
        "Contrôle de Routine Conforme LBC / FT (Recommandations GAFI 10 & 11)",
      match_score: 0,
      match_label: "RAS (0%)",
      status: "CLEARED",
      status_label: "Autorisé sans Réserve",
      measure_badge: "badge-approved",
      officer: "Mamadou Traoré (Conformité LBC)",
      findings:
        "Filtrage complet négatif sur l'ensemble des registres (ONU, UEMOA, OFAC, CENTIF-Mali). Dossier validé pour ouverture de compte et octroi de crédit.",
      sha: "1a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f809",
      is_doubt_cleared: true,
      steps: [
        {
          title: "Contrôle Sanctions ONU / UEMOA / GAFI",
          time: "16:30:05",
          status: "Conformité Totale (0% match)",
          badge: "badge-approved",
        },
        {
          title: "Vérification Carte NINA",
          time: "16:30:45",
          status: "Document authentique & valide",
          badge: "badge-approved",
        },
        {
          title: "Feu Vert Conformité Délivré",
          time: "16:31:00",
          status: "Autorisation automatique enregistrée",
          badge: "badge-approved",
        },
      ],
    },
    {
      id: "SCR-2026-0870",
      date: "Hier 14:10",
      full_date: "20/08/2026 14:10 GMT",
      client_name: "Koffi Mensah",
      country: "Mali",
      city: "Bamako",
      agency: "Caisse Bamako Dabanani (Mali)",
      id_number: "NINA : ML-0982-2021",
      dob: "Né le 19/07/1985 à Bamako",
      aliases: "Aucun alias",
      profession: "Grossiste Quincaillerie",
      list_type: "Base Globale GAFI",
      legal_framework: "Contrôle Périodique de Routine KYC / LBC-FT",
      match_score: 0,
      match_label: "RAS (0%)",
      status: "CLEARED",
      status_label: "Autorisé sans Réserve",
      measure_badge: "badge-approved",
      officer: "Mamadou Traoré (Conformité LBC)",
      findings:
        "Aucune correspondance négative. Profil client sain, activité commerciale conforme aux opérations déclarées.",
      sha: "89ab01cd23ef456789ab01cd23ef456789ab01cd23ef456789ab01cd23ef4567",
      is_doubt_cleared: true,
      steps: [
        {
          title: "Screening Sanctions Internationales",
          time: "14:10:02",
          status: "Conformité Validée (0%)",
          badge: "badge-approved",
        },
        {
          title: "Attestation de Non-Inscription Registre CENTIF",
          time: "14:10:30",
          status: "Bordereau archivé",
          badge: "badge-approved",
        },
      ],
    },
    {
      id: "SCR-2026-0855",
      date: "19/08/2026 11:20",
      full_date: "19/08/2026 11:20 GMT",
      client_name: "Cheikh Tidiane Diop",
      country: "Mali",
      city: "Bamako",
      agency: "Caisse Bamako Faladié (Mali)",
      id_number: "NINA : 1882 1988 09912",
      dob: "Né le 12/01/1988 à Kayes",
      aliases: "Tidiane Diop",
      profession: "Artisan Menuisier & Ébéniste",
      list_type: "Base Sanctions UEMOA",
      match_score: 18,
      match_label: "Homonymie Écartée",
      status: "DOUBT_CLEARED",
      status_label: "Levée de Doute Validée",
      measure_badge: "badge-approved",
      officer: "Mamadou Traoré (Conformité LBC)",
      findings:
        "Simple homonymie patronymique avec un tiers sanctionné. Après vérification de l'acte de naissance et du numéro national d'identification, le doute est levé. Dossier régularisé.",
      sha: "33445566778899aabbccddeeff00112233445566778899aabbccddeeff001122",
      is_doubt_cleared: true,
      steps: [
        {
          title: "Détection Initiale Homonymie (18%)",
          time: "11:20:00",
          status: "Alerte Faible Intensité",
          badge: "badge-warning",
        },
        {
          title: "Comparaison Biométrique & Date de Naissance",
          time: "11:23:40",
          status: "Non-Concordance Certifiée",
          badge: "badge-approved",
        },
        {
          title: "Levée de Doute Formelle par l'Officier",
          time: "11:25:00",
          status: "Dossier Débloqué",
          badge: "badge-approved",
        },
      ],
    },
  ],

  activeComplianceScreeningId: null,

  renderComplianceDashboard() {
    this.renderComplianceScreeningTable();
  },

  renderComplianceScreeningTable() {
    const tbody = document.getElementById("compliance-screening-table-body");
    if (!tbody) return;

    const countBadge = document.getElementById("screening-count-badge");
    if (countBadge) {
      countBadge.textContent = `${this.complianceScreeningRegistry.length} Contrôles Récents`;
    }

    tbody.innerHTML = this.complianceScreeningRegistry
      .map((item) => {
        let scoreColor = "#10b981";
        if (item.match_score >= 80) scoreColor = "#ef4444";
        else if (item.match_score > 0) scoreColor = "#f59e0b";

        return `
        <tr class="schedule-table-row" onclick="App.openComplianceScreeningDrawer('${item.id}')" style="cursor: pointer;" title="Cliquer pour afficher les détails du contrôle et les diligences">
          <td>
            <strong>${item.date}</strong>
            <div style="font-size: 0.72rem; color: var(--text-subtle); font-family: var(--font-family-code);">${item.id}</div>
          </td>
          <td>
            <div style="font-weight: 700; font-size: 0.88rem; color: var(--text-primary);">${item.client_name}</div>
            <div style="font-size: 0.72rem; color: var(--text-muted);"><i class="fas fa-location-dot text-primary mr-1"></i>${item.city}, ${item.country}</div>
          </td>
          <td>
            <span class="badge ${item.list_type.includes("Sanctions") ? "badge-rejected" : item.list_type.includes("PPE") ? "badge-warning" : "badge-submitted"}" style="font-size: 0.68rem;">
              ${item.list_type}
            </span>
          </td>
          <td>
            <span class="badge ${item.measure_badge}" style="font-size: 0.74rem;">
              <i class="fas ${item.match_score >= 80 ? "fa-ban" : item.match_score > 0 ? "fa-triangle-exclamation" : "fa-circle-check"} mr-1"></i>${item.status_label}
            </span>
          </td>
          <td style="text-align: right;">
            <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); App.openComplianceScreeningDrawer('${item.id}')" title="Voir les détails approfondis du filtrage">
              <i class="fas fa-eye text-primary"></i> Détails
            </button>
          </td>
        </tr>
      `;
      })
      .join("");
  },

  openComplianceScreeningDrawer(scrId) {
    this.activeComplianceScreeningId = scrId;
    const item = this.complianceScreeningRegistry.find((s) => s.id === scrId);
    if (!item) return;

    const backdrop = document.getElementById(
      "compliance-screening-drawer-backdrop",
    );
    if (!backdrop) return;

    // Header & Badges
    const refBadge = document.getElementById("scr-drawer-ref-badge");
    const statusBadge = document.getElementById("scr-drawer-status-badge");
    const titleEl = document.getElementById("scr-drawer-title");
    const subtitleEl = document.getElementById("scr-drawer-subtitle");

    if (refBadge) refBadge.textContent = `#${item.id}`;
    if (statusBadge) {
      statusBadge.className = `badge ${item.measure_badge}`;
      statusBadge.innerHTML = `<i class="fas ${item.match_score >= 80 ? "fa-ban" : item.match_score > 0 ? "fa-shield-halved" : "fa-circle-check"}"></i> ${item.status_label}`;
    }
    if (titleEl) titleEl.textContent = item.client_name;
    if (subtitleEl)
      subtitleEl.textContent = `Dossier d'investigation réglementaire • ${item.city} (${item.country}) • ${item.id}`;

    // Section 1 : Fiche d'identification
    const dateEl = document.getElementById("scr-drawer-date");
    const avatarEl = document.getElementById("scr-drawer-avatar");
    const fullnameEl = document.getElementById("scr-drawer-fullname");
    const locEl = document.getElementById("scr-drawer-location");
    const idnumEl = document.getElementById("scr-drawer-idnum");
    const dobEl = document.getElementById("scr-drawer-dob");
    const matchScoreEl = document.getElementById("scr-drawer-match-score");
    const confEl = document.getElementById("scr-drawer-confidence");
    const aliasesEl = document.getElementById("scr-drawer-aliases");
    const profEl = document.getElementById("scr-drawer-profession");

    if (dateEl) dateEl.textContent = item.full_date;
    if (avatarEl) {
      const bgColor =
        item.match_score >= 80
          ? "ef4444"
          : item.match_score > 0
            ? "f59e0b"
            : "10b981";
      avatarEl.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.client_name)}&background=${bgColor}&color=fff`;
    }
    if (fullnameEl) fullnameEl.textContent = item.client_name;
    if (locEl)
      locEl.innerHTML = `<i class="fas fa-location-dot text-primary mr-1"></i> ${item.city} (${item.country}) • ${item.agency}`;
    if (idnumEl) idnumEl.textContent = item.id_number;
    if (dobEl) dobEl.textContent = item.dob;
    if (matchScoreEl) {
      matchScoreEl.textContent = item.match_label;
      matchScoreEl.style.color =
        item.match_score >= 80
          ? "#ef4444"
          : item.match_score > 0
            ? "#f59e0b"
            : "#10b981";
    }
    if (confEl) {
      confEl.textContent =
        item.match_score >= 80
          ? "Index de similarité : Très Élevé"
          : item.match_score > 0
            ? "Index de similarité : Modéré"
            : "Index de similarité : Nul (Conforme)";
    }
    if (aliasesEl) aliasesEl.textContent = item.aliases;
    if (profEl) profEl.textContent = item.profession;

    // Section 2 : Registres & Textes
    const listTypeBadge = document.getElementById("scr-drawer-list-type");
    const legalEl = document.getElementById("scr-drawer-legal-framework");
    const findingsEl = document.getElementById("scr-drawer-findings");

    if (listTypeBadge) {
      listTypeBadge.className = `badge ${item.list_type.includes("Sanctions") ? "badge-rejected" : item.list_type.includes("PPE") ? "badge-warning" : "badge-submitted"}`;
      listTypeBadge.textContent = item.list_type;
    }
    if (legalEl) legalEl.textContent = item.legal_framework;
    if (findingsEl) findingsEl.textContent = item.findings;

    // Section 3 : Diligences & Étapes
    const officerBadge = document.getElementById("scr-drawer-officer");
    if (officerBadge) officerBadge.textContent = item.officer;

    const stepsList = document.getElementById("scr-drawer-steps-list");
    if (stepsList && item.steps) {
      stepsList.innerHTML = item.steps
        .map(
          (s) => `
        <div style="background: var(--bg-body); padding: 0.65rem 0.85rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;">
          <div>
            <div style="font-weight: 700; font-size: 0.82rem; color: var(--text-primary);">${s.title}</div>
            <div style="font-size: 0.72rem; color: var(--text-muted);"><i class="fas fa-clock mr-1"></i>${s.time}</div>
          </div>
          <div style="text-align: right;">
            <span class="badge ${s.badge}" style="font-size: 0.68rem;">
              ${s.status}
            </span>
          </div>
        </div>
      `,
        )
        .join("");
    }

    // Section 4 : SHA-256
    const shaEl = document.getElementById("scr-drawer-sha");
    if (shaEl) shaEl.textContent = item.sha;

    // Toggle doubt button appearance
    const doubtBtn = document.getElementById("scr-drawer-doubt-btn");
    if (doubtBtn) {
      if (item.is_doubt_cleared) {
        doubtBtn.innerHTML =
          '<i class="fas fa-undo mr-1 text-warning"></i> Réactiver Alerte';
      } else {
        doubtBtn.innerHTML =
          '<i class="fas fa-user-check mr-1 text-primary"></i> Lever le Doute';
      }
    }

    backdrop.classList.add("active");
  },

  closeComplianceScreeningDrawer() {
    const backdrop = document.getElementById(
      "compliance-screening-drawer-backdrop",
    );
    if (backdrop) backdrop.classList.remove("active");
  },

  toggleDoubtClearance() {
    const item = this.complianceScreeningRegistry.find(
      (s) => s.id === this.activeComplianceScreeningId,
    );
    if (!item) return;

    if (!item.is_doubt_cleared) {
      item.is_doubt_cleared = true;
      item.status = "DOUBT_CLEARED";
      item.status_label = "Levée de Doute Validée";
      item.measure_badge = "badge-approved";
      item.findings +=
        " [ACTE DU CONTRÔLEUR : Non-homonymie formellement constatée et certifiée par pièce justificative].";
      item.steps.push({
        title: "Levée de Doute Validée par l'Analyste Conformité",
        time: "À l'instant",
        status: "Conforme & Débloqué",
        badge: "badge-approved",
      });
      this.showToast(
        `Levée de doute enregistrée avec succès pour ${item.client_name}. Dossier débloqué.`,
        "success",
      );
    } else {
      item.is_doubt_cleared = false;
      item.status = "BLOCKED";
      item.status_label = "Blocage Conservatoire";
      item.measure_badge = "badge-rejected";
      this.showToast(
        `Alerte de conformité réactivée pour ${item.client_name}. Mesure conservatoire rétablie.`,
        "warning",
      );
    }

    this.renderComplianceScreeningTable();
    this.openComplianceScreeningDrawer(item.id);
  },

  downloadScreeningReportPdf() {
    const item = this.complianceScreeningRegistry.find(
      (s) => s.id === this.activeComplianceScreeningId,
    );
    const ref = item ? item.id : "SCR-2026-0942";
    const name = item ? item.client_name : "Cible";
    this.showToast(
      `Génération du Rapport d'Investigation Conformité LBC/FT pour ${name} (${ref})...`,
      "info",
    );
    setTimeout(() => {
      this.showToast(
        `Rapport d'Investigation ${ref} certifié SHA-256 téléchargé avec succès (Format PDF A/3)`,
        "success",
      );
    }, 800);
  },

  runLiveComplianceScreening() {
    const nameInput = document.getElementById("screening-full-name-input");
    const countrySelect = document.getElementById("screening-country-select");
    const query = nameInput ? nameInput.value.trim() : "";
    const countryCode = countrySelect ? countrySelect.value : "ALL";

    if (!query) {
      this.showToast(
        "Veuillez saisir un nom ou une raison sociale à contrôler",
        "warning",
      );
      return;
    }

    this.showToast(
      `Interrogation des registres ONU, UEMOA & base PPE pour « ${query} »...`,
      "info",
    );

    setTimeout(() => {
      // Check if already in registry
      let match = this.complianceScreeningRegistry.find((s) =>
        s.client_name.toLowerCase().includes(query.toLowerCase()),
      );

      if (!match) {
        // Create a new screening entry
        const countryNames = { ML: "Mali", ALL: "Mali" };
        const country = "Mali";
        const newId = `SCR-2026-0${Math.floor(100 + Math.random() * 899)}`;
        match = {
          id: newId,
          date: "À l'instant",
          full_date: `21/08/2026 ${new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} GMT`,
          client_name: query,
          country: "Mali",
          city: "Bamako",
          agency: "Caisse Bamako Grand Marché (Mali)",
          id_number: `NINA-${Math.floor(100000 + Math.random() * 900000)}`,
          dob: "Date de naissance vérifiée sur document officiel",
          aliases: "Aucun alias suspect",
          profession: "Activité commerciale déclarée",
          list_type: "Base Globale GAFI & CENTIF Mali",
          legal_framework: "Filtrage Réglementaire Standard LBC/FT",
          match_score: 0,
          match_label: "RAS (0%)",
          status: "CLEARED",
          status_label: "Autorisé sans Réserve",
          measure_badge: "badge-approved",
          officer: "Mamadou Traoré (Conformité LBC)",
          findings: `Contrôle instantané en temps réel effectué pour ${query}. Aucune correspondance sur les listes de sanctions régionales UEMOA, ONU ou PPE.`,
          sha: "a1b2c3d4e5f67890123456789012345678901234567890123456789012345678",
          is_doubt_cleared: true,
          steps: [
            {
              title: "Interrogation API Directe Sanctions ONU / UEMOA",
              time: "À l'instant",
              status: "0% Concordance",
              badge: "badge-approved",
            },
            {
              title: "Recherche Base Personnes Politiquement Exposées",
              time: "À l'instant",
              status: "Non Répertorié",
              badge: "badge-approved",
            },
            {
              title: "Certification Conformité",
              time: "À l'instant",
              status: "Autorisé",
              badge: "badge-approved",
            },
          ],
        };
        this.complianceScreeningRegistry.unshift(match);
        this.renderComplianceScreeningTable();
      }

      this.showToast(
        `Contrôle terminé pour ${match.client_name} : ${match.status_label}`,
        match.match_score >= 80
          ? "error"
          : match.match_score > 0
            ? "warning"
            : "success",
      );
      this.openComplianceScreeningDrawer(match.id);
    }, 600);
  },

  // 5. General Controls
  initTheme() {
    const savedTheme = localStorage.getItem("THEME_PREF") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
    this.updateThemeButtonIcon(savedTheme);

    const themeToggleBtn = document.getElementById("theme-toggle-btn");
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener("click", () => {
        const current =
          document.documentElement.getAttribute("data-theme") || "light";
        const next = current === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", next);
        localStorage.setItem("THEME_PREF", next);
        this.updateThemeButtonIcon(next);
        this.showToast(
          `Mode ${next === "dark" ? "Sombre" : "Clair"} activé`,
          "info",
        );
      });
    }
  },

  updateThemeButtonIcon(theme) {
    const btn = document.getElementById("theme-toggle-btn");
    if (btn) {
      btn.innerHTML =
        theme === "dark"
          ? '<i class="fas fa-sun" style="color: #f59e0b;"></i>'
          : '<i class="fas fa-moon"></i>';
    }
  },

  initSidebarToggle() {
    const toggleBtn = document.getElementById("sidebar-toggle-btn");
    const closeBtn = document.getElementById("sidebar-close-btn");
    const sidebar = document.getElementById("sidebar");
    const backdrop = document.getElementById("sidebar-backdrop");

    const toggleDrawer = () => {
      if (window.innerWidth < 768) {
        const isOpen = sidebar.classList.toggle("mobile-open");
        if (backdrop) {
          if (isOpen) {
            backdrop.style.display = "block";
            setTimeout(() => backdrop.classList.add("active"), 10);
          } else {
            backdrop.classList.remove("active");
            setTimeout(() => (backdrop.style.display = "none"), 250);
          }
        }
      } else {
        document.body.classList.toggle("sidebar-collapsed");
      }
    };

    const closeMobileDrawer = () => {
      if (sidebar) sidebar.classList.remove("mobile-open");
      if (backdrop) {
        backdrop.classList.remove("active");
        setTimeout(() => (backdrop.style.display = "none"), 250);
      }
    };

    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleDrawer();
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", (e) => {
        e.preventDefault();
        closeMobileDrawer();
      });
    }

    if (backdrop) {
      backdrop.addEventListener("click", () => {
        closeMobileDrawer();
      });
    }
  },

  // Live Date & Clock Display in Topbar (Updating Every Second)
  initLiveDateTime() {
    const clockEl = document.getElementById("topbar-clock-display");
    if (!clockEl) return;

    const updateClock = () => {
      const now = new Date();

      const days = ["Dim.", "Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam."];
      const months = [
        "janv.",
        "févr.",
        "mars",
        "avr.",
        "mai",
        "juin",
        "juil.",
        "août",
        "sept.",
        "oct.",
        "nov.",
        "déc.",
      ];

      const dayName = days[now.getDay()];
      const dayNum = now.getDate();
      const monthName = months[now.getMonth()];
      const year = now.getFullYear();

      const hours = String(now.getHours()).padStart(2, "0");
      const mins = String(now.getMinutes()).padStart(2, "0");
      const secs = String(now.getSeconds()).padStart(2, "0");

      clockEl.textContent = `${dayName} ${dayNum} ${monthName} ${year} • ${hours}:${mins}:${secs}`;
    };

    updateClock();
    setInterval(updateClock, 1000);
  },

  // Profile Dropbox (Dropdown: Paramètres & Déconnexion)
  initProfileDropdown() {
    const profileBtn = document.getElementById("topbar-profile-btn");
    const profileMenu = document.getElementById("profile-dropdown-menu");

    if (profileBtn && profileMenu) {
      profileBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = profileMenu.classList.toggle("show");
        profileBtn.classList.toggle("active", isOpen);

        // Close notifications if open
        const notifDropdown = document.getElementById("notif-dropdown");
        if (notifDropdown) notifDropdown.style.display = "none";
      });

      // Close dropdown when clicking anywhere outside
      document.addEventListener("click", (e) => {
        if (!profileBtn.contains(e.target) && !profileMenu.contains(e.target)) {
          profileMenu.classList.remove("show");
          profileBtn.classList.remove("active");
        }
      });

      // Close on Escape key
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          profileMenu.classList.remove("show");
          profileBtn.classList.remove("active");
          const logoutModal = document.getElementById("modal-confirm-logout");
          if (logoutModal && logoutModal.style.display !== "none") {
            this.closeLogoutConfirmModal();
          }
          if (typeof this.closeClientRequestDrawer === "function") {
            this.closeClientRequestDrawer();
          }
          if (typeof this.closeScheduleDrawer === "function") {
            this.closeScheduleDrawer();
          }
        }
      });
    }
  },

  // Edit Profile Modal Handlers (Email & Phone / Mobile Money updates)
  openEditProfileModal() {
    const modal = document.getElementById("modal-edit-profile");
    const profileMenu = document.getElementById("profile-dropdown-menu");
    const profileBtn = document.getElementById("topbar-profile-btn");
    if (profileMenu) profileMenu.classList.remove("show");
    if (profileBtn) profileBtn.classList.remove("active");

    const user = this.currentUser || APP_CONSTANTS.DEMO_ACCOUNTS[2];

    const emailInput = document.getElementById("edit-profile-email");
    const phoneInput = document.getElementById("edit-profile-phone");
    const titleInput = document.getElementById("edit-profile-title");
    const avatarImg = document.getElementById("edit-profile-avatar-img");
    const avatarFlag = document.getElementById("edit-profile-avatar-flag");
    const cardName = document.getElementById("edit-profile-card-name");
    const cardRole = document.getElementById("edit-profile-card-role");
    const cardLocation = document.getElementById("edit-profile-card-location");

    if (emailInput) emailInput.value = user.email || "";
    if (phoneInput) phoneInput.value = user.phone || "+226 70 88 99 00";
    if (titleInput)
      titleInput.value = `${user.title || ""} • ${user.location || ""}`;
    if (avatarImg) avatarImg.src = user.avatar || "";
    if (cardName) cardName.textContent = user.name || "";

    const roleConfig =
      APP_CONSTANTS.ROLES[user.role] || APP_CONSTANTS.ROLES.ANALYST;
    if (cardRole) {
      cardRole.textContent = roleConfig.shortName || roleConfig.name;
      cardRole.style.color = roleConfig.badgeColor;
      cardRole.style.backgroundColor = roleConfig.badgeBg;
      cardRole.style.borderColor = roleConfig.badgeColor;
    }

    if (cardLocation) {
      const locSpan = cardLocation.querySelector("span");
      if (locSpan) locSpan.textContent = user.location || "UEMOA";
    }

    if (avatarFlag) {
      const flagCode = (
        user.countryFlag ||
        user.countryCode ||
        "bf"
      ).toLowerCase();
      avatarFlag.innerHTML = `<span class="fi fi-${flagCode} fis" title="${user.countryName || "UEMOA"}"></span>`;
    }

    if (modal) {
      modal.style.display = "flex";
      setTimeout(() => modal.classList.add("active"), 10);
    }
  },

  closeEditProfileModal() {
    const modal = document.getElementById("modal-edit-profile");
    if (modal) {
      modal.classList.remove("active");
      setTimeout(() => (modal.style.display = "none"), 250);
    }
  },

  saveUserProfile() {
    const emailInput = document.getElementById("edit-profile-email");
    const phoneInput = document.getElementById("edit-profile-phone");

    if (!emailInput || !phoneInput) return;

    const newEmail = emailInput.value.trim();
    const newPhone = phoneInput.value.trim();

    if (!newEmail || !newEmail.includes("@")) {
      this.showToast("Veuillez saisir une adresse e-mail valide", "danger");
      return;
    }

    if (!newPhone || newPhone.length < 6) {
      this.showToast("Veuillez saisir un numéro de téléphone valide", "danger");
      return;
    }

    if (this.currentUser) {
      this.currentUser.email = newEmail;
      this.currentUser.phone = newPhone;
      localStorage.setItem("AUTH_USER", JSON.stringify(this.currentUser));
    }

    // Update in UI
    const menuEmail = document.getElementById("menu-user-email");
    if (menuEmail) menuEmail.textContent = newEmail;

    this.closeEditProfileModal();
    this.showToast(
      `Profil mis à jour : E-mail (${newEmail}) et Téléphone (${newPhone}) enregistrés`,
      "success",
    );
  },

  // Settings Modal Handlers
  openSettingsModal() {
    const modal = document.getElementById("settings-modal");
    const profileMenu = document.getElementById("profile-dropdown-menu");
    const profileBtn = document.getElementById("topbar-profile-btn");
    if (profileMenu) profileMenu.classList.remove("show");
    if (profileBtn) profileBtn.classList.remove("active");

    if (modal) {
      modal.style.display = "flex";
      setTimeout(() => modal.classList.add("active"), 10);

      const currentTheme =
        document.documentElement.getAttribute("data-theme") || "light";
      this.updateSettingsThemeUI(currentTheme);
    }
  },

  closeSettingsModal() {
    const modal = document.getElementById("settings-modal");
    if (modal) {
      modal.classList.remove("active");
      setTimeout(() => (modal.style.display = "none"), 250);
    }
  },

  setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("THEME_PREF", theme);
    this.updateThemeButtonIcon(theme);
    this.updateSettingsThemeUI(theme);
    this.showToast(
      `Thème basculé en mode ${theme === "dark" ? "Sombre" : "Clair"}`,
      "info",
    );
  },

  updateSettingsThemeUI(theme) {
    const optLight = document.getElementById("opt-theme-light");
    const optDark = document.getElementById("opt-theme-dark");
    if (optLight && optDark) {
      optLight.classList.toggle("active", theme === "light");
      optDark.classList.toggle("active", theme === "dark");
    }
  },

  updateUserCountry(code) {
    const map = {
      ML: { name: "Mali (Bamako)", code: "ml" },
    };
    const c = map[code] || map["ML"];

    // 1. Update circular overlay flag badge on topbar user avatar
    const topbarAvatarFlag = document.getElementById("topbar-avatar-flag");
    if (topbarAvatarFlag) {
      topbarAvatarFlag.innerHTML = `<span class="fi fi-${c.code} fis" title="${c.name}"></span>`;
    }

    // 2. Update circular overlay flag badge in profile dropdown header
    const menuAvatarFlag = document.getElementById("menu-avatar-flag");
    if (menuAvatarFlag) {
      menuAvatarFlag.innerHTML = `<span class="fi fi-${c.code} fis" title="${c.name}"></span>`;
    }

    // 3. Update circular overlay flag badge on sidebar user avatar
    const sidebarAvatarFlag = document.getElementById("sidebar-avatar-flag");
    if (sidebarAvatarFlag) {
      sidebarAvatarFlag.innerHTML = `<span class="fi fi-${c.code} fis" title="${c.name}"></span>`;
    }

    // 4. Update sidebar region text
    const sidebarCountryText = document.getElementById("sidebar-country-text");
    if (sidebarCountryText) {
      sidebarCountryText.textContent = c.name;
    }

    // 5. Update settings modal country select if open
    const settingCountrySelect = document.getElementById("setting-country");
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
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log(
              "[ServiceWorker] Registre actif avec portée :",
              registration.scope,
            );
          })
          .catch((err) => {
            console.warn(
              "[ServiceWorker] Note : Enregistrement SW en environnement de prévisualisation :",
              err,
            );
          });
      });
    }

    // 2. Listen to network connectivity changes
    window.addEventListener("online", () => {
      this.updateOfflineStatus(true);
      this.showToast(
        "Connexion rétablie : Synchronisation temps réel active",
        "success",
      );
    });

    window.addEventListener("offline", () => {
      this.updateOfflineStatus(false);
      this.showToast(
        "Mode Hors-Ligne Actif : Vos données du tableau de bord restent consultables via le cache local",
        "info",
      );
    });

    // Check initial connectivity status
    this.updateOfflineStatus(navigator.onLine);
  },

  updateOfflineStatus(isOnline) {
    const topbarBadge = document.getElementById("topbar-offline-badge");
    const borrowerAlert = document.getElementById("borrower-offline-alert");

    if (topbarBadge) {
      topbarBadge.style.display = isOnline ? "none" : "inline-flex";
    }
    if (borrowerAlert) {
      borrowerAlert.style.display = isOnline ? "none" : "block";
    }
  },

  saveSettings() {
    this.closeSettingsModal();
    this.showToast(
      "Vos préférences ont été enregistrées avec succès",
      "success",
    );
  },

  initRoleSelector() {
    const roleSelect = document.getElementById("global-role-select");
    if (roleSelect) {
      roleSelect.addEventListener("change", (e) => {
        const role = e.target.value;
        const persona =
          APP_CONSTANTS.DEMO_ACCOUNTS.find((a) => a.role === role) ||
          APP_CONSTANTS.DEMO_ACCOUNTS[0];
        this.login(persona);
      });
    }
  },

  initSearch() {
    const searchInput = document.getElementById("global-search-input");
    const searchContainer = document.getElementById("topbar-search-container");
    const mobileSearchBtn = document.getElementById(
      "mobile-search-trigger-btn",
    );
    const closeMobileSearchBtn = document.getElementById(
      "search-close-mobile-btn",
    );

    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        const q = e.target.value;
        if (this.currentRole === "ANALYST") {
          AppInteractions.renderRequestsTable("ALL", q);
        }
      });
    }

    if (mobileSearchBtn && searchContainer) {
      mobileSearchBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        searchContainer.classList.add("mobile-active");
        if (searchInput) searchInput.focus();
      });
    }

    if (closeMobileSearchBtn && searchContainer) {
      closeMobileSearchBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        searchContainer.classList.remove("mobile-active");
      });
    }

    document.addEventListener("click", (e) => {
      if (
        searchContainer &&
        searchContainer.classList.contains("mobile-active")
      ) {
        if (
          !searchContainer.contains(e.target) &&
          (!mobileSearchBtn || !mobileSearchBtn.contains(e.target))
        ) {
          searchContainer.classList.remove("mobile-active");
        }
      }
    });
  },

  // =========================================================================
  // ROLE-BASED NOTIFICATIONS MANAGER
  // =========================================================================
  currentRoleNotifications: [],
  currentNotifFilter: "ALL",

  initNotifications() {
    const notifBtn = document.getElementById("notif-bell-btn");
    const notifDropdown = document.getElementById("notif-dropdown");

    if (notifBtn && notifDropdown) {
      notifBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = notifDropdown.style.display === "block";
        notifDropdown.style.display = isOpen ? "none" : "block";

        // Close profile dropdown if open
        const profileMenu = document.getElementById("profile-dropdown-menu");
        const profileBtn = document.getElementById("topbar-profile-btn");
        if (profileMenu) profileMenu.classList.remove("show");
        if (profileBtn) profileBtn.classList.remove("active");
      });

      // Close dropdown when clicking outside
      document.addEventListener("click", (e) => {
        if (!notifBtn.contains(e.target) && !notifDropdown.contains(e.target)) {
          notifDropdown.style.display = "none";
        }
      });

      // Close on Escape key
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          notifDropdown.style.display = "none";
        }
      });
    }
  },

  renderNotificationsForRole(roleCode) {
    const role =
      roleCode || (this.currentUser ? this.currentUser.role : "ANALYST");
    const roleConfig = APP_CONSTANTS.ROLES[role] || APP_CONSTANTS.ROLES.ANALYST;

    // Load list from constants clone
    const notifs =
      (APP_CONSTANTS.ROLE_NOTIFICATIONS &&
        APP_CONSTANTS.ROLE_NOTIFICATIONS[role]) ||
      [];
    this.currentRoleNotifications = JSON.parse(JSON.stringify(notifs));
    this.currentNotifFilter = "ALL";

    // Subtitle update
    const subtitleEl = document.getElementById("notif-header-subtitle");
    if (subtitleEl) {
      subtitleEl.textContent = `Alertes & Flux : Espace ${roleConfig.name}`;
    }

    // Render Filter Chips
    const filterContainer = document.getElementById("notif-filter-bar");
    if (filterContainer) {
      const filters = (APP_CONSTANTS.ROLE_NOTIFICATION_FILTERS &&
        APP_CONSTANTS.ROLE_NOTIFICATION_FILTERS[role]) || [
        { key: "ALL", label: "Toutes" },
      ];
      filterContainer.innerHTML = filters
        .map(
          (f, idx) => `
        <button class="notif-chip ${idx === 0 ? "active" : ""}" data-filter-key="${f.key}" onclick="App.filterNotifications('${f.key}', this)">
          ${f.icon ? `<i class="fas ${f.icon} mr-1"></i>` : ""} ${f.label}
        </button>
      `,
        )
        .join("");
    }

    // Update Footer Action Button text
    const footerText = document.getElementById("notif-footer-action-text");
    if (footerText) {
      if (role === "CLIENT")
        footerText.textContent = "Accéder à mes demandes & dossiers";
      else if (role === "CREDIT_OFFICER")
        footerText.textContent = "Consulter le portefeuille guichet";
      else if (role === "COMMITTEE")
        footerText.textContent = "Voir les décisions & procès-verbaux";
      else if (role === "COMPLIANCE")
        footerText.textContent = "Ouvrir le registre d'audit LBC/FT";
      else footerText.textContent = "Consulter l'historique d'audit CIF";
    }

    this.updateNotificationListUI();
  },

  updateNotificationListUI() {
    const container = document.getElementById("notif-list-container");
    const badgeTop = document.getElementById("topbar-notif-badge");
    const badgeUnread = document.getElementById("notif-unread-count-badge");
    if (!container) return;

    const notifs = this.currentRoleNotifications || [];
    const unreadCount = notifs.filter((n) => n.unread).length;

    // Update Topbar badge & bell pulse animation
    const notifBtn = document.getElementById("notif-bell-btn");
    if (badgeTop) {
      badgeTop.textContent = unreadCount;
      badgeTop.style.display = unreadCount > 0 ? "flex" : "none";
      badgeTop.classList.toggle("pulse", unreadCount > 0);
    }
    if (notifBtn) {
      notifBtn.classList.toggle("has-unread", unreadCount > 0);
      notifBtn.classList.toggle("bell-pulse", unreadCount > 0);
    }

    // Update Dropdown header badge
    if (badgeUnread) {
      badgeUnread.textContent = `${unreadCount} Non Lue${unreadCount > 1 ? "s" : ""}`;
      badgeUnread.className = `badge ${unreadCount > 0 ? "badge-submitted" : "badge-approved"}`;
    }

    // Filter items
    const filtered =
      this.currentNotifFilter === "ALL"
        ? notifs
        : notifs.filter((n) => n.category === this.currentNotifFilter);

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 2rem 1rem; color: var(--text-subtle);">
          <i class="fas fa-bell-slash" style="font-size: 1.8rem; margin-bottom: 0.5rem; opacity: 0.5;"></i>
          <p style="font-size: 0.82rem; margin: 0;">Aucune notification dans cette catégorie.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered
      .map(
        (item) => `
      <div class="notif-item ${item.unread ? "unread" : ""} notif-cat-${item.category}" onclick="App.handleNotificationClick(${item.id}, '${item.targetView}')">
        <div class="notif-item-icon ${item.iconType || "primary"}">
          <i class="fas ${item.icon}"></i>
        </div>
        <div class="notif-item-content">
          <div class="notif-item-header">
            <span class="notif-item-title">${item.title}</span>
            ${item.unread ? '<span class="notif-unread-dot"></span>' : ""}
          </div>
          <p class="notif-item-desc">${item.desc}</p>
          <div class="notif-item-meta">
            <span class="notif-item-tag"><i class="fas fa-tag mr-1"></i> ${item.tag}</span>
            <span class="notif-item-time"><i class="far fa-clock mr-1"></i> ${item.time}</span>
          </div>
        </div>
      </div>
    `,
      )
      .join("");
  },

  filterNotifications(category, chipEl) {
    this.currentNotifFilter = category;
    const chips = document.querySelectorAll("#notif-filter-bar .notif-chip");
    chips.forEach((c) => c.classList.remove("active"));
    if (chipEl) chipEl.classList.add("active");
    this.updateNotificationListUI();
  },

  handleNotificationClick(notifId, targetView) {
    const notif = (this.currentRoleNotifications || []).find(
      (n) => n.id === notifId,
    );
    if (notif) {
      notif.unread = false;
    }

    this.updateNotificationListUI();

    // Close notification dropdown
    const notifDropdown = document.getElementById("notif-dropdown");
    if (notifDropdown) notifDropdown.style.display = "none";

    // Navigate to target view if provided and valid
    if (targetView) {
      this.switchView(targetView);
    }
  },

  markAllNotificationsRead() {
    (this.currentRoleNotifications || []).forEach((n) => {
      n.unread = false;
    });
    this.updateNotificationListUI();
    this.showToast(
      "Toutes les notifications ont été marquées comme lues",
      "success",
    );
  },

  handleNotifFooterAction() {
    const notifDropdown = document.getElementById("notif-dropdown");
    if (notifDropdown) notifDropdown.style.display = "none";

    const role =
      this.currentRole ||
      (this.currentUser ? this.currentUser.role : "ANALYST");
    if (role === "CLIENT") {
      this.switchView("view-client-requests");
    } else if (role === "CREDIT_OFFICER") {
      this.switchView("view-agent-clients");
    } else if (role === "COMMITTEE") {
      this.switchView("view-role-committee");
    } else if (role === "COMPLIANCE") {
      this.switchView("view-audit-logs");
    } else {
      this.switchView("view-audit-logs");
    }
  },

  initClientWizard() {
    let currentStep = 1;
    const totalSteps = 6;

    const setStep = (step) => {
      currentStep = step;
      document
        .querySelectorAll(".wizard-step-content")
        .forEach((el) => (el.style.display = "none"));
      const activeContent = document.getElementById(`wizard-step-${step}`);
      if (activeContent) activeContent.style.display = "block";

      document.querySelectorAll(".wizard-step").forEach((el, idx) => {
        const stepNum = idx + 1;
        el.classList.remove("active", "completed");
        if (stepNum === step) el.classList.add("active");
        else if (stepNum < step) el.classList.add("completed");
      });
    };

    document.querySelectorAll("[data-wizard-action]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const action = btn.getAttribute("data-wizard-action");
        if (action === "next" && currentStep < totalSteps) {
          setStep(currentStep + 1);
        } else if (action === "prev" && currentStep > 1) {
          setStep(currentStep - 1);
        } else if (action === "submit") {
          this.submitNewCreditRequest();
        }
      });
    });

    [
      "wiz-income",
      "wiz-expenses",
      "wiz-debt",
      "wiz-amount",
      "wiz-duration",
    ].forEach((id) => {
      const el = document.getElementById(id);
      if (el)
        el.addEventListener("input", () => this.updateWizardCalculation());
    });

    // Close on backdrop click for modal-loan-application
    const loanModal = document.getElementById("modal-loan-application");
    if (loanModal) {
      loanModal.addEventListener("click", (e) => {
        if (e.target === loanModal) {
          this.closeNewLoanModal();
        }
      });
    }

    this.updateWizardCalculation();
  },

  updateWizardCalculation() {
    const inc = Number(document.getElementById("wiz-income")?.value || 850000);
    const exp = Number(
      document.getElementById("wiz-expenses")?.value || 320000,
    );
    const debt = Number(document.getElementById("wiz-debt")?.value || 0);
    const amount = Number(
      document.getElementById("wiz-amount")?.value || 2500000,
    );
    const months = Number(document.getElementById("wiz-duration")?.value || 12);

    const cap = CreditScoringEngine.calculateCapacity(
      inc,
      0,
      exp,
      debt,
      amount,
      months,
    );

    const dispEl = document.getElementById("wiz-calc-disposable");
    const instEl = document.getElementById("wiz-calc-installment");
    const badgeEl = document.getElementById("wiz-calc-status");

    if (dispEl)
      dispEl.textContent = CreditScoringEngine.formatFCFA(cap.disposableIncome);
    if (instEl)
      instEl.textContent = CreditScoringEngine.formatFCFA(cap.estimatedPayment);
    if (badgeEl) {
      badgeEl.className = `badge ${cap.isSufficient ? "badge-capacity-sufficient" : "badge-capacity-insufficient"}`;
      badgeEl.textContent = cap.statusText;
    }
  },

  openNewLoanModal(prefillOptions = {}) {
    const modal = document.getElementById("modal-loan-application");
    if (!modal) return;

    this.setModalWizardStep(1);

    // Adapt modal branding and texts according to user role
    const titleEl = document.getElementById("modal-loan-app-title");
    const badgeEl = document.getElementById("modal-loan-app-badge");
    const subtitleEl = document.getElementById("modal-loan-app-subtitle");
    const submitBtnEl = document.getElementById("modal-loan-app-submit-btn");
    const headerEl = document.getElementById("modal-loan-app-header");

    if (this.currentRole === "CREDIT_OFFICER") {
      if (titleEl)
        titleEl.textContent = "Enregistrer une Demande de Prêt (Guichet)";
      if (badgeEl) badgeEl.textContent = "Agent de Crédit";
      if (subtitleEl)
        subtitleEl.textContent =
          "Saisie de dossier pour un sociétaire, vérification KYC & transmission au pôle Risque";
      if (submitBtnEl)
        submitBtnEl.innerHTML =
          '<i class="fas fa-paper-plane mr-2"></i> Enregistrer & Transmettre au Pôle Risque';
      if (headerEl)
        headerEl.style.background = "linear-gradient(135deg, #0284c7, #0369a1)";
    } else {
      if (titleEl) titleEl.textContent = "Faire une Demande de Prêt CIF";
      if (badgeEl) badgeEl.textContent = "Parcours 6 Étapes";
      if (subtitleEl)
        subtitleEl.textContent =
          "Instruction rapide, calcul transparent de votre mensualité & transmission sécurisée à votre conseiller";
      if (submitBtnEl)
        submitBtnEl.innerHTML =
          '<i class="fas fa-paper-plane mr-2"></i> Confirmer & Soumettre ma Demande';
      if (headerEl)
        headerEl.style.background = "linear-gradient(135deg, #059669, #047857)";
    }

    if (prefillOptions.amount) {
      const amountEl = document.getElementById("wiz-amount");
      if (amountEl) {
        amountEl.value = prefillOptions.amount;
        amountEl.dispatchEvent(new Event("input"));
      }
    }
    if (prefillOptions.duration) {
      const durationEl = document.getElementById("wiz-duration");
      if (durationEl) {
        durationEl.value = prefillOptions.duration;
        durationEl.dispatchEvent(new Event("input"));
      }
    }
    if (prefillOptions.purpose) {
      const purposeEl = document.getElementById("wiz-purpose");
      if (purposeEl) purposeEl.value = prefillOptions.purpose;
    }

    modal.style.display = "flex";
    requestAnimationFrame(() => {
      modal.classList.add("active");
    });

    this.updateWizardCalculation();
  },

  closeNewLoanModal() {
    const modal = document.getElementById("modal-loan-application");
    if (!modal) return;
    modal.classList.remove("active");
    setTimeout(() => {
      modal.style.display = "none";
    }, 200);
  },

  setModalWizardStep(step) {
    const totalSteps = 6;
    if (step < 1 || step > totalSteps) return;

    document
      .querySelectorAll(".modal-wizard-step-content")
      .forEach((el) => (el.style.display = "none"));
    const activeContent = document.getElementById(`modal-wizard-step-${step}`);
    if (activeContent) activeContent.style.display = "block";

    document.querySelectorAll('[id^="modal-wstep-"]').forEach((el, idx) => {
      const stepNum = idx + 1;
      el.classList.remove("active", "completed");
      if (stepNum === step) el.classList.add("active");
      else if (stepNum < step) el.classList.add("completed");
    });

    this.updateWizardCalculation();
  },

  handleWizardProfileModeChange(mode) {
    const isCold = mode === "COLD_START";
    const labelStd =
      document.getElementById("label-profile-standard") ||
      document.getElementById("modal-label-profile-standard");
    const labelCold =
      document.getElementById("label-profile-coldstart") ||
      document.getElementById("modal-label-profile-coldstart");
    const indicator =
      document.getElementById("wiz-cold-start-indicator") ||
      document.getElementById("modal-wiz-cold-start-indicator");
    const info =
      document.getElementById("wiz-cold-start-info") ||
      document.getElementById("modal-wiz-cold-start-info");

    if (labelStd && labelCold) {
      if (isCold) {
        labelCold.style.borderColor = "var(--primary-600)";
        labelCold.style.background = "var(--cif-emerald-50, #f0fdf4)";
        labelStd.style.borderColor = "var(--border-color)";
        labelStd.style.background = "var(--bg-surface)";
      } else {
        labelStd.style.borderColor = "var(--primary-600)";
        labelStd.style.background = "var(--cif-primary-50, #eff6ff)";
        labelCold.style.borderColor = "var(--border-color)";
        labelCold.style.background = "var(--bg-surface)";
      }
    }

    if (indicator) {
      indicator.className = isCold
        ? "badge badge-warning"
        : "badge badge-submitted";
      indicator.innerHTML = isCold
        ? '<i class="fas fa-check"></i> Mode Cold Start Activé'
        : '<i class="fas fa-history"></i> Mode Standard (Historique)';
    }

    if (info) {
      info.style.display = isCold ? "block" : "none";
    }
  },

  submitNewCreditRequest() {
    const clientName =
      document.getElementById("wiz-fullname")?.value || "Fatou Ndiaye";
    const city = document.getElementById("wiz-city")?.value || "Bamako";
    const country = document.getElementById("wiz-country")?.value || "Mali";
    const amount = Number(
      document.getElementById("wiz-amount")?.value || 2500000,
    );
    const months = Number(document.getElementById("wiz-duration")?.value || 12);
    const purpose =
      document.getElementById("wiz-purpose")?.value ||
      "Achat de stock conteneur tissus wax et bazin riche";
    const inc = Number(document.getElementById("wiz-income")?.value || 850000);
    const exp = Number(
      document.getElementById("wiz-expenses")?.value || 320000,
    );

    const isColdStart =
      (document.querySelector('input[name="wiz-profile-mode"]:checked')
        ?.value || "COLD_START") === "COLD_START";

    const cap = CreditScoringEngine.calculateCapacity(
      inc,
      0,
      exp,
      0,
      amount,
      months,
    );

    // Create or find client
    const newClient = DB.insert("clients", {
      user_id: 4,
      client_number: `${country.substring(0, 2).toUpperCase()}-${city.substring(0, 3).toUpperCase()}-00${Math.floor(1000 + Math.random() * 9000)}`,
      address: city,
      city: city,
      residential_zone: "Zone Urbaine Commerciale",
      occupation:
        document.getElementById("wiz-sector")?.value ||
        "Commerce de Tissus & Habillement (Wax/Bazin)",
      kyc_status: "VERIFIED",
      institution_verified_at: new Date().toISOString(),
      is_cold_start: isColdStart,
    });

    const newReq = DB.insert("credit_requests", {
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
      status: "SUBMITTED",
      created_at: new Date().toISOString(),
      client_name: clientName,
      country: country,
      city: city,
      is_cold_start: isColdStart,
      score: isColdStart ? 84 : 78,
    });

    const newDoc = DB.insert("documents", {
      credit_request_id: newReq.id,
      document_type: "FACTURE_PROFORMA",
      original_filename: "Facture_Proforma_Tissus_Lome.pdf",
      file_path: "assets/docs/devis.pdf",
      uploaded_at: new Date().toISOString(),
    });

    OCREngine.scanDocument(newDoc.id);

    DB.addAuditLog(
      4,
      "NEW_CREDIT_SUBMISSION",
      "credit_requests",
      newReq.id,
      `Nouvelle demande de ${CreditScoringEngine.formatFCFA(amount)} déposée par ${clientName}`,
    );

    // Close the application modal
    this.closeNewLoanModal();

    if (this.currentRole === "CREDIT_OFFICER") {
      this.renderAgentPipeline();
      this.showToast(
        `Demande #${newReq.request_number} enregistrée au guichet`,
        "success",
      );
    }

    this.showSuccessModal({
      title:
        this.currentRole === "CREDIT_OFFICER"
          ? "Dossier de Crédit Enregistré au Guichet !"
          : "Demande de Financement Déposée avec Succès !",
      subtitle: `Le dossier #${newReq.request_number} pour ${clientName} a été scellé et transmis au pôle d'analyse des risques.`,
      reference: newReq.request_number,
      amount: CreditScoringEngine.formatFCFA(amount),
      payment: `${CreditScoringEngine.formatFCFA(cap.estimatedPayment)} / mois (${months} mois)`,
      statusHtml:
        '<i class="fas fa-circle-check"></i> Enregistré & En Attente d\'Analyse',
      statusClass: "badge-approved",
      primaryBtnText:
        this.currentRole === "CREDIT_OFFICER"
          ? "Consulter les Dossiers en Cours"
          : "Consulter mon Tableau de Bord Emprunteur",
      onPrimaryClick: () => {
        if (this.currentRole === "CREDIT_OFFICER") {
          this.switchView("view-role-agent");
          this.renderAgentPipeline();
        } else if (this.currentRole === "CLIENT") {
          this.switchView("view-role-client");
        } else {
          this.switchView("view-analyst-dossiers");
          AppInteractions.renderRequestsTable();
        }
      },
      receiptTitle: `Recipisse_Demande_${newReq.request_number}.pdf`,
    });
  },

  initComplianceScreening() {
    const screenBtn = document.getElementById("btn-screen-client");
    const nameInput = document.getElementById("screen-client-name");
    const resultBox = document.getElementById("screening-result-box");

    const performScreen = (inputEl, targetBox) => {
      const query = inputEl ? inputEl.value.trim().toLowerCase() : "";
      if (!query) {
        this.showToast("Veuillez saisir un nom ou matricule client", "warning");
        return;
      }

      const watchlist = DB.get("sanctions_watchlist") || [];
      const match = watchlist.find(
        (item) =>
          (item.full_name && item.full_name.toLowerCase().includes(query)) ||
          (item.aliases && item.aliases.toLowerCase().includes(query)),
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
        this.showToast(
          "Alerte LBC/FT détectée sur la liste de surveillance !",
          "danger",
        );
      } else {
        if (targetBox) {
          targetBox.innerHTML = `
            <div class="anomaly-item info" style="margin-top: 1rem;">
              <i class="fas fa-circle-check anomaly-icon" style="color: #10b981;"></i>
              <div class="anomaly-content">
                <h5>Contrôle Négatif - Aucun Signalement</h5>
                <p>Le client '<strong>${inputEl ? inputEl.value : ""}</strong>' ne figure sur aucune liste de sanctions UEMOA/ONU/GAFI et ne présente pas d'alerte PPE bloquante.</p>
              </div>
            </div>
          `;
        }
        this.showToast("Filtrage conforme : Aucun risque détecté", "success");
      }
    };

    if (screenBtn && nameInput) {
      screenBtn.addEventListener("click", () =>
        performScreen(nameInput, resultBox),
      );
      nameInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          performScreen(nameInput, resultBox);
        }
      });
    }

    const altInput = document.getElementById("screening-full-name-input");
    if (altInput) {
      altInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          this.showToast(
            "Contrôle approfondi exécuté : Diligence conforme",
            "success",
          );
        }
      });
    }
  },

  renderAuditLogs() {
    const container = document.getElementById("audit-logs-table-body");
    if (!container) return;

    const logs = DB.get("audit_logs");
    container.innerHTML = logs
      .map(
        (log) => `
      <tr>
        <td>
          <span style="font-family: var(--font-family-code); font-size: 0.76rem;">${new Date(log.created_at || log.timestamp).toLocaleString("fr-FR")}</span>
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
    `,
      )
      .join("");
  },

  // =========================================================================
  // CLIENT / DEMANDEUR EXTENDED FEATURES & INTERACTIONS
  // =========================================================================

  /**
   * Analyse et met en surbrillance rouge les pièces justificatives dont la date d'échéance / validité
   * expire dans les 30 prochains jours (ou déjà expirées).
   * @param {Object} options Options de calcul (referenceDate, maxDaysAlert, etc.)
   */
  checkAndHighlightExpiringDocs(options = {}) {
    const grid = document.getElementById("client-documents-grid");
    if (!grid) return;

    const cards = grid.querySelectorAll(".doc-card-item");
    const now = options.referenceDate
      ? new Date(options.referenceDate)
      : new Date();
    const thresholdDays =
      typeof options.thresholdDays === "number" ? options.thresholdDays : 30;

    let expiringCount = 0;
    const expiringDocs = [];

    cards.forEach((card) => {
      const validityStr = card.dataset.validityDate;
      if (!validityStr) {
        card.setAttribute("data-is-expiring", "false");
        return;
      }

      const validityDate = new Date(validityStr + "T23:59:59");
      if (isNaN(validityDate.getTime())) {
        card.setAttribute("data-is-expiring", "false");
        return;
      }

      // Difference in days (rounded up to full day)
      const diffTime = validityDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const titleEl = card.querySelector("h4");
      const docTitle = titleEl ? titleEl.textContent.trim() : "Document";
      const validityContainer = card.querySelector(".doc-validity-row");
      const headerBadgeSlot = card.querySelector(".doc-header-badge-slot");
      const footerStatusBadge = card.querySelector(".doc-footer-status");

      const formattedValidityDate = validityDate.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      if (diffDays <= thresholdDays) {
        // Document validity is within the next 30 days (or expired) -> HIGHLIGHT IN RED
        expiringCount++;
        expiringDocs.push({
          title: docTitle,
          days: diffDays,
          dateStr: formattedValidityDate,
          isExpired: diffDays < 0,
        });

        card.classList.add("doc-card-expiring-soon");
        card.setAttribute("data-is-expiring", "true");
        card.setAttribute("data-days-remaining", String(diffDays));

        // Red urgent header badge
        if (headerBadgeSlot) {
          if (diffDays < 0) {
            headerBadgeSlot.innerHTML = `
              <span class="badge badge-rejected" style="background:#fee2e2; color:#b91c1c; border:1px solid #f87171; font-weight:700; font-size:0.68rem;">
                <i class="fas fa-triangle-exclamation mr-1"></i> Expiré (-${Math.abs(diffDays)} j)
              </span>
            `;
          } else {
            headerBadgeSlot.innerHTML = `
              <span class="badge badge-expiring-danger" style="background:#fee2e2; color:#b91c1c; border:1px solid #f87171; font-weight:700; font-size:0.68rem;">
                <i class="fas fa-clock-rotate-left mr-1"></i> Expire dans ${diffDays} j
              </span>
            `;
          }
        }

        // Highlight validity text line in bold red with icon
        if (validityContainer) {
          const statusLabel =
            diffDays < 0
              ? `<span style="color: #b91c1c; font-weight: 800;"><i class="fas fa-triangle-exclamation text-danger mr-1"></i> ${formattedValidityDate} (Expiré depuis ${Math.abs(diffDays)} j)</span>`
              : `<span style="color: #b91c1c; font-weight: 800;"><i class="fas fa-triangle-exclamation text-danger mr-1"></i> ${formattedValidityDate} (Expire dans ${diffDays} jour${diffDays > 1 ? "s" : ""})</span>`;
          validityContainer.innerHTML = `<strong>Échéance Validité :</strong> ${statusLabel}`;
        }

        // Update footer badge to red action required
        if (footerStatusBadge) {
          footerStatusBadge.className = "badge badge-rejected";
          footerStatusBadge.style.background = "#fee2e2";
          footerStatusBadge.style.color = "#b91c1c";
          footerStatusBadge.style.borderColor = "#f87171";
          footerStatusBadge.innerHTML = `<i class="fas fa-triangle-exclamation mr-1"></i> Validité &lt; 30j • Renouveler`;
        }
      } else {
        // Valid for more than 30 days -> standard approved appearance
        card.classList.remove("doc-card-expiring-soon");
        card.setAttribute("data-is-expiring", "false");
        card.setAttribute("data-days-remaining", String(diffDays));

        if (headerBadgeSlot) {
          headerBadgeSlot.innerHTML = "";
        }

        if (validityContainer) {
          validityContainer.innerHTML = `<strong>Validité :</strong> <span style="color: var(--text-secondary);">${formattedValidityDate} (En cours de validité)</span>`;
        }

        if (footerStatusBadge) {
          footerStatusBadge.className = "badge badge-approved";
          footerStatusBadge.style.background = "";
          footerStatusBadge.style.color = "";
          footerStatusBadge.style.borderColor = "";
          footerStatusBadge.innerHTML = `<i class="fas fa-check-circle mr-1"></i> Validé & Conforme`;
        }
      }
    });

    // Update filter badge counter
    const countBadge = document.getElementById("expiring-filter-count");
    if (countBadge) {
      countBadge.textContent = expiringCount;
    }

    // Dynamic top alert banner in documents view
    const alertContainer = document.getElementById(
      "client-docs-expiring-alert",
    );
    if (alertContainer) {
      if (expiringCount > 0) {
        alertContainer.innerHTML = `
          <div class="anomaly-item critical" style="margin-bottom: 1.5rem; border-left: 4px solid #ef4444; background: #fff5f5; padding: 1.25rem; border-radius: var(--radius-md); box-shadow: 0 2px 8px rgba(239, 68, 68, 0.08);">
            <div style="display: flex; gap: 1rem; align-items: flex-start;">
              <div style="width: 40px; height: 40px; border-radius: 50%; background: #fee2e2; color: #dc2626; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; flex-shrink: 0;">
                <i class="fas fa-triangle-exclamation"></i>
              </div>
              <div style="flex: 1;">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.35rem;">
                  <h5 style="color: #b91c1c; font-size: 0.95rem; font-weight: 700; margin: 0;">
                    Alerte Validité : ${expiringCount} document(s) expirent dans moins de 30 jours
                  </h5>
                  <span class="badge badge-rejected" style="background:#fee2e2; color:#b91c1c; border:1px solid #f87171; font-weight:700;">
                    Action Requise
                  </span>
                </div>
                <p style="color: #7f1d1d; font-size: 0.82rem; margin: 0 0 0.75rem 0; line-height: 1.5;">
                  Les pièces surlignées en rouge (${expiringDocs.map((d) => `<strong>${d.title}</strong> [échéance : ${d.dateStr}, ${d.days}j]`).join(", ")}) doivent être renouvelées pour garantir la conformité réglementaire UEMOA et éviter tout blocage du décaissement.
                </p>
                <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
                  <button class="btn btn-sm btn-primary" style="background: #dc2626; border-color: #dc2626;" onclick="App.openUploadDocumentModal()">
                    <i class="fas fa-cloud-arrow-up mr-1"></i> Téléverser une pièce actualisée
                  </button>
                  <button class="btn btn-sm btn-secondary" onclick="App.filterClientDocs('EXPIRING', document.getElementById('btn-filter-expiring'))">
                    <i class="fas fa-filter mr-1"></i> Afficher uniquement les pièces à renouveler (${expiringCount})
                  </button>
                </div>
              </div>
            </div>
          </div>
        `;
      } else {
        alertContainer.innerHTML = "";
      }
    }
  },

  filterClientDocs(category, buttonEl) {
    const buttons = document.querySelectorAll("#doc-filter-buttons button");
    buttons.forEach((b) => {
      b.classList.remove("btn-primary", "active");
      b.classList.add("btn-secondary");
    });
    if (buttonEl) {
      buttonEl.classList.remove("btn-secondary");
      buttonEl.classList.add("btn-primary", "active");
    }

    const cards = document.querySelectorAll(
      "#client-documents-grid .doc-card-item",
    );
    cards.forEach((card) => {
      const visible =
        category === "ALL"
          ? true
          : category === "EXPIRING"
            ? card.getAttribute("data-is-expiring") === "true"
            : card.dataset.category === category;
      const shown = card.tagName === "TR" ? "table-row" : "";
      card.style.display = visible ? shown : "none";
    });
  },

  handleClientDocUpload(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    this.showToast(`Numérisation OCR en cours pour : ${file.name}...`, "info");

    setTimeout(() => {
      const grid = document.getElementById("client-documents-grid");
      if (grid) {
        // Calculate new document validity (e.g. 30 days from now for proforma/quote)
        const now = new Date();
        const futureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const yyyy = futureDate.getFullYear();
        const mm = String(futureDate.getMonth() + 1).padStart(2, "0");
        const dd = String(futureDate.getDate()).padStart(2, "0");
        const validityIso = `${yyyy}-${mm}-${dd}`;

        const newCard = document.createElement("div");
        newCard.className = "card doc-card-item";
        newCard.dataset.category = "INVOICE";
        newCard.dataset.validityDate = validityIso;
        newCard.style.padding = "1.25rem";
        newCard.style.position = "relative";
        newCard.style.cursor = "pointer";
        newCard.onclick = () =>
          this.showToast(`Aperçu sécurisé du document ${file.name}`, "info");
        newCard.innerHTML = `
          <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1rem;">
            <div style="display: flex; gap: 0.75rem; align-items: center;">
              <div class="doc-icon-box" style="width: 42px; height: 42px; border-radius: var(--radius-md); background: #dcfce7; color: #15803d; display: flex; align-items: center; justify-content: center; font-size: 1.25rem;">
                <i class="fas fa-file-circle-check"></i>
              </div>
              <div>
                <h4 style="font-size: 0.88rem; font-weight: 700; margin-bottom: 2px;">${file.name}</h4>
                <span style="font-size: 0.72rem; color: var(--text-subtle);">${(file.size / 1024).toFixed(0)} Ko • Téléversé à l'instant</span>
              </div>
            </div>
            <div class="doc-header-badge-slot"></div>
          </div>
          <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 1rem;">
            <div><strong>Analyse IA OCR :</strong> Données extraites avec succès (100%)</div>
            <div class="doc-validity-row"><strong>Échéance Validité :</strong> ${futureDate.toLocaleDateString("fr-FR")} (30 jours)</div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 0.75rem;">
            <span class="badge badge-approved doc-footer-status"><i class="fas fa-check-circle"></i> OCR Validé 100%</span>
            <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); App.showToast('Aperçu du document...', 'info')">
              <i class="fas fa-eye"></i> Aperçu Sécurisé
            </button>
          </div>
        `;
        grid.prepend(newCard);

        // Re-evaluate highlighting on all cards
        this.checkAndHighlightExpiringDocs();
      }
      this.showToast(
        `Document "${file.name}" extrait, validé et transmis à votre conseiller !`,
        "success",
      );
      event.target.value = "";
    }, 1200);
  },

  handleClientDocDrop(event) {
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      this.handleClientDocUpload({ target: { files: files, value: "" } });
    }
  },

  updateClientSimulation() {
    const amountRange = document.getElementById("sim-amount-range");
    const durationRange = document.getElementById("sim-duration-range");
    const incomeInput = document.getElementById("sim-income-input");
    const chargesInput = document.getElementById("sim-charges-input");
    const productSelect = document.getElementById("sim-product-select");

    if (!amountRange || !durationRange) return;

    const amount = parseInt(amountRange.value, 10) || 2500000;
    const duration = parseInt(durationRange.value, 10) || 12;
    const income =
      parseInt(incomeInput ? incomeInput.value : 850000, 10) || 850000;
    const charges =
      parseInt(chargesInput ? chargesInput.value : 180000, 10) || 180000;

    let rateAnnual = 0.12;
    if (productSelect) {
      if (productSelect.value === "AGRICULTURAL") rateAnnual = 0.095;
      else if (productSelect.value === "EQUIPMENT") rateAnnual = 0.11;
      else if (productSelect.value === "GROUP") rateAnnual = 0.135;
    }

    const amountLabel = document.getElementById("sim-amount-label");
    const durationLabel = document.getElementById("sim-duration-label");
    if (amountLabel)
      amountLabel.textContent = CreditScoringEngine.formatFCFA(amount);
    if (durationLabel) durationLabel.textContent = `${duration} Mois`;

    // Standard degressive amortization calculation
    const rateMonthly = rateAnnual / 12;
    const monthlyPayment =
      (amount * rateMonthly) / (1 - Math.pow(1 + rateMonthly, -duration));
    const totalPayments = monthlyPayment * duration;
    const totalInterest = totalPayments - amount;
    const feesAndInsurance = Math.round(amount * 0.015);
    const monthlyTotal = Math.round(
      monthlyPayment + feesAndInsurance / duration,
    );

    const monthlyOutput = document.getElementById("sim-monthly-output");
    const capitalOutput = document.getElementById("sim-capital-output");
    const interestOutput = document.getElementById("sim-interest-output");
    const feesOutput = document.getElementById("sim-fees-output");
    const totalCostOutput = document.getElementById("sim-total-cost-output");

    if (monthlyOutput)
      monthlyOutput.textContent = CreditScoringEngine.formatFCFA(monthlyTotal);
    if (capitalOutput)
      capitalOutput.textContent = CreditScoringEngine.formatFCFA(amount);
    if (interestOutput)
      interestOutput.textContent = CreditScoringEngine.formatFCFA(
        Math.round(totalInterest),
      );
    if (feesOutput)
      feesOutput.textContent = CreditScoringEngine.formatFCFA(feesAndInsurance);
    if (totalCostOutput)
      totalCostOutput.textContent = CreditScoringEngine.formatFCFA(
        Math.round(amount + totalInterest + feesAndInsurance),
      );

    // Debt ratio and rest-to-live
    const totalMonthlyDebt = charges + monthlyTotal;
    const debtRatio = income > 0 ? (totalMonthlyDebt / income) * 100 : 0;
    const restToLive = income - totalMonthlyDebt;

    const ratioOutput = document.getElementById("sim-ratio-output");
    const ratioBar = document.getElementById("sim-ratio-bar");
    const restToLiveOutput = document.getElementById("sim-rest-to-live-output");
    const eligibilityBadge = document.getElementById("sim-eligibility-badge");

    if (ratioOutput) {
      if (debtRatio <= 33) {
        ratioOutput.style.color = "#047857";
        ratioOutput.textContent = `${debtRatio.toFixed(1)}% (Conforme norme UEMOA ≤ 33%)`;
      } else if (debtRatio <= 45) {
        ratioOutput.style.color = "#b45309";
        ratioOutput.textContent = `${debtRatio.toFixed(1)}% (Attention : Proche du seuil d'alerte)`;
      } else {
        ratioOutput.style.color = "#b91c1c";
        ratioOutput.textContent = `${debtRatio.toFixed(1)}% (Dépassement du seuil maximal de 45%)`;
      }
    }

    if (ratioBar) {
      ratioBar.style.width = `${Math.min(debtRatio, 100)}%`;
      ratioBar.style.background =
        debtRatio <= 33 ? "#10b981" : debtRatio <= 45 ? "#f59e0b" : "#ef4444";
    }

    if (restToLiveOutput) {
      restToLiveOutput.textContent = `${CreditScoringEngine.formatFCFA(Math.max(0, restToLive))} / mois`;
      restToLiveOutput.style.color =
        restToLive >= 200000
          ? "#047857"
          : restToLive >= 100000
            ? "#b45309"
            : "#b91c1c";
    }

    if (eligibilityBadge) {
      const isColdStartSim =
        document.getElementById("sim-cold-start-toggle")?.checked ?? true;
      const simModeLabel = document.getElementById("sim-scoring-mode-label");

      if (simModeLabel) {
        if (isColdStartSim) {
          simModeLabel.innerHTML =
            '<i class="fas fa-seedling text-emerald"></i> Modèle Cold Start UEMOA Appliqué (Score Est. 82/100 • Risque Faible)';
        } else {
          simModeLabel.innerHTML =
            '<i class="fas fa-history text-primary"></i> Modèle Standard CIF Appliqué (Score Est. 78/100)';
        }
      }

      if (debtRatio <= 40 && restToLive >= 150000) {
        eligibilityBadge.className = "badge badge-approved";
        eligibilityBadge.innerHTML = isColdStartSim
          ? '<i class="fas fa-seedling"></i> Éligible Cold Start CIF'
          : '<i class="fas fa-circle-check"></i> Éligible CIF Standard';
      } else {
        eligibilityBadge.className = "badge badge-verification";
        eligibilityBadge.innerHTML =
          '<i class="fas fa-triangle-exclamation"></i> Étude Approfondie Requise';
      }
    }

    // Update Full Simulator Pie Chart & Percentages
    const totalRepaidSim = Math.round(
      amount + totalInterest + feesAndInsurance,
    );
    const simPctCapital = Math.round((amount / totalRepaidSim) * 100);
    const simPctInterest = Math.round((totalInterest / totalRepaidSim) * 100);
    const simPctFees = Math.max(1, 100 - simPctCapital - simPctInterest);

    const simPieCapVal = document.getElementById("sim-pie-capital-val");
    const simPieIntVal = document.getElementById("sim-pie-interest-val");
    const simPieFeesVal = document.getElementById("sim-pie-fees-val");
    const simPieCapPct = document.getElementById("sim-pie-capital-pct");
    const simPieIntPct = document.getElementById("sim-pie-interest-pct");
    const simPieFeesPct = document.getElementById("sim-pie-fees-pct");

    if (simPieCapVal)
      simPieCapVal.textContent = CreditScoringEngine.formatFCFA(amount);
    if (simPieIntVal)
      simPieIntVal.textContent = CreditScoringEngine.formatFCFA(
        Math.round(totalInterest),
      );
    if (simPieFeesVal)
      simPieFeesVal.textContent =
        CreditScoringEngine.formatFCFA(feesAndInsurance);
    if (simPieCapPct) simPieCapPct.textContent = `${simPctCapital}%`;
    if (simPieIntPct) simPieIntPct.textContent = `${simPctInterest}%`;
    if (simPieFeesPct) simPieFeesPct.textContent = `${simPctFees}%`;

    if (
      window.AppCharts &&
      typeof window.AppCharts.renderSimulatorBreakdownPie === "function"
    ) {
      window.AppCharts.renderSimulatorBreakdownPie(
        "sim-breakdown-pie-chart",
        amount,
        Math.round(totalInterest),
        feesAndInsurance,
      );
    }
  },

  updateColdStartComparisonSim() {
    const capSlider = document.getElementById("cs-sim-cap");
    const actSlider = document.getElementById("cs-sim-act");
    const garSlider = document.getElementById("cs-sim-gar");
    const ocrSlider = document.getElementById("cs-sim-ocr");

    if (!capSlider) return;

    const capRatio = parseFloat(capSlider.value) || 2.2;
    const actYears = parseFloat(actSlider.value) || 4;
    const garPct = parseFloat(garSlider.value) || 100;
    const ocrPct = parseFloat(ocrSlider.value) || 95;

    // Update labels
    const capValEl = document.getElementById("cs-sim-cap-val");
    const actValEl = document.getElementById("cs-sim-act-val");
    const garValEl = document.getElementById("cs-sim-gar-val");
    const ocrValEl = document.getElementById("cs-sim-ocr-val");

    if (capValEl)
      capValEl.textContent = `${capRatio.toFixed(1)}x (${capRatio >= 2 ? "Très Bon" : capRatio >= 1.3 ? "Conforme" : "Faible"})`;
    if (actValEl)
      actValEl.textContent = `${actYears} an${actYears > 1 ? "s" : ""} d'activité`;
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
      scoreCap * 0.25 +
        scoreAct * 0.15 +
        scoreGar * 0.1 +
        scoreOcr * 0.1 +
        scoreContext * 0.05 +
        0, // No history penalty in traditional standard scoring
    );

    // Cold Start Model: 35% cap + 25% act + 20% gar + 10% context + 10% ocr
    const csScore = Math.min(
      100,
      Math.round(
        scoreCap * 0.35 +
          scoreAct * 0.25 +
          scoreGar * 0.2 +
          scoreContext * 0.1 +
          scoreOcr * 0.1,
      ),
    );

    const stdScoreEl = document.getElementById("cs-sim-std-score");
    const csScoreEl = document.getElementById("cs-sim-cs-score");
    const stdBadgeEl = document.getElementById("cs-sim-std-badge");
    const csBadgeEl = document.getElementById("cs-sim-cs-badge");
    const gainBadgeEl = document.getElementById("cs-sim-gain-badge");

    if (stdScoreEl)
      stdScoreEl.innerHTML = `${stdScore}<span style="font-size: 1rem; color: var(--text-subtle);">/100</span>`;
    if (csScoreEl)
      csScoreEl.innerHTML = `${csScore}<span style="font-size: 1rem; color: var(--text-subtle);">/100</span>`;

    if (stdBadgeEl) {
      if (stdScore >= 70) {
        stdBadgeEl.className = "badge badge-approved";
        stdBadgeEl.textContent = "Éligible";
      } else if (stdScore >= 55) {
        stdBadgeEl.className = "badge badge-warning";
        stdBadgeEl.textContent = "Douteux";
      } else {
        stdBadgeEl.className = "badge badge-rejected";
        stdBadgeEl.textContent = "Pénalisé (Zéro antécédent)";
      }
    }

    if (csBadgeEl) {
      if (csScore >= 70) {
        csBadgeEl.className = "badge badge-approved";
        csBadgeEl.innerHTML = '<i class="fas fa-check"></i> Éligible Comité';
      } else {
        csBadgeEl.className = "badge badge-warning";
        csBadgeEl.innerHTML =
          '<i class="fas fa-triangle-exclamation"></i> Étude Approfondie';
      }
    }

    if (gainBadgeEl) {
      const diff = csScore - stdScore;
      gainBadgeEl.textContent = `+${diff} pts d'Inclusion Financière`;
    }
  },

  applyFromSimulation() {
    const amountRange = document.getElementById("sim-amount-range");
    const durationRange = document.getElementById("sim-duration-range");
    const amount = amountRange ? parseInt(amountRange.value, 10) : 2500000;
    const duration = durationRange ? parseInt(durationRange.value, 10) : 12;

    this.openNewLoanModal({
      amount,
      duration,
      purpose: "Financement de projet CreditFast",
    });
    this.showToast(
      `Simulation transférée dans votre demande : ${CreditScoringEngine.formatFCFA(amount)} sur ${duration} mois`,
      "success",
    );
  },

  scheduleInstallments: [
    {
      number: 1,
      dueDate: "05/07/2026",
      principal: 196250,
      interest: 25000,
      insurance: 13750,
      total: 235000,
      remaining: 2303750,
      status: "PAID",
      paidDate: "04/07/2026 à 14:22",
      provider: "Orange Money Mali (+223 77 540 88 12)",
      receiptRef: "REC-2026-0704",
      txnId: "OM-ML-8821-0704",
    },
    {
      number: 2,
      dueDate: "05/08/2026",
      principal: 198212,
      interest: 23038,
      insurance: 13750,
      total: 235000,
      remaining: 2105538,
      status: "PAID",
      paidDate: "05/08/2026 à 09:45",
      provider: "Wave Mali (+223 77 540 88 12)",
      receiptRef: "REC-2026-0805",
      txnId: "WV-ML-8821-0805",
    },
    {
      number: 3,
      dueDate: "05/09/2026",
      principal: 200195,
      interest: 21055,
      insurance: 13750,
      total: 235000,
      remaining: 1905343,
      status: "DUE",
      paidDate: null,
      provider: null,
      receiptRef: null,
      txnId: null,
    },
    {
      number: 4,
      dueDate: "05/10/2026",
      principal: 202196,
      interest: 19054,
      insurance: 13750,
      total: 235000,
      remaining: 1703147,
      status: "UPCOMING",
      paidDate: null,
      provider: null,
      receiptRef: null,
      txnId: null,
    },
    {
      number: 5,
      dueDate: "05/11/2026",
      principal: 204218,
      interest: 17032,
      insurance: 13750,
      total: 235000,
      remaining: 1498929,
      status: "UPCOMING",
      paidDate: null,
      provider: null,
      receiptRef: null,
      txnId: null,
    },
    {
      number: 6,
      dueDate: "05/12/2026",
      principal: 206261,
      interest: 14989,
      insurance: 13750,
      total: 235000,
      remaining: 1292668,
      status: "UPCOMING",
      paidDate: null,
      provider: null,
      receiptRef: null,
      txnId: null,
    },
    {
      number: 7,
      dueDate: "05/01/2027",
      principal: 208323,
      interest: 12927,
      insurance: 13750,
      total: 235000,
      remaining: 1084345,
      status: "UPCOMING",
      paidDate: null,
      provider: null,
      receiptRef: null,
      txnId: null,
    },
    {
      number: 8,
      dueDate: "05/02/2027",
      principal: 210407,
      interest: 10843,
      insurance: 13750,
      total: 235000,
      remaining: 873938,
      status: "UPCOMING",
      paidDate: null,
      provider: null,
      receiptRef: null,
      txnId: null,
    },
    {
      number: 9,
      dueDate: "05/03/2027",
      principal: 212511,
      interest: 8739,
      insurance: 13750,
      total: 235000,
      remaining: 661427,
      status: "UPCOMING",
      paidDate: null,
      provider: null,
      receiptRef: null,
      txnId: null,
    },
    {
      number: 10,
      dueDate: "05/04/2027",
      principal: 214636,
      interest: 6614,
      insurance: 13750,
      total: 235000,
      remaining: 446791,
      status: "UPCOMING",
      paidDate: null,
      provider: null,
      receiptRef: null,
      txnId: null,
    },
    {
      number: 11,
      dueDate: "05/05/2027",
      principal: 216782,
      interest: 4468,
      insurance: 13750,
      total: 235000,
      remaining: 230009,
      status: "UPCOMING",
      paidDate: null,
      provider: null,
      receiptRef: null,
      txnId: null,
    },
    {
      number: 12,
      dueDate: "05/06/2027",
      principal: 230009,
      interest: 2300,
      insurance: 13750,
      total: 246059,
      remaining: 0,
      status: "UPCOMING",
      paidDate: null,
      provider: null,
      receiptRef: null,
      txnId: null,
    },
  ],
  currentScheduleFilter: "ALL",

  renderClientSchedule(filter = null) {
    if (filter) {
      this.currentScheduleFilter = filter;
    }
    const currentFilter = this.currentScheduleFilter || "ALL";
    const tbody = document.getElementById("client-schedule-table-body");
    if (!tbody) return;

    // Update Progress Metrics
    const paidList = this.scheduleInstallments.filter(
      (i) => i.status === "PAID",
    );
    const dueList = this.scheduleInstallments.filter((i) => i.status === "DUE");
    const upcomingList = this.scheduleInstallments.filter(
      (i) => i.status === "UPCOMING",
    );

    const totalPaid = paidList.reduce((sum, i) => sum + i.total, 0);
    const totalRemaining =
      2500000 - paidList.reduce((sum, i) => sum + i.principal, 0);
    const progressPct = (
      (paidList.length / this.scheduleInstallments.length) *
      100
    ).toFixed(1);

    const txtProgress = document.getElementById(
      "schedule-metric-progress-text",
    );
    const badgeProgress = document.getElementById(
      "schedule-metric-progress-badge",
    );
    const barProgress = document.getElementById("schedule-metric-progress-bar");
    const txtPaid = document.getElementById("schedule-metric-paid");
    const txtRemaining = document.getElementById("schedule-metric-remaining");

    if (txtProgress)
      txtProgress.textContent = `${paidList.length} / ${this.scheduleInstallments.length} Mensualités`;
    if (badgeProgress)
      badgeProgress.innerHTML = `<i class="fas fa-check"></i> ${progressPct}% Payé`;
    if (barProgress) barProgress.style.width = `${progressPct}%`;
    if (txtPaid)
      txtPaid.textContent = CreditScoringEngine.formatFCFA(totalPaid);
    if (txtRemaining)
      txtRemaining.textContent = CreditScoringEngine.formatFCFA(
        totalRemaining > 0 ? totalRemaining : 0,
      );

    // Filter Items
    let itemsToDisplay = [...this.scheduleInstallments];
    if (currentFilter === "PAID") {
      itemsToDisplay = itemsToDisplay.filter((i) => i.status === "PAID");
    } else if (currentFilter === "DUE") {
      itemsToDisplay = itemsToDisplay.filter((i) => i.status === "DUE");
    } else if (currentFilter === "UPCOMING") {
      itemsToDisplay = itemsToDisplay.filter((i) => i.status === "UPCOMING");
    }

    if (itemsToDisplay.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-muted);">
            <i class="fas fa-calendar-xmark text-lg mb-2"></i>
            <div>Aucune échéance ne correspond à ce filtre.</div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = itemsToDisplay
      .map((item) => {
        let statusBadge = "";
        let actionBtn = "";
        let rowClass = "schedule-table-row";

        if (item.status === "PAID") {
          const shortDate = item.paidDate
            ? item.paidDate.split(" à ")[0]
            : "Réglé";
          statusBadge = `<span class="badge badge-approved"><i class="fas fa-check"></i> Payé (${shortDate})</span>`;
          actionBtn = `
          <div style="display: flex; justify-content: flex-end; gap: 0.35rem; align-items: center;">
            <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); App.openScheduleDrawer(${item.number})" title="Voir le volet détail">
              <i class="fas fa-sidebar"></i> <span class="hide-xs">Détails</span>
            </button>
            <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); App.showToast('Téléchargement Quittance ${item.receiptRef || "PDF"}', 'success')" title="Télécharger Reçu">
              <i class="fas fa-file-invoice text-primary"></i> <span class="hide-xs">Reçu</span>
            </button>
          </div>
        `;
        } else if (item.status === "DUE") {
          rowClass += " due-active";
          statusBadge = `<span class="badge badge-verification"><i class="fas fa-hourglass-half"></i> À Régler</span>`;
          actionBtn = `
          <div style="display: flex; justify-content: flex-end; gap: 0.35rem; align-items: center;">
            <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); App.openScheduleDrawer(${item.number})" title="Voir le volet détail">
              <i class="fas fa-sidebar"></i> <span class="hide-xs">Détails</span>
            </button>
            <button class="btn btn-warning btn-sm" onclick="event.stopPropagation(); App.openClientPaymentModal(${item.number}, ${item.total})" title="Payer maintenant">
              <i class="fas fa-wallet"></i> <span class="hide-xs">Payer</span>
            </button>
          </div>
        `;
        } else {
          statusBadge = `<span class="badge badge-submitted">À venir</span>`;
          actionBtn = `
          <div style="display: flex; justify-content: flex-end; gap: 0.35rem; align-items: center;">
            <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); App.openScheduleDrawer(${item.number})" title="Voir le volet détail">
              <i class="fas fa-sidebar"></i> Détails
            </button>
          </div>
        `;
        }

        return `
        <tr class="${rowClass}" onclick="App.openScheduleDrawer(${item.number})">
          <td>
            <div style="font-weight: 700; color: ${item.status === "DUE" ? "var(--cif-gold-700)" : "var(--text-primary)"};">
              Échéance N° ${item.number}
            </div>
            <div style="font-size: 0.72rem; color: var(--text-subtle);">
              ${item.number === 12 ? "Dernière / Clôture" : "Mensualité standard"}
            </div>
          </td>
          <td>
            <div style="font-weight: 600; font-size: 0.85rem;">${item.dueDate}</div>
          </td>
          <td>
            <div class="amount-cell" style="font-weight: 800; font-size: 0.95rem; color: ${item.status === "DUE" ? "var(--cif-gold-700)" : "var(--primary-700)"};">
              ${CreditScoringEngine.formatFCFA(item.total)}
            </div>
          </td>
          <td class="schedule-col-hide-mobile">
            <span style="font-size: 0.82rem; color: var(--text-muted);">${CreditScoringEngine.formatFCFA(item.principal)}</span>
          </td>
          <td class="schedule-col-hide-tablet">
            <span style="font-size: 0.82rem; font-weight: 600; color: var(--text-subtle);">${CreditScoringEngine.formatFCFA(item.remaining)}</span>
          </td>
          <td>
            ${statusBadge}
          </td>
          <td style="text-align: right;">
            ${actionBtn}
          </td>
        </tr>
      `;
      })
      .join("");
  },

  filterScheduleTable(filter, buttonEl = null) {
    if (
      window.AppInteractions &&
      typeof window.AppInteractions.filterScheduleTable === "function"
    ) {
      window.AppInteractions.filterScheduleTable(filter, buttonEl);
      return;
    }

    this.currentScheduleFilter = filter;

    // Update Tab UI
    ["all", "paid", "due", "upcoming"].forEach((f) => {
      const btn = document.getElementById(`filter-sched-${f}`);
      if (btn) {
        if (f.toUpperCase() === filter) {
          btn.classList.add("active");
        } else {
          btn.classList.remove("active");
        }
      }
    });

    this.renderClientSchedule(filter);
  },

  openScheduleDrawer(installmentNumber) {
    const number = this.resolveInstallmentNumber(installmentNumber);
    const item =
      this.scheduleInstallments.find((i) => i.number == number) ||
      this.scheduleInstallments[0];
    if (!item) return;

    // Header Info
    const titleElem = document.getElementById("drawer-installment-title");
    const dateElem = document.getElementById("drawer-installment-date");
    if (titleElem)
      titleElem.textContent = `Échéance N° ${item.number} sur ${this.scheduleInstallments.length}`;
    if (dateElem) dateElem.textContent = `Date d'Exigibilité : ${item.dueDate}`;

    // Hero Card
    const heroAmount = document.getElementById("drawer-hero-amount");
    const heroStatus = document.getElementById("drawer-hero-status");
    if (heroAmount)
      heroAmount.textContent = CreditScoringEngine.formatFCFA(item.total);
    if (heroStatus) {
      if (item.status === "PAID") {
        heroStatus.innerHTML = `<span class="badge badge-approved"><i class="fas fa-circle-check"></i> Échéance Soldée & Validée</span>`;
      } else if (item.status === "DUE") {
        heroStatus.innerHTML = `<span class="badge badge-verification"><i class="fas fa-hourglass-half"></i> À Régler (Échéance Active)</span>`;
      } else {
        heroStatus.innerHTML = `<span class="badge badge-submitted"><i class="fas fa-clock"></i> Échéance Future non échue</span>`;
      }
    }

    // Financial Values
    const valPrincipal = document.getElementById("drawer-val-principal");
    const valInterest = document.getElementById("drawer-val-interest");
    const valInsurance = document.getElementById("drawer-val-insurance");
    const valRemaining = document.getElementById("drawer-val-remaining");

    if (valPrincipal)
      valPrincipal.textContent = CreditScoringEngine.formatFCFA(item.principal);
    if (valInterest)
      valInterest.textContent = CreditScoringEngine.formatFCFA(item.interest);
    if (valInsurance)
      valInsurance.textContent = CreditScoringEngine.formatFCFA(item.insurance);
    if (valRemaining)
      valRemaining.textContent = CreditScoringEngine.formatFCFA(item.remaining);

    // Segmented Bars
    const total = item.total || 235000;
    const pPct = ((item.principal / total) * 100).toFixed(1);
    const iPct = ((item.interest / total) * 100).toFixed(1);
    const insPct = (100 - pPct - iPct).toFixed(1);

    const barP = document.getElementById("drawer-bar-principal");
    const barI = document.getElementById("drawer-bar-interest");
    const barIns = document.getElementById("drawer-bar-insurance");
    if (barP) barP.style.width = `${pPct}%`;
    if (barI) barI.style.width = `${iPct}%`;
    if (barIns) barIns.style.width = `${insPct}%`;

    // Tracing & Receipt Info
    const valProvider = document.getElementById("drawer-val-provider");
    const valPayDate = document.getElementById("drawer-val-paydate");
    const valReceipt = document.getElementById("drawer-val-receipt");

    if (valProvider)
      valProvider.textContent =
        item.provider || "En attente de paiement Mobile Money";
    if (valPayDate)
      valPayDate.textContent = item.paidDate
        ? `Réglé le ${item.paidDate}`
        : `Non réglé (Exigible le ${item.dueDate})`;
    if (valReceipt)
      valReceipt.textContent =
        item.receiptRef || "Générée automatiquement dès validation";

    // Footer Actions
    const footerActions = document.getElementById("drawer-footer-actions");
    if (footerActions) {
      if (item.status === "DUE") {
        footerActions.innerHTML = `
          <button class="btn btn-warning" onclick="App.closeScheduleDrawer(); App.openClientPaymentModal(${item.number}, ${item.total})">
            <i class="fas fa-wallet mr-1"></i> Payer ${CreditScoringEngine.formatFCFA(item.total)}
          </button>
        `;
      } else if (item.status === "PAID") {
        footerActions.innerHTML = `
          <button class="btn btn-success" onclick="App.showToast('Téléchargement de la Quittance officielle ${item.receiptRef || "REC"} au format PDF...', 'success')">
            <i class="fas fa-file-pdf mr-1"></i> Télécharger Quittance PDF
          </button>
        `;
      } else {
        footerActions.innerHTML = `
          <button class="btn btn-secondary" onclick="App.showToast('Cette échéance sera ouverte au règlement le ${item.dueDate}.', 'info')">
            <i class="fas fa-bell mr-1"></i> Rappel SMS Actif
          </button>
        `;
      }
    }

    // Open Backdrop
    const backdrop = document.getElementById("schedule-drawer-backdrop");
    if (backdrop) backdrop.classList.add("active");
  },

  closeScheduleDrawer() {
    const backdrop = document.getElementById("schedule-drawer-backdrop");
    if (backdrop) backdrop.classList.remove("active");
  },

  // =========================================================================
  // [FEATURE] VOLET LATÉRAL DE DÉTAIL D'UNE DEMANDE DE CRÉDIT (DEMANDEUR)
  // =========================================================================
  openClientRequestDrawer(identifier = "REQ-2026-0891") {
    const req = this.resolveCreditRequest(identifier);

    const historicalMap = {
      "REQ-2026-0891": {
        request_number: "REQ-2026-0891",
        submitted_at: "11/08/2026",
        agency: "Agence Grand Marché (Bamako, Mali)",
        purpose: "Achat de stock tissus wax pour la fête de Tabaski",
        amount: 2500000,
        duration: 12,
        monthly: 235000,
        rate: "1.20% / mois dégressif (14.4% l'an UEMOA)",
        insurance: "13 750 FCFA / mois (Incluse)",
        totalCost: 320000,
        disbursement: "Mobile Money (Wave/Orange) ou Guichet Caisse",
        status: "ANALYSIS",
        statusBadge:
          '<span class="badge badge-analysis"><i class="fas fa-spinner fa-spin mr-1"></i> Revue Analyste Risque (Score: 78/100)</span>',
        stepBadge: "Étape 4 sur 6",
        steps: [
          {
            name: "1. Dépôt & Enregistrement",
            date: "11/08/2026 à 10:14",
            state: "done",
            desc: "Dossier constitué et enregistré au guichet digital CreditFast",
          },
          {
            name: "2. Extraction OCR & Contrôle Pièces",
            date: "11/08/2026 à 14:30",
            state: "done",
            desc: "4/4 pièces certifiées conformes par l'IA OCR",
          },
          {
            name: "3. Calcul Capacité & Reste à Vivre",
            date: "12/08/2026 à 09:05",
            state: "done",
            desc: "Reste à vivre mensuel net : 325 000 FCFA (Conforme UEMOA)",
          },
          {
            name: "4. Revue Approfondie Analyste Risque",
            date: "En cours d'instruction",
            state: "active",
            desc: "Score calculé : 78/100 • Avis favorable sous réserve de validation",
          },
          {
            name: "5. Vote & Décision Comité de Crédit",
            date: "Prévu le 20/08/2026",
            state: "pending",
            desc: "Examen collégial et signature électronique du PV",
          },
          {
            name: "6. Déblocage & Mise à Disposition",
            date: "Sous 24h après accord",
            state: "pending",
            desc: "Versement direct par virement ou portefeuille Mobile Money",
          },
        ],
        docs: [
          {
            name: "Facture_Proforma_Wax_BATEXI.pdf",
            type: "Devis & Proforma",
            size: "1.4 Mo",
          },
          {
            name: "Releve_Compte_6_Mois_CreditFast.pdf",
            type: "Relevé Bancaire",
            size: "2.8 Mo",
          },
          {
            name: "RCCM_Bamako_ML-BKO-2020-B-142.pdf",
            type: "Registre Commerce",
            size: "890 Ko",
          },
          {
            name: "CNI_Biometrique_Ndiaye.pdf",
            type: "Identité Client",
            size: "1.1 Mo",
          },
        ],
        guarantee: {
          type: "Stock de Marchandise & Rouleaux Bazin",
          declared: "3 800 000 FCFA",
          verified: "3 400 000 FCFA",
          statusBadge:
            '<span class="badge badge-approved"><i class="fas fa-circle-check"></i> Contrôlée & Conforme</span>',
          desc: "Stock de rouleaux de tissus wax hollandais et bazin riche entreposé en boutique Grand Marché (constat physique par l'Agent Adama Traore).",
        },
        actions: "ACTIVE",
      },
      "REQ-2025-0412": {
        request_number: "REQ-2025-0412",
        submitted_at: "14/04/2025",
        agency: "Agence Grand Marché (Bamako, Mali)",
        purpose: "Équipement machine à coudre industrielle double entraînement",
        amount: 1200000,
        duration: 10,
        monthly: 132000,
        rate: "1.20% / mois dégressif",
        insurance: "6 600 FCFA / mois (Soldée)",
        totalCost: 120000,
        disbursement: "Virement Agence",
        status: "APPROVED",
        statusBadge:
          '<span class="badge badge-approved"><i class="fas fa-check-double mr-1"></i> Remboursé & Clôturé avec Succès</span>',
        stepBadge: "Dossier Clôturé (100%)",
        steps: [
          {
            name: "1. Demande Déposée",
            date: "14/04/2025",
            state: "done",
            desc: "Financement d'équipement professionnel",
          },
          {
            name: "2. Documents & Devis Validés",
            date: "14/04/2025",
            state: "done",
            desc: "Devis machine Brother validé",
          },
          {
            name: "3. Capacité Financière Conforme",
            date: "15/04/2025",
            state: "done",
            desc: "Ratio d'endettement : 22%",
          },
          {
            name: "4. Validation Analyste Risque",
            date: "16/04/2025",
            state: "done",
            desc: "Score de crédit : 84/100",
          },
          {
            name: "5. Décision Comité Favorable",
            date: "17/04/2025",
            state: "done",
            desc: "Accord unanime du Comité",
          },
          {
            name: "6. Déblocage & 10 Remboursements Réglés",
            date: "Février 2026",
            state: "done",
            desc: "10/10 échéances honorées sans aucun retard. Quittance finale délivrée.",
          },
        ],
        docs: [
          {
            name: "Facture_Machine_Industrielle_Brother.pdf",
            type: "Facture Achat",
            size: "1.1 Mo",
          },
          {
            name: "Contrat_Pret_Signe_CF-2025-0412.pdf",
            type: "Contrat Prêt",
            size: "2.2 Mo",
          },
          {
            name: "Attestation_Fin_Engagement_Soldé.pdf",
            type: "Quittance Clôture",
            size: "650 Ko",
          },
        ],
        guarantee: {
          type: "Gage sur Matériel Professionnel",
          declared: "1 500 000 FCFA",
          verified: "1 500 000 FCFA",
          statusBadge:
            '<span class="badge badge-approved"><i class="fas fa-lock-open"></i> Mainlevée Délivrée</span>',
          desc: "Gage mobilier sur machine à coudre industrielle. Mainlevée totale actée suite au remboursement intégral.",
        },
        actions: "CLOSED",
      },
      "REQ-2024-0199": {
        request_number: "REQ-2024-0199",
        submitted_at: "03/02/2024",
        agency: "Agence Grand Marché (Bamako, Mali)",
        purpose: "Fonds de roulement boutique Médina & mercerie",
        amount: 800000,
        duration: 6,
        monthly: 140000,
        rate: "1.20% / mois dégressif",
        insurance: "4 400 FCFA / mois (Soldée)",
        totalCost: 40000,
        disbursement: "Orange Money",
        status: "APPROVED",
        statusBadge:
          '<span class="badge badge-approved"><i class="fas fa-check-double mr-1"></i> Remboursé & Clôturé avec Succès</span>',
        stepBadge: "Dossier Clôturé (100%)",
        steps: [
          {
            name: "1. Demande Déposée",
            date: "03/02/2024",
            state: "done",
            desc: "Microcrédit fonds de roulement",
          },
          {
            name: "2. Pièces Déposées",
            date: "03/02/2024",
            state: "done",
            desc: "Pièce d'identité et quittance EDM",
          },
          {
            name: "3. Instruction Rapide",
            date: "04/02/2024",
            state: "done",
            desc: "Confort de trésorerie avéré",
          },
          {
            name: "4. Scoring Automatisé Conforme",
            date: "04/02/2024",
            state: "done",
            desc: "Score de crédit : 80/100",
          },
          {
            name: "5. Approbation Caisse",
            date: "05/02/2024",
            state: "done",
            desc: "Accord délégué agence",
          },
          {
            name: "6. Prêt Soldé en Août 2024",
            date: "Août 2024",
            state: "done",
            desc: "6/6 mensualités payées à bonne date.",
          },
        ],
        docs: [
          {
            name: "Contrat_CreditFast_2024_0199.pdf",
            type: "Contrat Prêt",
            size: "1.8 Mo",
          },
          {
            name: "Attestation_Solde_Pret_2024.pdf",
            type: "Quittance Finale",
            size: "540 Ko",
          },
        ],
        guarantee: {
          type: "Nantissement d'Épargne Bloquée",
          declared: "400 000 FCFA",
          verified: "400 000 FCFA",
          statusBadge:
            '<span class="badge badge-approved"><i class="fas fa-lock-open"></i> Caution Libérée</span>',
          desc: "Nantissement partiel sur compte sur livret CreditFast. Fonds débloqués et restitués.",
        },
        actions: "CLOSED",
      },
    };

    const data =
      historicalMap[identifier] ||
      (req
        ? {
            request_number: req.request_number,
            submitted_at: req.submitted_at
              ? new Date(req.submitted_at).toLocaleDateString("fr-FR")
              : "11/08/2026",
            agency: "Agence Grand Marché (Bamako, Mali)",
            purpose: req.purpose || "Financement d'activité professionnelle",
            amount: req.requested_amount || 2500000,
            duration: req.duration_months || 12,
            monthly: req.estimated_monthly_payment || 235000,
            rate: "1.20% / mois dégressif",
            insurance: "Assurance incluse",
            totalCost: Math.round((req.requested_amount || 2500000) * 0.12),
            disbursement: "Mobile Money / Caisse",
            status: req.status || "ANALYSIS",
            statusBadge: AppInteractions.getStatusBadge(
              req.status || "ANALYSIS",
            ),
            stepBadge: req.status === "APPROVED" ? "Accordé" : "En cours",
            steps: [
              {
                name: "1. Demande Déposée",
                date: "Enregistrée",
                state: "done",
                desc: "Dossier créé",
              },
              {
                name: "2. Contrôle Pièces",
                date: "Validé",
                state: "done",
                desc: "Documents analysés",
              },
              {
                name: "3. Analyse Financière",
                date: "Validé",
                state: "done",
                desc: "Reste à vivre calculé",
              },
              {
                name: "4. Décision & Déblocage",
                date: "En cours",
                state: req.status === "APPROVED" ? "done" : "active",
                desc: "Traitement final",
              },
            ],
            docs: [
              {
                name: "Dossier_Financement_" + req.request_number + ".pdf",
                type: "Dossier Numérique",
                size: "1.5 Mo",
              },
            ],
            guarantee: {
              type: "Garantie déclarée",
              declared: CreditScoringEngine.formatFCFA(
                req.requested_amount || 2000000,
              ),
              verified: CreditScoringEngine.formatFCFA(
                req.requested_amount || 2000000,
              ),
              statusBadge: '<span class="badge badge-approved">Conforme</span>',
              desc: "Garanties enregistrées pour ce dossier.",
            },
            actions: req.status === "APPROVED" ? "CLOSED" : "ACTIVE",
          }
        : historicalMap["REQ-2026-0891"]);

    // Fill Drawer Elements
    const titleEl = document.getElementById("crd-drawer-title");
    const subtitleEl = document.getElementById("crd-drawer-subtitle");
    const amountEl = document.getElementById("crd-drawer-amount");
    const statusEl = document.getElementById("crd-drawer-status");
    const purposeEl = document.getElementById("crd-drawer-purpose");

    if (titleEl) titleEl.textContent = `Dossier #${data.request_number}`;
    if (subtitleEl)
      subtitleEl.textContent = `Déposé le ${data.submitted_at} • ${data.agency}`;
    if (amountEl)
      amountEl.textContent = CreditScoringEngine.formatFCFA(data.amount);
    if (statusEl) statusEl.innerHTML = data.statusBadge;
    if (purposeEl) purposeEl.textContent = data.purpose;

    // Financial Values
    const durVal = document.getElementById("crd-drawer-duration-val");
    const durBadge = document.getElementById("crd-drawer-duration-badge");
    const monVal = document.getElementById("crd-drawer-monthly-val");
    const rateVal = document.getElementById("crd-drawer-rate-val");
    const insVal = document.getElementById("crd-drawer-insurance-val");
    const costVal = document.getElementById("crd-drawer-cost-val");
    const disbVal = document.getElementById("crd-drawer-disbursement-val");

    if (durVal) durVal.textContent = `${data.duration} Mois`;
    if (durBadge) durBadge.textContent = `${data.duration} Mois`;
    if (monVal)
      monVal.textContent = CreditScoringEngine.formatFCFA(data.monthly);
    if (rateVal) rateVal.textContent = data.rate;
    if (insVal) insVal.textContent = data.insurance;
    if (costVal)
      costVal.textContent = CreditScoringEngine.formatFCFA(data.totalCost);
    if (disbVal) disbVal.textContent = data.disbursement;

    // Stepper
    const stepBadge = document.getElementById("crd-drawer-step-badge");
    if (stepBadge) stepBadge.textContent = data.stepBadge;

    const stepperContainer = document.getElementById(
      "crd-drawer-stepper-container",
    );
    if (stepperContainer && data.steps) {
      stepperContainer.innerHTML = data.steps
        .map((st, idx) => {
          const isDone = st.state === "done";
          const isActive = st.state === "active";
          const icon = isDone
            ? '<i class="fas fa-check"></i>'
            : isActive
              ? '<i class="fas fa-spinner fa-spin"></i>'
              : String(idx + 1);
          const dotBg = isDone
            ? "var(--primary-600)"
            : isActive
              ? "var(--cif-gold-500)"
              : "var(--border-color)";
          const dotColor = isDone || isActive ? "#fff" : "var(--text-muted)";
          const titleColor = isActive
            ? "var(--primary-700)"
            : "var(--text-primary)";

          return `
          <div style="display: flex; align-items: flex-start; gap: 0.75rem; position: relative;">
            <div style="width: 26px; height: 26px; border-radius: 50%; background: ${dotBg}; color: ${dotColor}; display: flex; align-items: center; justify-content: center; font-size: 0.72rem; font-weight: 700; flex-shrink: 0; margin-top: 2px;">
              ${icon}
            </div>
            <div style="flex: 1; padding-bottom: 0.35rem; border-bottom: 1px dashed var(--border-color);">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="font-weight: 700; font-size: 0.82rem; color: ${titleColor};">${st.name}</div>
                <div style="font-size: 0.7rem; color: var(--text-muted);">${st.date}</div>
              </div>
              <div style="font-size: 0.74rem; color: var(--text-muted); margin-top: 2px;">${st.desc}</div>
            </div>
          </div>
        `;
        })
        .join("");
    }

    // Documents GED
    const docsCount = document.getElementById("crd-drawer-docs-count");
    const docsList = document.getElementById("crd-drawer-docs-list");
    if (docsCount)
      docsCount.textContent = `${data.docs ? data.docs.length : 0} pièces`;
    if (docsList && data.docs) {
      docsList.innerHTML = data.docs
        .map(
          (doc) => `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.55rem 0.75rem; background: var(--bg-body); border: 1px solid var(--border-color); border-radius: var(--radius-md);">
          <div style="display: flex; align-items: center; gap: 0.65rem;">
            <div style="color: var(--primary-600); font-size: 1rem;"><i class="fas fa-file-pdf"></i></div>
            <div>
              <div style="font-weight: 600; font-size: 0.78rem; color: var(--text-primary);">${doc.name}</div>
              <div style="font-size: 0.68rem; color: var(--text-muted);">${doc.type} • ${doc.size}</div>
            </div>
          </div>
          <span class="badge badge-approved" style="font-size: 0.65rem; padding: 2px 6px;">
            <i class="fas fa-check-circle mr-1"></i> Certifié
          </span>
        </div>
      `,
        )
        .join("");
    }

    // Guarantee
    const guarStatus = document.getElementById("crd-drawer-guar-status");
    const guarContent = document.getElementById("crd-drawer-guar-content");
    if (guarStatus && data.guarantee)
      guarStatus.innerHTML = data.guarantee.statusBadge;
    if (guarContent && data.guarantee) {
      guarContent.innerHTML = `
        <div style="font-weight: 700; margin-bottom: 3px; color: var(--text-primary);">${data.guarantee.type}</div>
        <p style="margin: 0 0 6px 0; font-size: 0.78rem; color: var(--text-muted);">${data.guarantee.desc}</p>
        <div style="display: flex; gap: 1rem; font-size: 0.74rem;">
          <span>Valeur déclarée : <strong style="font-family: var(--font-family-code);">${data.guarantee.declared}</strong></span>
          <span>Valeur retenue : <strong style="font-family: var(--font-family-code); color: var(--cif-emerald-700);">${data.guarantee.verified}</strong></span>
        </div>
      `;
    }

    // Footer Actions
    const footerActions = document.getElementById("crd-drawer-footer-actions");
    if (footerActions) {
      if (data.actions === "ACTIVE") {
        footerActions.innerHTML = `
          <button class="btn btn-secondary btn-sm" onclick="App.closeClientRequestDrawer(); App.openDossier360('${data.request_number}')">
            <i class="fas fa-file-invoice mr-1"></i> Récapitulatif 360°
          </button>
          <button class="btn btn-secondary btn-sm" onclick="App.closeClientRequestDrawer(); App.switchView('view-client-documents')">
            <i class="fas fa-paperclip mr-1"></i> Pièces GED
          </button>
          <button class="btn btn-primary btn-sm" onclick="App.closeClientRequestDrawer(); App.switchView('view-client-advisor')">
            <i class="fas fa-comment-dots mr-1"></i> Contacter Conseiller
          </button>
        `;
      } else {
        footerActions.innerHTML = `
          <button class="btn btn-success btn-sm" onclick="App.showToast('Téléchargement de l\\'attestation officielle de solde & quittance pour le dossier ${data.request_number}...', 'success')">
            <i class="fas fa-certificate mr-1"></i> Attestation de Solde PDF
          </button>
          <button class="btn btn-secondary btn-sm" onclick="App.closeClientRequestDrawer(); App.switchView('view-client-schedule')">
            <i class="fas fa-receipt mr-1"></i> Historique Règlements
          </button>
        `;
      }
    }

    // Open Backdrop
    const backdrop = document.getElementById("client-request-drawer-backdrop");
    if (backdrop) backdrop.classList.add("active");
  },

  closeClientRequestDrawer() {
    const backdrop = document.getElementById("client-request-drawer-backdrop");
    if (backdrop) backdrop.classList.remove("active");
  },

  openClientPaymentModal(dueIndex = 3, amount = 235000) {
    const modal = document.getElementById("client-payment-modal");
    const dueLabel = document.getElementById("payment-modal-due-label");
    const amountLabel = document.getElementById("payment-modal-amount-label");
    const btnConfirm = document.getElementById("btn-confirm-momo-pay");

    if (dueLabel) dueLabel.textContent = `Échéance N° ${dueIndex} (05/09/2026)`;
    if (amountLabel)
      amountLabel.textContent = CreditScoringEngine.formatFCFA(amount);
    if (btnConfirm)
      btnConfirm.innerHTML = `<i class="fas fa-lock mr-2"></i> Confirmer le Paiement de ${CreditScoringEngine.formatFCFA(amount)}`;

    if (modal) {
      modal.style.display = "flex";
    }
  },

  closeClientPaymentModal() {
    const modal = document.getElementById("client-payment-modal");
    if (modal) modal.style.display = "none";
  },

  triggerMobileMoneyPayment(provider) {
    this.openClientPaymentModal(3, 235000);
    const providerStr = String(provider || "")
      .toLowerCase()
      .split(" ")[0];
    const radios = document.querySelectorAll('input[name="momo_provider"]');
    radios.forEach((r) => {
      if (
        r.value &&
        providerStr &&
        String(r.value).toLowerCase().includes(providerStr)
      ) {
        r.checked = true;
      }
    });
  },

  submitClientPayment(event) {
    event.preventDefault();
    const phone =
      document.getElementById("payment-phone-number")?.value || "77 540 88 12";
    const selectedProvider =
      document.querySelector('input[name="momo_provider"]:checked')?.value ||
      "Orange Money";

    this.closeClientPaymentModal();
    this.showToast(
      `Requête USSD envoyée vers le +223 ${phone} (${selectedProvider})...`,
      "info",
    );

    setTimeout(() => {
      // Mark installment #3 as paid in schedule state
      const targetInstallment = this.scheduleInstallments.find(
        (i) => i.number === 3,
      );
      if (targetInstallment) {
        targetInstallment.status = "PAID";
        targetInstallment.paidDate = `20/08/2026 à ${new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
        targetInstallment.provider = `${selectedProvider} (+223 ${phone})`;
        targetInstallment.receiptRef = "REC-2026-0905-8821";
        targetInstallment.txnId = `MOMO-ML-${Date.now().toString().slice(-6)}`;
      }

      // Re-render the schedule table and metrics
      this.renderClientSchedule();

      this.showSuccessModal({
        title: "Paiement Mobile Money Validé !",
        subtitle: `Le règlement de votre échéance N° 3 a été débité et certifié via ${selectedProvider}.`,
        reference: "TXN-MOMO-2026-0905-8821",
        amount: "235 000 FCFA",
        payment:
          "Échéance N° 3 Soldée (Principal: 200 195 F + Intérêts: 21 055 F + Assurance: 13 750 F)",
        statusHtml: `<i class="fas fa-circle-check"></i> Règlement Confirmé (${selectedProvider})`,
        statusClass: "badge-approved",
        primaryBtnText: "Voir mon Échéancier de Remboursement",
        onPrimaryClick: () => {
          this.switchView("view-client-schedule");
        },
        receiptTitle: "Recu_Paiement_MOMO_2026_0905.pdf",
      });
    }, 1200);
  },

  sendAdvisorMessage() {
    const input = document.getElementById("advisor-msg-input");
    if (!input || !input.value.trim()) return;

    const messageText = input.value.trim();
    const chatContainer = document.getElementById("advisor-chat-messages");

    if (chatContainer) {
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

      // Append user message
      const userMsgDiv = document.createElement("div");
      userMsgDiv.style.display = "flex";
      userMsgDiv.style.gap = "0.75rem";
      userMsgDiv.style.alignItems = "flex-start";
      userMsgDiv.style.maxWidth = "80%";
      userMsgDiv.style.alignSelf = "flex-end";
      userMsgDiv.style.flexDirection = "row-reverse";
      userMsgDiv.innerHTML = `
        <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--primary-600); color: white; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 700; flex-shrink: 0;">
          FN
        </div>
        <div>
          <div style="font-size: 0.72rem; color: var(--text-subtle); margin-bottom: 2px; text-align: right;">Vous • Aujourd'hui à ${timeStr}</div>
          <div style="background: var(--primary-600); color: white; padding: 0.75rem 1rem; border-radius: var(--radius-lg); font-size: 0.82rem; line-height: 1.5;">
            ${messageText.replace(/</g, "&lt;").replace(/>/g, "&gt;")}
          </div>
        </div>
      `;
      chatContainer.appendChild(userMsgDiv);
      chatContainer.scrollTop = chatContainer.scrollHeight;

      input.value = "";

      // Simulated Advisor reply
      setTimeout(() => {
        const advisorMsgDiv = document.createElement("div");
        advisorMsgDiv.style.display = "flex";
        advisorMsgDiv.style.gap = "0.75rem";
        advisorMsgDiv.style.alignItems = "flex-start";
        advisorMsgDiv.style.maxWidth = "80%";
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
        this.showToast(
          "Nouveau message de votre conseiller Kofi Mensah",
          "info",
        );
      }, 1500);
    }
  },

  openAppointmentModal() {
    const modal = document.getElementById("client-appointment-modal");
    if (modal) {
      modal.style.display = "flex";
      // Setup channel radio interactions if any
      const channelRadios = modal.querySelectorAll(
        'input[name="appt_channel"]',
      );
      channelRadios.forEach((radio) => {
        radio.addEventListener("change", () => {
          modal.querySelectorAll(".appt-type-option").forEach((opt) => {
            opt.style.border = "1px solid var(--border-color)";
            opt.style.background = "var(--bg-surface)";
          });
          const parentLabel = radio.closest(".appt-type-option");
          if (parentLabel) {
            parentLabel.style.border = "2px solid var(--primary-600)";
            parentLabel.style.background = "var(--primary-50)";
          }
        });
      });
    }
  },

  closeAppointmentModal() {
    const modal = document.getElementById("client-appointment-modal");
    if (modal) modal.style.display = "none";
  },

  handleBookAppointmentModal(event) {
    event.preventDefault();
    const dateInput = document.getElementById("appt-modal-date");
    const timeSelect = document.getElementById("appt-modal-time");
    const reasonSelect = document.getElementById("appt-modal-reason");
    const notesInput = document.getElementById("appt-modal-notes");
    const channelRadio = document.querySelector(
      'input[name="appt_channel"]:checked',
    );

    const dateVal = dateInput ? dateInput.value : "2026-08-21";
    const timeVal = timeSelect ? timeSelect.value : "14:00";
    const reasonText = reasonSelect
      ? reasonSelect.options[reasonSelect.selectedIndex].text
      : "Accompagnement Financement";
    const channelVal = channelRadio ? channelRadio.value : "AGENCY";
    const channelText =
      channelVal === "AGENCY"
        ? "en agence Médina"
        : channelVal === "PHONE"
          ? "par téléphone"
          : "en visioconférence";

    this.closeAppointmentModal();

    // Show Confirmation toast
    this.showToast(
      `Rendez-vous confirmé le ${dateVal} à ${timeVal} (${channelText}) avec Adama Traore !`,
      "success",
    );

    // Add confirmation message to chat thread
    const chatContainer = document.getElementById("advisor-chat-messages");
    if (chatContainer) {
      const confirmationMsg = document.createElement("div");
      confirmationMsg.style.display = "flex";
      confirmationMsg.style.justifyContent = "center";
      confirmationMsg.style.margin = "0.5rem 0";
      confirmationMsg.innerHTML = `
        <div style="background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.3); color: var(--cif-emerald-700); padding: 0.6rem 1rem; border-radius: var(--radius-lg); font-size: 0.78rem; text-align: center; max-width: 85%;">
          <i class="fas fa-calendar-check mr-1"></i> <strong>Rendez-vous programmé :</strong> ${dateVal} à ${timeVal} (${channelText}) - <em>${reasonText}</em>. SMS de rappel envoyé.
        </div>
      `;
      chatContainer.appendChild(confirmationMsg);
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  },

  handleBookAppointment(event) {
    if (event) event.preventDefault();
    this.handleBookAppointmentModal(event);
  },

  initNotifications() {
    const notifBtn = document.getElementById("notif-bell-btn");
    const notifDropdown = document.getElementById("notif-dropdown");

    if (notifBtn && notifDropdown) {
      notifBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const isHidden =
          notifDropdown.style.display === "none" ||
          !notifDropdown.style.display;
        notifDropdown.style.display = isHidden ? "block" : "none";

        // Close profile dropdown if open
        const profileMenu = document.getElementById("profile-dropdown-menu");
        const profileBtn = document.getElementById("topbar-profile-btn");
        if (profileMenu) profileMenu.classList.remove("show");
        if (profileBtn) profileBtn.classList.remove("active");
      });

      document.addEventListener("click", (e) => {
        if (!notifBtn.contains(e.target) && !notifDropdown.contains(e.target)) {
          notifDropdown.style.display = "none";
        }
      });
    }
  },

  markAllNotificationsRead() {
    const items = document.querySelectorAll(".notif-item.unread");
    items.forEach((item) => item.classList.remove("unread"));

    const badge = document.getElementById("topbar-notif-badge");
    if (badge) badge.style.display = "none";

    const unreadCountBadge = document.getElementById(
      "notif-unread-count-badge",
    );
    if (unreadCountBadge) {
      unreadCountBadge.className = "badge badge-approved";
      unreadCountBadge.textContent = "0 Non Lue";
    }

    this.showToast(
      "Toutes les notifications ont été marquées comme lues",
      "success",
    );
  },

  filterNotifications(category, btn) {
    if (btn) {
      const container = document.getElementById("notif-filter-bar");
      if (container) {
        container
          .querySelectorAll(".notif-chip")
          .forEach((c) => c.classList.remove("active"));
        btn.classList.add("active");
      }
    }

    const items = document.querySelectorAll(".notif-item");
    items.forEach((item) => {
      if (category === "ALL") {
        item.style.display = "flex";
      } else if (item.classList.contains(`notif-cat-${category}`)) {
        item.style.display = "flex";
      } else {
        item.style.display = "none";
      }
    });
  },

  handleNotificationClick(dossierId, targetView) {
    const notifDropdown = document.getElementById("notif-dropdown");
    if (notifDropdown) notifDropdown.style.display = "none";

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
    const sel = document.getElementById("country-lang-select");
    if (sel) {
      sel.addEventListener("change", (e) => {
        this.showToast(`Zone UEMOA sélectionnée : ${e.target.value}`, "info");
      });
    }
  },

  showToast(message, type = "info") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    let icon = "fa-info-circle";
    if (type === "success") icon = "fa-check-circle text-success";
    if (type === "danger") icon = "fa-exclamation-circle text-danger";
    if (type === "warning") icon = "fa-triangle-exclamation text-warning";

    toast.innerHTML = `
      <i class="fas ${icon} toast-icon"></i>
      <div style="flex: 1; font-size: 0.82rem; font-weight: 500;">${message}</div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(100%)";
      toast.style.transition = "all 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  },

  // ==========================================================================
  // BROWSER CAMERA & OFFICIAL DOCUMENT QR CODE SCANNER ENGINE
  // ==========================================================================
  qrTargetContext: "identity", // 'identity' | 'document' | 'general'
  qrMediaStream: null,
  qrFacingMode: "environment", // 'environment' (back) or 'user' (front)
  qrScanningActive: false,
  qrTorchActive: false,
  lastDecodedQrData: null,
  qrAnimationId: null,

  openQrScannerModal(context = "identity") {
    this.qrTargetContext = context;
    const modal = document.getElementById("modal-qr-scanner");
    if (!modal) return;

    modal.style.display = "flex";
    requestAnimationFrame(() => modal.classList.add("active"));
    this.resetQrScannerState();

    // Contextual title / subtitle adjustment
    const titleEl = modal.querySelector(".modal-header-title h4");
    const descEl = modal.querySelector(".modal-header-title span");
    if (context === "identity") {
      if (titleEl)
        titleEl.textContent = "Scanner QR Pièce d'Identité UEMOA (CNI / NINA)";
      if (descEl)
        descEl.textContent =
          "Authentification automatique du demandeur par scan caméra";
    } else if (context === "document") {
      if (titleEl)
        titleEl.textContent =
          "Scanner QR Document Officiel (Facture / RCCM / Titre)";
      if (descEl)
        descEl.textContent =
          "Validation d'authenticité et certification cryptographique";
    } else {
      if (titleEl)
        titleEl.textContent = "Scanner de Documents & QR Codes UEMOA";
      if (descEl)
        descEl.textContent =
          "Extraction automatique et rattachement aux dossiers de crédit";
    }

    // Launch camera automatically
    this.startCameraFeed();
  },

  closeQrScannerModal() {
    this.stopCameraFeed();
    const modal = document.getElementById("modal-qr-scanner");
    if (modal) {
      modal.classList.remove("active");
      modal.style.display = "none";
    }
  },

  async startCameraFeed() {
    const video = document.getElementById("qr-video-feed");
    const errorBanner = document.getElementById("qr-camera-error-banner");
    const statusText = document.getElementById("qr-scanner-status-text");
    const errorDesc = document.getElementById("qr-camera-error-desc");

    if (errorBanner) errorBanner.style.display = "none";
    if (statusText)
      statusText.innerHTML =
        '<i class="fas fa-circle-notch fa-spin mr-1"></i> Recherche de QR Code officiel...';

    this.stopCameraFeed();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      if (errorBanner) errorBanner.style.display = "flex";
      if (errorDesc)
        errorDesc.textContent =
          "Votre navigateur ne prend pas en charge l'accès direct à la caméra. Vous pouvez utiliser le chargement d'image ou le simulateur de scan express ci-dessous.";
      return;
    }

    try {
      const constraints = {
        video: {
          facingMode: this.qrFacingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.qrMediaStream = stream;

      if (video) {
        video.srcObject = stream;
        video.setAttribute("playsinline", "true");
        await video.play();
      }

      this.qrScanningActive = true;
      this.processQrVideoFrame();
      this.showToast("Caméra activée avec succès", "info");
    } catch (err) {
      console.warn("Camera stream error:", err);
      if (errorBanner) errorBanner.style.display = "flex";
      if (errorDesc) {
        if (
          err.name === "NotAllowedError" ||
          err.name === "PermissionDeniedError"
        ) {
          errorDesc.textContent =
            "L'autorisation d'accès à la caméra a été refusée par le navigateur. Vous pouvez autoriser la caméra dans la barre d'adresse ou utiliser le simulateur express.";
        } else if (
          err.name === "NotFoundError" ||
          err.name === "DevicesNotFoundError"
        ) {
          errorDesc.textContent =
            "Aucun capteur caméra détecté. Utilisez le simulateur d'échantillons ou chargez un fichier image.";
        } else {
          errorDesc.textContent = `Erreur caméra : ${err.message || "Périphérique indisponible"}. Utilisez le mode simulation express ci-dessous.`;
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
      this.qrMediaStream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {}
      });
      this.qrMediaStream = null;
    }
    const video = document.getElementById("qr-video-feed");
    if (video) {
      video.srcObject = null;
    }
  },

  async switchCameraFacingMode() {
    this.qrFacingMode =
      this.qrFacingMode === "environment" ? "user" : "environment";
    const switchBtn = document.getElementById("btn-qr-switch-camera");
    if (switchBtn) {
      switchBtn.innerHTML = `<i class="fas fa-camera-rotate"></i> <span>${this.qrFacingMode === "environment" ? "Arrière" : "Avant"}</span>`;
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
          advanced: [{ torch: this.qrTorchActive }],
        });
        const torchBtn = document.getElementById("btn-qr-toggle-torch");
        if (torchBtn) {
          torchBtn.classList.toggle("btn-primary", this.qrTorchActive);
          torchBtn.classList.toggle("btn-secondary", !this.qrTorchActive);
        }
        this.showToast(
          this.qrTorchActive ? "Flash allumé" : "Flash éteint",
          "info",
        );
      } else {
        this.showToast(
          "Flash/Torche non pris en charge par ce capteur",
          "warning",
        );
      }
    } catch (e) {
      this.showToast(
        "Contrôle du flash indisponible sur cet appareil",
        "warning",
      );
    }
  },

  processQrVideoFrame() {
    if (!this.qrScanningActive) return;

    const video = document.getElementById("qr-video-feed");
    const canvas = document.getElementById("qr-canvas-buffer");

    if (video && video.readyState === video.HAVE_ENOUGH_DATA && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Try decoding with jsQR if loaded
        if (typeof window.jsQR === "function") {
          const code = window.jsQR(
            imageData.data,
            imageData.width,
            imageData.height,
            {
              inversionAttempts: "dontInvert",
            },
          );
          if (code && code.data) {
            this.handleQrScanSuccess(code.data);
            return;
          }
        }
      }
    }

    this.qrAnimationId = requestAnimationFrame(() =>
      this.processQrVideoFrame(),
    );
  },

  handleQrScanSuccess(rawData) {
    this.stopCameraFeed();

    // Play subtle audio confirmation
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        audioCtx.currentTime + 0.18,
      );
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.18);
    } catch (e) {}

    // Parse payload into structured official document data
    let docData = null;
    try {
      if (typeof rawData === "string" && rawData.startsWith("{")) {
        docData = JSON.parse(rawData);
      }
    } catch (e) {}

    if (!docData) {
      // Create rich structured data based on context or scanned string
      if (
        this.qrTargetContext === "identity" ||
        (typeof rawData === "string" && rawData.includes("CNI"))
      ) {
        docData = {
          type: "CNI_BIOMETRIQUE_UEMOA",
          typeLabel: "Carte Nationale d'Identité Biométrique UEMOA",
          docNumber: "CNI-ML-2026-B88219",
          holderName: "Ibrahima Koné",
          phone: "+223 70 88 99 00",
          country: "Mali",
          city: "Bamako - Faladié",
          issuer: "Ministère de la Sécurité & de la Protection Civile (Mali)",
          issueDate: "12/03/2024",
          expiryDate: "11/03/2034",
          hash: "SHA256:4f8e91a2...c8901",
        };
      } else {
        docData = {
          type: "FACTURE_NORMALISEE_DGI",
          typeLabel: "Facture Normalisée Sécurisée DGI / UEMOA",
          docNumber: "FACT-DGI-2026-8819",
          holderName: "Quincaillerie & Outillage Faladié",
          amount: "800 000 FCFA",
          rccm: "MA-BKO-2023-B-4410",
          issuer: "Direction Générale des Impôts (DGI Mali)",
          issueDate: "15/07/2026",
          hash: "UEMOA-SIGN-RSA2048:e3b0c442...98ff",
        };
      }
    }

    this.lastDecodedQrData = docData;
    this.displayQrScanResult(docData);
  },

  displayQrScanResult(data) {
    const resultCard = document.getElementById("qr-scan-result-card");
    const badgeType = document.getElementById("qr-doc-type-badge");
    const fieldsContainer = document.getElementById(
      "qr-extracted-fields-container",
    );

    if (!resultCard || !fieldsContainer) return;

    if (badgeType) {
      badgeType.textContent = data.typeLabel || data.type;
    }

    let html = "";
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
          <div class="qr-extracted-val">${data.city ? data.city + ", " : ""}${data.country || ""}</div>
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
    resultCard.style.display = "block";
  },

  resetQrScannerState() {
    const resultCard = document.getElementById("qr-scan-result-card");
    if (resultCard) resultCard.style.display = "none";
    this.lastDecodedQrData = null;
    if (document.getElementById("modal-qr-scanner").style.display !== "none") {
      this.startCameraFeed();
    }
  },

  simulateQrScanPreset(presetKey) {
    let mockData = {};
    if (presetKey === "cni") {
      mockData = {
        type: "CARTE_NATIONALE_IDENTITE",
        typeLabel: "Carte d'Identité Nationale Biométrique NINA",
        docNumber: "NINA-ML-2026-992104",
        holderName: "Oumar Traoré",
        phone: "+223 76 11 22 33",
        country: "Mali",
        city: "Bamako - Quartier Badalabougou",
        issuer: "Ministère de l'Administration Territoriale (Mali)",
        issueDate: "04/01/2025",
        expiryDate: "03/01/2035",
        hash: "SHA256:7c9e012fa89b4412...09e8bf",
      };
    } else if (presetKey === "invoice") {
      mockData = {
        type: "FACTURE_NORMALISEE_DGI",
        typeLabel: "Facture Normalisée DGI avec Timbre Électronique",
        docNumber: "FAC-DGI-ML-2026-4401",
        holderName: "Établissements Bois & Outillage Moderne",
        amount: "1 200 000 FCFA",
        rccm: "ML-BKO-2022-B-9912",
        issuer: "Direction Générale des Impôts (Mali)",
        issueDate: "14/08/2026",
        hash: "RSA2048-CERT:4a5c90fe...1142ab",
      };
    } else if (presetKey === "rccm") {
      mockData = {
        type: "RCCM_REGISTRE_COMMERCE",
        typeLabel: "Extrait Registre du Commerce et du Crédit Mobilier (RCCM)",
        docNumber: "RCCM-ML-BKO-2023-B-7721",
        holderName: "Menuiserie Artisanale Koné & Frères",
        country: "Mali",
        city: "Bamako",
        rccm: "ML-BKO-2023-B-7721",
        issuer: "Greffe du Tribunal de Commerce de Bamako",
        issueDate: "20/05/2023",
        hash: "OHADA-RCCM-VERIF:8819cc02...33da",
      };
    }

    this.handleQrScanSuccess(JSON.stringify(mockData));
    this.showToast(
      `Échantillon officiel ${mockData.typeLabel} scanné avec succès`,
      "success",
    );
  },

  handleQrImageUpload(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        let qrDecoded = null;
        if (typeof window.jsQR === "function") {
          qrDecoded = window.jsQR(
            imageData.data,
            imageData.width,
            imageData.height,
          );
        }

        if (qrDecoded && qrDecoded.data) {
          this.handleQrScanSuccess(qrDecoded.data);
          this.showToast(
            "QR Code détecté et validé depuis le fichier image",
            "success",
          );
        } else {
          // Fallback simulation with document metadata
          this.simulateQrScanPreset(
            this.qrTargetContext === "identity" ? "cni" : "invoice",
          );
          this.showToast(
            "Document analysé avec succès par le moteur de reconnaissance",
            "success",
          );
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  },

  applyQrScanData() {
    const data = this.lastDecodedQrData;
    if (!data) return;

    if (
      this.qrTargetContext === "identity" ||
      data.type === "CNI_BIOMETRIQUE_UEMOA"
    ) {
      // Auto fill wizard step 1
      const nameInput = document.getElementById("wiz-fullname");
      const phoneInput = document.getElementById("wiz-phone");
      const countryInput = document.getElementById("wiz-country");
      const cityInput = document.getElementById("wiz-city");
      const badge = document.getElementById("wizard-identity-qr-badge");
      const badgeText = document.getElementById("wizard-identity-qr-text");

      if (nameInput && data.holderName) nameInput.value = data.holderName;
      if (phoneInput && data.phone) phoneInput.value = data.phone;
      if (countryInput && data.country) countryInput.value = data.country;
      if (cityInput && data.city) cityInput.value = data.city;

      if (badge && badgeText) {
        badge.style.display = "flex";
        badgeText.textContent = `${data.typeLabel || "CNI Biométrique"} N° ${data.docNumber || ""} • Titulaire : ${data.holderName || ""} (Authentifié 100% via UEMOA QR)`;
      }

      this.showToast(
        "Informations d'identité et KYC renseignées automatiquement depuis le QR Code",
        "success",
      );
    } else {
      // Auto attach document in step 6 or general
      const docBadge = document.getElementById("wizard-doc-qr-badge");
      const docBadgeText = document.getElementById("wizard-doc-qr-text");

      if (docBadge && docBadgeText) {
        docBadge.style.display = "flex";
        docBadgeText.textContent = `${data.typeLabel || "Document Officiel"} (${data.docNumber || "Réf certifiée"}) rattaché au dossier avec empreinte cryptographique validée.`;
      }

      // If invoice amount exists and amount input is on step 4 or guarantee
      if (data.amount) {
        const guaranteeValInput = document.getElementById("wiz-guarantee-val");
        if (guaranteeValInput && String(data.amount).includes("1 200 000")) {
          guaranteeValInput.value = 1200000;
        }
      }

      this.showToast(
        "Document officiel certifié rattaché avec succès au dossier",
        "success",
      );
    }

    this.closeQrScannerModal();
  },

  // ==========================================================================
  // MODAL MANAGEMENT HELPERS
  // ==========================================================================
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.style.display = "flex";
    setTimeout(() => {
      modal.classList.add("active");
    }, 10);
  },

  closeModal(modalId) {
    if (!modalId) return;
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove("active");
      setTimeout(() => {
        if (!modal.classList.contains("active")) {
          modal.style.display = "none";
        }
      }, 250);
    }
    if (
      window.AppInteractions &&
      typeof window.AppInteractions.closeModal === "function"
    ) {
      window.AppInteractions.closeModal(modalId);
    }
  },

  openDossier360(dossierIdentifier) {
    if (
      window.AppInteractions &&
      typeof window.AppInteractions.openDossierModal === "function"
    ) {
      window.AppInteractions.openDossierModal(dossierIdentifier);
    }
  },

  openDossierModal(dossierIdentifier) {
    if (
      window.AppInteractions &&
      typeof window.AppInteractions.openDossierModal === "function"
    ) {
      window.AppInteractions.openDossierModal(dossierIdentifier);
    }
  },

  closeDossierModal() {
    this.closeModal("dossier-modal");
  },

  openCommitteeModal(dossierId) {
    const req = this.resolveCreditRequest(dossierId);
    if (
      window.AppInteractions &&
      typeof window.AppInteractions.openCommitteeModal === "function"
    ) {
      window.AppInteractions.openCommitteeModal(req ? req.id : dossierId);
    }
  },

  openCommitteeVote(dossierId) {
    this.openCommitteeModal(dossierId);
  },

  closeCommitteeModal() {
    this.closeModal("committee-modal");
  },

  // ==========================================================================
  // [FEATURE] INTERACTIVE LOAN AMORTIZATION CALCULATOR (BORROWER DASHBOARD)
  // ==========================================================================
  isAmortizationScheduleOpen: false,

  updateCompactEstimator() {
    const amountSlider = document.getElementById("compact-est-amount-range");
    const durationSlider = document.getElementById(
      "compact-est-duration-range",
    );
    if (!amountSlider || !durationSlider) return;

    const amount = parseInt(amountSlider.value, 10) || 2500000;
    const duration = parseInt(durationSlider.value, 10) || 12;

    const amountValEl = document.getElementById("compact-est-amount-val");
    const durationValEl = document.getElementById("compact-est-duration-val");
    if (amountValEl)
      amountValEl.textContent = CreditScoringEngine.formatFCFA(amount);
    if (durationValEl) durationValEl.textContent = `${duration} Mois`;

    // Standard UEMOA microfinance scale: 1.2% per month (14.4% per annum degressive)
    const rateMonthly = 0.012;
    const monthlyPaymentRaw =
      (amount * rateMonthly) / (1 - Math.pow(1 + rateMonthly, -duration));
    const totalPayments = monthlyPaymentRaw * duration;
    const totalInterest = Math.round(totalPayments - amount);
    const insuranceAndFees = Math.round(amount * 0.012);
    const monthlyInsurance = Math.round(insuranceAndFees / duration);
    const monthlyTotal = Math.round(monthlyPaymentRaw + monthlyInsurance);
    const totalCost = Math.round(totalInterest + insuranceAndFees);
    const totalRepaid = Math.round(amount + totalCost);

    // Monthly breakdown portions
    const avgMonthlyPrincipal = Math.round(amount / duration);
    const avgMonthlyInterest = Math.round(totalInterest / duration);

    const monthlyValEl = document.getElementById("compact-est-monthly-val");
    const totalValEl = document.getElementById("compact-est-total-val");
    const totalInterestEl = document.getElementById(
      "compact-est-total-interest",
    );
    const costValEl = document.getElementById("compact-est-cost-val");
    const monthlyPrincipalEl = document.getElementById(
      "compact-est-monthly-principal",
    );
    const monthlyInterestEl = document.getElementById(
      "compact-est-monthly-interest",
    );
    const monthlyInsuranceEl = document.getElementById(
      "compact-est-monthly-insurance",
    );

    if (monthlyValEl)
      monthlyValEl.textContent = CreditScoringEngine.formatFCFA(monthlyTotal);
    if (totalValEl)
      totalValEl.textContent = CreditScoringEngine.formatFCFA(totalRepaid);
    if (totalInterestEl)
      totalInterestEl.textContent =
        CreditScoringEngine.formatFCFA(totalInterest);
    if (costValEl)
      costValEl.textContent = CreditScoringEngine.formatFCFA(totalCost);
    if (monthlyPrincipalEl)
      monthlyPrincipalEl.textContent =
        CreditScoringEngine.formatFCFA(avgMonthlyPrincipal);
    if (monthlyInterestEl)
      monthlyInterestEl.textContent =
        CreditScoringEngine.formatFCFA(avgMonthlyInterest);
    if (monthlyInsuranceEl)
      monthlyInsuranceEl.textContent =
        CreditScoringEngine.formatFCFA(monthlyInsurance);

    // Update compact pie chart & breakdown percentages
    const pctCapital = Math.round((amount / totalRepaid) * 100);
    const pctInterest = Math.round((totalInterest / totalRepaid) * 100);
    const pctFees = Math.max(1, 100 - pctCapital - pctInterest);

    const pieValCapital = document.getElementById("compact-pie-val-capital");
    const pieValInterest = document.getElementById("compact-pie-val-interest");
    const pieValFees = document.getElementById("compact-pie-val-fees");
    const piePctCapital = document.getElementById("compact-pie-pct-capital");
    const piePctInterest = document.getElementById("compact-pie-pct-interest");
    const piePctFees = document.getElementById("compact-pie-pct-fees");

    if (pieValCapital)
      pieValCapital.textContent = CreditScoringEngine.formatFCFA(amount);
    if (pieValInterest)
      pieValInterest.textContent =
        CreditScoringEngine.formatFCFA(totalInterest);
    if (pieValFees)
      pieValFees.textContent = CreditScoringEngine.formatFCFA(insuranceAndFees);
    if (piePctCapital) piePctCapital.textContent = `${pctCapital}%`;
    if (piePctInterest) piePctInterest.textContent = `${pctInterest}%`;
    if (piePctFees) piePctFees.textContent = `${pctFees}%`;

    const barCapital = document.getElementById("compact-bar-capital");
    const barInterest = document.getElementById("compact-bar-interest");
    const barFees = document.getElementById("compact-bar-fees");
    if (barCapital) barCapital.style.width = `${pctCapital}%`;
    if (barInterest) barInterest.style.width = `${pctInterest}%`;
    if (barFees) barFees.style.width = `${pctFees}%`;

    if (
      window.AppCharts &&
      typeof window.AppCharts.renderLoanBreakdownPie === "function"
    ) {
      window.AppCharts.renderLoanBreakdownPie(
        "compact-estimator-pie-chart",
        amount,
        totalInterest,
        insuranceAndFees,
      );
    }

    // Update active preset chips
    document
      .querySelectorAll(".compact-preset-chip")
      .forEach((chip) => chip.classList.remove("active"));
    const amountChip = document.getElementById(`chip-amount-${amount}`);
    const durationChip = document.getElementById(`chip-duration-${duration}`);
    if (amountChip) amountChip.classList.add("active");
    if (durationChip) durationChip.classList.add("active");

    // Update Amortization Schedule Table
    this.renderAmortizationScheduleTable(
      amount,
      duration,
      rateMonthly,
      monthlyInsurance,
    );
  },

  renderAmortizationScheduleTable(
    amount,
    duration,
    rateMonthly,
    monthlyInsurance,
  ) {
    const tbody = document.getElementById("client-amortization-table-body");
    const tfoot = document.getElementById("client-amortization-table-foot");
    const titleEl = document.getElementById("amortization-table-summary-title");
    if (!tbody) return;

    if (titleEl) {
      titleEl.textContent = `${CreditScoringEngine.formatFCFA(amount)} sur ${duration} Mois (${rateMonthly * 100}%/mois)`;
    }

    let remainingBalance = amount;
    const monthlyPaymentConstant =
      (amount * rateMonthly) / (1 - Math.pow(1 + rateMonthly, -duration));
    let totalPrincipalAmortized = 0;
    let sumInterest = 0;
    let sumInsurance = 0;
    let sumTotalPayment = 0;

    let rowsHtml = "";
    const now = new Date();

    for (let month = 1; month <= duration; month++) {
      const initialBalance = remainingBalance;
      const interestMonth = Math.round(initialBalance * rateMonthly);
      let principalMonth = Math.round(monthlyPaymentConstant - interestMonth);
      if (month === duration || principalMonth > initialBalance) {
        principalMonth = initialBalance;
      }
      const totalMonth = principalMonth + interestMonth + monthlyInsurance;
      remainingBalance = Math.max(0, initialBalance - principalMonth);

      totalPrincipalAmortized += principalMonth;
      sumInterest += interestMonth;
      sumInsurance += monthlyInsurance;
      sumTotalPayment += totalMonth;

      const dueDate = new Date(now.getFullYear(), now.getMonth() + month, 5);
      const dueDateStr = dueDate.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      rowsHtml += `
        <tr style="transition: background 0.15s ease;">
          <td><span class="badge ${month === 1 ? "badge-approved" : "badge-submitted"}" style="font-size: 0.68rem; font-weight: 700;">Mois ${month}</span></td>
          <td style="color: var(--text-secondary); font-size: 0.76rem;"><i class="fas fa-calendar-day mr-1 text-primary"></i>${dueDateStr}</td>
          <td style="text-align: right; font-family: var(--font-family-code); color: var(--text-primary);">${CreditScoringEngine.formatFCFA(initialBalance)}</td>
          <td style="text-align: right; font-family: var(--font-family-code); color: #0284c7; font-weight: 700;">${CreditScoringEngine.formatFCFA(principalMonth)}</td>
          <td style="text-align: right; font-family: var(--font-family-code); color: #d97706; font-weight: 600;">${CreditScoringEngine.formatFCFA(interestMonth)}</td>
          <td style="text-align: right; font-family: var(--font-family-code); color: #059669;">${CreditScoringEngine.formatFCFA(monthlyInsurance)}</td>
          <td style="text-align: right; font-family: var(--font-family-code); font-weight: 800; color: var(--text-primary); background: rgba(16, 185, 129, 0.04);">${CreditScoringEngine.formatFCFA(totalMonth)}</td>
          <td style="text-align: right; font-family: var(--font-family-code); font-weight: 600; color: ${remainingBalance === 0 ? "#10b981" : "var(--text-muted)"};">${CreditScoringEngine.formatFCFA(remainingBalance)}</td>
        </tr>
      `;
    }

    tbody.innerHTML = rowsHtml;

    if (tfoot) {
      tfoot.innerHTML = `
        <tr style="background: var(--bg-surface); font-size: 0.82rem;">
          <td colspan="2" style="text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-primary);">TOTAUX CUMULÉS</td>
          <td style="text-align: right; font-family: var(--font-family-code);">-</td>
          <td style="text-align: right; font-family: var(--font-family-code); color: #0284c7;">${CreditScoringEngine.formatFCFA(totalPrincipalAmortized)}</td>
          <td style="text-align: right; font-family: var(--font-family-code); color: #d97706;">${CreditScoringEngine.formatFCFA(sumInterest)}</td>
          <td style="text-align: right; font-family: var(--font-family-code); color: #059669;">${CreditScoringEngine.formatFCFA(sumInsurance)}</td>
          <td style="text-align: right; font-family: var(--font-family-code); color: var(--cif-emerald-600); font-size: 0.92rem;">${CreditScoringEngine.formatFCFA(sumTotalPayment)}</td>
          <td style="text-align: right; font-family: var(--font-family-code); color: #10b981;">0 FCFA (Soldé)</td>
        </tr>
      `;
    }
  },

  toggleAmortizationScheduleTable() {
    const wrapper = document.getElementById(
      "client-amortization-schedule-wrapper",
    );
    const labelEl = document.getElementById("label-toggle-amortization");
    if (!wrapper) return;

    this.isAmortizationScheduleOpen = !this.isAmortizationScheduleOpen;
    if (this.isAmortizationScheduleOpen) {
      wrapper.style.display = "block";
      if (labelEl) labelEl.textContent = "Masquer l'Échéancier";
      wrapper.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } else {
      wrapper.style.display = "none";
      if (labelEl) labelEl.textContent = "Tableau d'Amortissement";
    }
  },

  downloadSimulatedAmortizationPdf() {
    const amountSlider = document.getElementById("compact-est-amount-range");
    const durationSlider = document.getElementById(
      "compact-est-duration-range",
    );
    const amount = amountSlider ? parseInt(amountSlider.value, 10) : 2500000;
    const duration = durationSlider ? parseInt(durationSlider.value, 10) : 12;

    this.showToast(
      `Génération du Tableau d'Amortissement Prévisionnel (${CreditScoringEngine.formatFCFA(amount)} sur ${duration} mois)...`,
      "info",
    );
    setTimeout(() => {
      this.showToast(
        `Échéancier Prévisionnel de Prêt téléchargé avec succès (Format PDF A/4)`,
        "success",
      );
    }, 700);
  },

  setCompactPresetAmount(amount) {
    const slider = document.getElementById("compact-est-amount-range");
    if (slider) {
      slider.value = amount;
      this.updateCompactEstimator();
    }
  },

  setCompactPresetDuration(months) {
    const slider = document.getElementById("compact-est-duration-range");
    if (slider) {
      slider.value = months;
      this.updateCompactEstimator();
    }
  },

  applyFromCompactEstimator() {
    const amountSlider = document.getElementById("compact-est-amount-range");
    const durationSlider = document.getElementById(
      "compact-est-duration-range",
    );
    const amount = amountSlider ? parseInt(amountSlider.value, 10) : 2500000;
    const duration = durationSlider ? parseInt(durationSlider.value, 10) : 12;

    this.openNewLoanModal({
      amount,
      duration,
      purpose: "Financement de projet CIF",
    });
    this.showToast(
      `Paramètres appliqués : ${CreditScoringEngine.formatFCFA(amount)} sur ${duration} mois`,
      "success",
    );
  },

  // ==========================================================================
  // [FEATURE] SUCCESS ANIMATION MODAL CONTROLLER (GREEN CHECKMARK)
  // ==========================================================================
  successOnPrimaryCallback: null,
  successReceiptFilename: "Recipisse_Transaction_CIF.pdf",

  showSuccessModal(config = {}) {
    const modal = document.getElementById("modal-success-animation");
    if (!modal) return;

    const titleEl = document.getElementById("success-modal-title");
    const subtitleEl = document.getElementById("success-modal-subtitle");
    const refEl = document.getElementById("success-detail-ref");
    const amountEl = document.getElementById("success-detail-amount");
    const paymentEl = document.getElementById("success-detail-payment");
    const statusEl = document.getElementById("success-detail-status");
    const primaryBtn = document.getElementById("success-modal-primary-btn");

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
    this.successReceiptFilename =
      config.receiptTitle || "Recipisse_Transaction_CIF.pdf";

    modal.style.display = "flex";
    setTimeout(() => {
      modal.classList.add("active");
    }, 10);
  },

  closeSuccessModal() {
    const modal = document.getElementById("modal-success-animation");
    if (modal) {
      modal.classList.remove("active");
      setTimeout(() => {
        modal.style.display = "none";
      }, 250);
    }

    if (typeof this.successOnPrimaryCallback === "function") {
      const cb = this.successOnPrimaryCallback;
      this.successOnPrimaryCallback = null;
      cb();
    }
  },

  downloadSuccessReceipt() {
    this.showToast(
      `Génération du récépissé officiel sécurisé (${this.successReceiptFilename})...`,
      "info",
    );
    setTimeout(() => {
      this.showToast(
        `Récépissé ${this.successReceiptFilename} téléchargé avec succès !`,
        "success",
      );
    }, 600);
  },

  // ==========================================================================
  // [FEATURE] LIGHT-BOX DOCUMENT PREVIEW & OCR VIEWER
  // ==========================================================================
  docLightboxZoom: 1,
  docLightboxRotation: 0,
  currentLightboxDocKey: "proforma",

  openDocLightbox(docKey = "proforma") {
    this.currentLightboxDocKey = docKey;
    this.docLightboxZoom = 1;
    this.docLightboxRotation = 0;

    const modal = document.getElementById("modal-doc-lightbox");
    if (!modal) return;

    const docData = this.getDocLightboxData(docKey);

    // Set Topbar info
    const titleEl = document.getElementById("doc-lightbox-title");
    const metaEl = document.getElementById("doc-lightbox-meta");
    const badgeEl = document.getElementById("doc-lightbox-badge");
    const iconEl = document.getElementById("doc-lightbox-file-icon");
    const confScoreEl = document.getElementById("doc-lightbox-conf-score");

    if (titleEl) titleEl.textContent = docData.title;
    if (metaEl) metaEl.textContent = docData.meta;
    if (badgeEl) {
      badgeEl.className = `badge ${docData.badgeClass || "badge-approved"}`;
      badgeEl.innerHTML = docData.badgeHtml;
    }
    if (iconEl) iconEl.className = docData.iconClass || "fas fa-file-pdf";
    if (confScoreEl)
      confScoreEl.textContent = `${docData.confidenceScore || "99.8%"} Confiance`;

    // Render OCR Fields in Sidebar
    const fieldsList = document.getElementById("doc-lightbox-fields-list");
    if (fieldsList) {
      fieldsList.innerHTML = docData.fields
        .map(
          (f) => `
        <div class="doc-ocr-field-row">
          <span class="doc-ocr-field-lbl">${f.label}</span>
          <span class="doc-ocr-field-val">${f.value}</span>
        </div>
      `,
        )
        .join("");
    }

    // Render Document Sheet Content
    const renderedContent = document.getElementById(
      "doc-lightbox-rendered-content",
    );
    if (renderedContent) {
      renderedContent.innerHTML = docData.sheetHtml;
    }

    this.applyLightboxTransform();

    modal.style.display = "flex";
    setTimeout(() => {
      modal.classList.add("active");
    }, 10);
  },

  closeDocLightbox() {
    const modal = document.getElementById("modal-doc-lightbox");
    if (!modal) return;
    modal.classList.remove("active");
    setTimeout(() => {
      modal.style.display = "none";
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
    const sheet = document.getElementById("doc-lightbox-sheet");
    const zoomVal = document.getElementById("doc-lightbox-zoom-val");
    if (sheet) {
      sheet.style.transform = `scale(${this.docLightboxZoom}) rotate(${this.docLightboxRotation}deg)`;
    }
    if (zoomVal) {
      zoomVal.textContent = `${Math.round(this.docLightboxZoom * 100)}%`;
    }
  },

  downloadDocLightbox() {
    const docData = this.getDocLightboxData(this.currentLightboxDocKey);
    this.showToast(
      `Téléchargement de : ${docData.filename || "Document_Officiel.pdf"}...`,
      "info",
    );
    setTimeout(() => {
      this.showToast(
        `Document "${docData.title}" téléchargé avec succès`,
        "success",
      );
    }, 500);
  },

  getDocLightboxData(docKey) {
    const docs = {
      cni: {
        title: "Carte Nationale d'Identité Biométrique CEDEAO",
        meta: "PDF / Image HD • 1.1 Mo • Certifié OCR UEMOA 100%",
        badgeClass: "badge-approved",
        badgeHtml: '<i class="fas fa-check-circle"></i> Identité Certifiée',
        iconClass: "fas fa-id-card",
        confidenceScore: "100%",
        filename: "CNI_Biometrique_Fatou_Ndiaye.pdf",
        fields: [
          { label: "N° Carte Nationale", value: "1 756 1989 00412" },
          { label: "Nom & Prénom", value: "NDIAYE Fatou" },
          { label: "Date de Naissance", value: "14/03/1989 (Bamako)" },
          { label: "Nationalité", value: "Malienne (CEDEAO / UEMOA)" },
          { label: "Délivrée le", value: "15/03/2019 par Police Bamako" },
          {
            label: "Date d'Expiration",
            value: "14/03/2029 (En cours de validité)",
          },
          { label: "Puce Biométrique", value: "UID-ML-882104-OK" },
        ],
        sheetHtml: `
          <div style="border: 2px solid #15803d; border-radius: 12px; padding: 1.5rem; background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%); position: relative; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
            <!-- Header Mali -->
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #15803d; padding-bottom: 0.75rem; margin-bottom: 1.25rem;">
              <div style="font-size: 0.75rem; font-weight: 800; color: #15803d; text-transform: uppercase; line-height: 1.3;">
                RÉPUBLIQUE DU MALI<br><span style="font-size: 0.65rem; color: #047857;">COMMUNAUTÉ ÉCONOMIQUE DES ÉTATS DE L'AFRIQUE DE L'OUEST</span>
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
                <div><span style="font-weight: 700; color: #0f172a;">NÉ LE :</span> 14/03/1989 à Bamako</div>
                <div><span style="font-weight: 700; color: #0f172a;">SEXE :</span> F • <span style="font-weight: 700; color: #0f172a;">TAILLE :</span> 1.68 m</div>
                <div><span style="font-weight: 700; color: #0f172a;">N° IDENTIFIANT :</span> <strong style="font-family: monospace; color: #1e40af;">1 756 1989 00412</strong></div>
                <div><span style="font-weight: 700; color: #0f172a;">VALIDITÉ :</span> 15/03/2019 - 14/03/2029</div>
              </div>
            </div>

            <!-- MRZ Band -->
            <div style="margin-top: 1.5rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 0.6rem; font-family: monospace; font-size: 0.72rem; color: #0f172a; letter-spacing: 2px; line-height: 1.4;">
              IDMLNDIAYE<<FATOU<<<<<<<<<<<<<<<<<<<<<<<<<<<br>
              17561989004128MLI8903144F2903141<<<<<<<<<<<<6
            </div>

            <!-- Hologram stamp watermark -->
            <div style="position: absolute; bottom: 20px; right: 25px; border: 2px dashed rgba(21, 128, 61, 0.4); border-radius: 50%; width: 70px; height: 70px; display: flex; align-items: center; justify-content: center; transform: rotate(-15deg); color: rgba(21, 128, 61, 0.6); font-size: 0.65rem; font-weight: 900; text-align: center; pointer-events: none;">
              MALI<br>OFFICIEL<br>UEMOA
            </div>
          </div>
        `,
      },
      rccm: {
        title: "Extrait Registre du Commerce et du Crédit Mobilier (RCCM)",
        meta: "PDF • 850 Ko • Greffe Tribunal de Commerce de Bamako",
        badgeClass: "badge-approved",
        badgeHtml: '<i class="fas fa-check-circle"></i> RCCM Authentifié',
        iconClass: "fas fa-landmark",
        confidenceScore: "99.9%",
        filename: "RCCM_Confection_Fatou_Bamako.pdf",
        fields: [
          { label: "N° Immatriculation RCCM", value: "ML.BKO.2022.A.18402" },
          { label: "NIF (Fiscal)", value: "008923412 2A2" },
          {
            label: "Dénomination Commerciale",
            value: "ATELIER COUTURE & WAX FATOU",
          },
          {
            label: "Forme Juridique",
            value: "Entreprise Individuelle (Artisanat)",
          },
          { label: "Date Immatriculation", value: "18/02/2022" },
          {
            label: "Siège Social",
            value: "Grand Marché Rue 314, Bamako (Mali)",
          },
          {
            label: "Activité Déclarée",
            value: "Confection textile, négoce de tissus et prêt-à-porter",
          },
        ],
        sheetHtml: `
          <div style="border: 2px solid #334155; padding: 2rem; background: #ffffff; color: #0f172a; font-family: serif;">
            <div style="text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 1rem; margin-bottom: 1.5rem;">
              <h4 style="font-size: 1.1rem; margin: 0; text-transform: uppercase; font-weight: 800; letter-spacing: 1px;">OHADA - RÉPUBLIQUE DU MALI</h4>
              <h5 style="font-size: 0.9rem; margin: 4px 0 0 0; color: #475569;">TRIBUNAL DE COMMERCE DE BAMAKO</h5>
              <div style="font-size: 0.8rem; font-weight: 700; color: #047857; margin-top: 6px;">EXTRAIT D'IMMATRICULATION AU RCCM</div>
            </div>

            <div style="font-size: 0.82rem; line-height: 1.8; color: #1e293b;">
              <p><strong>N° DU DOSSIER :</strong> ML.BKO.2022.A.18402 • <strong>NIF :</strong> 008923412 2A2</p>
              <p><strong>DÉNOMINATION :</strong> ATELIER DE COUTURE & WAX FATOU</p>
              <p><strong>EXPLOITANT :</strong> NDIAYE Fatou (Nationalité Malienne)</p>
              <p><strong>OBJET SOCIAL :</strong> Fabrication, confection artisanale de vêtements traditionnels et modernes, importation et distribution de textiles Wax, Bazin et soieries.</p>
              <p><strong>ADRESSE DE L'ÉTABLISSEMENT :</strong> Grand Marché Rue 314, Bamako</p>
              <p><strong>DATE DE DÉBUT D'ACTIVITÉ :</strong> 01 Février 2022</p>
            </div>

            <div style="margin-top: 2rem; display: flex; justify-content: space-between; align-items: flex-end;">
              <div style="font-size: 0.72rem; color: #64748b; font-family: sans-serif;">
                Délivré à Bamako le 18/02/2022<br>Certifié conforme par le Greffe
              </div>
              <div style="text-align: center;">
                <div style="border: 2px solid #dc2626; color: #dc2626; font-size: 0.65rem; font-weight: 900; padding: 0.5rem 0.75rem; border-radius: 4px; transform: rotate(-5deg); display: inline-block;">
                  GREFFE TRIBUNAL DE COMMERCE<br>BAMAKO - MALI<br>ENREGISTRÉ
                </div>
              </div>
            </div>
          </div>
        `,
      },
      proforma: {
        title: "Facture Proforma Fournisseur Stock Wax Bamako",
        meta: "PDF • 1.4 Mo • Éts Textile Grand Marché Bamako (Mali)",
        badgeClass: "badge-approved",
        badgeHtml:
          '<i class="fas fa-check-circle"></i> Devis & Proforma Validé',
        iconClass: "fas fa-file-invoice-dollar",
        confidenceScore: "99.8%",
        filename: "Facture_Proforma_PF-2026-0881.pdf",
        fields: [
          {
            label: "Fournisseur",
            value: "Établissements Textile Grand Marché & Cie",
          },
          { label: "Réf Devis Proforma", value: "PF-2026-0881" },
          { label: "Date d'Émission", value: "08 Août 2026" },
          {
            label: "Validité de l'Offre",
            value: "30 Jours (jusqu'au 07/09/2026)",
          },
          { label: "Montant HT", value: "2 300 000 FCFA" },
          { label: "Transport & TVA", value: "200 000 FCFA" },
          { label: "Montant Total TTC", value: "2 500 000 FCFA" },
          {
            label: "Objet d'Achat",
            value: "Rouleaux Wax Hollandais & Bazin Riche",
          },
        ],
        sheetHtml: `
          <div style="background: #ffffff; padding: 2rem; border: 1px solid #e2e8f0; color: #1e293b; font-family: sans-serif;">
            <!-- Supplier Header -->
            <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0284c7; padding-bottom: 1rem; margin-bottom: 1.5rem;">
              <div>
                <h4 style="font-size: 1.15rem; font-weight: 800; color: #0284c7; margin: 0;">ÉTS TEXTILES GRAND MARCHÉ & CIE</h4>
                <div style="font-size: 0.76rem; color: #64748b; margin-top: 3px;">
                  Grand Marché de Bamako - Allée Centrale N° 44 • Mali<br>
                  Tél : +223 70 22 41 80 • NIF : 1002934811
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
              <div>Grand Marché Rue 314, Bamako (Mali) • Tél : +223 77 540 88 12</div>
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
            <div style="display: flex; justify-content: space-between; margin-bottom: 1.5rem;">
              <div style="font-size: 0.72rem; color: #64748b;">
                Modalité : Livraison contre paiement CreditFast / Agence Grand Marché Bamako
              </div>
              <div style="width: 250px; font-size: 0.8rem;">
                <div style="display: flex; justify-content: space-between; padding: 0.3rem 0;">
                  <span>Sous-total HT :</span>
                  <span>2 300 000 FCFA</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 0.3rem 0; border-bottom: 1px solid #e2e8f0;">
                  <span>Fret & Assurance :</span>
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
                Délivré pour instruction de crédit • Agence CreditFast Grand Marché
              </div>
              <div style="border: 2px solid #0369a1; color: #0369a1; font-weight: 800; font-size: 0.68rem; padding: 0.4rem 0.8rem; border-radius: 4px; transform: rotate(-3deg);">
                ÉTS TEXTILES ASSIGAMÉ<br>POUR ACCORD ET VENTE
              </div>
            </div>
          </div>
        `,
      },
      senelec: {
        title: "Quittance d'Électricité EDM-SA (Justificatif Domicile)",
        meta: "PDF • 920 Ko • Énergie du Mali (EDM-SA) Bamako",
        badgeClass: "badge-approved",
        badgeHtml: '<i class="fas fa-check-circle"></i> Domicile Certifié',
        iconClass: "fas fa-bolt",
        confidenceScore: "99.5%",
        filename: "Facture_EDM_Fatou_Ndiaye.pdf",
        fields: [
          { label: "Organisme Émetteur", value: "EDM-SA (Énergie du Mali)" },
          { label: "N° Police / Compteur", value: "884-2190-33" },
          { label: "Titulaire Abonnement", value: "Mme Fatou NDIAYE" },
          { label: "Adresse Fournie", value: "Grand Marché Rue 314, Bamako" },
          { label: "Période Facturée", value: "Juillet 2026" },
          { label: "Statut Règlement", value: "Acquitté / 0 F solde impayé" },
        ],
        sheetHtml: `
          <div style="background: #ffffff; padding: 2rem; border: 1px solid #e2e8f0; color: #1e293b; font-family: sans-serif;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f59e0b; padding-bottom: 0.75rem; margin-bottom: 1.25rem;">
              <div>
                <h4 style="font-size: 1.2rem; font-weight: 900; color: #d97706; margin: 0;">EDM-SA</h4>
                <div style="font-size: 0.72rem; color: #64748b;">Société Énergie du Mali (EDM-SA) • Direction Bamako</div>
              </div>
              <span class="badge badge-approved" style="font-size: 0.75rem; padding: 0.35rem 0.6rem;">
                <i class="fas fa-check"></i> FACTURE ACQUITTÉE
              </span>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; font-size: 0.78rem; margin-bottom: 1.5rem;">
              <div style="background: #fefce8; padding: 0.75rem; border-radius: 6px; border: 1px solid #fef08a;">
                <div style="font-weight: 700; color: #854d0e; margin-bottom: 4px;">ABONNÉ / TITULAIRE :</div>
                <div>NDIAYE Fatou</div>
                <div>Grand Marché Rue 314, Bamako</div>
                <div>Code Distr. : BKO-GM-04</div>
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
        `,
      },
      guarantee: {
        title: "Attestation de Nantissement d'Épargne CreditFast",
        meta: "PDF • 1.8 Mo • Agence CreditFast Grand Marché Bamako",
        badgeClass: "badge-approved",
        badgeHtml: '<i class="fas fa-check-circle"></i> Sûreté Enregistrée',
        iconClass: "fas fa-shield-halved",
        confidenceScore: "100%",
        filename: "Attestation_Nantissement_Epargne.pdf",
        fields: [
          {
            label: "Type de Sûreté",
            value: "Gage Espèces & Nantissement Compte Épargne",
          },
          { label: "N° Compte Gagiste", value: "ML-BKO-SAV-004128" },
          { label: "Titulaire du Compte", value: "Mme Fatou NDIAYE" },
          { label: "Montant Bloqué", value: "500 000 FCFA" },
          { label: "Taux de Couverture", value: "20% du Prêt Principal" },
          {
            label: "Caisse Dépositaire",
            value: "Agence CreditFast Grand Marché Bamako",
          },
        ],
        sheetHtml: `
          <div style="background: #ffffff; padding: 2rem; border: 2px solid #4f46e5; border-radius: 8px; color: #1e293b; font-family: sans-serif;">
            <div style="text-align: center; border-bottom: 2px solid #4f46e5; padding-bottom: 1rem; margin-bottom: 1.5rem;">
              <h4 style="font-size: 1.1rem; font-weight: 800; color: #4f46e5; margin: 0;">RÉSEAU RÉGIONAL CREDITFAST</h4>
              <h5 style="font-size: 0.85rem; color: #64748b; margin: 4px 0 0 0;">Caisse d'Épargne et de Crédit - Agence Grand Marché Bamako</h5>
              <div style="font-size: 0.8rem; font-weight: 800; color: #15803d; margin-top: 6px;">ACTE DE NANTISSEMENT D'ÉPARGNE LIQUIDE</div>
            </div>

            <div style="font-size: 0.8rem; line-height: 1.8;">
              <p>Par les présentes, la soussignée <strong>Mme Fatou NDIAYE</strong> consent à titre de garantie solidaire le nantissement à hauteur de <strong>500 000 FCFA</strong> de son compte d'épargne N° <code>ML-BKO-SAV-004128</code> ouvert auprès de l'Agence CreditFast Grand Marché Bamako.</p>
              <p>Cette sûreté liquide garantit le remboursement effectif du prêt N° <code>REQ-2026-0895</code> d'un montant de 2 500 000 FCFA consenti pour une durée de 12 mois.</p>
            </div>

            <div style="margin-top: 2rem; display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed #cbd5e1; padding-top: 1rem;">
              <div style="font-size: 0.72rem; color: #64748b;">
                Fait à Bamako, le 12/08/2026<br>Visa du Chef d'Agence CreditFast
              </div>
              <div style="border: 2px solid #4f46e5; color: #4f46e5; font-size: 0.68rem; font-weight: 800; padding: 0.4rem 0.8rem; border-radius: 4px;">
                AGENCE CREDITFAST GRAND MARCHÉ<br>SERVICE ENGAGEMENTS
              </div>
            </div>
          </div>
        `,
      },
      contract: {
        title: "Contrat Cadre de Financement & Prêt Électronique CreditFast",
        meta: "PDF • 2.2 Mo • Signé Numériquement via OTP UEMOA",
        badgeClass: "badge-approved",
        badgeHtml: '<i class="fas fa-signature"></i> Signé & Scellé',
        iconClass: "fas fa-file-contract",
        confidenceScore: "100%",
        filename: "Contrat_Pret_CreditFast_2026_0895.pdf",
        fields: [
          { label: "Contrat N°", value: "CTR-CF-BKO-2026-0895" },
          { label: "Emprunteur", value: "Mme Fatou NDIAYE" },
          { label: "Montant du Financement", value: "2 500 000 FCFA" },
          {
            label: "Taux d'Intérêt",
            value: "1.20% / mois dégressif (14.4% l'an)",
          },
          { label: "Échéances", value: "12 mensualités de 235 000 FCFA" },
          { label: "Horodatage Signature", value: "18/08/2026 à 09:30:14 GMT" },
          {
            label: "Signature Électronique",
            value: "Certifiée conforme OTP SMS (SHA-256 Validé)",
          },
        ],
        sheetHtml: `
          <div style="background: #ffffff; padding: 2rem; border: 2px solid #047857; border-radius: 8px; color: #1e293b; font-family: serif;">
            <div style="text-align: center; border-bottom: 2px solid #047857; padding-bottom: 1rem; margin-bottom: 1.5rem;">
              <h4 style="font-size: 1.15rem; font-weight: 900; color: #047857; margin: 0; font-family: sans-serif;">CREDITFAST • CONTRAT DE CRÉDIT RÉGIONAL</h4>
              <div style="font-size: 0.76rem; color: #64748b; font-family: sans-serif; margin-top: 3px;">CONTRAT N° CTR-CF-BKO-2026-0895</div>
            </div>

            <div style="font-size: 0.8rem; line-height: 1.8;">
              <p><strong>ARTICLE 1 - OBJET :</strong> CreditFast accorde à Mme Fatou NDIAYE un prêt professionnel d'un montant de <strong>2 500 000 FCFA</strong> destiné à l'acquisition de stock commercial de textile.</p>
              <p><strong>ARTICLE 2 - REMBOURSEMENT :</strong> L'emprunteur s'engage à rembourser le prêt selon l'échéancier mensuel dégressif annexé, en 12 termes égaux de <strong>235 000 FCFA</strong> prélevés via Mobile Money ou guichet.</p>
              <p><strong>ARTICLE 3 - DISPOSITIF COLD START :</strong> Ce prêt bénéficie du programme d'inclusion financière CreditFast sans pénalité d'absence d'historique bancaire préalable.</p>
            </div>

            <div style="margin-top: 2rem; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 0.85rem; font-family: sans-serif; font-size: 0.74rem;">
              <div style="font-weight: 700; color: #15803d; margin-bottom: 2px;"><i class="fas fa-certificate mr-1"></i> SIGNATURE ÉLECTRONIQUE CERTIFIÉE</div>
              <div style="color: #334155;">Signé par Fatou NDIAYE (OTP +223 77 540 88 12) • Horodatage certifié SHA-256 : <code>9f83ab20...551c4a</code></div>
            </div>
          </div>
        `,
      },
    };

    return docs[docKey] || docs.proforma;
  },

  clearAllStorageAndReset() {
    try {
      localStorage.clear();
      if (window.DB) {
        window.DB.init();
      }
      this.showToast("Stockage local réinitialisé avec succès", "success");
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (e) {
      console.error("Erreur lors de la réinitialisation du stockage", e);
    }
  },
};

window.App = App;
window.openEditProfileModal = () =>
  App.openEditProfileModal && App.openEditProfileModal();
window.closeEditProfileModal = () =>
  App.closeEditProfileModal && App.closeEditProfileModal();
window.saveUserProfile = () => App.saveUserProfile && App.saveUserProfile();
window.openLogoutConfirmModal = () =>
  App.openLogoutConfirmModal && App.openLogoutConfirmModal();
window.closeLogoutConfirmModal = () =>
  App.closeLogoutConfirmModal && App.closeLogoutConfirmModal();
window.confirmLogout = () => App.confirmLogout && App.confirmLogout();
window.logout = () => App.logout && App.logout();

document.addEventListener("DOMContentLoaded", () => {
  if (window.__CREDITFAST_SPA__) {
    return;
  }
  App.init();
});
