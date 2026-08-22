import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Battery, 
  Radio, 
  Users, 
  MapPin, 
  Bell, 
  Compass, 
  Plus, 
  Activity, 
  ChevronRight,
  Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { familyService } from '../services/familyService';
import { bandService } from '../services/bandService';
import { alertService } from '../services/alertService';
import { tripService } from '../services/tripService';
import { activityService } from '../services/activityService';
import { sosService } from '../services/sosService';
import { FamilyMember, SafetyBand, SafetyAlert, Trip, ActivityLog, SOSIncident } from '../types';
import { PilotBanner } from '../components/common/PilotBanner';

export const GuardianDashboardPage: React.FC = () => {
  const { firebaseUser, appUserProfile } = useAuth();
  const navigate = useNavigate();

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [bands, setBands] = useState<SafetyBand[]>([]);
  const [alerts, setAlerts] = useState<SafetyAlert[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [sosIncidents, setSosIncidents] = useState<SOSIncident[]>([]);

  useEffect(() => {
    if (!firebaseUser) return;

    const unsubMembers = familyService.subscribeFamilyMembers(firebaseUser.uid, setFamilyMembers);
    const unsubBands = bandService.subscribeBands(firebaseUser.uid, setBands);
    const unsubAlerts = alertService.subscribeAlerts(firebaseUser.uid, setAlerts);
    const unsubTrips = tripService.subscribeTrips(firebaseUser.uid, setTrips);
    const unsubLogs = activityService.subscribeActivityLogs(firebaseUser.uid, setActivityLogs, 15);
    const unsubSos = sosService.subscribeActiveSOSIncidents(firebaseUser.uid, setSosIncidents);

    return () => {
      unsubMembers();
      unsubBands();
      unsubAlerts();
      unsubTrips();
      unsubLogs();
      unsubSos();
    };
  }, [firebaseUser]);

  const activeAlerts = alerts.filter(a => a.status === 'active');
  const criticalHighAlerts = activeAlerts.filter(a => a.severity === 'critical' || a.severity === 'high');
  const activeSOS = sosIncidents.length > 0;
  const disconnectedBands = bands.filter(b => b.connectionStatus === 'disconnected');
  const lowBatteryBands = bands.filter(b => b.batteryLevel < 20);
  const attentionMembers = familyMembers.filter(m => m.status === 'attention');

  // Calculate safety overview strictly
  let safetyStatus: 'safe' | 'attention' | 'critical' = 'safe';
  let safetyMessage = 'Everyone is Safe';
  let safetySubtext = 'All family members and connected safety bands are operating within normal parameters.';

  if (activeSOS || criticalHighAlerts.some(a => a.type === 'sos')) {
    safetyStatus = 'critical';
    safetyMessage = 'CRITICAL EMERGENCY ACTIVE';
    safetySubtext = 'Emergency SOS incident triggered. Immediate guardian review required.';
  } else if (disconnectedBands.length > 0) {
    safetyStatus = 'attention';
    safetyMessage = 'Attention Required — Band Disconnected';
    safetySubtext = `${disconnectedBands.length} safety band(s) currently offline or disconnected.`;
  } else if (lowBatteryBands.length > 0) {
    safetyStatus = 'attention';
    safetyMessage = 'Attention Required — Low Battery Warning';
    safetySubtext = `${lowBatteryBands.length} device(s) have battery levels under 20%.`;
  } else if (attentionMembers.length > 0 || criticalHighAlerts.length > 0) {
    safetyStatus = 'attention';
    safetyMessage = 'Attention Required — Active Safety Alerts';
    safetySubtext = `${criticalHighAlerts.length} unresolved high-severity alert(s) reported.`;
  }

  const activeTrip = trips.find(t => t.status === 'active') || trips[0];

  return (
    <div className="min-h-screen bg-[#0A0F1D] text-white flex flex-col justify-between pb-20 md:pb-6">
      <div className="space-y-4">
        {/* Banner */}
        <PilotBanner />

        {/* Dashboard Header */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-cyan-400" /> Guardian Overview
            </h1>
            <p className="text-xs text-slate-400">
              Welcome back, <span className="text-cyan-300 font-medium">{appUserProfile?.fullName || 'Guardian'}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/sos')}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-600/30 flex items-center gap-1.5 animate-pulse"
            >
              <Zap className="w-4 h-4 fill-white" /> Emergency SOS
            </button>
          </div>
        </div>

        {/* Safety Overview Banner */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div
            className={`p-5 rounded-3xl border shadow-2xl transition-all ${
              safetyStatus === 'critical'
                ? 'bg-red-950/80 border-red-500/80 text-red-100 shadow-red-950/50'
                : safetyStatus === 'attention'
                ? 'bg-amber-950/70 border-amber-500/70 text-amber-100 shadow-amber-950/50'
                : 'bg-emerald-950/50 border-emerald-500/50 text-emerald-100 shadow-emerald-950/30'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div
                  className={`p-3.5 rounded-2xl shrink-0 ${
                    safetyStatus === 'critical'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                      : safetyStatus === 'attention'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  }`}
                >
                  {safetyStatus === 'critical' ? (
                    <ShieldAlert className="w-8 h-8 animate-bounce" />
                  ) : safetyStatus === 'attention' ? (
                    <AlertTriangle className="w-8 h-8" />
                  ) : (
                    <ShieldCheck className="w-8 h-8" />
                  )}
                </div>

                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold uppercase tracking-wide">
                    {safetyMessage}
                  </h2>
                  <p className="text-xs text-slate-200 mt-1 max-w-2xl leading-relaxed">{safetySubtext}</p>
                </div>
              </div>

              <div className="hidden sm:flex flex-col items-end text-xs font-mono">
                <span className="text-slate-300">Monitored Members: {familyMembers.length}</span>
                <span className="text-slate-300">Active Bands: {bands.length}</span>
                <span className="text-slate-300">Unresolved Alerts: {activeAlerts.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div
            onClick={() => navigate('/family')}
            className="bg-[#0D1527] border border-slate-800 p-4 rounded-2xl cursor-pointer hover:border-slate-700 transition"
          >
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Family Members</span>
              <Users className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold text-white mt-2">{familyMembers.length}</div>
            <div className="text-[10px] text-slate-400 mt-1">Tap to manage members</div>
          </div>

          <div
            onClick={() => navigate('/band')}
            className="bg-[#0D1527] border border-slate-800 p-4 rounded-2xl cursor-pointer hover:border-slate-700 transition"
          >
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Safety Bands</span>
              <Radio className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white mt-2">{bands.length}</div>
            <div className="text-[10px] text-slate-400 mt-1">
              {disconnectedBands.length > 0 ? (
                <span className="text-amber-400 font-semibold">{disconnectedBands.length} Disconnected</span>
              ) : (
                'All bands connected'
              )}
            </div>
          </div>

          <div
            onClick={() => navigate('/alerts')}
            className="bg-[#0D1527] border border-slate-800 p-4 rounded-2xl cursor-pointer hover:border-slate-700 transition"
          >
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Active Alerts</span>
              <Bell className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-2xl font-bold text-white mt-2">{activeAlerts.length}</div>
            <div className="text-[10px] text-slate-400 mt-1">
              {criticalHighAlerts.length > 0 ? (
                <span className="text-red-400 font-semibold">{criticalHighAlerts.length} High/Critical</span>
              ) : (
                'No critical alerts'
              )}
            </div>
          </div>

          <div
            onClick={() => navigate('/trips')}
            className="bg-[#0D1527] border border-slate-800 p-4 rounded-2xl cursor-pointer hover:border-slate-700 transition"
          >
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Active Trips</span>
              <Compass className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-white mt-2">{trips.length}</div>
            <div className="text-[10px] text-slate-400 mt-1">{activeTrip ? activeTrip.name : 'No active trip'}</div>
          </div>
        </div>

        {/* Main Grid: Family Members & Activity Timeline */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Family Members */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-base text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" /> Monitored Family Members
              </h3>
              <button
                onClick={() => navigate('/family')}
                className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-medium"
              >
                Manage Family <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {familyMembers.length === 0 ? (
              <div className="bg-[#0D1527] border border-dashed border-slate-800 p-8 rounded-2xl text-center space-y-3">
                <Users className="w-10 h-10 mx-auto text-slate-600" />
                <p className="text-sm text-slate-400">No family members registered yet.</p>
                <button
                  onClick={() => navigate('/family')}
                  className="px-4 py-2 bg-teal-500 text-slate-950 font-bold text-xs rounded-xl shadow"
                >
                  <Plus className="w-4 h-4 inline mr-1" /> Add Family Member
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {familyMembers.map((member) => {
                  const memberBand = bands.find((b) => b.id === member.bandId);
                  return (
                    <div
                      key={member.id}
                      className="bg-[#0D1527] border border-slate-800 hover:border-slate-700 p-4 rounded-2xl space-y-3 shadow-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-slate-950 text-sm shadow-md"
                            style={{ backgroundColor: member.avatarColor || '#4FACFE' }}
                          >
                            {member.avatarInitials}
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm text-white">{member.fullName}</h4>
                            <span className="text-[11px] text-slate-400">{member.relationship} • {member.role.toUpperCase()}</span>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            member.status === 'safe'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {member.status}
                        </span>
                      </div>

                      {/* Location & Band Summary */}
                      <div className="bg-[#162036] p-2.5 rounded-xl space-y-1.5 text-xs text-slate-300">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span className="truncate">
                            {member.currentLocation?.label || 'No location updated'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-700/50 text-[11px]">
                          <span className="text-slate-400 flex items-center gap-1">
                            <Radio className="w-3 h-3 text-emerald-400" />
                            {memberBand ? memberBand.deviceName : 'No Band Assigned'}
                          </span>
                          {memberBand && (
                            <span className="text-slate-300 flex items-center gap-1 font-mono">
                              <Battery className="w-3 h-3 text-yellow-400" />
                              {memberBand.batteryLevel}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Col: Activity Log Timeline */}
          <div className="space-y-4">
            <h3 className="font-semibold text-base text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-400" /> Recent Safety Activity
            </h3>

            <div className="bg-[#0D1527] border border-slate-800 rounded-2xl p-4 space-y-3 max-h-[420px] overflow-y-auto">
              {activityLogs.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">No recent activity logged.</p>
              ) : (
                activityLogs.map((log) => (
                  <div key={log.id} className="text-xs space-y-0.5 border-l-2 border-slate-700 pl-3 py-1">
                    <p className="text-slate-200 font-medium">{log.description}</p>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {typeof log.createdAt === 'string'
                        ? new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'Just now'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
