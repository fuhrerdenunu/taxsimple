import React, { useState, useCallback } from 'react';
import { Alert } from '../ui/Alert';
import { parseSlipFromPDF, ParsedSlipData } from '../../utils/pdf-parser';
import { classifySlip } from '../../utils/slip-classifier';
import { validateAndNormalize, type NormalizedSlipData } from '../../utils/slip-validator';
import { scanForViruses, validateFileType, MAX_FILE_SIZE_BYTES } from '../../utils/file-intake';

interface FileUploadProps {
  onDataParsed: (data: ParsedSlipData) => void;
  acceptedTypes?: string[];
}

export function FileUpload({ onDataParsed, acceptedTypes = ['.pdf', '.png', '.jpg', '.jpeg'] }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setSuccessMessage(null);
    setWarnings([]);
    setIsProcessing(true);

    try {
      // Step 1: Validate file type (extension + magic bytes)
      setProcessingStep('Validating file type...');
      const typeValidation = await validateFileType(file);
      if (!typeValidation.valid) {
        throw new Error(typeValidation.error || 'Invalid file type');
      }

      // Step 2: Check file size
      if (file.size > MAX_FILE_SIZE_BYTES) {
        throw new Error(`File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds maximum of ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB`);
      }

      if (file.size === 0) {
        throw new Error('File is empty (0 bytes)');
      }

      // Step 3: Virus scan
      setProcessingStep('Scanning for security threats...');
      const virusScan = await scanForViruses(file);
      if (!virusScan.clean) {
        throw new Error(virusScan.details);
      }

      // Step 4: Parse the document (PDF only for now, images need OCR integration)
      setProcessingStep('Extracting document text...');
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        throw new Error('Image file support requires OCR integration. Please upload a PDF file, or enter values manually.');
      }

      const data = await parseSlipFromPDF(file);

      // Step 5: Run ML-style classification for confidence scoring
      setProcessingStep('Classifying slip type...');
      if (data.rawText) {
        const classification = classifySlip(data.rawText);
        // Use the classifier's result if it has higher confidence than the parser
        if (classification.confidence > 0.5 && classification.type !== 'unknown') {
          if (data.type === 'unknown') {
            data.type = classification.type;
          }
          data.confidence = classification.confidence >= 0.7 ? 'high' :
                            classification.confidence >= 0.4 ? 'medium' : 'low';
        }
      }

      // Step 6: Validate and normalize
      setProcessingStep('Validating extracted data...');
      const normalized: NormalizedSlipData = validateAndNormalize(data);

      // Collect validation warnings
      const validationWarnings = normalized.validationIssues
        .filter(issue => issue.severity === 'warning')
        .map(issue => issue.message);

      if (normalized.isDuplicate) {
        validationWarnings.unshift(`This may be a duplicate slip${normalized.duplicateOf ? ` (matches "${normalized.duplicateOf}")` : ''}. Please verify.`);
      }

      if (data.type === 'unknown' && Object.keys(data.boxes).length === 0) {
        throw new Error('Could not extract tax information from this document. Please enter the values manually.');
      }

      onDataParsed(data);

      const boxCount = Object.keys(data.boxes).length;
      const confidenceLabel = data.confidence === 'high' ? 'High confidence' :
                              data.confidence === 'medium' ? 'Medium confidence' : 'Low confidence';
      setSuccessMessage(
        `Detected ${data.type} slip${data.payerName ? ` from ${data.payerName}` : ''}. Found ${boxCount} value${boxCount !== 1 ? 's' : ''} (${confidenceLabel}). Please verify the extracted information.`
      );
      setWarnings(validationWarnings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file');
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  }, [onDataParsed]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    // Reset input so same file can be uploaded again
    e.target.value = '';
  }, [handleFile]);

  return (
    <div>
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        style={{
          border: `2px dashed ${isDragging ? '#0D5F2B' : '#D1D5DB'}`,
          borderRadius: '12px',
          padding: '32px',
          textAlign: 'center',
          backgroundColor: isDragging ? '#F0FDF4' : '#FAFAFA',
          transition: 'all 0.2s ease',
          cursor: 'pointer'
        }}
      >
        {/* Upload icon */}
        <div style={{
          width: '48px',
          height: '48px',
          margin: '0 auto 16px',
          backgroundColor: '#E5E7EB',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>

        {isProcessing ? (
          <div>
            <div style={{
              width: '32px',
              height: '32px',
              border: '3px solid #E5E7EB',
              borderTopColor: '#0D5F2B',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 12px'
            }} />
            <p style={{ color: '#6B7280', fontSize: '14px' }}>
              {processingStep || 'Processing document...'}
            </p>
          </div>
        ) : (
          <>
            <p style={{ fontSize: '15px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>
              Drop your tax slip here
            </p>
            <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '16px' }}>
              Supports T4, T4A, T4RSP, T5, and other CRA tax slips (PDF format)
            </p>
            <label>
              <input
                type="file"
                accept={acceptedTypes.join(',')}
                onChange={handleInputChange}
                style={{ display: 'none' }}
              />
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '12px 24px',
                  fontSize: '15px',
                  fontWeight: 600,
                  borderRadius: '8px',
                  backgroundColor: '#F3F4F6',
                  color: '#1F2937',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Browse Files
              </span>
            </label>
          </>
        )}
      </div>

      {/* Error message */}
      {error && (
        <Alert type="error" style={{ marginTop: '16px' }}>
          {error}
        </Alert>
      )}

      {/* Success message */}
      {successMessage && (
        <Alert type="success" style={{ marginTop: '16px' }}>
          {successMessage}
        </Alert>
      )}

      {/* Validation warnings */}
      {warnings.length > 0 && (
        <div style={{ marginTop: '12px' }}>
          {warnings.map((warning, i) => (
            <Alert key={i} type="warning" style={{ marginBottom: '8px' }}>
              {warning}
            </Alert>
          ))}
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
