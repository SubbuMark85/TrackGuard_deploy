import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export const ToastContainer = () => {
  const { toasts, removeToast } = useApp();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '70px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 1100,
      width: '90%',
      maxWidth: '380px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      pointerEvents: 'none'
    }}>
      {toasts.map((toast) => {
        const isDanger = toast.type === 'danger';
        const isSuccess = toast.type === 'success';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            style={{
              pointerEvents: 'auto',
              background: isDanger
                ? 'linear-gradient(135deg, #450A0A 0%, #1F0404 100%)'
                : isSuccess
                ? 'linear-gradient(135deg, #064E3B 0%, #022C22 100%)'
                : 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
              border: isDanger
                ? '1px solid #EF4444'
                : isSuccess
                ? '1px solid #10B981'
                : '1px solid #5BC0BE',
              boxShadow: isDanger
                ? '0 10px 25px rgba(239, 68, 68, 0.4)'
                : '0 10px 25px rgba(0,0,0,0.5)',
              borderRadius: '12px',
              padding: '10px 14px',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              animation: 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {isDanger ? (
              <ShieldAlert size={20} color="#EF4444" style={{ marginTop: '2px' }} />
            ) : isSuccess ? (
              <CheckCircle2 size={20} color="#10B981" style={{ marginTop: '2px' }} />
            ) : isWarning ? (
              <AlertTriangle size={20} color="#F59E0B" style={{ marginTop: '2px' }} />
            ) : (
              <Info size={20} color="#5BC0BE" style={{ marginTop: '2px' }} />
            )}

            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '700', fontSize: '0.85rem', color: isDanger ? '#EF4444' : '#FFFFFF' }}>
                {toast.title}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#D1D5DB', marginTop: '2px' }}>
                {toast.message}
              </div>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'none',
                border: 'none',
                color: '#9CA3AF',
                cursor: 'pointer',
                padding: '2px'
              }}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
