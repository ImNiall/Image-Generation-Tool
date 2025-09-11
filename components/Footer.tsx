
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-brand-gray-200 mt-12">
      <div className="container mx-auto px-4 py-6 text-center text-brand-gray-500">
        <p>&copy; {new Date().getFullYear()} DriveDiagram. All rights reserved.</p>
        <p className="text-sm mt-1">The essential AI tool for modern driving instructors.</p>
      </div>
    </footer>
  );
};
