const DEFAULT_CANADA_POST_BASE_URL = 'https://ws1.postescanada-canadapost.ca/AddressComplete/Interactive';

function getConfiguredBaseUrl() {
  return (process.env.REACT_APP_CANADA_POST_API_BASE_URL || '').trim();
}

function getApiKey() {
  return (process.env.REACT_APP_CANADA_POST_API_KEY || '').trim();
}

function buildBaseUrl(path: 'Find' | 'Retrieve') {
  const root = getConfiguredBaseUrl() || DEFAULT_CANADA_POST_BASE_URL;
  return `${root}/${path}/v2.10/json3.ws`;
}

function buildUrl(path: 'Find' | 'Retrieve', params: Record<string, string>) {
  const url = new URL(buildBaseUrl(path));

  const queryParams = {
    ...params,
    Key: getApiKey()
  };

  Object.entries(queryParams).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
}

export async function findAddressSuggestions(searchTerm: string, lastId?: string) {
  if (!getApiKey()) {
    throw new Error('Canada Post API key is missing.');
  }

  const response = await fetch(buildUrl('Find', {
    SearchTerm: searchTerm,
    Country: 'CAN',
    LanguagePreference: 'en',
    ...(lastId ? { LastId: lastId } : {})
  }));

  if (!response.ok) {
    throw new Error(`Address lookup failed: ${response.status}`);
  }

  return response.json();
}

export async function retrieveAddressDetails(id: string) {
  if (!getApiKey()) {
    throw new Error('Canada Post API key is missing.');
  }

  const response = await fetch(buildUrl('Retrieve', { Id: id }));

  if (!response.ok) {
    throw new Error(`Address details failed: ${response.status}`);
  }

  return response.json();
}

export function isCanadaPostConfigured() {
  return Boolean(getApiKey());
}
