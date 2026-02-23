import React, { useMemo, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTaxReturn, type PersonId } from '../../context/TaxReturnContext';
import { calculateTax, formatCurrency, CURRENT_TAX_YEAR } from '../../domain/tax';
import IncomeFormGenerator from '../../components/forms/IncomeFormGenerator';
import FormLibraryModal from './FormLibraryModal';
import { getFormById } from '../../domain/forms/form-registry';
import { useReturnRouteSync } from './useReturnRouteSync';
import { tokens } from '../../styles/tokens';
import { FileUpload } from '../../components/tax/FileUpload';
import { type ParsedSlipData } from '../../utils/pdf-parser';

/* ------------------------------------------------------------------ */
/*  Logo                                                               */
/* ------------------------------------------------------------------ */
function TaxSimpleLogo() {
  return (
    <div
      style={{
        width: '30px',
        height: '30px',
        backgroundColor: tokens.color.brand,
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}
    >
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Dropdown Button (for year / person)                                */
/* ------------------------------------------------------------------ */
function DropdownButton({ label, items, activeValue, onSelect }: {
  label: string;
  items: { value: string; label: string; disabled?: boolean }[];
  activeValue: string;
  onSelect: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <button
        aria-label={label}
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          border: '1px solid #E5E7EB',
          borderRadius: '8px',
          background: 'white',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: 500,
          color: tokens.color.text,
          fontFamily: 'inherit',
          transition: tokens.transition.fast
        }}
      >
        {items.find(i => i.value === activeValue)?.label || label}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 199 }} />
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              minWidth: '180px',
              background: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '10px',
              boxShadow: tokens.shadow.lg,
              overflow: 'hidden',
              zIndex: 200
            }}
          >
            {items.map(item => (
              <button
                key={item.value}
                disabled={item.disabled}
                onClick={() => { onSelect(item.value); setOpen(false); }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  border: 'none',
                  background: item.value === activeValue ? '#F0FDF4' : 'white',
                  padding: '10px 14px',
                  cursor: item.disabled ? 'not-allowed' : 'pointer',
                  fontSize: '13px',
                  fontWeight: item.value === activeValue ? 600 : 400,
                  color: item.value === activeValue ? tokens.color.brand : tokens.color.text,
                  opacity: item.disabled ? 0.5 : 1,
                  fontFamily: 'inherit',
                  transition: tokens.transition.fast
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Info Banner with left-accent                                       */
/* ------------------------------------------------------------------ */
function InfoBanner({ children, variant = 'info', onDismiss }: {
  children: React.ReactNode;
  variant?: 'info' | 'warning' | 'error' | 'success';
  onDismiss?: () => void;
}) {
  const config = {
    info: { border: '#3B82F6', bg: '#F8FAFF', color: '#1E40AF', icon: '#3B82F6' },
    warning: { border: '#F59E0B', bg: '#FFFBF0', color: '#92400E', icon: '#F59E0B' },
    error: { border: '#EF4444', bg: '#FFF5F5', color: '#991B1B', icon: '#EF4444' },
    success: { border: '#10B981', bg: '#F0FDF8', color: '#065F46', icon: '#10B981' }
  }[variant];

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '10px',
      padding: '12px 14px',
      borderRadius: '10px',
      borderLeft: `3px solid ${config.border}`,
      backgroundColor: config.bg,
      fontSize: '13px',
      color: config.color,
      marginTop: '14px',
      lineHeight: 1.5
    }}>
      <div style={{ flex: 1 }}>{children}</div>
      {onDismiss && (
        <button onClick={onDismiss} style={{ background: 'none', border: 'none', cursor: 'pointer', color: config.color, opacity: 0.6, padding: '0', display: 'flex' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tax Summary Panel (collapsible right side)                         */
/* ------------------------------------------------------------------ */
function TaxSummaryPanel({ taxResult, isOpen, onToggle, province }: {
  taxResult: ReturnType<typeof calculateTax> | null;
  isOpen: boolean;
  onToggle: () => void;
  province: string;
}) {
  if (!taxResult) return null;

  const refundOrOwing = taxResult.refundOrOwing;
  const isRefund = taxResult.isRefund;

  return (
    <>
      {/* Toggle tab */}
      <button
        onClick={onToggle}
        aria-label={isOpen ? 'Collapse tax summary' : 'Expand tax summary'}
        style={{
          position: 'fixed',
          right: isOpen ? '310px' : '0',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '28px',
          height: '56px',
          backgroundColor: 'white',
          border: '1px solid #E5E7EB',
          borderRight: isOpen ? '1px solid #E5E7EB' : 'none',
          borderRadius: isOpen ? '8px 0 0 8px' : '8px 0 0 8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          boxShadow: '-2px 0 8px rgba(0,0,0,0.04)',
          transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          fontFamily: 'inherit'
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round">
          {isOpen
            ? <polyline points="9 18 15 12 9 6" />
            : <polyline points="15 18 9 12 15 6" />
          }
        </svg>
      </button>

      {/* Panel */}
      <div
        style={{
          position: 'fixed',
          top: '61px',
          right: 0,
          bottom: '65px',
          width: '310px',
          backgroundColor: 'white',
          borderLeft: '1px solid #E5E7EB',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 40,
          overflowY: 'auto',
          padding: '28px 22px'
        }}
      >
        {/* Refund / Owing */}
        <div style={{ textAlign: 'center', paddingBottom: '22px', borderBottom: '1px solid #F3F4F6', marginBottom: '22px' }}>
          <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 500, color: tokens.color.muted }}>
            {isRefund ? 'Estimated Refund' : 'Estimated Balance Owing'}
          </p>
          <p style={{
            margin: 0,
            fontSize: '34px',
            fontWeight: 700,
            color: isRefund ? tokens.color.refund : tokens.color.owing,
            letterSpacing: '-0.02em',
            lineHeight: 1
          }}>
            {formatCurrency(Math.abs(refundOrOwing), false)}
          </p>
          {taxResult.totalIncome > 0 && (
            <p style={{ margin: '10px 0 0', fontSize: '12px', color: tokens.color.mutedLight }}>
              Based on {province} rates
            </p>
          )}
        </div>

        {/* Income */}
        <SummarySection title="Income">
          <SummaryRow label="Total Income" value={formatCurrency(taxResult.totalIncome)} />
          {taxResult.totalWithheld > 0 && (
            <SummaryRow label="Tax Withheld" value={formatCurrency(taxResult.totalWithheld)} highlight />
          )}
        </SummarySection>

        {/* Tax */}
        <SummarySection title="Tax Calculation">
          <SummaryRow label="Federal Tax" value={formatCurrency(taxResult.federalTax)} />
          <SummaryRow label="Provincial Tax" value={formatCurrency(taxResult.provincialTax)} />
          {taxResult.healthPremium > 0 && (
            <SummaryRow label="Health Premium" value={formatCurrency(taxResult.healthPremium)} />
          )}
          <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '8px', marginTop: '4px' }}>
            <SummaryRow label="Total Tax" value={formatCurrency(taxResult.totalTax)} bold />
          </div>
        </SummarySection>

        {/* Deductions */}
        {taxResult.totalDeductions > 0 && (
          <SummarySection title="Deductions">
            <SummaryRow label="Total Deductions" value={`-${formatCurrency(taxResult.totalDeductions)}`} />
            <SummaryRow label="Taxable Income" value={formatCurrency(taxResult.taxableIncome)} />
          </SummarySection>
        )}

        {/* Status */}
        <div style={{
          backgroundColor: '#F8FAFB',
          borderRadius: '10px',
          padding: '14px',
          textAlign: 'center',
          marginTop: '4px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: taxResult.totalIncome === 0 ? tokens.color.muted : tokens.color.accent
            }} />
            <p style={{ margin: 0, fontSize: '12px', color: tokens.color.muted, fontWeight: 500 }}>
              {taxResult.totalIncome === 0 ? 'Add income to see estimate' : 'Real-time calculation'}
            </p>
          </div>
        </div>
      </div>

      {/* Mini badge when collapsed */}
      {!isOpen && taxResult.totalIncome > 0 && (
        <button
          onClick={onToggle}
          style={{
            position: 'fixed',
            bottom: '80px',
            right: '16px',
            backgroundColor: isRefund ? tokens.color.refund : tokens.color.owing,
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '10px 16px',
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontFamily: 'inherit',
            transition: tokens.transition.default
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
          {formatCurrency(Math.abs(refundOrOwing))}
        </button>
      )}
    </>
  );
}

function SummarySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <h4 style={{
        fontSize: '11px',
        fontWeight: 600,
        color: tokens.color.mutedLight,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        marginBottom: '12px'
      }}>
        {title}
      </h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
        {children}
      </div>
    </div>
  );
}

function SummaryRow({ label, value, bold, highlight }: {
  label: string; value: string; bold?: boolean; highlight?: boolean;
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '13px', color: highlight ? tokens.color.refund : '#4B5563', fontWeight: bold ? 600 : 400 }}>
        {label}
      </span>
      <span style={{ fontSize: '13px', fontWeight: bold ? 600 : 500, color: highlight ? tokens.color.refund : tokens.color.text }}>
        {value}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Relative time helper                                               */
/* ------------------------------------------------------------------ */
function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/* ================================================================== */
/*  MAIN WORKSPACE PAGE                                                */
/* ================================================================== */
const WorkspacePage: React.FC = () => {
  const navigate = useNavigate();
  const { state, getTaxInput, dispatch } = useTaxReturn();
  const { year, personId } = useReturnRouteSync('primary');
  const [activeFormType, setActiveFormType] = useState<string>('t4');
  const [showFormLibrary, setShowFormLibrary] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [showTaxPanel, setShowTaxPanel] = useState(true);

  const unit = state.returnsByYear[year] ?? state.returnsByYear[state.activeYear];
  const person = personId === 'partner' && unit?.partner ? unit.partner : unit?.primary;

  const taxResult = useMemo(() => {
    try {
      const input = getTaxInput(year, personId);
      return calculateTax(input);
    } catch {
      return null;
    }
  }, [getTaxInput, year, personId, state]);

  const totalIncome = taxResult?.totalIncome ?? 0;
  const refundOrOwing = taxResult?.refundOrOwing ?? 0;
  const isRefund = taxResult?.isRefund ?? true;

  const formsFromSlips = (person?.taxData.slips ?? []).map((slip) => slip.type.toLowerCase());
  const pinned = person?.pinnedForms ?? [];
  const derivedForms = Array.from(new Set(['t4', ...formsFromSlips, ...pinned]))
    .map((id) => id.replace('capitalgains', 'capitalGains'));
  const activeForms = derivedForms.filter((id) => getFormById(id));

  const personName = person?.profile.firstName || (personId === 'partner' ? 'Partner' : 'Your');
  const canUsePartner = Boolean(unit?.partner);
  const hasT4 = person?.taxData.slips.some((slip) => slip.type === 'T4') ?? false;
  const hasRRSP = (person?.taxData.deductions.rrsp ?? 0) > 0;
  const missingSlipHints = [
    !hasT4 ? 'No T4 slip detected yet. Add employment slips or confirm no employment income.' : null,
    !hasRRSP ? 'No RRSP contribution entered. If you contributed, add RRSP details to optimize deductions.' : null
  ].filter(Boolean) as string[];

  const timeline = [
    ...(unit?.documents ?? []).map((doc) => ({
      id: doc.id,
      label: `${doc.title} generated`,
      timestamp: doc.createdAt
    })),
    {
      id: `modified-${unit?.lastModified ?? year}`,
      label: 'Return updated',
      timestamp: unit?.lastModified ?? new Date().toISOString()
    }
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 6);

  const allYears = Array.from(
    new Set([CURRENT_TAX_YEAR, CURRENT_TAX_YEAR - 1, CURRENT_TAX_YEAR - 2, ...Object.keys(state.returnsByYear).map(Number)])
  ).sort((a, b) => b - a);

  const handleAddForm = useCallback((formId: string) => {
    if (formId !== activeFormType) setActiveFormType(formId);
    setShowFormLibrary(false);
    if (!person) return;
    const alreadyPinned = person.pinnedForms.includes(formId);
    if (!alreadyPinned) {
      dispatch({ type: 'SET_PINNED_FORMS', payload: [...person.pinnedForms, formId] });
    }
  }, [activeFormType, person, dispatch]);

  const handleParsedUpload = useCallback((data: ParsedSlipData) => {
    const slipId = crypto.randomUUID();
    setUploadMessage(null);

    switch (data.type) {
      case 'T4':
        dispatch({ type: 'ADD_SLIP', payload: { id: slipId, type: 'T4', employerName: data.payerName || '', boxes: { 14: data.boxes[14] || 0, 16: data.boxes[16] || 0, 18: data.boxes[18] || 0, 22: data.boxes[22] || 0, 44: data.boxes[44] || 0 } } });
        handleAddForm('t4');
        break;
      case 'T4A':
        dispatch({ type: 'ADD_SLIP', payload: { id: slipId, type: 'T4A', payerName: data.payerName || '', boxes: { 16: data.boxes[16] || 0, 18: data.boxes[18] || 0, 20: data.boxes[20] || 0, 22: data.boxes[22] || 0, 28: data.boxes[28] || 0 } } });
        handleAddForm('t4a');
        break;
      case 'T5':
        dispatch({ type: 'ADD_SLIP', payload: { id: slipId, type: 'T5', payerName: data.payerName || '', boxes: { 10: data.boxes[10] || 0, 13: data.boxes[13] || 0, 24: data.boxes[24] || 0 } } });
        handleAddForm('t5');
        break;
      case 'T3':
        dispatch({ type: 'ADD_SLIP', payload: { id: slipId, type: 'T3', payerName: data.payerName || '', boxes: { 21: data.boxes[21] || 0, 23: data.boxes[23] || 0, 32: data.boxes[32] || 0, 49: data.boxes[49] || 0 } } });
        handleAddForm('t3');
        break;
      case 'T5008':
        dispatch({ type: 'ADD_SLIP', payload: { id: slipId, type: 'T5008', payerName: data.payerName || '', boxes: { 20: data.boxes[20] || 0, 21: data.boxes[21] || 0 } } });
        handleAddForm('t5008');
        break;
      case 'T2202':
        dispatch({ type: 'UPDATE_CREDITS', payload: { tuition: data.boxes.A || data.boxes[1] || 0 } });
        handleAddForm('t2202');
        break;
      case 'RL1':
        dispatch({ type: 'ADD_SLIP', payload: { id: slipId, type: 'RL1', employerName: data.payerName || '', boxes: { A: data.boxes.A || 0, B: data.boxes.B || 0, C: data.boxes.C || 0, E: data.boxes.E || 0 } } });
        handleAddForm('rl1');
        break;
      default:
        setUploadMessage(`Uploaded file detected as ${data.type}. We saved parsed data where possible; review before filing.`);
        break;
    }
  }, [dispatch, handleAddForm]);

  const saveLabel =
    state.saveState.status === 'saving'
      ? 'Saving...'
      : state.saveState.status === 'error'
      ? 'Save error'
      : state.saveState.lastSavedAt
      ? `Saved ${new Date(state.saveState.lastSavedAt).toLocaleTimeString()}`
      : 'Saved';

  const saveDotColor =
    state.saveState.status === 'saving'
      ? tokens.color.warning
      : state.saveState.status === 'error'
      ? tokens.color.danger
      : tokens.color.accent;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: tokens.color.bg, fontFamily: tokens.font.family }}>
      {/* ============ HEADER ============ */}
      <header
        style={{
          backgroundColor: 'white',
          borderBottom: '1px solid #E5E7EB',
          padding: '0 24px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: tokens.shadow.xs
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '1400px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          {/* Left: Logo + breadcrumb + dropdowns */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <TaxSimpleLogo />
              <span style={{ fontSize: '16px', fontWeight: 700, color: tokens.color.text, letterSpacing: '-0.01em' }}>TaxSimple</span>
            </Link>

            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>

            <DropdownButton
              label="Tax Year"
              activeValue={String(year)}
              items={allYears.map(y => ({ value: String(y), label: `${y} Return` }))}
              onSelect={(v) => {
                const yr = Number(v);
                dispatch({ type: 'CREATE_YEAR_RETURN', payload: yr });
                navigate(`/return/${yr}/person/${personId}/workspace`);
              }}
            />

            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>

            <DropdownButton
              label="Person"
              activeValue={personId}
              items={[
                { value: 'primary', label: `${unit?.primary.profile.firstName || 'Primary'}'s Return` },
                { value: 'partner', label: `${unit?.partner?.profile.firstName || 'Partner'}'s Return`, disabled: !canUsePartner }
              ]}
              onSelect={(v) => {
                navigate(`/return/${year}/person/${v}/workspace`);
              }}
            />

            {/* Save status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '6px' }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: saveDotColor, transition: tokens.transition.default }} />
              <span style={{ fontSize: '12px', color: state.saveState.status === 'error' ? tokens.color.danger : tokens.color.muted, fontWeight: 500 }}>
                {saveLabel}
              </span>
            </div>
          </div>

          {/* Right: Nav links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              onClick={() => navigate('/documents')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                color: tokens.color.muted,
                padding: '8px 14px',
                borderRadius: '8px',
                fontWeight: 500,
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: tokens.transition.fast
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              Documents
            </button>
            <Link
              to="/support"
              style={{
                textDecoration: 'none',
                fontSize: '13px',
                color: tokens.color.muted,
                padding: '8px 14px',
                borderRadius: '8px',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              Help
            </Link>
          </div>
        </div>
      </header>

      {/* ============ CONTEXT BAR ============ */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #F3F4F6',
        padding: '14px 24px'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: tokens.color.text, letterSpacing: '-0.01em' }}>
              {year} Tax Return
            </h1>
            <span style={{ fontSize: '13px', color: tokens.color.muted }}>
              {person?.profile.firstName || 'Your'} {person?.profile.lastName || ''} &bull; {person?.profile.province || 'ON'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ fontSize: '13px', color: tokens.color.muted }}>
              <span style={{ fontWeight: 500 }}>Income:</span>{' '}
              <span style={{ fontWeight: 600, color: tokens.color.text }}>{formatCurrency(totalIncome)}</span>
            </div>
            {totalIncome > 0 ? (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '5px 14px',
                  borderRadius: '999px',
                  fontSize: '13px',
                  fontWeight: 600,
                  backgroundColor: isRefund ? tokens.color.accentLight : tokens.color.dangerLight,
                  border: `1px solid ${isRefund ? '#A7F3D0' : '#FECACA'}`,
                  color: isRefund ? '#065F46' : '#991B1B'
                }}
              >
                {isRefund ? 'Refund' : 'Owing'}: {formatCurrency(Math.abs(refundOrOwing))}
              </div>
            ) : (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '5px 14px',
                borderRadius: '999px',
                backgroundColor: '#F3F4F6',
                color: tokens.color.muted,
                fontSize: '12px'
              }}>
                Enter income to see estimate
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ============ MAIN 3-COLUMN AREA ============ */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '24px',
        paddingBottom: '100px',
        paddingRight: showTaxPanel ? '334px' : '24px',
        transition: 'padding-right 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        <div style={{ display: 'flex', gap: '24px' }}>
          {/* LEFT SIDEBAR - Forms List */}
          <div style={{ width: '260px', flexShrink: 0 }}>
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '14px',
                padding: '18px',
                boxShadow: tokens.shadow.sm,
                border: '1px solid #F3F4F6',
                position: 'sticky',
                top: '80px'
              }}
            >
              <h3
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: tokens.color.mutedLight,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '14px',
                  padding: '0 8px'
                }}
              >
                Your Forms
              </h3>

              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {activeForms.map((formId) => {
                  const meta = getFormById(formId);
                  if (!meta) return null;
                  const isActive = activeFormType === formId;
                  return (
                    <li key={formId} style={{ marginBottom: '2px' }}>
                      <button
                        onClick={() => setActiveFormType(formId)}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: 'none',
                          backgroundColor: isActive ? '#F0FDF4' : 'transparent',
                          cursor: 'pointer',
                          borderLeft: isActive ? `3px solid ${tokens.color.accent}` : '3px solid transparent',
                          transition: tokens.transition.fast,
                          fontFamily: 'inherit'
                        }}
                      >
                        <span style={{ display: 'block', fontSize: '13px', fontWeight: isActive ? 700 : 600, color: isActive ? '#065F46' : tokens.color.text }}>
                          {meta.code}
                        </span>
                        <span style={{ display: 'block', fontSize: '12px', color: isActive ? '#065F46' : tokens.color.muted, marginTop: '1px' }}>
                          {meta.name}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>

              <button
                aria-label="Open form library"
                onClick={() => setShowFormLibrary(true)}
                style={{
                  width: '100%',
                  marginTop: '14px',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1.5px dashed #D1D5DB',
                  backgroundColor: 'transparent',
                  color: tokens.color.muted,
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 500,
                  fontFamily: 'inherit',
                  transition: tokens.transition.fast,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Form
              </button>
              <button
                aria-label="Upload tax form"
                onClick={() => setShowUpload((v) => !v)}
                style={{
                  width: '100%',
                  marginTop: '8px',
                  padding: '10px',
                  borderRadius: '8px',
                  border: `1.5px solid ${showUpload ? '#93C5FD' : '#BFDBFE'}`,
                  backgroundColor: showUpload ? '#EFF6FF' : '#FFFFFF',
                  color: '#1D4ED8',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 500,
                  fontFamily: 'inherit',
                  transition: tokens.transition.fast,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                {showUpload ? 'Hide Uploader' : 'Upload Form'}
              </button>
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Upload area */}
            {showUpload && (
              <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '14px',
                boxShadow: tokens.shadow.sm,
                border: '1px solid #F3F4F6',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: tokens.color.infoLight,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: tokens.color.text }}>Upload Tax Form</h3>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: tokens.color.muted }}>
                      Drag and drop a slip (PDF/image) to auto-fill. Review required after import.
                    </p>
                  </div>
                </div>
                <FileUpload onDataParsed={handleParsedUpload} />
              </div>
            )}

            {/* Form editor card */}
            <div style={{
              backgroundColor: 'white',
              padding: '32px',
              borderRadius: '14px',
              boxShadow: tokens.shadow.sm,
              border: '1px solid #F3F4F6'
            }}>
              <IncomeFormGenerator formType={activeFormType} />
            </div>

            {/* Info banners */}
            <InfoBanner variant="info">
              Upload/imported data creates a draft. Review all fields before filing.
            </InfoBanner>

            {uploadMessage && (
              <InfoBanner variant="warning" onDismiss={() => setUploadMessage(null)}>
                {uploadMessage}
              </InfoBanner>
            )}

            {state.saveState.status === 'error' && (
              <InfoBanner variant="error">
                Your latest changes could not be saved locally. Keep this tab open and retry.
              </InfoBanner>
            )}

            {state.recoveryMessage && (
              <InfoBanner variant="warning">
                {state.recoveryMessage}
              </InfoBanner>
            )}

            {/* Missing-slip assistant */}
            <div style={{
              marginTop: '16px',
              background: 'white',
              border: '1px solid #F3F4F6',
              borderLeft: `3px solid ${missingSlipHints.length === 0 ? tokens.color.accent : tokens.color.warning}`,
              borderRadius: '12px',
              padding: '16px 18px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={missingSlipHints.length === 0 ? tokens.color.accent : tokens.color.warning} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: tokens.color.text }}>Missing-slip assistant</h3>
              </div>
              {missingSlipHints.length === 0 ? (
                <p style={{ margin: 0, fontSize: '13px', color: '#065F46' }}>No obvious gaps detected so far.</p>
              ) : (
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: tokens.color.muted, lineHeight: 1.6 }}>
                  {missingSlipHints.map((hint) => (
                    <li key={hint}>{hint}</li>
                  ))}
                </ul>
              )}
            </div>

            {/* Return timeline */}
            <div style={{
              marginTop: '16px',
              background: 'white',
              border: '1px solid #F3F4F6',
              borderRadius: '12px',
              padding: '16px 18px'
            }}>
              <h3 style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: 600, color: tokens.color.text }}>Activity</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {timeline.map((entry, i) => (
                  <div
                    key={entry.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '10px 0',
                      borderBottom: i < timeline.length - 1 ? '1px solid #F9FAFB' : 'none'
                    }}
                  >
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: i === 0 ? tokens.color.accent : '#D1D5DB',
                      marginTop: '5px',
                      flexShrink: 0
                    }} />
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', color: tokens.color.textSecondary }}>{entry.label}</span>
                      <span style={{ fontSize: '12px', color: tokens.color.mutedLight, flexShrink: 0 }}>{relativeTime(entry.timestamp)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============ TAX SUMMARY PANEL ============ */}
      <TaxSummaryPanel
        taxResult={taxResult}
        isOpen={showTaxPanel}
        onToggle={() => setShowTaxPanel(v => !v)}
        province={person?.profile.province || 'ON'}
      />

      {/* ============ BOTTOM ACTION BAR ============ */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'white',
          borderTop: '1px solid #E5E7EB',
          padding: '12px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 60,
          boxShadow: tokens.shadow.up
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '3px', height: '20px', borderRadius: '2px', backgroundColor: tokens.color.brand }} />
          <span style={{ fontSize: '14px', fontWeight: 600, color: tokens.color.text, marginLeft: '8px' }}>
            Workspace
          </span>
        </div>

        {/* Step dots */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: i <= 2 ? tokens.color.brand : '#D1D5DB'
              }}
            />
          ))}
        </div>

        <button
          onClick={() => navigate(`/return/${year}/person/${personId}/review`)}
          style={{
            padding: '11px 24px',
            backgroundColor: tokens.color.brand,
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontWeight: 600,
            fontSize: '14px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(13, 95, 43, 0.25)',
            fontFamily: 'inherit',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: tokens.transition.default
          }}
        >
          Review & Optimize Return
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {showFormLibrary && <FormLibraryModal onClose={() => setShowFormLibrary(false)} onAdd={handleAddForm} activeForms={activeForms} />}
    </div>
  );
};

export default WorkspacePage;
