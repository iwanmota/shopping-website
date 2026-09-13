import { apiRequest } from './api';

export const getOrders = token => apiRequest('/api/orders', { token });
export const getOrder = (orderId, token) => apiRequest(`/api/orders/${orderId}`, { token });
