import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface Step {
  id: string;
  label: string;
  path: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: string;
  taxYear: number;
  onStepClick?: (stepId: string) => void;
}

export function Stepper({ steps, currentStep, taxYear, onStepClick }: StepperProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const currentIndex = steps.findIndex(s => s.id === currentStep);

  const handleStepClick = (step: Step, index: number) => {
    // Only allow clicking on completed steps or current step
    if (index <= currentIndex) {
      if (onStepClick) {
        onStepClick(step.id);
      }
      navigate(`/return/${taxYear}/${step.path}`);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      backgroundColor: 'white',
      borderBottom: '1px solid #E5E7EB'
    }}>
      {steps.map((step, index) => {
        const isComplete = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isClickable = index <= currentIndex;

        return (
          <React.Fragment key={step.id}>
            <div
              onClick={() => handleStepClick(step, index)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: isClickable ? 'pointer' : 'default',
                opacity: !isComplete && !isCurrent ? 0.5 : 1
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isComplete ? '#0D5F2B' : isCurrent ? '#0D5F2B' : '#E5E7EB',
                color: isComplete || isCurrent ? 'white' : '#6B7280',
                fontSize: '14px',
                fontWeight: 600,
                transition: 'all 0.2s ease'
              }}>
                {isComplete ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span style={{
                fontSize: '14px',
                fontWeight: isCurrent ? 600 : 500,
                color: isCurrent ? '#1F2937' : '#6B7280'
              }}>
                {step.label}
              </span>
            </div>

            {index < steps.length - 1 && (
              <div style={{
                width: '64px',
                height: '2px',
                backgroundColor: index < currentIndex ? '#0D5F2B' : '#E5E7EB',
                margin: '0 16px',
                transition: 'background-color 0.2s ease'
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// Sidebar version for mobile or alternative layout
export function StepperSidebar({ steps, currentStep, taxYear }: StepperProps) {
  const navigate = useNavigate();
  const currentIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <div style={{
      backgroundColor: 'white',
      borderRight: '1px solid #E5E7EB',
      padding: '24px',
      width: '240px',
      minHeight: '100vh'
    }}>
      <h3 style={{
        fontSize: '14px',
        fontWeight: 600,
        color: '#6B7280',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginBottom: '24px'
      }}>
        {taxYear} Tax Return
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {steps.map((step, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isClickable = index <= currentIndex;

          return (
            <button
              key={step.id}
              onClick={() => isClickable && navigate(`/return/${taxYear}/${step.path}`)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: isCurrent ? '#E8F5E9' : 'transparent',
                cursor: isClickable ? 'pointer' : 'default',
                opacity: !isComplete && !isCurrent ? 0.5 : 1,
                textAlign: 'left',
                width: '100%'
              }}
            >
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isComplete ? '#0D5F2B' : isCurrent ? '#0D5F2B' : '#E5E7EB',
                color: isComplete || isCurrent ? 'white' : '#6B7280',
                fontSize: '12px',
                fontWeight: 600
              }}>
                {isComplete ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span style={{
                fontSize: '14px',
                fontWeight: isCurrent ? 600 : 500,
                color: isCurrent ? '#0D5F2B' : '#4B5563'
              }}>
                {step.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
