import { calculateProvincialTax } from '../../calculators/provincial-tax';
import { calculateOntarioHealthPremium } from '../../calculators/ontario-health-premium';

describe('Ontario Provincial Tax', () => {
  describe('basic tax calculation', () => {
    it('calculates tax for income in first bracket', () => {
      const result = calculateProvincialTax(40000, 'ON');
      // $40,000 * 5.05% = $2,020 gross
      // Credits: $12,399 * 5.05% = $626.15
      // Net: ~$1,394
      expect(result.netTax).toBeGreaterThan(1300);
      expect(result.netTax).toBeLessThan(1500);
    });

    it('calculates tax for $100,000 income', () => {
      const result = calculateProvincialTax(100000, 'ON');
      // Should include some surtax
      expect(result.netTax).toBeGreaterThan(5500);
      expect(result.netTax).toBeLessThan(7000);
    });

    it('calculates tax for $200,000 income', () => {
      const result = calculateProvincialTax(200000, 'ON');
      expect(result.netTax).toBeGreaterThan(18000);
      expect(result.netTax).toBeLessThan(26000);
    });
  });

  describe('surtax calculation', () => {
    it('applies no surtax for low provincial tax', () => {
      const result = calculateProvincialTax(50000, 'ON');
      expect(result.surtax).toBe(0);
    });

    it('applies first tier surtax when provincial tax exceeds $5,554', () => {
      // Need ~$110k+ income for base tax > $5,554
      const result = calculateProvincialTax(120000, 'ON');
      expect(result.surtax).toBeGreaterThan(0);
    });

    it('applies both tiers for high income', () => {
      const result = calculateProvincialTax(200000, 'ON');
      // Both thresholds should be exceeded
      expect(result.surtax).toBeGreaterThan(2000);
    });
  });
});

describe('Ontario Health Premium', () => {
  it('returns 0 for income up to $20,000', () => {
    expect(calculateOntarioHealthPremium(15000)).toBe(0);
    expect(calculateOntarioHealthPremium(20000)).toBe(0);
  });

  it('calculates progressive premium $20,001-$25,000', () => {
    // $22,000: ($22,000 - $20,000) * 6% = $120
    const result = calculateOntarioHealthPremium(22000);
    expect(result).toBeCloseTo(120, 0);
  });

  it('returns $300 for income $25,001-$36,000', () => {
    expect(calculateOntarioHealthPremium(30000)).toBe(300);
    expect(calculateOntarioHealthPremium(36000)).toBe(300);
  });

  it('calculates progressive premium $36,001-$38,500', () => {
    // $37,000: $300 + ($37,000 - $36,000) * 6% = $360
    const result = calculateOntarioHealthPremium(37000);
    expect(result).toBeCloseTo(360, 0);
  });

  it('returns $450 for income $38,501-$48,000', () => {
    expect(calculateOntarioHealthPremium(45000)).toBe(450);
  });

  it('returns $600 for income $48,601-$72,000', () => {
    expect(calculateOntarioHealthPremium(60000)).toBe(600);
  });

  it('caps premium between $600-$750 for income $72,001-$200,000', () => {
    const result = calculateOntarioHealthPremium(100000);
    expect(result).toBeGreaterThanOrEqual(600);
    expect(result).toBeLessThanOrEqual(750);
  });

  it('returns $900 for income over $200,000', () => {
    expect(calculateOntarioHealthPremium(250000)).toBe(900);
    expect(calculateOntarioHealthPremium(500000)).toBe(900);
  });

  it('returns 0 for zero income', () => {
    expect(calculateOntarioHealthPremium(0)).toBe(0);
  });

  it('returns 0 for negative income', () => {
    expect(calculateOntarioHealthPremium(-10000)).toBe(0);
  });
});
