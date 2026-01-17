import React, { useState } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';

export function SupportPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would send to a backend
    setSubmitted(true);
  };

  const faqs = [
    {
      question: 'Is TaxSimple free to use?',
      answer: 'Yes, TaxSimple is free to use for preparing your tax return summary. We help you calculate your taxes and generate documents for your records.'
    },
    {
      question: 'Can I file my taxes directly with TaxSimple?',
      answer: 'TaxSimple is not currently a NETFILE-certified service. You can use our PDF and data exports with NETFILE-certified software to file with the CRA.'
    },
    {
      question: 'Which provinces and territories are supported?',
      answer: 'TaxSimple supports all 13 Canadian provinces and territories: Alberta, British Columbia, Manitoba, New Brunswick, Newfoundland and Labrador, Northwest Territories, Nova Scotia, Nunavut, Ontario, Prince Edward Island, Quebec, Saskatchewan, and Yukon.'
    },
    {
      question: 'I live in Quebec. Can I use TaxSimple?',
      answer: 'Yes! TaxSimple will prepare your federal return. However, Quebec residents must also file a separate TP-1 provincial return with Revenu Qu\u00e9bec. We\'ll remind you of this when you complete your return.'
    },
    {
      question: 'Where is my data stored?',
      answer: 'Your tax information is stored locally in your browser using encrypted storage. Your data never leaves your device unless you explicitly export it. We do not have access to your tax information on our servers.'
    },
    {
      question: 'What happens if I clear my browser data?',
      answer: 'Clearing your browser data will remove your stored tax information. We recommend downloading your PDF and data exports before clearing browser data.'
    },
    {
      question: 'Is my SIN safe?',
      answer: 'Yes. Your SIN is encrypted when stored and is displayed in masked format (***-***-XXX) wherever possible. It is never transmitted to our servers, and PDF exports mask your SIN by default.'
    },
    {
      question: 'What tax year does TaxSimple support?',
      answer: 'TaxSimple currently supports the 2024 tax year and previous years (2023, 2022, 2021) for reference.'
    }
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F9FAFB' }}>
      <Header />

      <main style={{ flex: 1, padding: '48px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#1F2937', marginBottom: '8px', textAlign: 'center' }}>
            How can we help?
          </h1>
          <p style={{ fontSize: '16px', color: '#6B7280', marginBottom: '48px', textAlign: 'center' }}>
            Find answers to common questions or get in touch with our team
          </p>

          {/* FAQ Section */}
          <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#1F2937', marginBottom: '24px' }}>
            Frequently Asked Questions
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '48px' }}>
            {faqs.map((faq, index) => (
              <Card key={index}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1F2937', marginBottom: '8px' }}>
                  {faq.question}
                </h3>
                <p style={{ color: '#4B5563', lineHeight: 1.6 }}>
                  {faq.answer}
                </p>
              </Card>
            ))}
          </div>

          {/* Contact Form */}
          <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#1F2937', marginBottom: '24px' }}>
            Still need help?
          </h2>

          {submitted ? (
            <Alert type="success" title="Message Sent">
              Thank you for contacting us. We'll get back to you within 1-2 business days.
            </Alert>
          ) : (
            <Card>
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <Input
                    label="Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <Input
                  label="Subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                />

                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    Message
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows={5}
                    style={{
                      width: '100%',
                      padding: '12px',
                      fontSize: '15px',
                      border: '1px solid #D1D5DB',
                      borderRadius: '8px',
                      resize: 'vertical',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                <Button type="submit">
                  Send Message
                </Button>
              </form>
            </Card>
          )}

          {/* Direct Contact */}
          <div style={{ marginTop: '48px', textAlign: 'center' }}>
            <p style={{ color: '#6B7280', marginBottom: '16px' }}>
              You can also reach us directly at:
            </p>
            <p>
              <a href="mailto:support@taxsimple.ca" style={{ color: '#0D5F2B', fontWeight: 500, fontSize: '18px' }}>
                support@taxsimple.ca
              </a>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
