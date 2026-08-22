import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { EMERGENCY_STEPS } from '../services/EmergencyService';
import {
  ShieldAlert,
  CheckCircle2,
  Clock,
  Radio,
  MapPin,
  ChevronRight,
  PhoneCall,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

export const SOSPage = () => {
  const {
    traveler,
    isEmergencyActive,
    triggerManualSOS,
    resolveEmergency,
    responderUnit,
    setActiveScreen,
    addToast
  } = useApp();

  const [holdProgress, setHoldProgress] = useState(0);
  const holdIntervalRef = useRef(null);

  const startHold = () => {
    if (isEmergencyActive) return;
    setHoldProgress(0);
    holdIntervalRef.current = setInterval(() => {
      setHoldProgress((prev) => {
        if (prev >= 100) {
          clearInterval(holdIntervalRef.current);
          triggerManualSOS();
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  const cancelHold = () => {
    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    if (holdProgress < 100) setHoldProgress(0);
  };

  return (
    <div style={{
      padding: '20px 16px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minHeight: '100%',
      gap: '20px',
      background: isEmergencyActive
        ? 'radial-gradient(circle at 50% 20%, #450A0A 0%, #090D16 80%)'
        : 'radial-gradient(circle at 50% 20%, #1E293B 0%, #090D16 80%)'
    }}>
      {/* Title Header */}
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-family-title)', fontSize: '1.6rem', fontWeight: '800', color: '#FFFFFF' }}>
          Emergency Panic SOS
        </h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Direct 5G encrypted beacon to TrackGuard Command & Parents
        </p>
      </div>

      {/* Large Hold-To-Send SOS Button */}
      {!isEmergencyActive ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          margin: '10px 0'
        }}>
          <div
            onMouseDown={startHold}
            onMouseUp={cancelHold}
            onMouseLeave={cancelHold}
            onTouchStart={startHold}
            onTouchEnd={cancelHold}
            style={{
              position: 'relative',
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)',
              boxShadow: 'var(--shadow-glow-red), 0 0 50px rgba(239, 68, 68, 0.6)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              userSelect: 'none',
              transition: 'transform 0.15s ease'
            }}
          >
            {/* Circular Hold Progress Ring */}
            <svg
              width="200"
              height="200"
              viewBox="0 0 200 200"
              style={{ position: 'absolute', inset: '-10px', pointerEvents: 'none' }}
            >
              <circle
                cx="100"
                cy="100"
                r="92"
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="6"
              />
              <circle
                cx="100"
                cy="100"
                r="92"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="6"
                strokeDasharray="578"
                strokeDashoffset={578 - (578 * holdProgress) / 100}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.15s linear' }}
              />
            </svg>

            <ShieldAlert size={48} color="#FFFFFF" className="animate-pulse" />
            <span style={{
              fontFamily: 'var(--font-family-title)',
              fontWeight: '800',
              fontSize: '1rem',
              color: '#FFFFFF',
              marginTop: '6px',
              letterSpacing: '0.05em'
            }}>
              {holdProgress > 0 ? `HOLD ${holdProgress}%` : "HOLD TO SEND SOS"}
            </span>
          </div>

          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', maxWidth: '260px' }}>
            Press & hold for 1.5 seconds to trigger immediate security dispatch and family notification.
          </p>

          <button
            className="btn btn-outline"
            onClick={triggerManualSOS}
            style={{ fontSize: '0.8rem', padding: '6px 14px' }}
          >
            Quick One-Tap Test Trigger
          </button>
        </div>
      ) : (
        /* SOS ACTIVATED STATE & TIMELINE */
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="glass-panel" style={{
            padding: '16px',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.3) 0%, rgba(127, 29, 29, 0.5) 100%)',
            border: '1.5px solid #EF4444',
            boxShadow: 'var(--shadow-glow-red)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                background: '#EF4444',
                padding: '10px',
                borderRadius: '12px',
                color: '#FFFFFF',
                boxShadow: '0 0 15px rgba(239,68,68,0.8)'
              }}>
                <ShieldAlert size={24} className="animate-pulse" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#FFFFFF', margin: 0 }}>
                  SOS ACTIVATED
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#FCA5A5' }}>
                  Live 5G Location Streaming to Security Hub
                </span>
              </div>
            </div>

            <span className="badge badge-emergency">ACTIVE</span>
          </div>

          {/* Responder ETA Card */}
          <div className="glass-card" style={{ padding: '16px', textAlign: 'center', border: '1px solid #3B82F6' }}>
            <span style={{ fontSize: '0.72rem', color: '#5BC0BE', fontWeight: '700', letterSpacing: '0.05em' }}>
              DISPATCHED UNIT: {responderUnit.name}
            </span>
            <div style={{
              fontFamily: 'var(--font-family-title)',
              fontSize: '2rem',
              fontWeight: '800',
              color: '#FFFFFF',
              margin: '4px 0'
            }}>
              Estimated arrival: {responderUnit.etaMinutes} min
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Patrol Vehicle closing distance via Garden Road.
            </p>
          </div>

          {/* Incident Progression Timeline */}
          <div className="glass-panel" style={{ padding: '16px' }}>
            <h4 style={{ fontSize: '0.88rem', fontWeight: '700', color: '#FFFFFF', marginBottom: '12px' }}>
              INCIDENT RESPONSE TIMELINE
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem', color: '#10B981' }}>
                <CheckCircle2 size={16} /> ✓ Emergency detected & verified
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem', color: '#10B981' }}>
                <CheckCircle2 size={16} /> ✓ Guardian notified via SMS & push call
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem', color: '#10B981' }}>
                <CheckCircle2 size={16} /> ✓ Live location & audio link shared
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem', color: '#10B981' }}>
                <CheckCircle2 size={16} /> ✓ Nearest responder contacted ({responderUnit.id})
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem', color: '#3B82F6', fontWeight: '700' }}>
                <Clock size={16} className="animate-spin-slow" /> Response in progress (Unit en route)
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className="btn btn-primary"
              onClick={() => setActiveScreen('emergency')}
              style={{ flex: 1, padding: '12px' }}
            >
              Open Response Radar <ChevronRight size={16} />
            </button>
            <button
              className="btn btn-outline"
              onClick={resolveEmergency}
              style={{ padding: '12px', borderColor: '#10B981', color: '#10B981' }}
            >
              <ShieldCheck size={16} /> Cancel SOS
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
