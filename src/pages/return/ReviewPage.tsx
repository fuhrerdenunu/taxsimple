import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTaxReturn } from '../../context/TaxReturnContext';
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

function validateReturn(profile: any, taxReturn: any): ValidationIssue[] {
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
            <div key={issue.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px',
              marginBottom: '8px',
              backgroundColor: '#FEE2E2',
              borderRadius: '8px'
            }}>
              <span style={{ color: '#991B1B' }}>{issue.message}</span>
              {issue.action && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => navigate(`/return/${taxYear}/${issue.action!.path}`)}
                >
                  {issue.action.label}
                </Button>
              )}
            </div>
          ))}

          {warnings.map(issue => (
            <div key={issue.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px',
              marginBottom: '8px',
              backgroundColor: '#FEF3C7',
              borderRadius: '8px'
            }}>
              <span style={{ color: '#92400E' }}>{issue.message}</span>
              {issue.action && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => navigate(`/return/${taxYear}/${issue.action!.path}`)}
                >
                  {issue.action.label}
                </Button>
              )}
            </div>
          ))}

          {suggestions.map(issue => (
            <div key={issue.id} style={{
              padding: '12px',
              marginBottom: '8px',
              backgroundColor: '#EFF6FF',
              borderRadius: '8px',
              color: '#1E40AF'
            }}>
              {issue.message}
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
