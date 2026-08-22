import React, { createContext, useContext, useState, useEffect } from 'react';
import { LocationService, OOTY_COORDINATES } from '../services/LocationService';
import { bandService as BandService } from '../services/bandService';
import { EmergencyService, EMERGENCY_STEPS } from '../services/EmergencyService';
import { ResponderService } from '../services/ResponderService';
import { notificationService as NotificationService } from '../services/notificationService';


const AppContext = createContext();

export const DEMO_STEPS = [
  {
    id: 1,
    title: "1. Traveler is Safe",
    subtitle: "Ananya is at Ooty Botanical Gardens inside safe geofence",
    status: "SAFE",
    screen: "home"
  },
  {
    id: 2,
    title: "2. Geofence Perimeter Warning",
    subtitle: "Traveler moves towards unmonitored zone perimeter",
    status: "GEOFENCE_WARNING",
    screen: "family"
  },
  {
    id: 3,
    title: "3. Band Tamper Detected!",
    subtitle: "Safety Band senses micro-switch tension breach & force attempt",
    status: "TAMPER_ALERT",
    screen: "band"
  },
  {
    id: 4,
    title: "4. Guardian Alerted",
    subtitle: "Instant high-priority distress alert delivered to parent phone",
    status: "GUARDIAN_NOTIFIED",
    screen: "tamper"
  },
  {
    id: 5,
    title: "5. SOS Protocol Activated",
    subtitle: "Telemetry stream, audio link, & 5G emergency beacon locked",
    status: "SOS_ACTIVE",
    screen: "sos"
  },
  {
    id: 6,
    title: "6. Security Dispatch",
    subtitle: "Command Center dispatches Patrol Unit TG-07 (ETA 7 min)",
    status: "RESPONDER_DISPATCHED",
    screen: "emergency"
  },
  {
    id: 7,
    title: "7. Responder En Route",
    subtitle: "Patrol unit closing in on traveler coordinates in real-time",
    status: "RESPONDER_EN_ROUTE",
    screen: "responder"
  },
  {
    id: 8,
    title: "8. Incident Resolved",
    subtitle: "Traveler verified safe by Officer Rajesh. Band re-encrypted.",
    status: "RESOLVED",
    screen: "home"
  }
];

