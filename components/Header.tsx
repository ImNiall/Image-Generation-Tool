import React, { useState } from 'react';
import { LoginModal } from './LoginModal';
import { SignupModal } from './SignupModal';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { CarIcon } from './icons';

interface HeaderProps {
    onLogin: (email: string, password: string) => Promise<void>;
    onSignup: (email: string, password: string, name: string) => Promise<void>;
    onResetPassword: (email: string) => Promise<void>;
}

export const Header: React.FC<HeaderProps> = ({ onLogin, onSignup, onResetPassword }) => {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const openLogin = () => {
    setShowSignup(false);
    setShowLogin(true);
  };
  
  const openSignup = () => {
    setShowLogin(false);
    setShowSignup(true);
  };
  
  const openForgotPassword = () => {
    setShowLogin(false);
    setShowForgotPassword(true);
  };

  return (
    <>
      <header className="bg-white shadow-md sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
              <div className="bg-brand-blue p-2 rounded-lg">
                  <CarIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-brand-gray-900">DriveDiagram</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" onClick={(e) => e.preventDefault()} className="text-brand-gray-700 hover:text-brand-blue transition-colors font-medium">Features</a>
            <a href="#" onClick={(e) => e.preventDefault()} className="text-brand-gray-700 hover:text-brand-blue transition-colors font-medium">Pricing</a>
            <button onClick={openLogin} className="text-brand-gray-700 hover:text-brand-blue transition-colors font-medium">Sign In</button>
          </nav>
          <button onClick={openSignup} className="hidden md:inline-block bg-brand-blue text-white font-semibold px-5 py-2 rounded-lg hover:bg-brand-blue-dark transition-colors">
            Sign Up
          </button>
          <button className="md:hidden p-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
          </button>
        </div>
      </header>

      <LoginModal 
        isOpen={showLogin} 
        onClose={() => setShowLogin(false)} 
        onLogin={onLogin}
        onForgotPassword={openForgotPassword}
        onSwitchToSignup={openSignup}
      />
      <SignupModal
        isOpen={showSignup}
        onClose={() => setShowSignup(false)}
        onSignup={onSignup}
        onSwitchToLogin={openLogin}
      />
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        onResetPassword={onResetPassword}
      />
    </>
  );
};
