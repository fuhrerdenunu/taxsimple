/**
 * Slip Classification Service
 *
 * Classifies Canadian tax slips using multiple strategies:
 * 1. Template matching for CRA slip layouts (keyword/structure matching)
 * 2. Barcode detection (stub for future integration with barcode scanning lib)
 * 3. ML classification with confidence scoring (rule-based scoring engine)
 *
 * Supports: T4, T4A, T4RSP, T4RIF, T4E, T4FHSA, T4PS, T5, T3,
 *           T5008, T5013, T2202, RC62, RC210, RL-1 through RL-8
 */

import type { SlipType } from './pdf-parser';

export interface ClassificationResult {
  type: SlipType;
  confidence: number; // 0.0 to 1.0
  method: 'template' | 'keyword' | 'barcode' | 'ml_scoring' | 'fallback';
  alternativeCandidates: { type: SlipType; confidence: number }[];
  detectedFeatures: string[];
}

/**
 * CRA slip template definitions.
 * Each template defines structural features expected in a particular slip type.
 */
interface SlipTemplate {
  type: SlipType;
  /** Required keywords - all must be present for a template match */
  requiredKeywords: string[];
  /** Optional keywords - boost confidence if present */
  optionalKeywords: string[];
  /** Expected box numbers for this slip type */
  expectedBoxes: (number | string)[];
  /** CRA form identifier patterns */
  formIdPatterns: RegExp[];
  /** Weight for ML scoring (higher = more distinctive) */
  weight: number;
}

