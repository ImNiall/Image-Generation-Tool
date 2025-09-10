import React from 'react';
import { CarIcon, LibraryIcon, UserCircleIcon } from './icons';

type View = 'overview' | 'generator' | 'library' | 'profile';

interface DashboardHeaderProps {
  activeView: View;
  onViewChange: (view: View) => void;
  onLogout: () => void;
}

const NavLink: React.FC<{
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ isActive, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-brand-blue text-white shadow-sm'
        : 'text-brand-gray-700 hover:bg-brand-gray-200 hover:text-brand-gray-900'
    }`}
  >
    {children}
  </button>
);

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ activeView, onViewChange, onLogout }) => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
            <div className="bg-brand-blue p-2 rounded-lg">
                <CarIcon className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-brand-gray-900">DriveDiagram</span>
        </div>
        
        <div className="flex-1 flex justify-center items-center">
            <div className="flex items-center gap-2 bg-brand-gray-100 p-1 rounded-lg border border-brand-gray-200">
                <NavLink isActive={activeView === 'overview'} onClick={() => onViewChange('overview')}>
                    Overview
                </NavLink>
                <NavLink isActive={activeView === 'generator'} onClick={() => onViewChange('generator')}>
                    Generator
                </NavLink>
                <NavLink isActive={activeView === 'library'} onClick={() => onViewChange('library')}>
                    <span className="flex items-center gap-2">
                        <LibraryIcon className="w-4 h-4" />
                        My Library
                    </span>
                </NavLink>
            </div>
        </div>

        <div className="flex items-center gap-4">
            <button 
                onClick={() => onViewChange('profile')}
                className="text-brand-gray-500 hover:text-brand-blue transition-colors"
                title="My Profile"
                aria-label="My Profile"
            >
              <UserCircleIcon className="w-7 h-7" />
            </button>
            <button 
                onClick={onLogout}
                className="font-semibold text-sm text-brand-gray-500 hover:text-brand-blue transition-colors"
            >
              Sign Out
            </button>
        </div>
      </div>
    </header>
  );
};