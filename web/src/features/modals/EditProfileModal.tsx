import { callApp } from '@/shared/ui/legacy';

export function EditProfileModal() {
  return (
    <>
{/* ==========================================================================
     MODAL: MODIFIER LE PROFIL UTILISATEUR (Email & Téléphone / Mobile Money)
     Confédération des Institutions Financières d'Afrique de l'Ouest (CIF)
     ========================================================================== */}
<div id="modal-edit-profile" className="fixed inset-0 z-50 hidden items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
  <div className="max-h-[90vh] w-full max-w-[520px] overflow-y-auto rounded-2xl bg-white shadow-2xl">

    {/* HEADER */}
    <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
      <div>
        <h3 className="mb-0.5 flex items-center gap-2 text-[1.15rem] font-bold text-slate-900">
          <i className="fas fa-user-pen text-primary"></i>
          Modifier mon Profil
        </h3>

        <p className="text-[0.78rem] text-slate-500">
          Mettez à jour votre adresse e-mail professionnelle et votre numéro de contact
        </p>
      </div>

      <button type="button" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" onClick={() => callApp("closeEditProfileModal")} title="Fermer la fenêtre">
        &times;
      </button>
    </div>

    <form id="edit-profile-form" onSubmit={(event) => { event.preventDefault(); callApp("saveUserProfile"); }}>
      <div className="px-5 py-5">

        {/* User Summary Card */}
        <div className="mb-5 flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="topbar-avatar-wrap">
            <img id="edit-profile-avatar-img" src="" alt="Avatar" className="h-12 w-12 rounded-full border-2 border-indigo-500 object-cover" />

            {/* <span class="avatar-flag-badge lg" id="edit-profile-avatar-flag"></span> */}
          </div>

          <div className="min-w-0 flex-1">
            <h5 id="edit-profile-card-name" className="mb-0.5 text-[0.95rem] font-bold text-slate-900"></h5>

            <div className="flex flex-wrap items-center gap-2">
              <span id="edit-profile-card-role" className="rounded-full bg-indigo-50 px-2 py-0.5 text-[0.7rem] font-medium text-indigo-700"></span>

              <span id="edit-profile-card-location" className="inline-flex items-center gap-1 text-[0.72rem] text-slate-500">
                <i className="fas fa-location-dot"></i>
                <span></span>
              </span>
            </div>
          </div>
        </div>

        {/* EMAIL */}
        <div className="mb-4">
          <label htmlFor="edit-profile-email" className="mb-1.5 flex items-center gap-2 text-[0.82rem] font-semibold text-slate-700">
            <i className="fas fa-envelope text-primary"></i>
            Adresse E-mail Professionnelle
            <span className="text-red-500">*</span>
          </label>

          <div className="relative">
            <input type="email" id="edit-profile-email" className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10" placeholder="nom.prenom@cif-ao.org" required />

            <i className="fas fa-at absolute left-3 top-1/2 -translate-y-1/2 text-[0.85rem] text-slate-400"></i>
          </div>

          <small className="mt-1 block text-[0.7rem] text-slate-500">
            Utilisée pour les alertes de sécurité, rapports de crédit et convocations.
          </small>
        </div>

        {/* TELEPHONE */}
        <div className="mb-4">
          <label htmlFor="edit-profile-phone" className="mb-1.5 flex items-center gap-2 text-[0.82rem] font-semibold text-slate-700">
            <i className="fas fa-phone text-emerald-600"></i>
            Numéro de Téléphone / Mobile Money
            <span className="text-red-500">*</span>
          </label>

          <div className="relative">
            <input type="tel" id="edit-profile-phone" className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10" placeholder="+226 70 12 34 56" required />

            <i className="fas fa-mobile-screen absolute left-3 top-1/2 -translate-y-1/2 text-[0.85rem] text-slate-400"></i>
          </div>

          <small className="mt-1 block text-[0.7rem] text-slate-500">
            Format international (ex: +223 77..., +228 90..., +226 70...).
            Alertes instantanées SMS &amp; WhatsApp.
          </small>
        </div>

        {/* TITRE */}
        <div className="mb-2">
          <label htmlFor="edit-profile-title" className="mb-1.5 flex items-center gap-2 text-[0.82rem] font-semibold text-slate-700">
            <i className="fas fa-id-badge text-sky-600"></i>
            Titre &amp; Fonction CreditFast
          </label>

          <input type="text" id="edit-profile-title" className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-3 py-2.5 text-[0.82rem] text-slate-500 outline-none" readOnly />
        </div>

        {/* SECURITY INFO */}
        <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-dashed border-indigo-500/25 bg-indigo-500/[0.06] px-3.5 py-2.5">
          <i className="fas fa-shield-halved mt-0.5 text-base text-primary"></i>

          <span className="text-[0.72rem] leading-[1.4] text-slate-600">
            Vos coordonnées sont chiffrées selon les standards de sécurité UEMOA.
            Toute modification prend effet immédiatement sur vos alertes en temps réel.
          </span>
        </div>

      </div>

      {/* FOOTER */}
      <div className="flex justify-end gap-3 border-t border-slate-200 px-5 py-4">
        <button type="button" className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100" onClick={() => callApp("closeEditProfileModal")}>
          Annuler
        </button>

        <button type="submit" id="btn-save-user-profile" className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20">
          <i className="fas fa-floppy-disk"></i>
          Enregistrer les Modifications
        </button>
      </div>
    </form>

  </div>
</div>
    </>
  );
}
