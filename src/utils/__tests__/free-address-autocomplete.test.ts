import { fetchFreeAddressSuggestions, isFreeAddressApiConfigured } from '../free-address-autocomplete';

describe('free address autocomplete client', () => {
  const originalFetch = global.fetch;
  const originalBaseUrl = process.env.REACT_APP_FREE_ADDRESS_API_BASE_URL;

  beforeEach(() => {
    process.env.REACT_APP_FREE_ADDRESS_API_BASE_URL = 'https://example.com/autocomplete';
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        suggestions: [
          {
            id: 'abc',
            address: '123 King St W',
            city: 'Toronto',
            province: 'ON',
            postalCode: 'M5V2T6'
          }
        ]
      })
    } as Response);
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env.REACT_APP_FREE_ADDRESS_API_BASE_URL = originalBaseUrl;
    jest.restoreAllMocks();
  });

  it('detects configured base URL', () => {
    expect(isFreeAddressApiConfigured()).toBe(true);
  });

  it('queries free provider and normalizes fields', async () => {
    const results = await fetchFreeAddressSuggestions('King');

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const url = new URL((global.fetch as jest.Mock).mock.calls[0][0] as string);
    expect(url.searchParams.get('query')).toBe('King');

    expect(results[0]).toMatchObject({
      id: 'abc',
      street: '123 King St W',
      city: 'Toronto',
      province: 'ON',
      postalCode: 'M5V2T6'
    });
  });
});
