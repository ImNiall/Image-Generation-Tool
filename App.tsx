import React, { useState } from 'react';
import LandingPage from './LandingPage';
import Dashboard from './Dashboard';
import { SignInPage } from './components/SignInPage';

type View = 'landing' | 'signIn' | 'dashboard';

const App: React.FC = () => {
  const [view, setView] = useState<View>('landing');

  const handleNavigateToSignIn = () => {
    setView('signIn');
  };

  const handleLoginSuccess = () => {
    setView('dashboard');
  };

  const handleLogout = () => {
    setView('landing');
  };

  const handleNavigateToLanding = () => {
    setView('landing');
  };

  switch (view) {
    case 'signIn':
      return <SignInPage onLoginSuccess={handleLoginSuccess} onNavigateToLanding={handleNavigateToLanding} />;
    case 'dashboard':
      return <Dashboard onLogout={handleLogout} />;
    case 'landing':
    default:
      return <LandingPage onSignInClick={handleNavigateToSignIn} />;
  }
};

export default App;
