import React, { useState } from 'react';
import LandingPage from './LandingPage';
import Dashboard from './Dashboard';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [initialFile, setInitialFile] = useState<File | null>(null);

  const handleLogin = (file?: File) => {
    if (file) {
      setInitialFile(file);
    }
    setIsLoggedIn(true);
  };
  
  const handleLogout = () => {
    setIsLoggedIn(false);
    setInitialFile(null);
  };

  if (isLoggedIn) {
    return <Dashboard onLogout={handleLogout} initialFile={initialFile} />;
  }

  return <LandingPage onLogin={handleLogin} />;
};

export default App;