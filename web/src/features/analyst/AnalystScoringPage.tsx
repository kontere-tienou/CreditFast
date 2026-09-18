import { Screen } from '@/shared/ui/Screen';
import { PageHeader } from '@/shared/ui/PageHeader';
import { callApp } from '@/shared/ui/legacy';
import { ScoringColdStartTable, ScoringStandardTable } from '@/shared/tables/registry';

export function AnalystScoringPage() {
  return (
    <Screen viewId="view-scoring-admin">
      <PageHeader title="Administration des Modèles de Scoring" crumbs={['Gouvernance des Algorithmes', 'Modèle Standard vs Cold Start (Inclusion)']} />

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <i className="fas fa-code-branch text-primary"></i> Modèle Standard{' '}
              </h3>
              <p className="card-subtitle">Actif • Pour clients avec historique bancaire ou d&apos;épargne</p>
            </div>
            <span className="badge badge-approved">ACTIF</span>
          </div>
          <div className="card-body">
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted-dark)', marginBottom: '1rem' }}>
              Ce modèle utilise l&apos;intégralité des 10 sous-scores incluant la discipline d&apos;épargne CreditFast et l&apos;historique réel des remboursements.
            </div>
            <ScoringStandardTable />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <i className="fas fa-seedling text-emerald"></i> Modèle Cold Start Inclusion{' '}
              </h3>
              <p className="card-subtitle">Actif • Pour primo-demandeurs sans antécédents financiers</p>
            </div>
            <span className="badge badge-approved">ACTIF</span>
          </div>
          <div className="card-body">
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted-dark)', marginBottom: '1rem' }}>
              <i className="fas fa-balance-scale text-primary"></i> <strong>Règle fondamentale :</strong>{' '}
              <em>Absence d&apos;historique ≠ Mauvais historique</em>. Les poids sont redistribués sur la capacité nette, l&apos;activité et les garanties/cautions
              solidaires.
            </div>
            <ScoringColdStartTable />
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <i className="fas fa-microchip text-primary"></i> Banc d&apos;Essai Interactif : Modèle Standard vs Cold Start
            </h3>
            <p className="card-subtitle">Testez en direct l&apos;impact de la redistribution des pondérations pour un emprunteur primo-demandeur sans antécédents</p>
          </div>
          <span className="badge badge-warning">
            <i className="fas fa-bolt"></i> Calcul Temps Réel
          </span>
        </div>
        <div className="card-body">
          <div className="grid-2" style={{ gap: '1.5rem', alignItems: 'center' }}>
            <div>
              <SimSlider id="cs-sim-cap" label="Capacité Nette (Reste à vivre / Mensualité) :" valueId="cs-sim-cap-val" defaultValue="2.2" min="0.5" max="3.5" step="0.1" />
              <SimSlider id="cs-sim-act" label="Ancienneté & Stabilité du Commerce :" valueId="cs-sim-act-val" defaultValue="4" min="0.5" max="10" step="0.5" />
              <SimSlider id="cs-sim-gar" label="Couverture Caution Solidaire / Matériel :" valueId="cs-sim-gar-val" defaultValue="100" min="0" max="150" step="10" />
              <SimSlider id="cs-sim-ocr" label="Conformité KYC & Rapprochement OCR :" valueId="cs-sim-ocr-val" defaultValue="95" min="40" max="100" step="5" last />
            </div>

            <div style={{ background: 'var(--bg-body)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
              <div className="grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-subtle)', fontWeight: 700 }}>Modèle Standard (Sans Antécédents)</div>
                  <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#ef4444', margin: '0.3rem 0' }} id="cs-sim-std-score">
                    48<span style={{ fontSize: '1rem', color: 'var(--text-subtle)' }}>/100</span>
                  </div>
                  <span className="badge badge-rejected" id="cs-sim-std-badge">
                    Pénalisé (Zéro antécédent)
                  </span>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', marginTop: 6 }}>Poids crédit & épargne = 0 pts</div>
                </div>
                <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '2px solid #518e45', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#1b4332', fontWeight: 700 }}>Modèle Cold Start (Inclusion)</div>
                  <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#518e45', margin: '0.3rem 0' }} id="cs-sim-cs-score">
                    78<span style={{ fontSize: '1rem', color: 'var(--text-subtle)' }}>/100</span>
                  </div>
                  <span className="badge badge-approved" id="cs-sim-cs-badge">
                    <i className="fas fa-check"></i> Éligible Comité
                  </span>
                  <div style={{ fontSize: '0.7rem', color: '#1b4332', fontWeight: 600, marginTop: 6 }} id="cs-sim-gain-badge">
                    +30 pts d&apos;Inclusion
                  </div>
                </div>
              </div>
              <div
                style={{
                  background: 'rgba(81, 142, 69, 0.08)',
                  borderLeft: '3px solid #518e45',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '0 var(--radius-md) var(--radius-md) 0',
                  fontSize: '0.74rem',
                  color: 'var(--text-muted-dark)',
                }}
              >
                <strong>Démonstration d&apos;équité algorithmique :</strong> En désactivant la pénalisation d&apos;absence d&apos;historique et en accordant une prime au
                Reste à Vivre certifié et aux cautions de proximité, le candidat accède au financement sans dégrader le risque global.
              </div>
            </div>
          </div>
        </div>
      </div>
    </Screen>
  );
}

function SimSlider({
  id,
  label,
  valueId,
  defaultValue,
  min,
  max,
  step,
  last,
}: {
  id: string;
  label: string;
  valueId: string;
  defaultValue: string;
  min: string;
  max: string;
  step: string;
  last?: boolean;
}) {
  return (
    <div style={{ marginBottom: last ? 0 : '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
        <span>{label}</span>
        <span id={valueId} style={{ color: 'var(--primary-700)' }}>
          —
        </span>
      </div>
      <input
        type="range"
        id={id}
        min={min}
        max={max}
        step={step}
        defaultValue={defaultValue}
        className="form-range"
        style={{ width: '100%', cursor: 'pointer' }}
        onInput={() => callApp('updateColdStartComparisonSim')}
      />
    </div>
  );
}
