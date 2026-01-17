import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';

export function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header style={{
      backgroundColor: 'white',
      borderBottom: '1px solid #E5E7EB',
      padding: '16px 24px',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            backgroundColor: '#0D5F2B',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span style={{
            fontSize: '20px',
            fontWeight: 700,
            color: '#1F2937'
          }}>
            TaxSimple
          </span>
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                style={{
                  color: '#4B5563',
                  textDecoration: 'none',
                  fontSize: '15px',
                  fontWeight: 500
                }}
              >
                Dashboard
              </Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '14px', color: '#6B7280' }}>
                  {user?.name || user?.email}
                </span>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Log out
                </Button>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/auth/login"
                style={{
                  color: '#4B5563',
                  textDecoration: 'none',
                  fontSize: '15px',
                  fontWeight: 500
                }}
              >
                Sign in
              </Link>
              <Button size="sm" onClick={() => navigate('/auth/register')}>
                Get Started
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