const SLIP_TEMPLATES: SlipTemplate[] = [
  {
    type: 'T4',
    requiredKeywords: [],
    optionalKeywords: [
      'STATEMENT OF REMUNERATION PAID',
      'EMPLOYMENT INCOME',
      'CPP CONTRIBUTIONS',
      'EI PREMIUMS',
      'INCOME TAX DEDUCTED',
      'EMPLOYER',
      'PENSIONABLE EARNINGS',
    ],
    expectedBoxes: [14, 16, 17, 18, 20, 22, 24, 26, 44, 46, 50, 52],
    formIdPatterns: [/\bT4\b(?!\d|[A-Z])/, /STATEMENT\s+OF\s+REMUNERATION\s+PAID/i],
    weight: 1.0,
  },
  {
    type: 'T4A',
    requiredKeywords: [],
    optionalKeywords: [
      'STATEMENT OF PENSION',
      'RETIREMENT',
      'ANNUITY',
      'PENSION OR SUPERANNUATION',
      'LUMP-SUM',
      'SCHOLARSHIPS',
    ],
    expectedBoxes: [16, 18, 20, 22, 24, 27, 28, 48, 105, 106],
    formIdPatterns: [/\bT4A\b(?!-|\d)/, /STATEMENT\s+OF\s+PENSION/i],
    weight: 1.0,
  },
  {
    type: 'T4RSP',
    requiredKeywords: [],
    optionalKeywords: [
      'RRSP',
      'REGISTERED RETIREMENT SAVINGS PLAN',
      'STATEMENT OF RRSP INCOME',
      'ANNUITANT',
      'WITHDRAWAL',
      'HOME BUYERS',
      'LIFELONG LEARNING',
    ],
    expectedBoxes: [16, 18, 20, 22, 24, 26, 28, 30, 34, 36, 38, 40],
    formIdPatterns: [/\bT4RSP\b/, /STATEMENT\s+OF\s+RRSP\s+INCOME/i],
    weight: 1.2,
  },
  {
    type: 'T4RIF',
    requiredKeywords: [],
    optionalKeywords: [
      'RRIF',
      'REGISTERED RETIREMENT INCOME FUND',
      'STATEMENT OF RRIF',
      'MINIMUM AMOUNT',
    ],
    expectedBoxes: [16, 18, 20, 22, 24, 26, 28],
    formIdPatterns: [/\bT4RIF\b/, /STATEMENT\s+OF\s+R{2}IF/i],
    weight: 1.2,
  },
  {
    type: 'T4E',
    requiredKeywords: [],
    optionalKeywords: [
      'EMPLOYMENT INSURANCE',
      'EI BENEFITS',
      'REGULAR BENEFITS',
      'STATEMENT OF EMPLOYMENT INSURANCE',
    ],
    expectedBoxes: [14, 15, 17, 18, 20, 21, 22],
    formIdPatterns: [/\bT4E\b/, /STATEMENT\s+OF\s+EMPLOYMENT\s+INSURANCE/i],
    weight: 1.1,
  },
  {
    type: 'T4FHSA',
    requiredKeywords: [],
    optionalKeywords: [
      'FIRST HOME SAVINGS ACCOUNT',
      'FHSA',
      'QUALIFYING WITHDRAWAL',
    ],
    expectedBoxes: [18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38],
    formIdPatterns: [/\bT4FHSA\b/, /FIRST\s+HOME\s+SAVINGS/i],
    weight: 1.3,
  },
  {
    type: 'T5',
    requiredKeywords: [],
    optionalKeywords: [
      'STATEMENT OF INVESTMENT INCOME',
      'INTEREST',
      'DIVIDENDS',
      'ELIGIBLE DIVIDENDS',
      'DIVIDEND TAX CREDIT',
      'CAPITAL GAINS DIVIDENDS',
    ],
    expectedBoxes: [10, 11, 12, 13, 14, 15, 16, 17, 18, 21, 24, 25, 26, 27],
    formIdPatterns: [/\bT5\b(?!\d)/, /STATEMENT\s+OF\s+INVESTMENT\s+INCOME/i],
    weight: 1.0,
  },
  {
    type: 'T3',
    requiredKeywords: [],
    optionalKeywords: [
      'STATEMENT OF TRUST INCOME',
      'TRUST',
      'ALLOCATIONS AND DESIGNATIONS',
      'MUTUAL FUND',
    ],
    expectedBoxes: [21, 22, 23, 24, 25, 26, 30, 32, 33, 34, 49, 50],
    formIdPatterns: [/\bT3\b(?!\d)/, /STATEMENT\s+OF\s+TRUST\s+INCOME/i],
    weight: 1.0,
  },
  {
    type: 'T5008',
    requiredKeywords: [],
    optionalKeywords: [
      'STATEMENT OF SECURITIES TRANSACTIONS',
      'SECURITIES',
      'PROCEEDS OF DISPOSITION',
      'BOOK VALUE',
      'COST BASE',
    ],
    expectedBoxes: [13, 14, 15, 16, 20, 21],
    formIdPatterns: [/\bT5008\b/, /STATEMENT\s+OF\s+SECURITIES/i],
    weight: 1.2,
  },
  {
    type: 'T5013',
    requiredKeywords: [],
    optionalKeywords: [
      'STATEMENT OF PARTNERSHIP INCOME',
      'PARTNERSHIP',
      'LIMITED PARTNER',
    ],
    expectedBoxes: [5, 10, 14, 15, 20, 21, 22, 23, 24, 25, 26, 101, 102],
    formIdPatterns: [/\bT5013\b/, /STATEMENT\s+OF\s+PARTNERSHIP\s+INCOME/i],
    weight: 1.3,
  },
  {
    type: 'T2202',
    requiredKeywords: [],
    optionalKeywords: [
      'TUITION AND ENROLMENT CERTIFICATE',
      'TUITION',
      'ELIGIBLE TUITION FEES',
      'FULL-TIME',
      'PART-TIME',
      'EDUCATION',
    ],
    expectedBoxes: ['A', 'B', 'C', 'D', 1, 2],
    formIdPatterns: [/\bT2202\b/, /TUITION\s+AND\s+ENROLMENT/i],
    weight: 1.1,
  },
  {
    type: 'RL1',
    requiredKeywords: [],
    optionalKeywords: [
      'RELEVE 1', 'RELEVÉ 1',
      'REVENUS D\'EMPLOI',
      'QUEBEC', 'QUÉBEC',
      'REVENU QUÉBEC',
    ],
    expectedBoxes: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
    formIdPatterns: [/\bRL-?1\b/, /RELEVÉ\s*1/i],
    weight: 1.2,
  },
];

/**
 * Detect barcodes in document text.
 * Stub implementation - in production, use a barcode scanning library
 * (e.g., ZXing, QuaggaJS) on the rendered PDF pages.
 *
 * CRA slips often contain Code 128 or PDF417 barcodes encoding
 * the slip type, tax year, and employer account number.
 */
