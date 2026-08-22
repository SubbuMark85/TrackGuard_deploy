import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Radio, Plus, Battery, Signal, Cpu, Trash2, Edit3, X, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { bandService } from '../services/bandService';
import { familyService } from '../services/familyService';
import { activityService } from '../services/activityService';
import { SafetyBand, FamilyMember } from '../types';
import { BandSimulator } from '../components/simulator/BandSimulator';
import { PilotBanner } from '../components/common/PilotBanner';

const bandSchema = z.object({
  deviceName: z.string().min(2, 'Device name is required'),
  serialNumber: z.string().min(3, 'Serial number is required'),
  firmwareVersion: z.string().default('v2.4.1'),
  assignedMemberId: z.string().optional(),
});

type BandFormData = z.infer<typeof bandSchema>;

export const SafetyBandsPage: React.FC = () => {
  const { firebaseUser, appUserProfile } = useAuth();
  const [bands, setBands] = useState<SafetyBand[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BandFormData>({
    resolver: zodResolver(bandSchema),
    defaultValues: { firmwareVersion: 'v2.4.1' },
  });

  useEffect(() => {
    if (!firebaseUser) return;
    const unsubBands = bandService.subscribeBands(firebaseUser.uid, setBands);
    const unsubMembers = familyService.subscribeFamilyMembers(firebaseUser.uid, setFamilyMembers);
    return () => {
      unsubBands();
      unsubMembers();
    };
  }, [firebaseUser]);

  const onSubmitBand = async (data: BandFormData) => {
    if (!firebaseUser) return;

    try {
      const newBandId = await bandService.addBand(firebaseUser.uid, {
        deviceName: data.deviceName,
        serialNumber: data.serialNumber,
        assignedMemberId: data.assignedMemberId || null,
        connectionStatus: 'connected',
        batteryLevel: 95,
        signalStrength: 'strong',
        firmwareVersion: data.firmwareVersion || 'v2.4.1',
        lastSyncAt: new Date().toISOString(),
        isMarkedLost: false,
        status: 'normal',
      });

      if (data.assignedMemberId) {
        await familyService.updateFamilyMember(firebaseUser.uid, data.assignedMemberId, { bandId: newBandId });
      }

      await activityService.logActivity(firebaseUser.uid, {
        type: 'band_added',
        description: `Added safety band ${data.deviceName} (${data.serialNumber}).`,
        bandId: newBandId,
        actorUid: firebaseUser.uid,
      });

      setIsAddModalOpen(false);
      reset();
    } catch (err) {
      console.error('Error adding band:', err);
    }
  };

  const handleDeleteBand = async (band: SafetyBand) => {
    if (!firebaseUser) return;
    if (window.confirm(`Delete device record for ${band.deviceName}?`)) {
      await bandService.deleteBand(firebaseUser.uid, band.id);
      await activityService.logActivity(firebaseUser.uid, {
        type: 'band_deleted',
        description: `Deleted band ${band.deviceName}.`,
        actorUid: firebaseUser.uid,
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F1D] text-white flex flex-col justify-between pb-20 md:pb-6">
      <div className="space-y-6">
        <PilotBanner />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Radio className="w-6 h-6 text-emerald-400" /> TrackGuard Safety Bands
            </h1>
            <p className="text-xs text-slate-400">Manage device records & simulate telemetry signals for testing</p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-teal-500/20 flex items-center gap-1.5 hover:opacity-95 transition"
          >
            <Plus className="w-4 h-4" /> Add Pilot Band
          </button>
        </div>

        {/* Bands List Grid */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
          {bands.length === 0 ? (
            <div className="bg-[#0D1527] border border-dashed border-slate-800 rounded-3xl p-12 text-center space-y-4">
              <Radio className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="text-slate-400 text-sm">No safety bands registered.</p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-5 py-2.5 bg-teal-500 text-slate-950 font-bold text-xs rounded-xl shadow"
              >
                Add First Pilot Band
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bands.map((band) => {
                const assignedMember = familyMembers.find((m) => m.id === band.assignedMemberId);
                return (
                  <div
                    key={band.id}
                    className="bg-[#0D1527] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-slate-800 text-emerald-400 border border-slate-700">
                            <Radio className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-bold text-base text-white">{band.deviceName}</h3>
                            <p className="text-xs font-mono text-slate-400">SN: {band.serialNumber}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteBand(band)}
                          className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="bg-[#162036] p-3 rounded-xl space-y-2 text-xs">
                        <div className="flex items-center justify-between text-slate-300">
                          <span>Connection Status:</span>
                          <span
                            className={`font-semibold uppercase px-2 py-0.5 rounded text-[10px] ${
                              band.connectionStatus === 'connected'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-red-500/20 text-red-300 border border-red-500/30'
                            }`}
                          >
                            {band.connectionStatus}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-slate-300">
                          <span className="flex items-center gap-1">
                            <Battery className="w-3.5 h-3.5 text-yellow-400" /> Battery:
                          </span>
                          <span className={`font-mono font-bold ${band.batteryLevel < 20 ? 'text-red-400 animate-pulse' : 'text-slate-200'}`}>
                            {band.batteryLevel}%
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-slate-300 pt-1 border-t border-slate-700/50 text-[11px]">
                          <span className="text-slate-400">Assigned Traveller:</span>
                          <span className="text-cyan-300 font-medium">
                            {assignedMember ? assignedMember.fullName : 'Unassigned'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pilot Device Simulator Section */}
          <BandSimulator bands={bands} familyMembers={familyMembers} />
        </div>
      </div>

      {/* Add Band Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#0D1527] border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-white">Add Pilot Safety Band</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmitBand)} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Device Name</label>
                <input
                  type="text"
                  {...register('deviceName')}
                  placeholder="TrackGuard Band Alpha"
                  className="w-full bg-[#162036] border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                />
                {errors.deviceName && <p className="text-[11px] text-red-400 mt-1">{errors.deviceName.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Serial Number</label>
                <input
                  type="text"
                  {...register('serialNumber')}
                  placeholder="TG-8849-B2"
                  className="w-full bg-[#162036] border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                />
                {errors.serialNumber && <p className="text-[11px] text-red-400 mt-1">{errors.serialNumber.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Assign to Traveller</label>
                <select
                  {...register('assignedMemberId')}
                  className="w-full bg-[#162036] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="">Unassigned</option>
                  {familyMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.relationship})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-xs rounded-xl shadow"
                >
                  Register Pilot Device
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
