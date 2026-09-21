import type { FormEvent } from 'react';
import { Button } from '@/shared/ui/Button';
import { CfSelect } from '@/shared/ui/CfSelect';
import { roleLabel, STAFF_ROLES, type ManagedRole, type StaffRole } from '@/api/admin';

export type AdminUserDraft = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: ManagedRole;
  status: 'active' | 'inactive';
  name: string;
};

type AdminUserDrawerProps = {
  user: AdminUserDraft | null;
  saving: boolean;
  isSelf: boolean;
  password: string;
  onPasswordChange: (value: string) => void;
  onChange: (next: AdminUserDraft) => void;
  onClose: () => void;
  onSave: (event: FormEvent) => void;
  onResetPassword: (event: FormEvent) => void;
  onRestore: () => void;
  onDeactivate: () => void;
  onReactivate: () => void;
};

export function AdminUserDrawer({
  user,
  saving,
  isSelf,
  password,
  onPasswordChange,
  onChange,
  onClose,
  onSave,
  onResetPassword,
  onRestore,
  onDeactivate,
  onReactivate,
}: AdminUserDrawerProps) {
  const isClient = user?.role === 'client';

  return (
    <div className={`schedule-drawer-backdrop${user ? ' active' : ''}`} onClick={onClose}>
      <aside className="schedule-drawer" onClick={(event) => event.stopPropagation()} aria-label="Fiche utilisateur">
        <div className="schedule-drawer-header">
          <div className="schedule-drawer-title-box">
            <div className="schedule-drawer-icon">
              <i className={`fas ${isClient ? 'fa-user' : 'fa-user-gear'}`}></i>
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>{user?.name || 'Utilisateur'}</h3>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                {roleLabel(user?.role)} • {user?.status === 'inactive' ? 'Retiré' : 'Actif'}
              </p>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} title="Fermer le volet">
            <i className="fas fa-times"></i>
          </button>
        </div>

        {user ? (
          <div className="schedule-drawer-body">
            <form className="drawer-panel" onSubmit={onSave}>
              <div className="drawer-panel-header">
                <h4 className="drawer-panel-title">
                  <i className="fas fa-id-card text-primary"></i> {isClient ? 'Identité client' : 'Identité & contact'}
                </h4>
              </div>
              {isClient ? (
                <p className="form-hint" style={{ marginTop: 0, marginBottom: '0.85rem' }}>
                  L’administrateur peut corriger le nom, le téléphone, l’e-mail et le statut, ou réinitialiser le mot de
                  passe. Le rôle reste Client.
                </p>
              ) : null}
              <div className="admin-form-grid">
                <label className="form-group">
                  <span className="form-label">Prénom *</span>
                  <input
                    className="form-control"
                    required
                    value={user.first_name}
                    onChange={(event) => onChange({ ...user, first_name: event.target.value })}
                  />
                </label>
                <label className="form-group">
                  <span className="form-label">Nom *</span>
                  <input
                    className="form-control"
                    required
                    value={user.last_name}
                    onChange={(event) => onChange({ ...user, last_name: event.target.value })}
                  />
                </label>
                <label className="form-group">
                  <span className="form-label">E-mail {isClient ? '' : '*'}</span>
                  <input
                    className="form-control"
                    type="email"
                    required={!isClient}
                    placeholder={isClient ? 'facultatif' : undefined}
                    value={user.email}
                    onChange={(event) => onChange({ ...user, email: event.target.value })}
                  />
                </label>
                <label className="form-group">
                  <span className="form-label">Téléphone {isClient ? '*' : ''}</span>
                  <input
                    className="form-control"
                    type="tel"
                    required={isClient}
                    placeholder="+223 70 12 34 56"
                    value={user.phone}
                    onChange={(event) => onChange({ ...user, phone: event.target.value })}
                  />
                </label>
                <label className="form-group">
                  <span className="form-label">Rôle</span>
                  <CfSelect
                    className="form-control"
                    disabled={isSelf || isClient}
                    value={user.role}
                    onChange={(event) => onChange({ ...user, role: event.target.value as StaffRole })}
                  >
                    {isClient ? <option value="client">Client</option> : null}
                    {STAFF_ROLES.map((role) => (
                      <option key={role} value={role}>
                        {roleLabel(role)}
                      </option>
                    ))}
                  </CfSelect>
                </label>
                <label className="form-group">
                  <span className="form-label">Statut</span>
                  <CfSelect
                    className="form-control"
                    disabled={isSelf}
                    value={user.status}
                    onChange={(event) => onChange({ ...user, status: event.target.value as 'active' | 'inactive' })}
                  >
                    <option value="active">Actif</option>
                    <option value="inactive">Retiré</option>
                  </CfSelect>
                </label>
              </div>
              <div className="page-actions" style={{ marginTop: '1rem' }}>
                <Button type="button" variant="secondary" disabled={saving} onClick={onRestore}>
                  Rétablir
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Enregistrement…' : isClient ? 'Mettre à jour le client' : 'Enregistrer les modifications'}
                </Button>
              </div>
            </form>

            <form className="drawer-panel" onSubmit={onResetPassword}>
              <div className="drawer-panel-header">
                <h4 className="drawer-panel-title">
                  <i className="fas fa-key text-primary"></i> Réinitialiser le mot de passe
                </h4>
              </div>
              <label className="form-group">
                <span className="form-label">Nouveau mot de passe</span>
                <input
                  className="form-control"
                  type="password"
                  minLength={8}
                  required
                  disabled={isSelf}
                  value={password}
                  onChange={(event) => onPasswordChange(event.target.value)}
                />
              </label>
              <div className="page-actions" style={{ marginTop: '0.85rem' }}>
                <Button type="submit" variant="secondary" disabled={saving || isSelf}>
                  Réinitialiser
                </Button>
              </div>
            </form>

            <div className="drawer-panel">
              <div className="drawer-panel-header">
                <h4 className="drawer-panel-title">
                  <i className="fas fa-trash-can text-primary"></i> Retrait du compte
                </h4>
              </div>
              <p className="page-subtitle">
                Le compte est retiré, pas détruit : il ne peut plus se connecter. Les dossiers restent. Vous pouvez le rétablir.
              </p>
              {user.status === 'inactive' ? (
                <Button variant="secondary" disabled={isSelf} onClick={onReactivate}>
                  <i className="fas fa-rotate-left"></i> Rétablir le compte
                </Button>
              ) : (
                <Button variant="danger-subtle" disabled={isSelf} onClick={onDeactivate}>
                  <i className="fas fa-user-slash"></i> Supprimer le compte
                </Button>
              )}
            </div>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
