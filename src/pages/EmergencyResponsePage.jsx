import React from 'react';
import { useApp } from '../context/AppContext';
import { InteractiveMap } from '../components/map/InteractiveMap';
import {
  ShieldAlert,
  Car,
  Clock,
  Radio,
  PhoneCall,
  Mic,
  ShieldCheck,
  MapPin,
  CheckCircle2
} from 'lucide-react';

export const EmergencyResponsePage = () => {
  const {
    traveler,
    responderUnit,
    isEmergencyActive,
    resolveEmergency,
    addToast
  } = useApp();

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Title & Live Status Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-family-title)', fontSize: '1.4rem', fontWeight: '800', color: '#FFFFFF' }}>
            Emergency Response Dispatch
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#EF4444', fontWeight: '700' }}>
            Patrol Unit TG-07 En Route to Incident Site
          </p>
        </div>

        <span className="badge badge-emergency">
          LIVE DISPATCH
        </span>
      </div>

      {/* Dispatch Metrics Highlight Panel */}
      <div className="glass-panel" style={{
        padding: '16px',
        border: '1.5px solid #EF4444',
        background: 'linear-gradient(135deg, rgba(69, 10, 10, 0.8) 0%, rgba(19, 27, 46, 0.9) 100%)',
        boxShadow: 'var(--shadow-glow-red)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: '#3B82F6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF'
            }}>
              <Car size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#5BC0BE', fontWeight: '700' }}>
                ASSIGNED RESPONDER
              </div>
              <div style={{ fontWeight: '800', fontSize: '1rem', color: '#FFFFFF' }}>
                {responderUnit.name}
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#EF4444' }}>
              ETA: {responderUnit.etaMinutes} min
            </div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
              Location sharing active
            </span>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
          background: 'rgba(0,0,0,0.3)',
          padding: '10px',
          borderRadius: 'var(--radius-md)',
          textAlign: 'center',
          fontSize: '0.72rem'
        }}>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block' }}>STATUS</span>
            <strong style={{ color: '#10B981' }}>Dispatched</strong>
          </div>

          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block' }}>VEHICLE</span>
            <strong style={{ color: '#FFFFFF' }}>{responderUnit.vehicle}</strong>
          </div>

          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block' }}>STREAM</span>
            <strong style={{ color: '#5BC0BE' }}>5G Active</strong>
          </div>
        </div>
      </div>

      {/* Dual Tracking Map (Traveler + Responder) */}
      <InteractiveMap height="260px" showResponderPath={true} />

      {/* Live Incident Log Timeline */}
      <div className="glass-card" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <h3 style={{ fontSize: '0.88rem', fontWeight: '700', color: '#FFFFFF' }}>
          INCIDENT RESPONSE LOG
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.78rem' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#D1D5DB' }}>
            <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>00:01</span>
            <CheckCircle2 size={14} color="#10B981" />
            <span>Distress beacon received at Nilgiris Sector HQ</span>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#D1D5DB' }}>
            <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>00:02</span>
            <CheckCircle2 size={14} color="#10B981" />
            <span>Unit TG-07 dispatched from Station #4</span>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#D1D5DB' }}>
            <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>00:04</span>
            <CheckCircle2 size={14} color="#3B82F6" />
            <span>Patrol SUV passing Commercial Road junction</span>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#5BC0BE', fontWeight: '700' }}>
            <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>00:06</span>
            <Clock size={14} className="animate-spin-slow" />
            <span>Approach distance: 450 meters from Botanical Garden</span>
          </div>
        </div>
      </div>

      {/* Operator Communication Shortcuts */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          className="btn btn-outline"
          onClick={() => addToast('📞 CALLING RESPONDER', 'Dialing Officer Rajesh (+91 98765 43210)...', 'info')}
          style={{ flex: 1, padding: '12px', fontSize: '0.82rem' }}
        >
          <PhoneCall size={16} /> Call Responder
        </button>

        <button
          className="btn btn-cyan"
          onClick={() => addToast('🎙️ AUDIO STREAM ACTIVE', 'Listening to TrackGuard Band ambient microphone...', 'warning')}
          style={{ flex: 1, padding: '12px', fontSize: '0.82rem' }}
        >
          <Mic size={16} /> Ambient Audio
        </button>

        <button
          className="btn btn-danger"
          onClick={resolveEmergency}
          style={{ padding: '12px', fontSize: '0.82rem' }}
          title="Resolve incident"
        >
          <ShieldCheck size={16} /> Resolve
        </button>
      </div>
    </div>
  );
};
