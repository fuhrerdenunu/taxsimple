import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTaxReturn, Profile, TaxReturn } from '../../context/TaxReturnContext';
import { calculateTax, formatCurrency } from '../../domain/tax';
import { validateSIN } from '../../domain/tax/validators/sin';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Alert } from '../../components/ui/Alert';

interface ValidationIssue {
  id: string;
  type: 'error' | 'warning' | 'suggestion';
  message: string;
  action?: { label: string; path: string };
}

function validateReturn(profile: Profile, taxReturn: TaxReturn): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Errors (blocking)
  if (!profile.firstName) {
    issues.push({
      id: 'missing-first-name',
      type: 'error',
      message: 'First name is required',
      action: { label: 'Fix', path: 'profile' }
    });
  }
  if (!profile.lastName) {
    issues.push({
      id: 'missing-last-name',
      type: 'error',
      message: 'Last name is required',
      action: { label: 'Fix', path: 'profile' }
    });
  }
  if (!profile.sin || !validateSIN(profile.sin)) {
    issues.push({
      id: 'invalid-sin',
      type: 'error',
      message: 'A valid Social Insurance Number is required',
      action: { label: 'Fix', path: 'profile' }
    });
  }
  if (!profile.dateOfBirth) {
    issues.push({
      id: 'missing-dob',
      type: 'error',
      message: 'Date of birth is required',
      action: { label: 'Fix', path: 'profile' }
    });
  }

  // Warnings
  if (taxReturn.slips.length === 0 && taxReturn.otherIncome.selfEmployment === 0) {
    issues.push({
      id: 'no-income',
      type: 'warning',
      message: 'No income has been reported. Is this correct?',
      action: { label: 'Add Income', path: 'income' }
    });
  }

  // Suggestions
  if (taxReturn.deductions.rrsp === 0 && taxReturn.deductions.fhsa === 0) {
    issues.push({
      id: 'no-rrsp',
      type: 'suggestion',
      message: 'Consider RRSP or FHSA contributions to reduce your taxable income'
    });
  }

  return issues;
}

