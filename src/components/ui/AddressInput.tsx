import React, { useState, useEffect, useRef } from 'react';

interface AddressSuggestion {
  Id: string;
  Text: string;
  Highlight: string;
  Description: string;
  Type: string;
}

interface AddressDetails {
  Line1: string;
  Line2: string;
  City: string;
  Province: string;
  ProvinceCode: string;
  PostalCode: string;
  CountryName: string;
}

interface AddressInputProps {
  value: {
    street: string;
    unit?: string;
    city: string;
    province: string;
    postalCode: string;
  };
  onChange: (address: {
    street: string;
    unit?: string;
    city: string;
    province: string;
    postalCode: string;
  }) => void;
  label?: string;
  required?: boolean;
}

// Canada Post AddressComplete API key (free tier allows 100 lookups/day)
// In production, this should be in environment variables
const CANADA_POST_API_KEY = 'JK94-ZN56-KE36-UM44'; // Demo key - replace with your own

export function AddressInput({ value, onChange, label, required }: AddressInputProps) {
  const [searchText, setSearchText] = useState(value.street || '');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Fetch address suggestions from Canada Post
  const fetchSuggestions = async (text: string, lastId?: string) => {
    if (text.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const url = `https://ws1.postescanada-canadapost.ca/AddressComplete/Interactive/Find/v2.10/json3.ws?Key=${CANADA_POST_API_KEY}&SearchTerm=${encodeURIComponent(text)}&Country=CAN&LanguagePreference=en${lastId ? `&LastId=${lastId}` : ''}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.Items && data.Items.length > 0) {
        setSuggestions(data.Items.filter((item: any) => item.Type !== 'Warning'));
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Address lookup error:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch full address details when user selects an address
  const fetchAddressDetails = async (id: string) => {
    try {
      const url = `https://ws1.postescanada-canadapost.ca/AddressComplete/Interactive/Retrieve/v2.10/json3.ws?Key=${CANADA_POST_API_KEY}&Id=${encodeURIComponent(id)}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.Items && data.Items.length > 0) {
        const address = data.Items[0] as AddressDetails;
        return address;
      }
    } catch (error) {
      console.error('Address details error:', error);
    }
    return null;
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchText && searchText !== value.street) {
        fetchSuggestions(searchText);
        setShowSuggestions(true);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchText]);

  // Handle suggestion selection
  const handleSelect = async (suggestion: AddressSuggestion) => {
    if (suggestion.Type === 'Address') {
      // This is a final address, get full details
      const details = await fetchAddressDetails(suggestion.Id);
      if (details) {
        const newAddress = {
          street: details.Line1,
          unit: details.Line2 || undefined,
          city: details.City,
          province: details.ProvinceCode,
          postalCode: details.PostalCode
        };
        onChange(newAddress);
        setSearchText(details.Line1);
        setShowSuggestions(false);
        setSuggestions([]);
      }
    } else {
      // This is a container (e.g., street name), drill down
      fetchSuggestions(suggestion.Text, suggestion.Id);
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div style={{ position: 'relative', marginBottom: '16px' }}>
      {label && (
        <label style={{
          display: 'block',
          fontSize: '12px',
          color: '#6B7280',
          marginBottom: '6px'
        }}>
          {label}{required && <span style={{ color: '#DC2626' }}>*</span>}
        </label>
      )}

      <div style={{ position: 'relative' }}>
        <input
          ref={inputRef}
          type="text"
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            setSelectedIndex(-1);
          }}
          onFocus={() => {
            if (suggestions.length > 0) setShowSuggestions(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Start typing your address..."
          style={{
            width: '100%',
            padding: '10px 12px',
            paddingRight: '36px',
            fontSize: '14px',
            border: '1px solid #E5E7EB',
            borderRadius: '6px',
            boxSizing: 'border-box'
          }}
        />

        {/* Loading indicator */}
        {isLoading && (
          <div style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '16px',
            height: '16px',
            border: '2px solid #E5E7EB',
            borderTopColor: '#6B7280',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}>
            <style>{`@keyframes spin { to { transform: translateY(-50%) rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Canada Post badge */}
        {!isLoading && (
          <div style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '10px',
            color: '#9CA3AF'
          }}>
            🇨🇦
          </div>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            maxHeight: '240px',
            overflowY: 'auto',
            zIndex: 1000,
            marginTop: '4px'
          }}
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.Id}
              onClick={() => handleSelect(suggestion)}
              style={{
                width: '100%',
                padding: '12px 16px',
                textAlign: 'left',
                backgroundColor: index === selectedIndex ? '#F3F4F6' : 'white',
                border: 'none',
                borderBottom: index < suggestions.length - 1 ? '1px solid #F3F4F6' : 'none',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px'
              }}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <span style={{ fontSize: '14px', color: '#1F2937' }}>
                {suggestion.Text}
              </span>
              {suggestion.Description && (
                <span style={{ fontSize: '12px', color: '#6B7280' }}>
                  {suggestion.Description}
                </span>
              )}
              {suggestion.Type !== 'Address' && (
                <span style={{ fontSize: '11px', color: '#9CA3AF' }}>
                  Click to see more addresses →
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Filled address display */}
      {value.city && value.province && (
        <div style={{
          marginTop: '8px',
          padding: '12px',
          backgroundColor: '#F0FDF4',
          borderRadius: '6px',
          border: '1px solid #BBF7D0'
        }}>
          <p style={{ fontSize: '13px', color: '#166534', margin: 0 }}>
            <strong>Selected Address:</strong><br />
            {value.unit && `${value.unit} - `}{value.street}<br />
            {value.city}, {value.province} {value.postalCode}
          </p>
        </div>
      )}

      <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '4px' }}>
        Powered by Canada Post AddressComplete
      </p>
    </div>
  );
}

// Fallback manual address input component (if API not available)
export function ManualAddressInput({
  value,
  onChange,
  provinceOptions
}: {
  value: {
    street: string;
    unit?: string;
    city: string;
    province: string;
    postalCode: string;
  };
  onChange: (address: {
    street: string;
    unit?: string;
    city: string;
    province: string;
    postalCode: string;
  }) => void;
  provinceOptions: { value: string; label: string }[];
}) {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '80px 100px 1fr', gap: '12px', marginBottom: '12px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', color: '#6B7280', marginBottom: '6px' }}>Unit</label>
          <input
            type="text"
            value={value.unit || ''}
            onChange={(e) => onChange({ ...value, unit: e.target.value })}
            style={{
              width: '100%',
              padding: '8px 12px',
              fontSize: '14px',
              border: '1px solid #E5E7EB',
              borderRadius: '6px',
              boxSizing: 'border-box'
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', color: '#6B7280', marginBottom: '6px' }}>Street #</label>
          <input
            type="text"
            style={{
              width: '100%',
              padding: '8px 12px',
              fontSize: '14px',
              border: '1px solid #E5E7EB',
              borderRadius: '6px',
              boxSizing: 'border-box'
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', color: '#6B7280', marginBottom: '6px' }}>
            Street name<span style={{ color: '#DC2626' }}>*</span>
          </label>
          <input
            type="text"
            value={value.street}
            onChange={(e) => onChange({ ...value, street: e.target.value })}
            style={{
              width: '100%',
              padding: '8px 12px',
              fontSize: '14px',
              border: '1px solid #E5E7EB',
              borderRadius: '6px',
              boxSizing: 'border-box'
            }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px', gap: '12px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', color: '#6B7280', marginBottom: '6px' }}>
            City<span style={{ color: '#DC2626' }}>*</span>
          </label>
          <input
            type="text"
            value={value.city}
            onChange={(e) => onChange({ ...value, city: e.target.value })}
            style={{
              width: '100%',
              padding: '8px 12px',
              fontSize: '14px',
              border: '1px solid #E5E7EB',
              borderRadius: '6px',
              boxSizing: 'border-box'
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', color: '#6B7280', marginBottom: '6px' }}>
            Province<span style={{ color: '#DC2626' }}>*</span>
          </label>
          <select
            value={value.province}
            onChange={(e) => onChange({ ...value, province: e.target.value })}
            style={{
              width: '100%',
              padding: '8px 12px',
              fontSize: '14px',
              border: '1px solid #E5E7EB',
              borderRadius: '6px',
              backgroundColor: 'white'
            }}
          >
            {provinceOptions.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', color: '#6B7280', marginBottom: '6px' }}>
            Postal code<span style={{ color: '#DC2626' }}>*</span>
          </label>
          <input
            type="text"
            value={value.postalCode}
            onChange={(e) => onChange({ ...value, postalCode: e.target.value.toUpperCase() })}
            placeholder="A1A 1A1"
            style={{
              width: '100%',
              padding: '8px 12px',
              fontSize: '14px',
              border: '1px solid #E5E7EB',
              borderRadius: '6px',
              boxSizing: 'border-box'
            }}
          />
        </div>
      </div>
    </div>
  );
}
