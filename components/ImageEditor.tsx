import React from 'react';
import { EditIcon } from './icons';

export const ImageEditor: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold">Image Editor</h2>
        <p className="text-brand-gray-700 mt-1">Fine-tune your generated diagrams with powerful editing tools.</p>
      </div>

      <div className="text-center py-20 px-6 border-2 border-dashed border-brand-gray-300 rounded-lg bg-brand-gray-100">
        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-brand-blue mx-auto mb-6">
            <EditIcon className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-brand-gray-800">Editing Tools Coming Soon</h3>
        <p className="text-brand-gray-600 mt-2 max-w-md mx-auto">
          This is where you'll be able to add annotations, remove specific objects, or make other adjustments to your AI-generated diagrams.
        </p>
      </div>
    </div>
  );
};
