import { Screen } from '@/shared/ui/Screen';
import { PageHeader } from '@/shared/ui/PageHeader';
import { StatCard } from '@/shared/ui/StatCard';
import { Button } from '@/shared/ui/Button';
import { callApp } from '@/shared/ui/legacy';
import { CommitteeDossiersTable } from '@/shared/tables/registry';

export function CommitteeDossiersPage() {
  return (
    <Screen viewId="view-committee-dossiers">
      <PageHeader
        title={
          <>
            <i className="fas fa-folder-tree text-primary mr-1"></i> Dossiers à Délibérer & Votes
          </>
        }
        crumbs={['Instance Décisionnaire', 'Séance Active • Examen Collégial & Décisions d\'Octroi']}
        actions={
          <>
            <Button variant="secondary" className="btn-sm" onClick={() => callApp('switchView', 'view-role-committee')} title="Retour au tableau de bord des délibérations">
              <i className="fas fa-chart-pie"></i> Vue Synthèse
            </Button>
            <Button variant="secondary" className="btn-sm" onClick={() => callApp('switchView', 'view-committee-signed')} title="Consulter les PV signés et les résolutions">
              <i className="fas fa-file-signature"></i> Registre des PV
            </Button>
            <Button className="btn-sm" onClick={() => callApp('openFirstPendingCommitteeVote')} title="Ouvrir la délibération du premier dossier en attente">
              <i className="fas fa-gavel"></i> Voter le Dossier Suivant
            </Button>
          </>
        }
      />

      <div className="grid-4" style={{ marginBottom: '1.25rem' }}>
        <StatCard
          tone="primary"
          icon="fa-vault"
          value="18.5 M"
          valueId="com-kpi-total-amount"
          label="Enveloppe Soumise"
          title="Afficher tous les dossiers de la séance"
          onClick={() => callApp('filterCommitteeDossiers', 'ALL', document.getElementById('tab-btn-com-all'))}
          trend={
            <>
              <i className="fas fa-list-check"></i> <span id="com-kpi-total-count">5</span> dossiers UEMOA
            </>
          }
        />
        <StatCard
          tone="amber"
          icon="fa-gavel"
          value="2"
          valueId="com-kpi-pending-count"
          label="En Attente de Vote"
          trendUp={false}
          title="Filtrer les dossiers nécessitant un vote"
          onClick={() => callApp('filterCommitteeDossiers', 'PENDING_VOTE', document.getElementById('tab-btn-com-pending'))}
          trend={
            <>
              <i className="fas fa-hourglass-half"></i> Décision requise
            </>
          }
        />
        <StatCard
          tone="emerald"
          icon="fa-file-signature"
          value="3"
          valueId="com-kpi-approved-count"
          label="Validés en Séance"
          title="Consulter les dossiers approuvés"
          onClick={() => callApp('filterCommitteeDossiers', 'ALL', document.getElementById('tab-btn-com-all'))}
          trend={
            <>
              <i className="fas fa-check-double"></i> PV générés
            </>
          }
        />
        <StatCard
          tone="purple"
          icon="fa-landmark"
          value="100%"
          label="Quorum & Consensus"
          title="Statut du Quorum et présence des membres"
          trend={
            <>
              <i className="fas fa-users-between-lines"></i> 3/3 Membres actifs
            </>
          }
        />
      </div>

      <div
        className="card"
        style={{
          padding: '1.1rem 1.4rem',
          marginBottom: '1.25rem',
          background: 'linear-gradient(135deg, rgba(27, 67, 50, 0.05) 0%, rgba(139, 92, 246, 0.08) 100%)',
          border: '1px solid rgba(139, 92, 246, 0.2)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 'var(--radius-md)',
                background: '#8b5cf6',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.3rem',
                boxShadow: 'var(--shadow-sm)',
                flexShrink: 0,
              }}
            >
              <i className="fas fa-landmark"></i>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Séance Ordinaire N° COM-2026-08/BKO</h3>
                <span className="badge badge-approved" style={{ fontSize: '0.7rem' }}>
                  <i className="fas fa-circle-dot mr-1"></i> Quorum Atteint (3/3 Présents)
                </span>
                <span className="badge badge-committee" style={{ fontSize: '0.7rem' }}>
                  Caisse Régionale Bamako
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '3px 0 0 0' }}>
                Présidence : <strong>Mariam Keita</strong> • Membres : Direction des Engagements & Responsable Risque • Décisions souveraines UEMOA
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ textAlign: 'right', paddingRight: '0.75rem', borderRight: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Enveloppe Séance</div>
              <div id="com-session-total-amount" style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--primary-700)', fontFamily: 'var(--font-family-code)' }}>
                18 500 000 F
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Dossiers Votés</div>
              <div id="com-session-voted-ratio" style={{ fontSize: '1.15rem', fontWeight: 900, color: '#518e45', fontFamily: 'var(--font-family-code)' }}>
                3 / 5
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.85rem' }}>
          <div id="com-dossiers-filter-tabs" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-primary btn-sm" id="tab-btn-com-all" onClick={(event) => callApp('filterCommitteeDossiers', 'ALL', event.currentTarget)}>
              <i className="fas fa-list-ul"></i> Tous les dossiers (<span id="count-tab-all">5</span>)
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              id="tab-btn-com-pending"
              onClick={(event) => callApp('filterCommitteeDossiers', 'PENDING_VOTE', event.currentTarget)}
            >
              <i className="fas fa-hourglass-half text-warning"></i> En attente de vote (<span id="count-tab-pending">2</span>)
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              id="tab-btn-com-favorable"
              onClick={(event) => callApp('filterCommitteeDossiers', 'FAVORABLE', event.currentTarget)}
            >
              <i className="fas fa-thumbs-up text-emerald"></i> Avis Favorable (<span id="count-tab-favorable">4</span>)
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              id="tab-btn-com-coldstart"
              onClick={(event) => callApp('filterCommitteeDossiers', 'COLD_START', event.currentTarget)}
            >
              <i className="fas fa-shield-halved text-info"></i> Profils Cold Start (<span id="count-tab-coldstart">2</span>)
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, maxWidth: 380, minWidth: 240 }}>
            <div className="form-group" style={{ margin: 0, width: '100%', position: 'relative' }}>
              <input
                type="text"
                id="com-dossiers-search-input"
                className="form-control"
                placeholder="Rechercher emprunteur, #REQ, agence..."
                onInput={(event) => callApp('searchCommitteeDossiers', event.currentTarget.value)}
                style={{ paddingLeft: '2rem', fontSize: '0.82rem' }}
              />
              <i className="fas fa-search" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.8rem' }}></i>
            </div>
          </div>
        </div>
      </div>

      <CommitteeDossiersTable />
    </Screen>
  );
}
