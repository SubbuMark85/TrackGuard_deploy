import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft, FileText, AlertTriangle } from 'lucide-react';
import { PilotBanner } from '../components/common/PilotBanner';

export const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0A0F1D] text-white flex flex-col justify-between">
      <PilotBanner />

      <div className="max-w-4xl mx-auto p-4 sm:p-8 flex-1 w-full space-y-6">
        <div className="flex items-center gap-3">
          <Link to="/" className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-teal-400" />
            <h1 className="text-2xl font-bold text-white">Terms of Service</h1>
          </div>
        </div>

        <div className="bg-[#0D1527] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 text-slate-300 text-sm leading-relaxed shadow-2xl">
          <div className="p-4 bg-amber-950/40 border border-amber-500/30 rounded-2xl flex items-start gap-3 text-xs text-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold text-amber-300">Disclaimer of Emergency Services:</strong> TrackGuard is currently a <strong>Pilot / Demo Safety Platform</strong>. It does not contact police, fire department, ambulance dispatch, 911, or official responder networks. Emergency triggers dispatch alerts only within this application to registered guardian accounts.
            </div>
          </div>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-400" /> 1. Eligibility & Guardian Responsibility
            </h2>
            <p>
              Users must be at least 18 years of age to register an adult guardian account. The guardian assumes responsibility for managing linked family member records, safety band assignments, and simulated geofence alerts.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-400" /> 2. Pilot & Demonstration Limitations
            </h2>
            <p>
              Device telemetry, cellular fallback, hardware tampering, and geofence events available in this application include simulated testing features. They are provided "as-is" for pilot demonstration and evaluation.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
