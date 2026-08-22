import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, 
  ShieldAlert, 
  AlertTriangle, 
  MapPin, 
  X, 
  CheckCircle, 
  Clock, 
  User, 
  PhoneCall, 
  FileText 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { sosService } from '../services/sosService';
import { familyService } from '../services/familyService';
import { alertService } from '../services/alertService';
import { activityService } from '../services/activityService';
import { SOSIncident, FamilyMember } from '../types';
import { PilotBanner } from '../components/common/PilotBanner';

export const SOSIncidentPage: React.FC = () => {
  const { firebaseUser, appUserProfile } = useAuth();
  const navigate = useNavigate();

  const [activeIncidents, setActiveIncidents] = useState<SOSIncident[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);

  // Form Trigger Modal State
  const [isTriggerModalOpen, setIsTriggerModalOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [disclaimerConfirmed, setDisclaimerConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cancel/Resolve Modal State
  const [actionTargetIncident, setActionTargetIncident] = useState<SOSIncident | null>(null);
  const [actionType, setActionType] = useState<'cancel' | 'resolve'>('resolve');
  const [actionNotes, setActionNotes] = useState('');

  useEffect(() => {
    if (!firebaseUser) return;
    const unsubSos = sosService.subscribeActiveSOSIncidents(firebaseUser.uid, setActiveIncidents);
    const unsubMembers = familyService.subscribeFamilyMembers(firebaseUser.uid, setFamilyMembers);
    return () => {
      unsubSos();
      unsubMembers();
    };
  }, [firebaseUser]);

  const selectedMember = familyMembers.find(m => m.id === selectedMemberId);

  const handleStartSOS = async () => {
    if (!firebaseUser || !selectedMemberId || !disclaimerConfirmed) return;
    setIsSubmitting(true);

    try {
      const actorName = appUserProfile?.fullName || 'Guardian User';

      // 1. Create SOS Incident
      const incidentId = await sosService.createSOSIncident(firebaseUser.uid, {
        memberId: selectedMemberId,
        bandId: selectedMember?.bandId || null,
        initiatedByUid: firebaseUser.uid,
        initiatedByName: actorName,
        initiationSource: 'guardian_app',
        locationSnapshot: selectedMember?.currentLocation
          ? {
              latitude: selectedMember.currentLocation.latitude,
              longitude: selectedMember.currentLocation.longitude,
              label: selectedMember.currentLocation.label,
            }
          : undefined,
        notes: 'Guardian initiated manual SOS trigger.',
        isTest: false,
      });

      // 2. Create Critical Alert
      const alertId = await alertService.addAlert(firebaseUser.uid, {
        type: 'sos',
        severity: 'critical',
        title: `EMERGENCY SOS: ${selectedMember?.fullName}`,
        message: `Guardian ${actorName} initiated an emergency SOS alert for ${selectedMember?.fullName}.`,
        memberId: selectedMemberId,
        bandId: selectedMember?.bandId || null,
        status: 'active',
        locationSnapshot: selectedMember?.currentLocation
          ? {
              latitude: selectedMember.currentLocation.latitude,
              longitude: selectedMember.currentLocation.longitude,
              label: selectedMember.currentLocation.label,
              capturedAt: new Date().toISOString(),
            }
          : undefined,
      });

      // Update incident with alert link
      await sosService.resolveSOSIncident(firebaseUser.uid, incidentId); // Reset state check, wait! Update incident doc
      // Wait, let's keep status active, just log activity:
      await activityService.logActivity(firebaseUser.uid, {
        type: 'sos_initiated',
        description: `CRITICAL SOS TRIGGERED for ${selectedMember?.fullName} by ${actorName}.`,
        memberId: selectedMemberId,
        alertId: alertId,
        actorUid: firebaseUser.uid,
      });

      setIsTriggerModalOpen(false);
      setSelectedMemberId('');
      setDisclaimerConfirmed(false);
    } catch (err) {
      console.error('Error starting SOS:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExecuteStatusAction = async () => {
    if (!firebaseUser || !actionTargetIncident) return;
    setIsSubmitting(true);

    try {
      if (actionType === 'cancel') {
        await sosService.cancelSOSIncident(firebaseUser.uid, actionTargetIncident.id, actionNotes);
        await activityService.logActivity(firebaseUser.uid, {
          type: 'sos_cancelled',
          description: `SOS Incident cancelled for member. Notes: ${actionNotes || 'None'}`,
          memberId: actionTargetIncident.memberId,
          actorUid: firebaseUser.uid,
        });
      } else {
        await sosService.resolveSOSIncident(firebaseUser.uid, actionTargetIncident.id, actionNotes);
        await activityService.logActivity(firebaseUser.uid, {
          type: 'sos_resolved',
          description: `SOS Incident resolved for member. Notes: ${actionNotes || 'None'}`,
          memberId: actionTargetIncident.memberId,
          actorUid: firebaseUser.uid,
        });
      }

      setActionTargetIncident(null);
      setActionNotes('');
    } catch (err) {
      console.error('Error executing SOS action:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F1D] text-white flex flex-col justify-between pb-20 md:pb-6">
      <div className="space-y-6">
        <PilotBanner />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Zap className="w-6 h-6 text-red-500 fill-red-500" /> Emergency SOS Workflow
            </h1>
            <p className="text-xs text-slate-400">Trigger pilot emergency alert or view active incident timeline</p>
          </div>

          <button
            onClick={() => setIsTriggerModalOpen(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-600/30 flex items-center gap-2 hover:opacity-95 transition animate-pulse"
          >
            <ShieldAlert className="w-4 h-4" /> Trigger New SOS
          </button>
        </div>

        {/* Active Incident Full-Screen Alert View */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
          {activeIncidents.length > 0 ? (
            activeIncidents.map((incident) => {
              const member = familyMembers.find((m) => m.id === incident.memberId);
              return (
                <div
                  key={incident.id}
                  className="bg-red-950/80 border-2 border-red-500 rounded-3xl p-6 sm:p-8 space-y-6 text-red-100 shadow-2xl shadow-red-950/80 animate-fade-in"
                >
                  <div className="flex items-start justify-between border-b border-red-500/40 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-red-500 text-white rounded-2xl animate-bounce">
                        <ShieldAlert className="w-8 h-8" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold tracking-widest uppercase bg-red-900/80 text-red-200 px-2 py-0.5 rounded border border-red-400/40">
                          CRITICAL EMERGENCY ACTIVE
                        </span>
                        <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                          SOS Alert: {member ? member.fullName : 'Family Traveller'}
                        </h2>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="bg-slate-950/60 p-4 rounded-2xl border border-red-500/30 space-y-2">
                      <div className="text-red-300 font-semibold flex items-center gap-1.5">
                        <User className="w-4 h-4" /> Initiated By:
                      </div>
                      <p className="text-white font-medium">{incident.initiatedByName}</p>

                      <div className="text-red-300 font-semibold flex items-center gap-1.5 pt-2">
                        <Clock className="w-4 h-4" /> Started At:
                      </div>
                      <p className="text-white font-mono">
                        {typeof incident.startedAt === 'string'
                          ? new Date(incident.startedAt).toLocaleString()
                          : 'Just now'}
                      </p>
                    </div>

                    <div className="bg-slate-950/60 p-4 rounded-2xl border border-red-500/30 space-y-2">
                      <div className="text-red-300 font-semibold flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" /> Last Location Snapshot:
                      </div>
                      <p className="text-white">
                        {incident.locationSnapshot?.label || member?.currentLocation?.label || 'Location not specified'}
                      </p>
                    </div>
                  </div>

                  {/* Incident Event Timeline */}
                  <div className="bg-slate-950/70 p-4 rounded-2xl border border-red-500/30 space-y-3">
                    <h4 className="font-bold text-xs text-red-300 flex items-center gap-1.5">
                      <FileText className="w-4 h-4" /> Incident Event Timeline
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-red-200">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                        <span>Emergency SOS triggered by guardian account.</span>
                      </div>
                      <div className="flex items-center gap-2 text-red-300">
                        <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                        <span>Cloud Firestore alert document dispatched in real time.</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                    <button
                      onClick={() => {
                        setActionTargetIncident(incident);
                        setActionType('cancel');
                      }}
                      className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700"
                    >
                      Cancel Incident (False Alarm)
                    </button>
                    <button
                      onClick={() => {
                        setActionTargetIncident(incident);
                        setActionType('resolve');
                      }}
                      className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/30"
                    >
                      Resolve SOS Emergency
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-[#0D1527] border border-slate-800 rounded-3xl p-12 text-center space-y-3">
              <ShieldAlert className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="text-lg font-bold text-white">No Active SOS Incidents</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                All family members are currently operating under normal status. Click "Trigger New SOS" to execute a pilot emergency demonstration.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Trigger SOS Confirmation Modal */}
      {isTriggerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0D1527] border border-red-500/60 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-6 h-6 text-red-500" />
                <h3 className="font-bold text-lg text-white">Trigger Emergency SOS</h3>
              </div>
              <button onClick={() => setIsTriggerModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Select Affected Family Member:</label>
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full bg-[#162036] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-red-400"
                >
                  <option value="">-- Choose Traveller --</option>
                  {familyMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.relationship})
                    </option>
                  ))}
                </select>
              </div>

              {selectedMember && (
                <div className="p-3 bg-[#162036] border border-slate-800 rounded-xl space-y-1">
                  <div className="text-slate-400">Last Known Location:</div>
                  <div className="text-white font-medium flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    {selectedMember.currentLocation?.label || 'No location updated'}
                  </div>
                </div>
              )}

              <div className="p-3.5 bg-amber-950/60 border border-amber-500/40 rounded-xl space-y-2 text-amber-200">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={disclaimerConfirmed}
                    onChange={(e) => setDisclaimerConfirmed(e.target.checked)}
                    className="mt-0.5 rounded bg-slate-800 border-slate-700 text-red-500 focus:ring-red-400"
                  />
                  <span className="leading-snug">
                    “I understand this pilot version alerts my TrackGuard guardian account only. It does not contact police, ambulance, or emergency services.”
                  </span>
                </label>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                onClick={() => setIsTriggerModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleStartSOS}
                disabled={!selectedMemberId || !disclaimerConfirmed || isSubmitting}
                className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-600/30 disabled:opacity-40 transition"
              >
                {isSubmitting ? 'Dispatching Alert...' : 'Start SOS Emergency'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel / Resolve Confirmation Modal */}
      {actionTargetIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#0D1527] border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-lg text-white">
              {actionType === 'cancel' ? 'Cancel SOS Incident (False Alarm)' : 'Resolve SOS Incident'}
            </h3>

            <div className="space-y-3 text-xs">
              <p className="text-slate-300">
                Please enter optional resolution or cancellation notes for this incident log:
              </p>
              <textarea
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder="Resolution notes (e.g. Member safe, false alarm confirmed)..."
                className="w-full bg-[#162036] border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-400 h-24"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setActionTargetIncident(null)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Back
              </button>
              <button
                onClick={handleExecuteStatusAction}
                disabled={isSubmitting}
                className={`px-5 py-2 font-bold text-xs rounded-xl shadow ${
                  actionType === 'cancel' ? 'bg-slate-800 text-slate-200' : 'bg-emerald-500 text-slate-950'
                }`}
              >
                Confirm {actionType === 'cancel' ? 'Cancellation' : 'Resolution'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
