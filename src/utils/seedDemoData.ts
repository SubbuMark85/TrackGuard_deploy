import { familyService } from '../services/familyService';
import { bandService } from '../services/bandService';
import { tripService } from '../services/tripService';
import { safeZoneService } from '../services/safeZoneService';
import { alertService } from '../services/alertService';
import { activityService } from '../services/activityService';
import { contactService } from '../services/contactService';
import { getDocs, collection, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';

export async function seedDemoData(userId: string, guardianName: string): Promise<void> {
  // 1. Add sample emergency contact
  const contactId = await contactService.addContact(userId, {
    fullName: 'Sarah Johnson',
    relationship: 'Spouse / Guardian',
    phone: '+1 (555) 234-5678',
    email: 'sarah.j@example.com',
    isPrimary: true,
    isDemoData: true,
  });

  // 2. Add sample family members
  const member1Id = await familyService.addFamilyMember(userId, {
    fullName: 'Leo Johnson',
    role: 'child',
    relationship: 'Son',
    avatarInitials: 'LJ',
    avatarColor: '#4FACFE',
    emergencyNotes: 'Allergic to peanuts. Wears TrackGuard Band Alpha.',
    dateOfBirth: '2016-04-12',
    locationSharingEnabled: true,
    locationConsentAt: new Date().toISOString(),
    status: 'safe',
    currentLocation: {
      latitude: 37.7749,
      longitude: -122.4194,
      label: 'Oak Elementary School',
      updatedAt: new Date().toISOString(),
      accuracy: 12,
    },
    isDemoData: true,
  });

  const member2Id = await familyService.addFamilyMember(userId, {
    fullName: 'Eleanor Johnson',
    role: 'senior',
    relationship: 'Mother',
    avatarInitials: 'EJ',
    avatarColor: '#10B981',
    emergencyNotes: 'Requires regular hydration checks.',
    dateOfBirth: '1948-09-25',
    locationSharingEnabled: true,
    locationConsentAt: new Date().toISOString(),
    status: 'safe',
    currentLocation: {
      latitude: 37.7833,
      longitude: -122.4167,
      label: 'Community Center',
      updatedAt: new Date().toISOString(),
      accuracy: 15,
    },
    isDemoData: true,
  });

  // 3. Add sample safety band
  const bandId = await bandService.addBand(userId, {
    deviceName: 'TrackGuard Band Alpha',
    serialNumber: 'TG-8849-B2',
    assignedMemberId: member1Id,
    connectionStatus: 'connected',
    batteryLevel: 88,
    signalStrength: 'strong',
    firmwareVersion: 'v2.4.1',
    lastSyncAt: new Date().toISOString(),
    lastKnownLocation: {
      latitude: 37.7749,
      longitude: -122.4194,
      label: 'Oak Elementary School',
      updatedAt: new Date().toISOString(),
    },
    isMarkedLost: false,
    status: 'normal',
    isDemoData: true,
  });

  // Assign band ID to member 1
  await familyService.updateFamilyMember(userId, member1Id, { bandId });

  // 4. Add sample safe zone
  const safeZoneId = await safeZoneService.addSafeZone(userId, {
    name: 'Home & School Safe Zone',
    type: 'circle',
    latitude: 37.7749,
    longitude: -122.4194,
    radiusMeters: 500,
    assignedMemberIds: [member1Id, member2Id],
    active: true,
    isDemoData: true,
  });

  // 5. Add sample trip
  const today = new Date();
  const nextWeek = new Date(today.valueOf() + 7 * 24 * 60 * 60 * 1000);
  await tripService.addTrip(userId, {
    name: 'Weekend Nature Camp',
    destination: 'Yosemite National Park',
    startDate: today.toISOString().split('T')[0],
    endDate: nextWeek.toISOString().split('T')[0],
    status: 'upcoming',
    travellerIds: [member1Id],
    emergencyContactIds: [contactId],
    safeZoneIds: [safeZoneId],
    notes: 'Guided group trip with TrackGuard active monitoring enabled.',
    isDemoData: true,
  });

  // 6. Add non-critical sample alerts
  await alertService.addAlert(userId, {
    type: 'geofence_enter',
    severity: 'low',
    title: 'Entered Safe Zone',
    message: 'Leo Johnson entered Home & School Safe Zone.',
    memberId: member1Id,
    bandId: bandId,
    status: 'resolved',
    resolvedAt: new Date().toISOString(),
    resolvedBy: guardianName,
    metadata: { safeZoneId },
    isDemoData: true,
  });

  await alertService.addAlert(userId, {
    type: 'check_in',
    severity: 'low',
    title: 'Routine Safety Check-in',
    message: 'Eleanor Johnson completed routine status check-in.',
    memberId: member2Id,
    status: 'resolved',
    resolvedAt: new Date().toISOString(),
    resolvedBy: guardianName,
    isDemoData: true,
  });

  // 7. Add sample activity logs
  await activityService.logActivity(userId, {
    type: 'demo_seeded',
    description: 'Pilot demo sample data loaded successfully.',
    actorUid: userId,
    isDemoData: true,
  });

  await activityService.logActivity(userId, {
    type: 'band_assigned',
    description: 'TrackGuard Band Alpha assigned to Leo Johnson.',
    memberId: member1Id,
    bandId: bandId,
    actorUid: userId,
    isDemoData: true,
  });
}

export async function clearDemoData(userId: string): Promise<number> {
  const collections = ['familyMembers', 'emergencyContacts', 'bands', 'alerts', 'trips', 'safeZones', 'sosIncidents', 'activityLogs'];
  let deletedCount = 0;

  for (const colName of collections) {
    const colRef = collection(db, 'users', userId, colName);
    const q = query(colRef, where('isDemoData', '==', true));
    const snap = await getDocs(q);
    for (const d of snap.docs) {
      await deleteDoc(doc(db, 'users', userId, colName, d.id));
      deletedCount++;
    }
  }

  return deletedCount;
}
