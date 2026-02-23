import React, { useState } from 'react';
import { useTaxReturn, T4Slip, T4ASlip, T5Slip, T2125Data } from '../../context/TaxReturnContext';

interface IncomeFormGeneratorProps {
  formType: string;
}

function MoneyField({ label, value, onChange, hint }: {
  label: string; value: number; onChange: (v: number) => void; hint?: string;
}) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', fontSize: '13px', color: '#6B7280', marginBottom: '4px', fontWeight: 500 }}>
        {label}
        {hint && <span style={{ marginLeft: '6px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '14px', height: '14px', borderRadius: '50%', border: '1px solid #D1D5DB', fontSize: '10px', color: '#9CA3AF', cursor: 'help' }} title={hint}>?</span>}
      </label>
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: '12px', top: '10px', color: '#9CA3AF', fontSize: '14px' }}>$</span>
        <input type="number" value={value || ''} onChange={e => onChange(parseFloat(e.target.value) || 0)}
          placeholder="0.00" step="0.01"
          style={{ width: '100%', padding: '10px 12px 10px 28px', fontSize: '14px', border: '1px solid #E5E7EB', borderRadius: '8px', outline: 'none', backgroundColor: 'white', boxSizing: 'border-box' }}
          onFocus={e => e.target.style.borderColor = '#10B981'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
      </div>
    </div>
  );
}

function TextField({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', fontSize: '13px', color: '#6B7280', marginBottom: '4px', fontWeight: 500 }}>{label}</label>
      <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: '100%', padding: '10px 12px', fontSize: '14px', border: '1px solid #E5E7EB', borderRadius: '8px', outline: 'none', backgroundColor: 'white', boxSizing: 'border-box' }}
        onFocus={e => e.target.style.borderColor = '#10B981'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
    </div>
  );
}

function SlipTabs<T extends { id: string }>({ items, editingId, onSelect, getLabel }: {
  items: T[]; editingId: string | null; onSelect: (id: string) => void; getLabel: (item: T, i: number) => string;
}) {
  if (items.length === 0) return null;
  return (
    <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
      {items.map((item, i) => (
        <button key={item.id} onClick={() => onSelect(item.id)} style={{
          padding: '6px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
          border: editingId === item.id ? '2px solid #10B981' : '1px solid #E5E7EB',
          backgroundColor: editingId === item.id ? '#F0FDF4' : 'white',
          color: editingId === item.id ? '#065F46' : '#4B5563'
        }}>{getLabel(item, i)}</button>
      ))}
    </div>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ marginTop: '16px', padding: '8px 16px', backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>
      Remove
    </button>
  );
}

