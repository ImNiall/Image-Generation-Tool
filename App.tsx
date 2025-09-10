import React, { useState } from 'react';
import LandingPage from './LandingPage';
import Dashboard from './Dashboard';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };
  
  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  if (isLoggedIn) {
    return <Dashboard onLogout={handleLogout} />;
  }

  return <LandingPage onLogin={handleLogin} />;
};

export default App;
