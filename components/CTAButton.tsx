
import React from 'react';
import { LoadingSpinner } from './icons';

interface CTAButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
}

export const CTAButton: React.FC<CTAButtonProps> = ({ children, isLoading = false, ...props }) => {
  return (
    <button
      {...props}
      className="inline-flex items-center justify-center text-lg font-semibold text-white bg-brand-blue hover:bg-brand-blue-dark transition-all duration-300 px-8 py-4 rounded-xl shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:bg-brand-gray-300 disabled:cursor-not-allowed"
      disabled={isLoading || props.disabled}
    >
      {isLoading ? (
        <>
          <LoadingSpinner className="w-6 h-6 mr-3" />
          Processing...
        </>
      ) : (
        children
      )}
    </button>
  );
};
