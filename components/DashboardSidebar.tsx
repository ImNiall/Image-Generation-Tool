import React from 'react';
import type { View } from '../Dashboard';
import type { User } from '../types';
import { CarIcon, HomeIcon, SparklesIcon, EditIcon, LibraryIcon, UserCircleIcon, LogoutIcon } from './icons';

interface DashboardSidebarProps {
  user: User;
  activeView: View;
  onViewChange: (view: View) => void;
  onLogout: () => void;
}

interface NavLinkProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const NavLink: React.FC<NavLinkProps> = ({ icon, label, isActive, onClick }) => (
  <li>
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
        isActive
          ? 'bg-brand-blue text-white shadow-sm'
          : 'text-brand-gray-700 hover:bg-brand-gray-100'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  </li>
);

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ user, activeView, onViewChange, onLogout }) => {
  return (
    <aside className="w-64 bg-white border-r border-brand-gray-200 flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-brand-gray-200">
        <div className="flex items-center gap-3">
          <div className="bg-brand-blue p-2 rounded-lg">
            <CarIcon className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-brand-gray-900">DriveDiagram</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-grow p-4">
        <ul className="space-y-1">
          <NavLink
            icon={<HomeIcon className="w-5 h-5" />}
            label="Overview"
            isActive={activeView === 'overview'}
            onClick={() => onViewChange('overview')}
          />
          <NavLink
            icon={<SparklesIcon className="w-5 h-5" />}
            label="Generator"
            isActive={activeView === 'generator'}
            onClick={() => onViewChange('generator')}
          />
          <NavLink
            icon={<EditIcon className="w-5 h-5" />}
            label="Editor"
            isActive={activeView === 'editor'}
            onClick={() => onViewChange('editor')}
          />
          <NavLink
            icon={<LibraryIcon className="w-5 h-5" />}
            label="My Library"
            isActive={activeView === 'library'}
            onClick={() => onViewChange('library')}
          />
        </ul>
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-brand-gray-200">
        <div className="flex items-center gap-3 mb-3">
          <UserCircleIcon className="w-10 h-10 text-brand-gray-500" />
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-brand-gray-900 truncate">{user.name}</p>
            <p className="text-xs text-brand-gray-500 truncate">{user.email}</p>
          </div>
        </div>
        <button 
            onClick={() => onViewChange('profile')}
            className="w-full text-left text-sm font-medium text-brand-gray-700 hover:bg-brand-gray-100 p-2 rounded-md"
        >
            Account Settings
        </button>
         <button 
            onClick={onLogout}
            className="w-full flex items-center gap-2 text-left text-sm font-medium text-brand-gray-700 hover:bg-brand-gray-100 p-2 rounded-md mt-1"
        >
            <LogoutIcon className="w-4 h-4" />
            Sign Out
        </button>
      </div>
    </aside>
  );
};
