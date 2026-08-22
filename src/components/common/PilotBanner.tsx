import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

export const PilotBanner: React.FC = () => {
  return (
    <div className="bg-amber-950/70 border-b border-amber-500/20 text-amber-200 py-1.5 px-3 flex items-center justify-between text-xs backdrop-blur-sm">
      <div className="flex items-center gap-2 max-w-4xl mx-auto text-left">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span className="text-[11px] leading-tight text-amber-200/90">
          <strong className="font-semibold text-amber-300">Pilot / Demo Platform:</strong> Simulated emergency alerts for registered guardians.
        </span>
      </div>
      <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded bg-amber-900/40 border border-amber-600/30 text-[10px] text-amber-300 font-mono shrink-0">
        <ShieldCheck className="w-3 h-3 text-emerald-400" />
        V1.0
      </div>
    </div>
  );
};
