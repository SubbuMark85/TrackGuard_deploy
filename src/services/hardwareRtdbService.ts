import { ref, onValue, set, push, update, off } from 'firebase/database';
import { rtdb } from '../lib/firebase';

export interface HardwareLocation {
  lat: number;
  lng: number;
  speed: number;
  satellites: number;
  battery: number;
  timestamp: string | number;
  address?: string;
}

export interface HardwareBandStatus {
  id: string;
  deviceName: string;
  status: 'normal' | 'tamper_alert' | 'sos_active' | 'low_battery';
  lockStatus: 'LOCKED' | 'UNLOCK_REQUESTED' | 'UNLOCKED';
  batteryLevel: number;
  rgbLedMode: 'NORMAL_GREEN' | 'SOS_RED' | 'TAMPER_ORANGE' | 'CHARGING_BLUE';
  buzzerActive: boolean;
  vibrationActive: boolean;
  lastSync: string | number;
}

export interface HardwareAlert {
  id?: string;
  type: 'sos_push_button' | 'tamper_disconnect' | 'low_battery' | 'geofence_breach';
  severity: 'critical' | 'high' | 'medium' | 'info';
  title: string;
  message: string;
  lat: number;
  lng: number;
  timestamp: string | number;
  status: 'active' | 'resolved';
}

export const hardwareRtdbService = {
  // Listen to live GPS location stream from ESP32-C3
  subscribeLocation: (callback: (location: HardwareLocation | null) => void) => {
    const locationRef = ref(rtdb, 'location/current');
    const unsubscribe = onValue(locationRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val());
      } else {
        callback(null);
      }
    }, (error) => {
      console.warn('[RTDB] Location subscription error:', error);
    });

    return () => off(locationRef, 'value', unsubscribe);
  },

  // Listen to live Band hardware status from ESP32-C3
  subscribeBandStatus: (bandId: string = 'TG-BAND-01', callback: (status: HardwareBandStatus | null) => void) => {
    const bandRef = ref(rtdb, `bands/${bandId}`);
    const unsubscribe = onValue(bandRef, (snapshot) => {
      if (snapshot.exists()) {
        callback({ id: bandId, ...snapshot.val() });
      } else {
        callback(null);
      }
    }, (error) => {
      console.warn('[RTDB] Band status subscription error:', error);
    });

    return () => off(bandRef, 'value', unsubscribe);
  },

  // Listen to alerts stream
  subscribeAlerts: (callback: (alerts: HardwareAlert[]) => void) => {
    const alertsRef = ref(rtdb, 'alerts');
    const unsubscribe = onValue(alertsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const alertList: HardwareAlert[] = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        callback(alertList.reverse());
      } else {
        callback([]);
      }
    }, (error) => {
      console.warn('[RTDB] Alerts subscription error:', error);
    });

    return () => off(alertsRef, 'value', unsubscribe);
  },

  // Update ESP32 hardware telemetry from web app or simulator
  updateHardwareTelemetry: async (bandId: string = 'TG-BAND-01', telemetry: Partial<HardwareLocation & HardwareBandStatus>) => {
    const now = new Date().toISOString();
    
    // Update location node
    if (telemetry.lat !== undefined && telemetry.lng !== undefined) {
      const locationRef = ref(rtdb, 'location/current');
      await set(locationRef, {
        lat: telemetry.lat,
        lng: telemetry.lng,
        speed: telemetry.speed ?? 0,
        satellites: telemetry.satellites ?? 12,
        battery: telemetry.batteryLevel ?? telemetry.battery ?? 84,
        timestamp: now
      });
    }

    // Update band node
    const bandRef = ref(rtdb, `bands/${bandId}`);
    await update(bandRef, {
      ...(telemetry.status && { status: telemetry.status }),
      ...(telemetry.lockStatus && { lockStatus: telemetry.lockStatus }),
      ...(telemetry.batteryLevel !== undefined && { batteryLevel: telemetry.batteryLevel }),
      ...(telemetry.rgbLedMode && { rgbLedMode: telemetry.rgbLedMode }),
      ...(telemetry.buzzerActive !== undefined && { buzzerActive: telemetry.buzzerActive }),
      ...(telemetry.vibrationActive !== undefined && { vibrationActive: telemetry.vibrationActive }),
      lastSync: now
    });
  },

  // Publish a new emergency alert to Firebase RTDB
  publishAlert: async (alert: HardwareAlert) => {
    const alertsRef = ref(rtdb, 'alerts');
    const newAlertRef = push(alertsRef);
    await set(newAlertRef, {
      ...alert,
      timestamp: new Date().toISOString()
    });
  },

  // Send hardware control command from web app to ESP32-C3
  sendHardwareCommand: async (bandId: string = 'TG-BAND-01', command: {
    type: 'BUZZER' | 'VIBRATION' | 'SET_RGB' | 'UNLOCK_STRAP';
    payload?: any;
  }) => {
    const cmdRef = ref(rtdb, `bands/${bandId}/commands`);
    await set(cmdRef, {
      ...command,
      executed: false,
      timestamp: new Date().toISOString()
    });

    // Also update immediate status for responsive UI feedback
    const bandRef = ref(rtdb, `bands/${bandId}`);
    if (command.type === 'BUZZER') {
      await update(bandRef, { buzzerActive: command.payload?.active ?? true });
    } else if (command.type === 'VIBRATION') {
      await update(bandRef, { vibrationActive: command.payload?.active ?? true });
    } else if (command.type === 'SET_RGB') {
      await update(bandRef, { rgbLedMode: command.payload?.mode ?? 'NORMAL_GREEN' });
    } else if (command.type === 'UNLOCK_STRAP') {
      await update(bandRef, { lockStatus: 'UNLOCKED', rgbLedMode: 'CHARGING_BLUE' });
    }
  }
};
