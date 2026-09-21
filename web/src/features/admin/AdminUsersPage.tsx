import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from '@heroui/react';
import { Screen } from '@/shared/ui/Screen';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Button } from '@/shared/ui/Button';
import { AppTable } from '@/shared/ui/AppTable';
import { isApiError } from '@/api';
import {
  deactivateAdminUser,
  isInactiveUser,
  isStaffRole,
  listAdminUsers,
  normalizeManagedRole,
  resetAdminUserPassword,
  restoreAdminUser,
  roleLabel,
  updateAdminUser,
  type StaffUser,
} from '@/api/admin';
import { getUiSession } from '@/app/session';
import { AdminUserDrawer, type AdminUserDraft } from './AdminUserDrawer';
import { AdminUserWizardModal } from './AdminUserWizardModal';
import { ConfirmAlert, type ConfirmAlertTone } from '@/shared/ui/ConfirmAlert';
import { CfSelect } from '@/shared/ui/CfSelect';

type PendingAlert = {
  title: string;
  message: string;
  confirmLabel: string;
  tone: ConfirmAlertTone;
  run: () => Promise<void>;
};

function accountLabel(user: { name?: string; email?: string | null; phone?: string | null }) {
  return user.name || user.email || user.phone || 'ce compte';
}

function toDraft(user: StaffUser): AdminUserDraft {
  return {
    id: String(user.id),
    first_name: user.first_name ?? '',
    last_name: user.last_name ?? '',
    email: user.email ?? '',
    phone: user.phone ?? '',
    role: normalizeManagedRole(user.role),
    status: isInactiveUser(user.status) ? 'inactive' : 'active',
    name: user.full_name || [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email || user.phone || '—',
  };
}

export function AdminUsersPage() {
  const session = getUiSession();
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<AdminUserDraft | null>(null);
  const [original, setOriginal] = useState<AdminUserDraft | null>(null);
  const [resetPassword, setResetPassword] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'active' | 'inactive'>('ALL');
  const [alert, setAlert] = useState<PendingAlert | null>(null);
  const [alertBusy, setAlertBusy] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const next = await listAdminUsers();
      setUsers(next);
      setSelected((current) => {
        if (!current) {
          return current;
        }
        const match = next.find((user) => String(user.id) === current.id);
        if (!match) {
          return current;
        }
        const draft = toDraft(match);
        setOriginal(draft);
        return draft;
      });
    } catch (error) {
      toast.danger(isApiError(error) ? error.message : 'Impossible de charger les utilisateurs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  useEffect(() => {
    if (searchParams.get('nouveau') === '1') {
      setWizardOpen(true);
      const next = new URLSearchParams(searchParams);
      next.delete('nouveau');
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const rows = useMemo(
    () =>
      users
        .map((user) => ({
          ...toDraft(user),
        }))
        .filter((row) => (statusFilter === 'ALL' ? true : row.status === statusFilter)),
    [users, statusFilter],
  );

  const isSelf = selected?.id === session?.userId;

  const ask = (next: PendingAlert) => {
    setAlert(next);
  };

  const runAlert = async () => {
    if (!alert) {
      return;
    }
    setAlertBusy(true);
    try {
      await alert.run();
      setAlert(null);
    } catch (error) {
      toast.danger(isApiError(error) ? error.message : 'Action impossible.');
    } finally {
      setAlertBusy(false);
    }
  };

  const onDeactivate = (user: { id: string; name?: string; email?: string | null; phone?: string | null }) => {
    if (user.id === session?.userId) {
      toast.warning('Vous ne pouvez pas retirer votre propre compte.');
      return;
    }
    ask({
      title: 'Supprimer le compte',
      message: `Retirer ${accountLabel(user)} ? La connexion sera bloquée. Le compte n’est pas détruit : vous pourrez le rétablir.`,
      confirmLabel: 'Supprimer',
      tone: 'danger',
      run: async () => {
        await deactivateAdminUser(Number(user.id));
        toast.success('Compte retiré. Il n’est pas détruit.');
        setSelected(null);
        setOriginal(null);
        await loadUsers();
      },
    });
  };

  const onReactivate = (user: { id: string; name?: string; email?: string | null; phone?: string | null }) => {
    ask({
      title: 'Rétablir le compte',
      message: `${accountLabel(user)} pourra de nouveau se connecter. Confirmez le rétablissement.`,
      confirmLabel: 'Rétablir',
      tone: 'primary',
      run: async () => {
        await restoreAdminUser(Number(user.id));
        toast.success(`${accountLabel(user)} peut de nouveau se connecter.`);
        await loadUsers();
      },
    });
  };

  const onSave = (event: FormEvent) => {
    event.preventDefault();
    if (!selected) {
      return;
    }
    const isClient = selected.role === 'client';
    if (isClient && !selected.phone.trim()) {
      toast.warning('Le téléphone est obligatoire pour un client.');
      return;
    }
    const retiring = !isSelf && selected.status === 'inactive' && original?.status !== 'inactive';
    ask({
      title: retiring ? 'Retirer et enregistrer' : 'Enregistrer la fiche',
      message: retiring
        ? `Enregistrer les modifications et retirer ${accountLabel(selected)} ? La connexion sera bloquée, le compte n’est pas détruit.`
        : `Enregistrer les modifications de ${accountLabel(selected)} ?`,
      confirmLabel: 'Enregistrer',
      tone: retiring ? 'warning' : 'primary',
      run: async () => {
        setSaving(true);
        try {
          await updateAdminUser(Number(selected.id), {
            first_name: selected.first_name.trim(),
            last_name: selected.last_name.trim(),
            email: selected.email.trim() || null,
            phone: selected.phone.trim() || null,
            role: isSelf || isClient || !isStaffRole(selected.role) ? undefined : selected.role,
            status: isSelf ? undefined : selected.status,
          });
          toast.success(isClient ? 'Fiche client mise à jour.' : 'Fiche utilisateur mise à jour.');
          await loadUsers();
        } finally {
          setSaving(false);
        }
      },
    });
  };

  const onReset = (event: FormEvent) => {
    event.preventDefault();
    if (!selected) {
      return;
    }
    if (selected.id === session?.userId) {
      toast.warning('Utilisez Paramètres pour changer votre propre mot de passe.');
      return;
    }
    if (resetPassword.length < 8) {
      toast.warning('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    ask({
      title: 'Réinitialiser le mot de passe',
      message: `Nouveau mot de passe pour ${accountLabel(selected)} ? Toutes ses sessions seront coupées.`,
      confirmLabel: 'Réinitialiser',
      tone: 'warning',
      run: async () => {
        setSaving(true);
        try {
          await resetAdminUserPassword(Number(selected.id), resetPassword);
          toast.success('Mot de passe réinitialisé. Sessions coupées.');
          setResetPassword('');
        } finally {
          setSaving(false);
        }
      },
    });
  };

  return (
    <Screen viewId="view-admin-users">
      <PageHeader
        title="Comptes & utilisateurs"
        crumbs={['Administration', 'Staff et clients']}
        actions={
          <Button onClick={() => setWizardOpen(true)}>
            <i className="fas fa-user-plus"></i> Créer un utilisateur / client
          </Button>
        }
      />

      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', padding: '0.85rem 1rem' }}>
          <label htmlFor="admin-users-status-filter" style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
            Statut
          </label>
          <CfSelect
            id="admin-users-status-filter"
            className="form-control"
            style={{ width: 'auto', minWidth: 220 }}
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as 'ALL' | 'active' | 'inactive')}
          >
            <option value="ALL">Tous les comptes ({users.length})</option>
            <option value="active">Actifs ({users.filter((user) => !isInactiveUser(user.status)).length})</option>
            <option value="inactive">Retirés ({users.filter((user) => isInactiveUser(user.status)).length})</option>
          </CfSelect>
        </div>
      </div>

      <AppTable
        title={loading ? 'Chargement des comptes…' : 'Tous les utilisateurs'}
        badge={`${rows.length} comptes`}
        items={rows}
        onRowAction={(key) => {
          const match = rows.find((row) => row.id === String(key));
          if (match) {
            setResetPassword('');
            setSelected(match);
            setOriginal(match);
          }
        }}
        columns={[
          {
            id: 'name',
            label: 'Nom',
            isRowHeader: true,
            allowsSorting: true,
            render: (item) => (
              <span className="cf-table-person">
                <span className="cf-table-avatar" aria-hidden>
                  {item.name
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((part) => part[0] ?? '')
                    .join('')
                    .toUpperCase()}
                </span>
                <strong>{item.name}</strong>
              </span>
            ),
          },
          { id: 'email', label: 'Contact', allowsSorting: true, render: (item) => item.email || item.phone || '—' },
          { id: 'role', label: 'Rôle', allowsSorting: true, render: (item) => roleLabel(item.role) },
          {
            id: 'status',
            label: 'Statut',
            allowsSorting: true,
            render: (item) => (
              <span className={`badge ${item.status === 'inactive' ? 'badge-warning' : 'badge-approved'}`}>
                {item.status === 'inactive' ? 'Retiré' : 'Actif'}
              </span>
            ),
          },
          {
            id: 'actions',
            label: 'Action',
            className: 'cf-table-actions-col',
            render: (item) => (
              <div className="cf-table-actions">
                <button
                  type="button"
                  className="cf-table-icon-btn is-view"
                  title="Détails"
                  onClick={(event) => {
                    event.stopPropagation();
                    setResetPassword('');
                    setSelected(item);
                    setOriginal(item);
                  }}
                >
                  <i className="fas fa-eye"></i>
                </button>
                <button
                  type="button"
                  className="cf-table-icon-btn is-edit"
                  title="Réinitialiser le mot de passe"
                  onClick={(event) => {
                    event.stopPropagation();
                    setResetPassword('');
                    setSelected(item);
                    setOriginal(item);
                  }}
                >
                  <i className="fas fa-key"></i>
                </button>
                {item.status === 'inactive' ? (
                  <button
                    type="button"
                    className="cf-table-icon-btn is-edit"
                    title="Rétablir le compte"
                    onClick={(event) => {
                      event.stopPropagation();
                      void onReactivate(item);
                    }}
                  >
                    <i className="fas fa-rotate-left"></i>
                  </button>
                ) : (
                  <button
                    type="button"
                    className="cf-table-icon-btn is-danger"
                    title="Supprimer le compte (retrait, pas destruction)"
                    onClick={(event) => {
                      event.stopPropagation();
                      void onDeactivate(item);
                    }}
                  >
                    <i className="fas fa-trash-can"></i>
                  </button>
                )}
              </div>
            ),
          },
        ]}
      />

      <AdminUserWizardModal open={wizardOpen} onClose={() => setWizardOpen(false)} onCreated={loadUsers} />

      <AdminUserDrawer
        user={selected}
        saving={saving}
        isSelf={Boolean(isSelf)}
        password={resetPassword}
        onPasswordChange={setResetPassword}
        onChange={setSelected}
        onClose={() => {
          setSelected(null);
          setOriginal(null);
          setResetPassword('');
        }}
        onSave={onSave}
        onResetPassword={onReset}
        onRestore={() => {
          if (!original) {
            return;
          }
          ask({
            title: 'Annuler les modifications',
            message: `Revenir aux informations déjà enregistrées pour ${accountLabel(original)} ? Les changements non sauvegardés seront perdus.`,
            confirmLabel: 'Rétablir la fiche',
            tone: 'warning',
            run: async () => {
              setSelected(original);
              toast.success('Infos rétablies (non enregistrées).');
            },
          });
        }}
        onDeactivate={() => {
          if (selected) {
            void onDeactivate(selected);
          }
        }}
        onReactivate={() => {
          if (selected) {
            void onReactivate(selected);
          }
        }}
      />

      <ConfirmAlert
        open={Boolean(alert)}
        title={alert?.title ?? ''}
        message={alert?.message ?? ''}
        confirmLabel={alert?.confirmLabel}
        tone={alert?.tone}
        busy={alertBusy}
        onCancel={() => {
          if (!alertBusy) {
            setAlert(null);
          }
        }}
        onConfirm={() => {
          void runAlert();
        }}
      />
    </Screen>
  );
}
