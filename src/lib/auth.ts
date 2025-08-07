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
  private config: AuthConfig;
  private session: Session | null = null;
  private callbacks: {
    onSignIn?: (user: User) => void;
    onSignOut?: () => void;
    onSessionChange?: (session: Session | null) => void;
  } = {};

  constructor(config: AuthConfig) {
    this.config = config;
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

  private generateToken(user: User): string {
    const payload = {
      user,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
      iat: Math.floor(Date.now() / 1000)
    };
    
    // Simple base64 encoding (in production, use proper JWT library)
    return btoa(JSON.stringify(payload));
  }

  async signIn(credentials: { username: string; password: string }): Promise<{ success: boolean; error?: string }> {
    try {
      const user = await this.config.providers.credentials.authorize(credentials);
      
      if (user) {
        const token = this.generateToken(user);
        this.session = {
          user,
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          accessToken: token
        };
        
        localStorage.setItem('nextauth.session-token', token);
        
        if (this.callbacks.onSignIn) {
          this.callbacks.onSignIn(user);
        }
        
        if (this.callbacks.onSessionChange) {
          this.callbacks.onSessionChange(this.session);
        }
        
        return { success: true };
      } else {
        return { success: false, error: 'Invalid credentials' };
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

// Create the auth client with NextAuth-like configuration
export const auth = new AuthClient({
  providers: {
    credentials: {
      name: 'Admin Login',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // Debug logging
        console.log('Auth attempt:', { 
          username: credentials?.username,
          hasPassword: !!credentials?.password,
          envUser: import.meta.env.VITE_ADMIN_USER,
          envPass: import.meta.env.VITE_ADMIN_PASS ? '***' : 'NOT_SET'
        });

        const isValid =
          credentials?.username === import.meta.env.VITE_ADMIN_USER &&
          credentials?.password === import.meta.env.VITE_ADMIN_PASS;

        console.log('Auth result:', { isValid });

        if (isValid) {
          return { id: 'admin', name: 'Admin' };
        }
        return null;
      }
    }
  },
  session: {
    strategy: 'jwt'
  },
  secret: import.meta.env.VITE_NEXTAUTH_SECRET || 'your-secret-key',
  pages: {
    signIn: '/login'
  }
});

// Export NextAuth-like hooks and functions
export const useSession = () => auth.useSession();
export const signIn = (credentials: { username: string; password: string }) => auth.signIn(credentials);
export const signOut = () => auth.signOut();
export const getSession = () => auth.getSession();
