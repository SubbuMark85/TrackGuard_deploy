import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, User, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PilotBanner } from '../components/common/PilotBanner';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password is required'),
  agreeTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must agree to the Terms and Privacy Policy' }),
  }),
  isGuardianAdult: z.literal(true, {
    errorMap: () => ({ message: 'You must confirm you are at least 18 years old / an adult guardian' }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const { signUp, signInWithGoogle, authError, setAuthError } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setSubmitting(true);
    try {
      await signUp(data.email, data.password, data.fullName);
      navigate('/onboarding');
    } catch (err) {
      // Handled by AuthContext authError
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setSubmitting(true);
    try {
      await signInWithGoogle();
      navigate('/onboarding');
    } catch (err) {
      // Handled by AuthContext authError
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F1D] text-white flex flex-col justify-between">
      <PilotBanner />

      <div className="flex-1 flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-md bg-[#0D1527] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-gradient-to-tr from-teal-500 to-cyan-400 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-teal-500/20">
              <Shield className="w-8 h-8 text-slate-950" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-wide">Register Guardian Account</h1>
            <p className="text-xs text-slate-400">Set up your safety monitoring profile</p>
          </div>

          {authError && (
            <div className="p-3.5 bg-red-950/60 border border-red-500/40 rounded-xl text-red-200 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <div className="flex-1">{authError}</div>
              <button onClick={() => setAuthError(null)} className="text-slate-400 hover:text-white text-sm">×</button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  {...register('fullName')}
                  placeholder="Jane Doe"
                  className="w-full bg-[#162036] border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                />
              </div>
              {errors.fullName && <p className="text-[11px] text-red-400 mt-1">{errors.fullName.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  {...register('email')}
                  placeholder="guardian@example.com"
                  className="w-full bg-[#162036] border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                />
              </div>
              {errors.email && <p className="text-[11px] text-red-400 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  {...register('password')}
                  placeholder="••••••••"
                  className="w-full bg-[#162036] border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                />
              </div>
              {errors.password && <p className="text-[11px] text-red-400 mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  {...register('confirmPassword')}
                  placeholder="••••••••"
                  className="w-full bg-[#162036] border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                />
              </div>
              {errors.confirmPassword && <p className="text-[11px] text-red-400 mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <div className="space-y-2 text-xs text-slate-300 pt-1">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('agreeTerms')}
                  className="mt-0.5 rounded bg-slate-800 border-slate-700 text-teal-500 focus:ring-teal-400"
                />
                <span>
                  I agree to the <Link to="/terms" className="text-cyan-400 hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-cyan-400 hover:underline">Privacy Policy</Link>.
                </span>
              </label>
              {errors.agreeTerms && <p className="text-[11px] text-red-400">{errors.agreeTerms.message}</p>}

              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('isGuardianAdult')}
                  className="mt-0.5 rounded bg-slate-800 border-slate-700 text-teal-500 focus:ring-teal-400"
                />
                <span>I confirm I am at least 18 years old and a designated adult guardian.</span>
              </label>
              {errors.isGuardianAdult && <p className="text-[11px] text-red-400">{errors.isGuardianAdult.message}</p>}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-teal-500/20 hover:opacity-95 transition flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Create Guardian Account & Continue'
              )}
            </button>
          </form>

          <button
            onClick={handleGoogleSignIn}
            disabled={submitting}
            className="w-full py-2.5 bg-[#162036] border border-slate-700/80 hover:bg-slate-800 text-slate-200 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-2.5"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z" />
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
              <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.4 0 15.3s.7 5.6 1.9 8l3.7-2.9z" />
              <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z" />
            </svg>
            Sign up with Google
          </button>

          <div className="text-center text-xs text-slate-400">
            Already registered?{' '}
            <Link to="/login" className="text-cyan-400 font-semibold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
