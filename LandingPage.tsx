import React, { useState } from 'react';
import { Header } from './components/Header';
import { FeatureShowcase } from './components/FeatureShowcase';
import { Footer } from './components/Footer';
import { Generator } from './components/Generator';
import { LimitReachedModal } from './components/LimitReachedModal';

interface LandingPageProps {
  onLogin: (email: string, password: string) => void;
  onSignup: (email: string, password: string, name: string) => void;
  onResetPassword: (email: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onSignup, onResetPassword }) => {
  const [showLimitModal, setShowLimitModal] = useState(false);

  return (
    <div className="min-h-screen flex flex-col font-sans text-brand-gray-900">
      <Header onLogin={onLogin} onSignup={onSignup} onResetPassword={onResetPassword} />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Transform Road Chaos into Clear Diagrams</h1>
          <p className="text-lg md:text-xl text-brand-gray-700 mb-8">
            Upload a photo of any driving scenario. Our AI will instantly convert it into a clean, professional diagram. Try it up to 3 times for free!
          </p>
        </div>

        <Generator 
          isGuestMode={true} 
          onGenerationAttemptBlocked={() => setShowLimitModal(true)} 
        />

        <FeatureShowcase />
      </main>
      <Footer />
      <LimitReachedModal 
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        onSignUp={() => {}} // Will be handled by Header modals
      />
    </div>
  );
};

export default LandingPage;
