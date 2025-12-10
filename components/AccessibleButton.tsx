import React from 'react';
import { DeviceControl, ControlCategory, ControlType } from '../types';

interface Props {
  control: DeviceControl;
  onClick: (control: DeviceControl) => void;
}

export const AccessibleButton: React.FC<Props> = ({ control, onClick }) => {
  let baseClasses = "w-full p-6 mb-4 rounded-xl font-bold text-2xl transition-transform active:scale-95 border-4 flex flex-col items-center justify-center text-center min-h-[120px]";
  let colorClasses = "";

  switch (control.category) {
    case ControlCategory.PRIMARY:
      colorClasses = "bg-yellow-400 text-black border-yellow-400 hover:bg-yellow-300";
      break;
    case ControlCategory.DANGER:
      colorClasses = "bg-red-900 text-white border-red-500 hover:bg-red-800";
      break;
    case ControlCategory.SECONDARY:
    default:
      colorClasses = "bg-gray-800 text-white border-white hover:bg-gray-700";
      break;
  }

  // Visual cues for types
  const TypeIcon = () => {
    if (control.type === ControlType.KNOB) return <span className="text-sm uppercase tracking-widest mb-1 opacity-75">Dial</span>;
    if (control.type === ControlType.SWITCH) return <span className="text-sm uppercase tracking-widest mb-1 opacity-75">Switch</span>;
    return null;
  };

  const handleClick = () => {
    if (navigator.vibrate) {
      navigator.vibrate(15); // Short tick for feedback
    }
    onClick(control);
  };

  return (
    <button
      onClick={handleClick}
      className={`${baseClasses} ${colorClasses}`}
      aria-label={`${control.label}. ${control.description}. Double tap to activate.`}
    >
      <TypeIcon />
      <span>{control.label}</span>
      {control.category === ControlCategory.PRIMARY && (
        <span className="text-sm font-normal mt-2 opacity-80">(Frequently Used)</span>
      )}
    </button>
  );
};