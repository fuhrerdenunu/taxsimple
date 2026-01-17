import React from 'react';
import { T4ASlip } from '../../context/TaxReturnContext';
import { Card } from '../ui/Card';
import { Input, MoneyInput } from '../ui/Input';
import { Button } from '../ui/Button';

interface T4AFormProps {
  slip: T4ASlip;
  onChange: (slip: T4ASlip) => void;
  onSave: () => void;
  onCancel: () => void;
  isEditing: boolean;
}

export function T4AForm({ slip, onChange, onSave, onCancel, isEditing }: T4AFormProps) {
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
          {isEditing ? 'Edit T4A' : 'Add T4A'}
        </h3>
        <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '20px' }}>
          Statement of Pension, Retirement, Annuity, and Other Income
        </p>

        <Input
          label="Payer Name"
          value={slip.payerName}
          onChange={(e) => onChange({ ...slip, payerName: e.target.value })}
          placeholder="Company or Organization Name"
        />

        <MoneyInput
          label="Box 016 - Pension or Superannuation"
          value={slip.boxes[16] || 0}
          onChange={(value) => updateBox(16, value)}
          hint="Pension payments received"
        />

        <MoneyInput
          label="Box 018 - Lump-Sum Payments"
          value={slip.boxes[18] || 0}
          onChange={(value) => updateBox(18, value)}
          hint="One-time payments from pension plans"
        />

        <MoneyInput
          label="Box 020 - Self-Employed Commissions"
          value={slip.boxes[20] || 0}
          onChange={(value) => updateBox(20, value)}
          hint="Commissions from self-employment"
        />

        <MoneyInput
          label="Box 022 - Income Tax Deducted"
          value={slip.boxes[22] || 0}
          onChange={(value) => updateBox(22, value)}
          hint="Tax already withheld at source"
        />

        <MoneyInput
          label="Box 028 - Other Income"
          value={slip.boxes[28] || 0}
          onChange={(value) => updateBox(28, value)}
          hint="Other taxable income reported on T4A"
        />

        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onSave}>
            Save T4A
          </Button>
        </div>
      </Card>
    </div>
  );
}
