import React from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Card } from '../components/ui/Card';

export function TermsPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F9FAFB' }}>
      <Header />

      <main style={{ flex: 1, padding: '48px 24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#1F2937', marginBottom: '8px' }}>
            Terms of Service
          </h1>
          <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '32px' }}>
            Last updated: January 17, 2026
          </p>

          <Card style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#1F2937', marginBottom: '16px' }}>
              1. Acceptance of Terms
            </h2>
            <p style={{ color: '#4B5563', lineHeight: 1.7 }}>
              By accessing and using TaxSimple, you agree to be bound by these Terms of Service.
              If you do not agree to these terms, please do not use our service.
            </p>
          </Card>

          <Card style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#1F2937', marginBottom: '16px' }}>
              2. Service Description
            </h2>
            <p style={{ color: '#4B5563', lineHeight: 1.7, marginBottom: '12px' }}>
              TaxSimple is a tax preparation tool that helps Canadian residents calculate their
              federal and provincial taxes. Our service:
            </p>
            <ul style={{ color: '#4B5563', lineHeight: 1.7, marginLeft: '24px', marginBottom: '12px' }}>
              <li>Provides tax calculation estimates based on information you provide</li>
              <li>Generates summaries and export documents for your records</li>
              <li>Supports all 13 Canadian provinces and territories</li>
            </ul>
            <p style={{ color: '#4B5563', lineHeight: 1.7, fontWeight: 500 }}>
              TaxSimple is not a NETFILE-certified service. You must file your return with the
              CRA using certified software or other approved methods.
            </p>
          </Card>

          <Card style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#1F2937', marginBottom: '16px' }}>
              3. Not Tax Advice
            </h2>
            <p style={{ color: '#4B5563', lineHeight: 1.7, marginBottom: '12px' }}>
              TaxSimple provides tax calculation tools, not professional tax advice. Our service:
            </p>
            <ul style={{ color: '#4B5563', lineHeight: 1.7, marginLeft: '24px', marginBottom: '12px' }}>
              <li>Does not replace consultation with a qualified tax professional</li>
              <li>Provides estimates that may differ from final CRA assessments</li>
              <li>Should not be relied upon for complex tax situations</li>
            </ul>
            <p style={{ color: '#4B5563', lineHeight: 1.7 }}>
              You are responsible for the accuracy of information you provide and for reviewing
              your tax return before filing.
            </p>
          </Card>

          <Card style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#1F2937', marginBottom: '16px' }}>
              4. User Responsibilities
            </h2>
            <p style={{ color: '#4B5563', lineHeight: 1.7, marginBottom: '12px' }}>
              As a user, you agree to:
            </p>
            <ul style={{ color: '#4B5563', lineHeight: 1.7, marginLeft: '24px' }}>
              <li>Provide accurate and complete information</li>
              <li>Keep your account credentials secure</li>
              <li>Use the service only for lawful purposes</li>
              <li>Not attempt to reverse engineer or exploit the service</li>
              <li>Review all calculations before filing with the CRA</li>
            </ul>
          </Card>

          <Card style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#1F2937', marginBottom: '16px' }}>
              5. Limitation of Liability
            </h2>
            <p style={{ color: '#4B5563', lineHeight: 1.7, marginBottom: '12px' }}>
              TaxSimple is provided "as is" without warranties of any kind. We are not liable for:
            </p>
            <ul style={{ color: '#4B5563', lineHeight: 1.7, marginLeft: '24px', marginBottom: '12px' }}>
              <li>Errors in tax calculations resulting from incorrect user input</li>
              <li>Differences between our estimates and CRA assessments</li>
              <li>Penalties or interest from late or incorrect filings</li>
              <li>Loss of data due to browser storage clearing</li>
              <li>Service interruptions or unavailability</li>
            </ul>
            <p style={{ color: '#4B5563', lineHeight: 1.7 }}>
              Our maximum liability is limited to the amount you paid for the service.
            </p>
          </Card>

          <Card style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#1F2937', marginBottom: '16px' }}>
              6. Quebec Residents
            </h2>
            <p style={{ color: '#4B5563', lineHeight: 1.7 }}>
              Quebec residents must file a separate provincial return (TP-1) with Revenu Qu&eacute;bec.
              TaxSimple prepares your federal return only. You are responsible for completing and
              filing your Quebec provincial return separately.
            </p>
          </Card>

          <Card style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#1F2937', marginBottom: '16px' }}>
              7. Changes to Terms
            </h2>
            <p style={{ color: '#4B5563', lineHeight: 1.7 }}>
              We may update these Terms of Service from time to time. Continued use of the service
              after changes constitutes acceptance of the new terms. We encourage you to review
              these terms periodically.
            </p>
          </Card>

          <Card>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#1F2937', marginBottom: '16px' }}>
              8. Contact
            </h2>
            <p style={{ color: '#4B5563', lineHeight: 1.7 }}>
              For questions about these Terms of Service, contact us at{' '}
              <a href="mailto:legal@taxsimple.ca" style={{ color: '#0D5F2B' }}>
                legal@taxsimple.ca
              </a>
            </p>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
