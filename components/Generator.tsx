import React, { useState, useCallback, useEffect } from 'react';
import type { DiagramResult } from '../types';
import { ImageUploader } from './ImageUploader';
import { DiagramDisplay } from './DiagramDisplay';
import { CTAButton } from './CTAButton';
import { transformImageToDiagram } from '../services/geminiService';
import { getGuestAttempts, incrementGuestAttempts, GUEST_ATTEMPT_LIMIT } from '../services/guestService';
import { Lightbox } from './Lightbox';

interface GeneratorProps {
  isGuestMode: boolean;
  onGenerationAttemptBlocked?: () => void;
  onSaveDiagram?: (diagram: DiagramResult) => void;
  onGuestSaveAttempt?: () => void;
  isDiagramSaved?: (diagramId: string) => boolean;
  onExpand?: (imageUrl: string) => void;
}

export const Generator: React.FC<GeneratorProps> = ({ 
    isGuestMode, 
    onGenerationAttemptBlocked, 
    onSaveDiagram,
    onGuestSaveAttempt,
    isDiagramSaved,
    onExpand,
}) => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [originalImageMimeType, setOriginalImageMimeType] = useState<string | null>(null);
  const [generatedDiagram, setGeneratedDiagram] = useState<DiagramResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [progressMessage, setProgressMessage] = useState<string>('');
  const [showImageSizeWarning, setShowImageSizeWarning] = useState<boolean>(false);
  const [guestAttempts, setGuestAttempts] = useState(0);

  useEffect(() => {
    if (isGuestMode) {
      setGuestAttempts(getGuestAttempts());
    }
  }, [isGuestMode]);

  const handleImageUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      if (!imageUrl) return;

      const img = new Image();
      img.onload = () => {
        setShowImageSizeWarning(img.width > 900 || img.height > 900);
        setOriginalImage(imageUrl);
        setOriginalImageMimeType(file.type);
        setGeneratedDiagram(null);
        setError(null);
      };
      img.src = imageUrl;
    };
    reader.readAsDataURL(file);
  }, []);

  const handleTransform = useCallback(async () => {
    if (isGuestMode && guestAttempts >= GUEST_ATTEMPT_LIMIT) {
      onGenerationAttemptBlocked?.();
      return;
    }
      
    if (!originalImage || !originalImageMimeType) {
      setError("Please upload an image first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedDiagram(null);

    const progressMessages = [
        "Analyzing road layout...", "Identifying key features...", "Simplifying elements...",
        "Applying diagram style...", "Finalizing...",
    ];

    let messageIndex = 0;
    const interval = setInterval(() => {
        setProgressMessage(progressMessages[messageIndex % progressMessages.length]);
        messageIndex++;
    }, 2000);

    try {
      const base64Data = originalImage.split(',')[1];
      const result = await transformImageToDiagram(base64Data, originalImageMimeType);
      
      const diagramWithId: DiagramResult = {
        ...result,
        id: `diag_${Date.now()}`, createdAt: Date.now(), originalImageUrl: originalImage,
      };
      setGeneratedDiagram(diagramWithId);
      
      if (isGuestMode) {
        const newAttempts = incrementGuestAttempts();
        setGuestAttempts(newAttempts);
      }

    } catch (err) {
      console.error(err);
      setError("Failed to transform image. The AI may be busy or the format isn't supported. Please try again.");
    } finally {
      clearInterval(interval);
      setIsLoading(false);
      setProgressMessage('');
    }
  }, [originalImage, originalImageMimeType, isGuestMode, guestAttempts, onGenerationAttemptBlocked]);
  
  const handleReset = () => {
    setOriginalImage(null);
    setGeneratedDiagram(null);
    setError(null);
    setIsLoading(false);
    setShowImageSizeWarning(false);
  };

  const isCurrentDiagramSaved = generatedDiagram && isDiagramSaved ? isDiagramSaved(generatedDiagram.id) : false;
  const remainingAttempts = GUEST_ATTEMPT_LIMIT - guestAttempts;

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-brand-gray-200">
      {!originalImage && <ImageUploader onImageUpload={handleImageUpload} />}
      
      {originalImage && (
        <DiagramDisplay 
          originalImage={originalImage} 
          generatedDiagram={generatedDiagram} 
          isLoading={isLoading} 
          error={error} 
          progressMessage={progressMessage}
          showImageSizeWarning={showImageSizeWarning}
          onSave={onSaveDiagram}
          onGuestSaveAttempt={onGuestSaveAttempt}
          isSaved={isCurrentDiagramSaved}
          onExpand={onExpand}
        />
      )}

      {isGuestMode && originalImage && (
        <div className="text-center mt-4 text-sm font-medium text-brand-gray-600">
            {remainingAttempts > 0 ? (
                <p>You have <span className="text-brand-blue font-bold">{remainingAttempts}</span> free generation{remainingAttempts !== 1 ? 's' : ''} remaining.</p>
            ) : (
                <p className="text-amber-700">You've used all your free generations. Sign up to continue!</p>
            )}
        </div>
      )}

      {originalImage && (
        <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-4">
          <CTAButton onClick={handleTransform} disabled={isLoading} isLoading={isLoading}>
            {generatedDiagram ? 'Regenerate Diagram' : 'Create Diagram'}
          </CTAButton>
          <button
            onClick={handleReset}
            className="font-semibold text-brand-gray-500 hover:text-brand-gray-900 transition-colors"
            disabled={isLoading}
          >
            Start Over
          </button>
        </div>
      )}
    </div>
  );
};