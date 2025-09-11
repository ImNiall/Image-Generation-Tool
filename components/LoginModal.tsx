import React, { useState } from 'react';
import { LoadingSpinner } from './icons';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, password: string) => Promise<void>;
  onForgotPassword: () => void;
  onSwitchToSignup: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin, onForgotPassword, onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await onLogin(email, password);
      onClose(); 
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-center mb-2">Instructor Sign In</h2>
        <p className="text-center text-brand-gray-500 mb-6">Welcome back!</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-brand-gray-700">Email</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-brand-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue"
              required
            />
          </div>
          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-brand-gray-700">Password</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-brand-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue"
              required
            />
          </div>
          <div className="text-right">
            <button type="button" onClick={onForgotPassword} className="text-sm text-brand-blue hover:underline">Forgot Password?</button>
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button type="submit" disabled={isLoading} className="w-full bg-brand-blue text-white py-2.5 rounded-lg font-semibold hover:bg-brand-blue-dark disabled:bg-brand-gray-300 flex items-center justify-center">
            {isLoading ? <LoadingSpinner className="w-5 h-5" /> : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-brand-gray-500 mt-6">
          Don't have an account?{' '}
          <button onClick={onSwitchToSignup} className="font-semibold text-brand-blue hover:underline">Sign up</button>
        </p>
      </div>
    </div>
  );
};
