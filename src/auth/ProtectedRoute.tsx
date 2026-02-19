import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";

type Props = {
  children: React.ReactNode;
  requiredRoles?: string[];
};

export default function ProtectedRoute({ children, requiredRoles }: Props) {
  const { isAuthenticated, roles } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (requiredRoles && requiredRoles.length > 0) {
    const hasRole = requiredRoles.some((r) => roles.includes(r));
    if (!hasRole) return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
