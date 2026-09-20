const STORAGE_KEY = 'shopsmart.bag.v1';

// Saved prices are display values only; checkout validates current prices and stock on the server.
export const loadCart = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved?.version !== 1 || !Array.isArray(saved.items)) return [];
    const seen = new Set();
    return saved.items
      .filter((item) => {
        if (
          !item ||
          !Number.isSafeInteger(item.id) ||
          item.id <= 0 ||
          !['sale', 'regular'].includes(item.pricingTier) ||
          item.lineId !== `${item.id}-${item.pricingTier}` ||
          typeof item.name !== 'string' ||
          typeof item.image !== 'string' ||
          !Number.isFinite(item.price) ||
          item.price < 0 ||
          !Number.isSafeInteger(item.quantity) ||
          item.quantity <= 0 ||
          seen.has(item.lineId)
        )
          return false;
        seen.add(item.lineId);
        return true;
      })
      .map((item) => ({ ...item, isOnSale: item.pricingTier === 'sale' }));
  } catch {
    return [];
  }
};

export const saveCart = (items) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, items }));
  } catch {
    // Private browsing or storage limits must not prevent shopping in this tab.
  }
};
