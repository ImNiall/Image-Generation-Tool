
import React from 'react';
import { ZapIcon, EditIcon, LayersIcon } from './icons';

const features = [
  {
    icon: <ZapIcon className="w-8 h-8 text-white" />,
    title: 'Instant Transformation',
    description: 'Go from a cluttered photo to a clean diagram in seconds. Our AI handles the heavy lifting.',
  },
  {
    icon: <EditIcon className="w-8 h-8 text-white" />,
    title: 'Focus on What Matters',
    description: 'Automatically removes distracting backgrounds, shadows, and unnecessary objects from your images.',
  },
  {
    icon: <LayersIcon className="w-8 h-8 text-white" />,
    title: 'Professional & Clear',
    description: 'Generates polished, cartoon-style visuals perfect for lesson plans, presentations, and training materials.',
  },
];

export const FeatureShowcase: React.FC = () => {
  return (
    <div className="mt-16 md:mt-24">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold">The Easiest Way to Create Teaching Aids</h2>
        <p className="mt-4 text-lg text-brand-gray-700">
          DriveDiagram is built for educators who need quality visuals without the hassle of complex design software.
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
