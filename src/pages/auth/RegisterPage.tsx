import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Alert } from '../../components/ui/Alert';
import { CURRENT_TAX_YEAR } from '../../domain/tax';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const getPasswordStrength = () => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['#EF4444', '#F59E0B', '#22C55E', '#0D5F2B'];
  const passwordStrength = getPasswordStrength();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const result = await register(email, password, name);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Registration failed');
    }
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
          <h1 style={{
            fontSize: '24px',
            fontWeight: 700,
            marginBottom: '8px',
            color: '#1F2937'
          }}>
            Create your account
          </h1>
          <p style={{
            fontSize: '15px',
            color: '#6B7280',
            marginBottom: '32px'
          }}>
            Start filing your {CURRENT_TAX_YEAR} taxes today
          </p>

          {error && (
            <div style={{ marginBottom: '24px' }}>
              <Alert type="error">{error}</Alert>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <Input
              label="Full name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Smith"
              required
              autoComplete="name"
            />

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              required
              autoComplete="new-password"
              hint="At least 8 characters with uppercase and number"
            />

            {password && (
              <div style={{ marginTop: '-8px', marginBottom: '16px' }}>
                <div style={{
                  display: 'flex',
                  gap: '4px',
                  marginBottom: '4px'
                }}>
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      style={{
                        height: '4px',
                        flex: 1,
                        borderRadius: '2px',
                        backgroundColor: i < passwordStrength ? strengthColors[passwordStrength - 1] : '#E5E7EB'
                      }}
                    />
                  ))}
                </div>
                <span style={{ fontSize: '12px', color: strengthColors[passwordStrength - 1] || '#6B7280' }}>
                  {passwordStrength > 0 ? strengthLabels[passwordStrength - 1] : 'Enter a password'}
                </span>
              </div>
            )}

            <Input
              label="Confirm password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
              autoComplete="new-password"
              error={confirmPassword && password !== confirmPassword ? 'Passwords do not match' : undefined}
            />

            <Button type="submit" fullWidth loading={isLoading} style={{ marginTop: '8px' }}>
              Create account
            </Button>
          </form>

          <p style={{
            textAlign: 'center',
            marginTop: '24px',
            fontSize: '14px',
            color: '#6B7280'
          }}>
            Already have an account?{' '}
            <Link to="/auth/login" style={{ color: '#0D5F2B', textDecoration: 'none', fontWeight: 500 }}>
              Sign in
            </Link>
          </p>

          <p style={{
            textAlign: 'center',
            marginTop: '16px',
            fontSize: '12px',
            color: '#9CA3AF'
          }}>
            By creating an account, you agree to our{' '}
            <Link to="/terms" style={{ color: '#6B7280' }}>Terms</Link>
            {' '}and{' '}
            <Link to="/privacy" style={{ color: '#6B7280' }}>Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
