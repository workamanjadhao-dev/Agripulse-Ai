import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Sprout, Loader2 } from 'lucide-react';

// Loading spinner shown while JWT session is being verified
function AuthLoader({ message = 'Loading...' }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="p-4 bg-gradient-to-tr from-green-700 to-emerald-500 text-white rounded-2xl shadow-lg">
          <Sprout className="w-8 h-8" />
        </div>
        <div className="flex items-center gap-2 text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin text-green-600" />
          <span className="text-sm font-semibold">{message}</span>
        </div>
        <p className="text-xs text-slate-400">AgriPulse AI Platform</p>
      </div>
    </div>
  );
}

/**
 * ProtectedRoute — Requires the user to be logged in.
 * If not authenticated → redirects to /login (preserving intended path).
 * If authenticated but wrong role → redirects to their home dashboard.
 */
export function ProtectedRoute({ children, allowedRoles, redirectTo = '/login' }) {
  const { isAuthenticated, authLoading, authUser } = useApp();
  const location = useLocation();

  // Wait for session check to complete before deciding
  if (authLoading) {
    return <AuthLoader message="Verifying session..." />;
  }

  // Not logged in → send to login, remember where they wanted to go
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location.pathname }} replace />;
  }

  // Wrong role → redirect to their own home
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(authUser?.role)) {
    const roleHome = {
      farmer: '/dashboard',
      buyer: '/dashboard',
      admin: '/admin',
      owner: '/dashboard'
    };
    return <Navigate to={roleHome[authUser?.role] || '/dashboard'} replace />;
  }

  return children;
}

/**
 * PublicOnlyRoute — For /login and /signup.
 * If already logged in → redirects to their dashboard (no need to login again).
 */
export function PublicOnlyRoute({ children }) {
  const { isAuthenticated, authLoading, authUser } = useApp();

  if (authLoading) {
    return <AuthLoader message="Checking session..." />;
  }

  // Already logged in → go to dashboard
  if (isAuthenticated) {
    const roleHome = {
      admin: '/admin',
      buyer: '/dashboard',
      farmer: '/dashboard',
      owner: '/dashboard'
    };
    return <Navigate to={roleHome[authUser?.role] || '/dashboard'} replace />;
  }

  return children;
}
