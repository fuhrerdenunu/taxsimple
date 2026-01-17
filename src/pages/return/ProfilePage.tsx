import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTaxReturn } from '../../context/TaxReturnContext';
import { PROVINCES } from '../../domain/tax';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input, Select } from '../../components/ui/Input';
import { Alert } from '../../components/ui/Alert';

export function ProfilePage() {
  const navigate = useNavigate();
  const { taxYear } = useParams();
  const { state, dispatch } = useTaxReturn();
  const { profile } = state;

  const handleChange = (field: string, value: string) => {
    dispatch({ type: 'UPDATE_PROFILE', payload: { [field]: value } });
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

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px', color: '#1F2937' }}>
        Personal Information
      </h1>
      <p style={{ fontSize: '15px', color: '#6B7280', marginBottom: '32px' }}>
        Let's start with your basic information for your {taxYear} tax return.
      </p>

      {profile.province === 'QC' && (
        <div style={{ marginBottom: '24px' }}>
          <Alert type="info" title="Quebec Residents">
            Quebec residents file a separate provincial return (TP-1) with Revenu Quebec.
            We'll prepare your federal return, and remind you about the TP-1 at the end.
          </Alert>
        </div>
      )}

      <Card style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px', color: '#1F2937' }}>
          Basic Information
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Input
            label="First Name"
            value={profile.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            placeholder="John"
            required
          />
          <Input
            label="Last Name"
            value={profile.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            placeholder="Smith"
            required
          />
        </div>

        <Input
          label="Social Insurance Number (SIN)"
          value={profile.sin}
          onChange={handleSINChange}
          placeholder="XXX-XXX-XXX"
          hint="Your 9-digit SIN is required for tax filing"
          required
        />

        <Input
          label="Date of Birth"
          type="date"
          value={profile.dateOfBirth}
          onChange={(e) => handleChange('dateOfBirth', e.target.value)}
          required
        />

        <Select
          label="Marital Status (as of December 31, {taxYear})"
          value={profile.maritalStatus}
          onChange={(e) => handleChange('maritalStatus', e.target.value)}
          options={maritalOptions}
        />
      </Card>

      <Card style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px', color: '#1F2937' }}>
          Contact Information
        </h2>

        <Input
          label="Email"
          type="email"
          value={profile.email}
          onChange={(e) => handleChange('email', e.target.value)}
          placeholder="you@example.com"
        />

        <Input
          label="Phone Number"
          type="tel"
          value={profile.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          placeholder="(XXX) XXX-XXXX"
        />
      </Card>

      <Card style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px', color: '#1F2937' }}>
          Address (as of December 31, {taxYear})
        </h2>

        <Input
          label="Street Address"
          value={profile.address}
          onChange={(e) => handleChange('address', e.target.value)}
          placeholder="123 Main Street"
        />

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
          <Input
            label="City"
            value={profile.city}
            onChange={(e) => handleChange('city', e.target.value)}
            placeholder="Toronto"
          />
          <Select
            label="Province/Territory"
            value={profile.province}
            onChange={(e) => handleChange('province', e.target.value)}
            options={provinceOptions}
          />
        </div>

        <Input
          label="Postal Code"
          value={profile.postalCode}
          onChange={(e) => handleChange('postalCode', e.target.value.toUpperCase())}
          placeholder="A1A 1A1"
          style={{ maxWidth: '200px' }}
        />
      </Card>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={handleContinue}>
          Continue to Income
        </Button>
      </div>
    </div>
  );
}
