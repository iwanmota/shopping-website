const API_URL = 'http://localhost:3001/api/checkout';

export const checkout = async (cartItems, token, fetchImplementation = fetch) => {
  const response = await fetchImplementation(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      items: cartItems.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        pricingTier: item.pricingTier
      }))
    })
  });

  const contentType = response.headers?.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    if (response.status === 404) {
      throw new Error('Checkout endpoint is unavailable. Restart the backend server.');
    }
    throw new Error('Checkout failed because the server returned an unexpected response.');
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Checkout failed');
  }

  return data.receipt;
};
