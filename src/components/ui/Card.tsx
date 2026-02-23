import React, { useState, useCallback } from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  style?: React.CSSProperties;
  onClick?: () => void;
  hoverable?: boolean;
  accentBorder?: 'left' | 'top' | 'none';
  accentColor?: string;
}

export function Card({
  children,
  title,
  subtitle,
  icon,
  action,
  padding = 'md',
  style,
  onClick,
  hoverable = false,
  accentBorder = 'none',
  accentColor = '#0D5F2B'
}: CardProps) {
  const [hovered, setHovered] = useState(false);

  const handleMouseEnter = useCallback(() => {
    if (hoverable || onClick) setHovered(true);
  }, [hoverable, onClick]);
  const handleMouseLeave = useCallback(() => setHovered(false), []);

  const paddingValues = {
    none: '0',
    sm: '16px',
    md: '24px',
    lg: '32px'
  };

  const accentStyles: React.CSSProperties =
    accentBorder === 'left'
      ? { borderLeft: `3px solid ${accentColor}` }
      : accentBorder === 'top'
      ? { borderTop: `3px solid ${accentColor}` }
      : {};

  return (
    <div
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: hovered
          ? '0 8px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 10px -3px rgba(0, 0, 0, 0.04)'
          : '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.03)',
        border: '1px solid #E5E7EB',
        padding: paddingValues[padding],
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: hovered && (hoverable || onClick) ? 'translateY(-2px)' : 'translateY(0)',
        ...accentStyles,
        ...style
      }}
    >
      {(title || icon || action) && (
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: children ? '16px' : '0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {icon && (
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: '#E8F5E9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0D5F2B'
              }}>
                {icon}
              </div>
            )}
            <div>
              {title && (
                <h3 style={{
                  margin: 0,
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#1F2937'
                }}>
                  {title}
                </h3>
              )}
              {subtitle && (
                <p style={{
                  margin: '4px 0 0 0',
                  fontSize: '14px',
                  color: '#6B7280'
                }}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
