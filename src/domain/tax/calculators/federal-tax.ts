import type { TaxInput } from '../types';
import { taxYearConfig2024 } from '../config/federal';
import { calculateBracketedTax } from './bracket-tax';
import { calculateDonationCredit, calculateMedicalCredit, calculateAdjustedBPA } from './credits';

interface FederalTaxResult {
  grossTax: number;
  credits: number;
  netTax: number;
  bpa: number;
}

/**
 * Calculates federal income tax with all applicable credits
 *
 * @param taxableIncome - Net taxable income after deductions
 * @param input - Full tax input for credit calculations
 * @returns Federal tax calculation breakdown
 */
export function calculateFederalTax(taxableIncome: number, input: TaxInput): FederalTaxResult {
  const config = taxYearConfig2024;
  const fedRate = 0.15; // Lowest federal bracket rate for credits

  // Calculate gross federal tax
  const grossTax = calculateBracketedTax(taxableIncome, config.federal.brackets);

  // Calculate adjusted Basic Personal Amount
  const bpa = calculateAdjustedBPA(taxableIncome);

  // Calculate all federal credits
  let credits = 0;

  // Basic Personal Amount credit
  credits += bpa * fedRate;

  // Canada Employment Credit
  const employmentCredit = Math.min(input.employmentIncome || 0, config.canadaEmploymentCredit);
  credits += employmentCredit * fedRate;

  // CPP contributions credit
  const cppCredit = Math.min(input.cppContributions || 0, config.cpp.max);
  credits += cppCredit * fedRate;

  // EI premiums credit
  const eiCredit = Math.min(input.eiPremiums || 0, config.ei.max);
  credits += eiCredit * fedRate;

  // Dividend tax credit (for eligible dividends)
  // Gross-up is 38%, dividend tax credit is 15.0198%
  const dividendGrossUp = (input.dividendIncome || 0) * 1.38;
  const dividendTaxCredit = dividendGrossUp * 0.150198;
  credits += dividendTaxCredit;

  // Donation credit
  credits += calculateDonationCredit(input.donations || 0, taxableIncome);

  // Medical expense credit
  credits += calculateMedicalCredit(input.medicalExpenses || 0, taxableIncome);

  // Tuition credit
  credits += (input.tuitionAmount || 0) * fedRate;

  // Net federal tax (cannot be negative)
  const netTax = Math.max(0, grossTax - credits);

  return {
    grossTax,
    credits,
    netTax,
    bpa
  };
}

/**
 * Applies Quebec abatement to federal tax
 *
 * Quebec residents receive a 16.5% reduction in federal tax
 *
 * @param federalTax - Net federal tax before abatement
 * @param abatement - Abatement rate (0.165 for Quebec)
 * @returns Federal tax after abatement
 */
export function applyQuebecAbatement(federalTax: number, abatement: number): number {
  return federalTax * (1 - abatement);
}
