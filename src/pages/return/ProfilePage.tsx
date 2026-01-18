import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTaxReturn, Profile } from '../../context/TaxReturnContext';
import { PROVINCES, CURRENT_TAX_YEAR, type ProvinceCode } from '../../domain/tax';
import { Button } from '../../components/ui/Button';
import { Input, Select, MoneyInput } from '../../components/ui/Input';
import { AddressInput } from '../../components/ui/AddressInput';
import { ToggleQuestion, ToggleSwitchCompact } from '../../components/ui/ToggleSwitch';

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
  const { taxYear } = useParams();
  const year = taxYear ? parseInt(taxYear, 10) : CURRENT_TAX_YEAR;
  const { state, dispatch } = useTaxReturn();
  const { profile } = state;

  // Extended profile state
  const [ext, setExt] = useState({
    middleName: '',
    preferredLanguage: 'english',
    isDeceasedReturn: false,
    deceasedDate: '',
    wasResidentAllYear: true,
    movedProvinces: false,
    moveDate: '',
    homeAddressSameAsMailing: true,
    hasNonCanadianMailingAddress: false,
    currentProvince: profile.province,
    firstTimeFiling: false,
    isCanadianCitizen: true,
    electionsCanada: false,
    isRegisteredIndianAct: false,
    hasForeignPropertyOver100K: false,
    disposedPrincipalResidence: false,
    flippedProperty: false,
    openedFirstFHSA: false,
    wasInPrison: false,
    livesOutsideCMA: false,
    organDonation: false,
    applyTrillium: true,
    craOnlineMail: 'already_signed_up',
    netfileCode: '',
    maritalStatusChanged: false,
    hasDependants: false,
    filingForSpouse: false,
    // Spouse tax situations
    spouseHasDisability: false,
    cannotClaimSpouseAmount: false,
    livedTogetherAllYear: true,
    livedTogetherDec31: true,
    supportedWhileApart: true,
    spouseWasNonResident: false,
    liveSeparateForMedical: false,
    transferSpouseAmounts: true,
    // Trillium details
    trilliumClaimant: 'me',
    applyEnergyPropertyCredit: true,
    applyNorthernCredit: false,
    rentPaid: 0,
    propertyTaxPaid: 0,
    reserveEnergyCosts: 0,
    longTermCareAmount: 0,
    isStudentResidence: false,
    receiveTrilliumJune: false,
    residenceMonths: 12,
    landlordName: ''
  });

  const handleChange = (field: keyof Profile, value: unknown) => {
    dispatch({ type: 'UPDATE_PROFILE', payload: { [field]: value } as Partial<Profile> });
  };

  const handleExt = (field: keyof typeof ext, value: string | number | boolean) => {
    setExt(prev => ({ ...prev, [field]: value }));
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

  return (
    <div style={{ paddingBottom: '80px' }}>
      {/* About You Section */}
      <Section title="About you" subtitle="To get started, we'll need some basic information from you.">
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '16px',
          marginBottom: '16px'
        }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#6B7280', marginBottom: '6px' }}>
              First name<span style={{ color: '#DC2626' }}>*</span>
            </label>
            <input
              type="text"
              value={profile.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                border: '1px solid #E5E7EB',
                borderRadius: '6px',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#6B7280', marginBottom: '6px' }}>
              Middle name
            </label>
            <input
              type="text"
              value={ext.middleName}
              onChange={(e) => handleExt('middleName', e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                border: '1px solid #E5E7EB',
                borderRadius: '6px',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#6B7280', marginBottom: '6px' }}>
              Last name<span style={{ color: '#DC2626' }}>*</span>
            </label>
            <input
              type="text"
              value={profile.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                border: '1px solid #E5E7EB',
                borderRadius: '6px',
                boxSizing: 'border-box'
              }}
            />
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
              Social insurance number<span style={{ color: '#DC2626' }}>*</span>
            </label>
            <input
              type="text"
              value={profile.sin}
              onChange={(e) => handleChange('sin', formatSIN(e.target.value))}
              placeholder="XXX-XXX-XXX"
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                border: '1px solid #E5E7EB',
                borderRadius: '6px',
                boxSizing: 'border-box'
              }}
            />
            <span style={{ fontSize: '12px', color: '#9CA3AF' }}>Required to auto-fill return.</span>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#6B7280', marginBottom: '6px' }}>
              Date of birth
            </label>
            <input
              type="date"
              value={profile.dateOfBirth}
              onChange={(e) => handleChange('dateOfBirth', e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                border: '1px solid #E5E7EB',
                borderRadius: '6px',
                boxSizing: 'border-box'
              }}
            />
            <span style={{ fontSize: '12px', color: '#9CA3AF' }}>YYYY-MM-DD</span>
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
              Preferred language<span style={{ color: '#DC2626' }}>*</span>
            </label>
            <select
              value={ext.preferredLanguage}
              onChange={(e) => handleExt('preferredLanguage', e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                border: '1px solid #E5E7EB',
                borderRadius: '6px',
                backgroundColor: 'white'
              }}
            >
              <option value="english">English</option>
              <option value="french">Français</option>
            </select>
          </div>
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

        <InfoRow label="Is this return for a deceased person?">
          <ToggleSwitchCompact
            value={ext.isDeceasedReturn}
            onChange={(v) => handleExt('isDeceasedReturn', v)}
          />
        </InfoRow>
      </Section>

      {/* Auto-fill & add forms */}
      <Section title="Auto-fill & add forms" subtitle="File faster by automatically importing information to your return and add any remaining forms you need.">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '20px',
          color: '#6B7280',
          fontSize: '14px',
          cursor: 'pointer'
        }}>
          <span style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: '#F3F4F6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>▶</span>
          How to auto-fill your tax return
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px'
        }}>
          <div style={{
            padding: '20px',
            backgroundColor: '#F9FAFB',
            borderRadius: '8px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>Import forms from the CRA</h3>
            <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '16px' }}>
              Begin your tax filing by connecting to your CRA My Account. This will automatically add and fill in your T-slips and other tax information.
            </p>
            <button
              type="button"
              onClick={() => {
                const url = 'https://www.canada.ca/en/revenue-agency/services/e-services/e-services-individuals/account-individuals.html';
                const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
                if (!newWindow || newWindow.closed) {
                  // Popup was blocked, redirect in same tab
                  window.location.href = url;
                }
              }}
              aria-label="Connect to CRA My Account to import tax slips"
              style={{
                padding: '10px 20px',
                border: '1px solid #D1D5DB',
                borderRadius: '20px',
                backgroundColor: 'white',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Connect to CRA
            </button>
          </div>
          <div style={{
            padding: '20px',
            backgroundColor: '#F9FAFB',
            borderRadius: '8px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
              Tax form guide <span style={{ backgroundColor: '#E5E7EB', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>New</span>
            </h3>
            <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '16px' }}>
              We'll help you find every form, credit, and deduction specific to your situation.
            </p>
            <button
              onClick={() => navigate(`/return/${taxYear}/income`)}
              style={{
                padding: '10px 20px',
                border: '1px solid #D1D5DB',
                borderRadius: '20px',
                backgroundColor: 'white',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              Add forms →
            </button>
          </div>
        </div>
      </Section>

      {/* Personal Information */}
      <Section title="Personal information" subtitle="Let's get back to filling out your personal information.">
        {/* NETFILE Access Code */}
        <div style={{
          padding: '20px',
          backgroundColor: '#F9FAFB',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>NETFILE Access Code</h3>
          <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '12px' }}>
            For the {year} tax year, prior to filing your tax return electronically, you will be asked to enter an Access code. This code does not apply to you if you are filing your tax return for the first time.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '13px', color: '#6B7280' }}>NETFILE Access Code</span>
            <input
              type="text"
              value={ext.netfileCode}
              onChange={(e) => handleExt('netfileCode', e.target.value.toUpperCase())}
              placeholder="Enter code"
              style={{
                padding: '8px 12px',
                fontSize: '14px',
                border: '1px solid #E5E7EB',
                borderRadius: '6px',
                width: '120px'
              }}
            />
            <a href="https://www.canada.ca/en/revenue-agency/services/e-services/e-services-individuals/netfile-overview.html" target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'underline' }}>Learn more</a>
          </div>
        </div>

        {/* Mailing Address */}
        <div style={{
          padding: '20px',
          backgroundColor: '#F9FAFB',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Mailing Address</h3>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: '#6B7280', marginBottom: '6px' }}>C/O (Care of)</label>
            <input type="text" style={{ width: '200px', padding: '8px 12px', fontSize: '14px', border: '1px solid #E5E7EB', borderRadius: '6px' }} />
          </div>

          {/* Canada Post AddressComplete Integration */}
          <AddressInput
            label="Start typing your address"
            required
            value={{
              street: profile.address || '',
              unit: undefined,
              city: profile.city || '',
              province: profile.province || 'ON',
              postalCode: profile.postalCode || ''
            }}
            onChange={(address) => {
              handleChange('address', address.street);
              handleChange('city', address.city);
              handleChange('province', address.province as ProvinceCode);
              handleChange('postalCode', address.postalCode);
            }}
          />

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: '#6B7280', marginBottom: '6px' }}>Home telephone number</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input type="text" placeholder="Area" style={{ width: '60px', padding: '8px 12px', fontSize: '14px', border: '1px solid #E5E7EB', borderRadius: '6px' }} />
              <input
                type="text"
                value={profile.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                style={{ width: '150px', padding: '8px 12px', fontSize: '14px', border: '1px solid #E5E7EB', borderRadius: '6px' }}
              />
            </div>
          </div>

          <InfoRow label="Do you have a non-Canadian mailing address?" hint="Select Yes if your mailing address is outside Canada">
            <ToggleSwitchCompact
              value={ext.hasNonCanadianMailingAddress}
              onChange={(v) => handleExt('hasNonCanadianMailingAddress', v)}
            />
          </InfoRow>
        </div>

        {/* About Your Residency */}
        <div style={{
          padding: '20px',
          backgroundColor: '#F9FAFB',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>About Your Residency</h3>

          <InfoRow label={`Were you a Canadian resident for all of ${year}?`} hint="You are a resident if Canada was your home" required>
            <ToggleSwitchCompact
              value={ext.wasResidentAllYear}
              onChange={(v) => handleExt('wasResidentAllYear', v)}
            />
          </InfoRow>
        </div>

        {/* About Your Province or Territory */}
        <div style={{
          padding: '20px',
          backgroundColor: '#F9FAFB',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>About Your Province or Territory</h3>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', color: '#374151', marginBottom: '8px' }}>
              In which <u>province or territory did you live</u> on December 31, {year}?<span style={{ color: '#DC2626' }}>*</span>
            </label>
            <select
              value={profile.province}
              onChange={(e) => handleChange('province', e.target.value as ProvinceCode)}
              disabled
              style={{ padding: '10px 14px', fontSize: '14px', border: '1px solid #E5E7EB', borderRadius: '6px', backgroundColor: '#F3F4F6', color: '#6B7280' }}
            >
              {provinceOptions.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
            <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>This question reflects the selection made in the About you section above.</p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', color: '#374151', marginBottom: '8px' }}>
              If your province or territory of residence changed in {year}, enter the date of your move
            </label>
            <input
              type="date"
              value={ext.moveDate}
              onChange={(e) => handleExt('moveDate', e.target.value)}
              style={{ padding: '10px 14px', fontSize: '14px', border: '1px solid #E5E7EB', borderRadius: '6px' }}
            />
          </div>

          <InfoRow label="Is your home address the same as your mailing address?">
            <ToggleSwitchCompact
              value={ext.homeAddressSameAsMailing}
              onChange={(v) => handleExt('homeAddressSameAsMailing', v)}
            />
          </InfoRow>

          <div style={{ marginTop: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', color: '#374151', marginBottom: '8px' }}>
              In which province or territory do you currently live?
            </label>
            <select
              value={ext.currentProvince}
              onChange={(e) => handleExt('currentProvince', e.target.value)}
              style={{ padding: '10px 14px', fontSize: '14px', border: '1px solid #E5E7EB', borderRadius: '6px', backgroundColor: 'white' }}
            >
              {provinceOptions.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
        </div>

        {/* You and Your Family */}
        <div style={{
          padding: '20px',
          backgroundColor: '#F9FAFB',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>You and Your Family</h3>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', color: '#374151', marginBottom: '8px' }}>
              Marital status on December 31, {year}<span style={{ color: '#DC2626' }}>*</span>
            </label>
            <select
              value={profile.maritalStatus}
              onChange={(e) => handleChange('maritalStatus', e.target.value)}
              style={{ padding: '10px 14px', fontSize: '14px', border: '1px solid #E5E7EB', borderRadius: '6px', backgroundColor: 'white' }}
            >
              <option value="single">Single</option>
              <option value="married">Married</option>
              <option value="common-law">Common-law</option>
              <option value="separated">Separated</option>
              <option value="divorced">Divorced</option>
              <option value="widowed">Widowed</option>
            </select>
          </div>

          {showSpouseSection && (
            <>
              <InfoRow label="Do you want to prepare your returns together?" hint="Filing together can optimize credits">
                <ToggleSwitchCompact
                  value={ext.filingForSpouse}
                  onChange={(v) => handleExt('filingForSpouse', v)}
                />
              </InfoRow>

              {ext.filingForSpouse && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', color: '#374151', marginBottom: '8px' }}>Your partner</label>
                  <input
                    type="text"
                    value={profile.spouse?.firstName || ''}
                    onChange={(e) => handleChange('spouse', { ...profile.spouse, firstName: e.target.value, filingTogether: true })}
                    placeholder="Partner's first name"
                    style={{ padding: '10px 14px', fontSize: '14px', border: '1px solid #E5E7EB', borderRadius: '6px' }}
                  />
                </div>
              )}
            </>
          )}

          <InfoRow label={`Did your marital status change in ${year}?`} required>
            <ToggleSwitchCompact
              value={ext.maritalStatusChanged}
              onChange={(v) => handleExt('maritalStatusChanged', v)}
            />
          </InfoRow>

          <InfoRow label="Do you have any dependants?" hint="Children, elderly parents, or disabled relatives you support">
            <ToggleSwitchCompact
              value={ext.hasDependants}
              onChange={(v) => handleExt('hasDependants', v)}
            />
          </InfoRow>
        </div>

        {/* Other stuff we have to ask */}
        <div style={{
          padding: '20px',
          backgroundColor: '#F9FAFB',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>Other stuff we have to ask</h3>
          <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '16px', fontWeight: 500 }}>General questions</p>

          <InfoRow label="Are you filing an income tax return with the CRA for the first time?" hint="First time filing in Canada">
            <ToggleSwitchCompact
              value={ext.firstTimeFiling}
              onChange={(v) => handleExt('firstTimeFiling', v)}
            />
          </InfoRow>

          <InfoRow label="Are you a Canadian citizen?">
            <ToggleSwitchCompact
              value={ext.isCanadianCitizen}
              onChange={(v) => handleExt('isCanadianCitizen', v)}
            />
          </InfoRow>

          {ext.isCanadianCitizen && (
            <ToggleQuestion
              question="As a Canadian citizen, do you authorize the Canada Revenue Agency to give your name, address, date of birth, and citizenship to Elections Canada to update the National Register of Electors or, if you are aged 14 to 17, to update the Register of Future Electors?"
              description="Your information is protected under the Canada Elections Act"
              value={ext.electionsCanada}
              onChange={(v) => handleExt('electionsCanada', v)}
            />
          )}

          <InfoRow label="Are you a person registered under the Indian Act?" hint="This affects tax exemptions on reserve income">
            <ToggleSwitchCompact
              value={ext.isRegisteredIndianAct}
              onChange={(v) => handleExt('isRegisteredIndianAct', v)}
            />
          </InfoRow>

          <h4 style={{ fontSize: '14px', fontWeight: 500, color: '#374151', margin: '20px 0 12px' }}>Property and things you may have invested in</h4>

          <ToggleQuestion
            question={`Did you own or hold specified foreign property where the total cost amount of all such property, at any time in the year, was more than CAN$100,000 in ${year}?`}
            description="Includes foreign bank accounts, shares, and real estate"
            value={ext.hasForeignPropertyOver100K}
            onChange={(v) => handleExt('hasForeignPropertyOver100K', v)}
          />

          <InfoRow label={`Did you dispose of your principal residence in ${year}?`} hint="Selling or transferring your main home">
            <ToggleSwitchCompact
              value={ext.disposedPrincipalResidence}
              onChange={(v) => handleExt('disposedPrincipalResidence', v)}
            />
          </InfoRow>

          <InfoRow label={`Did you flip a property in ${year}?`} hint="Buying and selling a property within 12 months">
            <ToggleSwitchCompact
              value={ext.flippedProperty}
              onChange={(v) => handleExt('flippedProperty', v)}
            />
          </InfoRow>

          <InfoRow
            label={`Did you open your first First Home Savings Account (FHSA) in ${year}, or become a successor holder in ${year} and did not open another FHSA of your own in ${year - 1} or ${year}?`}
            hint="FHSA helps first-time home buyers save"
          >
            <ToggleSwitchCompact
              value={ext.openedFirstFHSA}
              onChange={(v) => handleExt('openedFirstFHSA', v)}
            />
          </InfoRow>

          <h4 style={{ fontSize: '14px', fontWeight: 500, color: '#374151', margin: '20px 0 12px' }}>We have to ask because it affects some calculations</h4>

          <InfoRow label={`Were you confined to a prison for a period of 90 days or more in ${year}?`} hint="Affects eligibility for certain credits">
            <ToggleSwitchCompact
              value={ext.wasInPrison}
              onChange={(v) => handleExt('wasInPrison', v)}
            />
          </InfoRow>
        </div>

        {/* Canada Carbon Rebate */}
        <div style={{
          padding: '20px',
          backgroundColor: '#F9FAFB',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Canada Carbon Rebate</h3>

          <InfoRow
            label={`Do you live outside of a census metropolitan area (CMA) or within a rural area or small population centre of the same CMA and expect to continue to do so on April 1, ${year + 1}?`}
            hint="Rural residents get a 20% supplement"
            required
          >
            <ToggleSwitchCompact
              value={ext.livesOutsideCMA}
              onChange={(v) => handleExt('livesOutsideCMA', v)}
            />
          </InfoRow>
        </div>

        {/* Organ and tissue donor registry (Ontario only) */}
        {isOntario && (
          <div style={{
            padding: '20px',
            backgroundColor: '#F9FAFB',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>Organ and tissue donor registry</h3>
            <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '16px' }}>
              I authorize the CRA to provide my name and email address Ontario Health so that Ontario Health (Trillium Gift of Life) may contact or send information to me by email about organ and tissue donation.
            </p>
            <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '16px' }}>
              <strong>Note:</strong> You are <strong>not</strong> consenting to organ and tissue donation when you authorize the CRA to share your contact information with Ontario Health. Your authorization is valid <strong>only</strong> in the tax year that you file this tax return. Your information will only be collected under the Ontario Gift of Life Act.
            </p>

            <InfoRow label="Do you consent to share your contact information?" required>
              <ToggleSwitchCompact
                value={ext.organDonation}
                onChange={(v) => handleExt('organDonation', v)}
              />
            </InfoRow>
          </div>
        )}

        {/* Ontario Trillium Benefit */}
        {isOntario && (
          <div style={{
            padding: '20px',
            backgroundColor: '#F9FAFB',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Ontario Trillium Benefit</h3>

            <InfoRow label={`Will you${ext.filingForSpouse ? ` or ${profile.spouse?.firstName || 'your partner'}` : ''} apply for the Ontario Trillium Benefit?`} hint="Combines several Ontario credits">
              <ToggleSwitchCompact
                value={ext.applyTrillium}
                onChange={(v) => handleExt('applyTrillium', v)}
              />
            </InfoRow>
          </div>
        )}

        {/* CRA My Account */}
        <div style={{
          padding: '20px',
          backgroundColor: '#F9FAFB',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>CRA My Account</h3>
          <p style={{ fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '12px' }}>Online mail</p>

          <div>
            <label style={{ display: 'block', fontSize: '14px', color: '#374151', marginBottom: '8px' }}>
              Do you want to sign up for online mail to get your notice of assessment through CRA My Account?<span style={{ color: '#DC2626' }}>*</span>
            </label>
            <select
              value={ext.craOnlineMail}
              onChange={(e) => handleExt('craOnlineMail', e.target.value)}
              style={{ padding: '10px 14px', fontSize: '14px', border: '1px solid #E5E7EB', borderRadius: '6px', backgroundColor: 'white' }}
            >
              <option value="not_signed_up">No, I want paper mail</option>
              <option value="already_signed_up">I'm already signed up</option>
              <option value="sign_up">Yes, sign me up</option>
            </select>
          </div>
        </div>
      </Section>

      {/* Spouse Tax Situations (if filing together) */}
      {showSpouseSection && ext.filingForSpouse && (
        <Section title="Spouse or Common-Law Partner" dark>
          <div style={{ padding: '0' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 500, color: 'white', marginBottom: '16px' }}>Tax situations</h4>

            <InfoRow label={`Does ${profile.spouse?.firstName || 'your partner'} have an infirmity or disability?`}>
              <ToggleSwitchCompact
                value={ext.spouseHasDisability}
                onChange={(v) => handleExt('spouseHasDisability', v)}
              />
            </InfoRow>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid #374151' }}>
              <input
                type="checkbox"
                checked={ext.cannotClaimSpouseAmount}
                onChange={(e) => handleExt('cannotClaimSpouseAmount', e.target.checked)}
                style={{ width: '18px', height: '18px' }}
              />
              <span style={{ fontSize: '14px', color: '#D1D5DB' }}>
                Check here if you <strong>can't</strong> claim the <u>amount for partner</u> on line 30300
              </span>
            </div>

            <InfoRow label={`Did you live together for all of ${year}?`}>
              <ToggleSwitchCompact
                value={ext.livedTogetherAllYear}
                onChange={(v) => handleExt('livedTogetherAllYear', v)}
              />
            </InfoRow>

            <InfoRow label={`Did you live together on December 31, ${year}?`}>
              <ToggleSwitchCompact
                value={ext.livedTogetherDec31}
                onChange={(v) => handleExt('livedTogetherDec31', v)}
              />
            </InfoRow>

            <InfoRow label={`While living apart did you support (or were you being supported by) ${profile.spouse?.firstName || 'your partner'}?`}>
              <ToggleSwitchCompact
                value={ext.supportedWhileApart}
                onChange={(v) => handleExt('supportedWhileApart', v)}
              />
            </InfoRow>

            <InfoRow label={`Was ${profile.spouse?.firstName || 'your partner'} a non-resident on December 31, ${year}?`}>
              <ToggleSwitchCompact
                value={ext.spouseWasNonResident}
                onChange={(v) => handleExt('spouseWasNonResident', v)}
              />
            </InfoRow>

            <InfoRow label="Did you live in separate principal residences for medical reasons?">
              <ToggleSwitchCompact
                value={ext.liveSeparateForMedical}
                onChange={(v) => handleExt('liveSeparateForMedical', v)}
              />
            </InfoRow>

            <h4 style={{ fontSize: '14px', fontWeight: 500, color: 'white', margin: '20px 0 12px' }}>Amounts transferred from your partner</h4>
            <p style={{ fontSize: '13px', color: '#9CA3AF', marginBottom: '12px' }}>
              We'll automatically transfer {profile.spouse?.firstName || 'your partner'}'s eligible <u>unused amounts</u> to line 32600 of your tax return.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0' }}>
              <input
                type="checkbox"
                checked={!ext.transferSpouseAmounts}
                onChange={(e) => handleExt('transferSpouseAmounts', !e.target.checked)}
                style={{ width: '18px', height: '18px' }}
              />
              <span style={{ fontSize: '14px', color: '#D1D5DB' }}>
                Check here if you <strong>don't</strong> want to transfer these amounts
              </span>
            </div>
          </div>
        </Section>
      )}

      {/* Ontario Trillium Benefit Details */}
      {isOntario && ext.applyTrillium && (
        <Section title="Ontario Trillium Benefit: Property and Energy Tax Grants and Credits" dark>
          {ext.filingForSpouse && (
            <div style={{
              padding: '12px 16px',
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: '8px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '16px' }}>👥</span>
              <span style={{ fontSize: '13px', color: '#D1D5DB' }}>
                This section is shared with {profile.spouse?.firstName}. Unless you are living separately for medical purposes, only one of you may claim the Trillium Benefit.
              </span>
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', color: '#D1D5DB', marginBottom: '8px' }}>Who will claim this credit?</label>
            <select
              value={ext.trilliumClaimant}
              onChange={(e) => handleExt('trilliumClaimant', e.target.value)}
              style={{ padding: '10px 14px', fontSize: '14px', border: '1px solid #4B5563', borderRadius: '6px', backgroundColor: '#374151', color: 'white' }}
            >
              <option value="me">Me</option>
              {ext.filingForSpouse && <option value="spouse">{profile.spouse?.firstName || 'My partner'}</option>}
            </select>
          </div>

          <p style={{ fontSize: '14px', fontWeight: 500, color: 'white', marginBottom: '12px' }}>Apply for the:</p>

          <InfoRow label="Ontario energy and property tax credit">
            <ToggleSwitchCompact
              value={ext.applyEnergyPropertyCredit}
              onChange={(v) => handleExt('applyEnergyPropertyCredit', v)}
            />
          </InfoRow>

          <InfoRow label="Northern Ontario energy credit" hint="Only if you lived in Northern Ontario">
            <ToggleSwitchCompact
              value={ext.applyNorthernCredit}
              onChange={(v) => handleExt('applyNorthernCredit', v)}
            />
          </InfoRow>

          <h4 style={{ fontSize: '14px', fontWeight: 500, color: 'white', margin: '20px 0 12px' }}>Part A – Amount paid for a principal residence for {year}</h4>
          <p style={{ fontSize: '13px', color: '#9CA3AF', marginBottom: '16px' }}>If you don't have any of the following amounts please remove this section from your return.</p>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', color: '#D1D5DB', marginBottom: '8px' }}>
              Total <u>rent</u> paid for your <u>principal residence</u>
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#9CA3AF' }}>$</span>
              <input
                type="number"
                value={ext.rentPaid || ''}
                onChange={(e) => handleExt('rentPaid', parseFloat(e.target.value) || 0)}
                style={{ width: '150px', padding: '10px 14px', fontSize: '14px', border: '1px solid #4B5563', borderRadius: '6px', backgroundColor: '#374151', color: 'white' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', color: '#D1D5DB', marginBottom: '8px' }}>
              Total <u>property tax</u> paid for your <u>principal residence</u>
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#9CA3AF' }}>$</span>
              <input
                type="number"
                value={ext.propertyTaxPaid || ''}
                onChange={(e) => handleExt('propertyTaxPaid', parseFloat(e.target.value) || 0)}
                style={{ width: '150px', padding: '10px 14px', fontSize: '14px', border: '1px solid #4B5563', borderRadius: '6px', backgroundColor: '#374151', color: 'white' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', color: '#D1D5DB', marginBottom: '8px' }}>
              If your <u>principal residence</u> is <strong>on a reserve</strong>, enter your <u>home energy costs</u> paid
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#9CA3AF' }}>$</span>
              <input
                type="number"
                value={ext.reserveEnergyCosts || ''}
                onChange={(e) => handleExt('reserveEnergyCosts', parseFloat(e.target.value) || 0)}
                style={{ width: '150px', padding: '10px 14px', fontSize: '14px', border: '1px solid #4B5563', borderRadius: '6px', backgroundColor: '#374151', color: 'white' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', color: '#D1D5DB', marginBottom: '8px' }}>
              Amount paid for accommodation in a <u>public or not-for-profit long-term care home</u>
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#9CA3AF' }}>$</span>
              <input
                type="number"
                value={ext.longTermCareAmount || ''}
                onChange={(e) => handleExt('longTermCareAmount', parseFloat(e.target.value) || 0)}
                style={{ width: '150px', padding: '10px 14px', fontSize: '14px', border: '1px solid #4B5563', borderRadius: '6px', backgroundColor: '#374151', color: 'white' }}
              />
            </div>
          </div>

          <InfoRow label="Did you reside in a student residence?">
            <ToggleSwitchCompact
              value={ext.isStudentResidence}
              onChange={(v) => handleExt('isStudentResidence', v)}
            />
          </InfoRow>

          <InfoRow label={`Would you like to receive your benefit in June ${year + 2} instead of receiving it monthly starting in July ${year + 1}?`}>
            <ToggleSwitchCompact
              value={ext.receiveTrilliumJune}
              onChange={(v) => handleExt('receiveTrilliumJune', v)}
            />
          </InfoRow>

          <h4 style={{ fontSize: '14px', fontWeight: 500, color: 'white', margin: '20px 0 12px' }}>Part B – Declaration of principal residence(s)</h4>

          <div style={{
            backgroundColor: '#374151',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '12px'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 80px 1fr 1fr', gap: '12px', fontSize: '12px', color: '#9CA3AF', marginBottom: '12px' }}>
              <span>Address</span>
              <span>Postal code</span>
              <span>Number of months resident in {year}</span>
              <span>Long-term care home</span>
              <span>Amount paid for {year} ?</span>
              <span>Landlord or municipality</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 80px 1fr 1fr', gap: '12px', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: 'white' }}>{profile.address}, {profile.city}</span>
              <span style={{ fontSize: '14px', color: 'white' }}>{profile.postalCode}</span>
              <input
                type="number"
                value={ext.residenceMonths}
                onChange={(e) => handleExt('residenceMonths', parseInt(e.target.value) || 0)}
                style={{ width: '60px', padding: '6px 8px', fontSize: '14px', border: '1px solid #4B5563', borderRadius: '4px', backgroundColor: '#1F2937', color: 'white' }}
              />
              <input type="checkbox" style={{ width: '18px', height: '18px' }} />
              <span style={{ fontSize: '14px', color: 'white' }}>${(ext.rentPaid + ext.propertyTaxPaid).toLocaleString()}</span>
              <input
                type="text"
                value={ext.landlordName}
                onChange={(e) => handleExt('landlordName', e.target.value)}
                placeholder="Name"
                style={{ padding: '6px 8px', fontSize: '14px', border: '1px solid #4B5563', borderRadius: '4px', backgroundColor: '#1F2937', color: 'white' }}
              />
            </div>
          </div>

          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 0',
            backgroundColor: 'transparent',
            border: 'none',
            color: '#9CA3AF',
            fontSize: '14px',
            cursor: 'pointer'
          }}>
            + Add another address
          </button>
        </Section>
      )}

      {/* Continue Button */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        marginTop: '32px'
      }}>
        <Button onClick={() => navigate(`/return/${taxYear}/income`)} size="lg">
          Continue to Income
        </Button>
      </div>
    </div>
  );
}
