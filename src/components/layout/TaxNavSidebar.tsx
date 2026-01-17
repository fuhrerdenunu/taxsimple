import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

interface NavSection {
  id: string;
  label: string;
  path: string;
  children?: NavSection[];
  badge?: string;
}

const navSections: NavSection[] = [
  { id: 'about', label: 'About you', path: 'profile' },
  { id: 'autofill', label: 'Auto-fill & add forms', path: 'profile' },
  { id: 'personal', label: 'Personal information', path: 'profile' },
  {
    id: 'forms',
    label: 'Manage tax forms',
    path: 'income',
    children: [
      { id: 'partner', label: 'Your Partner', path: 'income' },
      { id: 'trillium', label: 'Trillium Benefit', path: 'income' },
      { id: 'employment', label: 'Employment Expenses', path: 'income' },
      { id: 'rrsp', label: 'RRSP Deduction', path: 'deductions' },
      { id: 't4', label: 'T4 Slips', path: 'income' },
      { id: 't4fhsa', label: 'T4FHSA Slips', path: 'income' },
      { id: 'tuition', label: 'Tuition Amount', path: 'deductions' },
      { id: 'losses', label: 'Unused Losses', path: 'deductions' },
      { id: 'carryforwards', label: 'Carryforwards', path: 'deductions' },
      { id: 'capitalgains', label: 'Capital Gains', path: 'income' },
      { id: 't5', label: 'T5 Slips', path: 'income' }
    ]
  },
  { id: 'review', label: 'Review & optimize', path: 'review' },
  { id: 'summary', label: 'Summary', path: 'review' },
  { id: 'submit', label: 'Submit', path: 'complete' },
  { id: 'recommendations', label: 'Recommendations', path: 'complete', badge: '2' }
];

export function TaxNavSidebar() {
  const { taxYear } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedSection, setExpandedSection] = React.useState('forms');

  const currentPath = location.pathname.split('/').pop();

  const handleClick = (section: NavSection) => {
    if (section.children) {
      setExpandedSection(expandedSection === section.id ? '' : section.id);
    } else {
      navigate(`/return/${taxYear}/${section.path}`);
    }
  };

  const isActive = (section: NavSection) => {
    return section.path === currentPath;
  };

  return (
    <div style={{
      width: '240px',
      flexShrink: 0,
      position: 'sticky',
      top: '80px',
      maxHeight: 'calc(100vh - 100px)',
      overflowY: 'auto'
    }}>
      {/* Add tax forms button */}
      <button
        onClick={() => navigate(`/return/${taxYear}/income`)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 16px',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 500,
          color: '#1F2937',
          width: '100%',
          textAlign: 'left',
          marginBottom: '8px'
        }}
      >
        <span style={{
          width: '20px',
          height: '20px',
          borderRadius: '4px',
          border: '2px solid #D1D5DB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          fontWeight: 600
        }}>+</span>
        Add tax forms
      </button>

      {/* Navigation items */}
      <nav style={{ display: 'flex', flexDirection: 'column' }}>
        {navSections.map((section) => (
          <div key={section.id}>
            <button
              onClick={() => handleClick(section)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '10px 16px',
                backgroundColor: isActive(section) ? '#F3F4F6' : 'transparent',
                border: 'none',
                borderLeft: isActive(section) ? '3px solid #1F2937' : '3px solid transparent',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#4B5563',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
            >
              <span>{section.label}</span>
              {section.children && (
                <span style={{
                  transform: expandedSection === section.id ? 'rotate(180deg)' : 'rotate(0)',
                  transition: 'transform 0.2s'
                }}>
                  ▼
                </span>
              )}
              {section.badge && (
                <span style={{
                  backgroundColor: '#E5E7EB',
                  borderRadius: '12px',
                  padding: '2px 8px',
                  fontSize: '12px',
                  fontWeight: 500
                }}>
                  {section.badge}
                </span>
              )}
            </button>

            {/* Children */}
            {section.children && expandedSection === section.id && (
              <div style={{ paddingLeft: '16px' }}>
                {section.children.map((child) => (
                  <button
                    key={child.id}
                    onClick={() => navigate(`/return/${taxYear}/${child.path}`)}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '8px 16px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '13px',
                      color: '#6B7280',
                      textAlign: 'left'
                    }}
                  >
                    {child.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}
