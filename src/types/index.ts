import { Timestamp } from 'firebase/firestore';

export interface AppUser {
  uid: string;
  fullName: string;
  email: string;
  photoURL?: string | null;
  role: 'guardian';
  onboardingComplete: boolean;
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
  notificationPreferences: {
    pushEnabled: boolean;
    emailEnabled: boolean;
    emergencyAlerts: boolean;
    geofenceAlerts: boolean;
    deviceAlerts: boolean;
  };
  privacySettings: {
    locationSharingEnabled: boolean;
    dataRetentionDays: number;
  };
  emergencyContactsCount: number;
  accountStatus: 'active' | 'suspended' | 'pending';
  isDemoUser?: boolean;
}

export interface FamilyMember {
  id: string;
  fullName: string;
  role: 'child' | 'senior' | 'solo' | 'other';
  relationship: string;
  avatarInitials: string;
  avatarColor: string;
  emergencyNotes?: string | null;
  dateOfBirth?: string | null;
  locationSharingEnabled: boolean;
  locationConsentAt?: Timestamp | string | null;
  status: 'safe' | 'travelling' | 'attention' | 'unknown';
  currentLocation?: {
    latitude: number | null;
    longitude: number | null;
    label: string | null;
    updatedAt: Timestamp | string | null;
    accuracy?: number | null;
  };
  bandId?: string | null;
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
  archived: boolean;
  isDemoData?: boolean;
}

export interface EmergencyContact {
  id: string;
  fullName: string;
  relationship: string;
  phone: string;
  email?: string;
  isPrimary: boolean;
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
  isDemoData?: boolean;
}

export interface SafetyBand {
  id: string;
  deviceName: string;
  serialNumber: string;
  assignedMemberId?: string | null;
  connectionStatus: 'connected' | 'disconnected' | 'unknown';
  batteryLevel: number;
  signalStrength: 'strong' | 'medium' | 'weak' | 'unknown';
  firmwareVersion: string;
  lastSyncAt: Timestamp | string;
  lastKnownLocation?: {
    latitude: number | null;
    longitude: number | null;
    label: string | null;
    updatedAt: Timestamp | string | null;
  };
  isMarkedLost: boolean;
  status: 'normal' | 'low_battery' | 'tamper_alert' | 'lost';
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
  isDemoData?: boolean;
}

export interface SafetyAlert {
  id: string;
  type: 'sos' | 'geofence_exit' | 'geofence_enter' | 'band_disconnected' | 'low_battery' | 'tamper_attempt' | 'check_in' | 'system';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  message: string;
  memberId?: string | null;
  bandId?: string | null;
  tripId?: string | null;
  status: 'active' | 'acknowledged' | 'resolved';
  createdAt: Timestamp | string;
  acknowledgedAt?: Timestamp | string | null;
  acknowledgedBy?: string | null;
  resolvedAt?: Timestamp | string | null;
  resolvedBy?: string | null;
  locationSnapshot?: {
    latitude: number | null;
    longitude: number | null;
    label: string | null;
    capturedAt: Timestamp | string | null;
  };
  metadata?: Record<string, any>;
  isRead: boolean;
  isDemoData?: boolean;
}

export interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  travellerIds: string[];
  emergencyContactIds: string[];
  safeZoneIds: string[];
  notes?: string;
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
  isDemoData?: boolean;
}

export interface SafeZone {
  id: string;
  name: string;
  type: 'circle';
  latitude: number;
  longitude: number;
  radiusMeters: number;
  assignedMemberIds: string[];
  tripId?: string | null;
  active: boolean;
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
  isDemoData?: boolean;
}

export interface SOSIncident {
  id: string;
  memberId: string;
  bandId?: string | null;
  initiatedByUid: string;
  initiatedByName: string;
  initiationSource: 'guardian_app' | 'traveller_app' | 'band_test';
  status: 'active' | 'cancelled' | 'resolved';
  startedAt: Timestamp | string;
  endedAt?: Timestamp | string | null;
  locationSnapshot?: {
    latitude: number | null;
    longitude: number | null;
    label: string | null;
  };
  notes?: string;
  relatedAlertId?: string;
  isTest: boolean;
  isDemoData?: boolean;
}

export interface ActivityLog {
  id: string;
  type: string;
  description: string;
  memberId?: string | null;
  bandId?: string | null;
  alertId?: string | null;
  actorUid: string;
  createdAt: Timestamp | string;
  metadata?: Record<string, any>;
  isDemoData?: boolean;
}
