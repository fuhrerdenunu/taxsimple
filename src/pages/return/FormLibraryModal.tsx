import React, { useMemo, useState } from 'react';
import { FORM_REGISTRY } from '../../domain/forms/form-registry';

interface Props {
  onClose: () => void;
  onAdd: (formId: string) => void;
  activeForms: string[];
}

const FormLibraryModal: React.FC<Props> = ({ onClose, onAdd, activeForms }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(FORM_REGISTRY.map((form) => form.category)))],
    []
  );

  const filteredForms = FORM_REGISTRY.filter((form) => {
    const matchesSearch =
      form.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      form.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      form.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = activeCategory === 'All' || form.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Form library"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(17, 24, 39, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        backdropFilter: 'blur(4px)'
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '900px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            padding: '24px',
            borderBottom: '1px solid #E5E7EB',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#F9FAFB'
          }}
        >
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: '0 0 4px 0' }}>Form Library</h2>
            <p style={{ color: '#6B7280', fontSize: '14px', margin: 0 }}>
              Search forms for slips, deductions, and credits.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close form library"
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              color: '#9CA3AF',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '4px'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: '24px', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <span style={{ position: 'absolute', left: '16px', top: '12px', color: '#9CA3AF' }}>🔍</span>
            <input
              type="text"
              placeholder="Search forms (e.g. T4, Tuition, Medical)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px 12px 48px',
                fontSize: '16px',
                border: '2px solid #E5E7EB',
                borderRadius: '8px',
                boxSizing: 'border-box',
                outline: 'none'
              }}
              autoFocus
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {categories.map((cat) => (
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

        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, backgroundColor: '#F9FAFB' }}>
          {filteredForms.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: '#6B7280' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>No forms found</h3>
              <p>Try adjusting your search or category filter.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {filteredForms.map((form) => {
                const isAdded = activeForms.includes(form.id);
                const isPlanned = form.supportedStatus === 'planned';
                const disabled = isAdded || isPlanned;

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
                      opacity: disabled ? 0.72 : 1
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            backgroundColor: '#EFF6FF',
                            color: '#1D4ED8',
                            fontSize: '12px',
                            fontWeight: 600,
                            borderRadius: '4px',
                            marginBottom: '8px'
                          }}
                        >
                          {form.code}
                        </span>
                        <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: 0, lineHeight: 1.3 }}>{form.name}</h4>
                      </div>
                      <span
                        title={isPlanned ? 'Not available yet' : form.supportedStatus === 'partial' ? 'Partially supported' : 'Supported'}
                        style={{
                          height: 'fit-content',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          fontSize: '11px',
                          fontWeight: 600,
                          backgroundColor:
                            form.supportedStatus === 'supported'
                              ? '#ECFDF5'
                              : form.supportedStatus === 'partial'
                              ? '#FEF3C7'
                              : '#F3F4F6',
                          color:
                            form.supportedStatus === 'supported'
                              ? '#065F46'
                              : form.supportedStatus === 'partial'
                              ? '#92400E'
                              : '#6B7280'
                        }}
                      >
                        {form.supportedStatus === 'planned' ? 'Planned' : form.supportedStatus === 'partial' ? 'Partial' : 'Supported'}
                      </span>
                    </div>

                    <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 16px 0', flex: 1 }}>{form.description}</p>

                    <button
                      onClick={() => !disabled && onAdd(form.id)}
                      disabled={disabled}
                      title={isPlanned ? 'Not available yet' : undefined}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: isAdded ? '#F3F4F6' : isPlanned ? '#F3F4F6' : '#2563EB',
                        color: isAdded || isPlanned ? '#9CA3AF' : 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: 500,
                        cursor: disabled ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {isAdded ? 'Already in workspace' : isPlanned ? 'Not available yet' : 'Add to workspace'}
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
