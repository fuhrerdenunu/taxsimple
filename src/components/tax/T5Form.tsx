import React from 'react';
import { T5Slip } from '../../context/TaxReturnContext';
import { Card } from '../ui/Card';
import { Input, MoneyInput } from '../ui/Input';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';

interface T5FormProps {
  slip: T5Slip;
  onChange: (slip: T5Slip) => void;
  onSave: () => void;
  onCancel: () => void;
  isEditing: boolean;
}

export function T5Form({ slip, onChange, onSave, onCancel, isEditing }: T5FormProps) {
  const updateBox = (box: number, value: number) => {
    onChange({
      ...slip,
      boxes: { ...slip.boxes, [box]: value }
    });
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
      <Card style={{ maxWidth: '500px', width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
          {isEditing ? 'Edit T5' : 'Add T5'}
        </h3>
        <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '20px' }}>
          Statement of Investment Income
        </p>

        <Input
          label="Payer Name"
          value={slip.payerName}
          onChange={(e) => onChange({ ...slip, payerName: e.target.value })}
          placeholder="Bank or Financial Institution"
        />

        <MoneyInput
          label="Box 013 - Interest from Canadian Sources"
          value={slip.boxes[13] || 0}
          onChange={(value) => updateBox(13, value)}
          hint="Interest from savings accounts, GICs, bonds"
        />

        <Alert type="info" style={{ marginBottom: '16px' }}>
          <strong>About Dividends:</strong> Report the actual dividend amount (Box 24).
          The taxable amount (Box 25) is "grossed up" by 38% for eligible dividends,
          and you'll receive a dividend tax credit to offset this.
        </Alert>

        <MoneyInput
          label="Box 024 - Actual Amount of Eligible Dividends"
          value={slip.boxes[24] || 0}
          onChange={(value) => updateBox(24, value)}
          hint="The actual dividend payment you received"
        />

        <MoneyInput
          label="Box 025 - Taxable Amount of Eligible Dividends"
          value={slip.boxes[25] || 0}
          onChange={(value) => updateBox(25, value)}
          hint="Grossed-up amount (usually 138% of Box 24)"
        />

        <div style={{
          padding: '16px',
          backgroundColor: '#F9FAFB',
          borderRadius: '8px',
          marginBottom: '16px',
          fontSize: '14px',
          color: '#4B5563'
        }}>
          <p style={{ marginBottom: '8px' }}>
            <strong>Dividend Tax Credit:</strong> You'll receive a federal dividend tax credit
            equal to 15.02% of the taxable dividend amount, plus a provincial credit.
          </p>
          <p>
            This makes Canadian dividend income more tax-efficient than interest income.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onSave}>
            Save T5
          </Button>
        </div>
      </Card>
    </div>
  );
}
