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
  }
];
