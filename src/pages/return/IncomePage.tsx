import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTaxReturn, T4Slip, T4ASlip, T4RSPSlip, T5Slip, T2125Data, CapitalGainsTransaction, IncomeSlip } from '../../context/TaxReturnContext';
import { formatCurrency } from '../../domain/tax';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input, MoneyInput } from '../../components/ui/Input';
import { Alert } from '../../components/ui/Alert';
import { T4AForm } from '../../components/tax/T4AForm';
import { T2125Form } from '../../components/tax/T2125Form';
import { T5Form } from '../../components/tax/T5Form';
import { CapitalGainsForm } from '../../components/tax/CapitalGainsForm';
import { FileUpload } from '../../components/tax/FileUpload';
import { ParsedSlipData } from '../../utils/pdf-parser';
import { FORM_REGISTRY } from '../../domain/forms/form-registry';
import { tokens } from '../../styles/tokens';

type ActiveForm = 'none' | 't4' | 't4a' | 't4e' | 't4fhsa' | 't2125' | 't5' | 't3' | 't5008' | 'tuition' | 'rl1' | 'rrsp' | 'capitalGains';

// Form categories generated from canonical registry
const FORM_CATEGORIES = FORM_REGISTRY.reduce<Record<string, { label: string; icon: string; forms: { id: string; name: string; description: string }[] }>>(
  (acc, form) => {
    const key = form.category.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!acc[key]) {
      acc[key] = {
        label: form.category,
        icon: '',
        forms: []
      };
    }
    acc[key].forms.push({
      id: form.id,
      name: form.code,
      description: `${form.name}${form.supportedStatus === 'planned' ? ' (Planned)' : ''}`
    });
    return acc;
  },
  {}
);

/* ---------- Category icon resolver ---------- */
function CategoryIcon({ category }: { category: string }) {
  const c = category.toLowerCase();
  if (c.includes('employ')) return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>
  );
  if (c.includes('invest') || c.includes('capital')) return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
  );
  if (c.includes('self') || c.includes('business')) return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  );
  if (c.includes('pension') || c.includes('retire')) return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
  );
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
  );
}

/* ---------- Slip card ---------- */
function SlipCard({ name, detail, onEdit, onDelete }: { name: string; detail: string; onEdit: () => void; onDelete: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '14px 18px',
        backgroundColor: hovered ? tokens.color.surfaceHover : tokens.color.bg,
        borderRadius: tokens.radius.md,
        border: `1px solid ${tokens.color.borderLight}`,
        transition: tokens.transition.fast
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: tokens.radius.sm,
          backgroundColor: tokens.color.brandLight,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={tokens.color.brand} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
          </svg>
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontWeight: tokens.font.weight.medium, color: tokens.color.text, margin: 0, fontSize: tokens.font.size.sm, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {name}
          </p>
          <p style={{ fontSize: tokens.font.size.xs, color: tokens.color.muted, margin: '2px 0 0' }}>{detail}</p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
        <Button variant="ghost" size="sm" onClick={onEdit}>Edit</Button>
        <Button variant="ghost" size="sm" onClick={onDelete} style={{ color: tokens.color.danger }}>Delete</Button>
      </div>
    </div>
  );
}

/* ---------- Total row ---------- */
function TotalRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 18px',
      backgroundColor: tokens.color.brandLight,
      borderRadius: tokens.radius.md,
      fontWeight: tokens.font.weight.semibold,
      fontSize: tokens.font.size.sm
    }}>
      <span style={{ color: tokens.color.text }}>{label}</span>
      <span style={{ color: tokens.color.brand }}>{value}</span>
    </div>
  );
}

/* ---------- Empty state ---------- */
function EmptySlipState({ label, onAdd }: { label: string; onAdd: () => void }) {
  return (
    <div style={{
      padding: '28px',
      textAlign: 'center',
      backgroundColor: tokens.color.bg,
      borderRadius: tokens.radius.md,
      border: `2px dashed ${tokens.color.border}`
    }}>
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={tokens.color.mutedLight} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '10px' }}>
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
      </svg>
      <p style={{ color: tokens.color.muted, fontSize: tokens.font.size.sm, marginBottom: '12px' }}>No {label} added yet</p>
      <Button variant="outline" size="sm" onClick={onAdd}>Add your first slip</Button>
    </div>
  );
}

