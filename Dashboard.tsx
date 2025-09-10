import React, { useState, useCallback, useEffect } from 'react';
import type { DiagramResult, User } from './types';
import { DashboardHeader } from './components/DashboardHeader';
import { ImageUploader } from './components/ImageUploader';
import { DiagramDisplay } from './components/DiagramDisplay';
import { Library } from './components/Library';
import { CTAButton } from './components/CTAButton';
import { transformImageToDiagram } from './services/geminiService';
import { Footer } from './components/Footer';
import { DashboardHome } from './components/DashboardHome';
import { ProfilePage } from './components/ProfilePage';
import { Lightbox } from './components/Lightbox';


interface DashboardProps {
  onLogout: () => void;
  initialFile: File | null;
}

type View = 'overview' | 'generator' | 'library' | 'profile';

const MOCK_USER: User = {
  name: 'Alex Doe',
  email: 'alex.doe@example.com',
  subscription: {
    plan: 'Pro',
    status: 'Active',
    renewsOn: 'December 1, 2024',
  },
  paymentMethod: {
    cardType: 'Visa',
    last4: '4242',
    expires: '12/25',
  },
};

const Dashboard: React.FC<DashboardProps> = ({ onLogout, initialFile }) => {
  const [view, setView] = useState<View>('overview');
  const [savedDiagrams, setSavedDiagrams] = useState<DiagramResult[]>([]);
  const [user, setUser] = useState<User>(MOCK_USER);

  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [originalImageMimeType, setOriginalImageMimeType] = useState<string | null>(null);
  const [generatedDiagram, setGeneratedDiagram] = useState<DiagramResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [progressMessage, setProgressMessage] = useState<string>('');
  const [showImageSizeWarning, setShowImageSizeWarning] = useState<boolean>(false);
  const [expandedImageUrl, setExpandedImageUrl] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedDiagrams = localStorage.getItem('driveDiagramLibrary');
      if (storedDiagrams) {
        setSavedDiagrams(JSON.parse(storedDiagrams));
      }
    } catch (e) {
      console.error("Failed to load diagrams from localStorage", e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('driveDiagramLibrary', JSON.stringify(savedDiagrams));
    } catch (e) {
      console.error("Failed to save diagrams to localStorage", e);
    }
  }, [savedDiagrams]);

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
        setView('generator');
      };
      img.src = imageUrl;
    };
    reader.readAsDataURL(file);
  }, []);

  useEffect(() => {
    if (initialFile) {
      handleImageUpload(initialFile);
    }
  }, [initialFile, handleImageUpload]);

  const handleTransform = useCallback(async () => {
    if (!originalImage || !originalImageMimeType) {
      setError("Please upload an image first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedDiagram(null);

    const progressMessages = [
        "Analyzing road layout...",
        "Identifying key features...",
        "Simplifying elements...",
        "Applying diagram style...",
        "Finalizing...",
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
        id: `diag_${Date.now()}`,
        createdAt: Date.now(),
        originalImageUrl: originalImage,
      };
      setGeneratedDiagram(diagramWithId);

    } catch (err) {
      console.error(err);
      setError("Failed to transform image. The AI may be busy or the format isn't supported. Please try again.");
    } finally {
      clearInterval(interval);
      setIsLoading(false);
      setProgressMessage('');
    }
  }, [originalImage, originalImageMimeType]);
  
  const handleReset = () => {
    setOriginalImage(null);
    setGeneratedDiagram(null);
    setError(null);
    setIsLoading(false);
    setShowImageSizeWarning(false);
  };

  const handleSaveToLibrary = (diagram: DiagramResult) => {
    if (!savedDiagrams.some(d => d.id === diagram.id)) {
      setSavedDiagrams(prev => [diagram, ...prev]);
    }
  };

  const handleDeleteFromLibrary = (diagramId: string) => {
    setSavedDiagrams(prev => prev.filter(d => d.id !== diagramId));
  };
  
  const handleExpand = (imageUrl: string) => {
    setExpandedImageUrl(imageUrl);
  };

  const handleCloseLightbox = () => {
    setExpandedImageUrl(null);
  };

  const isCurrentDiagramSaved = generatedDiagram ? savedDiagrams.some(d => d.id === generatedDiagram.id) : false;

  const renderContent = () => {
    switch (view) {
      case 'overview':
        return <DashboardHome diagramCount={savedDiagrams.length} recentDiagrams={savedDiagrams.slice(0, 3)} onCreateNew={() => setView('generator')} onExpand={handleExpand} />;
      case 'generator':
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
                onSave={handleSaveToLibrary}
                isSaved={isCurrentDiagramSaved}
                onExpand={handleExpand}
              />
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
      case 'library':
        return <Library diagrams={savedDiagrams} onDelete={handleDeleteFromLibrary} onExpand={handleExpand} />;
      case 'profile':
        return <ProfilePage user={user} onUpdateUser={setUser} />;
      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen flex flex-col font-sans text-brand-gray-900">
      <DashboardHeader activeView={view} onViewChange={setView} onLogout={onLogout} />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        {renderContent()}
      </main>
      <Footer />
      {expandedImageUrl && <Lightbox imageUrl={expandedImageUrl} onClose={handleCloseLightbox} />}
    </div>
  );
};

export default Dashboard;