import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ROLE_PROFILES, roleFromPath } from '@/app/roles';
import { getUiSession, installLegacyAppBridge, consumeQueuedLoanModal } from '@/app/session';
import { logoutFromApi, fetchUserPhotoFile } from '@/api';
import { PROFILE_CHANGED_EVENT } from '@/features/workflow/workflow';
import { Button, callApp as invokeLegacyApp } from '@/shared/ui';
import { toast } from '@heroui/react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { EditProfileModal } from '@/features/modals/EditProfileModal';
import { ChangePasswordModal } from '@/features/modals/ChangePasswordModal';
import { NotificationBell } from '@/features/workflow/NotificationBell';

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const session = getUiSession();
  const role = session?.role ?? roleFromPath(location.pathname);
  const profile = ROLE_PROFILES[role];
  const displayName = session?.name || profile.displayName;
  const [isCollapsed, setIsCollapsed] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 1280 && window.innerWidth >= 768,
  );
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar);
  const [sessionNonce, setSessionNonce] = useState(0);
  const profileRef = useRef<HTMLDivElement>(null);
  const userToggledCollapse = useRef(false);

  useEffect(() => {
    installLegacyAppBridge((path) => {
      if (path === '/app/analyst/audit' && location.pathname.startsWith('/app/committee')) {
        navigate('/app/committee/audit');
        return;
      }
      navigate(path);
    });

    if (!consumeQueuedLoanModal()) {
      return;
    }
    const frame = window.requestAnimationFrame(() => invokeLegacyApp('openNewLoanModal'));
    return () => window.cancelAnimationFrame(frame);
  }, [location.pathname, navigate]);

  useEffect(() => {
    const userId = Number(session?.userId);
    if (!userId) {
      setAvatarUrl(profile.avatar);
      return;
    }
    let revoked = false;
    let objectUrl: string | null = null;
    const load = () => {
      void fetchUserPhotoFile(userId)
        .then(({ blob }) => {
          objectUrl = URL.createObjectURL(blob);
          if (!revoked) {
            setAvatarUrl(objectUrl);
          } else {
            URL.revokeObjectURL(objectUrl);
          }
        })
        .catch(() => {
          if (!revoked) {
            setAvatarUrl(profile.avatar);
          }
        });
    };
    load();
    window.addEventListener(PROFILE_CHANGED_EVENT, load);
    return () => {
      revoked = true;
      window.removeEventListener(PROFILE_CHANGED_EVENT, load);
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [session?.userId, sessionNonce, profile.avatar]);

  useEffect(() => {
    const applyCollapsedClass = () => {
      const iconRail = isCollapsed && window.innerWidth >= 768;
      document.body.classList.toggle('sidebar-collapsed', iconRail);
    };

    applyCollapsedClass();
    window.addEventListener('resize', applyCollapsedClass);
    return () => {
      window.removeEventListener('resize', applyCollapsedClass);
      document.body.classList.remove('sidebar-collapsed');
    };
  }, [isCollapsed]);

  useEffect(() => {
    const syncDefaultCollapse = () => {
      if (window.innerWidth < 768) {
        setIsMobileOpen(false);
        return;
      }
      if (userToggledCollapse.current) {
        return;
      }
      setIsCollapsed(window.innerWidth < 1280);
    };

    syncDefaultCollapse();
    window.addEventListener('resize', syncDefaultCollapse);
    return () => window.removeEventListener('resize', syncDefaultCollapse);
  }, []);

  useEffect(() => {
    if (!profileOpen) {
      return;
    }

    const onPointerDown = (event: MouseEvent) => {
      if (!profileRef.current?.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [profileOpen]);

  const logout = () => {
    setProfileOpen(false);
    void logoutFromApi().finally(() => navigate('/'));
  };

  const callApp = (method: string) => {
    setProfileOpen(false);
    const app = (window as unknown as { App?: Record<string, () => void> }).App;
    app?.[method]?.();
  };

  return (
    <div id="app-wrapper" style={{ display: 'flex' }}>
      <div
        id="sidebar-backdrop"
        className={isMobileOpen ? 'active' : ''}
        onClick={() => setIsMobileOpen(false)}
      />
      <aside id="sidebar" className={isMobileOpen ? 'mobile-open' : undefined}>
        <div className="sidebar-header">
          <a
            href={profile.homePath}
            className="brand-logo"
            onClick={(event) => {
              event.preventDefault();
              navigate(profile.homePath);
            }}
          >
            <div className="brand-icon" title="Crédit Fast">
              <i className="fas fa-hand-holding-dollar"></i>
            </div>
            <div className="brand-title-group">
              <span className="brand-name">CRÉDIT FAST</span>
            </div>
          </a>
          <button
            id="sidebar-close-btn"
            className="sidebar-close-btn"
            title="Fermer le menu"
            type="button"
            onClick={() => {
              if (window.innerWidth < 768) {
                setIsMobileOpen(false);
                return;
              }
              userToggledCollapse.current = true;
              setIsCollapsed(true);
            }}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <nav className="sidebar-menu" id="sidebar-menu-container">
          {profile.navGroups.map((group) => (
            <div className="sidebar-nav-group" key={group.title}>
              <div className="menu-group-title">{group.title}</div>
              <ul className="nav-items-list">
                {group.items.map((item) => {
                  const exactMatch = item.path.split('/').length <= 3;
                  const isActive =
                    location.pathname === item.path ||
                    location.pathname === `${item.path}/` ||
                    (!exactMatch && location.pathname.startsWith(`${item.path}/`));

                  return (
                  <li className={`nav-item${isActive ? ' active' : ''}`} key={item.id}>
                    <NavLink
                      to={item.path}
                      className={({ isActive: linkActive }) => `nav-link${linkActive ? ' active' : ''}`}
                      end={exactMatch}
                      title={item.label}
                      data-nav-title={item.label}
                      onClick={() => setIsMobileOpen(false)}
                    >
                      <i className={`fas ${item.icon}`}></i>
                      <span className="nav-link-text">{item.label}</span>
                      {item.badge ? (
                        <span className={`nav-badge ${item.badgeClass ?? ''}`}>{item.badge}</span>
                      ) : null}
                    </NavLink>
                  </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="digicoop-card">
            <div className="digicoop-text" style={{ width: '100%' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 6,
                }}
              >
                <h6>Réseau CreditFast Mali</h6>
                <span
                  style={{
                    fontSize: '0.62rem',
                    color: '#f1ca30',
                    fontWeight: 700,
                    background: 'rgba(241, 202, 48, 0.18)',
                    padding: '1px 5px',
                    borderRadius: 4,
                  }}
                >
                  MALI
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div id="main-wrapper">
        <header id="topbar">
          <div className="topbar-left">
            <button
              id="sidebar-toggle-btn"
              className="sidebar-toggle-btn"
              title="Basculer le menu latéral (Drawer)"
              type="button"
              onClick={() => {
                if (window.innerWidth < 768) {
                  setIsMobileOpen((open) => !open);
                  return;
                }
                userToggledCollapse.current = true;
                setIsCollapsed((current) => !current);
              }}
            >
              <i className="fas fa-bars"></i>
            </button>
          </div>
          <div className="topbar-right">
            <NotificationBell />
            <div className="profile-dropdown-container" ref={profileRef}>
              <button
                className={`topbar-profile-btn${profileOpen ? ' active' : ''}`}
                type="button"
                aria-haspopup="true"
                aria-expanded={profileOpen}
                aria-label={displayName}
                title="Mon Profil & Paramètres"
                onClick={() => setProfileOpen((open) => !open)}
              >
                <div className="topbar-avatar-wrap">
                  <img src={avatarUrl} alt="Avatar" className="topbar-avatar" />
                </div>
                <div className="topbar-user-meta">
                  <span className="topbar-user-name">{displayName}</span>
                  <span className="topbar-user-role">{profile.shortName}</span>
                </div>
                <i className="fas fa-chevron-down profile-caret"></i>
              </button>

              <div className={`profile-dropdown-menu${profileOpen ? ' show' : ''}`}>
                <ul className="profile-menu-list">
                  <li>
                    <a
                      href="#"
                      className="profile-menu-item"
                      onClick={(event) => {
                        event.preventDefault();
                        setProfileOpen(false);
                        if (role === 'CLIENT') {
                          navigate('/app/client/profile');
                          return;
                        }
                        setEditProfileOpen(true);
                      }}
                    >
                      <i className="fas fa-user-pen text-primary"></i>
                      <span>Modifier mon Profil</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="profile-menu-item"
                      onClick={(event) => {
                        event.preventDefault();
                        callApp('openSettingsModal');
                      }}
                    >
                      <i className="fas fa-sliders-h text-secondary"></i>
                      <span>Paramètres &amp; Préférences</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="profile-menu-item"
                      onClick={(event) => {
                        event.preventDefault();
                        setProfileOpen(false);
                        setPasswordOpen(true);
                      }}
                    >
                      <i className="fas fa-shield-halved text-emerald"></i>
                      <span>Sécurité &amp; mot de passe</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="profile-menu-item"
                      onClick={(event) => {
                        event.preventDefault();
                        setProfileOpen(false);
                        toast.info('Support CIF DigiCoop-WA+ disponible 24/7');
                      }}
                    >
                      <i className="fas fa-circle-question text-info"></i>
                      <span>Centre d&apos;Aide CreditFast</span>
                    </a>
                  </li>
                </ul>

                <div className="profile-dropdown-divider"></div>

                <div className="profile-dropdown-footer">
                  <Button
                    variant="danger-subtle"
                    className="btn-action-logout"
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={logout}
                  >
                    <i className="fas fa-right-from-bracket"></i> Se Déconnecter
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </header>
        <div id="content-area">{children}</div>
        <div id="toast-container"></div>
      </div>
      <EditProfileModal
        open={editProfileOpen}
        onClose={() => {
          setEditProfileOpen(false);
          setSessionNonce((value) => value + 1);
        }}
      />
      <ChangePasswordModal open={passwordOpen} onClose={() => setPasswordOpen(false)} />
    </div>
  );
}
