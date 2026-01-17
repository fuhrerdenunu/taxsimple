import type { TaxBracket } from '../types';

/**
 * Calculates tax using graduated tax brackets
 *
 * @param income - Taxable income amount
 * @param brackets - Array of tax brackets with min, max, and rate
 * @returns Total tax amount (always >= 0)
 *
 * @example
 * const brackets = [
 *   { min: 0, max: 50000, rate: 0.15 },
 *   { min: 50000, max: 100000, rate: 0.20 }
 * ];
 * calculateBracketedTax(75000, brackets); // Returns 12,500
 */
export function calculateBracketedTax(income: number, brackets: TaxBracket[]): number {
  if (income <= 0) return 0;

  let tax = 0;
  let remaining = income;

  for (const bracket of brackets) {
    if (remaining <= 0) break;

    const bracketSize = bracket.max === Infinity
      ? remaining
      : bracket.max - bracket.min;
    const taxable = Math.min(remaining, bracketSize);

    tax += taxable * bracket.rate;
    remaining -= taxable;
  }

  return Math.max(0, tax);
}