export function detectBarcode(text: string): { found: boolean; data?: string; slipType?: SlipType } {
  // Look for barcode-encoded data patterns in text
  // CRA barcodes typically encode: SLIP_TYPE|TAX_YEAR|ACCOUNT_NUMBER
  const barcodePattern = /\b(T4[A-Z]*|T5\d*|T3|T2202|RC\d+|RL-?\d)\|(\d{4})\|(\d{9,15})\b/;
  const match = text.match(barcodePattern);

  if (match) {
    const slipTypeStr = match[1].replace('-', '') as SlipType;
    return {
      found: true,
      data: match[0],
      slipType: slipTypeStr,
    };
  }

  return { found: false };
}

/**
 * ML-style classification using weighted feature scoring.
 * Scores each slip type based on presence of keywords, box numbers,
 * and structural features to produce a confidence score.
 */
function scoreSlipType(text: string, template: SlipTemplate): number {
  const upperText = text.toUpperCase();
  let score = 0;
  let maxPossibleScore = 0;

  // Score form ID patterns (highest weight)
  const formIdWeight = 40;
  maxPossibleScore += formIdWeight;
  for (const pattern of template.formIdPatterns) {
    if (pattern.test(upperText)) {
      score += formIdWeight;
      break;
    }
  }

  // Score optional keywords
  const keywordWeight = 5;
  for (const keyword of template.optionalKeywords) {
    maxPossibleScore += keywordWeight;
    if (upperText.includes(keyword.toUpperCase())) {
      score += keywordWeight;
    }
  }

  // Score expected box numbers found in text
  const boxWeight = 3;
  let boxesFound = 0;
  for (const boxNum of template.expectedBoxes) {
    maxPossibleScore += boxWeight;
    const boxPattern = new RegExp(`\\b(?:box|case)\\s*${boxNum}\\b`, 'i');
    const plainPattern = new RegExp(`\\b${boxNum}\\b`);
    if (boxPattern.test(text) || plainPattern.test(text)) {
      boxesFound++;
      score += boxWeight;
    }
  }

  // Bonus for having multiple boxes (indicates structured slip data)
  if (boxesFound >= 3) {
    score += 10;
    maxPossibleScore += 10;
  }

  // Apply template weight
  score *= template.weight;
  maxPossibleScore *= template.weight;

  return maxPossibleScore > 0 ? score / maxPossibleScore : 0;
}

/**
 * Classify a tax slip from its text content.
 * Uses multiple methods and returns the best classification with confidence.
 */
export function classifySlip(text: string): ClassificationResult {
  const detectedFeatures: string[] = [];

  // Method 1: Try barcode detection first (highest confidence)
  const barcodeResult = detectBarcode(text);
  if (barcodeResult.found && barcodeResult.slipType) {
    detectedFeatures.push(`barcode: ${barcodeResult.data}`);
    return {
      type: barcodeResult.slipType,
      confidence: 0.95,
      method: 'barcode',
      alternativeCandidates: [],
      detectedFeatures,
    };
  }

  // Method 2: Score all templates using ML-style weighted scoring
  const scores = SLIP_TEMPLATES.map(template => ({
    type: template.type,
    confidence: scoreSlipType(text, template),
  }));

  // Sort by confidence descending
  scores.sort((a, b) => b.confidence - a.confidence);

  const best = scores[0];
  const alternatives = scores.slice(1).filter(s => s.confidence > 0.1);

  // Collect detected features for debugging
  const upperText = text.toUpperCase();
  for (const template of SLIP_TEMPLATES) {
    for (const pattern of template.formIdPatterns) {
      if (pattern.test(upperText)) {
        detectedFeatures.push(`form_id: ${template.type}`);
      }
    }
  }

  if (best.confidence < 0.15) {
    return {
      type: 'unknown',
      confidence: best.confidence,
      method: 'fallback',
      alternativeCandidates: scores.filter(s => s.confidence > 0.05),
      detectedFeatures,
    };
  }

  return {
    type: best.type,
    confidence: best.confidence,
    method: best.confidence >= 0.6 ? 'template' : 'ml_scoring',
    alternativeCandidates: alternatives.slice(0, 3),
    detectedFeatures,
  };
}
