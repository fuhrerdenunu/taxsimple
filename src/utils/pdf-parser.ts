import * as pdfjsLib from 'pdfjs-dist';

// Set up the worker for pdfjs-dist v3.x
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

// PDF.js text content item interface
interface TextItem {
  str: string;
  transform?: number[];
}

// Supported slip types
export type SlipType =
  | 'T4'      // Employment income
  | 'T4A'     // Pension, retirement, annuity, other income
  | 'T4FHSA'  // First Home Savings Account
  | 'T4E'     // Employment Insurance
  | 'T4RSP'   // RRSP income
  | 'T4RIF'   // RRIF income
  | 'T5'      // Investment income
  | 'T3'      // Trust income
  | 'T5008'   // Securities transactions
  | 'T5013'   // Partnership income
  | 'T2202'   // Tuition and education
  | 'RC62'    // Universal Child Care Benefit
  | 'RC210'   // Working Income Tax Benefit
  | 'T4A-RCA' // Retirement Compensation Arrangement
  | 'T4PS'    // Employee Profit Sharing
  | 'T10'     // Pension adjustment
  | 'RL1'     // Quebec employment income (Relevé 1)
  | 'RL2'     // Quebec retirement income
  | 'RL3'     // Quebec investment income
  | 'RL8'     // Quebec tuition
  | 'unknown';

// Generic parsed data type
export interface ParsedSlipData {
  type: SlipType;
  payerName?: string;
  boxes: Record<string | number, number>;
  rawText?: string;
  confidence: 'high' | 'medium' | 'low';
}

// Parse a currency string to number
const parseCurrency = (value: string): number => {
  return parseFloat(value.replace(/[$,\s]/g, '').trim()) || 0;
};

// Generic box extraction - looks for "Box XX" or just numbers in context
const extractBoxValue = (text: string, boxNum: number | string): number | undefined => {
  const boxStr = String(boxNum);
  const patterns = [
    new RegExp(`box\\s*${boxStr}[:\\s]+\\$?([\\d,]+\\.?\\d*)`, 'i'),
    new RegExp(`case\\s*${boxStr}[:\\s]+\\$?([\\d,]+\\.?\\d*)`, 'i'), // French
    new RegExp(`(?:^|\\s)${boxStr}[:\\s]+\\$?([\\d,]+\\.?\\d*)`, 'im'),
    new RegExp(`\\b${boxStr}\\b[^\\d]{0,10}\\$?([\\d,]+\\.?\\d*)`, 'i')
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const value = parseCurrency(match[1]);
      if (value > 0) return value;
    }
  }
  return undefined;
};

// Extract payer/employer name
const extractPayerName = (text: string): string | undefined => {
  const patterns = [
    /employer['']?s?\s+name[:\s]+([^\n]+)/i,
    /payer['']?s?\s+name[:\s]+([^\n]+)/i,
    /nom\s+de\s+l['']?employeur[:\s]+([^\n]+)/i,
    /issuer['']?s?\s+name[:\s]+([^\n]+)/i,
    /financial\s+institution[:\s]+([^\n]+)/i,
    /name\s+of\s+trust[:\s]+([^\n]+)/i,
    /from[:\s]+([A-Z][A-Za-z\s&.,]+(?:Inc|Ltd|Corp|Corporation|Company|Co|Bank|Trust|University|College)\.?)/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim().substring(0, 100);
    }
  }
  return undefined;
};

