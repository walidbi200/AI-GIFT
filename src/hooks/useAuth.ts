import { useState, useEffect } from 'react';

interface AuthState {
  isAuthenticated: boolean;
  user: string | null;
  token: string | null;
  isLoading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    isLoading: true,
  });

  useEffect(() => {
    // Check for existing authentication on mount
    const token = localStorage.getItem('adminToken');
    const user = localStorage.getItem('adminUser');

    if (token && user) {
      setAuthState({
        isAuthenticated: true,
        user,
        token,
        isLoading: false,
      });
    } else {
      setAuthState({
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
      });
    }
  }, []);

  const login = (token: string, user: string) => {
    localStorage.setItem('adminToken', token);
    localStorage.setItem('adminUser', user);
    setAuthState({
      isAuthenticated: true,
      user,
      token,
      isLoading: false,
    });
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false,
    });
  };

  return {
    ...authState,
    login,
    logout,
  };
}
