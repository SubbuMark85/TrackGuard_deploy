import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Bell, User, Zap, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { alertService } from '../../services/alertService';
import { SafetyAlert } from '../../types';
import { NotificationDrawer } from './NotificationDrawer';

export const TopHeader: React.FC = () => {
  const { firebaseUser, appUserProfile, signOut } = useAuth();
  const navigate = useNavigate();

  const [alerts, setAlerts] = useState<SafetyAlert[]>([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  useEffect(() => {
    if (!firebaseUser) return;
    const unsub = alertService.subscribeAlerts(firebaseUser.uid, setAlerts);
    return () => unsub();
  }, [firebaseUser]);

  const unreadCount = alerts.filter((a) => !a.isRead).length;

  return (
    <>
      <header className="bg-[#0D1527] border-b border-slate-800 px-4 py-3 sticky top-0 z-40 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo & Brand */}
          <div
            onClick={() => navigate('/guardian')}
            className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center shadow-md shadow-teal-500/20">
              <Shield className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-wide bg-gradient-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-transparent">
                TrackGuard
              </span>
              <span className="block text-[9px] text-teal-400 font-mono tracking-wider uppercase">
                Safety Platform
              </span>
            </div>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/sos')}
              className="px-3 py-1.5 bg-red-600/90 hover:bg-red-600 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-md shadow-red-600/20 animate-pulse"
            >
              <Zap className="w-3.5 h-3.5 fill-white" /> SOS
            </button>

            <button
              onClick={() => setIsNotificationOpen(true)}
              className="relative p-2 rounded-xl bg-[#162036] hover:bg-slate-800 text-slate-300 transition"
              title="Notifications"
            >
              <Bell className="w-5 h-5 text-cyan-400" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center shadow">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {firebaseUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/settings')}
                  className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-400 border border-teal-500/40 font-bold text-xs flex items-center justify-center hover:bg-teal-500/30 transition"
                >
                  {appUserProfile?.fullName
                    ? appUserProfile.fullName[0].toUpperCase()
                    : 'G'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="px-3 py-1.5 bg-teal-500 text-slate-950 font-bold text-xs rounded-xl"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Notification Center Drawer */}
      <NotificationDrawer
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        alerts={alerts}
      />
    </>
  );
};
