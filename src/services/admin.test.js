import { describe, expect, test, vi } from 'vitest';
import { apiRequest } from './api';
import { createProduct, deleteProduct, getAdminProducts, updateProduct } from './admin';

vi.mock('./api', () => ({ apiRequest: vi.fn() }));

describe('admin product service', () => {
  test('uses authenticated admin endpoints for product management', async () => {
    apiRequest.mockResolvedValue({ products: [] });
    const product = { name: 'Lamp', price: 20 };

    await getAdminProducts('admin-token');
    await createProduct(product, 'admin-token');
    await updateProduct(7, product, 'admin-token');
    await deleteProduct(7, 'admin-token');

    expect(apiRequest).toHaveBeenNthCalledWith(1, '/api/admin/products', { token: 'admin-token' });
    expect(apiRequest).toHaveBeenNthCalledWith(2, '/api/admin/products', {
      method: 'POST', body: product, token: 'admin-token'
    });
    expect(apiRequest).toHaveBeenNthCalledWith(3, '/api/admin/products/7', {
      method: 'PUT', body: product, token: 'admin-token'
    });
    expect(apiRequest).toHaveBeenNthCalledWith(4, '/api/admin/products/7', {
      method: 'DELETE', token: 'admin-token'
    });
  });
});
