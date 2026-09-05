import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

export const PilotBanner: React.FC = () => {
  return (
    <div className="bg-amber-950/80 border-b border-amber-500/30 text-amber-200 py-2 px-3 sm:px-4 backdrop-blur-md">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-[11px] sm:text-xs leading-tight text-amber-200/90 truncate sm:whitespace-normal">
            <strong className="font-semibold text-amber-300">Pilot / Demo Platform:</strong> Simulated emergency alerts for guardians.
          </span>
        </div>
        <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-900/50 border border-amber-600/40 text-[10px] text-amber-300 font-mono shrink-0 shadow-sm">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          V1.0
        </div>
      </div>
    </div>
  );
};

