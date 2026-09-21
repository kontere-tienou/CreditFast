import { toast } from '@heroui/react';
import { useEffect, useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { loginWithCredentials, registerClient } from '@/api';
import { getUiSession } from '@/app/session';
import { ROLE_PROFILES } from '@/app/roles';
import { Button } from '@/shared/ui';

const SLIDE_COUNT = 3;
const REMEMBER_ME_KEY = 'REMEMBER_ME_CRED';

export function AuthPage() {
  const navigate = useNavigate();
  const [slideIndex, setSlideIndex] = useState(0);
  const [isHeroHovered, setIsHeroHovered] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [identifier, setIdentifier] = useState(() => {
    return window.localStorage.getItem(REMEMBER_ME_KEY) ?? '';
  });
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

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

  const enterWorkspace = async (rawInput: string, secret: string) => {
    const session = await loginWithCredentials(rawInput, secret, { persist: rememberMe });
    navigate(ROLE_PROFILES[session.role].homePath);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const rawInput = String(formData.get('identifier') || identifier).trim();
    const secret = String(formData.get('password') || password);
    const givenName = String(formData.get('first_name') || firstName).trim();
    const familyName = String(formData.get('last_name') || lastName).trim();
    const confirm = String(formData.get('password_confirm') || passwordConfirm);

    if (rememberMe && rawInput && mode === 'login') {
      window.localStorage.setItem(REMEMBER_ME_KEY, rawInput);
    } else if (!rememberMe) {
      window.localStorage.removeItem(REMEMBER_ME_KEY);
    }

    setFormError('');
    setIsSubmitting(true);

    toast.promise(
      (async () => {
        if (!rawInput || !secret.trim()) {
          throw new Error('Saisissez vos identifiants.');
        }
        if (mode === 'register') {
          if (!givenName || !familyName) {
            throw new Error('Saisissez le prénom et le nom.');
          }
          if (secret.length < 8) {
            throw new Error('Le mot de passe doit contenir au moins 8 caractères.');
          }
          if (secret !== confirm) {
            throw new Error('La confirmation du mot de passe ne correspond pas.');
          }
          await registerClient({
            first_name: givenName,
            last_name: familyName,
            phone: rawInput,
            password: secret,
          });
        }
        await enterWorkspace(rawInput, secret);
      })()
        .catch((err) => {
          setFormError(err instanceof Error ? err.message : 'Connexion impossible');
          throw err;
        })
        .finally(() => setIsSubmitting(false)),
      {
        loading: mode === 'register' ? 'Création du compte…' : 'Authentification sécurisée...',
        success: mode === 'register' ? 'Compte créé, espace chargé' : 'Espace chargé',
        error: (err) => (err instanceof Error ? err.message : 'Connexion impossible'),
      },
    );
  };

  if (getUiSession()) {
    const session = getUiSession();
    return <Navigate to={session ? ROLE_PROFILES[session.role].homePath : '/app/client'} replace />;
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
                      color: '#ffd700',
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
                    color: 'var(--primary-700)',
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
              <h2>{mode === 'register' ? 'Créer un compte client' : "Portail d'Accès Sécurisé"}</h2>
              <p>
                {mode === 'register'
                  ? 'Inscription publique : téléphone unique + mot de passe (8 caractères min.). Puis connexion automatique.'
                  : 'Client : téléphone + mot de passe. Équipe : e-mail professionnel. Le compte client n’accepte pas l’e-mail.'}
              </p>
            </div>

            <form id="login-form" noValidate onSubmit={handleSubmit}>
              {mode === 'register' ? (
                <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                  <div>
                    <label className="form-label" htmlFor="register-first-name">
                      Prénom
                    </label>
                    <input
                      type="text"
                      id="register-first-name"
                      name="first_name"
                      className="form-control"
                      value={firstName}
                      autoComplete="given-name"
                      required
                      onChange={(event) => setFirstName(event.target.value)}
                    />
                  </div>
                  <div>
                    <label className="form-label" htmlFor="register-last-name">
                      Nom
                    </label>
                    <input
                      type="text"
                      id="register-last-name"
                      name="last_name"
                      className="form-control"
                      value={lastName}
                      autoComplete="family-name"
                      required
                      onChange={(event) => setLastName(event.target.value)}
                    />
                  </div>
                </div>
              ) : null}

              <div className="form-group">
                <div className="cf-auth-field-head">
                  <label className="form-label" htmlFor="login-email">
                    {mode === 'register' ? 'Téléphone' : 'Téléphone ou e-mail professionnel'}
                  </label>
                  {formError ? (
                    <i
                      className="fas fa-circle-exclamation cf-auth-field-error-icon"
                      title={formError}
                      aria-label={formError}
                      role="img"
                    ></i>
                  ) : null}
                </div>
                <div className="input-with-icon">
                  <i className="fas fa-user-check input-prefix-icon"></i>
                  <input
                    type="text"
                    id="login-email"
                    name="identifier"
                    className="form-control"
                    placeholder="+223 70 12 34 56"
                    value={identifier}
                    autoComplete="username"
                    required
                    aria-invalid={formError ? true : undefined}
                    onChange={(event) => {
                      setIdentifier(event.target.value);
                      if (formError) {
                        setFormError('');
                      }
                    }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="login-password">
                  Mot de Passe
                </label>
                <div className="input-with-icon input-with-suffix">
                  <i className="fas fa-lock input-prefix-icon"></i>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="login-password"
                    name="password"
                    className="form-control"
                    value={password}
                    placeholder={mode === 'register' ? '8 caractères minimum' : 'Saisissez votre mot de passe'}
                    autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
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

              {mode === 'register' ? (
                <div className="form-group">
                  <label className="form-label" htmlFor="register-password-confirm">
                    Confirmer le mot de passe
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="register-password-confirm"
                    name="password_confirm"
                    className="form-control"
                    value={passwordConfirm}
                    autoComplete="new-password"
                    required
                    onChange={(event) => setPasswordConfirm(event.target.value)}
                  />
                </div>
              ) : null}

              {mode === 'login' ? (
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
                  <button
                    type="button"
                    className="auth-link-subtle"
                    onClick={() => {
                      setMode('register');
                      setFormError('');
                    }}
                  >
                    Créer un compte client
                  </button>
                </div>
              ) : (
                <div className="auth-options-row">
                  <span />
                  <button
                    type="button"
                    className="auth-link-subtle"
                    onClick={() => {
                      setMode('login');
                      setFormError('');
                    }}
                  >
                    Déjà un compte ? Se connecter
                  </button>
                </div>
              )}

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
                      <i className="fas fa-circle-notch fa-spin mr-2"></i>{' '}
                      {mode === 'register' ? 'Création du compte…' : 'Authentification sécurisée...'}
                    </>
                  ) : mode === 'register' ? (
                    <>
                      <i className="fas fa-user-plus mr-1"></i> Créer le compte et entrer
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
