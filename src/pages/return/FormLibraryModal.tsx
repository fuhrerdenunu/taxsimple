import React, { useState } from 'react';

interface FormDefinition {
    id: string;
    code: string;
    name: string;
    category: 'Income' | 'Deductions' | 'Credits' | 'Investments';
    description: string;
}

const FORM_DATABASE: FormDefinition[] = [
    { id: 't4', code: 'T4', name: 'Statement of Remuneration Paid', category: 'Income', description: 'Standard employment income' },
    { id: 't4a', code: 'T4A', name: 'Statement of Pension, Retirement, Annuity', category: 'Income', description: 'Pension, lumpsum, self-employed commissions' },
    { id: 't4e', code: 'T4E', name: 'Statement of Employment Insurance', category: 'Income', description: 'EI Benefits received' },
    { id: 't2125', code: 'T2125', name: 'Statement of Business or Professional Activities', category: 'Income', description: 'Self-employment or freelance income' },
    { id: 't2202', code: 'T2202', name: 'Tuition and Enrolment Certificate', category: 'Deductions', description: 'Post-secondary tuition fees' },
    { id: 'rrsp', code: 'RRSP', name: 'RRSP Contributions', category: 'Deductions', description: 'Receipts for RRSP contributions' },
    { id: 'medical', code: 'Medical', name: 'Medical Expenses', category: 'Credits', description: 'Out-of-pocket medical expenses' },
    { id: 'donations', code: 'Donations', name: 'Charitable Donations', category: 'Credits', description: 'Donations to registered charities' },
    { id: 't5', code: 'T5', name: 'Statement of Investment Income', category: 'Investments', description: 'Dividends and interest from non-registered accounts' },
    { id: 't5008', code: 'T5008', name: 'Statement of Securities Transactions', category: 'Investments', description: 'Proceeds from disposition of stocks/bonds' },
];

interface Props {
    onClose: () => void;
    onAdd: (formId: string) => void;
    activeForms: string[];
}

const FormLibraryModal: React.FC<Props> = ({ onClose, onAdd, activeForms }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<string>('All');

    const filteredForms = FORM_DATABASE.filter(form => {
        const matchesSearch =
            form.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            form.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            form.description.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory = activeCategory === 'All' || form.category === activeCategory;

        return matchesSearch && matchesCategory;
    });

    const categories = ['All', 'Income', 'Deductions', 'Credits', 'Investments'];

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(17, 24, 39, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            backdropFilter: 'blur(4px)'
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '800px',
                maxHeight: '85vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                overflow: 'hidden'
            }}>
                {/* Header */}
                <div style={{ padding: '24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F9FAFB' }}>
                    <div>
                        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: '0 0 4px 0' }}>Form Library</h2>
                        <p style={{ color: '#6B7280', fontSize: '14px', margin: 0 }}>Search for tax forms, slips, deductions, and credits.</p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '24px',
                            color: '#9CA3AF',
                            cursor: 'pointer',
                            padding: '4px 8px',
                            borderRadius: '4px'
                        }}
                        onMouseOver={e => e.currentTarget.style.backgroundColor = '#E5E7EB'}
                        onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        ×
                    </button>
                </div>

                {/* Search & Filter */}
                <div style={{ padding: '24px', borderBottom: '1px solid #E5E7EB' }}>
                    <div style={{ position: 'relative', marginBottom: '16px' }}>
                        <span style={{ position: 'absolute', left: '16px', top: '12px', color: '#9CA3AF' }}>🔍</span>
                        <input
                            type="text"
                            placeholder="Search forms (e.g. 'T4', 'Tuition', 'Medical')"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 16px 12px 48px',
                                fontSize: '16px',
                                border: '2px solid #E5E7EB',
                                borderRadius: '8px',
                                boxSizing: 'border-box',
                                outline: 'none',
                                transition: 'border-color 0.2s'
                            }}
                            onFocus={e => e.target.style.borderColor = '#3B82F6'}
                            onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                            autoFocus
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                style={{
                                    padding: '6px 16px',
                                    borderRadius: '999px',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    border: activeCategory === cat ? 'none' : '1px solid #D1D5DB',
                                    backgroundColor: activeCategory === cat ? '#1F2937' : 'white',
                                    color: activeCategory === cat ? 'white' : '#4B5563',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Results */}
                <div style={{ padding: '24px', overflowY: 'auto', flex: 1, backgroundColor: '#F9FAFB' }}>
                    {filteredForms.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '48px 0', color: '#6B7280' }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤷</div>
                            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>No forms found</h3>
                            <p>Try adjusting your search or category filter.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            {filteredForms.map(form => {
                                const isAdded = activeForms.includes(form.id);

                                return (
                                    <div
                                        key={form.id}
                                        style={{
                                            padding: '20px',
                                            backgroundColor: 'white',
                                            border: '1px solid #E5E7EB',
                                            borderRadius: '12px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                            opacity: isAdded ? 0.6 : 1
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                            <div>
                                                <span style={{
                                                    display: 'inline-block',
                                                    padding: '2px 8px',
                                                    backgroundColor: '#EFF6FF',
                                                    color: '#1D4ED8',
                                                    fontSize: '12px',
                                                    fontWeight: 600,
                                                    borderRadius: '4px',
                                                    marginBottom: '8px'
                                                }}>
                                                    {form.code}
                                                </span>
                                                <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: 0, lineHeight: 1.3 }}>
                                                    {form.name}
                                                </h4>
                                            </div>
                                        </div>

                                        <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 16px 0', flex: 1 }}>
                                            {form.description}
                                        </p>

                                        <button
                                            onClick={() => !isAdded && onAdd(form.id)}
                                            disabled={isAdded}
                                            style={{
                                                padding: '8px 16px',
                                                backgroundColor: isAdded ? '#F3F4F6' : '#2563EB',
                                                color: isAdded ? '#9CA3AF' : 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                fontSize: '14px',
                                                fontWeight: 500,
                                                cursor: isAdded ? 'not-allowed' : 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '6px',
                                                transition: 'background-color 0.2s'
                                            }}
                                        >
                                            {isAdded ? (
                                                <><span>✓</span> Already in workspace</>
                                            ) : (
                                                <><span>+</span> Add to workspace</>
                                            )}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FormLibraryModal;
