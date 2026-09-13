import { vi } from 'vitest';
import { apiRequest, getApiUrl } from './api';

test('builds API URLs from the configured base URL', () => {
  expect(getApiUrl('/api/products')).toBe('http://localhost:3001/api/products');
});

test('parses JSON responses and adds the authorization header', async () => {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    headers: { get: () => 'application/json' },
    json: async () => ({ products: [] })
  });

  await expect(apiRequest('/api/products', { token: 'token-123', fetchImplementation: fetchMock }))
    .resolves.toEqual({ products: [] });
  expect(fetchMock).toHaveBeenCalledWith('http://localhost:3001/api/products', {
    headers: { Authorization: 'Bearer token-123' }
  });
});

test('returns a useful error for non-JSON server responses', async () => {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: false,
    status: 502,
    headers: { get: () => 'text/html' }
  });

  await expect(apiRequest('/api/products', { fetchImplementation: fetchMock }))
    .rejects.toThrow('The server returned an unexpected response (502).');
});

test('uses the server error from a JSON response', async () => {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: false,
    status: 401,
    headers: { get: () => 'application/json' },
    json: async () => ({ error: 'Authentication required' })
  });

  await expect(apiRequest('/api/products', { fetchImplementation: fetchMock }))
    .rejects.toMatchObject({ message: 'Authentication required', status: 401 });
});
