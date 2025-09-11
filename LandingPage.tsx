import React, { useState, useRef } from 'react';
import { Header } from './components/Header';
import { FeatureShowcase, HowItWorks } from './components/FeatureShowcase';
import { Footer } from './components/Footer';
import { Generator } from './components/Generator';
import { LimitReachedModal } from './components/LimitReachedModal';
import { CTAButton } from './components/CTAButton';
import { Lightbox } from './components/Lightbox';
import { BeforeAfterShowcase } from './components/BeforeAfterShowcase';

interface LandingPageProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onSignup: (email: string, password: string, name: string) => Promise<void>;
  onResetPassword: (email: string) => Promise<void>;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onSignup, onResetPassword }) => {
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [expandedImageUrl, setExpandedImageUrl] = useState<string | null>(null);
  const generatorRef = useRef<HTMLDivElement>(null);

  const handleScrollToGenerator = () => {
    generatorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  
  const handleExpand = (imageUrl: string) => {
    setExpandedImageUrl(imageUrl);
  };

  const handleCloseLightbox = () => {
    setExpandedImageUrl(null);
  };
  
  const handleSignUpRequest = () => {
    // This is a placeholder for triggering the signup modal from the header
    // In a real app, this might use a context or a more direct method.
    // For now, we'll log it and the user can click the main sign up button.
    console.log("Signup requested from modal");
    setShowLimitModal(false);
    // You would typically call a function here to open the signup modal in the header
  }

  return (
    <div className="min-h-screen flex flex-col font-sans text-brand-gray-900">
      <Header onLogin={onLogin} onSignup={onSignup} onResetPassword={onResetPassword} />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Transform Complex Road Scenarios into Clear Teaching Diagrams With AI</h1>
          <p className="text-lg md:text-xl text-brand-gray-700">
            Convert confusing screenshots from Google Earth into simple, professional diagrams. Perfect for explaining complex maneuvers and boosting student confidence.
          </p>
          <div className="mt-8">
            <CTAButton onClick={handleScrollToGenerator} shining>
              Generate Your First Diagram
            </CTAButton>
          </div>
        </div>

        <BeforeAfterShowcase />

        <div ref={generatorRef} className="mt-16 md:mt-24">
            <div className="text-center max-w-2xl mx-auto mb-12">
                <h2 className="text-3xl font-bold">Tackle Real-World Junctions</h2>
                <p className="mt-4 text-lg text-brand-gray-700">
                    Take a screenshot from Google Earth of a tricky local roundabout or intersection. Upload it here to create a clear, valuable teaching aid for your next lesson.
                </p>
            </div>
            <Generator 
              isGuestMode={true} 
              onGenerationAttemptBlocked={() => setShowLimitModal(true)}
              onGuestSaveAttempt={() => setShowLimitModal(true)}
              onExpand={handleExpand}
            />
        </div>
        
        <HowItWorks />

        <FeatureShowcase />
      </main>
      <Footer />
      <LimitReachedModal 
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        onSignUp={handleSignUpRequest}
      />
      {expandedImageUrl && <Lightbox imageUrl={expandedImageUrl} onClose={handleCloseLightbox} />}
    </div>
  );
};

export default LandingPage;
