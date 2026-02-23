import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTaxReturn } from '../../context/TaxReturnContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { MoneyInput } from '../../components/ui/Input';
import { Alert } from '../../components/ui/Alert';
import { RRSPForm } from '../../components/tax/RRSPForm';

// RRSP contribution limits by tax year (from CRA)
const RRSP_LIMITS: Record<number, number> = {
  2025: 32490,
  2024: 31560,
  2023: 30780,
  2022: 29210,
  2021: 27830,
  2020: 27230,
};

export function DeductionsPage() {
  const navigate = useNavigate();
  const { taxYear } = useParams();
  const location = useLocation();
  const { state, dispatch } = useTaxReturn();
  const [showRRSPForm, setShowRRSPForm] = useState(false);

  const year = taxYear ? parseInt(taxYear, 10) : 2025;
  const defaultRRSPLimit = RRSP_LIMITS[year] || RRSP_LIMITS[2025];
  const [rrspLimit, setRRSPLimit] = useState(defaultRRSPLimit);


  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const section = params.get('section');
    if (!section) return;

    const targetElement = document.getElementById(`section-${section}`);
    targetElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [location.search]);

  // Update RRSP limit when year changes
  useMemo(() => {
    setRRSPLimit(RRSP_LIMITS[year] || RRSP_LIMITS[2025]);
  }, [year]);

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
      <div id="section-rrsp"><Card style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px', color: '#1F2937' }}>
          Deductions
        </h2>
        <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '20px' }}>
          Deductions reduce your taxable income
        </p>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>
              RRSP Deduction
            </label>
            <Button size="sm" variant="secondary" onClick={() => setShowRRSPForm(true)}>
              Optimize RRSP
            </Button>
          </div>
          <MoneyInput
            label=""
            value={state.currentReturn.deductions.rrsp}
            onChange={(value) => handleDeductionChange('rrsp', value)}
            hint={`Contributions made in ${year} or first 60 days of ${year + 1}. Limit: $${rrspLimit.toLocaleString()}`}
          />
        </div>

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

        <div id="section-employment"><MoneyInput
          label="Professional/Union Dues"
          value={state.currentReturn.deductions.union}
          onChange={(value) => handleDeductionChange('union', value)}
          hint="In addition to union dues on T4 (Box 44)"
        /></div>
      </Card></div>

      {/* Credits */}
      <Card style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px', color: '#1F2937' }}>
          Tax Credits
        </h2>
        <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '20px' }}>
          Credits reduce your tax owing directly
        </p>

        <MoneyInput
          label="Charitable Donations (This Year)"
          value={state.currentReturn.credits.donations}
          onChange={(value) => handleCreditChange('donations', value)}
          hint="Receipts from registered charities. 15% credit on first $200, 29% on rest"
        />

        <div id="section-carryforwards"><MoneyInput
          label="Donation Carry-Forward (From Prior Years)"
          value={state.currentReturn.credits.donationCarryForward || 0}
          onChange={(value) => handleCreditChange('donationCarryForward', value)}
          hint="Unclaimed donations from the past 5 years. Check prior returns or CRA My Account"
        /></div>

        <MoneyInput
          label="Medical Expenses"
          value={state.currentReturn.credits.medical}
          onChange={(value) => handleCreditChange('medical', value)}
          hint="Unreimbursed medical expenses for you, spouse, and dependents"
        />

        {/* Medical Travel Expenses */}
        <div style={{
          padding: '16px',
          backgroundColor: '#F9FAFB',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #E5E7EB'
        }}>
          <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>
            Medical Travel Expenses
          </h4>
          <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '16px' }}>
            If you traveled more than 40km one way for medical treatment not available locally
          </p>

          <MoneyInput
            label="Vehicle Expenses"
            value={state.currentReturn.credits.medicalTravel || 0}
            onChange={(value) => handleCreditChange('medicalTravel', value)}
            hint="Mileage at $0.70/km (first 5,000km) or $0.64/km after"
          />

          <MoneyInput
            label="Accommodation (if 80km+ away)"
            value={state.currentReturn.credits.medicalAccommodation || 0}
            onChange={(value) => handleCreditChange('medicalAccommodation', value)}
            hint="Up to $50/night for patient + 1 attendant if needed"
          />

          <MoneyInput
            label="Meals (if 80km+ away)"
            value={state.currentReturn.credits.medicalMeals || 0}
            onChange={(value) => handleCreditChange('medicalMeals', value)}
            hint="Simplified method: $23/meal (max $69/day)"
          />
        </div>

        <div id="section-tuition"><MoneyInput
          label="Tuition Fees"
          value={state.currentReturn.credits.tuition}
          onChange={(value) => handleCreditChange('tuition', value)}
          hint="From T2202A or TL11 forms"
        /></div>
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

      {/* RRSP Form Modal */}
      {showRRSPForm && (
        <RRSPForm
          contributionLimit={rrspLimit}
          totalContributions={state.currentReturn.deductions.rrsp}
          deductionAmount={state.currentReturn.deductions.rrsp}
          onSave={(data) => {
            setRRSPLimit(data.contributionLimit);
            handleDeductionChange('rrsp', data.deductionAmount);
            setShowRRSPForm(false);
          }}
          onCancel={() => setShowRRSPForm(false)}
        />
      )}
    </div>
  );
}
