import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useApp } from '../../context/AppContext';

export const InteractiveMap = ({ height = '340px', showResponderPath = true }) => {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const travelerMarkerRef = useRef(null);
  const responderMarkerRef = useRef(null);
  const geofenceCircleRef = useRef(null);
  const routeLineRef = useRef(null);

  const { traveler, responderUnit, isEmergencyActive, bandState } = useApp();

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize Leaflet map if not already initialized
    if (!leafletMap.current) {
      leafletMap.current = L.map(mapRef.current, {
        center: [traveler.location.lat, traveler.location.lng],
        zoom: 14,
        zoomControl: false,
        attributionControl: false
      });

      // Add Dark CartoDB Tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd'
      }).addTo(leafletMap.current);

      // Add Custom Zoom Control to top right
      L.control.zoom({ position: 'topright' }).addTo(leafletMap.current);
    }

    const map = leafletMap.current;

    // Clear previous markers
    if (travelerMarkerRef.current) map.removeLayer(travelerMarkerRef.current);
    if (responderMarkerRef.current) map.removeLayer(responderMarkerRef.current);
    if (geofenceCircleRef.current) map.removeLayer(geofenceCircleRef.current);
    if (routeLineRef.current) map.removeLayer(routeLineRef.current);

    // Create Traveler Custom Marker Icon
    const isTamper = bandState.tamperStatus === 'TAMPER_ALERT';
    const isBreached = bandState.geofenceStatus === 'BREACHED';

    const travelerIconHtml = `
      <div style="
        position: relative;
        width: 44px;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: ${isTamper ? 'rgba(239,68,68,0.4)' : 'rgba(16,185,129,0.3)'};
          animation: pulseDanger 1.5s infinite;
        "></div>
        <div style="
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: ${isTamper ? '#EF4444' : '#10B981'};
          border: 3px solid #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FFFFFF;
          font-weight: 800;
          font-size: 14px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.5);
          z-index: 2;
        ">
          A
        </div>
      </div>
    `;

    const travelerIcon = L.divIcon({
      html: travelerIconHtml,
      className: 'custom-traveler-icon',
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    });

    travelerMarkerRef.current = L.marker([traveler.location.lat, traveler.location.lng], { icon: travelerIcon })
      .addTo(map)
      .bindPopup(`
        <div style="padding: 4px; font-family: sans-serif;">
          <strong style="color:#5BC0BE;">${traveler.name} (${traveler.role})</strong><br/>
          <span style="font-size:12px; color:#D1D5DB;">${traveler.address}</span><br/>
          <span style="font-size:11px; color:${isTamper ? '#EF4444' : '#10B981'}; font-weight:bold;">
            Status: ${isTamper ? 'TAMPER ALERT!' : 'Safe & Protected'}
          </span>
        </div>
      `);

    // Add Geofence Circle Overlay
    geofenceCircleRef.current = L.circle([11.4167, 76.7115], {
      radius: 650, // 650m safe perimeter
      color: isBreached ? '#EF4444' : '#10B981',
      fillColor: isBreached ? '#EF4444' : '#10B981',
      fillOpacity: 0.12,
      weight: 2,
      dashArray: isBreached ? '4, 4' : null
    }).addTo(map);

    // Render Responder Marker and Route if active or requested
    if (isEmergencyActive || showResponderPath) {
      const responderIconHtml = `
        <div style="
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%);
          border: 2px solid #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FFFFFF;
          font-weight: 800;
          font-size: 11px;
          box-shadow: 0 4px 15px rgba(59,130,246,0.5);
        ">
          TG-07
        </div>
      `;

      const responderIcon = L.divIcon({
        html: responderIconHtml,
        className: 'custom-responder-icon',
        iconSize: [38, 38],
        iconAnchor: [19, 19]
      });

      responderMarkerRef.current = L.marker([responderUnit.lat, responderUnit.lng], { icon: responderIcon })
        .addTo(map)
        .bindPopup(`
          <div style="padding:4px;">
            <strong style="color:#3B82F6;">${responderUnit.name}</strong><br/>
            <span style="font-size:12px;">ETA: ${responderUnit.etaMinutes} minutes</span>
          </div>
        `);

      // Draw Polyline Route between Responder and Traveler
      const routeCoordinates = [
        [responderUnit.lat, responderUnit.lng],
        [11.4210, 76.7160],
        [traveler.location.lat, traveler.location.lng]
      ];

      routeLineRef.current = L.polyline(routeCoordinates, {
        color: isEmergencyActive ? '#EF4444' : '#3B82F6',
        weight: 4,
        opacity: 0.8,
        dashArray: '6, 8'
      }).addTo(map);

      // Fit map bounds to encompass both traveler and responder
      const bounds = L.latLngBounds([
        [traveler.location.lat, traveler.location.lng],
        [responderUnit.lat, responderUnit.lng]
      ]);
      map.fitBounds(bounds, { padding: [40, 40] });
    } else {
      map.setView([traveler.location.lat, traveler.location.lng], 14);
    }
  }, [traveler, responderUnit, isEmergencyActive, bandState]);

  return (
    <div style={{
      width: '100%',
      height: height,
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      border: isEmergencyActive ? '2px solid #EF4444' : '1px solid var(--border-subtle)',
      boxShadow: isEmergencyActive ? 'var(--shadow-glow-red)' : 'var(--shadow-card)',
      position: 'relative'
    }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

      {/* Floating Map Status Overlay */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        left: '12px',
        zIndex: 500,
        background: 'rgba(17, 24, 39, 0.85)',
        backdropFilter: 'blur(10px)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '8px',
        padding: '6px 12px',
        fontSize: '0.72rem',
        color: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: isEmergencyActive ? '#EF4444' : '#10B981'
        }} />
        <span>
          {isEmergencyActive ? 'LIVE EMERGENCY TRACKING' : 'Geofence Guard Active (650m)'}
        </span>
      </div>
    </div>
  );
};
