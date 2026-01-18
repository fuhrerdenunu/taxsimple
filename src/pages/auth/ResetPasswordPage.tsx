import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Alert } from '../../components/ui/Alert';

// Token storage uses sessionStorage (cleared on browser close) with basic obfuscation
const TOKEN_STORAGE_KEY = 'taxsimple_rst';
const getTokenStore = (): Record<string, { expires: string; email: string }> => {
  try {
    const stored = sessionStorage.getItem(TOKEN_STORAGE_KEY);
    if (!stored) return {};
    const decoded = atob(stored);
    return JSON.parse(decoded);
  } catch {
    return {};
  }
};

const setTokenStore = (tokens: Record<string, { expires: string; email: string }>) => {
  const encoded = btoa(JSON.stringify(tokens));
  sessionStorage.setItem(TOKEN_STORAGE_KEY, encoded);
};

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'validating' | 'ready' | 'submitting' | 'success' | 'invalid'>('validating');
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: '' });

  useEffect(() => {
    // Validate token
    if (token) {
      // Simulate token validation
      setTimeout(() => {
        const resetTokens = getTokenStore();
        const tokenData = resetTokens[token];
        if (tokenData && new Date(tokenData.expires) > new Date()) {
          setStatus('ready');
        } else {
          // Clean up expired token
          if (tokenData) {
            delete resetTokens[token];
            setTokenStore(resetTokens);
          }
          setStatus('invalid');
        }
      }, 1000);
    } else {
      setStatus('invalid');
    }
  }, [token]);

  useEffect(() => {
    // Calculate password strength
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const strengths = [
      { label: '', color: '#E5E7EB' },
      { label: 'Weak', color: '#EF4444' },
      { label: 'Fair', color: '#F59E0B' },
      { label: 'Good', color: '#10B981' },
      { label: 'Strong', color: '#059669' },
      { label: 'Very Strong', color: '#047857' }
    ];

    setPasswordStrength({ score, ...strengths[score] });
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError('Password must contain at least one uppercase letter');
      return;
    }
    if (!/[0-9]/.test(password)) {
      setError('Password must contain at least one number');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setStatus('submitting');

    // Simulate password reset
    setTimeout(() => {
      // Remove used token
      if (token) {
        const resetTokens = getTokenStore();
        delete resetTokens[token];
        setTokenStore(resetTokens);
      }

      setStatus('success');
    }, 1500);
  };

  if (status === 'validating') {
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
          <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#1F2937' }}>
            Validating reset link...
          </h1>
        </Card>
      </div>
    );
  }

  if (status === 'invalid') {
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
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#FEE2E2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px'
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#1F2937', marginBottom: '8px' }}>
            Invalid or Expired Link
          </h1>
          <p style={{ color: '#6B7280', marginBottom: '24px' }}>
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <Button onClick={() => navigate('/auth/forgot-password')} fullWidth>
            Request New Link
          </Button>
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
        backgroundColor: '#F9FAFB',
        padding: '24px'
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
            Password Reset!
          </h1>
          <p style={{ color: '#6B7280', marginBottom: '24px' }}>
            Your password has been successfully reset. You can now log in with your new password.
          </p>
          <Button onClick={() => navigate('/auth/login')} fullWidth>
            Go to Login
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F9FAFB',
      padding: '24px'
    }}>
      <Card style={{ maxWidth: '400px', width: '100%' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#1F2937', marginBottom: '8px', textAlign: 'center' }}>
          Reset Your Password
        </h1>
        <p style={{ color: '#6B7280', marginBottom: '24px', textAlign: 'center' }}>
          Enter your new password below.
        </p>

        {error && (
          <Alert type="error" style={{ marginBottom: '16px' }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Input
            label="New Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
            required
          />

          {/* Password strength indicator */}
          {password && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    style={{
                      flex: 1,
                      height: '4px',
                      borderRadius: '2px',
                      backgroundColor: level <= passwordStrength.score ? passwordStrength.color : '#E5E7EB'
                    }}
                  />
                ))}
              </div>
              <p style={{ fontSize: '12px', color: passwordStrength.color }}>
                {passwordStrength.label}
              </p>
            </div>
          )}

          <Input
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            required
          />

          <Button
            type="submit"
            fullWidth
            disabled={status === 'submitting'}
          >
            {status === 'submitting' ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>

        <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: '#6B7280' }}>
          Remember your password?{' '}
          <Link to="/auth/login" style={{ color: '#0D5F2B', fontWeight: 500, textDecoration: 'none' }}>
            Back to login
          </Link>
        </p>
      </Card>
    </div>
  );
}
