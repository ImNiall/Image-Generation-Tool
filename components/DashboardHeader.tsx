import React from 'react';
import type { View } from '../Dashboard';

interface DashboardHeaderProps {
  activeView: View;
}

const viewTitles: Record<View, string> = {
    overview: 'Dashboard Overview',
    generator: 'Create a New Diagram',
    editor: 'Diagram Editor',
    library: 'Diagram Library',
    profile: 'My Profile',
};

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ activeView }) => {
  return (
    <header className="bg-white shadow-sm z-10 p-4 md:px-8 md:py-5 border-b border-brand-gray-200 shrink-0">
        <h1 className="text-2xl font-bold text-brand-gray-900 capitalize">
            {viewTitles[activeView]}
        </h1>
    </header>
  );
};