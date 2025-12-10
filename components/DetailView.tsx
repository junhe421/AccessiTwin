import React, { useEffect, useCallback } from 'react';
import { DeviceControl } from '../types';

interface Props {
  control: DeviceControl;
  onBack: () => void;
}

export const DetailView: React.FC<Props> = ({ control, onBack }) => {
  const speak = useCallback(() => {
    window.speechSynthesis.cancel();
    const textToRead = `${control.label}. ${control.detailText}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 0.9; // Slightly slower for clarity
    window.speechSynthesis.speak(utterance);
  }, [control]);

  useEffect(() => {
    // Haptic feedback on entry
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    speak();

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [speak]);

  return (
    <div className="flex flex-col min-h-screen bg-black text-white p-6 animate-in fade-in zoom-in duration-200">
      <button 
        onClick={onBack}
        className="self-start mb-6 px-8 py-6 bg-gray-900 border-2 border-white rounded-2xl text-2xl font-bold hover:bg-gray-800 active:scale-95 transition-all flex items-center gap-3 w-full md:w-auto justify-center"
        aria-label="Back to control list"
      >
        <span>←</span>
        <span>Back</span>
      </button>

      <div className="flex-1 flex flex-col items-start justify-center max-w-3xl mx-auto w-full space-y-8">
        <h2 className="text-5xl font-extrabold text-yellow-400 border-b-4 border-yellow-400 pb-6 w-full">
          {control.label}
        </h2>
        
        <div className="space-y-6 w-full">
          <p className="text-4xl md:text-5xl font-medium leading-relaxed text-white">
            {control.detailText}
          </p>

          <button
            onClick={speak}
            className="mt-8 w-full py-6 bg-blue-900 border-4 border-blue-400 rounded-2xl text-2xl font-bold text-white hover:bg-blue-800 active:scale-95 transition-all flex items-center justify-center gap-3"
            aria-label="Replay voice description"
          >
            <span aria-hidden="true">🔊</span>
            Replay Voice
          </button>
        </div>

        <div className="w-full mt-8 p-6 bg-gray-900 rounded-xl border-l-8 border-gray-600">
          <p className="text-xl text-gray-300 uppercase tracking-widest font-bold mb-2">Physical Location</p>
          <p className="text-2xl text-white">
            {control.description}
          </p>
        </div>
      </div>
    </div>
  );
};