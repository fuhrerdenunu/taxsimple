import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTaxReturn, Profile } from '../../context/TaxReturnContext';
import { PROVINCES, CURRENT_TAX_YEAR, type ProvinceCode } from '../../domain/tax';
import { Button } from '../../components/ui/Button';
import { Input, Select, MoneyInput } from '../../components/ui/Input';
import { AddressInput } from '../../components/ui/AddressInput';
import { ToggleQuestion, ToggleSwitchCompact } from '../../components/ui/ToggleSwitch';
import { useReturnRouteSync } from './useReturnRouteSync';

// Clean dropdown-style Yes/No select matching Wealthsimple
function YesNoSelect({
  label,
  value,
  onChange,
  hint,
  required
}: {
  label: string;
  value: boolean | undefined;
  onChange: (val: boolean) => void;
  hint?: string;
  required?: boolean;
}) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{
        display: 'block',
        fontSize: '14px',
        color: '#374151',
        marginBottom: '8px'
      }}>
        {label} {required && <span style={{ color: '#DC2626' }}>*</span>}
        {hint && (
          <span style={{
            marginLeft: '6px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            border: '1px solid #D1D5DB',
            fontSize: '11px',
            color: '#6B7280',
            cursor: 'help'
          }} title={hint}>?</span>
        )}
      </label>
      <select
        value={value === undefined ? '' : value ? 'yes' : 'no'}
        onChange={(e) => onChange(e.target.value === 'yes')}
        style={{
          padding: '10px 14px',
          fontSize: '14px',
          border: '1px solid #E5E7EB',
          borderRadius: '6px',
          backgroundColor: 'white',
          cursor: 'pointer',
          minWidth: '100px'
        }}
      >
        <option value="yes">Yes</option>
        <option value="no">No</option>
      </select>
    </div>
  );
}

// Section card component
function Section({
  title,
  subtitle,
  children,
  dark
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <div style={{
      backgroundColor: dark ? '#1F2937' : 'white',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '24px',
      boxShadow: dark ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.08)'
    }}>
      {title && (
        <h2 style={{
          fontSize: '18px',
          fontWeight: 600,
          color: dark ? 'white' : '#1F2937',
          marginBottom: subtitle ? '4px' : '20px'
        }}>
          {title}
        </h2>
      )}
      {subtitle && (
        <p style={{
          fontSize: '14px',
          color: dark ? '#9CA3AF' : '#6B7280',
          marginBottom: '20px'
        }}>
          {subtitle}
        </p>
      )}
      {children}
    </div>
  );
}

// Info row with help icon
function InfoRow({
  label,
  children,
  hint,
  required
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
  required?: boolean;
}) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 0',
      borderBottom: '1px solid #F3F4F6'
    }}>
      <span style={{ fontSize: '14px', color: '#374151' }}>
        {label} {required && <span style={{ color: '#DC2626' }}>*</span>}
        {hint && (
          <span style={{
            marginLeft: '6px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            border: '1px solid #D1D5DB',
            fontSize: '11px',
            color: '#6B7280',
            cursor: 'help'
          }} title={hint}>?</span>
        )}
      </span>
      {children}
    </div>
  );
}

