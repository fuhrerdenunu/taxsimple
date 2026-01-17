import React from 'react';
import { Routes, Route, useParams, useLocation, Navigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { Stepper } from '../../components/layout/Stepper';
import { ProfilePage } from './ProfilePage';
import { IncomePage } from './IncomePage';
import { DeductionsPage } from './DeductionsPage';
import { ReviewPage } from './ReviewPage';
import { CompletePage } from './CompletePage';

const steps = [
  { id: 'profile', label: 'Profile', path: 'profile' },
  { id: 'income', label: 'Income', path: 'income' },
  { id: 'deductions', label: 'Deductions', path: 'deductions' },
  { id: 'review', label: 'Review', path: 'review' },
  { id: 'complete', label: 'Complete', path: 'complete' }
];

export function TaxWizard() {
  const { taxYear } = useParams();
  const location = useLocation();
  const year = parseInt(taxYear || '2024', 10);

  // Determine current step from URL
  const pathParts = location.pathname.split('/');
  const currentPath = pathParts[pathParts.length - 1];
  const currentStep = steps.find(s => s.path === currentPath)?.id || 'profile';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F9FAFB' }}>
      <Header />
      <Stepper steps={steps} currentStep={currentStep} taxYear={year} />

      <main style={{ padding: '32px 24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Routes>
            <Route path="profile" element={<ProfilePage />} />
            <Route path="income" element={<IncomePage />} />
            <Route path="deductions" element={<DeductionsPage />} />
            <Route path="review" element={<ReviewPage />} />
            <Route path="complete" element={<CompletePage />} />
            <Route path="*" element={<Navigate to="profile" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
