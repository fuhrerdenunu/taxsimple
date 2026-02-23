import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTaxReturn, Profile, TaxReturn } from '../../context/TaxReturnContext';
import { calculateTax, formatCurrency, CURRENT_TAX_YEAR } from '../../domain/tax';
import { validateSIN } from '../../domain/tax/validators/sin';
import { calculateReadinessScores } from '../../utils/return-readiness';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Alert } from '../../components/ui/Alert';
import { tokens } from '../../styles/tokens';
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

/* ---------- Circular progress ring ---------- */
function ConfidenceRing({ value, label, color, bgColor }: { value: number; label: string; color: string; bgColor: string }) {
  const [hovered, setHovered] = useState(false);
  const size = 100;
  const stroke = 7;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
        padding: '16px 12px',
        borderRadius: tokens.radius.lg,
        backgroundColor: hovered ? bgColor : 'transparent',
        transition: tokens.transition.default,
        cursor: 'default',
        flex: '1 1 0'
      }}
    >
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={tokens.color.borderLight} strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
        <text
          x={size / 2} y={size / 2}
          textAnchor="middle" dominantBaseline="central"
          fill={color}
          fontSize="22" fontWeight="700"
          style={{ transform: 'rotate(90deg)', transformOrigin: 'center' }}
        >
          {value}%
        </text>
      </svg>
      <span style={{ fontSize: tokens.font.size.sm, fontWeight: tokens.font.weight.medium, color: tokens.color.muted, textAlign: 'center' }}>
        {label}
      </span>
    </div>
  );
}

/* ---------- Issue row ---------- */
function IssueRow({ issue, onClick }: { issue: ValidationIssue; onClick?: () => void }) {
  const [hovered, setHovered] = useState(false);
  const typeConfig = {
    error:      { icon: 'M12 9v2m0 4h.01M12 2a10 10 0 110 20 10 10 0 010-20z', color: tokens.color.danger, bg: tokens.color.dangerLight, label: 'Error' },
    warning:    { icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z', color: '#92400E', bg: tokens.color.warningLight, label: 'Warning' },
    suggestion: { icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', color: tokens.color.info, bg: tokens.color.infoLight, label: 'Tip' }
  };
  const cfg = typeConfig[issue.type];

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%',
        textAlign: 'left',
        border: 'none',
        borderRadius: tokens.radius.md,
        padding: '14px 16px',
        cursor: issue.action ? 'pointer' : 'default',
        backgroundColor: hovered && issue.action ? cfg.bg : 'transparent',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        transition: tokens.transition.fast,
        borderBottom: `1px solid ${tokens.color.borderLight}`
      }}
    >
      <div style={{
        width: '32px', height: '32px', borderRadius: '50%',
        backgroundColor: cfg.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={cfg.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d={cfg.icon} />
        </svg>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: tokens.font.size.sm, fontWeight: tokens.font.weight.medium, color: tokens.color.text }}>{issue.message}</span>
      </div>
      {issue.action && (
        <span style={{
          fontSize: tokens.font.size.xs,
          fontWeight: tokens.font.weight.semibold,
          color: cfg.color,
          backgroundColor: cfg.bg,
          padding: '4px 10px',
          borderRadius: '20px',
          whiteSpace: 'nowrap'
        }}>
          {issue.action.label}
        </span>
      )}
    </button>
  );
}

/* ---------- Tax summary row ---------- */
function SummaryRow({ label, value, bold, divider, color }: { label: string; value: string; bold?: boolean; divider?: boolean; color?: string }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 0',
      borderTop: divider ? `1px solid ${tokens.color.border}` : 'none'
    }}>
      <span style={{ fontSize: tokens.font.size.sm, color: bold ? tokens.color.text : tokens.color.muted, fontWeight: bold ? tokens.font.weight.semibold : tokens.font.weight.normal }}>
        {label}
      </span>
      <span style={{ fontSize: bold ? tokens.font.size.md : tokens.font.size.sm, fontWeight: bold ? tokens.font.weight.bold : tokens.font.weight.medium, color: color || tokens.color.text }}>
        {value}
      </span>
    </div>
  );
}

