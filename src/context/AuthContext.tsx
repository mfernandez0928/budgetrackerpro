import { createContext, useContext, type ReactNode } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../config/firebase";
import type { User } from "firebase/auth";
import { useEffect, useState } from "react";

interface LocalUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  user: (User | LocalUser) | null | undefined;
  loading: boolean;
  error: Error | undefined;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, fbLoading, fbError] = useAuthState(auth);
  const [localUser, setLocalUser] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for localStorage demo user
    const testUser = localStorage.getItem("testUser");
    if (testUser) {
      try {
        setLocalUser(JSON.parse(testUser));
        setLoading(false);
        return;
      } catch (e) {
        localStorage.removeItem("testUser");
      }
    }
    setLoading(fbLoading);
  }, [fbLoading]);

  const user = localUser || firebaseUser;

  const value: AuthContextType = {
    user,
    loading,
    error: fbError,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
