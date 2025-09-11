import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { LoadingSpinner } from './icons';

interface PasswordResetPageProps {
  onPasswordUpdated: () => void;
}

export const PasswordResetPage: React.FC<PasswordResetPageProps> = ({ onPasswordUpdated }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
    }

    setError('');
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setIsSuccess(true);
      setTimeout(onPasswordUpdated, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        {isSuccess ? (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-green-600 mb-4">Password Updated!</h2>
            <p className="text-brand-gray-600">Your password has been changed successfully. You will be redirected shortly.</p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-center mb-2">Create a New Password</h2>
            <p className="text-center text-brand-gray-500 mb-6">Enter your new password below.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brand-gray-700" htmlFor="new-password">New Password</label>
                <input
                  id="new-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-brand-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-gray-700" htmlFor="confirm-password">Confirm New Password</label>
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-brand-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue"
                  required
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button type="submit" disabled={isLoading} className="w-full bg-brand-blue text-white py-2.5 rounded-lg font-semibold hover:bg-brand-blue-dark disabled:bg-brand-gray-300 flex items-center justify-center">
                {isLoading ? <LoadingSpinner className="w-5 h-5" /> : 'Update Password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
