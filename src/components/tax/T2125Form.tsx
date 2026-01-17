import React from 'react';
import { T2125Data } from '../../context/TaxReturnContext';
import { Card } from '../ui/Card';
import { Input, MoneyInput } from '../ui/Input';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { formatCurrency } from '../../domain/tax';

interface T2125FormProps {
  data: T2125Data;
  onChange: (data: T2125Data) => void;
  onSave: () => void;
  onCancel: () => void;
  isEditing: boolean;
}

export function T2125Form({ data, onChange, onSave, onCancel, isEditing }: T2125FormProps) {
  const netIncome = data.grossRevenue - data.expenses;

  const handleGrossChange = (value: number) => {
    onChange({
      ...data,
      grossRevenue: value,
      netIncome: value - data.expenses
    });
  };

  const handleExpensesChange = (value: number) => {
    onChange({
      ...data,
      expenses: value,
      netIncome: data.grossRevenue - value
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
          {isEditing ? 'Edit T2125' : 'Add T2125'}
        </h3>
        <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '20px' }}>
          Statement of Business or Professional Activities
        </p>

        <Alert type="info" style={{ marginBottom: '20px' }}>
          Report your self-employment income and expenses. The net income (revenue minus expenses)
          will be added to your taxable income.
        </Alert>

        <Input
          label="Business Name"
          value={data.businessName}
          onChange={(e) => onChange({ ...data, businessName: e.target.value })}
          placeholder="Your Business Name or Trade Name"
          hint="Leave blank if operating under your own name"
        />

        <MoneyInput
          label="Gross Business Revenue"
          value={data.grossRevenue}
          onChange={handleGrossChange}
          hint="Total income before expenses"
        />

        <MoneyInput
          label="Total Business Expenses"
          value={data.expenses}
          onChange={handleExpensesChange}
          hint="Advertising, office supplies, professional fees, etc."
        />

        {/* Net Income Display */}
        <div style={{
          padding: '16px',
          backgroundColor: netIncome >= 0 ? '#D1FAE5' : '#FEE2E2',
          borderRadius: '8px',
          marginBottom: '16px'
        }}>
          <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '4px' }}>
            Net Business Income
          </p>
          <p style={{
            fontSize: '24px',
            fontWeight: 700,
            color: netIncome >= 0 ? '#065F46' : '#991B1B'
          }}>
            {formatCurrency(netIncome)}
          </p>
          {netIncome < 0 && (
            <p style={{ fontSize: '13px', color: '#991B1B', marginTop: '8px' }}>
              Business loss can offset other income
            </p>
          )}
        </div>

        <Alert type="warning" title="CPP Contributions" style={{ marginBottom: '20px' }}>
          Self-employed individuals pay both the employee and employer portions of CPP
          (11.9% of net income, up to the maximum).
        </Alert>

        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onSave}>
            Save T2125
          </Button>
        </div>
      </Card>
    </div>
  );
}
