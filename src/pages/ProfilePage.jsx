import React from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  Watch,
  Bell,
  Lock,
  Smartphone,
  ChevronRight,
  LogOut,
  Mail,
  ShieldCheck
} from 'lucide-react';

export const ProfilePage = () => {
  const { userRole, setActiveScreen, addToast } = useApp();
  const { firebaseUser, appUserProfile, signOut } = useAuth();

  const displayName = firebaseUser?.displayName || appUserProfile?.fullName || (userRole === 'guardian' ? 'Arun Subramaniam' : 'Ananya Subramaniam');
  const userEmail = firebaseUser?.email || 'guardian@trackguard.app';
  const initial = displayName ? displayName.charAt(0).toUpperCase() : 'G';

  const handleLogout = async () => {
    try {
      await signOut();
      addToast('👋 LOGGED OUT', 'Successfully signed out of Firebase session.', 'info');
    } catch (err) {
      addToast('ERROR', err.message || 'Failed to sign out', 'error');
    }
  };

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* User Header */}
      <div className="glass-panel" style={{
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)',
        border: '1px solid var(--border-cyan)'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
          border: '3px solid #5BC0BE',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: '800',
          color: '#FFFFFF',
          fontSize: '1.4rem',
          boxShadow: 'var(--shadow-glow-cyan)'
        }}>
          {initial}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <span className="badge badge-cyan" style={{ fontSize: '0.65rem', marginBottom: '2px' }}>
            AUTHENTICATED GUARDIAN
          </span>
          <h2 style={{ fontFamily: 'var(--font-family-title)', fontSize: '1.2rem', fontWeight: '800', color: '#FFFFFF', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {displayName}
          </h2>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <Mail size={12} color="#5BC0BE" /> {userEmail}
          </p>
        </div>
      </div>

      {/* Connected Hardware Devices */}
      <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#FFFFFF' }}>
          Connected Safety Hardware
        </h3>

        <div style={{
          background: 'rgba(255,255,255,0.04)',
          padding: '12px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          border: '1px solid rgba(91, 192, 190, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Watch size={24} color="#5BC0BE" />
            <div>
              <strong style={{ color: '#FFFFFF', fontSize: '0.88rem' }}>TrackGuard Smart Band v4</strong>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Serial: TG-BAND-9821-X · Battery: 84%
              </div>
            </div>
          </div>

          <button
            className="btn btn-outline"
            onClick={() => setActiveScreen('band')}
            style={{ padding: '4px 10px', fontSize: '0.72rem' }}
          >
            Manage <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Security & Notification Options */}
      <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#FFFFFF' }}>
          Security & Alert Preferences
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem', color: '#E5E7EB' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={16} color="#3B82F6" />
              <span>Firebase Auth Encryption</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={12} /> SECURE
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell size={16} color="#F59E0B" />
              <span>High-Priority Siren Push Alerts</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: '700' }}>ENABLED</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Smartphone size={16} color="#5BC0BE" />
              <span>Offline Map Cache Auto-Download</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: '700' }}>ENABLED (48 MB)</span>
          </div>
        </div>
      </div>

      {/* Switch Account CTA */}
      <button
        className="btn btn-outline"
        onClick={handleLogout}
        style={{ padding: '14px', color: '#EF4444', borderColor: 'rgba(239,68,68,0.3)', width: '100%' }}
      >
        <LogOut size={18} /> Sign Out of Firebase
      </button>
    </div>
  );
};
