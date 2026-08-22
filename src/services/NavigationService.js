// NavigationService.js
// Manages safe turn-by-turn navigation data and offline map caching status.

export const NavigationService = {
  getRouteDetails: () => ({
    origin: "Hotel Savoy, Ooty",
    destination: "Ooty Botanical Garden",
    distanceKm: "4.8 km",
    durationMin: 14,
    safetyScore: 98,
    isSafeRoute: true,
    steps: [
      { instruction: "Head east on Church Hill Road toward Commercial Rd", distance: "400 m", safe: true },
      { instruction: "Turn right onto Commercial Rd (Well-lit main avenue)", distance: "1.8 km", safe: true },
      { instruction: "Continue straight onto Garden Road past Police Beat #2", distance: "2.1 km", safe: true },
      { instruction: "Arrive at Ooty Botanical Garden North Gate", distance: "500 m", safe: true }
    ],
    offlinePacks: [
      { id: "nilgiris", region: "Ooty & Nilgiris District Map", size: "48 MB", downloaded: true, lastUpdated: "Today 08:30 AM" },
      { id: "coimbatore", region: "Coimbatore Transit Hub & Highways", size: "62 MB", downloaded: false, lastUpdated: "Available" }
    ]
  })
};
