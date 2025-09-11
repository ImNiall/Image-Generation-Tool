import React, { useState, useEffect } from 'react';
import Dashboard from './Dashboard';
import LandingPage from './LandingPage';
import { PasswordResetPage } from './components/PasswordResetPage';
import { authService, User } from './services/authService';
import { supabase } from './lib/supabase';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  useEffect(() => {
    // Check for an existing session on initial load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsLoggedIn(true);
        setUser(session.user);
      }
    });

    // Listen for all auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Supabase auth event:', event); // Helpful for debugging

        if (event === 'PASSWORD_RECOVERY') {
          // This event fires when the user clicks the password reset link
          setShowPasswordReset(true);
          setIsLoggedIn(true);
          setUser(session?.user ?? null);
        } else if (event === 'SIGNED_IN') {
          // This handles regular logins
          setShowPasswordReset(false);
          setIsLoggedIn(true);
          setUser(session?.user ?? null);
        } else if (event === 'SIGNED_OUT') {
          // This handles logouts
          setShowPasswordReset(false);
          setIsLoggedIn(false);
          setUser(null);
        }
      }
    );

    // Cleanup the listener when the component unmounts
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw new Error(error.message);
    }
    // User state will be updated via onAuthStateChange listener
  };

  const handleSignup = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name
        }
      }
    });

    if (error) {
      throw new Error(error.message);
    }
    // User will be automatically logged in after signup via onAuthStateChange
  };

  const handleResetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `https://theinstructorshub.co.uk`
    });

    if (error) {
      throw new Error(error.message);
    }
  };

  const handlePasswordUpdated = () => {
    setShowPasswordReset(false);
    // User is already on the dashboard due to the rendering logic
  };
  
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
    }
    // User state will be updated via onAuthStateChange listener
  };

  return (
    <div className="App">
      {isLoggedIn ? (
        showPasswordReset ? (
          <PasswordResetPage onPasswordUpdated={handlePasswordUpdated} />
        ) : (
          <Dashboard user={user} onLogout={handleLogout} />
        )
      ) : (
        <LandingPage onLogin={handleLogin} onSignup={handleSignup} onResetPassword={handleResetPassword} />
      )}
    </div>
  );
};

export default App;
