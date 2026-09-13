import { apiRequest } from './api';

export const checkout = async (cartItems, token, fetchImplementation = fetch) => {
  const data = await apiRequest('/api/checkout', {
    method: 'POST',
    token,
    fetchImplementation,
    body: {
      items: cartItems.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        pricingTier: item.pricingTier
      }))
    }
  });

  return data.receipt;
};
