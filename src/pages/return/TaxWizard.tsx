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

// Glassmorphism styles
const glassStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.7)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
};

const glassStyleDark: React.CSSProperties = {
  background: 'rgba(15, 23, 42, 0.8)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
};

export function TaxWizard() {
  const { taxYear } = useParams();
  const location = useLocation();
  const year = parseInt(taxYear || '2024', 10);

  const pathParts = location.pathname.split('/');
  const currentPath = pathParts[pathParts.length - 1];
  const showSidebars = currentPath !== 'complete';

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      backgroundAttachment: 'fixed'
    }}>
      {/* Animated background orbs */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0
      }}>
        <div style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
          borderRadius: '50%',
          top: '-200px',
          right: '-100px',
          animation: 'float 20s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
          borderRadius: '50%',
          bottom: '-100px',
          left: '-100px',
          animation: 'float 15s ease-in-out infinite reverse'
        }} />
        <div style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          top: '40%',
          left: '30%',
          animation: 'float 25s ease-in-out infinite'
        }} />
        <style>{`
          @keyframes float {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(30px, -30px) scale(1.05); }
            66% { transform: translate(-20px, 20px) scale(0.95); }
          }
        `}</style>
      </div>

      {/* Top Header */}
      <header style={{
        ...glassStyle,
        borderRadius: 0,
        borderTop: 'none',
        borderLeft: 'none',
        borderRight: 'none',
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
                width: '36px',
                height: '36px',
                background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '16px',
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.4)'
              }}>T</span>
              <span style={{ color: '#1F2937' }}>Tax</span>
            </Link>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              ...glassStyle,
              borderRadius: '12px',
              fontSize: '14px',
              color: '#4B5563'
            }}>
              <span style={{ fontWeight: 600 }}>{year} Tax Return</span>
              <span style={{ color: '#9CA3AF' }}>▼</span>
            </div>
            <span style={{
              padding: '6px 14px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.2) 100%)',
              borderRadius: '20px',
              fontSize: '12px',
              color: '#059669',
              fontWeight: 500,
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}>Auto-saved</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{
              padding: '8px 16px',
              ...glassStyle,
              borderRadius: '20px',
              fontSize: '13px',
              color: '#6B7280'
            }}>
              Basic Plan
            </span>
            <button style={{
              padding: '10px 24px',
              background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
              border: 'none',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: 600,
              color: 'white',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}>
              Upgrade
            </button>
            <Link to="/dashboard" style={{
              fontSize: '14px',
              color: '#4B5563',
              textDecoration: 'none',
              fontWeight: 500
            }}>
              Documents
            </Link>
            <Link to="/help" style={{
              fontSize: '14px',
              color: '#4B5563',
              textDecoration: 'none',
              fontWeight: 500
            }}>
              Help
            </Link>
          </div>
        </div>
      </header>

      {/* Title Section */}
      <div style={{
        padding: '32px 24px',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 700,
            color: 'white',
            margin: 0,
            textShadow: '0 2px 10px rgba(0,0,0,0.2)'
          }}>
            Your {year} Tax Return
          </h1>
          <p style={{
            fontSize: '16px',
            color: 'rgba(255,255,255,0.8)',
            marginTop: '8px'
          }}>
            Let's get you the best refund possible
          </p>
        </div>
      </div>

      {/* Main Layout */}
      <main style={{ padding: '0 24px 24px', position: 'relative', zIndex: 1 }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          gap: '24px'
        }}>
          {/* LEFT - Refund Sidebar */}
          {showSidebars && (
            <RefundSidebarGlass />
          )}

          {/* CENTER - Main Content */}
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

          {/* RIGHT - Navigation Sidebar */}
          {showSidebars && (
            <TaxNavSidebarGlass />
          )}
        </div>
      </main>

      {/* Mobile Bottom Bar */}
      {showSidebars && <MobileRefundBar />}
    </div>
  );
}

