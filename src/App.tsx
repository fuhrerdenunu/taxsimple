import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TaxReturnProvider } from './context/TaxReturnContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Pages
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { VerifyPage } from './pages/auth/VerifyPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { SupportPage } from './pages/SupportPage';
import { TaxWizard } from './pages/return/TaxWizard';
import WorkspacePage from './pages/return/WorkspacePage';

// Global styles
const globalStyles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: #F9FAFB;
    color: #1F2937;
    line-height: 1.5;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  a {
    color: #0D5F2B;
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }
`;

export default function App() {
  return (
    <>
      <style>{globalStyles}</style>
      <HashRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/register" element={<RegisterPage />} />
            <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/auth/verify" element={<VerifyPage />} />
            <Route path="/auth/reset-password/:token" element={<ResetPasswordPage />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <TaxReturnProvider>
                    <DashboardPage />
                  </TaxReturnProvider>
                </ProtectedRoute>
              }
            />

            {/* Dynamic Workspace (standalone route, outside TaxWizard) */}
            <Route
              path="/return/:taxYear/workspace"
              element={
                <ProtectedRoute>
                  <TaxReturnProvider>
                    <WorkspacePage />
                  </TaxReturnProvider>
                </ProtectedRoute>
              }
            />

            {/* Tax Return Wizard */}
            <Route
              path="/return/:taxYear/*"
              element={
                <ProtectedRoute>
                  <TaxReturnProvider>
                    <TaxWizard />
                  </TaxReturnProvider>
                </ProtectedRoute>
              }
            />

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </HashRouter>
    </>
  );
}
