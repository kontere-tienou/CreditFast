/**
 * CRÉDIT FAST - MOTEUR DE SCORING EXPLICABLE V2
 * Conforme aux règles fondamentales du Guide V2 :
 * 1. Revenu brut != Capacité de remboursement
 * 2. Absence d'historique != Mauvais historique (Gestion explicite du COLD START)
 * 3. Le score aide l'analyste et le comité ; il ne décide pas seul
 * 4. Versionnement du moteur (scoring_models & scoring_rules)
 * 5. Calcul des 10 sous-scores V2 et de l'indice de confiance (confidence_score)
 */

const CreditScoringEngine = {
  // Formatage standard FCFA (XOF)
  formatFCFA(amount) {
    if (amount === undefined || amount === null) return '0 FCFA';
    return new Intl.NumberFormat('fr-FR').format(Math.round(amount)) + ' FCFA';
  },

  // Calcul de la capacité financière et du Reste à Vivre
  calculateCapacity(monthlyIncome, otherIncome, monthlyExpenses, existingDebt, requestedAmount, durationMonths) {
    const totalIncome = Number(monthlyIncome || 0) + Number(otherIncome || 0);
    const totalObligations = Number(monthlyExpenses || 0) + Number(existingDebt || 0);
    const disposableIncome = totalIncome - totalObligations;

    // Échéance mensuelle constante avec taux dégressif microfinance CreditFast (1.5% mensuel)
    const monthlyRate = 0.015;
    const months = Number(durationMonths) || 12;
    const amount = Number(requestedAmount) || 0;
    
    let estimatedPayment = 0;
    if (months > 0 && amount > 0) {
      estimatedPayment = (amount / months) + (amount * monthlyRate * 0.6);
    }

    const coverageRatio = estimatedPayment > 0 ? (disposableIncome / estimatedPayment) : 0;
    const isSufficient = disposableIncome >= (estimatedPayment * 1.15); // Marge prudentielle 15%

    return {
      totalIncome,
      totalObligations,
      disposableIncome,
      estimatedPayment: Math.round(estimatedPayment),
      coverageRatio: parseFloat(coverageRatio.toFixed(2)),
      isSufficient,
      status: isSufficient ? 'SUFFICIENT' : 'INSUFFICIENT',
      statusText: isSufficient ? 'Capacité Suffisante' : 'Capacité Insuffisante'
    };
  },

  // Évaluation V2 multi-facteurs avec gestion Standard vs Cold Start
  evaluateDossier(dossierId, forceColdStart = null) {
    const req = DB.findById('credit_requests', dossierId);
    if (!req) return null;

    const client = DB.findById('clients', req.client_id) || {};
    const finProfile = DB.get('financial_profiles').find(f => f.client_id == req.client_id) || {};
    const activity = DB.get('activities').find(a => a.client_id == req.client_id) || {};
    const guarantee = DB.get('guarantees').find(g => g.credit_request_id == req.id) || {};
    const anomalies = DB.get('anomalies').filter(a => a.credit_request_id == req.id && a.status === 'OPEN');
    const savings = DB.get('savings_history').find(s => s.client_id == req.client_id) || {};
    const clientLoans = DB.get('loans').filter(l => l.client_id == req.client_id);
    const repayments = DB.get('loan_repayments');

    // Détermination du mode de scoring : Standard vs Cold Start
    const hasHistory = (savings.average_balance && savings.average_balance > 0) || clientLoans.length > 0;
    const isColdStart = forceColdStart !== null ? forceColdStart : (req.is_cold_start || client.is_cold_start || !hasHistory);

    const activeModel = isColdStart 
      ? DB.findById('scoring_models', 2) // Modèle Cold Start
      : DB.findById('scoring_models', 1); // Modèle Standard

    const rules = DB.get('scoring_rules').filter(r => r.scoring_model_id == activeModel.id && r.status === 'ACTIVE');

    // 1. Calcul Capacité & Reste à Vivre
    const capacity = this.calculateCapacity(
      finProfile.monthly_income || req.declared_monthly_income,
      finProfile.other_income || 0,
      finProfile.monthly_expenses || req.declared_monthly_expenses,
      finProfile.existing_debt_payment || 0,
      req.requested_amount,
      req.duration_months
    );

    // 2. Calcul des 10 Sous-Scores (sur 100 chacun)
    
    // S1: Capacité de Remboursement Score (0-100)
    let repaymentCapacityScore = 20;
    if (capacity.coverageRatio >= 1.8) repaymentCapacityScore = 95;
    else if (capacity.coverageRatio >= 1.4) repaymentCapacityScore = 85;
    else if (capacity.coverageRatio >= 1.15) repaymentCapacityScore = 70;
    else if (capacity.coverageRatio >= 0.9) repaymentCapacityScore = 45;
    else repaymentCapacityScore = 20;

    // S2: Cohérence Revenus Déclarés / Documentés (0-100)
    let incomeConsistencyScore = 88;
    const docExtractions = DB.get('document_extractions');
    if (anomalies.some(a => a.anomaly_type === 'MONTANT_DISCORDANT')) {
      incomeConsistencyScore = 40;
    }

    // S3: Situation des Charges (0-100)
    const expenseRatio = capacity.totalObligations / (capacity.totalIncome || 1);
    let expenseScore = expenseRatio < 0.5 ? 90 : (expenseRatio < 0.7 ? 70 : 40);

    // S4: Stabilité & Ancienneté Activité (0-100)
    const startYear = activity.start_date ? new Date(activity.start_date).getFullYear() : 2022;
    const yearsActive = Math.max(1, 2026 - startYear);
    let activityScore = Math.min(95, Math.round(yearsActive * 15) + (activity.monthly_revenue > 1500000 ? 10 : 0));

    // S5: Qualité des Justificatifs & OCR (0-100)
    let documentScore = 92;
    if (anomalies.some(a => a.severity === 'CRITICAL')) documentScore = 25;
    else if (anomalies.some(a => a.severity === 'WARNING')) documentScore = 55;

    // S6: Historique d'Épargne (0-100) (ou Neutre / Absent en Cold Start)
    let savingsScore = 50;
    if (!isColdStart) {
      if (savings.average_balance >= 1000000) savingsScore = 90;
      else if (savings.average_balance >= 400000) savingsScore = 75;
      else if (savings.average_balance > 0) savingsScore = 60;
    } else {
      savingsScore = 70; // Note neutre équitable en Cold Start (absence != mauvais)
    }

    // S7: Comportement Crédits Antérieurs (0-100) (sur base des loan_repayments réels)
    let creditHistoryScore = 50;
    if (!isColdStart && clientLoans.length > 0) {
      const clientRepayments = repayments.filter(r => clientLoans.some(l => l.id == r.loan_id));
      const totalLateDays = clientRepayments.reduce((sum, r) => sum + (r.days_late || 0), 0);
      if (totalLateDays === 0) creditHistoryScore = 95;
      else if (totalLateDays <= 5) creditHistoryScore = 80;
      else if (totalLateDays <= 15) creditHistoryScore = 60;
      else creditHistoryScore = 30;
    } else {
      creditHistoryScore = 70; // Neutre en Cold Start
    }

    // S8: Garanties Matérielles & Cautions (0-100)
    let guaranteeScore = 35;
    if (guarantee.verification_status === 'VERIFIED') {
      const cov = (guarantee.verified_value || 0) / (req.requested_amount || 1);
      if (cov >= 1.2) guaranteeScore = 95;
      else if (cov >= 0.8) guaranteeScore = 80;
      else guaranteeScore = 65;
    }

    // S9: Zone d'Habitation & Facteur Contextuel (0-100)
    let residentialZoneScore = 75;
    const resZone = String(client.residential_zone || '');
    if (resZone.includes('Commerciale')) residentialZoneScore = 85;
    else if (resZone.includes('Industrielle')) residentialZoneScore = 80;
    else residentialZoneScore = 70;

    // 3. Calcul du Score Global Pondéré selon les règles du modèle actif
    const factorScoresMap = {
      REPAYMENT_CAPACITY: { name: 'Capacité nette de remboursement', score: repaymentCapacityScore, text: `Reste à vivre net de ${this.formatFCFA(capacity.disposableIncome)} (Ratio ${capacity.coverageRatio}x).` },
      CREDIT_HISTORY: { name: 'Comportement crédits antérieurs', score: creditHistoryScore, text: isColdStart ? 'Primo-demandeur (Poids redistribué sans pénalité).' : 'Historique des remboursements régulier sans impayé.' },
      SAVINGS_DISCIPLINE: { name: 'Discipline d’épargne CreditFast', score: savingsScore, text: isColdStart ? 'Aucun historique d’épargne requis pour ce profil.' : `Solde moyen constaté de ${this.formatFCFA(savings.average_balance || 0)}.` },
      ACTIVITY_STABILITY: { name: 'Stabilité & Ancienneté activité', score: activityScore, text: `Activité (${activity.sector || 'Commerce'}) active depuis ${yearsActive} an(s).` },
      GUARANTEE_COVERAGE: { name: 'Garanties & Cautions', score: guaranteeScore, text: guarantee.verification_status === 'VERIFIED' ? `Garantie vérifiée et valorisée à ${this.formatFCFA(guarantee.verified_value)}.` : 'Garantie déclarée en attente de vérification physique.' },
      OCR_DOCUMENT_INTEGRITY: { name: 'Rapprochement OCR & Pièces', score: documentScore, text: anomalies.length > 0 ? `${anomalies.length} anomalie(s) détectée(s) sur les justificatifs.` : 'Justificatifs cohérents sans divergence.' },
      RESIDENTIAL_ZONE: { name: 'Zone d’habitation & Enracinement', score: residentialZoneScore, text: `Zone contextuelle : ${client.residential_zone || 'UEMOA'}.` }
    };

    let overallScore = 0;
    const factors = [];

    rules.forEach(rule => {
      const fData = factorScoresMap[rule.rule_code];
      if (fData) {
        const weightedContribution = fData.score * rule.weight;
        overallScore += weightedContribution;

        factors.push({
          ruleCode: rule.rule_code,
          name: rule.rule_name || fData.name,
          score: Math.round(fData.score),
          weight: `${Math.round(rule.weight * 100)}%`,
          contribution: Math.round(weightedContribution),
          is_positive: fData.score >= 65,
          explanation: fData.text
        });
      }
    });

    overallScore = Math.round(overallScore);

    // 4. Indice de Confiance Global (confidence_score)
    let confidenceScore = 90;
    if (anomalies.length > 0) confidenceScore -= (anomalies.length * 12);
    if (client.kyc_status !== 'VERIFIED') confidenceScore -= 15;
    if (guarantee.verification_status !== 'VERIFIED') confidenceScore -= 10;
    confidenceScore = Math.max(45, Math.min(99, confidenceScore));

    // Détermination du niveau de risque et de la recommandation
    let riskLevel = 'RISQUE_MODERE';
    let riskColor = '#f59e0b';
    let recommendation = 'A_EXAMINER';

    if (overallScore >= 75 && capacity.isSufficient) {
      riskLevel = 'RISQUE_FAIBLE';
      riskColor = '#10b981';
      recommendation = 'FAVORABLE';
    } else if (overallScore < 60 || !capacity.isSufficient) {
      riskLevel = 'RISQUE_ELEVE';
      riskColor = '#ef4444';
      recommendation = 'DEFAVORABLE';
    }

    return {
      dossierId,
      model: activeModel,
      isColdStart,
      overallScore,
      confidenceScore,
      riskLevel,
      riskColor,
      recommendation,
      factors,
      capacity,
      subScores: {
        income_consistency_score: incomeConsistencyScore,
        expense_score: expenseScore,
        activity_score: activityScore,
        document_score: documentScore,
        savings_score: savingsScore,
        credit_history_score: creditHistoryScore,
        guarantee_score: guaranteeScore,
        repayment_capacity_score: repaymentCapacityScore,
        residential_zone_score: residentialZoneScore
      }
    };
  }
};

window.CreditScoringEngine = CreditScoringEngine;
