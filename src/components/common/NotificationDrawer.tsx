import React from 'react';
import { X, Bell, CheckCheck, AlertCircle, ShieldAlert, Radio, MapPin } from 'lucide-react';
import { SafetyAlert } from '../../types';
import { alertService } from '../../services/alertService';
import { useAuth } from '../../context/AuthContext';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: SafetyAlert[];
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose, alerts }) => {
  const { firebaseUser, appUserProfile } = useAuth();

  if (!isOpen) return null;

  const unreadAlerts = alerts.filter(a => !a.isRead);

  const handleMarkRead = async (alertId: string) => {
    if (!firebaseUser) return;
    try {
      await alertService.markAsRead(firebaseUser.uid, alertId);
    } catch (err) {
      console.warn('Error marking alert as read:', err);
    }
  };

  const handleAcknowledge = async (alertId: string) => {
    if (!firebaseUser) return;
    try {
      await alertService.acknowledgeAlert(firebaseUser.uid, alertId, appUserProfile?.fullName || 'Guardian');
    } catch (err) {
      console.warn('Error acknowledging alert:', err);
    }
  };

  const getAlertIcon = (type: string, severity: string) => {
    if (type === 'sos' || severity === 'critical') return <ShieldAlert className="w-5 h-5 text-red-400" />;
    if (type === 'band_disconnected' || type === 'tamper_attempt') return <Radio className="w-5 h-5 text-amber-400" />;
    if (type.includes('geofence')) return <MapPin className="w-5 h-5 text-cyan-400" />;
    return <AlertCircle className="w-5 h-5 text-blue-400" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-[#0D1527] border-l border-slate-800 text-white h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#162036]">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-cyan-400" />
            <h3 className="font-semibold text-lg">In-App Notifications</h3>
            {unreadAlerts.length > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
                {unreadAlerts.length} new
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {alerts.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Bell className="w-12 h-12 mx-auto mb-3 text-slate-600 opacity-50" />
              <p className="text-sm">No safety alerts or notifications yet.</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3.5 rounded-xl border transition ${
                  !alert.isRead
                    ? 'bg-slate-900/90 border-cyan-500/40 shadow-lg'
                    : 'bg-[#10182A]/60 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-slate-800/80 shrink-0">
                    {getAlertIcon(alert.type, alert.severity)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-medium text-sm text-slate-100 truncate">{alert.title}</h4>
                      <span className="text-[10px] font-mono text-slate-400">
                        {typeof alert.createdAt === 'string'
                          ? new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : 'Just now'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{alert.message}</p>

                    <div className="mt-3 flex items-center justify-between">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-medium ${
                        alert.status === 'active' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                        alert.status === 'acknowledged' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {alert.status.toUpperCase()}
                      </span>

                      <div className="flex items-center gap-2">
                        {!alert.isRead && (
                          <button
                            onClick={() => handleMarkRead(alert.id)}
                            className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
                          >
                            <CheckCheck className="w-3.5 h-3.5" /> Mark read
                          </button>
                        )}
                        {alert.status === 'active' && (
                          <button
                            onClick={() => handleAcknowledge(alert.id)}
                            className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-1 rounded border border-slate-700"
                          >
                            Acknowledge
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-[#162036] text-center text-xs text-slate-400">
          In-app alerts real-time synced with Cloud Firestore.
        </div>
      </div>
    </div>
  );
};
