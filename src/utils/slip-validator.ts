/**
 * Slip Validation & Normalization Service
 *
 * Handles:
 * 1. Currency string normalization (to numbers)
 * 2. Box total cross-validation and range checks
 * 3. SIN format validation
 * 4. Duplicate slip detection (same employer account, slip number, box totals)
 * 5. Employer account number extraction and validation
 */

import { validateSIN } from '../domain/tax/validators/sin';
import type { ParsedSlipData, SlipType } from './pdf-parser';

export interface ValidationIssue {
  severity: 'error' | 'warning' | 'info';
  field?: string;
  message: string;
  code: string;
}

export interface NormalizedSlipData extends ParsedSlipData {
  employerAccountNumber?: string;
  slipNumber?: string;
  sinDetected?: string;
  sinValid?: boolean;
  validationIssues: ValidationIssue[];
  isDuplicate: boolean;
  duplicateOf?: string;
}

/**
 * Convert a currency string to a number.
 * Handles various formats: $1,234.56, 1234.56, $1 234,56 (French), etc.
 */
export function normalizeCurrency(value: string | number): number {
  if (typeof value === 'number') return value;

  let cleaned = value.trim();

  // Remove currency symbols and whitespace
  cleaned = cleaned.replace(/[$\u00A0\s]/g, '');

  // Handle parentheses for negative values: (1,234.56) -> -1234.56
  const isNegative = /^\(.*\)$/.test(cleaned) || cleaned.startsWith('-');
  cleaned = cleaned.replace(/[()]/g, '').replace(/^-/, '');

  // Determine decimal separator (handle French format: 1 234,56)
  const lastComma = cleaned.lastIndexOf(',');
  const lastDot = cleaned.lastIndexOf('.');

  if (lastComma > lastDot && lastComma === cleaned.length - 3) {
    // French format: comma is decimal separator
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  } else {
    // English format: dot is decimal separator
    cleaned = cleaned.replace(/,/g, '');
  }

  const result = parseFloat(cleaned) || 0;
  return isNegative ? -result : result;
}

/**
 * Known box value ranges for common slip types.
 * Values outside these ranges trigger warnings.
 */
const BOX_RANGES: Partial<Record<SlipType, Record<number | string, { min: number; max: number; label: string }>>> = {
  T4: {
    14: { min: 0, max: 500000, label: 'Employment Income' },
    16: { min: 0, max: 4056, label: 'CPP Contributions' },    // 2024 max
    18: { min: 0, max: 1049, label: 'EI Premiums' },           // 2024 max
    20: { min: 0, max: 50000, label: 'RPP Contributions' },
    22: { min: 0, max: 250000, label: 'Income Tax Deducted' },
    44: { min: 0, max: 20000, label: 'Union Dues' },
    46: { min: 0, max: 100000, label: 'Charitable Donations' },
    52: { min: 0, max: 32490, label: 'Pension Adjustment' },   // 2024 max
  },
  T4RSP: {
    16: { min: 0, max: 500000, label: 'Annuity Payments' },
    18: { min: 0, max: 500000, label: 'Refund of Premiums' },
    20: { min: 0, max: 50000, label: 'HBP Withdrawal' },       // 2024 HBP max $60k
    22: { min: 0, max: 250000, label: 'Income Tax Deducted' },
    26: { min: 0, max: 250000, label: 'LLP Withdrawal' },
    34: { min: 0, max: 500000, label: 'Excess Amount' },
  },
  T5: {
    13: { min: 0, max: 500000, label: 'Interest from Canadian Sources' },
    18: { min: 0, max: 500000, label: 'Capital Gains Dividends' },
    24: { min: 0, max: 500000, label: 'Actual Eligible Dividends' },
    25: { min: 0, max: 690000, label: 'Taxable Eligible Dividends' }, // 138% gross-up
    26: { min: 0, max: 110000, label: 'Dividend Tax Credit' },
  },
  T4A: {
    16: { min: 0, max: 500000, label: 'Pension or Superannuation' },
    18: { min: 0, max: 500000, label: 'Lump-sum Payments' },
    22: { min: 0, max: 250000, label: 'Income Tax Deducted' },
    105: { min: 0, max: 100000, label: 'Scholarships/Bursaries' },
  },
};

/**
 * Cross-validation rules for box totals.
 * Checks that related boxes have consistent values.
 */
interface CrossValidationRule {
  slipType: SlipType;
  description: string;
  validate: (boxes: Record<string | number, number>) => ValidationIssue | null;
}

