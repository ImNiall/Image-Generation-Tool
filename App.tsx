import React, { useState, useEffect } from 'react';
import Dashboard from './Dashboard';
import LandingPage from './LandingPage';
import { PasswordResetPage } from './components/PasswordResetPage';
import { authService, User } from './services/authService';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  useEffect(() => {
    // Check if user is already logged in on app load
    const checkAuth = async () => {
      const authState = await authService.getAuthState();
      if (authState.isAuthenticated) {
        setUser(authState.user);
        setIsLoggedIn(true);
        
        // Check if this is a password reset session
        // Supabase redirects with hash fragments like #access_token=...&type=recovery
        const urlHash = window.location.hash;
        console.log('Full URL hash:', urlHash);
        
        if (urlHash.includes('type=recovery') || urlHash.includes('recovery')) {
          console.log('Password reset detected!');
          setShowPasswordReset(true);
        }
      }
    };
    
    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = authService.onAuthStateChange((user) => {
      setUser(user);
      setIsLoggedIn(!!user);
      
      // Check for password reset on auth state change too
      if (user) {
        const urlHash = window.location.hash;
        console.log('Auth change - Full URL hash:', urlHash);
        
        if (urlHash.includes('type=recovery') || urlHash.includes('recovery')) {
          console.log('Password reset detected on auth change!');
          setShowPasswordReset(true);
        }
      }
    });

    return () => subscription.unsubscribe();
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
    // Clear URL parameters
    window.history.replaceState({}, document.title, window.location.pathname);
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
