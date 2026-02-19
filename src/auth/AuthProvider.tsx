import React, { createContext, useContext, useMemo, useState } from "react";
import { clearToken, getToken, setToken } from "./tokenStorage";

type AuthState = {
  token: string | null;
  roles: string[];
  isAuthenticated: boolean;
  isAdmin: boolean;
  setAccessToken: (token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

function decodeJwtPayload(token: string): any {
  const part = token.split(".")[1];
  if (!part) return null;

  const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  const json = atob(padded);
  return JSON.parse(json);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => getToken());

  const roles = useMemo(() => {
    if (!token) return [];
    const payload = decodeJwtPayload(token);
    const rolesStr = typeof payload?.roles === "string" ? payload.roles : "";
    return rolesStr.trim() ? rolesStr.trim().split(/\s+/) : [];
  }, [token]);

  const isAdmin = useMemo(() => roles.includes("ROLE_ADMIN"), [roles]);

  const value = useMemo<AuthState>(() => {
    return {
      token,
      roles,
      isAuthenticated: Boolean(token),
      isAdmin,
      setAccessToken: (t: string) => {
        setToken(t);
        setTokenState(t);
      },
      logout: () => {
        clearToken();
        setTokenState(null);
      },
    };
  }, [token, roles, isAdmin]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
