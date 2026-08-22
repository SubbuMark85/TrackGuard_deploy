import React from 'react';
import { useApp } from '../context/AppContext';
import { InteractiveMap } from '../components/map/InteractiveMap';
import { LocationService } from '../services/LocationService';
import { MapPin, Radio, Battery, ShieldCheck, ShieldAlert, Compass, Clock, UserCheck } from 'lucide-react';

export const FamilyTrackingPage = () => {
  const { traveler, bandState, isEmergencyActive, setActiveScreen } = useApp();

  const distanceKm = LocationService.calculateDistance(
    traveler.location.lat,
    traveler.location.lng,
    traveler.guardianLocation.lat,
    traveler.guardianLocation.lng
  );

  const isTamper = bandState.tamperStatus === 'TAMPER_ALERT';

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Screen Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-family-title)', fontSize: '1.4rem', fontWeight: '800', color: '#FFFFFF' }}>
            Live Family Radar
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Continuous 5G Encrypted GPS Telemetry
          </p>
        </div>

        <span className={isTamper ? "badge badge-emergency" : "badge badge-safe"}>
          {isTamper ? "DISTRESS ALERT" : "GEOFENCE SAFE"}
        </span>
      </div>

      {/* Live Map Display */}
      <InteractiveMap height="280px" />

      {/* Traveler Detailed Card */}
      <div className="glass-panel" style={{
        padding: '16px',
        border: isTamper ? '1px solid #EF4444' : '1px solid var(--border-cyan)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
              border: '2px solid #FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800',
              color: '#FFFFFF',
              fontSize: '1.1rem'
            }}>
              A
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#FFFFFF', margin: 0 }}>
                {traveler.name}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                <span className={isTamper ? "badge badge-emergency" : "badge badge-safe"} style={{ fontSize: '0.65rem' }}>
                  {isTamper ? "TAMPER ALERT" : "Safe"}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Band connected
                </span>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#5BC0BE' }}>
              Battery: {traveler.battery}%
            </div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
              Last updated: {traveler.lastUpdated}
            </span>
          </div>
        </div>

        {/* Telemetry Metrics Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '10px',
          background: 'rgba(0,0,0,0.3)',
          padding: '12px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(255,255,255,0.06)'
        }}>
          <div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>
              CURRENT LOCATION
            </span>
            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={12} color="#5BC0BE" /> {traveler.location.name}
            </span>
          </div>

          <div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>
              DISTANCE FROM GUARDIAN
            </span>
            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Compass size={12} color="#3B82F6" /> {distanceKm} km away
            </span>
          </div>

          <div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>
              GEOFENCE INTEGRITY
            </span>
            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: isTamper ? '#EF4444' : '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={12} /> {bandState.geofenceStatus === 'BREACHED' ? 'Perimeter Breached' : '650m Safe Corridor'}
            </span>
          </div>

          <div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>
              5G BEACON SIGNAL
            </span>
            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Radio size={12} /> Strong (14ms)
            </span>
          </div>
        </div>

        {/* Action button bar */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="btn btn-cyan"
            onClick={() => setActiveScreen('navigation')}
            style={{ flex: 1, padding: '10px', fontSize: '0.85rem' }}
          >
            Navigate to Ananya
          </button>
          <button
            className="btn btn-outline"
            onClick={() => setActiveScreen('band')}
            style={{ flex: 1, padding: '10px', fontSize: '0.85rem' }}
          >
            Band Status
          </button>
        </div>
      </div>
    </div>
  );
};
