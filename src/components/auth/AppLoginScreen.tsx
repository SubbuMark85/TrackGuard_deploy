import React, { useState } from 'react';
import { Shield, Lock, Mail, User, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

export const AppLoginScreen = () => {
  const { signIn, signUp, signInWithGoogle, authError, setAuthError } = useAuth();
  const { addToast, setActiveScreen } = useApp();

  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setAuthError(null);

    try {
      if (isRegistering) {
        if (!fullName.trim()) {
          setAuthError('Please enter your full name.');
          setSubmitting(false);
          return;
        }
        await signUp(email, password, fullName);
        addToast('✅ ACCOUNT CREATED', 'Welcome to TrackGuard Safety Ecosystem!', 'success');
      } else {
        await signIn(email, password);
        addToast('🔐 SIGNED IN', 'Authenticated successfully via Firebase.', 'success');
      }
      setActiveScreen('home');
    } catch (err: any) {
      // Error is set in AuthContext
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setSubmitting(true);
    setAuthError(null);
    try {
      await signInWithGoogle();
      addToast('🌐 GOOGLE AUTH', 'Signed in with Google Account.', 'success');
      setActiveScreen('home');
    } catch (err: any) {
      // Error is set in AuthContext
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '20px', minHeight: '100%', justifyContent: 'center' }}>
      {/* Brand Header */}
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #00F2FE 0%, #4FACFE 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#090D16',
          boxShadow: 'var(--shadow-glow-cyan)',
          marginBottom: '12px'
        }}>
          <Shield size={32} />
        </div>
        <h1 style={{ fontFamily: 'var(--font-family-title)', fontSize: '1.6rem', fontWeight: '800', color: '#FFFFFF', margin: 0 }}>
          TrackGuard
        </h1>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          AI Travel Safety & Guardian Protection Ecosystem
        </p>
      </div>

      {/* Auth Card */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Toggle Switcher */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '12px' }}>
          <button
            type="button"
            onClick={() => { setIsRegistering(false); setAuthError(null); }}
            style={{
              padding: '8px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: '700',
              fontSize: '0.8rem',
              cursor: 'pointer',
              background: !isRegistering ? '#3B82F6' : 'transparent',
              color: !isRegistering ? '#FFFFFF' : 'var(--text-muted)',
              transition: 'all 0.2s'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsRegistering(true); setAuthError(null); }}
            style={{
              padding: '8px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: '700',
              fontSize: '0.8rem',
              cursor: 'pointer',
              background: isRegistering ? '#3B82F6' : 'transparent',
              color: isRegistering ? '#FFFFFF' : 'var(--text-muted)',
              transition: 'all 0.2s'
            }}
          >
            Create Account
          </button>
        </div>

        {authError && (
          <div style={{ padding: '10px 12px', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '10px', color: '#FCA5A5', fontSize: '0.72rem', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <AlertCircle size={16} color="#EF4444" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1, lineHeight: '1.4' }}>{authError}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {isRegistering && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)' }}>Full Name</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <User size={16} color="#64748B" style={{ position: 'absolute', left: '12px', pointerEvents: 'none' }} />
                <input
                  type="text"
                  required
                  placeholder="Arun Subramaniam"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{
                    width: '100%',
                    height: '42px',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px',
                    padding: '0 12px 0 38px',
                    color: '#FFFFFF',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)' }}>Email Address</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail size={16} color="#64748B" style={{ position: 'absolute', left: '12px', pointerEvents: 'none' }} />
              <input
                type="email"
                required
                placeholder="guardian@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  height: '42px',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  padding: '0 12px 0 38px',
                  color: '#FFFFFF',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)' }}>Password</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock size={16} color="#64748B" style={{ position: 'absolute', left: '12px', pointerEvents: 'none' }} />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  height: '42px',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  padding: '0 12px 0 38px',
                  color: '#FFFFFF',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-cyan"
            style={{ marginTop: '6px', height: '44px', width: '100%', opacity: submitting ? 0.7 : 1 }}
          >
            {submitting ? (
              <div style={{ width: '18px', height: '18px', border: '2px solid #090D16', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spinSlow 1s linear infinite' }}></div>
            ) : (
              <>
                {isRegistering ? 'Create Guardian Account' : 'Sign In to Safety Dashboard'} <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '4px 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: '600' }}>OR CONTINUE WITH</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={submitting}
          className="btn btn-outline"
          style={{ width: '100%', height: '42px', opacity: submitting ? 0.7 : 1, fontSize: '0.82rem' }}
        >
          <svg style={{ width: '16px', height: '16px' }} viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z" />
            <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
            <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.4 0 15.3s.7 5.6 1.9 8l3.7-2.9z" />
            <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z" />
          </svg>
          Google Sign In
        </button>
      </div>

      {/* Security note */}
      <div style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
        <CheckCircle2 size={14} color="#10B981" />
        <span>End-to-End Encrypted Guardian Auth</span>
      </div>
    </div>
  );
};
