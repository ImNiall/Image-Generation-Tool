import React, { useState } from 'react';
import { LoadingSpinner } from './icons';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetPassword: (email: string) => Promise<void>;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose, onResetPassword }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSuccess(false);
    setIsLoading(true);
    try {
      await onResetPassword(email);
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-center mb-2">Reset Password</h2>
        
        {isSuccess ? (
            <div className="text-center">
                <p className="text-brand-gray-600 mt-4">If an account exists for <strong>{email}</strong>, a password reset link has been sent.</p>
                <button onClick={onClose} className="mt-6 w-full bg-brand-blue text-white py-2.5 rounded-lg font-semibold hover:bg-brand-blue-dark">Close</button>
            </div>
        ) : (
        <>
            <p className="text-center text-brand-gray-500 mb-6">Enter your email to receive a reset link.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="reset-email" className="block text-sm font-medium text-brand-gray-700">Email</label>
                <input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-brand-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue"
                required
                />
            </div>
            
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button type="submit" disabled={isLoading} className="w-full bg-brand-blue text-white py-2.5 rounded-lg font-semibold hover:bg-brand-blue-dark disabled:bg-brand-gray-300 flex items-center justify-center">
                {isLoading ? <LoadingSpinner className="w-5 h-5" /> : 'Send Reset Link'}
            </button>
            </form>
        </>
        )}
      </div>
    </div>
  );
};
