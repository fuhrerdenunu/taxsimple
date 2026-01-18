import React, { useId } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  style,
  id,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div style={{ marginBottom: '16px' }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            display: 'block',
            marginBottom: '6px',
            fontSize: '14px',
            fontWeight: 500,
            color: '#374151'
          }}
        >
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {leftIcon && (
          <div style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#9CA3AF',
            display: 'flex'
          }}>
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          style={{
            width: '100%',
            padding: '12px 16px',
            paddingLeft: leftIcon ? '40px' : '16px',
            paddingRight: rightIcon ? '40px' : '16px',
            fontSize: '15px',
            borderRadius: '8px',
            border: `1px solid ${error ? '#DC2626' : '#D1D5DB'}`,
            outline: 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            backgroundColor: props.disabled ? '#F9FAFB' : 'white',
            boxSizing: 'border-box',
            ...style
          }}
          {...props}
        />
        {rightIcon && (
          <div style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#9CA3AF',
            display: 'flex'
          }}>
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p style={{
          marginTop: '6px',
          fontSize: '13px',
          color: '#DC2626'
        }}>
          {error}
        </p>
      )}
      {hint && !error && (
        <p style={{
          marginTop: '6px',
          fontSize: '13px',
          color: '#6B7280'
        }}>
          {hint}
        </p>
      )}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
}

export function Select({
  label,
  error,
  hint,
  options,
  style,
  id,
  ...props
}: SelectProps) {
  const generatedId = useId();
  const selectId = id || generatedId;

  return (
    <div style={{ marginBottom: '16px' }}>
      {label && (
        <label
          htmlFor={selectId}
          style={{
            display: 'block',
            marginBottom: '6px',
            fontSize: '14px',
            fontWeight: 500,
            color: '#374151'
          }}
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        style={{
          width: '100%',
          padding: '12px 16px',
          fontSize: '15px',
          borderRadius: '8px',
          border: `1px solid ${error ? '#DC2626' : '#D1D5DB'}`,
          outline: 'none',
          backgroundColor: 'white',
          cursor: 'pointer',
          boxSizing: 'border-box',
          ...style
        }}
        {...props}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p style={{
          marginTop: '6px',
          fontSize: '13px',
          color: '#DC2626'
        }}>
          {error}
        </p>
      )}
      {hint && !error && (
        <p style={{
          marginTop: '6px',
          fontSize: '13px',
          color: '#6B7280'
        }}>
          {hint}
        </p>
      )}
    </div>
  );
}

interface MoneyInputProps extends Omit<InputProps, 'type' | 'onChange'> {
  value: number;
  onChange: (value: number) => void;
}

export function MoneyInput({
  value,
  onChange,
  ...props
}: MoneyInputProps) {
  const [displayValue, setDisplayValue] = React.useState(value > 0 ? value.toString() : '');
  const [isFocused, setIsFocused] = React.useState(false);

  // Sync display value when external value changes (but not while focused)
  React.useEffect(() => {
    if (!isFocused) {
      setDisplayValue(value > 0 ? value.toFixed(2) : '');
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    // Allow digits, one decimal point, and empty string
    if (rawValue === '' || /^\d*\.?\d*$/.test(rawValue)) {
      setDisplayValue(rawValue);
      const numValue = parseFloat(rawValue) || 0;
      onChange(numValue);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    // Show raw number without trailing zeros when focusing
    if (value > 0) {
      setDisplayValue(value.toString());
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Format to 2 decimal places on blur
    const numValue = parseFloat(displayValue) || 0;
    setDisplayValue(numValue > 0 ? numValue.toFixed(2) : '');
    onChange(numValue);
  };

  return (
    <Input
      type="text"
      inputMode="decimal"
      leftIcon={<span style={{ fontSize: '14px' }}>$</span>}
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder="0.00"
      {...props}
    />
  );
}
