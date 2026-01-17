import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Alert } from '../../components/ui/Alert';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    setSubmitted(true);
    setIsLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F9FAFB' }}>
      <Header />

      <div style={{
        maxWidth: '400px',
        margin: '0 auto',
        padding: '48px 24px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          {!submitted ? (
            <>
              <h1 style={{
                fontSize: '24px',
                fontWeight: 700,
                marginBottom: '8px',
                color: '#1F2937'
              }}>
                Reset your password
              </h1>
              <p style={{
                fontSize: '15px',
                color: '#6B7280',
                marginBottom: '32px'
              }}>
                Enter your email and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit}>
                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />

                <Button type="submit" fullWidth loading={isLoading}>
                  Send reset link
                </Button>
              </form>
            </>
          ) : (
            <>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#E8F5E9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  color: '#0D5F2B'
                }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px', color: '#1F2937' }}>
                  Check your email
                </h2>
                <p style={{ fontSize: '15px', color: '#6B7280' }}>
                  We've sent a password reset link to <strong>{email}</strong>
                </p>
              </div>

              <Alert type="info">
                Didn't receive the email? Check your spam folder or try again.
              </Alert>

              <Button
                variant="secondary"
                fullWidth
                onClick={() => setSubmitted(false)}
                style={{ marginTop: '24px' }}
              >
                Try again
              </Button>
            </>
          )}

          <p style={{
            textAlign: 'center',
            marginTop: '24px',
            fontSize: '14px',
            color: '#6B7280'
          }}>
            Remember your password?{' '}
            <Link to="/auth/login" style={{ color: '#0D5F2B', textDecoration: 'none', fontWeight: 500 }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
