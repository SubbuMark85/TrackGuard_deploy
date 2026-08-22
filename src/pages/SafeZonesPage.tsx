import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, Plus, ShieldCheck, Radio, AlertCircle, X, Compass, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { safeZoneService } from '../services/safeZoneService';
import { familyService } from '../services/familyService';
import { alertService } from '../services/alertService';
import { activityService } from '../services/activityService';
import { SafeZone, FamilyMember } from '../types';
import { PilotBanner } from '../components/common/PilotBanner';

const zoneSchema = z.object({
  name: z.string().min(2, 'Safe zone name is required'),
  latitude: z.number({ invalid_type_error: 'Valid latitude required' }),
  longitude: z.number({ invalid_type_error: 'Valid longitude required' }),
  radiusMeters: z.number().min(50, 'Minimum radius is 50 meters'),
  assignedMemberIds: z.array(z.string()).default([]),
});

type ZoneFormData = z.infer<typeof zoneSchema>;

export const SafeZonesPage: React.FC = () => {
  const { firebaseUser, appUserProfile } = useAuth();
  const [safeZones, setSafeZones] = useState<SafeZone[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [simMessage, setSimMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ZoneFormData>({
    resolver: zodResolver(zoneSchema),
    defaultValues: { latitude: 37.7749, longitude: -122.4194, radiusMeters: 500 },
  });

  useEffect(() => {
    if (!firebaseUser) return;
    const unsubZones = safeZoneService.subscribeSafeZones(firebaseUser.uid, setSafeZones);
    const unsubMembers = familyService.subscribeFamilyMembers(firebaseUser.uid, setFamilyMembers);
    return () => {
      unsubZones();
      unsubMembers();
    };
  }, [firebaseUser]);

  const onSubmitZone = async (data: ZoneFormData) => {
    if (!firebaseUser) return;
    try {
      const actorName = appUserProfile?.fullName || 'Guardian';
      await safeZoneService.addSafeZone(firebaseUser.uid, {
        name: data.name,
        type: 'circle',
        latitude: data.latitude,
        longitude: data.longitude,
        radiusMeters: data.radiusMeters,
        assignedMemberIds: data.assignedMemberIds,
        active: true,
      });

      await activityService.logActivity(firebaseUser.uid, {
        type: 'safezone_created',
        description: `${actorName} created safe zone "${data.name}" (${data.radiusMeters}m radius).`,
        actorUid: firebaseUser.uid,
      });

      setIsModalOpen(false);
      reset();
    } catch (err) {
      console.error('Error adding safe zone:', err);
    }
  };

  const handleSimulateGeofence = async (zone: SafeZone, eventType: 'enter' | 'exit') => {
    if (!firebaseUser) return;
    setSimulating(true);
    try {
      const targetMember = familyMembers.find((m) => zone.assignedMemberIds.includes(m.id)) || familyMembers[0];
      const memberName = targetMember ? targetMember.fullName : 'Family Traveller';

      if (eventType === 'exit') {
        await alertService.addAlert(firebaseUser.uid, {
          type: 'geofence_exit',
          severity: 'high',
          title: 'Geofence Exit Alert',
          message: `${memberName} departed designated Safe Zone "${zone.name}".`,
          memberId: targetMember?.id || null,
          status: 'active',
        });
        await activityService.logActivity(firebaseUser.uid, {
          type: 'simulator_geofence_exit',
          description: `[Simulator] ${memberName} exited Safe Zone "${zone.name}". High alert created.`,
          memberId: targetMember?.id || null,
          actorUid: firebaseUser.uid,
        });
        setSimMessage(`Simulated Geofence Exit for ${memberName} from ${zone.name}.`);
      } else {
        await alertService.addAlert(firebaseUser.uid, {
          type: 'geofence_enter',
          severity: 'low',
          title: 'Geofence Entry Confirmed',
          message: `${memberName} arrived safely inside Safe Zone "${zone.name}".`,
          memberId: targetMember?.id || null,
          status: 'resolved',
          resolvedAt: new Date().toISOString(),
          resolvedBy: 'System Auto-Check',
        });
        await activityService.logActivity(firebaseUser.uid, {
          type: 'simulator_geofence_enter',
          description: `[Simulator] ${memberName} entered Safe Zone "${zone.name}".`,
          memberId: targetMember?.id || null,
          actorUid: firebaseUser.uid,
        });
        setSimMessage(`Simulated Geofence Entry for ${memberName} into ${zone.name}.`);
      }
    } catch (err) {
      console.error('Error simulating geofence event:', err);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F1D] text-white flex flex-col justify-between pb-20 md:pb-6">
      <div className="space-y-6">
        <PilotBanner />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <MapPin className="w-6 h-6 text-cyan-400" /> Circle Safe Zones & Geofencing
            </h1>
            <p className="text-xs text-slate-400">Configure safety perimeters & simulate enter/exit geofence events</p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-teal-500/20 flex items-center gap-1.5 hover:opacity-95 transition"
          >
            <Plus className="w-4 h-4" /> Create Safe Zone
          </button>
        </div>

        {/* Mock Map Background Card */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="relative bg-[#0D1527] border border-slate-800 rounded-3xl p-6 overflow-hidden shadow-2xl space-y-4">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#00F2FE_1px,transparent_1px)] [background-size:16px_16px]"></div>

            <div className="relative z-10 flex items-center justify-between">
              <span className="text-xs font-mono text-cyan-300 bg-cyan-950/80 px-3 py-1 rounded-xl border border-cyan-800/50">
                Mock Map Radar Background (Pilot Demo Mode)
              </span>
            </div>

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4">
              {safeZones.length === 0 ? (
                <div className="col-span-2 text-center py-8 text-slate-400 text-xs">
                  No circle safe zones created yet. Click "Create Safe Zone" to define a perimeter.
                </div>
              ) : (
                safeZones.map((zone) => (
                  <div key={zone.id} className="bg-[#162036] border border-slate-700/80 p-4 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-cyan-400" /> {zone.name}
                      </h4>
                      <span className="text-[11px] font-mono text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-500/30">
                        {zone.radiusMeters}m Radius
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 font-mono">
                      Lat: {zone.latitude}, Lng: {zone.longitude}
                    </div>

                    {/* Geofence Simulator Buttons */}
                    <div className="pt-2 border-t border-slate-700 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Simulate Trigger:</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSimulateGeofence(zone, 'enter')}
                          disabled={simulating}
                          className="px-2.5 py-1 bg-emerald-950 text-emerald-300 hover:bg-emerald-900 border border-emerald-500/40 rounded text-[11px] font-medium"
                        >
                          Simulate Entry
                        </button>
                        <button
                          onClick={() => handleSimulateGeofence(zone, 'exit')}
                          disabled={simulating}
                          className="px-2.5 py-1 bg-amber-950 text-amber-300 hover:bg-amber-900 border border-amber-500/40 rounded text-[11px] font-medium"
                        >
                          Simulate Exit
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {simMessage && (
              <div className="relative z-10 p-3 bg-cyan-950/80 border border-cyan-500/40 rounded-xl text-cyan-200 text-xs">
                {simMessage}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#0D1527] border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-white">Create Circle Safe Zone</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmitZone)} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Zone Name</label>
                <input
                  type="text"
                  {...register('name')}
                  placeholder="Home & School Safe Zone"
                  className="w-full bg-[#162036] border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                />
                {errors.name && <p className="text-[11px] text-red-400 mt-1">{errors.name.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    {...register('latitude', { valueAsNumber: true })}
                    className="w-full bg-[#162036] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                  {errors.latitude && <p className="text-[11px] text-red-400 mt-1">{errors.latitude.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    {...register('longitude', { valueAsNumber: true })}
                    className="w-full bg-[#162036] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                  {errors.longitude && <p className="text-[11px] text-red-400 mt-1">{errors.longitude.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Radius (Meters)</label>
                <input
                  type="number"
                  {...register('radiusMeters', { valueAsNumber: true })}
                  className="w-full bg-[#162036] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
                {errors.radiusMeters && <p className="text-[11px] text-red-400 mt-1">{errors.radiusMeters.message}</p>}
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-xs rounded-xl shadow"
                >
                  Create Safe Zone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