export const AppProvider = ({ children }) => {
  // App Navigation & Role
  const [userRole, setUserRole] = useState('guardian'); // 'guardian' or 'solo'
  const [activeScreen, setActiveScreen] = useState('login'); // login, home, family, ai, navigation, band, tamper, sos, emergency, trips, profile, responder
  const [activeTab, setActiveTab] = useState('home'); // bottom nav tab

  // Traveler Details
  const [traveler, setTraveler] = useState({
    name: "Ananya",
    role: "Child Traveler",
    age: 12,
    location: OOTY_COORDINATES.botanicalGarden,
    guardianLocation: OOTY_COORDINATES.hotel,
    battery: 84,
    isBandConnected: true,
    lastUpdated: "12 sec ago",
    address: "North Gate, Botanical Garden Rd, Ooty"
  });

  // Safety Band Telemetry State
  const [bandState, setBandState] = useState({
    lockStatus: 'LOCKED', // 'LOCKED', 'UNLOCK_REQUESTED', 'UNLOCKED'
    tamperStatus: 'SECURE', // 'SECURE', 'TAMPER_ALERT', 'COMPROMISED'
    geofenceStatus: 'INSIDE_SAFE_ZONE', // 'INSIDE_SAFE_ZONE', 'WARNING_BOUNDARY', 'BREACHED'
    gpsStatus: 'CONNECTED (12 SAT)',
    cellularStatus: '5G ENCRYPTED',
    skinSensor: true,
    physicalReleaseDisabled: true
  });

  // Emergency Incident State
  const [emergencyIncident, setEmergencyIncident] = useState(null);
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);

  // Responder tracking state
  const [responderUnit, setResponderUnit] = useState({
    id: "TG-07",
    name: "Unit TG-07 (Rajesh & Team)",
    vehicle: "Rapid SUV Patrol",
    lat: 11.4250,
    lng: 76.7200,
    etaMinutes: 7,
    status: "DISPATCHED"
  });

  // Demo Engine State
  const [isDemoActive, setIsDemoActive] = useState(false);
  const [demoStepIndex, setDemoStepIndex] = useState(0);

  // Offline Mode State
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Notifications List
  const [toasts, setToasts] = useState([]);

  // Toast Notification Trigger
  const addToast = (title, message, type = 'info') => {
    const toast = NotificationService.pushAlert(title, message, type);
    setToasts((prev) => [toast, ...prev.slice(0, 4)]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Trigger Tamper Emergency Simulation
  const triggerTamperSimulation = () => {
    const incident = EmergencyService.triggerTamperAlert(traveler.name, traveler.address);
    setEmergencyIncident(incident);
    setIsEmergencyActive(true);
    setBandState((prev) => ({
      ...prev,
      tamperStatus: 'TAMPER_ALERT',
      geofenceStatus: 'BREACHED'
    }));
    setActiveScreen('tamper');
    addToast('⚠️ TAMPER ALERT', 'Possible forced removal detected on Ananya\'s band!', 'danger');
  };

  // Trigger Manual SOS Simulation
  const triggerManualSOS = () => {
    const incident = EmergencyService.triggerManualSOS(traveler.name, traveler.address);
    setEmergencyIncident(incident);
    setIsEmergencyActive(true);
    setBandState((prev) => ({
      ...prev,
      tamperStatus: 'TAMPER_ALERT'
    }));
    setActiveScreen('sos');
    addToast('🚨 SOS ACTIVATED', 'Emergency protocol initiated by traveler!', 'danger');
  };

  // Resolve Emergency
  const resolveEmergency = () => {
    setIsEmergencyActive(false);
    setEmergencyIncident(null);
    setBandState((prev) => ({
      ...prev,
      tamperStatus: 'SECURE',
      geofenceStatus: 'INSIDE_SAFE_ZONE'
    }));
    setResponderUnit((prev) => ({
      ...prev,
      etaMinutes: 7,
      status: "PATROLLING"
    }));
    addToast('✅ INCIDENT RESOLVED', 'Safety confirmed. All systems secure.', 'success');
  };

  // Request Band Unlock by Guardian
  const requestBandUnlock = async () => {
    setBandState((prev) => ({ ...prev, lockStatus: 'UNLOCK_REQUESTED' }));
    const res = await BandService.requestElectronicUnlock('GUARDIAN-01');
    addToast('🔐 UNLOCK REQUESTED', res.message, 'warning');
  };

  const approveBandUnlock = async () => {
    await BandService.confirmUnlockByGuardian();
    setBandState((prev) => ({ ...prev, lockStatus: 'UNLOCKED' }));
    addToast('🔓 BAND UNLOCKED', 'Safety band disengaged electronically.', 'success');
  };

  const relockBand = () => {
    setBandState((prev) => ({ ...prev, lockStatus: 'LOCKED' }));
    addToast('🔒 BAND LOCKED', 'Physical release disengaged. Band secure.', 'info');
  };

  // Demo Stepper Controls
  const setDemoStep = (stepIdx) => {
    if (stepIdx < 0 || stepIdx >= DEMO_STEPS.length) return;
    setDemoStepIndex(stepIdx);
    setIsDemoActive(true);

    const currentDemo = DEMO_STEPS[stepIdx];

    switch (currentDemo.status) {
      case 'SAFE':
        resolveEmergency();
        setActiveScreen('home');
        break;
      case 'GEOFENCE_WARNING':
        setBandState((prev) => ({ ...prev, geofenceStatus: 'WARNING_BOUNDARY' }));
        setActiveScreen('family');
        addToast('⚠️ Geofence Warning', 'Traveler near boundary edge', 'warning');
        break;
      case 'TAMPER_ALERT':
        setBandState((prev) => ({ ...prev, tamperStatus: 'TAMPER_ALERT', geofenceStatus: 'BREACHED' }));
        setActiveScreen('band');
        addToast('🚨 Tamper Triggered', 'Tension switch alert', 'danger');
        break;
      case 'GUARDIAN_NOTIFIED':
        triggerTamperSimulation();
        setActiveScreen('tamper');
        break;
      case 'SOS_ACTIVE':
        triggerManualSOS();
        setActiveScreen('sos');
        break;
      case 'RESPONDER_DISPATCHED':
        setIsEmergencyActive(true);
        setActiveScreen('emergency');
        setResponderUnit((prev) => ({ ...prev, status: "EN_ROUTE", etaMinutes: 4 }));
        addToast('🚓 Responder Dispatched', 'Unit TG-07 en route', 'info');
        break;
      case 'RESPONDER_EN_ROUTE':
        setIsEmergencyActive(true);
        setActiveScreen('responder');
        setResponderUnit((prev) => ({ ...prev, status: "ARRIVING", etaMinutes: 1, lat: 11.4180, lng: 76.7130 }));
        addToast('🚨 Command Center', 'Patrol unit 200m away', 'warning');
        break;
      case 'RESOLVED':
        resolveEmergency();
        setActiveScreen('home');
        break;
      default:
        break;
    }
  };

  const nextDemoStep = () => {
    if (demoStepIndex < DEMO_STEPS.length - 1) {
      setDemoStep(demoStepIndex + 1);
    } else {
      setDemoStep(0);
    }
  };

  const resetDemo = () => {
    setDemoStepIndex(0);
    setIsDemoActive(false);
    resolveEmergency();
    setActiveScreen('home');
    addToast('🔄 DEMO RESET', 'Returned to initial safe state.', 'info');
  };

  // Periodically update last updated time & subtle battery oscillation
  useEffect(() => {
    const timer = setInterval(() => {
      setTraveler((prev) => ({
        ...prev,
        lastUpdated: "Just now"
      }));
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  return (
    <AppContext.Provider
      value={{
        userRole,
        setUserRole,
        activeScreen,
        setActiveScreen,
        activeTab,
        setActiveTab,
        traveler,
        setTraveler,
        bandState,
        setBandState,
        emergencyIncident,
        isEmergencyActive,
        responderUnit,
        setResponderUnit,
        isDemoActive,
        setIsDemoActive,
        demoStepIndex,
        DEMO_STEPS,
        setDemoStep,
        nextDemoStep,
        resetDemo,
        triggerTamperSimulation,
        triggerManualSOS,
        resolveEmergency,
        requestBandUnlock,
        approveBandUnlock,
        relockBand,
        isOfflineMode,
        setIsOfflineMode,
        toasts,
        addToast,
        removeToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

const defaultAppContext = {
  userRole: 'guardian',
  setUserRole: () => {},
  activeScreen: 'home',
  setActiveScreen: () => {},
  activeTab: 'home',
  setActiveTab: () => {},
  traveler: {
    name: "Ananya",
    role: "Child Traveler",
    age: 12,
    location: { lat: 11.4138, lng: 76.6958 },
    guardianLocation: { lat: 11.4050, lng: 76.6900 },
    battery: 84,
    isBandConnected: true,
    lastUpdated: "Just now",
    address: "North Gate, Botanical Garden Rd, Ooty"
  },
  setTraveler: () => {},
  bandState: {
    lockStatus: 'LOCKED',
    tamperStatus: 'SECURE',
    geofenceStatus: 'INSIDE_SAFE_ZONE',
    gpsStatus: 'CONNECTED (12 SAT)',
    cellularStatus: '5G ENCRYPTED',
    skinSensor: true,
    physicalReleaseDisabled: true
  },
  setBandState: () => {},
  emergencyIncident: null,
  isEmergencyActive: false,
  responderUnit: { id: "TG-07", name: "Unit TG-07", vehicle: "Rapid SUV Patrol", etaMinutes: 7, status: "DISPATCHED" },
  setResponderUnit: () => {},
  isDemoActive: false,
  setIsDemoActive: () => {},
  demoStepIndex: 0,
  DEMO_STEPS: [],
  setDemoStep: () => {},
  nextDemoStep: () => {},
  resetDemo: () => {},
  triggerTamperSimulation: () => {},
  triggerManualSOS: () => {},
  resolveEmergency: () => {},
  requestBandUnlock: () => {},
  approveBandUnlock: () => {},
  relockBand: () => {},
  isOfflineMode: false,
  setIsOfflineMode: () => {},
  toasts: [],
  addToast: () => {},
  removeToast: () => {}
};

export const useApp = () => useContext(AppContext) || defaultAppContext;

