// ResponderService.js
// Controls security team dispatch units, ETA tracking, and command center communications.

export const ResponderService = {
  getRespondersList: () => [
    { id: "TG-07", name: "Patrol Unit TG-07 (Officer Rajesh)", status: "DISPATCHED", vehicle: "SUV Rapid Response", phone: "+91 98765 43210", eta: 7, lat: 11.4250, lng: 76.7200 },
    { id: "TG-02", name: "Patrol Unit TG-02 (Officer Meera)", status: "PATROLLING", vehicle: "Motorcycle Patrol", phone: "+91 98765 43211", eta: 12, lat: 11.4050, lng: 76.6950 },
    { id: "TG-11", name: "Patrol Unit TG-11 (Officer Vikram)", status: "STANDBY", vehicle: "Command Support Van", phone: "+91 98765 43212", eta: 15, lat: 11.4120, lng: 76.7080 }
  ],

  getActiveIncident: () => ({
    incidentId: "INC-2026-9841",
    travelerName: "Ananya",
    age: 12,
    guardianName: "Arun",
    guardianPhone: "+91 98400 12345",
    trigger: "Tamper Sensor Alert (Forced Band Removal Attempt)",
    locationName: "Ooty Botanical Garden - East Lawn",
    coordinates: { lat: 11.4167, lng: 76.7115 },
    responderAssigned: "Patrol Unit TG-07",
    responderCoordinates: { lat: 11.4250, lng: 76.7200 },
    status: "DISPATCHED_EN_ROUTE",
    etaMinutes: 7,
    timeReported: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  })
};
