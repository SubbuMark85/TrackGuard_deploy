// AIService.js
// Powers AI Travel Companion chat, safety assessments, and intelligent trip recommendations.

export const SAMPLE_ITINERARIES = [
  {
    id: "ooty-2day",
    title: "Ooty Safe Family Explorer (2 Days)",
    duration: "2 Days · 4 Stops",
    safetyScore: 98,
    safetyBadge: "VERIFIED SAFE ROUTE",
    distance: "12.4 km total",
    recommendedTransport: "TrackGuard Verified Cab / Walking",
    stops: [
      { name: "Savoy Heritage Resort", time: "Day 1 - 09:00 AM", safety: "Safe Base Zone" },
      { name: "Ooty Botanical Gardens", time: "Day 1 - 11:30 AM", safety: "High Security & Geofenced" },
      { name: "Ooty Lake Boathouse", time: "Day 1 - 03:30 PM", safety: "Family Friendly & Well Lit" },
      { name: "Doddabetta Peak", time: "Day 2 - 10:00 AM", safety: "Guarded Viewpoint Corridor" }
    ]
  },
  {
    id: "nearby-safe-spots",
    title: "Verified Safe Tourist Spots Nearby",
    safetyScore: 95,
    distance: "Within 3 km of your location",
    recommendedTransport: "Walking Corridor",
    stops: [
      { name: "Rose Garden", time: "Open till 6:30 PM", safety: "Safety Score: 96/100" },
      { name: "Tea Factory & Museum", time: "Open till 6:00 PM", safety: "Safety Score: 94/100" },
      { name: "St. Stephen's Church", time: "Open till 5:00 PM", safety: "Safety Score: 98/100" }
    ]
  }
];

export const AIService = {
  getAIResponse: (userMessage) => {
    const text = userMessage.toLowerCase();

    if (text.includes("2-day trip") || text.includes("ooty") || text.includes("plan")) {
      return {
        text: "I have prepared a curated 2-Day Safe Itinerary for Ooty with verified tourist spots, continuous TrackGuard geofence coverage, and well-lit travel corridors.",
        type: "ITINERARY",
        itinerary: SAMPLE_ITINERARIES[0]
      };
    }

    if (text.includes("nearby") || text.includes("safe places") || text.includes("visit next")) {
      return {
        text: "Here are 3 verified safe family attractions within 3 km of your location with active emergency SOS posts and high crowd safety ratings:",
        type: "ITINERARY",
        itinerary: SAMPLE_ITINERARIES[1]
      };
    }

    if (text.includes("hotel") || text.includes("take me back")) {
      return {
        text: "Navigating back to Savoy Hotel (4.8 km, ~14 min). I've selected the safest route along main lighted avenues with 3 active emergency responder posts en route.",
        type: "NAVIGATION_ACTION",
        destination: "Savoy Hotel, Ooty",
        distance: "4.8 km",
        time: "14 min"
      };
    }

    if (text.includes("area safe") || text.includes("safety rating") || text.includes("is this area safe")) {
      return {
        text: "🛡️ Safety Assessment for Ooty Botanical Garden Sector:\n\n• Safety Rating: 96/100 (EXCELLENT)\n• Emergency Posts: 2 within 400m\n• Lighting & Visibility: High\n• Cellular Strength: 5G Encrypted\n• Geofence Status: ACTIVE",
        type: "TEXT"
      };
    }

    return {
      text: `TrackGuard AI Companion active! I'm monitoring Ananya's safety in real-time. How can I assist your travel plans or safety setup?`,
      type: "TEXT"
    };
  }
};
