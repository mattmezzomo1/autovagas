import React from 'react';

interface BillingToggleProps {
  isAnnual: boolean;
  onToggle: (isAnnual: boolean) => void;
}

export const BillingToggle: React.FC<BillingToggleProps> = ({ isAnnual, onToggle }) => {
  return (
    <div className="flex items-center justify-center w-full">
      <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-1 flex items-center gap-1 shadow-lg">
        <button
          onClick={() => onToggle(false)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
            !isAnnual
              ? 'bg-purple-500 text-white shadow-lg'
              : 'text-purple-200 hover:text-white'
          }`}
        >
          Mensal
        </button>

        <button
          onClick={() => onToggle(true)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 relative ${
            isAnnual
              ? 'bg-purple-500 text-white shadow-lg'
              : 'text-purple-200 hover:text-white'
          }`}
        >
          Anual
          <div className="absolute -top-1 -right-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold text-[10px]">
            50% OFF
          </div>
        </button>
      </div>
    </div>
  );
};
