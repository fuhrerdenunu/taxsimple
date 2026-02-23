import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTaxReturn } from '../../context/TaxReturnContext';

// Components
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import Section from '../../components/ui/Section';
import IncomeFormGenerator from '../../components/forms/IncomeFormGenerator';
import FormLibraryModal from './FormLibraryModal';

const WorkspacePage: React.FC = () => {
    const { taxYear } = useParams<{ taxYear: string }>();
    const navigate = useNavigate();
    const { state } = useTaxReturn();
    const { profile } = state;

    const [activeFormType, setActiveFormType] = useState<string | null>('t4');
    const [showFormLibrary, setShowFormLibrary] = useState(false);
    const [addedForms, setAddedForms] = useState<string[]>(['t4']); // Initial demo forms

    const year = parseInt(taxYear || new Date().getFullYear().toString(), 10);

    // Mock calculation state to simulate the dynamic backend update
    const [netIncome, setNetIncome] = useState<number>(0);
    const [refundData, setRefundData] = useState<{ amount: number; isRefund: boolean } | null>(null);

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
            't4a': 'T4A: Pension, Retirement, Annuity',
            't2125': 'T2125: Business or Professional Income',
            't2202': 'T2202: Tuition and Enrolment',
            'medical': 'Medical Expenses',
            'rrsp': 'RRSP Contributions'
        };
        return labels[id] || id.toUpperCase();
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F3F4F6' }}>
            <Sidebar />

            <main style={{ flex: 1, padding: '32px 48px', paddingBottom: '120px' }}>
                <Header />

                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    {/* Top Info Bar */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: 'white',
                        padding: '24px',
                        borderRadius: '12px',
                        marginBottom: '32px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}>
                        <div>
                            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: '0 0 8px 0' }}>
                                {year} Tax Return Workspace
                            </h1>
                            <p style={{ color: '#6B7280', margin: 0 }}>
                                {profile.firstName} {profile.lastName} • {profile.province}
                            </p>
                        </div>

                        {/* Live Calculation Preview */}
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '4px' }}>Net Income</div>
                            <div style={{ fontSize: '20px', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>
                                ${netIncome.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
                            </div>

                            {refundData !== null ? (
                                <div style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    padding: '6px 16px',
                                    borderRadius: '999px',
                                    backgroundColor: refundData.isRefund ? '#ECFDF5' : '#FEF2F2',
                                    border: `1px solid ${refundData.isRefund ? '#10B981' : '#EF4444'}`,
                                    color: refundData.isRefund ? '#065F46' : '#991B1B',
                                    fontWeight: 600
                                }}>
                                    {refundData.isRefund ? 'Refund' : 'Balance Owing'}: ${refundData.amount.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
                                </div>
                            ) : (
                                <div style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    padding: '6px 16px',
                                    borderRadius: '999px',
                                    backgroundColor: '#F3F4F6',
                                    color: '#6B7280',
                                    fontSize: '14px'
                                }}>
                                    Ready to calculate
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '32px' }}>

                        {/* Dynamic Left Navigation */}
                        <div>
                            <div style={{
                                backgroundColor: 'white',
                                borderRadius: '12px',
                                padding: '16px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                            }}>
                                <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', padding: '0 8px' }}>
                                    Your Forms
                                </h3>

                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    {addedForms.map(formId => (
                                        <li key={formId} style={{ marginBottom: '4px' }}>
                                            <button
                                                onClick={() => setActiveFormType(formId)}
                                                style={{
                                                    width: '100%',
                                                    textAlign: 'left',
                                                    padding: '10px 12px',
                                                    borderRadius: '8px',
                                                    border: 'none',
                                                    backgroundColor: activeFormType === formId ? '#F3F4F6' : 'transparent',
                                                    color: activeFormType === formId ? '#111827' : '#4B5563',
                                                    fontWeight: activeFormType === formId ? 600 : 400,
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    transition: 'all 0.15s'
                                                }}
                                            >
                                                <span style={{ color: activeFormType === formId ? '#2563EB' : '#9CA3AF' }}>📄</span>
                                                {getFormLabel(formId)}
                                            </button>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => setShowFormLibrary(true)}
                                    style={{
                                        width: '100%',
                                        marginTop: '16px',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px dashed #D1D5DB',
                                        backgroundColor: 'transparent',
                                        color: '#6B7280',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        transition: 'all 0.15s'
                                    }}
                                    onMouseOver={e => {
                                        e.currentTarget.style.backgroundColor = '#F9FAFB';
                                        e.currentTarget.style.borderColor = '#9CA3AF';
                                        e.currentTarget.style.color = '#374151';
                                    }}
                                    onMouseOut={e => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.borderColor = '#D1D5DB';
                                        e.currentTarget.style.color = '#6B7280';
                                    }}
                                >
                                    <span style={{ fontSize: '20px' }}>+</span>
                                    Add Form or Slip
                                </button>
                            </div>
                        </div>

                        {/* Form Editor Area */}
                        <div>
                            {activeFormType ? (
                                <IncomeFormGenerator formType={activeFormType} />
                            ) : (
                                <div style={{
                                    backgroundColor: 'white',
                                    borderRadius: '12px',
                                    padding: '64px',
                                    textAlign: 'center',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                }}>
                                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
                                    <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>
                                        Select a form to edit
                                    </h3>
                                    <p style={{ color: '#6B7280', maxWidth: '400px', margin: '0 auto' }}>
                                        Choose a form from the sidebar to enter your information, or click "Add Form or Slip" to search the library.
                                    </p>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </main>

            {/* Action Footer */}
            <div style={{
                position: 'fixed',
                bottom: 0,
                left: '260px',
                right: 0,
                backgroundColor: 'white',
                borderTop: '1px solid #E5E7EB',
                padding: '16px 32px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 10
            }}>
                <button
                    onClick={() => navigate(`/return/${taxYear}/profile`)}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: '#6B7280',
                        fontWeight: 500,
                        cursor: 'pointer'
                    }}
                >
                    ← Back to Profile
                </button>

                <button
                    onClick={() => navigate(`/return/${taxYear}/review`)}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: '#2563EB',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 600,
                        fontSize: '16px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 6px rgba(37, 99, 235, 0.2)'
                    }}
                >
                    Review & Optimize Return
                </button>
            </div>

            {showFormLibrary && (
                <FormLibraryModal
                    onClose={() => setShowFormLibrary(false)}
                    onAdd={handleAddForm}
                    activeForms={addedForms}
                />
            )}
        </div>
    );
};

export default WorkspacePage;
