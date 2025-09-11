import React from 'react';
import type { DiagramResult } from '../types';
import { ImageCard } from './DiagramDisplay';

interface LibraryProps {
  diagrams: DiagramResult[];
  onDelete: (id: string) => void;
  onExpand: (imageUrl: string) => void;
}

export const Library: React.FC<LibraryProps> = ({ diagrams, onDelete, onExpand }) => {
  const handleDownload = (imageUrl: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    const extension = imageUrl.split(';')[0].split('/')[1] || 'png';
    link.download = `drivediagram_saved_${Date.now()}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold mb-2">Your Diagram Library</h2>
        <p className="text-brand-gray-700 mb-8">This is your personal collection of saved diagrams. Download, review, or delete them at any time to keep your teaching materials organized.</p>
        
        {diagrams.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-brand-gray-300 rounded-lg">
            <h3 className="text-xl font-semibold text-brand-gray-700">Your library is empty.</h3>
            <p className="text-brand-gray-500 mt-2">Go to the Generator to create and save your first diagram!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {diagrams.map(diagram => (
              <ImageCard
                key={diagram.id}
                title={`Saved on ${new Date(diagram.createdAt).toLocaleDateString()}`}
                imageUrl={diagram.imageUrl}
                diagram={diagram}
                onDownload={handleDownload}
                onDelete={onDelete}
                onExpand={onExpand}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};