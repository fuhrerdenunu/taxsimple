import React from 'react';
import { Routes, Route, useParams, useLocation, Navigate, Link } from 'react-router-dom';
import { TaxNavSidebar } from '../../components/layout/TaxNavSidebar';
import { ProfilePage } from './ProfilePage';
import { IncomePage } from './IncomePage';
import { DeductionsPage } from './DeductionsPage';
import { ReviewPage } from './ReviewPage';
import { CompletePage } from './CompletePage';
import { useTaxReturn } from '../../context/TaxReturnContext';
import { calculateTax, formatCurrency } from '../../domain/tax';

export function TaxWizard() {
  const { taxYear } = useParams();
  const location = useLocation();
  const year = parseInt(taxYear || '2024', 10);

  const pathParts = location.pathname.split('/');
  const currentPath = pathParts[pathParts.length - 1];
  const showSidebars = currentPath !== 'complete';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAFAFA' }}>
      {/* Top Header */}
      <header style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #E5E7EB',
        padding: '12px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <Link to="/dashboard" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              textDecoration: 'none',
              color: '#1F2937',
              fontWeight: 600,
              fontSize: '18px'
            }}>
              <span style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#0D5F2B',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '14px',
                fontWeight: 700
              }}>T</span>
              Tax
            </Link>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              backgroundColor: '#F3F4F6',
              borderRadius: '6px',
              fontSize: '14px',
              color: '#4B5563'
            }}>
              <span style={{ fontWeight: 500 }}>{year} Tax Return</span>
              <span style={{ color: '#9CA3AF' }}>▼</span>
            </div>
            <span style={{
              padding: '4px 12px',
              backgroundColor: '#E5E7EB',
              borderRadius: '4px',
              fontSize: '12px',
              color: '#6B7280'
            }}>Saved</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <span style={{
              padding: '6px 12px',
              border: '1px solid #E5E7EB',
              borderRadius: '20px',
              fontSize: '13px',
              color: '#6B7280'
            }}>
              Basic Plan
            </span>
            <button style={{
              padding: '8px 20px',
              backgroundColor: '#F3F4F6',
              border: '1px solid #E5E7EB',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer'
            }}>
              Upgrade
            </button>
            <Link to="/dashboard" style={{
              fontSize: '14px',
              color: '#6B7280',
              textDecoration: 'none'
            }}>
              Tax documents
            </Link>
            <button style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '14px',
              color: '#6B7280',
              cursor: 'pointer'
            }}>
              Account ▼
            </button>
            <Link to="/help" style={{
              fontSize: '14px',
              color: '#6B7280',
              textDecoration: 'none'
            }}>
              Help
            </Link>
          </div>
        </div>
      </header>

      {/* Title Section */}
      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderBottom: '1px solid #E5E7EB'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 600,
            color: '#1F2937',
            margin: 0
          }}>
            Your {year} Tax Return
          </h1>
        </div>
      </div>

      {/* Main Layout */}
      <main style={{ padding: '24px' }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          gap: '32px'
        }}>
          {/* Left Navigation Sidebar */}
          {showSidebars && (
            <TaxNavSidebar />
          )}

          {/* Main Content */}
          <div style={{
            flex: 1,
            maxWidth: '800px',
            minWidth: 0
          }}>
            <Routes>
              <Route path="profile" element={<ProfilePage />} />
              <Route path="income" element={<IncomePage />} />
              <Route path="deductions" element={<DeductionsPage />} />
              <Route path="review" element={<ReviewPage />} />
              <Route path="complete" element={<CompletePage />} />
              <Route path="*" element={<Navigate to="profile" replace />} />
            </Routes>
          </div>

          {/* Right Refund Sidebar */}
          {showSidebars && (
            <RefundSidebarCompact />
          )}
        </div>
      </main>

      {/* Mobile Bottom Bar */}
      {showSidebars && <MobileRefundBar />}
    </div>
  );
}

function RefundSidebarCompact() {
  const { getTaxInput, state } = useTaxReturn();
  const taxInput = getTaxInput();
  const result = calculateTax(taxInput);

  const firstName = state.profile.firstName || 'You';
  const spouseName = state.profile.spouse?.firstName;
  const isFilingTogether = state.profile.spouse?.filingTogether;

  return (
    <div style={{
      width: '200px',
      flexShrink: 0,
      position: 'sticky',
      top: '160px'
    }}>
      {/* Main person refund */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        marginBottom: '16px'
      }}>
        <p style={{
          fontSize: '13px',
          color: '#6B7280',
          marginBottom: '4px'
        }}>
          {firstName}
        </p>
        <p style={{
          fontSize: '28px',
          fontWeight: 700,
          color: result.isRefund ? '#059669' : '#DC2626',
          margin: 0
        }}>
          {result.isRefund ? '+' : '-'}{formatCurrency(Math.abs(result.refundOrOwing), false)}
        </p>
        <p style={{
          fontSize: '12px',
          color: '#9CA3AF',
          marginTop: '4px'
        }}>
          {result.isRefund ? 'Estimated refund' : 'Balance owing'}
        </p>
      </div>

      {/* Spouse refund if filing together */}
      {isFilingTogether && spouseName && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <p style={{
            fontSize: '13px',
            color: '#6B7280',
            marginBottom: '4px'
          }}>
            {spouseName}
          </p>
          <p style={{
            fontSize: '28px',
            fontWeight: 700,
            color: '#059669',
            margin: 0
          }}>
            +$0.00
          </p>
          <p style={{
            fontSize: '12px',
            color: '#9CA3AF',
            marginTop: '4px'
          }}>
            Estimated refund
          </p>
        </div>
      )}
    </div>
  );
}

function MobileRefundBar() {
  const { getTaxInput } = useTaxReturn();
  const taxInput = getTaxInput();
  const result = calculateTax(taxInput);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderTop: '1px solid #E5E7EB',
        padding: '12px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 100
      }}
      className="mobile-refund-bar"
    >
      <style>{`
        @media (min-width: 1024px) {
          .mobile-refund-bar {
            display: none !important;
          }
        }
      `}</style>
      <span style={{ fontSize: '14px', color: '#6B7280' }}>
        {result.isRefund ? 'Estimated Refund' : 'Balance Owing'}
      </span>
      <span style={{
        fontSize: '20px',
        fontWeight: 700,
        color: result.isRefund ? '#059669' : '#DC2626'
      }}>
        {formatCurrency(Math.abs(result.refundOrOwing), false)}
      </span>
    </div>
  );
}
