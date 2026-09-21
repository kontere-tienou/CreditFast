import { Screen } from '@/shared/ui/Screen';
import { Button } from '@/shared/ui/Button';
import { callApp } from '@/shared/ui/legacy';

export function ClientSimulatorPage() {
  return (
    <Screen viewId="view-client-simulator">
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <i className="fas fa-calculator text-primary mr-2"></i> Simulateur de Crédit & Capacité d&apos;Emprunt
          </h2>
          <p className="page-subtitle">Estimez vos mensualités et votre reste à vivre, puis déposez la demande avec ces montants</p>
        </div>
        <div className="page-actions">
          <Button onClick={() => callApp('applyFromSimulation')}>
            <i className="fas fa-paper-plane"></i> Postuler avec cette Simulation
          </Button>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1.5rem' }}>
          <div className="card-header" style={{ padding: '0 0 1rem 0', marginBottom: '1.25rem' }}>
            <h3 className="card-title">
              <i className="fas fa-sliders text-primary"></i> Paramètres du Microcrédit
            </h3>
          </div>

          <SimRange id="sim-amount-range" labelId="sim-amount-label" label="Montant du Prêt (FCFA)" min={200000} max={10000000} step={50000} defaultValue={2500000} ticks={['200 000 FCFA', '5 000 000 FCFA', '10 000 000 FCFA']} />
          <SimRange id="sim-duration-range" labelId="sim-duration-label" label="Durée de Remboursement" min={3} max={36} step={1} defaultValue={12} ticks={['3 Mois', '12 Mois', '24 Mois', '36 Mois']} />

          <div style={{ background: 'var(--bg-body)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <i className="fas fa-coins text-gold"></i> Revenus et charges (reste à vivre)
            </div>
            <div className="grid-2" style={{ gap: '0.75rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.72rem' }}>
                  Revenu net mensuel
                </label>
                <input
                  type="number"
                  id="sim-income-input"
                  className="form-control"
                  placeholder="0"
                  style={{ fontSize: '0.82rem' }}
                  onInput={(event) => {
                    event.currentTarget.dataset.userEdited = '1';
                    callApp('updateClientSimulation');
                  }}
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.72rem' }}>
                  Charges et crédits en cours
                </label>
                <input
                  type="number"
                  id="sim-charges-input"
                  className="form-control"
                  placeholder="0"
                  style={{ fontSize: '0.82rem' }}
                  onInput={(event) => {
                    event.currentTarget.dataset.userEdited = '1';
                    callApp('updateClientSimulation');
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-body) 100%)' }}>
          <div>
            <div className="card-header" style={{ padding: '0 0 1rem 0', marginBottom: '1.25rem' }}>
              <div>
                <h3 className="card-title">
                  <i className="fas fa-receipt text-emerald"></i> Résultats de la Simulation
                </h3>
                <div style={{ fontSize: '0.73rem', color: 'var(--emerald)', fontWeight: 600 }} id="sim-scoring-mode-label">
                  Comparaison calculée pour votre dossier
                </div>
              </div>
              <span className="badge badge-info" id="sim-eligibility-badge">
                En attente du calcul
              </span>
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '2px solid var(--primary-300)', textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mensualité TTC Estimée</div>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--primary-700)', fontFamily: 'var(--font-family-code)', margin: '0.25rem 0' }} id="sim-monthly-output">
                —
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Mensualité calculée selon le montant et la durée choisis</div>
            </div>

            <div id="sim-compare-list" style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
              <p style={{ margin: 0, fontSize: '0.76rem', color: 'var(--text-muted)' }}>Autres durées à comparer…</p>
            </div>

            <div style={{ fontSize: '0.82rem', lineHeight: 2, color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              <SimRow label="Capital emprunté :" id="sim-capital-output" value="—" />
              <SimRow label="Intérêts :" id="sim-interest-output" value="—" />
              <SimRow label="Frais et assurance :" id="sim-fees-output" value="—" />
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border-color)', paddingTop: 4, fontWeight: 700 }}>
                <span style={{ color: 'var(--text-primary)' }}>Coût total :</span>
                <strong style={{ color: 'var(--primary-700)' }} id="sim-total-cost-output">
                  —
                </strong>
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <i className="fas fa-chart-pie text-primary"></i> Répartition Visuelle du Remboursement
                </div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-subtle)' }}>Graphique Circulaire Dynamique</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: '1rem' }}>
                <div style={{ position: 'relative', width: 110, height: 110, flexShrink: 0 }}>
                  <canvas id="sim-breakdown-pie-chart" width={110} height={110}></canvas>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                    <span id="sim-pie-center-val" style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-700)', fontFamily: 'var(--font-family-code)' }}>
                      100%
                    </span>
                  </div>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.75rem' }}>
                  <PieLegend color="#1b4332" label="Capital" pctId="sim-pie-capital-pct" valId="sim-pie-capital-val" pct="—" value="—" />
                  <PieLegend color="#ff9800" label="Intérêts" pctId="sim-pie-interest-pct" valId="sim-pie-interest-val" pct="—" value="—" valueColor="#ff9800" />
                  <PieLegend color="#518e45" label="Frais" pctId="sim-pie-fees-pct" valId="sim-pie-fees-val" pct="—" value="—" valueColor="#518e45" />
                </div>
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
              <div style={{ width: '100%', height: 8, background: 'var(--bg-body)', borderRadius: 'var(--radius-full)', overflow: 'hidden', marginBottom: '0.5rem' }}>
                <div id="sim-ratio-bar" style={{ width: '0%', height: '100%', background: '#518e45', borderRadius: 'var(--radius-full)', transition: 'width 0.3s ease' }}></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                <span>Reste à vivre estimé :</span>
                <strong id="sim-rest-to-live-output" style={{ color: '#1b4332', fontFamily: 'var(--font-family-code)' }}>
                  —
                </strong>
              </div>
            </div>
          </div>

          <Button variant="success" className="btn-lg" style={{ width: '100%', justifyContent: 'center' }} onClick={() => callApp('applyFromSimulation')}>
            <i className="fas fa-file-circle-check mr-2"></i> Déposer ma Demande avec cette Simulation
          </Button>
        </div>
      </div>
    </Screen>
  );
}

function SimRange({
  id,
  labelId,
  label,
  min,
  max,
  step,
  defaultValue,
  ticks,
}: {
  id: string;
  labelId: string;
  label: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  ticks: string[];
}) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <label style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>{label}</label>
        <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-700)', fontFamily: 'var(--font-family-code)' }} id={labelId}>
          —
        </span>
      </div>
      <input type="range" id={id} min={min} max={max} step={step} defaultValue={defaultValue} className="form-range" style={{ width: '100%', cursor: 'pointer' }} onInput={() => callApp('updateClientSimulation')} />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-subtle)', marginTop: 4 }}>
        {ticks.map((tick) => (
          <span key={tick}>{tick}</span>
        ))}
      </div>
    </div>
  );
}

function SimRow({ label, id, value }: { label: string; id: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span>{label}</span>
      <strong style={{ color: 'var(--text-primary)' }} id={id}>
        {value}
      </strong>
    </div>
  );
}

function PieLegend({
  color,
  label,
  pctId,
  valId,
  pct,
  value,
  valueColor,
}: {
  color: string;
  label: string;
  pctId: string;
  valId: string;
  pct: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, display: 'inline-block' }}></span>
        {label} (<span id={pctId}>{pct}</span>)
      </span>
      <strong style={{ color: valueColor ?? 'var(--text-primary)', fontFamily: 'var(--font-family-code)' }} id={valId}>
        {value}
      </strong>
    </div>
  );
}
