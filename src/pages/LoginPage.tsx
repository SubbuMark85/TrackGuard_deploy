import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PilotBanner } from '../components/common/PilotBanner';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { signIn, signInWithGoogle, authError, setAuthError } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setSubmitting(true);
    try {
      await signIn(data.email, data.password);
      navigate('/guardian');
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
      navigate('/guardian');
    } catch (err) {
      // Handled by AuthContext authError
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="w-full max-w-xl mb-4">
        <PilotBanner />
      </div>

      <div className="auth-card-box">
        {/* Header */}
        <div className="auth-header-center">
          <div className="auth-logo-badge">
            <Shield style={{ width: '32px', height: '32px' }} />
          </div>
          <h1 className="auth-title">TrackGuard Login</h1>
          <p className="auth-subtitle">Guardian Safety Platform & Incident Dashboard</p>
        </div>

        {authError && (
          <div style={{ padding: '12px 14px', backgroundColor: 'rgba(127, 29, 29, 0.6)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '12px', color: '#FECACA', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle style={{ width: '18px', height: '18px', color: '#F87171', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>{authError}</div>
            <button onClick={() => setAuthError(null)} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: '16px' }}>×</button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group-field">
            <label className="form-field-label">Email Address</label>
            <div className="input-with-icon-wrapper">
              <Mail />
              <input
                type="email"
                {...register('email')}
                placeholder="guardian@example.com"
                className="custom-form-input"
              />
            </div>
            {errors.email && <p style={{ fontSize: '11px', color: '#F87171', marginTop: '2px' }}>{errors.email.message}</p>}
          </div>

          <div className="form-group-field">
            <label className="form-field-label">Password</label>
            <div className="input-with-icon-wrapper">
              <Lock />
              <input
                type="password"
                {...register('password')}
                placeholder="••••••••"
                className="custom-form-input"
              />
            </div>
            {errors.password && <p style={{ fontSize: '11px', color: '#F87171', marginTop: '2px' }}>{errors.password.message}</p>}
          </div>

          <div className="checkbox-row-container">
            <label className="checkbox-label-flex">
              <input
                type="checkbox"
                {...register('rememberMe')}
              />
              <span>Remember session</span>
            </label>
            <Link to="/forgot-password" style={{ color: '#00F2FE', textDecoration: 'none', fontWeight: 600 }}>
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="primary-submit-btn"
            style={{ opacity: submitting ? 0.6 : 1 }}
          >
            {submitting ? (
              <div style={{ width: '18px', height: '18px', border: '2px solid #090D16', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spinSlow 1s linear infinite' }}></div>
            ) : (
              <>
                Sign In to Dashboard <ArrowRight style={{ width: '16px', height: '16px' }} />
              </>
            )}
          </button>
        </form>

        <div className="or-divider-container">
          <div className="or-divider-line"></div>
          <span className="or-divider-text">Or continue with</span>
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={submitting}
          className="google-auth-btn"
          style={{ opacity: submitting ? 0.6 : 1 }}
        >
          <svg style={{ width: '18px', height: '18px' }} viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
            />
            <path
              fill="#FBBC05"
              d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.4 0 15.3s.7 5.6 1.9 8l3.7-2.9z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
            />
          </svg>
          Google Sign In
        </button>

        <div style={{ textAlignment: 'center', textAlign: 'center', fontSize: '12px', color: '#94A3B8', paddingTop: '4px' }}>
          Don't have a guardian account?{' '}
          <Link to="/register" style={{ color: '#00F2FE', fontWeight: 600, textDecoration: 'none' }}>
            Create guardian account
          </Link>
        </div>
      </div>
    </div>
  );
};
