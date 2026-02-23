import { findAddressSuggestions, isCanadaPostConfigured, retrieveAddressDetails } from '../address-complete';

describe('address-complete api client', () => {
  const originalFetch = global.fetch;
  const originalKey = process.env.REACT_APP_CANADA_POST_API_KEY;

  beforeEach(() => {
    process.env.REACT_APP_CANADA_POST_API_KEY = 'test-key';
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ Items: [] })
    } as Response);
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env.REACT_APP_CANADA_POST_API_KEY = originalKey;
    jest.restoreAllMocks();
  });

  it('detects when Canada Post key is configured', () => {
    expect(isCanadaPostConfigured()).toBe(true);
  });

  it('calls Find endpoint with expected query params', async () => {
    await findAddressSuggestions('M5V 2T6');

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const url = new URL((global.fetch as jest.Mock).mock.calls[0][0] as string);

    expect(url.pathname).toContain('/AddressComplete/Interactive/Find/');
    expect(url.searchParams.get('SearchTerm')).toBe('M5V 2T6');
    expect(url.searchParams.get('Country')).toBe('CAN');
  });

  it('calls Retrieve endpoint with id', async () => {
    await retrieveAddressDetails('abc123');

    const url = new URL((global.fetch as jest.Mock).mock.calls[0][0] as string);
    expect(url.pathname).toContain('/AddressComplete/Interactive/Retrieve/');
    expect(url.searchParams.get('Id')).toBe('abc123');
  });
});
