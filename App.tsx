import React, { useState, useEffect } from 'react';
import LandingPage from './LandingPage';
import Dashboard from './Dashboard';
import { authService, User } from './services/authService';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is already logged in on app load
    const authState = authService.getAuthState();
    if (authState.isAuthenticated) {
      setUser(authState.user);
      setIsLoggedIn(true);
    }
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
      const user = await authService.signup(email, password, name);
      setUser(user);
      setIsLoggedIn(true);
    } catch (error) {
      throw error; // Let the modal handle the error
    }
  };
  
  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setIsLoggedIn(false);
  };

  if (isLoggedIn) {
    return <Dashboard onLogout={handleLogout} />;
  }

  return <LandingPage onLogin={handleLogin} onSignup={handleSignup} />;
};

export default App;
