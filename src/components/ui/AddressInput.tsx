import React, { useState, useEffect, useRef } from 'react';
import { findAddressSuggestions, isCanadaPostConfigured, retrieveAddressDetails } from '../../utils/address-complete';
import { fetchFreeAddressSuggestions, isFreeAddressApiConfigured, type FreeAddressSuggestion } from '../../utils/free-address-autocomplete';

interface AddressSuggestion {
  Id: string;
  Text: string;
  Highlight: string;
  Description: string;
  Type: string;
  provider?: 'free-api' | 'canada-post' | 'nominatim';
  raw?: NominatimResult | FreeAddressSuggestion;
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

interface NominatimResult {
  place_id: number;
  display_name: string;
  address?: {
    house_number?: string;
    road?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    state_code?: string;
    postcode?: string;
    country?: string;
  };
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

const PROVINCE_CODE_MAP: Record<string, string> = {
  'Ontario': 'ON',
  'Quebec': 'QC',
  'British Columbia': 'BC',
  'Alberta': 'AB',
  'Manitoba': 'MB',
  'Saskatchewan': 'SK',
  'Nova Scotia': 'NS',
  'New Brunswick': 'NB',
  'Newfoundland and Labrador': 'NL',
  'Prince Edward Island': 'PE',
  'Northwest Territories': 'NT',
  'Nunavut': 'NU',
  'Yukon': 'YT'
};

function toProvinceCode(province?: string): string {
  if (!province) return '';
  if (province.length === 2) return province.toUpperCase();
  return PROVINCE_CODE_MAP[province] || province.slice(0, 2).toUpperCase();
}

function normalizePostalCode(postalCode?: string): string {
  if (!postalCode) return '';
  const cleaned = postalCode.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
  return cleaned.length > 3 ? `${cleaned.slice(0, 3)} ${cleaned.slice(3)}` : cleaned;
}

export function AddressInput({ value, onChange, label, required }: AddressInputProps) {
  const [searchText, setSearchText] = useState(value.street || value.postalCode || '');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  const [activeProvider, setActiveProvider] = useState<'free-api' | 'canada-post' | 'nominatim' | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const fetchNominatimSuggestions = async (text: string) => {
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=8&countrycodes=ca&addressdetails=1&q=${encodeURIComponent(text)}`;
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Fallback lookup failed: ${response.status}`);
    }

    const data = await response.json() as NominatimResult[];
    return data.map((item) => ({
      Id: `osm-${item.place_id}`,
      Text: item.display_name.split(',').slice(0, 2).join(',').trim(),
      Highlight: '',
      Description: item.display_name,
      Type: 'Address',
      provider: 'nominatim' as const,
      raw: item
    }));
  };

