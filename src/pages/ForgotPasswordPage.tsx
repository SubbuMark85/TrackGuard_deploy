import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Shield, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PilotBanner } from '../components/common/PilotBanner';

export const ForgotPasswordPage: React.FC = () => {
  const { resetPassword, authError, setAuthError } = useAuth();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    setSentSuccess(false);
    try {
      await resetPassword(email);
      setSentSuccess(true);
    } catch (err) {
      // Handled by AuthContext authError
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F1D] text-white flex flex-col justify-between">
      <PilotBanner />

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#0D1527] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-gradient-to-tr from-teal-500 to-cyan-400 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-teal-500/20">
              <Shield className="w-8 h-8 text-slate-950" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-wide">Reset Password</h1>
            <p className="text-xs text-slate-400">Enter your guardian email address to receive a recovery link</p>
          </div>

          {authError && (
            <div className="p-3.5 bg-red-950/60 border border-red-500/40 rounded-xl text-red-200 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <div className="flex-1">{authError}</div>
              <button onClick={() => setAuthError(null)} className="text-slate-400 hover:text-white text-sm">×</button>
            </div>
          )}

          {sentSuccess ? (
            <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl text-emerald-200 text-xs space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                <CheckCircle className="w-5 h-5" /> Recovery Link Sent!
              </div>
              <p>
                We have dispatched a password reset email to <strong>{email}</strong>. Check your inbox and spam folder.
              </p>
              <Link to="/login" className="block text-center text-cyan-400 font-semibold hover:underline pt-2">
                Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Guardian Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="guardian@example.com"
                    className="w-full bg-[#162036] border border-slate-700/80 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-teal-500/20 hover:opacity-95 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Send Password Reset Link'
                )}
              </button>
            </form>
          )}

          <div className="text-center pt-2">
            <Link to="/login" className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1.5">
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
