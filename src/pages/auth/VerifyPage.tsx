import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Alert } from '../../components/ui/Alert';

export function VerifyPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [status, setStatus] = useState<'pending' | 'verifying' | 'success' | 'error'>('pending');
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const token = searchParams.get('token');

  useEffect(() => {
    // If there's a token in the URL, auto-verify
    if (token) {
      setStatus('verifying');
      // Simulate verification
      setTimeout(() => {
        setStatus('success');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }, 1500);
    }
  }, [token, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && resendDisabled) {
      setResendDisabled(false);
    }
  }, [countdown, resendDisabled]);

  const handleResend = () => {
    setResendDisabled(true);
    setCountdown(60);
    // In production, this would trigger an email
  };

  if (status === 'verifying') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F9FAFB'
      }}>
        <Card style={{ maxWidth: '400px', textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '3px solid #E5E7EB',
            borderTopColor: '#0D5F2B',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 24px'
          }} />
          <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#1F2937', marginBottom: '8px' }}>
            Verifying your email...
          </h1>
          <p style={{ color: '#6B7280' }}>
            Please wait while we confirm your email address.
          </p>
        </Card>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F9FAFB'
      }}>
        <Card style={{ maxWidth: '400px', textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#D1FAE5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px'
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#065F46" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#1F2937', marginBottom: '8px' }}>
            Email Verified!
          </h1>
          <p style={{ color: '#6B7280', marginBottom: '24px' }}>
            Your email has been verified. Redirecting to your dashboard...
          </p>
        </Card>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F9FAFB',
        padding: '24px'
      }}>
        <Card style={{ maxWidth: '400px', textAlign: 'center' }}>
          <Alert type="error" title="Verification Failed">
            This verification link is invalid or has expired. Please request a new one.
          </Alert>
          <Button onClick={handleResend} disabled={resendDisabled} style={{ marginTop: '24px' }}>
            {resendDisabled ? `Resend in ${countdown}s` : 'Resend Verification Email'}
          </Button>
        </Card>
      </div>
    );
  }

  // Pending state - waiting for user to check email
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F9FAFB',
      padding: '24px'
    }}>
      <Card style={{ maxWidth: '450px', textAlign: 'center' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: '#E8F5E9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px'
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0D5F2B" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </div>

        <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#1F2937', marginBottom: '8px' }}>
          Check your email
        </h1>
        <p style={{ color: '#6B7280', marginBottom: '24px' }}>
          We've sent a verification link to{' '}
          <strong style={{ color: '#1F2937' }}>{user?.email || 'your email'}</strong>.
          Click the link to verify your account.
        </p>

        <div style={{
          padding: '16px',
          backgroundColor: '#F9FAFB',
          borderRadius: '8px',
          marginBottom: '24px'
        }}>
          <p style={{ fontSize: '14px', color: '#6B7280' }}>
            Didn't receive the email? Check your spam folder or request a new one.
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={handleResend}
          disabled={resendDisabled}
          fullWidth
        >
          {resendDisabled ? `Resend in ${countdown}s` : 'Resend Verification Email'}
        </Button>

        <p style={{ marginTop: '24px', fontSize: '14px', color: '#6B7280' }}>
          Wrong email?{' '}
          <a href="/auth/register" style={{ color: '#0D5F2B', fontWeight: 500 }}>
            Sign up again
          </a>
        </p>
      </Card>
    </div>
  );
}
