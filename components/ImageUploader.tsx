import React from 'react';

interface Props {
  onImageSelected: (file: File) => void;
  isLoading: boolean;
}

export const ImageUploader: React.FC<Props> = ({ onImageSelected, isLoading }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageSelected(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-[80vh] px-4 text-center">
      <h1 className="text-4xl font-extrabold text-yellow-400 mb-8 leading-tight">
        AccessiTwin
        <br />
        <span className="text-2xl text-white font-normal block mt-4">
          Upload a photo of a device to get a simplified control panel.
        </span>
      </h1>

      <label 
        htmlFor="camera-input"
        className={`
          w-full max-w-sm aspect-square flex flex-col items-center justify-center
          rounded-3xl border-8 border-dashed
          ${isLoading ? 'border-gray-600 bg-gray-900 cursor-wait' : 'border-yellow-400 bg-gray-800 cursor-pointer hover:bg-gray-700'}
          transition-colors
        `}
      >
        {isLoading ? (
          <div className="flex flex-col items-center animate-pulse">
            <div className="w-16 h-16 border-4 border-t-yellow-400 border-r-yellow-400 border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
            <span className="text-2xl font-bold text-white">Analyzing...</span>
            <span className="text-lg text-gray-400 mt-2">Please wait</span>
          </div>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-yellow-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-3xl font-bold text-white underline decoration-4 decoration-yellow-400">
              Take Photo
            </span>
            <span className="text-xl text-gray-300 mt-4">or select from library</span>
          </>
        )}
        <input 
          id="camera-input"
          type="file" 
          accept="image/*" 
          capture="environment"
          onChange={handleChange}
          disabled={isLoading}
          className="hidden"
        />
      </label>
    </div>
  );
};