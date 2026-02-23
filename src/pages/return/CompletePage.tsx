import React, { useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTaxReturn, type PersonId } from '../../context/TaxReturnContext';
import { calculateTax, formatCurrency, CURRENT_TAX_YEAR } from '../../domain/tax';
import { generateTaxSummaryPDF, exportTaxDataJSON } from '../../utils/pdf-export';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Alert } from '../../components/ui/Alert';
import { tokens } from '../../styles/tokens';
import { useReturnRouteSync } from './useReturnRouteSync';

/* ---------- Download card ---------- */
function DownloadCard({ title, description, fileType, onDownload }: {
  title: string;
  description: string;
  fileType: string;
  onDownload: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '18px 20px',
        backgroundColor: hovered ? tokens.color.surfaceHover : tokens.color.bg,
        borderRadius: tokens.radius.lg,
        border: `1px solid ${hovered ? tokens.color.brand : tokens.color.border}`,
        transition: tokens.transition.default,
        cursor: 'pointer'
      }}
      onClick={onDownload}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onDownload(); }}
    >
      {/* File icon */}
      <div style={{
        width: '44px', height: '44px', borderRadius: tokens.radius.md,
        backgroundColor: tokens.color.brandLight,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0
      }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={tokens.color.brand} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: tokens.font.weight.medium, color: tokens.color.text, margin: 0, fontSize: tokens.font.size.sm }}>
          {title}
        </p>
        <p style={{ fontSize: tokens.font.size.xs, color: tokens.color.muted, margin: '2px 0 0' }}>
          {description}
        </p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
        <span style={{
          fontSize: tokens.font.size.xs,
          fontWeight: tokens.font.weight.semibold,
          color: tokens.color.mutedLight,
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          {fileType}
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={tokens.color.brand} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      </div>
    </div>
  );
}

/* ---------- Step card ---------- */
function StepItem({ number, title, description, isLast }: {
  number: number;
  title: string;
  description: string;
  isLast?: boolean;
}) {
  return (
    <div style={{ display: 'flex', gap: '16px' }}>
      {/* Timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%',
          backgroundColor: tokens.color.brandLight,
          color: tokens.color.brand,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: tokens.font.weight.bold,
          fontSize: tokens.font.size.sm,
          flexShrink: 0
        }}>
          {number}
        </div>
        {!isLast && (
          <div style={{ width: '2px', flex: 1, backgroundColor: tokens.color.borderLight, marginTop: '6px', marginBottom: '6px', minHeight: '20px' }} />
        )}
      </div>
      {/* Content */}
      <div style={{ paddingBottom: isLast ? 0 : '20px', paddingTop: '4px' }}>
        <p style={{ fontWeight: tokens.font.weight.semibold, color: tokens.color.text, margin: 0, fontSize: tokens.font.size.sm }}>
          {title}
        </p>
        <p style={{ fontSize: tokens.font.size.xs, color: tokens.color.muted, margin: '4px 0 0', lineHeight: 1.5 }}>
          {description}
        </p>
      </div>
    </div>
  );
}

