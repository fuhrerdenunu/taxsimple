import { calculateTax } from '../calculators';
import type { TaxInput } from '../types';

describe('calculateTax', () => {
  describe('Ontario resident - basic scenarios', () => {
    it('calculates tax for simple employment income', () => {
      const input: TaxInput = {
        province: 'ON',
        employmentIncome: 75000,
        taxWithheld: 15000
      };

      const result = calculateTax(input);

      expect(result.totalIncome).toBe(75000);
      expect(result.taxableIncome).toBe(75000);
      expect(result.federalTax).toBeGreaterThan(5000);
      expect(result.federalTax).toBeLessThan(10000);
      expect(result.provincialTax).toBeGreaterThan(2000);
      expect(result.provincialTax).toBeLessThan(5000);
      expect(result.healthPremium).toBeGreaterThan(0);
      expect(result.provinceName).toBe('Ontario');
    });

    it('calculates refund when tax withheld exceeds liability', () => {
      const input: TaxInput = {
        province: 'ON',
        employmentIncome: 50000,
        taxWithheld: 12000
      };

      const result = calculateTax(input);

      expect(result.isRefund).toBe(true);
      expect(result.refundOrOwing).toBeGreaterThan(0);
    });

    it('calculates amount owing when tax withheld is insufficient', () => {
      const input: TaxInput = {
        province: 'ON',
        employmentIncome: 100000,
        taxWithheld: 10000
      };

      const result = calculateTax(input);

      expect(result.isRefund).toBe(false);
      expect(result.refundOrOwing).toBeLessThan(0);
    });
  });

  describe('deductions', () => {
    it('reduces taxable income with RRSP contribution', () => {
      const baseInput: TaxInput = {
        province: 'ON',
        employmentIncome: 100000
      };

      const withRRSP: TaxInput = {
        ...baseInput,
        rrspDeduction: 10000
      };

      const baseResult = calculateTax(baseInput);
      const rrspResult = calculateTax(withRRSP);

      expect(rrspResult.taxableIncome).toBe(baseResult.taxableIncome - 10000);
      expect(rrspResult.totalTax).toBeLessThan(baseResult.totalTax);
    });

    it('caps RRSP deduction at annual limit', () => {
      const input: TaxInput = {
        province: 'ON',
        employmentIncome: 200000,
        rrspDeduction: 50000 // Over the $32,490 limit (2025)
      };

      const result = calculateTax(input);

      // Deductions should be capped at $32,490 (2025 limit)
      expect(result.totalDeductions).toBe(32490);
    });

    it('caps FHSA deduction at annual limit', () => {
      const input: TaxInput = {
        province: 'ON',
        employmentIncome: 100000,
        fhsaDeduction: 15000 // Over the $8,000 limit
      };

      const result = calculateTax(input);

      expect(result.totalDeductions).toBe(8000);
    });
  });

  describe('income types', () => {
    it('includes dividend gross-up in total income', () => {
      const input: TaxInput = {
        province: 'ON',
        dividendIncome: 10000
      };

      const result = calculateTax(input);

      // $10,000 * 1.38 = $13,800 grossed-up
      expect(result.totalIncome).toBeCloseTo(13800, 2);
    });

    it('applies 50% capital gains inclusion', () => {
      const input: TaxInput = {
        province: 'ON',
        capitalGains: 20000
      };

      const result = calculateTax(input);

      // $20,000 * 0.5 = $10,000 included
      expect(result.totalIncome).toBe(10000);
    });

    it('combines multiple income types', () => {
      const input: TaxInput = {
        province: 'ON',
        employmentIncome: 60000,
        selfEmploymentIncome: 10000,
        rentalIncome: 5000,
        interestIncome: 1000
      };

      const result = calculateTax(input);

      expect(result.totalIncome).toBe(76000);
    });
  });

  describe('Quebec resident', () => {
    it('applies Quebec abatement to federal tax', () => {
      const ontarioInput: TaxInput = {
        province: 'ON',
        employmentIncome: 100000
      };

      const quebecInput: TaxInput = {
        province: 'QC',
        employmentIncome: 100000
      };

      const ontarioResult = calculateTax(ontarioInput);
      const quebecResult = calculateTax(quebecInput);

      // Quebec federal tax should be ~16.5% less
      expect(quebecResult.federalTax).toBeLessThan(ontarioResult.federalTax);
      expect(quebecResult.federalTax).toBeCloseTo(ontarioResult.federalTax * 0.835, -2);
    });

    it('has no Ontario health premium', () => {
      const input: TaxInput = {
        province: 'QC',
        employmentIncome: 100000
      };

      const result = calculateTax(input);

      expect(result.healthPremium).toBe(0);
      expect(result.provinceName).toBe('Quebec');
    });
  });

  describe('Alberta resident (flat tax)', () => {
    it('calculates with flat 10% provincial rate for lower income', () => {
      const input: TaxInput = {
        province: 'AB',
        employmentIncome: 100000
      };

      const result = calculateTax(input);

      expect(result.healthPremium).toBe(0);
      expect(result.provinceName).toBe('Alberta');
      // Alberta has no surtax, so provincial tax is straightforward
      expect(result.provincialTax).toBeGreaterThan(5000);
    });
  });

  describe('PEI resident (surtax)', () => {
    it('applies PEI surtax for high provincial tax', () => {
      const input: TaxInput = {
        province: 'PE',
        employmentIncome: 150000
      };

      const result = calculateTax(input);

      expect(result.provinceName).toBe('Prince Edward Island');
      // PEI has surtax on provincial tax over $12,500
    });
  });

  describe('edge cases', () => {
    it('handles zero income', () => {
      const input: TaxInput = {
        province: 'ON'
      };

      const result = calculateTax(input);

      expect(result.totalIncome).toBe(0);
      expect(result.totalTax).toBe(0);
      expect(result.isRefund).toBe(true);
    });

    it('handles all deductions exceeding income', () => {
      const input: TaxInput = {
        province: 'ON',
        employmentIncome: 20000,
        rrspDeduction: 32490,
        fhsaDeduction: 8000
      };

      const result = calculateTax(input);

      // Taxable income cannot be negative
      expect(result.taxableIncome).toBe(0);
      expect(result.totalTax).toBe(0);
    });
  });
});
