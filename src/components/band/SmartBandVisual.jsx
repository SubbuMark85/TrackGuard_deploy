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
  Smartphone,
  Volume2,
  Vibrate,
  Lightbulb,
  FileText,
  Wifi
} from 'lucide-react';

export const SmartBandVisual = () => {
  const {
    bandState,
    traveler,
    requestBandUnlock,
    approveBandUnlock,
    relockBand,
    triggerTamperSimulation,
    triggerHardwareBuzzer,
    triggerHardwareVibration,
    setRgbLedMode,
    userRole
  } = useApp();

  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [showSchematicModal, setShowSchematicModal] = useState(false);

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
            TrackGuard ESP32-C3 Safety Band
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Wifi size={12} color="#10B981" /> RTDB Connected · Paired with {traveler.name}
          </p>
        </div>

        <span className={isTamperAlert ? "badge badge-emergency" : isUnlocked ? "badge badge-warning" : "badge badge-safe"}>
          {isTamperAlert ? "⚠ TAMPER ALERT" : isUnlocked ? "UNLOCKED" : "ESP32 ONLINE"}
        </span>
      </div>

      {/* Virtual Graphic & Live Status Ring */}
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
              {isTamperAlert ? "TAMPER" : isUnlocked ? "DISENGAGED" : "ESP32-C3 SECURE"}
            </span>

            <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>
              {traveler.battery}% BATT · Li-Po
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
            <Shield size={14} color="#5BC0BE" /> Hardware Release: Electronic Encryption Active
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Syncing via Firebase RTDB endpoint: trackguard-dd2d4-default-rtdb
          </p>
        </div>
      </div>

      {/* Live Telemetry Sensors Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
        <div className="glass-card" style={{ padding: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Radio size={16} color="#10B981" />
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>Neo-6M GPS</span>
          </div>
          <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#F9FAFB' }}>
            Connected (UART1)
          </div>
          <span style={{ fontSize: '0.68rem', color: '#10B981' }}>Accuracy: ±1.2m (12 Sats)</span>
        </div>

        <div className="glass-card" style={{ padding: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Zap size={16} color="#3B82F6" />
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>Li-Po Power</span>
          </div>
          <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#F9FAFB' }}>
            {traveler.battery}% (ADC1_CH0)
          </div>
          <span style={{ fontSize: '0.68rem', color: '#3B82F6' }}>TP4056 Charger Integrated</span>
        </div>

        <div className="glass-card" style={{ padding: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Activity size={16} color={isTamperAlert ? '#EF4444' : '#10B981'} />
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>Tamper Switch</span>
          </div>
          <div style={{ fontSize: '0.88rem', fontWeight: '800', color: isTamperAlert ? '#EF4444' : '#10B981' }}>
            {isTamperAlert ? "TENSION BREACH!" : "GPIO4 Latch Intact"}
          </div>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Wrist Proximity Pin</span>
        </div>

        <div className="glass-card" style={{ padding: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Cpu size={16} color="#5BC0BE" />
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>ESP32-C3 SoC</span>
          </div>
          <div style={{ fontSize: '0.88rem', fontWeight: '800', color: isUnlocked ? '#F59E0B' : '#5BC0BE' }}>
            {isUnlocked ? "Strap Disengaged" : "RISC-V Wi-Fi Active"}
          </div>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Firebase RTDB Sync</span>
        </div>
      </div>

      {/* Real-time Hardware Remote Control Panel (SIH Showcase) */}
      <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', border: '1px solid var(--border-cyan)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#5BC0BE', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={18} /> ESP32-C3 Remote Hardware Controls
          </h3>
          <button
            onClick={() => setShowSchematicModal(true)}
            style={{ fontSize: '0.72rem', color: '#6FFFE9', background: 'rgba(91, 192, 190, 0.15)', border: '1px solid #5BC0BE', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <FileText size={12} /> Pinout & Schematic
          </button>
        </div>

        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Send live triggers directly to physical ESP32-C3 hardware via Firebase Realtime Database:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
          <button
            className="btn btn-outline"
            onClick={() => triggerHardwareBuzzer(true)}
            style={{ padding: '10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <Volume2 size={16} color="#F59E0B" /> Sound Siren Buzzer
          </button>

          <button
            className="btn btn-outline"
            onClick={() => triggerHardwareVibration(true)}
            style={{ padding: '10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <Vibrate size={16} color="#3B82F6" /> Test Vibration Motor
          </button>
        </div>

        <div>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Set RGB LED Status Color:</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
            <button
              onClick={() => setRgbLedMode('NORMAL_GREEN')}
              style={{ padding: '6px', fontSize: '0.7rem', background: '#064E3B', color: '#6EE7B7', border: '1px solid #10B981', borderRadius: '6px', cursor: 'pointer' }}
            >
              🟢 Safe Green
            </button>
            <button
              onClick={() => setRgbLedMode('SOS_RED')}
              style={{ padding: '6px', fontSize: '0.7rem', background: '#7F1D1D', color: '#FCA5A5', border: '1px solid #EF4444', borderRadius: '6px', cursor: 'pointer' }}
            >
              🔴 SOS Red
            </button>
            <button
              onClick={() => setRgbLedMode('TAMPER_ORANGE')}
              style={{ padding: '6px', fontSize: '0.7rem', background: '#78350F', color: '#FDE68A', border: '1px solid #F59E0B', borderRadius: '6px', cursor: 'pointer' }}
            >
              🟠 Tamper
            </button>
            <button
              onClick={() => setRgbLedMode('CHARGING_BLUE')}
              style={{ padding: '6px', fontSize: '0.7rem', background: '#1E3A8A', color: '#93C5FD', border: '1px solid #3B82F6', borderRadius: '6px', cursor: 'pointer' }}
            >
              🔵 Unlock Blue
            </button>
          </div>
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
          <ShieldAlert size={18} /> Simulate Tamper Disconnect
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

      {/* SIH Hardware Wiring & Schematic Modal */}
      {showSchematicModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(10px)',
          zIndex: 1300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="glass-panel" style={{
            maxWidth: '500px',
            maxHeight: '85vh',
            overflowY: 'auto',
            width: '100%',
            padding: '24px',
            background: '#0B1120',
            border: '1px solid #5BC0BE',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', pb: '10px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#6FFFE9', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Cpu size={20} /> ESP32-C3 Circuit Pinout (SIH Architecture)
              </h3>
              <button
                onClick={() => setShowSchematicModal(false)}
                style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ fontSize: '0.8rem', color: '#D1D5DB', lineHeight: 1.6 }}>
              <p style={{ marginBottom: '10px' }}>
                <strong>Hardware Components Allocation & GPIO Mapping:</strong>
              </p>
              <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li><strong>1. ESP32-C3 RISC-V SoC:</strong> Core Wi-Fi + BLE Microcontroller</li>
                <li><strong>2. Neo-6M GPS Module:</strong> UART1 (RX = GPIO20, TX = GPIO21)</li>
                <li><strong>3. SOS Push Button:</strong> GPIO3 (Active-LOW Interrupt + Internal Pull-Up)</li>
                <li><strong>4. Tamper / Disconnect Latch:</strong> GPIO4 (Wrist Strap Tension Switch)</li>
                <li><strong>5. Li-Po Battery Monitoring:</strong> GPIO1 (ADC1_CH0 100k:100k Divider)</li>
                <li><strong>6. Vibration Motor & Buzzer:</strong> GPIO5 (Haptics) & GPIO6 (Siren Tone)</li>
                <li><strong>7. RGB LED Status Indicator:</strong> GPIO8 (Red), GPIO9 (Green), GPIO10 (Blue)</li>
              </ul>
            </div>

            <div style={{ background: '#131C31', padding: '12px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.72rem', color: '#5BC0BE', border: '1px dashed #3B82F6' }}>
              Firebase RTDB Node: https://trackguard-dd2d4-default-rtdb.firebaseio.com/
            </div>

            <button
              className="btn btn-cyan"
              onClick={() => setShowSchematicModal(false)}
              style={{ width: '100%', marginTop: '6px' }}
            >
              Close Schematic
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

