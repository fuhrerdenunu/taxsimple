import React from 'react';
import { useTaxReturn } from '../../context/TaxReturnContext';
import { calculateTax, formatCurrency } from '../../domain/tax';

export function RefundSidebar() {
  const { getTaxInput, state } = useTaxReturn();
  const taxInput = getTaxInput();

  // Calculate tax
  const result = calculateTax(taxInput);

  // Calculate total income from all sources
  const totalIncome = result.totalIncome;

  // Get tax breakdown
  const federalTax = result.federalTax;
  const provincialTax = result.provincialTax;
  const totalTax = result.totalTax;
  const refundOrOwing = result.refundOrOwing;
  const isRefund = result.isRefund;

  return (
    <div style={{
      position: 'sticky',
      top: '100px',
      backgroundColor: 'white',
      borderRadius: '16px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      padding: '24px',
      width: '280px',
      flexShrink: 0
    }}>
      {/* Main refund/owing display */}
      <div style={{
        textAlign: 'center',
        paddingBottom: '20px',
        borderBottom: '1px solid #E5E7EB',
        marginBottom: '20px'
      }}>
        <p style={{
          fontSize: '14px',
          color: '#6B7280',
          marginBottom: '8px',
          fontWeight: 500
        }}>
          {isRefund ? 'Estimated Refund' : 'Estimated Balance Owing'}
        </p>
        <p style={{
          fontSize: '36px',
          fontWeight: 700,
          color: isRefund ? '#059669' : '#DC2626',
          lineHeight: 1.2
        }}>
          {formatCurrency(Math.abs(refundOrOwing), false)}
        </p>
        {totalIncome > 0 && (
          <p style={{
            fontSize: '13px',
            color: '#9CA3AF',
            marginTop: '8px'
          }}>
            Based on {state.profile.province} rates
          </p>
        )}
      </div>

      {/* Income Summary */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{
          fontSize: '12px',
          fontWeight: 600,
          color: '#6B7280',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '12px'
        }}>
          Income
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <SummaryRow label="Total Income" value={formatCurrency(totalIncome)} />
          {taxInput.taxWithheld > 0 && (
            <SummaryRow label="Tax Withheld" value={formatCurrency(taxInput.taxWithheld)} highlight />
          )}
        </div>
      </div>

      {/* Tax Breakdown */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{
          fontSize: '12px',
          fontWeight: 600,
          color: '#6B7280',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '12px'
        }}>
          Tax Calculation
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <SummaryRow label="Federal Tax" value={formatCurrency(federalTax)} />
          <SummaryRow label="Provincial Tax" value={formatCurrency(provincialTax)} />
          {result.healthPremium > 0 && (
            <SummaryRow label="Health Premium" value={formatCurrency(result.healthPremium)} />
          )}
          <div style={{
            borderTop: '1px solid #E5E7EB',
            paddingTop: '8px',
            marginTop: '4px'
          }}>
            <SummaryRow label="Total Tax" value={formatCurrency(totalTax)} bold />
          </div>
        </div>
      </div>

      {/* Deductions Applied */}
      {result.totalDeductions > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{
            fontSize: '12px',
            fontWeight: 600,
            color: '#6B7280',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '12px'
          }}>
            Deductions
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <SummaryRow label="Total Deductions" value={`-${formatCurrency(result.totalDeductions)}`} />
            <SummaryRow label="Taxable Income" value={formatCurrency(result.taxableIncome)} />
          </div>
        </div>
      )}

      {/* Progress indicator */}
      <div style={{
        backgroundColor: '#F3F4F6',
        borderRadius: '8px',
        padding: '12px',
        textAlign: 'center'
      }}>
        <p style={{ fontSize: '13px', color: '#6B7280' }}>
          {totalIncome === 0
            ? 'Add income to see your estimate'
            : 'Real-time calculation'}
        </p>
      </div>
    </div>
  );
}

interface SummaryRowProps {
  label: string;
  value: string;
  bold?: boolean;
  highlight?: boolean;
}

function SummaryRow({ label, value, bold, highlight }: SummaryRowProps) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <span style={{
        fontSize: '14px',
        color: highlight ? '#059669' : '#4B5563',
        fontWeight: bold ? 600 : 400
      }}>
        {label}
      </span>
      <span style={{
        fontSize: '14px',
        fontWeight: bold ? 600 : 500,
        color: highlight ? '#059669' : '#1F2937'
      }}>
        {value}
      </span>
    </div>
  );
}
