import React from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Card } from '../components/ui/Card';

export function PrivacyPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F9FAFB' }}>
      <Header />

      <main style={{ flex: 1, padding: '48px 24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#1F2937', marginBottom: '8px' }}>
            Privacy Policy
          </h1>
          <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '32px' }}>
            Last updated: January 17, 2026
          </p>

          <Card style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#1F2937', marginBottom: '16px' }}>
              1. Information We Collect
            </h2>
            <p style={{ color: '#4B5563', lineHeight: 1.7, marginBottom: '12px' }}>
              TaxSimple collects information necessary to prepare your Canadian tax return, including:
            </p>
            <ul style={{ color: '#4B5563', lineHeight: 1.7, marginLeft: '24px', marginBottom: '12px' }}>
              <li>Personal identification information (name, address, date of birth, SIN)</li>
              <li>Income information from T4, T4A, T5, and other tax slips</li>
              <li>Deduction and credit information</li>
              <li>Email address for account authentication</li>
            </ul>
          </Card>

          <Card style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#1F2937', marginBottom: '16px' }}>
              2. How We Store Your Data
            </h2>
            <p style={{ color: '#4B5563', lineHeight: 1.7, marginBottom: '12px' }}>
              Your tax information is stored locally in your browser using encrypted storage (AES-256 encryption).
              This means:
            </p>
            <ul style={{ color: '#4B5563', lineHeight: 1.7, marginLeft: '24px', marginBottom: '12px' }}>
              <li>Your data never leaves your device unless you explicitly export it</li>
              <li>We do not have access to your tax information on our servers</li>
              <li>Clearing your browser data will remove your stored information</li>
              <li>Your data is encrypted at rest using industry-standard encryption</li>
            </ul>
          </Card>

          <Card style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#1F2937', marginBottom: '16px' }}>
              3. How We Use Your Information
            </h2>
            <p style={{ color: '#4B5563', lineHeight: 1.7, marginBottom: '12px' }}>
              We use your information solely to:
            </p>
            <ul style={{ color: '#4B5563', lineHeight: 1.7, marginLeft: '24px', marginBottom: '12px' }}>
              <li>Calculate your federal and provincial taxes</li>
              <li>Generate tax summaries and export documents</li>
              <li>Provide personalized tax optimization suggestions</li>
              <li>Authenticate your account</li>
            </ul>
            <p style={{ color: '#4B5563', lineHeight: 1.7 }}>
              We do not sell, rent, or share your personal information with third parties.
            </p>
          </Card>

          <Card style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#1F2937', marginBottom: '16px' }}>
              4. Social Insurance Number (SIN) Protection
            </h2>
            <p style={{ color: '#4B5563', lineHeight: 1.7, marginBottom: '12px' }}>
              We take special care to protect your SIN:
            </p>
            <ul style={{ color: '#4B5563', lineHeight: 1.7, marginLeft: '24px', marginBottom: '12px' }}>
              <li>Your SIN is encrypted when stored</li>
              <li>SIN is displayed in masked format (***-***-XXX) wherever possible</li>
              <li>SIN is never transmitted to our servers</li>
              <li>PDF exports mask your SIN by default</li>
            </ul>
          </Card>

          <Card style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#1F2937', marginBottom: '16px' }}>
              5. Your Rights
            </h2>
            <p style={{ color: '#4B5563', lineHeight: 1.7, marginBottom: '12px' }}>
              You have the right to:
            </p>
            <ul style={{ color: '#4B5563', lineHeight: 1.7, marginLeft: '24px', marginBottom: '12px' }}>
              <li>Access all data stored about you</li>
              <li>Export your data at any time</li>
              <li>Delete your data by clearing your browser storage</li>
              <li>Request information about our data practices</li>
            </ul>
          </Card>

          <Card style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#1F2937', marginBottom: '16px' }}>
              6. Cookies and Analytics
            </h2>
            <p style={{ color: '#4B5563', lineHeight: 1.7 }}>
              TaxSimple uses minimal cookies necessary for authentication. We do not use
              third-party tracking or analytics services. We do not serve advertisements.
            </p>
          </Card>

          <Card>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#1F2937', marginBottom: '16px' }}>
              7. Contact Us
            </h2>
            <p style={{ color: '#4B5563', lineHeight: 1.7 }}>
              If you have questions about this Privacy Policy, please contact us at{' '}
              <a href="mailto:privacy@taxsimple.ca" style={{ color: '#0D5F2B' }}>
                privacy@taxsimple.ca
              </a>
            </p>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
