import React, { useState, useCallback } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  icon,
  disabled,
  children,
  style,
  ...props
}: ButtonProps) {
  const [hovered, setHovered] = useState(false);

  const handleMouseEnter = useCallback(() => setHovered(true), []);
  const handleMouseLeave = useCallback(() => setHovered(false), []);

  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontWeight: 600,
    borderRadius: '10px',
    border: 'none',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    opacity: disabled || loading ? 0.55 : 1,
    width: fullWidth ? '100%' : 'auto',
    fontFamily: 'inherit',
    letterSpacing: '-0.01em',
    lineHeight: 1.4
  };

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { padding: '8px 16px', fontSize: '13px' },
    md: { padding: '11px 22px', fontSize: '14px' },
    lg: { padding: '14px 28px', fontSize: '15px' },
    xl: { padding: '18px 36px', fontSize: '16px' }
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: hovered && !disabled ? '#0A4A21' : '#0D5F2B',
      color: 'white',
      boxShadow: hovered && !disabled
        ? '0 4px 12px rgba(13, 95, 43, 0.3)'
        : '0 1px 3px rgba(13, 95, 43, 0.15)'
    },
    secondary: {
      backgroundColor: hovered && !disabled ? '#E5E7EB' : '#F3F4F6',
      color: '#1F2937',
      boxShadow: 'none'
    },
    ghost: {
      backgroundColor: hovered && !disabled ? '#F0FDF4' : 'transparent',
      color: '#0D5F2B',
      boxShadow: 'none'
    },
    danger: {
      backgroundColor: hovered && !disabled ? '#B91C1C' : '#DC2626',
      color: 'white',
      boxShadow: hovered && !disabled
        ? '0 4px 12px rgba(220, 38, 38, 0.3)'
        : '0 1px 3px rgba(220, 38, 38, 0.15)'
    },
    outline: {
      backgroundColor: hovered && !disabled ? '#F0FDF4' : 'transparent',
      color: '#0D5F2B',
      border: '1.5px solid #0D5F2B',
      boxShadow: 'none'
    }
  };

  return (
    <button
      style={{
        ...baseStyle,
        ...sizeStyles[size],
        ...variantStyles[variant],
        transform: hovered && !disabled ? 'translateY(-1px)' : 'translateY(0)',
        ...style
      }}
      disabled={disabled || loading}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {loading && (
        <span style={{ animation: 'spin 1s linear infinite', display: 'flex' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
            <path d="M12 2a10 10 0 0 1 10 10" />
          </svg>
        </span>
      )}
      {!loading && icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
      {children}
    </button>
  );
}
