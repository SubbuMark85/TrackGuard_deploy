// EmergencyService.js
// Manages emergency state transitions, distress alerts, and response protocols.

export const EMERGENCY_STEPS = [
  { id: 1, label: "Emergency detected (Tamper / SOS)", key: "detected" },
  { id: 2, label: "Guardian notified via instant push & call", key: "guardian_notified" },
  { id: 3, label: "Live location & telemetry stream active", key: "telemetry_active" },
  { id: 4, label: "Nearest responder unit contacted", key: "responder_contacted" },
  { id: 5, label: "Patrol Unit TG-07 dispatched", key: "responder_dispatched" },
  { id: 6, label: "Responder on scene & traveler secured", key: "resolved" }
];

export const EmergencyService = {
  triggerTamperAlert: (travelerName, location) => {
    return {
      incidentId: "INC-2026-" + Math.floor(1000 + Math.random() * 9000),
      type: "TAMPER_ALERT",
      severity: "CRITICAL",
      travelerName: travelerName || "Ananya",
      location: location || "Ooty Botanical Garden, Tamil Nadu",
      coordinates: { lat: 11.4167, lng: 76.7115 },
      timeDetected: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      status: "TAMPER_ALERT_ACTIVE",
      assignedUnit: "Unit TG-07 (Rajesh & Team)",
      etaMinutes: 7,
      steps: EMERGENCY_STEPS.map((s, index) => ({
        ...s,
        completed: index <= 2,
        current: index === 3,
        timestamp: index <= 2 ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null
      }))
    };
  },

  triggerManualSOS: (travelerName, location) => {
    return {
      incidentId: "SOS-2026-" + Math.floor(1000 + Math.random() * 9000),
      type: "SOS_MANUAL",
      severity: "EMERGENCY",
      travelerName: travelerName || "Ananya",
      location: location || "Ooty Botanical Garden",
      coordinates: { lat: 11.4167, lng: 76.7115 },
      timeDetected: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      status: "SOS_ACTIVATED",
      assignedUnit: "Unit TG-07 (Rapid Response)",
      etaMinutes: 7,
      steps: EMERGENCY_STEPS.map((s, index) => ({
        ...s,
        completed: index <= 3,
        current: index === 4,
        timestamp: index <= 3 ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null
      }))
    };
  }
};
