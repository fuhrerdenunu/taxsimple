/**
 * File Intake Service
 *
 * Handles the full file intake pipeline:
 * 1. Upload handling with type/size validation
 * 2. Virus scanning (signature-based checks for known threats)
 * 3. Encryption at rest (AES-256 via CryptoJS)
 * 4. Object storage abstraction (localStorage for demo, S3-compatible interface)
 */

import CryptoJS from 'crypto-js';

// Supported file types for tax document upload
export const SUPPORTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/tiff': ['.tif', '.tiff'],
} as const;

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export interface FileIntakeResult {
  success: boolean;
  fileId: string;
  fileName: string;
  fileType: string;
  fileSizeBytes: number;
  encryptedStorageKey: string;
  virusScanPassed: boolean;
  virusScanDetails: string;
  timestamp: string;
}

export interface FileIntakeError {
  success: false;
  code: 'INVALID_TYPE' | 'FILE_TOO_LARGE' | 'VIRUS_DETECTED' | 'CORRUPT_FILE' | 'STORAGE_ERROR';
  message: string;
}

/**
 * Known malicious file signatures (magic bytes) for basic virus scanning.
 * In production, this would integrate with ClamAV or a cloud-based scanning API.
 */
const MALICIOUS_SIGNATURES: { name: string; bytes: number[] }[] = [
  // EICAR test file signature (standard antivirus test)
  { name: 'EICAR-Test-File', bytes: [0x58, 0x35, 0x4F, 0x21] },
  // Known macro-embedded document patterns
  { name: 'OLE2-Macro', bytes: [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1] },
];

/**
 * Valid file magic bytes for accepted document types
 */
const VALID_MAGIC_BYTES: Record<string, number[][]> = {
  'application/pdf': [[0x25, 0x50, 0x44, 0x46]], // %PDF
  'image/png': [[0x89, 0x50, 0x4E, 0x47]], // .PNG
  'image/jpeg': [[0xFF, 0xD8, 0xFF]], // JPEG SOI
  'image/tiff': [
    [0x49, 0x49, 0x2A, 0x00], // Little-endian TIFF
    [0x4D, 0x4D, 0x00, 0x2A], // Big-endian TIFF
  ],
};

/**
 * Validate file type by checking both extension and magic bytes.
 * Prevents spoofed file extensions.
 */
export async function validateFileType(file: File): Promise<{ valid: boolean; detectedType: string; error?: string }> {
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  const declaredType = file.type || '';

  // Check extension is in supported list
  const supportedExtensions: string[] = Object.values(SUPPORTED_FILE_TYPES).flat();
  if (!supportedExtensions.includes(extension)) {
    return {
      valid: false,
      detectedType: declaredType,
      error: `Unsupported file type: ${extension}. Accepted: ${supportedExtensions.join(', ')}`
    };
  }

  // Read first 8 bytes for magic number validation
  const headerSlice = file.slice(0, 8);
  const headerBuffer = await headerSlice.arrayBuffer();
  const headerBytes = new Uint8Array(headerBuffer);

  // Verify magic bytes match a known valid type
  let detectedType = 'unknown';
  for (const [mimeType, signatures] of Object.entries(VALID_MAGIC_BYTES)) {
    for (const sig of signatures) {
      if (sig.every((byte, i) => headerBytes[i] === byte)) {
        detectedType = mimeType;
        break;
      }
    }
    if (detectedType !== 'unknown') break;
  }

  if (detectedType === 'unknown') {
    return {
      valid: false,
      detectedType: 'unknown',
      error: 'File content does not match any supported document format. The file may be corrupted.'
    };
  }

  // Check that extension matches detected type
  const expectedExtensions: readonly string[] | undefined = SUPPORTED_FILE_TYPES[detectedType as keyof typeof SUPPORTED_FILE_TYPES];
  if (expectedExtensions && !expectedExtensions.includes(extension)) {
    return {
      valid: false,
      detectedType,
      error: `File extension (${extension}) does not match file content (${detectedType}). This may indicate a renamed file.`
    };
  }

  return { valid: true, detectedType };
}

/**
 * Scan file for known malicious signatures.
 * In production, integrate with ClamAV, VirusTotal API, or AWS GuardDuty.
 */
