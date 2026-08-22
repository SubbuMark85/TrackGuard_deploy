import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Users, 
  MapPin, 
  Radio, 
  Bell, 
  Compass, 
  Bot, 
  Settings 
} from 'lucide-react';

export const BottomNavBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/guardian', label: 'Dashboard', icon: ShieldCheck },
    { path: '/family', label: 'Family', icon: Users },
    { path: '/map', label: 'Safe Zones', icon: MapPin },
    { path: '/band', label: 'Bands', icon: Radio },
    { path: '/alerts', label: 'Alerts', icon: Bell },
    { path: '/trips', label: 'Trips', icon: Compass },
    { path: '/assistant', label: 'AI Help', icon: Bot },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0D1527]/95 backdrop-blur-md border-t border-slate-800 px-2 py-1.5 shadow-2xl">
      <div className="max-w-4xl mx-auto flex items-center justify-around overflow-x-auto gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center py-1 px-2 min-w-[54px] rounded-xl transition ${
                isActive
                  ? 'text-cyan-400 font-bold bg-cyan-950/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span className="text-[10px] font-medium tracking-tight whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
