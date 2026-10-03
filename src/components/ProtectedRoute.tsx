import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

/**
 * Route protection wrapper that prevents unauthenticated access,
 * preserves intended destination in location state, and displays a
 * clean loader while Firebase auth state is being verified.
 * Supports both standalone wrapper and React Router layout Route with Outlet.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020B1F] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#00D4E8] animate-spin" />
          <p className="text-xs text-[#A5B4CC] font-medium tracking-wide">
            Verifying authentication session...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Save intended destination so user is redirected back after sign in
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
