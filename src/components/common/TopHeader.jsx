import React from 'react';
import { useApp } from '../../context/AppContext';
import { Shield, ShieldAlert, Radio, BatteryCharging, UserCheck, Bell, RefreshCw } from 'lucide-react';

export const TopHeader = () => {
  const {
    userRole,
    setUserRole,
    traveler,
    bandState,
    isEmergencyActive,
    setActiveScreen,
    triggerTamperSimulation
  } = useApp();

  return (
    <header style={{
      background: isEmergencyActive
        ? 'linear-gradient(90deg, #370606 0%, #1A0404 100%)'
        : 'linear-gradient(180deg, rgba(17, 24, 39, 0.95) 0%, rgba(17, 24, 39, 0.85) 100%)',
      backdropFilter: 'blur(12px)',
      borderBottom: isEmergencyActive ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid var(--border-subtle)',
      padding: '8px 12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 900
    }}>
      {/* Brand logo & tagline */}
      <div
        onClick={() => setActiveScreen('home')}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', minWidth: 0 }}
      >
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '9px',
          flexShrink: 0,
          background: isEmergencyActive
            ? 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)'
            : 'linear-gradient(135deg, #5BC0BE 0%, #1E40AF 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isEmergencyActive ? '0 0 12px rgba(239,68,68,0.5)' : 'var(--shadow-glow-cyan)'
        }}>
          {isEmergencyActive ? (
            <ShieldAlert size={18} color="#FFFFFF" className="animate-pulse" />
          ) : (
            <Shield size={18} color="#090D16" />
          )}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontFamily: 'var(--font-family-title)',
            fontWeight: '800',
            fontSize: '1.05rem',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            TrackGuard
            <span style={{
              fontSize: '0.55rem',
              fontWeight: '700',
              color: isEmergencyActive ? '#EF4444' : '#5BC0BE',
              background: 'rgba(255,255,255,0.06)',
              padding: '1px 5px',
              borderRadius: '4px',
              letterSpacing: '0.05em'
            }}>
              {isEmergencyActive ? 'SOS' : 'PILOT'}
            </span>
          </div>
          <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Travel freely. Stay protected.
          </div>
        </div>
      </div>

      {/* Right controls: Role Pill & Battery & Quick Tamper trigger */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
        {/* Connection & Battery Pill */}
        <div
          onClick={() => setActiveScreen('band')}
          title="Click to view Band Diagnostics"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-full)',
            padding: '3px 8px',
            fontSize: '0.7rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          <Radio size={11} color={bandState.isBandConnected ? '#10B981' : '#EF4444'} />
          <span style={{ color: '#E5E7EB' }}>{traveler.battery}%</span>
        </div>

        {/* Role Toggle Switch */}
        <div style={{
          display: 'flex',
          background: 'rgba(0,0,0,0.3)',
          borderRadius: 'var(--radius-full)',
          padding: '2px',
          border: '1px solid var(--border-subtle)'
        }}>
          <button
            onClick={() => setUserRole('guardian')}
            style={{
              background: userRole === 'guardian' ? '#3B82F6' : 'transparent',
              color: userRole === 'guardian' ? '#FFFFFF' : '#9CA3AF',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              padding: '2px 7px',
              fontSize: '0.65rem',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Guardian
          </button>
          <button
            onClick={() => setUserRole('solo')}
            style={{
              background: userRole === 'solo' ? '#5BC0BE' : 'transparent',
              color: userRole === 'solo' ? '#090D16' : '#9CA3AF',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              padding: '2px 7px',
              fontSize: '0.65rem',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Solo
          </button>
        </div>
      </div>
    </header>
  );
};
