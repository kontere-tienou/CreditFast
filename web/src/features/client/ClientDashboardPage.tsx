import { Screen } from '@/shared/ui/Screen';
import { Button } from '@/shared/ui/Button';
import { callApp } from '@/shared/ui/legacy';
import { ClientCalendarTable } from '@/shared/tables/registry';
import { InsightTiles } from '@/shared/ui/InsightTiles';
import { KpiHeroGrid } from '@/shared/ui/KpiHeroGrid';
import { ScoreHeroCard } from '@/shared/ui/ScoreHeroCard';

export function ClientDashboardPage() {
  return (
    <Screen viewId="view-role-client">
      <div
        id="borrower-offline-alert"
        className="card"
        style={{
          display: 'none',
          background: '#fffbeb',
          border: '1px solid #fde68a',
          padding: '0.75rem 1rem',
          marginBottom: '1.25rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: '#fef3c7',
                color: '#ff9800',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.95rem',
              }}
            >
              <i className="fas fa-shield-heart"></i>
            </div>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#92400e' }}>Mode Sérénité Hors-Ligne Actif</div>
              <div style={{ fontSize: '0.72rem', color: '#b45309' }}>
                Même sans connexion internet, vous consultez vos règlements, vos documents et l&apos;état de votre projet en toute fluidité.
              </div>
            </div>
          </div>
          <span className="badge badge-approved" style={{ fontSize: '0.68rem' }}>
            <i className="fas fa-circle-check mr-1"></i> Informations Toujours Disponibles
          </span>
        </div>
      </div>

      <div className="borrower-welcome-banner">
        <div>
          <span
            className="badge badge-client"
            style={{ background: 'rgba(81, 142, 69, 0.2)', color: '#518e45', border: '1px solid rgba(81, 142, 69, 0.4)', marginBottom: '0.5rem' }}
          >
            <i className="fas fa-star mr-1"></i> Mon Espace Financement & Projet
          </span>
          <h2 style={{ fontSize: '1.6rem', marginBottom: '0.35rem', color: 'white' }}>
            Bienvenue, <span id="borrower-banner-name">Faratigi Ndiaye</span>
          </h2>
          <p style={{ color: '#cbd5e1', fontSize: '0.85rem', maxWidth: 600 }}>
            N° Membre : <strong id="borrower-member-num">ML-BKO-008821</strong> • Agence CreditFast Grand Marché (Bamako, Mali) • Activité : Commerce & Textile
          </p>
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Button
            variant="success"
            className="btn-lg"
            onClick={() => {
              callApp('openNewLoanModal');
              callApp('setModalWizardStep', 1);
            }}
          >
            <i className="fas fa-rocket mr-1"></i> Faire une demande de prêt
          </Button>
        </div>
      </div>

      <KpiHeroGrid>
        <ScoreHeroCard
          chart="arc"
          label="Votre indice CreditFast"
          value={782}
          min={300}
          max={850}
          display="782"
          caption="Solvabilité sereine"
          rangeMin="300"
          rangeMax="850"
          trend={
            <>
              <i className="fas fa-arrow-up"></i> +16 pts
            </>
          }
        />
        <InsightTiles
          tiles={[
            {
              label: 'Ponctualité',
              value: '100%',
              hint: 'Échéances réglées à temps',
              ring: 100,
              badge: 'Excellent',
              tone: 'good',
            },
            {
              label: 'Ratio d’effort',
              value: '28%',
              hint: 'Mensualité / revenu d’activité',
              ring: 28,
              badge: 'Confortable',
              tone: 'good',
            },
            {
              label: 'Ancienneté',
              value: '4 ans',
              hint: 'Relation agence Grand Marché',
              ring: 62,
            },
            {
              label: 'Épargne de sécurité',
              value: '1.45 M',
              hint: 'Matelas disponible CreditFast',
              ring: 74,
              badge: 'Actif',
              tone: 'info',
            },
          ]}
        />
      </KpiHeroGrid>
      <div id="borrower-active-amount" hidden>
        2 500 000 FCFA
      </div>

      <div className="card" style={{ marginTop: '1.25rem', marginBottom: '1.5rem' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <i className="fas fa-route text-primary"></i>{' '}
              <span>
                Le Parcours de votre Projet #<span id="borrower-active-ref">REQ-2026-0891</span>
              </span>
            </h3>
            <p className="card-subtitle" id="borrower-active-purpose">
              Achat de stock tissus wax pour la fête de Tabaski
            </p>
          </div>
          <div id="borrower-active-status">
            <span className="badge badge-analysis">
              <i className="fas fa-spinner fa-spin mr-1"></i> Étude Attentive en Cours
            </span>
          </div>
        </div>
        <div className="card-body">
          <div className="loan-progress-stepper">
            <DashStep completed label="1. Projet Déposé" meta="11/08/2026" />
            <DashStep completed label="2. Documents Validés" meta="11/08/2026" />
            <DashStep completed label="3. Confort Financier Vérifié" meta="12/08/2026" />
            <DashStep active label="4. Relecture Personnalisée" meta="En Cours" />
            <DashStep number="5" label="5. Accord du Comité" meta="Très prochainement" />
            <DashStep number="6" label="6. Versement de vos Fonds" meta="Directement sur votre compte" />
          </div>
          <div className="anomaly-item info" style={{ marginTop: '1.25rem' }}>
            <i className="fas fa-comment anomaly-icon" style={{ color: '#1b4332' }}></i>
            <div className="anomaly-content">
              <h5 style={{ color: '#0d2818', fontWeight: 700 }}>Le mot encourageant de votre agence CreditFast :</h5>
              <p style={{ color: '#0c4a6e', fontSize: '0.84rem', lineHeight: 1.5 }}>
                Excellente nouvelle ! Tous vos justificatifs ont été validés avec succès. Votre projet avance très bien et est programmé pour validation finale afin de
                déclencher rapidement la mise à disposition de vos fonds.
              </p>
            </div>
          </div>
        </div>
      </div>

      <CompactEstimator />

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <i className="fas fa-calendar-check text-primary"></i> <span title="Mon Calendrier de Remboursement">Mon Calendrier de Remboursement</span>
              </h3>
              <p className="card-subtitle" title="Suivez vos versements en toute clarté">
                Suivez vos versements en toute clarté
              </p>
            </div>
            <Button variant="secondary" className="btn-sm" onClick={() => callApp('switchView', 'view-client-schedule')}>
              <i className="fas fa-arrow-right"></i> Voir Tout l&apos;Échéancier
            </Button>
          </div>
          <ClientCalendarTable />
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <i className="fas fa-user-tie text-emerald"></i> <span>Votre Conseiller Dédié</span>
              </h3>
              <p className="card-subtitle">Un accompagnement humain à chaque étape</p>
            </div>
            <Button variant="secondary" className="btn-sm" onClick={() => callApp('switchView', 'view-client-advisor')}>
              <i className="fas fa-comment-dots"></i> Échanger
            </Button>
          </div>
          <div className="card-body">
            <div className="agent-contact-card" style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <img src="/images/profil/profil01-03.jpg" alt="Agent" className="user-avatar" style={{ width: 50, height: 50 }} />
                <div>
                  <h5 style={{ fontSize: '1rem', marginBottom: 2 }}>Adama Traore</h5>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>Votre Expert Accompagnement Microfinance</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--cif-emerald-500)', fontWeight: 600 }}>Agence CreditFast Grand Marché (Bamako, Mali)</div>
                </div>
              </div>
            </div>
            <div style={{ fontSize: '0.82rem', lineHeight: 1.6, color: 'var(--text-muted-dark)', marginBottom: '1.25rem' }}>
              <div>
                <i className="fas fa-phone mr-1 text-primary"></i> <strong>Ligne directe :</strong> +223 20 22 44 00
              </div>
              <div>
                <i className="fas fa-envelope mr-1 text-primary"></i> <strong>Email :</strong> adama.traore@cif-ao.org
              </div>
              <div>
                <i className="fas fa-clock mr-1 text-primary"></i> <strong>Horaires d&apos;agence :</strong> Lun - Ven : 08h00 - 17h00
              </div>
            </div>
            <div className="advisor-actions">
              <Button className="btn-sm" onClick={() => callApp('switchView', 'view-client-advisor')}>
                <i className="fas fa-comment-dots"></i> Écrire à mon conseiller
              </Button>
              <Button variant="secondary" className="btn-sm" onClick={() => callApp('openAppointmentModal')}>
                <i className="fas fa-calendar-plus"></i> Prendre Rendez-vous
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Screen>
  );
}

function DashStep({ completed, active, number, label, meta }: { completed?: boolean; active?: boolean; number?: string; label: string; meta: string }) {
  return (
    <div className={['loan-step-node', completed ? 'completed' : '', active ? 'active' : ''].filter(Boolean).join(' ')}>
      <div className="dot">{completed ? <i className="fas fa-check"></i> : active ? <i className="fas fa-spinner fa-spin"></i> : number}</div>
      <div className="label">{label}</div>
      <div style={{ fontSize: '0.65rem', color: active ? 'var(--cif-primary-600)' : 'var(--text-subtle)', fontWeight: active ? 700 : undefined }}>{meta}</div>
    </div>
  );
}

function CompactEstimator() {
  return (
    <div className="compact-estimator-card" id="client-amortization-calculator">
      <div className="compact-estimator-header">
        <div className="compact-estimator-title">
          <div className="compact-estimator-icon">
            <i className="fas fa-calculator"></i>
          </div>
          <div>
            <div className="compact-estimator-heading">
              <h3 className="compact-estimator-heading-title">Calculateur d&apos;Amortissement & Simulation de Prêt</h3>
              <span className="badge badge-client compact-estimator-live-badge">
                <i className="fas fa-bolt mr-1"></i> Calcul Instantané en Direct
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '3px 0 0 0' }}>
              Ajustez le montant et la durée pour visualiser en temps réel vos mensualités, les intérêts totaux et le tableau d&apos;amortissement détaillé.
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="badge badge-approved" style={{ fontSize: '0.72rem' }}>
            <i className="fas fa-shield-halved mr-1"></i> Taux Dégressif UEMOA (1.2% / mois)
          </span>
        </div>
      </div>

      <div className="compact-estimator-grid">
        <div className="compact-estimator-top">
        <section className="compact-estimator-step compact-estimator-inputs" aria-label="Paramètres du prêt">
          <p className="compact-estimator-step-label">
            <span>1</span> Choisissez le montant et la durée
          </p>
          <div className="compact-slider-group compact-slider-card">
            <div className="compact-slider-header">
              <span className="compact-slider-label">
                <i className="fas fa-coins text-gold mr-1"></i> Montant souhaité
              </span>
              <span className="compact-slider-val" id="compact-est-amount-val">
                2 500 000 FCFA
              </span>
            </div>
            <input
              type="range"
              id="compact-est-amount-range"
              min={200000}
              max={15000000}
              step={50000}
              defaultValue={2500000}
              className="form-range compact-range-input"
              onInput={() => callApp('updateCompactEstimator')}
            />
            <div className="compact-range-ticks">
              <span>200 000 F</span>
              <span>15 000 000 F</span>
            </div>
            <div className="compact-presets-row">
              <button type="button" className="compact-preset-chip" id="chip-amount-500000" onClick={() => callApp('setCompactPresetAmount', 500000)}>
                500 000
              </button>
              <button type="button" className="compact-preset-chip" id="chip-amount-1000000" onClick={() => callApp('setCompactPresetAmount', 1000000)}>
                1 M
              </button>
              <button type="button" className="compact-preset-chip active" id="chip-amount-2500000" onClick={() => callApp('setCompactPresetAmount', 2500000)}>
                2,5 M
              </button>
              <button type="button" className="compact-preset-chip" id="chip-amount-5000000" onClick={() => callApp('setCompactPresetAmount', 5000000)}>
                5 M
              </button>
              <button type="button" className="compact-preset-chip" id="chip-amount-8000000" onClick={() => callApp('setCompactPresetAmount', 8000000)}>
                8 M
              </button>
              <button type="button" className="compact-preset-chip" id="chip-amount-12000000" onClick={() => callApp('setCompactPresetAmount', 12000000)}>
                12 M
              </button>
            </div>
          </div>

          <div className="compact-slider-group compact-slider-card">
            <div className="compact-slider-header">
              <span className="compact-slider-label">
                <i className="fas fa-calendar-days text-primary mr-1"></i> Durée de remboursement
              </span>
              <span className="compact-slider-val" id="compact-est-duration-val">
                12 Mois
              </span>
            </div>
            <input
              type="range"
              id="compact-est-duration-range"
              min={3}
              max={36}
              step={1}
              defaultValue={12}
              className="form-range compact-range-input"
              onInput={() => callApp('updateCompactEstimator')}
            />
            <div className="compact-range-ticks">
              <span>3 mois</span>
              <span>36 mois</span>
            </div>
            <div className="compact-presets-row">
              <button type="button" className="compact-preset-chip" id="chip-duration-6" onClick={() => callApp('setCompactPresetDuration', 6)}>
                6 mois
              </button>
              <button type="button" className="compact-preset-chip active" id="chip-duration-12" onClick={() => callApp('setCompactPresetDuration', 12)}>
                12 mois
              </button>
              <button type="button" className="compact-preset-chip" id="chip-duration-18" onClick={() => callApp('setCompactPresetDuration', 18)}>
                18 mois
              </button>
              <button type="button" className="compact-preset-chip" id="chip-duration-24" onClick={() => callApp('setCompactPresetDuration', 24)}>
                24 mois
              </button>
              <button type="button" className="compact-preset-chip" id="chip-duration-36" onClick={() => callApp('setCompactPresetDuration', 36)}>
                36 mois
              </button>
            </div>
          </div>
        </section>

        <section className="compact-estimator-step compact-estimator-outcome" aria-label="Résultat mensuel">
          <p className="compact-estimator-step-label">
            <span>2</span> Ce que vous payez chaque mois
          </p>
          <div className="compact-monthly-highlight">
            <div className="compact-monthly-label">Mensualité tout compris</div>
            <div className="compact-monthly-amount" id="compact-est-monthly-val">
              227 439 FCFA
            </div>
            <div className="compact-monthly-hint">
              <i className="fas fa-circle-check mr-1"></i> Remboursement constant • aucun frais caché
            </div>
          </div>
        </section>
        </div>
        <span id="compact-est-monthly-principal" hidden>
          208 333 FCFA
        </span>
        <span id="compact-est-monthly-interest" hidden>
          16 605 FCFA
        </span>
        <span id="compact-est-monthly-insurance" hidden>
          2 500 FCFA
        </span>

        <section className="compact-estimator-step compact-estimator-lifetime" aria-label="Coût total du prêt">
          <p className="compact-estimator-step-label">
            <span>3</span> Sur toute la durée du prêt
          </p>
          <div className="compact-composition-panel">
            <canvas id="compact-estimator-pie-chart" className="compact-pie-offscreen" width={80} height={80} aria-hidden="true"></canvas>
            <div className="compact-composition-body compact-composition-bars">
              <div className="compact-bar-row">
                <span className="compact-bar-label">
                  <span className="compact-pie-dot compact-dot-capital"></span>
                  Capital prêté <small>(<span id="compact-pie-pct-capital">92%</span>)</small>
                </span>
                <div className="compact-bar-track">
                  <span id="compact-bar-capital" className="compact-bar-fill compact-bar-capital" style={{ width: '92%' }} />
                </div>
                <strong id="compact-pie-val-capital">2 500 000 FCFA</strong>
              </div>
              <div className="compact-bar-row">
                <span className="compact-bar-label">
                  <span className="compact-pie-dot compact-dot-interest"></span>
                  Intérêts <small>(<span id="compact-pie-pct-interest">7%</span>)</small>
                </span>
                <div className="compact-bar-track">
                  <span id="compact-bar-interest" className="compact-bar-fill compact-bar-interest" style={{ width: '7%' }} />
                </div>
                <strong id="compact-pie-val-interest" className="compact-val-interest">
                  199 263 FCFA
                </strong>
              </div>
              <div className="compact-bar-row">
                <span className="compact-bar-label">
                  <span className="compact-pie-dot compact-dot-fees"></span>
                  Assurance &amp; frais <small>(<span id="compact-pie-pct-fees">1%</span>)</small>
                </span>
                <div className="compact-bar-track">
                  <span id="compact-bar-fees" className="compact-bar-fill compact-bar-fees" style={{ width: '1%' }} />
                </div>
                <strong id="compact-pie-val-fees" className="compact-val-fees">
                  30 000 FCFA
                </strong>
              </div>
            </div>
          </div>
          <div className="compact-lifetime-aside">
            <div className="compact-stats-row">
              <div className="compact-stat-item">
                <span className="compact-stat-label">Intérêts cumulés</span>
                <span className="compact-stat-val compact-val-interest" id="compact-est-total-interest">
                  199 263 FCFA
                </span>
              </div>
              <div className="compact-stat-item compact-stat-item-total">
                <span className="compact-stat-label">Total à rembourser</span>
                <span className="compact-stat-val" id="compact-est-total-val">
                  2 729 263 FCFA
                </span>
              </div>
            </div>
            <div className="compact-actions-row">
              <Button variant="success" className="btn-sm compact-action-primary" onClick={() => callApp('applyFromCompactEstimator')} title="Démarrer votre demande avec ces conditions personnalisées">
                <i className="fas fa-paper-plane mr-1"></i> Faire ma Demande de Prêt
              </Button>
            </div>
          </div>
        </section>
      </div>

      <div id="client-amortization-schedule-wrapper" style={{ display: 'none', marginTop: '1.25rem', borderTop: '1px dashed var(--border-color)', paddingTop: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              <i className="fas fa-calendar-check text-primary mr-1"></i> Tableau d&apos;Amortissement Simulé (
              <span id="amortization-table-summary-title">2 500 000 FCFA sur 12 Mois</span>)
            </h4>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              Échéancier prévisionnel complet avec ventilation du capital, des intérêts dégressifs et du solde restant dû.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="secondary" className="btn-sm" onClick={() => callApp('downloadSimulatedAmortizationPdf')} title="Exporter l'échéancier en format PDF">
              <i className="fas fa-file-pdf mr-1 text-danger"></i> Exporter PDF
            </Button>
            <Button variant="secondary" className="btn-sm" onClick={() => callApp('toggleAmortizationScheduleTable')} title="Masquer le tableau">
              <i className="fas fa-chevron-up mr-1"></i> Réduire
            </Button>
          </div>
        </div>
        <div className="table-responsive" style={{ maxHeight: 320, overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
          <table className="table-custom" style={{ fontSize: '0.78rem' }}>
            <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-surface)', zIndex: 2, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <tr>
                <th style={{ width: 70 }}>Mois</th>
                <th>Échéance</th>
                <th style={{ textAlign: 'right' }}>Solde Initial</th>
                <th style={{ textAlign: 'right' }}>Capital Amorti</th>
                <th style={{ textAlign: 'right' }}>Intérêts</th>
                <th style={{ textAlign: 'right' }}>Assurance</th>
                <th style={{ textAlign: 'right' }}>Mensualité Totale</th>
                <th style={{ textAlign: 'right' }}>Solde Restant Dû</th>
              </tr>
            </thead>
            <tbody id="client-amortization-table-body"></tbody>
            <tfoot id="client-amortization-table-foot" style={{ position: 'sticky', bottom: 0, background: 'var(--bg-surface)', fontWeight: 800, borderTop: '2px solid var(--border-color)' }}></tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
