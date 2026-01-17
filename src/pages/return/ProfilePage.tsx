import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTaxReturn, Profile } from '../../context/TaxReturnContext';
import { PROVINCES } from '../../domain/tax';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input, Select } from '../../components/ui/Input';
import { Alert } from '../../components/ui/Alert';

// Checkbox component
function Checkbox({
  label,
  checked,
  onChange,
  hint
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  hint?: string;
}) {
  return (
    <label style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      cursor: 'pointer',
      padding: '12px',
      borderRadius: '8px',
      backgroundColor: checked ? '#F0FDF4' : 'transparent',
      border: `1px solid ${checked ? '#BBF7D0' : '#E5E7EB'}`,
      transition: 'all 0.2s'
    }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{
          width: '20px',
          height: '20px',
          marginTop: '2px',
          accentColor: '#0D5F2B'
        }}
      />
      <div>
        <span style={{ fontSize: '15px', fontWeight: 500, color: '#1F2937' }}>
          {label}
        </span>
        {hint && (
          <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px', marginBottom: 0 }}>
            {hint}
          </p>
        )}
      </div>
    </label>
  );
}

// Yes/No Radio component
function YesNoRadio({
  label,
  value,
  onChange,
  hint,
  name
}: {
  label: string;
  value: boolean | undefined;
  onChange: (val: boolean) => void;
  hint?: string;
  name: string;
}) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <p style={{ fontSize: '15px', fontWeight: 500, color: '#1F2937', marginBottom: '8px' }}>
        {label}
      </p>
      {hint && (
        <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '12px' }}>
          {hint}
        </p>
      )}
      <div style={{ display: 'flex', gap: '16px' }}>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 20px',
          borderRadius: '8px',
          border: `2px solid ${value === true ? '#0D5F2B' : '#E5E7EB'}`,
          backgroundColor: value === true ? '#F0FDF4' : 'white',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}>
          <input
            type="radio"
            name={name}
            checked={value === true}
            onChange={() => onChange(true)}
            style={{ accentColor: '#0D5F2B' }}
          />
          <span style={{ fontWeight: 500 }}>Yes</span>
        </label>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 20px',
          borderRadius: '8px',
          border: `2px solid ${value === false ? '#0D5F2B' : '#E5E7EB'}`,
          backgroundColor: value === false ? '#F0FDF4' : 'white',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}>
          <input
            type="radio"
            name={name}
            checked={value === false}
            onChange={() => onChange(false)}
            style={{ accentColor: '#0D5F2B' }}
          />
          <span style={{ fontWeight: 500 }}>No</span>
        </label>
      </div>
    </div>
  );
}

