import type { TaxInput, TaxResult, ProvinceCode } from '../types';
import { taxYearConfig2024 } from '../config/federal';
import { getProvincialConfig } from '../config/provincial';
import { calculateFederalTax, applyQuebecAbatement } from './federal-tax';
import { calculateProvincialTax, getProvinceName } from './provincial-tax';
import { calculateOntarioHealthPremium } from './ontario-health-premium';

/**
 * Main tax calculation function
 *
 * Calculates complete Canadian tax liability including:
 * - Federal tax with all credits
 * - Provincial tax with surtax (ON, PE)
 * - Quebec abatement
 * - Ontario Health Premium
 *
 * @param input - Tax input data including income, deductions, and province
 * @returns Complete tax calculation result
 */
export function calculateTax(input: TaxInput): TaxResult {
  const config = taxYearConfig2024;
  const provincialConfig = getProvincialConfig(input.province);

  // Calculate Total Income
  // Include dividend gross-up (38% for eligible dividends)
  // Include 50% capital gains inclusion
  const totalIncome =
    (input.employmentIncome || 0) +
    (input.selfEmploymentIncome || 0) +
    (input.rentalIncome || 0) +
    (input.interestIncome || 0) +
    (input.dividendIncome || 0) * 1.38 + // Gross-up eligible dividends
    (input.capitalGains || 0) * 0.5 + // 50% inclusion rate
    (input.otherIncome || 0);

  // Calculate Total Deductions
  const totalDeductions =
    Math.min(input.rrspDeduction || 0, config.rrsp.limit) +
    Math.min(input.fhsaDeduction || 0, config.fhsa.annual) +
    (input.childcareExpenses || 0) +
    (input.movingExpenses || 0) +
    (input.unionDues || 0);

  // Taxable Income (cannot be negative)
  const taxableIncome = Math.max(0, totalIncome - totalDeductions);

  // Calculate Federal Tax
  const federalResult = calculateFederalTax(taxableIncome, input);
  let federalTax = federalResult.netTax;

  // Apply Quebec abatement if applicable
  if (input.province === 'QC' && provincialConfig.abatement) {
    federalTax = applyQuebecAbatement(federalTax, provincialConfig.abatement);
  }

  // Calculate Provincial Tax
  const provincialResult = calculateProvincialTax(taxableIncome, input.province);
  const provincialTax = provincialResult.netTax;

  // Calculate Ontario Health Premium if applicable
  const healthPremium = input.province === 'ON'
    ? calculateOntarioHealthPremium(taxableIncome)
    : 0;

  // Total Tax
  const totalTax = federalTax + provincialTax + healthPremium;

  // Total Withheld
  const totalWithheld = input.taxWithheld || 0;

  // Refund or Owing
  const refundOrOwing = totalWithheld - totalTax;

  return {
    totalIncome,
    totalDeductions,
    taxableIncome,
    federalTax,
    provincialTax,
    healthPremium,
    totalTax,
    totalWithheld,
    refundOrOwing,
    isRefund: refundOrOwing >= 0,
    provinceName: getProvinceName(input.province)
  };
}

// Re-export individual calculators for testing and advanced usage
export { calculateBracketedTax } from './bracket-tax';
export { calculateFederalTax, applyQuebecAbatement } from './federal-tax';
export { calculateProvincialTax, getProvinceName, requiresSeparateProvincialReturn } from './provincial-tax';
export { calculateOntarioHealthPremium } from './ontario-health-premium';
export { calculateDonationCredit, calculateMedicalCredit, calculateAdjustedBPA } from './credits';
