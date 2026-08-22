import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { InteractiveMap } from '../components/map/InteractiveMap';
import { LocationService } from '../services/LocationService';
import {
  Shield,
  ShieldAlert,
  Users,
  Radio,
  MapPin,
  Car,
  Clock,
  PhoneCall,
  CheckCircle2,
  Play,
  RotateCcw,
  Sliders,
  Settings,
  History,
  Activity,
  Maximize2,
  Sparkles,
  Smartphone
} from 'lucide-react';

export const WebDashboardPage = () => {
  const {
    traveler,
    bandState,
    isEmergencyActive,
    emergencyIncident,
    responderUnit,
    triggerTamperSimulation,
    resolveEmergency,
    setDemoStep,
    resetDemo,
    setActiveScreen,
    addToast
  } = useApp();

  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    { label: "Active Travelers", value: "1,284", icon: Users, color: "#3B82F6" },
    { label: "Safe & Protected", value: isEmergencyActive ? "1,283" : "1,284", icon: Shield, color: "#10B981" },
    { label: "Alerts Triggered", value: isEmergencyActive ? "1" : "0", icon: ShieldAlert, color: isEmergencyActive ? "#EF4444" : "#9CA3AF" },
    { label: "Active SOS", value: isEmergencyActive ? "1" : "0", icon: Radio, color: isEmergencyActive ? "#EF4444" : "#9CA3AF" },
    { label: "Responders Online", value: "48", icon: Car, color: "#5BC0BE" }
  ];

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      background: '#070B14',
      color: '#FFFFFF',
      overflow: 'hidden',
      fontFamily: 'var(--font-family-body)'
    }}>
      {/* Left Command Center Sidebar */}
      <aside style={{
        width: '260px',
        background: '#0D1322',
        borderRight: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '16px 12px'
      }}>
        <div>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', marginBottom: '20px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #EF4444 0%, #3B82F6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-glow-cyan)'
            }}>
              <Shield size={22} color="#FFFFFF" />
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-family-title)', fontSize: '1.15rem', fontWeight: '800', margin: 0, color: '#FFFFFF' }}>
                TrackGuard HQ
              </h2>
              <span style={{ fontSize: '0.65rem', color: '#5BC0BE', fontWeight: '700' }}>
                Command & Security Center
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'travelers', label: 'Live Travelers', icon: Users },
              { id: 'emergencies', label: 'Active Emergencies', icon: ShieldAlert, alert: isEmergencyActive },
              { id: 'responders', label: 'Responders', icon: Car },
              { id: 'geofences', label: 'Geofences', icon: Sliders },
              { id: 'history', label: 'Incident History', icon: History },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  style={{
                    background: isActive ? 'rgba(91, 192, 190, 0.15)' : 'transparent',
                    border: isActive ? '1px solid rgba(91, 192, 190, 0.4)' : '1px solid transparent',
                    color: item.alert ? '#EF4444' : isActive ? '#6FFFE9' : '#9CA3AF',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    fontSize: '0.85rem',
                    fontWeight: isActive || item.alert ? '700' : '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </div>

                  {item.alert && (
                    <span className="badge badge-emergency" style={{ fontSize: '0.6rem' }}>
                      1 SOS
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Mobile View Shortcut */}
        <button
          className="btn btn-outline"
          onClick={() => setActiveScreen('home')}
          style={{ width: '100%', fontSize: '0.78rem', padding: '10px' }}
        >
          <Smartphone size={14} /> Open Mobile App View
        </button>
      </aside>

      {/* Main Content Area */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: '#070B14',
        overflowY: 'auto'
      }}>
        {/* Top Control Header */}
        <header style={{
          background: '#0D1322',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          padding: '12px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#FFFFFF', margin: 0 }}>
              Nilgiris Sector Live Incident Radar
            </h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Monitoring 1,284 registered hardware safety bands across Tamil Nadu
            </p>
          </div>

          {/* Real-time Demo Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              className="btn btn-danger"
              onClick={triggerTamperSimulation}
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              <Play size={16} /> Run Emergency Simulation
            </button>

            {isEmergencyActive && (
              <button
                className="btn btn-cyan"
                onClick={resolveEmergency}
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                <CheckCircle2 size={16} /> Resolve Active Incident
              </button>
            )}

            <button
              className="btn btn-outline"
              onClick={resetDemo}
              style={{ padding: '8px 12px', fontSize: '0.85rem' }}
            >
              <RotateCcw size={16} /> Reset System
            </button>
          </div>
        </header>

        {/* Dashboard Grid Container */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
          {/* KPI Metrics Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px' }}>
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: `${stat.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: stat.color
                  }}>
                    <Icon size={22} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                      {stat.label}
                    </span>
                    <strong style={{ fontSize: '1.3rem', fontWeight: '800', color: '#FFFFFF' }}>
                      {stat.value}
                    </strong>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Main Workspace Split: Map vs Incident Side Panel */}
          <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '20px', flex: 1, minHeight: '480px' }}>
            {/* Live Map Panel */}
            <div className="glass-panel" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#FFFFFF' }}>
                  Central Vector Map Grid
                </h3>
                <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>
                  Live 5G Stream
                </span>
              </div>

              <InteractiveMap height="100%" showResponderPath={true} />
            </div>

            {/* Right Side Active Incident Panel */}
            <div className="glass-panel" style={{
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              background: isEmergencyActive
                ? 'linear-gradient(180deg, rgba(69, 10, 10, 0.9) 0%, rgba(13, 19, 34, 0.95) 100%)'
                : 'linear-gradient(180deg, rgba(17, 24, 39, 0.9) 0%, rgba(13, 19, 34, 0.95) 100%)',
              border: isEmergencyActive ? '2px solid #EF4444' : '1px solid var(--border-subtle)',
              boxShadow: isEmergencyActive ? 'var(--shadow-glow-red)' : 'none'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h3 style={{ fontFamily: 'var(--font-family-title)', fontSize: '1.1rem', fontWeight: '800', color: isEmergencyActive ? '#EF4444' : '#FFFFFF', margin: 0 }}>
                    {isEmergencyActive ? "ACTIVE INCIDENT" : "NO ACTIVE DISTRESS"}
                  </h3>

                  <span className={isEmergencyActive ? "badge badge-emergency" : "badge badge-safe"}>
                    {isEmergencyActive ? "CRITICAL" : "NORMAL"}
                  </span>
                </div>

                {isEmergencyActive ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.3)' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>TRAVELER</span>
                      <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#FFFFFF' }}>
                        {traveler.name} (Age 12)
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#FCA5A5' }}>
                        Guardian: Arun (+91 98400 12345)
                      </span>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>INCIDENT TYPE</span>
                      <strong style={{ color: '#EF4444' }}>
                        Tamper Alert (Forced Band Removal Attempt)
                      </strong>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>LOCATION</span>
                      <strong style={{ color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={14} color="#EF4444" /> {traveler.address}
                      </strong>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>STATUS</span>
                      <strong style={{ color: '#10B981' }}>Responder Dispatched</strong>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px' }}>
                      <div>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>RESPONDER</span>
                        <div style={{ fontWeight: '800', color: '#3B82F6' }}>{responderUnit.id}</div>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>ESTIMATED ETA</span>
                        <div style={{ fontWeight: '800', color: '#EF4444' }}>{responderUnit.etaMinutes} minutes</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                    <Shield size={48} color="#10B981" style={{ opacity: 0.5, marginBottom: '10px' }} />
                    <p style={{ fontSize: '0.85rem' }}>
                      All registered travelers in Nilgiris sector are inside designated safe geofences.
                    </p>
                    <button
                      className="btn btn-outline"
                      onClick={triggerTamperSimulation}
                      style={{ marginTop: '16px', fontSize: '0.8rem' }}
                    >
                      Run Simulation Test
                    </button>
                  </div>
                )}
              </div>

              {/* Action Buttons Bar */}
              {isEmergencyActive && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                  <button
                    className="btn btn-outline"
                    onClick={() => addToast('📞 CALLING GUARDIAN', 'Connecting to parent Arun (+91 98400 12345)...', 'info')}
                    style={{ fontSize: '0.82rem' }}
                  >
                    <PhoneCall size={14} /> Call Guardian
                  </button>

                  <button
                    className="btn btn-outline"
                    onClick={() => addToast('📞 CALLING TRAVELER', 'Connecting audio to TrackGuard Smart Band...', 'info')}
                    style={{ fontSize: '0.82rem' }}
                  >
                    <PhoneCall size={14} /> Contact Traveler
                  </button>

                  <button
                    className="btn btn-cyan"
                    onClick={() => addToast('📡 PATROL TRACKING', 'Tracking Unit TG-07 telemetry stream.', 'success')}
                    style={{ fontSize: '0.82rem' }}
                  >
                    <Car size={14} /> Track Responder Unit
                  </button>

                  <button
                    className="btn btn-danger"
                    onClick={resolveEmergency}
                    style={{ fontSize: '0.85rem', marginTop: '4px' }}
                  >
                    <CheckCircle2 size={16} /> Resolve Incident
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