function RefundSidebarGlass() {
  const { getTaxInput, state } = useTaxReturn();
  const taxInput = getTaxInput();
  const result = calculateTax(taxInput);

  const firstName = state.profile.firstName || 'You';
  const spouseName = state.profile.spouse?.firstName;
  const isFilingTogether = state.profile.spouse?.filingTogether;

  return (
    <div style={{
      width: '220px',
      flexShrink: 0,
      position: 'sticky',
      top: '100px',
      height: 'fit-content'
    }}>
      {/* Main person refund card */}
      <div style={{
        ...glassStyle,
        borderRadius: '20px',
        padding: '24px',
        marginBottom: '16px',
        textAlign: 'center'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          background: result.isRefund
            ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
            : 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          boxShadow: result.isRefund
            ? '0 4px 20px rgba(16, 185, 129, 0.4)'
            : '0 4px 20px rgba(239, 68, 68, 0.4)'
        }}>
          <span style={{ color: 'white', fontSize: '20px' }}>
            {result.isRefund ? '↑' : '↓'}
          </span>
        </div>

        <p style={{
          fontSize: '14px',
          color: '#6B7280',
          marginBottom: '4px',
          fontWeight: 500
        }}>
          {firstName}
        </p>

        <p style={{
          fontSize: '36px',
          fontWeight: 800,
          background: result.isRefund
            ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
            : 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          margin: '0 0 4px'
        }}>
          {result.isRefund ? '+' : '-'}{formatCurrency(Math.abs(result.refundOrOwing), false)}
        </p>

        <p style={{
          fontSize: '12px',
          color: '#9CA3AF',
          margin: 0
        }}>
          {result.isRefund ? 'Estimated refund' : 'Balance owing'}
        </p>

        {/* Mini breakdown */}
        <div style={{
          marginTop: '20px',
          paddingTop: '16px',
          borderTop: '1px solid rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: '#6B7280' }}>Income</span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>
              {formatCurrency(result.totalIncome)}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: '#6B7280' }}>Tax</span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>
              {formatCurrency(result.totalTax)}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', color: '#6B7280' }}>Withheld</span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#059669' }}>
              {formatCurrency(taxInput.taxWithheld)}
            </span>
          </div>
        </div>
      </div>

      {/* Spouse refund card */}
      {isFilingTogether && spouseName && (
        <div style={{
          ...glassStyle,
          borderRadius: '20px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: '13px',
            color: '#6B7280',
            marginBottom: '4px'
          }}>
            {spouseName}
          </p>
          <p style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#059669',
            margin: 0
          }}>
            +$0.00
          </p>
          <p style={{
            fontSize: '11px',
            color: '#9CA3AF',
            marginTop: '4px'
          }}>
            Add income to calculate
          </p>
        </div>
      )}

      {/* Province indicator */}
      <div style={{
        ...glassStyle,
        borderRadius: '16px',
        padding: '16px',
        marginTop: '16px',
        textAlign: 'center'
      }}>
        <p style={{ fontSize: '11px', color: '#9CA3AF', margin: '0 0 4px' }}>
          Filing in
        </p>
        <p style={{ fontSize: '14px', fontWeight: 600, color: '#374151', margin: 0 }}>
          {state.profile.province || 'Ontario'}
        </p>
      </div>
    </div>
  );
}

function TaxNavSidebarGlass() {
  const { taxYear } = useParams();
  const location = useLocation();
  const currentPath = location.pathname.split('/').pop();

  const navItems = [
    { id: 'profile', label: 'About You', icon: '👤', path: 'profile' },
    { id: 'income', label: 'Income', icon: '💰', path: 'income' },
    { id: 'deductions', label: 'Deductions', icon: '📋', path: 'deductions' },
    { id: 'review', label: 'Review', icon: '✓', path: 'review' }
  ];

  return (
    <div style={{
      width: '200px',
      flexShrink: 0,
      position: 'sticky',
      top: '100px',
      height: 'fit-content'
    }}>
      <div style={{
        ...glassStyle,
        borderRadius: '20px',
        padding: '16px',
        overflow: 'hidden'
      }}>
        <p style={{
          fontSize: '11px',
          fontWeight: 600,
          color: '#9CA3AF',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          margin: '0 0 12px 8px'
        }}>
          Navigation
        </p>

        {navItems.map((item, index) => {
          const isActive = item.path === currentPath;
          const isCompleted = navItems.findIndex(n => n.path === currentPath) > index;

          return (
            <Link
              key={item.id}
              to={`/return/${taxYear}/${item.path}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                marginBottom: '4px',
                borderRadius: '12px',
                textDecoration: 'none',
                background: isActive
                  ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(124, 58, 237, 0.2) 100%)'
                  : 'transparent',
                border: isActive ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid transparent',
                transition: 'all 0.2s'
              }}
            >
              <span style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                background: isCompleted
                  ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                  : isActive
                    ? 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)'
                    : 'rgba(0,0,0,0.05)',
                color: isCompleted || isActive ? 'white' : '#6B7280'
              }}>
                {isCompleted ? '✓' : item.icon}
              </span>
              <span style={{
                fontSize: '14px',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#7C3AED' : '#4B5563'
              }}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Quick actions */}
      <div style={{
        ...glassStyle,
        borderRadius: '16px',
        padding: '16px',
        marginTop: '16px'
      }}>
        <button style={{
          width: '100%',
          padding: '12px',
          background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
          border: 'none',
          borderRadius: '12px',
          color: 'white',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)',
          transition: 'transform 0.2s'
        }}>
          + Add Form
        </button>
      </div>
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
        ...glassStyle,
        borderRadius: '20px 20px 0 0',
        padding: '16px 24px',
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
      <div>
        <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>
          {result.isRefund ? 'Estimated Refund' : 'Balance Owing'}
        </p>
        <p style={{
          fontSize: '24px',
          fontWeight: 700,
          margin: 0,
          background: result.isRefund
            ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
            : 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          {formatCurrency(Math.abs(result.refundOrOwing), false)}
        </p>
      </div>
      <button style={{
        padding: '12px 24px',
        background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
        border: 'none',
        borderRadius: '12px',
        color: 'white',
        fontSize: '14px',
        fontWeight: 600,
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)'
      }}>
        Continue →
      </button>
    </div>
  );
}
