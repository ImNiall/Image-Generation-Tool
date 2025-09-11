
import React from 'react';
import { LoadingSpinner } from './icons';

interface CTAButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  shining?: boolean;
}

export const CTAButton: React.FC<CTAButtonProps> = ({ children, isLoading = false, shining = false, ...props }) => {
  const baseClasses = "inline-flex items-center justify-center text-lg font-semibold text-white bg-brand-blue hover:bg-brand-blue-dark transition-all duration-300 px-8 py-4 rounded-xl shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:bg-brand-gray-300 disabled:cursor-not-allowed";
  
  // Add relative and overflow-hidden for the shimmer effect
  const layoutClasses = shining ? 'relative overflow-hidden' : '';

  return (
    <button
      {...props}
      className={`${baseClasses} ${layoutClasses}`}
      disabled={isLoading || props.disabled}
    >
      {shining && (
        <span className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      )}
      <span className="relative">
        {isLoading ? (
          <>
            <LoadingSpinner className="w-6 h-6 mr-3" />
            Processing...
          </>
        ) : (
          children
        )}
      </span>
    </button>
  );
};