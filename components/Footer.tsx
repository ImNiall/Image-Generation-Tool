
import React from 'react';

export const Footer: React.FC = () => {
  const commit = (import.meta as any)?.env?.VITE_COMMIT_SHA || 'dev';
  return (
    <footer className="bg-white border-t border-brand-gray-200 mt-12">
      <div className="container mx-auto px-4 py-6 text-center text-brand-gray-500">
        <p>&copy; {new Date().getFullYear()} DriveDiagram. All rights reserved.</p>
        <p className="text-sm mt-1">The essential AI tool for modern driving instructors.</p>
        <div className="mt-2 inline-flex items-center gap-2 text-xs text-brand-gray-400">
          <span className="rounded bg-brand-gray-100 px-2 py-1 border border-brand-gray-200">Build: {commit}</span>
        </div>
      </div>
    </footer>
  );
};
