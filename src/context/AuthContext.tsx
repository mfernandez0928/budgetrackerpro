import { createContext, useContext, type ReactNode } from "react";
import { useEffect, useState } from "react";

interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | undefined;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if test user exists in localStorage
    const testUser = localStorage.getItem("testUser");
    if (testUser) {
      try {
        setUser(JSON.parse(testUser));
      } catch (e) {
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    error: undefined,
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
