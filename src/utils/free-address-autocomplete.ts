export interface FreeAddressSuggestion {
  id: string;
  text: string;
  description: string;
  street?: string;
  city?: string;
  province?: string;
  postalCode?: string;
}

const DEFAULT_FREE_ADDRESS_API_BASE_URL = '';

function getFreeAddressApiBaseUrl() {
  return (process.env.REACT_APP_FREE_ADDRESS_API_BASE_URL || DEFAULT_FREE_ADDRESS_API_BASE_URL).trim();
}

export function isFreeAddressApiConfigured() {
  return Boolean(getFreeAddressApiBaseUrl());
}

function toArray(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) {
    return payload.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object');
  }

  if (payload && typeof payload === 'object') {
    const wrapped = payload as Record<string, unknown>;
    const candidateKeys = ['results', 'items', 'suggestions', 'data'];

    for (const key of candidateKeys) {
      const value = wrapped[key];
      if (Array.isArray(value)) {
        return value.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object');
      }
    }
  }

  return [];
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeSuggestion(item: Record<string, unknown>, index: number): FreeAddressSuggestion {
  const id = asString(item.id) || asString(item._id) || asString(item.place_id) || `free-${index}`;

  const street = asString(item.street) || asString(item.address) || asString(item.address_line1) || asString(item.line1);
  const city = asString(item.city) || asString(item.locality) || asString(item.town);
  const province = asString(item.province) || asString(item.region) || asString(item.state);
  const postalCode = asString(item.postalCode) || asString(item.postal_code) || asString(item.postcode);

  const text = asString(item.text) || asString(item.label) || asString(item.formatted) || street;
  const description =
    asString(item.description) ||
    asString(item.display_name) ||
    [city, province, postalCode].filter(Boolean).join(', ');

  return {
    id,
    text: text || [street, city].filter(Boolean).join(', ') || description,
    description,
    street,
    city,
    province,
    postalCode
  };
}

export async function fetchFreeAddressSuggestions(query: string): Promise<FreeAddressSuggestion[]> {
  const baseUrl = getFreeAddressApiBaseUrl();
  if (!baseUrl) {
    throw new Error('Free address API base URL is not configured.');
  }

  const url = new URL(baseUrl);
  url.searchParams.set('query', query);

  const response = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Free address lookup failed: ${response.status}`);
  }

  const data = await response.json();
  return toArray(data).map(normalizeSuggestion).filter((item) => Boolean(item.text));
}