const CROSS_VALIDATION_RULES: CrossValidationRule[] = [
  {
    slipType: 'T4',
    description: 'Tax deducted should not exceed employment income',
    validate: (boxes) => {
      if (boxes[22] && boxes[14] && boxes[22] > boxes[14]) {
        return {
          severity: 'warning',
          field: 'Box 22',
          message: `Tax deducted ($${boxes[22]}) exceeds employment income ($${boxes[14]}). Please verify.`,
          code: 'T4_TAX_EXCEEDS_INCOME',
        };
      }
      return null;
    },
  },
  {
    slipType: 'T4',
    description: 'CPP pensionable earnings should be >= employment income or near it',
    validate: (boxes) => {
      if (boxes[26] && boxes[14] && boxes[26] > boxes[14] * 1.1) {
        return {
          severity: 'warning',
          field: 'Box 26',
          message: `CPP pensionable earnings ($${boxes[26]}) significantly exceed employment income ($${boxes[14]}).`,
          code: 'T4_CPP_EARNINGS_HIGH',
        };
      }
      return null;
    },
  },
  {
    slipType: 'T4',
    description: 'EI insurable earnings should be <= maximum insurable earnings',
    validate: (boxes) => {
      const maxInsurable2024 = 63200;
      if (boxes[24] && boxes[24] > maxInsurable2024) {
        return {
          severity: 'warning',
          field: 'Box 24',
          message: `EI insurable earnings ($${boxes[24]}) exceed 2024 maximum ($${maxInsurable2024}).`,
          code: 'T4_EI_OVER_MAX',
        };
      }
      return null;
    },
  },
  {
    slipType: 'T5',
    description: 'Taxable eligible dividends should be ~138% of actual eligible dividends',
    validate: (boxes) => {
      if (boxes[10] && boxes[11]) {
        const expectedGrossUp = boxes[10] * 1.38;
        const tolerance = expectedGrossUp * 0.05; // 5% tolerance
        if (Math.abs(boxes[11] - expectedGrossUp) > tolerance) {
          return {
            severity: 'warning',
            field: 'Box 11',
            message: `Taxable eligible dividends ($${boxes[11]}) don't match expected 138% gross-up of actual ($${boxes[10]} -> $${expectedGrossUp.toFixed(2)}).`,
            code: 'T5_DIVIDEND_GROSSUP_MISMATCH',
          };
        }
      }
      return null;
    },
  },
  {
    slipType: 'T5',
    description: 'Taxable other dividends should be ~115% of actual other dividends',
    validate: (boxes) => {
      if (boxes[24] && boxes[25]) {
        const expectedGrossUp = boxes[24] * 1.15;
        const tolerance = expectedGrossUp * 0.05;
        if (Math.abs(boxes[25] - expectedGrossUp) > tolerance) {
          return {
            severity: 'warning',
            field: 'Box 25',
            message: `Taxable other dividends ($${boxes[25]}) don't match expected 115% gross-up of actual ($${boxes[24]} -> $${expectedGrossUp.toFixed(2)}).`,
            code: 'T5_OTHER_DIV_GROSSUP_MISMATCH',
          };
        }
      }
      return null;
    },
  },
];

/**
 * Extract employer account number from text.
 * CRA employer account numbers follow the format: 123456789RR0001
 */
export function extractEmployerAccountNumber(text: string): string | undefined {
  const patterns = [
    /\b(\d{9}RR\d{4})\b/i,                    // Standard format: 123456789RR0001
    /\b(\d{9}RP\d{4})\b/i,                     // Payroll: 123456789RP0001
    /\b(\d{9}RC\d{4})\b/i,                     // Corp: 123456789RC0001
    /employer['']?s?\s+account\s*(?:number|no\.?|#)?\s*:?\s*(\d{9}[A-Z]{2}\d{4})/i,
    /account\s*(?:number|no\.?|#)?\s*:?\s*(\d{9}[A-Z]{2}\d{4})/i,
    /numéro\s+de\s+compte[:\s]+(\d{9}[A-Z]{2}\d{4})/i, // French
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1].toUpperCase();
    }
  }
  return undefined;
}

/**
 * Extract slip/form number from text.
 */
