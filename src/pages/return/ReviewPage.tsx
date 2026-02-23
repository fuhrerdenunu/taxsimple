import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTaxReturn, Profile, TaxReturn } from '../../context/TaxReturnContext';
import { calculateTax, formatCurrency, CURRENT_TAX_YEAR } from '../../domain/tax';
import { validateSIN } from '../../domain/tax/validators/sin';
import { calculateReadinessScores } from '../../utils/return-readiness';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Alert } from '../../components/ui/Alert';
import { useReturnRouteSync } from './useReturnRouteSync';

interface ValidationIssue {
  id: string;
  type: 'error' | 'warning' | 'suggestion';
  message: string;
  action?: { label: string; path: string };
}

function validateReturn(profile: Profile, taxReturn: TaxReturn): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!profile.firstName) {
    issues.push({ id: 'missing-first-name', type: 'error', message: 'First name is required', action: { label: 'Fix', path: 'profile' } });
  }
  if (!profile.lastName) {
    issues.push({ id: 'missing-last-name', type: 'error', message: 'Last name is required', action: { label: 'Fix', path: 'profile' } });
  }
  if (!profile.sin || !validateSIN(profile.sin)) {
    issues.push({ id: 'invalid-sin', type: 'error', message: 'A valid Social Insurance Number is required', action: { label: 'Fix', path: 'profile' } });
  }
  if (!profile.dateOfBirth) {
    issues.push({ id: 'missing-dob', type: 'error', message: 'Date of birth is required', action: { label: 'Fix', path: 'profile' } });
  }

  if (taxReturn.slips.length === 0 && taxReturn.otherIncome.selfEmployment === 0) {
    issues.push({ id: 'no-income', type: 'warning', message: 'No income has been reported. Is this correct?', action: { label: 'Add Income', path: 'income' } });
  }

  if (taxReturn.deductions.rrsp === 0 && taxReturn.deductions.fhsa === 0) {
    issues.push({ id: 'no-rrsp', type: 'suggestion', message: 'Consider RRSP or FHSA contributions to reduce your taxable income' });
  }

  return issues;
}