/* ---------- Section header ---------- */
function SectionHeader({ code, title, subtitle, onAdd, addLabel }: { code: string; title: string; subtitle: string; onAdd: () => void; addLabel: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{
          fontSize: tokens.font.size.xs,
          fontWeight: tokens.font.weight.bold,
          color: tokens.color.brand,
          backgroundColor: tokens.color.brandLight,
          padding: '4px 10px',
          borderRadius: '6px',
          letterSpacing: '0.03em'
        }}>
          {code}
        </span>
        <div>
          <h2 style={{ fontSize: tokens.font.size.md, fontWeight: tokens.font.weight.semibold, color: tokens.color.text, margin: 0 }}>{title}</h2>
          <p style={{ fontSize: tokens.font.size.xs, color: tokens.color.muted, margin: '2px 0 0' }}>{subtitle}</p>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onAdd}
        icon={
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        }
      >
        {addLabel}
      </Button>
    </div>
  );
}

/* ---------- Modal overlay ---------- */
function ModalOverlay({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.4)',
      backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '24px'
    }}>
      {children}
    </div>
  );
}

/* ======================================================= */
export function IncomePage() {
  const navigate = useNavigate();
  const { taxYear } = useParams();
  const { state, dispatch } = useTaxReturn();
  const [activeForm, setActiveForm] = useState<ActiveForm>('none');
  const [editingSlip, setEditingSlip] = useState<IncomeSlip | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFormSearch, setShowFormSearch] = useState(false);
  const [showUploadPrompt, setShowUploadPrompt] = useState(false);
  const [notification, setNotification] = useState<{ type: 'info' | 'success' | 'warning'; message: string } | null>(null);

  const t4Slips = state.currentReturn.slips.filter(s => s.type === 'T4') as T4Slip[];
  const t4aSlips = state.currentReturn.slips.filter(s => s.type === 'T4A') as T4ASlip[];
  const t5Slips = state.currentReturn.slips.filter(s => s.type === 'T5') as T5Slip[];
  const t2125Data = state.currentReturn.slips.filter(s => s.type === 'T2125') as T2125Data[];
  const capitalGainsTransactions = state.currentReturn.slips.filter(s => s.type === 'CapitalGains') as CapitalGainsTransaction[];
  const [editingCapitalGains, setEditingCapitalGains] = useState<CapitalGainsTransaction | null>(null);

  /* --- All handlers unchanged --- */
  const handleAddT4 = () => { setEditingSlip({ id: crypto.randomUUID(), type: 'T4', employerName: '', boxes: {} }); setActiveForm('t4'); setShowUploadPrompt(true); };
  const handleEditT4 = (slip: T4Slip) => { setEditingSlip({ ...slip }); setActiveForm('t4'); setShowUploadPrompt(false); };
  const handleSaveT4 = () => { if (!editingSlip) return; const existing = state.currentReturn.slips.find(s => s.id === editingSlip.id); if (existing) { dispatch({ type: 'UPDATE_SLIP', payload: { id: editingSlip.id, updates: editingSlip } }); } else { dispatch({ type: 'ADD_SLIP', payload: editingSlip }); } setActiveForm('none'); setEditingSlip(null); };
  const handleAddT4A = () => { setEditingSlip({ id: crypto.randomUUID(), type: 'T4A', payerName: '', boxes: {} }); setActiveForm('t4a'); setShowUploadPrompt(true); };
  const handleEditT4A = (slip: T4ASlip) => { setEditingSlip({ ...slip }); setActiveForm('t4a'); setShowUploadPrompt(false); };
  const handleAddT5 = () => { setEditingSlip({ id: crypto.randomUUID(), type: 'T5', payerName: '', boxes: {} }); setActiveForm('t5'); setShowUploadPrompt(true); };
  const handleEditT5 = (slip: T5Slip) => { setEditingSlip({ ...slip }); setActiveForm('t5'); setShowUploadPrompt(false); };
  const handleAddT2125 = () => { setEditingSlip({ id: crypto.randomUUID(), type: 'T2125', businessName: '', grossRevenue: 0, expenses: 0, netIncome: 0 }); setActiveForm('t2125'); };
  const handleEditT2125 = (data: T2125Data) => { setEditingSlip({ ...data }); setActiveForm('t2125'); };
  const handleSaveSlip = () => { if (!editingSlip) return; const existing = state.currentReturn.slips.find(s => s.id === editingSlip.id); if (existing) { dispatch({ type: 'UPDATE_SLIP', payload: { id: editingSlip.id, updates: editingSlip } }); } else { dispatch({ type: 'ADD_SLIP', payload: editingSlip }); } setActiveForm('none'); setEditingSlip(null); };
  const handleDeleteSlip = (id: string) => { dispatch({ type: 'DELETE_SLIP', payload: id }); };
  const handleOtherIncomeChange = (field: string, value: number) => { dispatch({ type: 'UPDATE_OTHER_INCOME', payload: { [field]: value } }); };

  const handleFormSelect = (formId: string) => {
    switch (formId) {
      case 't4': handleAddT4(); break;
      case 't4a': handleAddT4A(); break;
      case 't5': handleAddT5(); break;
      case 't2125': handleAddT2125(); break;
      case 'rrsp': navigate(`/return/${taxYear}/deductions#rrsp`); break;
      case 'capitalGains':
        setEditingCapitalGains({ id: crypto.randomUUID(), type: 'CapitalGains', description: '', dateAcquired: '', dateSold: '', proceeds: 0, adjustedCostBase: 0, outlayAndExpenses: 0, gain: 0 });
        setActiveForm('capitalGains');
        break;
      case 'tuition': navigate(`/return/${taxYear}/deductions#tuition`); break;
      default:
        setNotification({ type: 'info', message: `${formId.toUpperCase()} form support coming soon!` });
        setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleParsedData = (data: ParsedSlipData) => {
    const slipId = crypto.randomUUID();
    switch (data.type) {
      case 'T4':
        setEditingSlip({ id: slipId, type: 'T4', employerName: data.payerName || '', boxes: { 14: data.boxes[14] || 0, 16: data.boxes[16] || 0, 18: data.boxes[18] || 0, 22: data.boxes[22] || 0, 24: data.boxes[24] || 0, 26: data.boxes[26] || 0, 44: data.boxes[44] || 0, 46: data.boxes[46] || 0, 52: data.boxes[52] || 0 } });
        setActiveForm('t4'); break;
      case 'T4A':
        setEditingSlip({ id: slipId, type: 'T4A', payerName: data.payerName || '', boxes: { 16: data.boxes[16] || 0, 18: data.boxes[18] || 0, 20: data.boxes[20] || 0, 22: data.boxes[22] || 0, 24: data.boxes[24] || 0, 28: data.boxes[28] || 0, 105: data.boxes[105] || 0, 135: data.boxes[135] || 0 } });
        setActiveForm('t4a'); break;
      case 'T4E':
        setEditingSlip({ id: slipId, type: 'T4E', payerName: 'Employment Insurance', boxes: { 14: data.boxes[14] || 0, 15: data.boxes[15] || 0, 17: data.boxes[17] || 0, 22: data.boxes[22] || 0 } });
        setActiveForm('t4e'); break;
      case 'T4FHSA':
        setEditingSlip({ id: slipId, type: 'T4FHSA', payerName: data.payerName || '', boxes: { 12: data.boxes[12] || 0, 22: data.boxes[22] || 0, 24: data.boxes[24] || 0, 26: data.boxes[26] || 0 } });
        setActiveForm('t4fhsa'); break;
      case 'T4RSP':
        setEditingSlip({ id: slipId, type: 'T4RSP', payerName: data.payerName || '', boxes: { 16: data.boxes[16] || 0, 18: data.boxes[18] || 0, 20: data.boxes[20] || 0, 22: data.boxes[22] || 0, 26: data.boxes[26] || 0, 28: data.boxes[28] || 0, 34: data.boxes[34] || 0, 40: data.boxes[40] || 0 } });
        setActiveForm('rrsp'); break;
      case 'T5':
        setEditingSlip({ id: slipId, type: 'T5', payerName: data.payerName || '', boxes: { 10: data.boxes[10] || 0, 11: data.boxes[11] || 0, 13: data.boxes[13] || 0, 18: data.boxes[18] || 0, 24: data.boxes[24] || 0, 25: data.boxes[25] || 0, 26: data.boxes[26] || 0 } });
        setActiveForm('t5'); break;
      case 'T3':
        setEditingSlip({ id: slipId, type: 'T3', payerName: data.payerName || '', boxes: { 21: data.boxes[21] || 0, 23: data.boxes[23] || 0, 26: data.boxes[26] || 0, 32: data.boxes[32] || 0, 49: data.boxes[49] || 0 } });
        setActiveForm('t3'); break;
      case 'T5008':
        setEditingSlip({ id: slipId, type: 'T5008', payerName: data.payerName || '', boxes: { 13: data.boxes[13] || 0, 15: data.boxes[15] || 0, 20: data.boxes[20] || 0, 21: data.boxes[21] || 0 } });
        setActiveForm('t5008'); break;
      case 'T2202':
        dispatch({ type: 'UPDATE_CREDITS', payload: { tuition: data.boxes['A'] || data.boxes[1] || 0 } });
        setActiveForm('tuition'); break;
      case 'RL1':
        setEditingSlip({ id: slipId, type: 'RL1', employerName: data.payerName || '', boxes: { 'A': data.boxes['A'] || 0, 'B': data.boxes['B'] || 0, 'C': data.boxes['C'] || 0, 'E': data.boxes['E'] || 0, 'G': data.boxes['G'] || 0 } });
        setActiveForm('rl1'); break;
      default:
        if (data.boxes[14] && (data.boxes[16] || data.boxes[22])) { handleParsedData({ ...data, type: 'T4' }); }
        else if (data.boxes[16] || data.boxes[28] || data.boxes[105]) { handleParsedData({ ...data, type: 'T4A' }); }
        else if (data.boxes[13] || data.boxes[24] || data.boxes[10]) { handleParsedData({ ...data, type: 'T5' }); }
        else if (data.boxes[21] || data.boxes[23]) { handleParsedData({ ...data, type: 'T3' }); }
        else if (data.boxes['A'] || data.boxes['B']) { handleParsedData({ ...data, type: 'RL1' }); }
        else {
          setEditingSlip({ id: slipId, type: 'T4A', payerName: data.payerName || 'Unknown Slip', boxes: { 16: data.boxes[16] || 0, 18: data.boxes[18] || 0, 20: data.boxes[20] || 0, 22: data.boxes[22] || 0, 24: data.boxes[24] || 0, 28: data.boxes[28] || 0, 105: data.boxes[105] || 0, 135: data.boxes[135] || 0 } });
          setActiveForm('t4a');
        }
        break;
    }
  };

  const totalEmploymentIncome = t4Slips.reduce((sum, slip) => sum + (slip.boxes[14] || 0), 0);
  const totalT4AIncome = t4aSlips.reduce((sum, slip) => sum + (slip.boxes[16] || 0) + (slip.boxes[18] || 0) + (slip.boxes[20] || 0) + (slip.boxes[28] || 0), 0);
  const totalT5Income = t5Slips.reduce((sum, slip) => sum + (slip.boxes[13] || 0) + (slip.boxes[24] || 0), 0);
  const totalT2125Income = t2125Data.reduce((sum, data) => sum + data.netIncome, 0);
  const grandTotal = totalEmploymentIncome + totalT4AIncome + totalT5Income + totalT2125Income + (state.currentReturn.otherIncome.rental || 0) + (state.currentReturn.otherIncome.other || 0);

  return (
    <div>
      {/* Page header with income badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: tokens.font.size.xl, fontWeight: tokens.font.weight.bold, marginBottom: '4px', color: tokens.color.text, letterSpacing: '-0.02em' }}>
            Income
          </h1>
          <p style={{ fontSize: tokens.font.size.sm, color: tokens.color.muted, margin: 0 }}>
            Enter all your income for {taxYear}. We calculate taxes as you go.
          </p>
        </div>
        {grandTotal > 0 && (
          <div style={{
            backgroundColor: tokens.color.brandLight,
            padding: '8px 16px',
            borderRadius: '24px',
            display: 'flex', alignItems: 'center', gap: '6px'
          }}>
            <span style={{ fontSize: tokens.font.size.xs, color: tokens.color.muted }}>Total</span>
            <span style={{ fontSize: tokens.font.size.sm, fontWeight: tokens.font.weight.bold, color: tokens.color.brand }}>{formatCurrency(grandTotal)}</span>
          </div>
        )}
      </div>

      {state.profile.province === 'QC' && (
        <div style={{ marginBottom: '20px' }}>
          <Alert type="info">Your T4 information will also be used for your Quebec return (TP-1).</Alert>
        </div>
      )}

      {notification && (
        <div style={{ marginBottom: '20px' }}>
          <Alert type={notification.type} onClose={() => setNotification(null)}>{notification.message}</Alert>
        </div>
      )}

      {/* Upload section */}
      <Card accentBorder="left" accentColor={tokens.color.brandMid} style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={tokens.color.brand} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          <h2 style={{ fontSize: tokens.font.size.md, fontWeight: tokens.font.weight.semibold, color: tokens.color.text, margin: 0 }}>Upload Tax Slips</h2>
        </div>
        <p style={{ fontSize: tokens.font.size.xs, color: tokens.color.muted, marginBottom: '16px' }}>
          Upload your T4, T4A, or T5 slips as PDF files and we'll extract the information automatically.
        </p>
        <FileUpload onDataParsed={handleParsedData} />
      </Card>

      {/* Search & add forms */}
      <Card style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={tokens.color.brand} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <h2 style={{ fontSize: tokens.font.size.md, fontWeight: tokens.font.weight.semibold, color: tokens.color.text, margin: 0 }}>Add Tax Forms</h2>
        </div>
        <p style={{ fontSize: tokens.font.size.xs, color: tokens.color.muted, marginBottom: '14px' }}>
          Search for forms or filter by category to add to your return.
        </p>

        <div style={{ position: 'relative', marginBottom: '14px' }}>
          <label htmlFor="form-search" className="sr-only" style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>Search tax forms</label>
          <div style={{ position: 'relative' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={tokens.color.mutedLight} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              id="form-search"
              type="text"
              placeholder="Search forms (e.g., T4, RRSP, donations...)"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setShowFormSearch(true); }}
              onFocus={() => setShowFormSearch(true)}
              aria-expanded={showFormSearch && (!!searchQuery || !!selectedCategory)}
              aria-haspopup="listbox"
              aria-autocomplete="list"
              style={{
                width: '100%',
                padding: '12px 16px 12px 42px',
                fontSize: tokens.font.size.sm,
                border: `1px solid ${tokens.color.border}`,
                borderRadius: tokens.radius.md,
                outline: 'none',
                transition: tokens.transition.fast,
                backgroundColor: tokens.color.bg,
                color: tokens.color.text,
                fontFamily: 'inherit'
              }}
            />
          </div>

          {showFormSearch && (searchQuery || selectedCategory) && (
            <div role="listbox" aria-label="Available tax forms" style={{
              position: 'absolute', top: '100%', left: 0, right: 0,
              backgroundColor: 'white',
              border: `1px solid ${tokens.color.border}`,
              borderRadius: tokens.radius.lg,
              marginTop: '6px',
              maxHeight: '300px',
              overflow: 'auto',
              zIndex: 100,
              boxShadow: tokens.shadow.lg
            }}>
              {Object.entries(FORM_CATEGORIES)
                .filter(([key]) => !selectedCategory || key === selectedCategory)
                .flatMap(([, cat]) => cat.forms)
                .filter(form => !searchQuery || form.name.toLowerCase().includes(searchQuery.toLowerCase()) || form.description.toLowerCase().includes(searchQuery.toLowerCase()))
                .map(form => (
                  <button
                    key={form.id}
                    role="option"
                    aria-label={`Add ${form.name} - ${form.description}`}
                    onClick={() => { handleFormSelect(form.id); setSearchQuery(''); setShowFormSearch(false); }}
                    style={{
                      width: '100%', padding: '12px 16px', textAlign: 'left', border: 'none',
                      borderBottom: `1px solid ${tokens.color.borderLight}`,
                      backgroundColor: 'transparent', cursor: 'pointer',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      transition: tokens.transition.fast, fontFamily: 'inherit'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: tokens.font.weight.medium, color: tokens.color.text, fontSize: tokens.font.size.sm }}>{form.name}</div>
                      <div style={{ fontSize: tokens.font.size.xs, color: tokens.color.muted }}>{form.description}</div>
                    </div>
                    <div style={{
                      width: '24px', height: '24px', borderRadius: '50%',
                      backgroundColor: tokens.color.brandLight,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={tokens.color.brand} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                    </div>
                  </button>
                ))}
            </div>
          )}
        </div>

        {/* Category filter pills */}
        <div role="group" aria-label="Filter forms by category" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {Object.entries(FORM_CATEGORIES).map(([key, category]) => (
            <button
              key={key}
              type="button"
              aria-pressed={selectedCategory === key}
              aria-label={`Filter by ${category.label}`}
              onClick={() => { setSelectedCategory(selectedCategory === key ? null : key); setShowFormSearch(true); }}
              style={{
                padding: '6px 14px',
                fontSize: tokens.font.size.xs,
                fontWeight: tokens.font.weight.medium,
                border: selectedCategory === key ? `1.5px solid ${tokens.color.brand}` : `1px solid ${tokens.color.border}`,
                borderRadius: '20px',
                backgroundColor: selectedCategory === key ? tokens.color.brandLight : 'white',
                color: selectedCategory === key ? tokens.color.brand : tokens.color.muted,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px',
                transition: tokens.transition.fast,
                fontFamily: 'inherit'
              }}
            >
              <CategoryIcon category={category.label} />
              <span>{category.label}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* T4 Employment Income */}
      <Card style={{ marginBottom: '20px' }}>
        <SectionHeader code="T4" title="Employment Income" subtitle="Add your T4 slips from employers" onAdd={handleAddT4} addLabel="Add T4" />
        {t4Slips.length === 0 ? (
          <EmptySlipState label="T4 slips" onAdd={handleAddT4} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {t4Slips.map(slip => (
              <SlipCard key={slip.id} name={slip.employerName || 'Unnamed Employer'} detail={`Employment Income: ${formatCurrency(slip.boxes[14] || 0)}`} onEdit={() => handleEditT4(slip)} onDelete={() => handleDeleteSlip(slip.id)} />
            ))}
            <TotalRow label="Total Employment Income" value={formatCurrency(totalEmploymentIncome)} />
          </div>
        )}
      </Card>

      {/* T4A Pension & Other */}
      <Card style={{ marginBottom: '20px' }}>
        <SectionHeader code="T4A" title="Pension & Other Income" subtitle="Pension, retirement, annuity, and other income" onAdd={handleAddT4A} addLabel="Add T4A" />
        {t4aSlips.length === 0 ? (
          <EmptySlipState label="T4A slips" onAdd={handleAddT4A} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {t4aSlips.map(slip => (
              <SlipCard key={slip.id} name={slip.payerName || 'Unnamed Payer'} detail={`Total: ${formatCurrency((slip.boxes[16] || 0) + (slip.boxes[18] || 0) + (slip.boxes[20] || 0) + (slip.boxes[28] || 0))}`} onEdit={() => handleEditT4A(slip)} onDelete={() => handleDeleteSlip(slip.id)} />
            ))}
          </div>
        )}
      </Card>

      {/* T2125 Self-Employment */}
      <Card style={{ marginBottom: '20px' }}>
        <SectionHeader code="T2125" title="Self-Employment" subtitle="Business or professional income" onAdd={handleAddT2125} addLabel="Add Business" />
        {t2125Data.length === 0 ? (
          <EmptySlipState label="self-employment income" onAdd={handleAddT2125} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {t2125Data.map(data => (
              <SlipCard key={data.id} name={data.businessName || 'Self-Employment'} detail={`Net Income: ${formatCurrency(data.netIncome)}`} onEdit={() => handleEditT2125(data)} onDelete={() => handleDeleteSlip(data.id)} />
            ))}
          </div>
        )}
      </Card>

      {/* T5 Investment Income */}
      <Card style={{ marginBottom: '20px' }}>
        <SectionHeader code="T5" title="Investment Income" subtitle="Interest and dividend income from investments" onAdd={handleAddT5} addLabel="Add T5" />
        {t5Slips.length === 0 ? (
          <EmptySlipState label="T5 slips" onAdd={handleAddT5} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {t5Slips.map(slip => (
              <SlipCard key={slip.id} name={slip.payerName || 'Unnamed Institution'} detail={`Interest: ${formatCurrency(slip.boxes[13] || 0)} | Dividends: ${formatCurrency(slip.boxes[24] || 0)}`} onEdit={() => handleEditT5(slip)} onDelete={() => handleDeleteSlip(slip.id)} />
            ))}
          </div>
        )}
      </Card>

      {/* Other Income */}
      <Card style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: tokens.font.size.md, fontWeight: tokens.font.weight.semibold, marginBottom: '16px', color: tokens.color.text, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={tokens.color.brand} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
          Other Income
        </h2>

        <MoneyInput
          label="Rental Income (Net)"
          value={state.currentReturn.otherIncome.rental}
          onChange={(value) => handleOtherIncomeChange('rental', value)}
          hint="Net rental income after expenses"
        />

        {/* Capital gains */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <label style={{ fontSize: tokens.font.size.sm, fontWeight: tokens.font.weight.medium, color: tokens.color.textSecondary }}>Capital Gains Transactions</label>
            <Button size="sm" variant="outline" onClick={() => { setEditingCapitalGains({ id: crypto.randomUUID(), type: 'CapitalGains', description: '', dateAcquired: '', dateSold: '', proceeds: 0, adjustedCostBase: 0, outlayAndExpenses: 0, gain: 0 }); setActiveForm('capitalGains'); }}
              icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>}
            >
              Add
            </Button>
          </div>

          {capitalGainsTransactions.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {capitalGainsTransactions.map(transaction => (
                <SlipCard
                  key={transaction.id}
                  name={transaction.description || 'Capital Gain'}
                  detail={`Gain: ${formatCurrency(transaction.gain)} (Taxable: ${formatCurrency(transaction.gain > 0 ? transaction.gain * 0.5 : 0)})`}
                  onEdit={() => { setEditingCapitalGains({ ...transaction }); setActiveForm('capitalGains'); }}
                  onDelete={() => dispatch({ type: 'DELETE_SLIP', payload: transaction.id })}
                />
              ))}
              <TotalRow label="Total Taxable Capital Gains" value={formatCurrency(capitalGainsTransactions.reduce((sum, t) => sum + (t.gain > 0 ? t.gain * 0.5 : 0), 0))} />
            </div>
          ) : (
            <p style={{ fontSize: tokens.font.size.xs, color: tokens.color.muted, fontStyle: 'italic', margin: 0 }}>
              No capital gains transactions added. Click "Add" to report sales of investments or property.
            </p>
          )}
        </div>

        <MoneyInput
          label="Other Income"
          value={state.currentReturn.otherIncome.other}
          onChange={(value) => handleOtherIncomeChange('other', value)}
          hint="Any other taxable income not reported above"
        />
      </Card>

      {/* T4 Form Modal */}
      {activeForm === 't4' && editingSlip && editingSlip.type === 'T4' && (
        <ModalOverlay>
          <Card style={{ maxWidth: '520px', width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
            <h3 style={{ fontSize: tokens.font.size.lg, fontWeight: tokens.font.weight.semibold, marginBottom: '20px', color: tokens.color.text }}>
              {t4Slips.find(s => s.id === editingSlip.id) ? 'Edit T4' : 'Add T4'}
            </h3>
            {showUploadPrompt ? (
              <div style={{ padding: '16px 0' }}>
                <FileUpload onDataParsed={(data) => { handleParsedData(data); setShowUploadPrompt(false); }} />
                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                  <Button variant="secondary" onClick={() => setShowUploadPrompt(false)}>Enter Details Manually</Button>
                </div>
              </div>
            ) : (
              <>
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
              </>
            )}
          </Card>
        </ModalOverlay>
      )}

      {/* T4A Form Modal */}
      {activeForm === 't4a' && editingSlip && editingSlip.type === 'T4A' && (
        showUploadPrompt ? (
          <ModalOverlay>
            <Card style={{ maxWidth: '520px', width: '100%' }}>
              <h3 style={{ fontSize: tokens.font.size.lg, fontWeight: tokens.font.weight.semibold, marginBottom: '20px', color: tokens.color.text }}>Add T4A</h3>
              <FileUpload onDataParsed={(data) => { handleParsedData(data); setShowUploadPrompt(false); }} />
              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <Button variant="secondary" onClick={() => setShowUploadPrompt(false)}>Enter Details Manually</Button>
              </div>
            </Card>
          </ModalOverlay>
        ) : (
          <T4AForm slip={editingSlip} onChange={setEditingSlip} onSave={handleSaveSlip} onCancel={() => { setActiveForm('none'); setEditingSlip(null); }} isEditing={!!t4aSlips.find(s => s.id === editingSlip.id)} />
        )
      )}

      {/* T2125 Form Modal */}
      {activeForm === 't2125' && editingSlip && editingSlip.type === 'T2125' && (
        <T2125Form data={editingSlip} onChange={setEditingSlip} onSave={handleSaveSlip} onCancel={() => { setActiveForm('none'); setEditingSlip(null); }} isEditing={!!t2125Data.find(d => d.id === editingSlip.id)} />
      )}

      {/* T5 Form Modal */}
      {activeForm === 't5' && editingSlip && editingSlip.type === 'T5' && (
        showUploadPrompt ? (
          <ModalOverlay>
            <Card style={{ maxWidth: '520px', width: '100%' }}>
              <h3 style={{ fontSize: tokens.font.size.lg, fontWeight: tokens.font.weight.semibold, marginBottom: '20px', color: tokens.color.text }}>Add T5</h3>
              <FileUpload onDataParsed={(data) => { handleParsedData(data); setShowUploadPrompt(false); }} />
              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <Button variant="secondary" onClick={() => setShowUploadPrompt(false)}>Enter Details Manually</Button>
              </div>
            </Card>
          </ModalOverlay>
        ) : (
          <T5Form slip={editingSlip} onChange={setEditingSlip} onSave={handleSaveSlip} onCancel={() => { setActiveForm('none'); setEditingSlip(null); }} isEditing={!!t5Slips.find(s => s.id === editingSlip.id)} />
        )
      )}

      {/* Capital Gains Form Modal */}
      {activeForm === 'capitalGains' && editingCapitalGains && (
        <CapitalGainsForm
          transaction={editingCapitalGains}
          onChange={setEditingCapitalGains}
          onSave={() => {
            if (!editingCapitalGains) return;
            const existing = capitalGainsTransactions.find(t => t.id === editingCapitalGains.id);
            if (existing) { dispatch({ type: 'UPDATE_SLIP', payload: { id: editingCapitalGains.id, updates: editingCapitalGains } }); }
            else { dispatch({ type: 'ADD_SLIP', payload: editingCapitalGains }); }
            setActiveForm('none'); setEditingCapitalGains(null);
          }}
          onCancel={() => { setActiveForm('none'); setEditingCapitalGains(null); }}
          isEditing={!!capitalGainsTransactions.find(t => t.id === editingCapitalGains.id)}
        />
      )}

      {/* Bottom nav */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 24px',
        backgroundColor: tokens.color.surface,
        borderRadius: tokens.radius.lg,
        border: `1px solid ${tokens.color.border}`,
        boxShadow: tokens.shadow.sm
      }}>
        <Button variant="secondary" onClick={() => navigate(`/return/${taxYear}/profile`)}>Back</Button>
        <Button onClick={() => navigate(`/return/${taxYear}/deductions`)}>Continue to Deductions</Button>
      </div>
    </div>
  );
}
