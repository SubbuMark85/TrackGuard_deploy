import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Home,
  MapPin,
  Bot,
  Navigation,
  Watch,
  ShieldAlert,
  Compass,
  User
} from 'lucide-react';

export const BottomNavBar = () => {
  const { activeScreen, setActiveScreen, isEmergencyActive } = useApp();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'family', label: 'Track', icon: MapPin },
    { id: 'ai', label: 'AI Travel', icon: Bot },
    { id: 'navigation', label: 'Nav', icon: Navigation },
    { id: 'band', label: 'Safety Band', icon: Watch },
    { id: 'sos', label: 'SOS', icon: ShieldAlert, isEmergency: true },
    { id: 'trips', label: 'Trips', icon: Compass },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <nav style={{
      background: 'rgba(17, 24, 39, 0.95)',
      backdropFilter: 'blur(16px)',
      borderTop: '1px solid var(--border-subtle)',
      padding: '6px 4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      position: 'sticky',
      bottom: 0,
      zIndex: 900
    }}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeScreen === item.id;
        const isSOS = item.isEmergency;

        return (
          <button
            key={item.id}
            onClick={() => setActiveScreen(item.id)}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px',
              cursor: 'pointer',
              color: isSOS
                ? '#EF4444'
                : isActive
                ? '#5BC0BE'
                : '#9CA3AF',
              padding: '4px 6px',
              borderRadius: '8px',
              transition: 'all 0.2s ease',
              position: 'relative'
            }}
          >
            {isSOS ? (
              <div style={{
                background: isEmergencyActive ? '#EF4444' : 'rgba(239, 68, 68, 0.15)',
                color: isEmergencyActive ? '#FFFFFF' : '#EF4444',
                padding: '6px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isEmergencyActive ? '0 0 15px rgba(239,68,68,0.6)' : 'none',
                transform: isEmergencyActive ? 'scale(1.15)' : 'none'
              }}>
                <Icon size={18} />
              </div>
            ) : (
              <Icon size={18} color={isActive ? '#5BC0BE' : '#9CA3AF'} />
            )}

            <span style={{
              fontSize: '0.65rem',
              fontWeight: isActive || isSOS ? '700' : '500',
              lineHeight: 1
            }}>
              {item.label}
            </span>

            {/* Active glowing indicator indicator dot */}
            {isActive && !isSOS && (
              <div style={{
                position: 'absolute',
                bottom: '-2px',
                width: '14px',
                height: '3px',
                borderRadius: '2px',
                background: '#5BC0BE',
                boxShadow: '0 0 8px #5BC0BE'
              }} />
            )}
          </button>
        );
      })}
    </nav>
  );
};
