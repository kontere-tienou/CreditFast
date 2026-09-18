import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ROLE_PROFILES, roleFromPath } from '@/app/roles';
import { clearUiSession, installLegacyAppBridge } from '@/app/session';
import { Button } from '@/shared/ui';
import { toast } from '@heroui/react';
import { useEffect, useRef, useState, type ReactNode } from 'react';

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const role = roleFromPath(location.pathname);
  const profile = ROLE_PROFILES[role];
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    installLegacyAppBridge((path) => {
      if (path === '/app/analyst/audit' && location.pathname.startsWith('/app/committee')) {
        navigate('/app/committee/audit');
        return;
      }
      navigate(path);
    });
  }, [location.pathname, navigate]);

  useEffect(() => {
    document.body.classList.toggle('sidebar-collapsed', isCollapsed);
    return () => document.body.classList.remove('sidebar-collapsed');
  }, [isCollapsed]);

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
    clearUiSession();
    navigate('/');
  };

  const callApp = (method: string) => {
    setProfileOpen(false);
    const app = (window as unknown as { App?: Record<string, () => void> }).App;
    app?.[method]?.();
  };

  return (
    <div id="app-wrapper" style={{ display: 'flex' }}>
      <aside id="sidebar">
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
            onClick={() => setIsCollapsed(true)}
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
                    color: '#38bdf8',
                    fontWeight: 700,
                    background: 'rgba(56, 189, 248, 0.15)',
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
              onClick={() => setIsCollapsed((current) => !current)}
            >
              <i className="fas fa-bars"></i>
            </button>
          </div>
          <div className="topbar-right">
            <button className="topbar-action-btn" title="Centre de Notifications" type="button">
              <i className="fas fa-bell"></i>
            </button>
            <div className="profile-dropdown-container" ref={profileRef}>
              <button
                className={`topbar-profile-btn${profileOpen ? ' active' : ''}`}
                type="button"
                aria-haspopup="true"
                aria-expanded={profileOpen}
                aria-label={profile.displayName}
                title="Mon Profil & Paramètres"
                onClick={() => setProfileOpen((open) => !open)}
              >
                <div className="topbar-avatar-wrap">
                  <img src={profile.avatar} alt="Avatar" className="topbar-avatar" />
                </div>
                <div className="topbar-user-meta">
                  <span className="topbar-user-name">{profile.displayName}</span>
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
                        callApp('openEditProfileModal');
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
                        toast.info('Sécurité du compte : Authentification 2FA active');
                      }}
                    >
                      <i className="fas fa-shield-halved text-emerald"></i>
                      <span>Sécurité &amp; Clés d&apos;Accès</span>
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
        {children}
      </div>
    </div>
  );
}
