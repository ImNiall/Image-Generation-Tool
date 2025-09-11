import React, { useState } from 'react';
import { LoadingSpinner } from './icons';

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignup: (email: string, password: string, name: string) => Promise<void>;
  onSwitchToLogin: () => void;
}

export const SignupModal: React.FC<SignupModalProps> = ({ isOpen, onClose, onSignup, onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
    }
    setIsLoading(true);
    try {
      await onSignup(email, password, name);
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
        {isSuccess ? (
             <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Check your email!</h2>
                <p className="text-brand-gray-600">We've sent a confirmation link to <strong>{email}</strong>. Please click the link to complete your registration.</p>
                <button onClick={onClose} className="mt-6 w-full bg-brand-blue text-white py-2.5 rounded-lg font-semibold hover:bg-brand-blue-dark">Close</button>
            </div>
        ) : (
        <>
            <h2 className="text-2xl font-bold text-center mb-2">Create an Account</h2>
            <p className="text-center text-brand-gray-500 mb-6">Get started for free.</p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="signup-name" className="block text-sm font-medium text-brand-gray-700">Full Name</label>
                <input
                id="signup-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-brand-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue"
                required
                />
            </div>
            <div>
                <label htmlFor="signup-email" className="block text-sm font-medium text-brand-gray-700">Email</label>
                <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-brand-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue"
                required
                />
            </div>
            <div>
                <label htmlFor="signup-password" className="block text-sm font-medium text-brand-gray-700">Password</label>
                <input
                id="signup-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-brand-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue"
                placeholder="6+ characters"
                required
                />
            </div>
            
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button type="submit" disabled={isLoading} className="w-full bg-brand-blue text-white py-2.5 rounded-lg font-semibold hover:bg-brand-blue-dark disabled:bg-brand-gray-300 flex items-center justify-center">
                {isLoading ? <LoadingSpinner className="w-5 h-5" /> : 'Create Account'}
            </button>
            </form>

            <p className="text-center text-sm text-brand-gray-500 mt-6">
            Already have an account?{' '}
            <button onClick={onSwitchToLogin} className="font-semibold text-brand-blue hover:underline">Sign In</button>
            </p>
        </>
        )}
      </div>
    </div>
  );
};
