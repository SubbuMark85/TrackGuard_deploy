import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Watch,
  Shield,
  Lock,
  Unlock,
  Radio,
  Cpu,
  Zap,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Key,
  ShieldAlert,
  Smartphone
} from 'lucide-react';

export const SmartBandVisual = () => {
  const {
    bandState,
    traveler,
    requestBandUnlock,
    approveBandUnlock,
    relockBand,
    triggerTamperSimulation,
    userRole
  } = useApp();

  const [showUnlockModal, setShowUnlockModal] = useState(false);

  const isLocked = bandState.lockStatus === 'LOCKED';
  const isUnlockRequested = bandState.lockStatus === 'UNLOCK_REQUESTED';
  const isUnlocked = bandState.lockStatus === 'UNLOCKED';
  const isTamperAlert = bandState.tamperStatus === 'TAMPER_ALERT';

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Title Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-family-title)', fontSize: '1.4rem', fontWeight: '800', color: '#FFFFFF' }}>
            TrackGuard Smart Safety Band
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Device ID: TG-BAND-9821-X · Paired with {traveler.name}
          </p>
        </div>

        <span className={isTamperAlert ? "badge badge-emergency" : isUnlocked ? "badge badge-warning" : "badge badge-safe"}>
          {isTamperAlert ? "⚠ TAMPER ALERT" : isUnlocked ? "UNLOCKED" : "SECURE"}
        </span>
      </div>

      {/* Virtual 3D Graphic & Status Ring */}
      <div className="glass-panel" style={{
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: isTamperAlert
          ? 'radial-gradient(circle at 50% 50%, rgba(239, 68, 68, 0.2) 0%, rgba(19, 27, 46, 0.9) 70%)'
          : 'radial-gradient(circle at 50% 50%, rgba(91, 192, 190, 0.12) 0%, rgba(19, 27, 46, 0.9) 70%)',
        border: isTamperAlert ? '1px solid #EF4444' : '1px solid var(--border-cyan)',
        boxShadow: isTamperAlert ? 'var(--shadow-glow-red)' : 'var(--shadow-glow-cyan)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Hardware Graphic Representation */}
        <div style={{
          position: 'relative',
          width: '180px',
          height: '180px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '10px 0'
        }}>
          {/* Pulsing Outer Orbit Ring */}
          <div style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: isTamperAlert ? '2px dashed #EF4444' : '2px dashed #5BC0BE',
            animation: 'spinSlow 20s linear infinite',
            opacity: 0.6
          }} />

          {/* Band Rubber Strap SVG outline */}
          <svg width="200" height="200" viewBox="0 0 200 200" style={{ position: 'absolute' }}>
            <path
              d="M 50 100 C 50 40, 150 40, 150 100 C 150 160, 50 160, 50 100 Z"
              fill="none"
              stroke={isTamperAlert ? '#B91C1C' : '#1E293B'}
              strokeWidth="24"
              strokeLinecap="round"
            />
            {/* Metallic Clasp Latch */}
            <rect
              x="85"
              y="152"
              width="30"
              height="16"
              rx="4"
              fill={isUnlocked ? '#F59E0B' : isTamperAlert ? '#EF4444' : '#5BC0BE'}
              stroke="#FFFFFF"
              strokeWidth="1.5"
            />
          </svg>

          {/* Center Digital Module Hub */}
          <div style={{
            width: '110px',
            height: '110px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
            border: isTamperAlert ? '3px solid #EF4444' : '3px solid #5BC0BE',
            boxShadow: 'inset 0 0 15px rgba(0,0,0,0.8)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
            padding: '8px',
            textAlign: 'center'
          }}>
            {isTamperAlert ? (
              <ShieldAlert size={32} color="#EF4444" className="animate-pulse" />
            ) : isUnlocked ? (
              <Unlock size={32} color="#F59E0B" />
            ) : (
              <Lock size={32} color="#5BC0BE" />
            )}

            <span style={{
              fontSize: '0.7rem',
              fontWeight: '800',
              color: isTamperAlert ? '#EF4444' : isUnlocked ? '#F59E0B' : '#6FFFE9',
              marginTop: '4px',
              fontFamily: 'var(--font-family-mono)'
            }}>
              {isTamperAlert ? "TAMPER" : isUnlocked ? "DISENGAGED" : "LOCKED"}
            </span>

            <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>
              84% BATTERY
            </span>
          </div>
        </div>

        {/* Highlighted Lock Mechanism Alert */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.4)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 16px',
          width: '100%',
          marginTop: '12px',
          textAlign: 'center',
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <Shield size={14} color="#5BC0BE" /> Physical release: Disabled
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            The band can only be unlocked after guardian electronic approval.
          </p>
        </div>
      </div>

      {/* Live Telemetry Sensors Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
        <div className="glass-card" style={{ padding: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Radio size={16} color="#10B981" />
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>GPS Satellite</span>
          </div>
          <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#F9FAFB' }}>
            Connected (12 Sat)
          </div>
          <span style={{ fontSize: '0.68rem', color: '#10B981' }}>Accuracy: ±1.2 meters</span>
        </div>

        <div className="glass-card" style={{ padding: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Zap size={16} color="#3B82F6" />
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>Cellular Network</span>
          </div>
          <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#F9FAFB' }}>
            5G Encrypted
          </div>
          <span style={{ fontSize: '0.68rem', color: '#3B82F6' }}>Latency: 14 ms</span>
        </div>

        <div className="glass-card" style={{ padding: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Activity size={16} color={isTamperAlert ? '#EF4444' : '#10B981'} />
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>Tamper Sensor</span>
          </div>
          <div style={{ fontSize: '0.88rem', fontWeight: '800', color: isTamperAlert ? '#EF4444' : '#10B981' }}>
            {isTamperAlert ? "TENSION BREACH!" : "Microswitch Intact"}
          </div>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Skin Proximity Active</span>
        </div>

        <div className="glass-card" style={{ padding: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Cpu size={16} color="#5BC0BE" />
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>Electronic Lock</span>
          </div>
          <div style={{ fontSize: '0.88rem', fontWeight: '800', color: isUnlocked ? '#F59E0B' : '#5BC0BE' }}>
            {isUnlocked ? "Disengaged" : "Guardian Authorized"}
          </div>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Hardware Lock Engaged</span>
        </div>
      </div>

      {/* Unlock & Demo Action Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {isLocked && (
          <button
            className="btn btn-cyan"
            onClick={() => {
              requestBandUnlock();
              setShowUnlockModal(true);
            }}
            style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
          >
            <Key size={18} /> Request Electronic Unlock
          </button>
        )}

        {isUnlockRequested && (
          <div className="glass-panel" style={{ padding: '14px', border: '1px solid #F59E0B' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#F59E0B', fontWeight: '700' }}>
              <AlertTriangle size={20} /> Electronic Unlock Requested
            </div>
            <p style={{ fontSize: '0.78rem', color: '#D1D5DB', margin: '6px 0 10px 0' }}>
              Approval request sent to Guardian device. Biometric authorization required.
            </p>

            {userRole === 'guardian' ? (
              <button
                className="btn btn-primary"
                onClick={approveBandUnlock}
                style={{ width: '100%', padding: '10px' }}
              >
                <CheckCircle2 size={16} /> Guardian Approve & Unlock Band
              </button>
            ) : (
              <p style={{ fontSize: '0.72rem', color: '#9CA3AF', fontStyle: 'italic' }}>
                (Switch top header role to "Guardian" to approve unlock)
              </p>
            )}
          </div>
        )}

        {isUnlocked && (
          <button
            className="btn btn-outline"
            onClick={relockBand}
            style={{ width: '100%', padding: '12px' }}
          >
            <Lock size={16} /> Re-lock TrackGuard Band
          </button>
        )}

        {/* Demo Trigger Button */}
        <button
          className="btn btn-danger"
          onClick={triggerTamperSimulation}
          style={{ width: '100%', padding: '12px', fontSize: '0.9rem' }}
        >
          <ShieldAlert size={18} /> Simulate Tamper Alert
        </button>
      </div>

      {/* Unlock Authorization Modal */}
      {showUnlockModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(8px)',
          zIndex: 1200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="glass-panel" style={{
            maxWidth: '380px',
            width: '100%',
            padding: '24px',
            background: '#131B2E',
            border: '1px solid var(--border-cyan)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                background: 'rgba(91, 192, 190, 0.2)',
                padding: '10px',
                borderRadius: '12px',
                color: '#5BC0BE'
              }}>
                <Smartphone size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#FFFFFF' }}>
                  Guardian Authentication
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Electronic Unlock Verification
                </p>
              </div>
            </div>

            <p style={{ fontSize: '0.82rem', color: '#D1D5DB', lineHeight: 1.5 }}>
              TrackGuard bands possess no physical release pins. Disengaging the latch requires parent biometric scanning (FaceID / Fingerprint) on the paired guardian device.
            </p>

            <div style={{
              background: 'rgba(0,0,0,0.3)',
              padding: '12px',
              borderRadius: '8px',
              border: '1px dashed var(--border-subtle)',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>TEMPORARY SECURE AUTH TOKEN</span>
              <div style={{ fontFamily: 'var(--font-family-mono)', fontSize: '1.2rem', fontWeight: '800', color: '#5BC0BE', letterSpacing: '2px', marginTop: '4px' }}>
                TG-849201
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn btn-outline"
                onClick={() => setShowUnlockModal(false)}
                style={{ flex: 1 }}
              >
                Cancel
              </button>

              <button
                className="btn btn-cyan"
                onClick={() => {
                  approveBandUnlock();
                  setShowUnlockModal(false);
                }}
                style={{ flex: 1 }}
              >
                Approve Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
