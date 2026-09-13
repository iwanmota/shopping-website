export const getInventoryForTier = (product, pricingTier) => {
  if (pricingTier === 'sale') return Number(product.onSaleQuantity) || 0;
  return Number(product.regularInventory) || 0;
};

export const getAvailableQuantity = (product, pricingTier, cartItems) => {
  const lineId = `${product.id}-${pricingTier}`;
  const current = cartItems.find(item => item.lineId === lineId)?.quantity || 0;
  return Math.max(getInventoryForTier(product, pricingTier) - current, 0);
};

export const reconcileCartItems = (cartItems, products) => cartItems.flatMap(item => {
  const product = products.find(candidate => candidate.id === item.id);
  if (!product) return [];
  const available = getInventoryForTier(product, item.pricingTier);
  if (available <= 0) return [];
  return [{ ...item, ...product, quantity: Math.min(item.quantity, available) }];
});
