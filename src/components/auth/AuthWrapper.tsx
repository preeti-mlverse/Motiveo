import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { User } from '@supabase/supabase-js';
import { AuthScreen } from './AuthScreen';
import { SupabaseService } from '../../services/supabaseService';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Clear any session errors when user signs in
      if (session?.user) {
        setSessionError(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Global error handler for session expiration
  useEffect(() => {
    const handleSessionError = (event: CustomEvent) => {
      if (event.detail.error === 'session_expired') {
        setSessionError('Your session has expired. Please sign in again.');
        setUser(null);
      }
    };

    window.addEventListener('sessionError', handleSessionError as EventListener);
    return () => window.removeEventListener('sessionError', handleSessionError as EventListener);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#F08A3E] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || sessionError) {
    return <AuthScreen />;
  }

  return <>{children}</>;
};