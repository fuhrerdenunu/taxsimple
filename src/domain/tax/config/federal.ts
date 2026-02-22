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

// 2025 Tax Year Configuration
// Indexed by 2.7% inflation adjustment
// Lowest bracket rate reduced from 15% to 14% (effective July 1, 2025 = 14.5% blended rate for 2025)
export const federal2025: FederalConfig = {
  brackets: [
    { min: 0, max: 57375, rate: 0.145 },       // Blended rate: 15% Jan-Jun + 14% Jul-Dec
    { min: 57375, max: 114750, rate: 0.205 },
    { min: 114750, max: 177882, rate: 0.26 },
    { min: 177882, max: 253414, rate: 0.29 },
    { min: 253414, max: Infinity, rate: 0.33 }
  ],
  basicPersonalAmount: 16129,
  bpaReduction: {
    start: 177882,
    end: 253414,
    minBPA: 14538
  }
};

export const taxYearConfig2025: Omit<TaxYearConfig, 'federal'> & { federal: FederalConfig } = {
  federal: federal2025,
  cpp: { max: 4034.10, rate: 0.0595, maxEarnings: 71300, exemption: 3500 },
  ei: { max: 1077.48, rate: 0.0164, maxInsurable: 65700 },
  rrsp: { limit: 32490 },
  fhsa: { annual: 8000, lifetime: 40000 },
  canadaEmploymentCredit: 1471,  // Indexed by 2.7%
  medicalThreshold: { rate: 0.03, max: 2706 },  // Indexed by 2.7%
  donations: { firstTier: 200, lowRate: 0.15, highRate: 0.29 }
};
