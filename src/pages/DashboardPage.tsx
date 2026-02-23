import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTaxReturn } from '../context/TaxReturnContext';
import { calculateTax, formatCurrency, CURRENT_TAX_YEAR } from '../domain/tax';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

const statusConfig = {
  not_started: { label: 'Not Started', color: '#6B7280', bg: '#F3F4F6' },
  in_progress: { label: 'In Progress', color: '#D97706', bg: '#FEF3C7' },
  ready_to_review: { label: 'Ready to Review', color: '#059669', bg: '#D1FAE5' },
  completed: { label: 'Completed', color: '#0D5F2B', bg: '#E8F5E9' }
};

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { state, dispatch, getTaxInput } = useTaxReturn();

  const taxYears = [CURRENT_TAX_YEAR, CURRENT_TAX_YEAR - 1, CURRENT_TAX_YEAR - 2, CURRENT_TAX_YEAR - 3];
  const activeUnit = state.returnsByYear[state.activeYear];

  const handleStartReturn = (year: number) => {
    dispatch({ type: 'CREATE_YEAR_RETURN', payload: year });
    dispatch({ type: 'SET_ACTIVE_PERSON', payload: 'primary' });
    navigate(`/return/${year}/person/primary/profile`);
  };

  const handleContinueReturn = () => {
    const year = state.activeYear;
    const status = activeUnit?.status ?? 'not_started';

    // Navigate to appropriate step based on status
    if (status === 'not_started') {
      navigate(`/return/${year}/person/primary/profile`);
    } else if (status === 'completed') {
      navigate(`/return/${year}/person/primary/submit`);
    } else {
      navigate(`/return/${year}/person/primary/workspace`);
    }
  };

  // Calculate current tax estimate
  const taxInput = getTaxInput(state.activeYear, 'primary');
  const taxResult = calculateTax(taxInput);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F9FAFB' }}>
      <Header />

      <main style={{ flex: 1, padding: '32px 24px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {/* Welcome Section */}
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1F2937', marginBottom: '8px' }}>
              Welcome back, {user?.name?.split(' ')[0] || 'there'}
            </h1>
            <p style={{ fontSize: '16px', color: '#6B7280' }}>
              Here's an overview of your tax returns
            </p>
          </div>

          {/* Current Return Summary */}
          {(activeUnit?.status ?? 'not_started') !== 'not_started' && (
            <Card style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#1F2937' }}>
                      {state.activeYear} Tax Return
                    </h2>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '13px',
                      fontWeight: 500,
                      backgroundColor: statusConfig[activeUnit?.status ?? 'not_started'].bg,
                      color: statusConfig[activeUnit?.status ?? 'not_started'].color
                    }}>
                      {statusConfig[activeUnit?.status ?? 'not_started'].label}
                    </span>
                  </div>
                  <p style={{ fontSize: '14px', color: '#6B7280' }}>
                    Last updated: {activeUnit?.lastModified ? new Date(activeUnit.lastModified).toLocaleDateString() : 'N/A'}
                  </p>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '4px' }}>
                    {taxResult.isRefund ? 'Estimated Refund' : 'Estimated Owing'}
                  </p>
                  <p style={{
                    fontSize: '32px',
                    fontWeight: 700,
                    color: taxResult.isRefund ? '#0D5F2B' : '#DC2626'
                  }}>
                    {formatCurrency(Math.abs(taxResult.refundOrOwing))}
                  </p>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '16px',
                marginTop: '24px',
                paddingTop: '24px',
                borderTop: '1px solid #E5E7EB'
              }}>
                <div>
                  <p style={{ fontSize: '13px', color: '#6B7280' }}>Total Income</p>
                  <p style={{ fontSize: '18px', fontWeight: 600, color: '#1F2937' }}>
                    {formatCurrency(taxResult.totalIncome)}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '13px', color: '#6B7280' }}>Total Tax</p>
                  <p style={{ fontSize: '18px', fontWeight: 600, color: '#1F2937' }}>
                    {formatCurrency(taxResult.totalTax)}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '13px', color: '#6B7280' }}>Tax Withheld</p>
                  <p style={{ fontSize: '18px', fontWeight: 600, color: '#1F2937' }}>
                    {formatCurrency(taxResult.totalWithheld)}
                  </p>
                </div>
              </div>

              <div style={{ marginTop: '24px' }}>
                <Button onClick={handleContinueReturn}>
                  {(activeUnit?.status ?? 'not_started') === 'completed' ? 'View Return' : 'Continue Return'}
                </Button>
              </div>
            </Card>
          )}

          {/* Tax Year Cards */}
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1F2937', marginBottom: '16px' }}>
            Tax Years
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '16px'
          }}>
            {taxYears.map(year => {
              const unit = state.returnsByYear[year];
              const status = unit?.status ?? 'not_started';
              const config = statusConfig[status];

              return (
                <Card key={year} hoverable>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#1F2937', marginBottom: '8px' }}>
                        {year}
                      </h3>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        borderRadius: '10px',
                        fontSize: '12px',
                        fontWeight: 500,
                        backgroundColor: config.bg,
                        color: config.color
                      }}>
                        {config.label}
                      </span>
                    </div>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      backgroundColor: year === CURRENT_TAX_YEAR ? '#E8F5E9' : '#F3F4F6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: year === CURRENT_TAX_YEAR ? '#0D5F2B' : '#6B7280'
                    }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    </div>
                  </div>

                  <div style={{ marginTop: '20px' }}>
                    <Button
                      variant={status === 'not_started' ? 'primary' : 'secondary'}
                      size="sm"
                      fullWidth
                      onClick={() => handleStartReturn(year)}
                    >
                      {status === 'not_started' ? 'Start Return' :
                       status === 'completed' ? 'View Return' : 'Continue'}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
