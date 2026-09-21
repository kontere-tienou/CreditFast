import { useEffect, useState, type FormEvent } from 'react';
import { toast } from '@heroui/react';
import {
  ACCOUNT_TRANSACTION_TYPES,
  FINANCIAL_ACCOUNT_TYPES,
  accountTypeLabel,
  agentClientName,
  getAgentClient,
  isApiError,
  storeAccountTransaction,
  storeClientFinancialAccount,
  storeClientSavingsHistory,
  transactionTypeLabel,
  type AgentClient,
  type FinancialAccount,
  type SavingsHistory,
} from '@/api';
import { Button } from '@/shared/ui/Button';
import { CfSelect } from '@/shared/ui/CfSelect';
import { formatDate, formatFcfa } from '@/features/workflow/workflow';

type AgentClientSheetProps = {
  clientId: number | null;
  onClose: () => void;
  onChanged?: () => void;
};

type Panel = 'none' | 'account' | 'transaction' | 'savings';

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function firstOfMonthIso() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
}

function num(value: string) {
  const parsed = Number(String(value).replace(/\s/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function AgentClientSheet({ clientId, onClose, onChanged }: AgentClientSheetProps) {
  const [client, setClient] = useState<AgentClient | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [panel, setPanel] = useState<Panel>('none');

  const [accountNumber, setAccountNumber] = useState('');
  const [accountType, setAccountType] = useState<string>('EPARGNE');
  const [accountBalance, setAccountBalance] = useState('');
  const [accountOpened, setAccountOpened] = useState('');

  const [txAccountId, setTxAccountId] = useState<number | ''>('');
  const [txType, setTxType] = useState<string>('DEPOSIT');
  const [txAmount, setTxAmount] = useState('');
  const [txDate, setTxDate] = useState(todayIso());
  const [txReference, setTxReference] = useState('');
  const [txDescription, setTxDescription] = useState('');

  const [svAccountId, setSvAccountId] = useState<number | ''>('');
  const [svStart, setSvStart] = useState(firstOfMonthIso());
  const [svEnd, setSvEnd] = useState(todayIso());
  const [svDeposits, setSvDeposits] = useState('');
  const [svWithdrawals, setSvWithdrawals] = useState('');
  const [svDepositCount, setSvDepositCount] = useState('');
  const [svWithdrawalCount, setSvWithdrawalCount] = useState('');
  const [svAverage, setSvAverage] = useState('');
  const [svClosing, setSvClosing] = useState('');

  const accounts: FinancialAccount[] = client?.financial_accounts ?? [];
  const histories: SavingsHistory[] = [...(client?.savings_histories ?? [])].sort((a, b) =>
    String(b.period_end ?? '').localeCompare(String(a.period_end ?? '')),
  );

  const reload = async (id: number) => {
    setLoading(true);
    try {
      const next = await getAgentClient(id);
      setClient(next);
    } catch (error) {
      toast.danger(isApiError(error) ? error.message : 'Fiche client indisponible.');
      setClient(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!clientId) {
      setClient(null);
      setPanel('none');
      return;
    }
    setPanel('none');
    void reload(clientId);
  }, [clientId]);

  if (!clientId) {
    return null;
  }

  const resetAccountForm = () => {
    setAccountNumber('');
    setAccountType('EPARGNE');
    setAccountBalance('');
    setAccountOpened('');
  };

  const resetTxForm = () => {
    setTxType('DEPOSIT');
    setTxAmount('');
    setTxDate(todayIso());
    setTxReference('');
    setTxDescription('');
  };

  const resetSavingsForm = () => {
    setSvStart(firstOfMonthIso());
    setSvEnd(todayIso());
    setSvDeposits('');
    setSvWithdrawals('');
    setSvDepositCount('');
    setSvWithdrawalCount('');
    setSvAverage('');
    setSvClosing('');
  };

  const afterSave = async (message: string) => {
    toast.success(message);
    setPanel('none');
    await reload(clientId);
    onChanged?.();
  };

  const submitAccount = async (event: FormEvent) => {
    event.preventDefault();
    if (!accountNumber.trim()) {
      toast.warning('Indiquez le numéro du compte.');
      return;
    }
    setSaving(true);
    try {
      await storeClientFinancialAccount(clientId, {
        account_number: accountNumber.trim(),
        account_type: accountType,
        balance: accountBalance === '' ? null : num(accountBalance),
        opened_at: accountOpened || null,
        status: 'ACTIVE',
      });
      resetAccountForm();
      await afterSave('Compte enregistré sur la fiche.');
    } catch (error) {
      toast.danger(isApiError(error) ? error.message : 'Impossible d’enregistrer ce compte.');
    } finally {
      setSaving(false);
    }
  };

  const submitTransaction = async (event: FormEvent) => {
    event.preventDefault();
    if (!txAccountId) {
      toast.warning('Choisissez le compte concerné.');
      return;
    }
    if (!(num(txAmount) > 0)) {
      toast.warning('Indiquez le montant du mouvement.');
      return;
    }
    if (!txDate) {
      toast.warning('Indiquez la date du mouvement.');
      return;
    }
    setSaving(true);
    try {
      await storeAccountTransaction(Number(txAccountId), {
        transaction_type: txType,
        amount: num(txAmount),
        transaction_date: txDate,
        reference: txReference.trim() || null,
        description: txDescription.trim() || null,
      });
      resetTxForm();
      await afterSave('Mouvement enregistré.');
    } catch (error) {
      toast.danger(isApiError(error) ? error.message : 'Impossible d’enregistrer ce mouvement.');
    } finally {
      setSaving(false);
    }
  };

  const submitSavings = async (event: FormEvent) => {
    event.preventDefault();
    if (!svStart || !svEnd) {
      toast.warning('Indiquez la période couverte.');
      return;
    }
    if (svEnd < svStart) {
      toast.warning('La fin de période doit suivre le début.');
      return;
    }
    if (svAverage === '' || svClosing === '') {
      toast.warning('Indiquez le solde moyen et le solde de fin de période.');
      return;
    }
    setSaving(true);
    try {
      await storeClientSavingsHistory(clientId, {
        account_id: svAccountId ? Number(svAccountId) : null,
        period_start: svStart,
        period_end: svEnd,
        total_deposits: num(svDeposits),
        total_withdrawals: num(svWithdrawals),
        deposit_count: Math.max(0, Math.round(num(svDepositCount))),
        withdrawal_count: Math.max(0, Math.round(num(svWithdrawalCount))),
        average_balance: num(svAverage),
        closing_balance: num(svClosing),
      });
      resetSavingsForm();
      await afterSave('Synthèse d’épargne enregistrée. Le dossier sera évalué avec l’historique du membre.');
    } catch (error) {
      toast.danger(isApiError(error) ? error.message : 'Impossible d’enregistrer la synthèse.');
    } finally {
      setSaving(false);
    }
  };

  const name = client ? agentClientName(client) : `Client #${clientId}`;
  const kyc = (client?.kyc_status || '').toUpperCase();

  return (
    <div className="cf-app-modal-backdrop" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div className="cf-app-modal" role="dialog" aria-modal="true" aria-labelledby="agent-client-sheet-title" style={{ maxWidth: 760 }} onClick={(event) => event.stopPropagation()}>
        <div className="cf-app-modal-header">
          <div className="cf-app-modal-header-main">
            <div className="cf-app-modal-icon">
              <i className="fas fa-id-card"></i>
            </div>
            <div className="min-w-0">
              <h3 id="agent-client-sheet-title">{name}</h3>
              <p>
                {client?.client_number ? `N° ${client.client_number} · ` : ''}
                {client?.user?.phone || ''}
                {client?.city ? ` · ${client.city}${client.residential_zone ? `, ${client.residential_zone}` : ''}` : ''}
              </p>
            </div>
          </div>
          <button type="button" className="cf-app-modal-close" onClick={onClose} title="Fermer">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="cf-app-modal-body">
          {loading && !client ? (
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.86rem' }}>Chargement de la fiche…</p>
          ) : null}

          {client ? (
            <div className="grid-3" style={{ gap: '0.75rem', marginBottom: '1.1rem' }}>
              <div className="card" style={{ padding: '0.8rem 1rem' }}>
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Identité</div>
                <div style={{ fontSize: '0.86rem', fontWeight: 700, marginTop: 4 }}>
                  {kyc === 'VERIFIED' ? 'Vérifiée' : kyc === 'REJECTED' ? 'Refusée' : 'En attente'}
                </div>
              </div>
              <div className="card" style={{ padding: '0.8rem 1rem' }}>
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Activité</div>
                <div style={{ fontSize: '0.86rem', fontWeight: 700, marginTop: 4 }}>{client.occupation || '—'}</div>
              </div>
              <div className="card" style={{ padding: '0.8rem 1rem' }}>
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Mode d’évaluation</div>
                <div style={{ fontSize: '0.86rem', fontWeight: 700, marginTop: 4 }}>{histories.length ? 'Membre avec historique' : 'Premier crédit'}</div>
              </div>
            </div>
          ) : null}

          <div className="card" style={{ marginBottom: '1rem' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h3 className="card-title" style={{ margin: 0 }}>
                <i className="fas fa-building-columns text-primary"></i> Comptes à l’institution
              </h3>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <Button
                  variant="secondary"
                  className="btn-xs"
                  disabled={!accounts.length}
                  title={accounts.length ? 'Enregistrer un dépôt ou un retrait' : 'Saisissez d’abord un compte'}
                  onClick={() => {
                    setTxAccountId(accounts[0]?.id ?? '');
                    setPanel(panel === 'transaction' ? 'none' : 'transaction');
                  }}
                >
                  <i className="fas fa-right-left"></i> Mouvement
                </Button>
                <Button className="btn-xs" onClick={() => setPanel(panel === 'account' ? 'none' : 'account')}>
                  <i className="fas fa-plus"></i> Compte
                </Button>
              </div>
            </div>
            <div className="card-body">
              {accounts.length ? (
                <table className="cf-mini-table">
                  <thead>
                    <tr>
                      <th>N° compte</th>
                      <th>Type</th>
                      <th>Solde</th>
                      <th>Ouvert le</th>
                      <th>État</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.map((account) => (
                      <tr key={account.id ?? account.account_number}>
                        <td>{account.account_number || '—'}</td>
                        <td>{accountTypeLabel(account.account_type)}</td>
                        <td>{formatFcfa(account.balance)}</td>
                        <td>{formatDate(account.opened_at)}</td>
                        <td>{(account.status || 'ACTIVE').toUpperCase() === 'ACTIVE' ? 'Actif' : account.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                  Aucun compte enregistré. Saisissez le compte d’épargne ou courant du membre pour alimenter son solde et son évaluation.
                </p>
              )}

              {panel === 'account' ? (
                <form onSubmit={(event) => void submitAccount(event)} className="admin-form-grid" style={{ marginTop: '0.9rem', paddingTop: '0.9rem', borderTop: '1px dashed var(--border-color)' }}>
                  <label className="form-group">
                    <span className="form-label">Numéro de compte</span>
                    <input className="form-control" value={accountNumber} onChange={(event) => setAccountNumber(event.target.value)} placeholder="ML-001-456789" required />
                  </label>
                  <label className="form-group">
                    <span className="form-label">Type</span>
                    <CfSelect className="form-control" value={accountType} onChange={(event) => setAccountType(event.target.value)}>
                      {FINANCIAL_ACCOUNT_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {accountTypeLabel(type)}
                        </option>
                      ))}
                    </CfSelect>
                  </label>
                  <label className="form-group">
                    <span className="form-label">Solde actuel (FCFA)</span>
                    <input className="form-control" type="number" min={0} step={100} value={accountBalance} onChange={(event) => setAccountBalance(event.target.value)} />
                  </label>
                  <label className="form-group">
                    <span className="form-label">Date d’ouverture</span>
                    <input className="form-control" type="date" value={accountOpened} onChange={(event) => setAccountOpened(event.target.value)} />
                  </label>
                  <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <Button type="button" variant="secondary" className="btn-sm" onClick={() => setPanel('none')}>
                      Annuler
                    </Button>
                    <Button type="submit" className="btn-sm" disabled={saving}>
                      <i className="fas fa-floppy-disk"></i> {saving ? 'Enregistrement…' : 'Enregistrer le compte'}
                    </Button>
                  </div>
                </form>
              ) : null}

              {panel === 'transaction' ? (
                <form onSubmit={(event) => void submitTransaction(event)} className="admin-form-grid" style={{ marginTop: '0.9rem', paddingTop: '0.9rem', borderTop: '1px dashed var(--border-color)' }}>
                  <label className="form-group">
                    <span className="form-label">Compte</span>
                    <CfSelect className="form-control" value={String(txAccountId)} onChange={(event) => setTxAccountId(event.target.value ? Number(event.target.value) : '')}>
                      <option value="">Choisir…</option>
                      {accounts
                        .filter((account) => account.id)
                        .map((account) => (
                          <option key={account.id} value={String(account.id)}>
                            {`${account.account_number || `Compte #${account.id}`} · ${accountTypeLabel(account.account_type)}`}
                          </option>
                        ))}
                    </CfSelect>
                  </label>
                  <label className="form-group">
                    <span className="form-label">Nature</span>
                    <CfSelect className="form-control" value={txType} onChange={(event) => setTxType(event.target.value)}>
                      {ACCOUNT_TRANSACTION_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {transactionTypeLabel(type)}
                        </option>
                      ))}
                    </CfSelect>
                  </label>
                  <label className="form-group">
                    <span className="form-label">Montant (FCFA)</span>
                    <input className="form-control" type="number" min={1} step={100} value={txAmount} onChange={(event) => setTxAmount(event.target.value)} required />
                  </label>
                  <label className="form-group">
                    <span className="form-label">Date</span>
                    <input className="form-control" type="date" value={txDate} onChange={(event) => setTxDate(event.target.value)} required />
                  </label>
                  <label className="form-group">
                    <span className="form-label">Référence</span>
                    <input className="form-control" value={txReference} onChange={(event) => setTxReference(event.target.value)} placeholder="N° de reçu" />
                  </label>
                  <label className="form-group">
                    <span className="form-label">Commentaire</span>
                    <input className="form-control" value={txDescription} onChange={(event) => setTxDescription(event.target.value)} placeholder="Dépôt hebdomadaire…" />
                  </label>
                  <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <Button type="button" variant="secondary" className="btn-sm" onClick={() => setPanel('none')}>
                      Annuler
                    </Button>
                    <Button type="submit" className="btn-sm" disabled={saving}>
                      <i className="fas fa-floppy-disk"></i> {saving ? 'Enregistrement…' : 'Enregistrer le mouvement'}
                    </Button>
                  </div>
                </form>
              ) : null}
            </div>
          </div>

          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h3 className="card-title" style={{ margin: 0 }}>
                <i className="fas fa-piggy-bank text-primary"></i> Synthèse d’épargne
              </h3>
              <Button
                className="btn-xs"
                onClick={() => {
                  setSvAccountId(accounts[0]?.id ?? '');
                  setPanel(panel === 'savings' ? 'none' : 'savings');
                }}
              >
                <i className="fas fa-plus"></i> Période
              </Button>
            </div>
            <div className="card-body">
              <p style={{ margin: '0 0 0.75rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Une synthèse par période résume les dépôts et retraits du membre. Dès la première synthèse, ses demandes sont évaluées avec son historique plutôt qu’en premier crédit.
              </p>
              {histories.length ? (
                <table className="cf-mini-table">
                  <thead>
                    <tr>
                      <th>Période</th>
                      <th>Dépôts</th>
                      <th>Retraits</th>
                      <th>Solde moyen</th>
                      <th>Solde fin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {histories.map((row, index) => (
                      <tr key={row.id ?? index}>
                        <td>
                          {formatDate(row.period_start)} → {formatDate(row.period_end)}
                        </td>
                        <td>
                          {formatFcfa(row.total_deposits)}
                          {row.deposit_count != null ? ` (${row.deposit_count})` : ''}
                        </td>
                        <td>
                          {formatFcfa(row.total_withdrawals)}
                          {row.withdrawal_count != null ? ` (${row.withdrawal_count})` : ''}
                        </td>
                        <td>{formatFcfa(row.average_balance)}</td>
                        <td>{formatFcfa(row.closing_balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-muted)' }}>Aucune synthèse enregistrée pour ce membre.</p>
              )}

              {panel === 'savings' ? (
                <form onSubmit={(event) => void submitSavings(event)} className="admin-form-grid" style={{ marginTop: '0.9rem', paddingTop: '0.9rem', borderTop: '1px dashed var(--border-color)' }}>
                  <label className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <span className="form-label">Compte concerné (facultatif)</span>
                    <CfSelect className="form-control" value={String(svAccountId)} onChange={(event) => setSvAccountId(event.target.value ? Number(event.target.value) : '')}>
                      <option value="">Tous les comptes</option>
                      {accounts
                        .filter((account) => account.id)
                        .map((account) => (
                          <option key={account.id} value={String(account.id)}>
                            {`${account.account_number || `Compte #${account.id}`} · ${accountTypeLabel(account.account_type)}`}
                          </option>
                        ))}
                    </CfSelect>
                  </label>
                  <label className="form-group">
                    <span className="form-label">Début de période</span>
                    <input className="form-control" type="date" value={svStart} onChange={(event) => setSvStart(event.target.value)} required />
                  </label>
                  <label className="form-group">
                    <span className="form-label">Fin de période</span>
                    <input className="form-control" type="date" value={svEnd} onChange={(event) => setSvEnd(event.target.value)} required />
                  </label>
                  <label className="form-group">
                    <span className="form-label">Total des dépôts (FCFA)</span>
                    <input className="form-control" type="number" min={0} step={100} value={svDeposits} onChange={(event) => setSvDeposits(event.target.value)} />
                  </label>
                  <label className="form-group">
                    <span className="form-label">Nombre de dépôts</span>
                    <input className="form-control" type="number" min={0} step={1} value={svDepositCount} onChange={(event) => setSvDepositCount(event.target.value)} />
                  </label>
                  <label className="form-group">
                    <span className="form-label">Total des retraits (FCFA)</span>
                    <input className="form-control" type="number" min={0} step={100} value={svWithdrawals} onChange={(event) => setSvWithdrawals(event.target.value)} />
                  </label>
                  <label className="form-group">
                    <span className="form-label">Nombre de retraits</span>
                    <input className="form-control" type="number" min={0} step={1} value={svWithdrawalCount} onChange={(event) => setSvWithdrawalCount(event.target.value)} />
                  </label>
                  <label className="form-group">
                    <span className="form-label">Solde moyen (FCFA)</span>
                    <input className="form-control" type="number" min={0} step={100} value={svAverage} onChange={(event) => setSvAverage(event.target.value)} required />
                  </label>
                  <label className="form-group">
                    <span className="form-label">Solde de fin de période (FCFA)</span>
                    <input className="form-control" type="number" min={0} step={100} value={svClosing} onChange={(event) => setSvClosing(event.target.value)} required />
                  </label>
                  <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <Button type="button" variant="secondary" className="btn-sm" onClick={() => setPanel('none')}>
                      Annuler
                    </Button>
                    <Button type="submit" className="btn-sm" disabled={saving}>
                      <i className="fas fa-floppy-disk"></i> {saving ? 'Enregistrement…' : 'Enregistrer la synthèse'}
                    </Button>
                  </div>
                </form>
              ) : null}
            </div>
          </div>
        </div>

        <div className="cf-app-modal-footer">
          <Button type="button" variant="secondary" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </div>
    </div>
  );
}
