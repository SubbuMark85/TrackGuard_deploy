import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Compass, 
  Plus, 
  Calendar, 
  MapPin, 
  Users, 
  Trash2, 
  Edit3, 
  X, 
  ShieldCheck, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  Navigation,
  FileText,
  AlertTriangle,
  PhoneCall
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { tripService } from '../services/tripService';
import { familyService } from '../services/familyService';
import { contactService } from '../services/contactService';
import { safeZoneService } from '../services/safeZoneService';
import { activityService } from '../services/activityService';
import { Trip, FamilyMember, EmergencyContact, SafeZone } from '../types';
import { PilotBanner } from '../components/common/PilotBanner';

const tripSchema = z.object({
  name: z.string().min(2, 'Trip name is required'),
  destination: z.string().min(2, 'Destination is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  status: z.enum(['upcoming', 'active', 'completed', 'cancelled']),
  travellerIds: z.array(z.string()).min(1, 'Select at least one traveller'),
  notes: z.string().optional(),
}).refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
  message: 'End date cannot be earlier than start date',
  path: ['endDate'],
});

type TripFormData = z.infer<typeof tripSchema>;

type FilterTab = 'all' | 'active' | 'upcoming' | 'completed';

export const TripsPage: React.FC = () => {
  const { firebaseUser, appUserProfile } = useAuth();
  const { traveler, userRole, setUserRole } = useApp();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [safeZones, setSafeZones] = useState<SafeZone[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TripFormData>({
    resolver: zodResolver(tripSchema),
    defaultValues: { status: 'upcoming', travellerIds: [] },
  });

  useEffect(() => {
    if (!firebaseUser) return;
    const unsubTrips = tripService.subscribeTrips(firebaseUser.uid, setTrips);
    const unsubMembers = familyService.subscribeFamilyMembers(firebaseUser.uid, setFamilyMembers);
    const unsubContacts = contactService.subscribeContacts(firebaseUser.uid, setContacts);
    const unsubZones = safeZoneService.subscribeSafeZones(firebaseUser.uid, setSafeZones);
    return () => {
      unsubTrips();
      unsubMembers();
      unsubContacts();
      unsubZones();
    };
  }, [firebaseUser]);

  const openAddModal = () => {
    setEditingTrip(null);
    reset({ name: '', destination: '', startDate: '', endDate: '', status: 'upcoming', travellerIds: [], notes: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (trip: Trip) => {
    setEditingTrip(trip);
    reset({
      name: trip.name,
      destination: trip.destination,
      startDate: trip.startDate,
      endDate: trip.endDate,
      status: trip.status,
      travellerIds: trip.travellerIds || [],
      notes: trip.notes || '',
    });
    setIsModalOpen(true);
  };

  const onSubmitTrip = async (data: TripFormData) => {
    if (!firebaseUser) return;

    try {
      const actorName = appUserProfile?.fullName || 'Guardian';

      if (editingTrip) {
        await tripService.updateTrip(firebaseUser.uid, editingTrip.id, {
          name: data.name,
          destination: data.destination,
          startDate: data.startDate,
          endDate: data.endDate,
          status: data.status,
          travellerIds: data.travellerIds,
          notes: data.notes || '',
        });
        await activityService.logActivity(firebaseUser.uid, {
          type: 'trip_updated',
          description: `${actorName} updated trip details for "${data.name}".`,
          actorUid: firebaseUser.uid,
        });
      } else {
        await tripService.addTrip(firebaseUser.uid, {
          name: data.name,
          destination: data.destination,
          startDate: data.startDate,
          endDate: data.endDate,
          status: data.status,
          travellerIds: data.travellerIds,
          emergencyContactIds: contacts.map((c) => c.id),
          safeZoneIds: safeZones.map((z) => z.id),
          notes: data.notes || '',
        });
        await activityService.logActivity(firebaseUser.uid, {
          type: 'trip_created',
          description: `${actorName} created trip "${data.name}" to ${data.destination}.`,
          actorUid: firebaseUser.uid,
        });
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving trip:', err);
    }
  };

  const handleDeleteTrip = async (trip: Trip) => {
    if (!firebaseUser) return;
    if (window.confirm(`Delete trip record for "${trip.name}"?`)) {
      await tripService.deleteTrip(firebaseUser.uid, trip.id);
      await activityService.logActivity(firebaseUser.uid, {
        type: 'trip_deleted',
        description: `Deleted trip ${trip.name}.`,
        actorUid: firebaseUser.uid,
      });
    }
  };

  // Metrics
  const activeTripsCount = trips.filter((t) => t.status === 'active').length;
  const upcomingTripsCount = trips.filter((t) => t.status === 'upcoming').length;
  const completedTripsCount = trips.filter((t) => t.status === 'completed').length;

  // Filtered trips
  const filteredTrips = trips.filter((t) => {
    if (activeTab === 'active') return t.status === 'active';
    if (activeTab === 'upcoming') return t.status === 'upcoming';
    if (activeTab === 'completed') return t.status === 'completed';
    return true;
  });

  return (
    <div className="p-4 space-y-4 max-w-xl mx-auto w-full">

      {/* Pilot Warning Banner (Dashed border card) */}
      <div className="border border-dashed border-amber-500/40 bg-amber-950/20 rounded-xl p-3 flex items-center gap-2.5 text-xs text-amber-300/90 shadow-sm">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
        <span className="leading-snug">
          Pilot platform. Alerts on this screen are simulated for guardians, not real dispatches.
        </span>
      </div>

      {/* Section Title & Subtitle */}
      <div className="space-y-0.5 pt-1">
        <h2 className="text-2xl font-black text-white tracking-tight">Travel plans</h2>
        <p className="text-xs text-slate-400">Set a safety window for every trip.</p>
      </div>

      {/* Full-width + New trip Button */}
      <button
        onClick={openAddModal}
        className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-sm rounded-2xl shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 transition active:scale-[0.98]"
      >
        <Plus className="w-4 h-4 stroke-[3]" /> New trip
      </button>

      {/* 3 Stat Cards Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#0D1527]/90 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-lg">
          <div className="text-2xl font-black text-teal-400">{activeTripsCount}</div>
          <div className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase mt-1">ACTIVE</div>
        </div>

        <div className="bg-[#0D1527]/90 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-lg">
          <div className="text-2xl font-black text-amber-400">{upcomingTripsCount}</div>
          <div className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase mt-1">UPCOMING</div>
        </div>

        <div className="bg-[#0D1527]/90 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-lg">
          <div className="text-2xl font-black text-cyan-400">{completedTripsCount}</div>
          <div className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase mt-1">DONE</div>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="border-b border-slate-800 pb-2">
        <div className="flex items-center gap-6 text-sm overflow-x-auto scrollbar-none">
          {(
            [
              { id: 'all', label: 'All trips' },
              { id: 'active', label: 'Active' },
              { id: 'upcoming', label: 'Upcoming' },
              { id: 'completed', label: 'Done' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-2 font-semibold text-xs sm:text-sm whitespace-nowrap transition relative ${
                activeTab === tab.id
                  ? 'text-teal-300 font-bold after:absolute after:-bottom-[9px] after:left-0 after:right-0 after:h-0.5 after:bg-teal-400 after:rounded-full'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Trips List / Empty State */}
      {filteredTrips.length === 0 ? (
        <div className="py-6 flex flex-col items-center justify-center text-center space-y-4">
          {/* Curved Dashed Route Path SVG Graphic */}
          <div className="py-2">
            <svg className="w-56 h-16" viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M 20 45 C 70 10, 130 60, 180 15"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeDasharray="6 6"
                className="text-teal-500/60"
              />
              <circle cx="20" cy="45" r="4" className="fill-teal-400" />
              <circle cx="180" cy="15" r="4" className="fill-amber-400" />
            </svg>
          </div>

          <div className="space-y-1 max-w-xs mx-auto">
            <h3 className="font-extrabold text-lg text-white">No trips mapped yet</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Add a traveller and a safety window, and we'll watch the route with you.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition active:scale-95"
          >
            Create first trip
          </button>

          {/* Bottom 3 Feature Cards */}
          <div className="grid grid-cols-3 gap-3 w-full pt-4">
            <div className="bg-[#0D1527]/90 border border-slate-800/90 rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-2 shadow-md">
              <MapPin className="w-5 h-5 text-teal-400 shrink-0" />
              <span className="text-xs font-semibold text-slate-300 leading-tight">Safe zones</span>
            </div>

            <div className="bg-[#0D1527]/90 border border-slate-800/90 rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-2 shadow-md">
              <Navigation className="w-5 h-5 text-teal-400 shrink-0" />
              <span className="text-xs font-semibold text-slate-300 leading-tight">Live tracking</span>
            </div>

            <div className="bg-[#0D1527]/90 border border-slate-800/90 rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-2 shadow-md">
              <PhoneCall className="w-5 h-5 text-amber-400 shrink-0" />
              <span className="text-xs font-semibold text-slate-300 leading-tight">Emergency dispatch</span>
            </div>
          </div>
        </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredTrips.map((trip) => {
                const assignedTravellers = familyMembers.filter((m) =>
                  trip.travellerIds.includes(m.id)
                );

                const getStatusBadge = (status: Trip['status']) => {
                  switch (status) {
                    case 'active':
                      return (
                        <span className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          ACTIVE
                        </span>
                      );
                    case 'upcoming':
                      return (
                        <span className="bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                          UPCOMING
                        </span>
                      );
                    case 'completed':
                      return (
                        <span className="bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                          COMPLETED
                        </span>
                      );
                    case 'cancelled':
                      return (
                        <span className="bg-rose-500/15 text-rose-300 border border-rose-500/30 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                          CANCELLED
                        </span>
                      );
                  }
                };

                return (
                  <div
                    key={trip.id}
                    className="bg-[#0D1527] border border-slate-800 hover:border-cyan-500/30 rounded-2xl p-4 sm:p-5 space-y-3 shadow-xl transition-all flex flex-col justify-between group"
                  >
                    <div className="space-y-3">
                      {/* Top Header Card Row */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {getStatusBadge(trip.status)}
                          </div>
                          <h3 className="font-extrabold text-base text-white group-hover:text-cyan-300 transition">
                            {trip.name}
                          </h3>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => openEditModal(trip)}
                            className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded-lg transition"
                            title="Edit Trip"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTrip(trip)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                            title="Delete Trip"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Location & Date Details */}
                      <div className="bg-[#162036]/80 border border-slate-800/80 rounded-xl p-3 space-y-2 text-xs">
                        <div className="flex items-center gap-2 text-cyan-300 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span className="truncate">{trip.destination}</span>
                        </div>

                        <div className="flex items-center gap-2 text-slate-300 pt-1.5 border-t border-slate-700/50">
                          <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="font-mono text-[11px]">
                            {trip.startDate} — {trip.endDate}
                          </span>
                        </div>

                        {trip.notes && (
                          <div className="flex items-start gap-1.5 text-slate-400 text-[11px] pt-1.5 border-t border-slate-700/50">
                            <FileText className="w-3 h-3 text-slate-500 shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{trip.notes}</span>
                          </div>
                        )}
                      </div>

                      {/* Assigned Travellers */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3 text-cyan-400" /> Assigned Travellers
                          </span>
                          <span className="text-slate-500">{assignedTravellers.length} members</span>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {assignedTravellers.length > 0 ? (
                            assignedTravellers.map((m) => (
                              <div
                                key={m.id}
                                className="flex items-center gap-1.5 bg-[#162036] border border-slate-700/60 px-2 py-1 rounded-lg text-[11px]"
                              >
                                <span
                                  className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-slate-950"
                                  style={{ backgroundColor: m.avatarColor || '#5BC0BE' }}
                                >
                                  {m.avatarInitials || m.fullName[0]}
                                </span>
                                <span className="text-slate-200 font-medium">{m.fullName}</span>
                                <span className="text-slate-400 text-[9px]">({m.relationship})</span>
                              </div>
                            ))
                          ) : (
                            <span className="text-slate-500 text-[11px] italic">No travellers assigned</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        {/* Modern Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0D1527] border border-slate-800 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                  <Compass className="w-4 h-4 text-cyan-400" />
                </div>
                <h3 className="font-extrabold text-base sm:text-lg text-white">
                  {editingTrip ? 'Edit Travel Plan' : 'Create Travel Plan'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmitTrip)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Trip Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  {...register('name')}
                  placeholder="Weekend Nature Camp"
                  className="w-full bg-[#162036] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                />
                {errors.name && <p className="text-[11px] text-rose-400 mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Destination <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  {...register('destination')}
                  placeholder="Yosemite National Park"
                  className="w-full bg-[#162036] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                />
                {errors.destination && (
                  <p className="text-[11px] text-rose-400 mt-1">{errors.destination.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Start Date <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="date"
                    {...register('startDate')}
                    className="w-full bg-[#162036] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 transition"
                  />
                  {errors.startDate && (
                    <p className="text-[11px] text-rose-400 mt-1">{errors.startDate.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    End Date <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="date"
                    {...register('endDate')}
                    className="w-full bg-[#162036] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 transition"
                  />
                  {errors.endDate && (
                    <p className="text-[11px] text-rose-400 mt-1">{errors.endDate.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                <select
                  {...register('status')}
                  className="w-full bg-[#162036] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 transition"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Assigned Travellers <span className="text-rose-400">*</span>
                </label>
                <div className="space-y-2 max-h-36 overflow-y-auto bg-[#162036]/90 p-3 rounded-xl border border-slate-700">
                  {familyMembers.length > 0 ? (
                    familyMembers.map((m) => (
                      <label key={m.id} className="flex items-center gap-2.5 text-xs cursor-pointer hover:bg-slate-800/40 p-1.5 rounded-lg transition">
                        <input
                          type="checkbox"
                          value={m.id}
                          {...register('travellerIds')}
                          className="rounded bg-slate-900 border-slate-700 text-teal-400 focus:ring-teal-400 focus:ring-offset-slate-900"
                        />
                        <span
                          className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-slate-950"
                          style={{ backgroundColor: m.avatarColor || '#5BC0BE' }}
                        >
                          {m.avatarInitials || m.fullName[0]}
                        </span>
                        <span className="text-white font-medium">{m.fullName}</span>
                        <span className="text-slate-400 text-[10px]">({m.relationship})</span>
                      </label>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-2">
                      No family members found. Add family members in the Family tab first.
                    </p>
                  )}
                </div>
                {errors.travellerIds && (
                  <p className="text-[11px] text-rose-400 mt-1">{errors.travellerIds.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Notes / Emergency Instructions</label>
                <textarea
                  rows={2}
                  {...register('notes')}
                  placeholder="Hotel reservation codes, local guide contacts, specific check-in schedules..."
                  className="w-full bg-[#162036] border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                />
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-teal-400 via-cyan-500 to-blue-500 hover:from-teal-300 hover:to-blue-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition active:scale-95"
                >
                  {editingTrip ? 'Save Changes' : 'Create Travel Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripsPage;
