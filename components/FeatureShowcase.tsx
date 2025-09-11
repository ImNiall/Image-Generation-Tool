import React from 'react';
import { ZapIcon, EditIcon, LayersIcon, UploadIcon, SparklesIcon, DownloadIcon } from './icons';

const features = [
  {
    icon: <ZapIcon className="w-8 h-8 text-white" />,
    title: 'Effortless Clarity',
    description: 'Transform any satellite image into a simple diagram in seconds, making it lesson-ready instantly.',
  },
  {
    icon: <EditIcon className="w-8 h-8 text-white" />,
    title: 'Focus on What Matters',
    description: 'Our AI intelligently removes distracting vehicles, signs, and visual clutter, allowing your students to focus solely on the road layout and markings.',
  },
  {
    icon: <LayersIcon className="w-8 h-8 text-white" />,
    title: 'Professional & Consistent',
    description: 'Generate clean, consistent, and easy-to-understand diagrams perfect for your website, social media, or in-car tablet presentations.',
  },
];

export const FeatureShowcase: React.FC = () => {
  return (
    <div className="mt-16 md:mt-24">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold">Elevate Your Lessons with Professional Diagrams</h2>
        <p className="mt-4 text-lg text-brand-gray-700">
          Built for driving instructors who need high-quality teaching materials to explain complex scenarios with absolute clarity.
        </p>
      </div>
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <div key={index} className="bg-white p-8 rounded-lg shadow-sm border border-brand-gray-200 text-center">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-brand-blue mx-auto mb-6">
              {feature.icon}
            </div>
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-brand-gray-700">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const howItWorksSteps = [
  {
    icon: <UploadIcon className="w-8 h-8 text-brand-blue" />,
    title: '1. Capture Any Scenario',
    description: "Take a screenshot of a complex junction from Google Earth. The more detail, the better.",
  },
  {
    icon: <SparklesIcon className="w-8 h-8 text-brand-blue" />,
    title: '2. Let AI Do the Work',
    description: 'Our AI analyzes the road layout, removes all vehicles and distractions, and instantly generates a clean, uncluttered diagram.',
  },
  {
    icon: <DownloadIcon className="w-8 h-8 text-brand-blue" />,
    title: '3. Teach with Confidence',
    description: 'Download your high-resolution diagram to use in lessons, on your website, or to share directly with your students.',
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <div className="mt-16 md:mt-24">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold">From Screenshot to Teaching Aid in Three Simple Steps</h2>
        <p className="mt-4 text-lg text-brand-gray-700">
          Creating a custom diagram for any road scenario is quick and straightforward.
        </p>
      </div>
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {howItWorksSteps.map((step, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-brand-gray-200 text-center">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mx-auto mb-6">
              {step.icon}
            </div>
            <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
            <p className="text-brand-gray-700 text-sm">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