// Detect document type from text content
const detectDocumentType = (text: string): SlipType => {
  const upperText = text.toUpperCase();

  // Quebec forms (RL/Relevé)
  if (upperText.includes('RELEVÉ 1') || upperText.includes('RL-1') || upperText.includes('RL1')) return 'RL1';
  if (upperText.includes('RELEVÉ 2') || upperText.includes('RL-2') || upperText.includes('RL2')) return 'RL2';
  if (upperText.includes('RELEVÉ 3') || upperText.includes('RL-3') || upperText.includes('RL3')) return 'RL3';
  if (upperText.includes('RELEVÉ 8') || upperText.includes('RL-8') || upperText.includes('RL8')) return 'RL8';

  // Specific T-slips (order matters - check specific ones first)
  if (upperText.includes('T4FHSA') || upperText.includes('FIRST HOME SAVINGS')) return 'T4FHSA';
  if (upperText.includes('T4A-RCA') || upperText.includes('RETIREMENT COMPENSATION')) return 'T4A-RCA';
  if (upperText.includes('T4RSP') || upperText.includes('RRSP INCOME')) return 'T4RSP';
  if (upperText.includes('T4RIF') || upperText.includes('RRIF INCOME')) return 'T4RIF';
  if (upperText.includes('T4PS') || upperText.includes('PROFIT SHARING')) return 'T4PS';
  if (upperText.includes('T4E') || upperText.includes('EMPLOYMENT INSURANCE')) return 'T4E';
  if (upperText.includes('T4A') || upperText.includes('STATEMENT OF PENSION')) return 'T4A';
  if (upperText.includes('T5008') || upperText.includes('SECURITIES TRANSACTIONS')) return 'T5008';
  if (upperText.includes('T5013') || upperText.includes('PARTNERSHIP')) return 'T5013';
  if (upperText.includes('T2202') || upperText.includes('TUITION') || upperText.includes('EDUCATION AMOUNTS')) return 'T2202';
  if (upperText.includes('T5') || upperText.includes('STATEMENT OF INVESTMENT INCOME')) return 'T5';
  if (upperText.includes('T3') || upperText.includes('TRUST INCOME') || upperText.includes('STATEMENT OF TRUST')) return 'T3';
  if (upperText.includes('T10') || upperText.includes('PENSION ADJUSTMENT')) return 'T10';
  if (upperText.includes('RC62') || upperText.includes('UNIVERSAL CHILD CARE')) return 'RC62';
  if (upperText.includes('RC210') || upperText.includes('WORKING INCOME TAX')) return 'RC210';
  if (upperText.includes('T4') || upperText.includes('STATEMENT OF REMUNERATION') || upperText.includes('EMPLOYMENT INCOME')) return 'T4';

  return 'unknown';
};

// Box definitions for each slip type
const SLIP_BOXES: Record<string, (number | string)[]> = {
  T4: [14, 16, 17, 18, 20, 22, 24, 26, 44, 46, 50, 52, 55, 56],
  T4A: [16, 18, 20, 22, 24, 27, 28, 48, 105, 106, 107, 108, 109, 110, 111, 112, 116, 117, 118, 119, 130, 131, 132, 133, 134, 135],
  T4FHSA: [18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38],
  T4E: [14, 15, 17, 18, 20, 21, 22],
  T4RSP: [16, 18, 20, 22, 24, 26, 28, 30, 34, 36, 38, 40],
  T4RIF: [16, 18, 20, 22, 24, 26, 28],
  T5: [10, 11, 12, 13, 14, 15, 16, 17, 18, 21, 24, 25, 26, 27],
  T3: [21, 22, 23, 24, 25, 26, 30, 32, 33, 34, 37, 38, 39, 40, 41, 42, 49, 50, 51, 52],
  T5008: [13, 14, 15, 16, 20, 21],
  T5013: [5, 10, 14, 15, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155],
  T2202: ['A', 'B', 'C', 'D', 1, 2],
  RL1: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W'],
  RL2: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'],
  RL3: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'],
  RL8: ['A', 'B', 'C', 'D', 'E', 'O'],
};

// Parse generic slip
const parseGenericSlip = (text: string, slipType: SlipType): ParsedSlipData => {
  const result: ParsedSlipData = { type: slipType, boxes: {}, confidence: 'medium' };
  result.payerName = extractPayerName(text);

  const boxesToCheck = SLIP_BOXES[slipType] || [];
  let foundBoxes = 0;

  for (const boxNum of boxesToCheck) {
    const value = extractBoxValue(text, boxNum);
    if (value !== undefined) {
      result.boxes[boxNum] = value;
      foundBoxes++;
    }
  }

  // Set confidence based on how many boxes were found
  if (foundBoxes >= 3) {
    result.confidence = 'high';
  } else if (foundBoxes >= 1) {
    result.confidence = 'medium';
  } else {
    result.confidence = 'low';
  }

  return result;
};

// Special handling for T4
const parseT4 = (text: string): ParsedSlipData => {
  const result = parseGenericSlip(text, 'T4');

  // Special handling for employment income (Box 14)
  if (!result.boxes[14]) {
    const incomeMatch = text.match(/employment\s+income[:\s]+\$?([\d,]+\.?\d*)/i);
    if (incomeMatch) {
      result.boxes[14] = parseCurrency(incomeMatch[1]);
    }
  }

  // Tax deducted (Box 22)
  if (!result.boxes[22]) {
    const taxMatch = text.match(/income\s+tax\s+deducted[:\s]+\$?([\d,]+\.?\d*)/i);
    if (taxMatch) {
      result.boxes[22] = parseCurrency(taxMatch[1]);
    }
  }

  return result;
};

// Special handling for T5
const parseT5 = (text: string): ParsedSlipData => {
  const result = parseGenericSlip(text, 'T5');

  // Interest
  if (!result.boxes[13]) {
    const interestMatch = text.match(/interest\s+(?:from|income)[:\s]+\$?([\d,]+\.?\d*)/i);
    if (interestMatch) {
      result.boxes[13] = parseCurrency(interestMatch[1]);
    }
  }

  // Dividends
  if (!result.boxes[24]) {
    const dividendMatch = text.match(/(?:actual|eligible)\s+dividend[s]?[:\s]+\$?([\d,]+\.?\d*)/i);
    if (dividendMatch) {
      result.boxes[24] = parseCurrency(dividendMatch[1]);
    }
  }

  return result;
};

