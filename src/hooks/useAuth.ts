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
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const user = localStorage.getItem('adminUser');

        if (token && user) {
          // Validate token with server (optional but recommended)
          try {
            const response = await fetch('/api/auth/validate', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ token }),
            });

            if (response.ok) {
              setAuthState({
                isAuthenticated: true,
                user,
                token,
                isLoading: false,
              });
            } else {
              // Token is invalid, clear it
              localStorage.removeItem('adminToken');
              localStorage.removeItem('adminUser');
              setAuthState({
                isAuthenticated: false,
                user: null,
                token: null,
                isLoading: false,
              });
            }
          } catch (error) {
            // If validation fails, assume token is valid for now
            console.warn('Token validation failed, using cached auth:', error);
            setAuthState({
              isAuthenticated: true,
              user,
              token,
              isLoading: false,
            });
          }
        } else {
          setAuthState({
            isAuthenticated: false,
            user: null,
            token: null,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setAuthState({
          isAuthenticated: false,
          user: null,
          token: null,
          isLoading: false,
        });
      }
    };

    checkAuth();
  }, []);

  const login = (token: string, user: string) => {
    try {
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminUser', user);
      setAuthState({
        isAuthenticated: true,
        user,
        token,
        isLoading: false,
      });
    } catch (error) {
      console.error('Login failed:', error);
      setAuthState({
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
      });
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      setAuthState({
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
      });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return {
    ...authState,
    login,
    logout,
  };
}
