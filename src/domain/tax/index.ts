// TaxSimple Tax Engine
// Pure TypeScript tax calculation module for Canadian taxes

// Main calculation function
export { calculateTax } from './calculators';

// Individual calculators (for testing and advanced usage)
export {
  calculateBracketedTax,
  calculateFederalTax,
  applyQuebecAbatement,
  calculateProvincialTax,
  getProvinceName,
  requiresSeparateProvincialReturn,
  calculateOntarioHealthPremium,
  calculateDonationCredit,
  calculateMedicalCredit,
  calculateAdjustedBPA
} from './calculators';

// Configuration
export { taxYearConfig2024 } from './config/federal';
export { federal2024 } from './config/federal';
export { cpp2024, cpp2_2024 } from './config/cpp';
export { ei2024, eiQuebec2024 } from './config/ei';
export { provincial2024, PROVINCES, getProvincialConfig } from './config/provincial';

// Types
export type {
  ProvinceCode,
  TaxBracket,
  HealthPremiumBracket,
  OntarioSurtax,
  PEISurtax,
  ProvincialConfig,
  FederalConfig,
  CPPConfig,
  EIConfig,
  TaxYearConfig,
  TaxInput,
  TaxResult,
  ProvinceInfo
} from './types';

// Utility: Format currency for display
export function formatCurrency(amount: number, cents: boolean = true): string {
  const num = parseFloat(String(amount)) || 0;
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: cents ? 2 : 0
  }).format(num);
}
