import { validateSIN, formatSIN, maskSIN, isSINFormat } from '../validators/sin';

describe('SIN Validator', () => {
  describe('validateSIN', () => {
    // Valid test SINs (these pass Luhn check)
    const validSINs = [
      '046454286',
      '046-454-286',
      '046 454 286',
      '130692544',
    ];

    // Invalid SINs
    const invalidSINs = [
      '123456789', // Fails Luhn check
      '111111111', // Fails Luhn
      '12345678',  // Too short
      '1234567890', // Too long
      'abcdefghi', // Non-numeric
      '',          // Empty
    ];

    it.each(validSINs)('validates %s as valid', (sin) => {
      expect(validateSIN(sin)).toBe(true);
    });

    it.each(invalidSINs)('validates %s as invalid', (sin) => {
      expect(validateSIN(sin)).toBe(false);
    });

    it('handles SIN with various separators', () => {
      expect(validateSIN('046.454.286')).toBe(true);
      expect(validateSIN('046/454/286')).toBe(true);
    });

    it('handles SIN with mixed content', () => {
      // Extracts exactly 9 digits and validates (no extra digits from text)
      expect(validateSIN('SIN: 046-454-286')).toBe(true);
    });
  });

  describe('formatSIN', () => {
    it('formats 9 digits as XXX-XXX-XXX', () => {
      expect(formatSIN('046454286')).toBe('046-454-286');
    });

    it('formats already formatted SIN', () => {
      expect(formatSIN('046-454-286')).toBe('046-454-286');
    });

    it('returns original if not 9 digits', () => {
      expect(formatSIN('12345')).toBe('12345');
      expect(formatSIN('')).toBe('');
    });
  });

  describe('maskSIN', () => {
    it('masks SIN showing only last 3 digits', () => {
      expect(maskSIN('046454286')).toBe('***-***-286');
    });

    it('masks formatted SIN', () => {
      expect(maskSIN('046-454-286')).toBe('***-***-286');
    });

    it('returns placeholder for invalid length', () => {
      expect(maskSIN('12345')).toBe('***-***-***');
      expect(maskSIN('')).toBe('***-***-***');
    });
  });

  describe('isSINFormat', () => {
    it('returns true for 9 digits', () => {
      expect(isSINFormat('123456789')).toBe(true);
      expect(isSINFormat('123-456-789')).toBe(true);
    });

    it('returns false for other lengths', () => {
      expect(isSINFormat('12345678')).toBe(false);
      expect(isSINFormat('1234567890')).toBe(false);
      expect(isSINFormat('')).toBe(false);
    });
  });
});
