import { Screen } from '@/shared/ui/Screen';
import { PageHeader } from '@/shared/ui/PageHeader';
import { StatCard } from '@/shared/ui/StatCard';
import { Button } from '@/shared/ui/Button';
import { callApp } from '@/shared/ui/legacy';

export function AgentClientsPage() {
  return (
    <Screen viewId="view-agent-clients">
      <PageHeader
        title={
          <>
            <i className="fas fa-users text-primary mr-2"></i> Portefeuille Emprunteurs & Sociétaires CreditFast
          </>
        }
        crumbs={['Espace Agent de Crédit', 'Gestion Relation Client & Suivi des Engagements']}
        actions={
          <>
            <Button variant="secondary" onClick={() => callApp('exportClientsCsv')}>
              <i className="fas fa-file-excel text-emerald mr-1"></i> Exporter Portefeuille (CSV)
            </Button>
            <Button onClick={() => callApp('openNewLoanModal')} title="Enregistrer une nouvelle demande de crédit au guichet">
              <i className="fas fa-file-circle-plus mr-1"></i> Enregistrer Nouvelle Demande
            </Button>
          </>
        }
      />

      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        <StatCard
          tone="primary"
          icon="fa-address-book"
          value="5"
          valueId="client-kpi-total"
          label="Clients Actifs dans l'Agence"
          trend={
            <>
              <i className="fas fa-arrow-up"></i> 100% Sociétaires CreditFast
            </>
          }
        />
        <StatCard
          tone="emerald"
          icon="fa-piggy-bank"
          value="4.67M"
          valueId="client-kpi-savings"
          label="Épargne CreditFast Mobilisée"
          trend={
            <>
              <i className="fas fa-coins"></i> Solde moyen : 935 000 F
            </>
          }
        />
        <StatCard
          tone="amber"
          icon="fa-hand-holding-dollar"
          value="9.3M"
          valueId="client-kpi-loans"
          label="Encours Brut de Crédits"
          trend={
            <>
              <i className="fas fa-chart-line"></i> PAR 30 : 0.0%
            </>
          }
        />
        <StatCard
          tone="purple"
          icon="fa-seedling"
          value="1"
          valueId="client-kpi-coldstart"
          label="Primo-Demandeur (Cold Start)"
          trend={
            <>
              <i className="fas fa-shield-heart"></i> Inclusion financière
            </>
          }
        />
      </div>

      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div
          className="card-body"
          style={{
            padding: '1rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }} id="clients-filter-buttons">
            <button type="button" className="btn btn-primary btn-sm" onClick={(event) => callApp('filterClientPortfolio', 'ALL', event.currentTarget)}>
              Tous les Membres (<span id="clients-count-all">5</span>)
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={(event) => callApp('filterClientPortfolio', 'COLD_START', event.currentTarget)}
              style={{ borderColor: '#518e45', color: '#1b4332', background: '#eef4ee' }}
            >
              <i className="fas fa-seedling text-emerald mr-1"></i> Primo-Demandeurs (Cold Start)
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={(event) => callApp('filterClientPortfolio', 'ACTIVE_LOAN', event.currentTarget)}>
              <i className="fas fa-file-invoice-dollar mr-1"></i> Crédit en Cours
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={(event) => callApp('filterClientPortfolio', 'VERIFIED', event.currentTarget)}>
              <i className="fas fa-check-circle text-emerald mr-1"></i> KYC Validé
            </button>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <div style={{ position: 'relative', minWidth: 250 }}>
              <input
                type="text"
                id="clients-search-input"
                className="form-control form-control-sm"
                placeholder="Recherche par nom, compte, ville, activité..."
                onInput={(event) => callApp('searchClientPortfolio', event.currentTarget.value)}
                style={{ paddingLeft: '2rem' }}
              />
              <i className="fas fa-search" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.8rem' }}></i>
            </div>
          </div>
        </div>
      </div>

      <div className="grid-3" id="agent-clients-grid" style={{ gap: '1.25rem' }}></div>
    </Screen>
  );
}