export async function scanForViruses(file: File): Promise<{ clean: boolean; details: string }> {
  const headerSlice = file.slice(0, 1024);
  const headerBuffer = await headerSlice.arrayBuffer();
  const headerBytes = new Uint8Array(headerBuffer);

  for (const sig of MALICIOUS_SIGNATURES) {
    const match = sig.bytes.every((byte, i) => headerBytes[i] === byte);
    if (match) {
      return {
        clean: false,
        details: `Potential threat detected: ${sig.name}. File rejected for security.`
      };
    }
  }

  // Check for suspicious embedded content in PDFs
  if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
    const textSlice = file.slice(0, Math.min(file.size, 65536));
    const textBuffer = await textSlice.arrayBuffer();
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const textContent = decoder.decode(textBuffer);

    const suspiciousPatterns = [
      '/JavaScript',
      '/JS ',
      '/Launch',
      '/OpenAction',
      '/AA ',
      '/RichMedia',
      '/EmbeddedFile',
    ];

    for (const pattern of suspiciousPatterns) {
      if (textContent.includes(pattern)) {
        return {
          clean: false,
          details: `PDF contains potentially dangerous content (${pattern}). For security, only standard PDF documents are accepted.`
        };
      }
    }
  }

  return {
    clean: true,
    details: 'File passed security scan'
  };
}

/**
 * Encrypt file data at rest using AES-256.
 */
export function encryptFileData(data: string, encryptionKey: string): string {
  return CryptoJS.AES.encrypt(data, encryptionKey).toString();
}

/**
 * Decrypt file data from storage.
 */
export function decryptFileData(ciphertext: string, encryptionKey: string): string {
  const bytes = CryptoJS.AES.decrypt(ciphertext, encryptionKey);
  return bytes.toString(CryptoJS.enc.Utf8);
}

/**
 * Object storage interface.
 * Uses localStorage for demo; in production, replace with S3/GCS/Azure Blob client.
 */
export interface ObjectStorageAdapter {
  put(key: string, data: string): Promise<void>;
  get(key: string): Promise<string | null>;
  delete(key: string): Promise<void>;
  list(prefix: string): Promise<string[]>;
}

export class LocalObjectStorage implements ObjectStorageAdapter {
  private prefix = 'taxsimple_files_';

  async put(key: string, data: string): Promise<void> {
    localStorage.setItem(this.prefix + key, data);
  }

  async get(key: string): Promise<string | null> {
    return localStorage.getItem(this.prefix + key);
  }

  async delete(key: string): Promise<void> {
    localStorage.removeItem(this.prefix + key);
  }

  async list(prefix: string): Promise<string[]> {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix + prefix)) {
        keys.push(key.replace(this.prefix, ''));
      }
    }
    return keys;
  }
}

/**
 * Full file intake pipeline.
 *
 * Steps:
 * 1. Validate file type (extension + magic bytes)
 * 2. Validate file size
 * 3. Scan for viruses/malicious content
 * 4. Encrypt file data
 * 5. Store in object storage
 */
export async function processFileIntake(
  file: File,
  storage: ObjectStorageAdapter = new LocalObjectStorage()
): Promise<FileIntakeResult | FileIntakeError> {
  // 1. Validate file size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      success: false,
      code: 'FILE_TOO_LARGE',
      message: `File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds maximum of ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB`
    };
  }

  if (file.size === 0) {
    return {
      success: false,
      code: 'CORRUPT_FILE',
      message: 'File is empty (0 bytes)'
    };
  }

  // 2. Validate file type (extension + magic bytes)
  const typeValidation = await validateFileType(file);
  if (!typeValidation.valid) {
    return {
      success: false,
      code: 'INVALID_TYPE',
      message: typeValidation.error || 'Invalid file type'
    };
  }

  // 3. Virus scan
  const virusScan = await scanForViruses(file);
  if (!virusScan.clean) {
    return {
      success: false,
      code: 'VIRUS_DETECTED',
      message: virusScan.details
    };
  }

  // 4. Read and encrypt file data
  const fileId = crypto.randomUUID();
  const encryptionKey = process.env.REACT_APP_ENCRYPTION_KEY || 'dev_only_not_for_production';

  try {
    const arrayBuffer = await file.arrayBuffer();
    const base64Data = btoa(
      new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );
    const encrypted = encryptFileData(base64Data, encryptionKey);

    // 5. Store in object storage
    const storageKey = `uploads/${fileId}`;
    await storage.put(storageKey, encrypted);

    // Store metadata separately
    const metadata = {
      fileId,
      fileName: file.name,
      fileType: typeValidation.detectedType,
      fileSizeBytes: file.size,
      uploadedAt: new Date().toISOString(),
      virusScanPassed: true,
    };
    await storage.put(`metadata/${fileId}`, JSON.stringify(metadata));

    return {
      success: true,
      fileId,
      fileName: file.name,
      fileType: typeValidation.detectedType,
      fileSizeBytes: file.size,
      encryptedStorageKey: storageKey,
      virusScanPassed: true,
      virusScanDetails: virusScan.details,
      timestamp: new Date().toISOString(),
    };
  } catch {
    return {
      success: false,
      code: 'STORAGE_ERROR',
      message: 'Failed to process and store file. Please try again.'
    };
  }
}
