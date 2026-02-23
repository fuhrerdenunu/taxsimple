import React, { useState, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTaxReturn } from '../../context/TaxReturnContext';
import { calculateTax, formatCurrency } from '../../domain/tax';
import IncomeFormGenerator from '../../components/forms/IncomeFormGenerator';
import FormLibraryModal from './FormLibraryModal';

function TaxSimpleLogo() {
    return (
        <div style={{
            width: '32px', height: '32px', backgroundColor: '#0D5F2B',
            borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
        </div>
    );
}

const WorkspacePage: React.FC = () => {
    const { taxYear } = useParams<{ taxYear: string }>();
    const navigate = useNavigate();
    const { state, getTaxInput } = useTaxReturn();
    const { profile } = state;

    const [activeFormType, setActiveFormType] = useState<string | null>('t4');
    const [showFormLibrary, setShowFormLibrary] = useState(false);
    const [addedForms, setAddedForms] = useState<string[]>(['t4']);
    const [showAutoFill, setShowAutoFill] = useState(false);
    const [autoFillStatus, setAutoFillStatus] = useState<'idle' | 'connecting' | 'success'>('idle');

    const year = parseInt(taxYear || new Date().getFullYear().toString(), 10);

    // Live tax calculation from actual context data
    const taxResult = useMemo(() => {
        try {
            const input = getTaxInput();
            return calculateTax(input);
        } catch {
            return null;
        }
    }, [getTaxInput, state]);

    const totalIncome = taxResult?.totalIncome ?? 0;
    const refundOrOwing = taxResult?.refundOrOwing ?? 0;
    const isRefund = taxResult?.isRefund ?? true;

    const handleAddForm = (formId: string) => {
        if (!addedForms.includes(formId)) {
            setAddedForms([...addedForms, formId]);
        }
        setActiveFormType(formId);
        setShowFormLibrary(false);
    };

    const getFormLabel = (id: string) => {
        const labels: Record<string, string> = {
            't4': 'T4: Employment Income',
            't4a': 'T4A: Pension & Other',
            't2125': 'T2125: Business Income',
            't2202': 'T2202: Tuition',
            't5': 'T5: Investment Income',
            't5008': 'T5008: Securities',
            'medical': 'Medical Expenses',
            'rrsp': 'RRSP Contributions',
            'donations': 'Charitable Donations',
            'stocks': 'Capital Gains',
            'home': 'Home Buyers',
            'child': 'Child Benefit',
        };
        return labels[id] || id.toUpperCase();
    };

    // CRA Auto-Fill mock handler
    const handleAutoFill = () => {
        setAutoFillStatus('connecting');
        setTimeout(() => {
            setAutoFillStatus('success');
            // Mock: add T4 and T5 slips from CRA
            const { dispatch } = { dispatch: (window as any).__taxDispatch };
            // We'll use context directly instead
        }, 2000);
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#F9FAFB' }}>
            {/* Header */}
            <header style={{
                backgroundColor: 'white', borderBottom: '1px solid #E5E7EB',
                padding: '12px 24px', position: 'sticky', top: 0, zIndex: 100
            }}>
                <div style={{
                    maxWidth: '1400px', margin: '0 auto', display: 'flex',
                    alignItems: 'center', justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                            <TaxSimpleLogo />
                            <span style={{ fontSize: '18px', fontWeight: 700, color: '#1F2937' }}>TaxSimple</span>
                        </Link>
                        <span style={{ color: '#D1D5DB', fontSize: '20px', fontWeight: 300 }}>|</span>
                        <span style={{ fontSize: '15px', fontWeight: 500, color: '#1F2937' }}>
                            {profile.firstName || 'Your'}'s {year} Workspace
                        </span>
                        <span style={{ fontSize: '13px', color: '#10B981', fontWeight: 500 }}>Saved</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button onClick={() => navigate(`/return/${taxYear}/profile`)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#6B7280' }}>
                            Edit Profile
                        </button>
                        <Link to="/support" style={{ fontSize: '14px', color: '#1F2937', textDecoration: 'none' }}>Help</Link>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
                {/* Top Info Bar with live calculations */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    backgroundColor: 'white', padding: '24px', borderRadius: '12px',
                    marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', margin: '0 0 4px 0' }}>
                            {year} Tax Return Workspace
                        </h1>
                        <p style={{ color: '#6B7280', margin: 0, fontSize: '14px' }}>
                            {profile.firstName} {profile.lastName} &bull; {profile.province}
                        </p>
                    </div>

                    {/* Live Calculation */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        {/* CRA Auto-Fill Button */}
                        <button
                            onClick={() => setShowAutoFill(true)}
                            style={{
                                padding: '8px 16px', backgroundColor: '#EFF6FF', color: '#1D4ED8',
                                border: '1px solid #BFDBFE', borderRadius: '8px', fontSize: '13px',
                                fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                            }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                <polyline points="22,6 12,13 2,6" />
                            </svg>
                            CRA Auto-Fill
                        </button>

                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '2px' }}>Total Income</div>
                            <div style={{ fontSize: '18px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                                {formatCurrency(totalIncome)}
                            </div>
                            {totalIncome > 0 ? (
                                <div style={{
                                    display: 'inline-flex', alignItems: 'center', padding: '4px 14px',
                                    borderRadius: '999px', fontSize: '14px', fontWeight: 600,
                                    backgroundColor: isRefund ? '#ECFDF5' : '#FEF2F2',
                                    border: `1px solid ${isRefund ? '#10B981' : '#EF4444'}`,
                                    color: isRefund ? '#065F46' : '#991B1B'
                                }}>
                                    {isRefund ? 'Refund' : 'Owing'}: {formatCurrency(Math.abs(refundOrOwing))}
                                </div>
                            ) : (
                                <div style={{
                                    display: 'inline-flex', alignItems: 'center', padding: '4px 14px',
                                    borderRadius: '999px', backgroundColor: '#F3F4F6', color: '#6B7280', fontSize: '13px'
                                }}>
                                    Enter income to see estimate
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px' }}>
                    {/* Left Navigation */}
                    <div>
                        <div style={{
                            backgroundColor: 'white', borderRadius: '12px', padding: '16px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)', position: 'sticky', top: '80px'
                        }}>
                            <h3 style={{ fontSize: '12px', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', padding: '0 8px' }}>
                                Your Forms
                            </h3>

                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                {addedForms.map(formId => (
                                    <li key={formId} style={{ marginBottom: '2px' }}>
                                        <button
                                            onClick={() => setActiveFormType(formId)}
                                            style={{
                                                width: '100%', textAlign: 'left', padding: '10px 12px',
                                                borderRadius: '8px', border: 'none', fontSize: '14px',
                                                backgroundColor: activeFormType === formId ? '#F0FDF4' : 'transparent',
                                                color: activeFormType === formId ? '#065F46' : '#4B5563',
                                                fontWeight: activeFormType === formId ? 600 : 400,
                                                cursor: 'pointer', transition: 'all 0.15s',
                                                borderLeft: activeFormType === formId ? '3px solid #10B981' : '3px solid transparent'
                                            }}
                                        >
                                            {getFormLabel(formId)}
                                        </button>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => setShowFormLibrary(true)}
                                style={{
                                    width: '100%', marginTop: '12px', padding: '10px',
                                    borderRadius: '8px', border: '1px dashed #D1D5DB',
                                    backgroundColor: 'transparent', color: '#6B7280',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', gap: '6px', fontSize: '14px',
                                    transition: 'all 0.15s'
                                }}
                                onMouseOver={e => { e.currentTarget.style.backgroundColor = '#F9FAFB'; e.currentTarget.style.borderColor = '#9CA3AF'; }}
                                onMouseOut={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = '#D1D5DB'; }}
                            >
                                <span style={{ fontSize: '18px', lineHeight: 1 }}>+</span>
                                Add Form
                            </button>
                        </div>

                        {/* Tax Summary Sidebar */}
                        {taxResult && totalIncome > 0 && (
                            <div style={{
                                backgroundColor: 'white', borderRadius: '12px', padding: '16px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginTop: '16px'
                            }}>
                                <h3 style={{ fontSize: '12px', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', padding: '0 8px' }}>
                                    Tax Breakdown
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 8px', fontSize: '13px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#6B7280' }}>Federal Tax</span>
                                        <span style={{ color: '#1F2937', fontWeight: 500 }}>{formatCurrency(taxResult.federalTax)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#6B7280' }}>Provincial Tax</span>
                                        <span style={{ color: '#1F2937', fontWeight: 500 }}>{formatCurrency(taxResult.provincialTax)}</span>
                                    </div>
                                    {taxResult.healthPremium > 0 && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: '#6B7280' }}>Health Premium</span>
                                            <span style={{ color: '#1F2937', fontWeight: 500 }}>{formatCurrency(taxResult.healthPremium)}</span>
                                        </div>
                                    )}
                                    <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#1F2937', fontWeight: 600 }}>Total Tax</span>
                                        <span style={{ color: '#1F2937', fontWeight: 600 }}>{formatCurrency(taxResult.totalTax)}</span>
                                    </div>
                                    {taxResult.totalDeductions > 0 && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: '#059669' }}>Deductions</span>
                                            <span style={{ color: '#059669', fontWeight: 500 }}>-{formatCurrency(taxResult.totalDeductions)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Form Editor Area */}
                    <div>
                        {activeFormType ? (
                            <div style={{
                                backgroundColor: 'white', padding: '32px', borderRadius: '12px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                            }}>
                                <IncomeFormGenerator formType={activeFormType} />
                            </div>
                        ) : (
                            <div style={{
                                backgroundColor: 'white', borderRadius: '12px', padding: '64px',
                                textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                            }}>
                                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
                                <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>
                                    Select a form to edit
                                </h3>
                                <p style={{ color: '#6B7280', maxWidth: '400px', margin: '0 auto' }}>
                                    Choose a form from the sidebar, or click "Add Form" to search the library.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Action Footer */}
            <div style={{
                position: 'fixed', bottom: 0, left: 0, right: 0,
                backgroundColor: 'white', borderTop: '1px solid #E5E7EB',
                padding: '12px 32px', display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', zIndex: 10
            }}>
                <button
                    onClick={() => navigate(`/return/${taxYear}/profile`)}
                    style={{ padding: '10px 20px', backgroundColor: 'transparent', border: 'none', color: '#6B7280', fontWeight: 500, cursor: 'pointer', fontSize: '14px' }}
                >
                    &larr; Back to Profile
                </button>
                <button
                    onClick={() => navigate(`/return/${taxYear}/review`)}
                    style={{
                        padding: '12px 24px', backgroundColor: '#0D5F2B', color: 'white',
                        border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '15px',
                        cursor: 'pointer', boxShadow: '0 4px 6px rgba(13, 95, 43, 0.2)'
                    }}
                >
                    Review &amp; Optimize Return
                </button>
            </div>

            {/* Form Library Modal */}
            {showFormLibrary && (
                <FormLibraryModal
                    onClose={() => setShowFormLibrary(false)}
                    onAdd={handleAddForm}
                    activeForms={addedForms}
                />
            )}

            {/* CRA Auto-Fill Modal */}
            {showAutoFill && (
                <CRAAutoFillModal
                    onClose={() => { setShowAutoFill(false); setAutoFillStatus('idle'); }}
                    onAdd={handleAddForm}
                    status={autoFillStatus}
                    onConnect={handleAutoFill}
                />
            )}
        </div>
    );
};

// CRA Auto-Fill Modal (Phase 3)
function CRAAutoFillModal({ onClose, onAdd, status, onConnect }: {
    onClose: () => void;
    onAdd: (formId: string) => void;
    status: 'idle' | 'connecting' | 'success';
    onConnect: () => void;
}) {
    const { dispatch } = useTaxReturn();
    const [imported, setImported] = useState(false);

    const handleImport = () => {
        // Mock CRA data: inject T4 and T5 slips
        dispatch({
            type: 'ADD_SLIP',
            payload: {
                id: crypto.randomUUID(), type: 'T4' as const,
                employerName: 'Acme Corp (via CRA Auto-Fill)',
                boxes: { 14: 72000, 16: 3754.45, 18: 1049.12, 22: 14832.00, 44: 840 }
            }
        });
        dispatch({
            type: 'ADD_SLIP',
            payload: {
                id: crypto.randomUUID(), type: 'T5' as const,
                payerName: 'TD Bank (via CRA Auto-Fill)',
                boxes: { 13: 1250.50, 10: 340 }
            }
        });
        // Add forms to sidebar
        onAdd('t4');
        onAdd('t5');
        setImported(true);
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(17,24,39,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
            backdropFilter: 'blur(4px)'
        }}>
            <div style={{
                backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '500px',
                padding: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#111827', margin: 0 }}>CRA Auto-Fill (AFR)</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', color: '#9CA3AF', cursor: 'pointer' }}>&times;</button>
                </div>

                {status === 'idle' && (
                    <div>
                        <p style={{ color: '#6B7280', marginBottom: '20px', fontSize: '14px', lineHeight: 1.6 }}>
                            Connect securely to the CRA to automatically import your tax slips. This uses the Auto-Fill My Return (AFR) service.
                        </p>
                        <div style={{ padding: '16px', backgroundColor: '#FEF3C7', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', color: '#92400E' }}>
                            <strong>Demo Mode:</strong> This will simulate an OAuth connection and import mock T4/T5 data.
                        </div>
                        <button onClick={onConnect} style={{
                            width: '100%', padding: '14px', backgroundColor: '#0D5F2B', color: 'white',
                            border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 600, cursor: 'pointer'
                        }}>
                            Connect to CRA
                        </button>
                    </div>
                )}

                {status === 'connecting' && (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <div style={{ width: '48px', height: '48px', border: '4px solid #E5E7EB', borderTopColor: '#0D5F2B', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
                        <p style={{ color: '#6B7280', fontSize: '14px' }}>Connecting to CRA securely...</p>
                    </div>
                )}

                {status === 'success' && !imported && (
                    <div>
                        <div style={{ padding: '16px', backgroundColor: '#F0FDF4', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '24px' }}>&#10003;</span>
                            <div>
                                <div style={{ fontWeight: 600, color: '#065F46' }}>Connected successfully</div>
                                <div style={{ fontSize: '13px', color: '#6B7280' }}>2 slips found for 2025</div>
                            </div>
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ padding: '12px 16px', backgroundColor: '#F9FAFB', borderRadius: '8px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: 500, fontSize: '14px' }}>T4 - Acme Corp</div>
                                    <div style={{ fontSize: '13px', color: '#6B7280' }}>Employment Income: $72,000.00</div>
                                </div>
                                <span style={{ color: '#10B981', fontSize: '12px', fontWeight: 500, backgroundColor: '#F0FDF4', padding: '2px 8px', borderRadius: '4px' }}>Ready</span>
                            </div>
                            <div style={{ padding: '12px 16px', backgroundColor: '#F9FAFB', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: 500, fontSize: '14px' }}>T5 - TD Bank</div>
                                    <div style={{ fontSize: '13px', color: '#6B7280' }}>Interest Income: $1,250.50</div>
                                </div>
                                <span style={{ color: '#10B981', fontSize: '12px', fontWeight: 500, backgroundColor: '#F0FDF4', padding: '2px 8px', borderRadius: '4px' }}>Ready</span>
                            </div>
                        </div>
                        <button onClick={handleImport} style={{
                            width: '100%', padding: '14px', backgroundColor: '#0D5F2B', color: 'white',
                            border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 600, cursor: 'pointer'
                        }}>
                            Import All Slips
                        </button>
                    </div>
                )}

                {imported && (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <div style={{ fontSize: '48px', marginBottom: '12px' }}>&#10003;</div>
                        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#065F46', marginBottom: '8px' }}>Slips Imported!</h3>
                        <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '20px' }}>2 slips have been added to your workspace and your tax estimate has been updated.</p>
                        <button onClick={onClose} style={{
                            padding: '12px 24px', backgroundColor: '#0D5F2B', color: 'white',
                            border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 600, cursor: 'pointer'
                        }}>
                            Back to Workspace
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default WorkspacePage;
