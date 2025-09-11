import React from 'react';
import { EditIcon } from './icons';

export const ImageEditor: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold">Diagram Editor</h2>
        <p className="text-brand-gray-700 mt-1">Fine-tune your diagrams by adding custom routes, annotations, and points of interest. This feature is coming soon!</p>
      </div>

      <div className="text-center py-20 px-6 border-2 border-dashed border-brand-gray-300 rounded-lg bg-brand-gray-100">
        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-brand-blue mx-auto mb-6">
            <EditIcon className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-brand-gray-800">Advanced Editing Tools Are on the Way</h3>
        <p className="text-brand-gray-600 mt-2 max-w-md mx-auto">
          We're building powerful tools to help you add teaching routes, highlight specific hazards, and make other adjustments to your AI-generated diagrams.
        </p>
      </div>
    </div>
  );
};