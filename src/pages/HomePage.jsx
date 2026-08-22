import React from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  ShieldAlert,
  MapPin,
  Bot,
  Navigation,
  Watch,
  Compass,
  Radio,
  Battery,
  Clock,
  ChevronRight,
  Shield,
  Zap,
  PhoneCall
} from 'lucide-react';

export const HomePage = () => {
  const {
    traveler,
    bandState,
    isEmergencyActive,
    setActiveScreen,
    triggerManualSOS,
    userRole
  } = useApp();

  const isTamper = bandState.tamperStatus === 'TAMPER_ALERT';

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Greeting Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-family-title)', fontSize: '1.5rem', fontWeight: '800', color: '#FFFFFF' }}>
            {userRole === 'guardian' ? 'Good evening, Arun' : 'Good evening, Ananya'}
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {userRole === 'guardian' ? 'Family Safety Guardian Dashboard' : 'Solo Protection Active · Ooty Sector'}
          </p>
        </div>

        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #1E293B 0%, #3B82F6 100%)',
          border: '2px solid #5BC0BE',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: '800',
          color: '#FFFFFF',
          fontSize: '1rem'
        }}>
          {userRole === 'guardian' ? 'A' : 'S'}
        </div>
      </div>

      {/* Main Safety Status Banner Card */}
      <div className="glass-panel" style={{
        padding: '20px',
        background: isEmergencyActive || isTamper
          ? 'linear-gradient(135deg, rgba(69, 10, 10, 0.9) 0%, rgba(31, 4, 4, 0.95) 100%)'
          : 'linear-gradient(135deg, rgba(6, 78, 59, 0.8) 0%, rgba(2, 44, 34, 0.9) 100%)',
        border: isEmergencyActive || isTamper ? '1.5px solid #EF4444' : '1.5px solid #10B981',
        boxShadow: isEmergencyActive || isTamper ? 'var(--shadow-glow-red)' : 'var(--shadow-glow-green)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: isEmergencyActive || isTamper ? '#EF4444' : '#10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isEmergencyActive || isTamper ? '0 0 15px rgba(239,68,68,0.5)' : '0 0 15px rgba(16,185,129,0.5)'
            }}>
              {isEmergencyActive || isTamper ? (
                <ShieldAlert size={24} color="#FFFFFF" className="animate-pulse" />
              ) : (
                <ShieldCheck size={24} color="#090D16" />
              )}
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-family-title)', fontSize: '1.2rem', fontWeight: '800', color: '#FFFFFF', lineHeight: 1.1 }}>
                {isEmergencyActive || isTamper ? "⚠️ Emergency Distress Active" : "Everyone is Safe"}
              </h3>
              <span style={{ fontSize: '0.72rem', color: isEmergencyActive || isTamper ? '#EF4444' : '#6FFFE9' }}>
                {isEmergencyActive || isTamper ? "Guardian alert & responder dispatched" : "All family members inside safe geofence"}
              </span>
            </div>
          </div>

          <span className={isEmergencyActive || isTamper ? "badge badge-emergency" : "badge badge-safe"}>
            {isEmergencyActive || isTamper ? "ALERT" : "SECURE"}
          </span>
        </div>

        {/* Traveler Detail Pill Box */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          border: '1px solid rgba(255,255,255,0.08)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: '#3B82F6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: '800',
                color: '#FFFFFF'
              }}>
                A
              </div>
              <div>
                <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#FFFFFF' }}>
                  {traveler.name}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {traveler.role}
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveScreen('family')}
              className="btn btn-outline"
              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
            >
              Track Map <ChevronRight size={14} />
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '6px',
            fontSize: '0.75rem',
            color: '#E5E7EB',
            marginTop: '4px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            paddingTop: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={13} color="#5BC0BE" />
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {traveler.location.name}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Radio size={13} color={bandState.isBandConnected ? "#10B981" : "#EF4444"} />
              <span>Band: {bandState.isBandConnected ? 'Connected' : 'Disconnected'}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Battery size={13} color="#10B981" />
              <span>Battery: {traveler.battery}%</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={13} color="var(--text-muted)" />
              <span>Updated: {traveler.lastUpdated}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Prominent Emergency SOS Button */}
      <button
        onClick={() => {
          if (isEmergencyActive) {
            setActiveScreen('emergency');
          } else {
            setActiveScreen('sos');
          }
        }}
        className="btn btn-danger"
        style={{
          width: '100%',
          padding: '16px',
          fontSize: '1.05rem',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          letterSpacing: '0.03em'
        }}
      >
        <ShieldAlert size={22} className="animate-pulse" />
        {isEmergencyActive ? "VIEW ACTIVE EMERGENCY RESPONSE" : "ONE-TAP EMERGENCY SOS"}
      </button>

      {/* Quick Actions Grid */}
      <div>
        <h3 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '10px' }}>
          QUICK ACTIONS
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          <div
            onClick={() => setActiveScreen('family')}
            className="glass-card"
            style={{ padding: '14px', textAlign: 'center', cursor: 'pointer' }}
          >
            <div style={{ background: 'rgba(59, 130, 246, 0.15)', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px auto', color: '#3B82F6' }}>
              <MapPin size={20} />
            </div>
            <div style={{ fontWeight: '700', fontSize: '0.82rem', color: '#FFFFFF' }}>Track</div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Live Map</span>
          </div>

          <div
            onClick={() => setActiveScreen('ai')}
            className="glass-card"
            style={{ padding: '14px', textAlign: 'center', cursor: 'pointer' }}
          >
            <div style={{ background: 'rgba(91, 192, 190, 0.15)', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px auto', color: '#5BC0BE' }}>
              <Bot size={20} />
            </div>
            <div style={{ fontWeight: '700', fontSize: '0.82rem', color: '#FFFFFF' }}>AI Assistant</div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Safety Guide</span>
          </div>

          <div
            onClick={() => setActiveScreen('navigation')}
            className="glass-card"
            style={{ padding: '14px', textAlign: 'center', cursor: 'pointer' }}
          >
            <div style={{ background: 'rgba(59, 130, 246, 0.15)', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px auto', color: '#3B82F6' }}>
              <Navigation size={20} />
            </div>
            <div style={{ fontWeight: '700', fontSize: '0.82rem', color: '#FFFFFF' }}>Navigation</div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Offline Maps</span>
          </div>

          <div
            onClick={() => setActiveScreen('sos')}
            className="glass-card"
            style={{ padding: '14px', textAlign: 'center', cursor: 'pointer' }}
          >
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px auto', color: '#EF4444' }}>
              <ShieldAlert size={20} />
            </div>
            <div style={{ fontWeight: '700', fontSize: '0.82rem', color: '#FFFFFF' }}>SOS</div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Emergency</span>
          </div>

          <div
            onClick={() => setActiveScreen('band')}
            className="glass-card"
            style={{ padding: '14px', textAlign: 'center', cursor: 'pointer' }}
          >
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px auto', color: '#10B981' }}>
              <Watch size={20} />
            </div>
            <div style={{ fontWeight: '700', fontSize: '0.82rem', color: '#FFFFFF' }}>Band</div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Hardware</span>
          </div>

          <div
            onClick={() => setActiveScreen('trips')}
            className="glass-card"
            style={{ padding: '14px', textAlign: 'center', cursor: 'pointer' }}
          >
            <div style={{ background: 'rgba(245, 158, 11, 0.15)', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px auto', color: '#F59E0B' }}>
              <Compass size={20} />
            </div>
            <div style={{ fontWeight: '700', fontSize: '0.82rem', color: '#FFFFFF' }}>Trip</div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Ooty Plan</span>
          </div>
        </div>
      </div>
    </div>
  );
};
