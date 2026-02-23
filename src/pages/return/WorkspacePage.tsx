import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTaxReturn, type PersonId } from '../../context/TaxReturnContext';
import { calculateTax, formatCurrency, CURRENT_TAX_YEAR } from '../../domain/tax';
import IncomeFormGenerator from '../../components/forms/IncomeFormGenerator';
import FormLibraryModal from './FormLibraryModal';
import { getFormById } from '../../domain/forms/form-registry';
import { useReturnRouteSync } from './useReturnRouteSync';
import { tokens } from '../../styles/tokens';

function TaxSimpleLogo() {
  return (
    <div
      style={{
        width: '32px',
        height: '32px',
        backgroundColor: '#0D5F2B',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    </div>
  );
}

const WorkspacePage: React.FC = () => {
  const navigate = useNavigate();
  const { state, getTaxInput, dispatch } = useTaxReturn();
  const { year, personId } = useReturnRouteSync('primary');
  const [activeFormType, setActiveFormType] = useState<string>('t4');
  const [showFormLibrary, setShowFormLibrary] = useState(false);
  const [showTaxMenu, setShowTaxMenu] = useState(false);
  const [showPersonMenu, setShowPersonMenu] = useState(false);

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

  const handleAddForm = (formId: string) => {
    if (formId !== activeFormType) {
      setActiveFormType(formId);
    }
    setShowFormLibrary(false);

    if (!person) {
      return;
    }

    const alreadyPinned = person.pinnedForms.includes(formId);
    if (!alreadyPinned) {
      dispatch({ type: 'SET_PINNED_FORMS', payload: [...person.pinnedForms, formId] });
    }
  };

  const saveLabel =
    state.saveState.status === 'saving'
      ? 'Saving...'
      : state.saveState.status === 'error'
      ? 'Save error'
      : state.saveState.lastSavedAt
      ? `Saved ${new Date(state.saveState.lastSavedAt).toLocaleTimeString()}`
      : 'Saved';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F9FAFB', fontFamily: tokens.font.family }}>
      <header
        style={{
          backgroundColor: 'white',
          borderBottom: '1px solid #E5E7EB',
          padding: '12px 24px',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}
      >
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <TaxSimpleLogo />
              <span style={{ fontSize: '18px', fontWeight: 700, color: '#1F2937' }}>TaxSimple</span>
            </Link>

            <div style={{ position: 'relative' }}>
              <button
                aria-label="Switch tax year"
                onClick={() => {
                  setShowTaxMenu((v) => !v);
                  setShowPersonMenu(false);
                }}
                style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '14px', color: '#1F2937' }}
              >
                Tax {year} ▾
              </button>
              {showTaxMenu && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    minWidth: '180px',
                    background: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    overflow: 'hidden'
                  }}
                >
                  {allYears.map((candidateYear) => (
                    <button
                      key={candidateYear}
                      onClick={() => {
                        dispatch({ type: 'CREATE_YEAR_RETURN', payload: candidateYear });
                        navigate(`/return/${candidateYear}/person/${personId}/workspace`);
                        setShowTaxMenu(false);
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        border: 'none',
                        background: candidateYear === year ? '#F0FDF4' : 'white',
                        padding: '10px 12px',
                        cursor: 'pointer',
                        fontSize: '13px'
                      }}
                    >
                      {candidateYear} return
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div style={{ position: 'relative' }}>
              <button
                aria-label="Switch return person"
                onClick={() => {
                  setShowPersonMenu((v) => !v);
                  setShowTaxMenu(false);
                }}
                style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '14px', color: '#1F2937' }}
              >
                {personName}'s return ▾
              </button>
              {showPersonMenu && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    minWidth: '220px',
                    background: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    overflow: 'hidden'
                  }}
                >
                  <button
                    onClick={() => {
                      navigate(`/return/${year}/person/primary/workspace`);
                      setShowPersonMenu(false);
                    }}
                    style={{ width: '100%', textAlign: 'left', border: 'none', background: personId === 'primary' ? '#F0FDF4' : 'white', padding: '10px 12px', cursor: 'pointer', fontSize: '13px' }}
                  >
                    {unit?.primary.profile.firstName || 'Primary'}'s return
                  </button>
                  <button
                    disabled={!canUsePartner}
                    onClick={() => {
                      if (!canUsePartner) {
                        return;
                      }
                      navigate(`/return/${year}/person/partner/workspace`);
                      setShowPersonMenu(false);
                    }}
                    style={{ width: '100%', textAlign: 'left', border: 'none', background: personId === 'partner' ? '#F0FDF4' : 'white', padding: '10px 12px', cursor: canUsePartner ? 'pointer' : 'not-allowed', fontSize: '13px', opacity: canUsePartner ? 1 : 0.6 }}
                  >
                    {unit?.partner?.profile.firstName || 'Partner'}'s return
                  </button>
                </div>
              )}
            </div>

            <span style={{ fontSize: '13px', color: state.saveState.status === 'error' ? '#DC2626' : '#10B981', fontWeight: 500 }}>
              {saveLabel}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => navigate('/documents')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#1F2937' }}
            >
              Tax documents
            </button>
            <Link to="/support" style={{ fontSize: '14px', color: '#1F2937', textDecoration: 'none' }}>
              Help
            </Link>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            marginBottom: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}
        >
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', margin: '0 0 4px 0' }}>{year} Tax Return Workspace</h1>
            <p style={{ color: '#6B7280', margin: 0, fontSize: '14px' }}>
              {person?.profile.firstName || 'Your'} {person?.profile.lastName || ''} • {person?.profile.province || 'ON'}
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '2px' }}>Total Income</div>
            <div style={{ fontSize: '18px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>{formatCurrency(totalIncome)}</div>
            {totalIncome > 0 ? (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '4px 14px',
                  borderRadius: '999px',
                  fontSize: '14px',
                  fontWeight: 600,
                  backgroundColor: isRefund ? '#ECFDF5' : '#FEF2F2',
                  border: `1px solid ${isRefund ? '#10B981' : '#EF4444'}`,
                  color: isRefund ? '#065F46' : '#991B1B'
                }}
              >
                {isRefund ? 'Refund' : 'Owing'}: {formatCurrency(Math.abs(refundOrOwing))}
              </div>
            ) : (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '4px 14px',
                  borderRadius: '999px',
                  backgroundColor: '#F3F4F6',
                  color: '#6B7280',
                  fontSize: '13px'
                }}
              >
                Enter income to see estimate
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px' }}>
          <div>
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '16px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                position: 'sticky',
                top: '80px'
              }}
            >
              <h3
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#9CA3AF',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '12px',
                  padding: '0 8px'
                }}
              >
                Your Forms
              </h3>

              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {activeForms.map((formId) => {
                  const meta = getFormById(formId);
                  if (!meta) {
                    return null;
                  }
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
                          fontSize: '14px',
                          backgroundColor: activeFormType === formId ? '#F0FDF4' : 'transparent',
                          color: activeFormType === formId ? '#065F46' : '#4B5563',
                          fontWeight: activeFormType === formId ? 600 : 400,
                          cursor: 'pointer',
                          borderLeft: activeFormType === formId ? '3px solid #10B981' : '3px solid transparent'
                        }}
                      >
                        {meta.code}: {meta.name}
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
                  marginTop: '12px',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px dashed #D1D5DB',
                  backgroundColor: 'transparent',
                  color: '#6B7280',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                + Add Form
              </button>
            </div>
          </div>

          <div>
            <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <IncomeFormGenerator formType={activeFormType} />
            </div>

            <div style={{ marginTop: '16px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '10px', padding: '10px 12px', fontSize: '13px', color: '#1D4ED8' }}>
              Upload/imported data creates a draft. Review required before filing.
            </div>

            {state.saveState.status === 'error' && (
              <div style={{ marginTop: '12px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '10px 12px', fontSize: '13px', color: '#991B1B' }}>
                Your latest changes could not be saved locally. Keep this tab open and retry.
              </div>
            )}

            {state.recoveryMessage && (
              <div style={{ marginTop: '12px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '10px', padding: '10px 12px', fontSize: '13px', color: '#92400E' }}>
                {state.recoveryMessage}
              </div>
            )}

            <div style={{ marginTop: '16px', background: 'white', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '14px' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '15px', color: '#1F2937' }}>Missing-slip assistant</h3>
              {missingSlipHints.length === 0 ? (
                <p style={{ margin: 0, fontSize: '13px', color: '#065F46' }}>No obvious gaps detected so far.</p>
              ) : (
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: '#6B7280' }}>
                  {missingSlipHints.map((hint) => (
                    <li key={hint}>{hint}</li>
                  ))}
                </ul>
              )}
            </div>

            <div style={{ marginTop: '16px', background: 'white', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '14px' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '15px', color: '#1F2937' }}>Return timeline</h3>
              <div style={{ display: 'grid', gap: '8px' }}>
                {timeline.map((entry) => (
                  <div key={entry.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: '#374151' }}>{entry.label}</span>
                    <span style={{ color: '#9CA3AF' }}>{new Date(entry.timestamp).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

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
          zIndex: 10
        }}
      >
        <button
          onClick={() => navigate(`/return/${year}/person/${personId}/workspace`)}
          style={{ padding: '10px 20px', backgroundColor: 'transparent', border: 'none', color: '#6B7280', fontWeight: 500, cursor: 'pointer', fontSize: '14px' }}
        >
          Workspace
        </button>
        <button
          onClick={() => navigate(`/return/${year}/person/${personId}/review`)}
          style={{
            padding: '12px 24px',
            backgroundColor: '#0D5F2B',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '15px',
            cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(13, 95, 43, 0.2)'
          }}
        >
          Review &amp; Optimize Return
        </button>
      </div>

      {showFormLibrary && <FormLibraryModal onClose={() => setShowFormLibrary(false)} onAdd={handleAddForm} activeForms={activeForms} />}

      {(showTaxMenu || showPersonMenu) && (
        <div onClick={() => { setShowTaxMenu(false); setShowPersonMenu(false); }} style={{ position: 'fixed', inset: 0, zIndex: 2 }} />
      )}
    </div>
  );
};

export default WorkspacePage;
