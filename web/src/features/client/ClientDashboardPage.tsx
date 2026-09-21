import { useEffect, useState } from 'react';
import { Screen } from '@/shared/ui/Screen';
import { Button } from '@/shared/ui/Button';
import { callApp } from '@/shared/ui/legacy';
import { AppTable } from '@/shared/ui/AppTable';
import { getUiSession } from '@/app/session';
import { type CreditRequest } from '@/api/credit';
import { type Loan, type LoanRepayment } from '@/api/loans';
import { fetchClientProfile, savingsBalanceFromProfile, type ClientProfile } from '@/api/profile';
import { creditStatusLabel, formatDate, formatFcfa, loanStatusLabel, repaymentStatusLabel, REQUESTS_CHANGED_EVENT, PROFILE_CHANGED_EVENT } from '@/features/workflow/workflow';
import { isCommitteeGranted, loadGrantedClientLoans, loadLoanRepayments, pickPrimaryLoan } from '@/features/loans/granted';

export function ClientDashboardPage() {
  const session = getUiSession();
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [requests, setRequests] = useState<CreditRequest[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [repayments, setRepayments] = useState<LoanRepayment[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [nextProfile, granted] = await Promise.all([
          fetchClientProfile().catch(() => null),
          loadGrantedClientLoans(),
        ]);
        setProfile(nextProfile);
        setRequests(granted.requests);
        setLoans(granted.loans);
        const active = pickPrimaryLoan(granted.loans);
        if (active) {
          const schedule = await loadLoanRepayments(active);
          setRepayments(schedule.rows);
        } else {
          setRepayments([]);
        }
      } catch {
        setRequests([]);
        setLoans([]);
        setRepayments([]);
      }
    };
    void load();
    const onChange = () => void load();
    window.addEventListener(REQUESTS_CHANGED_EVENT, onChange);
    window.addEventListener(PROFILE_CHANGED_EVENT, onChange);
    return () => {
      window.removeEventListener(REQUESTS_CHANGED_EVENT, onChange);
      window.removeEventListener(PROFILE_CHANGED_EVENT, onChange);
    };
  }, []);

  const displayName = session?.name || profile?.user?.full_name || 'Demandeur';
  const memberNum = profile?.client_number || (session?.userId ? `#${session.userId}` : '—');
  const city = profile?.city || profile?.residential_zone || '';
  const occupation = profile?.occupation || '';
  const liveRequests = requests.filter((row) => (row.status || '').toUpperCase() !== 'REJECTED');
  const grantedRequest = requests.find((row) => isCommitteeGranted(row.status));
  const activeRequest =
    grantedRequest ?? liveRequests.find((row) => (row.status || '').toUpperCase() !== 'DRAFT') ?? liveRequests[0];
  const activeLoan = pickPrimaryLoan(loans);
  const nextDue = repayments.find((row) => (row.status || '').toUpperCase() !== 'PAID');
  const paidCount = repayments.filter((row) => (row.status || '').toUpperCase() === 'PAID').length;
  const financingAmount = activeLoan?.principal_amount ?? activeLoan?.funds_received ?? (grantedRequest?.approved_amount ?? grantedRequest?.requested_amount) ?? activeRequest?.requested_amount;
  const financingDuration = activeLoan?.duration_months ?? grantedRequest?.approved_duration_months ?? grantedRequest?.duration_months ?? activeRequest?.duration_months;
  const financingHint = activeLoan
    ? `${financingDuration ? `${financingDuration} mensualités` : 'Crédit accordé'} • ${loanStatusLabel(activeLoan.status)}`
    : grantedRequest
      ? `${financingDuration ? `${financingDuration} mois` : 'Crédit accordé'} • ${creditStatusLabel(grantedRequest.status)}`
      : activeRequest
        ? `${financingDuration ? `${financingDuration} mois` : 'Dossier ouvert'} • ${creditStatusLabel(activeRequest.status)}`
        : 'Aucun financement en cours';
  const nextDueLate = Boolean(nextDue && ((nextDue.status || '').toUpperCase() === 'LATE' || (nextDue.days_late ?? 0) > 0));
  const savingsAmount = savingsBalanceFromProfile(profile);

  return (
    <Screen viewId="view-role-client">
      <div className="borrower-welcome-banner">
        <div>
          <span
            className="badge badge-client"
            style={{ background: 'rgba(81, 142, 69, 0.2)', color: '#518e45', border: '1px solid rgba(81, 142, 69, 0.4)', marginBottom: '0.5rem' }}
          >
            <i className="fas fa-star mr-1"></i> Mon Espace Financement
          </span>
          <h2 style={{ fontSize: '1.6rem', marginBottom: '0.35rem', color: 'white' }}>
            Bienvenue, <span id="borrower-banner-name">{displayName}</span>
          </h2>
          <p style={{ color: '#cbd5e1', fontSize: '0.85rem', maxWidth: 600 }}>
            N° membre : <strong>{memberNum}</strong>
            {city ? ` • ${city}` : ''}
            {occupation ? ` • ${occupation}` : ''}
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

      <div className="borrower-metrics-grid">
        <div className="borrower-metric-box">
          <div className="borrower-metric-icon" style={{ background: 'var(--cif-primary-50)', color: 'var(--cif-primary-600)' }}>
            <i className="fas fa-hand-holding-dollar"></i>
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 700 }}>Mon financement en cours</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, fontFamily: 'var(--font-family-code)' }}>{formatFcfa(financingAmount)}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--cif-emerald-500)', fontWeight: 600 }}>{financingHint}</div>
          </div>
        </div>
        <div className="borrower-metric-box">
          <div className="borrower-metric-icon" style={{ background: 'var(--cif-gold-50)', color: 'var(--cif-gold-600)' }}>
            <i className="fas fa-calendar-check"></i>
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 700 }}>Mon prochain règlement</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, fontFamily: 'var(--font-family-code)', color: 'var(--cif-gold-700)' }}>
              {nextDue ? formatFcfa(nextDue.expected_amount ?? nextDue.remaining_amount) : '—'}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>
              {nextDue?.due_date ? (
                <>
                  À régler le {formatDate(nextDue.due_date)}
                  {' • '}
                  <span style={{ color: nextDueLate ? '#b45309' : '#518e45', fontWeight: 600 }}>
                    {nextDueLate ? `${nextDue.days_late ?? 0} j de retard` : 'Aucun retard'}
                  </span>
                </>
              ) : (
                'Aucune échéance à régler'
              )}
            </div>
          </div>
        </div>
        <div className="borrower-metric-box">
          <div className="borrower-metric-icon" style={{ background: 'var(--cif-emerald-50)', color: 'var(--cif-emerald-600)' }}>
            <i className="fas fa-piggy-bank"></i>
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 700 }}>Mon épargne</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, fontFamily: 'var(--font-family-code)', color: 'var(--cif-emerald-700)' }}>
              {formatFcfa(savingsAmount)}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--cif-emerald-500)' }}>
              {savingsAmount != null ? 'Compte enregistré par votre chargé' : 'Aucun compte d’épargne enregistré'}
            </div>
          </div>
        </div>
      </div>

      {loans.length || grantedRequest ? (
        <div className="card" style={{ marginBottom: '1.25rem', borderColor: 'rgba(81, 142, 69, 0.35)', background: 'rgba(81, 142, 69, 0.08)' }}>
          <div className="card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <strong>Crédit accordé par le comité</strong>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                {formatFcfa(financingAmount)}
                {financingDuration ? ` sur ${financingDuration} mois` : ''}. Consultez l’échéancier à régler.
              </p>
            </div>
            <Button onClick={() => callApp('switchView', 'view-client-schedule')}>
              <i className="fas fa-calendar-days mr-1"></i> Voir l’échéancier
            </Button>
          </div>
        </div>
      ) : null}

      {(activeRequest?.status || '').toUpperCase() === 'VERIFICATION_REQUIRED' ? (
        <div className="card" style={{ marginBottom: '1.25rem', borderColor: 'rgba(180, 83, 9, 0.35)', background: 'rgba(255, 152, 0, 0.08)' }}>
          <div className="card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <strong>L’agent attend des compléments</strong>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                Joignez la pièce ou la garantie manquante. Le dossier sera renvoyé à l’agent dès que le dossier est complet.
              </p>
            </div>
            <Button onClick={() => callApp('switchView', 'view-client-documents')}>
              <i className="fas fa-cloud-arrow-up mr-1"></i> Joindre une pièce
            </Button>
          </div>
        </div>
      ) : null}

      <div className="card" style={{ marginTop: '1.25rem', marginBottom: '1.5rem' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <i className="fas fa-route text-primary"></i> Dossier en cours
            </h3>
            <p className="card-subtitle">
              {activeRequest ? activeRequest.purpose || `Dossier #${activeRequest.id}` : 'Aucune demande en base pour le moment.'}
            </p>
          </div>
          {activeRequest ? (
            <span className="badge badge-analysis">{creditStatusLabel(activeRequest.status)}</span>
          ) : null}
        </div>
        <div className="card-body">
          {activeRequest ? (
            <div className="loan-progress-stepper">
              <DashStep completed={Boolean(activeRequest.created_at)} label="1. Demande" meta={formatDate(activeRequest.created_at)} />
              <DashStep
                completed={Boolean(activeRequest.submitted_at) && (activeRequest.status || '').toUpperCase() !== 'DRAFT'}
                active={(activeRequest.status || '').toUpperCase() === 'DRAFT'}
                label="2. Chez l’agent"
                meta={activeRequest.submitted_at ? formatDate(activeRequest.submitted_at) : 'À envoyer'}
              />
              <DashStep
                completed={!['DRAFT', 'VERIFICATION_REQUIRED'].includes((activeRequest.status || '').toUpperCase()) && Boolean(activeRequest.submitted_at)}
                active={(activeRequest.status || '').toUpperCase() === 'VERIFICATION_REQUIRED'}
                label="3. Pièces & conformité"
                meta={(activeRequest.status || '').toUpperCase() === 'VERIFICATION_REQUIRED' ? 'Compléments demandés' : 'Lecture des pièces'}
              />
              <DashStep
                completed={['ANALYSIS', 'IN_ANALYSIS', 'COMMITTEE', 'APPROVED', 'AMENDED'].includes((activeRequest.status || '').toUpperCase())}
                active={['SUBMITTED', 'RECEIVED', 'UNDER_REVIEW'].includes((activeRequest.status || '').toUpperCase())}
                label="4. Contrôle terrain"
                meta="Agent"
              />
              <DashStep
                completed={['COMMITTEE', 'APPROVED', 'AMENDED'].includes((activeRequest.status || '').toUpperCase())}
                active={(activeRequest.status || '').toUpperCase().includes('ANALY')}
                number="5"
                label="5. Analyste"
                meta="—"
              />
              <DashStep
                completed={isCommitteeGranted(activeRequest.status) || (activeLoan?.status || '').toUpperCase() === 'ACTIVE'}
                active={(activeRequest.status || '').toUpperCase().includes('COMMITTEE')}
                number="6"
                label="6. Comité"
                meta={isCommitteeGranted(activeRequest.status) ? 'Accordé' : activeLoan ? formatFcfa(activeLoan.funds_received) : '—'}
              />
            </div>
          ) : (
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.86rem' }}>
              Déposez une demande pour suivre ici son parcours réel.
            </p>
          )}
        </div>
      </div>

      <CompactEstimator />

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <i className="fas fa-calendar-check text-primary"></i> Échéancier
              </h3>
              <p className="card-subtitle">
                {activeLoan ? `${paidCount}/${repayments.length || activeLoan.duration_months || 0} mensualités` : 'Aucun crédit accordé'}
              </p>
            </div>
            <Button variant="secondary" className="btn-sm" onClick={() => callApp('switchView', 'view-client-schedule')}>
              <i className="fas fa-arrow-right"></i> Voir l&apos;échéancier
            </Button>
          </div>
          {repayments.length ? (
            <AppTable
              chrome="plain"
              className="cf-table-compact"
              title=""
              searchable={false}
              showMenu={false}
              items={repayments.slice(0, 6).map((row) => ({ ...row, id: String(row.id) }))}
              columns={[
                { id: 'due', label: 'Échéance', isRowHeader: true, render: (row) => formatDate(row.due_date) },
                { id: 'amount', label: 'Montant', render: (row) => formatFcfa(row.expected_amount) },
                { id: 'status', label: 'Statut', render: (row) => repaymentStatusLabel(row.status) },
              ]}
            />
          ) : (
            <div className="card-body">
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.84rem' }}>Pas encore d’échéances en base.</p>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <i className="fas fa-user-tie text-emerald"></i> Conseiller
              </h3>
              <p className="card-subtitle">Assignation dès qu’un chargé est lié à votre dossier</p>
            </div>
            <Button variant="secondary" className="btn-sm" onClick={() => callApp('switchView', 'view-client-advisor')}>
              <i className="fas fa-comment-dots"></i> Espace conseiller
            </Button>
          </div>
          <div className="card-body">
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.84rem' }}>
              Aucun conseiller n’est encore rattaché à ce compte.
            </p>
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
                <i className="fas fa-bolt mr-1"></i> Calcul du dossier
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '3px 0 0 0' }}>
              Ajustez le montant et la durée pour visualiser en temps réel vos mensualités, les intérêts totaux et le tableau d&apos;amortissement détaillé.
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="badge badge-approved" style={{ fontSize: '0.72rem' }}>
            <i className="fas fa-shield-halved mr-1"></i> Mensualités du dossier
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
              —
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
