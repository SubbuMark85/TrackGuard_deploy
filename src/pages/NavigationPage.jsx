import React from 'react';
import { useApp } from '../context/AppContext';
import { InteractiveMap } from '../components/map/InteractiveMap';
import { NavigationService } from '../services/NavigationService';
import {
  Navigation,
  ShieldCheck,
  Wifi,
  WifiOff,
  Download,
  CheckCircle2,
  MapPin,
  Clock,
  Compass,
  CornerUpRight
} from 'lucide-react';

export const NavigationPage = () => {
  const { isOfflineMode, setIsOfflineMode, addToast } = useApp();
  const routeData = NavigationService.getRouteDetails();

  const toggleOffline = () => {
    const nextState = !isOfflineMode;
    setIsOfflineMode(nextState);
    if (nextState) {
      addToast('📡 OFFLINE MODE ACTIVE', 'Switched to cached Nilgiris 3D vector vector maps (48 MB). GPS active without cellular.', 'info');
    } else {
      addToast('🌐 ONLINE MODE ACTIVE', 'Connected to TrackGuard Cloud 5G mesh network.', 'success');
    }
  };

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Title & Online/Offline Mode Toggle Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-family-title)', fontSize: '1.4rem', fontWeight: '800', color: '#FFFFFF' }}>
            Safe Navigation
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Google-Maps Style Safe Corridor Routing
          </p>
        </div>

        {/* Online / Offline Mode Toggle */}
        <button
          onClick={toggleOffline}
          style={{
            background: isOfflineMode ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.15)',
            border: isOfflineMode ? '1px solid #F59E0B' : '1px solid #10B981',
            color: isOfflineMode ? '#F59E0B' : '#10B981',
            borderRadius: 'var(--radius-full)',
            padding: '6px 12px',
            fontSize: '0.75rem',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          {isOfflineMode ? <WifiOff size={14} /> : <Wifi size={14} />}
          {isOfflineMode ? 'OFFLINE MODE' : 'ONLINE MESH'}
        </button>
      </div>

      {/* Main Navigation Route Card */}
      <div className="glass-panel" style={{
        padding: '16px',
        border: '1px solid var(--border-cyan)',
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {/* Origin & Destination Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: '#3B82F6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF'
            }}>
              <Navigation size={20} />
            </div>
            <div>
              <div style={{ fontWeight: '800', fontSize: '1rem', color: '#FFFFFF' }}>
                {routeData.origin} → {routeData.destination}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#5BC0BE', fontWeight: '700' }}>
                {routeData.distanceKm} · {routeData.durationMin} min arrival time
              </div>
            </div>
          </div>

          <span className="badge badge-safe">
            <ShieldCheck size={12} /> {routeData.safetyScore}% Safe Route
          </span>
        </div>

        {/* Turn-by-Turn Safe Steps */}
        <div style={{
          background: 'rgba(0,0,0,0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {routeData.steps.map((step, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.78rem' }}>
              <CornerUpRight size={14} color="#5BC0BE" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div style={{ flex: 1, color: '#E5E7EB' }}>
                {step.instruction}
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                {step.distance}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Interactive Map */}
      <InteractiveMap height="240px" />

      {/* Offline Maps Manager */}
      <div className="glass-card" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '0.88rem', fontWeight: '700', color: '#FFFFFF' }}>
            Offline Map Packs
          </h3>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Downloaded for emergencies
          </span>
        </div>

        {routeData.offlinePacks.map((pack) => (
          <div
            key={pack.id}
            style={{
              background: 'rgba(255,255,255,0.04)',
              padding: '10px 12px',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.82rem', color: '#FFFFFF' }}>
                {pack.region}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                Size: {pack.size} · Updated {pack.lastUpdated}
              </div>
            </div>

            {pack.downloaded ? (
              <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={14} /> Downloaded
              </span>
            ) : (
              <button
                className="btn btn-outline"
                onClick={() => addToast('📥 MAP PACK DOWNLOADED', `${pack.region} saved for offline navigation.`, 'success')}
                style={{ padding: '4px 10px', fontSize: '0.72rem' }}
              >
                <Download size={12} /> Download
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
