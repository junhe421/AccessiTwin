import React, { useState } from 'react';
import { DeviceAnalysis, DeviceControl, ControlCategory, AppStatus } from './types';
import { fileToBase64 } from './utils';
import { analyzeDeviceImage } from './services/geminiService';
import { ImageUploader } from './components/ImageUploader';
import { AccessibleButton } from './components/AccessibleButton';
import { DetailView } from './components/DetailView';

export default function App() {
  const [status, setStatus] = useState<AppStatus>('IDLE');
  const [analysis, setAnalysis] = useState<DeviceAnalysis | null>(null);
  const [selectedControl, setSelectedControl] = useState<DeviceControl | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleImageSelect = async (file: File) => {
    setStatus('ANALYZING');
    try {
      const base64 = await fileToBase64(file);
      // Pass the actual mime type of the file
      const data = await analyzeDeviceImage(base64, file.type);
      setAnalysis(data);
      setStatus('SUCCESS');
    } catch (e) {
      console.error(e);
      setStatus('ERROR');
      alert("We couldn't analyze that image. Please check your connection and try again.");
    }
  };

  const handleControlClick = (control: DeviceControl) => {
    setSelectedControl(control);
  };

  const handleReset = () => {
    setAnalysis(null);
    setStatus('IDLE');
    setSelectedControl(null);
    setShowAdvanced(false);
  };

  // View: Image Upload
  if (status === 'IDLE' || status === 'ANALYZING' || status === 'ERROR') {
    return (
      <main className="min-h-screen bg-black text-white">
        <ImageUploader onImageSelected={handleImageSelect} isLoading={status === 'ANALYZING'} />
      </main>
    );
  }

  // View: Detail (Zoomed In)
  if (selectedControl) {
    return (
      <main className="min-h-screen bg-black text-white">
        <DetailView 
          control={selectedControl} 
          onBack={() => setSelectedControl(null)} 
        />
      </main>
    );
  }

  // View: Control List
  if (status === 'SUCCESS' && analysis) {
    const primaryControls = analysis.controls.filter(c => c.category === ControlCategory.PRIMARY);
    const secondaryControls = analysis.controls.filter(c => c.category === ControlCategory.SECONDARY);
    const advancedControls = analysis.controls.filter(c => c.category === ControlCategory.ADVANCED || c.category === ControlCategory.DANGER);

    return (
      <main className="min-h-screen bg-black text-white pb-32">
        {/* Header */}
        <header className="p-6 border-b border-gray-800 bg-gray-900 sticky top-0 z-10">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-yellow-400">{analysis.deviceName}</h1>
              <p className="text-lg mt-2 text-gray-300">{analysis.summary}</p>
            </div>
            <button 
              onClick={handleReset}
              className="px-4 py-2 border-2 border-white text-white font-bold rounded-lg hover:bg-gray-800"
              aria-label="Scan a new device"
            >
              New Scan
            </button>
          </div>
        </header>

        <div className="max-w-md mx-auto p-4">
          
          {/* Primary Controls - Always Visible */}
          <section aria-labelledby="primary-heading" className="mb-8">
            <h2 id="primary-heading" className="sr-only">Primary Controls</h2>
            <div className="grid gap-4">
              {primaryControls.map(control => (
                <AccessibleButton key={control.id} control={control} onClick={handleControlClick} />
              ))}
            </div>
          </section>

          {/* Secondary Controls - Always Visible but less prominent visually in list */}
          {secondaryControls.length > 0 && (
            <section aria-labelledby="secondary-heading" className="mb-8 border-t border-gray-800 pt-6">
              <h2 id="secondary-heading" className="text-2xl font-bold mb-4 text-white">Settings</h2>
              <div className="grid grid-cols-2 gap-4">
                {secondaryControls.map(control => (
                  <AccessibleButton key={control.id} control={control} onClick={handleControlClick} />
                ))}
              </div>
            </section>
          )}

          {/* Advanced Controls - Hidden behind toggle */}
          {advancedControls.length > 0 && (
            <section aria-labelledby="advanced-heading" className="mb-8 border-t border-gray-800 pt-6">
              <button 
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full py-4 text-xl font-bold text-left flex justify-between items-center text-gray-300 hover:text-white"
                aria-expanded={showAdvanced}
              >
                <span>{showAdvanced ? 'Hide' : 'Show'} Advanced / Dangerous</span>
                <span>{showAdvanced ? '−' : '+'}</span>
              </button>
              
              {showAdvanced && (
                <div className="mt-4 grid gap-4 bg-gray-900 p-4 rounded-xl border-2 border-gray-700">
                  {advancedControls.map(control => (
                    <AccessibleButton key={control.id} control={control} onClick={handleControlClick} />
                  ))}
                </div>
              )}
            </section>
          )}

        </div>
      </main>
    );
  }

  return null;
}