import React from 'react';
import { Link } from 'react-router-dom';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{
      backgroundColor: '#F9FAFB',
      borderTop: '1px solid #E5E7EB',
      padding: '48px 24px 24px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '48px',
          marginBottom: '48px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#0D5F2B',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <span style={{ fontSize: '18px', fontWeight: 700, color: '#1F2937' }}>
                TaxSimple
              </span>
            </div>
            <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.6 }}>
              Smart, simple tax filing for Canadians. File your taxes with confidence.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#1F2937', marginBottom: '16px' }}>
              Product
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link to="/" style={{ fontSize: '14px', color: '#6B7280', textDecoration: 'none' }}>
                Features
              </Link>
              <Link to="/" style={{ fontSize: '14px', color: '#6B7280', textDecoration: 'none' }}>
                Pricing
              </Link>
              <Link to="/" style={{ fontSize: '14px', color: '#6B7280', textDecoration: 'none' }}>
                Security
              </Link>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#1F2937', marginBottom: '16px' }}>
              Support
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link to="/support" style={{ fontSize: '14px', color: '#6B7280', textDecoration: 'none' }}>
                Help Center
              </Link>
              <Link to="/support" style={{ fontSize: '14px', color: '#6B7280', textDecoration: 'none' }}>
                Contact Us
              </Link>
              <Link to="/support" style={{ fontSize: '14px', color: '#6B7280', textDecoration: 'none' }}>
                FAQ
              </Link>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#1F2937', marginBottom: '16px' }}>
              Legal
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link to="/privacy" style={{ fontSize: '14px', color: '#6B7280', textDecoration: 'none' }}>
                Privacy Policy
              </Link>
              <Link to="/terms" style={{ fontSize: '14px', color: '#6B7280', textDecoration: 'none' }}>
                Terms of Service
              </Link>
            </div>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid #E5E7EB',
          paddingTop: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <p style={{ fontSize: '13px', color: '#9CA3AF' }}>
            {currentYear} TaxSimple. All rights reserved.
          </p>
          <p style={{ fontSize: '13px', color: '#9CA3AF' }}>
            Made with care for Canadians
          </p>
        </div>
      </div>
    </footer>
  );
}
