import React from 'react';
import { Routes, Route, useParams, useLocation, Navigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { Stepper } from '../../components/layout/Stepper';
import { RefundSidebar } from '../../components/tax/RefundSidebar';
import { ProfilePage } from './ProfilePage';
import { IncomePage } from './IncomePage';
import { DeductionsPage } from './DeductionsPage';
import { ReviewPage } from './ReviewPage';
import { CompletePage } from './CompletePage';

const steps = [
  { id: 'profile', label: 'Profile', path: 'profile' },
  { id: 'income', label: 'Income', path: 'income' },
  { id: 'deductions', label: 'Deductions', path: 'deductions' },
  { id: 'review', label: 'Review', path: 'review' },
  { id: 'complete', label: 'Complete', path: 'complete' }
];

export function TaxWizard() {
  const { taxYear } = useParams();
  const location = useLocation();
  const year = parseInt(taxYear || '2024', 10);

  // Determine current step from URL
  const pathParts = location.pathname.split('/');
  const currentPath = pathParts[pathParts.length - 1];
  const currentStep = steps.find(s => s.path === currentPath)?.id || 'profile';

  // Don't show sidebar on complete page
  const showSidebar = currentStep !== 'complete';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F9FAFB' }}>
      <Header />
      <Stepper steps={steps} currentStep={currentStep} taxYear={year} />

      <main style={{ padding: '32px 24px' }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          gap: '32px',
          alignItems: 'flex-start'
        }}>
          {/* Left sidebar with refund */}
          {showSidebar && (
            <div style={{
              display: 'none',
              '@media (min-width: 1024px)': { display: 'block' }
            } as React.CSSProperties}>
              <RefundSidebar />
            </div>
          )}

          {/* Main content */}
          <div style={{ flex: 1, maxWidth: '800px' }}>
            <Routes>
              <Route path="profile" element={<ProfilePage />} />
              <Route path="income" element={<IncomePage />} />
              <Route path="deductions" element={<DeductionsPage />} />
              <Route path="review" element={<ReviewPage />} />
              <Route path="complete" element={<CompletePage />} />
              <Route path="*" element={<Navigate to="profile" replace />} />
            </Routes>
          </div>

          {/* Right sidebar placeholder for responsive layout */}
          {showSidebar && (
            <div style={{ width: '280px', flexShrink: 0 }}>
              <RefundSidebar />
            </div>
          )}
        </div>
      </main>

      {/* Mobile fixed bottom bar showing refund */}
      {showSidebar && (
        <MobileRefundBar />
      )}
    </div>
  );
}

function MobileRefundBar() {
  // Import at component level to avoid circular deps
  const { useTaxReturn } = require('../../context/TaxReturnContext');
  const { calculateTax, formatCurrency } = require('../../domain/tax');

  const { getTaxInput } = useTaxReturn();
  const taxInput = getTaxInput();
  const result = calculateTax(taxInput);

  return (
    <div style={{
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
        {result.isRefund ? 'Est. Refund' : 'Est. Owing'}
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
