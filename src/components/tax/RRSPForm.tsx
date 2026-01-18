import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { MoneyInput } from '../ui/Input';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';

interface RRSPFormProps {
  contributionLimit: number;
  totalContributions: number;
  deductionAmount: number;
  onSave: (data: { contributionLimit: number; totalContributions: number; deductionAmount: number }) => void;
  onCancel: () => void;
}

export function RRSPForm({
  contributionLimit: initialLimit,
  totalContributions: initialContributions,
  deductionAmount: initialDeduction,
  onSave,
  onCancel
}: RRSPFormProps) {
  const [contributionLimit, setContributionLimit] = useState(initialLimit);
  const [totalContributions, setTotalContributions] = useState(initialContributions);
  const [deductionAmount, setDeductionAmount] = useState(initialDeduction);
  const [carryForward, setCarryForward] = useState(0);

  // Calculate carry forward
  useEffect(() => {
    const available = Math.min(totalContributions, contributionLimit);
    const forward = available - deductionAmount;
    setCarryForward(forward > 0 ? forward : 0);
  }, [totalContributions, contributionLimit, deductionAmount]);

  const isOverContributed = totalContributions > contributionLimit;
  const maxDeduction = Math.min(totalContributions, contributionLimit);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '24px'
    }}>
      <Card style={{ maxWidth: '560px', width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
          RRSP Contributions
        </h3>
        <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '20px' }}>
          Optimize your RRSP deduction to minimize taxes
        </p>

        <Alert type="info" style={{ marginBottom: '20px' }}>
          Your RRSP deduction limit is on your Notice of Assessment from the CRA.
          The deadline for 2024 contributions is March 3, 2025.
        </Alert>

        <MoneyInput
          label="RRSP Deduction Limit"
          value={contributionLimit}
          onChange={setContributionLimit}
          hint="From your Notice of Assessment (NOA)"
        />

        <MoneyInput
          label="Total RRSP Contributions Made"
          value={totalContributions}
          onChange={setTotalContributions}
          hint="All contributions from March 2024 to February 2025"
        />

        {isOverContributed && (
          <Alert type="warning" style={{ marginBottom: '16px' }}>
            <strong>Over-contribution Warning:</strong> You've contributed ${(totalContributions - contributionLimit).toLocaleString()}
            more than your limit. There may be a 1% per month penalty on amounts over $2,000.
          </Alert>
        )}

        <div style={{
          padding: '16px',
          backgroundColor: '#F9FAFB',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #E5E7EB'
        }}>
          <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>
            Deduction Strategy
          </h4>
          <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '12px' }}>
            You don't have to claim all your RRSP contributions this year. You can carry forward
            unused contributions to future years when you may be in a higher tax bracket.
          </p>
          <MoneyInput
            label="Amount to Deduct This Year"
            value={deductionAmount}
            onChange={(val) => setDeductionAmount(Math.min(val, maxDeduction))}
            hint={`Maximum you can claim: $${maxDeduction.toLocaleString()}`}
          />
        </div>

        {carryForward > 0 && (
          <div style={{
            padding: '16px',
            backgroundColor: '#F0FDF4',
            borderRadius: '8px',
            marginBottom: '16px',
            border: '1px solid #BBF7D0'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#065F46', fontWeight: 500 }}>Carry Forward to Future Years:</span>
              <span style={{ fontWeight: 600, color: '#059669' }}>
                ${carryForward.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        )}

        {/* Spousal RRSP note */}
        <Alert type="info" style={{ marginBottom: '16px' }}>
          <strong>Spousal RRSP:</strong> Contributions to a spousal RRSP are deducted on your return,
          but you should track them separately for attribution rules.
        </Alert>

        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={() => onSave({ contributionLimit, totalContributions, deductionAmount })}>
            Save RRSP
          </Button>
        </div>
      </Card>
    </div>
  );
}
