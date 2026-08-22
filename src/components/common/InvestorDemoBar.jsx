import React from 'react';
import { useApp } from '../../context/AppContext';
import { Play, RotateCcw, ShieldAlert, ChevronRight, Monitor, Smartphone, Sparkles } from 'lucide-react';

export const InvestorDemoBar = ({ isFullScreen, setIsFullScreen }) => {
  const {
    isDemoActive,
    demoStepIndex,
    DEMO_STEPS,
    setDemoStep,
    nextDemoStep,
    resetDemo,
    activeScreen,
    setActiveScreen
  } = useApp();

  const currentStep = DEMO_STEPS[demoStepIndex];

  return (
    <div style={{
      background: 'linear-gradient(90deg, #0F172A 0%, #1E293B 100%)',
      borderBottom: '1px solid rgba(91, 192, 190, 0.3)',
      padding: '8px 16px',
      color: '#FFFFFF',
      fontSize: '0.85rem',
      zIndex: 1000,
      boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        {/* Investor Pitch Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #5BC0BE 0%, #3B82F6 100%)',
            padding: '3px 8px',
            borderRadius: '6px',
            color: '#090D16',
            fontWeight: '800',
            fontSize: '0.7rem',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <Sparkles size={12} /> INVESTOR DEMO
          </div>
          <span style={{ fontWeight: '600', color: '#9CA3AF' }}>
            Step {demoStepIndex + 1}/8:
          </span>
          <span style={{ fontWeight: '700', color: '#5BC0BE' }}>
            {currentStep.title}
          </span>
        </div>

        {/* Story Stepper Pills */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          overflowX: 'auto',
          maxWidth: '500px',
          padding: '2px 0'
        }}>
          {DEMO_STEPS.map((step, idx) => {
            const isActive = idx === demoStepIndex;
            return (
              <button
                key={step.id}
                onClick={() => setDemoStep(idx)}
                title={step.subtitle}
                style={{
                  background: isActive ? '#5BC0BE' : 'rgba(255, 255, 255, 0.08)',
                  color: isActive ? '#090D16' : '#9CA3AF',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '3px 8px',
                  fontSize: '0.72rem',
                  fontWeight: isActive ? '800' : '500',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease'
                }}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className="btn btn-cyan"
            onClick={nextDemoStep}
            style={{ padding: '5px 12px', fontSize: '0.78rem' }}
          >
            Next Step <ChevronRight size={14} />
          </button>

          <button
            className="btn btn-outline"
            onClick={resetDemo}
            title="Reset Demo to Initial Safe State"
            style={{ padding: '5px 10px', fontSize: '0.78rem' }}
          >
            <RotateCcw size={14} /> Reset
          </button>

          {/* Screen Switcher Shortcuts */}
          <button
            onClick={() => setActiveScreen('responder')}
            style={{
              background: activeScreen === 'responder' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.05)',
              border: activeScreen === 'responder' ? '1px solid #EF4444' : '1px solid rgba(255,255,255,0.1)',
              color: activeScreen === 'responder' ? '#EF4444' : '#E5E7EB',
              borderRadius: '6px',
              padding: '4px 8px',
              fontSize: '0.75rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Monitor size={12} /> Command Center (/responder)
          </button>

          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#9CA3AF',
              borderRadius: '6px',
              padding: '4px 8px',
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title={isFullScreen ? "Switch to Phone Frame View" : "Expand to Full Screen"}
          >
            <Smartphone size={12} /> {isFullScreen ? "Mobile Frame" : "Full Screen"}
          </button>
        </div>
      </div>

      {/* Subtitle caption */}
      <div style={{
        marginTop: '4px',
        color: '#9CA3AF',
        fontSize: '0.75rem',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        <span style={{ color: '#6FFFE9' }}>Story Focus:</span> {currentStep.subtitle}
      </div>
    </div>
  );
};
