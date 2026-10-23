import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';

export const RequireAdmin = () => {
  const { isAuthenticated, isLoading, authError, retrySessionCheck } = useAdminAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3" role="status" aria-live="polite">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--line)] border-t-[var(--accent)] animate-spin" />
        <span className="text-xs font-mono text-[var(--muted)]">Verifying admin access…</span>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 px-4 text-center">
        <p role="alert" className="text-sm text-[var(--muted)]">{authError}</p>
        <button type="button" onClick={retrySessionCheck} className="font-semibold underline underline-offset-2">
          Retry access check
        </button>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};
