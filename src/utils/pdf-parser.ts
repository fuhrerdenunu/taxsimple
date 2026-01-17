import * as pdfjsLib from 'pdfjs-dist';

// Set up the worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Generic parsed data type
export interface ParsedSlipData {
  type: 'T4' | 'T4A' | 'T5' | 'T2125' | 'unknown';
  payerName?: string;
  boxes: Record<number, number>;
  rawText?: string;
}

// Parse a currency string to number
const parseCurrency = (value: string): number => {
  return parseFloat(value.replace(/[$,]/g, '').trim()) || 0;
};

// Generic box extraction - looks for "Box XX" or just numbers in context
const extractBoxValue = (text: string, boxNum: number): number | undefined => {
  const patterns = [
    new RegExp(`box\\s*${boxNum}[:\\s]+\\$?([\\d,]+\\.?\\d*)`, 'i'),
    new RegExp(`${boxNum}[:\\s]+\\$?([\\d,]+\\.?\\d*)(?!\\d)`, 'i'),
    new RegExp(`\\b${boxNum}\\b[^\\d]*\\$?([\\d,]+\\.?\\d*)`, 'i')
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
    /nom\s+de\s+l['']employeur[:\s]+([^\n]+)/i,
    /from[:\s]+([A-Z][A-Za-z\s&.,]+(?:Inc|Ltd|Corp|Corporation|Company|Co|Bank|Trust)\.?)/i
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
const detectDocumentType = (text: string): ParsedSlipData['type'] => {
  const upperText = text.toUpperCase();

  if (upperText.includes('T4A') || upperText.includes('STATEMENT OF PENSION')) {
    return 'T4A';
  }
  if (upperText.includes('T5') || upperText.includes('STATEMENT OF INVESTMENT INCOME') || upperText.includes('DIVIDENDS')) {
    return 'T5';
  }
  if (upperText.includes('T2125') || upperText.includes('BUSINESS OR PROFESSIONAL INCOME') || upperText.includes('SELF-EMPLOYMENT')) {
    return 'T2125';
  }
  if (upperText.includes('T4') || upperText.includes('STATEMENT OF REMUNERATION') || upperText.includes('EMPLOYMENT INCOME')) {
    return 'T4';
  }

  return 'unknown';
};

// T4-specific boxes
const T4_BOXES = [14, 16, 17, 18, 20, 22, 24, 26, 44, 46, 52];

// T4A-specific boxes
const T4A_BOXES = [16, 18, 20, 22, 24, 28, 48];

// T5-specific boxes
const T5_BOXES = [13, 14, 18, 24, 25, 26];

// Parse T4 specific data
const parseT4 = (text: string): ParsedSlipData => {
  const result: ParsedSlipData = { type: 'T4', boxes: {} };
  result.payerName = extractPayerName(text);

  for (const boxNum of T4_BOXES) {
    const value = extractBoxValue(text, boxNum);
    if (value !== undefined) {
      result.boxes[boxNum] = value;
    }
  }

  // Special handling for employment income (Box 14) - look for larger amounts
  if (!result.boxes[14]) {
    const incomeMatch = text.match(/employment\s+income[:\s]+\$?([\d,]+\.?\d*)/i);
    if (incomeMatch) {
      result.boxes[14] = parseCurrency(incomeMatch[1]);
    }
  }

  return result;
};

// Parse T4A specific data
const parseT4A = (text: string): ParsedSlipData => {
  const result: ParsedSlipData = { type: 'T4A', boxes: {} };
  result.payerName = extractPayerName(text);

  for (const boxNum of T4A_BOXES) {
    const value = extractBoxValue(text, boxNum);
    if (value !== undefined) {
      result.boxes[boxNum] = value;
    }
  }

  // Special handling for pension income
  const pensionMatch = text.match(/pension[:\s]+\$?([\d,]+\.?\d*)/i);
  if (pensionMatch && !result.boxes[16]) {
    result.boxes[16] = parseCurrency(pensionMatch[1]);
  }

  return result;
};

// Parse T5 specific data
const parseT5 = (text: string): ParsedSlipData => {
  const result: ParsedSlipData = { type: 'T5', boxes: {} };
  result.payerName = extractPayerName(text);

  for (const boxNum of T5_BOXES) {
    const value = extractBoxValue(text, boxNum);
    if (value !== undefined) {
      result.boxes[boxNum] = value;
    }
  }

  // Special handling for interest
  const interestMatch = text.match(/interest[:\s]+\$?([\d,]+\.?\d*)/i);
  if (interestMatch && !result.boxes[13]) {
    result.boxes[13] = parseCurrency(interestMatch[1]);
  }

  // Special handling for dividends
  const dividendMatch = text.match(/(?:eligible\s+)?dividend[s]?[:\s]+\$?([\d,]+\.?\d*)/i);
  if (dividendMatch && !result.boxes[24]) {
    result.boxes[24] = parseCurrency(dividendMatch[1]);
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
    case 'T4A':
      result = parseT4A(text);
      break;
    case 'T5':
      result = parseT5(text);
      break;
    default:
      // Try to extract any recognizable box values
      result = { type: 'unknown', boxes: {} };
      result.payerName = extractPayerName(text);
      // Try common boxes from all types
      for (const boxNum of [...T4_BOXES, ...T4A_BOXES, ...T5_BOXES]) {
        const value = extractBoxValue(text, boxNum);
        if (value !== undefined) {
          result.boxes[boxNum] = value;
        }
      }
  }

  result.rawText = text;
  return result;
};

// Extract text from PDF file
export const extractTextFromPDF = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    fullText += pageText + '\n';
  }

  return fullText;
};

// Main function to parse any tax slip from PDF
export const parseSlipFromPDF = async (file: File): Promise<ParsedSlipData> => {
  const text = await extractTextFromPDF(file);
  return parseSlipText(text);
};
