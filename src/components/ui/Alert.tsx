import React from 'react';

interface AlertProps {
  type: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  style?: React.CSSProperties;
}

export function Alert({ type, title, children, onClose, style: customStyle }: AlertProps) {
  const styles: Record<string, { bg: string; border: string; text: string; icon: string }> = {
    info: {
      bg: '#EFF6FF',
      border: '#BFDBFE',
      text: '#1E40AF',
      icon: '#3B82F6'
    },
    success: {
      bg: '#F0FDF4',
      border: '#BBF7D0',
      text: '#166534',
      icon: '#22C55E'
    },
    warning: {
      bg: '#FFFBEB',
      border: '#FDE68A',
      text: '#92400E',
      icon: '#F59E0B'
    },
    error: {
      bg: '#FEF2F2',
      border: '#FECACA',
      text: '#991B1B',
      icon: '#EF4444'
    }
  };

  const style = styles[type];

  const icons: Record<string, React.ReactNode> = {
    info: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
    success: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    warning: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    error: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    )
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        backgroundColor: style.bg,
        border: `1px solid ${style.border}`,
        borderRadius: '8px',
        padding: '16px',
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start',
        ...customStyle
      }}
    >
      <div style={{ color: style.icon, flexShrink: 0 }}>
        {icons[type]}
      </div>
      <div style={{ flex: 1 }}>
        {title && (
          <h4 style={{
            margin: '0 0 4px 0',
            fontSize: '14px',
            fontWeight: 600,
            color: style.text
          }}>
            {title}
          </h4>
        )}
        <div style={{
          fontSize: '14px',
          color: style.text,
          lineHeight: 1.5
        }}>
          {children}
        </div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Close alert"
          type="button"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: style.text,
            padding: '4px',
            display: 'flex'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
}
