import { useState, useEffect } from 'react';
import { auth, Session, User } from '../lib/auth';

export interface UseSessionReturn {
  data: Session | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  update: (data: Session | null) => void;
}

export function useSession(): UseSessionReturn {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');

  useEffect(() => {
    // Load initial session
    const currentSession = auth.getSession();
    setSession(currentSession);
    setStatus(currentSession ? 'authenticated' : 'unauthenticated');

    // Listen for session changes
    const handleSessionChange = (newSession: Session | null) => {
      setSession(newSession);
      setStatus(newSession ? 'authenticated' : 'unauthenticated');
    };

    auth.onSessionChange(handleSessionChange);

    // Cleanup
    return () => {
      // Note: In a real implementation, you'd want to remove the callback
      // For now, we'll just rely on the singleton pattern
    };
  }, []);

  const update = (data: Session | null) => {
    setSession(data);
    setStatus(data ? 'authenticated' : 'unauthenticated');
  };

  return { data: session, status, update };
}

// Export NextAuth-like functions
export const signIn = auth.signIn.bind(auth);
export const signOut = auth.signOut.bind(auth);
export const getSession = auth.getSession.bind(auth);
