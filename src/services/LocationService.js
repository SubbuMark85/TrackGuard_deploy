// LocationService.js
// Handles real-time simulated GPS coordinates, geofences, distance calculations, and offline map region checks.

export const OOTY_COORDINATES = {
  hotel: { lat: 11.4080, lng: 76.7000, name: "Savoy Hotel, Ooty" },
  botanicalGarden: { lat: 11.4167, lng: 76.7115, name: "Ooty Botanical Garden" },
  lake: { lat: 11.4050, lng: 76.6900, name: "Ooty Lake Boathouse" },
  doddabetta: { lat: 11.4005, lng: 76.7360, name: "Doddabetta Peak Viewpoint" },
  responderHQ: { lat: 11.4250, lng: 76.7200, name: "TrackGuard Hub - Nilgiris Sector" }
};

export const LocationService = {
  // Calculate distance between two coordinates in kilometers (Haversine formula)
  calculateDistance: (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d.toFixed(2);
  },

  // Check if traveler is within geofence radius (meters)
  checkGeofence: (travelerLat, travelerLng, centerLat, centerLng, radiusMeters = 1000) => {
    const distKm = parseFloat(LocationService.calculateDistance(travelerLat, travelerLng, centerLat, centerLng));
    const distMeters = distKm * 1000;
    if (distMeters <= radiusMeters) {
      return { status: 'SAFE', distance: Math.round(distMeters), message: 'Inside designated safe zone' };
    } else if (distMeters <= radiusMeters * 1.5) {
      return { status: 'WARNING', distance: Math.round(distMeters), message: 'Approaching geofence boundary' };
    } else {
      return { status: 'BREACHED', distance: Math.round(distMeters), message: 'Geofence perimeter breached!' };
    }
  },

  // Get route safety score
  getRouteSafetyAnalysis: (origin, destination) => {
    return {
      safetyScore: 96,
      riskLevel: "LOW",
      wellLitPercentage: 94,
      crowdDensity: "MODERATE",
      activePatrolsNearby: 3,
      recommendedMode: "Verified Safe Taxi or Walking via Garden Road",
      geofenceCoverage: "100% Active"
    };
  }
};
