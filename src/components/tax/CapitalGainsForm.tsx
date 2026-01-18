import React from 'react';
import { CapitalGainsTransaction } from '../../context/TaxReturnContext';
import { Card } from '../ui/Card';
import { Input, MoneyInput } from '../ui/Input';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';

interface CapitalGainsFormProps {
  transaction: CapitalGainsTransaction;
  onChange: (transaction: CapitalGainsTransaction) => void;
  onSave: () => void;
  onCancel: () => void;
  isEditing: boolean;
}

export function CapitalGainsForm({ transaction, onChange, onSave, onCancel, isEditing }: CapitalGainsFormProps) {
  // Calculate gain based on current values
  const calculatedGain = transaction.proceeds - transaction.adjustedCostBase - transaction.outlayAndExpenses;
  const taxableGain = calculatedGain > 0 ? calculatedGain * 0.5 : 0;
  const isLoss = calculatedGain < 0;

  // Update gain when saving
  const handleSave = () => {
    onChange({
      ...transaction,
      gain: calculatedGain
    });
    // Small delay to ensure state is updated before save
    setTimeout(onSave, 0);
  };

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
          {isEditing ? 'Edit Capital Gains' : 'Add Capital Gains'}
        </h3>
        <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '20px' }}>
          Report the sale of stocks, mutual funds, or other capital property
        </p>

        <Input
          label="Description of Property"
          value={transaction.description}
          onChange={(e) => onChange({ ...transaction, description: e.target.value })}
          placeholder="e.g., 100 shares of XYZ Corp"
          required
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Input
            label="Date Acquired"
            type="date"
            value={transaction.dateAcquired}
            onChange={(e) => onChange({ ...transaction, dateAcquired: e.target.value })}
          />

          <Input
            label="Date Sold"
            type="date"
            value={transaction.dateSold}
            onChange={(e) => onChange({ ...transaction, dateSold: e.target.value })}
          />
        </div>

        <MoneyInput
          label="Proceeds of Disposition"
          value={transaction.proceeds}
          onChange={(value) => onChange({ ...transaction, proceeds: value })}
          hint="Total amount received from the sale"
        />

        <MoneyInput
          label="Adjusted Cost Base (ACB)"
          value={transaction.adjustedCostBase}
          onChange={(value) => onChange({ ...transaction, adjustedCostBase: value })}
          hint="Original purchase price plus any acquisition costs"
        />

        <MoneyInput
          label="Outlays and Expenses"
          value={transaction.outlayAndExpenses}
          onChange={(value) => onChange({ ...transaction, outlayAndExpenses: value })}
          hint="Selling costs like broker commissions"
        />

        {/* Calculated Gain/Loss Summary */}
        <div style={{
          padding: '16px',
          backgroundColor: isLoss ? '#FEF2F2' : '#F0FDF4',
          borderRadius: '8px',
          marginBottom: '16px',
          border: `1px solid ${isLoss ? '#FECACA' : '#BBF7D0'}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#6B7280' }}>Capital {isLoss ? 'Loss' : 'Gain'}:</span>
            <span style={{ fontWeight: 600, color: isLoss ? '#DC2626' : '#059669' }}>
              ${Math.abs(calculatedGain).toLocaleString('en-CA', { minimumFractionDigits: 2 })}
            </span>
          </div>
          {!isLoss && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6B7280' }}>Taxable Amount (50%):</span>
              <span style={{ fontWeight: 600, color: '#059669' }}>
                ${taxableGain.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}
        </div>

        <Alert type="info" style={{ marginBottom: '16px' }}>
          <strong>Capital Gains Inclusion Rate:</strong> Only 50% of your capital gains are included in your taxable income.
          {isLoss && (
            <span> Capital losses can only be used to offset capital gains, not other income.</span>
          )}
        </Alert>

        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Capital Gains
          </Button>
        </div>
      </Card>
    </div>
  );
}
