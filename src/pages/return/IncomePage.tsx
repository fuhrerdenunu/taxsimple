import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTaxReturn, T4Slip, T4ASlip, T5Slip, T2125Data } from '../../context/TaxReturnContext';
import { formatCurrency } from '../../domain/tax';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input, MoneyInput } from '../../components/ui/Input';
import { Alert } from '../../components/ui/Alert';
import { T4AForm } from '../../components/tax/T4AForm';
import { T2125Form } from '../../components/tax/T2125Form';
import { T5Form } from '../../components/tax/T5Form';
import { FileUpload } from '../../components/tax/FileUpload';
import { ParsedSlipData } from '../../utils/pdf-parser';

type ActiveForm = 'none' | 't4' | 't4a' | 't4e' | 't4fhsa' | 't2125' | 't5' | 't3' | 't5008' | 'tuition' | 'rl1';

export function IncomePage() {
  const navigate = useNavigate();
  const { taxYear } = useParams();
  const { state, dispatch } = useTaxReturn();
  const [activeForm, setActiveForm] = useState<ActiveForm>('none');
  const [editingSlip, setEditingSlip] = useState<any>(null);

  const t4Slips = state.currentReturn.slips.filter(s => s.type === 'T4') as T4Slip[];
  const t4aSlips = state.currentReturn.slips.filter(s => s.type === 'T4A') as T4ASlip[];
  const t5Slips = state.currentReturn.slips.filter(s => s.type === 'T5') as T5Slip[];
  const t2125Data = state.currentReturn.slips.filter(s => s.type === 'T2125') as T2125Data[];

  // T4 Handlers
  const handleAddT4 = () => {
    setEditingSlip({
      id: crypto.randomUUID(),
      type: 'T4',
      employerName: '',
      boxes: {}
    });
    setActiveForm('t4');
  };

  const handleEditT4 = (slip: T4Slip) => {
    setEditingSlip({ ...slip });
    setActiveForm('t4');
  };

  const handleSaveT4 = () => {
    if (!editingSlip) return;
    const existing = state.currentReturn.slips.find(s => s.id === editingSlip.id);
    if (existing) {
      dispatch({ type: 'UPDATE_SLIP', payload: { id: editingSlip.id, updates: editingSlip } });
    } else {
      dispatch({ type: 'ADD_SLIP', payload: editingSlip });
    }
    setActiveForm('none');
    setEditingSlip(null);
  };

  // T4A Handlers
  const handleAddT4A = () => {
    setEditingSlip({
      id: crypto.randomUUID(),
      type: 'T4A',
      payerName: '',
      boxes: {}
    });
    setActiveForm('t4a');
  };

  const handleEditT4A = (slip: T4ASlip) => {
    setEditingSlip({ ...slip });
    setActiveForm('t4a');
  };

  // T5 Handlers
  const handleAddT5 = () => {
    setEditingSlip({
      id: crypto.randomUUID(),
      type: 'T5',
      payerName: '',
      boxes: {}
    });
    setActiveForm('t5');
  };

  const handleEditT5 = (slip: T5Slip) => {
    setEditingSlip({ ...slip });
    setActiveForm('t5');
  };

  // T2125 Handlers
  const handleAddT2125 = () => {
    setEditingSlip({
      id: crypto.randomUUID(),
      type: 'T2125',
      businessName: '',
      grossRevenue: 0,
      expenses: 0,
      netIncome: 0
    });
    setActiveForm('t2125');
  };

  const handleEditT2125 = (data: T2125Data) => {
    setEditingSlip({ ...data });
    setActiveForm('t2125');
  };

  // Generic save handler for T4A, T5, T2125
  const handleSaveSlip = () => {
    if (!editingSlip) return;
    const existing = state.currentReturn.slips.find(s => s.id === editingSlip.id);
    if (existing) {
      dispatch({ type: 'UPDATE_SLIP', payload: { id: editingSlip.id, updates: editingSlip } });
    } else {
      dispatch({ type: 'ADD_SLIP', payload: editingSlip });
    }
    setActiveForm('none');
    setEditingSlip(null);
  };

  const handleDeleteSlip = (id: string) => {
    dispatch({ type: 'DELETE_SLIP', payload: id });
  };

  const handleOtherIncomeChange = (field: string, value: number) => {
    dispatch({ type: 'UPDATE_OTHER_INCOME', payload: { [field]: value } });
  };

  // Handle parsed PDF data - supports all major Canadian tax slip types
  const handleParsedData = (data: ParsedSlipData) => {
    const slipId = crypto.randomUUID();

    switch (data.type) {
      case 'T4':
        setEditingSlip({
          id: slipId,
          type: 'T4',
          employerName: data.payerName || '',
          boxes: {
            14: data.boxes[14] || 0,  // Employment income
            16: data.boxes[16] || 0,  // CPP contributions
            18: data.boxes[18] || 0,  // EI premiums
            22: data.boxes[22] || 0,  // Income tax deducted
            24: data.boxes[24] || 0,  // EI insurable earnings
            26: data.boxes[26] || 0,  // CPP pensionable earnings
            44: data.boxes[44] || 0,  // Union dues
            46: data.boxes[46] || 0,  // Charitable donations
            52: data.boxes[52] || 0,  // Pension adjustment
          }
        });
        setActiveForm('t4');
        break;

      case 'T4A':
        setEditingSlip({
          id: slipId,
          type: 'T4A',
          payerName: data.payerName || '',
          boxes: {
            16: data.boxes[16] || 0,  // Pension or superannuation
            18: data.boxes[18] || 0,  // Lump-sum payments
            20: data.boxes[20] || 0,  // Self-employed commissions
            22: data.boxes[22] || 0,  // Income tax deducted
            24: data.boxes[24] || 0,  // Annuities
            28: data.boxes[28] || 0,  // Other income
            105: data.boxes[105] || 0, // Scholarships/bursaries
            135: data.boxes[135] || 0, // Recipient-paid premiums
          }
        });
        setActiveForm('t4a');
        break;

      case 'T4E':
        setEditingSlip({
          id: slipId,
          type: 'T4E',
          payerName: 'Employment Insurance',
          boxes: {
            14: data.boxes[14] || 0,  // Total EI benefits
            15: data.boxes[15] || 0,  // Regular benefits
            17: data.boxes[17] || 0,  // Fishing benefits
            22: data.boxes[22] || 0,  // Income tax deducted
          }
        });
        setActiveForm('t4e');
        break;

      case 'T4FHSA':
        setEditingSlip({
          id: slipId,
          type: 'T4FHSA',
          payerName: data.payerName || '',
          boxes: {
            12: data.boxes[12] || 0,  // Contributions
            22: data.boxes[22] || 0,  // Income tax deducted
            24: data.boxes[24] || 0,  // Transfers in
            26: data.boxes[26] || 0,  // Withdrawals
          }
        });
        setActiveForm('t4fhsa');
        break;

      case 'T5':
        setEditingSlip({
          id: slipId,
          type: 'T5',
          payerName: data.payerName || '',
          boxes: {
            10: data.boxes[10] || 0,  // Actual amount of eligible dividends
            11: data.boxes[11] || 0,  // Taxable amount of eligible dividends
            13: data.boxes[13] || 0,  // Interest from Canadian sources
            18: data.boxes[18] || 0,  // Capital gains dividends
            24: data.boxes[24] || 0,  // Actual amount of dividends other than eligible
            25: data.boxes[25] || 0,  // Taxable amount of dividends other than eligible
            26: data.boxes[26] || 0,  // Dividend tax credit for other than eligible
          }
        });
        setActiveForm('t5');
        break;

      case 'T3':
        setEditingSlip({
          id: slipId,
          type: 'T3',
          payerName: data.payerName || '',
          boxes: {
            21: data.boxes[21] || 0,  // Capital gains
            23: data.boxes[23] || 0,  // Eligible dividends
            26: data.boxes[26] || 0,  // Other income
            32: data.boxes[32] || 0,  // Income tax deducted
            49: data.boxes[49] || 0,  // Interest from Canadian sources
          }
        });
        setActiveForm('t3');
        break;

      case 'T5008':
        setEditingSlip({
          id: slipId,
          type: 'T5008',
          payerName: data.payerName || '',
          boxes: {
            13: data.boxes[13] || 0,  // Type of security
            15: data.boxes[15] || 0,  // Number of shares
            20: data.boxes[20] || 0,  // Proceeds
            21: data.boxes[21] || 0,  // Book value/ACB
          }
        });
        setActiveForm('t5008');
        break;

      case 'T2202':
        // Tuition slip - dispatch to credits context
        dispatch({
          type: 'UPDATE_CREDITS',
          payload: {
            tuition: data.boxes['A'] || data.boxes[1] || 0,
          }
        });
        setActiveForm('tuition');
        break;

      case 'RL1':
        // Quebec Relevé 1 - similar to T4
        setEditingSlip({
          id: slipId,
          type: 'RL1',
          employerName: data.payerName || '',
          boxes: {
            'A': data.boxes['A'] || 0,  // Employment income
            'B': data.boxes['B'] || 0,  // QPP contributions
            'C': data.boxes['C'] || 0,  // EI premiums
            'E': data.boxes['E'] || 0,  // Quebec income tax
            'G': data.boxes['G'] || 0,  // Pensionable salary
          }
        });
        setActiveForm('rl1');
        break;

      default:
        // Unknown type - try to determine from box patterns
        if (data.boxes[14] && (data.boxes[16] || data.boxes[22])) {
          // Likely T4 pattern
          handleParsedData({ ...data, type: 'T4' });
        } else if (data.boxes[16] || data.boxes[28] || data.boxes[105]) {
          // Likely T4A pattern
          handleParsedData({ ...data, type: 'T4A' });
        } else if (data.boxes[13] || data.boxes[24] || data.boxes[10]) {
          // Likely T5 pattern
          handleParsedData({ ...data, type: 'T5' });
        } else if (data.boxes[21] || data.boxes[23]) {
          // Likely T3 pattern
          handleParsedData({ ...data, type: 'T3' });
        } else if (data.boxes['A'] || data.boxes['B']) {
          // Likely Quebec RL slip
          handleParsedData({ ...data, type: 'RL1' });
        } else {
          // Truly unknown - show as generic T4A
          setEditingSlip({
            id: slipId,
            type: 'unknown',
            payerName: data.payerName || 'Unknown Slip',
            boxes: data.boxes
          });
          setActiveForm('t4a');
        }
        break;
    }
  };

  const totalEmploymentIncome = t4Slips.reduce((sum, slip) => sum + (slip.boxes[14] || 0), 0);
  const totalT4AIncome = t4aSlips.reduce((sum, slip) =>
    sum + (slip.boxes[16] || 0) + (slip.boxes[18] || 0) + (slip.boxes[20] || 0) + (slip.boxes[28] || 0), 0);
  const totalT5Income = t5Slips.reduce((sum, slip) =>
    sum + (slip.boxes[13] || 0) + (slip.boxes[24] || 0), 0);
  const totalT2125Income = t2125Data.reduce((sum, data) => sum + data.netIncome, 0);

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

      {/* File Upload Section */}
      <Card style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px', color: '#1F2937' }}>
          Upload Tax Slips
        </h2>
        <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '20px' }}>
          Upload your T4, T4A, or T5 slips as PDF files and we'll extract the information automatically.
        </p>
        <FileUpload onDataParsed={handleParsedData} />
      </Card>

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
            <p style={{ color: '#6B7280', marginBottom: '16px' }}>No T4 slips added yet</p>
            <Button variant="secondary" size="sm" onClick={handleAddT4}>Add your first T4</Button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {t4Slips.map(slip => (
              <div key={slip.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
                <div>
                  <p style={{ fontWeight: 500, color: '#1F2937' }}>{slip.employerName || 'Unnamed Employer'}</p>
                  <p style={{ fontSize: '14px', color: '#6B7280' }}>Employment Income: {formatCurrency(slip.boxes[14] || 0)}</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button variant="ghost" size="sm" onClick={() => handleEditT4(slip)}>Edit</Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteSlip(slip.id)}>Delete</Button>
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', backgroundColor: '#E8F5E9', borderRadius: '8px', fontWeight: 600 }}>
              <span>Total Employment Income</span>
              <span style={{ color: '#0D5F2B' }}>{formatCurrency(totalEmploymentIncome)}</span>
            </div>
          </div>
        )}
      </Card>

      {/* T4A - Pension & Other Income */}
      <Card style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1F2937' }}>
              T4A - Pension & Other Income
            </h2>
            <p style={{ fontSize: '14px', color: '#6B7280' }}>
              Pension, retirement, annuity, and other income
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={handleAddT4A}>
            + Add T4A
          </Button>
        </div>

        {t4aSlips.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', backgroundColor: '#F9FAFB', borderRadius: '8px', border: '2px dashed #E5E7EB' }}>
            <p style={{ color: '#6B7280', fontSize: '14px' }}>No T4A slips added</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {t4aSlips.map(slip => (
              <div key={slip.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
                <div>
                  <p style={{ fontWeight: 500, color: '#1F2937' }}>{slip.payerName || 'Unnamed Payer'}</p>
                  <p style={{ fontSize: '14px', color: '#6B7280' }}>
                    Total: {formatCurrency((slip.boxes[16] || 0) + (slip.boxes[18] || 0) + (slip.boxes[20] || 0) + (slip.boxes[28] || 0))}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button variant="ghost" size="sm" onClick={() => handleEditT4A(slip)}>Edit</Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteSlip(slip.id)}>Delete</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* T2125 - Self-Employment */}
      <Card style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1F2937' }}>
              T2125 - Self-Employment
            </h2>
            <p style={{ fontSize: '14px', color: '#6B7280' }}>
              Business or professional income
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={handleAddT2125}>
            + Add Business
          </Button>
        </div>

        {t2125Data.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', backgroundColor: '#F9FAFB', borderRadius: '8px', border: '2px dashed #E5E7EB' }}>
            <p style={{ color: '#6B7280', fontSize: '14px' }}>No self-employment income added</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {t2125Data.map(data => (
              <div key={data.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
                <div>
                  <p style={{ fontWeight: 500, color: '#1F2937' }}>{data.businessName || 'Self-Employment'}</p>
                  <p style={{ fontSize: '14px', color: '#6B7280' }}>Net Income: {formatCurrency(data.netIncome)}</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button variant="ghost" size="sm" onClick={() => handleEditT2125(data)}>Edit</Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteSlip(data.id)}>Delete</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* T5 - Investment Income */}
      <Card style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1F2937' }}>
              T5 - Investment Income
            </h2>
            <p style={{ fontSize: '14px', color: '#6B7280' }}>
              Interest and dividend income from investments
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={handleAddT5}>
            + Add T5
          </Button>
        </div>

        {t5Slips.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', backgroundColor: '#F9FAFB', borderRadius: '8px', border: '2px dashed #E5E7EB' }}>
            <p style={{ color: '#6B7280', fontSize: '14px' }}>No T5 slips added</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {t5Slips.map(slip => (
              <div key={slip.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
                <div>
                  <p style={{ fontWeight: 500, color: '#1F2937' }}>{slip.payerName || 'Unnamed Institution'}</p>
                  <p style={{ fontSize: '14px', color: '#6B7280' }}>
                    Interest: {formatCurrency(slip.boxes[13] || 0)} | Dividends: {formatCurrency(slip.boxes[24] || 0)}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button variant="ghost" size="sm" onClick={() => handleEditT5(slip)}>Edit</Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteSlip(slip.id)}>Delete</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Other Income */}
      <Card style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px', color: '#1F2937' }}>
          Other Income
        </h2>

        <MoneyInput
          label="Rental Income (Net)"
          value={state.currentReturn.otherIncome.rental}
          onChange={(value) => handleOtherIncomeChange('rental', value)}
          hint="Net rental income after expenses"
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
          hint="Any other taxable income not reported above"
        />
      </Card>

      {/* T4 Form Modal */}
      {activeForm === 't4' && editingSlip && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' }}>
          <Card style={{ maxWidth: '500px', width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>
              {t4Slips.find(s => s.id === editingSlip.id) ? 'Edit T4' : 'Add T4'}
            </h3>
            <Input label="Employer Name" value={editingSlip.employerName} onChange={(e) => setEditingSlip({ ...editingSlip, employerName: e.target.value })} placeholder="ABC Company Inc." />
            <MoneyInput label="Box 14 - Employment Income" value={editingSlip.boxes[14] || 0} onChange={(value) => setEditingSlip({ ...editingSlip, boxes: { ...editingSlip.boxes, 14: value } })} />
            <MoneyInput label="Box 16 - CPP Contributions" value={editingSlip.boxes[16] || 0} onChange={(value) => setEditingSlip({ ...editingSlip, boxes: { ...editingSlip.boxes, 16: value } })} />
            <MoneyInput label="Box 18 - EI Premiums" value={editingSlip.boxes[18] || 0} onChange={(value) => setEditingSlip({ ...editingSlip, boxes: { ...editingSlip.boxes, 18: value } })} />
            <MoneyInput label="Box 22 - Income Tax Deducted" value={editingSlip.boxes[22] || 0} onChange={(value) => setEditingSlip({ ...editingSlip, boxes: { ...editingSlip.boxes, 22: value } })} />
            <MoneyInput label="Box 44 - Union Dues" value={editingSlip.boxes[44] || 0} onChange={(value) => setEditingSlip({ ...editingSlip, boxes: { ...editingSlip.boxes, 44: value } })} />
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <Button variant="secondary" onClick={() => { setActiveForm('none'); setEditingSlip(null); }}>Cancel</Button>
              <Button onClick={handleSaveT4}>Save T4</Button>
            </div>
          </Card>
        </div>
      )}

      {/* T4A Form Modal */}
      {activeForm === 't4a' && editingSlip && (
        <T4AForm
          slip={editingSlip}
          onChange={setEditingSlip}
          onSave={handleSaveSlip}
          onCancel={() => { setActiveForm('none'); setEditingSlip(null); }}
          isEditing={!!t4aSlips.find(s => s.id === editingSlip.id)}
        />
      )}

      {/* T2125 Form Modal */}
      {activeForm === 't2125' && editingSlip && (
        <T2125Form
          data={editingSlip}
          onChange={setEditingSlip}
          onSave={handleSaveSlip}
          onCancel={() => { setActiveForm('none'); setEditingSlip(null); }}
          isEditing={!!t2125Data.find(d => d.id === editingSlip.id)}
        />
      )}

      {/* T5 Form Modal */}
      {activeForm === 't5' && editingSlip && (
        <T5Form
          slip={editingSlip}
          onChange={setEditingSlip}
          onSave={handleSaveSlip}
          onCancel={() => { setActiveForm('none'); setEditingSlip(null); }}
          isEditing={!!t5Slips.find(s => s.id === editingSlip.id)}
        />
      )}

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
