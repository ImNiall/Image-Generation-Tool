
import React, { useState, useCallback, useRef } from 'react';
import { UploadIcon } from './icons';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
}

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndUpload = useCallback((file: File | null | undefined) => {
    if (!file) {
      return;
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setError(`Invalid file type. Please use PNG, JPG, or WEBP.`);
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(`File is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    setError(null);
    onImageUpload(file);
  }, [onImageUpload]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    validateAndUpload(e.target.files?.[0]);
    // Reset the input value to allow uploading the same file again
    e.target.value = '';
  };

  const handleDragEvents = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setError(null);
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    handleDragEvents(e);
    setIsDragging(true);
  }, [handleDragEvents]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    handleDragEvents(e);
    setIsDragging(false);
  }, [handleDragEvents]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    handleDragEvents(e);
    setIsDragging(false);
    validateAndUpload(e.dataTransfer.files?.[0]);
  }, [handleDragEvents, validateAndUpload]);
  
  const handleChooseFileClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      {/* Traditional file input button */}
      <button
        type="button"
        onClick={handleChooseFileClick}
        className="w-full max-w-xs inline-flex items-center justify-center gap-3 bg-brand-blue hover:bg-brand-blue-dark text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300"
      >
        <UploadIcon className="w-5 h-5" />
        <span>Choose a file...</span>
      </button>

      {/* Hidden file input, now separate */}
      <input
        ref={fileInputRef}
        id="dropzone-file"
        type="file"
        className="hidden"
        onChange={handleFileChange}
        accept={ACCEPTED_IMAGE_TYPES.join(',')}
      />

      {/* Separator */}
      <div className="relative my-4 w-full max-w-xs">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-brand-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          {/* bg-white because the parent Generator card is white */}
          <span className="bg-white px-2 text-brand-gray-500 uppercase">Or</span>
        </div>
      </div>

      {/* Drag and drop area */}
      <label
        htmlFor="dropzone-file"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragEvents}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center w-full h-56 border-2 border-brand-gray-300 border-dashed rounded-lg cursor-pointer bg-brand-gray-100 hover:bg-brand-gray-200 transition-colors ${isDragging ? 'border-brand-blue bg-blue-50' : ''} ${error ? 'border-red-500' : ''}`}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <UploadIcon className="w-10 h-10 mb-4 text-brand-gray-500" />
          <p className="mb-2 text-sm text-brand-gray-700 font-semibold">Drag and drop an image here</p>
          <p className="text-xs text-brand-gray-500">PNG, JPG, or WEBP (MAX. {MAX_FILE_SIZE_MB}MB)</p>
        </div>
      </label>

      {error && (
        <div className="mt-3 text-sm text-red-600 font-medium" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};
