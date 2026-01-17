import { calculateBracketedTax } from '../calculators/bracket-tax';
import { federal2024 } from '../config/federal';

describe('calculateBracketedTax', () => {
  const federalBrackets = federal2024.brackets;

  describe('basic calculations', () => {
    it('returns 0 for zero income', () => {
      expect(calculateBracketedTax(0, federalBrackets)).toBe(0);
    });

    it('returns 0 for negative income', () => {
      expect(calculateBracketedTax(-10000, federalBrackets)).toBe(0);
    });

    it('calculates tax for income in first bracket only', () => {
      // $50,000 at 15% = $7,500
      const result = calculateBracketedTax(50000, federalBrackets);
      expect(result).toBeCloseTo(7500, 2);
    });

    it('calculates tax for income at first bracket boundary', () => {
      // $55,867 at 15% = $8,380.05
      const result = calculateBracketedTax(55867, federalBrackets);
      expect(result).toBeCloseTo(8380.05, 2);
    });
  });

  describe('multi-bracket calculations', () => {
    it('calculates tax spanning two brackets', () => {
      // $75,000
      // First bracket: $55,867 * 0.15 = $8,380.05
      // Second bracket: ($75,000 - $55,867) * 0.205 = $3,922.27
      // Total: $12,302.32
      const result = calculateBracketedTax(75000, federalBrackets);
      expect(result).toBeCloseTo(12302.32, 0);
    });

    it('calculates tax spanning three brackets', () => {
      // $150,000
      // First: $55,867 * 0.15 = $8,380.05
      // Second: $55,866 * 0.205 = $11,452.53
      // Third: ($150,000 - $111,733) * 0.26 = $9,949.42
      // Total: $29,782.00
      const result = calculateBracketedTax(150000, federalBrackets);
      expect(result).toBeCloseTo(29782, 0);
    });

    it('calculates tax for high income in top bracket', () => {
      // $500,000 spans all 5 brackets
      const result = calculateBracketedTax(500000, federalBrackets);
      expect(result).toBeGreaterThan(140000);
      expect(result).toBeLessThan(165000);
    });
  });

  describe('edge cases', () => {
    it('handles single bracket configuration', () => {
      const singleBracket = [{ min: 0, max: Infinity, rate: 0.10 }];
      expect(calculateBracketedTax(100000, singleBracket)).toBe(10000);
    });

    it('handles empty brackets array', () => {
      expect(calculateBracketedTax(100000, [])).toBe(0);
    });

    it('handles very small income', () => {
      const result = calculateBracketedTax(1, federalBrackets);
      expect(result).toBeCloseTo(0.15, 2);
    });

    it('handles very large income', () => {
      // $10 million
      const result = calculateBracketedTax(10000000, federalBrackets);
      expect(result).toBeGreaterThan(3000000);
    });
  });
});
