import React, { useEffect, useState } from 'react';
import { 
  Bell, 
  ShieldAlert, 
  AlertCircle, 
  Radio, 
  MapPin, 
  CheckCheck, 
  CheckCircle, 
  Filter,
  Eye,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { alertService } from '../services/alertService';
import { familyService } from '../services/familyService';
import { activityService } from '../services/activityService';
import { SafetyAlert, FamilyMember } from '../types';
import { PilotBanner } from '../components/common/PilotBanner';

export const AlertCenterPage: React.FC = () => {
  const { firebaseUser, appUserProfile } = useAuth();
  const [alerts, setAlerts] = useState<SafetyAlert[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);

  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'emergency' | 'device' | 'geofence' | 'resolved'>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('all');
  const [selectedAlertModal, setSelectedAlertModal] = useState<SafetyAlert | null>(null);

  useEffect(() => {
    if (!firebaseUser) return;
    const unsubAlerts = alertService.subscribeAlerts(firebaseUser.uid, setAlerts);
    const unsubMembers = familyService.subscribeFamilyMembers(firebaseUser.uid, setFamilyMembers);
    return () => {
      unsubAlerts();
      unsubMembers();
    };
  }, [firebaseUser]);

  const handleAcknowledge = async (alert: SafetyAlert) => {
    if (!firebaseUser) return;
    const actorName = appUserProfile?.fullName || 'Guardian';
    await alertService.acknowledgeAlert(firebaseUser.uid, alert.id, actorName);
    await activityService.logActivity(firebaseUser.uid, {
      type: 'alert_acknowledged',
      description: `${actorName} acknowledged alert: "${alert.title}".`,
      alertId: alert.id,
      memberId: alert.memberId,
      actorUid: firebaseUser.uid,
    });
  };

  const handleResolve = async (alert: SafetyAlert) => {
    if (!firebaseUser) return;
    const actorName = appUserProfile?.fullName || 'Guardian';
    await alertService.resolveAlert(firebaseUser.uid, alert.id, actorName);
    await activityService.logActivity(firebaseUser.uid, {
      type: 'alert_resolved',
      description: `${actorName} resolved safety alert: "${alert.title}".`,
      alertId: alert.id,
      memberId: alert.memberId,
      actorUid: firebaseUser.uid,
    });
    if (selectedAlertModal?.id === alert.id) {
      setSelectedAlertModal(null);
    }
  };

  const handleMarkRead = async (alertId: string) => {
    if (!firebaseUser) return;
    await alertService.markAsRead(firebaseUser.uid, alertId);
  };

  // Filter logic
  const filteredAlerts = alerts.filter((alert) => {
    // Tab filter
    if (activeTab === 'active' && alert.status !== 'active') return false;
    if (activeTab === 'resolved' && alert.status !== 'resolved') return false;
    if (activeTab === 'emergency' && alert.type !== 'sos' && alert.severity !== 'critical') return false;
    if (activeTab === 'device' && alert.type !== 'band_disconnected' && alert.type !== 'low_battery' && alert.type !== 'tamper_attempt') return false;
    if (activeTab === 'geofence' && !alert.type.includes('geofence')) return false;

    // Severity filter
    if (selectedSeverity !== 'all' && alert.severity !== selectedSeverity) return false;

    // Member filter
    if (selectedMemberId !== 'all' && alert.memberId !== selectedMemberId) return false;

    return true;
  });

  return (
    <div className="min-h-screen bg-[#0A0F1D] text-white flex flex-col justify-between pb-20 md:pb-6">
      <div className="space-y-6">
        <PilotBanner />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Bell className="w-6 h-6 text-red-400" /> TrackGuard Alert Center
            </h1>
            <p className="text-xs text-slate-400">Real-time incident feed, severity filtering & resolution tracking</p>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-4">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs border-b border-slate-800">
            {[
              { key: 'all', label: 'All Alerts' },
              { key: 'active', label: 'Active' },
              { key: 'emergency', label: 'Emergency' },
              { key: 'device', label: 'Device & Battery' },
              { key: 'geofence', label: 'Geofence' },
              { key: 'resolved', label: 'Resolved' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-3 py-2 rounded-t-xl font-medium whitespace-nowrap transition ${
                  activeTab === tab.key
                    ? 'bg-[#162036] text-cyan-400 border-b-2 border-cyan-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Severity & Traveller Dropdowns */}
          <div className="flex flex-wrap items-center gap-3 bg-[#0D1527] border border-slate-800 p-3 rounded-2xl text-xs">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-slate-400 font-medium">Filter by:</span>
            </div>

            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="bg-[#162036] border border-slate-700 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="bg-[#162036] border border-slate-700 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="all">All Family Members</option>
              {familyMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.fullName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Alert Cards Feed */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {filteredAlerts.length === 0 ? (
            <div className="bg-[#0D1527] border border-slate-800 rounded-3xl p-12 text-center space-y-3">
              <Bell className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="text-slate-400 text-sm">No safety alerts matching the selected filters.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAlerts.map((alert) => {
                const member = familyMembers.find((m) => m.id === alert.memberId);
                return (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-2xl border transition shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                      alert.status === 'active' && alert.severity === 'critical'
                        ? 'bg-red-950/40 border-red-500/60 text-red-100'
                        : alert.status === 'active'
                        ? 'bg-[#0D1527] border-amber-500/40 text-amber-100'
                        : 'bg-[#0D1527]/60 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`p-2.5 rounded-xl shrink-0 ${
                          alert.severity === 'critical'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                            : alert.severity === 'high'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                        }`}
                      >
                        {alert.severity === 'critical' ? (
                          <ShieldAlert className="w-6 h-6 animate-pulse" />
                        ) : alert.type.includes('band') ? (
                          <Radio className="w-6 h-6" />
                        ) : alert.type.includes('geofence') ? (
                          <MapPin className="w-6 h-6" />
                        ) : (
                          <AlertCircle className="w-6 h-6" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-sm text-white">{alert.title}</h4>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase ${
                              alert.severity === 'critical'
                                ? 'bg-red-500 text-white font-bold'
                                : alert.severity === 'high'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {alert.severity}
                          </span>
                          {member && (
                            <span className="text-xs text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                              {member.fullName}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-300">{alert.message}</p>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Triggered:{' '}
                          {typeof alert.createdAt === 'string'
                            ? new Date(alert.createdAt).toLocaleString()
                            : 'Recent'}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        onClick={() => setSelectedAlertModal(alert)}
                        className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> Details
                      </button>

                      {alert.status === 'active' && (
                        <button
                          onClick={() => handleAcknowledge(alert)}
                          className="px-3 py-1.5 text-xs bg-amber-950 hover:bg-amber-900 text-amber-300 rounded-xl border border-amber-600/40 flex items-center gap-1 font-medium"
                        >
                          Acknowledge
                        </button>
                      )}

                      {alert.status !== 'resolved' && (
                        <button
                          onClick={() => handleResolve(alert)}
                          className="px-3 py-1.5 text-xs bg-emerald-950 hover:bg-emerald-900 text-emerald-300 rounded-xl border border-emerald-600/40 flex items-center gap-1 font-medium"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Resolve
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Alert Detail Modal */}
      {selectedAlertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#0D1527] border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-red-400" /> Alert Detail
              </h3>
              <button onClick={() => setSelectedAlertModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div>
                <span className="text-slate-500 uppercase font-semibold text-[10px]">Title:</span>
                <h4 className="font-bold text-sm text-white">{selectedAlertModal.title}</h4>
              </div>

              <div>
                <span className="text-slate-500 uppercase font-semibold text-[10px]">Message:</span>
                <p className="text-slate-200 bg-[#162036] p-3 rounded-xl">{selectedAlertModal.message}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono text-[11px] bg-[#162036] p-3 rounded-xl">
                <div>Status: {selectedAlertModal.status.toUpperCase()}</div>
                <div>Severity: {selectedAlertModal.severity.toUpperCase()}</div>
                <div>Acknowledged: {selectedAlertModal.acknowledgedBy || 'No'}</div>
                <div>Resolved: {selectedAlertModal.resolvedBy || 'No'}</div>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              {selectedAlertModal.status !== 'resolved' && (
                <button
                  onClick={() => handleResolve(selectedAlertModal)}
                  className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl shadow"
                >
                  Resolve Alert Now
                </button>
              )}
              <button
                onClick={() => setSelectedAlertModal(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white text-xs rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
