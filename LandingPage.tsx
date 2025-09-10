import React from 'react';
import { Header } from './components/Header';
import { FeatureShowcase } from './components/FeatureShowcase';
import { Footer } from './components/Footer';
import { ImageUploader } from './components/ImageUploader';

interface LandingPageProps {
  onLogin: (file?: File) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen flex flex-col font-sans text-brand-gray-900">
      <Header onLogin={onLogin} />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Transform Road Chaos into Clear Diagrams</h1>
          <p className="text-lg md:text-xl text-brand-gray-700 mb-8">
            Upload a photo of any driving scenario. Our AI will instantly convert it into a clean, professional diagram for teaching and learning.
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-brand-gray-200">
          <ImageUploader onImageUpload={(file) => onLogin(file)} />
           <div className="mt-6 text-center">
            <button
                onClick={() => onLogin()}
                className="inline-flex items-center justify-center text-lg font-semibold text-white bg-brand-blue hover:bg-brand-blue-dark transition-all duration-300 px-8 py-4 rounded-xl shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
                Get Started
            </button>
            <p className="text-sm text-brand-gray-500 mt-3">Sign in to begin creating and saving diagrams.</p>
           </div>
        </div>

        <FeatureShowcase />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;