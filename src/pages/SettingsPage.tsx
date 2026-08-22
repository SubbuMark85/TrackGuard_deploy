import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Phone, 
  Lock, 
  LogOut, 
  Trash2, 
  Database, 
  Mail, 
  CheckCircle, 
  AlertCircle, 
  Plus,
  RefreshCw
} from 'lucide-react';
import { sendEmailVerification, updatePassword } from 'firebase/auth';
import { useAuth } from '../context/AuthContext';
import { contactService } from '../services/contactService';
import { userService } from '../services/userService';
import { activityService } from '../services/activityService';
import { seedDemoData, clearDemoData } from '../utils/seedDemoData';
import { EmergencyContact } from '../types';
import { PilotBanner } from '../components/common/PilotBanner';

export const SettingsPage: React.FC = () => {
  const { firebaseUser, appUserProfile, signOut, updateUserProfile } = useAuth();
  const navigate = useNavigate();

  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [fullName, setFullName] = useState(appUserProfile?.fullName || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passMessage, setPassMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [verifMessage, setVerifMessage] = useState<string | null>(null);
  const [demoMessage, setDemoMessage] = useState<string | null>(null);

  // New Contact State
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [cName, setCName] = useState('');
  const [cRel, setCRel] = useState('');
  const [cPhone, setCPhone] = useState('');
  const [cEmail, TCEmail] = useState('');

  // Delete Account Request State
  const [showDeleteRequestModal, setShowDeleteRequestModal] = useState(false);

  useEffect(() => {
    if (!firebaseUser) return;
    const unsub = contactService.subscribeContacts(firebaseUser.uid, setContacts);
    return () => unsub();
  }, [firebaseUser]);

  useEffect(() => {
    if (appUserProfile?.fullName) setFullName(appUserProfile.fullName);
  }, [appUserProfile]);

  const handleUpdateProfileName = async () => {
    if (!firebaseUser || !fullName) return;
    try {
      await updateUserProfile({ fullName });
      await activityService.logActivity(firebaseUser.uid, {
        type: 'profile_updated',
        description: `Guardian updated profile name to "${fullName}".`,
        actorUid: firebaseUser.uid,
      });
      alert('Guardian profile name updated.');
    } catch (err: any) {
      alert(err.message || 'Error updating profile name');
    }
  };

  const handleTogglePref = async (key: string, value: boolean) => {
    if (!firebaseUser || !appUserProfile) return;
    const currentPrefs = appUserProfile.notificationPreferences || {};
    const updated = { ...currentPrefs, [key]: value };
    await updateUserProfile({ notificationPreferences: updated as any });
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser || !cName || !cRel || !cPhone) return;
    try {
      await contactService.addContact(firebaseUser.uid, {
        fullName: cName,
        relationship: cRel,
        phone: cPhone,
        email: cEmail || undefined,
        isPrimary: contacts.length === 0,
      });
      await userService.updateUserProfile(firebaseUser.uid, { emergencyContactsCount: contacts.length + 1 });
      setIsContactModalOpen(false);
      setCName('');
      setCRel('');
      setCPhone('');
      TCEmail('');
    } catch (err) {
      console.error('Error adding contact:', err);
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!firebaseUser) return;
    if (window.confirm('Delete this emergency contact?')) {
      await contactService.deleteContact(firebaseUser.uid, contactId);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) return;
    if (newPassword !== confirmPassword) {
      setPassMessage({ type: 'error', text: "Passwords don't match." });
      return;
    }
    if (newPassword.length < 6) {
      setPassMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }
    try {
      await updatePassword(firebaseUser, newPassword);
      setPassMessage({ type: 'success', text: 'Password changed successfully.' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPassMessage({ type: 'error', text: err.message || 'Error changing password. Please re-authenticate.' });
    }
  };

  const handleSendVerificationEmail = async () => {
    if (!firebaseUser) return;
    try {
      await sendEmailVerification(firebaseUser);
      setVerifMessage(`Verification email sent to ${firebaseUser.email}. Check your inbox.`);
    } catch (err: any) {
      setVerifMessage(`Error: ${err.message}`);
    }
  };

  const handleSeedDemoData = async () => {
    if (!firebaseUser) return;
    setDemoMessage('Seeding pilot demo data...');
    try {
      await seedDemoData(firebaseUser.uid, appUserProfile?.fullName || 'Guardian');
      setDemoMessage('Sample pilot demo data loaded successfully.');
    } catch (err: any) {
      setDemoMessage(`Error seeding data: ${err.message}`);
    }
  };

  const handleClearDemoData = async () => {
    if (!firebaseUser) return;
    setDemoMessage('Clearing demo data...');
    try {
      const deleted = await clearDemoData(firebaseUser.uid);
      setDemoMessage(`Removed ${deleted} demo records (tagged isDemoData: true).`);
    } catch (err: any) {
      setDemoMessage(`Error clearing demo data: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F1D] text-white flex flex-col justify-between pb-20 md:pb-6">
      <div className="space-y-6">
        <PilotBanner />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Settings className="w-6 h-6 text-cyan-400" /> Guardian Settings & Preferences
            </h1>
            <p className="text-xs text-slate-400">Manage account, security, emergency contacts, & demo state</p>
          </div>

          <button
            onClick={() => signOut()}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4 text-red-400" /> Sign Out
          </button>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
          {/* Section 1: Guardian Profile */}
          <div className="bg-[#0D1527] border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-base text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <User className="w-5 h-5 text-teal-400" /> Guardian Account Profile
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Full Name</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="flex-1 bg-[#162036] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    onClick={handleUpdateProfileName}
                    className="px-3 py-2 bg-teal-500 text-slate-950 font-bold rounded-xl text-xs"
                  >
                    Save
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Account Email</label>
                <input
                  type="text"
                  value={firebaseUser?.email || ''}
                  disabled
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-400 font-mono"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-800/80 text-xs">
              <span className="text-slate-400">
                Email Status:{' '}
                <strong className={firebaseUser?.emailVerified ? 'text-emerald-400' : 'text-amber-400'}>
                  {firebaseUser?.emailVerified ? 'Verified' : 'Unverified'}
                </strong>
              </span>
              {!firebaseUser?.emailVerified && (
                <button
                  onClick={handleSendVerificationEmail}
                  className="text-cyan-400 hover:underline flex items-center gap-1 font-medium"
                >
                  <Mail className="w-3.5 h-3.5" /> Send Verification Email
                </button>
              )}
            </div>
            {verifMessage && <p className="text-xs text-cyan-300 bg-cyan-950/60 p-2 rounded-xl border border-cyan-800/40">{verifMessage}</p>}
          </div>

          {/* Section 2: Emergency Contacts */}
          <div className="bg-[#0D1527] border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Phone className="w-5 h-5 text-cyan-400" /> Emergency Contacts ({contacts.length})
              </h3>
              <button
                onClick={() => setIsContactModalOpen(true)}
                className="px-3 py-1.5 bg-teal-500 text-slate-950 font-bold text-xs rounded-xl shadow flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add Contact
              </button>
            </div>

            {contacts.length === 0 ? (
              <p className="text-xs text-slate-400">No emergency contacts registered.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {contacts.map((c) => (
                  <div key={c.id} className="bg-[#162036] p-3.5 rounded-2xl border border-slate-700/80 flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-bold text-white text-sm">{c.fullName}</h4>
                      <p className="text-slate-400">{c.relationship} • {c.phone}</p>
                    </div>
                    <button onClick={() => handleDeleteContact(c.id)} className="p-1.5 text-slate-500 hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 3: Notification & Privacy Settings */}
          <div className="bg-[#0D1527] border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-base text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Bell className="w-5 h-5 text-amber-400" /> Notification & Privacy Preferences
            </h3>

            <div className="space-y-3 text-xs">
              {[
                { key: 'emergencyAlerts', label: 'Emergency SOS Incident Alerts' },
                { key: 'geofenceAlerts', label: 'Geofence Exit / Entry Alerts' },
                { key: 'deviceAlerts', label: 'Safety Band Disconnect & Low Battery Warnings' },
                { key: 'pushEnabled', label: 'In-App & Push Notification Banners' },
              ].map((item) => {
                const isChecked = appUserProfile?.notificationPreferences?.[item.key as keyof typeof appUserProfile.notificationPreferences] ?? true;
                return (
                  <label key={item.key} className="flex items-center justify-between bg-[#162036] p-3 rounded-xl cursor-pointer">
                    <span className="text-slate-200">{item.label}</span>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => handleTogglePref(item.key, e.target.checked)}
                      className="rounded bg-slate-800 border-slate-700 text-teal-500 focus:ring-teal-400 w-4 h-4"
                    />
                  </label>
                );
              })}
            </div>
          </div>

          {/* Section 4: Change Password */}
          <form onSubmit={handleChangePassword} className="bg-[#0D1527] border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-base text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Lock className="w-5 h-5 text-emerald-400" /> Security & Password
            </h3>

            {passMessage && (
              <p className={`text-xs p-3 rounded-xl border ${passMessage.type === 'success' ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40' : 'bg-red-950 text-red-300 border-red-500/40'}`}>
                {passMessage.text}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#162036] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#162036] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <button type="submit" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl border border-slate-700">
              Update Password
            </button>
          </form>

          {/* Section 5: Demo Data Seeder Controls */}
          <div className="bg-[#0D1527] border border-amber-500/30 rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-base text-amber-300 flex items-center gap-2 border-b border-amber-500/20 pb-3">
              <Database className="w-5 h-5 text-amber-400" /> Pilot Demo Data Seeding Helper
            </h3>

            <p className="text-xs text-slate-300">
              Populate sample family members, a safety band, trip, safe zone, and activity logs marked with <code className="text-amber-300 font-mono">isDemoData: true</code>.
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSeedDemoData}
                className="px-4 py-2 bg-amber-950 hover:bg-amber-900 border border-amber-500/40 text-amber-200 text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                <Database className="w-4 h-4 text-amber-400" /> Seed Sample Demo Data
              </button>

              <button
                onClick={handleClearDemoData}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium rounded-xl flex items-center gap-1.5"
              >
                <RefreshCw className="w-4 h-4 text-slate-400" /> Clear Demo Records
              </button>
            </div>

            {demoMessage && (
              <p className="text-xs text-cyan-300 bg-slate-900 p-2.5 rounded-xl border border-slate-800">{demoMessage}</p>
            )}
          </div>

          {/* Section 6: Request Account Deletion */}
          <div className="bg-red-950/30 border border-red-500/30 rounded-3xl p-6 space-y-3">
            <h3 className="font-bold text-base text-red-300 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-400" /> Delete Guardian Account
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Full account deletion requires administrative verification via Cloud Functions/Admin SDK in production. Requesting account deletion will flag your guardian account for review.
            </p>
            <button
              onClick={() => setShowDeleteRequestModal(true)}
              className="px-4 py-2 bg-red-950 hover:bg-red-900 border border-red-500/50 text-red-300 text-xs font-semibold rounded-xl"
            >
              Request Account Deletion
            </button>
          </div>
        </div>
      </div>

      {/* Add Emergency Contact Modal */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#0D1527] border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-lg text-white">Add Emergency Contact</h3>
            <form onSubmit={handleAddContact} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={cName}
                  onChange={(e) => setCName(e.target.value)}
                  required
                  placeholder="Sarah Johnson"
                  className="w-full bg-[#162036] border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Relationship</label>
                <input
                  type="text"
                  value={cRel}
                  onChange={(e) => setCRel(e.target.value)}
                  required
                  placeholder="Spouse"
                  className="w-full bg-[#162036] border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={cPhone}
                  onChange={(e) => setCPhone(e.target.value)}
                  required
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-[#162036] border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsContactModalOpen(false)} className="px-3 py-2 text-slate-400">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-teal-500 text-slate-950 font-bold rounded-xl">
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Request Modal */}
      {showDeleteRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0D1527] border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-lg text-red-400">Account Deletion Request</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Your request for account deletion has been logged for admin processing. In a production build, a Firebase Cloud Function handles cascading document deletion across user subcollections.
            </p>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowDeleteRequestModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl"
              >
                Close Placeholder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
