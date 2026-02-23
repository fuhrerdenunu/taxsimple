import React, { useState } from 'react';
import { Routes, Route, useParams, useLocation, Navigate, Link, useNavigate } from 'react-router-dom';
import { ProfilePage } from './ProfilePage';
import { IncomePage } from './IncomePage';
import { DeductionsPage } from './DeductionsPage';
import { ReviewPage } from './ReviewPage';
import { CompletePage } from './CompletePage';
import { useTaxReturn } from '../../context/TaxReturnContext';
import { calculateTax, formatCurrency, CURRENT_TAX_YEAR } from '../../domain/tax';

// Wealthsimple-style navigation sections
interface NavSection {
  id: string;
  label: string;
  path: string;
}

const navSections: NavSection[] = [
  { id: 'profile', label: 'About you', path: 'profile' },
  { id: 'income', label: 'Income & forms', path: 'income' },
  { id: 'deductions', label: 'Deductions & credits', path: 'deductions' },
  { id: 'review', label: 'Review & optimize', path: 'review' },
  { id: 'submit', label: 'Submit', path: 'complete' }
];

export function TaxWizard() {
  const { taxYear } = useParams();
  const location = useLocation();
  const year = taxYear ? parseInt(taxYear, 10) : CURRENT_TAX_YEAR;
  const { state } = useTaxReturn();

  const pathParts = location.pathname.split('/');
  const currentPath = pathParts[pathParts.length - 1];
  const isCompletePage = currentPath === 'complete';

  const firstName = state.profile.firstName || 'Your';

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F9FAFB'
    }}>
      {/* Header */}
      <Header taxYear={year} firstName={firstName} />

      {/* Main Layout */}
      <div style={{
        display: 'flex',
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 24px'
      }}>
        {/* Left Sidebar */}
        {!isCompletePage && (
          <LeftSidebar taxYear={year} currentPath={currentPath} />
        )}

        {/* Main Content */}
        <main style={{
          flex: 1,
          minWidth: 0,
          padding: '24px 0',
          marginLeft: isCompletePage ? '0' : '24px'
        }}>
          {/* Page Title */}
          {!isCompletePage && (
            <h1 style={{
              fontSize: '40px',
              fontWeight: 400,
              color: '#1F2937',
              margin: '0 0 32px'
            }}>
              {firstName}'s {year} Tax Return
            </h1>
          )}

          <Routes>
            <Route path="profile" element={<ProfilePage />} />
            <Route path="income" element={<IncomePage />} />
            <Route path="deductions" element={<DeductionsPage />} />
            <Route path="review" element={<ReviewPage />} />
            <Route path="complete" element={<CompletePage />} />
            <Route path="*" element={<Navigate to="profile" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function TaxSimpleLogo({ size = 32 }: { size?: number }) {
  const iconSize = Math.round(size * 0.625);
  return (
    <div style={{
      width: `${size}px`, height: `${size}px`, backgroundColor: '#0D5F2B',
      borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    </div>
  );
}

function Header({ taxYear, firstName }: { taxYear: number; firstName: string }) {
  const navigate = useNavigate();
  const { state } = useTaxReturn();
  const [showTaxMenu, setShowTaxMenu] = useState(false);
  const [showReturnMenu, setShowReturnMenu] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const isFilingTogether = (state.profile.maritalStatus === 'married' || state.profile.maritalStatus === 'common-law')
    && state.profile.spouse?.filingTogether;
  const spouseName = state.profile.spouse?.firstName || 'Partner';

  // Close dropdowns when clicking outside
  const closeAll = () => { setShowTaxMenu(false); setShowReturnMenu(false); setShowAccountMenu(false); };

  return (
    <>
      {/* Click-away overlay */}
      {(showTaxMenu || showReturnMenu || showAccountMenu) && (
        <div onClick={closeAll} style={{ position: 'fixed', inset: 0, zIndex: 99 }} />
      )}
      <header style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #E5E7EB',
        padding: '12px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Left side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* Logo */}
            <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <TaxSimpleLogo size={32} />
              <span style={{ fontSize: '18px', fontWeight: 700, color: '#1F2937' }}>TaxSimple</span>
            </Link>

            <span style={{ color: '#D1D5DB', fontSize: '20px', fontWeight: 300 }}>|</span>

            {/* Tax dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => { closeAll(); setShowTaxMenu(!showTaxMenu); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '4px', background: 'none',
                  border: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: 500,
                  color: '#1F2937', padding: '8px 4px'
                }}
              >
                Tax
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginLeft: '2px' }}>
                  <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {showTaxMenu && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, backgroundColor: 'white',
                  borderRadius: '8px', border: '1px solid #E5E7EB',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.12)', minWidth: '200px', zIndex: 101,
                  overflow: 'hidden', marginTop: '4px'
                }}>
                  <button onClick={() => { navigate(`/return/${taxYear}/profile`); closeAll(); }}
                    style={{ display: 'block', width: '100%', padding: '12px 16px', border: 'none',
                      backgroundColor: 'white', textAlign: 'left', cursor: 'pointer', fontSize: '14px', color: '#1F2937' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}>
                    {taxYear} Tax Return
                  </button>
                  <button onClick={() => { navigate('/dashboard'); closeAll(); }}
                    style={{ display: 'block', width: '100%', padding: '12px 16px', border: 'none',
                      borderTop: '1px solid #F3F4F6', backgroundColor: 'white', textAlign: 'left',
                      cursor: 'pointer', fontSize: '14px', color: '#6B7280' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}>
                    All Tax Returns
                  </button>
                </div>
              )}
            </div>

            {/* Return name dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => { closeAll(); setShowReturnMenu(!showReturnMenu); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '4px', background: 'none',
                  border: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: 500,
                  color: '#1F2937', padding: '8px 4px'
                }}
              >
                {firstName}'s return
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginLeft: '2px' }}>
                  <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {showReturnMenu && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, backgroundColor: 'white',
                  borderRadius: '8px', border: '1px solid #E5E7EB',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.12)', minWidth: '240px', zIndex: 101,
                  overflow: 'hidden', marginTop: '4px'
                }}>
                  {/* Current user's return - always shown */}
                  <button onClick={() => closeAll()}
                    style={{ display: 'flex', width: '100%', padding: '12px 16px', border: 'none',
                      backgroundColor: '#F0FDF4', textAlign: 'left', cursor: 'pointer',
                      fontSize: '14px', color: '#065F46', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 500 }}>{firstName}'s return</span>
                    <span style={{ color: '#10B981', fontWeight: 600 }}>&#10003;</span>
                  </button>

                  {/* Partner's return - only if filing together */}
                  {isFilingTogether ? (
                    <button onClick={() => { navigate(`/return/${taxYear}/profile?section=partner`); closeAll(); }}
                      style={{ display: 'flex', width: '100%', padding: '12px 16px', border: 'none',
                        borderTop: '1px solid #F3F4F6', backgroundColor: 'white', textAlign: 'left',
                        cursor: 'pointer', fontSize: '14px', color: '#1F2937', alignItems: 'center', justifyContent: 'space-between' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}>
                      <span>{spouseName}'s return</span>
                    </button>
                  ) : (
                    <div style={{ padding: '12px 16px', borderTop: '1px solid #F3F4F6',
                      fontSize: '13px', color: '#9CA3AF' }}>
                      {(state.profile.maritalStatus === 'married' || state.profile.maritalStatus === 'common-law')
                        ? 'Enable "File together" in your profile to add your partner\'s return'
                        : 'Set your marital status to married or common-law to file with a partner'}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Saved status */}
            <span style={{ fontSize: '13px', color: '#10B981', fontWeight: 500 }}>
              Saved
            </span>
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* Tax documents */}
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', background: 'none',
                border: 'none', cursor: 'pointer', fontSize: '14px', color: '#1F2937', padding: '8px 0'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              Tax documents
            </button>

            {/* Account dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => { closeAll(); setShowAccountMenu(!showAccountMenu); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '4px', background: 'none',
                  border: 'none', cursor: 'pointer', fontSize: '14px', color: '#1F2937', padding: '8px 0'
                }}
              >
                Account
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginLeft: '2px' }}>
                  <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {showAccountMenu && (
                <div style={{
                  position: 'absolute', top: '100%', right: 0, backgroundColor: 'white',
                  borderRadius: '8px', border: '1px solid #E5E7EB',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.12)', minWidth: '180px', zIndex: 101,
                  overflow: 'hidden', marginTop: '4px'
                }}>
                  <button onClick={() => { navigate('/dashboard'); closeAll(); }}
                    style={{ display: 'block', width: '100%', padding: '12px 16px', border: 'none',
                      backgroundColor: 'white', textAlign: 'left', cursor: 'pointer', fontSize: '14px', color: '#1F2937' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}>
                    Dashboard
                  </button>
                  <Link to="/support" onClick={closeAll}
                    style={{ display: 'block', padding: '12px 16px', borderTop: '1px solid #F3F4F6',
                      fontSize: '14px', color: '#1F2937', textDecoration: 'none' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}>
                    Help &amp; Support
                  </Link>
                </div>
              )}
            </div>

            {/* Help */}
            <Link to="/support" style={{ fontSize: '14px', color: '#1F2937', textDecoration: 'none' }}>
              Help
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}

function LeftSidebar({ taxYear, currentPath }: { taxYear: number; currentPath: string }) {
  const [showAddForms, setShowAddForms] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { state } = useTaxReturn();
  const showPartnerLink =
    (state.profile.maritalStatus === 'married' || state.profile.maritalStatus === 'common-law') &&
    Boolean(state.profile.spouse?.filingTogether);

  const formOptions = [
    { id: 't4', name: 'T4 - Employment Income', path: 'income' },
    { id: 't4a', name: 'T4A - Pension and Other Income', path: 'income' },
    { id: 't5', name: 'T5 - Investment Income', path: 'income' },
    { id: 'rrsp', name: 'RRSP Deduction', path: 'deductions' },
    { id: 'donations', name: 'Donations & Gifts', path: 'deductions' },
    { id: 'medical', name: 'Medical Expenses', path: 'deductions' },
    { id: 't2202', name: 'T2202 - Tuition', path: 'deductions' },
    { id: 'moving', name: 'Moving Expenses', path: 'deductions' },
    { id: 't4e', name: 'T4E - Employment Insurance', path: 'income' },
    { id: 't3', name: 'T3 - Trust Income', path: 'income' },
    { id: 't5008', name: 'T5008 - Securities Transactions', path: 'income' },
  ];

  const filteredForms = searchQuery.length > 0
    ? formOptions.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : formOptions;

  const isActive = (section: NavSection) => {
    return section.path === currentPath;
  };

  return (
    <aside style={{
      width: '260px',
      flexShrink: 0,
      paddingTop: '24px',
      position: 'sticky',
      top: '73px',
      height: 'calc(100vh - 73px)',
      overflowY: 'auto'
    }}>
      {/* Add tax forms button */}
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => setShowAddForms(!showAddForms)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            width: '100%',
            padding: '12px 16px',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: 500,
            color: '#1F2937',
            textAlign: 'left',
            marginBottom: '8px'
          }}
        >
          <span style={{
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            fontWeight: 300
          }}>+</span>
          Add tax forms
        </button>

        {/* Add forms dropdown */}
        {showAddForms && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: '0',
            right: '0',
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 100,
            maxHeight: '400px',
            overflowY: 'auto'
          }}>
            {/* Search input */}
            <div style={{ padding: '12px', borderBottom: '1px solid #E5E7EB' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search forms (e.g. T4, RRSP)"
                autoFocus
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            {/* Form options */}
            {filteredForms.map((form) => (
              <Link
                key={form.id}
                to={`/return/${taxYear}/${form.path}`}
                onClick={() => {
                  setShowAddForms(false);
                  setSearchQuery('');
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: 'white',
                  border: 'none',
                  borderBottom: '1px solid #F3F4F6',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '14px',
                  color: '#1F2937',
                  textDecoration: 'none'
                }}
              >
                {form.name}
              </Link>
            ))}

            {filteredForms.length === 0 && (
              <div style={{ padding: '16px', textAlign: 'center', color: '#6B7280', fontSize: '14px' }}>
                No forms found
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav>
        {navSections.map((section) => (
          <Link
            key={section.id}
            to={`/return/${taxYear}/${section.path}`}
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
              textDecoration: 'none',
              transition: 'all 0.15s'
            }}
          >
            <span style={{ fontWeight: isActive(section) ? 500 : 400 }}>{section.label}</span>
          </Link>
        ))}

        {showPartnerLink && (
          <Link
            to={`/return/${taxYear}/profile?section=partner`}
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              padding: '10px 16px',
              backgroundColor: currentPath === 'profile' ? '#F9FAFB' : 'transparent',
              border: 'none',
              borderLeft: '3px solid #D1D5DB',
              cursor: 'pointer',
              fontSize: '13px',
              color: '#6B7280',
              textAlign: 'left',
              textDecoration: 'none'
            }}
          >
            Your Partner
          </Link>
        )}
      </nav>
    </aside>
  );
}

// Reusable card component for form sections
export function FormSection({
  title,
  children,
  onDelete
}: {
  title: string;
  children: React.ReactNode;
  onDelete?: () => void;
}) {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      overflow: 'hidden',
      marginBottom: '16px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    }}>
      {/* Dark header */}
      <div style={{
        backgroundColor: '#1F2937',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <h3 style={{
          margin: 0,
          fontSize: '16px',
          fontWeight: 500,
          color: 'white'
        }}>
          {title}
        </h3>
        {onDelete && (
          <button
            onClick={onDelete}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              color: 'white',
              opacity: 0.7
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M6 6L14 14M14 6L6 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '20px' }}>
        {children}
      </div>
    </div>
  );
}

// Search bar for adding forms
export function FormSearchBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);

  const formOptions = [
    { id: 't4', name: 'T4 - Employment Income', description: 'Statement of Remuneration Paid' },
    { id: 't4a', name: 'T4A - Pension and Other Income', description: 'Statement of Pension, Retirement, Annuity' },
    { id: 't5', name: 'T5 - Investment Income', description: 'Statement of Investment Income' },
    { id: 'rrsp', name: 'RRSP Deduction', description: 'Registered Retirement Savings Plan' },
    { id: 'donations', name: 'Donations & Gifts', description: 'Charitable donations and gifts' },
    { id: 'medical', name: 'Medical Expenses', description: 'Eligible medical expenses' },
    { id: 't2202', name: 'T2202 - Tuition', description: 'Tuition and Enrolment Certificate' },
    { id: 'moving', name: 'Moving Expenses', description: 'Eligible moving expenses' }
  ];

  const filteredForms = searchQuery.length > 0
    ? formOptions.filter(f =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : formOptions;

  return (
    <div style={{
      backgroundColor: '#F3F4F6',
      borderRadius: '8px',
      padding: '24px',
      marginBottom: '24px'
    }}>
      <h2 style={{
        fontSize: '20px',
        fontWeight: 500,
        color: '#1F2937',
        margin: '0 0 8px',
        textAlign: 'center'
      }}>
        Find income tax forms, deductions, and credits
      </h2>
      <p style={{
        fontSize: '14px',
        color: '#6B7280',
        margin: '0 0 16px',
        textAlign: 'center'
      }}>
        Missing a form? Search for it here.
      </p>

      <div style={{ position: 'relative', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'white',
          borderRadius: '8px',
          border: '1px solid #E5E7EB',
          padding: '12px 16px'
        }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ color: '#9CA3AF', marginRight: '12px' }}>
            <path d="M9 17A8 8 0 109 1a8 8 0 000 16zM19 19l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            placeholder="Search to add forms (e.g. T4, RRSP, donations)"
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '15px',
              color: '#1F2937',
              backgroundColor: 'transparent'
            }}
          />
        </div>

        {/* Search Results Dropdown */}
        {showResults && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '1px solid #E5E7EB',
            marginTop: '8px',
            maxHeight: '300px',
            overflowY: 'auto',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 50
          }}>
            {filteredForms.map((form) => (
              <button
                key={form.id}
                onClick={() => {
                  setShowResults(false);
                  setSearchQuery('');
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: 'white',
                  border: 'none',
                  borderBottom: '1px solid #F3F4F6',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background-color 0.15s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                <div style={{ fontSize: '14px', fontWeight: 500, color: '#1F2937' }}>
                  {form.name}
                </div>
                <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '2px' }}>
                  {form.description}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Question row component
export function QuestionRow({
  question,
  value,
  onChange,
  helpText
}: {
  question: string;
  value: string;
  onChange: (value: string) => void;
  helpText?: string;
}) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 0',
      borderBottom: '1px solid #F3F4F6'
    }}>
      <div style={{ flex: 1 }}>
        <span style={{ fontSize: '14px', color: '#1F2937' }}>{question}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            padding: '8px 32px 8px 12px',
            fontSize: '14px',
            border: '1px solid #E5E7EB',
            borderRadius: '6px',
            backgroundColor: 'white',
            color: '#1F2937',
            cursor: 'pointer',
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M3 4.5L6 7.5L9 4.5' stroke='%236B7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 8px center'
          }}
        >
          <option value="">Select</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
        {helpText && (
          <button
            title={helpText}
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              border: '1px solid #D1D5DB',
              backgroundColor: 'white',
              color: '#6B7280',
              fontSize: '12px',
              cursor: 'help',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ?
          </button>
        )}
      </div>
    </div>
  );
}

