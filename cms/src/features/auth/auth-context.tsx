import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  clearTokens,
  getAccessToken,
  setTokens,
} from '@/lib/api-client';
import { loginRequest, logoutRequest } from './auth-api';
import type { AuthUser } from '@/types/auth';

const CURRENT_USER_KEY = 'woodivo_cms_user';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(CURRENT_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Restore session from localStorage on first load — a page refresh
  // shouldn't force a re-login as long as the access token is still there.
  useEffect(() => {
    const token = getAccessToken();
    const storedUser = readStoredUser();
    if (token && storedUser) {
      setUser(storedUser);
    }
    setIsInitializing(false);
  }, []);

  async function login(email: string, password: string) {
    const { user: loggedInUser, tokens } = await loginRequest(email, password);
    setTokens(tokens.accessToken, tokens.refreshToken);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(loggedInUser));
    setUser(loggedInUser);
  }

  async function logout() {
    try {
      await logoutRequest();
    } finally {
      clearTokens();
      localStorage.removeItem(CURRENT_USER_KEY);
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isInitializing,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