  const fetchSuggestions = async (text: string, lastId?: string) => {
    if (text.trim().length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const attemptNominatimFallback = async (message?: string) => {
      const fallback = await fetchNominatimSuggestions(text);
      setSuggestions(fallback);
      setShowSuggestions(fallback.length > 0);
      setActiveProvider('nominatim');
      if (message) setError(message);
    };

    const attemptCanadaPostFallback = async (message?: string) => {
      if (!isCanadaPostConfigured()) {
        await attemptNominatimFallback(message || 'Canada Post key not configured. Showing OpenStreetMap suggestions.');
        return;
      }

      const data = await findAddressSuggestions(text, lastId);
      const canadaPostSuggestions = (data.Items || []).filter((item: AddressSuggestion) => item.Type !== 'Warning');

      if (canadaPostSuggestions.length > 0) {
        setSuggestions(canadaPostSuggestions.map((item: AddressSuggestion) => ({ ...item, provider: 'canada-post' })));
        setShowSuggestions(true);
        setActiveProvider('canada-post');
        if (message) setError(message);
        return;
      }

      await attemptNominatimFallback('Canada Post returned no matches. Showing OpenStreetMap suggestions.');
    };

    try {
      if (isFreeAddressApiConfigured()) {
        const freeApiSuggestions = await fetchFreeAddressSuggestions(text);

        if (freeApiSuggestions.length > 0) {
          setSuggestions(
            freeApiSuggestions.map((item, index) => ({
              Id: item.id || `free-${index}`,
              Text: item.text,
              Highlight: '',
              Description: item.description,
              Type: 'Address',
              provider: 'free-api' as const,
              raw: item
            }))
          );
          setShowSuggestions(true);
          setActiveProvider('free-api');
          return;
        }
      }

      await attemptCanadaPostFallback(
        isFreeAddressApiConfigured()
          ? 'Free address API returned no matches. Falling back to Canada Post/OpenStreetMap.'
          : undefined
      );
    } catch {
      try {
        await attemptCanadaPostFallback('Free address API unavailable. Falling back to Canada Post/OpenStreetMap.');
      } catch {
        try {
          await attemptNominatimFallback('Address providers unavailable. Showing OpenStreetMap suggestions.');
        } catch {
          setError('Address lookup unavailable. Please enter manually.');
          setSuggestions([]);
          setShowSuggestions(false);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAddressDetails = async (id: string): Promise<AddressDetails | null> => {
    if (!isCanadaPostConfigured()) return null;

    try {
      const data = await retrieveAddressDetails(id);
      if (data.Items && data.Items.length > 0) {
        return data.Items[0] as AddressDetails;
      }
    } catch {
      setError('Could not retrieve address details.');
    }

    return null;
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const normalizedSearch = searchText.trim();
      const normalizedStreet = (value.street || '').trim();
      if (normalizedSearch && normalizedSearch !== normalizedStreet) {
        fetchSuggestions(normalizedSearch);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchText, value.street]);

  const handleSelect = async (suggestion: AddressSuggestion) => {
    if (suggestion.provider === 'free-api') {
      const freeAddress = suggestion.raw as FreeAddressSuggestion | undefined;
      const newAddress = {
        street: freeAddress?.street || suggestion.Text,
        unit: undefined,
        city: freeAddress?.city || value.city,
        province: toProvinceCode(freeAddress?.province) || value.province,
        postalCode: normalizePostalCode(freeAddress?.postalCode) || value.postalCode
      };

      onChange(newAddress);
      setSearchText(newAddress.street || suggestion.Text);
      setShowSuggestions(false);
      setSuggestions([]);
      return;
    }

    if (suggestion.provider === 'nominatim' && suggestion.raw) {
      const nominatim = suggestion.raw as NominatimResult;
      const address = nominatim.address || {};
      const streetParts = [address.house_number, address.road].filter(Boolean);
      const newAddress = {
        street: streetParts.join(' ').trim() || suggestion.Text,
        unit: undefined,
        city: address.city || address.town || address.village || value.city,
        province: toProvinceCode(address.state) || value.province,
        postalCode: normalizePostalCode(address.postcode) || value.postalCode
      };
      onChange(newAddress);
      setSearchText(newAddress.street || suggestion.Description);
      setShowSuggestions(false);
      setSuggestions([]);
      return;
    }

    if (suggestion.Type === 'Address') {
      const details = await fetchAddressDetails(suggestion.Id);
      if (details) {
        const newAddress = {
          street: details.Line1,
          unit: details.Line2 || undefined,
          city: details.City,
          province: details.ProvinceCode,
          postalCode: normalizePostalCode(details.PostalCode)
        };
        onChange(newAddress);
        setSearchText(details.Line1);
        setShowSuggestions(false);
        setSuggestions([]);
      }
      return;
    }

    fetchSuggestions(suggestion.Text, suggestion.Id);
  };

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
        <label style={{ display: 'block', fontSize: '12px', color: '#6B7280', marginBottom: '6px' }}>
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
            setShowSuggestions(true);
          }}
          onFocus={() => {
            if (suggestions.length > 0) setShowSuggestions(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Start typing your address or postal code..."
          style={{
            width: '100%',
            padding: '10px 12px',
            paddingRight: '44px',
            fontSize: '14px',
            border: '1px solid #E5E7EB',
            borderRadius: '6px',
            boxSizing: 'border-box'
          }}
        />

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

      {error && (
        <p style={{ fontSize: '11px', color: '#B45309', marginTop: '6px' }}>{error}</p>
      )}

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
        Powered by {activeProvider === 'free-api'
          ? 'Free Canada Address API'
          : activeProvider === 'nominatim'
            ? 'OpenStreetMap (fallback)'
            : 'Canada Post AddressComplete'}
      </p>
    </div>
  );
}

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
      <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '12px', marginBottom: '12px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', color: '#6B7280', marginBottom: '6px' }}>Unit</label>
          <input
            type="text"
            value={value.unit || ''}
            onChange={(e) => onChange({ ...value, unit: e.target.value })}
            placeholder="Apt #"
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
            Street address<span style={{ color: '#DC2626' }}>*</span>
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
