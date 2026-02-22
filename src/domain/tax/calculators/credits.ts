import { taxYearConfig2025 } from '../config/federal';

/**
 * Calculates the charitable donation tax credit
 *
 * Federal donation credit:
 * - 15% on first $200
 * - 29% on amounts over $200 (33% if income > $246,752)
 *
 * @param donations - Total charitable donations
 * @param taxableIncome - Taxable income (affects high-income rate)
 * @returns Donation tax credit amount
 */
export function calculateDonationCredit(donations: number, taxableIncome: number = 0): number {
  if (donations <= 0) return 0;

  const config = taxYearConfig2025.donations;

  const firstTierAmount = Math.min(donations, config.firstTier);
  const secondTierAmount = Math.max(0, donations - config.firstTier);

  // High income earners get 33% rate on donations over $200
  const highRate = taxableIncome > 253414 ? 0.33 : config.highRate;

  return firstTierAmount * config.lowRate + secondTierAmount * highRate;
}

/**
 * Calculates the medical expense tax credit
 *
 * Credit is 15% of medical expenses exceeding the threshold
 * Threshold is lesser of 3% of net income or $2,706 (2025)
 *
 * @param medicalExpenses - Total medical expenses
 * @param netIncome - Net income
 * @returns Medical expense tax credit
 */
export function calculateMedicalCredit(medicalExpenses: number, netIncome: number): number {
  if (medicalExpenses <= 0) return 0;

  const config = taxYearConfig2025.medicalThreshold;
  const threshold = Math.min(netIncome * config.rate, config.max);
  const eligibleAmount = Math.max(0, medicalExpenses - threshold);

  return eligibleAmount * 0.145; // 14.5% blended federal rate for 2025
}

/**
 * Calculates basic personal amount with high-income reduction
 *
 * BPA is reduced for income between $177,882 and $253,414
 *
 * @param taxableIncome - Taxable income
 * @returns Adjusted basic personal amount
 */
export function calculateAdjustedBPA(taxableIncome: number): number {
  const config = taxYearConfig2025.federal;

  if (taxableIncome <= config.bpaReduction.start) {
    return config.basicPersonalAmount;
  }

  if (taxableIncome >= config.bpaReduction.end) {
    return config.bpaReduction.minBPA;
  }

  // Linear reduction between start and end thresholds
  const reductionRatio = (taxableIncome - config.bpaReduction.start) /
    (config.bpaReduction.end - config.bpaReduction.start);

  const reduction = (config.basicPersonalAmount - config.bpaReduction.minBPA) * reductionRatio;

  return config.basicPersonalAmount - reduction;
}
