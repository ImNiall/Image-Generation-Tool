import React from 'react';
import type { DiagramResult } from '../types';
import { LoadingSpinner, DownloadIcon, SaveIcon, TrashIcon, ExpandIcon } from './icons';

interface DiagramDisplayProps {
  originalImage: string | null;
  generatedDiagram: DiagramResult | null;
  isLoading: boolean;
  error: string | null;
  progressMessage: string;
  showImageSizeWarning: boolean;
  onSave?: (diagram: DiagramResult) => void;
  isSaved?: boolean;
  onExpand?: (imageUrl: string) => void;
}

interface ImageCardProps {
    title: string;
    imageUrl: string;
    diagram?: DiagramResult;
    onDownload?: (imageUrl: string) => void;
    onSave?: (diagram: DiagramResult) => void;
    onDelete?: (id: string) => void;
    onExpand?: (imageUrl: string) => void;
    isSaved?: boolean;
    children?: React.ReactNode;
}

export const ImageCard: React.FC<ImageCardProps> = ({ title, imageUrl, diagram, onDownload, onSave, onDelete, onExpand, isSaved, children }) => (
  <div className="w-full flex flex-col">
    <h3 className="text-lg font-semibold text-center mb-3 text-brand-gray-700">{title}</h3>
    <div className="relative aspect-[4/3] w-full bg-brand-gray-200 rounded-lg overflow-hidden shadow-sm group">
      <img src={imageUrl} alt={title} className="w-full h-full object-contain" />
      <div className="absolute top-3 right-3 flex items-center gap-2 transition-opacity opacity-0 group-hover:opacity-100 focus-within:opacity-100">
        {onExpand && (
            <button
            onClick={() => onExpand(imageUrl)}
            className="bg-brand-gray-900 bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue"
            aria-label="Expand diagram"
            title="Expand diagram"
            >
            <ExpandIcon className="w-5 h-5" />
            </button>
        )}
        {onSave && diagram && !isSaved && (
            <button
            onClick={() => onSave(diagram)}
            className="bg-brand-gray-900 bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue"
            aria-label="Save diagram"
            title="Save to library"
            >
            <SaveIcon className="w-5 h-5" />
            </button>
        )}
        {isSaved && (
             <span
             className="bg-green-500 text-white text-xs font-bold py-1 px-3 rounded-full"
             title="Saved to library"
           >
             Saved
           </span>
        )}
        {onDownload && (
            <button
            onClick={() => onDownload(imageUrl)}
            className="bg-brand-gray-900 bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue"
            aria-label="Download diagram"
            title="Download diagram"
            >
            <DownloadIcon className="w-5 h-5" />
            </button>
        )}
        {onDelete && diagram && (
             <button
             onClick={() => onDelete(diagram.id)}
             className="bg-red-600 bg-opacity-80 text-white p-2 rounded-full hover:bg-opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
             aria-label="Delete diagram"
             title="Delete from library"
             >
             <TrashIcon className="w-5 h-5" />
             </button>
        )}
      </div>
      {children}
    </div>
  </div>
);

const LoadingCard: React.FC<{ title: string, message: string }> = ({ title, message }) => (
    <div className="w-full flex flex-col">
        <h3 className="text-lg font-semibold text-center mb-3 text-brand-gray-700">{title}</h3>
        <div className="relative aspect-[4/3] w-full bg-brand-gray-200 rounded-lg overflow-hidden shadow-sm flex flex-col items-center justify-center p-4">
            <LoadingSpinner className="w-12 h-12 text-brand-blue" />
            <p className="mt-4 text-brand-gray-700 font-medium text-center">{message || "Generating your diagram..."}</p>
            <p className="text-sm text-brand-gray-500 text-center mt-1">This may take a moment.</p>
        </div>
    </div>
);


export const DiagramDisplay: React.FC<DiagramDisplayProps> = ({ originalImage, generatedDiagram, isLoading, error, progressMessage, showImageSizeWarning, onSave, isSaved, onExpand }) => {
  if (!originalImage) return null;

  const handleDownload = (imageUrl: string) => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    
    const mimeType = imageUrl.split(';')[0].split(':')[1] || 'image/png';
    const extension = mimeType.split('/')[1] || 'png';
    link.download = `drivediagram_generated_${Date.now()}.${extension}`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4" role="alert">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-start">
        <div className="flex flex-col">
          <ImageCard title="Before" imageUrl={originalImage} onExpand={onExpand} />
          {showImageSizeWarning && (
            <div className="mt-2 p-3 bg-yellow-50 border border-yellow-300 rounded-lg text-sm text-yellow-900" role="alert">
              <p>
                For best results, we recommend images under 900px. Larger images can affect diagram quality. 
                <a href="#" onClick={(e) => e.preventDefault()} className="font-semibold underline ml-1 hover:text-yellow-950">How to fix</a>
              </p>
            </div>
          )}
        </div>
        
        {isLoading && <LoadingCard title="After" message={progressMessage} />}

        {!isLoading && generatedDiagram && (
            <div className="flex flex-col">
                <ImageCard 
                    title="After" 
                    imageUrl={generatedDiagram.imageUrl}
                    diagram={generatedDiagram}
                    onDownload={handleDownload}
                    onSave={onSave}
                    isSaved={isSaved}
                    onExpand={onExpand}
                />
                <p className="text-center text-sm text-brand-gray-500 mt-3 px-2">
                  Not quite right? Try regenerating for a different variation.
                </p>
                {generatedDiagram.explanation && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                        <span className="font-semibold">AI Note:</span> {generatedDiagram.explanation}
                    </div>
                )}
            </div>
        )}
        
        {!isLoading && !generatedDiagram && !error && (
            <div className="w-full flex flex-col">
                <h3 className="text-lg font-semibold text-center mb-3 text-brand-gray-700">After</h3>
                <div className="relative aspect-[4/3] w-full bg-brand-gray-100 border-2 border-dashed border-brand-gray-300 rounded-lg flex items-center justify-center">
                    <p className="text-brand-gray-500 text-center p-4">Your diagram will appear here.</p>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};