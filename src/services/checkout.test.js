import { checkout } from './checkout';

test('submits only product identity, quantity, and pricing tier with authentication', async () => {
  const fetchMock = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ receipt: { id: 'local-1' } })
  });
  const items = [{ id: 1, quantity: 2, pricingTier: 'sale', price: 0.01, name: 'Ignored' }];

  const receipt = await checkout(items, 'token-123', fetchMock);

  expect(fetchMock).toHaveBeenCalledWith('http://localhost:3001/api/checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer token-123'
    },
    body: JSON.stringify({
      items: [{ productId: 1, quantity: 2, pricingTier: 'sale' }]
    })
  });
  expect(receipt).toEqual({ id: 'local-1' });
});

test('throws the server checkout error', async () => {
  const fetchMock = jest.fn().mockResolvedValue({
    ok: false,
    json: async () => ({ error: 'Not enough inventory' })
  });

  await expect(checkout([], 'token-123', fetchMock)).rejects.toThrow('Not enough inventory');
});
