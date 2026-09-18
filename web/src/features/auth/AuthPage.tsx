import { toast } from '@heroui/react';
import { useEffect, useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { getUiSession, setUiSession } from '@/app/session';
import { Button } from '@/shared/ui';

const SLIDE_COUNT = 3;
const REMEMBER_ME_KEY = 'REMEMBER_ME_CRED';

export function AuthPage() {
  const navigate = useNavigate();
  const [slideIndex, setSlideIndex] = useState(0);
  const [isHeroHovered, setIsHeroHovered] = useState(false);
  const [identifier, setIdentifier] = useState(() => {
    return window.localStorage.getItem(REMEMBER_ME_KEY) ?? '';
  });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isHeroHovered) {
      return;
    }

    const timer = window.setInterval(() => {
      setSlideIndex((current) => (current + 1) % SLIDE_COUNT);
    }, 4500);

    return () => window.clearInterval(timer);
  }, [isHeroHovered]);

  const goToSlide = (index: number) => {
    setSlideIndex(((index % SLIDE_COUNT) + SLIDE_COUNT) % SLIDE_COUNT);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const rawInput = identifier.trim();

    if (rememberMe && rawInput) {
      window.localStorage.setItem(REMEMBER_ME_KEY, rawInput);
    } else {
      window.localStorage.removeItem(REMEMBER_ME_KEY);
    }

    setIsSubmitting(true);

    toast.promise(
      new Promise<{ ok: true }>((resolve, reject) => {
        if (!rawInput || !password.trim()) {
          setIsSubmitting(false);
          reject(new Error('Saisissez vos identifiants.'));
          return;
        }

        window.setTimeout(() => {
          setUiSession({ identifier: rawInput, role: 'CLIENT' });
          setIsSubmitting(false);
          resolve({ ok: true });
          navigate('/app/client');
        }, 800);
      }),
      {
        loading: 'Authentification sécurisée...',
        success: 'Espace chargé',
        error: (err) => err.message,
      },
    );
  };

  if (getUiSession()) {
    return <Navigate to="/app/client" replace />;
  }

  return (
    <div id="auth-view">
      <div className="auth-container">
        <div
          className="auth-hero-pane"
          id="auth-hero-pane"
          onMouseEnter={() => setIsHeroHovered(true)}
          onMouseLeave={() => setIsHeroHovered(false)}
        >
          <div className="auth-hero-slider full-bleed" id="auth-hero-slider">
            <div className="auth-slider-track">
              <div className={`auth-slide${slideIndex === 0 ? ' active' : ''}`} data-slide="0">
                <img
                  src="/images/slide4.png"
                  alt="Financement TPE & Particuliers"
                  className="auth-slide-img"
                />
                <div
                  className="auth-slide-bg"
                  style={{ backgroundImage: "url('/images/slide4.png')" }}
                ></div>
                <div className="auth-slide-overlay"></div>
              </div>

              <div className={`auth-slide${slideIndex === 1 ? ' active' : ''}`} data-slide="1">
                <img
                  src="/images/slide5.png"
                  alt="Déblocage rapide < 48h"
                  className="auth-slide-img"
                />
                <div
                  className="auth-slide-bg"
                  style={{ backgroundImage: "url('/images/slide5.png')" }}
                ></div>
                <div className="auth-slide-overlay"></div>
              </div>

              <div className={`auth-slide${slideIndex === 2 ? ' active' : ''}`} data-slide="2">
                <img
                  src="/images/slide3.jpg"
                  alt="Paiement Mobile Money flexible"
                  className="auth-slide-img"
                />
                <div
                  className="auth-slide-bg"
                  style={{ backgroundImage: "url('/images/slide3.jpg')" }}
                ></div>
                <div className="auth-slide-overlay"></div>
              </div>
            </div>
          </div>

          <div className="auth-hero-foreground">
            <div className="auth-hero-top">
              <div className="auth-brand">
                <div className="auth-brand-logo">
                  <i className="fas fa-hand-holding-dollar"></i>
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: '1.4rem',
                      fontWeight: 800,
                      margin: 0,
                      color: 'white',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    CreditFast
                  </h3>
                  <span
                    style={{
                      fontSize: '0.74rem',
                      color: '#fbbf24',
                      fontWeight: 700,
                      letterSpacing: '0.5px',
                    }}
                  >
                    Scoring & octroi de microcrédit
                  </span>
                </div>
              </div>
            </div>

            <div className="auth-hero-center">
              <div
                className={`auth-slide-text-block${slideIndex === 0 ? ' active' : ''}`}
                data-slide-text="0"
              >
                <span className="auth-slide-tag-pill tag-emerald">
                  <i className="fas fa-shop"></i> 1. Financement sur-mesure
                </span>
                <h1 className="auth-hero-title">Financez vos projets et développez votre activité</h1>
                <p className="auth-hero-desc">
                  Une solution 100% digitale pour concrétiser vos ambitions : simulation de crédit
                  en direct, constitution de dossier simplifiée et obtention d'une offre claire
                  adaptée à votre trésorerie.
                </p>
              </div>

              <div
                className={`auth-slide-text-block${slideIndex === 1 ? ' active' : ''}`}
                data-slide-text="1"
              >
                <span className="auth-slide-tag-pill tag-sky">
                  <i className="fas fa-bolt"></i> 2. Décision & Déblocage Rapide
                </span>
                <h1 className="auth-hero-title">Votre argent disponible sans attente inutile</h1>
                <p className="auth-hero-desc">
                  Suivez l'avancement de votre dossier 24h/24 depuis votre téléphone. Après
                  validation par nos analystes et le comité, vos fonds sont mis à votre disposition
                  en moins de 48 heures.
                </p>
              </div>

              <div
                className={`auth-slide-text-block${slideIndex === 2 ? ' active' : ''}`}
                data-slide-text="2"
              >
                <span className="auth-slide-tag-pill tag-purple">
                  <i className="fas fa-wallet"></i> 3. Paiement Mobile Flexible
                </span>
                <h1 className="auth-hero-title">Remboursez vos mensualités en toute tranquillité</h1>
                <p className="auth-hero-desc">
                  Payez vos échéances directement par Mobile Money (Wave, Orange Money, Moov Money,
                  Free Money), consultez votre solde en temps réel et téléchargez vos quittances
                  officielles.
                </p>
              </div>
            </div>

            <div className="auth-hero-bottom">
              <div className="auth-hero-nav-bar">
                <div className="auth-slider-dots-bar" id="auth-slider-dots">
                  <button
                    type="button"
                    className={`auth-slider-dot${slideIndex === 0 ? ' active' : ''}`}
                    onClick={() => goToSlide(0)}
                    aria-label="Slide 1 : Financement d'activité"
                    title="Financement d'activité"
                  ></button>
                  <button
                    type="button"
                    className={`auth-slider-dot${slideIndex === 1 ? ' active' : ''}`}
                    onClick={() => goToSlide(1)}
                    aria-label="Slide 2 : Déblocage rapide"
                    title="Déblocage en < 48h"
                  ></button>
                  <button
                    type="button"
                    className={`auth-slider-dot${slideIndex === 2 ? ' active' : ''}`}
                    onClick={() => goToSlide(2)}
                    aria-label="Slide 3 : Remboursement Mobile Money"
                    title="Remboursement Mobile Money"
                  ></button>
                </div>

                <div className="auth-slider-controls">
                  <button
                    type="button"
                    className="auth-slider-btn"
                    onClick={() => goToSlide(slideIndex - 1)}
                    aria-label="Photo précédente"
                    title="Précédent"
                  >
                    <i className="fas fa-chevron-left"></i>
                  </button>
                  <button
                    type="button"
                    className="auth-slider-btn"
                    onClick={() => goToSlide(slideIndex + 1)}
                    aria-label="Photo suivante"
                    title="Suivant"
                  >
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
              </div>

              <div className="auth-countries-strip">
                <i className="fas fa-location-dot text-emerald"></i>
                <span>
                  Plateforme Nationale CreditFast Mali : <span className="fi fi-ml"></span> Bamako
                  & Régions • Conformité
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-form-pane">
          <div className="auth-form-box">
            <div className="auth-mobile-brand">
              <div className="auth-brand-logo">
                <i className="fas fa-bolt"></i>
              </div>
              <div>
                <h4
                  className="m-0 fw-bold"
                  style={{
                    color: 'var(--primary-700, #3730a3)',
                    fontSize: '1.15rem',
                    lineHeight: 1.2,
                  }}
                >
                  Crédit Fast
                </h4>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                  Plateforme Régionale CreditFast •
                </span>
              </div>
            </div>

            <div className="auth-header">
              <h2>Portail d'Accès Sécurisé</h2>
              <p>Saisissez vos identifiants pour accéder à votre espace.</p>
            </div>

            <form id="login-form" noValidate onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="login-email">
                  Identifiant, ou Numéro de Téléphone
                </label>
                <div className="input-with-icon">
                  <i className="fas fa-user-check input-prefix-icon"></i>
                  <input
                    type="text"
                    id="login-email"
                    className="form-control"
                    placeholder="Email ou numéro de téléphone"
                    value={identifier}
                    autoComplete="username"
                    required
                    onChange={(event) => setIdentifier(event.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.35rem',
                  }}
                >
                  <label className="form-label" htmlFor="login-password" style={{ marginBottom: 0 }}>
                    Mot de Passe
                  </label>
                </div>
                <div className="input-with-icon input-with-suffix">
                  <i className="fas fa-lock input-prefix-icon"></i>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="login-password"
                    className="form-control"
                    value={password}
                    placeholder="Saisissez votre mot de passe"
                    autoComplete="current-password"
                    required
                    onChange={(event) => setPassword(event.target.value)}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    id="btn-toggle-password"
                    title="Afficher ou masquer le mot de passe"
                    aria-label="Afficher ou masquer le mot de passe"
                    onClick={() => setShowPassword((current) => !current)}
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>

              <div className="auth-options-row">
                <label className="auth-checkbox-label" htmlFor="remember-me-checkbox">
                  <input
                    type="checkbox"
                    id="remember-me-checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                  />
                  <span>Mémoriser ma session</span>
                </label>
                <a
                  href="#forgot-password"
                  className="auth-link-subtle"
                  onClick={(event) => {
                    event.preventDefault();
                    toast.info('La réinitialisation du mot de passe sera bientôt disponible.');
                  }}
                >
                  Mot de passe oublié ?
                </a>
              </div>

              <Button
                type="submit"
                id="btn-submit-login"
                variant="primary"
                className="auth-submit-btn"
                disabled={isSubmitting}
              >
                <span id="login-btn-content">
                  {isSubmitting ? (
                    <>
                      <i className="fas fa-circle-notch fa-spin mr-2"></i> Authentification
                      sécurisée...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-right-to-bracket mr-1"></i> Se Connecter à mon Espace
                    </>
                  )}
                </span>
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
