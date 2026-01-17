import React from 'react';

interface ToggleSwitchProps {
  value: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  yesLabel?: string;
  noLabel?: string;
}

export function ToggleSwitch({
  value,
  onChange,
  label,
  description,
  disabled = false,
  yesLabel = 'Yes',
  noLabel = 'No'
}: ToggleSwitchProps) {
  return (
    <div style={{ marginBottom: '20px' }}>
      {label && (
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: 500,
          color: '#374151',
          marginBottom: '8px'
        }}>
          {label}
        </label>
      )}
      {description && (
        <p style={{
          fontSize: '13px',
          color: '#6B7280',
          marginBottom: '12px',
          lineHeight: 1.5
        }}>
          {description}
        </p>
      )}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '12px',
        padding: '4px',
        backgroundColor: '#F3F4F6',
        borderRadius: '28px',
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer'
      }}>
        {/* No Option */}
        <button
          type="button"
          onClick={() => !disabled && onChange(false)}
          disabled={disabled}
          style={{
            padding: '10px 24px',
            fontSize: '14px',
            fontWeight: 600,
            border: 'none',
            borderRadius: '24px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            backgroundColor: !value ? '#EF4444' : 'transparent',
            color: !value ? 'white' : '#6B7280',
            boxShadow: !value ? '0 2px 4px rgba(239, 68, 68, 0.3)' : 'none',
            transform: !value ? 'scale(1)' : 'scale(0.95)',
          }}
        >
          {noLabel}
        </button>

        {/* Yes Option */}
        <button
          type="button"
          onClick={() => !disabled && onChange(true)}
          disabled={disabled}
          style={{
            padding: '10px 24px',
            fontSize: '14px',
            fontWeight: 600,
            border: 'none',
            borderRadius: '24px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            backgroundColor: value ? '#10B981' : 'transparent',
            color: value ? 'white' : '#6B7280',
            boxShadow: value ? '0 2px 4px rgba(16, 185, 129, 0.3)' : 'none',
            transform: value ? 'scale(1)' : 'scale(0.95)',
          }}
        >
          {yesLabel}
        </button>
      </div>
    </div>
  );
}

// Compact version for inline use
export function ToggleSwitchCompact({
  value,
  onChange,
  disabled = false,
}: Omit<ToggleSwitchProps, 'label' | 'description' | 'yesLabel' | 'noLabel'>) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!value)}
      disabled={disabled}
      style={{
        position: 'relative',
        width: '52px',
        height: '28px',
        backgroundColor: value ? '#10B981' : '#EF4444',
        borderRadius: '14px',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background-color 0.2s ease',
        opacity: disabled ? 0.6 : 1,
        padding: 0,
      }}
    >
      {/* Slider knob */}
      <span
        style={{
          position: 'absolute',
          top: '2px',
          left: value ? '26px' : '2px',
          width: '24px',
          height: '24px',
          backgroundColor: 'white',
          borderRadius: '50%',
          transition: 'left 0.2s ease',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
        }}
      />
      {/* Yes/No text indicators */}
      <span style={{
        position: 'absolute',
        left: '6px',
        top: '50%',
        transform: 'translateY(-50%)',
        fontSize: '9px',
        fontWeight: 700,
        color: value ? 'rgba(255,255,255,0.8)' : 'transparent',
        transition: 'color 0.2s ease',
      }}>
        Y
      </span>
      <span style={{
        position: 'absolute',
        right: '6px',
        top: '50%',
        transform: 'translateY(-50%)',
        fontSize: '9px',
        fontWeight: 700,
        color: !value ? 'rgba(255,255,255,0.8)' : 'transparent',
        transition: 'color 0.2s ease',
      }}>
        N
      </span>
    </button>
  );
}

// Question card with toggle - for longer questions like Elections Canada
export function ToggleQuestion({
  question,
  description,
  value,
  onChange,
  disabled = false,
}: {
  question: string;
  description?: string;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#F9FAFB',
      borderRadius: '12px',
      marginBottom: '16px',
      border: '1px solid #E5E7EB',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '20px',
      }}>
        <div style={{ flex: 1 }}>
          <p style={{
            fontSize: '15px',
            fontWeight: 500,
            color: '#1F2937',
            marginBottom: description ? '8px' : 0,
            lineHeight: 1.5,
          }}>
            {question}
          </p>
          {description && (
            <p style={{
              fontSize: '13px',
              color: '#6B7280',
              lineHeight: 1.5,
            }}>
              {description}
            </p>
          )}
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexShrink: 0,
        }}>
          <span style={{
            fontSize: '13px',
            fontWeight: 500,
            color: !value ? '#EF4444' : '#9CA3AF',
            transition: 'color 0.2s ease',
          }}>
            No
          </span>
          <button
            type="button"
            onClick={() => !disabled && onChange(!value)}
            disabled={disabled}
            style={{
              position: 'relative',
              width: '56px',
              height: '32px',
              backgroundColor: value ? '#10B981' : '#EF4444',
              borderRadius: '16px',
              border: 'none',
              cursor: disabled ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.25s ease',
              opacity: disabled ? 0.6 : 1,
              padding: 0,
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: '3px',
                left: value ? '27px' : '3px',
                width: '26px',
                height: '26px',
                backgroundColor: 'white',
                borderRadius: '50%',
                transition: 'left 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
              }}
            />
          </button>
          <span style={{
            fontSize: '13px',
            fontWeight: 500,
            color: value ? '#10B981' : '#9CA3AF',
            transition: 'color 0.2s ease',
          }}>
            Yes
          </span>
        </div>
      </div>
    </div>
  );
}
