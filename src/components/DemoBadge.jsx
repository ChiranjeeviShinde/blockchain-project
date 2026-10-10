import React from 'react';
import { Sparkles, Cpu } from 'lucide-react';

export const DemoBadge = ({ text = "SIMULATED PROTOTYPE DATA • ERC-721", className = "" }) => {
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-brand-cyan/10 text-cyan-300 border border-brand-cyan/25 shadow-sm ${className}`}>
      <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
      <span>{text}</span>
    </div>
  );
};
