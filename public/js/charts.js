/**
 * CRÉDIT FAST - DATA VISUALIZATION & CHART.JS MODULE
 * Confédération des Institutions Financières d'Afrique de l'Ouest (CIF)
 */

const AppCharts = {
  instances: {},

  // Global Chart.js Defaults
  setupDefaults() {
    if (typeof Chart === 'undefined') return;
    Chart.defaults.font.family = "'Plus Jakarta Sans', 'Inter', sans-serif";
    Chart.defaults.color = '#64748b';
    Chart.defaults.plugins.tooltip.padding = 10;
    Chart.defaults.plugins.tooltip.cornerRadius = 8;
  },

  // 1. Credit Origination Evolution (Spline Area Chart)
  renderEvolutionChart(canvasId, timeFrame = 'year') {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    if (this.instances[canvasId]) {
      this.instances[canvasId].destroy();
    }

    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 260);
    gradient.addColorStop(0, 'rgba(79, 70, 229, 0.35)');
    gradient.addColorStop(1, 'rgba(79, 70, 229, 0.0)');

    const labels = timeFrame === 'month' 
      ? ['Semaine 1', 'Semaine 2', 'Semaine 3', 'Semaine 4']
      : ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

    const dataAccorded = timeFrame === 'month'
      ? [42, 68, 55, 84] // Millions FCFA
      : [28, 35, 48, 40, 56, 72, 65, 88, 92, 85, 98, 110];

    const dataDemands = timeFrame === 'month'
      ? [58, 85, 70, 110]
      : [38, 48, 62, 55, 78, 95, 88, 120, 128, 115, 130, 145];

    this.instances[canvasId] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Crédits Accordés (M FCFA)',
            data: dataAccorded,
            borderColor: '#4f46e5',
            backgroundColor: gradient,
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#4f46e5',
            pointRadius: 4,
            pointHoverRadius: 6
          },
          {
            label: 'Demandes Déposées (M FCFA)',
            data: dataDemands,
            borderColor: '#f59e0b',
            borderDash: [5, 5],
            borderWidth: 2,
            fill: false,
            tension: 0.4,
            pointBackgroundColor: '#f59e0b',
            pointRadius: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            align: 'end',
            labels: { boxWidth: 12, usePointStyle: true }
          },
          tooltip: {
            callbacks: {
              label: (context) => ` ${context.dataset.label}: ${context.raw} Millions FCFA`
            }
          }
        },
        scales: {
          y: {
            grid: { color: 'rgba(226, 232, 240, 0.6)' },
            ticks: { callback: (val) => val + ' M' }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });
  },

  // 2. Risk Breakdown Doughnut Chart
  renderRiskDoughnut(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    if (this.instances[canvasId]) {
      this.instances[canvasId].destroy();
    }

    const ctx = canvas.getContext('2d');
    this.instances[canvasId] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Risque Faible (Score ≥ 75)', 'Risque Modéré (60-74)', 'Risque Élevé (< 60)'],
        datasets: [{
          data: [62, 26, 12],
          backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
          borderWidth: 2,
          borderColor: '#ffffff',
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { boxWidth: 10, usePointStyle: true, padding: 14 }
          }
        }
      }
    });
  },

  // 3. Regional CIF Distribution Bar Chart
  renderRegionalChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    if (this.instances[canvasId]) {
      this.instances[canvasId].destroy();
    }

    const ctx = canvas.getContext('2d');
    this.instances[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Grand Marché', 'Badalabougou', 'Dabanani', 'Sotuba', 'Faladié'],
        datasets: [{
          label: 'Encours Microcrédits (M FCFA)',
          data: [98, 85, 62, 54, 43],
          backgroundColor: [
            '#4f46e5',
            '#06b6d4',
            '#10b981',
            '#f59e0b',
            '#8b5cf6'
          ],
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            grid: { color: 'rgba(226, 232, 240, 0.6)' },
            ticks: { callback: (val) => val + ' M' }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });
  },

  // 4. Multi-Factor Radar Chart for Dossier Inspector
  renderScoreRadar(canvasId, factors = []) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    if (this.instances[canvasId]) {
      this.instances[canvasId].destroy();
    }

    const labels = factors.map(f => f.name.split(' ')[0] + '...');
    const dataValues = factors.map(f => Math.round((f.score / f.max_score) * 100));

    const ctx = canvas.getContext('2d');
    this.instances[canvasId] = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: labels.length ? labels : ['Capacité', 'Activité', 'Épargne', 'Garantie', 'OCR'],
        datasets: [{
          label: 'Indice de Confiance (%)',
          data: dataValues.length ? dataValues : [85, 90, 75, 60, 95],
          backgroundColor: 'rgba(79, 70, 229, 0.2)',
          borderColor: '#4f46e5',
          pointBackgroundColor: '#4f46e5',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            angleLines: { color: 'rgba(226, 232, 240, 0.8)' },
            grid: { color: 'rgba(226, 232, 240, 0.8)' },
            suggestedMin: 0,
            suggestedMax: 100,
            ticks: { stepSize: 25, display: false }
          }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  },

  // 5. Activity Trend Sparkline Chart (7-day Submission Rate for Agent Header)
  renderActivitySparkline(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    if (this.instances[canvasId]) {
      this.instances[canvasId].destroy();
    }

    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 42);
    gradient.addColorStop(0, 'rgba(79, 70, 229, 0.45)');
    gradient.addColorStop(1, 'rgba(79, 70, 229, 0.02)');

    // 7 days submission progression (12 Aug to 18 Aug)
    const labels = ['12 Août', '13 Août', '14 Août', '15 Août', '16 Août', '17 Août', '18 Août (Auj.)'];
    const dataPoints = [2, 3, 5, 2, 1, 4, 6];

    this.instances[canvasId] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          data: dataPoints,
          borderColor: '#4f46e5',
          borderWidth: 2.5,
          backgroundColor: gradient,
          fill: true,
          tension: 0.38,
          pointRadius: [0, 0, 0, 0, 0, 0, 3.5],
          pointBackgroundColor: '#4f46e5',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 1.5,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: '#4f46e5',
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: { top: 4, bottom: 2, left: 4, right: 4 }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: true,
            displayColors: false,
            padding: 8,
            cornerRadius: 6,
            callbacks: {
              title: (items) => items[0].label,
              label: (context) => ` ${context.raw} dossier(s) déposé(s)`
            }
          }
        },
        scales: {
          x: { display: false },
          y: { display: false, min: 0 }
        }
      }
    });
  },

  // 6. Circular Breakdown Chart for Detected Anomalies (Chart.js)
  renderAnomaliesDonut(canvasId, counts = { critical: 2, ocr: 2, financial: 1, network: 1 }) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    if (this.instances[canvasId]) {
      this.instances[canvasId].destroy();
    }

    const ctx = canvas.getContext('2d');
    const total = (counts.critical || 0) + (counts.ocr || 0) + (counts.financial || 0) + (counts.network || 0) || 1;

    this.instances[canvasId] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: [
          'Critiques (Blocage / Falsification)',
          'Discordances OCR & Pièces',
          'Solvabilité & Ratios Financiers',
          'Réseau & Multi-Caisses'
        ],
        datasets: [{
          data: [
            counts.critical || 0,
            counts.ocr || 0,
            counts.financial || 0,
            counts.network || 0
          ],
          backgroundColor: [
            '#ef4444', // Rouge vif - Critiques
            '#0ea5e9', // Bleu ciel - OCR & Pièces
            '#f59e0b', // Ambre - Financières
            '#8b5cf6'  // Violet - Réseau & Cautions
          ],
          borderWidth: 2,
          borderColor: document.documentElement.getAttribute('data-theme') === 'dark' ? '#1e293b' : '#ffffff',
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 12,
              usePointStyle: true,
              padding: 14,
              font: { size: 12, weight: '600', family: "'Plus Jakarta Sans', sans-serif" }
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const val = context.raw || 0;
                const pct = Math.round((val / total) * 100);
                return ` ${context.label}: ${val} (${pct}%)`;
              }
            }
          }
        }
      }
    });
  },

  // 6. Compact Estimator Financial Breakdown Donut/Pie Chart
  renderLoanBreakdownPie(canvasId, capital, interest, fees) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    if (this.instances[canvasId]) {
      this.instances[canvasId].destroy();
    }

    const ctx = canvas.getContext('2d');
    const total = (capital || 0) + (interest || 0) + (fees || 0) || 1;
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    this.instances[canvasId] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Capital Principal', 'Intérêts Dégressifs', 'Assurance & Frais'],
        datasets: [{
          data: [capital, interest, fees],
          backgroundColor: [
            '#0284c7', // Bleu Océan UEMOA - Capital
            '#f59e0b', // Ambre / Or CIF - Intérêts
            '#10b981'  // Émeraude CIF - Assurance
          ],
          borderWidth: 2,
          borderColor: isDark ? '#1e293b' : '#ffffff',
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        animation: {
          duration: 350
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            padding: 8,
            cornerRadius: 6,
            callbacks: {
              label: (context) => {
                const val = context.raw || 0;
                const pct = Math.round((val / total) * 100);
                return ` ${context.label}: ${val.toLocaleString('fr-FR')} FCFA (${pct}%)`;
              }
            }
          }
        }
      }
    });
  },

  // 7. Full Simulator Financial Breakdown Donut/Pie Chart
  renderSimulatorBreakdownPie(canvasId, capital, interest, fees) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    if (this.instances[canvasId]) {
      this.instances[canvasId].destroy();
    }

    const ctx = canvas.getContext('2d');
    const total = (capital || 0) + (interest || 0) + (fees || 0) || 1;
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    this.instances[canvasId] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Capital Emprunté', 'Intérêts CreditFast', 'Assurance & Frais'],
        datasets: [{
          data: [capital, interest, fees],
          backgroundColor: [
            '#0284c7', // Bleu UEMOA
            '#f59e0b', // Or CIF
            '#10b981'  // Émeraude
          ],
          borderWidth: 2,
          borderColor: isDark ? '#1e293b' : '#ffffff',
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '66%',
        animation: {
          duration: 350
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            padding: 10,
            cornerRadius: 6,
            callbacks: {
              label: (context) => {
                const val = context.raw || 0;
                const pct = Math.round((val / total) * 100);
                return ` ${context.label}: ${val.toLocaleString('fr-FR')} FCFA (${pct}%)`;
              }
            }
          }
        }
      }
    });
  }
};

window.AppCharts = AppCharts;
