/**
 * CRÉDIT FAST - UI INTERACTIONS & WORKFLOW CONTROLLERS V2
 * Intègre l'inspection 360°, le basculement Cold Start, les 10 sous-scores, et les délibérations du Comité
 * Confédération des Institutions Financières d'Afrique de l'Ouest (CIF - DigiCoop-WA+)
 */

const AppInteractions = {
  activeDossierId: 1,
  activeColdStartOverride: null,

  getCurrentUserRole() {
    if (window.App && window.App.currentRole) return window.App.currentRole;
    if (window.App && window.App.currentUser && window.App.currentUser.role) return window.App.currentUser.role;
    try {
      const auth = JSON.parse(localStorage.getItem('AUTH_USER'));
      if (auth && auth.role) return auth.role;
    } catch(e) {}
    return 'ANALYST';
  },

  // Render Credit Requests Table (Vue Analyste)
  renderRequestsTable(statusFilter = 'ALL', searchFilter = '', buttonEl = null) {
    const tableBody = document.getElementById('requests-table-body');
    if (!tableBody) return;

    if (buttonEl) {
      const parent = buttonEl.parentElement;
      if (parent) {
        parent.querySelectorAll('button').forEach(b => {
          b.classList.remove('btn-primary');
          if (!b.classList.contains('btn-secondary')) b.classList.add('btn-secondary');
        });
        buttonEl.classList.remove('btn-secondary');
        buttonEl.classList.add('btn-primary');
      }
    }

    let items = DB.get('credit_requests');

    if (statusFilter === 'COLD_START') {
      items = items.filter(req => {
        const client = DB.findById('clients', req.client_id) || {};
        return req.is_cold_start || client.is_cold_start;
      });
    } else if (statusFilter !== 'ALL') {
      items = items.filter(req => req.status === statusFilter);
    }

    if (searchFilter.trim() !== '') {
      const q = searchFilter.toLowerCase();
      items = items.filter(req => 
        (req.request_number && String(req.request_number).toLowerCase().includes(q)) ||
        (req.client_name && String(req.client_name).toLowerCase().includes(q)) ||
        (req.city && String(req.city).toLowerCase().includes(q)) ||
        (req.purpose && String(req.purpose).toLowerCase().includes(q))
      );
    }

    if (items.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 2.5rem; color: var(--text-subtle);">
            <i class="fas fa-folder-open" style="font-size: 2rem; margin-bottom: 0.5rem; display: block;"></i>
            Aucun dossier trouvé pour ces critères
          </td>
        </tr>`;
      return;
    }

    tableBody.innerHTML = items.map(req => {
      const evalData = CreditScoringEngine.evaluateDossier(req.id) || {};
      const statusBadge = this.getStatusBadge(req.status);

      const riskBadgeClass = evalData.riskLevel === 'CRITIQUE'
        ? 'badge-rejected'
        : evalData.riskLevel === 'ELEVE'
          ? 'badge-warning'
          : 'badge-approved';
      const riskText = evalData.riskLevel === 'FAIBLE' ? 'Faible' : evalData.riskLevel === 'MODERE' ? 'Modéré' : evalData.riskLevel === 'ELEVE' ? 'Élevé' : evalData.riskLevel === 'CRITIQUE' ? 'Critique' : (evalData.riskLevel || 'Faible');

      return `
        <tr class="schedule-table-row" onclick="App.openAnalystDossierDrawer(${req.id})" style="cursor: pointer;" title="Cliquer pour afficher la fiche complète dans le volet latéral">
          <!-- Col 1 : Dossier & Emprunteur (Info essentielle sans sous-texte) -->
          <td>
            <div style="display: flex; align-items: center; gap: 0.65rem;">
              <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(req.client_name)}&background=4f46e5&color=fff" alt="${req.client_name}" class="user-avatar" style="width: 34px; height: 34px; border-radius: var(--radius-md); flex-shrink: 0;">
              <div>
                <span style="font-weight: 700; font-size: 0.9rem; color: var(--text-primary);">${req.client_name}</span>
                <span class="badge badge-submitted" style="font-family: var(--font-family-code); font-weight: 700; font-size: 0.68rem; margin-left: 0.35rem;">${req.request_number}</span>
              </div>
            </div>
          </td>

          <!-- Col 2 : Montant Demandé (Info essentielle sans sous-texte) -->
          <td>
            <span class="amount-cell" style="font-weight: 800; font-size: 0.95rem; color: var(--text-primary); font-family: var(--font-family-code);">${CreditScoringEngine.formatFCFA(req.requested_amount)}</span>
          </td>

          <!-- Col 3 : Score Risque (Info essentielle sans sous-texte) -->
          <td>
            <div style="display: flex; align-items: center; gap: 0.45rem;">
              <span style="font-weight: 800; font-size: 0.95rem; color: ${evalData.riskColor || '#4f46e5'}; font-family: var(--font-family-code);">${evalData.overallScore || req.score || 70}</span>
              <span style="font-size: 0.72rem; color: var(--text-subtle);">/100</span>
              <span class="badge ${riskBadgeClass}" style="font-size: 0.68rem; padding: 0.15rem 0.45rem;">${riskText}</span>
            </div>
          </td>

          <!-- Col 4 : Statut (Info essentielle sans sous-texte) -->
          <td>
            ${statusBadge}
          </td>

          <!-- Col 5 : Action -->
          <td style="text-align: right;">
            <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); App.openAnalystDossierDrawer(${req.id});" title="Ouvrir le volet d'instruction latérale 360°">
              <i class="fas fa-magnifying-glass-chart mr-1"></i> Détails 360°
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  // =========================================================================
  // MON ÉCHÉANCIER DE REMBOURSEMENT - GESTION DES FILTRES & TIROIR LATÉRAL
  // =========================================================================

  /**
   * Filtre le tableau d'échéancier et bascule entre 'ALL', 'PAID', 'DUE', et 'UPCOMING'
   * @param {string} filterStatus 'ALL' | 'PAID' | 'DUE' | 'UPCOMING'
   * @param {HTMLElement|null} buttonEl Élément bouton cliqué optionnel
   */
  filterScheduleTable(filterStatus = 'ALL', buttonEl = null) {
    const normalizedFilter = String(filterStatus || 'ALL').toUpperCase();

    // 1. Mise à jour de l'état actif des boutons
    const filterKeyMap = {
      'ALL': 'all',
      'PAID': 'paid',
      'DUE': 'due',
      'UPCOMING': 'upcoming'
    };

    ['all', 'paid', 'due', 'upcoming'].forEach(key => {
      const btn = document.getElementById(`filter-sched-${key}`);
      if (btn) {
        if (key === filterKeyMap[normalizedFilter]) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      }
    });

    if (buttonEl && buttonEl.parentElement) {
      buttonEl.parentElement.querySelectorAll('button').forEach(b => {
        b.classList.remove('active');
      });
      buttonEl.classList.add('active');
    }

    // 2. Mise à jour du filtre courant et ré-affichage des données
    if (window.App) {
      window.App.currentScheduleFilter = normalizedFilter;
      if (typeof window.App.renderClientSchedule === 'function') {
        window.App.renderClientSchedule(normalizedFilter);
      }
    } else {
      this.renderScheduleTable(normalizedFilter);
    }
  },

  /**
   * Rendu de secours pour le tableau d'échéances
   */
  renderScheduleTable(filterStatus = 'ALL') {
    if (window.App && typeof window.App.renderClientSchedule === 'function') {
      window.App.renderClientSchedule(filterStatus);
      return;
    }
  },

  /**
   * Ouvre le tiroir latéral pour une échéance
   */
  openScheduleDrawer(installmentNumber) {
    if (window.App && typeof window.App.openScheduleDrawer === 'function') {
      window.App.openScheduleDrawer(installmentNumber);
    }
  },

  /**
   * Ferme le tiroir latéral
   */
  closeScheduleDrawer() {
    if (window.App && typeof window.App.closeScheduleDrawer === 'function') {
      window.App.closeScheduleDrawer();
    } else {
      const backdrop = document.getElementById('schedule-drawer-backdrop');
      if (backdrop) backdrop.classList.remove('active');
    }
  },

  /**
   * Ouvre le volet latéral de détails d'une demande de crédit (Demandeur)
   */
  openClientRequestDrawer(identifier) {
    if (window.App && typeof window.App.openClientRequestDrawer === 'function') {
      window.App.openClientRequestDrawer(identifier);
    }
  },

  /**
   * Ouvre le volet latéral d'inspection approfondie d'une anomalie
   */
  openAnomalyDrawer(anomalyId) {
    if (window.App && typeof window.App.openAnomalyDrawer === 'function') {
      window.App.openAnomalyDrawer(anomalyId);
    }
  },

  /**
   * Ferme le volet latéral d'anomalie
   */
  closeAnomalyDrawer() {
    if (window.App && typeof window.App.closeAnomalyDrawer === 'function') {
      window.App.closeAnomalyDrawer();
    } else {
      const backdrop = document.getElementById('anomaly-drawer-backdrop');
      if (backdrop) backdrop.classList.remove('active');
    }
  },

  /**
   * Ouvre le volet latéral d'instruction 360° pour l'analyste risque
   */
  openAnalystDrawer(dossierId, coldStartOverride = null) {
    if (window.App && typeof window.App.openAnalystDossierDrawer === 'function') {
      window.App.openAnalystDossierDrawer(dossierId, coldStartOverride);
    }
  },

  /**
   * Ferme le volet latéral d'instruction 360°
   */
  closeAnalystDrawer() {
    if (window.App && typeof window.App.closeAnalystDossierDrawer === 'function') {
      window.App.closeAnalystDossierDrawer();
    } else {
      const backdrop = document.getElementById('analyst-drawer-backdrop');
      if (backdrop) backdrop.classList.remove('active');
    }
  },

  /**
   * Ferme le volet latéral de détails d'une demande de crédit (Demandeur)
   */
  closeClientRequestDrawer() {
    if (window.App && typeof window.App.closeClientRequestDrawer === 'function') {
      window.App.closeClientRequestDrawer();
    } else {
      const backdrop = document.getElementById('client-request-drawer-backdrop');
      if (backdrop) backdrop.classList.remove('active');
    }
  },

  /**
   * Analyse et met en surbrillance rouge les documents expirant dans les 30 prochains jours
   */
  checkAndHighlightExpiringDocs(options) {
    if (window.App && typeof window.App.checkAndHighlightExpiringDocs === 'function') {
      return window.App.checkAndHighlightExpiringDocs(options);
    }
  },

  /**
   * Filtre les pièces justificatives du demandeur
   */
  filterClientDocs(category, buttonEl) {
    if (window.App && typeof window.App.filterClientDocs === 'function') {
      return window.App.filterClientDocs(category, buttonEl);
    }
  },

  /**
   * Ouvre la modale de prise de rendez-vous avec le conseiller
   */
  openAppointmentModal() {
    if (window.App && typeof window.App.openAppointmentModal === 'function') {
      window.App.openAppointmentModal();
    } else {
      const modal = document.getElementById('client-appointment-modal');
      if (modal) modal.style.display = 'flex';
    }
  },

  /**
   * Ferme la modale de prise de rendez-vous
   */
  closeAppointmentModal() {
    if (window.App && typeof window.App.closeAppointmentModal === 'function') {
      window.App.closeAppointmentModal();
    } else {
      const modal = document.getElementById('client-appointment-modal');
      if (modal) modal.style.display = 'none';
    }
  },

  getStatusBadge(status) {
    const cfg = APP_CONSTANTS.STATUS_CONFIG[status] || { label: status, class: 'badge', color: '#64748b' };
    return `<span class="badge ${cfg.class}">${cfg.label}</span>`;
  },

  // Alias for 360° Dossier Inspector
  openDossier360(dossierIdentifier, forceColdStart = null) {
    this.openDossierModal(dossierIdentifier, forceColdStart);
  },

  // Open 360° Dossier Inspector Modal (avec gestion V2 Cold Start et 10 sous-scores)
  openDossierModal(dossierIdentifier, forceColdStart = null) {
    let req = null;
    if (typeof dossierIdentifier === 'number' || (!isNaN(Number(dossierIdentifier)) && String(dossierIdentifier).trim() !== '')) {
      req = DB.findById('credit_requests', Number(dossierIdentifier));
    }
    if (!req && typeof dossierIdentifier === 'string') {
      req = DB.get('credit_requests').find(r => r.request_number === dossierIdentifier || r.id == dossierIdentifier);
    }
    if (!req) {
      req = DB.get('credit_requests')[0];
    }
    if (!req) return;

    const dossierId = req.id;
    this.activeDossierId = dossierId;
    this.activeColdStartOverride = forceColdStart;

    const modal = document.getElementById('dossier-modal');
    if (!modal) return;

    const role = this.getCurrentUserRole();
    const isClient = role === 'CLIENT';

    const client = DB.findById('clients', req.client_id) || {};
    const docs = DB.get('documents').filter(d => d.credit_request_id == req.id);
    const anomalies = DB.get('anomalies').filter(a => a.credit_request_id == req.id);

    const evalData = CreditScoringEngine.evaluateDossier(dossierId, forceColdStart);

    // Populate Header
    document.getElementById('modal-dossier-ref').textContent = req.request_number;
    document.getElementById('modal-client-name').textContent = req.client_name;
    document.getElementById('modal-client-location').textContent = `${req.city}, ${req.country} • N° CIF : ${client.client_number || 'SN-DKR-008821'} • Zone : ${client.residential_zone || 'Urbaine'}`;

    // Role-Based Header Actions: Hide Cold Start simulation from demandeur/client
    const headerActions = document.getElementById('modal-header-actions');
    if (headerActions) {
      if (isClient) {
        headerActions.innerHTML = `
          <span class="badge badge-submitted" style="font-size: 0.76rem; padding: 4px 10px;">
            <i class="fas fa-user-circle mr-1"></i> Espace Demandeur
          </span>
          <button class="modal-close-btn" onclick="AppInteractions.closeModal('dossier-modal')">&times;</button>
        `;
      } else {
        headerActions.innerHTML = `
          <button class="btn btn-secondary btn-sm" id="modal-cold-start-btn" onclick="AppInteractions.toggleColdStartInModal()" title="Basculer la simulation entre Modèle Standard et Cold Start">
            <i class="fas fa-seedling text-emerald"></i> Simuler Cold Start
          </button>
          <button class="modal-close-btn" onclick="AppInteractions.closeModal('dossier-modal')">&times;</button>
        `;
      }
    }

    // Populate Financial Capacity
    const cap = evalData.capacity;
    document.getElementById('cap-income').textContent = CreditScoringEngine.formatFCFA(cap.totalIncome);
    document.getElementById('cap-expenses').textContent = CreditScoringEngine.formatFCFA(cap.totalObligations);
    document.getElementById('cap-disposable').textContent = CreditScoringEngine.formatFCFA(cap.disposableIncome);
    document.getElementById('cap-installment').textContent = CreditScoringEngine.formatFCFA(cap.estimatedPayment);

    const capBanner = document.getElementById('cap-banner');
    if (capBanner) {
      if (cap.isSufficient) {
        capBanner.className = 'capacity-comparison pass';
        capBanner.innerHTML = `
          <div><i class="fas fa-check-circle mr-1"></i> <strong>Capacité Suffisante :</strong> Reste à vivre de ${CreditScoringEngine.formatFCFA(cap.disposableIncome)} couvre <strong>${cap.coverageRatio}x</strong> la mensualité estimée (${CreditScoringEngine.formatFCFA(cap.estimatedPayment)}).</div>
        `;
      } else {
        capBanner.className = 'capacity-comparison fail';
        capBanner.innerHTML = `
          <div><i class="fas fa-exclamation-triangle mr-1"></i> <strong>Alerte Capacité Insuffisante :</strong> Reste à vivre net (${CreditScoringEngine.formatFCFA(cap.disposableIncome)}) insuffisant face à la mensualité requise de ${CreditScoringEngine.formatFCFA(cap.estimatedPayment)}.</div>
        `;
      }
    }

    // Animate Score & Gauge progressively upon modal opening
    this.animateScoreGauge(evalData.overallScore || 70, 1100, evalData);

    // Model & Cold Start Switch Bar (Adapted by Role)
    const modelBadge = document.getElementById('modal-model-badge');
    if (modelBadge) {
      if (isClient) {
        modelBadge.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: space-between; background: var(--surface-card-subtle); padding: 8px 14px; border-radius: var(--radius-md); font-size: 0.78rem;">
            <div>
              <i class="fas fa-shield-check" style="color: var(--cif-emerald-500); margin-right: 6px;"></i>
              <strong>Audit & Réglementation CIF :</strong> Dossier instruit selon les standards microfinance WA+
            </div>
            <div>
              <span class="badge ${req.status === 'APPROVED' ? 'badge-approved' : (req.status === 'REJECTED' ? 'badge-rejected' : 'badge-submitted')}">
                <i class="fas ${req.status === 'APPROVED' ? 'fa-check' : 'fa-hourglass-half'}"></i> ${req.status === 'APPROVED' ? 'Prêt Accordé' : (req.status === 'REJECTED' ? 'Dossier Refusé' : 'Instruction en cours')}
              </span>
            </div>
          </div>
        `;
      } else {
        modelBadge.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: space-between; background: var(--surface-card-subtle); padding: 6px 12px; border-radius: var(--radius-md); font-size: 0.76rem;">
            <div>
              <strong>Moteur Actif :</strong> ${evalData.model.name} (${evalData.model.version})
              ${evalData.isColdStart ? '<span class="badge badge-warning ml-1"><i class="fas fa-seedling"></i> Cold Start Activé</span>' : '<span class="badge badge-submitted ml-1"><i class="fas fa-history"></i> Standard</span>'}
            </div>
            <div>
              <span style="font-weight: 700; color: var(--cif-emerald-500);"><i class="fas fa-shield-check"></i> Indice de Confiance : ${evalData.confidenceScore}%</span>
            </div>
          </div>
        `;
      }
    }

    // Populate Synthesis Box (Norme Note de Présentation CreditFast Page 4)
    const synthesisBox = document.getElementById('modal-scoring-synthesis-box');
    if (synthesisBox) {
      const posFactors = evalData.factors.filter(f => f.is_positive).map(f => f.name).slice(0, 3).join(', ') || 'Revenus réguliers, activité identifiable, capacité d\'épargne';
      const negFactors = evalData.factors.filter(f => !f.is_positive).map(f => f.name).join(', ') || (anomalies.length > 0 ? 'Écart sur justificatif OCR' : 'Ratio d\'endettement à surveiller');
      const recommendedAction = evalData.overallScore >= 75 
        ? 'Validation & transmission au Comité de Crédit' 
        : (evalData.overallScore >= 55 
            ? 'Validation sous réserve / vérification humaine des garanties' 
            : 'Vérification approfondie / demande de pièces complémentaires');

      synthesisBox.innerHTML = `
        <div class="card" style="background: var(--surface-card-subtle); border: 1.5px solid var(--border-subtle); overflow: hidden; border-radius: var(--radius-md);">
          <div style="background: rgba(79, 70, 229, 0.08); padding: 8px 12px; border-bottom: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.78rem; font-weight: 700; color: var(--primary-700);"><i class="fas fa-file-contract mr-1"></i> Synthèse Décisionnelle • Norme CreditFast</span>
            <span class="badge ${evalData.overallScore >= 70 ? 'badge-approved' : 'badge-verification'}" style="font-size: 0.72rem;">Score : ${evalData.overallScore} / 100</span>
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 0.76rem;">
            <tbody>
              <tr style="border-bottom: 1px solid var(--border-subtle);">
                <td style="padding: 6px 12px; font-weight: 700; width: 35%; color: var(--text-subtle); background: rgba(0,0,0,0.02);">Score Calculé</td>
                <td style="padding: 6px 12px; font-weight: 800; color: ${evalData.overallScore >= 70 ? 'var(--cif-emerald-500)' : 'var(--cif-gold-700)'};">${evalData.overallScore} / 100 <span style="font-weight: normal; color: var(--text-muted); font-size: 0.7rem;">(Confiance IA : ${evalData.confidenceScore}%)</span></td>
              </tr>
              <tr style="border-bottom: 1px solid var(--border-subtle);">
                <td style="padding: 6px 12px; font-weight: 700; color: var(--cif-emerald-500); background: rgba(16, 185, 129, 0.03);">Facteurs favorables</td>
                <td style="padding: 6px 12px; color: var(--text-main); font-weight: 600;"><i class="fas fa-check-circle text-emerald mr-1"></i> ${posFactors}</td>
              </tr>
              <tr style="border-bottom: 1px solid var(--border-subtle);">
                <td style="padding: 6px 12px; font-weight: 700; color: var(--cif-gold-700); background: rgba(245, 158, 11, 0.03);">Facteurs à vérifier</td>
                <td style="padding: 6px 12px; color: var(--text-main);"><i class="fas fa-triangle-exclamation text-warning mr-1"></i> ${negFactors}</td>
              </tr>
              <tr>
                <td style="padding: 6px 12px; font-weight: 700; color: var(--primary-700); background: rgba(79, 70, 229, 0.03);">Action recommandée</td>
                <td style="padding: 6px 12px; font-weight: 700; color: var(--primary-700);"><i class="fas fa-user-check mr-1"></i> ${recommendedAction}</td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
    }

    // Populate Factors
    const factorsContainer = document.getElementById('modal-factors-list');
    if (factorsContainer) {
      factorsContainer.innerHTML = evalData.factors.map(f => `
        <div class="factor-item">
          <div class="factor-left">
            <div class="factor-icon ${f.is_positive ? 'positive' : 'negative'}">
              <i class="fas ${f.is_positive ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'}"></i>
            </div>
            <div>
              <div class="factor-title">${f.name} <span style="font-size: 0.72rem; color: var(--text-subtle);">(${f.weight})</span></div>
              <div class="factor-desc">${f.explanation}</div>
            </div>
          </div>
          <div class="factor-points ${f.is_positive ? 'pos' : 'neg'}">
            ${f.score}/100 <span style="font-size: 0.7rem; color: var(--text-subtle); font-weight: normal;">(+${f.contribution} pts)</span>
          </div>
        </div>
      `).join('');
    }

    // Populate Docs according to current user role
    this.renderModalDocuments(docs, role);

    // Populate Anomalies according to current user role
    const anomaliesBox = document.getElementById('modal-anomalies-list');
    if (anomaliesBox) {
      if (anomalies.length === 0) {
        anomaliesBox.innerHTML = `<div class="anomaly-item info"><i class="fas fa-check-circle anomaly-icon"></i><div class="anomaly-content"><h5>Aucune anomalie détectée</h5><p>Tous les contrôles automatisés de cohérence sont au vert.</p></div></div>`;
      } else {
        anomaliesBox.innerHTML = anomalies.map(a => `
          <div class="anomaly-item ${a.severity === 'CRITICAL' ? 'critical' : 'warning'}">
            <i class="fas ${a.severity === 'CRITICAL' ? 'fa-ban' : 'fa-triangle-exclamation'} anomaly-icon"></i>
            <div class="anomaly-content">
              <h5>${a.description}</h5>
              <p style="margin-top: 2px;">Valeur détectée OCR : <strong>${a.detected_value || 'Incohérente'}</strong> • Attendu : <strong>${a.expected_value || 'Conforme'}</strong></p>
              ${(!isClient && (role === 'ANALYST' || role === 'ADMIN'))
                ? (a.status === 'OPEN' 
                    ? `<button class="btn btn-secondary btn-sm" style="margin-top: 6px;" onclick="AppInteractions.resolveAnomaly(${a.id})">Marquer Résolu</button>` 
                    : '<span style="font-size: 0.7rem; color: #166534;"><i class="fas fa-check"></i> Résolu</span>')
                : `<span style="font-size: 0.72rem; color: var(--text-subtle);"><i class="fas fa-info-circle mr-1"></i> Statut : <strong>${a.status === 'OPEN' ? 'En cours d\'examen' : 'Résolu'}</strong></span>`}
            </div>
          </div>
        `).join('');
      }
    }

    // Render Role Actions or Client Tracking Box
    this.renderModalRoleActions(req, evalData, role);

    // Render Radar Chart in Modal
    setTimeout(() => {
      AppCharts.renderScoreRadar('modal-radar-canvas', evalData.factors);
    }, 200);

    modal.classList.add('active');
  },

  /**
   * Animate the #modal-score-gauge and its numerical counter progressively upon opening
   */
  animateScoreGauge(targetScore = 70, duration = 1100, evalData = {}) {
    const scoreGauge = document.getElementById('modal-score-gauge');
    const scoreValEl = document.getElementById('modal-score-val');
    const riskTagEl = document.getElementById('modal-score-risk-tag');
    if (!scoreGauge) return;

    if (this._scoreGaugeAnimFrame) {
      cancelAnimationFrame(this._scoreGaugeAnimFrame);
    }

    // Reset gauge and value to 0 before animation starts
    scoreGauge.style.setProperty('--score-deg', '0deg');
    if (scoreValEl) scoreValEl.textContent = '0';
    if (riskTagEl) {
      riskTagEl.textContent = 'Calcul en cours...';
      riskTagEl.style.color = '#94a3b8';
      riskTagEl.style.borderColor = 'rgba(148, 163, 184, 0.4)';
      riskTagEl.style.backgroundColor = 'rgba(148, 163, 184, 0.15)';
    }

    const finalScore = Math.max(0, Math.min(100, Math.round(targetScore)));
    const startTime = performance.now();

    const updateRiskTag = (score) => {
      if (!riskTagEl) return;
      if (score >= 75) {
        riskTagEl.textContent = 'Risque Faible';
        riskTagEl.style.color = '#34d399';
        riskTagEl.style.borderColor = 'rgba(16, 185, 129, 0.4)';
        riskTagEl.style.backgroundColor = 'rgba(16, 185, 129, 0.2)';
      } else if (score >= 55) {
        riskTagEl.textContent = 'Risque Modéré';
        riskTagEl.style.color = '#fbbf24';
        riskTagEl.style.borderColor = 'rgba(245, 158, 11, 0.4)';
        riskTagEl.style.backgroundColor = 'rgba(245, 158, 11, 0.2)';
      } else {
        riskTagEl.textContent = 'Risque Élevé';
        riskTagEl.style.color = '#f87171';
        riskTagEl.style.borderColor = 'rgba(239, 68, 68, 0.4)';
        riskTagEl.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
      }
    };

    const step = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Smooth cubic-out easing curve (starts brisk, lands gently)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentScore = Math.round(easeOut * finalScore);
      const currentDeg = (easeOut * finalScore / 100) * 360;

      scoreGauge.style.setProperty('--score-deg', `${currentDeg.toFixed(1)}deg`);
      if (scoreValEl) scoreValEl.textContent = currentScore;
      updateRiskTag(currentScore);

      if (progress < 1) {
        this._scoreGaugeAnimFrame = requestAnimationFrame(step);
      } else {
        scoreGauge.style.setProperty('--score-deg', `${((finalScore / 100) * 360).toFixed(1)}deg`);
        if (scoreValEl) scoreValEl.textContent = finalScore;
        updateRiskTag(finalScore);
      }
    };

    // Slight delay of 120ms to synchronize seamlessly with modal CSS scale/fade entrance
    setTimeout(() => {
      this._scoreGaugeAnimFrame = requestAnimationFrame(step);
    }, 120);
  },

  toggleColdStartInModal() {
    const current = this.activeColdStartOverride;
    const next = current === null ? true : !current;
    this.openDossierModal(this.activeDossierId, next);
    window.App.showToast(`Simulation basculée en mode ${next ? 'COLD START' : 'STANDARD'}`, 'info');
  },

  renderModalDocuments(docs, role = null) {
    const docsContainer = document.getElementById('modal-docs-list');
    if (!docsContainer) return;

    const currentRole = role || this.getCurrentUserRole();
    const isClient = currentRole === 'CLIENT';
    const canValidate = !isClient && (currentRole === 'ANALYST' || currentRole === 'ADMIN');

    if (docs.length === 0) {
      docsContainer.innerHTML = '<p style="color: var(--text-subtle); font-size: 0.8rem;">Aucun document téléversé</p>';
      return;
    }

    docsContainer.innerHTML = docs.map(doc => {
      const ext = DB.get('document_extractions').find(e => e.document_id == doc.id);
      const val = DB.get('human_validations').find(v => v.document_id == doc.id);
      const isDocValid = val && (val.decision === 'VALIDATED' || val.status === 'VALIDATED');
      const isDocNeedMore = val && (val.decision === 'TO_COMPLETE' || val.status === 'TO_COMPLETE');
      const isDocRejected = val && (val.decision === 'REJECTED' || val.status === 'REJECTED');

      return `
        <div class="card" style="margin-bottom: 1rem; border-color: ${isDocValid ? 'var(--cif-emerald-100)' : 'var(--border-subtle)'};">
          <div class="card-header" style="padding: 0.75rem 1rem;">
            <div style="font-weight: 600; font-size: 0.84rem; display: flex; align-items: center; gap: 6px;">
              <i class="fas fa-file-pdf text-primary"></i> ${doc.original_filename || doc.name}
            </div>
            <div>
              ${val 
                ? `<span class="badge ${isDocValid ? 'badge-approved' : (isDocRejected ? 'badge-rejected' : 'badge-verification')}"><i class="fas ${isDocValid ? 'fa-user-check' : 'fa-user-clock'}"></i> ${val.decision || val.status}</span>` 
                : `<span class="badge badge-verification">Validation Humaine Requise</span>`}
            </div>
          </div>
          <div class="card-body" style="padding: 1rem;">
            <div style="font-family: var(--font-family-code); font-size: 0.76rem; background: var(--surface-card-subtle); padding: 0.75rem; border-radius: var(--radius-sm); margin-bottom: 0.75rem; white-space: pre-line;">
              ${ext ? ext.extracted_text : 'Traitement OCR en cours...'}
            </div>

            ${canValidate ? `
              <div class="human-validation-actions">
                <button class="btn btn-success btn-sm" onclick="AppInteractions.validateDocument(${doc.id}, 'VALIDATED')">
                  <i class="fas fa-check"></i> Valider Pièce
                </button>
                <button class="btn btn-secondary btn-sm" onclick="AppInteractions.validateDocument(${doc.id}, 'TO_COMPLETE')">
                  <i class="fas fa-rotate"></i> Demander Complément
                </button>
                <button class="btn btn-danger btn-sm" onclick="AppInteractions.validateDocument(${doc.id}, 'REJECTED')">
                  <i class="fas fa-times"></i> Rejeter
                </button>
              </div>
            ` : (isClient ? `
              <div class="doc-client-status ${isDocValid ? 'valid' : (isDocNeedMore ? 'warning' : (isDocRejected ? 'danger' : 'pending'))}">
                ${isDocValid 
                  ? `<i class="fas fa-check-circle mr-1"></i> Pièce validée et conforme.` 
                  : (isDocNeedMore 
                      ? `<i class="fas fa-circle-exclamation mr-1"></i> Complément requis : ${val ? (val.comment || 'Merci de fournir une version plus lisible') : 'Information complémentaire demandée'}` 
                      : (isDocRejected 
                          ? `<i class="fas fa-circle-xmark mr-1"></i> Document non recevable : ${val ? (val.comment || 'Rejeté') : 'Non recevable'}` 
                          : `<i class="fas fa-clock mr-1"></i> Document en cours d'examen par le service des risques`))}
              </div>
            ` : `
              <div style="font-size: 0.74rem; color: var(--text-subtle);">
                <i class="fas fa-info-circle mr-1"></i> Statut de conformité : <strong>${val ? (val.decision || val.status) : 'En attente de revue analyste'}</strong>
              </div>
            `)}
          </div>
        </div>
      `;
    }).join('');
  },

  renderModalRoleActions(req, evalData, role) {
    const container = document.getElementById('modal-role-action-container');
    if (!container) return;

    if (role === 'CLIENT') {
      const isApproved = req.status === 'APPROVED';
      const isRejected = req.status === 'REJECTED';
      const isCommittee = req.status === 'COMMITTEE';

      container.innerHTML = `
        <div class="card" style="margin-top: 1.25rem; background: var(--surface-card-subtle); border: 1.5px solid var(--border-subtle);">
          <div class="card-body" style="padding: 1.15rem;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;">
              <h5 style="font-size: 0.9rem; margin: 0; color: var(--text-main); font-weight: 700;">
                <i class="fas fa-timeline text-primary mr-1"></i> Suivi de votre Demande de Financement
              </h5>
              <span class="badge ${isApproved ? 'badge-approved' : (isRejected ? 'badge-rejected' : 'badge-submitted')}">
                ${isApproved ? 'Prêt Accordé' : (isRejected ? 'Dossier Clôturé' : 'En Instruction')}
              </span>
            </div>

            <div class="client-dossier-steps">
              <div class="client-step completed">
                <div class="step-icon"><i class="fas fa-check"></i></div>
                <div class="step-content">
                  <strong>1. Dépôt & Pièces justificatives</strong>
                  <p>Dossier enregistré le ${new Date(req.created_at || Date.now()).toLocaleDateString('fr-FR')} • Montant : ${CreditScoringEngine.formatFCFA(req.requested_amount)}</p>
                </div>
              </div>

              <div class="client-step ${isApproved || isCommittee ? 'completed' : 'active'}">
                <div class="step-icon">
                  <i class="fas ${isApproved || isCommittee ? 'fa-check' : 'fa-spinner fa-spin'}"></i>
                </div>
                <div class="step-content">
                  <strong>2. Analyse de Capacité & Scoring CIF</strong>
                  <p>${isApproved || isCommittee ? 'Instruction technique finalisée par le service des risques.' : 'Analyse de votre capacité de remboursement en cours par votre analyste.'}</p>
                </div>
              </div>

              <div class="client-step ${isApproved ? 'completed' : (isCommittee ? 'active' : '')}">
                <div class="step-icon">
                  <i class="fas ${isApproved ? 'fa-check' : (isCommittee ? 'fa-gavel' : 'fa-clock')}"></i>
                </div>
                <div class="step-content">
                  <strong>3. Décision du Comité de Crédit</strong>
                  <p>${isApproved ? 'Félicitations ! Votre demande a été approuvée.' : (isRejected ? 'Demande non retenue selon les critères en vigueur.' : (isCommittee ? 'Dossier transmis au Comité pour arbitrage final.' : 'En attente de transmission au Comité'))}</p>
                </div>
              </div>
            </div>

            <div style="margin-top: 1rem; padding-top: 0.85rem; border-top: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
              <div style="font-size: 0.76rem; color: var(--text-subtle);">
                <i class="fas fa-building mr-1"></i> Agence CreditFast : <strong>Bamako Grand Marché</strong>
              </div>
              <button class="btn btn-secondary btn-sm" onclick="AppInteractions.closeModal('dossier-modal'); App.switchView('view-client-advisor');">
                <i class="fas fa-headset mr-1"></i> Échanger avec mon Conseiller
              </button>
            </div>
          </div>
        </div>
      `;
    } else if (role === 'COMMITTEE') {
      const review = DB.get('credit_reviews').find(r => r.credit_request_id == req.id) || {};
      container.innerHTML = `
        <div class="card" style="margin-top: 1.25rem; background: var(--surface-card-subtle); border-left: 4px solid var(--cif-gold-500, #f59e0b);">
          <div class="card-body" style="padding: 1.15rem;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.65rem;">
              <h5 style="font-size: 0.9rem; margin: 0; font-weight: 700;">
                <i class="fas fa-gavel text-warning mr-1"></i> Espace Délibération du Comité
              </h5>
              <span class="badge ${review.recommendation === 'FAVORABLE' ? 'badge-approved' : 'badge-verification'}">
                Avis Analyste : ${review.recommendation || 'FAVORABLE'}
              </span>
            </div>
            
            <div style="font-size: 0.78rem; background: var(--surface-card); padding: 0.75rem; border-radius: var(--radius-sm); margin-bottom: 0.85rem; border: 1px solid var(--border-subtle);">
              <strong>Synthèse Analyste :</strong> 
              <p style="margin: 3px 0 0; color: var(--text-subtle);">${review.comment || 'Capacité nette vérifiée, ratio de couverture conforme et garanties validées.'}</p>
            </div>

            <button class="btn btn-primary btn-block" style="width: 100%; font-weight: 700; padding: 0.65rem 1rem;" onclick="AppInteractions.openCommitteeModal(${req.id})">
              <i class="fas fa-gavel mr-1"></i> Ouvrir la Délibération & Voter la Décision
            </button>
          </div>
        </div>
      `;
    } else if (role === 'AUDITOR') {
      container.innerHTML = `
        <div class="card" style="margin-top: 1.25rem; background: var(--surface-card-subtle); border-left: 4px solid var(--cif-purple-500, #8b5cf6);">
          <div class="card-body" style="padding: 1.15rem;">
            <h5 style="font-size: 0.9rem; margin-bottom: 0.5rem; font-weight: 700;">
              <i class="fas fa-fingerprint text-purple mr-1"></i> Piste d'Audit & Journal Cryptographique
            </h5>
            <p style="font-size: 0.76rem; color: var(--text-subtle); margin-bottom: 0.75rem;">
              Dossier vérifié sans altération. 10 facteurs de risque tracés avec signature immuable.
            </p>
            <div style="font-size: 0.74rem; font-family: var(--font-family-code); background: var(--surface-card); padding: 0.5rem 0.75rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
              SHA-256 : e8f2a79...bc4102d9 • Horodatage BCEAO : Certifié
            </div>
          </div>
        </div>
      `;
    } else {
      // ANALYST, CREDIT_OFFICER, ADMIN
      container.innerHTML = `
        <div class="card" style="margin-top: 1.25rem; background: var(--surface-card-subtle);">
          <div class="card-body" style="padding: 1rem;">
            <h5 style="font-size: 0.88rem; margin-bottom: 0.5rem;"><i class="fas fa-pen-to-square text-primary"></i> Avis & Recommandation de l'Analyste</h5>
            <div class="form-group" style="margin-bottom: 0.75rem;">
              <label class="form-label">Avis Consultatif</label>
              <select id="analyst-reco-select" class="form-control">
                <option value="FAVORABLE">Favorable pour passage en Comité</option>
                <option value="RESERVE">Favorable sous réserve de compléments</option>
                <option value="DEFAVORABLE">Défavorable (Risque trop élevé)</option>
              </select>
            </div>
            <div class="form-group" style="margin-bottom: 0.75rem;">
              <label class="form-label">Note d'analyse de synthèse</label>
              <textarea id="analyst-notes-input" class="form-control" rows="2" placeholder="Synthèse pour le comité de crédit...">Capacité de remboursement vérifiée. Activité mature et stable. Documents proforma contrôlés avec succès.</textarea>
            </div>
            <button class="btn btn-primary btn-block" style="width: 100%;" onclick="AppInteractions.submitAnalystReview()">
              <i class="fas fa-paper-plane"></i> Transmettre au Comité de Crédit
            </button>
          </div>
        </div>
      `;
    }
  },

  validateDocument(docId, status) {
    const comment = prompt(`Commentaire de validation (${status}) :`, status === 'VALIDATED' ? 'Pièce certifiée authentique par analyste' : 'Précisions nécessaires');
    if (comment === null) return;

    OCREngine.recordValidation(docId, 1, status, comment);
    window.App.showToast(`Document #${docId} validé avec le statut '${status}'`, 'success');
    
    const req = DB.findById('credit_requests', this.activeDossierId);
    const docs = DB.get('documents').filter(d => d.credit_request_id == req.id);
    this.renderModalDocuments(docs);
  },

  resolveAnomaly(anomalyId) {
    DB.update('anomalies', anomalyId, { status: 'RESOLVED', resolved_by: 1, resolution_comment: 'Vérification terrain concluante' });
    window.App.showToast('Anomalie marquée comme résolue', 'info');
    this.openDossierModal(this.activeDossierId, this.activeColdStartOverride);
  },

  submitAnalystReview() {
    const notes = document.getElementById('analyst-notes-input').value;
    const reco = document.getElementById('analyst-reco-select').value;

    DB.insert('credit_reviews', {
      credit_request_id: this.activeDossierId,
      analyst_id: 1,
      review_status: 'CONFORME',
      recommendation: reco,
      comment: notes,
      reviewed_at: new Date().toISOString()
    });

    DB.update('credit_requests', this.activeDossierId, {
      status: 'COMMITTEE'
    });

    DB.insert('credit_status_history', {
      credit_request_id: this.activeDossierId,
      changed_by: 1,
      old_status: 'ANALYSIS',
      new_status: 'COMMITTEE',
      comment: `Recommandation transmise au comité : ${reco}. ${notes}`,
      created_at: new Date().toISOString()
    });

    DB.addAuditLog(1, 'TRANSMIT_TO_COMMITTEE', 'credit_requests', this.activeDossierId, `Dossier #${this.activeDossierId} transmis au Comité de Crédit avec avis ${reco}`);

    window.App.showToast('Dossier transmis avec succès au Comité de Crédit !', 'success');
    this.closeModal('dossier-modal');
    this.renderRequestsTable();
  },

  // Open Committee Deliberation Modal
  openCommitteeModal(dossierId) {
    const req =
      window.App && typeof window.App.resolveCreditRequest === 'function'
        ? window.App.resolveCreditRequest(dossierId)
        : DB.findById('credit_requests', dossierId);
    if (!req) return;

    this.activeDossierId = req.id;
    const modal = document.getElementById('committee-modal');
    if (!modal) return;

    const evalData = CreditScoringEngine.evaluateDossier(req.id) || {};
    const client = DB.findById('clients', req.client_id) || {};
    const review = DB.get('credit_reviews').find(r => r.credit_request_id == req.id) || {};

    const dossierNumEl = document.getElementById('com-dossier-num');
    const clientNameEl = document.getElementById('com-client-name');
    const reqAmountEl = document.getElementById('com-requested-amount');
    const reqDurEl = document.getElementById('com-requested-duration');
    const scoreValEl = document.getElementById('com-score-value');
    const riskLevelEl = document.getElementById('com-risk-level');
    const dispIncomeEl = document.getElementById('com-disposable-income');
    const analystNotesEl = document.getElementById('com-analyst-notes');

    if (dossierNumEl) dossierNumEl.textContent = req.request_number || `#REQ-2026-${req.id}`;
    if (clientNameEl) {
      const malianAgenciesMap = {
        1: "Grand Marché",
        2: "Badalabougou",
        3: "Dabanani",
        4: "Sotuba",
        5: "Faladié",
      };
      const clientKey = req.client_id || req.id;
      const district = malianAgenciesMap[clientKey] || "Grand Marché";
      const locText = `Bamako (${district}), Mali`;
      clientNameEl.innerHTML = `<i class="fas fa-user mr-1"></i> ${req.client_name} (${locText})`;
    }
    if (reqAmountEl) reqAmountEl.textContent = CreditScoringEngine.formatFCFA(req.requested_amount);
    if (reqDurEl) reqDurEl.textContent = `${req.duration_months} mois`;

    if (scoreValEl) {
      scoreValEl.textContent = evalData.overallScore || req.score || 85;
      scoreValEl.style.color = evalData.riskColor || '#059669';
    }

    if (riskLevelEl) {
      riskLevelEl.className = `badge ${evalData.riskLevel === 'CRITIQUE' ? 'badge-rejected' : (evalData.riskLevel === 'ELEVE' ? 'badge-warning' : 'badge-approved')}`;
      riskLevelEl.textContent = evalData.riskLevel === 'FAIBLE' ? 'Risque Faible' : (evalData.riskLevel === 'MODERE' ? 'Risque Modéré' : evalData.riskLevel || 'Faible');
    }

    if (dispIncomeEl) {
      dispIncomeEl.textContent = CreditScoringEngine.formatFCFA(req.disposable_income || client.declared_monthly_income || 730000);
    }

    if (analystNotesEl) {
      analystNotesEl.textContent = review.comment ? `« ${review.comment} »` : `« Capacité nette vérifiée (${CreditScoringEngine.formatFCFA(req.disposable_income || 730000)}), garanties contrôlées et profil conforme aux directives de crédit CIF. »`;
    }

    const appAmountInput = document.getElementById('com-approved-amount');
    const appDurSelect = document.getElementById('com-approved-duration');
    const interestInput = document.getElementById('com-interest-rate');

    if (appAmountInput) appAmountInput.value = req.requested_amount;
    if (appDurSelect) appDurSelect.value = req.duration_months || 12;
    if (interestInput) interestInput.value = 11.5;

    const updateLiveCalc = () => {
      const amount = Number(appAmountInput?.value || req.requested_amount);
      const months = Number(appDurSelect?.value || req.duration_months || 12);
      const rateAnnual = (Number(interestInput?.value || 11.5)) / 100;
      const rateMonthly = rateAnnual / 12;

      let monthlyPayment = 0;
      if (rateMonthly > 0 && months > 0) {
        monthlyPayment = Math.round((amount * rateMonthly) / (1 - Math.pow(1 + rateMonthly, -months)));
      } else if (months > 0) {
        monthlyPayment = Math.round(amount / months);
      }

      const clientIncome = Number(client.declared_monthly_income || req.declared_monthly_income || 850000);
      const effortRatio = clientIncome > 0 ? ((monthlyPayment / clientIncome) * 100).toFixed(1) : '25.0';

      const livePaymentEl = document.getElementById('com-live-monthly-payment');
      const liveRatioEl = document.getElementById('com-live-effort-ratio');

      if (livePaymentEl) livePaymentEl.textContent = `${CreditScoringEngine.formatFCFA(monthlyPayment)} / mois`;
      if (liveRatioEl) {
        liveRatioEl.textContent = `${effortRatio}%`;
        liveRatioEl.style.color = Number(effortRatio) <= 33 ? '#059669' : '#b45309';
      }
    };

    if (appAmountInput && !appAmountInput._bound) {
      appAmountInput.addEventListener('input', updateLiveCalc);
      appAmountInput._bound = true;
    }
    if (appDurSelect && !appDurSelect._bound) {
      appDurSelect.addEventListener('change', updateLiveCalc);
      appDurSelect._bound = true;
    }
    if (interestInput && !interestInput._bound) {
      interestInput.addEventListener('input', updateLiveCalc);
      interestInput._bound = true;
    }

    updateLiveCalc();

    modal.style.display = 'flex';
    modal.classList.add('active');
  },

  submitCommitteeDecision(decision) {
    const req = DB.findById('credit_requests', this.activeDossierId);
    const approvedAmount = Number(document.getElementById('com-approved-amount')?.value || (req ? req.requested_amount : 1000000));
    const approvedDuration = Number(document.getElementById('com-approved-duration')?.value || (req ? req.duration_months : 12));
    const conditions = document.getElementById('com-conditions')?.value || 'Conforme aux délibérations';

    const newStatus = decision === 'APPROVED' ? 'APPROVED' : (decision === 'REJECTED' ? 'REJECTED' : 'VERIFICATION_REQUIRED');

    DB.update('credit_requests', this.activeDossierId, {
      status: newStatus
    });

    DB.insert('credit_committee_decisions', {
      credit_request_id: this.activeDossierId,
      committee_member_id: 3,
      decision: decision,
      approved_amount: approvedAmount,
      approved_duration_months: approvedDuration,
      comment: conditions,
      decided_at: new Date().toISOString()
    });

    if (decision === 'APPROVED' && req) {
      DB.insert('loans', {
        client_id: req.client_id,
        credit_request_id: req.id,
        principal_amount: approvedAmount,
        interest_amount: Math.round(approvedAmount * 0.12),
        total_amount: Math.round(approvedAmount * 1.12),
        duration_months: approvedDuration,
        monthly_payment: Math.round((approvedAmount * 1.12) / approvedDuration),
        disbursed_at: new Date().toISOString().split('T')[0],
        maturity_date: '2027-08-18',
        outstanding_amount: Math.round(approvedAmount * 1.12),
        status: 'ACTIVE'
      });
    }

    DB.addAuditLog(3, 'COMMITTEE_DECISION', 'credit_committee_decisions', this.activeDossierId, `Comité de crédit : décision ${decision} pour le dossier #${this.activeDossierId} (Montant: ${CreditScoringEngine.formatFCFA(approvedAmount)})`);

    window.App.showToast(`Décision du Comité enregistrée : ${decision}`, 'success');
    this.closeModal('committee-modal');

    if (window.App.currentRole === 'COMMITTEE') {
      window.App.renderCommitteeDashboard();
      if (typeof window.App.renderCommitteeDossiersPage === 'function') {
        window.App.renderCommitteeDossiersPage();
      }
    }
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      setTimeout(() => {
        if (!modal.classList.contains('active')) {
          modal.style.display = 'none';
        }
      }, 250);
    }
  }
};

window.AppInteractions = AppInteractions;
