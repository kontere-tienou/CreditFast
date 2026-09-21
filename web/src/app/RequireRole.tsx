import { Navigate, Outlet } from 'react-router-dom';
import { ROLE_PROFILES, type RoleCode } from '@/app/roles';
import { getUiSession } from '@/app/session';

export function RequireRole({ allow }: { allow: RoleCode[] }) {
  const session = getUiSession();
  if (!session) {
    return <Navigate to="/" replace />;
  }
  if (!allow.includes(session.role)) {
    return <Navigate to={ROLE_PROFILES[session.role].homePath} replace />;
  }
  return <Outlet />;
}
