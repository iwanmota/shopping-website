import { getOrder, getOrders } from './orders';
import { apiRequest } from './api';

jest.mock('./api', () => ({ apiRequest: jest.fn() }));

test('requests the authenticated customer order history', async () => {
  apiRequest.mockResolvedValue([{ id: 4 }]);
  await expect(getOrders('token')).resolves.toEqual([{ id: 4 }]);
  expect(apiRequest).toHaveBeenCalledWith('/api/orders', { token: 'token' });
});

test('requests one authenticated order by ID', async () => {
  apiRequest.mockResolvedValue({ id: 4, items: [] });
  await expect(getOrder(4, 'token')).resolves.toEqual({ id: 4, items: [] });
  expect(apiRequest).toHaveBeenCalledWith('/api/orders/4', { token: 'token' });
});
