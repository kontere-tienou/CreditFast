import { useEffect, useState, type FormEvent } from 'react';
import { toast } from '@heroui/react';
import {
  deleteEconomicActivity,
  deleteProfilePhoto,
  fetchClientProfile,
  fetchCurrentUser,
  fetchFinancialProfile,
  fetchProfilePhotoMeta,
  fetchUserPhotoFile,
  isApiError,
  listEconomicActivities,
  saveEconomicActivity,
  saveFinancialProfile,
  updateClientProfile,
  updateOwnPassword,
  uploadProfilePhoto,
} from '@/api';
import { ROLE_PROFILES } from '@/app/roles';
import { getUiSession, patchUiSession } from '@/app/session';
import { Button } from '@/shared/ui/Button';
import { notifyProfileChanged } from '@/features/workflow/workflow';

const DEFAULT_AVATAR = '/images/profil/profil01-01.jpg';

type BorrowerProfileFormProps = {
  onSaved?: () => void;
};

export function BorrowerProfileForm({ onSaved }: BorrowerProfileFormProps) {
  const session = getUiSession();
  const roleProfile = ROLE_PROFILES.CLIENT;
  const [phone, setPhone] = useState(session?.phone || '');
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
  const [loading, setLoading] = useState(true);
  const [removingPhoto, setRemovingPhoto] = useState(false);
  const [removingActivity, setRemovingActivity] = useState(false);

  const displayName = session?.name || roleProfile.displayName;

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

  const removeActivity = async () => {
    if (!activityId || removingActivity) {
      return;
    }
    if (!window.confirm('Supprimer cette activité de votre fiche ? Impossible si elle est liée à une demande déjà transmise.')) {
      return;
    }
    setRemovingActivity(true);
    try {
      await deleteEconomicActivity(activityId);
      setActivityId(undefined);
      setActivityType('');
      setActivityLocation('');
      setMonthlyRevenue('');
      notifyProfileChanged();
      toast.success('Activité supprimée.');
    } catch (error) {
      toast.danger(isApiError(error) ? error.message : 'Impossible de supprimer cette activité : elle est liée à un dossier transmis.');
    } finally {
      setRemovingActivity(false);
    }
  };

  useEffect(() => {
    let previewUrl: string | null = null;
    const current = getUiSession();
    setPhone(current?.phone || '');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPhotoFile(null);
    setLoading(true);

    const load = async () => {
      try {
        const user = await fetchCurrentUser().catch(() => null);
        if (user) {
          setPhone(user.phone || current?.phone || '');
          const name = user.full_name || [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
          if (name) {
            patchUiSession({
              name,
              email: user.email ?? current?.email,
              phone: user.phone ?? current?.phone,
              userId: String(user.id),
            });
          }
        }

        const [profile, financial, activities] = await Promise.all([
          fetchClientProfile().catch(() => null),
          fetchFinancialProfile().catch(() => null),
          listEconomicActivities().catch(() => []),
        ]);
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
          if (!profile?.occupation && (activity.activity_type || activity.sector)) {
            setOccupation(activity.activity_type || activity.sector || '');
          }
        }

        const userId = Number(user?.id ?? current?.userId);
        if (userId) {
          const meta = await fetchProfilePhotoMeta().catch(() => ({ has_photo: false, profile_photo_url: null }));
          setHasPhoto(meta.has_photo);
          if (meta.has_photo) {
            const { blob } = await fetchUserPhotoFile(userId);
            previewUrl = URL.createObjectURL(blob);
            setPhotoPreview(previewUrl);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    void load();
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, []);

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
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }

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
      toast.success('Fiche enregistrée.');
      onSaved?.();
    } catch (error) {
      toast.danger(isApiError(error) ? error.message : error instanceof Error ? error.message : 'Impossible d’enregistrer la fiche.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={(event) => void onSubmit(event)}>
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <i className="fas fa-user-pen text-primary mr-2"></i> Mon profil
          </h2>
          <p className="page-subtitle">Adresse, activité, revenus et mot de passe. Ces informations alimentent vos demandes.</p>
        </div>
        <div className="page-actions">
          <Button type="submit" disabled={saving || loading}>
            <i className="fas fa-floppy-disk"></i> {saving ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="card-body" style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <img
            src={photoPreview}
            alt="Photo de profil"
            style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--border-color)' }}
          />
          <div className="min-w-0">
            <div className="cf-table-strong" style={{ fontSize: '1.05rem' }}>
              {displayName}
            </div>
            <span className="badge badge-client" style={{ marginTop: 6, display: 'inline-flex' }}>
              {roleProfile.name}
            </span>
            {phone ? (
              <div className="cf-table-muted" style={{ marginTop: 6 }}>
                {phone}
              </div>
            ) : null}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: 10 }}>
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
                  <i className="fas fa-trash-can"></i> {removingPhoto ? 'Retrait…' : 'Retirer la photo'}
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="card-header">
          <h3 className="card-title">
            <i className="fas fa-location-dot text-primary"></i> Adresse
          </h3>
        </div>
        <div className="card-body">
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
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <h3 className="card-title" style={{ margin: 0 }}>
            <i className="fas fa-store text-primary"></i> Activité
          </h3>
          {activityId ? (
            <Button type="button" variant="secondary" className="btn-xs" disabled={removingActivity} onClick={() => void removeActivity()} title="Supprimer cette activité de votre fiche">
              <i className="fas fa-trash-can"></i> {removingActivity ? 'Suppression…' : 'Supprimer l’activité'}
            </Button>
          ) : null}
        </div>
        <div className="card-body">
          <div className="admin-form-grid">
            <label className="form-group">
              <span className="form-label">Activité</span>
              <input className="form-control" value={activityType} onChange={(event) => setActivityType(event.target.value)} placeholder="Commerce, élevage…" />
            </label>
            <label className="form-group">
              <span className="form-label">Emplacement</span>
              <input className="form-control" value={activityLocation} onChange={(event) => setActivityLocation(event.target.value)} placeholder="Marché Médina" />
            </label>
            <label className="form-group">
              <span className="form-label">Chiffre d’affaires déclaré (FCFA)</span>
              <input className="form-control" type="number" min={0} value={monthlyRevenue} onChange={(event) => setMonthlyRevenue(event.target.value)} />
            </label>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="card-header">
          <h3 className="card-title">
            <i className="fas fa-wallet text-primary"></i> Revenus et charges
          </h3>
        </div>
        <div className="card-body">
          <div className="admin-form-grid">
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
              <span className="form-label">Personnes à charge</span>
              <input className="form-control" type="number" min={0} value={dependents} onChange={(event) => setDependents(event.target.value)} />
            </label>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <i className="fas fa-lock text-primary"></i> Mot de passe
          </h3>
        </div>
        <div className="card-body">
          <div className="admin-form-grid">
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
      </div>
    </form>
  );
}
