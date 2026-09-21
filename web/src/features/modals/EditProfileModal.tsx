import { useEffect, useState, type FormEvent } from 'react';
import { toast } from '@heroui/react';
import {
  deleteProfilePhoto,
  fetchCurrentUser,
  fetchClientProfile,
  fetchFinancialProfile,
  fetchProfilePhotoMeta,
  fetchUserPhotoFile,
  isApiError,
  listEconomicActivities,
  saveEconomicActivity,
  saveFinancialProfile,
  updateAdminUser,
  updateClientProfile,
  updateOwnPassword,
  uploadProfilePhoto,
} from '@/api';
import { ROLE_PROFILES } from '@/app/roles';
import { getUiSession, patchUiSession } from '@/app/session';
import { Button } from '@/shared/ui/Button';
import { notifyProfileChanged } from '@/features/workflow/workflow';

type EditProfileModalProps = {
  open?: boolean;
  onClose: () => void;
};

const DEFAULT_AVATAR = '/images/profil/profil01-01.jpg';

export function EditProfileModal({ open = false, onClose }: EditProfileModalProps) {
  const session = getUiSession();
  const roleProfile = session ? ROLE_PROFILES[session.role] : ROLE_PROFILES.CLIENT;
  const isClient = session?.role === 'CLIENT';
  const [email, setEmail] = useState(session?.email || session?.identifier || '');
  const [phone, setPhone] = useState(session?.phone || '');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [city, setCity] = useState('');
  const [zone, setZone] = useState('');
  const [occupation, setOccupation] = useState('');
  const [address, setAddress] = useState('');
  const [activityId, setActivityId] = useState<number | undefined>();
  const [activityType, setActivityType] = useState('');
  const [activityLocation, setActivityLocation] = useState('');
  const [monthlyRevenue, setMonthlyRevenue] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [otherIncome, setOtherIncome] = useState('');
  const [monthlyExpenses, setMonthlyExpenses] = useState('');
  const [debt, setDebt] = useState('');
  const [dependents, setDependents] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState(roleProfile.avatar || DEFAULT_AVATAR);
  const [hasPhoto, setHasPhoto] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [removingPhoto, setRemovingPhoto] = useState(false);

  const displayName = session?.name || [firstName, lastName].filter(Boolean).join(' ') || roleProfile.displayName;

  const removePhoto = async () => {
    if (!hasPhoto || removingPhoto) {
      return;
    }
    if (!window.confirm('Retirer votre photo de profil ?')) {
      return;
    }
    setRemovingPhoto(true);
    try {
      await deleteProfilePhoto();
      setHasPhoto(false);
      setPhotoFile(null);
      setPhotoPreview(roleProfile.avatar || DEFAULT_AVATAR);
      notifyProfileChanged();
      toast.success('Photo retirée.');
    } catch (error) {
      toast.danger(isApiError(error) ? error.message : 'Impossible de retirer la photo.');
    } finally {
      setRemovingPhoto(false);
    }
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    const current = getUiSession();
    setEmail(current?.email || (current?.identifier.includes('@') ? current.identifier : '') || '');
    setPhone(current?.phone || '');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPhotoFile(null);

    void fetchCurrentUser()
      .then((user) => {
        setEmail(user.email || current?.email || '');
        setPhone(user.phone || current?.phone || '');
        setFirstName(user.first_name || '');
        setLastName(user.last_name || '');
        const name = user.full_name || [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
        if (name) {
          patchUiSession({
            name,
            email: user.email ?? current?.email,
            phone: user.phone ?? current?.phone,
            userId: String(user.id),
          });
        }
      })
      .catch(() => undefined);

    if (current?.role === 'CLIENT') {
      void Promise.all([
        fetchClientProfile().catch(() => null),
        fetchFinancialProfile().catch(() => null),
        listEconomicActivities().catch(() => []),
      ]).then(([profile, financial, activities]) => {
        if (profile) {
          setCity(profile.city || '');
          setZone(profile.residential_zone || '');
          setOccupation(profile.occupation || '');
          setAddress(profile.address || '');
        }
        if (financial) {
          setMonthlyIncome(financial.monthly_income != null ? String(financial.monthly_income) : '');
          setOtherIncome(financial.other_income != null ? String(financial.other_income) : '');
          setMonthlyExpenses(financial.monthly_expenses != null ? String(financial.monthly_expenses) : '');
          setDebt(financial.existing_debt_payment != null ? String(financial.existing_debt_payment) : '');
          setDependents(financial.dependents_count != null ? String(financial.dependents_count) : '');
        }
        const activity = activities[0];
        if (activity) {
          setActivityId(activity.id);
          setActivityType(activity.activity_type || activity.sector || '');
          setActivityLocation(activity.location || '');
          setMonthlyRevenue(activity.monthly_revenue != null ? String(activity.monthly_revenue) : '');
          if (!occupation && (activity.activity_type || activity.sector)) {
            setOccupation(activity.activity_type || activity.sector || '');
          }
        }
      });
    }

    const userId = Number(current?.userId);
    if (userId) {
      void fetchProfilePhotoMeta()
        .then(async (meta) => {
          setHasPhoto(meta.has_photo);
          if (!meta.has_photo) {
            return;
          }
          const { blob } = await fetchUserPhotoFile(userId);
          const url = URL.createObjectURL(blob);
          setPhotoPreview(url);
        })
        .catch(() => undefined);
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const current = getUiSession();
    if (!current) {
      toast.danger('Session expirée. Reconnectez-vous.');
      return;
    }

    setSaving(true);
    try {
      if (photoFile) {
        await uploadProfilePhoto(photoFile, hasPhoto);
        setHasPhoto(true);
        notifyProfileChanged();
      }

      if (currentPassword || newPassword || confirmPassword) {
        if (newPassword.length < 8) {
          throw new Error('Le nouveau mot de passe doit contenir au moins 8 caractères.');
        }
        if (newPassword !== confirmPassword) {
          throw new Error('La confirmation du mot de passe ne correspond pas.');
        }
        await updateOwnPassword({
          current_password: currentPassword,
          password: newPassword,
          password_confirmation: confirmPassword,
        });
      }

      if (isClient) {
        await updateClientProfile({
          city: city.trim() || null,
          residential_zone: zone.trim() || null,
          occupation: occupation.trim() || activityType.trim() || null,
          address: address.trim() || null,
        });
        const revenue = Number(monthlyRevenue || monthlyIncome);
        if (activityType.trim() && revenue > 0) {
          const saved = await saveEconomicActivity(
            {
              activity_type: activityType.trim(),
              sector: occupation.trim() || activityType.trim(),
              location: activityLocation.trim() || null,
              monthly_revenue: revenue,
            },
            activityId,
          );
          if (saved?.id) {
            setActivityId(saved.id);
          }
        }
        const income = Number(monthlyIncome || monthlyRevenue);
        const charges = Number(monthlyExpenses);
        if (income > 0 || charges > 0) {
          await saveFinancialProfile({
            monthly_income: income || 0,
            other_income: Number(otherIncome) || 0,
            monthly_expenses: charges || 0,
            existing_debt_payment: Number(debt) || 0,
            dependents_count: Number(dependents) || 0,
          });
        }
        notifyProfileChanged();
      } else if (current.role === 'ADMIN' && current.userId) {
        await updateAdminUser(Number(current.userId), {
          first_name: firstName || current.name?.split(/\s+/)[0] || current.name,
          last_name: lastName || current.name?.split(/\s+/).slice(1).join(' ') || current.name,
          email: email.trim(),
          phone: phone.trim() || null,
        });
      } else if (current.role !== 'CLIENT') {
        toast.info('E-mail et téléphone du personnel se mettent à jour via l’administration.');
      }

      patchUiSession({
        name: displayName,
        identifier: email.trim() || current.identifier,
        email: email.trim(),
        phone: phone.trim(),
      });
      toast.success('Fiche enregistrée.');
      onClose();
    } catch (error) {
      toast.danger(isApiError(error) ? error.message : error instanceof Error ? error.message : 'Impossible d’enregistrer la fiche.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="cf-app-modal-backdrop" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div className="cf-app-modal" role="dialog" aria-modal="true" aria-labelledby="edit-profile-title" onClick={(event) => event.stopPropagation()}>
        <div className="cf-app-modal-header">
          <div className="cf-app-modal-header-main">
            <div className="cf-app-modal-icon">
              <i className="fas fa-user-pen"></i>
            </div>
            <div>
              <h3 id="edit-profile-title">Modifier mon profil</h3>
              <p>{isClient ? 'Adresse, activité, revenus et mot de passe' : 'Photo, coordonnées et mot de passe'}</p>
            </div>
          </div>
          <button type="button" className="cf-app-modal-close" onClick={onClose} title="Fermer">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={(event) => void onSubmit(event)}>
          <div className="cf-app-modal-body">
            <div className="cf-app-modal-summary">
              <img src={photoPreview} alt="Photo de profil" />
              <div className="min-w-0">
                <div className="cf-table-strong">{displayName}</div>
                <span className="badge badge-client" style={{ marginTop: 6, display: 'inline-flex' }}>
                  {roleProfile.name}
                </span>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: 8 }}>
                  <label className="btn btn-secondary btn-sm" style={{ display: 'inline-flex' }}>
                    <i className="fas fa-camera"></i> Changer la photo
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      style={{ display: 'none' }}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (!file) {
                          return;
                        }
                        setPhotoFile(file);
                        setPhotoPreview(URL.createObjectURL(file));
                      }}
                    />
                  </label>
                  {hasPhoto ? (
                    <Button type="button" variant="secondary" className="btn-sm" disabled={removingPhoto} onClick={() => void removePhoto()}>
                      <i className="fas fa-trash-can"></i> {removingPhoto ? 'Retrait…' : 'Retirer'}
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>

            {isClient ? (
              <>
                <div className="admin-form-grid">
                  <label className="form-group">
                    <span className="form-label">Ville</span>
                    <input className="form-control" value={city} onChange={(event) => setCity(event.target.value)} placeholder="Bamako" />
                  </label>
                  <label className="form-group">
                    <span className="form-label">Quartier / commune</span>
                    <input className="form-control" value={zone} onChange={(event) => setZone(event.target.value)} placeholder="Commune V" />
                  </label>
                  <label className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <span className="form-label">Adresse</span>
                    <input className="form-control" value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Quartier, marché…" />
                  </label>
                  <label className="form-group">
                    <span className="form-label">Activité</span>
                    <input className="form-control" value={activityType} onChange={(event) => setActivityType(event.target.value)} placeholder="Commerce, élevage…" />
                  </label>
                  <label className="form-group">
                    <span className="form-label">Emplacement</span>
                    <input className="form-control" value={activityLocation} onChange={(event) => setActivityLocation(event.target.value)} placeholder="Marché Médina" />
                  </label>
                  <label className="form-group">
                    <span className="form-label">Revenu mensuel (FCFA)</span>
                    <input className="form-control" type="number" min={0} value={monthlyIncome} onChange={(event) => setMonthlyIncome(event.target.value)} />
                  </label>
                  <label className="form-group">
                    <span className="form-label">Autres revenus (FCFA)</span>
                    <input className="form-control" type="number" min={0} value={otherIncome} onChange={(event) => setOtherIncome(event.target.value)} />
                  </label>
                  <label className="form-group">
                    <span className="form-label">Charges mensuelles (FCFA)</span>
                    <input className="form-control" type="number" min={0} value={monthlyExpenses} onChange={(event) => setMonthlyExpenses(event.target.value)} />
                  </label>
                  <label className="form-group">
                    <span className="form-label">Autres mensualités (FCFA)</span>
                    <input className="form-control" type="number" min={0} value={debt} onChange={(event) => setDebt(event.target.value)} />
                  </label>
                  <label className="form-group">
                    <span className="form-label">Chiffre d’affaires déclaré</span>
                    <input className="form-control" type="number" min={0} value={monthlyRevenue} onChange={(event) => setMonthlyRevenue(event.target.value)} />
                  </label>
                  <label className="form-group">
                    <span className="form-label">Personnes à charge</span>
                    <input className="form-control" type="number" min={0} value={dependents} onChange={(event) => setDependents(event.target.value)} />
                  </label>
                </div>
              </>
            ) : (
              <div className="admin-form-grid">
                <label className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <span className="form-label">E-mail professionnel</span>
                  <input className="form-control" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
                </label>
                <label className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <span className="form-label">Téléphone</span>
                  <input className="form-control" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} />
                </label>
              </div>
            )}

            <div className="admin-form-grid" style={{ marginTop: '0.75rem' }}>
              <label className="form-group">
                <span className="form-label">Mot de passe actuel</span>
                <input className="form-control" type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} autoComplete="current-password" />
              </label>
              <label className="form-group">
                <span className="form-label">Nouveau mot de passe</span>
                <input className="form-control" type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} autoComplete="new-password" />
              </label>
              <label className="form-group" style={{ gridColumn: '1 / -1' }}>
                <span className="form-label">Confirmation</span>
                <input className="form-control" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" />
              </label>
            </div>
          </div>

          <div className="cf-app-modal-footer">
            <Button type="button" variant="secondary" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={saving}>
              <i className="fas fa-floppy-disk"></i> {saving ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
