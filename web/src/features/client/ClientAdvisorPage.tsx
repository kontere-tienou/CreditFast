import { Screen } from '@/shared/ui/Screen';
import { Button } from '@/shared/ui/Button';
import { callApp } from '@/shared/ui/legacy';

export function ClientAdvisorPage() {
  return (
    <Screen viewId="view-client-advisor">
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <i className="fas fa-headset text-primary mr-2"></i> Mon Conseiller Dédié & Agence CreditFast
          </h2>
          <p className="page-subtitle">Échangez directement avec votre conseiller personnel et planifiez vos rendez-vous d&apos;accompagnement</p>
        </div>
        <div className="page-actions">
          <Button onClick={() => callApp('openAppointmentModal')}>
            <i className="fas fa-calendar-plus"></i> Prendre Rendez-vous
          </Button>
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ position: 'relative', width: 84, height: 84, margin: '0 auto 1rem auto' }}>
            <img src="/images/profil/profil01-03.jpg" alt="Adama Traore" className="user-avatar" style={{ width: 84, height: 84, border: '3px solid var(--primary-200)', boxShadow: 'var(--shadow-md)' }} />
            <span
              style={{ position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, background: '#518e45', border: '2px solid white', borderRadius: '50%' }}
              title="En ligne actuellement"
            ></span>
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: 2 }}>Adama Traore</h3>
          <div style={{ fontSize: '0.8rem', color: 'var(--primary-600)', fontWeight: 700, marginBottom: 4 }}>Votre Expert Accompagnement Microfinance</div>
          <span className="badge badge-approved" style={{ fontSize: '0.7rem', marginBottom: '1.25rem' }}>
            <i className="fas fa-circle-check"></i> Conseiller Attitré Actif
          </span>
          <div style={{ textAlign: 'left', fontSize: '0.8rem', lineHeight: 1.8, color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <i className="fas fa-building-columns text-primary mr-2"></i> <strong>Agence :</strong> Caisse CreditFast Grand Marché (Bamako, Mali)
            </div>
            <div>
              <i className="fas fa-phone text-primary mr-2"></i> <strong>Direct :</strong> +223 20 22 44 00
            </div>
            <div>
              <i className="fas fa-mobile-screen text-primary mr-2"></i> <strong>Mobile :</strong> +223 77 54 01 28
            </div>
            <div>
              <i className="fas fa-envelope text-primary mr-2"></i> <strong>Email :</strong> adama.traore@cif-ao.org
            </div>
            <div>
              <i className="fas fa-language text-primary mr-2"></i> <strong>Langues :</strong> Français, Bambara, Soninké
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Button variant="secondary" className="btn-sm" style={{ width: '100%' }} onClick={() => callApp('showToast', 'Appel direct initié vers le poste de Adama Traore (+223 20 22 44 00)...', 'info')}>
              <i className="fas fa-phone-volume mr-1"></i> Appeler le Conseiller
            </Button>
          </div>
        </div>

        <div className="card" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', minHeight: 520 }}>
          <div className="card-header" style={{ padding: '0.85rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 10, height: 10, background: '#518e45', borderRadius: '50%' }}></div>
              <div>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700, margin: 0 }}>Discussion Sécurisée avec Adama Traore</h4>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>Projet REQ-2026-0891 (Stock Tissus Wax) • Réponse moyenne sous 15 min</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <Button variant="secondary" className="btn-sm" onClick={() => callApp('showToast', 'Historique des échanges archivé au format PDF', 'info')}>
                <i className="fas fa-download"></i> <span className="hide-xs">Exporter</span>
              </Button>
            </div>
          </div>

          <div id="advisor-chat-messages" style={{ flex: 1, padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--bg-body)' }}>
            <ChatFromAdvisor time="Adama Traore • 11/08/2026 à 11:30">
              Bonjour Madame Ndiaye, j&apos;ai bien reçu votre demande de financement de 2 500 000 FCFA pour le stock de tissus. Vos devis et pièces sont très clairs et nos
              équipes ont validé la conformité de vos documents. Votre projet avance parfaitement.
            </ChatFromAdvisor>
            <ChatFromBorrower time="Vous • 11/08/2026 à 14:12">
              Merci Monsieur Traore. Mon fournisseur à Bamako m&apos;a confirmé la réservation du conteneur jusqu&apos;au 22 août. Est-ce que le versement des fonds pourra se
              faire avant cette date dès l&apos;accord ?
            </ChatFromBorrower>
            <ChatFromAdvisor time="Adama Traore • 12/08/2026 à 09:20">
              Absolument ! La commission se réunit le 20 août. Dès la décision favorable, vos fonds seront immédiatement mis à votre disposition sur votre compte CreditFast
              ou par transfert Mobile Money selon votre préférence dès le 21 août au matin.
            </ChatFromAdvisor>
          </div>

          <div style={{ padding: '0.85rem 1.25rem', background: 'var(--bg-surface)', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Button variant="secondary" className="btn-sm" title="Joindre un document ou une photo" onClick={() => document.getElementById('client-file-input')?.click()}>
              <i className="fas fa-paperclip"></i>
            </Button>
            <input
              type="text"
              id="advisor-msg-input"
              className="form-control"
              placeholder="Écrivez votre message à Adama Traore..."
              style={{ flex: 1, fontSize: '0.85rem' }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  callApp('sendAdvisorMessage');
                }
              }}
            />
            <Button className="btn-sm" onClick={() => callApp('sendAdvisorMessage')}>
              <i className="fas fa-paper-plane"></i> Envoyer
            </Button>
          </div>
        </div>
      </div>
    </Screen>
  );
}

function ChatFromAdvisor({ time, children }: { time: string; children: string }) {
  return (
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', maxWidth: '80%' }}>
      <img src="/images/profil/profil01-03.jpg" alt="Adama" className="user-avatar" style={{ width: 32, height: 32, flexShrink: 0 }} />
      <div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', marginBottom: 2 }}>{time}</div>
        <div
          style={{
            background: 'var(--bg-surface)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            fontSize: '0.82rem',
            lineHeight: 1.5,
            color: 'var(--text-primary)',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function ChatFromBorrower({ time, children }: { time: string; children: string }) {
  return (
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', maxWidth: '80%', alignSelf: 'flex-end', flexDirection: 'row-reverse' }}>
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: 'var(--primary-600)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.8rem',
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        FN
      </div>
      <div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', marginBottom: 2, textAlign: 'right' }}>{time}</div>
        <div style={{ background: 'var(--primary-600)', color: 'white', padding: '0.75rem 1rem', borderRadius: 'var(--radius-lg)', fontSize: '0.82rem', lineHeight: 1.5 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