export function ProfilePage() {
  const navigate = useNavigate();
  const { taxYear, personId } = useParams();
  const location = useLocation();
  useReturnRouteSync(personId === 'partner' ? 'partner' : 'primary');
  const year = taxYear ? parseInt(taxYear, 10) : CURRENT_TAX_YEAR;
  const { state, dispatch } = useTaxReturn();
  const { profile } = state;

  // Extended profile state
  const [ext, setExt] = useState({
    middleName: '',
    none: false,
    t4: false,
    t2125: false,
    home: false,
    t2202: false,
    stocks: false,
    child: false,
    t4a: false,
    donations: false,
    medical: false,
    rrsp: false
  });

  const handleChange = (field: keyof Profile, value: unknown) => {
    dispatch({ type: 'UPDATE_PROFILE', payload: { [field]: value } as Partial<Profile> });
  };

  const handleExt = (field: keyof typeof ext, value: string | number | boolean) => {
    setExt((prev: any) => ({ ...prev, [field]: value }));
  };

  const formatSIN = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 9);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  const provinceOptions = PROVINCES.map(p => ({ value: p.code, label: p.name }));
  const languageOptions = [{ value: 'english', label: 'English' }, { value: 'french', label: 'Français' }];

  const showSpouseSection = profile.maritalStatus === 'married' || profile.maritalStatus === 'common-law';
  const isOntario = profile.province === 'ON';

  const partnerSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const targetSection = params.get('section');

    if (targetSection === 'partner' && showSpouseSection) {
      partnerSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    if (targetSection) {
      const targetElement = document.getElementById(`section-${targetSection}`);
      targetElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location.search, showSpouseSection]);

  const [formErrors, setFormErrors] = useState<string[]>([]);

  const handleContinue = () => {
    const errors: string[] = [];
    if (!profile.firstName?.trim()) errors.push('First name is required');
    if (!profile.lastName?.trim()) errors.push('Last name is required');
    if (!profile.dateOfBirth?.trim()) errors.push('Date of birth is required');
    const sinDigits = profile.sin?.replace(/\D/g, '') || '';
    if (sinDigits.length !== 9) errors.push('Valid 9-digit Social Insurance Number is required');
    if (!profile.province) errors.push('Province of residence is required');
    if (!profile.maritalStatus) errors.push('Marital status is required');

    if (errors.length > 0) {
      setFormErrors(errors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setFormErrors([]);

      const person = personId === 'partner' || location.search.includes('section=partner') ? 'partner' : 'primary';
      navigate(`/return/${taxYear}/person/${person}/workspace`);
    }
  };

  return (
    <div style={{ paddingBottom: '80px' }}>
      {/* About You Section */}
      <Section title="About you" subtitle="To get started, we'll need some basic information from you.">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          <div style={{ fontSize: '24px', fontWeight: 500, color: '#0F172A', marginBottom: '8px' }}>
            Hi there. Let's get your 2025 taxes done.
          </div>

          <div style={{ padding: '24px', backgroundColor: '#FAFAFA', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '18px', color: '#374151' }}>I am</span>
              <input
                type="text"
                placeholder="First Name"
                value={profile.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                style={{
                  padding: '12px 16px', fontSize: '16px', border: 'none', borderBottom: '2px solid #10B981',
                  backgroundColor: 'transparent', outline: 'none', width: '140px', color: '#10B981', fontWeight: 600
                }}
              />
              <input
                type="text"
                placeholder="Last Name"
                value={profile.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                style={{
                  padding: '12px 16px', fontSize: '16px', border: 'none', borderBottom: '2px solid #10B981',
                  backgroundColor: 'transparent', outline: 'none', width: '160px', color: '#10B981', fontWeight: 600
                }}
              />
              <span style={{ fontSize: '18px', color: '#374151' }}>, a resident of</span>
              <select
                value={profile.province}
                onChange={(e) => handleChange('province', e.target.value as ProvinceCode)}
                style={{
                  padding: '12px 16px', fontSize: '16px', border: 'none', borderBottom: '2px solid #10B981',
                  backgroundColor: 'transparent', outline: 'none', color: '#10B981', fontWeight: 600, cursor: 'pointer'
                }}
              >
                <option value="" disabled>Select Province</option>
                {provinceOptions.map(p => (
                  <option key={p.value} value={p.value} style={{ color: '#0F172A' }}>{p.label}</option>
                ))}
              </select>
              <span style={{ fontSize: '18px', color: '#374151' }}>.</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '24px' }}>
              <span style={{ fontSize: '18px', color: '#374151' }}>My marital status is</span>
              <select
                value={profile.maritalStatus}
                onChange={(e) => handleChange('maritalStatus', e.target.value as any)}
                style={{
                  padding: '12px 16px', fontSize: '16px', border: 'none', borderBottom: '2px solid #10B981',
                  backgroundColor: 'transparent', outline: 'none', color: '#10B981', fontWeight: 600, cursor: 'pointer'
                }}
              >
                <option value="single" style={{ color: '#0F172A' }}>Single</option>
                <option value="married" style={{ color: '#0F172A' }}>Married</option>
                <option value="common-law" style={{ color: '#0F172A' }}>Common-law</option>
                <option value="separated" style={{ color: '#0F172A' }}>Separated</option>
                <option value="divorced" style={{ color: '#0F172A' }}>Divorced</option>
                <option value="widowed" style={{ color: '#0F172A' }}>Widowed</option>
              </select>
              <span style={{ fontSize: '18px', color: '#374151' }}>and my birthdate is</span>
              <input
                type="date"
                value={profile.dateOfBirth}
                onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                style={{
                  padding: '12px 16px', fontSize: '16px', border: 'none', borderBottom: '2px solid #10B981',
                  backgroundColor: 'transparent', outline: 'none', color: '#10B981', fontWeight: 600
                }}
              />
              <span style={{ fontSize: '18px', color: '#374151' }}>.</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '24px' }}>
              <span style={{ fontSize: '18px', color: '#374151' }}>My Social Insurance Number is</span>
              <input
                type="text"
                value={profile.sin}
                onChange={(e) => handleChange('sin', formatSIN(e.target.value))}
                placeholder="XXX-XXX-XXX"
                style={{
                  padding: '12px 16px', fontSize: '16px', border: 'none', borderBottom: '2px solid #10B981',
                  backgroundColor: 'transparent', outline: 'none', width: '180px', color: '#10B981', fontWeight: 600
                }}
              />
            </div>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          marginBottom: '16px'
        }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#6B7280', marginBottom: '6px' }}>
              In which <u>province or territory did you live</u> on December 31, {year}?<span style={{ color: '#DC2626' }}>*</span>
            </label>
            <select
              value={profile.province}
              onChange={(e) => handleChange('province', e.target.value as ProvinceCode)}
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                border: '1px solid #E5E7EB',
                borderRadius: '6px',
                backgroundColor: 'white'
              }}
            >
              {provinceOptions.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
        </div>
      </Section>

      {/* Life Events Grid (Step 2 of Mad Libs) */}
      <Section title="What happened in 2025?" subtitle="Check everything that applies to you so we can build your return. You can always add forms later.">
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          marginTop: '16px'
        }}>
          {[
            { id: 't4', label: 'I worked a standard job (T4)', icon: '💼' },
            { id: 't2125', label: 'I ran a business or freelanced (T2125)', icon: '🏪' },
            { id: 'home', label: 'I bought a home (First-Time Home Buyers)', icon: '🏠' },
            { id: 't2202', label: 'I paid tuition (T2202)', icon: '🎓' },
            { id: 'stocks', label: 'I bought or sold crypto/stocks (Schedule 3)', icon: '📈' },
            { id: 'child', label: 'I had a child (Canada Child Benefit)', icon: '👶' },
            { id: 't4a', label: 'I received pension income (T4A)', icon: '👴' },
            { id: 'donations', label: 'I made charitable donations', icon: '💝' },
            { id: 'medical', label: 'I paid medical expenses', icon: '🏥' },
            { id: 'rrsp', label: 'I contributed to an RRSP', icon: '🏦' },
            { id: 'none', label: 'None of the above – I’ll add forms later', icon: '⏭️' },
          ].map((card) => {
            // Mock selected state for demo purposes
            const isSelected = ext[card.id as keyof typeof ext] as boolean | undefined || false;

            return (
              <div
                key={card.id}
                onClick={() => {
                  if (card.id === 'none') {
                    // Turn everything else off
                    ['t4', 't2125', 'home', 't2202', 'stocks', 'child', 't4a', 'donations', 'medical', 'rrsp'].forEach(id => {
                      handleExt(id as any, false);
                    });
                  } else {
                    handleExt(card.id as any, !isSelected);
                    handleExt('none', false); // Turn off 'none' if something else is selected
                  }
                }}
                style={{
                  padding: '24px',
                  borderRadius: '12px',
                  border: isSelected ? '2px solid #10B981' : '1px solid #E5E7EB',
                  backgroundColor: isSelected ? '#F0FDF4' : 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  transition: 'all 0.2s',
                  boxShadow: isSelected ? '0 4px 6px -1px rgba(16, 185, 129, 0.1)' : 'none'
                }}
              >
                <div style={{ fontSize: '32px' }}>{card.icon}</div>
                <div style={{ fontSize: '16px', fontWeight: 500, color: isSelected ? '#065F46' : '#374151' }}>
                  {card.label}
                </div>
                {isSelected && (
                  <div style={{ marginLeft: 'auto', color: '#10B981', fontWeight: 'bold' }}>✓</div>
                )}
              </div>
            );
          })}
        </div>
      </Section>

      {/* Spouse / Partner Section - shown when married or common-law */}
      {showSpouseSection && (
        <Section title="Your partner's details" subtitle="Since you indicated you are married or in a common-law relationship, let us know if you'd like to file together.">
          <div ref={partnerSectionRef} id="section-partner">
            {/* File Together Toggle */}
            <div style={{
              padding: '20px', backgroundColor: '#F0FDF4', borderRadius: '12px',
              border: '1px solid #D1FAE5', marginBottom: '24px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#065F46', marginBottom: '4px' }}>
                  File together with your partner?
                </div>
                <div style={{ fontSize: '14px', color: '#6B7280' }}>
                  Filing together helps maximize credits and deductions between you and your partner.
                </div>
              </div>
              <button
                onClick={() => {
                  const currentSpouse = profile.spouse || { firstName: '', lastName: '', sin: '', dateOfBirth: '', netIncome: 0, filingTogether: false };
                  handleChange('spouse', { ...currentSpouse, filingTogether: !currentSpouse.filingTogether });
                }}
                style={{
                  width: '52px', height: '28px', borderRadius: '14px', border: 'none', cursor: 'pointer',
                  backgroundColor: profile.spouse?.filingTogether ? '#10B981' : '#D1D5DB',
                  position: 'relative', transition: 'background-color 0.2s', flexShrink: 0
                }}
              >
                <div style={{
                  width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'white',
                  position: 'absolute', top: '3px',
                  left: profile.spouse?.filingTogether ? '27px' : '3px',
                  transition: 'left 0.2s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                }} />
              </button>
            </div>

            {/* Partner details - shown when filing together */}
            {profile.spouse?.filingTogether && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ padding: '24px', backgroundColor: '#FAFAFA', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '18px', color: '#374151' }}>My partner's name is</span>
                    <input
                      type="text"
                      placeholder="First Name"
                      value={profile.spouse?.firstName || ''}
                      onChange={(e) => handleChange('spouse', { ...profile.spouse!, firstName: e.target.value })}
                      style={{
                        padding: '12px 16px', fontSize: '16px', border: 'none', borderBottom: '2px solid #10B981',
                        backgroundColor: 'transparent', outline: 'none', width: '140px', color: '#10B981', fontWeight: 600
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={profile.spouse?.lastName || ''}
                      onChange={(e) => handleChange('spouse', { ...profile.spouse!, lastName: e.target.value })}
                      style={{
                        padding: '12px 16px', fontSize: '16px', border: 'none', borderBottom: '2px solid #10B981',
                        backgroundColor: 'transparent', outline: 'none', width: '160px', color: '#10B981', fontWeight: 600
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '24px' }}>
                    <span style={{ fontSize: '18px', color: '#374151' }}>Their SIN is</span>
                    <input
                      type="text"
                      placeholder="XXX-XXX-XXX"
                      value={profile.spouse?.sin || ''}
                      onChange={(e) => handleChange('spouse', { ...profile.spouse!, sin: formatSIN(e.target.value) })}
                      style={{
                        padding: '12px 16px', fontSize: '16px', border: 'none', borderBottom: '2px solid #10B981',
                        backgroundColor: 'transparent', outline: 'none', width: '180px', color: '#10B981', fontWeight: 600
                      }}
                    />
                    <span style={{ fontSize: '18px', color: '#374151' }}>and their date of birth is</span>
                    <input
                      type="date"
                      value={profile.spouse?.dateOfBirth || ''}
                      onChange={(e) => handleChange('spouse', { ...profile.spouse!, dateOfBirth: e.target.value })}
                      style={{
                        padding: '12px 16px', fontSize: '16px', border: 'none', borderBottom: '2px solid #10B981',
                        backgroundColor: 'transparent', outline: 'none', color: '#10B981', fontWeight: 600
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '24px' }}>
                    <span style={{ fontSize: '18px', color: '#374151' }}>Their net income for 2025 was approximately</span>
                    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                      <span style={{ position: 'absolute', left: '16px', fontSize: '16px', color: '#10B981', fontWeight: 600 }}>$</span>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={profile.spouse?.netIncome || ''}
                        onChange={(e) => handleChange('spouse', { ...profile.spouse!, netIncome: parseFloat(e.target.value) || 0 })}
                        style={{
                          padding: '12px 16px 12px 32px', fontSize: '16px', border: 'none', borderBottom: '2px solid #10B981',
                          backgroundColor: 'transparent', outline: 'none', width: '180px', color: '#10B981', fontWeight: 600
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Form Validation Errors */}
      {formErrors.length > 0 && (
        <div style={{
          marginTop: '32px',
          padding: '16px',
          backgroundColor: '#FEF2F2',
          border: '1px solid #F87171',
          borderRadius: '8px'
        }}>
          <h4 style={{ color: '#991B1B', margin: '0 0 8px 0', fontSize: '14px' }}>Please fix the following before continuing:</h4>
          <ul style={{ color: '#B91C1C', margin: 0, paddingLeft: '20px', fontSize: '13px' }}>
            {formErrors.map((err, i) => <li key={i}>{err}</li>)}
          </ul>
        </div>
      )}

      {/* Continue Button */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        marginTop: '32px'
      }}>
        <Button onClick={handleContinue} size="lg">
          Continue to Workspace
        </Button>
      </div>
    </div>
  );
}
