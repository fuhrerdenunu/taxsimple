import type { ProvinceCode, ProvincialConfig, OntarioSurtax, PEISurtax } from '../types';
import { getProvincialConfig } from '../config/provincial';
import { calculateBracketedTax } from './bracket-tax';

interface ProvincialTaxResult {
  grossTax: number;
  credits: number;
  surtax: number;
  netTax: number;
}

/**
 * Type guard for Ontario surtax configuration
 */
function isOntarioSurtax(surtax: OntarioSurtax | PEISurtax): surtax is OntarioSurtax {
  return 'first' in surtax && 'firstRate' in surtax;
}

/**
 * Type guard for PEI surtax configuration
 */
function isPEISurtax(surtax: OntarioSurtax | PEISurtax): surtax is PEISurtax {
  return 'threshold' in surtax && !('first' in surtax);
}

/**
 * Calculates Ontario surtax
 *
 * Ontario has a two-tier surtax:
 * - 20% on provincial tax over $5,554
 * - Additional 36% on provincial tax over $7,108
 *
 * @param provincialTax - Base provincial tax (after credits)
 * @param surtax - Ontario surtax configuration
 * @returns Surtax amount
 */
function calculateOntarioSurtax(provincialTax: number, surtax: OntarioSurtax): number {
  let surtaxAmount = 0;

  if (provincialTax > surtax.first) {
    surtaxAmount += (provincialTax - surtax.first) * surtax.firstRate;
  }

  if (provincialTax > surtax.second) {
    surtaxAmount += (provincialTax - surtax.second) * surtax.secondRate;
  }

  return surtaxAmount;
}

/**
 * Calculates PEI surtax
 *
 * PEI has a single-tier surtax:
 * - 10% on provincial tax over $12,500
 *
 * @param provincialTax - Base provincial tax (after credits)
 * @param surtax - PEI surtax configuration
 * @returns Surtax amount
 */
function calculatePEISurtax(provincialTax: number, surtax: PEISurtax): number {
  if (provincialTax > surtax.threshold) {
    return (provincialTax - surtax.threshold) * surtax.rate;
  }
  return 0;
}

/**
 * Calculates provincial income tax with credits and surtax
 *
 * @param taxableIncome - Net taxable income after deductions
 * @param province - Province code
 * @returns Provincial tax calculation breakdown
 */
export function calculateProvincialTax(
  taxableIncome: number,
  province: ProvinceCode
): ProvincialTaxResult {
  const config = getProvincialConfig(province);

  // Calculate gross provincial tax
  const grossTax = calculateBracketedTax(taxableIncome, config.brackets);

  // Calculate provincial basic personal amount credit
  // Use lowest bracket rate for credit calculation
  const lowestRate = config.brackets[0].rate;
  const credits = config.bpa * lowestRate;

  // Base tax after credits
  let baseTax = Math.max(0, grossTax - credits);

  // Calculate surtax if applicable
  let surtax = 0;

  if (config.surtax) {
    if (province === 'ON' && isOntarioSurtax(config.surtax)) {
      surtax = calculateOntarioSurtax(baseTax, config.surtax);
    } else if (province === 'PE' && isPEISurtax(config.surtax)) {
      surtax = calculatePEISurtax(baseTax, config.surtax);
    }
  }

  return {
    grossTax,
    credits,
    surtax,
    netTax: baseTax + surtax
  };
}

/**
 * Gets the provincial configuration for display purposes
 */
export function getProvinceName(province: ProvinceCode): string {
  return getProvincialConfig(province).name;
}

/**
 * Checks if a province requires a separate provincial return
 */
export function requiresSeparateProvincialReturn(province: ProvinceCode): boolean {
  return province === 'QC';
}
