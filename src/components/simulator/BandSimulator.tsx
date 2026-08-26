import React, { useState } from 'react';
import { Radio, Battery, AlertTriangle, ShieldAlert, Cpu, CheckCircle } from 'lucide-react';
import { SafetyBand, FamilyMember } from '../../types';
import { bandService } from '../../services/bandService';
import { alertService } from '../../services/alertService';
import { activityService } from '../../services/activityService';
import { hardwareRtdbService } from '../../services/hardwareRtdbService';
import { useAuth } from '../../context/AuthContext';

interface BandSimulatorProps {
  bands: SafetyBand[];
  familyMembers: FamilyMember[];
}

export const BandSimulator: React.FC<BandSimulatorProps> = ({ bands, familyMembers }) => {
  const { firebaseUser, appUserProfile } = useAuth();
  const [selectedBandId, setSelectedBandId] = useState<string>(bands[0]?.id || '');
  const [simulating, setSimulating] = useState(false);
  const [lastSimAction, setLastSimAction] = useState<string | null>(null);

  if (!firebaseUser) return null;

  const currentBand = bands.find(b => b.id === selectedBandId) || bands[0];
  const assignedMember = familyMembers.find(m => m.id === currentBand?.assignedMemberId);

  const handleSimulate = async (action: 'connect' | 'disconnect' | 'low_battery' | 'tamper') => {
    if (!currentBand) return;
    setSimulating(true);

    try {
      const actorName = appUserProfile?.fullName || 'Guardian User';

      if (action === 'connect') {
        await bandService.updateBand(firebaseUser.uid, currentBand.id, {
          connectionStatus: 'connected',
          status: 'normal',
        });
        await activityService.logActivity(firebaseUser.uid, {
          type: 'simulator_connect',
          description: `[Simulator] ${currentBand.deviceName} reconnected.`,
          bandId: currentBand.id,
          memberId: currentBand.assignedMemberId,
          actorUid: firebaseUser.uid,
        });

        // Sync to RTDB
        await hardwareRtdbService.updateHardwareTelemetry('TG-BAND-01', {
          status: 'normal',
          rgbLedMode: 'NORMAL_GREEN',
          batteryLevel: 92
        });

        setLastSimAction(`Set status of ${currentBand.deviceName} to Connected & synced with RTDB.`);
      } else if (action === 'disconnect') {
        await bandService.updateBand(firebaseUser.uid, currentBand.id, {
          connectionStatus: 'disconnected',
          status: 'normal',
        });
        await alertService.addAlert(firebaseUser.uid, {
          type: 'band_disconnected',
          severity: 'high',
          title: 'Attention Required — Band Disconnected',
          message: `${currentBand.deviceName} assigned to ${assignedMember?.fullName || 'traveller'} lost signal or disconnected.`,
          bandId: currentBand.id,
          memberId: currentBand.assignedMemberId,
          status: 'active',
        });
        await activityService.logActivity(firebaseUser.uid, {
          type: 'simulator_disconnect',
          description: `[Simulator] ${currentBand.deviceName} disconnected. Alert generated.`,
          bandId: currentBand.id,
          memberId: currentBand.assignedMemberId,
          actorUid: firebaseUser.uid,
        });

        // Sync to RTDB
        await hardwareRtdbService.publishAlert({
          type: 'tamper_disconnect',
          severity: 'high',
          title: 'Band Hardware Disconnected',
          message: `${currentBand.deviceName} lost wireless ping`,
          lat: 11.4138,
          lng: 76.6958,
          timestamp: new Date().toISOString(),
          status: 'active'
        });

        setLastSimAction(`Simulated Disconnection for ${currentBand.deviceName}. Synced to RTDB alerts.`);
      } else if (action === 'low_battery') {
        await bandService.updateBand(firebaseUser.uid, currentBand.id, {
          batteryLevel: 12,
          status: 'low_battery',
        });
        await alertService.addAlert(firebaseUser.uid, {
          type: 'low_battery',
          severity: 'medium',
          title: 'Low Battery Warning',
          message: `${currentBand.deviceName} battery is critical (12%). Please charge device immediately.`,
          bandId: currentBand.id,
          memberId: currentBand.assignedMemberId,
          status: 'active',
        });
        await activityService.logActivity(firebaseUser.uid, {
          type: 'simulator_low_battery',
          description: `[Simulator] ${currentBand.deviceName} battery set to 12%. Warning generated.`,
          bandId: currentBand.id,
          memberId: currentBand.assignedMemberId,
          actorUid: firebaseUser.uid,
        });

        // Sync to RTDB
        await hardwareRtdbService.updateHardwareTelemetry('TG-BAND-01', {
          batteryLevel: 12,
          status: 'low_battery'
        });

        setLastSimAction(`Simulated Low Battery (12%) for ${currentBand.deviceName}. Synced to RTDB.`);
      } else if (action === 'tamper') {
        await bandService.updateBand(firebaseUser.uid, currentBand.id, {
          status: 'tamper_alert',
        });
        await alertService.addAlert(firebaseUser.uid, {
          type: 'tamper_attempt',
          severity: 'critical',
          title: 'Tamper Alert Detected',
          message: `Unusual clasp strain or removal attempt detected on ${currentBand.deviceName} assigned to ${assignedMember?.fullName || 'traveller'}.`,
          bandId: currentBand.id,
          memberId: currentBand.assignedMemberId,
          status: 'active',
        });
        await activityService.logActivity(firebaseUser.uid, {
          type: 'simulator_tamper',
          description: `[Simulator] Tamper attempt triggered on ${currentBand.deviceName}. Critical alert generated.`,
          bandId: currentBand.id,
          memberId: currentBand.assignedMemberId,
          actorUid: firebaseUser.uid,
        });

        // Sync to RTDB
        await hardwareRtdbService.updateHardwareTelemetry('TG-BAND-01', {
          status: 'tamper_alert',
          rgbLedMode: 'TAMPER_ORANGE'
        });
        await hardwareRtdbService.publishAlert({
          type: 'tamper_disconnect',
          severity: 'critical',
          title: 'Hardware Tamper Switch Disconnect',
          message: 'Tension breach detected on ESP32-C3 band latch',
          lat: 11.4138,
          lng: 76.6958,
          timestamp: new Date().toISOString(),
          status: 'active'
        });

        setLastSimAction(`Simulated Tamper Alert for ${currentBand.deviceName}. Critical RTDB alert created.`);
      }
    } catch (err: any) {
      console.error('Error during band simulation:', err);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="bg-[#0D1527] border border-amber-500/40 rounded-2xl p-5 text-white shadow-xl">
      <div className="flex items-center justify-between border-b border-amber-500/20 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-amber-400" />
          <h3 className="font-semibold text-base text-amber-300">Pilot Device Simulator</h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-500/30">
          Not physical hardware
        </span>
      </div>

      <p className="text-xs text-slate-300 mb-4 leading-relaxed">
        <strong>Pilot Device Simulator — not connected to physical hardware.</strong> Use controls below to simulate real-time telemetry, battery drain, clasp tamper alerts, or connectivity drops for pilot demonstration.
      </p>

      {bands.length === 0 ? (
        <div className="text-center py-6 text-slate-400 text-xs border border-dashed border-slate-700 rounded-xl">
          Add a safety band record above first to test simulator actions.
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1 font-medium">Select Target Band for Test:</label>
            <select
              value={selectedBandId || currentBand?.id}
              onChange={(e) => setSelectedBandId(e.target.value)}
              className="w-full bg-[#162036] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
            >
              {bands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.deviceName} ({b.serialNumber}) — Status: {b.connectionStatus.toUpperCase()} ({b.batteryLevel}%)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              onClick={() => handleSimulate('connect')}
              disabled={simulating}
              className="p-2.5 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-medium flex flex-col items-center justify-center gap-1.5 transition disabled:opacity-50"
            >
              <Radio className="w-4 h-4 text-emerald-400" />
              <span>Simulate Connected</span>
            </button>

            <button
              onClick={() => handleSimulate('disconnect')}
              disabled={simulating}
              className="p-2.5 bg-amber-950/60 hover:bg-amber-900/60 border border-amber-500/40 text-amber-300 rounded-xl text-xs font-medium flex flex-col items-center justify-center gap-1.5 transition disabled:opacity-50"
            >
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Simulate Disconnect</span>
            </button>

            <button
              onClick={() => handleSimulate('low_battery')}
              disabled={simulating}
              className="p-2.5 bg-yellow-950/60 hover:bg-yellow-900/60 border border-yellow-500/40 text-yellow-300 rounded-xl text-xs font-medium flex flex-col items-center justify-center gap-1.5 transition disabled:opacity-50"
            >
              <Battery className="w-4 h-4 text-yellow-400" />
              <span>Simulate Low Battery</span>
            </button>

            <button
              onClick={() => handleSimulate('tamper')}
              disabled={simulating}
              className="p-2.5 bg-red-950/60 hover:bg-red-900/60 border border-red-500/40 text-red-300 rounded-xl text-xs font-medium flex flex-col items-center justify-center gap-1.5 transition disabled:opacity-50"
            >
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span>Simulate Tamper</span>
            </button>
          </div>

          {lastSimAction && (
            <div className="p-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-[11px] text-cyan-300 flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>{lastSimAction}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
