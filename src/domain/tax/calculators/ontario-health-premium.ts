import type { HealthPremiumBracket } from '../types';
import { ontario2024 } from '../config/provincial/ontario';

/**
 * Calculates Ontario Health Premium based on taxable income
 *
 * The premium ranges from $0 to $900 based on income levels:
 * - $0 - $20,000: No premium
 * - $20,001 - $25,000: 6% of income over $20,000
 * - $25,001 - $36,000: $300
 * - etc.
 *
 * @param income - Taxable income
 * @returns Health premium amount
 */
export function calculateOntarioHealthPremium(income: number): number {
  if (income <= 0) return 0;

  const brackets = ontario2024.healthPremium;
  if (!brackets) return 0;

  let prevMax = 0;

  for (const bracket of brackets) {
    if (income <= bracket.max) {
      // Fixed amount bracket
      if (bracket.amount !== undefined) {
        return bracket.amount;
      }

      // Progressive bracket with rate
      let premium = (bracket.base || 0) + (income - prevMax) * (bracket.rate || 0);

      // Apply cap if specified
      if (bracket.cap !== undefined) {
        premium = Math.min(premium, bracket.cap);
      }

      return premium;
    }
    prevMax = bracket.max;
  }

  // Maximum premium for very high income
  return 900;
}
