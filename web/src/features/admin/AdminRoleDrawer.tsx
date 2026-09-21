import type { FormEvent } from 'react';
import { Button } from '@/shared/ui/Button';
import { ROLE_PERMISSION_GROUPS, slugifyRole, type RoleRecord } from './rbac';

type AdminRoleDrawerProps = {
  role: RoleRecord | null;
  creating: boolean;
  saving: boolean;
  onChange: (next: RoleRecord) => void;
  onClose: () => void;
  onSave: (event: FormEvent) => void;
  onDelete: () => void;
};

export function AdminRoleDrawer({ role, creating, saving, onChange, onClose, onSave, onDelete }: AdminRoleDrawerProps) {
  const togglePermission = (permissionId: string) => {
    if (!role) {
      return;
    }
    const has = role.permissions.includes(permissionId);
    onChange({
      ...role,
      permissions: has ? role.permissions.filter((id) => id !== permissionId) : [...role.permissions, permissionId],
    });
  };

  return (
    <div className={`schedule-drawer-backdrop${role ? ' active' : ''}`} onClick={onClose}>
      <aside className="schedule-drawer" onClick={(event) => event.stopPropagation()} aria-label="Fiche rôle">
        {role ? (
          <>
        <div className="schedule-drawer-header">
          <div className="schedule-drawer-title-box">
            <div className="schedule-drawer-icon">
              <i className="fas fa-user-shield"></i>
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
                {creating ? 'Nouveau rôle' : role.name}
              </h3>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                {role.system ? 'Rôle système' : 'Rôle personnalisé'} • {role.permissions.length} droit
                {role.permissions.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} title="Fermer le volet">
            <i className="fas fa-times"></i>
          </button>
        </div>
          <div className="schedule-drawer-body">
            <form className="drawer-panel" onSubmit={onSave}>
              <div className="drawer-panel-header">
                <h4 className="drawer-panel-title">
                  <i className="fas fa-id-card text-primary"></i> Rôle
                </h4>
              </div>
              <div className="admin-form-grid">
                <label className="form-group">
                  <span className="form-label">Nom</span>
                  <input
                    className="form-control"
                    required
                    value={role.name}
                    onChange={(event) => {
                      const name = event.target.value;
                      const autoSlug = !role.system && (creating || !role.slug || role.slug === slugifyRole(role.name));
                      onChange({
                        ...role,
                        name,
                        slug: autoSlug ? slugifyRole(name) : role.slug,
                      });
                    }}
                  />
                </label>
                <label className="form-group">
                  <span className="form-label">Code</span>
                  <input
                    className="form-control"
                    required
                    disabled={role.system}
                    value={role.slug}
                    onChange={(event) => onChange({ ...role, slug: event.target.value })}
                  />
                </label>
              </div>

              <div className="drawer-panel-header" style={{ marginTop: '1.1rem' }}>
                <h4 className="drawer-panel-title">
                  <i className="fas fa-lock text-primary"></i> Autorisations
                </h4>
              </div>
              <div className="admin-auth-groups">
                {ROLE_PERMISSION_GROUPS.map((group) => (
                  <fieldset key={group.id} className="admin-auth-group">
                    <legend>{group.label}</legend>
                    {group.items.map((item) => (
                      <label key={item.id} className="admin-auth-item">
                        <input
                          type="checkbox"
                          checked={role.permissions.includes(item.id)}
                          onChange={() => togglePermission(item.id)}
                        />
                        <span>{item.label}</span>
                      </label>
                    ))}
                  </fieldset>
                ))}
              </div>

              <div className="page-actions" style={{ marginTop: '1rem' }}>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Enregistrement…' : creating ? 'Créer le rôle' : 'Enregistrer'}
                </Button>
              </div>
            </form>

            {role.system ? null : (
              <div className="drawer-panel">
                <div className="drawer-panel-header">
                  <h4 className="drawer-panel-title">
                    <i className="fas fa-trash text-primary"></i> Suppression
                  </h4>
                </div>
                <Button variant="danger-subtle" disabled={saving} onClick={onDelete}>
                  <i className="fas fa-trash"></i> Supprimer ce rôle
                </Button>
              </div>
            )}
          </div>
          </>
        ) : null}
      </aside>
    </div>
  );
}