/* ======================================================= */
export function CompletePage() {
  const navigate = useNavigate();
  const { taxYear, personId } = useParams();
  const { state, getTaxInput, dispatch } = useTaxReturn();
  useReturnRouteSync(personId === 'partner' ? 'partner' : 'primary');

  const activePerson: PersonId = personId === 'partner' ? 'partner' : 'primary';
  const taxInput = getTaxInput(undefined, activePerson);
  const taxResult = calculateTax(taxInput);
  const year = taxYear ? parseInt(taxYear, 10) : CURRENT_TAX_YEAR;

  const handleDownloadPDF = useCallback(() => {
    generateTaxSummaryPDF(state.profile, taxResult, year, { maskSIN: true });
    dispatch({
      type: 'ADD_FILED_DOCUMENT',
      payload: {
        id: crypto.randomUUID(),
        year,
        personId: activePerson,
        title: `${year} Tax Summary`,
        createdAt: new Date().toISOString(),
        type: 'pdf'
      }
    });
  }, [state.profile, taxResult, year, activePerson, dispatch]);

  const handleDownloadJSON = useCallback(() => {
    exportTaxDataJSON(state.profile, state.currentReturn, taxResult);
    dispatch({
      type: 'ADD_FILED_DOCUMENT',
      payload: {
        id: crypto.randomUUID(),
        year,
        personId: activePerson,
        title: `${year} Tax Data Export`,
        createdAt: new Date().toISOString(),
        type: 'json'
      }
    });
  }, [state.profile, state.currentReturn, taxResult, year, activePerson, dispatch]);

  const formattedDate = new Date().toLocaleDateString('en-CA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div style={{ maxWidth: '560px', margin: '0 auto' }}>
      {/* Success celebration */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        {/* Animated checkmark */}
        <div style={{
          width: '88px', height: '88px', borderRadius: '50%',
          background: `linear-gradient(135deg, ${tokens.color.successLight} 0%, ${tokens.color.accentLight} 100%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
          boxShadow: '0 8px 24px -4px rgba(16, 185, 129, 0.25)'
        }}>
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#065F46" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>

        <h1 style={{
          fontSize: tokens.font.size.xxl,
          fontWeight: tokens.font.weight.bold,
          color: tokens.color.text,
          marginBottom: '6px',
          letterSpacing: '-0.02em'
        }}>
          Return Complete
        </h1>
        <p style={{ fontSize: tokens.font.size.sm, color: tokens.color.muted, margin: 0 }}>
          {taxYear} tax return completed on {formattedDate}
        </p>
      </div>

      {/* Refund / Owing hero card */}
      <Card
        accentBorder="top"
        accentColor={taxResult.isRefund ? tokens.color.refund : tokens.color.owing}
        style={{ marginBottom: '20px', textAlign: 'center', padding: '28px 24px' }}
      >
        <p style={{
          fontSize: tokens.font.size.sm,
          color: taxResult.isRefund ? '#065F46' : '#991B1B',
          fontWeight: tokens.font.weight.medium,
          marginBottom: '4px'
        }}>
          {taxResult.isRefund ? 'Estimated Refund' : 'Estimated Amount Owing'}
        </p>
        <p style={{
          fontSize: tokens.font.size.hero,
          fontWeight: tokens.font.weight.bold,
          color: taxResult.isRefund ? '#065F46' : '#991B1B',
          margin: '0',
          letterSpacing: '-0.03em',
          lineHeight: 1.1
        }}>
          {formatCurrency(Math.abs(taxResult.refundOrOwing))}
        </p>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          marginTop: '12px',
          padding: '4px 12px',
          borderRadius: '20px',
          backgroundColor: taxResult.isRefund ? tokens.color.accentLight : tokens.color.dangerLight,
          fontSize: tokens.font.size.xs,
          fontWeight: tokens.font.weight.medium,
          color: taxResult.isRefund ? '#065F46' : '#991B1B'
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {taxResult.isRefund
              ? <><polyline points="17 18 12 23 7 18" /><line x1="12" y1="1" x2="12" y2="23" /></>
              : <><polyline points="7 6 12 1 17 6" /><line x1="12" y1="23" x2="12" y2="1" /></>
            }
          </svg>
          {taxResult.isRefund ? 'Coming your way' : 'Due by April 30'}
        </div>
      </Card>

      {/* Downloads */}
      <Card style={{ marginBottom: '20px' }}>
        <h2 style={{
          fontSize: tokens.font.size.md,
          fontWeight: tokens.font.weight.semibold,
          color: tokens.color.text,
          marginBottom: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={tokens.color.brand} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Download Documents
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <DownloadCard
            title="Tax Summary"
            description="Printable summary of your return"
            fileType="PDF"
            onDownload={handleDownloadPDF}
          />
          <DownloadCard
            title="Data Export"
            description="Import into NETFILE-certified software"
            fileType="JSON"
            onDownload={handleDownloadJSON}
          />
        </div>
      </Card>

      {/* Next steps */}
      <Card style={{ marginBottom: '20px' }}>
        <h2 style={{
          fontSize: tokens.font.size.md,
          fontWeight: tokens.font.weight.semibold,
          color: tokens.color.text,
          marginBottom: '18px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={tokens.color.brand} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
          </svg>
          Next Steps
        </h2>

        <StepItem
          number={1}
          title="Keep these documents"
          description="Store your tax summary and supporting documents for at least 6 years in case the CRA requests them."
        />
        <StepItem
          number={2}
          title="File with the CRA"
          description="Use NETFILE-certified software to electronically submit your return, or mail a paper copy to your tax centre."
        />
        <StepItem
          number={3}
          title={taxResult.isRefund ? 'Receive your refund' : 'Submit payment'}
          description={taxResult.isRefund
            ? 'Direct deposit refunds typically arrive within 2 weeks of CRA processing. Paper cheques may take 4-6 weeks.'
            : 'Pay online through your bank, at a Canada Post outlet, or set up a pre-authorized debit with the CRA by April 30.'
          }
          isLast
        />
      </Card>

      {/* Quebec notice */}
      {state.profile.province === 'QC' && (
        <div style={{ marginBottom: '20px' }}>
          <Alert type="warning" title="Quebec Residents">
            Remember to file your TP-1 with Revenu Quebec at{' '}
            <a href="https://www.revenuquebec.ca" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', fontWeight: tokens.font.weight.semibold }}>
              revenuquebec.ca
            </a>
          </Alert>
        </div>
      )}

      {/* Back to dashboard */}
      <div style={{ textAlign: 'center', marginTop: '8px' }}>
        <Button
          size="lg"
          onClick={() => navigate('/dashboard')}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          }
        >
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
}