export function extractSlipNumber(text: string): string | undefined {
  const patterns = [
    /slip\s*(?:number|no\.?|#)\s*:?\s*(\d{6,10})/i,
    /form\s*(?:number|no\.?|#)\s*:?\s*(\d{6,10})/i,
    /feuillet\s*(?:numéro|no\.?|#)\s*:?\s*(\d{6,10})/i,
    /serial\s*(?:number|no\.?|#)\s*:?\s*(\d{6,10})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1];
  }
  return undefined;
}

/**
 * Extract SIN from text if present.
 */
export function extractSIN(text: string): string | undefined {
  const patterns = [
    /\b(?:SIN|NAS|social\s+insurance)\s*(?:number|no\.?|#)?\s*:?\s*(\d{3}[\s-]?\d{3}[\s-]?\d{3})\b/i,
    /\b(\d{3}[\s-]\d{3}[\s-]\d{3})\b/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const digits = match[1].replace(/\D/g, '');
      if (digits.length === 9) return digits;
    }
  }
  return undefined;
}

/**
 * Validate and normalize a parsed slip.
 */
export function validateAndNormalize(
  parsedData: ParsedSlipData,
  existingSlips: NormalizedSlipData[] = []
): NormalizedSlipData {
  const issues: ValidationIssue[] = [];
  const rawText = parsedData.rawText || '';

  // Normalize all box values
  const normalizedBoxes: Record<string | number, number> = {};
  for (const [key, value] of Object.entries(parsedData.boxes)) {
    normalizedBoxes[key] = normalizeCurrency(value);
  }

  // Extract identifiers
  const employerAccountNumber = extractEmployerAccountNumber(rawText);
  const slipNumber = extractSlipNumber(rawText);
  const sinDetected = extractSIN(rawText);

  // Validate SIN if detected
  let sinValid: boolean | undefined;
  if (sinDetected) {
    sinValid = validateSIN(sinDetected);
    if (!sinValid) {
      issues.push({
        severity: 'warning',
        field: 'SIN',
        message: 'Detected SIN does not pass Luhn validation check. Please verify.',
        code: 'INVALID_SIN',
      });
    }
  }

  // Range validation for box values
  const ranges = BOX_RANGES[parsedData.type];
  if (ranges) {
    for (const [boxKey, value] of Object.entries(normalizedBoxes)) {
      const range = ranges[boxKey];
      if (range) {
        if (value < range.min) {
          issues.push({
            severity: 'warning',
            field: `Box ${boxKey}`,
            message: `${range.label} ($${value}) is below expected minimum ($${range.min}).`,
            code: 'VALUE_BELOW_MIN',
          });
        }
        if (value > range.max) {
          issues.push({
            severity: 'warning',
            field: `Box ${boxKey}`,
            message: `${range.label} ($${value}) exceeds expected maximum ($${range.max}). Please verify.`,
            code: 'VALUE_ABOVE_MAX',
          });
        }
      }
    }
  }

  // Cross-validation rules
  const applicableRules = CROSS_VALIDATION_RULES.filter(r => r.slipType === parsedData.type);
  for (const rule of applicableRules) {
    const issue = rule.validate(normalizedBoxes);
    if (issue) {
      issues.push(issue);
    }
  }

  // Duplicate detection
  let isDuplicate = false;
  let duplicateOf: string | undefined;

  for (const existing of existingSlips) {
    if (existing.type !== parsedData.type) continue;

    // Check same employer account number
    if (employerAccountNumber && existing.employerAccountNumber === employerAccountNumber) {
      // Same employer - check if same slip number
      if (slipNumber && existing.slipNumber === slipNumber) {
        isDuplicate = true;
        duplicateOf = existing.employerAccountNumber;
        issues.push({
          severity: 'warning',
          message: `Possible duplicate: same employer account (${employerAccountNumber}) and slip number (${slipNumber}).`,
          code: 'DUPLICATE_SLIP_NUMBER',
        });
        break;
      }
    }

    // Check if box totals are identical (strong duplicate signal)
    const existingBoxEntries = Object.entries(existing.boxes);
    if (existingBoxEntries.length > 0) {
      const allMatch = existingBoxEntries.every(
        ([key, val]) => normalizedBoxes[key] === val
      );
      const samePayerName =
        parsedData.payerName &&
        existing.payerName &&
        parsedData.payerName.toLowerCase() === existing.payerName.toLowerCase();

      if (allMatch && samePayerName && existingBoxEntries.length >= 2) {
        isDuplicate = true;
        duplicateOf = existing.payerName;
        issues.push({
          severity: 'warning',
          message: `Possible duplicate: identical box values and payer name ("${parsedData.payerName}").`,
          code: 'DUPLICATE_BOX_VALUES',
        });
        break;
      }
    }
  }

  return {
    ...parsedData,
    boxes: normalizedBoxes,
    employerAccountNumber,
    slipNumber,
    sinDetected,
    sinValid,
    validationIssues: issues,
    isDuplicate,
    duplicateOf,
  };
}
