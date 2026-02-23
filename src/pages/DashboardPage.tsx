import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTaxReturn } from '../context/TaxReturnContext';
import { calculateTax, formatCurrency, CURRENT_TAX_YEAR } from '../domain/tax';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { tokens } from '../styles/tokens';

/* ------------------------------------------------------------------ */
/*  Status config                                                      */
/* ------------------------------------------------------------------ */
const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  not_started: { label: 'Not Started', color: '#6B7280', bg: '#F3F4F6' },
  in_progress: { label: 'In Progress', color: '#D97706', bg: '#FEF3C7' },
  ready_to_review: { label: 'Ready to Review', color: '#059669', bg: '#D1FAE5' },
  completed: { label: 'Completed', color: '#0D5F2B', bg: '#E8F5E9' }
};

/* ------------------------------------------------------------------ */
/*  Deadline Banner                                                    */
/* ------------------------------------------------------------------ */
function DeadlineBanner({ onDismiss }: { onDismiss: () => void }) {
  const deadline = new Date(CURRENT_TAX_YEAR + 1, 3, 30); // April 30
  const now = new Date();
  const diffMs = deadline.getTime() - now.getTime();
  const daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  if (diffMs < 0) return null;

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #0D5F2B 0%, #16A34A 100%)',
        borderRadius: '14px',
        padding: '20px 28px',
        marginBottom: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        flexWrap: 'wrap'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            backgroundColor: 'rgba(255,255,255,0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <div>
          <p style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'white' }}>
            CRA filing deadline: April 30, {CURRENT_TAX_YEAR + 1}
          </p>
          <p style={{ margin: '4px 0 0', fontSize: '14px', color: 'rgba(255,255,255,0.85)' }}>
            {daysLeft === 0
              ? 'Deadline is today! File now to avoid penalties.'
              : daysLeft === 1
              ? '1 day remaining to file your taxes on time.'
              : `${daysLeft} days remaining to file your taxes on time.`}
          </p>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        <div
          style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: '10px',
            padding: '8px 18px',
            textAlign: 'center'
          }}
        >
          <span style={{ fontSize: '24px', fontWeight: 700, color: 'white', lineHeight: 1 }}>{daysLeft}</span>
          <span style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.8)', marginTop: '2px' }}>days left</span>
        </div>
        <button
          onClick={onDismiss}
          aria-label="Dismiss deadline banner"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'rgba(255,255,255,0.7)',
            padding: '4px',
            borderRadius: '6px',
            display: 'flex'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quick Action Card                                                  */
/* ------------------------------------------------------------------ */
function QuickActionCard({
  title,
  description,
  icon,
  primary,
  onClick
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  primary?: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: 1,
        minWidth: '200px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '20px',
        borderRadius: '14px',
        border: primary ? 'none' : '1px solid #E5E7EB',
        backgroundColor: primary
          ? hovered ? '#0A4A21' : '#0D5F2B'
          : hovered ? '#FAFBFC' : 'white',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: hovered
          ? primary
            ? '0 8px 25px -5px rgba(13, 95, 43, 0.35)'
            : '0 8px 25px -5px rgba(0, 0, 0, 0.08)'
          : '0 1px 3px rgba(0, 0, 0, 0.05)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        fontFamily: 'inherit'
      }}
    >
      <div
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          backgroundColor: primary ? 'rgba(255,255,255,0.18)' : tokens.color.brandLight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color: primary ? 'white' : tokens.color.brand
        }}
      >
        {icon}
      </div>
      <div>
        <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: primary ? 'white' : tokens.color.text }}>
          {title}
        </p>
        <p style={{ margin: '3px 0 0', fontSize: '13px', color: primary ? 'rgba(255,255,255,0.8)' : tokens.color.muted }}>
          {description}
        </p>
      </div>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Progress Tracker                                                   */
