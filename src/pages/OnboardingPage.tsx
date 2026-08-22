import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  ShieldCheck, 
  User, 
  Phone, 
  Users, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  AlertTriangle,
  Lock,
  Heart
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { contactService } from '../services/contactService';
import { familyService } from '../services/familyService';
import { userService } from '../services/userService';

// Step 1 Schema: Consents
const step1Schema = z.object({
  consentLocation: z.literal(true, {
    errorMap: () => ({ message: 'You must consent to location-data processing to continue' }),
  }),
  consentNotifications: z.literal(true, {
    errorMap: () => ({ message: 'You must consent to emergency & device notifications' }),
  }),
});

// Step 2 Schema: Emergency Contact
const step2Schema = z.object({
  fullName: z.string().min(2, 'Contact full name is required'),
  relationship: z.string().min(2, 'Relationship is required (e.g., Spouse, Parent)'),
  phone: z.string().min(6, 'Valid phone number is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  isPrimary: z.boolean().default(true),
});

// Step 3 Schema: Family Member
const step3Schema = z.object({
  fullName: z.string().min(2, 'Traveller name is required'),
  role: z.enum(['child', 'senior', 'solo', 'other']),
  relationship: z.string().min(2, 'Relationship is required (e.g., Son, Mother)'),
  emergencyNotes: z.string().optional(),
  dateOfBirth: z.string().optional(),
  confirmAuthorized: z.literal(true, {
    errorMap: () => ({ message: 'You must confirm you are authorized to manage this profile' }),
  }),
});

export const OnboardingPage: React.FC = () => {
  const { firebaseUser, appUserProfile, updateUserProfile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);

  // Forms
  const form1 = useForm<z.infer<typeof step1Schema>>({ resolver: zodResolver(step1Schema) });
  const form2 = useForm<z.infer<typeof step2Schema>>({ 
    resolver: zodResolver(step2Schema), 
    defaultValues: { isPrimary: true } 
  });
  const form3 = useForm<z.infer<typeof step3Schema>>({ 
    resolver: zodResolver(step3Schema),
    defaultValues: { role: 'child' } 
  });

  if (!firebaseUser) return null;

  const onStep1Submit = (data: z.infer<typeof step1Schema>) => {
    setStep(2);
  };

  const onStep2Submit = async (data: z.infer<typeof step2Schema>) => {
    setSubmitting(true);
    try {
      await contactService.addContact(firebaseUser.uid, {
        fullName: data.fullName,
        relationship: data.relationship,
        phone: data.phone,
        email: data.email || undefined,
        isPrimary: data.isPrimary,
      });
      await userService.updateUserProfile(firebaseUser.uid, { emergencyContactsCount: 1 });
      setStep(3);
    } catch (err) {
      console.error('Error adding contact:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const onStep3Submit = async (data: z.infer<typeof step3Schema>) => {
    setSubmitting(true);
    try {
      const initials = data.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'TR';

      await familyService.addFamilyMember(firebaseUser.uid, {
        fullName: data.fullName,
        role: data.role,
        relationship: data.relationship,
        avatarInitials: initials,
        avatarColor: data.role === 'child' ? '#4FACFE' : data.role === 'senior' ? '#10B981' : '#F59E0B',
        emergencyNotes: data.emergencyNotes || null,
        dateOfBirth: data.dateOfBirth || null,
        locationSharingEnabled: false, // Do NOT automatically enable tracking
        locationConsentAt: null,
        status: 'safe',
        currentLocation: {
          latitude: null,
          longitude: null,
          label: 'Location not updated yet',
          updatedAt: null,
        },
      });
      setStep(4);
    } catch (err) {
      console.error('Error adding family member:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinishSetup = async () => {
    setSubmitting(true);
    try {
      await updateUserProfile({ onboardingComplete: true });
      await refreshProfile();
      navigate('/guardian');
    } catch (err) {
      console.error('Error completing onboarding:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F1D] text-white flex flex-col justify-center items-center p-4 py-8">
      <div className="w-full max-w-xl bg-[#0D1527] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold text-cyan-400 uppercase tracking-wider">
            <span>Guardian Setup — Step {step} of 4</span>
            <span>{step * 25}% Complete</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-teal-400 to-cyan-400 h-full transition-all duration-300"
              style={{ width: `${step * 25}%` }}
            ></div>
          </div>
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <form onSubmit={form1.handleSubmit(onStep1Submit)} className="space-y-5">
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-teal-400" /> Welcome, {appUserProfile?.fullName || 'Guardian'}
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                TrackGuard is currently operating as a <strong>Pilot / Demo Safety Platform</strong> designed for family safety monitoring.
              </p>
            </div>

            <div className="p-3.5 bg-amber-950/40 border border-amber-500/30 rounded-2xl text-amber-200 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                Emergency triggers send real-time alerts to registered guardian accounts only. No real 911/police dispatch is performed.
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-start gap-3 p-3 bg-[#162036] border border-slate-800 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  {...form1.register('consentLocation')}
                  className="mt-1 rounded bg-slate-800 border-slate-700 text-teal-500 focus:ring-teal-400"
                />
                <span className="text-xs text-slate-300">
                  I consent to processing safety & location data under TrackGuard's{' '}
                  <Link to="/privacy" className="text-cyan-400 hover:underline">Privacy Policy</Link>.
                </span>
              </label>
              {form1.formState.errors.consentLocation && (
                <p className="text-[11px] text-red-400">{form1.formState.errors.consentLocation.message}</p>
              )}

              <label className="flex items-start gap-3 p-3 bg-[#162036] border border-slate-800 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  {...form1.register('consentNotifications')}
                  className="mt-1 rounded bg-slate-800 border-slate-700 text-teal-500 focus:ring-teal-400"
                />
                <span className="text-xs text-slate-300">
                  I consent to receive emergency SOS and device-status alert notifications.
                </span>
              </label>
              {form1.formState.errors.consentNotifications && (
                <p className="text-[11px] text-red-400">{form1.formState.errors.consentNotifications.message}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-teal-500/20 hover:opacity-95 transition flex items-center justify-center gap-2"
            >
              Continue to Emergency Contacts <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <form onSubmit={form2.handleSubmit(onStep2Submit)} className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Phone className="w-5 h-5 text-cyan-400" /> Step 2: Add Primary Emergency Contact
              </h2>
              <p className="text-xs text-slate-400">Who should be alerted first during a critical safety trigger?</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Contact Full Name</label>
              <input
                type="text"
                {...form2.register('fullName')}
                placeholder="e.g. Sarah Johnson"
                className="w-full bg-[#162036] border border-slate-700/80 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              {form2.formState.errors.fullName && (
                <p className="text-[11px] text-red-400 mt-1">{form2.formState.errors.fullName.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Relationship</label>
                <input
                  type="text"
                  {...form2.register('relationship')}
                  placeholder="Spouse / Co-Guardian"
                  className="w-full bg-[#162036] border border-slate-700/80 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
                {form2.formState.errors.relationship && (
                  <p className="text-[11px] text-red-400 mt-1">{form2.formState.errors.relationship.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number</label>
                <input
                  type="text"
                  {...form2.register('phone')}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-[#162036] border border-slate-700/80 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
                {form2.formState.errors.phone && (
                  <p className="text-[11px] text-red-400 mt-1">{form2.formState.errors.phone.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address (Optional)</label>
              <input
                type="email"
                {...form2.register('email')}
                placeholder="contact@example.com"
                className="w-full bg-[#162036] border border-slate-700/80 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex items-center justify-between pt-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="py-2.5 px-6 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-teal-500/20 hover:opacity-95 transition flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Save & Add Traveller'} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <form onSubmit={form3.handleSubmit(onStep3Submit)} className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-400" /> Step 3: Add First Family Member / Traveller
              </h2>
              <p className="text-xs text-slate-400">Register a child, senior, or solo traveller under your protection.</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Traveller Full Name</label>
              <input
                type="text"
                {...form3.register('fullName')}
                placeholder="e.g. Leo Johnson"
                className="w-full bg-[#162036] border border-slate-700/80 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              {form3.formState.errors.fullName && (
                <p className="text-[11px] text-red-400 mt-1">{form3.formState.errors.fullName.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Role Type</label>
                <select
                  {...form3.register('role')}
                  className="w-full bg-[#162036] border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="child">Child Traveller</option>
                  <option value="senior">Senior Traveller</option>
                  <option value="solo">Solo Traveller</option>
                  <option value="other">Other Dependent</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Relationship</label>
                <input
                  type="text"
                  {...form3.register('relationship')}
                  placeholder="Son / Mother / Self"
                  className="w-full bg-[#162036] border border-slate-700/80 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
                {form3.formState.errors.relationship && (
                  <p className="text-[11px] text-red-400 mt-1">{form3.formState.errors.relationship.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Medical / Emergency Notes (Optional)</label>
              <input
                type="text"
                {...form3.register('emergencyNotes')}
                placeholder="e.g. Asthma, Peanut Allergy, Wears Band Alpha"
                className="w-full bg-[#162036] border border-slate-700/80 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="p-3 bg-[#162036] border border-slate-800 rounded-xl space-y-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...form3.register('confirmAuthorized')}
                  className="mt-1 rounded bg-slate-800 border-slate-700 text-teal-500 focus:ring-teal-400"
                />
                <span className="text-xs text-slate-300 leading-snug">
                  “I confirm I am authorized to manage this traveller's safety profile under TrackGuard guidelines.”
                </span>
              </label>
              {form3.formState.errors.confirmAuthorized && (
                <p className="text-[11px] text-red-400">{form3.formState.errors.confirmAuthorized.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2.5 text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="py-2.5 px-6 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-teal-500/20 hover:opacity-95 transition flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Add Family Member'} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <div className="text-center space-y-5 py-4">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full mx-auto flex items-center justify-center border border-emerald-500/30">
              <CheckCircle className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Guardian Setup Complete!</h2>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                Your TrackGuard guardian workspace is configured. You can now manage family members, monitor safety bands, configure safe zones, and respond to real-time incident alerts.
              </p>
            </div>

            <button
              onClick={handleFinishSetup}
              disabled={submitting}
              className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-base rounded-xl shadow-lg shadow-teal-500/25 hover:opacity-95 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? 'Initializing Dashboard...' : 'Enter Guardian Dashboard'} <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
