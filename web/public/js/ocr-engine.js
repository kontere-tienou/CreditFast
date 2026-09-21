/**
 * CRÉDIT FAST - OCR ENGINE & DOCUMENT ANOMALY DETECTOR
 * Principe fondamental: Cohérence automatique != Authenticité automatique
 * Les contrôles automatisés assistent l'analyste sans certifier d'office l'authenticité.
 */

const OCREngine = {
  // Simulate OCR scan on a document
  scanDocument(docId) {
    const doc = DB.findById('documents', docId);
    if (!doc) return null;

    let extraction = DB.get('document_extractions').find(e => e.document_id == docId);
    
    // If not extracted yet, generate extraction based on document type
    if (!extraction) {
      const docType = String(doc.document_type || doc.type || '').toUpperCase();
      const isInvoice = docType.includes('FACTURE');
      const isStatement = docType.includes('RELEVE');
      
      let sampleText = '';
      let structured = {};
      let confidence = 0.93;

      if (isInvoice) {
        sampleText = `FACTURE PROFORMA / COMMERCIALE\nFournisseur: COMPTOIR GENERAL D'AFRIQUE DE L'OUEST\nClient: ${doc.name || doc.original_filename || 'Client Membre'}\nMontant Net à Payer: 2 150 000 FCFA\nDate d'émission: 10/08/2026\nMentions: Payé / Valide 30 jours`;
        structured = {
          fournisseur: "COMPTOIR GENERAL D'AFRIQUE",
          montant_ttc: 2150000,
          date_facture: '2026-08-10',
          coherence_montant: true
        };
      } else if (isStatement) {
        sampleText = `RELEVE DE COMPTE BANCAIRE / COOPERATIVE CIF\nTitulaire: Client Membre\nSolde Moyen: 890 000 FCFA\nTotal Crédits 3 mois: 3 600 000 FCFA\nDate d'arrêté: 31/07/2026`;
        structured = {
          solde_moyen: 890000,
          mouvements_credits: 3600000,
          regularite_versements: 'BONNE'
        };
      } else {
        sampleText = `REGISTRE DU COMMERCE ET DU CREDIT MOBILIER\nImmatriculation: RCCM-2021-B-8819\nObjet: Commerce général et négoce\nSiège: UEMOA Zone`;
        structured = {
          numero_rccm: 'RCCM-2021-B-8819',
          statut_juridique: 'ACTIF'
        };
      }

      extraction = DB.insert('document_extractions', {
        document_id: doc.id,
        extracted_text: sampleText,
        status: 'EXTRACTED',
        confidence: confidence,
        structured_data: structured
      });
    }

    return extraction;
  },

  // Perform cross-checks and detect anomalies
  detectAnomalies(requestId) {
    const req = DB.findById('credit_requests', requestId);
    if (!req) return [];

    const docs = DB.get('documents').filter(d => d.credit_request_id == requestId);
    const existingAnomalies = DB.get('anomalies').filter(a => a.credit_request_id == requestId);

    // Cross-check 1: Proforma amount vs Requested amount
    docs.forEach(d => {
      const ext = DB.get('document_extractions').find(e => e.document_id == d.id);
      if (ext && ext.structured_data && ext.structured_data.montant_ttc) {
        const diff = Math.abs(ext.structured_data.montant_ttc - req.requested_amount);
        const percentDiff = diff / req.requested_amount;

        if (percentDiff > 0.25) {
          const alreadyLogged = existingAnomalies.some(a => a.code === 'MONTANT_DISCORDANT' && a.status === 'OPEN');
          if (!alreadyLogged) {
            DB.insert('anomalies', {
              credit_request_id: req.id,
              severity: 'WARNING',
              code: 'MONTANT_DISCORDANT',
              title: `Écart significatif de montant (${Math.round(percentDiff * 100)}%)`,
              description: `Le montant extrait sur le justificatif (${CreditScoringEngine.formatFCFA(ext.structured_data.montant_ttc)}) diffère sensiblement du montant demandé (${CreditScoringEngine.formatFCFA(req.requested_amount)}).`,
              status: 'OPEN',
              resolved_by: null
            });
          }
        }
      }
    });

    return DB.get('anomalies').filter(a => a.credit_request_id == requestId);
  },

  // Human validation step
  recordValidation(documentId, userId, status, comment) {
    const val = DB.insert('human_validations', {
      document_id: documentId,
      validator_user_id: userId,
      status: status, // VALIDATED, TO_COMPLETE, REJECTED
      comment: comment,
      validated_at: new Date().toISOString()
    });

    DB.addAuditLog(
      userId,
      'HUMAN_DOC_VALIDATION',
      'human_validations',
      val.id,
      `Validation humaine du document #${documentId} passée à '${status}': ${comment}`
    );

    return val;
  }
};

window.OCREngine = OCREngine;