/* ------------------------------------------------------------------ */
function ProgressTracker({ currentStep }: { currentStep: number }) {
  const steps = [
    { label: 'Profile', icon: 'user' },
    { label: 'Income', icon: 'dollar' },
    { label: 'Deductions', icon: 'receipt' },
    { label: 'Review', icon: 'check' }
  ];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0', width: '100%' }}>
      {steps.map((step, i) => {
        const isCompleted = i < currentStep;
        const isActive = i === currentStep;
        const isLast = i === steps.length - 1;

        return (
          <React.Fragment key={step.label}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: '0 0 auto' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isCompleted
                    ? tokens.color.brand
                    : isActive
                    ? tokens.color.brandLight
                    : '#F3F4F6',
                  border: isActive ? `2px solid ${tokens.color.brand}` : '2px solid transparent',
                  transition: 'all 0.3s ease'
                }}
              >
                {isCompleted ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <span
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: isActive ? tokens.color.brand : tokens.color.muted
                    }}
                  >
                    {i + 1}
                  </span>
                )}
              </div>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: isActive || isCompleted ? 600 : 400,
                  color: isActive ? tokens.color.brand : isCompleted ? tokens.color.text : tokens.color.muted
                }}
              >
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div
                style={{
                  flex: 1,
                  height: '2px',
                  backgroundColor: isCompleted ? tokens.color.brand : '#E5E7EB',
                  margin: '0 4px',
                  marginBottom: '28px',
                  borderRadius: '1px',
                  transition: 'background-color 0.3s ease'
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Stat Pill                                                          */
/* ------------------------------------------------------------------ */
function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ flex: 1, minWidth: '120px' }}>
      <p style={{ margin: 0, fontSize: '12px', fontWeight: 500, color: tokens.color.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</p>
      <p style={{ margin: '6px 0 0', fontSize: '20px', fontWeight: 600, color: tokens.color.text }}>{value}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Year Card (enhanced)                                               */
/* ------------------------------------------------------------------ */
function YearCard({
  year,
  status,
  isCurrent,
  onClick
}: {
  year: number;
  status: string;
  isCurrent: boolean;
  onClick: () => void;
}) {
  const config = statusConfig[status] || statusConfig.not_started;

  return (
    <Card
      hoverable
      accentBorder={isCurrent ? 'left' : 'none'}
      accentColor={tokens.color.brand}
      style={isCurrent ? { borderColor: tokens.color.brandLight } : {}}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <h3 style={{ fontSize: '26px', fontWeight: 700, color: tokens.color.text, margin: 0, letterSpacing: '-0.02em' }}>
              {year}
            </h3>
            {isCurrent && (
              <span style={{
                fontSize: '11px',
                fontWeight: 600,
                color: tokens.color.brand,
                backgroundColor: tokens.color.brandLight,
                padding: '2px 8px',
                borderRadius: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                Current
              </span>
            )}
          </div>
          <span style={{
            display: 'inline-block',
            padding: '4px 12px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 500,
            backgroundColor: config.bg,
            color: config.color
          }}>
            {config.label}
          </span>
        </div>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          backgroundColor: isCurrent ? tokens.color.brandLight : '#F3F4F6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isCurrent ? tokens.color.brand : tokens.color.muted
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        <Button
          variant={status === 'not_started' ? 'primary' : 'secondary'}
          size="sm"
          fullWidth
          onClick={onClick}
        >
          {status === 'not_started' ? 'Start Return' :
           status === 'completed' ? 'View Return' : 'Continue'}
        </Button>
      </div>
    </Card>
  );
}

/* ================================================================== */
/*  MAIN DASHBOARD PAGE                                                */
/* ================================================================== */
export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { state, dispatch, getTaxInput } = useTaxReturn();
  const [showBanner, setShowBanner] = useState(true);

  const taxYears = [CURRENT_TAX_YEAR, CURRENT_TAX_YEAR - 1, CURRENT_TAX_YEAR - 2, CURRENT_TAX_YEAR - 3];
  const activeUnit = state.returnsByYear[state.activeYear];
  const activeStatus = activeUnit?.status ?? 'not_started';

  const handleStartReturn = (year: number) => {
    dispatch({ type: 'CREATE_YEAR_RETURN', payload: year });
    dispatch({ type: 'SET_ACTIVE_PERSON', payload: 'primary' });
    navigate(`/return/${year}/person/primary/profile`);
  };

  const handleContinueReturn = () => {
    const year = state.activeYear;
    if (activeStatus === 'not_started') {
      navigate(`/return/${year}/person/primary/profile`);
    } else if (activeStatus === 'completed') {
      navigate(`/return/${year}/person/primary/submit`);
    } else {
      navigate(`/return/${year}/person/primary/workspace`);
    }
  };

  // Derive progress step
  const person = activeUnit?.primary;
  const hasProfile = Boolean(person?.profile.firstName);
  const hasIncome = (person?.taxData.slips?.length ?? 0) > 0;
  const hasDeductions = (person?.taxData.deductions?.rrsp ?? 0) > 0 || (person?.taxData.deductions?.childcare ?? 0) > 0;
  const progressStep = !hasProfile ? 0 : !hasIncome ? 1 : !hasDeductions ? 2 : activeStatus === 'ready_to_review' || activeStatus === 'completed' ? 3 : 2;

  // Tax calc
  const taxInput = getTaxInput(state.activeYear, 'primary');
  const taxResult = calculateTax(taxInput);

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: tokens.color.bg, fontFamily: tokens.font.family }}>
      <Header />

      <main style={{ flex: 1, padding: '36px 24px', paddingBottom: '60px' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>

          {/* Deadline Banner */}
          {showBanner && <DeadlineBanner onDismiss={() => setShowBanner(false)} />}

          {/* Welcome */}
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '30px', fontWeight: 700, color: tokens.color.text, marginBottom: '6px', letterSpacing: '-0.02em' }}>
              {greeting}, {user?.name?.split(' ')[0] || 'there'}
            </h1>
            <p style={{ fontSize: '15px', color: tokens.color.muted, margin: 0 }}>
              {new Date().toLocaleDateString('en-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} &mdash; Here's your tax filing overview
            </p>
            <div style={{ width: '48px', height: '3px', backgroundColor: tokens.color.brand, borderRadius: '2px', marginTop: '16px' }} />
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'flex', gap: '14px', marginBottom: '28px', flexWrap: 'wrap' }}>
            <QuickActionCard
              title="Start New Return"
              description={`Begin your ${CURRENT_TAX_YEAR} filing`}
              primary
              icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              }
              onClick={() => handleStartReturn(CURRENT_TAX_YEAR)}
            />
            <QuickActionCard
              title="Upload Documents"
              description="Auto-fill from T4, T5, etc."
              icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              }
              onClick={() => navigate(`/return/${CURRENT_TAX_YEAR}/person/primary/workspace`)}
            />
            {activeStatus !== 'not_started' && (
              <QuickActionCard
                title="Continue Return"
                description="Pick up where you left off"
                icon={
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                }
                onClick={handleContinueReturn}
              />
            )}
          </div>

          {/* Current Return Summary */}
          {activeStatus !== 'not_started' && (
            <Card style={{ marginBottom: '28px', padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                    <h2 style={{ fontSize: '22px', fontWeight: 700, color: tokens.color.text, margin: 0, letterSpacing: '-0.01em' }}>
                      {state.activeYear} Tax Return
                    </h2>
                    <span style={{
                      padding: '4px 14px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 600,
                      backgroundColor: statusConfig[activeStatus].bg,
                      color: statusConfig[activeStatus].color,
                      letterSpacing: '0.01em'
                    }}>
                      {statusConfig[activeStatus].label}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: tokens.color.muted, margin: 0 }}>
                    Last updated: {activeUnit?.lastModified ? new Date(activeUnit.lastModified).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                  </p>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '13px', color: tokens.color.muted, marginBottom: '4px' }}>
                    {taxResult.isRefund ? 'Estimated Refund' : 'Estimated Owing'}
                  </p>
                  <p style={{
                    fontSize: '34px',
                    fontWeight: 700,
                    color: taxResult.isRefund ? tokens.color.refund : tokens.color.owing,
                    margin: 0,
                    letterSpacing: '-0.02em',
                    lineHeight: 1
                  }}>
                    {formatCurrency(Math.abs(taxResult.refundOrOwing))}
                  </p>
                </div>
              </div>

              {/* Stats row */}
              <div style={{
                display: 'flex',
                gap: '32px',
                marginTop: '24px',
                paddingTop: '24px',
                borderTop: '1px solid #F3F4F6',
                flexWrap: 'wrap'
              }}>
                <StatItem label="Total Income" value={formatCurrency(taxResult.totalIncome)} />
                <StatItem label="Total Tax" value={formatCurrency(taxResult.totalTax)} />
                <StatItem label="Tax Withheld" value={formatCurrency(taxResult.totalWithheld)} />
              </div>

              {/* Progress Tracker */}
              <div style={{
                marginTop: '28px',
                paddingTop: '24px',
                borderTop: '1px solid #F3F4F6'
              }}>
                <p style={{ margin: '0 0 16px', fontSize: '12px', fontWeight: 600, color: tokens.color.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Filing Progress
                </p>
                <ProgressTracker currentStep={progressStep} />
              </div>

              <div style={{ marginTop: '28px' }}>
                <Button onClick={handleContinueReturn} size="lg">
                  {activeStatus === 'completed' ? 'View Return' : 'Continue Filing'}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4px' }}>
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Button>
              </div>
            </Card>
          )}

          {/* Tax Year Cards */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: tokens.color.text, margin: 0 }}>
              Tax Years
            </h2>
            <span style={{ fontSize: '13px', color: tokens.color.muted }}>
              {taxYears.length} years available
            </span>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '16px'
          }}>
            {taxYears.map(year => {
              const unit = state.returnsByYear[year];
              const status = unit?.status ?? 'not_started';

              return (
                <YearCard
                  key={year}
                  year={year}
                  status={status}
                  isCurrent={year === CURRENT_TAX_YEAR}
                  onClick={() => handleStartReturn(year)}
                />
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
