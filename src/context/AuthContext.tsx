import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAdmin: boolean;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register';
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  openLoginModal: () => void;
  openRegisterModal: () => void;
  closeAuthModal: () => void;
  setAuthModalTab: (tab: 'login' | 'register') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    // Normal web authentication: only restore if user previously logged in
    const saved = localStorage.getItem('planora_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('planora_auth_token') || null;
  });

  const [loading, setLoading] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');

  // Verify session on mount if token exists
  useEffect(() => {
    const checkAuth = async () => {
      if (!token) return;
      try {
        const res = await api.getMe(token);
        if (res.authenticated && res.user) {
          setUser(res.user);
          localStorage.setItem('planora_user', JSON.stringify(res.user));
        }
      } catch {
        // Fallback keeps local session
      }
    };
    checkAuth();
  }, [token]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.login(email, password);
      if (res.success && res.user && res.token) {
        setUser(res.user);
        setToken(res.token);
        localStorage.setItem('planora_auth_token', res.token);
        localStorage.setItem('planora_user', JSON.stringify(res.user));
        setIsAuthModalOpen(false);
        return { success: true, message: res.message || 'Đăng nhập thành công' };
      }
      return { success: false, message: res.message || 'Email hoặc mật khẩu không đúng' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Đăng nhập thất bại' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.register(name, email, password);
      if (res.success && res.user && res.token) {
        setUser(res.user);
        setToken(res.token);
        localStorage.setItem('planora_auth_token', res.token);
        localStorage.setItem('planora_user', JSON.stringify(res.user));
        setIsAuthModalOpen(false);
        return { success: true, message: res.message || 'Đăng ký thành công!' };
      }
      return { success: false, message: res.message || 'Đăng ký thất bại' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Đăng ký thất bại' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (token) await api.logout(token);
    } catch {
      // ignore
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('planora_auth_token');
      localStorage.removeItem('planora_user');
    }
  };

  const updateUser = (data: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...data };
      localStorage.setItem('planora_user', JSON.stringify(updated));
      return updated;
    });

    // Sync to backend if token exists
    api.updateProfile(data, token || undefined).catch(() => {});
  };

  const openLoginModal = () => {
    setAuthModalTab('login');
    setIsAuthModalOpen(true);
  };

  const openRegisterModal = () => {
    setAuthModalTab('register');
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAdmin: user?.role === 'admin',
        isAuthModalOpen,
        authModalTab,
        login,
        register,
        logout,
        updateUser,
        openLoginModal,
        openRegisterModal,
        closeAuthModal,
        setAuthModalTab
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
