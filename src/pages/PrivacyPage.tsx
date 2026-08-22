import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft, Lock, Eye, MapPin, AlertCircle } from 'lucide-react';
import { PilotBanner } from '../components/common/PilotBanner';

export const PrivacyPage: React.FC = () => {
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
            <h1 className="text-2xl font-bold text-white">Privacy Notice & Location Data Policy</h1>
          </div>
        </div>

        <div className="bg-[#0D1527] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 text-slate-300 text-sm leading-relaxed shadow-2xl">
          <div className="p-4 bg-cyan-950/40 border border-cyan-500/30 rounded-2xl flex items-start gap-3 text-xs text-cyan-200">
            <AlertCircle className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold text-cyan-300">Pilot Safety Platform Notice:</strong> TrackGuard operates strictly as a pilot safety monitoring tool. Live location tracking and child/family data processing are restricted to designated, authenticated adult guardians.
            </div>
          </div>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-teal-400" /> 1. Location Sharing Consent Rules
            </h2>
            <p>
              TrackGuard does <strong>not</strong> silently or automatically collect background browser or device location. Geolocation information is recorded only after an explicit, opt-in consent action by an authorized guardian (e.g., clicking "Use current browser location for demo update").
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-cyan-400" /> 2. Protection of Child & Senior Traveller Data
            </h2>
            <p>
              When adding minor children or senior family members to a safety profile, the registering guardian confirms full legal authority to manage their safety records. All family member profiles are strictly isolated within the guardian's Cloud Firestore user path (<code className="text-cyan-300 font-mono text-xs">users/&#123;uid&#125;/familyMembers</code>) and enforced via Firestore Security Rules.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-emerald-400" /> 3. Data Retention & Removal
            </h2>
            <p>
              Guardians retain full rights to update, archive, or request removal of personal safety records. Stored location snapshots and alert records can be pruned via the Settings panel or by clearing pilot demo data.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
