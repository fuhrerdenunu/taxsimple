import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTaxReturn, T4Slip } from '../../context/TaxReturnContext';
import { formatCurrency } from '../../domain/tax';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input, MoneyInput } from '../../components/ui/Input';
import { Alert } from '../../components/ui/Alert';

export function IncomePage() {
  const navigate = useNavigate();
  const { taxYear } = useParams();
  const { state, dispatch } = useTaxReturn();
  const [showT4Form, setShowT4Form] = useState(false);
  const [editingSlip, setEditingSlip] = useState<T4Slip | null>(null);

  const t4Slips = state.currentReturn.slips.filter(s => s.type === 'T4') as T4Slip[];

  const handleAddT4 = () => {
    setEditingSlip({
      id: crypto.randomUUID(),
      type: 'T4',
      employerName: '',
      boxes: {}
    });
    setShowT4Form(true);
  };

  const handleEditT4 = (slip: T4Slip) => {
    setEditingSlip({ ...slip });
    setShowT4Form(true);
  };

  const handleSaveT4 = () => {
    if (!editingSlip) return;

    const existingSlip = state.currentReturn.slips.find(s => s.id === editingSlip.id);
    if (existingSlip) {
      dispatch({ type: 'UPDATE_SLIP', payload: { id: editingSlip.id, updates: editingSlip } });
    } else {
      dispatch({ type: 'ADD_SLIP', payload: editingSlip });
    }

    setShowT4Form(false);
    setEditingSlip(null);
  };

  const handleDeleteT4 = (id: string) => {
    dispatch({ type: 'DELETE_SLIP', payload: id });
  };

  const handleOtherIncomeChange = (field: string, value: number) => {
    dispatch({ type: 'UPDATE_OTHER_INCOME', payload: { [field]: value } });
  };

  const totalEmploymentIncome = t4Slips.reduce((sum, slip) => sum + (slip.boxes[14] || 0), 0);

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px', color: '#1F2937' }}>
        Income
      </h1>
      <p style={{ fontSize: '15px', color: '#6B7280', marginBottom: '32px' }}>
        Enter all your income for {taxYear}. We'll calculate your taxes as you go.
      </p>

      {state.profile.province === 'QC' && (
        <div style={{ marginBottom: '24px' }}>
          <Alert type="info">
            Your T4 information will also be used for your Quebec return (TP-1).
          </Alert>
        </div>
      )}

      {/* T4 Employment Income */}
      <Card style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1F2937' }}>
              T4 - Employment Income
            </h2>
            <p style={{ fontSize: '14px', color: '#6B7280' }}>
              Add your T4 slips from employers
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={handleAddT4}>
            + Add T4
          </Button>
        </div>

        {t4Slips.length === 0 ? (
          <div style={{
            padding: '32px',
            textAlign: 'center',
            backgroundColor: '#F9FAFB',
            borderRadius: '8px',
            border: '2px dashed #E5E7EB'
          }}>
            <p style={{ color: '#6B7280', marginBottom: '16px' }}>
              No T4 slips added yet
            </p>
            <Button variant="secondary" size="sm" onClick={handleAddT4}>
              Add your first T4
            </Button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {t4Slips.map(slip => (
              <div
                key={slip.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px',
                  backgroundColor: '#F9FAFB',
                  borderRadius: '8px'
                }}
              >
                <div>
                  <p style={{ fontWeight: 500, color: '#1F2937' }}>
                    {slip.employerName || 'Unnamed Employer'}
                  </p>
                  <p style={{ fontSize: '14px', color: '#6B7280' }}>
                    Employment Income: {formatCurrency(slip.boxes[14] || 0)}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button variant="ghost" size="sm" onClick={() => handleEditT4(slip)}>
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteT4(slip.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '16px',
              backgroundColor: '#E8F5E9',
              borderRadius: '8px',
              fontWeight: 600
            }}>
              <span>Total Employment Income</span>
              <span style={{ color: '#0D5F2B' }}>{formatCurrency(totalEmploymentIncome)}</span>
            </div>
          </div>
        )}
      </Card>

      {/* T4 Form Modal */}
      {showT4Form && editingSlip && (
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
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>
              {t4Slips.find(s => s.id === editingSlip.id) ? 'Edit T4' : 'Add T4'}
            </h3>

            <Input
              label="Employer Name"
              value={editingSlip.employerName}
              onChange={(e) => setEditingSlip({ ...editingSlip, employerName: e.target.value })}
              placeholder="ABC Company Inc."
            />

            <MoneyInput
              label="Box 14 - Employment Income"
              value={editingSlip.boxes[14] || 0}
              onChange={(value) => setEditingSlip({
                ...editingSlip,
                boxes: { ...editingSlip.boxes, 14: value }
              })}
            />

            <MoneyInput
              label="Box 16 - CPP Contributions"
              value={editingSlip.boxes[16] || 0}
              onChange={(value) => setEditingSlip({
                ...editingSlip,
                boxes: { ...editingSlip.boxes, 16: value }
              })}
            />

            <MoneyInput
              label="Box 18 - EI Premiums"
              value={editingSlip.boxes[18] || 0}
              onChange={(value) => setEditingSlip({
                ...editingSlip,
                boxes: { ...editingSlip.boxes, 18: value }
              })}
            />

            <MoneyInput
              label="Box 22 - Income Tax Deducted"
              value={editingSlip.boxes[22] || 0}
              onChange={(value) => setEditingSlip({
                ...editingSlip,
                boxes: { ...editingSlip.boxes, 22: value }
              })}
            />

            <MoneyInput
              label="Box 44 - Union Dues"
              value={editingSlip.boxes[44] || 0}
              onChange={(value) => setEditingSlip({
                ...editingSlip,
                boxes: { ...editingSlip.boxes, 44: value }
              })}
            />

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <Button variant="secondary" onClick={() => setShowT4Form(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveT4}>
                Save T4
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Other Income */}
      <Card style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px', color: '#1F2937' }}>
          Other Income
        </h2>

        <MoneyInput
          label="Self-Employment Income (Net)"
          value={state.currentReturn.otherIncome.selfEmployment}
          onChange={(value) => handleOtherIncomeChange('selfEmployment', value)}
          hint="Income from freelance work, side business, etc."
        />

        <MoneyInput
          label="Rental Income (Net)"
          value={state.currentReturn.otherIncome.rental}
          onChange={(value) => handleOtherIncomeChange('rental', value)}
        />

        <MoneyInput
          label="Interest Income"
          value={state.currentReturn.otherIncome.interest}
          onChange={(value) => handleOtherIncomeChange('interest', value)}
          hint="From bank accounts, GICs, bonds, etc."
        />

        <MoneyInput
          label="Dividend Income"
          value={state.currentReturn.otherIncome.dividends}
          onChange={(value) => handleOtherIncomeChange('dividends', value)}
          hint="Eligible dividends from Canadian corporations"
        />

        <MoneyInput
          label="Capital Gains"
          value={state.currentReturn.otherIncome.capitalGains}
          onChange={(value) => handleOtherIncomeChange('capitalGains', value)}
          hint="Total gains from selling investments (before 50% inclusion)"
        />

        <MoneyInput
          label="Other Income"
          value={state.currentReturn.otherIncome.other}
          onChange={(value) => handleOtherIncomeChange('other', value)}
        />
      </Card>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button variant="secondary" onClick={() => navigate(`/return/${taxYear}/profile`)}>
          Back
        </Button>
        <Button onClick={() => navigate(`/return/${taxYear}/deductions`)}>
          Continue to Deductions
        </Button>
      </div>
    </div>
  );
}
