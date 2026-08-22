import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Users, 
  Plus, 
  MapPin, 
  Radio, 
  Archive, 
  Edit3, 
  CheckCircle, 
  X, 
  ShieldCheck,
  Compass
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { familyService } from '../services/familyService';
import { bandService } from '../services/bandService';
import { activityService } from '../services/activityService';
import { FamilyMember, SafetyBand } from '../types';
import { LocationConsentModal } from '../components/common/LocationConsentModal';
import { PilotBanner } from '../components/common/PilotBanner';

const memberSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  role: z.enum(['child', 'senior', 'solo', 'other']),
  relationship: z.string().min(2, 'Relationship is required'),
  emergencyNotes: z.string().optional(),
  dateOfBirth: z.string().optional(),
  bandId: z.string().optional(),
});

type MemberFormData = z.infer<typeof memberSchema>;

export const FamilyMembersPage: React.FC = () => {
  const { firebaseUser, appUserProfile } = useAuth();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [bands, setBands] = useState<SafetyBand[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);

  // Consent modal state
  const [consentModalMember, setConsentModalMember] = useState<FamilyMember | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    defaultValues: { role: 'child' },
  });

  useEffect(() => {
    if (!firebaseUser) return;
    const unsubMembers = familyService.subscribeFamilyMembers(firebaseUser.uid, setMembers);
    const unsubBands = bandService.subscribeBands(firebaseUser.uid, setBands);
    return () => {
      unsubMembers();
      unsubBands();
    };
  }, [firebaseUser]);

  const openAddModal = () => {
    setEditingMember(null);
    reset({ role: 'child', fullName: '', relationship: '', emergencyNotes: '', dateOfBirth: '', bandId: '' });
    setIsAddModalOpen(true);
  };

  const openEditModal = (member: FamilyMember) => {
    setEditingMember(member);
    setValue('fullName', member.fullName);
    setValue('role', member.role);
    setValue('relationship', member.relationship);
    setValue('emergencyNotes', member.emergencyNotes || '');
    setValue('dateOfBirth', member.dateOfBirth || '');
    setValue('bandId', member.bandId || '');
    setIsAddModalOpen(true);
  };

  const onSubmitMember = async (data: MemberFormData) => {
    if (!firebaseUser) return;

    try {
      const initials = data.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'FM';

      const actorName = appUserProfile?.fullName || 'Guardian';

      if (editingMember) {
        // Edit
        await familyService.updateFamilyMember(firebaseUser.uid, editingMember.id, {
          fullName: data.fullName,
          role: data.role,
          relationship: data.relationship,
          emergencyNotes: data.emergencyNotes || null,
          dateOfBirth: data.dateOfBirth || null,
          bandId: data.bandId || null,
        });

        // Update band assignment link
        if (data.bandId) {
          await bandService.updateBand(firebaseUser.uid, data.bandId, { assignedMemberId: editingMember.id });
        }

        await activityService.logActivity(firebaseUser.uid, {
          type: 'member_updated',
          description: `${actorName} updated safety profile for ${data.fullName}.`,
          memberId: editingMember.id,
          actorUid: firebaseUser.uid,
        });
      } else {
        // Add
        const newMemberId = await familyService.addFamilyMember(firebaseUser.uid, {
          fullName: data.fullName,
          role: data.role,
          relationship: data.relationship,
          avatarInitials: initials,
          avatarColor: data.role === 'child' ? '#4FACFE' : data.role === 'senior' ? '#10B981' : '#F59E0B',
          emergencyNotes: data.emergencyNotes || null,
          dateOfBirth: data.dateOfBirth || null,
          locationSharingEnabled: false,
          locationConsentAt: null,
          status: 'safe',
          currentLocation: {
            latitude: null,
            longitude: null,
            label: 'Location sharing disabled',
            updatedAt: null,
          },
          bandId: data.bandId || null,
        });

        if (data.bandId) {
          await bandService.updateBand(firebaseUser.uid, data.bandId, { assignedMemberId: newMemberId });
        }

        await activityService.logActivity(firebaseUser.uid, {
          type: 'member_added',
          description: `${actorName} added family member ${data.fullName}.`,
          memberId: newMemberId,
          actorUid: firebaseUser.uid,
        });
      }

      setIsAddModalOpen(false);
    } catch (err) {
      console.error('Error saving family member:', err);
    }
  };

  const handleArchive = async (member: FamilyMember) => {
    if (!firebaseUser) return;
    if (window.confirm(`Archive ${member.fullName}'s safety profile?`)) {
      await familyService.archiveFamilyMember(firebaseUser.uid, member.id);
      await activityService.logActivity(firebaseUser.uid, {
        type: 'member_archived',
        description: `Archived profile for ${member.fullName}.`,
        memberId: member.id,
        actorUid: firebaseUser.uid,
      });
    }
  };

  const handleConsentConfirm = async (oneTimeLoc?: { latitude: number; longitude: number; accuracy: number; label: string }) => {
    if (!firebaseUser || !consentModalMember) return;

    const updates: Partial<FamilyMember> = {
      locationSharingEnabled: true,
      locationConsentAt: new Date().toISOString(),
    };

    if (oneTimeLoc) {
      updates.currentLocation = {
        latitude: oneTimeLoc.latitude,
        longitude: oneTimeLoc.longitude,
        accuracy: oneTimeLoc.accuracy,
        label: oneTimeLoc.label,
        updatedAt: new Date().toISOString(),
      };
    }

    await familyService.updateFamilyMember(firebaseUser.uid, consentModalMember.id, updates);
    await activityService.logActivity(firebaseUser.uid, {
      type: 'location_consent_granted',
      description: `Location sharing enabled for ${consentModalMember.fullName}.`,
      memberId: consentModalMember.id,
      actorUid: firebaseUser.uid,
    });
  };

  const handleRemoveLocation = async () => {
    if (!firebaseUser || !consentModalMember) return;
    await familyService.updateFamilyMember(firebaseUser.uid, consentModalMember.id, {
      locationSharingEnabled: false,
      locationConsentAt: null,
      currentLocation: {
        latitude: null,
        longitude: null,
        label: 'Location data removed',
        updatedAt: null,
      },
    });
    await activityService.logActivity(firebaseUser.uid, {
      type: 'location_data_removed',
      description: `Location sharing disabled and data cleared for ${consentModalMember.fullName}.`,
      memberId: consentModalMember.id,
      actorUid: firebaseUser.uid,
    });
  };

  return (
    <div className="min-h-screen bg-[#0A0F1D] text-white flex flex-col justify-between pb-20 md:pb-6">
      <div className="space-y-6">
        <PilotBanner />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-teal-400" /> Monitored Family Members
            </h1>
            <p className="text-xs text-slate-400">Manage safety profiles, location consent, and band assignments</p>
          </div>

          <button
            onClick={openAddModal}
            className="px-4 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-teal-500/20 flex items-center gap-1.5 hover:opacity-95 transition"
          >
            <Plus className="w-4 h-4" /> Add Family Member
          </button>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {members.length === 0 ? (
            <div className="bg-[#0D1527] border border-dashed border-slate-800 rounded-3xl p-12 text-center space-y-4">
              <Users className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="text-slate-400 text-sm">No active family member profiles registered.</p>
              <button
                onClick={openAddModal}
                className="px-5 py-2.5 bg-teal-500 text-slate-950 font-bold text-xs rounded-xl shadow"
              >
                Add First Traveller Profile
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map((member) => {
                const assignedBand = bands.find((b) => b.id === member.bandId);
                return (
                  <div
                    key={member.id}
                    className="bg-[#0D1527] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-slate-950 text-base shadow-md"
                            style={{ backgroundColor: member.avatarColor || '#4FACFE' }}
                          >
                            {member.avatarInitials}
                          </div>
                          <div>
                            <h3 className="font-bold text-base text-white">{member.fullName}</h3>
                            <p className="text-xs text-slate-400">
                              {member.relationship} •{' '}
                              <span className="uppercase text-cyan-400 font-medium">{member.role}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(member)}
                            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                            title="Edit Profile"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleArchive(member)}
                            className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800"
                            title="Archive Member"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Details Box */}
                      <div className="bg-[#162036] p-3 rounded-xl space-y-2 text-xs text-slate-300">
                        {member.emergencyNotes && (
                          <div>
                            <span className="text-slate-500 text-[10px] uppercase font-semibold">Medical / Safety Notes:</span>
                            <p className="text-slate-200">{member.emergencyNotes}</p>
                          </div>
                        )}

                        <div className="flex items-center justify-between border-t border-slate-700/50 pt-2 text-[11px]">
                          <span className="text-slate-400 flex items-center gap-1">
                            <Radio className="w-3.5 h-3.5 text-teal-400" />
                            {assignedBand ? assignedBand.deviceName : 'No Band Linked'}
                          </span>
                          <span className="text-slate-400 font-mono">
                            DOB: {member.dateOfBirth || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Location Consent Bar */}
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <MapPin className={`w-4 h-4 ${member.locationSharingEnabled ? 'text-emerald-400' : 'text-slate-500'}`} />
                        <span className="text-xs text-slate-300">
                          {member.locationSharingEnabled ? 'Location Consent Active' : 'Location Off'}
                        </span>
                      </div>

                      <button
                        onClick={() => setConsentModalMember(member)}
                        className="px-3 py-1.5 text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg border border-slate-700 transition"
                      >
                        {member.locationSharingEnabled ? 'Configure Consent' : 'Enable Location'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Member Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#0D1527] border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-white">
                {editingMember ? 'Edit Family Member' : 'Add Family Member'}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmitMember)} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  {...register('fullName')}
                  placeholder="Leo Johnson"
                  className="w-full bg-[#162036] border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                />
                {errors.fullName && <p className="text-[11px] text-red-400 mt-1">{errors.fullName.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Role Type</label>
                  <select
                    {...register('role')}
                    className="w-full bg-[#162036] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="child">Child</option>
                    <option value="senior">Senior</option>
                    <option value="solo">Solo</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Relationship</label>
                  <input
                    type="text"
                    {...register('relationship')}
                    placeholder="Son / Parent"
                    className="w-full bg-[#162036] border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                  {errors.relationship && <p className="text-[11px] text-red-400 mt-1">{errors.relationship.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Medical / Safety Notes</label>
                <input
                  type="text"
                  {...register('emergencyNotes')}
                  placeholder="Allergies, medical conditions..."
                  className="w-full bg-[#162036] border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Assign Safety Band</label>
                <select
                  {...register('bandId')}
                  className="w-full bg-[#162036] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="">No band assigned</option>
                  {bands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.deviceName} ({b.serialNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-xs rounded-xl shadow"
                >
                  {editingMember ? 'Save Profile Updates' : 'Add Family Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Location Privacy Consent Modal */}
      {consentModalMember && (
        <LocationConsentModal
          isOpen={!!consentModalMember}
          onClose={() => setConsentModalMember(null)}
          memberName={consentModalMember.fullName}
          currentlyEnabled={consentModalMember.locationSharingEnabled}
          onConfirmEnableSharing={handleConsentConfirm}
          onRemoveLocation={handleRemoveLocation}
        />
      )}
    </div>
  );
};
