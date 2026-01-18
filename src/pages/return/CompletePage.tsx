import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTaxReturn } from '../../context/TaxReturnContext';
import { calculateTax, formatCurrency, CURRENT_TAX_YEAR } from '../../domain/tax';
import { generateTaxSummaryPDF, exportTaxDataJSON } from '../../utils/pdf-export';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Alert } from '../../components/ui/Alert';

export function CompletePage() {
  const navigate = useNavigate();
  const { taxYear } = useParams();
  const { state, getTaxInput } = useTaxReturn();

  const taxInput = getTaxInput();
  const taxResult = calculateTax(taxInput);
  const year = taxYear ? parseInt(taxYear, 10) : CURRENT_TAX_YEAR;

  const handleDownloadPDF = () => {
    generateTaxSummaryPDF(state.profile, taxResult, year, { maskSIN: true });
  };

  const handleDownloadJSON = () => {
    exportTaxDataJSON(state.profile, state.currentReturn, taxResult);
  };

  return (
    <div style={{ textAlign: 'center' }}>
      {/* Success Icon */}
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        backgroundColor: '#D1FAE5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 24px'
      }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#065F46" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      </div>

      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px', color: '#1F2937' }}>
        Your {taxYear} Return is Complete!
      </h1>
      <p style={{ fontSize: '16px', color: '#6B7280', marginBottom: '32px' }}>
        Completed on {new Date().toLocaleDateString('en-CA', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </p>

      {/* Result Summary */}
      <Card style={{
        maxWidth: '400px',
        margin: '0 auto 32px',
        backgroundColor: taxResult.isRefund ? '#D1FAE5' : '#FEE2E2'
      }}>
        <p style={{
          fontSize: '14px',
          color: taxResult.isRefund ? '#065F46' : '#991B1B',
          marginBottom: '8px'
        }}>
          {taxResult.isRefund ? 'Your Estimated Refund' : 'Estimated Amount Owing'}
        </p>
        <p style={{
          fontSize: '40px',
          fontWeight: 700,
          color: taxResult.isRefund ? '#065F46' : '#991B1B'
        }}>
          {formatCurrency(Math.abs(taxResult.refundOrOwing))}
        </p>
      </Card>

      {/* Download Options */}
      <Card style={{ maxWidth: '500px', margin: '0 auto 32px', textAlign: 'left' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: '#1F2937' }}>
          Download Your Documents
        </h2>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px',
          backgroundColor: '#F9FAFB',
          borderRadius: '8px',
          marginBottom: '12px'
        }}>
          <div>
            <p style={{ fontWeight: 500, color: '#1F2937' }}>Tax Summary (PDF)</p>
            <p style={{ fontSize: '13px', color: '#6B7280' }}>
              Printable summary of your return
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={handleDownloadPDF}>
            Download
          </Button>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px',
          backgroundColor: '#F9FAFB',
          borderRadius: '8px'
        }}>
          <div>
            <p style={{ fontWeight: 500, color: '#1F2937' }}>Data File (JSON)</p>
            <p style={{ fontSize: '13px', color: '#6B7280' }}>
              Import into other tax software
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={handleDownloadJSON}>
            Download
          </Button>
        </div>
      </Card>

      {/* Next Steps */}
      <Card style={{ maxWidth: '500px', margin: '0 auto 32px', textAlign: 'left' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: '#1F2937' }}>
          Next Steps
        </h2>

        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          <li style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '12px'
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: '#E8F5E9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: '#0D5F2B'
            }}>
              1
            </div>
            <div>
              <p style={{ fontWeight: 500, color: '#1F2937' }}>Keep these documents</p>
              <p style={{ fontSize: '13px', color: '#6B7280' }}>
                Store your tax summary for at least 6 years
              </p>
            </div>
          </li>
          <li style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '12px'
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: '#E8F5E9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: '#0D5F2B'
            }}>
              2
            </div>
            <div>
              <p style={{ fontWeight: 500, color: '#1F2937' }}>File with the CRA</p>
              <p style={{ fontSize: '13px', color: '#6B7280' }}>
                Use NETFILE-certified software to submit your return
              </p>
            </div>
          </li>
          <li style={{
            display: 'flex',
            gap: '12px'
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: '#E8F5E9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: '#0D5F2B'
            }}>
              3
            </div>
            <div>
              <p style={{ fontWeight: 500, color: '#1F2937' }}>Wait for your refund</p>
              <p style={{ fontSize: '13px', color: '#6B7280' }}>
                Refunds typically arrive within 2 weeks of CRA processing
              </p>
            </div>
          </li>
        </ul>
      </Card>

      {/* Quebec Notice */}
      {state.profile.province === 'QC' && (
        <div style={{ maxWidth: '500px', margin: '0 auto 32px' }}>
          <Alert type="warning" title="Quebec Residents">
            Remember to file your TP-1 with Revenu Quebec at{' '}
            <a href="https://www.revenuquebec.ca" target="_blank" rel="noopener noreferrer">
              revenuquebec.ca
            </a>
          </Alert>
        </div>
      )}

      <Button onClick={() => navigate('/dashboard')}>
        Return to Dashboard
      </Button>
    </div>
  );
}
