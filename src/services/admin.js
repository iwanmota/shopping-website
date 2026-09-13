import { apiRequest } from './api';

export const getAdminProducts = token => apiRequest('/api/admin/products', { token });
export const createProduct = (product, token) => apiRequest('/api/admin/products', {
  method: 'POST', body: product, token
});
export const updateProduct = (productId, product, token) => apiRequest(`/api/admin/products/${productId}`, {
  method: 'PUT', body: product, token
});
export const deleteProduct = (productId, token) => apiRequest(`/api/admin/products/${productId}`, {
  method: 'DELETE', token
});
