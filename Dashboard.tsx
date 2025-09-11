import React, { useState, useEffect } from 'react';
import type { DiagramResult, User } from './types';
import { DashboardHeader } from './components/DashboardHeader';
import { Library } from './components/Library';
import { transformImageToDiagram } from './services/geminiService';
import { Footer } from './components/Footer';
import { DashboardHome } from './components/DashboardHome';
import { ProfilePage } from './components/ProfilePage';
import { Lightbox } from './components/Lightbox';
import { Generator } from './components/Generator';
import { ImageEditor } from './components/ImageEditor';


interface DashboardProps {
  onLogout: () => void;
}

export type View = 'overview' | 'generator' | 'library' | 'profile' | 'editor';

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

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [view, setView] = useState<View>('overview');
  const [savedDiagrams, setSavedDiagrams] = useState<DiagramResult[]>([]);
  const [user, setUser] = useState<User>(MOCK_USER);
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

  const isDiagramSaved = (diagramId: string): boolean => {
    return savedDiagrams.some(d => d.id === diagramId);
  }

  const renderContent = () => {
    switch (view) {
      case 'overview':
        return <DashboardHome diagramCount={savedDiagrams.length} recentDiagrams={savedDiagrams.slice(0, 3)} onCreateNew={() => setView('generator')} onExpand={handleExpand} />;
      case 'generator':
        return (
          <Generator 
            isGuestMode={false} 
            onSaveDiagram={handleSaveToLibrary}
            isDiagramSaved={isDiagramSaved}
            onExpand={handleExpand}
          />
        );
      case 'editor':
        return <ImageEditor />;
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
