import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Alert } from '../../components/ui/Alert';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const result = await login(email, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Login failed');
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
            Welcome back
          </h1>
          <p style={{
            fontSize: '15px',
            color: '#6B7280',
            marginBottom: '32px'
          }}>
            Sign in to continue your tax return
          </p>

          {error && (
            <div style={{ marginBottom: '24px' }}>
              <Alert type="error">{error}</Alert>
            </div>
          )}

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

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            />

            <div style={{ textAlign: 'right', marginBottom: '24px' }}>
              <Link
                to="/auth/forgot-password"
                style={{
                  fontSize: '14px',
                  color: '#0D5F2B',
                  textDecoration: 'none'
                }}
              >
                Forgot password?
              </Link>
            </div>

            <Button type="submit" fullWidth loading={isLoading}>
              Sign in
            </Button>
          </form>

          <p style={{
            textAlign: 'center',
            marginTop: '24px',
            fontSize: '14px',
            color: '#6B7280'
          }}>
            Don't have an account?{' '}
            <Link to="/auth/register" style={{ color: '#0D5F2B', textDecoration: 'none', fontWeight: 500 }}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
