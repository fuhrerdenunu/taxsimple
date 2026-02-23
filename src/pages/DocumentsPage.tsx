import React from 'react';
import { Link } from 'react-router-dom';
import { useTaxReturn } from '../context/TaxReturnContext';

export function DocumentsPage() {
  const { state } = useTaxReturn();
  const years = Object.keys(state.returnsByYear)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', padding: '24px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '28px', color: '#1F2937', margin: 0 }}>Tax documents</h1>
          <Link
            to="/dashboard"
            style={{
              textDecoration: 'none',
              color: '#1F2937',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '14px'
            }}
          >
            Back to dashboard
          </Link>
        </div>

        {years.length === 0 && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #E5E7EB' }}>
            No tax documents yet.
          </div>
        )}

        {years.map((year) => {
          const unit = state.returnsByYear[year];
          const docs = unit.documents ?? [];
          return (
            <section key={year} style={{ marginBottom: '16px', background: 'white', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #F3F4F6', fontWeight: 600, color: '#1F2937' }}>
                {year}
              </div>
              <div style={{ padding: '16px' }}>
                {docs.length === 0 ? (
                  <p style={{ margin: 0, color: '#6B7280', fontSize: '14px' }}>No filed documents for this year yet.</p>
                ) : (
                  <div style={{ display: 'grid', gap: '10px' }}>
                    {docs.map((doc) => (
                      <div key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '10px 12px' }}>
                        <div>
                          <div style={{ fontWeight: 500, color: '#1F2937' }}>{doc.title}</div>
                          <div style={{ fontSize: '12px', color: '#6B7280' }}>
                            {doc.personId === 'primary' ? 'Primary return' : 'Partner return'} • {new Date(doc.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <div style={{ fontSize: '12px', color: '#6B7280', textTransform: 'uppercase' }}>{doc.type}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

