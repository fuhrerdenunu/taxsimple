/**
 * Canadian Social Insurance Number (SIN) Validator
 *
 * Uses the Luhn algorithm to validate SIN numbers.
 * Valid SINs:
 * - Exactly 9 digits
 * - Pass Luhn checksum validation
 */

/**
 * Validates a Canadian Social Insurance Number
 *
 * @param sin - 9-digit SIN (with or without dashes/spaces)
 * @returns true if valid, false otherwise
 *
 * @example
 * validateSIN('046 454 286'); // true
 * validateSIN('046-454-286'); // true
 * validateSIN('046454286');   // true
 * validateSIN('123456789');   // false (invalid checksum)
 */
export function validateSIN(sin: string): boolean {
  // Remove all non-digit characters
  const digits = sin.replace(/\D/g, '');

  // SIN must be exactly 9 digits
  if (digits.length !== 9) {
    return false;
  }

  // Apply Luhn algorithm
  let sum = 0;

  for (let i = 0; i < 9; i++) {
    let digit = parseInt(digits[i], 10);

    // Double every second digit (0-indexed: positions 1, 3, 5, 7)
    if (i % 2 === 1) {
      digit *= 2;
      // If result is > 9, subtract 9 (equivalent to summing digits)
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
  }

  // Valid if sum is divisible by 10
  return sum % 10 === 0;
}

/**
 * Formats a SIN for display (XXX-XXX-XXX)
 *
 * @param sin - Raw SIN string
 * @returns Formatted SIN or original if invalid length
 */
export function formatSIN(sin: string): string {
  const digits = sin.replace(/\D/g, '');

  if (digits.length !== 9) {
    return sin;
  }

  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 9)}`;
}

/**
 * Masks a SIN for secure display (***-***-XXX)
 *
 * @param sin - Raw SIN string
 * @returns Masked SIN showing only last 3 digits
 */
export function maskSIN(sin: string): string {
  const digits = sin.replace(/\D/g, '');

  if (digits.length !== 9) {
    return '***-***-***';
  }

  return `***-***-${digits.slice(6, 9)}`;
}

/**
 * Checks if a string could be a valid SIN format (before Luhn check)
 *
 * @param sin - String to check
 * @returns true if string has 9 digits
 */
export function isSINFormat(sin: string): boolean {
  const digits = sin.replace(/\D/g, '');
  return digits.length === 9;
}
