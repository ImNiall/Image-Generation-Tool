import React, { useEffect } from 'react';

interface LightboxProps {
  imageUrl: string;
  onClose: () => void;
}

export const Lightbox: React.FC<LightboxProps> = ({ imageUrl, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Expanded image view"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-4xl leading-none hover:text-brand-gray-300 transition-colors"
        aria-label="Close"
      >
        &times;
      </button>
      <div className="relative max-w-full max-h-full" onClick={(e) => e.stopPropagation()}>
        <img
          src={imageUrl}
          alt="Expanded diagram"
          className="max-w-full max-h-[90vh] object-contain"
        />
      </div>
    </div>
  );
};
