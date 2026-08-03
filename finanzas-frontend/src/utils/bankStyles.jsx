import React from 'react';
import { Wallet, Landmark } from 'lucide-react';

// Import bank logos from assets folder
import reservasLogo from '../assets/reservas.png';
import popularLogo from '../assets/popular.png';
import bhdLogo from '../assets/bhd.png';
import qikLogo from '../assets/qik.png';

export const getBankStyles = (bankName = '') => {
  const name = bankName.trim().toLowerCase();

  if (name.includes('reservas')) {
    return {
      gradient: 'from-[#003087] to-[#0b1b3d] text-white border-blue-900/50 shadow-[0_4px_20px_rgba(0,48,135,0.15)]',
      textColor: 'text-amber-400',
      tagColor: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
      logo: (
        <div className="w-8 h-8 flex items-center justify-center rounded-lg overflow-hidden bg-white dark:bg-[#12131A]/10 p-0.5 border border-white/5 shrink-0">
          <img src={reservasLogo} className="w-full h-full object-contain select-none" alt="Banreservas" />
        </div>
      )
    };
  }

  if (name.includes('popular')) {
    return {
      gradient: 'from-[#003580] to-[#011d47] text-white border-blue-950/50 shadow-[0_4px_20px_rgba(0,53,128,0.15)]',
      textColor: 'text-sky-300',
      tagColor: 'bg-sky-300/10 text-sky-300 border-sky-300/20',
      logo: (
        <div className="w-8 h-8 flex items-center justify-center rounded-lg overflow-hidden bg-white dark:bg-[#12131A]/10 p-0.5 border border-white/5 shrink-0">
          <img src={popularLogo} className="w-full h-full object-contain select-none" alt="Popular" />
        </div>
      )
    };
  }

  if (name.includes('bhd')) {
    return {
      gradient: 'from-[#10b981] to-[#042c1d] text-white border-emerald-950/50 shadow-[0_4px_20px_rgba(16,185,129,0.15)]',
      textColor: 'text-emerald-300',
      tagColor: 'bg-emerald-300/10 text-emerald-300 border-emerald-300/20',
      logo: (
        <div className="w-8 h-8 flex items-center justify-center rounded-lg overflow-hidden bg-white dark:bg-[#12131A]/10 p-0.5 border border-white/5 shrink-0">
          <img src={bhdLogo} className="w-full h-full object-contain select-none" alt="BHD" />
        </div>
      )
    };
  }

  if (name.includes('qik')) {
    return {
      gradient: 'from-[#0072ce] to-[#001730] text-white border-sky-950/50 shadow-[0_4px_20px_rgba(0,114,206,0.15)]',
      textColor: 'text-sky-300',
      tagColor: 'bg-sky-300/10 text-sky-300 border-sky-300/20',
      logo: (
        <div className="w-8 h-8 flex items-center justify-center rounded-lg overflow-hidden bg-white dark:bg-[#12131A] p-0.5 shrink-0">
          <img src={qikLogo} className="w-full h-full object-contain select-none" alt="Qik" />
        </div>
      )
    };
  }

  if (name.includes('efectivo') || name.includes('cash')) {
    return {
      gradient: 'from-[#065f46] to-[#022c22] text-white border-emerald-950/50 shadow-[0_4px_20px_rgba(6,95,70,0.15)]',
      textColor: 'text-emerald-300',
      tagColor: 'bg-emerald-300/10 text-emerald-300 border-emerald-300/20',
      logo: (
        <div className="w-7 h-7 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-300 shrink-0">
          <Wallet size={14} />
        </div>
      )
    };
  }

  // Fallback / Genérico
  return {
    gradient: 'from-[#1e293b] to-[#0f172a] text-white border-slate-900/50 shadow-[0_4px_20px_rgba(15,23,42,0.15)]',
    textColor: 'text-indigo-400 dark:text-[#FB00FF]',
    tagColor: 'bg-indigo-400/10 text-indigo-400 dark:text-[#FB00FF] border-indigo-400 dark:border-[#FB00FF]/50/20',
    logo: (
      <div className="w-7 h-7 rounded-xl bg-indigo-500 dark:bg-[#FB00FF]/10 border border-indigo-500 dark:border-[#FB00FF]/50/20 flex items-center justify-center text-indigo-300 dark:text-[#FB00FF]/60 shrink-0">
        <Landmark size={14} />
      </div>
    )
  };
};
