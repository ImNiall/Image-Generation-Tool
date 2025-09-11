import React, { useState, useEffect } from 'react';
import Dashboard from './Dashboard';
import LandingPage from './LandingPage';
import { PasswordResetPage } from './components/PasswordResetPage';
import { supabase } from './lib/supabase';
import type { User } from './lib/supabase';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for an existing session on initial load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsLoggedIn(true);
        setUser(session.user);
      }
      setLoading(false);
    });

    // Listen for all auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Supabase auth event:', event);

        if (event === 'PASSWORD_RECOVERY') {
          setShowPasswordReset(true);
          setIsLoggedIn(true); // User is technically logged in to reset password
          setUser(session?.user ?? null);
        } else if (event === 'SIGNED_IN') {
          setShowPasswordReset(false);
          setIsLoggedIn(true);
          setUser(session?.user ?? null);
        } else if (event === 'SIGNED_OUT') {
          setShowPasswordReset(false);
          setIsLoggedIn(false);
          setUser(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Direct Supabase calls (no wrapper service)
  const handleLogin = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
  };

  const handleSignup = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) throw new Error(error.message);
  };

  const handleResetPassword = async (email: string) => {
    // The redirect URL should be your production URL where the app is hosted.
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (error) throw new Error(error.message);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Logout error:', error);
  };
  
  const handlePasswordUpdated = () => {
    setShowPasswordReset(false);
    // After password update, Supabase sends a SIGNED_IN event,
    // so the listener will handle setting the correct state.
  };

  if (loading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-brand-gray-100"><p>Loading...</p></div>;
  }

  return (
      <>
        {isLoggedIn ? (
          showPasswordReset ? (
            <PasswordResetPage onPasswordUpdated={handlePasswordUpdated} />
          ) : (
            <Dashboard user={user} onLogout={handleLogout} />
          )
        ) : (
          <LandingPage onLogin={handleLogin} onSignup={handleSignup} onResetPassword={handleResetPassword} />
        )}
      </>
  );
};

export default App;
