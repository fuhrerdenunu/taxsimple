import { taxYearConfig2024 } from '../config/federal';

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

  const config = taxYearConfig2024.donations;

  const firstTierAmount = Math.min(donations, config.firstTier);
  const secondTierAmount = Math.max(0, donations - config.firstTier);

  // High income earners get 33% rate on donations over $200
  const highRate = taxableIncome > 246752 ? 0.33 : config.highRate;

  return firstTierAmount * config.lowRate + secondTierAmount * highRate;
}

/**
 * Calculates the medical expense tax credit
 *
 * Credit is 15% of medical expenses exceeding the threshold
 * Threshold is lesser of 3% of net income or $2,635 (2024)
 *
 * @param medicalExpenses - Total medical expenses
 * @param netIncome - Net income
 * @returns Medical expense tax credit
 */
export function calculateMedicalCredit(medicalExpenses: number, netIncome: number): number {
  if (medicalExpenses <= 0) return 0;

  const config = taxYearConfig2024.medicalThreshold;
  const threshold = Math.min(netIncome * config.rate, config.max);
  const eligibleAmount = Math.max(0, medicalExpenses - threshold);

  return eligibleAmount * 0.15; // 15% federal rate
}

/**
 * Calculates basic personal amount with high-income reduction
 *
 * BPA is reduced for income between $173,205 and $246,752
 *
 * @param taxableIncome - Taxable income
 * @returns Adjusted basic personal amount
 */
export function calculateAdjustedBPA(taxableIncome: number): number {
  const config = taxYearConfig2024.federal;

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
