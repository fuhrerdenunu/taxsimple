import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTaxReturn } from '../../context/TaxReturnContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { MoneyInput } from '../../components/ui/Input';
import { Alert } from '../../components/ui/Alert';

export function DeductionsPage() {
  const navigate = useNavigate();
  const { taxYear } = useParams();
  const { state, dispatch } = useTaxReturn();

  const handleDeductionChange = (field: string, value: number) => {
    dispatch({ type: 'UPDATE_DEDUCTIONS', payload: { [field]: value } });
  };

  const handleCreditChange = (field: string, value: number) => {
    dispatch({ type: 'UPDATE_CREDITS', payload: { [field]: value } });
  };

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px', color: '#1F2937' }}>
        Deductions & Credits
      </h1>
      <p style={{ fontSize: '15px', color: '#6B7280', marginBottom: '32px' }}>
        Enter your deductions and credits to reduce your tax owing.
      </p>

      {/* Deductions */}
      <Card style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px', color: '#1F2937' }}>
          Deductions
        </h2>
        <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '20px' }}>
          Deductions reduce your taxable income
        </p>

        <MoneyInput
          label="RRSP Contributions"
          value={state.currentReturn.deductions.rrsp}
          onChange={(value) => handleDeductionChange('rrsp', value)}
          hint="Contributions made in 2024 or first 60 days of 2025. Limit: $31,560"
        />

        <MoneyInput
          label="FHSA Contributions"
          value={state.currentReturn.deductions.fhsa}
          onChange={(value) => handleDeductionChange('fhsa', value)}
          hint="First Home Savings Account. Annual limit: $8,000"
        />

        <MoneyInput
          label="Childcare Expenses"
          value={state.currentReturn.deductions.childcare}
          onChange={(value) => handleDeductionChange('childcare', value)}
          hint="Daycare, summer camp, after-school programs"
        />

        <MoneyInput
          label="Moving Expenses"
          value={state.currentReturn.deductions.moving}
          onChange={(value) => handleDeductionChange('moving', value)}
          hint="If you moved 40km+ closer to a new job or school"
        />

        <MoneyInput
          label="Professional/Union Dues"
          value={state.currentReturn.deductions.union}
          onChange={(value) => handleDeductionChange('union', value)}
          hint="In addition to union dues on T4 (Box 44)"
        />
      </Card>

      {/* Credits */}
      <Card style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px', color: '#1F2937' }}>
          Tax Credits
        </h2>
        <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '20px' }}>
          Credits reduce your tax owing directly
        </p>

        <MoneyInput
          label="Charitable Donations"
          value={state.currentReturn.credits.donations}
          onChange={(value) => handleCreditChange('donations', value)}
          hint="Receipts from registered charities. 15% credit on first $200, 29% on rest"
        />

        <MoneyInput
          label="Medical Expenses"
          value={state.currentReturn.credits.medical}
          onChange={(value) => handleCreditChange('medical', value)}
          hint="Unreimbursed medical expenses for you, spouse, and dependents"
        />

        <MoneyInput
          label="Tuition Fees"
          value={state.currentReturn.credits.tuition}
          onChange={(value) => handleCreditChange('tuition', value)}
          hint="From T2202A or TL11 forms"
        />
      </Card>

      {/* Helpful Tips */}
      <Alert type="info" title="Tip">
        Keep all receipts for at least 6 years. The CRA may request documentation to verify your claims.
      </Alert>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
        <Button variant="secondary" onClick={() => navigate(`/return/${taxYear}/income`)}>
          Back
        </Button>
        <Button onClick={() => navigate(`/return/${taxYear}/review`)}>
          Continue to Review
        </Button>
      </div>
    </div>
  );
}
