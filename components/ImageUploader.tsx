
import React, { useState, useCallback } from 'react';
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

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <label
        htmlFor="dropzone-file"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragEvents}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center w-full h-64 border-2 border-brand-gray-300 border-dashed rounded-lg cursor-pointer bg-brand-gray-100 hover:bg-brand-gray-200 transition-colors ${isDragging ? 'border-brand-blue bg-blue-50' : ''} ${error ? 'border-red-500' : ''}`}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <UploadIcon className="w-10 h-10 mb-4 text-brand-gray-500" />
          <p className="mb-2 text-sm text-brand-gray-700"><span className="font-semibold">Click to upload</span> or drag and drop</p>
          <p className="text-xs text-brand-gray-500">PNG, JPG, or WEBP (MAX. {MAX_FILE_SIZE_MB}MB)</p>
        </div>
        <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept={ACCEPTED_IMAGE_TYPES.join(',')} />
      </label>
      {error && (
        <div className="mt-3 text-sm text-red-600 font-medium" role="alert">
            {error}
        </div>
      )}
    </div>
  );
};
