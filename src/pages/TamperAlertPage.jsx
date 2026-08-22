import React from 'react';
import { useApp } from '../context/AppContext';
import { InteractiveMap } from '../components/map/InteractiveMap';
import {
  ShieldAlert,
  MapPin,
  Clock,
  Radio,
  Battery,
  PhoneCall,
  Mic,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export const TamperAlertPage = () => {
  const {
    traveler,
    bandState,
    emergencyIncident,
    responderUnit,
    resolveEmergency,
    setActiveScreen,
    addToast
  } = useApp();

  return (
    <div style={{
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
      background: 'radial-gradient(circle at 50% 10%, #3B0707 0%, #090D16 80%)',
      minHeight: '100%'
    }}>
      {/* Warning Emergency Header Banner */}
      <div className="glass-panel" style={{
        padding: '16px',
        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.25) 0%, rgba(127, 29, 29, 0.4) 100%)',
        border: '2px solid #EF4444',
        boxShadow: 'var(--shadow-glow-red)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '14px',
          background: '#EF4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 20px rgba(239,68,68,0.7)',
          flexShrink: 0
        }}>
          <ShieldAlert size={30} color="#FFFFFF" className="animate-pulse" />
        </div>

        <div>
          <div className="badge badge-emergency" style={{ fontSize: '0.68rem', marginBottom: '2px' }}>
            CRITICAL DISTRESS SIGNAL
          </div>
          <h2 style={{ fontFamily: 'var(--font-family-title)', fontSize: '1.3rem', fontWeight: '800', color: '#FFFFFF', lineHeight: 1.1 }}>
            ⚠ TAMPER ALERT
          </h2>
          <p style={{ fontSize: '0.78rem', color: '#FCA5A5', marginTop: '2px' }}>
            Possible forced band removal attempt detected on {traveler.name}'s wrist!
          </p>
        </div>
      </div>

      {/* Incident Context Details Grid */}
      <div className="glass-card" style={{ padding: '14px', border: '1px solid var(--border-danger)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', fontSize: '0.78rem' }}>
          <div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>TRAVELER</span>
            <div style={{ fontWeight: '800', color: '#FFFFFF' }}>{traveler.name} (Age 12)</div>
          </div>

          <div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>TIME DETECTED</span>
            <div style={{ fontWeight: '800', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={12} /> {emergencyIncident?.timeDetected || 'Just now'}
            </div>
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>EXACT GPS LOCATION</span>
            <div style={{ fontWeight: '800', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={14} color="#EF4444" /> {traveler.address}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>BAND HARDWARE</span>
            <div style={{ fontWeight: '800', color: '#EF4444' }}>Tension Gauge Breach</div>
          </div>

          <div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>5G BEACON / BATTERY</span>
            <div style={{ fontWeight: '800', color: '#10B981' }}>Active · {traveler.battery}%</div>
          </div>
        </div>
      </div>

      {/* Live Incident Map */}
      <InteractiveMap height="200px" />

      {/* Automated Response Protocol Steps */}
      <div className="glass-panel" style={{ padding: '14px', border: '1px solid rgba(255,255,255,0.1)' }}>
        <h3 style={{ fontSize: '0.88rem', fontWeight: '700', color: '#FFFFFF', marginBottom: '10px' }}>
          AUTOMATED EMERGENCY PROTOCOL
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem', color: '#10B981' }}>
            <CheckCircle2 size={16} /> <strong>Guardian notified</strong> via push & automated phone call
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem', color: '#10B981' }}>
            <CheckCircle2 size={16} /> <strong>Emergency protocol activated</strong> (High-frequency audio beacon)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem', color: '#10B981' }}>
            <CheckCircle2 size={16} /> <strong>Nearest responder identified</strong> ({responderUnit.name} - ETA {responderUnit.etaMinutes} min)
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          className="btn btn-primary"
          onClick={() => setActiveScreen('emergency')}
          style={{ flex: 1, padding: '12px', fontSize: '0.88rem' }}
        >
          Track Responder ETA <ChevronRight size={16} />
        </button>

        <button
          className="btn btn-outline"
          onClick={resolveEmergency}
          style={{ flex: 1, padding: '12px', fontSize: '0.88rem', borderColor: '#10B981', color: '#10B981' }}
        >
          <ShieldCheck size={16} /> Mark Safe & Resolve
        </button>
      </div>
    </div>
  );
};
