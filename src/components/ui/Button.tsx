import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled,
  children,
  style,
  ...props
}: ButtonProps) {
  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontWeight: 600,
    borderRadius: '8px',
    border: 'none',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    opacity: disabled || loading ? 0.6 : 1,
    width: fullWidth ? '100%' : 'auto',
    fontFamily: 'inherit'
  };

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { padding: '8px 16px', fontSize: '14px' },
    md: { padding: '12px 24px', fontSize: '15px' },
    lg: { padding: '16px 32px', fontSize: '16px' },
    xl: { padding: '20px 40px', fontSize: '18px' }
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: '#0D5F2B',
      color: 'white'
    },
    secondary: {
      backgroundColor: '#F3F4F6',
      color: '#1F2937'
    },
    ghost: {
      backgroundColor: 'transparent',
      color: '#0D5F2B'
    },
    danger: {
      backgroundColor: '#DC2626',
      color: 'white'
    }
  };

  return (
    <button
      style={{
        ...baseStyle,
        ...sizeStyles[size],
        ...variantStyles[variant],
        ...style
      }}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span style={{ animation: 'spin 1s linear infinite' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
            <path d="M12 2a10 10 0 0 1 10 10" />
          </svg>
        </span>
      )}
      {children}
    </button>
  );
}