function FormHeader({ title, subtitle, onAdd, addLabel }: { title: string; subtitle: string; onAdd: () => void; addLabel: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#111827', margin: '0 0 4px 0' }}>{title}</h2>
        <p style={{ color: '#6B7280', fontSize: '14px', margin: 0 }}>{subtitle}</p>
      </div>
      <button onClick={onAdd} style={{ padding: '8px 16px', backgroundColor: '#10B981', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>
        {addLabel}
      </button>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return <div style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}><p>{message}</p></div>;
}

// T4
function T4Form() {
  const { state, dispatch } = useTaxReturn();
  const slips = state.currentReturn.slips.filter(s => s.type === 'T4') as T4Slip[];
  const [editingId, setEditingId] = useState<string | null>(slips[0]?.id || null);
  const editing = slips.find(s => s.id === editingId);

  const handleAdd = () => {
    const s: T4Slip = { id: crypto.randomUUID(), type: 'T4', employerName: '', boxes: {} };
    dispatch({ type: 'ADD_SLIP', payload: s }); setEditingId(s.id);
  };
  const update = (u: Partial<T4Slip>) => { if (editingId) dispatch({ type: 'UPDATE_SLIP', payload: { id: editingId, updates: u } }); };
  const updateBox = (b: number, v: number) => { if (editing) update({ boxes: { ...editing.boxes, [b]: v } }); };

  return (
    <div>
      <FormHeader title="T4 - Employment Income" subtitle="Statement of Remuneration Paid" onAdd={handleAdd} addLabel="+ Add T4" />
      <SlipTabs items={slips} editingId={editingId} onSelect={setEditingId} getLabel={(s, i) => s.employerName || `T4 #${i + 1}`} />
      {editing ? (
        <div>
          <TextField label="Employer Name" value={editing.employerName} onChange={v => update({ employerName: v })} placeholder="ABC Company Inc." />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <MoneyField label="Box 14 - Employment Income" value={editing.boxes[14] || 0} onChange={v => updateBox(14, v)} />
            <MoneyField label="Box 22 - Income Tax Deducted" value={editing.boxes[22] || 0} onChange={v => updateBox(22, v)} />
            <MoneyField label="Box 16 - CPP Contributions" value={editing.boxes[16] || 0} onChange={v => updateBox(16, v)} />
            <MoneyField label="Box 18 - EI Premiums" value={editing.boxes[18] || 0} onChange={v => updateBox(18, v)} />
            <MoneyField label="Box 20 - RPP Contributions" value={editing.boxes[20] || 0} onChange={v => updateBox(20, v)} />
            <MoneyField label="Box 44 - Union Dues" value={editing.boxes[44] || 0} onChange={v => updateBox(44, v)} />
          </div>
          <RemoveButton onClick={() => { dispatch({ type: 'DELETE_SLIP', payload: editing.id }); setEditingId(slips.find(s => s.id !== editing.id)?.id || null); }} />
        </div>
      ) : <EmptyState message='Click "+ Add T4" to enter employment income.' />}
    </div>
  );
}

// T4A
function T4AFormEditor() {
  const { state, dispatch } = useTaxReturn();
  const slips = state.currentReturn.slips.filter(s => s.type === 'T4A') as T4ASlip[];
  const [editingId, setEditingId] = useState<string | null>(slips[0]?.id || null);
  const editing = slips.find(s => s.id === editingId);

  const handleAdd = () => {
    const s: T4ASlip = { id: crypto.randomUUID(), type: 'T4A', payerName: '', boxes: {} };
    dispatch({ type: 'ADD_SLIP', payload: s }); setEditingId(s.id);
  };
  const update = (u: Partial<T4ASlip>) => { if (editingId) dispatch({ type: 'UPDATE_SLIP', payload: { id: editingId, updates: u } }); };
  const updateBox = (b: number, v: number) => { if (editing) update({ boxes: { ...editing.boxes, [b]: v } }); };

  return (
    <div>
      <FormHeader title="T4A - Pension & Other Income" subtitle="Statement of Pension, Retirement, Annuity" onAdd={handleAdd} addLabel="+ Add T4A" />
      <SlipTabs items={slips} editingId={editingId} onSelect={setEditingId} getLabel={(s, i) => s.payerName || `T4A #${i + 1}`} />
      {editing ? (
        <div>
          <TextField label="Payer Name" value={editing.payerName} onChange={v => update({ payerName: v })} placeholder="Pension Plan Name" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <MoneyField label="Box 16 - Pension" value={editing.boxes[16] || 0} onChange={v => updateBox(16, v)} />
            <MoneyField label="Box 22 - Income Tax Deducted" value={editing.boxes[22] || 0} onChange={v => updateBox(22, v)} />
            <MoneyField label="Box 18 - Lump-sum Payments" value={editing.boxes[18] || 0} onChange={v => updateBox(18, v)} />
            <MoneyField label="Box 20 - Self-employed Commissions" value={editing.boxes[20] || 0} onChange={v => updateBox(20, v)} />
            <MoneyField label="Box 24 - Annuities" value={editing.boxes[24] || 0} onChange={v => updateBox(24, v)} />
            <MoneyField label="Box 28 - Other Income" value={editing.boxes[28] || 0} onChange={v => updateBox(28, v)} />
          </div>
          <RemoveButton onClick={() => { dispatch({ type: 'DELETE_SLIP', payload: editing.id }); setEditingId(slips.find(s => s.id !== editing.id)?.id || null); }} />
        </div>
      ) : <EmptyState message='Click "+ Add T4A" to enter pension income.' />}
    </div>
  );
}

// T2125
function T2125FormEditor() {
  const { state, dispatch } = useTaxReturn();
  const slips = state.currentReturn.slips.filter(s => s.type === 'T2125') as T2125Data[];
  const [editingId, setEditingId] = useState<string | null>(slips[0]?.id || null);
  const editing = slips.find(s => s.id === editingId);

  const handleAdd = () => {
    const s: T2125Data = { id: crypto.randomUUID(), type: 'T2125', businessName: '', grossRevenue: 0, expenses: 0, netIncome: 0 };
    dispatch({ type: 'ADD_SLIP', payload: s }); setEditingId(s.id);
  };
  const updateField = (field: string, value: string | number) => {
    if (!editingId || !editing) return;
    const updates: Partial<T2125Data> = { [field]: value };
    if (field === 'grossRevenue' || field === 'expenses') {
      const gross = field === 'grossRevenue' ? (value as number) : editing.grossRevenue;
      const exp = field === 'expenses' ? (value as number) : editing.expenses;
      updates.netIncome = gross - exp;
    }
    dispatch({ type: 'UPDATE_SLIP', payload: { id: editingId, updates } });
  };

  return (
    <div>
      <FormHeader title="T2125 - Business Income" subtitle="Statement of Business or Professional Activities" onAdd={handleAdd} addLabel="+ Add Business" />
      <SlipTabs items={slips} editingId={editingId} onSelect={setEditingId} getLabel={(s, i) => s.businessName || `Business #${i + 1}`} />
      {editing ? (
        <div>
          <TextField label="Business Name" value={editing.businessName} onChange={v => updateField('businessName', v)} placeholder="My Consulting Co." />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <MoneyField label="Gross Revenue" value={editing.grossRevenue} onChange={v => updateField('grossRevenue', v)} />
            <MoneyField label="Total Expenses" value={editing.expenses} onChange={v => updateField('expenses', v)} />
          </div>
          <div style={{ marginTop: '12px', padding: '16px', backgroundColor: '#F0FDF4', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 500, color: '#065F46' }}>Net Business Income</span>
            <span style={{ fontWeight: 600, fontSize: '18px', color: editing.netIncome >= 0 ? '#065F46' : '#DC2626' }}>
              ${editing.netIncome.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <RemoveButton onClick={() => { dispatch({ type: 'DELETE_SLIP', payload: editing.id }); setEditingId(slips.find(s => s.id !== editing.id)?.id || null); }} />
        </div>
      ) : <EmptyState message='Click "+ Add Business" to enter self-employment income.' />}
    </div>
  );
}

// T5
function T5FormEditor() {
  const { state, dispatch } = useTaxReturn();
  const slips = state.currentReturn.slips.filter(s => s.type === 'T5') as T5Slip[];
  const [editingId, setEditingId] = useState<string | null>(slips[0]?.id || null);
  const editing = slips.find(s => s.id === editingId);

  const handleAdd = () => {
    const s: T5Slip = { id: crypto.randomUUID(), type: 'T5', payerName: '', boxes: {} };
    dispatch({ type: 'ADD_SLIP', payload: s }); setEditingId(s.id);
  };
  const update = (u: Partial<T5Slip>) => { if (editingId) dispatch({ type: 'UPDATE_SLIP', payload: { id: editingId, updates: u } }); };
  const updateBox = (b: number, v: number) => { if (editing) update({ boxes: { ...editing.boxes, [b]: v } }); };

  return (
    <div>
      <FormHeader title="T5 - Investment Income" subtitle="Statement of Investment Income" onAdd={handleAdd} addLabel="+ Add T5" />
      <SlipTabs items={slips} editingId={editingId} onSelect={setEditingId} getLabel={(s, i) => s.payerName || `T5 #${i + 1}`} />
      {editing ? (
        <div>
          <TextField label="Institution Name" value={editing.payerName} onChange={v => update({ payerName: v })} placeholder="Bank or Brokerage" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <MoneyField label="Box 13 - Interest Income" value={editing.boxes[13] || 0} onChange={v => updateBox(13, v)} />
            <MoneyField label="Box 10 - Eligible Dividends (Actual)" value={editing.boxes[10] || 0} onChange={v => updateBox(10, v)} />
            <MoneyField label="Box 11 - Eligible Dividends (Taxable)" value={editing.boxes[11] || 0} onChange={v => updateBox(11, v)} />
            <MoneyField label="Box 18 - Capital Gains Dividends" value={editing.boxes[18] || 0} onChange={v => updateBox(18, v)} />
            <MoneyField label="Box 24 - Other Dividends (Actual)" value={editing.boxes[24] || 0} onChange={v => updateBox(24, v)} />
            <MoneyField label="Box 25 - Other Dividends (Taxable)" value={editing.boxes[25] || 0} onChange={v => updateBox(25, v)} />
          </div>
          <RemoveButton onClick={() => { dispatch({ type: 'DELETE_SLIP', payload: editing.id }); setEditingId(slips.find(s => s.id !== editing.id)?.id || null); }} />
        </div>
      ) : <EmptyState message='Click "+ Add T5" to enter investment income.' />}
    </div>
  );
}

// Simple deduction/credit forms
function SimpleDeductionForm({ title, subtitle, label, value, onChange, hint }: {
  title: string; subtitle: string; label: string; value: number; onChange: (v: number) => void; hint?: string;
}) {
  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#111827', margin: '0 0 4px 0' }}>{title}</h2>
      <p style={{ color: '#6B7280', fontSize: '14px', margin: '0 0 20px 0' }}>{subtitle}</p>
      <MoneyField label={label} value={value} onChange={onChange} hint={hint} />
    </div>
  );
}

function MedicalForm() {
  const { state, dispatch } = useTaxReturn();
  const c = state.currentReturn.credits;
  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#111827', margin: '0 0 4px 0' }}>Medical Expenses</h2>
      <p style={{ color: '#6B7280', fontSize: '14px', margin: '0 0 20px 0' }}>Claim eligible out-of-pocket medical expenses</p>
      <MoneyField label="Medical Expenses" value={c.medical} onChange={v => dispatch({ type: 'UPDATE_CREDITS', payload: { medical: v } })} hint="Prescriptions, dental, vision, etc." />
      <MoneyField label="Medical Travel" value={c.medicalTravel} onChange={v => dispatch({ type: 'UPDATE_CREDITS', payload: { medicalTravel: v } })} />
      <MoneyField label="Accommodation" value={c.medicalAccommodation} onChange={v => dispatch({ type: 'UPDATE_CREDITS', payload: { medicalAccommodation: v } })} />
      {(c.medical + c.medicalTravel + c.medicalAccommodation) > 0 && (
        <div style={{ marginTop: '12px', padding: '16px', backgroundColor: '#F0FDF4', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 500, color: '#065F46' }}>Total Medical</span>
          <span style={{ fontWeight: 600, color: '#065F46' }}>${(c.medical + c.medicalTravel + c.medicalAccommodation).toLocaleString('en-CA', { minimumFractionDigits: 2 })}</span>
        </div>
      )}
    </div>
  );
}

function DonationsForm() {
  const { state, dispatch } = useTaxReturn();
  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#111827', margin: '0 0 4px 0' }}>Charitable Donations</h2>
      <p style={{ color: '#6B7280', fontSize: '14px', margin: '0 0 20px 0' }}>Donations to registered charities</p>
      <MoneyField label="Total Donations (2025)" value={state.currentReturn.credits.donations}
        onChange={v => dispatch({ type: 'UPDATE_CREDITS', payload: { donations: v } })} />
      <MoneyField label="Carry-Forward from Prior Years" value={state.currentReturn.credits.donationCarryForward}
        onChange={v => dispatch({ type: 'UPDATE_CREDITS', payload: { donationCarryForward: v } })} hint="Unused donations from the last 5 years" />
      <div style={{ marginTop: '12px', padding: '16px', backgroundColor: '#EFF6FF', borderRadius: '8px', fontSize: '13px', color: '#1D4ED8' }}>
        First $200 earns 15% federal credit. Amounts over $200 earn 29% (33% on income above $235,675).
      </div>
    </div>
  );
}