export function ReviewPage() {
  const navigate = useNavigate();
  const { state, dispatch, getTaxInput } = useTaxReturn();
  const { year: routeYear, personId } = useReturnRouteSync('primary');

  const taxInput = getTaxInput(routeYear, personId);
  const taxResult = calculateTax(taxInput);
  const issues = validateReturn(state.profile, state.currentReturn);
  const readinessScores = calculateReadinessScores(state.profile, state.currentReturn);
  const unit = state.returnsByYear[routeYear];

  const errors = issues.filter(i => i.type === 'error');
  const warnings = issues.filter(i => i.type === 'warning');
  const suggestions = issues.filter(i => i.type === 'suggestion');
  const isReady = errors.length === 0;

  const handleComplete = () => {
    if (isReady) {
      dispatch({ type: 'SET_STATUS', payload: 'completed' });
      navigate(`/return/${routeYear}/person/${personId}/submit`);
    }
  };

  const status = errors.length > 0
    ? { bg: '#FEE2E2', color: '#991B1B', label: 'Not Ready' }
    : warnings.length > 0
      ? { bg: '#FEF3C7', color: '#92400E', label: 'Review Needed' }
      : { bg: '#D1FAE5', color: '#065F46', label: 'Ready to File' };

  const taxBreakdown = [
    { label: 'Federal Tax', value: taxResult.federalTax },
    { label: `Provincial Tax (${taxResult.provinceName})`, value: taxResult.provincialTax },
    ...(taxResult.healthPremium > 0 ? [{ label: 'Ontario Health Premium', value: taxResult.healthPremium }] : [])
  ];

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px', color: '#1F2937' }}>
        Review Your Return
      </h1>
      <p style={{ fontSize: '15px', color: '#6B7280', marginBottom: '24px' }}>
        Review your {routeYear} tax return before completing.
      </p>

      {(routeYear !== state.currentReturn.year || routeYear !== CURRENT_TAX_YEAR) && (
        <Alert type="warning" title="Tax year check">
          You are reviewing year {routeYear}, while your in-progress return is {state.currentReturn.year} and the active engine is {CURRENT_TAX_YEAR}. Confirm that your filing year is correct before completing.
        </Alert>
      )}

      {unit?.jointOptimization.enabled && (
        <Card style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px', color: '#1F2937' }}>Joint optimization suggestions</h2>
          {unit.jointOptimization.recommendations.length === 0 ? (
            <p style={{ margin: 0, color: '#6B7280', fontSize: '14px' }}>
              No custom recommendations yet. Continue entering both returns to unlock split optimization.
            </p>
          ) : (
            <div style={{ display: 'grid', gap: '10px' }}>
              {unit.jointOptimization.recommendations.map((rec) => (
                <div key={rec.id} style={{ border: '1px solid #E5E7EB', borderRadius: '8px', padding: '10px 12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <strong>{rec.title}</strong>
                    <span style={{ color: '#065F46', fontWeight: 600 }}>{formatCurrency(rec.impact)}</span>
                  </div>
                  <div style={{ color: '#6B7280', fontSize: '13px' }}>{rec.rationale}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      <Card style={{ marginBottom: '24px', backgroundColor: status.bg }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isReady ? '✓' : '!'}
          </div>
          <div>
            <p style={{ fontWeight: 600, color: status.color, fontSize: '18px' }}>{status.label}</p>
            <p style={{ fontSize: '14px', color: status.color, opacity: 0.8 }}>
              {errors.length > 0 ? `${errors.length} issue(s) to fix` : warnings.length > 0 ? `${warnings.length} warning(s) to review` : 'Your return is complete'}
            </p>
          </div>
        </div>
      </Card>

      <Card style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: '#1F2937' }}>Filing Confidence Dashboard</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          {[
            { label: 'Completeness', value: readinessScores.completeness, tone: '#065F46', bg: '#ECFDF5' },
            { label: 'Data Confidence', value: readinessScores.dataConfidence, tone: '#1E40AF', bg: '#EFF6FF' },
            { label: 'Optimization Coverage', value: readinessScores.optimizationCoverage, tone: '#92400E', bg: '#FFFBEB' }
          ].map((metric) => (
            <div key={metric.label} style={{ background: metric.bg, borderRadius: '8px', padding: '12px 14px' }}>
              <p style={{ color: '#6B7280', fontSize: '13px', marginBottom: '4px' }}>{metric.label}</p>
              <p style={{ color: metric.tone, fontSize: '24px', fontWeight: 700 }}>{metric.value}%</p>
            </div>
          ))}
        </div>
      </Card>

      {issues.length > 0 && (
        <Card style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: '#1F2937' }}>Issues to Address</h2>
          {issues.map((issue) => (
            <div key={issue.id} style={{ marginBottom: '8px' }}>
              <button
                onClick={() => issue.action && navigate(`/return/${routeYear}/person/${personId}/workspace`)}
                style={{
                  width: '100%', textAlign: 'left', border: 'none', borderRadius: '8px', padding: '12px 16px',
                  cursor: issue.action ? 'pointer' : 'default',
                  backgroundColor: issue.type === 'error' ? '#FEE2E2' : issue.type === 'warning' ? '#FEF3C7' : '#EFF6FF'
                }}
              >
                <span style={{ fontWeight: 500 }}>{issue.message}</span>
                {issue.action && <span style={{ marginLeft: '8px', fontSize: '13px' }}>({issue.action.label})</span>}
              </button>
            </div>
          ))}
        </Card>
      )}

      <Card style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px', color: '#1F2937' }}>Tax Summary</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#6B7280' }}>Total Income</span><span style={{ fontWeight: 500 }}>{formatCurrency(taxResult.totalIncome)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#6B7280' }}>Total Deductions</span><span style={{ fontWeight: 500 }}>-{formatCurrency(taxResult.totalDeductions)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E5E7EB', paddingTop: '12px' }}><span style={{ fontWeight: 500 }}>Taxable Income</span><span style={{ fontWeight: 600 }}>{formatCurrency(taxResult.taxableIncome)}</span></div>
          {taxBreakdown.map((line) => (
            <div key={line.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6B7280' }}>{line.label}</span>
              <span style={{ fontWeight: 500 }}>{formatCurrency(line.value)}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E5E7EB', paddingTop: '12px' }}><span style={{ fontWeight: 500 }}>Total Tax</span><span style={{ fontWeight: 600 }}>{formatCurrency(taxResult.totalTax)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#6B7280' }}>Tax Already Paid</span><span style={{ fontWeight: 500 }}>-{formatCurrency(taxResult.totalWithheld)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', padding: '16px', backgroundColor: taxResult.isRefund ? '#D1FAE5' : '#FEE2E2', borderRadius: '8px' }}>
            <span style={{ fontWeight: 600, color: taxResult.isRefund ? '#065F46' : '#991B1B' }}>{taxResult.isRefund ? 'Your Refund' : 'Amount Owing'}</span>
            <span style={{ fontWeight: 700, fontSize: '20px', color: taxResult.isRefund ? '#065F46' : '#991B1B' }}>{formatCurrency(Math.abs(taxResult.refundOrOwing))}</span>
          </div>
        </div>
      </Card>

      <Card style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '14px', color: '#1F2937' }}>Why this number?</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <p style={{ color: '#6B7280', margin: 0 }}>The estimate uses {CURRENT_TAX_YEAR} federal/provincial rules and your selected province ({taxResult.provinceName}).</p>
          <p style={{ color: '#6B7280', margin: 0 }}>Taxable income = Total income ({formatCurrency(taxResult.totalIncome)}) − Deductions ({formatCurrency(taxResult.totalDeductions)}).</p>
          <p style={{ color: '#6B7280', margin: 0 }}>Total tax = Federal ({formatCurrency(taxResult.federalTax)}) + Provincial ({formatCurrency(taxResult.provincialTax)}){taxResult.healthPremium > 0 ? ` + Health premium (${formatCurrency(taxResult.healthPremium)})` : ''}.</p>
        </div>
      </Card>

      {state.profile.province === 'QC' && (
        <Alert type="warning" title="Quebec Residents">
          This completes your federal return. Remember to file your TP-1 with Revenu Quebec for your provincial taxes.
        </Alert>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
        <Button variant="secondary" onClick={() => navigate(`/return/${routeYear}/person/${personId}/workspace`)}>Back</Button>
        <Button onClick={handleComplete} disabled={!isReady}>Complete Return</Button>
      </div>
    </div>
  );
}
