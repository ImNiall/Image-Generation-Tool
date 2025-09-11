import React, { useState, useEffect } from 'react';
import { beforeAfterExamples } from '../mockData';
import { ArrowRightIcon } from './icons';

const ImageWithLabel: React.FC<{ imageUrl: string; label: string }> = ({ imageUrl, label }) => (
  <div className="relative aspect-video w-full overflow-hidden rounded-lg shadow-sm border border-brand-gray-200">
    <img src={imageUrl} alt={label} className="w-full h-full object-cover bg-brand-gray-100" />
    <span className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-[10px] font-bold py-0.5 px-2 rounded-full">
      {label}
    </span>
  </div>
);

export const BeforeAfterShowcase: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % beforeAfterExamples.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, [activeIndex]);

  const handleDotClick = (index: number) => {
    setActiveIndex(index);
  };

  const currentExample = beforeAfterExamples[activeIndex];

  return (
    <div className="mt-12">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold">From Chaos to Clarity</h2>
        <p className="mt-4 text-lg text-brand-gray-700">
          See how DriveDiagram effortlessly transforms real-world road complexity into simple, easy-to-understand diagrams.
        </p>
      </div>

      <div className="mt-10 max-w-3xl mx-auto">
        <div key={activeIndex} className="bg-white p-4 rounded-lg animate-fade-in">
          <div className="flex items-center gap-3">
            <ImageWithLabel imageUrl={currentExample.beforeUrl} label="BEFORE" />
            <ArrowRightIcon className="w-6 h-6 text-brand-blue shrink-0" />
            <ImageWithLabel imageUrl={currentExample.afterUrl} label="AFTER" />
          </div>
          <h3 className="text-center font-semibold text-brand-gray-800 mt-4">{currentExample.title}</h3>
        </div>

        <div className="flex justify-center gap-2 mt-4">
          {beforeAfterExamples.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                activeIndex === index ? 'bg-brand-blue scale-125' : 'bg-brand-gray-300 hover:bg-brand-gray-500'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
