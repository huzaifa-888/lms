"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type UserRole = "superadmin" | "admin" | "salesperson";
export type UserStatus = "pending" | "approved" | "rejected";

export interface CRMUser {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  status: UserStatus;
}

interface AuthContextType {
  user: CRMUser | null;
  login: (username: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
  signup: (name: string, username: string, password: string, role: UserRole) => { ok: boolean; error?: string };
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isSalesPerson: boolean;
  isIbrahimSetup: boolean;
  setupIbrahim: (password: string) => void;
  getPendingUsers: () => any[];
  approveUser: (id: string) => void;
  rejectUser: (id: string) => void;
  getAllUsers: () => any[];
}

/* ✅ fallback taake crash na ho */
const defaultContext: AuthContextType = {
  user: null,
  login: () => ({ ok: false, error: "AuthProvider missing" }),
  logout: () => {},
  signup: () => ({ ok: false, error: "AuthProvider missing" }),
  isAdmin: false,
  isSuperAdmin: false,
  isSalesPerson: false,
  isIbrahimSetup: false,
  setupIbrahim: () => {},
  getPendingUsers: () => [],
  approveUser: () => {},
  rejectUser: () => {},
  getAllUsers: () => [],
};

const AuthContext = createContext<AuthContextType>(defaultContext);

const IBRAHIM_KEY = "qh_ibrahim_pass";
const USERS_KEY = "qh_users";
const SESSION_KEY = "qh_session";

const IBRAHIM_DEFAULT = {
  id: "ibrahim-1",
  name: "Ibrahim",
  username: "ibrahim",
  role: "superadmin" as UserRole,
  status: "approved" as UserStatus,
};

function getUsers() {
  try {
    const d = localStorage.getItem(USERS_KEY);
    return d ? JSON.parse(d) : [];
  } catch {
    return [];
  }
}

function saveUsers(users: any[]) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch {}
}

function getIbrahimPassword(): string | null {
  try {
    return localStorage.getItem(IBRAHIM_KEY);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CRMUser | null>(null);
  const [ibrahimSetup, setIbrahimSetup] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const pass = getIbrahimPassword();
    setIbrahimSetup(!!pass);

    try {
      const saved = localStorage.getItem(SESSION_KEY);
      if (saved) setUser(JSON.parse(saved));
    } catch {}

    setMounted(true);
  }, []);

  const setupIbrahim = (password: string) => {
    localStorage.setItem(IBRAHIM_KEY, password);
    setIbrahimSetup(true);
  };

  const login = (username: string, password: string) => {
    if (username.toLowerCase() === "ibrahim") {
      const ibrahimPass = getIbrahimPassword();
      if (!ibrahimPass) return { ok: false, error: "Admin password not set yet" };
      if (password !== ibrahimPass) return { ok: false, error: "Invalid username or password" };

      const u: CRMUser = { ...IBRAHIM_DEFAULT };
      setUser(u);
      localStorage.setItem(SESSION_KEY, JSON.stringify(u));
      return { ok: true };
    }

    const users = getUsers();
    const found = users.find((u: any) => u.username === username && u.password === password);

    if (!found) return { ok: false, error: "Invalid username or password" };
    if (found.status === "pending") return { ok: false, error: "Pending approval" };
    if (found.status === "rejected") return { ok: false, error: "Rejected by admin" };

    const u: CRMUser = {
      id: found.id,
      name: found.name,
      username: found.username,
      role: found.role,
      status: found.status,
    };

    setUser(u);
    localStorage.setItem(SESSION_KEY, JSON.stringify(u));
    return { ok: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  const signup = (name: string, username: string, password: string, role: UserRole) => {
    if (username.toLowerCase() === "ibrahim") {
      return { ok: false, error: "Username not allowed" };
    }

    const users = getUsers();
    if (users.find((u: any) => u.username === username)) {
      return { ok: false, error: "Username already taken" };
    }

    users.push({
      id: Date.now().toString(),
      name,
      username,
      password,
      role,
      status: "pending",
    });

    saveUsers(users);
    return { ok: true };
  };

  const getPendingUsers = () => getUsers().filter((u: any) => u.status === "pending");

  const approveUser = (id: string) => {
    const users = getUsers();
    const idx = users.findIndex((u: any) => u.id === id);
    if (idx > -1) users[idx].status = "approved";
    saveUsers(users);
  };

  const rejectUser = (id: string) => {
    const users = getUsers();
    const idx = users.findIndex((u: any) => u.id === id);
    if (idx > -1) users[idx].status = "rejected";
    saveUsers(users);
  };

  const getAllUsers = () => getUsers();

  if (!mounted) return null;

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        signup,
        isAdmin: user?.role === "admin" || user?.role === "superadmin",
        isSuperAdmin: user?.role === "superadmin",
        isSalesPerson: user?.role === "salesperson",
        isIbrahimSetup: ibrahimSetup,
        setupIbrahim,
        getPendingUsers,
        approveUser,
        rejectUser,
        getAllUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* ✅ no crash */
export function useAuth() {
  return useContext(AuthContext);
}