// Input field component
export function InputField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required,
  helpText
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  helpText?: string;
}) {
  const hasValue = value && value.length > 0;

  return (
    <div style={{ position: 'relative', marginBottom: '16px' }}>
      <div style={{
        position: 'relative',
        backgroundColor: hasValue ? '#F3F4F6' : 'white',
        border: '1px solid #E5E7EB',
        borderRadius: '8px',
        padding: '20px 16px 8px',
        transition: 'background-color 0.15s'
      }}>
        <label style={{
          position: 'absolute',
          top: '8px',
          left: '16px',
          fontSize: '11px',
          color: '#6B7280',
          fontWeight: 500,
          textTransform: 'none'
        }}>
          {label}{required && <span style={{ color: '#DC2626' }}>*</span>}
        </label>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%',
            border: 'none',
            outline: 'none',
            fontSize: '15px',
            color: '#1F2937',
            backgroundColor: 'transparent',
            padding: 0
          }}
        />
      </div>
      {helpText && (
        <button
          title={helpText}
          style={{
            position: 'absolute',
            right: '-28px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            border: '1px solid #D1D5DB',
            backgroundColor: 'white',
            color: '#6B7280',
            fontSize: '12px',
            cursor: 'help',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ?
        </button>
      )}
    </div>
  );
}

