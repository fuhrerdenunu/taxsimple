import React, { useState, useCallback } from 'react';
import { Alert } from '../ui/Alert';
import { parseSlipFromPDF, ParsedSlipData } from '../../utils/pdf-parser';

interface FileUploadProps {
  onDataParsed: (data: ParsedSlipData) => void;
  acceptedTypes?: string[];
}

export function FileUpload({ onDataParsed, acceptedTypes = ['.pdf'] }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setSuccessMessage(null);
    setIsProcessing(true);

    try {
      // Check file type
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        throw new Error('Please upload a PDF file');
      }

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size must be less than 10MB');
      }

      const data = await parseSlipFromPDF(file);

      if (data.type === 'unknown' && Object.keys(data.boxes).length === 0) {
        throw new Error('Could not extract tax information from this document. Please enter the values manually.');
      }

      onDataParsed(data);

      const boxCount = Object.keys(data.boxes).length;
      setSuccessMessage(
        `Detected ${data.type} slip${data.payerName ? ` from ${data.payerName}` : ''}. Found ${boxCount} value${boxCount !== 1 ? 's' : ''}. Please verify the extracted information.`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file');
    } finally {
      setIsProcessing(false);
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
              Processing document...
            </p>
          </div>
        ) : (
          <>
            <p style={{ fontSize: '15px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>
              Drop your tax slip here
            </p>
            <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '16px' }}>
              Supports T4, T4A, T5, and other CRA tax slips (PDF format)
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

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