export function ReviewPage() {
  const navigate = useNavigate();
  const { taxYear } = useParams();
  const { state, dispatch, getTaxInput } = useTaxReturn();

  const taxInput = getTaxInput();
  const taxResult = calculateTax(taxInput);
  const issues = validateReturn(state.profile, state.currentReturn);

  const errors = issues.filter(i => i.type === 'error');
  const warnings = issues.filter(i => i.type === 'warning');
  const suggestions = issues.filter(i => i.type === 'suggestion');

  const isReady = errors.length === 0;

  const handleComplete = () => {
    if (isReady) {
      dispatch({ type: 'SET_STATUS', payload: 'completed' });
      navigate(`/return/${taxYear}/complete`);
    }
  };

  const getStatusColor = () => {
    if (errors.length > 0) return { bg: '#FEE2E2', color: '#991B1B', label: 'Not Ready' };
    if (warnings.length > 0) return { bg: '#FEF3C7', color: '#92400E', label: 'Review Needed' };
    return { bg: '#D1FAE5', color: '#065F46', label: 'Ready to File' };
  };

  const status = getStatusColor();

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px', color: '#1F2937' }}>
        Review Your Return
      </h1>
      <p style={{ fontSize: '15px', color: '#6B7280', marginBottom: '32px' }}>
        Review your {taxYear} tax return before completing.
      </p>

      {/* Readiness Meter */}
      <Card style={{ marginBottom: '24px', backgroundColor: status.bg }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {isReady ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={status.color} strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={status.color} strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            )}
          </div>
          <div>
            <p style={{ fontWeight: 600, color: status.color, fontSize: '18px' }}>
              {status.label}
            </p>
            <p style={{ fontSize: '14px', color: status.color, opacity: 0.8 }}>
              {errors.length > 0 ? `${errors.length} issue(s) to fix` :
               warnings.length > 0 ? `${warnings.length} warning(s) to review` :
               'Your return is complete'}
            </p>
          </div>
        </div>
      </Card>

      {/* Issues */}
      {issues.length > 0 && (
        <Card style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: '#1F2937' }}>
            Issues to Address
          </h2>

          {errors.map(issue => (
            <div
              key={issue.id}
              onClick={() => issue.action && navigate(`/return/${taxYear}/${issue.action.path}`)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                marginBottom: '8px',
                backgroundColor: '#FEE2E2',
                borderRadius: '8px',
                cursor: issue.action ? 'pointer' : 'default',
                transition: 'transform 0.1s ease, box-shadow 0.1s ease',
                border: '1px solid #FECACA'
              }}
              onMouseEnter={(e) => {
                if (issue.action) {
                  e.currentTarget.style.transform = 'translateX(4px)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateX(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              role={issue.action ? 'button' : undefined}
              tabIndex={issue.action ? 0 : undefined}
              onKeyDown={(e) => {
                if (issue.action && (e.key === 'Enter' || e.key === ' ')) {
                  navigate(`/return/${taxYear}/${issue.action.path}`);
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                <span style={{ color: '#991B1B', fontWeight: 500 }}>{issue.message}</span>
              </div>
              {issue.action && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#991B1B' }}>
                  <span style={{ fontSize: '14px' }}>{issue.action.label}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              )}
            </div>
          ))}

          {warnings.map(issue => (
            <div
              key={issue.id}
              onClick={() => issue.action && navigate(`/return/${taxYear}/${issue.action.path}`)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                marginBottom: '8px',
                backgroundColor: '#FEF3C7',
                borderRadius: '8px',
                cursor: issue.action ? 'pointer' : 'default',
                transition: 'transform 0.1s ease, box-shadow 0.1s ease',
                border: '1px solid #FDE68A'
              }}
              onMouseEnter={(e) => {
                if (issue.action) {
                  e.currentTarget.style.transform = 'translateX(4px)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateX(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              role={issue.action ? 'button' : undefined}
              tabIndex={issue.action ? 0 : undefined}
              onKeyDown={(e) => {
                if (issue.action && (e.key === 'Enter' || e.key === ' ')) {
                  navigate(`/return/${taxYear}/${issue.action.path}`);
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <span style={{ color: '#92400E', fontWeight: 500 }}>{issue.message}</span>
              </div>
              {issue.action && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#92400E' }}>
                  <span style={{ fontSize: '14px' }}>{issue.action.label}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              )}
            </div>
          ))}

          {suggestions.map(issue => (
            <div
              key={issue.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                marginBottom: '8px',
                backgroundColor: '#EFF6FF',
                borderRadius: '8px',
                border: '1px solid #BFDBFE'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span style={{ color: '#1E40AF', fontWeight: 500 }}>{issue.message}</span>
            </div>
          ))}
        </Card>
      )}

      {/* Tax Summary */}
      <Card style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px', color: '#1F2937' }}>
          Tax Summary
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#6B7280' }}>Total Income</span>
            <span style={{ fontWeight: 500 }}>{formatCurrency(taxResult.totalIncome)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#6B7280' }}>Total Deductions</span>
            <span style={{ fontWeight: 500 }}>-{formatCurrency(taxResult.totalDeductions)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E5E7EB', paddingTop: '12px' }}>
            <span style={{ fontWeight: 500 }}>Taxable Income</span>
            <span style={{ fontWeight: 600 }}>{formatCurrency(taxResult.taxableIncome)}</span>
          </div>

          <div style={{ marginTop: '12px' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#6B7280' }}>Federal Tax</span>
            <span style={{ fontWeight: 500 }}>{formatCurrency(taxResult.federalTax)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#6B7280' }}>Provincial Tax ({taxResult.provinceName})</span>
            <span style={{ fontWeight: 500 }}>{formatCurrency(taxResult.provincialTax)}</span>
          </div>
          {taxResult.healthPremium > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6B7280' }}>Ontario Health Premium</span>
              <span style={{ fontWeight: 500 }}>{formatCurrency(taxResult.healthPremium)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E5E7EB', paddingTop: '12px' }}>
            <span style={{ fontWeight: 500 }}>Total Tax</span>
            <span style={{ fontWeight: 600 }}>{formatCurrency(taxResult.totalTax)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#6B7280' }}>Tax Already Paid</span>
            <span style={{ fontWeight: 500 }}>-{formatCurrency(taxResult.totalWithheld)}</span>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '12px',
            padding: '16px',
            backgroundColor: taxResult.isRefund ? '#D1FAE5' : '#FEE2E2',
            borderRadius: '8px'
          }}>
            <span style={{ fontWeight: 600, color: taxResult.isRefund ? '#065F46' : '#991B1B' }}>
              {taxResult.isRefund ? 'Your Refund' : 'Amount Owing'}
            </span>
            <span style={{ fontWeight: 700, fontSize: '20px', color: taxResult.isRefund ? '#065F46' : '#991B1B' }}>
              {formatCurrency(Math.abs(taxResult.refundOrOwing))}
            </span>
          </div>
        </div>
      </Card>

      {/* Quebec Notice */}
      {state.profile.province === 'QC' && (
        <Alert type="warning" title="Quebec Residents">
          This completes your federal return. Remember to file your TP-1 with Revenu Quebec
          for your provincial taxes.
        </Alert>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
        <Button variant="secondary" onClick={() => navigate(`/return/${taxYear}/deductions`)}>
          Back
        </Button>
        <Button onClick={handleComplete} disabled={!isReady}>
          Complete Return
        </Button>
      </div>
    </div>
  );
}
