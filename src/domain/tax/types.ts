// Core TypeScript types for Canadian tax calculations

export type ProvinceCode =
  | 'ON' | 'BC' | 'AB' | 'QC' | 'MB' | 'SK'
  | 'NB' | 'NS' | 'PE' | 'NL' | 'YT' | 'NT' | 'NU';

export interface TaxBracket {
  min: number;
  max: number;
  rate: number;
}

export interface HealthPremiumBracket {
  max: number;
  amount?: number;
  base?: number;
  rate?: number;
  cap?: number;
}

export interface OntarioSurtax {
  first: number;
  firstRate: number;
  second: number;
  secondRate: number;
}

export interface PEISurtax {
  threshold: number;
  rate: number;
}

export interface ProvincialConfig {
  name: string;
  brackets: TaxBracket[];
  bpa: number;
  surtax?: OntarioSurtax | PEISurtax;
  healthPremium?: HealthPremiumBracket[];
  abatement?: number;
}

export interface FederalConfig {
  brackets: TaxBracket[];
  basicPersonalAmount: number;
  bpaReduction: {
    start: number;
    end: number;
    minBPA: number;
  };
}

export interface CPPConfig {
  max: number;
  rate: number;
  maxEarnings: number;
  exemption: number;
}

export interface EIConfig {
  max: number;
  rate: number;
  maxInsurable: number;
}

export interface TaxYearConfig {
  federal: FederalConfig;
  cpp: CPPConfig;
  ei: EIConfig;
  rrsp: { limit: number };
  fhsa: { annual: number; lifetime: number };
  canadaEmploymentCredit: number;
  medicalThreshold: { rate: number; max: number };
  donations: { firstTier: number; lowRate: number; highRate: number };
}

export interface TaxInput {
  province: ProvinceCode;
  employmentIncome?: number;
  selfEmploymentIncome?: number;
  rentalIncome?: number;
  interestIncome?: number;
  dividendIncome?: number;
  capitalGains?: number;
  otherIncome?: number;
  taxWithheld?: number;
  cppContributions?: number;
  eiPremiums?: number;
  rrspDeduction?: number;
  fhsaDeduction?: number;
  childcareExpenses?: number;
  movingExpenses?: number;
  unionDues?: number;
  donations?: number;
  medicalExpenses?: number;
  tuitionAmount?: number;
}

export interface TaxResult {
  totalIncome: number;
  totalDeductions: number;
  taxableIncome: number;
  federalTax: number;
  provincialTax: number;
  healthPremium: number;
  totalTax: number;
  totalWithheld: number;
  refundOrOwing: number;
  isRefund: boolean;
  provinceName: string;
}

export interface ProvinceInfo {
  code: ProvinceCode;
  name: string;
}
