import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sendOtp: (email: string) => Promise<void>;
  verifyOtp: (email: string, code: string) => Promise<void>;
  logout: () => void;
}

// Define error interface for API responses
interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Hydrate from localStorage
    try {
      const savedUser = localStorage.getItem('user');
      const isAuth = localStorage.getItem('isAuthenticated');
      const token = localStorage.getItem('authToken');
      
      // Check if token exists and is not expired (simple validation)
      if (token) {
        try {
          // Decode JWT token to check expiry (if it's a JWT)
          const tokenData = JSON.parse(atob(token.split('.')[1]));
          const currentTime = Date.now() / 1000;
          
          if (tokenData.exp < currentTime) {
            localStorage.removeItem('user');
            localStorage.removeItem('authToken');
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('redirectAfterLogin');
            setUser(null);
            setIsLoading(false);
            return;
          }
        } catch (e) {
        }
      }
      
      if (savedUser && isAuth === 'true') {
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error('AuthProvider: failed to read localStorage', e);
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      localStorage.removeItem('isAuthenticated');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendOtp = async (email: string) => {
    try {
      await authAPI.sendOtp(email);
      // backend should send OTP to email; no further action here
    } catch (err: unknown) {
      console.error('AuthProvider.sendOtp failed:', err);
      const error = err as ApiError;
      throw new Error(error.response?.data?.message || 'Failed to send OTP. Please try again.');
    }
  };

  const verifyOtp = async (email: string, code: string) => {
    try {
      const res = await authAPI.verifyOtp(email, code);

      // Expect backend to return success and optionally user_id/token
      // Adjust parsing below to match your backend response shape
      const success = res.data?.status ?? (res.data?.success ?? true);
      if (!success) {
        throw new Error(res.data?.message || 'OTP verification failed.');
      }

      const userData: User = {
        id: res.data?.user_id || res.data?.id || '',
        email
      };

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      // optionally store token if backend returns one
      if (res.data?.token) {
        localStorage.setItem('authToken', res.data.token);
      }
      localStorage.setItem('isAuthenticated', 'true');

      // Handle redirect after successful login
      const redirectPath = localStorage.getItem('redirectAfterLogin');
      if (redirectPath) {
        // Clear the redirect path from localStorage
        localStorage.removeItem('redirectAfterLogin');
        // Use window.location to force a full page navigation
        window.location.href = redirectPath;
      }
    } catch (err: unknown) {
      console.error('AuthProvider.verifyOtp failed:', err);
      const error = err as ApiError;
      throw new Error(error.response?.data?.message || 'Invalid OTP. Please try again.');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('redirectAfterLogin');

    // Best-effort server logout (if endpoint exists)
    const apiUrl = import.meta.env.VITE_API_URL || 'https://islamicdecotweb.onrender.com';
    fetch(`${apiUrl}/api/auth/logout`, { method: 'POST', credentials: 'include' }).catch(() => {
      // ignore
    });

    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      sendOtp,
      verifyOtp,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}