// Select field component
export function SelectField({
  label,
  value,
  onChange,
  options,
  required,
  helpText
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
  helpText?: string;
}) {
  const hasValue = value && value.length > 0;

  return (
    <div style={{ position: 'relative', marginBottom: '16px' }}>
      <div style={{
        position: 'relative',
        backgroundColor: hasValue ? '#F3F4F6' : 'white',
        border: '1px solid #E5E7EB',
        borderRadius: '8px',
        padding: '20px 16px 8px',
        transition: 'background-color 0.15s'
      }}>
        <label style={{
          position: 'absolute',
          top: '8px',
          left: '16px',
          fontSize: '11px',
          color: '#6B7280',
          fontWeight: 500
        }}>
          {label}{required && <span style={{ color: '#DC2626' }}>*</span>}
        </label>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: '100%',
            border: 'none',
            outline: 'none',
            fontSize: '15px',
            color: '#1F2937',
            backgroundColor: 'transparent',
            padding: 0,
            cursor: 'pointer',
            appearance: 'none'
          }}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          style={{
            position: 'absolute',
            right: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none'
          }}
        >
          <path d="M3 4.5L6 7.5L9 4.5" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {helpText && (
        <button
          title={helpText}
          style={{
            position: 'absolute',
            right: '-28px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            border: '1px solid #D1D5DB',
            backgroundColor: 'white',
            color: '#6B7280',
            fontSize: '12px',
            cursor: 'help',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ?
        </button>
      )}
    </div>
  );
}

// Video link component
export function VideoLink({ title }: { title: string }) {
  return (
    <button style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      color: '#1F2937',
      padding: '8px 0',
      marginBottom: '16px'
    }}>
      <div style={{
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        border: '2px solid #1F2937',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <svg width="8" height="10" viewBox="0 0 8 10" fill="none">
          <path d="M0 0L8 5L0 10V0Z" fill="#1F2937" />
        </svg>
      </div>
      {title}
    </button>
  );
}

// Read more link
export function ReadMoreLink({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '14px',
        color: '#1F2937',
        padding: '8px 0',
        textDecoration: 'underline'
      }}
    >
      Read more
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
