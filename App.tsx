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
    try {
      const user = await authService.login(email, password);
      setUser(user);
      setIsLoggedIn(true);
    } catch (error) {
      throw error; // Let the modal handle the error
    }
  };

  const handleSignup = async (email: string, password: string, name: string) => {
    try {
      await authService.signup(email, password, name);
      // User will be automatically logged in after signup
    } catch (error) {
      console.error('Signup failed:', error);
      // Handle signup error (show error message to user)
    }
  };

  const handleResetPassword = async (email: string) => {
    try {
      await authService.resetPassword(email);
    } catch (error) {
      console.error('Password reset failed:', error);
      throw error; // Re-throw to let the modal handle the error
    }
  };

  const handlePasswordUpdated = () => {
    setShowPasswordReset(false);
    // User is already on the dashboard due to the rendering logic
  };
  
  const handleLogout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsLoggedIn(false);
      setShowPasswordReset(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
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
