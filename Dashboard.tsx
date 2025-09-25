
import React, { useState, useEffect, useCallback } from 'react';
import type { DiagramResult } from './types';
import type { User } from './lib/supabase';
import { supabase } from './lib/supabase';

import { DashboardHeader } from './components/DashboardHeader';
import CreditsDisplay from './components/CreditsDisplay';
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
  const [savedClientIds, setSavedClientIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);
  const [expandedImageUrl, setExpandedImageUrl] = useState<string | null>(null);
  const [loadingDiagrams, setLoadingDiagrams] = useState(true);

  const fetchDiagrams = useCallback(async () => {
    if (!user) {
      console.log('[Dashboard] No user, skipping diagram fetch');
      return;
    }
    
    console.log('[Dashboard] Fetching diagrams for user:', user.id);
    setLoadingDiagrams(true);
    
    // Add a minimum loading time to prevent flickering
    const startTime = Date.now();
    const MIN_LOADING_TIME = 800; // ms
    
    try {
      console.log('[Dashboard] Querying Supabase diagrams table');
      const { data, error } = await supabase
        .from('diagrams')
        .select('id, image_url, original_image_url, explanation, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('[Dashboard] Supabase query error:', error);
        throw error;
      }
      
      console.log('[Dashboard] Fetched diagrams count:', data?.length || 0);
      
      // Process diagrams in batches to prevent UI freezing with large datasets
      const processDiagramsInBatches = async (rawData: any[]) => {
        const BATCH_SIZE = 10;
        const allDiagrams: DiagramResult[] = [];
        
        for (let i = 0; i < rawData.length; i += BATCH_SIZE) {
          const batch = rawData.slice(i, i + BATCH_SIZE);
          
          const batchDiagrams = batch.map((d: any) => ({
            id: d.id,
            imageUrl: d.image_url,
            explanation: d.explanation,
            originalImageUrl: d.original_image_url,
            createdAt: new Date(d.created_at).getTime(),
            // Add a loading state for images
            imageLoaded: false
          }));
          
          allDiagrams.push(...batchDiagrams);
          
          // Update state with each batch to show progress
          if (i === 0) {
            setSavedDiagrams(allDiagrams);
          } else {
            setSavedDiagrams(prev => [...prev, ...batchDiagrams]);
          }
          
          // Small delay to allow UI to update
          if (i + BATCH_SIZE < rawData.length) {
            await new Promise(resolve => setTimeout(resolve, 10));
          }
        }
        
        return allDiagrams;
      };
      
      await processDiagramsInBatches(data);
    } catch (e: any) {
      console.error("Failed to load diagrams from Supabase", e);
      
      // Handle database timeout errors gracefully
      if (e?.code === '57014' || (e?.message && e.message.includes('timeout'))) {
        console.log('[Dashboard] Database timeout detected, continuing with empty diagrams list');
        setSavedDiagrams([]);
        setToast('Your diagrams are taking too long to load. Please try again later.');
      } else if (e?.message && e.message.includes('Invalid refresh token')) {
        // Handle refresh token errors
        console.log('[Dashboard] Invalid refresh token, signing out user');
        setToast('Your session has expired. Please sign in again.');
        setTimeout(() => {
          supabase.auth.signOut().then(() => {
            window.location.reload();
          });
        }, 2000);
      } else {
        // Show other errors in UI
        setToast('Error loading diagrams: ' + (e instanceof Error ? e.message : String(e)));
      }
    } finally {
      // Ensure minimum loading time to prevent flickering
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < MIN_LOADING_TIME) {
        await new Promise(resolve => setTimeout(resolve, MIN_LOADING_TIME - elapsedTime));
      }
      
      setLoadingDiagrams(false);
      console.log('[Dashboard] Finished loading diagrams');
    }
  }, [user]);

  useEffect(() => {
    fetchDiagrams();
  }, [fetchDiagrams]);


  const handleSaveToLibrary = async (diagram: DiagramResult) => {
    if (!user || savedDiagrams.some(d => d.id === diagram.id || d.imageUrl === diagram.imageUrl)) {
        return;
    }

    try {
        const { data, error } = await supabase
            .from('diagrams')
            .insert({
                // Let the database generate UUID id
                user_id: user.id,
                image_url: diagram.imageUrl,
                original_image_url: diagram.originalImageUrl,
                explanation: diagram.explanation,
            })
            .select();
        
        if (error) throw error;
        
        // Add to local state to update UI immediately
        if (data && data[0]) {
             // Use DB-generated id so Library delete works
             const saved: DiagramResult = { ...diagram, id: data[0].id };
             setSavedDiagrams(prev => [saved, ...prev]);
             // Mark the client-generated id as saved so the badge appears
             setSavedClientIds(prev => new Set(prev).add(diagram.id));
             setToast('Saved to Library');
             setTimeout(() => setToast(null), 2000);
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
    // Consider saved if DB contains the id OR we saved this client id in-session
    if (savedClientIds.has(diagramId)) return true;
    return savedDiagrams.some(d => d.id === diagramId);
  }
  
  const userProfile = {
      name: user?.user_metadata?.name || 'Instructor',
      email: user?.email || '',
  }

  const renderContent = () => {
    // Only show loading state for overview and library views
    if (loadingDiagrams && (view === 'overview' || view === 'library')) {
        return (
          <div className="text-center p-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-brand-blue border-t-transparent mb-4"></div>
            <p>Loading your data...</p>
            <p className="text-sm text-brand-gray-500 mt-2">This may take a moment</p>
          </div>
        );
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
      {toast && (
        <div className="fixed top-4 right-4 bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded shadow-lg z-50">
          {toast}
        </div>
      )}
      <DashboardSidebar 
        user={userProfile} 
        activeView={view} 
        onViewChange={setView} 
        onLogout={onLogout} 
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader activeView={view}>
          {user && <CreditsDisplay className="ml-auto mr-4" />}
        </DashboardHeader>
        <main className="flex-grow p-4 md:p-8 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
      {expandedImageUrl && <Lightbox imageUrl={expandedImageUrl} onClose={handleCloseLightbox} />}
    </div>
  );
};

export default Dashboard;
