import { useMemo, useState, type FormEvent } from 'react';
import { toast } from '@heroui/react';
import { Screen } from '@/shared/ui/Screen';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Button } from '@/shared/ui/Button';
import { AppTable } from '@/shared/ui/AppTable';
import { Badge } from '@/components/base/badges/badges';
import { ConfirmAlert, type ConfirmAlertTone } from '@/shared/ui/ConfirmAlert';
import { AdminRoleDrawer } from './AdminRoleDrawer';
import {
  emptyRoleDraft,
  loadRoleRegistry,
  saveRoleRegistry,
  slugifyRole,
  type RoleRecord,
} from './rbac';

export function AdminRolesPage() {
  const [roles, setRoles] = useState<RoleRecord[]>(() => loadRoleRegistry());
  const [draft, setDraft] = useState<RoleRecord | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{
    title: string;
    message: string;
    confirmLabel: string;
    tone: ConfirmAlertTone;
    run: () => void;
  } | null>(null);
  const [alertBusy, setAlertBusy] = useState(false);

  const persist = (next: RoleRecord[]) => {
    setRoles(next);
    saveRoleRegistry(next);
  };

  const onCreate = () => {
    setCreating(true);
    setDraft(emptyRoleDraft());
  };

  const onOpen = (role: RoleRecord) => {
    setCreating(false);
    setDraft({ ...role, permissions: [...role.permissions] });
  };

  const onSave = (event: FormEvent) => {
    event.preventDefault();
    if (!draft) {
      return;
    }
    const name = draft.name.trim();
    const slug = slugifyRole(draft.slug || draft.name);
    if (!name || !slug) {
      toast.warning('Nom et code sont obligatoires.');
      return;
    }
    const duplicate = roles.some((role) => role.slug === slug && role.id !== draft.id);
    if (duplicate) {
      toast.warning('Ce code de rôle existe déjà.');
      return;
    }

    setAlert({
      title: creating ? 'Créer le rôle' : 'Enregistrer le rôle',
      message: creating
        ? `Créer le rôle « ${name} » avec ${draft.permissions.length} droit${draft.permissions.length > 1 ? 's' : ''} ?`
        : `Enregistrer les modifications du rôle « ${name} » ?`,
      confirmLabel: creating ? 'Créer' : 'Enregistrer',
      tone: 'primary',
      run: () => {
        setSaving(true);
        try {
          if (creating) {
            persist([
              ...roles,
              {
                id: `custom-${Date.now()}`,
                name,
                slug,
                system: false,
                permissions: [...draft.permissions],
              },
            ]);
            toast.success('Rôle créé.');
          } else {
            persist(
              roles.map((role) =>
                role.id === draft.id
                  ? {
                      ...role,
                      name,
                      slug: role.system ? role.slug : slug,
                      permissions: [...draft.permissions],
                    }
                  : role,
              ),
            );
            toast.success('Rôle mis à jour.');
          }
          setDraft(null);
          setCreating(false);
        } finally {
          setSaving(false);
        }
      },
    });
  };

  const onDelete = (role: RoleRecord) => {
    if (role.system) {
      toast.warning('Un rôle système ne peut pas être supprimé.');
      return;
    }
    setAlert({
      title: 'Supprimer le rôle',
      message: `Supprimer le rôle « ${role.name} » ? Cette action n’est pas réversible.`,
      confirmLabel: 'Supprimer',
      tone: 'danger',
      run: () => {
        persist(roles.filter((item) => item.id !== role.id));
        setDraft(null);
        toast.success('Rôle supprimé.');
      },
    });
  };

  const rows = useMemo(() => roles.map((role) => ({ ...role })), [roles]);

  return (
    <Screen viewId="view-admin-roles">
      <PageHeader
        title="Rôles & habilitations"
        crumbs={['Administration', 'Rôles']}
        actions={
          <Button onClick={onCreate}>
            <i className="fas fa-plus"></i> Créer un rôle
          </Button>
        }
      />

      <AppTable
        title="Rôles"
        badge={`${rows.length}`}
        items={rows}
        onRowAction={(key) => {
          const match = rows.find((row) => row.id === String(key));
          if (match) {
            onOpen(match);
          }
        }}
        columns={[
          { id: 'name', label: 'Nom', isRowHeader: true, allowsSorting: true, render: (item) => <strong>{item.name}</strong> },
          { id: 'slug', label: 'Code', allowsSorting: true, render: (item) => item.slug },
          {
            id: 'system',
            label: 'Type',
            allowsSorting: true,
            render: (item) => <Badge color={item.system ? 'gray' : 'brand'}>{item.system ? 'Système' : 'Personnalisé'}</Badge>,
          },
          {
            id: 'permissions',
            label: 'Autorisations',
            allowsSorting: true,
            render: (item) => `${item.permissions.length} droit${item.permissions.length > 1 ? 's' : ''}`,
          },
          {
            id: 'actions',
            label: 'Action',
            className: 'cf-table-actions-col',
            render: (item) => (
              <div className="cf-table-actions" onClick={(event) => event.stopPropagation()}>
                <button type="button" className="cf-table-icon-btn is-edit" title="Modifier" onClick={() => onOpen(item)}>
                  <i className="fas fa-pen"></i>
                </button>
                <button
                  type="button"
                  className="cf-table-icon-btn is-danger"
                  title="Supprimer"
                  disabled={item.system}
                  onClick={() => onDelete(item)}
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            ),
          },
        ]}
      />

      <AdminRoleDrawer
        role={draft}
        creating={creating}
        saving={saving}
        onChange={setDraft}
        onClose={() => {
          setDraft(null);
          setCreating(false);
        }}
        onSave={onSave}
        onDelete={() => {
          if (draft) {
            onDelete(draft);
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
          if (!alert) {
            return;
          }
          setAlertBusy(true);
          try {
            alert.run();
            setAlert(null);
          } finally {
            setAlertBusy(false);
          }
        }}
      />
    </Screen>
  );
}
