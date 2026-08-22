import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Shield, Sparkles, Navigation, Watch, ShieldAlert, ArrowRight } from 'lucide-react';

export const SplashPage = () => {
  const { setActiveScreen } = useApp();

  return (
    <div style={{
      minHeight: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '40px 24px',
      background: 'radial-gradient(circle at 50% 30%, #1E293B 0%, #090D16 80%)',
      textAlign: 'center',
      animation: 'fadeIn 0.6s ease-in-out'
    }}>
      <div style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {/* Animated Brand Shield Logo */}
        <div style={{
          position: 'relative',
          width: '100px',
          height: '100px',
          borderRadius: '28px',
          background: 'linear-gradient(135deg, #5BC0BE 0%, #1D4ED8 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 50px rgba(91, 192, 190, 0.4)',
          marginBottom: '24px'
        }}>
          <Shield size={56} color="#090D16" />

          {/* Pulse ring */}
          <div style={{
            position: 'absolute',
            inset: '-10px',
            borderRadius: '34px',
            border: '2px stroke #5BC0BE',
            opacity: 0.5,
            animation: 'pulseSafe 2s infinite'
          }} />
        </div>

        {/* Brand Title */}
        <h1 style={{
          fontFamily: 'var(--font-family-title)',
          fontSize: '2.6rem',
          fontWeight: '800',
          letterSpacing: '-0.03em',
          color: '#FFFFFF',
          margin: 0
        }}>
          TrackGuard
        </h1>

        {/* Tagline */}
        <p style={{
          fontSize: '1.05rem',
          fontWeight: '500',
          color: '#5BC0BE',
          marginTop: '6px',
          letterSpacing: '0.02em'
        }}>
          "Travel freely. Stay protected."
        </p>

        <p style={{
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
          maxWidth: '280px',
          marginTop: '12px',
          lineHeight: 1.5
        }}>
          Next-generation AI travel ecosystem backed by electronic safety bands & instant emergency dispatch.
        </p>

        {/* 4 Connected Layer Badges */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '10px',
          width: '100%',
          maxWidth: '320px',
          marginTop: '32px'
        }}>
          <div className="glass-card" style={{ padding: '10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} color="#5BC0BE" /> AI Companion
          </div>
          <div className="glass-card" style={{ padding: '10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Navigation size={16} color="#3B82F6" /> Offline Maps
          </div>
          <div className="glass-card" style={{ padding: '10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={16} color="#EF4444" /> Instant SOS
          </div>
          <div className="glass-card" style={{ padding: '10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Watch size={16} color="#10B981" /> Smart Band
          </div>
        </div>
      </div>

      {/* Enter Application CTA */}
      <button
        className="btn btn-cyan"
        onClick={() => setActiveScreen('onboarding')}
        style={{
          width: '100%',
          maxWidth: '320px',
          padding: '16px',
          fontSize: '1.05rem',
          borderRadius: 'var(--radius-lg)'
        }}
      >
        Explore App Prototype <ArrowRight size={20} />
      </button>
    </div>
  );
};
