import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, UserCheck, Radio } from 'lucide-react';

export const OnboardingPage = () => {
  const { userRole, setUserRole, setActiveScreen } = useApp();
  const [selectedRole, setSelectedRole] = useState(userRole || 'guardian');

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setUserRole(role);
  };

  return (
    <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ textAlign: 'left' }}>
        <span style={{ fontSize: '0.75rem', color: '#5BC0BE', fontWeight: '700', textTransform: 'uppercase' }}>
          Step 1: Choose Your Role
        </span>
        <h2 style={{ fontFamily: 'var(--font-family-title)', fontSize: '1.4rem', fontWeight: '800', color: '#FFFFFF', marginTop: '2px' }}>
          Who is using TrackGuard?
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div
          className="glass-card"
          onClick={() => handleRoleSelect('guardian')}
          style={{
            padding: '16px 12px',
            textAlign: 'center',
            cursor: 'pointer',
            borderColor: selectedRole === 'guardian' ? '#5BC0BE' : 'rgba(255,255,255,0.08)',
            background: selectedRole === 'guardian' ? 'rgba(91, 192, 190, 0.12)' : 'rgba(30, 41, 59, 0.6)'
          }}
        >
          <UserCheck size={28} color="#5BC0BE" style={{ margin: '0 auto 8px auto' }} />
          <h3 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#FFFFFF' }}>Parent / Guardian</h3>
          <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Monitor family, authorize band unlock, receive alerts
          </p>
        </div>

        <div
          className="glass-card"
          onClick={() => handleRoleSelect('solo')}
          style={{
            padding: '16px 12px',
            textAlign: 'center',
            cursor: 'pointer',
            borderColor: selectedRole === 'solo' ? '#5BC0BE' : 'rgba(255,255,255,0.08)',
            background: selectedRole === 'solo' ? 'rgba(91, 192, 190, 0.12)' : 'rgba(30, 41, 59, 0.6)'
          }}
        >
          <ShieldCheck size={28} color="#3B82F6" style={{ margin: '0 auto 8px auto' }} />
          <h3 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#FFFFFF' }}>Solo Traveler</h3>
          <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Personal safety shield, AI travel assistant, SOS trigger
          </p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '16px', textAlign: 'center' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: 'rgba(16, 185, 129, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 10px auto',
          color: '#10B981'
        }}>
          <Radio size={20} />
        </div>
        <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#FFFFFF' }}>Smart Safety Band</h4>
        <p style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: '600', marginTop: '2px' }}>
          Non-removable hardware guardian protection
        </p>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '8px' }}>
          No physical release pin. Unlocks only after parent biometric approval in the app. Automatic tension tamper alerts.
        </p>
      </div>

      <button
        className="btn btn-cyan"
        onClick={() => setActiveScreen('home')}
        style={{ marginTop: '12px', width: '100%' }}
      >
        Launch Home Dashboard
      </button>
    </div>
  );
};
