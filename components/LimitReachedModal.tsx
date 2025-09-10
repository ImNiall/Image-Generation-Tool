import React, { useEffect } from 'react';
import { SparklesIcon } from './icons';

interface LimitReachedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignUp: () => void;
}

export const LimitReachedModal: React.FC<LimitReachedModalProps> = ({ isOpen, onClose, onSignUp }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="limit-modal-title"
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-brand-blue mx-auto mb-5">
            <SparklesIcon className="w-9 h-9 text-white" />
        </div>
        <h2 id="limit-modal-title" className="text-2xl font-bold text-brand-gray-900">You've used your free diagrams</h2>
        <p className="text-brand-gray-700 mt-3 mb-6">
            Sign up for a free account to continue creating, save your diagrams to your library, and get unlimited access.
        </p>
        <div className="flex flex-col gap-3">
             <button
                onClick={onSignUp}
                className="w-full inline-flex items-center justify-center text-lg font-semibold text-white bg-brand-blue hover:bg-brand-blue-dark transition-all duration-300 px-8 py-3 rounded-xl shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
                Sign Up for Free
            </button>
             <button
                onClick={onClose}
                className="w-full font-semibold text-brand-gray-500 hover:text-brand-gray-900 transition-colors py-2"
            >
                Maybe Later
            </button>
        </div>
      </div>
    </div>
  );
};
