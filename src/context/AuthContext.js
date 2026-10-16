import React, { createContext, useContext, useMemo, useState, useEffect, useCallback } from "react";

const AuthContext = createContext(null);
const STORAGE_KEY = "unievents_auth";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [apiOnline, setApiOnline] = useState(true);
  const [apiLatency, setApiLatency] = useState(null);

  // Health check on mount and interval
  const checkHealth = useCallback(async () => {
    const start = performance.now();
    try {
      const res = await fetch("/api/health");
      if (res.ok) {
        const end = performance.now();
        setApiLatency(Math.round(end - start));
        setApiOnline(true);
      } else {
        setApiOnline(false);
      }
    } catch {
      setApiOnline(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.token && parsed?.user) {
          setToken(parsed.token);
          setUser(parsed.user);
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
    setReady(true);
  }, []);

  const persist = useCallback((nextToken, nextUser) => {
    if (nextToken && nextUser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: nextToken, user: nextUser }));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const login = useCallback(async ({ username, password, role }) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, role }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || "Login failed. Please check credentials.");
    }
    setToken(data.token);
    setUser(data.user);
    persist(data.token, data.user);
    setApiOnline(true);
    return data.user;
  }, [persist]);

  const register = useCallback(async (userData) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || "Registration failed.");
    }
    setToken(data.token);
    setUser(data.user);
    persist(data.token, data.user);
    setApiOnline(true);
    return data.user;
  }, [persist]);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    persist(null, null);
  }, [persist]);

  const refreshUser = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        persist(token, data.user);
      }
    } catch (err) {
      console.warn("Could not refresh user:", err);
    }
  }, [token, persist]);

  const value = useMemo(
    () => ({
      token,
      user,
      ready,
      apiOnline,
      apiLatency,
      checkHealth,
      login,
      register,
      logout,
      refreshUser,
      isAuthenticated: Boolean(token && user),
      isAdmin: user?.role === "admin",
      isStudent: user?.role === "student",
    }),
    [token, user, ready, apiOnline, apiLatency, checkHealth, login, register, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