// Special handling for T2202 (Tuition)
const parseT2202 = (text: string): ParsedSlipData => {
  const result = parseGenericSlip(text, 'T2202');

  // Tuition fees
  const tuitionMatch = text.match(/tuition\s+fees[:\s]+\$?([\d,]+\.?\d*)/i);
  if (tuitionMatch) {
    result.boxes['A'] = parseCurrency(tuitionMatch[1]);
  }

  // Full-time months
  const ftMatch = text.match(/full[- ]time\s+months[:\s]+(\d+)/i);
  if (ftMatch) {
    result.boxes['B'] = parseInt(ftMatch[1]);
  }

  // Part-time months
  const ptMatch = text.match(/part[- ]time\s+months[:\s]+(\d+)/i);
  if (ptMatch) {
    result.boxes['C'] = parseInt(ptMatch[1]);
  }

  return result;
};

// Special handling for T3 (Trust)
const parseT3 = (text: string): ParsedSlipData => {
  const result = parseGenericSlip(text, 'T3');

  // Capital gains
  const cgMatch = text.match(/capital\s+gains[:\s]+\$?([\d,]+\.?\d*)/i);
  if (cgMatch && !result.boxes[21]) {
    result.boxes[21] = parseCurrency(cgMatch[1]);
  }

  // Dividends
  const divMatch = text.match(/dividend[s]?[:\s]+\$?([\d,]+\.?\d*)/i);
  if (divMatch && !result.boxes[49]) {
    result.boxes[49] = parseCurrency(divMatch[1]);
  }

  return result;
};

// Parse any tax slip from text
export const parseSlipText = (text: string): ParsedSlipData => {
  const docType = detectDocumentType(text);
  let result: ParsedSlipData;

  switch (docType) {
    case 'T4':
      result = parseT4(text);
      break;
    case 'T5':
      result = parseT5(text);
      break;
    case 'T2202':
      result = parseT2202(text);
      break;
    case 'T3':
      result = parseT3(text);
      break;
    case 'unknown':
      // Try to extract any recognizable box values from all types
      result = { type: 'unknown', boxes: {}, confidence: 'low' };
      result.payerName = extractPayerName(text);
      for (const slipType of Object.keys(SLIP_BOXES)) {
        for (const boxNum of SLIP_BOXES[slipType]) {
          const value = extractBoxValue(text, boxNum);
          if (value !== undefined && !result.boxes[boxNum]) {
            result.boxes[boxNum] = value;
          }
        }
      }
      break;
    default:
      result = parseGenericSlip(text, docType);
  }

  result.rawText = text;
  return result;
};

// Extract text from PDF file
export const extractTextFromPDF = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();

  try {
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => (item as TextItem).str)
        .join(' ');
      fullText += pageText + '\n';
    }

    return fullText;
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to parse PDF. Please ensure the file is a valid PDF document.');
  }
};

// Main function to parse any tax slip from PDF
export const parseSlipFromPDF = async (file: File): Promise<ParsedSlipData> => {
  const text = await extractTextFromPDF(file);
  return parseSlipText(text);
};

// Get human-readable slip name
export const getSlipDisplayName = (type: SlipType): string => {
  const names: Record<SlipType, string> = {
    T4: 'T4 - Employment Income',
    T4A: 'T4A - Pension & Other Income',
    T4FHSA: 'T4FHSA - First Home Savings Account',
    T4E: 'T4E - Employment Insurance',
    T4RSP: 'T4RSP - RRSP Income',
    T4RIF: 'T4RIF - RRIF Income',
    'T4A-RCA': 'T4A-RCA - Retirement Compensation',
    T4PS: 'T4PS - Profit Sharing',
    T5: 'T5 - Investment Income',
    T3: 'T3 - Trust Income',
    T5008: 'T5008 - Securities Transactions',
    T5013: 'T5013 - Partnership Income',
    T2202: 'T2202 - Tuition & Education',
    T10: 'T10 - Pension Adjustment',
    RC62: 'RC62 - Universal Child Care Benefit',
    RC210: 'RC210 - Working Income Tax Benefit',
    RL1: 'RL-1 - Québec Employment Income',
    RL2: 'RL-2 - Québec Retirement Income',
    RL3: 'RL-3 - Québec Investment Income',
    RL8: 'RL-8 - Québec Tuition',
    unknown: 'Unknown Document'
  };
  return names[type] || type;
};
