import type { FederalConfig, TaxYearConfig } from '../types';

export const federal2024: FederalConfig = {
  brackets: [
    { min: 0, max: 55867, rate: 0.15 },
    { min: 55867, max: 111733, rate: 0.205 },
    { min: 111733, max: 173205, rate: 0.26 },
    { min: 173205, max: 246752, rate: 0.29 },
    { min: 246752, max: Infinity, rate: 0.33 }
  ],
  basicPersonalAmount: 15705,
  bpaReduction: {
    start: 173205,
    end: 246752,
    minBPA: 14156
  }
};

export const taxYearConfig2024: Omit<TaxYearConfig, 'federal'> & { federal: FederalConfig } = {
  federal: federal2024,
  cpp: { max: 3867.50, rate: 0.0595, maxEarnings: 68500, exemption: 3500 },
  ei: { max: 1049.12, rate: 0.0166, maxInsurable: 63200 },
  rrsp: { limit: 31560 },
  fhsa: { annual: 8000, lifetime: 40000 },
  canadaEmploymentCredit: 1433,
  medicalThreshold: { rate: 0.03, max: 2635 },
  donations: { firstTier: 200, lowRate: 0.15, highRate: 0.29 }
};
