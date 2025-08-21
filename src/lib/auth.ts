// Simple JWT decode function (no external dependencies)
function jwtDecode(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    // For our simple base64 tokens, just decode directly
    try {
      return JSON.parse(atob(token));
    } catch {
      throw new Error('Invalid token');
    }
  }
}

export interface User {
  id: string;
  name: string;
  email?: string;
}

export interface Session {
  user: User;
  expires: string;
  accessToken: string;
}

export interface AuthConfig {
  providers: {
    credentials: {
      name: string;
      credentials: {
        username: { label: string; type: string };
        password: { label: string; type: string };
      };
      authorize: (credentials: any) => Promise<User | null>;
    };
  };
  session: {
    strategy: 'jwt';
  };
  secret: string;
  pages?: {
    signIn?: string;
  };
}

class AuthClient {
  private session: Session | null = null;
  private callbacks: {
    onSignIn?: (user: User) => void;
    onSignOut?: () => void;
    onSessionChange?: (session: Session | null) => void;
  } = {};

  constructor() {
    this.loadSession();
  }

  private loadSession() {
    try {
      const token = localStorage.getItem('nextauth.session-token');
      if (token) {
        const decoded = jwtDecode(token) as any;
        if (decoded.exp * 1000 > Date.now()) {
          this.session = {
            user: decoded.user,
            expires: new Date(decoded.exp * 1000).toISOString(),
            accessToken: token
          };
        } else {
          this.signOut();
        }
      }
    } catch (error) {
      console.error('Failed to load session:', error);
      this.signOut();
    }
  }



  async signIn(credentials: { username: string; password: string }): Promise<{ success: boolean; error?: string }> {
    try {
      // Use the new consolidated API directly
      const response = await fetch('/api/auth?action=login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const result = await response.json();

      if (result.success && result.token) {
        const user = { id: 'admin', name: 'Admin' };
        this.session = {
          user,
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          accessToken: result.token
        };
        
        localStorage.setItem('nextauth.session-token', result.token);
        
        if (this.callbacks.onSignIn) {
          this.callbacks.onSignIn(user);
        }
        
        if (this.callbacks.onSessionChange) {
          this.callbacks.onSessionChange(this.session);
        }
        
        return { success: true };
      } else {
        return { success: false, error: result.message || 'Invalid credentials' };
      }
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: 'Authentication failed' };
    }
  }

  signOut(): void {
    this.session = null;
    localStorage.removeItem('nextauth.session-token');
    
    if (this.callbacks.onSignOut) {
      this.callbacks.onSignOut();
    }
    
    if (this.callbacks.onSessionChange) {
      this.callbacks.onSessionChange(null);
    }
  }

  getSession(): Session | null {
    return this.session;
  }

  useSession(): { data: Session | null; status: 'loading' | 'authenticated' | 'unauthenticated' } {
    if (this.session) {
      return { data: this.session, status: 'authenticated' };
    }
    return { data: null, status: 'unauthenticated' };
  }

  onSignIn(callback: (user: User) => void): void {
    this.callbacks.onSignIn = callback;
  }

  onSignOut(callback: () => void): void {
    this.callbacks.onSignOut = callback;
  }

  onSessionChange(callback: (session: Session | null) => void): void {
    this.callbacks.onSessionChange = callback;
  }
}

// Create the auth client
export const auth = new AuthClient();

// Export NextAuth-like hooks and functions
export const useSession = () => auth.useSession();
export const signIn = (credentials: { username: string; password: string }) => auth.signIn(credentials);
export const signOut = () => auth.signOut();
export const getSession = () => auth.getSession();