function PlaceholderForm({ formType }: { formType: string }) {
  const labels: Record<string, { title: string; desc: string }> = {
    home: { title: 'First-Time Home Buyers', desc: "Claim up to $10,000 under the Home Buyers' Plan" },
    child: { title: 'Canada Child Benefit', desc: 'CCB eligibility and payment details' },
    stocks: { title: 'Schedule 3 - Capital Gains', desc: 'Report sales of stocks, crypto, or property' },
  };
  const info = labels[formType] || { title: formType.toUpperCase(), desc: 'Tax form' };
  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#111827', margin: '0 0 4px 0' }}>{info.title}</h2>
      <p style={{ color: '#6B7280', fontSize: '14px', margin: '0 0 20px 0' }}>{info.desc}</p>
      <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#F9FAFB', borderRadius: '12px', border: '2px dashed #E5E7EB' }}>
        <p style={{ color: '#6B7280' }}>This form will be available in a future update.</p>
      </div>
    </div>
  );
}

export default function IncomeFormGenerator({ formType }: IncomeFormGeneratorProps) {
  const { state, dispatch } = useTaxReturn();
  switch (formType) {
    case 't4': return <T4Form />;
    case 't4a': return <T4AFormEditor />;
    case 't2125': return <T2125FormEditor />;
    case 't5': case 't5008': return <T5FormEditor />;
    case 't2202': return <SimpleDeductionForm title="T2202 - Tuition" subtitle="Tuition and Enrolment Certificate" label="Eligible Tuition Fees (Box A)" value={state.currentReturn.credits.tuition} onChange={v => dispatch({ type: 'UPDATE_CREDITS', payload: { tuition: v } })} hint="Total fees paid to eligible institutions" />;
    case 'medical': return <MedicalForm />;
    case 'rrsp': return <SimpleDeductionForm title="RRSP Contributions" subtitle="Registered Retirement Savings Plan" label="RRSP Contribution Amount" value={state.currentReturn.deductions.rrsp} onChange={v => dispatch({ type: 'UPDATE_DEDUCTIONS', payload: { rrsp: v } })} hint="2025 limit: $32,490 or 18% of earned income" />;
    case 'donations': return <DonationsForm />;
    default: return <PlaceholderForm formType={formType} />;
  }
}
