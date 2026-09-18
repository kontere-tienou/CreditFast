import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { toast } from '@heroui/react';
import { Screen } from '@/shared/ui/Screen';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Button } from '@/shared/ui/Button';
import { AppTable } from '@/shared/ui/AppTable';
import { isApiError } from '@/api';
import {
  STAFF_ROLE_LABELS,
  createAdminUser,
  deactivateAdminUser,
  listAdminUsers,
  resetAdminUserPassword,
  updateAdminUser,
  type StaffRole,
  type StaffUser,
} from '@/api/admin';
import { getUiSession } from '@/app/session';

const EMPTY_FORM = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  password: '',
  role: 'credit_agent' as StaffRole,
};

export function AdminUsersPage() {
  const session = getUiSession();
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [resetFor, setResetFor] = useState<{ id: string; full_name?: string; email?: string | null } | null>(null);
  const [resetPassword, setResetPassword] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    try {
      setUsers(await listAdminUsers());
    } catch (error) {
      toast.danger(isApiError(error) ? error.message : 'Impossible de charger les utilisateurs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const rows = useMemo(
    () =>
      users.map((user) => ({
        ...user,
        id: String(user.id),
        name: user.full_name || [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email || '—',
      })),
    [users],
  );

  const onCreate = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await createAdminUser({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        password: form.password,
        role: form.role,
      });
      toast.success('Compte interne créé.');
      setForm(EMPTY_FORM);
      setShowForm(false);
      await loadUsers();
    } catch (error) {
      toast.danger(isApiError(error) ? error.message : 'Création impossible.');
    } finally {
      setSaving(false);
    }
  };

  const onRoleChange = async (userId: string, role: StaffRole) => {
    if (userId === session?.userId) {
      toast.warning('Vous ne pouvez pas modifier votre propre rôle ici.');
      return;
    }
    try {
      await updateAdminUser(Number(userId), { role });
      toast.success('Rôle mis à jour.');
      await loadUsers();
    } catch (error) {
      toast.danger(isApiError(error) ? error.message : 'Mise à jour impossible.');
    }
  };

  const onStatusChange = async (userId: string, status: 'active' | 'inactive') => {
    if (userId === session?.userId) {
      toast.warning('Vous ne pouvez pas modifier votre propre statut ici.');
      return;
    }
    try {
      await updateAdminUser(Number(userId), { status });
      toast.success(status === 'inactive' ? 'Compte désactivé.' : 'Compte réactivé.');
      await loadUsers();
    } catch (error) {
      toast.danger(isApiError(error) ? error.message : 'Mise à jour impossible.');
    }
  };

  const onDeactivate = async (user: { id: string; full_name?: string; email?: string | null }) => {
    if (user.id === session?.userId) {
      toast.warning('Vous ne pouvez pas désactiver votre propre compte.');
      return;
    }
    if (!window.confirm(`Désactiver ${user.full_name || user.email} ? Les sessions seront révoquées.`)) {
      return;
    }
    try {
      await deactivateAdminUser(Number(user.id));
      toast.success('Compte désactivé.');
      await loadUsers();
    } catch (error) {
      toast.danger(isApiError(error) ? error.message : 'Désactivation impossible.');
    }
  };

  const onReset = async (event: FormEvent) => {
    event.preventDefault();
    if (!resetFor) {
      return;
    }
    if (String(resetFor.id) === session?.userId) {
      toast.warning('Utilisez Paramètres pour changer votre propre mot de passe.');
      return;
    }
    setSaving(true);
    try {
      await resetAdminUserPassword(Number(resetFor.id), resetPassword);
      toast.success('Mot de passe réinitialisé. Sessions révoquées.');
      setResetFor(null);
      setResetPassword('');
    } catch (error) {
      toast.danger(isApiError(error) ? error.message : 'Réinitialisation impossible.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen viewId="view-admin-users">
      <PageHeader
        title="Comptes internes & habilitations"
        crumbs={['Administration', 'Création, rôles, révocation']}
        actions={
          <Button onClick={() => setShowForm((open) => !open)}>
            <i className="fas fa-user-plus"></i> {showForm ? 'Fermer le formulaire' : 'Créer un utilisateur'}
          </Button>
        }
      />

      {showForm ? (
        <form className="card admin-panel" onSubmit={onCreate}>
          <h3 className="card-title">Nouveau compte interne</h3>
          <p className="page-subtitle">Rôles autorisés : admin, chargé de crédit, analyste, comité. Minimum 8 caractères pour le mot de passe.</p>
          <div className="admin-form-grid">
            <label className="form-group">
              <span className="form-label">Prénom</span>
              <input className="form-control" required value={form.first_name} onChange={(event) => setForm({ ...form, first_name: event.target.value })} />
            </label>
            <label className="form-group">
              <span className="form-label">Nom</span>
              <input className="form-control" required value={form.last_name} onChange={(event) => setForm({ ...form, last_name: event.target.value })} />
            </label>
            <label className="form-group">
              <span className="form-label">E-mail professionnel</span>
              <input className="form-control" type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
            </label>
            <label className="form-group">
              <span className="form-label">Téléphone (facultatif)</span>
              <input className="form-control" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
            </label>
            <label className="form-group">
              <span className="form-label">Mot de passe</span>
              <input className="form-control" type="password" minLength={8} required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
            </label>
            <label className="form-group">
              <span className="form-label">Rôle</span>
              <select className="form-control" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as StaffRole })}>
                {(Object.keys(STAFF_ROLE_LABELS) as StaffRole[]).map((role) => (
                  <option key={role} value={role}>
                    {STAFF_ROLE_LABELS[role]}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="page-actions" style={{ marginTop: '1rem' }}>
            <Button type="submit" disabled={saving}>
              {saving ? 'Enregistrement…' : 'Enregistrer le compte'}
            </Button>
          </div>
        </form>
      ) : null}

      {resetFor ? (
        <form className="card admin-panel" onSubmit={onReset}>
          <h3 className="card-title">Réinitialiser le mot de passe — {resetFor.full_name || resetFor.email}</h3>
          <label className="form-group">
            <span className="form-label">Nouveau mot de passe</span>
            <input className="form-control" type="password" minLength={8} required value={resetPassword} onChange={(event) => setResetPassword(event.target.value)} />
          </label>
          <div className="page-actions" style={{ marginTop: '1rem', gap: '0.5rem', display: 'flex' }}>
            <Button type="submit" disabled={saving}>
              Confirmer
            </Button>
            <Button type="button" variant="secondary" onClick={() => setResetFor(null)}>
              Annuler
            </Button>
          </div>
        </form>
      ) : null}

      <AppTable
        title={loading ? 'Chargement des comptes…' : 'Utilisateurs internes'}
        badge={`${rows.length} comptes`}
        items={rows}
        columns={[
          { id: 'name', label: 'Nom', isRowHeader: true, allowsSorting: true, render: (item) => <strong>{item.name}</strong> },
          { id: 'email', label: 'E-mail', allowsSorting: true, render: (item) => item.email || '—' },
          {
            id: 'role',
            label: 'Rôle',
            allowsSorting: true,
            render: (item) => (
              <select
                className="form-control"
                value={(item.role as StaffRole) || 'credit_agent'}
                onChange={(event) => void onRoleChange(item.id, event.target.value as StaffRole)}
              >
                {(Object.keys(STAFF_ROLE_LABELS) as StaffRole[]).map((role) => (
                  <option key={role} value={role}>
                    {STAFF_ROLE_LABELS[role]}
                  </option>
                ))}
              </select>
            ),
          },
          {
            id: 'status',
            label: 'Statut',
            render: (item) => (
              <select
                className="form-control"
                value={item.status === 'inactive' ? 'inactive' : 'active'}
                onChange={(event) => void onStatusChange(item.id, event.target.value as 'active' | 'inactive')}
              >
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
              </select>
            ),
          },
          {
            id: 'actions',
            label: '',
            render: (item) => (
              <div className="cf-table-actions">
                <Button variant="secondary" onClick={() => setResetFor(item)}>
                  Mot de passe
                </Button>
                <Button variant="danger-subtle" onClick={() => void onDeactivate(item)}>
                  Désactiver
                </Button>
              </div>
            ),
          },
        ]}
      />
    </Screen>
  );
}