/* ======================================================= */
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
  const isReady = errors.length === 0;

  const [expandExplanation, setExpandExplanation] = useState(false);

  const handleComplete = useCallback(() => {
    if (isReady) {
      dispatch({ type: 'SET_STATUS', payload: 'completed' });
      navigate(`/return/${routeYear}/person/${personId}/submit`);
    }
  }, [isReady, dispatch, navigate, routeYear, personId]);

  /* status badge config */
  const statusConfig = errors.length > 0
    ? { bg: tokens.color.dangerLight, color: tokens.color.danger, icon: 'M6 18L18 6M6 6l12 12', label: 'Not Ready' }
    : warnings.length > 0
      ? { bg: tokens.color.warningLight, color: '#92400E', icon: 'M12 9v2m0 4h.01', label: 'Review Needed' }
      : { bg: tokens.color.successLight, color: '#065F46', icon: 'M5 13l4 4L19 7', label: 'Ready to File' };

  const taxBreakdown = [
    { label: 'Federal Tax', value: taxResult.federalTax },
    { label: `Provincial Tax (${taxResult.provinceName})`, value: taxResult.provincialTax },
    ...(taxResult.healthPremium > 0 ? [{ label: 'Ontario Health Premium', value: taxResult.healthPremium }] : [])
  ];

  return (
    <div>
      {/* Header area */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: tokens.font.size.xl, fontWeight: tokens.font.weight.bold, marginBottom: '4px', color: tokens.color.text, letterSpacing: '-0.02em' }}>
            Review Your Return
          </h1>
          <p style={{ fontSize: tokens.font.size.sm, color: tokens.color.muted, margin: 0 }}>
            Review your {routeYear} tax return before completing.
          </p>
        </div>
        {/* Status badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          backgroundColor: statusConfig.bg,
          padding: '8px 16px',
          borderRadius: '24px'
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={statusConfig.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d={statusConfig.icon} />
          </svg>
          <span style={{ fontSize: tokens.font.size.sm, fontWeight: tokens.font.weight.semibold, color: statusConfig.color }}>
            {statusConfig.label}
          </span>
        </div>
      </div>

      {(routeYear !== state.currentReturn.year || routeYear !== CURRENT_TAX_YEAR) && (
        <div style={{ marginBottom: '20px' }}>
          <Alert type="warning" title="Tax year check">
            You are reviewing year {routeYear}, while your in-progress return is {state.currentReturn.year} and the active engine is {CURRENT_TAX_YEAR}. Confirm that your filing year is correct before completing.
          </Alert>
        </div>
      )}

      {/* Joint optimization */}
      {unit?.jointOptimization.enabled && (
        <Card accentBorder="left" accentColor={tokens.color.brandMid} style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: tokens.font.size.md, fontWeight: tokens.font.weight.semibold, marginBottom: '12px', color: tokens.color.text }}>Joint Optimization Suggestions</h2>
          {unit.jointOptimization.recommendations.length === 0 ? (
            <p style={{ margin: 0, color: tokens.color.muted, fontSize: tokens.font.size.sm }}>
              No custom recommendations yet. Continue entering both returns to unlock split optimization.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {unit.jointOptimization.recommendations.map((rec) => (
                <div key={rec.id} style={{
                  border: `1px solid ${tokens.color.border}`,
                  borderRadius: tokens.radius.md,
                  padding: '12px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: tokens.font.weight.medium, fontSize: tokens.font.size.sm, color: tokens.color.text }}>{rec.title}</div>
                    <div style={{ color: tokens.color.muted, fontSize: tokens.font.size.xs, marginTop: '2px' }}>{rec.rationale}</div>
                  </div>
                  <span style={{ fontWeight: tokens.font.weight.bold, color: '#065F46', fontSize: tokens.font.size.sm, whiteSpace: 'nowrap' }}>
                    {formatCurrency(rec.impact)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Filing confidence dashboard */}
      <Card style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: tokens.font.size.md, fontWeight: tokens.font.weight.semibold, marginBottom: '20px', color: tokens.color.text, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={tokens.color.brand} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          Filing Confidence
        </h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <ConfidenceRing value={readinessScores.completeness} label="Completeness" color={tokens.color.brand} bgColor={tokens.color.brandLight} />
          <ConfidenceRing value={readinessScores.dataConfidence} label="Data Confidence" color={tokens.color.info} bgColor={tokens.color.infoLight} />
          <ConfidenceRing value={readinessScores.optimizationCoverage} label="Optimization" color="#D97706" bgColor={tokens.color.warningLight} />
        </div>
      </Card>

      {/* Issues to address */}
      {issues.length > 0 && (
        <Card style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h2 style={{ fontSize: tokens.font.size.md, fontWeight: tokens.font.weight.semibold, color: tokens.color.text, margin: 0 }}>
              Issues to Address
            </h2>
            <span style={{
              fontSize: tokens.font.size.xs,
              fontWeight: tokens.font.weight.semibold,
              color: errors.length > 0 ? tokens.color.danger : '#92400E',
              backgroundColor: errors.length > 0 ? tokens.color.dangerLight : tokens.color.warningLight,
              padding: '3px 10px',
              borderRadius: '20px'
            }}>
              {issues.length} item{issues.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {issues.map((issue) => (
              <IssueRow
                key={issue.id}
                issue={issue}
                onClick={issue.action ? () => navigate(`/return/${routeYear}/person/${personId}/workspace`) : undefined}
              />
            ))}
          </div>
        </Card>
      )}

      {/* Tax summary */}
      <Card style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: tokens.font.size.md, fontWeight: tokens.font.weight.semibold, marginBottom: '16px', color: tokens.color.text, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={tokens.color.brand} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
          </svg>
          Tax Summary
        </h2>

        <SummaryRow label="Total Income" value={formatCurrency(taxResult.totalIncome)} />
        <SummaryRow label="Total Deductions" value={`-${formatCurrency(taxResult.totalDeductions)}`} />
        <SummaryRow label="Taxable Income" value={formatCurrency(taxResult.taxableIncome)} bold divider />

        {taxBreakdown.map((line) => (
          <SummaryRow key={line.label} label={line.label} value={formatCurrency(line.value)} />
        ))}

        <SummaryRow label="Total Tax" value={formatCurrency(taxResult.totalTax)} bold divider />
        <SummaryRow label="Tax Already Paid" value={`-${formatCurrency(taxResult.totalWithheld)}`} />

        {/* Refund / Owing hero */}
        <div style={{
          marginTop: '16px',
          padding: '20px 24px',
          borderRadius: tokens.radius.lg,
          backgroundColor: taxResult.isRefund ? tokens.color.accentLight : tokens.color.dangerLight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              backgroundColor: taxResult.isRefund ? tokens.color.successLight : '#FECACA',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={taxResult.isRefund ? '#065F46' : tokens.color.danger} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {taxResult.isRefund
                  ? <><line x1="12" y1="1" x2="12" y2="23" /><polyline points="17 18 12 23 7 18" /></>
                  : <><line x1="12" y1="23" x2="12" y2="1" /><polyline points="7 6 12 1 17 6" /></>
                }
              </svg>
            </div>
            <span style={{ fontWeight: tokens.font.weight.semibold, fontSize: tokens.font.size.md, color: taxResult.isRefund ? '#065F46' : '#991B1B' }}>
              {taxResult.isRefund ? 'Your Refund' : 'Amount Owing'}
            </span>
          </div>
          <span style={{ fontWeight: tokens.font.weight.bold, fontSize: tokens.font.size.xxl, color: taxResult.isRefund ? '#065F46' : '#991B1B', letterSpacing: '-0.02em' }}>
            {formatCurrency(Math.abs(taxResult.refundOrOwing))}
          </span>
        </div>
      </Card>

      {/* Why this number */}
      <Card style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setExpandExplanation(!expandExplanation)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0
          }}
        >
          <h2 style={{ fontSize: tokens.font.size.md, fontWeight: tokens.font.weight.semibold, color: tokens.color.text, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={tokens.color.brand} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            Why this number?
          </h2>
          <svg
            width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={tokens.color.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ transition: tokens.transition.fast, transform: expandExplanation ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        {expandExplanation && (
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <p style={{ color: tokens.color.muted, margin: 0, fontSize: tokens.font.size.sm, lineHeight: 1.6 }}>
              The estimate uses {CURRENT_TAX_YEAR} federal/provincial rules and your selected province ({taxResult.provinceName}).
            </p>
            <p style={{ color: tokens.color.muted, margin: 0, fontSize: tokens.font.size.sm, lineHeight: 1.6 }}>
              Taxable income = Total income ({formatCurrency(taxResult.totalIncome)}) - Deductions ({formatCurrency(taxResult.totalDeductions)}).
            </p>
            <p style={{ color: tokens.color.muted, margin: 0, fontSize: tokens.font.size.sm, lineHeight: 1.6 }}>
              Total tax = Federal ({formatCurrency(taxResult.federalTax)}) + Provincial ({formatCurrency(taxResult.provincialTax)}){taxResult.healthPremium > 0 ? ` + Health premium (${formatCurrency(taxResult.healthPremium)})` : ''}.
            </p>
          </div>
        )}
      </Card>

      {state.profile.province === 'QC' && (
        <div style={{ marginBottom: '20px' }}>
          <Alert type="warning" title="Quebec Residents">
            This completes your federal return. Remember to file your TP-1 with Revenu Quebec for your provincial taxes.
          </Alert>
        </div>
      )}

      {/* Bottom action bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '32px',
        padding: '20px 24px',
        backgroundColor: tokens.color.surface,
        borderRadius: tokens.radius.lg,
        border: `1px solid ${tokens.color.border}`,
        boxShadow: tokens.shadow.sm
      }}>
        <Button variant="secondary" onClick={() => navigate(`/return/${routeYear}/person/${personId}/workspace`)}>
          Back to Workspace
        </Button>
        <Button
          onClick={handleComplete}
          disabled={!isReady}
          size="lg"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          }
        >
          Complete Return
        </Button>
      </div>
    </div>
  );
}
