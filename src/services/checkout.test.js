jest.mock('./api', () => ({ apiRequest: jest.fn() }));

import { checkout } from './checkout';
import { apiRequest } from './api';

beforeEach(() => jest.clearAllMocks());

test('submits only product identity, quantity, and pricing tier with authentication', async () => {
  apiRequest.mockResolvedValue({ receipt: { id: 'local-1' } });
  const fetchMock = jest.fn();
  const items = [{ id: 1, quantity: 2, pricingTier: 'sale', price: 0.01, name: 'Ignored' }];

  const receipt = await checkout(items, 'token-123', fetchMock);

  expect(apiRequest).toHaveBeenCalledWith('/api/checkout', {
    method: 'POST',
    token: 'token-123',
    fetchImplementation: fetchMock,
    body: { items: [{ productId: 1, quantity: 2, pricingTier: 'sale' }] }
  });
  expect(receipt).toEqual({ id: 'local-1' });
});

test('propagates the server checkout error', async () => {
  apiRequest.mockRejectedValue(new Error('Not enough inventory'));
  await expect(checkout([], 'token-123', jest.fn())).rejects.toThrow('Not enough inventory');
});
