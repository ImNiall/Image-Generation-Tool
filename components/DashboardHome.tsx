import React from 'react';
import type { DiagramResult } from '../types';
import { ChartBarIcon } from './icons';
import { ImageCard } from './DiagramDisplay';

interface DashboardHomeProps {
  diagramCount: number;
  recentDiagrams: DiagramResult[];
  onCreateNew: () => void;
  onExpand: (imageUrl: string) => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({ diagramCount, recentDiagrams, onCreateNew, onExpand }) => {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold">Welcome, Instructor</h2>
        <p className="text-brand-gray-700 mt-1">Welcome back! Here’s a summary of your saved diagrams and account activity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Stat Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-brand-gray-200 flex items-center">
          <div className="bg-blue-100 p-3 rounded-full">
            <ChartBarIcon className="w-6 h-6 text-brand-blue" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-brand-gray-600">Total Diagrams Saved</p>
            <p className="text-2xl font-bold">{diagramCount}</p>
          </div>
        </div>

        {/* Create New Card */}
        <div className="md:col-span-2 bg-brand-blue text-white p-6 rounded-lg shadow-sm flex flex-col sm:flex-row justify-between items-center">
          <div>
            <h3 className="text-xl font-bold">Ready to create a new diagram?</h3>
            <p className="opacity-90 mt-1">Turn a Google Earth screenshot into a teaching tool.</p>
          </div>
          <button
            onClick={onCreateNew}
            className="mt-4 sm:mt-0 bg-white text-brand-blue font-semibold px-5 py-2 rounded-lg hover:bg-blue-50 transition-colors shrink-0"
          >
            Create New Diagram
          </button>
        </div>
      </div>

      {/* Recent Diagrams */}
      <div>
        <h3 className="text-2xl font-bold mb-4">Recent Diagrams</h3>
        {recentDiagrams.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentDiagrams.map(diagram => (
              <ImageCard
                key={diagram.id}
                title={`Created on ${new Date(diagram.createdAt).toLocaleDateString()}`}
                imageUrl={diagram.imageUrl}
                diagram={diagram}
                onExpand={onExpand}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-brand-gray-300 rounded-lg">
            <h3 className="text-lg font-semibold text-brand-gray-700">No recent diagrams.</h3>
            <p className="text-brand-gray-500 mt-1">Once you save a diagram, it will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};