export function ProfilePage() {
  const navigate = useNavigate();
  const { taxYear } = useParams();
  const year = parseInt(taxYear || '2024', 10);
  const { state, dispatch } = useTaxReturn();
  const { profile } = state;

  // Extended profile state for additional questions
  const [extendedProfile, setExtendedProfile] = useState({
    livesOnReserve: false,
    movedProvinces: false,
    previousProvince: '',
    moveDate: '',
    isCanadianCitizen: true,
    immigrationDate: '',
    firstTimeFilingInCanada: false,
    canadaWorkersBenefit: false,
    climateActionIncentive: true,
    ontarioTrillium: false,
    electionsCanada: undefined as boolean | undefined,
    filingForSpouse: false,
    hasDependants: false
  });

  const handleChange = (field: keyof Profile, value: any) => {
    dispatch({ type: 'UPDATE_PROFILE', payload: { [field]: value } });
  };

  const handleExtendedChange = (field: string, value: any) => {
    setExtendedProfile(prev => ({ ...prev, [field]: value }));
  };

  const formatSIN = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 9);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  const handleSINChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatSIN(e.target.value);
    handleChange('sin', formatted);
  };

  const handleContinue = () => {
    navigate(`/return/${taxYear}/income`);
  };

  const provinceOptions = PROVINCES.map(p => ({ value: p.code, label: p.name }));

  const maritalOptions = [
    { value: 'single', label: 'Single' },
    { value: 'married', label: 'Married' },
    { value: 'common-law', label: 'Common-law' },
    { value: 'separated', label: 'Separated' },
    { value: 'divorced', label: 'Divorced' },
    { value: 'widowed', label: 'Widowed' }
  ];

  const residencyStatusOptions = [
    { value: 'citizen', label: 'Canadian citizen' },
    { value: 'permanent_resident', label: 'Permanent resident' },
    { value: 'protected_person', label: 'Protected person (refugee)' },
    { value: 'temporary_resident', label: 'Temporary resident (work/study permit)' },
    { value: 'non_resident', label: 'Non-resident' }
  ];

  const showSpouseSection = profile.maritalStatus === 'married' || profile.maritalStatus === 'common-law';
  const showOntarioBenefits = profile.province === 'ON';

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px', color: '#1F2937' }}>
        Personal Information
      </h1>
      <p style={{ fontSize: '15px', color: '#6B7280', marginBottom: '32px' }}>
        Let's start with your basic information for your {year} tax return.
      </p>

      {/* Quebec Alert */}
      {profile.province === 'QC' && (
        <div style={{ marginBottom: '24px' }}>
          <Alert type="info" title="Quebec Residents">
            Quebec residents file a separate provincial return (TP-1) with Revenu Quebec.
            We'll prepare your federal return, and remind you about the TP-1 at the end.
          </Alert>
        </div>
      )}

      {/* Basic Information */}
      <Card style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px', color: '#1F2937' }}>
          Basic Information
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Input
            label="Legal First Name"
            value={profile.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            placeholder="As it appears on your SIN card"
            required
          />
          <Input
            label="Legal Last Name"
            value={profile.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            placeholder="As it appears on your SIN card"
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Input
            label="Social Insurance Number (SIN)"
            value={profile.sin}
            onChange={handleSINChange}
            placeholder="XXX-XXX-XXX"
            hint="Required for all tax filers"
            required
          />
          <Input
            label="Date of Birth"
            type="date"
            value={profile.dateOfBirth}
            onChange={(e) => handleChange('dateOfBirth', e.target.value)}
            required
          />
        </div>
      </Card>

      {/* Residency Status */}
      <Card style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px', color: '#1F2937' }}>
          Residency Status
        </h2>

        <Select
          label={`Province or territory of residence on December 31, ${year}`}
          value={profile.province}
          onChange={(e) => handleChange('province', e.target.value)}
          options={provinceOptions}
          hint="This determines your provincial tax rates and credits"
        />

        <YesNoRadio
          name="movedProvinces"
          label={`Did you move to a different province or territory in ${year}?`}
          value={extendedProfile.movedProvinces}
          onChange={(val) => handleExtendedChange('movedProvinces', val)}
        />

        {extendedProfile.movedProvinces && (
          <div style={{
            padding: '16px',
            backgroundColor: '#F9FAFB',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Select
                label="Previous province/territory"
                value={extendedProfile.previousProvince}
                onChange={(e) => handleExtendedChange('previousProvince', e.target.value)}
                options={[{ value: '', label: 'Select...' }, ...provinceOptions]}
              />
              <Input
                label="Date of move"
                type="date"
                value={extendedProfile.moveDate}
                onChange={(e) => handleExtendedChange('moveDate', e.target.value)}
              />
            </div>
          </div>
        )}

        <YesNoRadio
          name="livesOnReserve"
          label="Did you live on a reserve at any time during the year?"
          value={extendedProfile.livesOnReserve}
          onChange={(val) => handleExtendedChange('livesOnReserve', val)}
          hint="Income earned on a reserve may be tax-exempt"
        />

        <Select
          label="What is your residency status in Canada?"
          value="citizen"
          onChange={() => {}}
          options={residencyStatusOptions}
        />

        <YesNoRadio
          name="firstTimeFiling"
          label="Is this your first time filing a Canadian tax return?"
          value={extendedProfile.firstTimeFilingInCanada}
          onChange={(val) => handleExtendedChange('firstTimeFilingInCanada', val)}
        />

        {extendedProfile.firstTimeFilingInCanada && (
          <Input
            label="Date you became a resident of Canada"
            type="date"
            value={extendedProfile.immigrationDate}
            onChange={(e) => handleExtendedChange('immigrationDate', e.target.value)}
          />
        )}
      </Card>

      {/* Marital Status */}
      <Card style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px', color: '#1F2937' }}>
          Marital Status
        </h2>

        <Select
          label={`Marital status on December 31, ${year}`}
          value={profile.maritalStatus}
          onChange={(e) => handleChange('maritalStatus', e.target.value)}
          options={maritalOptions}
        />

        {showSpouseSection && (
          <>
            <Alert type="info" style={{ marginBottom: '16px' }}>
              <strong>Couples Filing Together:</strong> You can prepare both returns together to optimize
              credit splitting and see your combined refund. Your spouse's information is kept separate but
              linked for credits like the spouse amount.
            </Alert>

            <YesNoRadio
              name="filingForSpouse"
              label="Would you like to prepare your spouse/partner's return as well?"
              value={extendedProfile.filingForSpouse}
              onChange={(val) => handleExtendedChange('filingForSpouse', val)}
              hint="We'll optimize credits between both returns automatically"
            />

            {extendedProfile.filingForSpouse && (
              <div style={{
                padding: '20px',
                backgroundColor: '#F9FAFB',
                borderRadius: '8px',
                marginTop: '16px'
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
                  Spouse/Partner Information
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <Input
                    label="Spouse's First Name"
                    value={profile.spouse?.firstName || ''}
                    onChange={(e) => handleChange('spouse', {
                      ...profile.spouse,
                      firstName: e.target.value,
                      filingTogether: true
                    })}
                    placeholder="Legal first name"
                  />
                  <Input
                    label="Spouse's Last Name"
                    value={profile.spouse?.lastName || ''}
                    onChange={(e) => handleChange('spouse', {
                      ...profile.spouse,
                      lastName: e.target.value
                    })}
                    placeholder="Legal last name"
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <Input
                    label="Spouse's SIN"
                    value={profile.spouse?.sin || ''}
                    onChange={(e) => handleChange('spouse', {
                      ...profile.spouse,
                      sin: formatSIN(e.target.value)
                    })}
                    placeholder="XXX-XXX-XXX"
                  />
                  <Input
                    label="Spouse's Date of Birth"
                    type="date"
                    value={profile.spouse?.dateOfBirth || ''}
                    onChange={(e) => handleChange('spouse', {
                      ...profile.spouse,
                      dateOfBirth: e.target.value
                    })}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Contact Information */}
      <Card style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px', color: '#1F2937' }}>
          Contact Information
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Input
            label="Email Address"
            type="email"
            value={profile.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="you@example.com"
            hint="For your CRA My Account and notices"
          />
          <Input
            label="Phone Number"
            type="tel"
            value={profile.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="(XXX) XXX-XXXX"
          />
        </div>
      </Card>

      {/* Mailing Address */}
      <Card style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px', color: '#1F2937' }}>
          Mailing Address
        </h2>

        <Input
          label="Street Address"
          value={profile.address}
          onChange={(e) => handleChange('address', e.target.value)}
          placeholder="123 Main Street, Apt 4"
        />

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px' }}>
          <Input
            label="City"
            value={profile.city}
            onChange={(e) => handleChange('city', e.target.value)}
            placeholder="Toronto"
          />
          <Select
            label="Province"
            value={profile.province}
            onChange={(e) => handleChange('province', e.target.value)}
            options={provinceOptions}
          />
          <Input
            label="Postal Code"
            value={profile.postalCode}
            onChange={(e) => handleChange('postalCode', e.target.value.toUpperCase())}
            placeholder="A1A 1A1"
          />
        </div>
      </Card>

      {/* Benefits & Credits */}
      <Card style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px', color: '#1F2937' }}>
          Benefits & Credits
        </h2>
        <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '20px' }}>
          Select the benefits you'd like to apply for with your tax return.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Checkbox
            label="Climate Action Incentive Payment"
            checked={extendedProfile.climateActionIncentive}
            onChange={(val) => handleExtendedChange('climateActionIncentive', val)}
            hint="Quarterly payments to help offset carbon pricing costs. Available to residents of AB, SK, MB, ON, NB, NS, PE, NL."
          />

          <Checkbox
            label="Canada Workers Benefit (CWB)"
            checked={extendedProfile.canadaWorkersBenefit}
            onChange={(val) => handleExtendedChange('canadaWorkersBenefit', val)}
            hint="A refundable tax credit for low-income workers earning between $3,000 and ~$33,000."
          />

          {showOntarioBenefits && (
            <Checkbox
              label="Ontario Trillium Benefit"
              checked={extendedProfile.ontarioTrillium}
              onChange={(val) => handleExtendedChange('ontarioTrillium', val)}
              hint="Combines Ontario Energy and Property Tax Credit, Northern Ontario Energy Credit, and Ontario Sales Tax Credit."
            />
          )}

          <Checkbox
            label="I have dependants I'd like to claim"
            checked={extendedProfile.hasDependants}
            onChange={(val) => handleExtendedChange('hasDependants', val)}
            hint="Children under 18, disabled dependants, or eligible dependants you support."
          />
        </div>
      </Card>

      {/* Elections Canada */}
      <Card style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px', color: '#1F2937' }}>
          Elections Canada
        </h2>
        <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '20px' }}>
          The CRA shares your information with Elections Canada to maintain the National Register of Electors.
        </p>

        <YesNoRadio
          name="electionsCanada"
          label="Do you authorize the CRA to provide your name, address, and date of birth to Elections Canada?"
          value={extendedProfile.electionsCanada}
          onChange={(val) => handleExtendedChange('electionsCanada', val)}
          hint="This helps keep the voter registry up to date. Your information is protected under the Canada Elections Act."
        />
      </Card>

      {/* Navigation */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        paddingBottom: '80px' // Space for mobile refund bar
      }}>
        <Button onClick={handleContinue} size="lg">
          Continue to Income
        </Button>
      </div>
    </div>
  );
}
