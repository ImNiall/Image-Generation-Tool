
import React, { useState, useEffect, useCallback } from 'react';
import type { DiagramResult } from './types';
import type { User } from './lib/supabase';
import { supabase } from './lib/supabase';

import { DashboardHeader } from './components/DashboardHeader';
import { Library } from './components/Library';
import { DashboardHome } from './components/DashboardHome';
import { ProfilePage } from './components/ProfilePage';
import { Lightbox } from './components/Lightbox';
import { Generator } from './components/Generator';
import { ImageEditor } from './components/ImageEditor';
import { DashboardSidebar } from './components/DashboardSidebar';


interface DashboardProps {
  onLogout: () => void;
  user: User | null;
}

export type View = 'overview' | 'generator' | 'editor' | 'library' | 'profile';

const Dashboard: React.FC<DashboardProps> = ({ onLogout, user }) => {
  const [view, setView] = useState<View>('overview');
  const [savedDiagrams, setSavedDiagrams] = useState<DiagramResult[]>([]);
  const [expandedImageUrl, setExpandedImageUrl] = useState<string | null>(null);
  const [loadingDiagrams, setLoadingDiagrams] = useState(true);

  const fetchDiagrams = useCallback(async () => {
    if (!user) return;
    setLoadingDiagrams(true);
    try {
      const { data, error } = await supabase
        .from('diagrams')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formattedData: DiagramResult[] = data.map((d: any) => ({
          id: d.id,
          imageUrl: d.image_url,
          explanation: d.explanation,
          originalImageUrl: d.original_image_url,
          createdAt: new Date(d.created_at).getTime(),
      }));

      setSavedDiagrams(formattedData);
    } catch (e) {
      console.error("Failed to load diagrams from Supabase", e);
    } finally {
        setLoadingDiagrams(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDiagrams();
  }, [fetchDiagrams]);


  const handleSaveToLibrary = async (diagram: DiagramResult) => {
    if (!user || savedDiagrams.some(d => d.id === diagram.id)) {
        return;
    }

    try {
        const { data, error } = await supabase
            .from('diagrams')
            .insert({
                id: diagram.id,
                user_id: user.id,
                image_url: diagram.imageUrl,
                original_image_url: diagram.originalImageUrl,
                explanation: diagram.explanation,
            })
            .select();
        
        if (error) throw error;
        
        // Add to local state to update UI immediately
        if (data && data[0]) {
             setSavedDiagrams(prev => [diagram, ...prev]);
        }
    } catch(e) {
        console.error("Failed to save diagram to Supabase", e);
    }
  };

  const handleDeleteFromLibrary = async (diagramId: string) => {
    try {
        const { error } = await supabase
            .from('diagrams')
            .delete()
            .eq('id', diagramId);

        if (error) throw error;
        setSavedDiagrams(prev => prev.filter(d => d.id !== diagramId));
    } catch(e) {
        console.error("Failed to delete diagram from Supabase", e);
    }
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
  
  const userProfile = {
      name: user?.user_metadata?.name || 'Instructor',
      email: user?.email || '',
  }

  const renderContent = () => {
    if (loadingDiagrams && view !== 'generator' && view !== 'editor') {
        return <div className="text-center p-10">Loading your data...</div>
    }
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
        // This is a simplified user object for display.
        // A real app might fetch a separate 'profiles' table.
        const displayUser = {
            name: user?.user_metadata?.name || 'Valued Instructor',
            email: user?.email || 'No email found',
            subscription: { plan: 'Pro', status: 'Active', renewsOn: 'N/A' },
            paymentMethod: { cardType: 'Visa', last4: '****', expires: 'MM/YY' }
        };
        return <ProfilePage user={displayUser} onUpdateUser={() => {}} />;
      default:
        return null;
    }
  }

  return (
    <div className="flex h-screen bg-brand-gray-100 font-sans text-brand-gray-900">
      <DashboardSidebar 
        user={userProfile} 
        activeView={view} 
        onViewChange={setView} 
        onLogout={onLogout} 
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader activeView={view} />
        <main className="flex-grow p-4 md:p-8 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
      {expandedImageUrl && <Lightbox imageUrl={expandedImageUrl} onClose={handleCloseLightbox} />}
    </div>
  );
};

export default Dashboard;
